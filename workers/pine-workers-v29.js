/**
 * Pine Central - Vendor Proxy v29
 *
 * v29 CHANGES (2026-10-24): NEW GET /proxy/img?u=<image url> - hands a vendor's garment photo back with CORS headers
 *   so Sep Maker can draw it into a proof and save the proof as a PDF (a browser canvas can't export pictures from
 *   sites that don't send CORS headers). Only vendor image hosts: S&S (ssactivewear.com), SanMar (sanmar.com) and
 *   AS Colour (ascolour.*), https only, images only, up to 15 MB. Anything else -> 403 host_not_allowed / 415 not_image.
 *   No key needed (the same photos are public on the vendors' sites). Nothing else changed.
 *
 * v28 CHANGES (2026-10-20): NEW GET /proxy/drive/file?id=<file id> - streams one file's bytes so Line Item Review
 *   can preview PDFs and images in the app. Same auth as the other Drive routes (Pine Airtable token) and the same
 *   shared-drive check. Files only: a folder -> 400 not_a_file; Google Docs/Sheets/Slides (application/vnd.google-apps.*)
 *   can't be downloaded as bytes -> 415 not_downloadable; over 25 MB -> 413 too_big (checked from the metadata size
 *   before downloading). Read-only. Nothing else changed.
 *
 * v27 CHANGES (2026-10-20): GOOGLE_DRIVE_ID is read forgivingly (spaces, line breaks or the whole Drive address all
 *   work), and drive/status's "drive not found" message shows a safe hint of the ID in use (first/last 3 characters
 *   and the length) so a folder ID or a bad paste is easy to spot. Nothing else changed.
 *
 * v26 CHANGES (2026-10-20, Google Drive: clear errors, status, find the order's folder):
 *   Stephen saved an order's Drive folder in Line Item Review and got "Can't read this folder". v25 answered every
 *   Drive problem with code folder_not_found, so a bad key, an unshared folder and a Google outage looked the same.
 *   1. Clear error codes on every Drive route ({error, code}):
 *        drive_signin_failed (502) - the worker couldn't sign in to Google (bad GOOGLE_SA_KEY, invalid_grant ...);
 *                                    the message carries Google's reason, never the key or a token
 *        folder_not_found    (404) - Google says no such folder (or it isn't shared with the service account)
 *        no_access           (403) - Google refused: share the folder / shared drive with the service account
 *        not_in_shared_drive (403) - unchanged: the folder is outside Pine's shared drive
 *        drive_error         (502) - anything else Google said
 *   2. NEW GET /proxy/drive/status -> {ok:true, drive:{name}, account:<service account email>}
 *        Signs in and reads the shared drive GOOGLE_DRIVE_ID (drives.get, useDomainAdminAccess=false).
 *        Errors: the codes above, drive_id_missing (GOOGLE_DRIVE_ID not set), drive_not_found (404 on the drive:
 *        wrong ID or the account isn't a member). Error answers also carry "account" when the key can be read.
 *   3. NEW GET /proxy/drive/search?order=11029 -> {ok:true, folders:[{id,name,webViewLink,modifiedTime}]}
 *        Folders in the shared drive whose name contains the order number on its own ("11029 Deppen Brewing",
 *        "11029 - Deppen", "#11029"; not 110290 or 211029). Newest first, at most 10. order = 3-7 digits.
 *        Needs GOOGLE_DRIVE_ID (else drive_id_missing). Read-only.
 *   list / thumb / upload work as in v25. The cached Google token is now tied to the key, so a new key signs in again.
 *   Same auth for all Drive routes: the Pine Airtable token (must read base appJkaLk8DykjsgHR).
 *
 * v25 CHANGES (2026-10-20, Google Drive for the art department):
 *   Line Item Review v28 shows the order's Drive art folder and saves each proof into it (Stephen: sales makes the
 *   folder and adds the customer's art, art grabs it, makes the mockup, attaches it to Airtable AND uploads it to Drive).
 *   Routes (all need the Pine Airtable token, same check as Pipedrive: it must read base appJkaLk8DykjsgHR):
 *     GET  /proxy/drive/list?folder=<folder URL or id>   -> {ok, folder:{id,name,url}, files:[{id,name,mimeType,
 *                                                            modifiedTime,size,webViewLink,iconLink,thumb}]}
 *     GET  /proxy/drive/thumb?id=<file id>               -> the file's thumbnail image (or 404)
 *     GET  /proxy/drive/file?id=<file id>                -> the file's bytes (v28; files only, 25 MB max)
 *     POST /proxy/drive/upload?folder=<id>&name=<file name>   body = the raw file, Content-Type = its type
 *                                                         -> {ok, file:{id,name,webViewLink}}   (25 MB max)
 *   Only folders/files in Pine's SHARED drive are reachable (GOOGLE_DRIVE_ID; anything else -> 403). Nothing is
 *   deleted or overwritten: upload always adds a new file.
 *   SECRETS (Cloudflare -> pine-workers -> Settings -> Variables):
 *     GOOGLE_SA_KEY   - the service account's JSON key (paste the whole file), secret
 *     GOOGLE_DRIVE_ID - the shared drive's id (the part after /drive/folders/ when the shared drive itself is open)
 *   Without GOOGLE_SA_KEY every drive route answers 503 {code:"drive_not_connected"} and the apps just hide Drive.
 *
 * v24 CHANGES (2026-10-19, security + Line Item Review):
 *   1. ShipStation route locked. /proxy/shipstation/* used to answer anyone (customer names, addresses,
 *      phones, emails; label buying on Pine's account). It now needs the same Airtable token as the
 *      Pipedrive routes, and that token must be able to read the Pine base. No current app uses this
 *      route (only the retired July pine-shipping-v5 did).
 *   2. Pipedrive, PandaDoc and AI routes: the token check used to be Airtable "whoami", which ANY Airtable
 *      account passes (a free one too). pdCallerOk now requires a token that can read base appJkaLk8DykjsgHR
 *      (rcBaseOk, the Reconnect check from v23; cached per token for 10 minutes).
 *   3. GET /proxy/pipedrive/deal?order= also returns deal.sendToClient: the deal's "Send to client" task,
 *      which Pipedrive adds when a deal moves to Awaiting Approval and the rep ticks once the proof is
 *      out (however they sent it). {done:true|false, doneAt, dueDate} or null when the deal has no
 *      such task. Read-only.
 *
 * v23 CHANGE: Reconnect v4 gets Patrick's Pipedrive conditions (owner, last activity, last email sent,
 *   customer tier, workflows) for every customer org. READ-ONLY; nothing in Pipedrive can change from here.
 *   GET /proxy/pipedrive/reconnect
 *     -> {ok:true, asOf, orgs:[{id, name, owner, lastActivity, lastEmailSent, tier, workflows:[...]}],
 *         counts:{...}, notes:[...]}
 *        Only organizations with 1+ won deal. No emails, phones or person names: dates and labels only.
 *     AUTH: the Airtable-token Bearer gate the other Pipedrive routes use (whoami), PLUS the token must be
 *       able to read base appJkaLk8DykjsgHR (1 Orders record, 1 field), cached per token for 10 minutes.
 *       401 without a working token, 403 when it can't read the Pine base.
 *     CORS: this route only answers https://pineprintshop.github.io (all other routes unchanged).
 *     KEY: PIPEDRIVE_RECONNECT_KEY if set, else PIPEDRIVE_KEY (sales@ = Chris, who sees every organization:
 *       checked Oct 15). The optional secret is for a Pipedrive admin key if that ever changes.
 *     WHERE EACH FIELD COMES FROM (custom field keys looked up by name, with Oct 15 keys as fallback):
 *       - won deals, owner, Customer Tier, last activity id: organizations (API v2, ids in batches of 100,
 *         include_fields=won_deals_count,last_activity_id, custom_fields=<Customer Tier>)
 *       - lastActivity: the due date of the org's last DONE activity (API v2 activities, ids in batches of 100)
 *       - workflows: "Enroll in Workflow" (a deal field; leads share deal fields) on ANY of the org's deals
 *         and leads, as one list
 *       - lastEmailSent: newest "Last email sent" (last_outgoing_mail_time) across the org's deals. Organizations
 *         have no such field; persons do, but reading persons means reading contact details, and emails sync
 *         onto the person's deal. An email linked only to a person with no deal is missed.
 *       - which orgs: the orgs of all non-deleted deals (API v2 deals, 500 a page, only org_id, status, the
 *         workflow field and last_outgoing_mail_time), kept when they have a won deal.
 *     CACHE: the finished answer is kept 1 hour (module memory + Cache API when available).
 *     SUBREQUESTS: about 3 (field lists, users) + ~45 deal pages + a few lead pages + ~30 org batches +
 *       ~30 activity batches = roughly 110 Pipedrive calls for one full read. Cloudflare's free plan allows
 *       50 per request, so the read is done in steps of RECONNECT_BUDGET calls (default 40). Until it is
 *       finished the route answers 202 {ok:false, partial:true, progress, retryMs} and the page asks again;
 *       the next request carries on where the last one stopped (same worker instance). On the paid plan set
 *       the plain variable RECONNECT_BUDGET=400 to finish in one request. A 429 from Pipedrive waits once
 *       (Retry-After, max 5 s), then stops the step and the page retries.
 *
 * (v22 notes follow)
 *
 * v22 CHANGE: the email reader's open questions come with a fix (Create order v7).
 *   POST /proxy/ai/order-from-email now returns
 *     lines[].qty_total  - total pieces asked for when there's no size breakdown (e.g. "75 tees")
 *     questions[]        - {text, ask_customer, kind, lines:[line index], prints:[print ref]}
 *       kind: sizes | same_art | print_details | artwork | scope | other
 *       ask_customer = the question as you'd write it to the customer.
 *   Create order turns kind + lines + prints into one-tap fixes ("put the hat embroidery on the
 *   Olive Gray hat", "fill Pine's usual size mix"). Older Create order versions still read text.
 *   The reader is also told not to ask what the thread already answers (e.g. the rep wrote
 *   "both hats get the same design"): apply it instead.
 *
 * (v21 notes follow)
 *
 * v21 CHANGE: the order's Pipedrive DEAL is the source (Create order v4).
 *   GET /proxy/pipedrive/deal?order=10998   (Airtable-token gated, read-only)
 *     Finds the deal titled "10998 | …" and returns
 *       {ok, deal:{id,title,owner,stage,status,value,url,delivery,deadline,dueDate,description}|null,
 *        messages:[{id,subject,from,to,date,snippet,text,cust}]}
 *     messages = only emails LINKED TO THAT DEAL (one order's conversation; no other orders, no other
 *     reps' unrelated mail). Read with every Pipedrive key the worker has (PIPEDRIVE_KEY + any
 *     PIPEDRIVE_KEY_*), because synced mail is private to the rep who synced it; merged by id.
 *     Full text for the 8 newest (the customer's first). An email that isn't on the deal (e.g. sent to
 *     another rep) shows once someone links it to the deal in Pipedrive.
 *   The v20 /emails route is unchanged (Create order v3 still uses it).
 *
 * (v20 notes follow)
 *
 * v20 CHANGE: Pipedrive emails for Create order v3.
 *   - Each message carries mail_thread_id, so the page can show whole conversations.
 *   - Full text for the newest 8 messages (was 3), customer replies first: on 10999 UpSlope the order
 *     details were in an older sales@ thread, newer than nothing the customer wrote in hello@.
 *   - Group sends (newsletters) were already skipped; unchanged.
 *   - /ai/order-from-email also takes currentLines (what's already on the Create order screen, e.g. after
 *     Reorder) so a reorder email ("same tees: S 20, M 18…") fills those lines instead of inventing new ones.
 *   - PRIVACY: &inbox=<the rep's Pine addresses, comma list> (Patrick: hello@,patrick@ · Chris: sales@,chris@).
 *     Returned: the rep's own conversations (minus anything written by OTHER Pine addresses), plus emails the
 *     CUSTOMER wrote to any other Pine address (e.g. Jon's reorder to chris@ on Patrick's order), with quoted
 *     earlier messages cut off and marked outside:true. Other reps' own writing never leaves the worker.
 *     (Stephen, Oct 13: "customer's emails only".)
 *   - ONE PIPEDRIVE KEY PER INBOX: Pipedrive email sync is private per user, so the sales@ key (Chris) can't
 *     see Patrick's conversations. With &inbox=hello@pineprintshop.com the worker uses secret
 *     PIPEDRIVE_KEY_HELLO (from the Pipedrive user that syncs hello@ = Patrick); sales@ uses
 *     PIPEDRIVE_KEY_SALES, else PIPEDRIVE_KEY. Rule: PIPEDRIVE_KEY_ + the part before @, upper-case.
 *     If that inbox's secret is missing it falls back to PIPEDRIVE_KEY (still filtered to that inbox) and
 *     says so in "keyNote". /proxy/pipedrive/me?inbox=... shows which Pipedrive user a key belongs to.
 *
 * (v19 notes follow)
 *
 * v19 CHANGE: Create order v2 support.
 *   1. /proxy/pipedrive/emails messages now carry to[] and cc[] (email addresses) and deal_id, so the page
 *      can show the order's rep's thread first (Patrick = hello@, Chris = sales@) instead of whoever the
 *      customer emailed last.
 *   2. NEW POST /proxy/ai/order-from-email  (Airtable-token gated, like Pipedrive/PandaDoc)
 *      Body: {customer, rep, emails:[{from,date,subject,text}], pastImprints:[{id,nick,loc,type,inks}],
 *             locations:[...], types:[...]}
 *      Reads the emails with Claude and returns a DRAFT order, nothing is written anywhere:
 *        {ok, draft:{summary, lines:[{style,brand,color,sizes:[{size,qty}],womens,youth,prints:[ref],notes}],
 *                    prints:[{ref,nickname,location,type,colors,underbase,inks,repeat_of,print_notes}],
 *                    questions:[...]}, model, usage}
 *      SECRET: ANTHROPIC_API_KEY (console.anthropic.com > API keys). Without it the route answers 500
 *      "ANTHROPIC_API_KEY is not set" and the rest of the worker is unaffected.
 *      Model claude-opus-5-5, structured JSON output, refusal fallback on. ~1-3 cents per read.
 *
 * (v18 notes follow)
 *
 * v18 CHANGE: Pipedrive, READ-ONLY, so Create order can show the customer's emails
 *   (sizes, ink notes) next to the form. Nothing in Pipedrive can be changed from here.
 *   - AUTH: same Airtable-token gate as PandaDoc (`Authorization: Bearer <pine_at_key>`).
 *   - SECRET: PIPEDRIVE_KEY (Pipedrive > Personal preferences > API, from the
 *     sales@pineprintshop.com user). The token only sees what that user sees, so
 *     emails show only if they are synced in Pipedrive and linked to the person.
 *   - ROUTES (GET only):
 *       /proxy/pipedrive/me            -> {ok, user:{name}} token check, no customer data
 *       /proxy/pipedrive/emails?email=<customer email>[&limit=5]
 *            Finds the Pipedrive person by exact email (Airtable has no Pipedrive IDs;
 *            Orders carry the customer email), then returns
 *            {ok, person:{id,name}|null, deals:[{id,title,status,stage,updated}],
 *             messages:[{id,subject,from,date,snippet,text}]}
 *            newest first, without bulk sends or robot senders (Airtable, ShipStation).
 *            Bodies (as plain text, 6000 chars max) for the newest 3. One key sees every
 *            mailbox synced into Pipedrive (hello@, sales@, reps), not only its own.
 *   - CACHE: module-level Map, 2 min per email.
 *
 * v17 CHANGE: GET /proxy/pandadoc/file?url=<Airtable attachment URL> streams a proof PDF
 *   back to the browser so Line Item Review can build the signing packet (Airtable
 *   attachment URLs may not allow cross-origin reads). Same Airtable-token gate as the
 *   other pandadoc routes; only https://*.airtableusercontent.com URLs are fetched.
 *   Also: a document made with the SANDBOX key (PandaDoc names it "[DEV] …") is never sent
 *   unless the request says allowSandbox:true (the test page does; Line Item Review doesn't),
 *   so a customer can't get a watermarked test doc. Response then has {sandbox:true}.
 *
 * v16 CHANGE: GET /proxy/pandadoc/documents/<id> on a document whose processing failed
 *   now returns PandaDoc's status record (status + any error/info message) instead of
 *   only "Document creation failed", so a bad packet says WHY it failed.
 *
 * v15 CHANGE: PandaDoc route, for sending order packets (terms + proofs + invoice)
 *   for signature from Line Item Review. First route that WRITES to an outside
 *   service, so it is locked down:
 *   - AUTH: caller must send `Authorization: Bearer <Airtable token>` (the same
 *     token every Pine app already keeps in pine_at_key). The worker checks it with
 *     Airtable's whoami endpoint and caches a pass for 10 min. No token, no PandaDoc.
 *   - SECRET: PANDADOC_KEY (Settings > Integrations > API in PandaDoc). Start with
 *     the Sandbox key (free, watermarked, 10 req/min); swap in the Production key to
 *     go live ($2 per API document on Pine's plan).
 *   - ROUTES:
 *       POST /proxy/pandadoc/documents   multipart: file=<PDF>, data=<JSON>
 *            data = {name, recipients:[{email,first_name,last_name,role,...}],
 *                    send:{subject,message,silent} | null, tags:[...]}
 *            Recipients pass straight through to PandaDoc (so CC options can be
 *            tested without redeploying). Field tags in the PDF become fields; the
 *            tag role must match a recipient role. With `send`, the worker waits
 *            for document.draft (PandaDoc needs ~3-5 s) then sends.
 *            -> {ok, id, status, sent, link}
 *       GET  /proxy/pandadoc/documents/<id>   -> {ok, id, name, status, recipients,
 *            fields:[{type, role, name}], counts:{signature, initials, ...}}
 *            (used to confirm the tags really became fields)
 *   - 25 MB file cap. Nothing else in PandaDoc is reachable through the worker.
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
 *   PANDADOC_KEY           - PandaDoc API key                       (v15)
 *   PIPEDRIVE_KEY          - Pipedrive API token, sales@ user       (NEW in v18)
 *   PIPEDRIVE_RECONNECT_KEY - optional, Pipedrive key for /pipedrive/reconnect (v23; else PIPEDRIVE_KEY)
 *   RECONNECT_BUDGET       - optional plain variable, Pipedrive calls per request for reconnect (v23; default 40)
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
    if (request.method === 'OPTIONS' && /^\/proxy\/pipedrive\/reconnect\/?$/.test(new URL(request.url).pathname)) {
      return new Response(null, { status: 204, headers: RC_CORS });   // v23: this route answers Pine's site only
    }
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

    if (firstSegment === 'pandadoc') {
      // /proxy/pandadoc/documents[/<id>] -> PandaDoc, Airtable-token gated (v15)
      return handlePandadoc(request, env, segments.slice(1));
    }

    if (firstSegment === 'pipedrive') {
      // /proxy/pipedrive/emails?email=... -> customer's synced emails, read-only (v18)
      return handlePipedrive(request, env, segments.slice(1), url.searchParams);
    }

    if (firstSegment === 'ai') {
      // /proxy/ai/order-from-email -> draft lines + imprints from customer emails (v19)
      return handleAi(request, env, segments.slice(1));
    }

    if (firstSegment === 'drive') {
      // /proxy/drive/list|thumb|file|upload|status|search -> Google Drive (shared drive only), Airtable-token gated (v25, v26, v28)
      return handleDrive(request, env, segments.slice(1), url.searchParams);
    }

    if (firstSegment === 'img') {
      // /proxy/img?u=<vendor image url> -> the image with CORS headers (v29)
      return handleImg(request, url.searchParams);
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
  if (first === 'img') return isRead ? null : 'Image proxy is read-only';                  // v29
  if (first === 'pandadoc') return null;  // v15: own auth (Airtable token) inside handlePandadoc
  if (first === 'drive') return null;     // v25: own auth (Airtable token + Pine base) inside handleDrive
  if (first === 'pipedrive') return isRead ? null : 'Pipedrive proxy is read-only';  // v18
  if (first === 'ai') return (method || '').toUpperCase() === 'POST' ? null : 'AI route accepts POST only';  // v19: own auth
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
  // v24: locked to Pine's Airtable token (was open to anyone).
  if (!(await pdCallerOk(request))) return jsonError('Send your Airtable token as "Authorization: Bearer ..."', 401);
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

// -----------------------------------------------------------------------------
// v29: vendor garment photos with CORS, for proofs drawn in the browser
// -----------------------------------------------------------------------------
const IMG_HOSTS = [/(^|\.)ssactivewear\.com$/i, /(^|\.)sanmar\.com$/i, /(^|\.)ascolour\.(com|com\.au|co\.nz|us)$/i];
const IMG_MAX_BYTES = 15 * 1024 * 1024;
async function handleImg(request, params) {
  let target;
  try { target = new URL(params.get('u') || ''); } catch (e) { return jsonError('Give the image address as ?u=https://...', 400); }
  if (target.protocol !== 'https:') return jsonError('https image addresses only', 400);
  if (!IMG_HOSTS.some(re => re.test(target.hostname))) {
    return new Response(JSON.stringify({ error: 'Only S&S, SanMar and AS Colour images', code: 'host_not_allowed' }),
      { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
  let r;
  try { r = await fetch(target.toString(), { headers: { 'Accept': 'image/*' }, redirect: 'follow', cf: { cacheTtl: 86400, cacheEverything: true } }); }
  catch (e) { return jsonError('Could not reach the vendor: ' + e.message, 502); }
  if (!r.ok) return jsonError('Vendor answered ' + r.status, r.status === 404 ? 404 : 502);
  const type = r.headers.get('Content-Type') || '';
  if (!/^image\//i.test(type)) {
    return new Response(JSON.stringify({ error: 'Not an image', code: 'not_image' }),
      { status: 415, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
  const len = Number(r.headers.get('Content-Length') || 0);
  if (len > IMG_MAX_BYTES) return jsonError('Image is over 15 MB', 413);
  const h = new Headers(CORS_HEADERS);
  h.set('Content-Type', type);
  h.set('Cache-Control', 'public, max-age=86400');
  return new Response(r.body, { status: 200, headers: h });
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


// -----------------------------------------------------------------------------
// v15: PandaDoc. Create a document from an uploaded PDF (field tags -> fields),
// optionally send it, and read back what fields PandaDoc made.
// -----------------------------------------------------------------------------
const PD_BASE = 'https://api.pandadoc.com/public/v1';
const PD_MAX_BYTES = 25 * 1024 * 1024;
const pdAuthCache = new Map(); // sha-256(token) -> passedAt

async function pdCallerOk(request) {
  const h = request.headers.get('Authorization') || '';
  const tok = h.replace(/^Bearer\s+/i, '').trim();
  if (!tok || tok.length < 20) return false;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tok));
  const key = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  const at = pdAuthCache.get(key);
  if (at && Date.now() - at < 10 * 60 * 1000) return true;
  // v24: must be able to read the Pine base (whoami alone passes any Airtable account).
  if (!(await rcBaseOk(request))) return false;
  pdAuthCache.set(key, Date.now());
  return true;
}

function pdHeaders(env, json) {
  const h = { Authorization: 'API-Key ' + env.PANDADOC_KEY };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function pdJson(r) {
  const text = await r.text();
  try { return JSON.parse(text); } catch (e) { return { raw: text.slice(0, 500) }; }
}

async function handlePandadoc(request, env, rest) {
  if (!env.PANDADOC_KEY) return jsonError('PANDADOC_KEY secret is not set on the worker', 500);
  if (!(await pdCallerOk(request))) return jsonError('Send your Airtable token as "Authorization: Bearer ..."', 401);
  if (rest[0] === 'file') {
    // v17: proof attachments for the packet. Airtable attachment hosts only.
    let u;
    try { u = new URL(new URL(request.url).searchParams.get('url') || ''); } catch (e) { return jsonError('Bad url', 400); }
    if (u.protocol !== 'https:' || !/(^|\.)airtableusercontent\.com$/.test(u.hostname)) return jsonError('Only Airtable attachment URLs', 403);
    const fr = await fetch(u.toString());
    if (!fr.ok) return jsonError('Attachment ' + fr.status, fr.status);
    return new Response(fr.body, { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': fr.headers.get('Content-Type') || 'application/octet-stream' } });
  }
  if (rest[0] !== 'documents') return jsonError('PandaDoc path not allowed', 403);
  const id = rest[1] || '';
  const m = request.method.toUpperCase();

  if (m === 'GET' && id) {
    if (!/^[A-Za-z0-9]{10,40}$/.test(id)) return jsonError('Bad document id', 400);
    const r = await fetch(`${PD_BASE}/documents/${id}/details`, { headers: pdHeaders(env) });
    const d = await pdJson(r);
    if (!r.ok) {
      // v16: failed uploads have no details; the status record carries the reason.
      const sr = await fetch(`${PD_BASE}/documents/${id}`, { headers: pdHeaders(env) });
      const st = await pdJson(sr);
      return jsonError('PandaDoc ' + r.status + ' (status: ' + (st.status || '?') + '): ' + JSON.stringify(st).slice(0, 900), r.status);
    }
    const fields = (d.fields || []).map(f => ({ type: f.type, role: f.assigned_to && f.assigned_to.role || f.role || '', name: f.name || f.field_id || '' }));
    const counts = {};
    fields.forEach(f => { counts[f.type] = (counts[f.type] || 0) + 1; });
    return jsonOk({ ok: true, id: d.id, name: d.name, status: d.status,
      recipients: (d.recipients || []).map(x => ({ email: x.email, role: x.role, type: x.recipient_type })),
      fields, counts, link: `https://app.pandadoc.com/a/#/documents/${d.id}` });
  }

  if (m === 'POST' && !id) {
    let form;
    try { form = await request.formData(); } catch (e) { return jsonError('Expected multipart form-data with file + data', 400); }
    const file = form.get('file');
    let data;
    try { data = JSON.parse(form.get('data') || '{}'); } catch (e) { return jsonError('data must be JSON', 400); }
    if (!file || typeof file === 'string') return jsonError('file (PDF) is required', 400);
    if (file.size > PD_MAX_BYTES) return jsonError('PDF is over 25 MB', 413);
    if (!data.name || !Array.isArray(data.recipients) || !data.recipients.length) return jsonError('name and recipients are required', 400);

    const out = new FormData();
    out.append('file', file, file.name || (data.name + '.pdf'));
    out.append('data', JSON.stringify({
      name: String(data.name).slice(0, 250),
      recipients: data.recipients,
      parse_form_fields: false,
      tags: Array.isArray(data.tags) ? data.tags : ['pine-line-item-review'],
    }));
    const cr = await fetch(`${PD_BASE}/documents`, { method: 'POST', headers: pdHeaders(env), body: out });
    const doc = await pdJson(cr);
    if (!cr.ok) return jsonError('PandaDoc create ' + cr.status + ': ' + JSON.stringify(doc).slice(0, 400), cr.status);
    const link = `https://app.pandadoc.com/a/#/documents/${doc.id}`;
    const sandbox = /^\[DEV\]/.test(doc.name || '');
    if (!data.send) return jsonOk({ ok: true, id: doc.id, status: doc.status, sent: false, sandbox, link });
    if (sandbox && !data.allowSandbox) return jsonOk({ ok: true, id: doc.id, status: doc.status, sent: false, sandbox: true, link, note: 'Worker is on the PandaDoc Sandbox key, so nothing was sent. Put the Production key in PANDADOC_KEY to go live.' });

    // PandaDoc processes the upload for a few seconds; sending before document.draft returns 409.
    let status = doc.status;
    for (let i = 0; i < 20 && status !== 'document.draft'; i++) {
      await new Promise(res => setTimeout(res, 1500));
      const sr = await fetch(`${PD_BASE}/documents/${doc.id}`, { headers: pdHeaders(env) });
      const s = await pdJson(sr);
      status = s.status;
      if (status === 'document.error') return jsonError('PandaDoc could not process the PDF', 502);
    }
    if (status !== 'document.draft') return jsonOk({ ok: true, id: doc.id, status, sent: false, link, note: 'Still processing - send it from PandaDoc' });
    const sendBody = {
      subject: data.send.subject || data.name,
      message: data.send.message || '',
      silent: !!data.send.silent,
    };
    const xr = await fetch(`${PD_BASE}/documents/${doc.id}/send`, { method: 'POST', headers: pdHeaders(env, true), body: JSON.stringify(sendBody) });
    const xs = await pdJson(xr);
    if (!xr.ok) return jsonOk({ ok: true, id: doc.id, status, sent: false, link, sendError: 'PandaDoc send ' + xr.status + ': ' + JSON.stringify(xs).slice(0, 300) });
    console.log(`[pine-pandadoc] sent ${doc.id} "${data.name}"`);
    return jsonOk({ ok: true, id: doc.id, status: xs.status || 'document.sent', sent: true, sandbox, link });
  }

  return jsonError('PandaDoc route: POST documents or GET documents/<id>', 405);
}


// -----------------------------------------------------------------------------
// v18: Pipedrive, read-only. The customer's synced emails for Create order.
// -----------------------------------------------------------------------------
const PIPE_BASE = 'https://api.pipedrive.com/v1';
const PIPE_CACHE_MS = 2 * 60 * 1000;
const pipeCache = new Map(); // email -> {at, body}

async function pipeGet(env, path, params) {
  const u = new URL(PIPE_BASE + path);
  Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, String(v)));
  u.searchParams.set('api_token', env.PIPEDRIVE_KEY);
  const r = await fetch(u.toString(), { headers: { Accept: 'application/json' } });
  let j = null;
  try { j = await r.json(); } catch (e) { j = null; }
  if (!r.ok || !j || j.success === false) {
    const why = (j && (j.error || j.error_info)) || ('HTTP ' + r.status);
    const err = new Error('Pipedrive ' + path.split('?')[0] + ': ' + why);
    err.status = r.status;
    throw err;
  }
  return j;
}

// Email HTML -> readable plain text (keeps line breaks so size lists stay on their lines).
function pipeText(html) {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
    .slice(0, 6000);
}

// v20: quoted earlier messages ("On … wrote:", "> …", Outlook "From: … Sent:") cut off, so a customer's
// email shown to another rep doesn't carry that rep's writing along with it.
function stripQuoted(t) {
  const s = String(t || '');
  const cut = s.search(/\n\s*(On .{4,200}wrote:|-{2,}\s*Original Message|From:\s.{2,200}\n\s*(Sent|Date):)/i);
  return (cut > 0 ? s.slice(0, cut) : s).split('\n').filter(l => !/^\s*>/.test(l)).join('\n').trim();
}

// v21: one order's deal + only the emails linked to it.
const pipeFieldCache = { at: 0, byName: null };
async function pipeDealFields(env) {
  if (pipeFieldCache.byName && Date.now() - pipeFieldCache.at < 6 * 3600 * 1000) return pipeFieldCache.byName;
  const j = await pipeGet(env, '/dealFields', { limit: 500 });
  const byName = {};
  (j.data || []).forEach(f => { byName[String(f.name || '').toLowerCase()] = { key: f.key, options: f.options || null }; });
  pipeFieldCache.byName = byName; pipeFieldCache.at = Date.now();
  return byName;
}
async function handlePipeDeal(env, params) {
  const order = String(params.get('order') || '').trim();
  if (!/^\d{3,7}$/.test(order)) return jsonError('Pass ?order=<Airtable order number>', 400);
  const ck = 'deal|' + order;
  const hit = pipeCache.get(ck);
  if (hit && Date.now() - hit.at < PIPE_CACHE_MS) return jsonOk({ ...hit.body, cached: true });
  const keys = [...new Set([env.PIPEDRIVE_KEY].concat(Object.keys(env).filter(k => /^PIPEDRIVE_KEY_/.test(k)).map(k => env[k])).filter(k => typeof k === 'string' && k))];
  const withKey = k => Object.assign({}, env, { PIPEDRIVE_KEY: k });
  const sr = await pipeGet(env, '/deals/search', { term: order, fields: 'title', limit: 10 });
  const cands = ((sr.data && sr.data.items) || []).map(x => x.item).filter(d => d && new RegExp('^\\s*' + order + '\\b').test(String(d.title || '')));
  const body = { ok: true, order, deal: null, messages: [], keys: keys.length };
  if (!cands.length) { pipeCache.set(ck, { at: Date.now(), body }); return jsonOk(body); }
  const pick = cands.find(d => d.status === 'open') || cands[0];
  const [dj, fields] = await Promise.all([pipeGet(env, '/deals/' + pick.id), pipeDealFields(env).catch(() => ({}))]);
  const d = dj.data || {};
  const cf = name => { const f = fields[name]; if (!f) return null; let v = d[f.key]; if (v == null || v === '') return null;
    if (f.options) { const o = f.options.find(x => String(x.id) === String(v)); if (o) v = o.label; } return v; };
  body.deal = {
    id: d.id, title: d.title || '', status: d.status || '', value: d.value || 0,
    owner: (d.user_id && (d.user_id.name || d.user_id)) || '', stage: d.stage_id || null,
    url: 'https://pineprintshop.pipedrive.com/deal/' + d.id,
    delivery: cf('[big4] delivery method'), deadline: cf('hard deadline or asap'), dueDate: d.expected_close_date || null,
    description: cf('project description'),
    person: (d.person_id && d.person_id.name) || '', personEmail: ((d.person_id && d.person_id.email) || []).map(e => e && e.value).filter(Boolean)[0] || '',
  };
  // v24: the "Send to client" task (Pipedrive adds it at Awaiting Approval; reps tick it when the proof is out).
  try {
    const aj = await pipeGet(env, '/deals/' + d.id + '/activities', { limit: 100 });
    const stc = (aj.data || []).filter(a => a && /send\s*to\s*client/i.test(String(a.subject || '')))
      .sort((a, b) => String(b.add_time || '').localeCompare(String(a.add_time || '')));
    const done = stc.find(a => a.done);
    const t = done || stc[0];
    body.deal.sendToClient = t ? { done: !!t.done, doneAt: (t.done && t.marked_as_done_time) || null, dueDate: t.due_date || null } : null;
  } catch (e) { body.deal.sendToClient = null; body.deal.sendToClientError = e.message || String(e); }
  const robot = /(no-?reply|airtableemail|shipstation|mailer-daemon)/i;
  const seen = new Map();
  const lists = await Promise.all(keys.map(k => pipeGet(withKey(k), '/deals/' + d.id + '/mailMessages', { limit: 50 }).then(j => ({ k, j })).catch(() => ({ k, j: { data: [] } }))));
  lists.forEach(({ k, j }) => (j.data || []).map(x => x.data || x).forEach(m => {
    if (!m || !m.id || m.draft_flag || m.group_sending_flag || robot.test(((m.from || [])[0] || {}).email_address || '')) return;
    if (!seen.has(m.id)) seen.set(m.id, { m, k });
  }));
  const pine = a => /@pineprintshop\.com$/i.test(a || '');
  const all = [...seen.values()].sort((a, b) => String(b.m.message_time || b.m.add_time || '').localeCompare(String(a.m.message_time || a.m.add_time || ''))).slice(0, 15);
  body.messages = all.map(({ m }) => { const from = String((((m.from || [])[0]) || {}).email_address || '').toLowerCase();
    return { id: m.id, subject: m.subject || '', from, to: (m.to || []).map(x => (x && x.email_address) || '').filter(Boolean),
      date: m.message_time || m.add_time || '', snippet: m.snippet || '', text: '', cust: !pine(from) }; });
  const keyOf = new Map(all.map(x => [x.m.id, x.k]));
  const want = [...new Set(body.messages.filter(m => m.cust).slice(0, 5).concat(body.messages.slice(0, 3)))];
  await Promise.all(want.map(async m => { try { const one = await pipeGet(withKey(keyOf.get(m.id)), '/mailbox/mailMessages/' + m.id, { include_body: 1 }); m.text = pipeText(one.data && one.data.body); } catch (e) { m.text = ''; } }));
  pipeCache.set(ck, { at: Date.now(), body });
  return jsonOk(body);
}

async function handlePipedrive(request, env, rest, params) {
  if (rest[0] === 'reconnect') return handleReconnect(request, env);   // v23 (own auth + CORS, below)
  // v20 privacy: &inbox= is the order rep's Pine addresses (comma list, e.g. hello@…,patrick@…).
  //  - threads the rep is part of: everything except mail written by OTHER Pine addresses
  //  - anything else: only messages the CUSTOMER wrote (quotes cut), e.g. Jon's reorder sent to chris@
  //  Each rep's own Pipedrive key reads their private synced mail: PIPEDRIVE_KEY_<part before @>, e.g.
  //  PIPEDRIVE_KEY_HELLO. Customer-written mail is gathered with every Pipedrive key the worker has.
  const repAddrs = (params.get('inbox') || '').toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
  if (repAddrs.some(a => !/^[^@\s]+@pineprintshop\.com$/.test(a))) return jsonError('inbox must be pineprintshop.com addresses', 400);
  const keyNameOf = a => 'PIPEDRIVE_KEY_' + a.split('@')[0].replace(/[^a-z0-9]/g, '_').toUpperCase();
  const repKeyName = repAddrs.map(keyNameOf).find(k => env[k]) || '';
  const keyNote = repAddrs.length && !repKeyName ? repAddrs.map(keyNameOf).join(' / ') + ' not set; using PIPEDRIVE_KEY, so that rep\'s private emails are hidden' : '';
  const repKey = repKeyName ? env[repKeyName] : env.PIPEDRIVE_KEY;
  if (!repKey) return jsonError('PIPEDRIVE_KEY secret is not set on the worker', 500);
  const withKey = k => Object.assign({}, env, { PIPEDRIVE_KEY: k });
  const allKeys = [...new Set([repKey, env.PIPEDRIVE_KEY].concat(Object.keys(env).filter(k => /^PIPEDRIVE_KEY_/.test(k)).map(k => env[k])).filter(k => typeof k === 'string' && k))];
  if (!(await pdCallerOk(request))) return jsonError('Send your Airtable token as "Authorization: Bearer ..."', 401);
  try {
    if (rest[0] === 'me') {
      const j = await pipeGet(withKey(repKey), '/users/me');
      return jsonOk({ ok: true, user: { name: j.data && j.data.name, email: j.data && j.data.email }, key: repKeyName || 'PIPEDRIVE_KEY', keyNote, keys: allKeys.length });
    }
    if (rest[0] === 'deal') return await handlePipeDeal(Object.assign({}, env, { PIPEDRIVE_KEY: env.PIPEDRIVE_KEY || repKey }), params);   // v21
    if (rest[0] !== 'emails') return jsonError('Pipedrive path not allowed', 403);
    const email = (params.get('email') || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return jsonError('Pass ?email=customer@example.com', 400);
    const limit = Math.min(Math.max(parseInt(params.get('limit') || '5', 10) || 5, 1), 15);
    const ck = email + '|' + limit + '|' + repAddrs.join(',') + '|' + (repKeyName || 'shared') + '|' + allKeys.length;
    const hit = pipeCache.get(ck);
    if (hit && Date.now() - hit.at < PIPE_CACHE_MS) return jsonOk({ ...hit.body, cached: true });

    const ps = await pipeGet(withKey(repKey), '/persons/search', { term: email, fields: 'email', exact_match: 'true', limit: 5 });
    const items = (ps.data && ps.data.items) || [];
    const person = items.length ? items[0].item : null;
    let body = { ok: true, email, person: null, deals: [], messages: [] };
    if (repAddrs.length) { body.inbox = repAddrs.join(','); if (keyNote) body.keyNote = keyNote; }
    if (person) {
      body.person = { id: person.id, name: person.name };
      const [dj, ...mjs] = await Promise.all([
        pipeGet(withKey(repKey), '/persons/' + person.id + '/deals', { status: 'all_not_deleted', limit: 10, sort: 'update_time DESC' }).catch(() => ({ data: [] })),
        ...allKeys.map(k => pipeGet(withKey(k), '/persons/' + person.id + '/mailMessages', { limit: 50 }).then(j => ({ k, j })).catch(e => ({ k, j: { data: [] }, err: e.message }))),
      ]);
      body.deals = (dj.data || []).map(d => ({ id: d.id, title: d.title, status: d.status, stage: d.stage_id, updated: d.update_time }));
      const repErr = mjs.find(x => x.k === repKey && x.err); if (repErr) body.mailError = repErr.err;
      // Skip bulk sends (anniversary blasts) and robots (Airtable, ShipStation): sales want the conversation.
      const robot = /(no-?reply|airtableemail|shipstation|mailer-daemon)/i;
      const seen = new Map();   // id -> {m, k}; the rep's own key wins
      mjs.forEach(({ k, j }) => (j.data || []).map(x => x.data || x).forEach(m => {
        if (!m || !m.id || m.group_sending_flag || m.draft_flag || robot.test(((m.from || [])[0] || {}).email_address || '')) return;
        if (!seen.has(m.id) || k === repKey) seen.set(m.id, { m, k });
      }));
      const fromOf = m => String((((m.from || [])[0]) || {}).email_address || '').toLowerCase();
      const addrs = m => [].concat(m.from || [], m.to || [], m.cc || []).map(x => String((x && x.email_address) || '').toLowerCase());
      const pine = a => /@pineprintshop\.com$/.test(a);
      const all = [...seen.values()].sort((a, b) => String(b.m.message_time || b.m.add_time || '').localeCompare(String(a.m.message_time || a.m.add_time || '')));
      let kept = all.map(x => ({ ...x, outside: false }));
      if (repAddrs.length) {
        const repThreads = new Set(all.filter(x => addrs(x.m).some(a => repAddrs.includes(a))).map(x => x.m.mail_thread_id || ('m' + x.m.id)));
        kept = [];
        all.forEach(x => {
          const f = fromOf(x.m), inRep = repThreads.has(x.m.mail_thread_id || ('m' + x.m.id));
          if (inRep && !(pine(f) && !repAddrs.includes(f))) kept.push({ ...x, outside: false });   // rep's conversation, minus other reps' writing
          else if (!inRep && f === email) kept.push({ ...x, outside: true });                        // the customer writing to another Pine address
        });
      }
      const shown = kept.slice(0, limit);
      body.messages = shown.map(({ m, outside }) => ({
        id: m.id,
        subject: m.subject || '',
        from: fromOf(m),
        to: outside ? (m.to || []).map(x => (x && x.email_address) || '').filter(a => !pine(String(a).toLowerCase())) : (m.to || []).map(x => (x && x.email_address) || '').filter(Boolean),
        cc: outside ? [] : (m.cc || []).map(x => (x && x.email_address) || '').filter(Boolean),
        deal_id: m.deal_id || null,
        thread: m.mail_thread_id || null,
        outside,                                                   // true = customer's email to another Pine inbox
        date: m.message_time || m.add_time || '',
        snippet: outside ? stripQuoted(m.snippet || '') : (m.snippet || ''),
        text: '',
      }));
      // Full text for the customer's newest 5 + the newest 3 overall (the sizes are in the replies).
      const keyOf = new Map(shown.map(x => [x.m.id, x.k]));
      const fromCust = body.messages.filter(m => m.from === email).slice(0, 5);
      const want = [...new Set(fromCust.concat(body.messages.slice(0, 3)))];
      await Promise.all(want.map(async (m) => {
        try {
          const one = await pipeGet(withKey(keyOf.get(m.id) || repKey), '/mailbox/mailMessages/' + m.id, { include_body: 1 });
          m.text = pipeText(one.data && one.data.body);
          if (m.outside) m.text = stripQuoted(m.text);
        } catch (e) { m.text = ''; }
      }));
    }
    pipeCache.set(ck, { at: Date.now(), body });
    return jsonOk(body);
  } catch (e) {
    return jsonError(e.message, e.status === 401 ? 502 : 502);
  }
}


// -----------------------------------------------------------------------------
// v19: read customer emails with Claude -> a DRAFT order for Create order v2.
// Raw HTTP on purpose: this worker is pasted into the Cloudflare dashboard (no npm/bundler).
// Nothing is written anywhere; the page shows the draft and the person applies/edits it.
// -----------------------------------------------------------------------------
const AI_MODEL = 'claude-opus-5-5';
const AI_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', 'OSFA'];

function aiSchema(locations, types) {
  const str = { type: 'string' };
  return {
    type: 'object',
    additionalProperties: false,
    required: ['summary', 'lines', 'prints', 'questions'],
    properties: {
      summary: str,
      lines: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['style', 'brand', 'color', 'sizes', 'qty_total', 'womens', 'youth', 'prints', 'notes'],
          properties: {
            style: str, brand: str, color: str, qty_total: { type: 'integer' },
            sizes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['size', 'qty'],
              properties: { size: { type: 'string', enum: AI_SIZES }, qty: { type: 'integer' } } } },
            womens: { type: 'boolean' }, youth: { type: 'boolean' },
            prints: { type: 'array', items: str },
            notes: str,
          },
        },
      },
      prints: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['ref', 'nickname', 'location', 'type', 'colors', 'underbase', 'inks', 'repeat_of', 'print_notes'],
          properties: {
            ref: str, nickname: str,
            location: locations.length ? { type: 'string', enum: locations } : str,
            type: types.length ? { type: 'string', enum: types } : str,
            colors: { type: 'integer' }, underbase: { type: 'boolean' },
            inks: str, repeat_of: str, print_notes: str,
          },
        },
      },
      questions: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['text', 'ask_customer', 'kind', 'lines', 'prints'],
          properties: {
            text: str, ask_customer: str,
            kind: { type: 'string', enum: ['sizes', 'same_art', 'print_details', 'artwork', 'scope', 'other'] },
            lines: { type: 'array', items: { type: 'integer' } },
            prints: { type: 'array', items: str },
          },
        },
      },
    },
  };
}

const AI_SYSTEM = `You help a screen print shop (Pine) turn a customer's emails into a draft order. Sales will check every field before anything is saved, so be accurate rather than complete: leave a field empty ("" or 0 or []) when the emails don't say it, and put what's unclear in "questions".

- lines: one per garment + color (the same shirt in two colors is two lines). style = the style number as written (e.g. 1717, 5001, BAN1202). brand only if named. sizes only from the newest request, never totals you had to guess; one-size items (hats, bandanas, totes) use OSFA. womens/youth only when stated. prints = the refs of the prints on that line. notes = anything for the proofer that isn't a print (placement tweaks, "same as last year", tags).
- prints: one per distinct artwork + location. ref is your own short label ("P1", "P2") used by lines. nickname = a short name for the art (customer's words). location and type must be from the allowed lists. For screen prints: colors = number of ink colors, underbase true when printing light inks on dark garments or when asked; type "No Base W/B" for light garments, "EZP Base + W/B" when an underbase is needed, "Discharge" only if asked. inks = the ink colors / Pantones named. repeat_of = the Imprint ID from pastImprints when the customer clearly asks for the same art as before, else "". print_notes = size, placement and other press details for that print.
- If an email is a reply chain, the newest message wins. Read the newest request from the customer; older emails about a past order's proofs, invoices or payment are background only.
- currentLines are garments already on the order screen (often copied from a past order for a reorder). When the customer's request is for those same garments, return lines with the same style and color so they get filled, and use repeat_of for their prints instead of describing the art again.
- qty_total = the total pieces asked for on that line (e.g. "75 tees" with no sizes gives 75; sizes given gives their sum); 0 if not said.
- questions: only what is truly still open. If the thread already answers it (the customer or the Pine rep says e.g. "both hats get the same design"), apply it to the lines and prints and do NOT ask. Each question has:
  text = short, for Pine sales; ask_customer = the same question written plainly to the customer (no internal jargon);
  lines = the indexes (0-based, into your lines array) it is about; prints = the print refs it is about;
  kind = "sizes" (no size breakdown, or the customer asked Pine to suggest one), "same_art" (a print probably also goes on other lines: put the print in prints and the lines that might get it in lines), "print_details" (locations, ink colors, Pantones, thread colors), "artwork" (print-ready files not received), "scope" (is something part of this order or a later one), "other".
- summary = one sentence of what the customer wants.`;

async function handleAi(request, env, rest) {
  if (!env.ANTHROPIC_API_KEY) return jsonError('ANTHROPIC_API_KEY is not set on the worker', 500);
  if (!(await pdCallerOk(request))) return jsonError('Send your Airtable token as "Authorization: Bearer ..."', 401);
  if (rest[0] !== 'order-from-email') return jsonError('AI path not allowed', 403);
  let body;
  try { body = await request.json(); } catch (e) { return jsonError('Send JSON', 400); }
  const emails = (Array.isArray(body.emails) ? body.emails : []).slice(0, 6)
    .map(m => ({ from: String(m.from || ''), date: String(m.date || ''), subject: String(m.subject || ''), text: String(m.text || '').slice(0, 8000) }))
    .filter(m => m.text || m.subject);
  if (!emails.length) return jsonError('No email text to read', 400);
  const locations = (Array.isArray(body.locations) ? body.locations : []).map(String).slice(0, 40);
  const types = (Array.isArray(body.types) ? body.types : []).map(String).slice(0, 40);
  const past = (Array.isArray(body.pastImprints) ? body.pastImprints : []).slice(0, 60)
    .map(p => ({ id: String(p.id || ''), nick: String(p.nick || ''), loc: String(p.loc || ''), type: String(p.type || ''), inks: String(p.inks || '') }));
  const current = (Array.isArray(body.currentLines) ? body.currentLines : []).slice(0, 20)
    .map(l => ({ style: String(l.style || ''), color: String(l.color || ''), prints: (Array.isArray(l.prints) ? l.prints : []).map(String).slice(0, 8) }));
  const user = 'Customer: ' + String(body.customer || '') + '\nSales rep: ' + String(body.rep || '') +
    '\n\ncurrentLines (already on screen): ' + JSON.stringify(current) +
    '\n\nAllowed locations: ' + JSON.stringify(locations) + '\nAllowed print types: ' + JSON.stringify(types) +
    '\n\npastImprints (this customer):\n' + JSON.stringify(past) +
    '\n\nEmails, newest first:\n' + emails.map((m, i) => '--- Email ' + (i + 1) + ' · ' + m.date + ' · from ' + m.from + ' · ' + m.subject + '\n' + m.text).join('\n\n');

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'server-side-fallback-2026-07-01',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 16000,
      fallbacks: 'default',
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: aiSchema(locations, types) } },
      system: AI_SYSTEM,
      messages: [{ role: 'user', content: user }],
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return jsonError('Claude ' + r.status + ': ' + ((j.error && j.error.message) || 'request failed'), 502);
  if (j.stop_reason === 'refusal') return jsonError('Claude declined to read these emails', 502);
  if (j.stop_reason === 'max_tokens') return jsonError('Draft was too long to finish; try fewer emails', 502);
  const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  let draft;
  try { draft = JSON.parse(text); } catch (e) { return jsonError('Claude answer was not readable JSON', 502); }
  return jsonOk({ ok: true, draft, model: j.model, usage: j.usage });
}


// -----------------------------------------------------------------------------
// v23: GET /proxy/pipedrive/reconnect - Patrick's Pipedrive conditions per customer org, read-only.
// See the v23 notes at the top for where each field comes from and the subrequest budget.
// -----------------------------------------------------------------------------
const RC_ORIGIN = 'https://pineprintshop.github.io';
const RC_CORS = {
  'Access-Control-Allow-Origin': RC_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin',
};
const RC_BASE = 'appJkaLk8DykjsgHR';
const RC_ORDERS = 'tbl8Tf0AeS9gnHOOS';
const RC_PROBE_FIELD = 'fldhS4z28CdGmS1j5';   // Order Status: harmless, only proves the token can read the base
const RC_V1 = 'https://api.pipedrive.com/v1';
const RC_V2 = 'https://api.pipedrive.com/api/v2';
const RC_CACHE_MS = 60 * 60 * 1000;           // finished answer: 1 hour
const RC_STATE_MS = 20 * 60 * 1000;           // a half-finished read older than this starts over
const RC_AUTH_MS = 10 * 60 * 1000;
const RC_BUDGET = 40;                         // Pipedrive calls per request (free plan: 50 subrequests in all)
const RC_CACHE_KEY = 'https://pine-workers.internal/pipedrive-reconnect-v23';
// Field keys and options as of 2026-10-15 (Pipedrive getAccountContext). Used only if the field lists can't be read.
const RC_FALLBACK = {
  workflowKey: '2f26550d7edc8a22440943c7de00bc4c7139288c',   // deal (and lead) field "Enroll in Workflow" (set)
  tierKey: '7c11d4250a7bf5660103564fdca4db1945428fd0',       // organization field "Customer Tier" (enum)
  tiers: { 169: 'Platinum', 170: 'Gold', 171: 'Silver', 172: 'Bronze' },
  workflows: { 143: 'Breweries Drip', 144: 'Bars / Restaurants Drip', 173: 'Coffee Drip', 145: 'Bike Industry Drip',
    146: 'Gym / Martial Arts Drip', 147: 'Band Drip', 148: 'Music Festival Drip', 149: 'Race / Run Drip', 175: '2nd Cold Drip',
    162: 'Inactive Customer', 163: 'Dark Lead', 164: 'Platinum Customer', 165: 'Gold Customer', 166: 'Silver Customer',
    167: 'Bronze Customer', 168: 'Social Media Leads', 176: 'CSU Contact Procurement', 206: 'Reptile Tradeshow Leads', 219: 'Josh Contact Drip' },
};
const rcAuthCache = new Map();   // sha-256(token) -> passedAt (base check)
let rcDone = null;               // {at, body}
let rcState = null;              // the read in progress (see rcNew)
let rcRun = null;                // one step at a time per instance

function rcJson(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { ...RC_CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

async function rcBaseOk(request) {
  const tok = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!tok) return false;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('rc|' + tok));
  const key = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  const at = rcAuthCache.get(key);
  if (at && Date.now() - at < RC_AUTH_MS) return true;
  const u = `https://api.airtable.com/v0/${RC_BASE}/${RC_ORDERS}?maxRecords=1&pageSize=1&returnFieldsByFieldId=true&fields%5B%5D=${RC_PROBE_FIELD}`;
  const r = await fetch(u, { headers: { Authorization: 'Bearer ' + tok } });
  if (!r.ok) return false;
  rcAuthCache.set(key, Date.now());
  return true;
}

async function rcCacheGet() {
  try {
    if (typeof caches === 'undefined' || !caches.default) return null;
    const r = await caches.default.match(RC_CACHE_KEY);
    if (!r) return null;
    const body = await r.json();
    const at = Date.parse(body.asOf);
    return body && body.ok && Date.now() - at < RC_CACHE_MS ? { at, body } : null;
  } catch (e) { return null; }
}
async function rcCachePut(body) {
  try {
    if (typeof caches === 'undefined' || !caches.default) return;
    await caches.default.put(RC_CACHE_KEY, new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=3600' } }));
  } catch (e) { /* workers.dev / no cache: memory only */ }
}

async function handleReconnect(request, env) {
  const key = env.PIPEDRIVE_RECONNECT_KEY || env.PIPEDRIVE_KEY;
  if (!key) return rcJson({ error: 'PIPEDRIVE_KEY secret is not set on the worker' }, 500);
  if (!(await pdCallerOk(request))) return rcJson({ error: 'Send your Airtable token as "Authorization: Bearer ..."' }, 401);
  if (!(await rcBaseOk(request))) return rcJson({ error: 'This Airtable token can\'t read the Pine base' }, 403);
  if (rcDone && Date.now() - rcDone.at < RC_CACHE_MS) return rcJson({ ...rcDone.body, cached: true });
  const shared = await rcCacheGet();
  if (shared) { rcDone = shared; return rcJson({ ...shared.body, cached: true }); }
  const budget = Math.max(5, Math.min(900, parseInt(env.RECONNECT_BUDGET || '', 10) || RC_BUDGET));
  if (!rcRun) rcRun = rcStep(key, budget).finally(() => { rcRun = null; });
  let out;
  try { out = await rcRun; } catch (e) { return rcJson({ error: e.message || String(e) }, 502); }
  if (out.done) return rcJson(out.body);
  return rcJson({ ok: false, partial: true, progress: out.progress, retryMs: out.retryMs }, 202);
}

function rcNew() {
  return { at: Date.now(), stage: 'fields', f: null, users: {}, cursor: null, start: 0, agg: {}, orgIds: null, orgIdx: 0,
    orgs: {}, actIds: null, actIdx: 0, acts: {}, pages: { deals: 0, leads: 0, orgs: 0, activities: 0 }, notes: [] };
}

async function rcGet(st, key, url, params) {
  const u = new URL(url);
  Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v)); });
  u.searchParams.set('api_token', key);
  for (let tries = 0; ; tries++) {
    if (st.left <= 0) { const e = new Error('budget'); e.budget = true; throw e; }
    st.left--;
    const r = await fetch(u.toString(), { headers: { Accept: 'application/json' } });
    if (r.status === 429) {
      const wait = Math.min(5, Math.max(1, parseInt(r.headers.get('retry-after') || '2', 10) || 2));
      if (tries < 1 && st.left > 0) { await new Promise(res => setTimeout(res, wait * 1000)); continue; }
      const e = new Error('rate'); e.rate = true; e.wait = wait; throw e;
    }
    let j = null;
    try { j = await r.json(); } catch (e) { j = null; }
    if (!r.ok || !j || j.success === false) {
      const e = new Error('Pipedrive ' + u.pathname + ': ' + ((j && (j.error || j.error_info)) || ('HTTP ' + r.status)));
      e.status = r.status; throw e;
    }
    return j;
  }
}

// Set / enum values come as an array of ids, an array of {id,label}, a number, or "162,165".
function rcIds(v) {
  if (v === null || v === undefined || v === '') return [];
  const a = Array.isArray(v) ? v : String(v).split(',');
  return a.map(x => (x && typeof x === 'object') ? (x.id != null ? x.id : x.label) : x).map(x => String(x).trim()).filter(Boolean);
}
function rcDay(v) { const s = String(v || ''); return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null; }
function rcMax(a, b) { return !a ? b : !b ? a : (a > b ? a : b); }

async function rcStep(key, budget) {
  if (!rcState || Date.now() - rcState.at > RC_STATE_MS) rcState = rcNew();
  const st = rcState;
  st.left = budget;
  const progress = () => ({ stage: st.stage, pages: { ...st.pages }, orgs: st.orgIds ? st.orgIds.length : null });
  try {
    if (st.stage === 'fields') {
      const f = { workflowKey: RC_FALLBACK.workflowKey, tierKey: RC_FALLBACK.tierKey, tiers: { ...RC_FALLBACK.tiers }, workflows: { ...RC_FALLBACK.workflows } };
      const opts = o => { const m = {}; (o || []).forEach(x => { m[String(x.id)] = x.label; }); return m; };
      try {
        const df = await rcGet(st, key, RC_V1 + '/dealFields', { limit: 500 });
        const w = (df.data || []).find(x => /^enroll in workflow$/i.test(String(x.name || '').trim()));
        if (w) { f.workflowKey = w.key; f.workflows = opts(w.options); }
      } catch (e) { if (e.budget || e.rate) throw e; st.notes.push('deal fields not readable; using the Oct 15 workflow key'); }
      try {
        const of = await rcGet(st, key, RC_V1 + '/organizationFields', { limit: 500 });
        const t = (of.data || []).find(x => /^customer tier$/i.test(String(x.name || '').trim()));
        if (t) { f.tierKey = t.key; f.tiers = opts(t.options); }
      } catch (e) { if (e.budget || e.rate) throw e; st.notes.push('organization fields not readable; using the Oct 15 tier key'); }
      const us = await rcGet(st, key, RC_V1 + '/users');
      (us.data || []).forEach(u => { st.users[String(u.id)] = String(u.name || '').trim(); });
      st.f = f; st.stage = 'deals'; st.cursor = null;
    }
    if (st.stage === 'deals') {
      for (;;) {
        const j = await rcGet(st, key, RC_V2 + '/deals', { limit: 500, cursor: st.cursor, custom_fields: st.f.workflowKey, include_fields: 'last_outgoing_mail_time' });
        st.pages.deals++;
        (j.data || []).forEach(d => {
          const org = d.org_id && typeof d.org_id === 'object' ? d.org_id.value || d.org_id.id : d.org_id;
          if (!org || d.is_deleted) return;
          const a = st.agg[org] || (st.agg[org] = { won: 0, wf: {}, mail: null });
          if (d.status === 'won') a.won++;
          rcIds((d.custom_fields || {})[st.f.workflowKey]).forEach(id => { a.wf[st.f.workflows[id] || id] = 1; });
          a.mail = rcMax(a.mail, rcDay(d.last_outgoing_mail_time));
        });
        st.cursor = (j.additional_data && j.additional_data.next_cursor) || null;
        if (!st.cursor) break;
      }
      st.stage = 'leads'; st.start = 0;
    }
    if (st.stage === 'leads') {
      try {
        for (;;) {
          const j = await rcGet(st, key, RC_V1 + '/leads', { limit: 500, start: st.start });
          st.pages.leads++;
          (j.data || []).forEach(l => {
            const org = l.organization_id;
            if (!org) return;
            const v = l[st.f.workflowKey] !== undefined ? l[st.f.workflowKey] : (l.custom_fields || {})[st.f.workflowKey];
            const ids = rcIds(v);
            if (!ids.length) return;
            const a = st.agg[org] || (st.agg[org] = { won: 0, wf: {}, mail: null });
            ids.forEach(id => { a.wf[st.f.workflows[id] || id] = 1; });
          });
          const pg = j.additional_data && j.additional_data.pagination;
          if (!pg || !pg.more_items_in_collection || !(j.data || []).length) break;
          st.start = pg.next_start != null ? pg.next_start : st.start + (j.data || []).length;
        }
      } catch (e) { if (e.budget || e.rate) throw e; st.notes.push('leads not readable (' + e.message + '); workflows come from deals only'); }
      st.stage = 'orgs'; st.orgIds = Object.keys(st.agg).filter(id => st.agg[id].won > 0); st.orgIdx = 0;
    }
    if (st.stage === 'orgs') {
      while (st.orgIdx < st.orgIds.length) {
        const ids = st.orgIds.slice(st.orgIdx, st.orgIdx + 100);
        const j = await rcGet(st, key, RC_V2 + '/organizations', { ids: ids.join(','), limit: 100, include_fields: 'won_deals_count,last_activity_id', custom_fields: st.f.tierKey });
        st.pages.orgs++;
        (j.data || []).forEach(o => { if (!o || o.is_deleted) return; st.orgs[o.id] = o; });
        st.orgIdx += ids.length;
      }
      st.stage = 'activities';
      st.actIds = [...new Set(Object.values(st.orgs).map(o => o.last_activity_id).filter(Boolean).map(String))]; st.actIdx = 0;
    }
    if (st.stage === 'activities') {
      try {
        while (st.actIdx < st.actIds.length) {
          const ids = st.actIds.slice(st.actIdx, st.actIdx + 100);
          const j = await rcGet(st, key, RC_V2 + '/activities', { ids: ids.join(','), limit: 100 });
          st.pages.activities++;
          (j.data || []).forEach(a => { if (a && a.id) st.acts[a.id] = rcDay(a.due_date) || rcDay(a.marked_as_done_time) || rcDay(a.update_time); });
          st.actIdx += ids.length;
        }
      } catch (e) { if (e.budget || e.rate) throw e; st.notes.push('activities not readable (' + e.message + '); no last activity dates'); }
      st.stage = 'done';
    }
    // Assemble. Only orgs with a won deal; dates and labels only (no contact details).
    const orgs = Object.values(st.orgs).filter(o => (o.won_deals_count == null ? st.agg[o.id].won : o.won_deals_count) > 0).map(o => {
      const a = st.agg[o.id] || { wf: {}, mail: null };
      const ownerId = o.owner_id && typeof o.owner_id === 'object' ? o.owner_id.id || o.owner_id.value : o.owner_id;
      const tierId = rcIds((o.custom_fields || {})[st.f.tierKey])[0];
      return {
        id: o.id, name: String(o.name || '').trim(), owner: st.users[String(ownerId)] || '',
        lastActivity: o.last_activity_id ? (st.acts[o.last_activity_id] || null) : null,
        lastEmailSent: a.mail || null,
        tier: tierId ? (st.f.tiers[tierId] || tierId) : null,
        workflows: Object.keys(a.wf).sort(),
      };
    }).sort((x, y) => x.name.localeCompare(y.name));
    const body = { ok: true, asOf: new Date().toISOString(), orgs,
      counts: { orgs: orgs.length, dealPages: st.pages.deals, leadPages: st.pages.leads, orgBatches: st.pages.orgs, activityBatches: st.pages.activities },
      notes: st.notes };
    rcDone = { at: Date.now(), body };
    rcState = null;
    await rcCachePut(body);
    return { done: true, body };
  } catch (e) {
    if (e.budget) return { done: false, progress: progress(), retryMs: 300 };
    if (e.rate) return { done: false, progress: progress(), retryMs: (e.wait || 2) * 1000 };
    throw e;
  }
}


// -----------------------------------------------------------------------------
// v25: Google Drive (service account, shared drive only). See the v25 notes at the top.
// -----------------------------------------------------------------------------
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
const DRIVE_MAX_BYTES = 25 * 1024 * 1024;
let driveTok = null;   // {token, exp, key}   v26: tied to the key, so a changed GOOGLE_SA_KEY signs in again

function driveErr(message, status, code, extra) {
  return new Response(JSON.stringify(Object.assign({ error: message, code }, extra || {})), { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
}
function b64url(bytes) {
  let s = ''; const a = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(bytes);
  for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
// v26: the service account's email (not secret), or '' when the key can't be read
function driveAccount(env) {
  try { const k = JSON.parse(env.GOOGLE_SA_KEY); return (k && typeof k.client_email === 'string') ? k.client_email : ''; } catch (e) { return ''; }
}
// v26: every failure here is a sign-in failure (e.signin). Messages are our own words or Google's reason, never the key.
function signinFail(why) { const e = new Error('Google sign-in failed: ' + why); e.signin = true; return e; }
async function driveToken(env) {
  if (driveTok && driveTok.key === env.GOOGLE_SA_KEY && Date.now() < driveTok.exp - 60000) return driveTok.token;
  let key; try { key = JSON.parse(env.GOOGLE_SA_KEY); } catch (e) { throw signinFail('GOOGLE_SA_KEY is not valid JSON (paste the whole key file)'); }
  if (!key || typeof key !== 'object') throw signinFail('GOOGLE_SA_KEY is not a service account key file');
  if (!key.client_email) throw signinFail('GOOGLE_SA_KEY has no client_email (paste the whole key file)');
  if (!key.private_key) throw signinFail('GOOGLE_SA_KEY has no private_key (paste the whole key file)');
  let pk;
  try {
    const pem = String(key.private_key).replace(/-----[^-]+-----/g, '').replace(/\\n/g, '').replace(/\s+/g, '');
    const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
    pk = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  } catch (e) { throw signinFail('the private_key in GOOGLE_SA_KEY can\'t be read (paste the whole key file again)'); }
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({ iss: key.client_email, scope: 'https://www.googleapis.com/auth/drive', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pk, new TextEncoder().encode(head + '.' + body)));
  let r;
  try {
    r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + head + '.' + body + '.' + b64url(sig) });
  } catch (e) { throw signinFail('Google\'s sign-in server didn\'t answer'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) {
    const why = [j.error, j.error_description].filter(x => typeof x === 'string' && x).join(': ').slice(0, 300);
    throw signinFail(why || ('HTTP ' + r.status));
  }
  driveTok = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000, key: env.GOOGLE_SA_KEY };
  return driveTok.token;
}
// v27: GOOGLE_DRIVE_ID may be pasted with spaces, a line break or as the whole Drive address; use just the ID.
function sharedDriveId(env) { const raw = String(env.GOOGLE_DRIVE_ID || '').trim(); return driveId(raw) || raw.replace(/[?#].*$/, ''); }
// a safe hint of the ID in use (first 3 + last 3 characters and the length), so a wrong paste is easy to spot
function driveIdHint(env) { const v = sharedDriveId(env); return v ? v.slice(0, 3) + '…' + v.slice(-3) + ' (' + v.length + ' characters)' : 'none'; }
function driveId(v) {
  v = String(v || '').trim();
  const m = v.match(/\/folders\/([A-Za-z0-9_-]{10,})/) || v.match(/[?&]id=([A-Za-z0-9_-]{10,})/) || v.match(/\/d\/([A-Za-z0-9_-]{10,})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{10,}$/.test(v) ? v : '';
}
// v26: noAllDrives = don't add supportsAllDrives (drives.get doesn't take it)
async function driveGet(env, path, noAllDrives) {
  const tok = await driveToken(env);
  const r = await fetch(DRIVE_API + path + (noAllDrives ? '' : (path.includes('?') ? '&' : '?') + 'supportsAllDrives=true'), { headers: { Authorization: 'Bearer ' + tok } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error((j.error && j.error.message) || ('Drive ' + r.status)); e.status = r.status; throw e; }
  return j;
}
const DRIVE_NO_ACCESS = 'Pine\'s Drive connection can\'t open this folder — share it (or the shared drive) with the service account';
// v26: one place that turns a Google failure into a clear {error, code}. what = 'folder' | 'drive'
function driveFail(env, e, what) {
  const account = driveAccount(env), extra = account ? { account } : {};
  if (e && e.signin) return driveErr(String(e.message).slice(0, 400), 502, 'drive_signin_failed', extra);
  const st = e && e.status;
  if (what === 'drive' && st === 404) return driveErr('Check GOOGLE_DRIVE_ID is the shared drive\'s ID (starts 0A) and the service account is a member. ID in use: ' + driveIdHint(env), 404, 'drive_not_found', extra);
  if (st === 404) return driveErr('Folder not found (or not shared with Pine\'s Drive connection)', 404, 'folder_not_found', extra);
  if (st === 403) return driveErr(what === 'drive' ? 'Pine\'s Drive connection can\'t open the shared drive — add the service account as a member' : DRIVE_NO_ACCESS, 403, 'no_access', extra);
  return driveErr('Google Drive error: ' + String((e && e.message) || e).slice(0, 300), 502, 'drive_error', extra);
}
// The item must live in Pine's shared drive (GOOGLE_DRIVE_ID when set; otherwise any shared drive the account can see).
async function driveCheck(env, id, wantFolder, moreFields) {   // v28: moreFields (e.g. ',size') only for drive/file
  let m;
  try { m = await driveGet(env, '/files/' + encodeURIComponent(id) + '?fields=id,name,mimeType,driveId,webViewLink,thumbnailLink,trashed' + (moreFields || '')); }
  catch (e) { return { err: driveFail(env, e, 'folder') }; }
  if (!m.driveId || (sharedDriveId(env) && m.driveId !== sharedDriveId(env))) return { err: driveErr('That folder isn\'t in Pine\'s shared drive', 403, 'not_in_shared_drive') };
  if (m.trashed) return { err: driveErr('That folder is in the trash', 404, 'folder_not_found') };
  if (wantFolder && m.mimeType !== 'application/vnd.google-apps.folder') return { err: driveErr('That link is a file, not a folder', 400, 'not_a_folder') };
  return { meta: m };
}
const DRIVE_ID_MISSING = 'GOOGLE_DRIVE_ID isn\'t set on the worker (the shared drive\'s ID, starts 0A)';
// v26: GET drive/status - sign in, then read the shared drive
async function driveStatus(env) {
  const account = driveAccount(env);
  try { await driveToken(env); } catch (e) { return driveFail(env, e, 'drive'); }
  if (!sharedDriveId(env)) return driveErr(DRIVE_ID_MISSING, 503, 'drive_id_missing', account ? { account } : {});
  let d;
  try { d = await driveGet(env, '/drives/' + encodeURIComponent(sharedDriveId(env)) + '?fields=id,name&useDomainAdminAccess=false', true); }
  catch (e) { return driveFail(env, e, 'drive'); }
  return jsonOk({ ok: true, drive: { name: d.name || '' }, account });
}
// v26: GET drive/search?order=11029 - the order's folder(s) in the shared drive, the number standing alone in the name
async function driveSearch(env, params) {
  const order = String(params.get('order') || '').trim();
  if (!/^\d{3,7}$/.test(order)) return driveErr('Pass ?order=<Pine order number> (3 to 7 digits)', 400, 'bad_order');
  if (!sharedDriveId(env)) return driveErr(DRIVE_ID_MISSING, 503, 'drive_id_missing');
  const q = encodeURIComponent("mimeType='application/vnd.google-apps.folder' and name contains '" + order + "' and trashed=false");
  let j;
  try {
    j = await driveGet(env, '/files?q=' + q + '&corpora=drive&driveId=' + encodeURIComponent(sharedDriveId(env))
      + '&includeItemsFromAllDrives=true&pageSize=100&orderBy=modifiedTime%20desc&fields=files(id,name,webViewLink,modifiedTime)');
  } catch (e) { return driveFail(env, e, 'folder'); }
  const alone = new RegExp('(^|[^0-9])' + order + '(?![0-9])');   // like \b11029\b, but "PO11029" counts too; 110290 doesn't
  const folders = (j.files || []).filter(f => alone.test(String(f.name || '')))
    .sort((a, b) => String(b.modifiedTime || '').localeCompare(String(a.modifiedTime || '')))
    .slice(0, 10).map(f => ({ id: f.id, name: f.name, webViewLink: f.webViewLink, modifiedTime: f.modifiedTime }));
  return jsonOk({ ok: true, folders });
}

async function handleDrive(request, env, rest, params) {
  if (!(await pdCallerOk(request))) return jsonError('Send your Airtable token as "Authorization: Bearer ..."', 401);
  if (!env.GOOGLE_SA_KEY) return driveErr('Google Drive isn\'t connected on the worker yet', 503, 'drive_not_connected');
  const what = rest[0] || '';
  try {
    if (what === 'status' && request.method === 'GET') return await driveStatus(env);          // v26
    if (what === 'search' && request.method === 'GET') return await driveSearch(env, params);  // v26
    if (what === 'list' && request.method === 'GET') {
      const id = driveId(params.get('folder'));
      if (!id) return driveErr('Pass ?folder=<Drive folder link>', 400, 'bad_folder');
      const c = await driveCheck(env, id, true); if (c.err) return c.err;
      const q = encodeURIComponent("'" + id + "' in parents and trashed=false");
      const j = await driveGet(env, '/files?q=' + q + '&includeItemsFromAllDrives=true&corpora=allDrives&pageSize=200&orderBy=modifiedTime%20desc'
        + '&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink,hasThumbnail)');
      return jsonOk({ ok: true, folder: { id, name: c.meta.name, url: c.meta.webViewLink },
        files: (j.files || []).map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType, modifiedTime: f.modifiedTime, size: f.size ? +f.size : null,
          webViewLink: f.webViewLink, iconLink: f.iconLink, thumb: f.hasThumbnail ? '/proxy/drive/thumb?id=' + encodeURIComponent(f.id) : null })) });
    }
    if (what === 'thumb' && request.method === 'GET') {
      const id = driveId(params.get('id'));
      if (!id) return jsonError('Pass ?id=<file id>', 400);
      const c = await driveCheck(env, id, false); if (c.err) return c.err;
      if (!c.meta.thumbnailLink) return jsonError('No thumbnail', 404);
      const tok = await driveToken(env);
      const r = await fetch(c.meta.thumbnailLink.replace(/=s\d+$/, '=s400'), { headers: { Authorization: 'Bearer ' + tok } });
      if (!r.ok) return jsonError('No thumbnail', 404);
      const h = new Headers(CORS_HEADERS); h.set('Content-Type', r.headers.get('Content-Type') || 'image/png'); h.set('Cache-Control', 'private, max-age=600');
      return new Response(r.body, { status: 200, headers: h });
    }
    if (what === 'file' && request.method === 'GET') {   // v28: the file's bytes, for in-app previews
      const id = driveId(params.get('id'));
      if (!id) return driveErr('Pass ?id=<file id>', 400, 'bad_file');
      const c = await driveCheck(env, id, false, ',size'); if (c.err) return c.err;
      const mt = String(c.meta.mimeType || '');
      if (mt === 'application/vnd.google-apps.folder') return driveErr('That link is a folder, not a file', 400, 'not_a_file');
      if (mt.startsWith('application/vnd.google-apps.')) return driveErr('Google Docs, Sheets and Slides can\'t be downloaded — open it in Drive', 415, 'not_downloadable');
      if (c.meta.size != null && +c.meta.size > DRIVE_MAX_BYTES) return driveErr('File is over 25 MB — open it in Drive', 413, 'too_big');
      const tok = await driveToken(env);
      const r = await fetch(DRIVE_API + '/files/' + encodeURIComponent(id) + '?alt=media&supportsAllDrives=true', { headers: { Authorization: 'Bearer ' + tok } });
      if (!r.ok) { const j = await r.json().catch(() => ({})); const e = new Error((j.error && j.error.message) || ('Drive ' + r.status)); e.status = r.status; throw e; }
      const h = new Headers(CORS_HEADERS);
      h.set('Content-Type', mt || r.headers.get('Content-Type') || 'application/octet-stream');
      h.set('Cache-Control', 'private, max-age=600');
      h.set('X-Content-Type-Options', 'nosniff');
      return new Response(r.body, { status: 200, headers: h });
    }
    if (what === 'upload' && request.method === 'POST') {
      const id = driveId(params.get('folder'));
      const name = String(params.get('name') || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 200);
      if (!id || !name) return driveErr('Pass ?folder=<id>&name=<file name>', 400, 'bad_folder');
      const c = await driveCheck(env, id, true); if (c.err) return c.err;
      const bytes = new Uint8Array(await request.arrayBuffer());
      if (!bytes.length) return jsonError('Empty file', 400);
      if (bytes.length > DRIVE_MAX_BYTES) return jsonError('File is over 25 MB', 413);
      const type = (request.headers.get('Content-Type') || 'application/octet-stream').split(';')[0];
      const boundary = 'pine' + crypto.randomUUID().replace(/-/g, '');
      const enc = new TextEncoder();
      const pre = enc.encode('--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify({ name, parents: [id] })
        + '\r\n--' + boundary + '\r\nContent-Type: ' + type + '\r\n\r\n');
      const post = enc.encode('\r\n--' + boundary + '--');
      const body = new Uint8Array(pre.length + bytes.length + post.length);
      body.set(pre, 0); body.set(bytes, pre.length); body.set(post, pre.length + bytes.length);
      const tok = await driveToken(env);
      const r = await fetch(DRIVE_UPLOAD + '?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink', {
        method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'multipart/related; boundary=' + boundary }, body });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return jsonError('Drive upload failed: ' + ((j.error && j.error.message) || r.status), 502);
      console.log(`[pine-drive] uploaded ${name} (${bytes.length} bytes) to ${id}`);
      return jsonOk({ ok: true, file: { id: j.id, name: j.name, webViewLink: j.webViewLink } });
    }
    return jsonError('Drive path not allowed', 403);
  } catch (e) {
    return driveFail(env, e, 'folder');   // v26: clear code (was a bare 502)
  }
}

