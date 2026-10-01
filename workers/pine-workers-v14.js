/**
 * Pine Central - Vendor Proxy v14
 *
 * v14 CHANGE: read-only vendor routes. The proxy used to forward ANY method and path
 *   to S&S / AS Colour with Pine's credentials, so anyone with the URL could place
 *   orders or read account data. Now:
 *     - S&S:       GET/HEAD only, and only catalog paths (styles, products, inventory,
 *                  categories, brands, specs). orders/invoices/returns/etc. -> 403.
 *     - AS Colour: GET only, catalog/ and inventory/ paths only.
 *     - SanMar:    GET only (pricing / productinfo / inventory were already read-only).
 *     - SLC:       POST only to productdata / inventory / pricing (lookup SOAP calls);
 *                  a bad body now returns a JSON 400 instead of an uncaught 500.
 *   ShipStation, leadtime and mockups are unchanged (ShipStation gets caller auth next).
 *
 * v13 CHANGE: Mockups route for the receiving-label QR. First route that serves
 *   staff who have NO Airtable login: the QR opens mockups.html on GitHub Pages,
 *   which asks this route for the order's designs.
 *   - ROUTE: GET /proxy/mockups?o=recXXXXXXXXXXXXXX  (Orders RECORD ID)
 *   - KEY: the record ID, not the order number, so nobody can walk
 *     10893 -> 10894 and browse other customers' designs.
 *   - AUTH: AIRTABLE_TOKEN (same read-only PAT as /leadtime). No new secrets.
 *   - RETURNS: {ok, order, customer, count, cached, items:[{garment, imprints,
 *     location, total, sizes:[{size, qty}], mockups:[{name, type, image, full}]}]}
 *     qty = ordered + extras (what physically arrives for that line).
 *     image/full are Airtable attachment URLs. They expire after a few hours,
 *     which is why the page calls this route on every open instead of the QR
 *     holding image links.
 *   - CACHE: module-level Map, 5 min (well inside the attachment URL lifetime).
 *
 * v12 CHANGE: SanMar product info + inventory added (for Price-O-Matic colors,
 *   photos and stock). Both STREAM SanMar's XML straight through, like SLC -
 *   the browser parses with DOMParser. Deliberate: a full-style product info
 *   response (PC54 = 738 rows with long descriptions) is multiple MB, and
 *   parsing that in the worker risks the CPU limit and the buffering trap.
 *   - GET /proxy/sanmar/productinfo?style=PC54[&color=][&size=]
 *       -> getProductInfoByStyleColorSize (SanMarProductInfoServicePort)
 *       Per SKU: full color name, catalog (mainframe) color, images, status.
 *       Note SanMar spells the error flag "errorOccured" in this response.
 *   - GET /proxy/sanmar/inventory?style=PC54[&color=][&size=]
 *       -> getInventoryQtyForStyleColorSize (SanMarWebServicePort)
 *       Per SKU per warehouse qty (max 3000 shown per warehouse). Color here
 *       is the CATALOG color, not the full name.
 *   - /proxy/sanmar/pricing unchanged (still parsed to JSON in the worker).
 *
 * v11 CHANGE: SanMar added (Web Services, SanMar standard getPricing).
 *   - ROUTE: GET /proxy/sanmar/pricing?style=PC54[&color=][&size=]
 *            [&nocache=1] bypass cache  [&raw=1] SanMar XML untouched (smoke tests)
 *   - AUTH: customer number + sanmar.com username/password in the SOAP body
 *     (arg1). SANMAR_PASS is the sanmar.com password, NOT the FTP password.
 *   - RETURNS: {ok:true, style, count, cached, items:[{style, color, size,
 *     inventoryKey, sizeIndex, myPrice, piecePrice, casePrice, incentivePrice,
 *     salePrice, saleStartDate, saleEndDate}]}. myPrice = Pine's customer-specific
 *     cost; quote against it. salePrice expires (SanMar updates sales Mon + Wed).
 *   - PARSE: worker returns JSON, unlike SLC which streams XML to the browser.
 *     Workers have no DOMParser; getPricing's response is flat scalar tags inside
 *     <listResponse> blocks, so tag extraction is safe. Do NOT reuse that parser
 *     for nested PromoStandards responses.
 *   - BUFFERS the upstream body (one style's SKUs, small). Deliberate exception
 *     to the stream-through rule. Never copy this to bulk calls (CF 1101).
 *   - CACHE: module-level Map, 12h TTL, same reason as leadTimeCache.
 *   - UPSTREAM PORT 8080. SLC on :444 works from this worker, so a non-standard
 *     port should too; first smoke test confirms.
 *   - SANMAR_ENV = "edev" (plain variable, optional) points at SanMar's test
 *     environment, which has its own credentials.
 *   - Source: SanMar Web Services Integration Guide v24.6, pp. 66-69.
 *
 * v10 CHANGE: Lead-time endpoint added. First non-vendor route on this worker.
 *   - ROUTE: GET /proxy/leadtime -> Airtable Orders, returns computed medians
 *   - AUTH: AIRTABLE_TOKEN secret (read-only PAT). The point of putting this
 *     on the worker is that sales' browsers never hold an Airtable token.
 *   - RETURNS: {inFlight:{median,p75,n}, completed:{median,p75,n}, asOf, windowDays}
 *     Either block is null when its sample is under MIN_SAMPLE. Consumers must
 *     fail closed - a stale lead-time number is worse than none, because sales
 *     keeps quoting from it.
 *   - CACHE: module-level variable, 12h TTL. NOT the Cache API - caches.default
 *     is a no-op on workers.dev subdomains, so cache.put/match would silently
 *     do nothing and every POM page load would hit Airtable. Same instance-level
 *     pattern as asTokenCache; cold starts recompute.
 *   - Signature change: fetch(request, env) -> fetch(request, env, ctx). Nothing
 *     else uses ctx today; it's there for future waitUntil work.
 *   - Consumed by price-o-matic-v78.html (topbar turnaround chip).
 *
 * v9 CHANGE: ShipStation V1 added alongside S&S, AS Colour, and SLC.
 *   - ROUTE: POST/GET /proxy/shipstation/<v1-path> -> ssapi.shipstation.com
 *   - AUTH: HTTP Basic, base64(SHIPSTATION_KEY:SHIPSTATION_SECRET). NOTE the
 *     distinct secret names - do NOT reuse the SS_ prefix (that's S&S).
 *   - BODY: small JSON for rates/labels/void; buffered via arrayBuffer (same
 *     approach as the AS Colour handler) so POSTs proxy cleanly. Streamed
 *     through on the response side like every other vendor.
 *   - Used by pine-shipping-v1.html: order lookup (GET /orders?orderNumber=),
 *     rates (POST /shipments/getrates), buy (POST /orders/createlabelfororder),
 *     void (POST /shipments/voidlabel).
 *
 * v8 CHANGE: SLC support provided canonical envelopes - mirror them exactly.
 *   - PRICING: Reverted alphabroder canonical shape (from v6). SLC's working
 *     envelope uses the SAME shape as productdata: default xmlns on operation
 *     element, <shar:> prefixed children. Localization fields are PRESENT
 *     (we were wrong in v5 to strip them - the real culprit was missing
 *     configurationType, not localization). Added <shar:configurationType>
 *     as a required field. Element order matches SLC's sample exactly:
 *     wsVersion / id / password / productId / currency / fobId / priceType /
 *     localizationCountry / localizationLanguage / configurationType.
 *   - GETPRODUCTSELLABLE: Restored <shar:> prefix on all filter children
 *     (v7 was wrong to strip it - SLC's sample uses shar: throughout).
 *     Element order matches SLC's sample: wsVersion / id / password /
 *     localization / productId / lineName / isSellable.
 *   - Process learning: PromoStandards "Unexpected subelement" faults can
 *     mean "required element BEFORE this is missing" not "this element is
 *     in the wrong namespace." When a fault names an element, try ADDING
 *     elements before it (matching supplier's sample exactly), not removing
 *     or renamespacing.
 *
 * v7 CHANGE (REVERTED in v8): getProductSellable namespace fix - turned
 *   out SLC's parser accepts <shar:> prefix; v7 was a misdiagnosis.
 *
 * v6 CHANGE (PARTIALLY REVERTED in v8): pricing alphabroder canonical shape -
 *   not needed; SLC uses the same default-xmlns shape as productdata.
 *
 * v5 CHANGE (REVERTED in v8): pricing localization removed - was wrong, SLC
 *   requires localization fields. The real fix is adding configurationType.
 *
 * v4 CHANGE: SLC Activewear added alongside S&S and AS Colour.
 *
 * v3 CHANGE: AS Colour added alongside S&S.
 *
 * v2 CHANGE: stream S&S's response body straight through to the browser
 *   instead of reading it into worker memory first. Large product responses
 *   (e.g. Comfort Colors 1717 with 500+ SKU rows) were crashing the worker
 *   on `await ssResponse.text()` - Cloudflare Error 1101.
 *
 * SLC ROUTING:
 *   POST /proxy/slc/productdata    -> ProductDataService            (v 2.0.0)
 *   POST /proxy/slc/inventory      -> InventoryServiceV2            (v 2.0.0)
 *   POST /proxy/slc/pricing        -> PricingAndConfigurationService (v 1.0.0)
 *
 * SLC PROTOCOL:
 *   Client sends JSON. Worker translates to SOAP 1.1 XML server-side.
 *   This keeps creds out of the browser and isolates SOAP knowledge to the worker.
 *
 *   Client request body (JSON):
 *     {
 *       "operation": "getProduct" | "getProductSellable" | "getInventoryLevels" | "getConfigurationAndPricing",
 *       "productId": "31225",
 *       "partId":    "31225003",       // optional
 *       "lineName":  "Dri Duck",       // optional, getProductSellable only
 *       "isSellable": true,            // optional, getProductSellable only
 *       "currency":  "USD",            // pricing only (default USD)
 *       "fobId":     "1",              // pricing only (default 1)
 *       "priceType": "Customer"        // pricing only (default Customer)
 *     }
 *
 *   Worker emits SOAP envelope with:
 *     - service-specific xmlns + xmlns:shar (each service has its OWN namespace URI)
 *     - <shar:wsVersion> matching the service version
 *     - <shar:id> + <shar:password> from secrets (NEVER in client request)
 *     - <shar:localizationCountry>US</shar:localizationCountry>  (where applicable)
 *     - <shar:localizationLanguage>en</shar:localizationLanguage>
 *     - operation-specific child nodes
 *
 *   POSTed to the right service URL with:
 *     - Content-Type: text/xml; charset=utf-8
 *     - SOAPAction: "<operation>"
 *
 *   Response is XML, streamed through unchanged. Client parses with DOMParser.
 *
 * SLC AUTH:
 *   Credentials live in the SOAP body on every request. No session, no token cache.
 *   Worker injects SLC_USER / SLC_PASS into <shar:id>/<shar:password> at envelope build time.
 *
 * REQUIRED SECRETS (Cloudflare Dashboard -> pine-workers -> Settings -> Variables and Secrets):
 *   SS_ACCOUNT             - Pine's S&S account number
 *   SS_API_KEY             - Pine's S&S API key
 *   AS_SUBSCRIPTION_KEY    - Pine's AS Colour API subscription key
 *   AS_EMAIL               - Pine's AS Colour account email
 *   AS_PASSWORD            - Pine's AS Colour account password
 *   SLC_USER               - Pine's SLC PromoStandards user id      (v4)
 *   SLC_PASS               - Pine's SLC PromoStandards password     (v4)
 *   SHIPSTATION_KEY        - Pine's ShipStation V1 API key          (v9)
 *   SHIPSTATION_SECRET     - Pine's ShipStation V1 API secret       (v9)
 *   AIRTABLE_TOKEN         - Airtable PAT, data.records:read on
 *                            appJkaLk8DykjsgHR                      (v10)
 *   SANMAR_CUSTOMER        - Pine's SanMar customer number          (NEW in v11)
 *   SANMAR_USER            - sanmar.com username                    (NEW in v11)
 *   SANMAR_PASS            - sanmar.com password (not FTP password) (NEW in v11)
 *   SANMAR_ENV             - optional plain variable; "edev" = test (NEW in v11)
 *   (v12 adds no secrets - product info + inventory reuse the SANMAR_* set)
 *   (v13 adds no secrets - mockups reuse AIRTABLE_TOKEN)
 *
 * DEPLOY:
 *   dash.cloudflare.com -> Workers & Pages -> pine-workers -> Edit Code
 *   Paste this entire file. Save and Deploy.
 */

const SS_BASE = 'https://api.ssactivewear.com/v2';
const AS_BASE = 'https://api.ascolour.com/v1';
const AS_AUTH_PATH = '/api/authentication';
const SLC_BASE = 'https://connect.slcactivewear.com:444/promostandard/services';
const SHIPSTATION_BASE = 'https://ssapi.shipstation.com';

// SanMar (NEW in v11)
const SANMAR_HOSTS = {
  prod: 'https://ws.sanmar.com:8080',
  edev: 'https://edev-ws.sanmar.com:8080',
};
const SANMAR_PRICING_PATH = '/SanMarWebService/SanMarPricingServicePort';
const SANMAR_CACHE_MS = 12 * 60 * 60 * 1000;
const SANMAR_TIMEOUT_MS = 20000;
const SANMAR_ITEM_FIELDS = [
  'style', 'color', 'size', 'inventoryKey', 'sizeIndex',
  'myPrice', 'piecePrice', 'casePrice', 'incentivePrice',
  'salePrice', 'saleStartDate', 'saleEndDate',
];
const SANMAR_NUMERIC = { myPrice: 1, piecePrice: 1, casePrice: 1, incentivePrice: 1, salePrice: 1 };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Worker-instance-level token cache. Persists between requests within the same
// instance. Cold starts re-auth on first AS Colour call; that's fine for our
// usage volume (single-digit calls per hour). For higher volume, swap to KV.
let asTokenCache = null;

// Same instance-level pattern for the lead-time payload. See LT_CACHE_MS.
let leadTimeCache = { at: 0, body: null };

// Same instance-level pattern for SanMar pricing, keyed per style/color/size. (v11)
const sanmarCache = new Map(); // key -> { at, body }

// SLC service registry. Each service has its OWN namespace URI and version.
// shared = the .../SharedObjects/ NS used for shar: prefixed elements.
// root   = the operation's default namespace (same URI minus /SharedObjects/).
const SLC_SERVICES = {
  productdata: {
    path: 'ProductDataService',
    wsVersion: '2.0.0',
    shared: 'http://www.promostandards.org/WSDL/ProductDataService/2.0.0/SharedObjects/',
    root:   'http://www.promostandards.org/WSDL/ProductDataService/2.0.0/',
  },
  inventory: {
    path: 'InventoryServiceV2',
    wsVersion: '2.0.0',
    shared: 'http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/',
    root:   'http://www.promostandards.org/WSDL/Inventory/2.0.0/',
  },
  pricing: {
    path: 'PricingAndConfigurationService',
    wsVersion: '1.0.0',
    shared: 'http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/SharedObjects/',
    root:   'http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/',
  },
};

// Operation registry. Maps operation -> which service it lives on + the request element name.
// requestElement is the outer XML element name the docs show, e.g. <GetProductRequest>.
const SLC_OPERATIONS = {
  getProduct:                  { service: 'productdata', requestElement: 'GetProductRequest' },
  getProductSellable:          { service: 'productdata', requestElement: 'GetProductSellableRequest' },
  getInventoryLevels:          { service: 'inventory',   requestElement: 'GetInventoryLevelsRequest' },
  getConfigurationAndPricing:  { service: 'pricing',     requestElement: 'GetConfigurationAndPricingRequest' },
};

// -----------------------------------------------------------------------------
// Lead-time config (NEW in v10)
//
// SEMANTICS - read before changing anything.
//
// Workday counts here are INCLUSIVE, matching Airtable's WORKDAY_DIFF
// (same day = 1, not 0). Deliberate: the Orders turnaround formula
// fldgqHgqks65JXTid uses WORKDAY_DIFF, so this endpoint agrees with any
// Airtable view or Interface showing the same thing. Switch to true elapsed
// days and every surface reading turnaround shifts by one.
//
// inFlight  = live orders (no completion date) with a payment date and a
//             scheduled print date, measured payment -> last scheduled print,
//             plus LT_PRINT_TO_DONE for the finishing/ship tail.
//             Forward-looking, but it only covers orders ALREADY SCHEDULED,
//             so a job quoted today enters behind them. It is a floor, not a
//             forecast, and consumer copy must say so.
//
// completed = trailing window of finished orders, payment -> completion.
//             Sanity check. If the two diverge by more than ~2 days, the
//             divergence is itself the signal worth looking at.
//
// Measured 9/17/26: completed median 17 workdays, in-flight 15-16. Turnaround
// ran 8 -> 17 between April and September 2026, which is why this is computed
// live rather than hardcoded - anything baked in goes stale within two months,
// and stale in the direction that makes sales promise dates the shop can't hit.
// -----------------------------------------------------------------------------
const LT_BASE   = 'appJkaLk8DykjsgHR';
const LT_ORDERS = 'tbl8Tf0AeS9gnHOOS';

const LT_F = {
  payment:   'fld5RAeEEGMltdES0', // Payment Received  (dateTime)
  lastPrint: 'fld2TdBbnTrGmlIsy', // MAX scheduled start across imprints (dateTime)
  completed: 'fldaqChiFnKJ5HN1N', // completion date   (date)
  status:    'fldhS4z28CdGmS1j5', // Order Status      (singleSelect)
};

const LT_WINDOW_DAYS   = 60;      // trailing window for the completed median
const LT_STALE_BACK    = 14;      // drop live orders whose print date is >14d past (zombies)
const LT_HORIZON_DAYS  = 120;     // drop live orders scheduled absurdly far out (seasonal pre-books)
const LT_MIN_SAMPLE    = 15;      // under this, return null rather than a number
const LT_PRINT_TO_DONE = 1;       // observed tail, last print -> completion (stable ~1 workday)
const LT_CACHE_MS      = 12 * 60 * 60 * 1000;

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const pathRaw = url.pathname.replace(/^\/proxy\/?/, '');

    if (!pathRaw) {
      return jsonError('Missing path. Try /proxy/products/?style=3001', 400);
    }

    const segments = pathRaw.split('/');
    const firstSegment = segments[0];

    // v14: vendor routes are lookups only (see header). Decide before routing.
    const denied = vendorGuard(request.method, firstSegment, segments);
    if (denied) return jsonError(denied, 403);

    // Route by first segment
    if (firstSegment === 'ascolour') {
      // Strip the 'ascolour/' prefix; remainder + query goes to AS Colour
      const asPath = segments.slice(1).join('/');
      return handleAscolour(request, env, asPath, url.search);
    }

    if (firstSegment === 'slc') {
      // /proxy/slc/<service>  - service is one of: productdata, inventory, pricing
      const service = segments[1] || '';
      return handleSlc(request, env, service);
    }

    if (firstSegment === 'shipstation') {
      // /proxy/shipstation/<v1-path>  -> ShipStation V1 API (Basic auth)
      const ssPath = segments.slice(1).join('/');
      return handleShipstation(request, env, ssPath, url.search);
    }

    if (firstSegment === 'leadtime') {
      // /proxy/leadtime -> computed turnaround medians from Airtable (v10)
      return handleLeadtime(request, env);
    }

    if (firstSegment === 'sanmar') {
      // /proxy/sanmar/<service> -> SanMar Web Services, JSON out (v11)
      const service = (segments[1] || '').toLowerCase();
      return handleSanmar(request, env, service, url.searchParams);
    }

    if (firstSegment === 'mockups') {
      // /proxy/mockups?o=recXXXXXXXXXXXXXX -> order mockups, sizes, locations (v13)
      return handleMockups(request, env, url.searchParams);
    }

    // Default: S&S passthrough (unchanged from v2)
    return handleSS(request, env, pathRaw, url.search);
  },
};

// -----------------------------------------------------------------------------
// v14: read-only guard for vendor routes. Returns an error message, or null if allowed.
// -----------------------------------------------------------------------------
const SS_READ_PATHS = ['styles', 'products', 'inventory', 'categories', 'brands', 'specs'];
const AS_READ_PATHS = ['catalog', 'inventory'];
const SLC_READ_SERVICES = ['productdata', 'inventory', 'pricing'];

function vendorGuard(method, first, segments) {
  const m = (method || 'GET').toUpperCase();
  const isRead = m === 'GET' || m === 'HEAD';
  if (first === 'shipstation' || first === 'leadtime' || first === 'mockups') return null;  // unchanged in v14
  if (first === 'ascolour') {
    if (!isRead) return 'AS Colour proxy is read-only';
    if (!AS_READ_PATHS.includes((segments[1] || '').toLowerCase())) return 'AS Colour path not allowed: ' + (segments[1] || '(none)');
    return null;
  }
  if (first === 'sanmar') return isRead ? null : 'SanMar proxy is read-only';
  if (first === 'slc') {
    if (m !== 'POST') return 'SLC proxy accepts POST lookups only';
    if (!SLC_READ_SERVICES.includes((segments[1] || '').toLowerCase())) return 'SLC service not allowed: ' + (segments[1] || '(none)');
    return null;
  }
  // default route = S&S
  if (!isRead) return 'S&S proxy is read-only';
  if (!SS_READ_PATHS.includes((first || '').toLowerCase())) return 'S&S path not allowed: ' + (first || '(none)');
  return null;
}

// -----------------------------------------------------------------------------
// S&S passthrough - identical to v3 behavior
// -----------------------------------------------------------------------------
async function handleSS(request, env, path, query) {
  const ssUrl = `${SS_BASE}/${path}${query}`;
  const auth = 'Basic ' + btoa(`${env.SS_ACCOUNT}:${env.SS_API_KEY}`);

  const headers = {
    'Authorization': auth,
    'Accept': 'application/json',
  };

  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
    body = request.body;
  }

  let ssResponse;
  try {
    ssResponse = await fetch(ssUrl, {
      method: request.method,
      headers,
      body,
    });
  } catch (e) {
    return jsonError(`Failed to reach S&S: ${e.message}`, 502);
  }

  console.log(`[pine-ss] ${request.method} ${ssUrl} -> ${ssResponse.status}`);

  return streamThrough(ssResponse);
}

// -----------------------------------------------------------------------------
// ShipStation: V1 REST passthrough, HTTP Basic auth (key:secret). (NEW in v9)
// Mirrors the S&S passthrough shape: GET for order lookup, POST for
// rates / labels / void. Body buffered via arrayBuffer (same as AS Colour)
// since the money-path calls are JSON POSTs. Response streamed through.
// -----------------------------------------------------------------------------
async function handleShipstation(request, env, path, query) {
  if (!path) {
    return jsonError('Missing ShipStation path. Try /proxy/shipstation/orders?orderNumber=9921', 400);
  }
  if (!env.SHIPSTATION_KEY || !env.SHIPSTATION_SECRET) {
    return jsonError('SHIPSTATION_KEY and SHIPSTATION_SECRET secrets are not set on the worker', 500);
  }

  const ssUrl = `${SHIPSTATION_BASE}/${path}${query}`;
  const auth = 'Basic ' + btoa(`${env.SHIPSTATION_KEY}:${env.SHIPSTATION_SECRET}`);

  const headers = {
    'Authorization': auth,
    'Accept': 'application/json',
  };

  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.arrayBuffer();
    } catch (e) {
      return jsonError(`Could not read request body: ${e.message}`, 400);
    }
    headers['Content-Type'] = 'application/json';
  }

  let resp;
  try {
    resp = await fetch(ssUrl, { method: request.method, headers, body });
  } catch (e) {
    return jsonError(`Failed to reach ShipStation: ${e.message}`, 502);
  }

  console.log(`[pine-shipstation] ${request.method} ${ssUrl} -> ${resp.status}`);

  return streamThrough(resp);
}

// -----------------------------------------------------------------------------
// Lead time: Airtable Orders -> turnaround medians in workdays. (NEW in v10)
//
// The only route here that talks to Airtable rather than a vendor, and the
// only one that computes rather than proxies. Both are deliberate: the point
// is that the Airtable token stays server-side and the browser gets four
// numbers instead of 400 records.
// -----------------------------------------------------------------------------
async function handleLeadtime(request, env) {
  if (request.method !== 'GET') {
    return jsonError('Lead time is GET only', 405);
  }
  if (!env.AIRTABLE_TOKEN) {
    return jsonError('AIRTABLE_TOKEN secret is not set on the worker', 500);
  }

  // Instance-level cache. NOT the Cache API - caches.default is a no-op on
  // workers.dev subdomains, so cache.put/match would silently do nothing.
  const now = Date.now();
  if (leadTimeCache.body && (now - leadTimeCache.at) < LT_CACHE_MS) {
    console.log('[pine-leadtime] cache hit');
    return jsonOk(leadTimeCache.body);
  }

  const today = new Date();
  const shift = (d) => {
    const x = new Date(today);
    x.setUTCDate(x.getUTCDate() + d);
    return x.toISOString().slice(0, 10);
  };
  const dp = (iso) => `DATETIME_PARSE("${iso}","YYYY-MM-DD")`;

  // Live, scheduled, not cancelled, print date in a sane band around today.
  const fLive =
    `AND({${LT_F.completed}}=BLANK(),` +
    `{${LT_F.payment}}!=BLANK(),` +
    `{${LT_F.lastPrint}}!=BLANK(),` +
    `{${LT_F.status}}!="Cancelled / Voided",` +
    `IS_AFTER({${LT_F.lastPrint}},${dp(shift(-LT_STALE_BACK))}),` +
    `IS_BEFORE({${LT_F.lastPrint}},${dp(shift(LT_HORIZON_DAYS))}))`;

  // Completed inside the trailing window.
  const fDone =
    `AND({${LT_F.completed}}!=BLANK(),` +
    `{${LT_F.payment}}!=BLANK(),` +
    `{${LT_F.status}}!="Cancelled / Voided",` +
    `IS_AFTER({${LT_F.completed}},${dp(shift(-LT_WINDOW_DAYS))}))`;

  let liveRecs, doneRecs;
  try {
    [liveRecs, doneRecs] = await Promise.all([
      ltFetchAll(env, fLive),
      ltFetchAll(env, fDone),
    ]);
  } catch (e) {
    return jsonError(`Failed to reach Airtable: ${e.message}`, 502);
  }

  const body = {
    inFlight: ltSummarize(
      liveRecs.map(r => ltWorkdayDiff(r.fields[LT_F.payment], r.fields[LT_F.lastPrint])),
      true
    ),
    completed: ltSummarize(
      doneRecs.map(r => ltWorkdayDiff(r.fields[LT_F.payment], r.fields[LT_F.completed])),
      false
    ),
    asOf: today.toISOString().slice(0, 10),
    windowDays: LT_WINDOW_DAYS,
  };

  console.log(
    `[pine-leadtime] live=${liveRecs.length} done=${doneRecs.length} ` +
    `inFlight=${body.inFlight ? body.inFlight.median : 'null'} ` +
    `completed=${body.completed ? body.completed.median : 'null'}`
  );

  // Only cache a usable answer, so a transient Airtable failure doesn't pin
  // an empty payload in memory for twelve hours.
  if (body.inFlight || body.completed) {
    leadTimeCache = { at: now, body };
  }

  return jsonOk(body);
}

// Airtable v0 list with pagination. Field IDs are used in filterByFormula -
// Airtable's formula parser resolves them, and it avoids quoting field names
// containing slashes and spaces. If this ever 422s, swap to field names.
async function ltFetchAll(env, filterFormula) {
  const fieldParams = Object.values(LT_F).map(f => 'fields%5B%5D=' + f).join('&');
  let out = [];
  let offset = null;
  let guard = 0;

  do {
    const url = `https://api.airtable.com/v0/${LT_BASE}/${LT_ORDERS}` +
      `?returnFieldsByFieldId=true&pageSize=100&${fieldParams}` +
      `&filterByFormula=${encodeURIComponent(filterFormula)}` +
      (offset ? `&offset=${offset}` : '');

    const r = await fetch(url, {
      headers: { 'Authorization': `Bearer ${env.AIRTABLE_TOKEN}` },
    });

    if (!r.ok) {
      const detail = await r.text();
      console.log(`[pine-leadtime] Airtable ${r.status}: ${detail.slice(0, 200)}`);
      return out;
    }

    const j = await r.json();
    out = out.concat(j.records || []);
    offset = j.offset || null;
  } while (offset && ++guard < 40);

  return out;
}

// Inclusive business-day count, matching Airtable WORKDAY_DIFF.
// Same day -> 1. Backwards -> negative.
function ltWorkdayDiff(from, to) {
  if (!from || !to) return null;
  const a = new Date(from);
  const b = new Date(to);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
  a.setUTCHours(0, 0, 0, 0);
  b.setUTCHours(0, 0, 0, 0);

  const sign = b < a ? -1 : 1;
  const cursor = new Date(sign === 1 ? a : b);
  const end = sign === 1 ? b : a;

  let n = 0;
  while (cursor <= end) {
    const d = cursor.getUTCDay();
    if (d !== 0 && d !== 6) n++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return sign * n;
}

function ltPercentile(sorted, p) {
  if (!sorted.length) return null;
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

// Returns null below LT_MIN_SAMPLE so consumers can fail closed on a thin
// sample instead of rendering a number built from a handful of records.
function ltSummarize(values, addTail) {
  const v = values
    .filter(x => x != null && isFinite(x) && x > 0)
    .sort((a, b) => a - b);

  if (v.length < LT_MIN_SAMPLE) return null;

  const tail = addTail ? LT_PRINT_TO_DONE : 0;
  return {
    median: Math.round(ltPercentile(v, 0.5) + tail),
    p75: Math.round(ltPercentile(v, 0.75) + tail),
    n: v.length,
  };
}

// -----------------------------------------------------------------------------
// AS Colour: subscription-key always, bearer token when available, retry on 401
// (Identical to v3 behavior.)
// -----------------------------------------------------------------------------
async function handleAscolour(request, env, path, query) {
  if (!path) {
    return jsonError('Missing AS Colour path. Try /proxy/ascolour/catalog/products/1001', 400);
  }

  // Don't expose the auth endpoint through the proxy directly. The worker
  // handles auth internally; clients don't need this route.
  if (path === 'api/authentication' || path.startsWith('api/authentication/')) {
    return jsonError('Auth is handled internally by the worker, not exposed', 403);
  }

  const asUrl = `${AS_BASE}/${path}${query}`;

  // Read body once into a buffer so we can replay it on retry.
  // (request.body is a ReadableStream - single-use.)
  let bodyBuf = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      bodyBuf = await request.arrayBuffer();
    } catch (e) {
      return jsonError(`Could not read request body: ${e.message}`, 400);
    }
  }

  // First attempt - uses cached token if any.
  let resp = await ascolourFetch(env, request.method, asUrl, bodyBuf, asTokenCache);

  // 401? Clear cache, re-auth, retry once.
  if (resp.status === 401) {
    console.log(`[pine-as] 401 on ${asUrl} - re-authing`);
    asTokenCache = null;
    const newToken = await ascolourLogin(env);
    if (!newToken) {
      return jsonError('AS Colour authentication failed', 502);
    }
    asTokenCache = newToken;
    resp = await ascolourFetch(env, request.method, asUrl, bodyBuf, asTokenCache);
  }

  console.log(`[pine-as] ${request.method} ${asUrl} -> ${resp.status}`);

  return streamThrough(resp);
}

// Issue an AS Colour API request with subscription key (always) + bearer (if any).
async function ascolourFetch(env, method, url, bodyBuf, token) {
  const headers = {
    'Subscription-Key': env.AS_SUBSCRIPTION_KEY,
    'Accept': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const init = { method, headers };
  if (bodyBuf) {
    headers['Content-Type'] = 'application/json';
    init.body = bodyBuf;
  }

  try {
    return await fetch(url, init);
  } catch (e) {
    // Network-level failure - synthesize a Response so caller treats it uniformly.
    return new Response(JSON.stringify({ error: 'Failed to reach AS Colour: ' + e.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST to AS Colour's auth endpoint with email/password from secrets.
// Returns the token string on success, null on failure.
async function ascolourLogin(env) {
  const authUrl = `${AS_BASE}${AS_AUTH_PATH}`;
  let resp;
  try {
    resp = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Subscription-Key': env.AS_SUBSCRIPTION_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: env.AS_EMAIL, password: env.AS_PASSWORD }),
    });
  } catch (e) {
    console.log(`[pine-as] auth network error: ${e.message}`);
    return null;
  }
  if (!resp.ok) {
    console.log(`[pine-as] auth returned ${resp.status}`);
    return null;
  }
  let data;
  try {
    data = await resp.json();
  } catch (e) {
    console.log(`[pine-as] auth response not JSON: ${e.message}`);
    return null;
  }
  if (!data || !data.token) {
    console.log(`[pine-as] auth response had no token field`);
    return null;
  }
  console.log(`[pine-as] auth ok, token cached`);
  return data.token;
}

// -----------------------------------------------------------------------------
// SLC: PromoStandards SOAP/XML (NEW in v4)
//
// Client posts JSON like:
//   {"operation":"getProduct","productId":"31225"}
// Worker builds the matching SOAP envelope server-side and POSTs to SLC.
// -----------------------------------------------------------------------------
async function handleSlc(request, env, service) {
  if (request.method !== 'POST') {
    return jsonError('SLC requires POST. Send JSON {operation, productId, ...}.', 405);
  }
  const svc = SLC_SERVICES[service];
  if (!svc) {
    return jsonError(
      `Unknown SLC service "${service}". Use one of: ${Object.keys(SLC_SERVICES).join(', ')}`,
      400
    );
  }
  if (!env.SLC_USER || !env.SLC_PASS) {
    return jsonError('SLC_USER and SLC_PASS secrets are not set on the worker', 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return jsonError(`Body must be JSON: ${e.message}`, 400);
  }
  if (!payload || typeof payload !== 'object') {
    return jsonError('Body must be a JSON object', 400);
  }

  const operation = payload.operation;
  if (!operation) {
    return jsonError('Missing "operation" field in body', 400);
  }
  const opMeta = SLC_OPERATIONS[operation];
  if (!opMeta) {
    return jsonError(
      `Unknown operation "${operation}". Use one of: ${Object.keys(SLC_OPERATIONS).join(', ')}`,
      400
    );
  }
  if (opMeta.service !== service) {
    return jsonError(
      `Operation "${operation}" belongs to /proxy/slc/${opMeta.service}, not /proxy/slc/${service}`,
      400
    );
  }

  // Build SOAP envelope.
  let xmlBody;
  try {
    xmlBody = buildSlcEnvelope(svc, opMeta, payload, env.SLC_USER, env.SLC_PASS);
  } catch (e) {
    return jsonError(`Bad SLC request: ${e.message}`, 400);  // v14: was an uncaught 500
  }

  const slcUrl = `${SLC_BASE}/${svc.path}/`;

  let resp;
  try {
    resp = await fetch(slcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        // SOAPAction: PromoStandards convention. Quoted, value = bare operation name.
        'SOAPAction': `"${operation}"`,
        'Accept': 'text/xml, application/xml',
      },
      body: xmlBody,
    });
  } catch (e) {
    return jsonError(`Failed to reach SLC: ${e.message}`, 502);
  }

  console.log(`[pine-slc] POST ${slcUrl} op=${operation} -> ${resp.status}`);

  return streamThrough(resp);
}

// Build a SOAP 1.1 envelope wrapping the PromoStandards request body.
// The docs show only the inner request element; real HTTP-SOAP needs the wrapper.
//
// v8: All three services use the SAME envelope shape - default xmlns on the
// operation element, <shar:> prefixed children throughout. SLC support
// confirmed this for pricing 4/28/26; previous v6 alphabroder shape was an
// over-correction based on a fault that was actually about missing fields.
function buildSlcEnvelope(svc, opMeta, payload, slcUser, slcPass) {
  const inner = buildSlcRequestBody(svc, opMeta, payload, slcUser, slcPass);
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">',
    '  <soapenv:Body>',
    inner,
    '  </soapenv:Body>',
    '</soapenv:Envelope>',
  ].join('\n');
}

// Build the inner <GetXxxRequest> element with its children.
// Operation-specific shapes are handled here.
//
// v8: localization is emitted PER-OPERATION in the correct schema-ordered
// position, because each service has different ordering:
//   - getProduct / getProductSellable (productdata): localization AFTER creds,
//     BEFORE productId
//   - getInventoryLevels (inventory): no localization at all (WSDL doesn't define)
//   - getConfigurationAndPricing (pricing): localization AFTER priceType,
//     BEFORE configurationType
function buildSlcRequestBody(svc, opMeta, payload, slcUser, slcPass) {
  const reqEl = opMeta.requestElement;
  const lines = [];
  lines.push(
    `  <${reqEl} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"` +
    ` xmlns:shar="${svc.shared}" xmlns="${svc.root}">`
  );
  lines.push(`    <shar:wsVersion>${svc.wsVersion}</shar:wsVersion>`);
  lines.push(`    <shar:id>${xmlEscape(slcUser)}</shar:id>`);
  lines.push(`    <shar:password>${xmlEscape(slcPass)}</shar:password>`);

  // Operation-specific body - branch on the request element name.
  if (reqEl === 'GetProductRequest') {
    if (!payload.productId) {
      throw new Error('getProduct requires productId');
    }
    // SLC canonical order: localization BEFORE productId
    lines.push(`    <shar:localizationCountry>US</shar:localizationCountry>`);
    lines.push(`    <shar:localizationLanguage>en</shar:localizationLanguage>`);
    lines.push(`    <shar:productId>${xmlEscape(String(payload.productId))}</shar:productId>`);
    if (payload.partId) {
      lines.push(`    <shar:partId>${xmlEscape(String(payload.partId))}</shar:partId>`);
    }
    if (payload.colorName) {
      lines.push(`    <shar:colorName>${xmlEscape(String(payload.colorName))}</shar:colorName>`);
    }
  } else if (reqEl === 'GetProductSellableRequest') {
    // SLC support confirmed canonical envelope (4/28/26): filter children DO
    // use shar: prefix. v7 was wrong to strip it. Element order matches SLC's
    // sample: localization, productId, lineName, isSellable.
    lines.push(`    <shar:localizationCountry>US</shar:localizationCountry>`);
    lines.push(`    <shar:localizationLanguage>en</shar:localizationLanguage>`);
    if (payload.productId) {
      lines.push(`    <shar:productId>${xmlEscape(String(payload.productId))}</shar:productId>`);
    }
    if (payload.partId) {
      lines.push(`    <shar:partId>${xmlEscape(String(payload.partId))}</shar:partId>`);
    }
    if (payload.lineName) {
      lines.push(`    <shar:lineName>${xmlEscape(String(payload.lineName))}</shar:lineName>`);
    }
    if (typeof payload.isSellable !== 'undefined') {
      lines.push(`    <shar:isSellable>${payload.isSellable ? 'true' : 'false'}</shar:isSellable>`);
    }
  } else if (reqEl === 'GetInventoryLevelsRequest') {
    if (!payload.productId) {
      throw new Error('getInventoryLevels requires productId');
    }
    lines.push(`    <shar:productId>${xmlEscape(String(payload.productId))}</shar:productId>`);
    // Optional partId filter - docs show a <Filter><partIdArray>...</partIdArray></Filter> wrapper.
    if (Array.isArray(payload.partIds) && payload.partIds.length) {
      lines.push(`    <shar:Filter>`);
      lines.push(`      <shar:partIdArray>`);
      for (const pid of payload.partIds) {
        lines.push(`        <shar:partId>${xmlEscape(String(pid))}</shar:partId>`);
      }
      lines.push(`      </shar:partIdArray>`);
      lines.push(`    </shar:Filter>`);
    }
  } else if (reqEl === 'GetConfigurationAndPricingRequest') {
    if (!payload.productId) {
      throw new Error('getConfigurationAndPricing requires productId');
    }
    // SLC support confirmed canonical envelope (4/28/26). Element order is:
    //   productId / [partId] / currency / fobId / priceType /
    //   localizationCountry / localizationLanguage / configurationType
    // Localization comes AFTER priceType (different from getProduct which
    // puts it before productId). configurationType is REQUIRED and was the
    // real culprit behind the v5/v6 faults - the worker was missing it,
    // not localization.
    lines.push(`    <shar:productId>${xmlEscape(String(payload.productId))}</shar:productId>`);
    if (payload.partId) {
      lines.push(`    <shar:partId>${xmlEscape(String(payload.partId))}</shar:partId>`);
    }
    const currency  = payload.currency  || 'USD';
    const fobId     = payload.fobId     || '1';
    const priceType = payload.priceType || 'Customer';
    const configurationType = payload.configurationType || 'Blank';
    lines.push(`    <shar:currency>${xmlEscape(currency)}</shar:currency>`);
    lines.push(`    <shar:fobId>${xmlEscape(String(fobId))}</shar:fobId>`);
    lines.push(`    <shar:priceType>${xmlEscape(priceType)}</shar:priceType>`);
    lines.push(`    <shar:localizationCountry>US</shar:localizationCountry>`);
    lines.push(`    <shar:localizationLanguage>en</shar:localizationLanguage>`);
    lines.push(`    <shar:configurationType>${xmlEscape(configurationType)}</shar:configurationType>`);
  }

  lines.push(`  </${reqEl}>`);
  return lines.join('\n');
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ---------------------------------------------------------------------------
// SanMar: Web Services SOAP, worker parses to JSON. (NEW in v11)
//
// Only service today: pricing -> SanMar standard getPricing (guide pp. 66-69).
// One call with just a style returns every SKU for it. Auth goes in arg1 of
// the body. Errors come back two ways and are kept distinct (SLC lesson):
//   - <Fault>                 routing/parser layer rejected the request
//   - errorOccurred = true    handler ran and said no (bad creds, bad style)
// ---------------------------------------------------------------------------
async function handleSanmar(request, env, service, params) {
  if (request.method !== 'GET') {
    return jsonError('SanMar routes are GET only', 405);
  }
  if (service !== 'pricing' && service !== 'productinfo' && service !== 'inventory') {
    return jsonError(`Unknown SanMar service "${service}". Use: pricing, productinfo, inventory`, 404);
  }
  if (!env.SANMAR_CUSTOMER || !env.SANMAR_USER || !env.SANMAR_PASS) {
    return jsonError('SANMAR_CUSTOMER, SANMAR_USER and SANMAR_PASS secrets are not set on the worker', 500);
  }
  if (service === 'productinfo' || service === 'inventory') {
    return handleSanmarStream(env, service, params); // v12
  }

  const q = {
    style: (params.get('style') || '').trim(),
    color: (params.get('color') || '').trim(),
    size:  (params.get('size')  || '').trim(),
  };
  if (!q.style) {
    return jsonError('style is required. Try /proxy/sanmar/pricing?style=PC54', 400);
  }

  const raw = params.get('raw') === '1';
  const noCache = params.get('nocache') === '1';
  const envName = env.SANMAR_ENV === 'edev' ? 'edev' : 'prod';
  const cacheKey = [envName, q.style, q.color, q.size].join('|').toLowerCase();

  if (!raw && !noCache) {
    const hit = sanmarCache.get(cacheKey);
    if (hit && (Date.now() - hit.at) < SANMAR_CACHE_MS) {
      console.log(`[pine-sanmar] cache hit ${cacheKey}`);
      return jsonOk({ ...hit.body, cached: true });
    }
  }

  const smUrl = SANMAR_HOSTS[envName] + SANMAR_PRICING_PATH;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SANMAR_TIMEOUT_MS);
  let resp, xml;
  try {
    resp = await fetch(smUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '""',
        'Accept': 'text/xml, application/xml',
      },
      body: buildSanmarPricingEnvelope(env, q),
      signal: ctrl.signal,
    });
    // Deliberate buffer: one style's SKUs is small, and we parse to JSON here.
    xml = await resp.text();
  } catch (e) {
    const why = e && e.name === 'AbortError'
      ? `timed out after ${SANMAR_TIMEOUT_MS / 1000}s (check port 8080 reachability)`
      : e.message;
    return jsonError(`Failed to reach SanMar: ${why}`, 502);
  } finally {
    clearTimeout(timer);
  }

  console.log(`[pine-sanmar] POST ${smUrl} style=${q.style} env=${envName} -> ${resp.status}`);

  if (raw) {
    return new Response(xml, {
      status: resp.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/xml' },
    });
  }

  const parsed = parseSanmarPricing(xml);
  if (!parsed.ok) {
    return jsonError(parsed.error, 502);
  }

  const body = {
    ok: true,
    style: q.style.toUpperCase(),
    count: parsed.items.length,
    cached: false,
    items: parsed.items,
  };
  sanmarCache.set(cacheKey, { at: Date.now(), body });
  return jsonOk(body);
}

// v12: product info + inventory, XML streamed through (see header).
const SANMAR_STREAM = {
  productinfo: { path: '/SanMarWebService/SanMarProductInfoServicePort', build: buildSanmarProductInfoEnvelope },
  inventory:   { path: '/SanMarWebService/SanMarWebServicePort',        build: buildSanmarInventoryEnvelope },
};

async function handleSanmarStream(env, service, params) {
  const q = {
    style: (params.get('style') || '').trim(),
    color: (params.get('color') || '').trim(),
    size:  (params.get('size')  || '').trim(),
  };
  if (!q.style) {
    return jsonError(`style is required. Try /proxy/sanmar/${service}?style=PC54`, 400);
  }
  const envName = env.SANMAR_ENV === 'edev' ? 'edev' : 'prod';
  const svc = SANMAR_STREAM[service];
  const smUrl = SANMAR_HOSTS[envName] + svc.path;

  let resp;
  try {
    resp = await fetch(smUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '""',
        'Accept': 'text/xml, application/xml',
      },
      body: svc.build(env, q),
    });
  } catch (e) {
    return jsonError(`Failed to reach SanMar: ${e.message}`, 502);
  }
  console.log(`[pine-sanmar] POST ${smUrl} ${service} style=${q.style} -> ${resp.status}`);
  return streamThrough(resp);
}

// Guide p.24. Optional color is the CATALOG color; size e.g. "XL".
function buildSanmarProductInfoEnvelope(env, q) {
  return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
    'xmlns:impl="http://impl.webservice.integration.sanmar.com/">' +
    '<soapenv:Header/>' +
    '<soapenv:Body>' +
      '<impl:getProductInfoByStyleColorSize>' +
        '<arg0>' +
          `<style>${xmlEscape(q.style)}</style>` +
          (q.size ? `<size>${xmlEscape(q.size)}</size>` : '') +
          (q.color ? `<color>${xmlEscape(q.color)}</color>` : '') +
        '</arg0>' +
        '<arg1>' +
          `<sanMarCustomerNumber>${xmlEscape(env.SANMAR_CUSTOMER)}</sanMarCustomerNumber>` +
          `<sanMarUserName>${xmlEscape(env.SANMAR_USER)}</sanMarUserName>` +
          `<sanMarUserPassword>${xmlEscape(env.SANMAR_PASS)}</sanMarUserPassword>` +
        '</arg1>' +
      '</impl:getProductInfoByStyleColorSize>' +
    '</soapenv:Body>' +
    '</soapenv:Envelope>';
}

// Guide p.51-53. Different namespace from the other SanMar services
// (webservice..., no "impl."), and creds are flat arg0-arg2.
function buildSanmarInventoryEnvelope(env, q) {
  return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
    'xmlns:web="http://webservice.integration.sanmar.com/">' +
    '<soapenv:Header/>' +
    '<soapenv:Body>' +
      '<web:getInventoryQtyForStyleColorSize>' +
        `<arg0>${xmlEscape(env.SANMAR_CUSTOMER)}</arg0>` +
        `<arg1>${xmlEscape(env.SANMAR_USER)}</arg1>` +
        `<arg2>${xmlEscape(env.SANMAR_PASS)}</arg2>` +
        `<arg3>${xmlEscape(q.style)}</arg3>` +
        (q.color ? `<arg4>${xmlEscape(q.color)}</arg4>` : '') +
        (q.size ? `<arg5>${xmlEscape(q.size)}</arg5>` : '') +
      '</web:getInventoryQtyForStyleColorSize>' +
    '</soapenv:Body>' +
    '</soapenv:Envelope>';
}

// Envelope shape copied from guide p.68, including the empty tags it sends.
function buildSanmarPricingEnvelope(env, q) {
  return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' +
    'xmlns:impl="http://impl.webservice.integration.sanmar.com/">' +
    '<soapenv:Header/>' +
    '<soapenv:Body>' +
      '<impl:getPricing>' +
        '<arg0>' +
          '<casePrice/>' +
          `<color>${xmlEscape(q.color)}</color>` +
          '<dozenPrice/>' +
          '<inventoryKey/>' +
          '<myPrice/>' +
          '<piecePrice/>' +
          '<salePrice/>' +
          `<size>${xmlEscape(q.size)}</size>` +
          '<sizeIndex/>' +
          `<style>${xmlEscape(q.style)}</style>` +
        '</arg0>' +
        '<arg1>' +
          `<sanMarCustomerNumber>${xmlEscape(env.SANMAR_CUSTOMER)}</sanMarCustomerNumber>` +
          `<sanMarUserName>${xmlEscape(env.SANMAR_USER)}</sanMarUserName>` +
          `<sanMarUserPassword>${xmlEscape(env.SANMAR_PASS)}</sanMarUserPassword>` +
        '</arg1>' +
      '</impl:getPricing>' +
    '</soapenv:Body>' +
    '</soapenv:Envelope>';
}

function xmlUnescape(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

// First <tag>...</tag> in a chunk, tolerating an optional namespace prefix.
function sanmarTag(chunk, tag) {
  const re = new RegExp(
    '<(?:[\\w-]+:)?' + tag + '(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?' + tag + '>'
  );
  const m = chunk.match(re);
  return m ? xmlUnescape(m[1].trim()) : null;
}

// Flat-response parser. Returns { ok, items } or { ok:false, error }.
function parseSanmarPricing(xml) {
  if (/<(?:[\w-]+:)?Fault[\s>]/.test(xml)) {
    return { ok: false, error: 'SanMar SOAP Fault: ' + (sanmarTag(xml, 'faultstring') || 'unknown') };
  }
  const message = sanmarTag(xml, 'message');
  if (sanmarTag(xml, 'errorOccurred') === 'true') {
    return { ok: false, error: 'SanMar: ' + (message || 'reported an error') };
  }
  const blocks = xml.match(/<(?:[\w-]+:)?listResponse[\s>][\s\S]*?<\/(?:[\w-]+:)?listResponse>/g) || [];
  const items = blocks.map(b => {
    const it = {};
    for (const f of SANMAR_ITEM_FIELDS) {
      const v = sanmarTag(b, f);
      it[f] = (v === null || v === '') ? null : (SANMAR_NUMERIC[f] ? Number(v) : v);
    }
    return it;
  });
  if (!items.length) {
    return { ok: false, error: 'SanMar: ' + (message || 'no pricing returned for that style') };
  }
  return { ok: true, items };
}

// -----------------------------------------------------------------------------
// Helpers (unchanged from v3)
// -----------------------------------------------------------------------------
function streamThrough(upstream) {
  // Stream the upstream response body to the client; do NOT buffer with .text().
  // (Large responses crash the worker with CF Error 1101.)
  const responseHeaders = new Headers(CORS_HEADERS);
  const ct = upstream.headers.get('Content-Type');
  if (ct) responseHeaders.set('Content-Type', ct);
  const cl = upstream.headers.get('Content-Length');
  if (cl) responseHeaders.set('Content-Length', cl);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

function jsonOk(obj) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}


// -----------------------------------------------------------------------------
// Mockups: one order's line items with mockups, sizes and print location. (v13)
//
// ROUTE:   GET /proxy/mockups?o=recXXXXXXXXXXXXXX   (Orders record ID)
// USED BY: mockups.html on GitHub Pages, opened from the receiving-label QR.
// WHY:     anyone on the floor can scan a box and see the designs without an
//          Airtable login. The Airtable token stays here, read-only.
// KEY:     the Orders RECORD ID, not the order number, so nobody can walk
//          10893 -> 10894 and browse other customers' designs.
// RETURNS: {ok, order, customer, items:[{garment, imprints, location, total,
//          sizes:[{size, qty}], mockups:[{name, type, image, full}]}]}
//          qty = ordered + extras (what physically arrives for that line).
//          image/full are Airtable attachment URLs; they expire after a few
//          hours, which is why the page asks this route on every open.
// CACHE:   module-level Map, 5 min, well inside the attachment URL lifetime.
// -----------------------------------------------------------------------------
const MK_BASE   = 'appJkaLk8DykjsgHR';
const MK_ORDERS = 'tbl8Tf0AeS9gnHOOS';
const MK_LINES  = 'tblJx5UlwO7oMSk5H';

const MK_O = {
  orderNum: 'fld4S3B5yJANKlE7l', // Invoice / Order Number (formula)
  customer: 'fldoRraeYHsgfeWhj', // [TEXT] Customer Name
  lines:    'fldU6fgrz6sU3wyIZ', // Line Items (links)
};

const MK_L = {
  garment:   'fldKhz9uZgXwfeIto', // "" & {Garment Type} -> Manufacturer + product - colorway
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
      console.log(`[pine-mockups] order ${orderId} -> Airtable ${r.status}`);
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
        console.log(`[pine-mockups] lines -> Airtable ${r.status}: ${detail.slice(0, 200)}`);
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
