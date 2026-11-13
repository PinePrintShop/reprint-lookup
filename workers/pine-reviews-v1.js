/**
 * Pine Reviews - worker v1  (Cloudflare worker "pine-reviews")
 *
 * WHAT IT IS (2026-11-13):
 *   The only door into the private "Pine Reviews" Airtable base. The reviews app (reviews.html on GitHub Pages) holds no
 *   data and no keys; every screen asks this worker, and the worker hands back only what the signed-in person may see.
 *   It is a separate worker from pine-workers on purpose: its own Airtable key (Pine Reviews base only), its own KV, and it
 *   only answers Pine's own site. A bug in one worker can't leak the other's data. Spec: notes/reviews.md
 *   ("Going real: decisions and the build spec").
 *
 * NEEDS (Cloudflare → Workers → pine-reviews → Settings):
 *   Secrets   REVIEWS_AIRTABLE_TOKEN  a personal access token that can read/write ONLY the Pine Reviews base
 *                                     (scopes data.records:read + data.records:write; access: Pine Reviews)
 *             PIN_PEPPER              a long random string (32+ characters). Never stored in Airtable. Changing it later
 *                                     makes every PIN invalid (everyone picks a new one).
 *   Variable  REVIEWS_BASE_ID         the Pine Reviews base ID (app…)
 *   KV        REVIEWS_KV              a KV namespace (sessions, rate limits)
 *   Optional  DEV = "1"               ONLY for testing: also allows http://localhost:* and file:// (origin "null").
 *
 * HOW STEPHEN DEPLOYS IT:
 *   Cloudflare → Workers & Pages → Create → Worker, name it "pine-reviews" → Deploy → Edit code → paste this file → Deploy.
 *   Then Settings → Variables and Secrets: add the two secrets and REVIEWS_BASE_ID; Settings → Bindings → KV namespace:
 *   variable name REVIEWS_KV (create a namespace "pine-reviews" first under Storage & Databases → KV).
 *   Check: https://pine-reviews.<account>.workers.dev/r/version → {"version":1}
 *
 * SECURITY (what the worker enforces, not just the screen):
 *   - Personal link code: 32 random bytes in the link after "#k=" (never sent to servers or logs by browsers). Airtable
 *     keeps only its SHA-256. Sending a new link makes a new code; the old one stops working at once.
 *   - PIN: 4 digits (6 for Admins). Stored as PBKDF2-SHA256 (100,000 rounds) of PIN + PIN_PEPPER, salted with the person's
 *     record ID. A copy of the base alone can't be used to work out PINs (the pepper lives only here).
 *   - Wrong PINs: 5 → locked 15 minutes; 10 → locked until an admin resets the PIN. Hello/sign-in are also rate-limited
 *     per IP (30 per 10 minutes).
 *   - Session: random token, kept in KV only as its SHA-256; 30 minutes idle, 12 hours at most, ends on sign-out.
 *   - Every route checks role AND relationship: employees see their own forms and steps; leads see only people whose
 *     Lead is them; admins see everything. Peer answers never carry who wrote them (except for admins) and stay hidden
 *     until at least "Min peers" have sent. Private questions (leadership gaps) only reach admins.
 *   - Sent forms are locked. Closed cycles refuse changes.
 *   - Activity log: sign-ins, wrong PINs, PIN set/reset, links made, sends, check-ins finished, results viewed.
 *   - Only https://pineprintshop.github.io may call it (CORS + an Origin check on every POST).
 *   - Every answer: Cache-Control: no-store, Referrer-Policy: no-referrer.
 *
 * ROUTES (POST JSON unless noted; signed-in routes need "Authorization: Bearer <session>"):
 *   GET  /r/version
 *   /r/hello {code}                         → {first, needsPin, pinLength, locked?}
 *   /r/pin/set {code, pin}                  → {session, me}          first time only
 *   /r/signin {code, pin}                   → {session, me}
 *   /r/signout
 *   /r/me                                   → {me, assignments, steps, questions, cycles}
 *   /r/assignment/get {id}                  → {assignment, answers}  (your own forms only)
 *   /r/assignment/save {id, answers:[{q, score, text}]}   autosave
 *   /r/assignment/send {id}                 → checks every answer, then locks it
 *   /r/steps/mark {stepId, done}            your own next steps
 *   Lead / admin:
 *   /r/crew                                 people you lead (admin: everyone) with progress
 *   /r/results {personId, cycleId}          manager + peer results (no peer names), score
 *   /r/checkin {personId, cycleId}          their check-in answers, your notes, their open next steps
 *   /r/checkin/save {assignmentId, notes, issues}
 *   /r/checkin/finish {assignmentId, notes?, issues?, confirmSteps:[ids], newSteps:[text]}
 *   Admin:
 *   /r/admin/people · /r/admin/cycles
 *   /r/admin/link {personId, via:"email"|"none"}   → {url}  (email: the Airtable automation emails it and clears it)
 *   /r/admin/pin/reset {personId}
 *   /r/admin/assign {cycleId, items:[{kind, writer, about}]}
 *   /r/admin/cycle/open {cycleId} · /r/admin/cycle/close {cycleId, expireLinks?}
 */

const VERSION = 1;
const SITE_ORIGIN = 'https://pineprintshop.github.io';
const APP_URL = 'https://pineprintshop.github.io/reprint-lookup/reviews.html';

// Airtable tables and fields are used by NAME (see notes/reviews.md for the full list).
const T = {
  people: 'People', cycles: 'Cycles', questions: 'Questions', assign: 'Assignments',
  answers: 'Answers', steps: 'Next steps', log: 'Activity log',
};
const KINDS = ['Manager review', 'Peer review', 'Check-in'];

const IDLE_MS = 30 * 60 * 1000;          // session idle limit
const MAX_MS = 12 * 60 * 60 * 1000;      // session hard limit
const LOCK_MS = 15 * 60 * 1000;          // lock after 5 wrong PINs
const SOFT_LOCK_AT = 5, HARD_LOCK_AT = 10;
const HARD_LOCK = '2100-01-01T00:00:00.000Z';   // "locked until an admin resets the PIN"
const RATE_MAX = 30, RATE_WINDOW_S = 600;
const MIN_TXT = 20;                      // a real sentence (same rule as the app)
const PBKDF2_ROUNDS = 100000;            // Workers' maximum

const MSG = {
  badLink: "This link doesn't work. Ask the office for a new one.",
  nothingOpen: "Nothing is open right now. You'll get a new link when there is.",
  signedOut: 'You were signed out. Open your link again.',
  softLock: 'Too many wrong PINs. Try again in 15 minutes.',
  hardLock: 'This link is locked. Ask the office to reset your PIN.',
  notFound: 'Not found.',
};

// ---------------------------------------------------------------- small helpers
const enc = new TextEncoder();
const now = env => (typeof env.TEST_NOW === 'function' ? env.TEST_NOW() : Date.now());
const iso = ms => new Date(ms).toISOString();
const ids = v => (Array.isArray(v) ? v : []);
const has = (v, id) => ids(v).includes(id);
const first = v => ids(v)[0];
const isRated = q => q.fields.Scale && q.fields.Scale !== 'None';
const okText = t => typeof t === 'string' && t.trim().length >= MIN_TXT;
const firstName = n => String(n || '').trim().split(/\s+/)[0] || '';
const esc = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");   // for Airtable formula strings

function hex(buf) { return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join(''); }
function b64url(bytes) {
  let s = ''; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function randomToken() { return b64url(crypto.getRandomValues(new Uint8Array(32))); }
async function sha256hex(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
async function pinHash(env, personId, pin) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pin + '\u0000' + env.PIN_PEPPER), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('pine-reviews|' + personId), iterations: PBKDF2_ROUNDS }, key, 256);
  return hex(bits);
}
// constant-time string compare (same length hex strings)
function ctEq(a, b) {
  a = String(a || ''); b = String(b || '');
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const round2 = n => (n == null ? null : Math.round(n * 100) / 100);

class HttpError extends Error { constructor(status, msg, extra) { super(msg); this.status = status; this.extra = extra; } }
const fail = (status, msg, extra) => { throw new HttpError(status, msg, extra); };

// ---------------------------------------------------------------- Airtable (the only place that talks to it)
function airtable(env) {
  const base = `https://api.airtable.com/v0/${env.REVIEWS_BASE_ID}/`;
  const headers = { Authorization: 'Bearer ' + env.REVIEWS_AIRTABLE_TOKEN, 'Content-Type': 'application/json' };
  async function call(method, table, query, body) {
    const url = base + encodeURIComponent(table) + (query ? '?' + query : '');
    const r = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      console.log('Airtable', method, table, r.status, t.slice(0, 300));
      fail(502, 'The reviews database did not answer. Try again in a minute.');
    }
    return r.json();
  }
  return {
    // all records (optionally filtered by an Airtable formula), following pages
    async list(table, { filter } = {}) {
      const out = []; let offset;
      do {
        const q = new URLSearchParams({ pageSize: '100' });
        if (filter) q.set('filterByFormula', filter);
        if (offset) q.set('offset', offset);
        const j = await call('GET', table, q.toString());
        out.push(...(j.records || []));
        offset = j.offset;
      } while (offset);
      return out;
    },
    async create(table, fieldsList) {
      const out = [];
      for (let i = 0; i < fieldsList.length; i += 10) {
        const j = await call('POST', table, '', { records: fieldsList.slice(i, i + 10).map(fields => ({ fields })), typecast: true });
        out.push(...j.records);
      }
      return out;
    },
    async update(table, rows) {   // rows: [{id, fields}]
      const out = [];
      for (let i = 0; i < rows.length; i += 10) {
        const j = await call('PATCH', table, '', { records: rows.slice(i, i + 10), typecast: true });
        out.push(...j.records);
      }
      return out;
    },
  };
}

// per-request cached reads (small tables are read whole and filtered here)
function loader(c, key, table) { return (c.cache[key] ??= c.at.list(table)); }
const People = c => loader(c, 'people', T.people);
const Cycles = c => loader(c, 'cycles', T.cycles);
const Questions = c => loader(c, 'questions', T.questions);
const Assignments = c => loader(c, 'assign', T.assign);
const Steps = c => loader(c, 'steps', T.steps);
async function byId(list, id) { return (await list).find(r => r.id === id) || null; }
// Answers are many: read only those of the given assignments (Label = "<assignmentId>:<questionId>")
async function answersFor(c, assignmentIds) {
  const out = [];
  for (let i = 0; i < assignmentIds.length; i += 20) {
    const parts = assignmentIds.slice(i, i + 20).map(id => `FIND('${esc(id)}:',{Label})=1`);
    out.push(...await c.at.list(T.answers, { filter: parts.length === 1 ? parts[0] : `OR(${parts.join(',')})` }));
  }
  return out;
}
function log(c, what, detail, who) {
  const fields = { What: what };
  const pid = who || c.me?.id;
  if (pid) fields.Who = [pid];
  if (detail) fields.Detail = typeof detail === 'string' ? detail : JSON.stringify(detail);
  const p = c.at.create(T.log, [fields]).catch(e => console.log('log failed', e.message));
  if (c.ctx?.waitUntil) c.ctx.waitUntil(p); else c.pending.push(p);
}

// ---------------------------------------------------------------- people, links, PINs, sessions
const roleOf = p => p.fields.Role || 'Employee';
const pinLength = p => (roleOf(p) === 'Admin' ? 6 : 4);
const meOut = p => ({ id: p.id, name: p.fields.Name || '', first: firstName(p.fields.Name), role: roleOf(p) });

async function personByCode(c, code) {
  if (typeof code !== 'string' || code.length < 30 || code.length > 100) return null;
  const h = await sha256hex(code);
  const rows = await c.at.list(T.people, { filter: `{Link hash}='${h}'` });
  const p = rows.find(r => ctEq(r.fields['Link hash'], h));
  return p && p.fields.Active ? p : null;
}
// May this person sign in at all right now? Admins and leads always; others when a cycle is open or they have open steps.
async function canEnter(c, p) {
  const role = roleOf(p);
  if (role === 'Admin' || role === 'Lead') return true;
  if ((await Cycles(c)).some(r => r.fields.Status === 'Open')) return true;
  return (await Steps(c)).some(s => has(s.fields.Person, p.id) && !s.fields['Lead confirmed']);
}
function lockState(c, p) {
  const lu = p.fields['Locked until'];
  if (!lu) return null;
  if (lu >= HARD_LOCK) return 'hard';
  return Date.parse(lu) > now(c.env) ? 'soft' : null;
}
async function rateLimit(c, what) {
  const bucket = Math.floor(now(c.env) / 1000 / RATE_WINDOW_S);
  const key = `rl:${what}:${c.ip}:${bucket}`;
  const n = parseInt(await c.env.REVIEWS_KV.get(key) || '0', 10) + 1;
  await c.env.REVIEWS_KV.put(key, String(n), { expirationTtl: RATE_WINDOW_S + 60 });
  if (n > RATE_MAX) fail(429, 'Too many tries. Wait a few minutes.');
}
async function newSession(c, p) {
  const token = randomToken();
  const t = now(c.env);
  await c.env.REVIEWS_KV.put('s:' + await sha256hex(token),
    JSON.stringify({ pid: p.id, created: t, last: t }), { expirationTtl: Math.ceil(MAX_MS / 1000) });
  return token;
}
async function requireSession(c) {
  const tok = (c.req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!tok || tok.length > 100) fail(401, MSG.signedOut);
  const key = 's:' + await sha256hex(tok);
  const raw = await c.env.REVIEWS_KV.get(key);
  if (!raw) fail(401, MSG.signedOut);
  const s = JSON.parse(raw), t = now(c.env);
  if (t - s.last > IDLE_MS || t - s.created > MAX_MS) { await c.env.REVIEWS_KV.delete(key); fail(401, MSG.signedOut); }
  const p = await byId(People(c), s.pid);
  if (!p || !p.fields.Active) { await c.env.REVIEWS_KV.delete(key); fail(401, MSG.signedOut); }
  if (t - s.last > 60 * 1000) {   // keep the idle clock fresh without writing on every request
    s.last = t;
    await c.env.REVIEWS_KV.put(key, JSON.stringify(s), { expirationTtl: Math.max(60, Math.ceil((s.created + MAX_MS - t) / 1000)) });
  }
  c.me = p; c.role = roleOf(p); c.sessionKey = key;
}
const isAdmin = c => c.role === 'Admin';
// Can the signed-in person see this person's results / check-in? (admin, or their lead)
function canSee(c, person) { return !!person && (isAdmin(c) || has(person.fields.Lead, c.me.id)); }

// ---------------------------------------------------------------- routes: signing in
async function hello(c) {
  await rateLimit(c, 'hello');
  const p = await personByCode(c, c.body.code);
  if (!p) fail(401, MSG.badLink);
  if (!(await canEnter(c, p))) fail(403, MSG.nothingOpen);
  const lock = lockState(c, p);
  return { first: firstName(p.fields.Name), needsPin: !p.fields['PIN hash'], pinLength: pinLength(p), ...(lock ? { locked: lock } : {}) };
}
function checkPinFormat(p, pin) {
  const n = pinLength(p);
  if (typeof pin !== 'string' || !new RegExp(`^\\d{${n}}$`).test(pin)) fail(400, `Your PIN is ${n} digits.`);
}
async function pinSet(c) {
  await rateLimit(c, 'signin');
  const p = await personByCode(c, c.body.code);
  if (!p) fail(401, MSG.badLink);
  if (!(await canEnter(c, p))) fail(403, MSG.nothingOpen);
  if (p.fields['PIN hash']) fail(409, 'You already have a PIN. Sign in with it.');
  checkPinFormat(p, c.body.pin);
  await c.at.update(T.people, [{ id: p.id, fields: {
    'PIN hash': await pinHash(c.env, p.id, c.body.pin), 'PIN set': iso(now(c.env)), 'Wrong PINs': 0, 'Locked until': null } }]);
  log(c, 'PIN set', null, p.id);
  return { session: await newSession(c, p), me: meOut(p) };
}
async function signin(c) {
  await rateLimit(c, 'signin');
  const p = await personByCode(c, c.body.code);
  if (!p) fail(401, MSG.badLink);
  if (!(await canEnter(c, p))) fail(403, MSG.nothingOpen);
  if (!p.fields['PIN hash']) fail(409, 'Pick a PIN first.', { needsPin: true });
  const lock = lockState(c, p);
  if (lock) fail(423, lock === 'hard' ? MSG.hardLock : MSG.softLock, { locked: lock });
  checkPinFormat(p, c.body.pin);
  const good = ctEq(await pinHash(c.env, p.id, c.body.pin), p.fields['PIN hash']);
  if (!good) {
    const n = (p.fields['Wrong PINs'] || 0) + 1;
    const fields = { 'Wrong PINs': n };
    if (n >= HARD_LOCK_AT) fields['Locked until'] = HARD_LOCK;
    else if (n === SOFT_LOCK_AT) fields['Locked until'] = iso(now(c.env) + LOCK_MS);
    await c.at.update(T.people, [{ id: p.id, fields }]);
    log(c, 'Wrong PIN', `try ${n}`, p.id);
    if (n >= HARD_LOCK_AT) fail(423, MSG.hardLock, { locked: 'hard' });
    if (n === SOFT_LOCK_AT) fail(423, MSG.softLock, { locked: 'soft' });
    fail(401, 'That PIN is not right.', { triesLeft: n < SOFT_LOCK_AT ? SOFT_LOCK_AT - n : HARD_LOCK_AT - n });
  }
  if (p.fields['Wrong PINs'] || p.fields['Locked until']) {
    await c.at.update(T.people, [{ id: p.id, fields: { 'Wrong PINs': 0, 'Locked until': null } }]);
  }
  log(c, 'Signed in', null, p.id);
  return { session: await newSession(c, p), me: meOut(p) };
}
async function signout(c) {
  await c.env.REVIEWS_KV.delete(c.sessionKey);
  return { ok: true };
}

// ---------------------------------------------------------------- routes: my own forms and steps
const qOut = q => ({
  id: q.id, key: q.fields.Key, form: q.fields.Form, order: q.fields.Order || 0, section: q.fields.Section || '',
  wording: q.fields.Wording || '', short: q.fields['Short name'] || '', scale: q.fields.Scale || 'None',
  counts: !!q.fields['Counts in score'], private: !!q.fields.Private,
});
async function formQuestions(c, form) {
  return (await Questions(c)).filter(q => q.fields.Active && q.fields.Form === form)
    .sort((a, b) => (a.fields.Order || 0) - (b.fields.Order || 0));
}
const cycleOut = r => r && ({ id: r.id, name: r.fields.Name, type: r.fields.Type, opens: r.fields.Opens || null, due: r.fields.Due || null, status: r.fields.Status });
async function personBrief(c, id) {
  const p = await byId(People(c), id);
  return p ? { id: p.id, name: p.fields.Name || '', role: roleOf(p), department: p.fields.Department || '' } : null;
}
const stepOut = s => ({ id: s.id, step: s.fields.Step || '', employeeDone: !!s.fields['Employee done'], leadConfirmed: !!s.fields['Lead confirmed'] });

async function me(c) {
  const cycles = await Cycles(c);
  const open = new Map(cycles.filter(r => r.fields.Status === 'Open').map(r => [r.id, r]));
  const mine = (await Assignments(c)).filter(a => has(a.fields.Writer, c.me.id) && open.has(first(a.fields.Cycle)));
  const assignments = [];
  for (const a of mine) {
    assignments.push({ id: a.id, kind: a.fields.Kind, status: a.fields.Status || 'Not started', sentAt: a.fields['Sent at'] || null,
      about: await personBrief(c, first(a.fields.About)), cycle: cycleOut(open.get(first(a.fields.Cycle))) });
  }
  const steps = (await Steps(c)).filter(s => has(s.fields.Person, c.me.id) && !s.fields['Lead confirmed']).map(stepOut);
  const questions = (await Questions(c)).filter(q => q.fields.Active)
    .sort((a, b) => String(a.fields.Form).localeCompare(String(b.fields.Form)) || (a.fields.Order || 0) - (b.fields.Order || 0)).map(qOut);
  const lead = first(c.me.fields.Lead);
  return { me: { ...meOut(c.me), lead: lead ? await personBrief(c, lead) : null }, assignments, steps, questions,
    cycles: [...open.values()].map(cycleOut) };
}
async function myAssignment(c, id) {
  const a = await byId(Assignments(c), id);
  if (!a || !has(a.fields.Writer, c.me.id)) fail(404, MSG.notFound);
  return a;
}
async function assertWritable(c, a) {
  if (a.fields.Status === 'Sent') fail(409, "Already sent. It can't be changed.");
  const cyc = await byId(Cycles(c), first(a.fields.Cycle));
  if (!cyc || cyc.fields.Status !== 'Open') fail(409, 'This is closed.');
}
const answerOut = r => ({ q: first(r.fields.Question), score: r.fields.Score ?? null, text: r.fields.Text || '' });

async function assignmentGet(c) {
  const a = await myAssignment(c, c.body.id);
  const answers = (await answersFor(c, [a.id])).map(answerOut);
  return { assignment: { id: a.id, kind: a.fields.Kind, status: a.fields.Status || 'Not started', about: await personBrief(c, first(a.fields.About)) }, answers };
}
async function assignmentSave(c) {
  const a = await myAssignment(c, c.body.id);
  await assertWritable(c, a);
  const list = c.body.answers;
  if (!Array.isArray(list) || list.length > 60) fail(400, 'Nothing to save.');
  const qs = new Map((await formQuestions(c, a.fields.Kind)).map(q => [q.id, q]));
  const existing = new Map((await answersFor(c, [a.id])).map(r => [first(r.fields.Question), r]));
  const creates = [], updates = [];
  for (const x of list) {
    if (!x || !qs.has(x.q)) fail(400, 'Unknown question.');
    let score = x.score == null || x.score === '' ? null : Number(x.score);
    if (score != null && !(Number.isInteger(score) && score >= 1 && score <= 5)) fail(400, 'Scores are 1 to 5.');
    if (!isRated(qs.get(x.q))) score = null;
    const text = typeof x.text === 'string' ? x.text.slice(0, 4000) : '';
    const fields = { Score: score, Text: text };
    const ex = existing.get(x.q);
    if (ex) updates.push({ id: ex.id, fields });
    else creates.push({ Label: `${a.id}:${x.q}`, Assignment: [a.id], Question: [x.q], ...fields });
  }
  if (creates.length) await c.at.create(T.answers, creates);
  if (updates.length) await c.at.update(T.answers, updates);
  if (!a.fields.Status || a.fields.Status === 'Not started') await c.at.update(T.assign, [{ id: a.id, fields: { Status: 'In progress' } }]);
  return { ok: true, saved: list.length };
}
async function assignmentSend(c) {
  const a = await myAssignment(c, c.body.id);
  await assertWritable(c, a);
  const qs = await formQuestions(c, a.fields.Kind);
  const got = new Map((await answersFor(c, [a.id])).map(r => [first(r.fields.Question), r.fields]));
  const missing = qs.filter(q => {
    const f = got.get(q.id) || {};
    if (!okText(f.Text)) return true;
    return isRated(q) && !(Number.isInteger(f.Score) && f.Score >= 1 && f.Score <= 5);
  }).map(q => ({ id: q.id, key: q.fields.Key }));
  if (missing.length) fail(400, `${missing.length} left. Every question needs a number and one example.`, { missing });
  await c.at.update(T.assign, [{ id: a.id, fields: { Status: 'Sent', 'Sent at': iso(now(c.env)) } }]);
  log(c, 'Sent', `${a.fields.Kind} ${a.id}`);
  return { ok: true };
}
async function stepsMark(c) {
  const s = await byId(Steps(c), c.body.stepId);
  if (!s || !has(s.fields.Person, c.me.id)) fail(404, MSG.notFound);
  if (s.fields['Lead confirmed']) fail(409, 'Already confirmed by your lead.');
  await c.at.update(T.steps, [{ id: s.id, fields: { 'Employee done': !!c.body.done } }]);
  return { ok: true };
}

// ---------------------------------------------------------------- routes: leads and admins
function requireLeadOrAdmin(c) { if (c.role !== 'Lead' && !isAdmin(c)) fail(403, 'Leads only.'); }
function requireAdmin(c) { if (!isAdmin(c)) fail(403, 'Admins only.'); }

async function crew(c) {
  requireLeadOrAdmin(c);
  const people = (await People(c)).filter(p => p.fields.Active && (isAdmin(c) ? p.id !== c.me.id : has(p.fields.Lead, c.me.id)));
  const open = new Set((await Cycles(c)).filter(r => r.fields.Status === 'Open').map(r => r.id));
  const asg = (await Assignments(c)).filter(a => open.has(first(a.fields.Cycle)));
  const out = [];
  for (const p of people) {
    const about = asg.filter(a => has(a.fields.About, p.id));
    const mgr = about.find(a => a.fields.Kind === 'Manager review');
    const peers = about.filter(a => a.fields.Kind === 'Peer review');
    const chk = about.find(a => a.fields.Kind === 'Check-in');
    out.push({ ...(await personBrief(c, p.id)),
      managerReview: mgr ? { id: mgr.id, status: mgr.fields.Status || 'Not started', cycleId: first(mgr.fields.Cycle) } : null,
      peers: { sent: peers.filter(a => a.fields.Status === 'Sent').length, total: peers.length },
      checkin: chk ? { id: chk.id, status: chk.fields.Status || 'Not started', metAt: chk.fields['Met at'] || null, cycleId: first(chk.fields.Cycle) } : null });
  }
  return { people: out };
}
async function results(c) {
  requireLeadOrAdmin(c);
  const person = await byId(People(c), c.body.personId);
  if (!canSee(c, person)) fail(404, MSG.notFound);
  const cycle = await byId(Cycles(c), c.body.cycleId);
  if (!cycle) fail(404, MSG.notFound);
  const about = (await Assignments(c)).filter(a => has(a.fields.About, person.id) && has(a.fields.Cycle, cycle.id));
  const mgrA = about.find(a => a.fields.Kind === 'Manager review' && a.fields.Status === 'Sent');
  const peerAll = about.filter(a => a.fields.Kind === 'Peer review');
  const peerSent = peerAll.filter(a => a.fields.Status === 'Sent');
  const minPeers = cycle.fields['Min peers'] || 2;
  let weight = cycle.fields['Manager weight'];
  weight = weight == null ? 0.75 : (weight > 1 ? weight / 100 : weight);
  const shown = peerSent.length >= minPeers;
  const keep = q => isAdmin(c) || !q.fields.Private;
  const mq = (await formQuestions(c, 'Manager review')).filter(keep);
  const pq = (await formQuestions(c, 'Peer review')).filter(keep);
  const answers = await answersFor(c, [...(mgrA ? [mgrA.id] : []), ...(shown || isAdmin(c) ? peerSent.map(a => a.id) : [])]);
  const byAsg = new Map();
  for (const r of answers) {
    const aid = first(r.fields.Assignment);
    if (!byAsg.has(aid)) byAsg.set(aid, new Map());
    byAsg.get(aid).set(first(r.fields.Question), r.fields);
  }
  const mAns = mgrA ? byAsg.get(mgrA.id) || new Map() : null;
  const manager = { sent: !!mgrA, answers: mAns ? mq.map(q => ({ key: q.fields.Key, short: q.fields['Short name'] || '', wording: q.fields.Wording || '',
    rated: isRated(q), counts: !!q.fields['Counts in score'], score: mAns.get(q.id)?.Score ?? null, text: mAns.get(q.id)?.Text || '' })) : [] };
  // peers: averages + their words, mixed order, never who wrote them
  const peerQuestions = shown ? pq.map(q => {
    const vals = peerSent.map(a => byAsg.get(a.id)?.get(q.id)).filter(Boolean);
    const scores = vals.map(v => v.Score).filter(n => Number.isInteger(n));
    return { key: q.fields.Key, short: q.fields['Short name'] || '', wording: q.fields.Wording || '', rated: isRated(q),
      counts: !!q.fields['Counts in score'], avg: round2(avg(scores)), texts: shuffle(vals.map(v => v.Text).filter(Boolean)) };
  }) : [];
  // score: manager average over counted questions; peers: each peer's average, then the average of those
  const mScores = manager.answers.filter(a => a.counts && Number.isInteger(a.score)).map(a => a.score);
  const mAvg = mgrA ? avg(mScores) : null;
  const countedP = pq.filter(q => q.fields['Counts in score']);
  const pAvg = shown ? avg(peerSent.map(a => avg(countedP.map(q => byAsg.get(a.id)?.get(q.id)?.Score).filter(n => Number.isInteger(n))))
    .filter(n => n != null)) : null;
  const total = mAvg != null && pAvg != null ? weight * mAvg + (1 - weight) * pAvg : mAvg;
  const out = { person: await personBrief(c, person.id), cycle: cycleOut(cycle), manager,
    peers: { sent: peerSent.length, total: peerAll.length, min: minPeers, shown, questions: peerQuestions },
    score: { total: round2(total), manager: round2(mAvg), peers: round2(pAvg), weight } };
  if (isAdmin(c)) {   // admins (only) may see who wrote what
    out.peers.byWriter = [];
    for (const a of peerSent) out.peers.byWriter.push({ writer: await personBrief(c, first(a.fields.Writer)),
      answers: pq.map(q => ({ key: q.fields.Key, score: byAsg.get(a.id)?.get(q.id)?.Score ?? null, text: byAsg.get(a.id)?.get(q.id)?.Text || '' })) });
  }
  log(c, 'Viewed results', `${person.fields.Name} · ${cycle.fields.Name}`);
  return out;
}
async function checkinAssignment(c, id) {
  const a = await byId(Assignments(c), id);
  if (!a || a.fields.Kind !== 'Check-in') fail(404, MSG.notFound);
  const person = await byId(People(c), first(a.fields.About));
  if (!canSee(c, person)) fail(404, MSG.notFound);
  return { a, person };
}
const parseNotes = s => { try { return s ? JSON.parse(s) : {}; } catch { return {}; } };
async function checkin(c) {
  requireLeadOrAdmin(c);
  const person = await byId(People(c), c.body.personId);
  if (!canSee(c, person)) fail(404, MSG.notFound);
  const a = (await Assignments(c)).find(x => x.fields.Kind === 'Check-in' && has(x.fields.About, person.id) && has(x.fields.Cycle, c.body.cycleId));
  const qs = await formQuestions(c, 'Check-in');
  const sent = a?.fields.Status === 'Sent';
  const got = sent ? new Map((await answersFor(c, [a.id])).map(r => [first(r.fields.Question), r.fields])) : new Map();
  const questions = qs.map(q => {
    const base = { id: q.id, key: q.fields.Key, section: q.fields.Section || '', wording: q.fields.Wording || '', scale: q.fields.Scale || 'None', private: !!q.fields.Private };
    if (q.fields.Private && !isAdmin(c)) return { ...base, hidden: true };
    const f = got.get(q.id) || {};
    return { ...base, score: f.Score ?? null, text: f.Text || '' };
  });
  const steps = (await Steps(c)).filter(s => has(s.fields.Person, person.id) && !s.fields['Lead confirmed']).map(stepOut);
  if (isAdmin(c)) log(c, 'Viewed check-in', person.fields.Name);
  return { person: await personBrief(c, person.id), assignmentId: a?.id || null, answersIn: sent, questions,
    notes: parseNotes(a?.fields['Lead notes']), issues: a?.fields['Issues & opportunities'] || '', metAt: a?.fields['Met at'] || null, steps };
}
function noteFields(c) {
  const f = {};
  if (c.body.notes !== undefined) {
    if (typeof c.body.notes !== 'object' || c.body.notes === null) fail(400, 'Notes must be an object.');
    const s = JSON.stringify(c.body.notes);
    if (s.length > 20000) fail(400, 'Notes are too long.');
    f['Lead notes'] = s;
  }
  if (c.body.issues !== undefined) f['Issues & opportunities'] = String(c.body.issues).slice(0, 4000);
  return f;
}
async function checkinSave(c) {
  requireLeadOrAdmin(c);
  const { a } = await checkinAssignment(c, c.body.assignmentId);
  if (a.fields['Met at'] && !isAdmin(c)) fail(409, 'This check-in is finished.');
  await c.at.update(T.assign, [{ id: a.id, fields: noteFields(c) }]);
  return { ok: true };
}
async function checkinFinish(c) {
  requireLeadOrAdmin(c);
  const { a, person } = await checkinAssignment(c, c.body.assignmentId);
  if (a.fields['Met at'] && !isAdmin(c)) fail(409, 'This check-in is finished.');
  const steps = await Steps(c);
  const confirm = ids(c.body.confirmSteps).map(id => {
    const s = steps.find(x => x.id === id);
    if (!s || !has(s.fields.Person, person.id)) fail(400, 'Unknown next step.');
    return { id, fields: { 'Lead confirmed': true } };
  });
  const fresh = ids(c.body.newSteps).map(t => String(t).trim().slice(0, 300)).filter(Boolean);
  if (fresh.length > 10) fail(400, 'Up to 10 new next steps.');
  if (confirm.length) await c.at.update(T.steps, confirm);
  if (fresh.length) await c.at.create(T.steps, fresh.map(t => ({ Step: t, Person: [person.id], From: [a.id] })));
  await c.at.update(T.assign, [{ id: a.id, fields: { ...noteFields(c), 'Met at': iso(now(c.env)) } }]);
  log(c, 'Check-in finished', `${person.fields.Name}: ${confirm.length} confirmed, ${fresh.length} new`);
  return { ok: true, confirmed: confirm.length, created: fresh.length };
}

// ---------------------------------------------------------------- routes: admin
async function adminPeople(c) {
  requireAdmin(c);
  const t = now(c.env);
  return { people: (await People(c)).map(p => ({
    id: p.id, name: p.fields.Name || '', role: roleOf(p), department: p.fields.Department || '', lead: first(p.fields.Lead) || null,
    email: p.fields.Email || '', phone: p.fields.Phone || '', active: !!p.fields.Active,
    hasLink: !!p.fields['Link hash'], linkSent: p.fields['Link sent'] || null, pinSet: !!p.fields['PIN hash'],
    wrongPins: p.fields['Wrong PINs'] || 0,
    locked: p.fields['Locked until'] ? (p.fields['Locked until'] >= HARD_LOCK ? 'hard' : (Date.parse(p.fields['Locked until']) > t ? 'soft' : null)) : null,
  })) };
}
async function adminCycles(c) {
  requireAdmin(c);
  const asg = await Assignments(c);
  return { cycles: (await Cycles(c)).map(r => {
    const mine = asg.filter(a => has(a.fields.Cycle, r.id));
    return { ...cycleOut(r), managerWeight: r.fields['Manager weight'] ?? 0.75, minPeers: r.fields['Min peers'] || 2,
      assignments: mine.length, sent: mine.filter(a => a.fields.Status === 'Sent').length };
  }) };
}
async function adminLink(c) {
  requireAdmin(c);
  const p = await byId(People(c), c.body.personId);
  if (!p) fail(404, MSG.notFound);
  if (!p.fields.Active) fail(409, 'This person is not active.');
  const via = c.body.via === 'email' ? 'email' : 'none';
  if (via === 'email' && !p.fields.Email) fail(400, 'No email on file for this person.');
  const code = randomToken();
  const url = `${APP_URL}#k=${code}`;
  const fields = { 'Link hash': await sha256hex(code), 'Link sent': iso(now(c.env)) };
  if (via === 'email') fields['Email link'] = url;   // the Airtable automation emails it, then clears this field
  await c.at.update(T.people, [{ id: p.id, fields }]);
  log(c, 'Link made', `${p.fields.Name} (${via})`);
  return { url, via };
}
async function adminPinReset(c) {
  requireAdmin(c);
  const p = await byId(People(c), c.body.personId);
  if (!p) fail(404, MSG.notFound);
  await c.at.update(T.people, [{ id: p.id, fields: { 'PIN hash': null, 'PIN set': null, 'Wrong PINs': 0, 'Locked until': null } }]);
  log(c, 'PIN reset', p.fields.Name);
  return { ok: true };
}
async function adminAssign(c) {
  requireAdmin(c);
  const cycle = await byId(Cycles(c), c.body.cycleId);
  if (!cycle) fail(404, 'Unknown cycle.');
  const items = c.body.items;
  if (!Array.isArray(items) || !items.length || items.length > 300) fail(400, 'Nothing to assign.');
  const people = await People(c);
  const existing = new Set((await Assignments(c)).filter(a => has(a.fields.Cycle, cycle.id))
    .map(a => `${a.fields.Kind}|${first(a.fields.Writer)}|${first(a.fields.About)}`));
  const creates = []; let skipped = 0;
  for (const it of items) {
    const w = people.find(p => p.id === it.writer), ab = people.find(p => p.id === it.about);
    if (!KINDS.includes(it.kind) || !w || !ab) fail(400, 'Each item needs a kind, a writer and who it is about.');
    if (it.kind === 'Check-in' && w.id !== ab.id) fail(400, 'A check-in is written by the person it is about.');
    if (it.kind !== 'Check-in' && w.id === ab.id) fail(400, 'Nobody reviews themselves.');
    const k = `${it.kind}|${w.id}|${ab.id}`;
    if (existing.has(k)) { skipped++; continue; }
    existing.add(k);
    creates.push({ Label: `${cycle.fields.Name} · ${it.kind} · ${w.fields.Name} → ${ab.fields.Name}`,
      Cycle: [cycle.id], Kind: it.kind, Writer: [w.id], About: [ab.id], Status: 'Not started' });
  }
  if (creates.length) await c.at.create(T.assign, creates);
  log(c, 'Assigned', `${cycle.fields.Name}: ${creates.length} new, ${skipped} already there`);
  return { created: creates.length, skipped };
}
async function adminCycle(c, status) {
  requireAdmin(c);
  const cycle = await byId(Cycles(c), c.body.cycleId);
  if (!cycle) fail(404, 'Unknown cycle.');
  await c.at.update(T.cycles, [{ id: cycle.id, fields: { Status: status } }]);
  let expired = 0;
  if (status === 'Closed' && c.body.expireLinks) {   // links stop working; admins keep theirs
    const rows = (await People(c)).filter(p => p.fields['Link hash'] && roleOf(p) !== 'Admin')
      .map(p => ({ id: p.id, fields: { 'Link hash': null } }));
    if (rows.length) await c.at.update(T.people, rows);
    expired = rows.length;
  }
  log(c, status === 'Open' ? 'Cycle opened' : 'Cycle closed', cycle.fields.Name);
  return { ok: true, status, expired };
}

// ---------------------------------------------------------------- router
const ROUTES = {
  '/r/hello': { auth: false, fn: hello },
  '/r/pin/set': { auth: false, fn: pinSet },
  '/r/signin': { auth: false, fn: signin },
  '/r/signout': { auth: true, fn: signout },
  '/r/me': { auth: true, fn: me },
  '/r/assignment/get': { auth: true, fn: assignmentGet },
  '/r/assignment/save': { auth: true, fn: assignmentSave },
  '/r/assignment/send': { auth: true, fn: assignmentSend },
  '/r/steps/mark': { auth: true, fn: stepsMark },
  '/r/crew': { auth: true, fn: crew },
  '/r/results': { auth: true, fn: results },
  '/r/checkin': { auth: true, fn: checkin },
  '/r/checkin/save': { auth: true, fn: checkinSave },
  '/r/checkin/finish': { auth: true, fn: checkinFinish },
  '/r/admin/people': { auth: true, fn: adminPeople },
  '/r/admin/cycles': { auth: true, fn: adminCycles },
  '/r/admin/link': { auth: true, fn: adminLink },
  '/r/admin/pin/reset': { auth: true, fn: adminPinReset },
  '/r/admin/assign': { auth: true, fn: adminAssign },
  '/r/admin/cycle/open': { auth: true, fn: c => adminCycle(c, 'Open') },
  '/r/admin/cycle/close': { auth: true, fn: c => adminCycle(c, 'Closed') },
};

function allowedOrigin(env, origin) {
  if (origin === SITE_ORIGIN) return true;
  if (env.DEV === '1' && (origin === 'null' || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || ''))) return true;
  return false;
}
function respond(status, obj, origin, env) {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff', 'Vary': 'Origin' };
  if (origin && allowedOrigin(env, origin)) h['Access-Control-Allow-Origin'] = origin;
  return new Response(obj == null ? null : JSON.stringify(obj), { status, headers: h });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin');
    if (req.method === 'GET' && url.pathname === '/r/version') return respond(200, { version: VERSION }, origin, env);
    if (req.method === 'OPTIONS') {
      if (!allowedOrigin(env, origin)) return respond(403, { error: 'Not allowed.' }, null, env);
      const r = respond(204, null, origin, env);
      r.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      r.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      r.headers.set('Access-Control-Max-Age', '600');
      return r;
    }
    const route = ROUTES[url.pathname];
    if (!route || req.method !== 'POST') return respond(404, { error: MSG.notFound }, origin, env);
    if (!allowedOrigin(env, origin)) return respond(403, { error: 'Not allowed.' }, null, env);   // only Pine's site
    if (!env.REVIEWS_AIRTABLE_TOKEN || !env.REVIEWS_BASE_ID || !env.PIN_PEPPER || !env.REVIEWS_KV) {
      return respond(500, { error: 'The reviews worker is not set up yet (secrets or KV missing).' }, origin, env);
    }
    const c = { env, req, ctx, at: airtable(env), cache: {}, pending: [], ip: req.headers.get('CF-Connecting-IP') || 'unknown', body: {} };
    try {
      const text = await req.text();
      if (text.length > 100000) fail(413, 'Too much at once.');
      if (text) { try { c.body = JSON.parse(text); } catch { fail(400, 'Bad request.'); } }
      if (typeof c.body !== 'object' || c.body === null) c.body = {};
      if (route.auth) await requireSession(c);
      const out = await route.fn(c);
      await Promise.all(c.pending);
      return respond(200, out, origin, env);
    } catch (e) {
      await Promise.all(c.pending).catch(() => {});
      if (e instanceof HttpError) return respond(e.status, { error: e.message, ...(e.extra || {}) }, origin, env);
      console.log('reviews worker error', e && e.stack || e);
      return respond(500, { error: 'Something went wrong. Try again.' }, origin, env);
    }
  },
};
