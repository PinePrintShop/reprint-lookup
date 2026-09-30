// ============================================================================
// pine-workers v13 — Mockups route. Two additions to the v12 worker.
//
// STEP 1 — In the router (inside `async fetch`), paste this block directly
//          ABOVE the line `// Default: S&S passthrough (unchanged from v2)`:
//
//    if (firstSegment === 'mockups') {
//      // /proxy/mockups?o=recXXXXXXXXXXXXXX → order mockups, sizes, locations (v13)
//      return handleMockups(request, env, url.searchParams);
//    }
//
// STEP 2 — Paste everything below the "PASTE FROM HERE" line at the very
//          BOTTOM of the file (after function jsonError).
//
// No new secrets: reuses AIRTABLE_TOKEN (read-only PAT on appJkaLk8DykjsgHR).
// Smoke test after deploy:
//   https://pine-workers.stephen-dab.workers.dev/proxy/mockups?o=<Orders record ID>
// ============================================================================

// ----- PASTE FROM HERE -----

// ─────────────────────────────────────────────────────────────────────────────
// Mockups: one order's line items with mockups, sizes and print location. (v13)
//
// ROUTE:   GET /proxy/mockups?o=recXXXXXXXXXXXXXX   (Orders record ID)
// USED BY: mockups.html on GitHub Pages, opened from the receiving-label QR.
// WHY:     anyone on the floor can scan a box and see the designs without an
//          Airtable login. The Airtable token stays here, read-only.
// KEY:     the Orders RECORD ID, not the order number, so nobody can walk
//          10893 → 10894 and browse other customers' designs.
// RETURNS: {ok, order, customer, items:[{garment, imprints, location, total,
//          sizes:[{size, qty}], mockups:[{name, type, image, full}]}]}
//          qty = ordered + extras (what physically arrives for that line).
//          image/full are Airtable attachment URLs; they expire after a few
//          hours, which is why the page asks this route on every open.
// CACHE:   module-level Map, 5 min, well inside the attachment URL lifetime.
// ─────────────────────────────────────────────────────────────────────────────
const MK_BASE   = 'appJkaLk8DykjsgHR';
const MK_ORDERS = 'tbl8Tf0AeS9gnHOOS';
const MK_LINES  = 'tblJx5UlwO7oMSk5H';

const MK_O = {
  orderNum: 'fld4S3B5yJANKlE7l', // Invoice / Order Number (formula)
  customer: 'fldoRraeYHsgfeWhj', // [TEXT] Customer Name
  lines:    'fldU6fgrz6sU3wyIZ', // Line Items (links)
};

const MK_L = {
  garment:   'fldKhz9uZgXwfeIto', // "" & {Garment Type} → Manufacturer + product - colorway
  imprints:  'fldmGRcdXyvheWjmv', // Imprint IDs
  location:  'fldOUb7DhzLBv2fC6', // Print Location Rollup
  locActual: 'fldxeFKe9GI4txtHD', // Actual Print Location (fallback)
  total:     'fldFfuKAcduwWQp8g', // Total Quantity
  proofs:    'flddhvdkKI31tFTdX', // Proof Images (PDF mockups)
};

// [size, ordered field, extras field]. Same fields the Receiving app reads.
const MK_SIZES = [
  ['XS',   'fldVA9ZmYxhDxtnYZ', 'fldKcVhxgaclD1csp'],
  ['S',    'fldCZr5lB6Jx80lfG', 'fldgf19Xi1VDqro4Q'],
  ['M',    'fldzTs1qKe9IBxxSn', 'fldWxiQEIFsqwxFW1'],
  ['L',    'fldnRLJxjUDa1mQTj', 'fldclPpJQpcXuT4Wn'],
  ['XL',   'fldTRgdexcpBXXQPv', 'fldWjibddJoIC1JGu'],
  ['2XL',  'fldin7j6uGO0uRTec', 'fldgd2JZCSS3YBYX2'],
  ['3XL',  'fldpltq9fdRkrvIvt', 'fldbht14x4cRBPRVL'],
  ['4XL',  'fldrsci7JnToa43Zd', 'fldLyB756Va085UDj'],
  ['5XL',  'fldchnRSKFukouW6N', 'fldHZ0WmjhzF34noZ'],
  ['6XL',  'fldI8gTtsEJwg33BI', null],
  ['OSFA', 'fld2bgIlmPbANgLVK', 'fldKS4Jk6aZvxR4Nn'],
];

const MK_CACHE_MS = 5 * 60 * 1000;
const mockupCache = new Map(); // orderRecId -> { at, body }
const MK_REC_RE = /^rec[A-Za-z0-9]{14}$/;

async function handleMockups(request, env, params) {
  if (request.method !== 'GET') {
    return jsonError('Mockups is GET only', 405);
  }
  if (!env.AIRTABLE_TOKEN) {
    return jsonError('AIRTABLE_TOKEN secret is not set on the worker', 500);
  }
  const orderId = (params.get('o') || '').trim();
  if (!MK_REC_RE.test(orderId)) {
    return jsonError('Missing or invalid order link. Scan the QR on the label again.', 400);
  }

  const hit = mockupCache.get(orderId);
  if (hit && (Date.now() - hit.at) < MK_CACHE_MS) {
    return jsonOk({ ...hit.body, cached: true });
  }

  const headers = { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` };
  const api = `https://api.airtable.com/v0/${MK_BASE}`;

  // 1. The order itself.
  let order;
  try {
    const r = await fetch(`${api}/${MK_ORDERS}/${orderId}?returnFieldsByFieldId=true`, { headers });
    if (r.status === 404) return jsonError('Order not found', 404);
    if (!r.ok) {
      console.log(`[pine-mockups] order ${orderId} → Airtable ${r.status}`);
      return jsonError(`Airtable returned ${r.status}`, 502);
    }
    order = await r.json();
  } catch (e) {
    return jsonError(`Failed to reach Airtable: ${e.message}`, 502);
  }
  const of = order.fields || {};
  const lineIds = (of[MK_O.lines] || [])
    .map(x => (typeof x === 'string' ? x : x && x.id))
    .filter(id => MK_REC_RE.test(id || ''));

  // 2. Its line items, 40 per request to keep the formula URL short.
  const fieldIds = [
    MK_L.garment, MK_L.imprints, MK_L.location, MK_L.locActual, MK_L.total, MK_L.proofs,
  ];
  MK_SIZES.forEach(([, o, e]) => { fieldIds.push(o); if (e) fieldIds.push(e); });
  const fieldParams = fieldIds.map(f => 'fields%5B%5D=' + f).join('&');

  const byId = {};
  try {
    for (let i = 0; i < lineIds.length; i += 40) {
      const chunk = lineIds.slice(i, i + 40);
      const formula = 'OR(' + chunk.map(id => `RECORD_ID()='${id}'`).join(',') + ')';
      const r = await fetch(
        `${api}/${MK_LINES}?returnFieldsByFieldId=true&pageSize=100&${fieldParams}` +
        `&filterByFormula=${encodeURIComponent(formula)}`,
        { headers }
      );
      if (!r.ok) {
        const detail = await r.text();
        console.log(`[pine-mockups] lines → Airtable ${r.status}: ${detail.slice(0, 200)}`);
        return jsonError(`Airtable returned ${r.status}`, 502);
      }
      const j = await r.json();
      (j.records || []).forEach(rec => { byId[rec.id] = rec.fields || {}; });
    }
  } catch (e) {
    return jsonError(`Failed to reach Airtable: ${e.message}`, 502);
  }

  // Keep the order's own line-item order.
  const items = lineIds.filter(id => byId[id]).map(id => {
    const f = byId[id];
    const sizes = [];
    MK_SIZES.forEach(([size, o, e]) => {
      const q = mkNum(f[o]) + (e ? mkNum(f[e]) : 0);
      if (q > 0) sizes.push({ size, qty: q });
    });
    const sizeTotal = sizes.reduce((a, s) => a + s.qty, 0);
    const mockups = (Array.isArray(f[MK_L.proofs]) ? f[MK_L.proofs] : []).map(a => {
      const large = a.thumbnails && a.thumbnails.large;
      const isImage = /^image\//.test(a.type || '');
      return {
        name: a.filename || 'Mockup',
        type: a.type || '',
        image: (large && large.url) || (isImage ? a.url : ''),
        full: a.url || '',
      };
    });
    return {
      garment: mkText(f[MK_L.garment]) || 'Garment',
      imprints: mkList(f[MK_L.imprints]),
      location: mkText(f[MK_L.location]) || mkText(f[MK_L.locActual]),
      total: sizeTotal || mkNum(f[MK_L.total]),
      sizes,
      mockups,
    };
  });

  const body = {
    ok: true,
    order: mkText(of[MK_O.orderNum]),
    customer: mkText(of[MK_O.customer]),
    count: items.length,
    cached: false,
    items,
  };
  console.log(`[pine-mockups] ${orderId} order=${body.order} items=${items.length}`);
  mockupCache.set(orderId, { at: Date.now(), body });
  return jsonOk(body);
}

// Airtable returns lookups/rollups as arrays, selects as {name}, formulas as
// strings or numbers. Flatten all of them to plain text.
function mkList(v) {
  if (v === null || v === undefined || v === '') return [];
  if (Array.isArray(v)) {
    return v.flatMap(mkList);
  }
  if (typeof v === 'object') {
    return v.name ? [String(v.name)] : [];
  }
  return String(v).split(',').map(s => s.trim()).filter(Boolean);
}
function mkText(v) {
  return [...new Set(mkList(v))].join(', ');
}
function mkNum(v) {
  if (Array.isArray(v)) v = v[0];
  const n = Number(v);
  return isFinite(n) ? n : 0;
}
