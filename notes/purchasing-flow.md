# Purchasing app: ordering flow redesign (Oct 2026)

v90's "By vendor" checkbox screen didn't fit how purchasing actually works. This plan starts from his [MGR] Apparel RFO view.

## How he works today (the view, left to right)
1. Rows are grouped by order and stacked by due date.
2. Each line shows: Product type · ASAP · Due · Imprint · Garment.
3. Sizes XS → 6XL, then Total.
4. Order Notes, then **Supplier** and **PO #**.
5. Extra XS → 5X, then List of Extras.
6. Cost per size bracket, then Inbound freight.
7. **Ordered ✓**, then Total line cost.
8. Context, far right: Salesperson, Production / Sales / Proofing notes, Print location, Shipping / Finishing notes, **Scheduled imprint**, Shipping method.

He works order by order, batching into vendor carts across orders. When a warehouse is short, he splits a line across warehouses. Supplier is a multi-link, so one line can carry two warehouses.

## Status
- **v93 is current:** `pine-purchasing-v93.html`; `?practice=1` = nothing is saved. v91 was the first live build (from the mockup on v90's Airtable code).
- **v93 changes:**
  - **Invoice check** = exactly what's in the open carts: lines, sizes, cost each, freight, and a cart total to compare with the vendor checkout/invoice.
  - **Past orders** tab = a rolling 30 days of ordered POs per warehouse (read-only, searchable), plus Price changes.
  - **✓ Order all** button (Carts column and Invoice check) marks every open cart ordered in one go, each with its own PO box (blank = today's date).
- **v92 change:** Invoice check is a read-only quick view. Decided Oct 2: purchasing only compares against the vendor invoice, fixes Airtable if something's off, and doesn't track it. No invoice entry, no Vendor Invoices table.
- Kept on this computer only, until their Airtable tables are approved: the price-change history (Garment Price Changes), and the people list for @mentions (Team). In-progress carts are also kept on this computer.
- **Bandana-only orders:** an **Add all to cart** bar in the order header puts every open bandana line in one warehouse's cart at the tier price. It defaults to Carolina Creative.

## New flow (left → right)
- **Orders:** sorted by due date. Each shows ASAP / Hard Deadline and the print date.
- **This order:** the context goes in a header (salesperson, print date, shipping method, flagged notes). Each line runs:
  1. sizes
  2. extras
  3. warehouse, with a ship-time estimate and arrival date, plus **+ split**
  4. cost
  5. **Add to cart**
- **Carts:** one per warehouse, built up across orders. None of the vendor sites has a quick-order / bulk paste, so each cart item gets an **Open on vendor ↗** link and its sizes laid out like the site's size grid, to type in. After checkout, he enters the PO and ticks ✓ Ordered. That writes Ordered, PO, Supplier, extras and costs to every line in the cart.

## Mockup + Garment issue
- Each line card shows the proof thumbnail from **Proof Images** (`flddhvdkKI31tFTdX`). Airtable makes thumbnails for PDF attachments.
- Tapping the thumbnail opens the big proof next to the line item's garment and color, for a visual check. (The color-check buttons were dropped: a visual check is enough.)
- **⚠ Garment issue** (on the card and in the popup):
  - Pick a reason (color / garment-style / print size-placement / other), plus an optional note.
  - It posts a **comment on that line item** that @mentions **Art Department** (`usr8GNzrtN698y03u`, art@pineprintshop.com), so Art gets the normal Airtable notification.
  - Live call: `POST /v0/appJkaLk8DykjsgHR/tblJx5UlwO7oMSk5H/{recordId}/comments` with the text `@[usr8GNzrtN698y03u] Garment issue from purchasing on …`.
  - The comment's author is whoever owns the Airtable token in the app. The token needs the `data.recordComments:write` scope.
  - **Send to** is a searchable picker (type to filter, Enter to add, × or Backspace to remove). It starts with Art Department, and anyone can be added. Each person becomes an `@[usr…]` mention in the comment.
  - The card shows "⚠ Garment issue sent to …". Adding that line to the cart asks to confirm.
  - **Who's in the picker:** Airtable's API can't list base members (Enterprise only). Recent comments show 8 people and department accounts being tagged; the department accounts are Art, Purchasing and Quality. The names are kept out of this public repo.
    - For the live app, load the list at start-up from a small **Team** table (Name + an Airtable user field + Active). It's easy to keep current, and nothing is hard-coded. Ask before creating it.

## Live price check (vendor price vs Airtable)
- Each warehouse option shows that vendor's **live price for the line's exact style + color**: ↑ red if higher than Airtable, ↓ green if lower, grey if the same. SanMar sale prices show their end date.
- Picking a warehouse **fills the cost with the live price**, unless he typed one. The cost box says how far it is from Airtable ("⚠ Price went up at S&S: $3.29, Airtable $3.12, +$0.17"). The live price is what gets saved to the line when ordered.
- The orders list shows **Price ↑** on orders where a garment now costs more than Airtable at every vendor that carries it.
- Sources: the same worker calls Price-o-Matic uses (all GET, already allowed in worker v14):
  - S&S `/proxy/ss/products` → `customerPrice`
  - SanMar `/proxy/sanmar/pricing` → `myPrice` (includes sales)
  - AS Colour `/proxy/ascolour/catalog/pricelist` → contracted price
  - SLC and Carolina Creative have no live price.
- **Writes to Garments (decided Oct 1: "it should write to Airtable so we keep tracking any increase"):**
  - This happens on **✓ Ordered**, for each line bought at a price different from Airtable's:
    - **Higher:** PATCH that garment (one record per style + color) with **Cost** `fldRmgDAByrOWcHLO` = the price paid, and **2XL Up-charge** `fldHakcDllb8SFCwz` (3XL–6XL the same way) = 2XL+ paid − cost. Quoting in Price-o-Matic picks up the new cost.
    - **Lower** (often a SanMar sale): log it only, and never lower the cost automatically, because sales end.
  - It's done at order time, not when browsing, so only real purchases move the quoting cost.
- **Price history:** each change (date, garment, vendor/warehouse, was, paid, change, raised or noted, PO, order) shows in **Price changes** under the Invoice check tab.
  - To keep that history in Airtable, the proposal is a small **Garment Price Changes** table: Garment (link), Vendor, Warehouse, Was, Paid, Change, Date, PO, Line Item (link), Raised?. Not created yet; ask first.
- A live scan from the build environment was blocked: the network policy denies `pine-workers.stephen-dab.workers.dev` and `api.ssactivewear.com`.

## Notes (editable, written back to Airtable)
- Every note column in his view is its own long-text field on the line item, so each line card has a notes row:
  - Order Notes `fldF378cgWuOcWNL6`
  - Production Notes `fld4FjoCQ5bXdwjJj`
  - Sales Notes `fldG3tzTzUC3QQJ1I`
  - Proofing Notes `fldWdnT83KLEvBrg4`
  - Shipping Notes `fld7rY74m37acM2Ik`
  - Finishing Notes `fldqsj7nZgHrtRbEn`
- Notes that have text show up already open. **+ Add a note…** opens any of the others.
- Editing saves on leaving the box: a PATCH of that one field on that line item, then "✓ saved to Airtable".
- The order header only counts the notes.

## Inbound freight
- Each line card has an **Inbound freight** box at the bottom right. Leaving the box saves it to Line Items **Inbound Freight** `fldi2RmXxYgckvHfd` (currency, PATCH that one field); a blank box clears it.
- It stays editable after ordering, because freight usually arrives later, on the vendor invoice.
- Airtable's Total Line Cost already adds freight, and so does the Invoice check total for each PO.

## Ship time
- **UPS Ground estimate** from the warehouse's city to the shop (Fort Collins 80524), by straight-line distance, in business days:
  - under 250 mi: 1 day
  - under 750 mi: 2 days
  - under 1,150 mi: 3 days
  - farther: 4 days
- Results:
  - **2 days:** SLC (Salt Lake, Phoenix) · S&S Olathe, Ft. Worth, Dallas · Sanmar Phoenix, Dallas, Minneapolis · Bella Canvas Las Vegas.
  - **3 days:** S&S Reno, Lockport, Bolingbrook, Fresno, West Chester · Sanmar Reno, Seattle, Cincinnati · AS Colour CA.
  - **4 days:** S&S Georgia, Reading, Orlando, Middleboro · Sanmar Jacksonville, NJ, Richmond · AS Colour NC · Bella Canvas MD.
- Reno (781 mi) sits on the 2/3-day line.
- The app needs each warehouse's location; Carolina Creative's is unknown.
- The Suppliers table's **Days In Transit** field (and so Expected Blank Arrival) disagrees with these numbers. It could be updated to match later; ask first.
- History (Ordered → Received) isn't used, because Received marks when a box is processed, not when it lands.

## Splits
- Supplier links both warehouses.
- PO # = the order date, `MMDDYY` (e.g. `100126`), auto-filled and editable. A split placed the same day has one PO; one placed on a later day gets both, e.g. `100126 / 100226`.
- The split sizes are written into Order Notes, e.g. `Split: S&S Reno M 10, L 10 · S&S Olathe 2XL 4`.

## Invoice check tab (reporting)
- POs are the order date (`MMDDYY`), shared by every vendor that day, so a row is **one PO at one warehouse**. Each row has:
  - warehouse, date, lines, pieces and orders
  - the **Airtable total** (sum of Total Line Cost: (ordered + extras) × bracket cost, plus Inbound Freight)
  - a box to type the **vendor invoice total**
- Status: Not checked / ✓ Matches (within 50¢) / Invoice ±$X.
- "To check" (default) hides POs that match. Tap a PO to see its lines, so you can find what's off.
- **Open question: where the invoice total is saved.** Nothing in Airtable holds it today. The suggestion is a small new **Vendor Invoices** table (PO #, warehouse, invoice #, invoice total, date, checked by, matched), linked to the line items. Ask before creating it.
- Split lines placed on different days (PO `100126 / 100226`) need care: Airtable has one cost per line, so the app splits it by the sizes that went to each warehouse.
- Later: pull invoice totals automatically (the S&S API has invoices; check SanMar / AS Colour) instead of typing them.

## Later phases
- **Live stock/price** per warehouse, from S&S / SanMar / AS Colour through the worker. This drives splits.
- **Truck scan:** scan the UPS 1Z label when boxes come off the truck, match it to the line item's **Tracking Number** (`fldb48U3afClKC6p4`) and so the PO, and log a real arrival time.
  - Tracking can come from the S&S orders API and SanMar ship notices.
  - This gives true ship time per warehouse and flags late boxes before print day.
- **S&S API ordering:** needs a worker POST route with auth.

## v94 — blank (shipping-charge) line items (Oct 5)
- **What they are:** sales adds a blank line item to charge extra shipping: Product Type **Misc.**, no garment, usually 1 in OS. These lines were showing up in the purchasing queue. Before v94, the Ordered box was ticked by hand, or not at all; e.g. one created Oct 1 was still unchecked on a Ready to Order order.
- **v94:** a line with Product Type Misc. **and** no garment is kept out of the queue. An order with nothing but a blank line doesn't show either.
- **Checked off with the order:** when ✓ Ordered leaves every real line on an order ordered, the order's blank line(s) get Ordered ✓ plus the same PO in the same step. The toast says "shipping-charge line checked off". If that save fails, the toast says to tick it in Airtable.
- **Catch-up on load:** an order in the RFO view whose real lines are all already ordered, but whose blank line isn't, gets the blank checked off when the app opens.
- Practice mode logs these writes and doesn't send them.
- **Tests (mock):**
  - Blank lines are hidden, and a blank-only order isn't listed.
  - The blank line on a fully ordered order is checked off on load (with that order's PO).
  - Ordering 90010 checks off its blank line with PO 100526.
  - 90012 (not ordered yet) is left alone.
  - Practice mode: 0 writes sent.

## 2026-10-12 — v95: extras plan per design + review flags
The Extras & Spoilage rules are now standard for printed apparel (from Oct 13). A year of orders modelled with them came out about $7,100 cheaper; see the purchasing guide. To make them easy to apply, every order now shows an **Extras plan** under its header:
- **Grouping:** printed-apparel lines are grouped **by design**, meaning lines with the same imprints. Pieces are summed, and screens are the sum of the design's imprint Screen Counts.
- **How many:**
  - Under 50 pcs: 0.
  - 50–99 pcs: 0, or 2% at 5+ screens.
  - 100+ pcs: 1.25%, or 2% at 5+ screens.
  - Always rounded up.
- **Where they go:** on the design's biggest colorway (shared with any colorway that's at least a third of the design), in L, M, XL order.
  - Matches the guide's examples: 300 pcs at 3 screens = Black 1 M, 2 L, 1 XL; 600 pcs at 5 screens = Black 3 M, 3 L, 2 XL + White 1 M, 2 L, 1 XL.
- **Small line in a split design** (under 20 pcs or under 15% of its design):
  - Stephen: these are often for specific people, so they can't ship short.
  - The plan adds **1 extra on that line** in its most common size, and flags it so the design gets a look.
- **Below the minimum** (design pieces under 25 + 10 per extra screen): flagged to review with sales (fewer colors, or the price).
- **Use all** / **use** writes the plan into the lines' extras (nothing is saved until the cart is placed, as before). Typed extras still work.
- **Exceptions:**
  - Hard Deadline orders, and orders that print within 3 business days of their due date, say "Old way" and get no plan.
  - Bandanas and embroidery are skipped.
- **Order list:** shows **Review design** when an open line has a flag.
- Imprint screen counts and types are loaded with the imprint IDs (one extra read; nothing new written).
- **Tested with a mocked Airtable** (practice mode, no writes) on: the guide's 300- and 600-pc examples, a 40-pc 5-screen job (below minimum), a Hard Deadline job (old way), a bandana job (skipped), and Use all.

## 2026-10-12 — v96: layout + Extras plan follows edits
- **Layout:** lines with sizes up to 4XL had four cost boxes in a fixed row, and wide size grids pushed the order panel sideways, cutting off its left edge (Stephen's screenshot of 10971).
  - Cost boxes now sit two per row. Size boxes and stage padding are a little narrower.
  - A very wide size grid scrolls inside its own box.
  - Checked at 1400 and 1280 px wide: no sideways scroll.
- **Applied state:** clearing extras (or tapping +, or changing a split) now re-checks the Extras plan, so "✓ applied" turns back to **use** when the line no longer matches.
- **Asked:** suggest warehouses that have the stock.
  - Not done yet: warehouses are still ranked by ship time, with live price only.
  - S&S product data includes per-warehouse quantities, and the worker already allows read-only inventory routes for S&S, SanMar and AS Colour.
  - This build environment can't reach the worker, so the response shape and the warehouse-code → Airtable Supplier mapping need one real look first (next step).

## 2026-10-12 — v97: S&S live prices fixed + stock per warehouse
- **Bug:** Purchasing asked S&S for the bare style ("1717"), and S&S answered "Requested item(s) were not found" (Stephen opened the worker link). So S&S live prices were missing, shown as "no live price" on 10971.
  - v97 asks for brand + style ("Comfort Colors 1717"), which works, with the bare style kept as a fallback.
- **Stock:** the same S&S answer carries `warehouses[]: {warehouseAbbr, qty}` per size and color.
  - S&S shows at most 500, so 500 means 500+.
  - For the line's color, each S&S warehouse compares stock to what's being bought (sizes + extras) and shows **✓ in stock** or **short: 2XL 4/10**.
  - Suggestions rank warehouses that can fill the whole line first, then unknown, then short. Ship time breaks ties.
  - "More warehouses…" shows the same note.
- **Code → warehouse** (`SS_CODE`): IL Lockport, NV Reno, KS Olathe, OH West Chester, MA Middleboro, NJ Robbinsville, GA McDonough, PA Reading, TX Ft. Worth.
  - S&S also returns **FO**, **CN** and **DS** (DS = dropship, qty 0).
  - Airtable also has newer S&S warehouses: Dallas, Bolingbrook, Duluth, Harrisburg, Orlando, Pompano Beach and Fresno.
  - Those show no stock until we confirm which code is which. Guessing would send buys to the wrong building. TX → Ft. Worth (the original TX warehouse) also needs confirming against Dallas.
- SanMar and AS Colour stock aren't read yet (the worker has read-only inventory routes for both). S&S first.
- **Tested** with a mocked S&S answer in Stephen's shape:
  - 10971-style line: Ft. Worth and Lockport ✓ in stock (shown first), Dallas unknown.
  - Olathe short 2XL and Reno short L moved to the list with the reason.
  - The bare-style request isn't sent once brand + style works.

## 2026-10-12 — v98: live prices for short brand names, SanMar + AS Colour stock, Dallas
- **Bug (Stephen: "still not seeing live price"):** Airtable shortens some brands. "Independent IND4000" didn't match the S&S brand list (only "Independent Trading Co."), so those lines never asked S&S at all and showed "no live price".
  - Fix: a short brand now matches the one S&S brand it starts ("Independent" → Independent Trading Co.). SLC and SanMar brand checks work the same way.
  - S&S is now asked with **its own name** for the style, taken from the S&S style list ("Independent Trading Co. IND4000", "BELLA + CANVAS 3001"). The list is the one Price-o-Matic already caches for 24h, with the same keys and shape, so it's shared on the same device. The v97 guesses stay as fallbacks.
- **"No live price" now says why**, e.g. "not found at S&S", "no SanMar style code for Gildan", "not found at AS Colour". The full reason is in the pill's tooltip and in the cost note.
- **S&S codes:** TX = **Dallas** (Stephen: the bigger warehouse), FO = **Ft. Worth**. CN and DS (dropship) are still unmapped, as are Bolingbrook, Duluth, Harrisburg, Orlando, Pompano Beach and Fresno.
- **SanMar stock:** read from `/proxy/sanmar/inventory` (XML, same as Price-o-Matic), per warehouse.
  - Warehouses are matched to Airtable by city. The spelling check ignores doubled letters, so Airtable's "Cinncinnati" matches. If the warehouse name is missing, the ID is used: 1 Seattle, 2 Cincinnati, 3 Dallas, 4 Reno, 5 Robbinsville, 6 Jacksonville, 7 Minneapolis, 12 Phoenix, 31 Richmond.
  - Colors come from SanMar's catalog color, which can be cut short. A prefix match is used, and an unmatched color shows nothing.
  - Only styles with a verified SanMar code are checked: Port & Co / Port Authority / District / Sport-Tek, and Bella Canvas as BC…
- **AS Colour stock:** read from `/proxy/ascolour/inventory/items?skuFilter=` and joined to color + size by SKU from the variants.
  - If a row names its warehouse, stock shows per warehouse (CA / NC).
  - If not, it shows **"✓ in stock (CA + NC)"**, both warehouses together.
- Ranking is unchanged: whole line in stock first, then unknown, then short, then ship time. It now covers all three vendors.
- **Tested with mocked S&S, SanMar XML and AS Colour JSON.** The test order had four lines:
  - **Independent IND4000:** gets S&S. Dallas and Olathe ✓, Ft. Worth short 2XL 3/10.
  - **Bella Canvas 3001:** S&S plus SanMar. SanMar Cincinnati ✓ ($2.99, sale thru Oct 31), SanMar Dallas short L, Reno ✓ (found by ID).
  - **AS Colour 5001:** NC ✓, CA short L/XL. With no warehouse field, both show ✓ (CA + NC).
  - **Gildan 5000 (not on mock S&S):** "no live price · not found at S&S".
  - Also checked at iPad and phone widths, with no errors.

## 2026-10-12 — v99: SanMar for every brand it carries
- **Bug (Stephen):** Comfort Colors 1717 said "no SanMar style code", but SanMar carries it. Purchasing only knew SanMar codes for house brands and Bella Canvas (BC…).
- **Fix:** every brand in the SanMar list is now tried by its mill number (1717, 5000…). Next Level tries NL + number first.
- **Guard:** a bare number could be another brand's style, so a SanMar answer only counts if it has the line's color. Otherwise the pill says, for example, "SanMar 5000 has no Navy color".
- **Tested:** with mocks, Comfort Colors 1717 Pepper shows SanMar Cincinnati at $4.75 ✓ in stock. Gildan 5000 Navy, with a SanMar answer that lacked Navy, was rejected with that reason.
- **S&S codes CN / DS:** Airtable stores S&S suppliers by city, never by letter code, so there is no order history under CN or DS.
  - DS is S&S dropship. CN is most likely a closed or old warehouse, as Stephen thinks.
  - Both stay unmapped, so they never show stock.
- **Last S&S line item per city** (record created date; the table has no PO date field):

| City | Lines (all) | Last 12 months | Last |
|---|---|---|---|
| Olathe, KS | 2474 | 256 | 2026-10-06 |
| Reno, NV | 1624 | 232 | 2026-10-06 |
| Ft. Worth, TX | 768 | 54 | 2026-09-29 |
| Lockport, IL | 362 | 74 | 2026-09-25 |
| Fresno, CA | 56 | 28 | 2026-09-22 |
| Reading, PA | 14 | 5 | 2026-08-26 |
| Dallas, TX | 35 | 7 | 2026-08-19 |
| Bolingbrook, IL | 31 | 3 | 2026-08-12 |
| McDonough, GA | 156 | 6 | 2026-08-10 |
| Middleboro, MA | 2 | 2 | 2026-02-19 |
| Duluth, GA | 7 | 3 | 2025-11-13 |
| Orlando, FL | 2 | 0 | 2025-07-27 |
| Harrisburg, PA | 3 | 0 | 2025-05-21 |
| West Chester, OH | 3 | 0 | 2025-01-05 |
| Robbinsville, NJ | 54 | 0 | 2024-09-05 |
| Pompano Beach, FL | 4 | 0 | 2023-09-29 |

## 2026-10-12 — v100: S&S's real warehouse list, shorter warehouse menu
- **S&S's current warehouses** (Stephen's screenshot from S&S): Olathe, Reno, Fort Worth, Lockport, Fresno, West Chester, McDonough, Orlando, Reading, Middleboro. Dallas isn't listed, so it looks closed.
- **Codes** (`SS_CODE`): IL Lockport, NV Reno, KS Olathe, OH West Chester, MA Middleboro, GA McDonough, PA Reading, **TX Ft. Worth**, **FO Orlando**, **CN Fresno**.
  - FO and CN are worked out, not confirmed: they're the two codes left over for Orlando and Fresno.
  - To check: compare one SKU's stock on the S&S site against the app.
  - DS is dropship, never stock.
- **Not suggested anymore:** S&S warehouses that aren't on S&S's list (Dallas, Bolingbrook, Duluth, Harrisburg, Robbinsville, Pompano Beach). Old POs still show them.
- **"More warehouses…"** now lists only warehouses with a line item created in the last 12 months. Before, it listed all 236 suppliers, FedEx and USPS included.
  - The list is built in the background after orders show (one pass over the last year's Line Items, Supplier field only) and cached a day per device.
  - Until it loads, the menu shows everything, as before.
- **"🔍 Find another warehouse…"** at the bottom opens a type-to-search box for the rest, each marked "closed" or "not ordered this past year".
- Fixed a stale-element error when picking from the search box (the line re-drew during the input's blur).
- Tested with mocks:
  - Independent IND4000: Fresno ✓ and Orlando ✓ come before Ft. Worth (short 2XL).
  - The menu showed only the warehouses we've used.
  - Search found S&S Dallas (closed) and selected it.
  - No errors on iPad width.

## 2026-10-12 — v101: add a warehouse from Purchasing
- **"+ Add new"** sits next to the "Find another warehouse…" search box. It's for a one-off drop ship or a vendor that isn't in Airtable yet: type the name and tap it.
  - After a confirm, it creates the Supplier record (name only) and picks it for the line.
  - If the typed name already exists, it just picks that one.
- **Naming hint** in the confirm: use "Company - City, ST" so the ship time works. Add "(DS)" for a drop ship.
- **Practice mode:** the new supplier only lives on that screen; nothing is saved.
- **Automations:** none run on Supplier records (checked the base's record-created automations), so adding one sends nothing.
- **Tested with mocks:** "Shaka Wear - Houston, TX (DS)" was added and selected, with UPS Ground ~3 days. In practice mode it wasn't saved, and there were no errors.

## 2026-10-12 — SLC: next step (slc-test-v11)
- SLC has no public API docs. It uses PromoStandards (SOAP), which the worker has spoken since v4 (`/proxy/slc/productdata | inventory | pricing`).
- **Blocker for Purchasing:** SLC files styles under its own productIds, and the brand catalog call (getProductSellable) returns only productId + partId.
- **slc-test-v11** finds the productId for a brand + style by checking each product's stock descriptions, then shows a "For Claude" box with:
  - the productId
  - one raw PartInventory, to see the per-warehouse tags
  - one raw pricing Part
- Stephen's first style: **Comfort Colors 1717**. Once we have the real answer, Purchasing gets SLC price + stock the same way as S&S, SanMar and AS Colour.
- **Update (same day):** Stephen's run showed SLC productIds are **brand code + style** (Comfort Colors: CC-1717, CC-6030, CC-1745Y…, 19 in all). So style → productId is a name match on the brand catalog list, with no scanning.
  - The catalog call (getProductSellable) is ~760 KB for Comfort Colors and took ~1 s.
  - Stock calls are slow: one 336-part style took 15 s. Purchasing should fetch SLC per line, in the background, and cache it.
  - Invoice 1436082 (10/01/26) item numbers: 00124xxx = CC 1717 ($5.49 S–XL), 00315xxx = BC 3001 ($3.79, 2XL $5.58). These are SLC's old numeric ids, so the old "315 is deprecated" read of slc-test-v10 was wrong.
  - slc-test-v12 matches by name first and loads only that style.
- **Bella+Canvas** (Stephen, 2026-10-12): Bella+Canvas is moving to **SanMar only** once S&S and SLC sell through their stock.
  - No app change yet. Stock-first ranking already moves Bella lines to SanMar as the others run dry.
  - When S&S/SLC stop carrying it, drop 'bella canvas' from the S&S slug list and SLC_BRANDS.
  - Also drop the Bella Canvas Direct suppliers if they close.
- **SLC result (slc-test-v13, Stephen):** CC-1717 returned 525 parts, **0 units and 0 priced on every SKU**. We bought 1717 at $5.49 on 10/01, so SLC's PromoStandards feed isn't sending live data for our account.
  - The connection, login and product matching all work.
  - Waiting on SLC to turn on live inventory and pricing. Purchasing SLC support is on hold until then (re-run slc-test-v13 to check).
- **SLC's answers** (from the earlier round of questions, relayed by Stephen 2026-10-12):
  - **Zeros:** SLC sees the same missing results and is reloading its product data. They expect it fixed by tomorrow and will tell Stephen.
  - **Warehouses:** Phoenix and Eden NC stock is **not** in PromoStandards. The API shows only the West Valley City (Salt Lake) warehouse, and there is no other inventory endpoint.
  - **getProductSellable** accepts productId, partId and lineName (+ isSellable).
  - **Pricing:** PricingAndConfiguration 1.0.0 is enabled. Their sample sends currency USD, fobId 1, priceType Customer, configurationType Blank; the worker already sends these.
  - Next: re-run slc-test-v13 after the reload. If the totals are real, add SLC to Purchasing. That stock pill can only speak for Salt Lake, so Phoenix and Eden NC show "stock unknown".
- **Correction (Stephen):** SLC's answers above are months old. The reload they promised didn't fix it, since today's run is still all zeros.
  - **slc-check-v1.html** runs 13 read-only checks in a row and prints one copyable line each:
    - 1717 stock by the new id CC-1717, by the old numbers 124 / 00124, and with a 2-part filter
    - Gildan 5000B 31225, which returned real stock in the old test
    - 1717 price as Customer / Net / List, and by 124
    - sellable list and product data for 1717
  - The answers decide the new questions for SLC.
- **slc-check-v1 results (Stephen, 10/12):**
  - 31225 Gildan 5000B: 4,233 units, 149/270 priced ($2.25–$2.50).
  - CC-1717: all 525 parts listed, but 0 stock / $0 for every part, price type and part filter.
  - "124" / "00124" don't exist.
  - Stephen's hunch: CC-1717 isn't the real record, and 1717 lives under a numeric id like Gildan's (Comfort Colors is a Gildan brand).
- **slc-check-v2.html (SLC product finder):** looks for the products that actually hold invoice part numbers (default 124003, 124503, 315342):
  - asks SLC by partId
  - scans the Gildan line, then the whole catalog
  - checks stock + price for every product it finds
  - also downloads the whole SLC product list as a CSV (productId, part count, first partIds)
- **slc-check-v2 results (Stephen, 10/12):**
  - 1717 parts live only on CC-1717. BC 3001 Dark Grey (315342) lives on productId **315**, also 0 stock / $0. So the missing data isn't about the id style.
  - SLC's whole catalog is **1,285 products** (15.7 MB list) in mixed id styles:
    - brand prefixes: LAT- 124, DECKY- 120, GILDAN- 32, CC- 21, AH- 20, DRI- 18, NLA- 14…
    - bare style-ish ids: 3001CVC, 112FP…
    - plain numbers: 31225 = Gildan 5000B. "5000", "3001", "3600" and "64000" don't exist as ids.
- **slc-catalog-v1.html (catalog builder):** names every product with one single-part pricing call each, 4 at a time (~10 min). From the part description it records brand / title / style / sample price.
  - Its JSON becomes the repo's SLC style map, so Purchasing can match "Brand Style" → productId.
  - It doubles as a health report of which products come back $0. Caveat: one sample part per product, and some colors are unpriced even on good products.
- **SLC catalog built (Stephen ran slc-catalog-v1, 10/12):**
  - 1,285 products named, but only **198 priced** on the sample part (15%). Saved as `data/slc-styles.json`: id, brand, style, title, priced, sample price. It's the lookup table for Purchasing.
  - The staples all come back **$0**: Gildan 5000 = `225`, Gildan 64000 = `325`, BC 3001 = `315`, BC 3001CVC = `6315`, NL 3600 = `313`, NL 6210 = `6313`, CC 1717 = `CC-1717`, CC 1745 = `CC-1745`.
  - Priced examples: Gildan 5000B = `31225` $2.50, Gildan 18500 = `21925` $9.52, Independent SS4500 = `22339` $10.45, IND4000 = `22536` $16.75.
  - Brands with priced products include Bella 25/69, Independent 36/86, Next Level 19/66 and Decky 13/232. Dri Duck, Imperial, Q-Tees, Legacy, Cap America and The Game have none.

## 2026-10-12 — v102: color typos still match
- **Stephen's check on v101 (real data):**
  - SanMar now shows for Comfort Colors 1717.
  - On order 10968, AS Colour 1107 Gold showed "✓ in stock". **1107 "Colbalt"** showed "$5.70*" and no stock, because Airtable's garment says "Colbalt" and AS Colour says "Cobalt".
- **Fix:** color matching is exact, then prefix, then **close spelling**:
  - 1 letter off, or 2 for names of 7+ letters, and only when exactly one vendor color is that close.
  - The pill's tooltip names the vendor's spelling ("price for COBALT (Airtable spells it Colbalt)").
  - Applies to price and stock for S&S, SanMar and AS Colour.
- **Tested with mocks:** 1107 Colbalt → $5.70 (no *), CA ✓ in stock. Gold is unchanged.
- **Fix in Airtable** (Stephen: "can we update Airtable to match what the vendor spells it"):
  - When a vendor's spelling differs, the line says "AS Colour spells this color **Cobalt** (Airtable: Colbalt)" with a **Fix in Airtable** button.
  - After a confirm it PATCHes the Garment's **Color** field (`flduMprMvRlAHAiCh`, single-line text). The garment name is a formula of brand + style + color, so it follows.
  - Every open line using that garment updates on screen.
  - No automations watch Garments (checked record-updated automations). Practice mode only logs the change.
  - Tested in practice: logged PATCH recG6 Color = "Cobalt", the title became "AS Colour 1107 - Cobalt", and the prompt went away.

## 2026-10-12 — v103: pick the vendor's color when nothing matches
- **Stephen:** the AS Colour 1107 **Orange** beanie also got no color match. AS Colour likely calls it something longer (e.g. "Safety Orange"), which is neither a prefix nor a 1–2 letter typo.
- **Whole-word match:** "Orange" matches a vendor color containing the word ORANGE, but only when exactly one vendor color does.
- **No match at all:** the line says "AS Colour has no color called **Orange** for this style" with a menu of the vendor's colors (ones sharing a word listed first).
  - Picking one rewrites the Garment's Color in Airtable, after a confirm. Same field and safety as the v102 "Fix in Airtable".
  - The line then re-matches price and stock with the new name.
- **Tested with mocks:** 1107 Orange vs vendor colors Safety Orange + Burnt Orange.
  - Two candidates, so no guess and the picker shows.
  - Picked Safety Orange: practice logged the PATCH, then $5.95 and CA ✓ in stock.
  - Colbalt → Cobalt still works.

## 2026-10-12 — v104: AS Colour "coming soon" + next delivery dates
- **Stephen's finding (real data):** 1107 Orange matched AS Colour's "Orange" ($5.70, no *) but showed no stock pill. The AS Colour site says Orange is **coming soon** for 1107. 1107F is a different style that comes in Safety Orange; which one to use is the customer's/sales' call.
- **Coming soon:** a color AS Colour lists but has no stock rows for yet now shows an amber **"coming soon · no stock yet"** pill, ranked with short warehouses.
  - If a variant field says so (comingSoon / status "Coming Soon" / pre-order), the tooltip notes it.
- **Next delivery dates:** short AS Colour pills add the earliest upcoming `nextDeliveryETA` for the short sizes, e.g. "short: L 12/50 · more due Dec 12".
- **Tested with mocks:**
  - 1107 Orange (in the product list, no stock rows) → coming soon at CA and NC.
  - Cobalt L 12/50 with ETA 12/12 → "short: L 12/50 · more due Dec 12".

## 2026-10-12 — v105: unreleased AS Colour colors + link for the date
- **Stephen checked the AS Colour API for 1107 Orange** (the site says ETA 9 Jan 27):
  - The variant (`1107-ORANG-P-OS`) has **no date field**, no imageUrl, no GTIN12, and was updated 2026-10-02.
  - Inventory for `skuFilter=1107-ORANG` returns `{"data":[]}`. The release date only lives on the website.
- **Unreleased colors:** 11 new 1107 colors share the same shape (Burgundy, Charity Pink, Espresso, Forest Green, Ink Blue, Liberty, Orange, Pigeon Blue, Red, Shadow, Sunset).
  - A matched color with no stock rows **and** no photo/barcode now shows **"new color · not released yet"**. Otherwise it's still "coming soon · no stock yet".
  - Under the warehouses: "AS Colour hasn't released Orange in 1107 yet. **See the date on ascolour.com ↗**", which links to AS Colour's search for the style.
- Tested with mocks shaped like the real variant.
