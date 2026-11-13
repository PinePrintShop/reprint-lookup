// Tests for workers/pine-reviews-v1.js with an in-memory fake Airtable and a Map-backed KV.
// Run: node --test workers/test/*.test.mjs
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../pine-reviews-v1.js';

const ORIGIN = 'https://pineprintshop.github.io';
const BASE = 'appTESTTESTTEST01';

// ---------------------------------------------------------------- fake Airtable
let db, idn;
function rec(table, fields) { const r = { id: 'rec' + String(++idn).padStart(14, '0'), createdTime: new Date().toISOString(), fields: { ...fields } }; db[table].push(r); return r; }
// formula subset the worker uses: {F}='v' · FIND('v',{F})=1 · OR(a,b,…)
function evalFormula(f, fields) {
  f = f.trim();
  const or = f.match(/^OR\((.*)\)$/s);
  if (or) return splitArgs(or[1]).some(x => evalFormula(x, fields));
  let m = f.match(/^\{([^}]+)\}='((?:[^'\\]|\\.)*)'$/);
  if (m) return String(fields[m[1]] ?? '') === m[2].replace(/\\(.)/g, '$1');
  m = f.match(/^FIND\('((?:[^'\\]|\\.)*)',\{([^}]+)\}\)=1$/);
  if (m) return String(fields[m[2]] ?? '').indexOf(m[1].replace(/\\(.)/g, '$1')) === 0;
  throw new Error('fake airtable: unsupported formula ' + f);
}
function splitArgs(s) { const out = []; let d = 0, q = false, cur = ''; for (const ch of s) { if (ch === "'" ) q = !q; if (!q && ch === '(') d++; if (!q && ch === ')') d--; if (!q && d === 0 && ch === ',') { out.push(cur); cur = ''; } else cur += ch; } if (cur) out.push(cur); return out; }
async function fakeFetch(url, opt = {}) {
  const u = new URL(url);
  assert.equal(u.hostname, 'api.airtable.com');
  const [, , base, tableEnc] = u.pathname.split('/');
  assert.equal(base, BASE);
  const table = decodeURIComponent(tableEnc);
  assert.ok(db[table], 'unknown table ' + table);
  const ok = j => new Response(JSON.stringify(j), { status: 200 });
  if ((opt.method || 'GET') === 'GET') {
    const f = u.searchParams.get('filterByFormula');
    let rows = db[table].filter(r => !f || evalFormula(f, r.fields));
    const off = parseInt(u.searchParams.get('offset') || '0', 10), size = 100;
    const page = rows.slice(off, off + size);
    return ok({ records: page.map(r => structuredClone(r)), ...(off + size < rows.length ? { offset: String(off + size) } : {}) });
  }
  const body = JSON.parse(opt.body);
  assert.ok(body.records.length <= 10, 'airtable allows 10 per call');
  if (opt.method === 'POST') return ok({ records: body.records.map(r => structuredClone(rec(table, r.fields))) });
  if (opt.method === 'PATCH') return ok({ records: body.records.map(r => {
    const row = db[table].find(x => x.id === r.id); assert.ok(row, 'update of unknown record');
    for (const [k, v] of Object.entries(r.fields)) { if (v === null) delete row.fields[k]; else row.fields[k] = v; }
    return structuredClone(row);
  }) });
  throw new Error('unexpected method ' + opt.method);
}
globalThis.fetch = fakeFetch;

// ---------------------------------------------------------------- fake KV + env
let clock;
function makeEnv() {
  const kv = new Map();
  return {
    REVIEWS_AIRTABLE_TOKEN: 'patTEST', REVIEWS_BASE_ID: BASE, PIN_PEPPER: 'pepper-for-tests-only-0123456789abcdef',
    TEST_NOW: () => clock,
    REVIEWS_KV: {
      async get(k) { const v = kv.get(k); if (!v) return null; if (v.exp && v.exp < clock) { kv.delete(k); return null; } return v.val; },
      async put(k, val, o = {}) { kv.set(k, { val, exp: o.expirationTtl ? clock + o.expirationTtl * 1000 : 0 }); },
      async delete(k) { kv.delete(k); },
    },
  };
}
let env;
async function call(path, body, { token, origin = ORIGIN, ip = '1.1.1.1' } = {}) {
  const headers = { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip };
  if (origin) headers.Origin = origin;
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await worker.fetch(new Request('https://pine-reviews.test' + path, { method: 'POST', headers, body: JSON.stringify(body || {}) }), env, {});
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null, headers: res.headers };
}
async function sha(s) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join(''); }

// ---------------------------------------------------------------- seed: a small shop
let P, C, Q, A;
const CODE = {};   // person key -> plain link code
async function giveLink(key) { const code = 'code-' + key + '-'.repeat(30) + Math.random().toString(36).slice(2); CODE[key] = code; P[key].fields['Link hash'] = await sha(code); }
beforeEach(async () => {
  idn = 0; clock = Date.parse('2027-01-10T15:00:00Z');
  db = { People: [], Cycles: [], Questions: [], Assignments: [], Answers: [], 'Next steps': [], 'Activity log': [] };
  env = makeEnv();
  P = {};
  P.boss = rec('People', { Name: 'Stephen Owner', Role: 'Admin', Active: true, Email: 'boss@example.com' });
  P.lead = rec('People', { Name: 'Jordan Lead', Role: 'Lead', Active: true, Lead: [P.boss.id] });
  P.lead2 = rec('People', { Name: 'Casey Lead', Role: 'Lead', Active: true, Lead: [P.boss.id] });
  P.alex = rec('People', { Name: 'Alex R', Role: 'Employee', Active: true, Lead: [P.lead.id], Email: 'alex@example.com' });
  P.mor = rec('People', { Name: 'Morgan K', Role: 'Employee', Active: true, Lead: [P.lead.id] });
  P.dev = rec('People', { Name: 'Devin S', Role: 'Employee', Active: true, Lead: [P.lead.id] });
  P.sky = rec('People', { Name: 'Sky W', Role: 'Employee', Active: true, Lead: [P.lead.id] });
  P.tay = rec('People', { Name: 'Taylor B', Role: 'Employee', Active: true, Lead: [P.lead2.id] });
  P.gone = rec('People', { Name: 'Gone Person', Role: 'Employee', Active: false, Lead: [P.lead.id] });
  for (const k of Object.keys(P)) await giveLink(k);
  C = { rev: rec('Cycles', { Name: 'Mid-year 2027', Type: 'Review', Status: 'Open', 'Manager weight': 0.75, 'Min peers': 2 }),
        chk: rec('Cycles', { Name: 'Q1 2027', Type: 'Check-in', Status: 'Open' }),
        old: rec('Cycles', { Name: 'Old', Type: 'Review', Status: 'Closed' }) };
  Q = {};
  for (const form of ['Manager review', 'Peer review']) {
    const t = form === 'Manager review' ? 'm' : 'p';
    Q[t + 'comp'] = rec('Questions', { Key: 'comp', Form: form, Order: 1, Wording: 'Competence', 'Short name': 'Job competence', Scale: 'Expectations', 'Counts in score': true, Active: true });
    Q[t + 'rel'] = rec('Questions', { Key: 'rel', Form: form, Order: 2, Wording: 'Reliability', 'Short name': 'Reliability', Scale: 'Expectations', 'Counts in score': true, Active: true });
    Q[t + 'out'] = rec('Questions', { Key: 'out', Form: form, Order: 9, Wording: 'Outstanding work?', Scale: 'None', Active: true });
  }
  Q.mused = rec('Questions', { Key: 'used', Form: 'Manager review', Order: 7, Wording: 'Skills used', Scale: 'Skills used', Active: true });
  Q.cvibe = rec('Questions', { Key: 'vibe', Form: 'Check-in', Order: 6, Wording: 'Team vibe?', Scale: 'Poor–Great', Active: true });
  Q.clgap = rec('Questions', { Key: 'lgap', Form: 'Check-in', Order: 10, Wording: 'Leadership gaps?', Scale: 'None', Private: true, Active: true });
  Q.retired = rec('Questions', { Key: 'old', Form: 'Peer review', Order: 99, Wording: 'Retired', Scale: 'None', Active: false });
  A = {
    mgrAlex: rec('Assignments', { Label: 'm-alex', Cycle: [C.rev.id], Kind: 'Manager review', Writer: [P.lead.id], About: [P.alex.id], Status: 'Not started' }),
    p1: rec('Assignments', { Label: 'p1', Cycle: [C.rev.id], Kind: 'Peer review', Writer: [P.mor.id], About: [P.alex.id], Status: 'Not started' }),
    p2: rec('Assignments', { Label: 'p2', Cycle: [C.rev.id], Kind: 'Peer review', Writer: [P.dev.id], About: [P.alex.id], Status: 'Not started' }),
    p3: rec('Assignments', { Label: 'p3', Cycle: [C.rev.id], Kind: 'Peer review', Writer: [P.alex.id], About: [P.sky.id], Status: 'Not started' }),
    chkAlex: rec('Assignments', { Label: 'c-alex', Cycle: [C.chk.id], Kind: 'Check-in', Writer: [P.alex.id], About: [P.alex.id], Status: 'Not started' }),
    oldOne: rec('Assignments', { Label: 'old', Cycle: [C.old.id], Kind: 'Peer review', Writer: [P.alex.id], About: [P.mor.id], Status: 'Not started' }),
  };
});

const long = s => s + ' — a real sentence about it.';
async function signedIn(key, pin) {
  pin = pin || (P[key].fields.Role === 'Admin' ? '246810' : '2580');
  const r = await call('/r/pin/set', { code: CODE[key], pin });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  return r.json.session;
}
async function fillAndSend(token, asg, form, score = 4) {
  const qs = Object.values(Q).filter(q => q.fields.Form === form && q.fields.Active);
  const answers = qs.map(q => ({ q: q.id, score: q.fields.Scale === 'None' ? null : score, text: long('Answer ' + q.fields.Key) }));
  let r = await call('/r/assignment/save', { id: asg.id, answers }, { token }); assert.equal(r.status, 200, JSON.stringify(r.json));
  r = await call('/r/assignment/send', { id: asg.id }, { token }); assert.equal(r.status, 200, JSON.stringify(r.json));
}

// ---------------------------------------------------------------- tests
test('version is public; CORS rejects other origins and a missing origin', async () => {
  const v = await worker.fetch(new Request('https://x/r/version'), env, {});
  assert.deepEqual(await v.json(), { version: 1 });
  let r = await call('/r/hello', { code: CODE.alex }, { origin: 'https://evil.example' });
  assert.equal(r.status, 403); assert.equal(r.headers.get('Access-Control-Allow-Origin'), null);
  r = await call('/r/hello', { code: CODE.alex }, { origin: null });
  assert.equal(r.status, 403);
  r = await call('/r/hello', { code: CODE.alex }, { origin: 'http://localhost:8000' });
  assert.equal(r.status, 403, 'localhost only with DEV=1');
  env.DEV = '1';
  r = await call('/r/hello', { code: CODE.alex }, { origin: 'http://localhost:8000' });
  assert.equal(r.status, 200);
  r = await call('/r/hello', { code: CODE.alex });
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
  assert.equal(r.headers.get('Referrer-Policy'), 'no-referrer');
});

test('hello: unknown, inactive, first time, admin PIN length', async () => {
  let r = await call('/r/hello', { code: 'x'.repeat(43) });
  assert.equal(r.status, 401); assert.match(r.json.error, /doesn't work/);
  r = await call('/r/hello', { code: CODE.gone }); assert.equal(r.status, 401);
  r = await call('/r/hello', { code: CODE.alex });
  assert.deepEqual(r.json, { first: 'Alex', needsPin: true, pinLength: 4 });
  r = await call('/r/hello', { code: CODE.boss }); assert.equal(r.json.pinLength, 6);
});

test('no open cycle and no steps: employees are turned away, leads/admins are not', async () => {
  C.rev.fields.Status = 'Closed'; C.chk.fields.Status = 'Closed';
  assert.equal((await call('/r/hello', { code: CODE.alex })).status, 403);
  assert.equal((await call('/r/hello', { code: CODE.lead })).status, 200);
  rec('Next steps', { Step: 'Learn press 2', Person: [P.alex.id] });
  assert.equal((await call('/r/hello', { code: CODE.alex })).status, 200, 'open next steps let them in');
});

test('PIN set once, sign in, wrong format, PIN stored only as a hash', async () => {
  let r = await call('/r/pin/set', { code: CODE.alex, pin: '12' }); assert.equal(r.status, 400);
  r = await call('/r/pin/set', { code: CODE.boss, pin: '1234' }); assert.equal(r.status, 400, 'admins need 6 digits');
  r = await call('/r/pin/set', { code: CODE.alex, pin: '2580' }); assert.equal(r.status, 200); assert.ok(r.json.session);
  assert.equal(r.json.me.name, 'Alex R');
  assert.notEqual(P.alex.fields['PIN hash'], '2580'); assert.match(P.alex.fields['PIN hash'], /^[0-9a-f]{64}$/);
  r = await call('/r/pin/set', { code: CODE.alex, pin: '1111' }); assert.equal(r.status, 409, 'cannot overwrite a PIN');
  r = await call('/r/signin', { code: CODE.alex, pin: '2580' }); assert.equal(r.status, 200);
  assert.ok(db['Activity log'].some(l => l.fields.What === 'Signed in' && l.fields.Who[0] === P.alex.id));
});

test('lockout: 5 wrong = 15 minutes, then 10 wrong = locked until reset; admin reset clears it', async () => {
  await signedIn('alex');
  for (let i = 1; i <= 4; i++) { const r = await call('/r/signin', { code: CODE.alex, pin: '0000' }); assert.equal(r.status, 401); assert.equal(r.json.triesLeft, 5 - i); }
  let r = await call('/r/signin', { code: CODE.alex, pin: '0000' }); assert.equal(r.status, 423); assert.equal(r.json.locked, 'soft');
  r = await call('/r/signin', { code: CODE.alex, pin: '2580' }); assert.equal(r.status, 423, 'even the right PIN waits');
  assert.equal((await call('/r/hello', { code: CODE.alex })).json.locked, 'soft');
  clock += 16 * 60 * 1000;
  for (let i = 6; i <= 9; i++) { r = await call('/r/signin', { code: CODE.alex, pin: '0000' }); assert.equal(r.status, 401); }
  r = await call('/r/signin', { code: CODE.alex, pin: '0000' }); assert.equal(r.status, 423); assert.equal(r.json.locked, 'hard');
  clock += 24 * 60 * 60 * 1000;
  r = await call('/r/signin', { code: CODE.alex, pin: '2580' }); assert.equal(r.status, 423, 'hard lock does not time out');
  const boss = await signedIn('boss');
  assert.equal((await call('/r/admin/pin/reset', { personId: P.alex.id }, { token: boss })).status, 200);
  r = await call('/r/signin', { code: CODE.alex, pin: '2580' }); assert.equal(r.status, 409, 'after a reset they pick a new PIN');
  r = await call('/r/pin/set', { code: CODE.alex, pin: '1357' }); assert.equal(r.status, 200);
});

test('right PIN after a few wrong ones resets the counter', async () => {
  await signedIn('alex');
  for (let i = 0; i < 3; i++) await call('/r/signin', { code: CODE.alex, pin: '0000' });
  assert.equal(P.alex.fields['Wrong PINs'], 3);
  await call('/r/signin', { code: CODE.alex, pin: '2580' });
  assert.equal(P.alex.fields['Wrong PINs'], 0);
});

test('sessions: idle 30 min ends it, 12 hours max, sign-out ends it, bad token refused', async () => {
  let tok = await signedIn('alex');
  assert.equal((await call('/r/me', {}, { token: tok })).status, 200);
  clock += 29 * 60 * 1000; assert.equal((await call('/r/me', {}, { token: tok })).status, 200, 'activity keeps it alive');
  clock += 31 * 60 * 1000; assert.equal((await call('/r/me', {}, { token: tok })).status, 401, 'idle too long');
  tok = (await call('/r/signin', { code: CODE.alex, pin: '2580' })).json.session;
  for (let h = 0; h < 13 * 4; h++) { clock += 15 * 60 * 1000; const r = await call('/r/me', {}, { token: tok }); if (r.status === 401) { assert.ok(h >= 47, 'ended at the 12-hour mark, not before'); break; } if (h === 13 * 4 - 1) assert.fail('never expired'); }
  tok = (await call('/r/signin', { code: CODE.alex, pin: '2580' })).json.session;
  assert.equal((await call('/r/signout', {}, { token: tok })).status, 200);
  assert.equal((await call('/r/me', {}, { token: tok })).status, 401);
  assert.equal((await call('/r/me', {}, { token: 'nope' })).status, 401);
  assert.equal((await call('/r/me', {})).status, 401);
});

test('me: only my assignments in open cycles, my steps, active questions (no hashes)', async () => {
  rec('Next steps', { Step: 'Dryer sheet sign-off', Person: [P.alex.id], 'Employee done': true });
  rec('Next steps', { Step: 'Not mine', Person: [P.mor.id] });
  const tok = await signedIn('alex');
  const r = await call('/r/me', {}, { token: tok });
  assert.equal(r.status, 200);
  assert.deepEqual(r.json.assignments.map(a => a.id).sort(), [A.p3.id, A.chkAlex.id].sort(), 'closed cycle left out');
  assert.equal(r.json.steps.length, 1); assert.equal(r.json.steps[0].employeeDone, true);
  assert.ok(!r.json.questions.some(q => q.key === 'old'), 'inactive question left out');
  assert.ok(r.json.questions.some(q => q.key === 'lgap'), 'they answer the private question themselves');
  assert.equal(r.json.me.lead.name, 'Jordan Lead');
  assert.ok(!JSON.stringify(r.json).includes('Link hash') && !JSON.stringify(r.json).includes(P.alex.fields['PIN hash']));
});

test("employee can't read or write someone else's form", async () => {
  const tok = await signedIn('alex');
  assert.equal((await call('/r/assignment/get', { id: A.p1.id }, { token: tok })).status, 404, "Morgan's peer review of Alex");
  assert.equal((await call('/r/assignment/save', { id: A.mgrAlex.id, answers: [] }, { token: tok })).status, 404);
  assert.equal((await call('/r/assignment/send', { id: A.p1.id }, { token: tok })).status, 404);
  assert.equal((await call('/r/crew', {}, { token: tok })).status, 403);
  assert.equal((await call('/r/results', { personId: P.alex.id, cycleId: C.rev.id }, { token: tok })).status, 403);
  assert.equal((await call('/r/admin/people', {}, { token: tok })).status, 403);
});

test('save validates; send checks every answer; sent forms and closed cycles are locked', async () => {
  const tok = await signedIn('alex');
  let r = await call('/r/assignment/save', { id: A.p3.id, answers: [{ q: Q.mcomp.id, score: 3, text: 'x' }] }, { token: tok });
  assert.equal(r.status, 400, 'a manager question on a peer form');
  r = await call('/r/assignment/save', { id: A.p3.id, answers: [{ q: Q.pcomp.id, score: 7, text: 'x' }] }, { token: tok });
  assert.equal(r.status, 400, 'score out of range');
  r = await call('/r/assignment/save', { id: A.p3.id, answers: [{ q: Q.pcomp.id, score: 4, text: 'ok' }] }, { token: tok });
  assert.equal(r.status, 200); assert.equal(A.p3.fields.Status, 'In progress');
  r = await call('/r/assignment/send', { id: A.p3.id }, { token: tok });
  assert.equal(r.status, 400); assert.equal(r.json.missing.length, 3, 'comp too short, rel and out empty');
  await call('/r/assignment/save', { id: A.p3.id, answers: [{ q: Q.pcomp.id, score: 4, text: long('Knows the press') }] }, { token: tok });
  r = await call('/r/assignment/save', { id: A.p3.id, answers: [{ q: Q.pcomp.id, score: 5, text: long('Changed') }] }, { token: tok });
  assert.equal(db.Answers.filter(x => x.fields.Label.startsWith(A.p3.id)).length, 1, 'upsert, not duplicate');
  r = await call('/r/assignment/send', { id: A.p3.id }, { token: tok });
  assert.deepEqual(r.json.missing.map(m => m.key).sort(), ['out', 'rel']);
  await fillAndSend(tok, A.p3, 'Peer review');
  assert.equal(A.p3.fields.Status, 'Sent'); assert.ok(A.p3.fields['Sent at']);
  r = await call('/r/assignment/save', { id: A.p3.id, answers: [{ q: Q.pcomp.id, score: 1, text: long('sneaky edit') }] }, { token: tok });
  assert.equal(r.status, 409);
  r = await call('/r/assignment/send', { id: A.p3.id }, { token: tok }); assert.equal(r.status, 409);
  C.chk.fields.Status = 'Closed';
  r = await call('/r/assignment/save', { id: A.chkAlex.id, answers: [{ q: Q.cvibe.id, score: 4, text: long('ok') }] }, { token: tok });
  assert.equal(r.status, 409, 'closed cycle');
});

test('lead results: no peer names, hidden below 2 peers, score 75/25', async () => {
  const lead = await signedIn('lead');
  await fillAndSend(lead, A.mgrAlex, 'Manager review', 4);
  const mor = await signedIn('mor');
  await fillAndSend(mor, A.p1, 'Peer review', 2);
  let r = await call('/r/results', { personId: P.alex.id, cycleId: C.rev.id }, { token: lead });
  assert.equal(r.status, 200);
  assert.equal(r.json.peers.shown, false); assert.equal(r.json.peers.sent, 1); assert.deepEqual(r.json.peers.questions, []);
  assert.equal(r.json.score.total, 4, 'manager only until 2 peers');
  assert.match(r.json.manager.answers.find(x => x.key === 'comp').text, /Answer comp/, 'manager words are there');
  const dev = await signedIn('dev');
  await fillAndSend(dev, A.p2, 'Peer review', 4);
  r = await call('/r/results', { personId: P.alex.id, cycleId: C.rev.id }, { token: lead });
  assert.equal(r.json.peers.shown, true);
  assert.equal(r.json.peers.questions.find(q => q.key === 'comp').avg, 3);
  assert.equal(r.json.peers.questions.find(q => q.key === 'comp').texts.length, 2);
  assert.equal(r.json.score.peers, 3); assert.equal(r.json.score.total, 0.75 * 4 + 0.25 * 3);
  const s = JSON.stringify(r.json);
  for (const k of ['mor', 'dev']) { assert.ok(!s.includes(P[k].id), 'no peer record id'); assert.ok(!s.includes(P[k].fields.Name), 'no peer name'); }
  assert.ok(!s.includes(A.p1.id) && !s.includes(A.p2.id), 'no peer assignment ids');
  assert.equal(r.json.peers.byWriter, undefined);
  const boss = await signedIn('boss');
  r = await call('/r/results', { personId: P.alex.id, cycleId: C.rev.id }, { token: boss });
  assert.equal(r.json.peers.byWriter.length, 2, 'admins see who wrote what');
  assert.ok(db['Activity log'].some(l => l.fields.What === 'Viewed results' && l.fields.Who[0] === P.boss.id));
});

test("lead can't see people outside their crew", async () => {
  const lead2 = await signedIn('lead2');
  assert.equal((await call('/r/results', { personId: P.alex.id, cycleId: C.rev.id }, { token: lead2 })).status, 404);
  assert.equal((await call('/r/checkin', { personId: P.alex.id, cycleId: C.chk.id }, { token: lead2 })).status, 404);
  assert.equal((await call('/r/checkin/save', { assignmentId: A.chkAlex.id, notes: {} }, { token: lead2 })).status, 404);
  const crew = (await call('/r/crew', {}, { token: lead2 })).json.people;
  assert.deepEqual(crew.map(p => p.id), [P.tay.id]);
  const lead = await signedIn('lead');
  const mine = (await call('/r/crew', {}, { token: lead })).json.people.map(p => p.id).sort();
  assert.deepEqual(mine, [P.alex.id, P.mor.id, P.dev.id, P.sky.id].sort(), 'inactive left out');
});

test('private check-in answer: hidden from the lead, visible to admin; finish makes next steps', async () => {
  const alex = await signedIn('alex');
  await fillAndSend(alex, A.chkAlex, 'Check-in', 4);
  const old = rec('Next steps', { Step: 'Old step', Person: [P.alex.id], 'Employee done': true });
  const lead = await signedIn('lead');
  let r = await call('/r/checkin', { personId: P.alex.id, cycleId: C.chk.id }, { token: lead });
  assert.equal(r.status, 200);
  const lg = r.json.questions.find(q => q.key === 'lgap');
  assert.equal(lg.hidden, true); assert.equal(lg.text, undefined);
  assert.ok(!JSON.stringify(r.json).includes('Answer lgap'));
  assert.equal(r.json.questions.find(q => q.key === 'vibe').score, 4);
  const boss = await signedIn('boss');
  r = await call('/r/checkin', { personId: P.alex.id, cycleId: C.chk.id }, { token: boss });
  assert.match(r.json.questions.find(q => q.key === 'lgap').text, /Answer lgap/);
  // steps: Alex marks done, lead confirms and adds
  r = await call('/r/steps/mark', { stepId: old.id, done: false }, { token: alex }); assert.equal(r.status, 200);
  r = await call('/r/checkin/save', { assignmentId: A.chkAlex.id, notes: { vibe: 'Good chat' }, issues: 'none' }, { token: lead }); assert.equal(r.status, 200);
  r = await call('/r/checkin/finish', { assignmentId: A.chkAlex.id, confirmSteps: [old.id], newSteps: ['Run press 2 solo', ' '] }, { token: lead });
  assert.equal(r.status, 200); assert.equal(r.json.created, 1); assert.equal(r.json.confirmed, 1);
  assert.equal(old.fields['Lead confirmed'], true); assert.ok(A.chkAlex.fields['Met at']);
  const steps = (await call('/r/me', {}, { token: alex })).json.steps;
  assert.deepEqual(steps.map(s => s.step), ['Run press 2 solo']);
  r = await call('/r/checkin/save', { assignmentId: A.chkAlex.id, notes: {} }, { token: lead }); assert.equal(r.status, 409, 'finished check-in is locked for leads');
  const morTok = await signedIn('mor');
  r = await call('/r/steps/mark', { stepId: steps[0].id, done: true }, { token: morTok }); assert.equal(r.status, 404, "not Morgan's step");
});

test('admin link: new code works, old code stops; email puts the link in Email link', async () => {
  const boss = await signedIn('boss');
  const oldCode = CODE.alex;
  let r = await call('/r/admin/link', { personId: P.alex.id, via: 'email' }, { token: boss });
  assert.equal(r.status, 200); assert.match(r.json.url, /^https:\/\/pineprintshop\.github\.io\/reprint-lookup\/reviews\.html#k=[A-Za-z0-9_-]{43}$/);
  assert.equal(P.alex.fields['Email link'], r.json.url); assert.ok(P.alex.fields['Link sent']);
  const newCode = r.json.url.split('#k=')[1];
  assert.equal((await call('/r/hello', { code: oldCode })).status, 401, 'old link dead');
  assert.equal((await call('/r/hello', { code: newCode })).status, 200, 'new link works');
  r = await call('/r/admin/link', { personId: P.mor.id, via: 'email' }, { token: boss }); assert.equal(r.status, 400, 'no email on file');
  r = await call('/r/admin/link', { personId: P.mor.id, via: 'none' }, { token: boss }); assert.equal(r.status, 200);
  assert.equal(P.mor.fields['Email link'], undefined);
  r = await call('/r/admin/people', {}, { token: boss });
  const s = JSON.stringify(r.json);
  assert.ok(!s.includes(P.alex.fields['Link hash']) && !s.includes('Email link') && !s.includes(P.boss.fields['PIN hash']));
});

test('admin assign: validates and skips duplicates; cycle close can expire links', async () => {
  const boss = await signedIn('boss');
  let r = await call('/r/admin/assign', { cycleId: C.rev.id, items: [{ kind: 'Peer review', writer: P.sky.id, about: P.sky.id }] }, { token: boss });
  assert.equal(r.status, 400, 'no self review');
  r = await call('/r/admin/assign', { cycleId: C.rev.id, items: [
    { kind: 'Peer review', writer: P.sky.id, about: P.alex.id }, { kind: 'Peer review', writer: P.mor.id, about: P.alex.id },
    ...Array.from({ length: 12 }, (_, i) => ({ kind: 'Check-in', writer: P.tay.id, about: P.tay.id })) ] }, { token: boss });
  assert.equal(r.status, 200); assert.equal(r.json.created, 2); assert.equal(r.json.skipped, 12);
  r = await call('/r/admin/cycle/close', { cycleId: C.rev.id, expireLinks: true }, { token: boss });
  assert.equal(r.status, 200); assert.equal(C.rev.fields.Status, 'Closed');
  assert.equal(P.alex.fields['Link hash'], undefined); assert.ok(P.boss.fields['Link hash'], 'admins keep their link');
  const lead = await signedIn('lead').catch(() => null);
  assert.equal(lead, null, "lead's link was expired too");
});

test('rate limit on hello/sign-in per IP', async () => {
  let last;
  for (let i = 0; i < 31; i++) last = await call('/r/hello', { code: 'y'.repeat(43) }, { ip: '9.9.9.9' });
  assert.equal(last.status, 429);
  assert.equal((await call('/r/hello', { code: CODE.alex }, { ip: '8.8.8.8' })).status, 200, 'other IPs fine');
});

test('paging: more than 100 people still found', async () => {
  for (let i = 0; i < 150; i++) rec('People', { Name: 'Extra ' + i, Role: 'Employee', Active: true, Lead: [P.lead2.id] });
  const lead2 = await signedIn('lead2');
  const r = await call('/r/crew', {}, { token: lead2 });
  assert.equal(r.json.people.length, 151);
});
