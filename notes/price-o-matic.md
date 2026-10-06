# Price-O-Matic notes

## v93 — money bugs (Oct 5)
Normal quotes come out the same as v92; only the broken cases changed.

| Bug | v92 | v93 |
|---|---|---|
| Supa transfer not offered at that size/qty (e.g. Wearable 4.7×2.8 @ 100) | priced the transfer at **$0.00** ($5.65/pc quote) | says "**Supa Wearable 4.7 X 2.8 isn't offered at 100 pcs** — pick another size or quantity"; no price; Add to Cart is off. The breaks table shows "not available" for those rows. Deco and size tags work the same way. |
| Combined print type, fleece prints > qty (500 fleece on 100 pcs) | **−$0.45**/pc | fleece prints are capped at the qty → $11.55 (same as all-fleece) |
| Flatstock at 20,000 pcs | **−$1.00**/pc (shown as $0 in the cart) | the qty discount stops at the sheet's top tier (3,000) → $6.40 |
| Cart qty changed to one with no price (patches 100 → 500) | kept the **old unit price** at the new qty | keeps the old qty and says "No price at 500 pcs… Re-quote it in the builder" |
| Proposal PDF reference rows at a qty with no price | repeated the quoted unit price | that row is left off |
| A slow garment lookup finishing after a newer one | overwrote the newer garment cost | only the newest lookup updates the banner and cost |
| Cart | lost on reload or tab close | saved on this computer for 2 weeks; **Start over** clears it |

**Kept as is, on purpose:**
- **Garment cost:** the cheapest **sale** price across colors (Stephen, 9/29 and 10/5: "we use the sale price for our quotes"). SanMar myPrice includes sales, and S&S uses customerPrice.
- **Decopress grids:** vendor pricing, left as is (10/5). Two cells look odd if anyone checks the Decopress sheet:
  - Reflective 100–199 @ 1.5×1.5 is $2.64 (Metallic is $1.64).
  - Metallic and Reflective 5000+ rows cost more than the 2500–4999 rows.

## Mockup — flow and layout (Oct 5) · `price-o-matic-mockup.html`
Built on the real v93 rates and apparel math (copied in unchanged; same quote gives the same price, $12.25 @ 144). The garment search is mocked (3001 / 5000 / PC54). Apparel only.
- **Order of steps:**
  1. **Garment:** search first; the result shows name, vendor, sale end and 2XL/3XL upcharges, and fills the cost, which stays editable.
  2. **Quantity:** one big box; "Min 55 pcs" on one line.
  3. **Prints.**
- **Add-ons** (Fleece, Shipping, AS Colour < $500) replace "Delivery options".
- **Each print has a location** (Front / Back / L chest / R chest / Sleeve / Neck / Other). The card is titled "Front 3C".
- **Compact print card:** underbase is a No/Yes toggle, ink changes is a − / + stepper, and print type is a Tee / Fleece / Combo toggle. About half the old height.
- **Right column always visible:** price per piece (type over it to adjust), price breaks (tap a qty to switch to it, add another qty), one **Add to quote** button, and the quote below it.
- **Quote lines are short:** "Front 3c · Back 1c · S&S $3.29" plus the size upcharges. One **Quote PDF** button for the whole quote.
- **Not offered:** a red-amber note on the card and in the price panel, and Add is off.
- **Phone:**
  - Quick quote ▾ menu instead of five buttons.
  - A sticky bottom bar with the price and **+ Add**.
  - Search, vendor and Find wrap onto two rows.

## Mockup v2 — calmer, laptop-first (Oct 5) · `price-o-matic-mockup-v2.html`
Stephen: v1 "still feels a little loud and a lot to look at". Sales quotes on laptops.

**What a 2026 Pine apparel job looks like** (Airtable, 1,945 non-bandana lines and 2,778 imprints since Jan 1):
- **Garment:** short-sleeve tee 48% · cap 20% · hoodie 5%. Embroidery is 25% of lines (mostly caps).
- **Qty per line:** median 40; 80% are under 100 (p25 23, p75 75, p90 150).
- **Locations per line:** 1 → 52% · 2 → 37% · 3+ → 10%.
- **Where:** Front 43% · Back 24% · Left chest 16% · size tag 3% · sleeves 4%.
- **Colors per screen print:** 1c 42% · 2c 24% · 3c 13% (79% are 3 or fewer); over 6 is 3%. **Ink changes:** none on 90%.
- **Supacolor** about 5% (mostly 4×4, 2.5×2.5, 11.7×11.7); **Deco** is rare.

**So v2:**
- **Garment and quantity on one line.** The garment line underneath holds the name, sale, cost and add-ons as small pills.
- An empty qty box previews at 40 pcs, and Add stays off until a qty is typed.
- **Prints are rows, not cards:** location dropdown · method (Screen / Emb / Supa / Deco) · a "− 1 color +" stepper · Underbase checkbox · price/pc.
  - Ink changes, printed-on (Tees / Fleece / Mixed) and Tag sit behind "more".
  - It opens with one row: **Front, Screen, 1 color** (the most common job).
- **Add a print** with one tap: + Back · + Left chest · + Left sleeve · + Size tag · + Other. A cap starts on Emb.
- **"Start from ▾"** presets match the common jobs: tee front 1c, tee front + back, left chest + back, cap embroidered, hoodie 2c.
- **Quieter look:**
  - Only the top bar is black and only Add to quote is yellow.
  - Selected states are a white "pill" or a pale yellow tint, not solid black.
  - Labels are sentence case.
- **Right rail:** price per piece (type to adjust), breaks at roughly 1×, 1.5×, 2× and 3× (tap one to switch), Add to quote, then the quote and one PDF button.

## Mockup v3 — buttons back, room to breathe (Oct 5) · `price-o-matic-mockup-v3.html`
Stephen on v2: "a little too compressed", the desktop screen is mostly empty, and he still likes buttons for moving through quickly. So v3:
- **Guided column:** 1 Garment → 2 Quantity → 3 Prints, each its own panel with more space (15px base type, 22–26px padding, max width 1560).
- **Buttons are the main input again:** 44px tall, white with a light border; **selected = Pine yellow**. Black only for the top bar and Find.
  - **Quantity:** quick buttons 24 / 36 / 48 / 72 / 100 / 144 / 250, plus "other" (typical line is about 40; 80% are under 100).
  - **Garment:** recent garments as buttons with their cost; add-ons (Fleece +$0.50, Shipping, AS Colour order under $500) as buttons.
  - **Each print:**
    - Where: Front / Back / Left chest / Left sleeve / Size tag + More…
    - How: Screen print / Embroidery / Supacolor / Decopress
    - Colors: 1–6 + 7+… and a "+ Underbase" button
    - Embroidery stitch bands, Supa sizes and recipes, and Deco material and size are buttons too, with the common ones first.
  - Ink changes / fleece / mixed run are behind one link (90% of jobs have no ink changes).
- **Add a print:** dashed buttons + Back / + Left chest / + Left sleeve / + Size tag / + Other.
- The right rail stays put while scrolling: big price (type to adjust), four breaks you can tap, Add to quote, then the quote and one PDF button.

## v94 — the v3 layout on the real app (Oct 5)
Built from v93; all of v93's logic is kept: vendor lookup and banner, minimum auto-bump and Override, price override, cart (saved locally), proposal PDF, and the bandana, import bandana, flatstock and patch tabs. Element IDs and `data-*` attributes are unchanged, so the existing listeners still drive it. The look comes from one v94 style block added after the v93 CSS.
- **Top bar:** brand · product tabs (selected = yellow) · **Start from ▾** (presets) · **New quote**.
  - Presets now match the common 2026 jobs: tee front 1c / 2c, front + back, **left chest + back (new)**, **embroidered cap (new)**, hoodie 3c, hem label.
- **Two columns:** the builder on the left; on the right a column that stays put while scrolling, holding the price card (big editable price, **Add to quote**), price breaks, then the quote with **Quote PDF**. The PDF button on the price card is gone; the PDF comes from the quote, which v93 already required.
- **1 Garment:**
  - Find (search + vendor + Find) with a light vendor banner. The old one was a black block.
  - Garment cost, then **Recent** garments as buttons. The last 6 found on this computer re-run the lookup instantly from cache.
  - Add-ons as buttons.
- **2 Quantity:** quick buttons **24 / 36 / 48 / 72 / 100 / 144 / 250** plus "other".
  - Buttons below the minimum are struck through.
  - The minimum note and Override sit under them.
  - The v93 bump still applies: e.g. 2 colors + Underbase → qty goes to 45.
- **3 Prints:** each print is a panel titled by location ("Front · 3 colors incl. underbase") with its price per piece.
  - **Where:** Front / Back / Left chest / Left sleeve / Size tag + More… (Right chest, Right sleeve, Pocket, Back neck, Hood, Other). Size tag switches the method to Tag.
  - **How:** Screen print / Embroidery / Supacolor / Decopress / Tag. The buttons select; they no longer toggle off.
  - **Screen:** Colors 1–6 + 7+… and a **+ Underbase** toggle. Ink changes, printed on (Tees / Fleece / Mixed run) and fleece pcs are under one "extras" link, which opens on its own if any of them are set.
  - **Embroidery:** stitch bands as buttons, plus patch / woven / hem label application.
  - **Supa:** common recipes and sizes as buttons, the full lists in a dropdown, and per-sheet buttons.
  - **Deco:** material, size and applied-by buttons.
  - **Add a print:** + Back / + Left chest / + Left sleeve / + Size tag / + Other. A new print uses the same method as the first one.
- **Quote and PDF text** now lead with the location: "Front · Screen Print: 2 screens + underbase · Tees / Totes" (was "Imp 1 - Imprint Type (Screen Print): …").
- Other tabs use the same buttons and panels.
- Price breaks titles are short ("Price breaks · tap a quantity to change it", "Bandana price tiers").
- **Tests (mock vendor):**
  - The same quote gives the same price as v93 ($12.25).
  - The min bump: 2c + UB → 45, with 24 and 36 struck through.
  - All presets and all five tabs work; Start from is hidden off Apparel.
  - The not-offered case blocks Add.
  - The cart and recent garments survive a reload.
  - No page errors at 1990 / 1440 / phone widths and no sideways scroll.
- Not testable here: the PDF itself (jsPDF loads from cdnjs, which this environment blocks).

## Create order — mockup (Oct 5) · `pom-create-order-mockup.html`
The goal: replace the Airtable **Imprint Creator** and **Line Item Creator** interface forms (and the Garment Creator detour) with one screen that writes Order + Line Items + Imprints together, all linked.

**Two ways in (Stephen):**
- **From a quote:** the best case. Everything Price-O-Matic knows is filled in.
- **Start empty:** add line items and imprints by hand, or "Copy from a past order…".

**1 Order** (once): Customer (search + new) · Sales person, Due date (1/2/3-week buttons + date), Shipping and Source as buttons (rarer choices in More…) · Order notes. Status starts at **Awaiting Proof**, as today.

**2 Imprints** (one per location; the artwork):
- **Ink type** buttons for screen prints: Discharge / No Base W/B / EZP Base + W/B / Bleed Blocker + W/B, which cover over 80% of 2026 imprints.
- **Filled in automatically** from the quote for Supacolor (recipe), Decopress (material) and Embroidery (incl. patch / woven / hem label application).
- **Screens** = colors + underbase from the quote.
- Plus ink changes, location, nickname, notes, and **Repeat art**, which picks the previous imprint.
- **"Goes on"** chips link each imprint to its line items. This replaces typing "which imprints go where" into Proofing Notes; the same front print on two garments is one imprint linked to both.

**3 Line items** (one per garment + color):
- Garment matched to Airtable Garments, or **+ Add garment** right there.
- **Sizes XS–6XL + OSFA** with 2XL/3XL upcharges shown, a "sizes 120 of 144" check against the quoted qty, and a typical-run fill button.
- Price / pc from the quote.
- Imprints linked, **Proofing notes written for you** (editable).
- Women's / Youth.
- Production, finishing and shipping notes and the proof upload / Ready for 2nd Eyes sit behind one link.
- From empty: product type buttons, garment search, price.

**Right column:** what will be created (1 order · N line items · N imprints), a live checklist of what's missing, the quote total, **Create order** (in practice mode it shows the exact records it would write) and Save for later.

**Mapping notes for the build:**
- POM location names need to map to Airtable's Location choices: "Left chest" → "Left Chest", "Size tag" → "Size Tag", "Back neck" / "Other" have no Airtable choice yet.
- Airtable Imprint Type has no "Decopress - Suede", but POM offers Suede.
- The build reuses Sales Entry v23's field map (Orders / Line Items / Imprints field IDs).

## Create order — mockup v2 on real data (Oct 5) · `pom-create-order-live.html`
**What Stephen explained:** when a deal moves to *approved customer* in Pipedrive, the **Order already exists** in Airtable, with Invoice / Order # (autonumber + 2040), Customer, Sales Person, Source, Shipping, status Awaiting Proof, and sometimes a due date. So Create order **finds that order and adds to it**; it doesn't make a new one.
- **Imprint IDs** are Airtable's: `Imprint ID Generator` = order # + "-" + a letter by the imprint's position on the order, and an automation copies it into Imprint ID when the record is created. The screen only needs to create imprints in order. It previews the IDs, continuing after any imprints already on the order (10960-A exists → B, C, D).
- **Reads (GET only):**
  - the Price-O-Matic quote from this browser (`pom_cart_v1`, same site)
  - Customers (search by Company Name)
  - that customer's 8 most recent Orders. It auto-picks the newest Awaiting Proof with no line items.
  - existing Imprint IDs on the order
  - Garments by Product Number (style from the quote line) and Colorway (color after " - ").
- **Token:** the same `pine_at_key` the other Pine apps save in this browser. If it's missing, it asks once.
- **Imprints:** quote prints with the same location / method / colors / underbase (and recipe, size or stitches) across lines become **one imprint linked to all of them**. Screens = colors + underbase.
  - **Imprint Type mapped from the quote:** Supacolor recipe → "Supacolor - <recipe>"; Decopress material → "Decopress - …" (no Suede in Airtable); Embroidery (incl. applications); Size tag → "Supacolor - 1C Wearable".
  - Screen prints need the ink system picked.
  - **Location mapped** to Airtable's choices. "Back neck" / "Other" ask for a pick.
- **Sales person:** Patrick, Chris; **+** shows Garrett, Stephen. Josh removed (also in the first mockup).
- **Create order (practice)** lists the exact writes: PATCH the Order (rep, due, shipping, source), CREATE Imprints linked to the order, CREATE Line Items linked to the order, garment and imprints (with sizes and price). Nothing is sent.
- **Still to decide for the build:**
  - 2XL+ upcharges: Airtable takes one price per line.
  - Whether the build writes Proofing Notes or leaves them to the linked imprints.
  - The Location / Imprint Type gaps above.

## v95 — Create order button (Oct 5)
- Stephen couldn't get from a filled-out quote to Create order. v94 had no way there.
- v95 adds **Create order → (preview)** at the bottom of the quote, above Quote PDF, which is now a white secondary button. It saves the quote and opens `pom-create-order-live.html`, which reads it.
- The Create order page's "Back to quote" now points at v95.
- Otherwise identical to v94.

## Create order — mockup v3: Awaiting Proof only, past orders, repeat art (Oct 5) · `pom-create-order-live.html`
Stephen: "focus on the awaiting proof ones", add a past-print section with small mockups to find a client's old orders quickly, and let **Repeat** search the client's past Imprint IDs and attach one.
- **Order:** only the customer's **Awaiting Proof** orders are listed. With none, it says so and asks whether the Pipedrive deal has been moved to approved customer.
- **Past orders panel** (between Order and Imprints):
  - Up to 40 of the client's past orders (not Awaiting Proof, not Cancelled / Voided), newest first, as cards with the order's proof thumbnails (`Proof Image Lookup`), date, line count and prints ("Front 3c · Back 1c").
  - One search box: order #, location, ink, nickname, date.
  - Click a card to see its imprints (proof, ID, location, type, screens, inks) and line items (qty × price).
  - **Copy into this order** adds its line items as new lines (same garment, sizes, price) and its imprints as **repeats** of the old ones, linked to the right lines.
- **Repeat art… on each imprint:** opens a search of the client's past imprints (up to 80, via `Customer Name Search`) with proof thumbnails. Picking one fills location, type, screens and nickname, and shows "Repeat of 10612-A" with its proof. The preview adds **Previous Imprint** and copies its **Inks**.
- **Layout:** the summary rail stacks under the page below 900px wide; labels sit above buttons on phones.
- Still read-only: tested with mocked Airtable, 0 writes. This file stays the one mockup page (v95's Create order button links to it); the real build will get its own versioned file.

## Create order — phone layout (Oct 6) · `pom-create-order-live.html`
Stephen opened it on his phone and it looked off: the header wrapped letter by letter, section hints squeezed the titles, and Create order sat at the very bottom.
- **Header:** one line ("PRICE-O-MATIC · Read-only · ← Quote"); the long mockup note is cut to "Nothing is saved."
- **Sections:** the hint text moves under the title; tighter panel and card padding so the buttons get the width.
- **Imprints:** Ink changes gets its own row; nickname is full width with Repeat art… under it (same for Women's / Youth on line items).
- **Past orders:** two cards per row.
- **Bottom bar** (phones only): quote total, order #, and either **Create order** or **What's left** (jumps to the checklist). No more scrolling to the end to finish.
- Laptop layout unchanged. Tested at 390px and 1440px with mocked Airtable, 0 writes.

## Create order — grey size fill-in (Oct 6) · `pom-create-order-live.html`
Stephen asked for a greyed-out auto fill for the qty.
- Empty size boxes show a **grey suggestion** that adds up to the line's qty: S 15% · M 30% · L 30% · XL 15% · 2XL 10% (144 → 22 / 43 / 43 / 22 / 14).
- Type any size and the grey numbers **re-spread what's left** over the other sizes (XL 40 of 144 → S 18 · M 37 · L 37 · 2XL 12).
- One button accepts them: **Use these 144**, or **Fill the other 104** once some are typed. Replaces the "Typical run" link.
- Caps, hats, beanies, totes, bags, bandanas, koozies and towels suggest **OSFA** = qty.
- Grey numbers are only hints: nothing counts toward the sizes check until accepted or typed.

## v96 — top bar fits on phones (Oct 6)
- On Stephen's phone the top bar ran off the right edge: the product tabs were one long row wider than the screen (Flatstock and Patches cut off), and the bar stacked brand / buttons / tabs in a column with empty space.
- v96: brand and **Start from / New quote** share one row; the five product tabs wrap onto two rows so all are visible. Start from is back on phones.
- iPad: same idea, one row for brand + buttons, tabs below. Laptop unchanged.
- Create order's "← Quote" now points at v96. Otherwise identical to v95 (CSS only, no pricing changes).

## v97 — page no longer stretches on phones once a garment is found (Oct 6)
- Stephen's phone screenshot: after Find, the page zoomed out and ran off the right edge. The vendor banner's color swatch row (96 colors, one line) and the turnaround chip forced the layout wider than the screen (3,127px wide on a 390px phone).
- v97: the main column can shrink (`minmax(0,1fr)`), the banner info and swatch row scroll inside their own box, the turnaround chip gets its own row in the top bar on phone / iPad.
- Phone banner: small photo on the left, Dismiss pinned top-right, swatches use the full width (the "96 colors →" hint is hidden; the Pick color dropdown is right above).
- Turnaround chip reads "TURNAROUND 15 BUS. DAYS ~OCT 23" (was "Current average turnaround … business days") so it no longer covers the product tabs on a laptop.
- Create order's "← Quote" now points at v97. No pricing changes; quote → Create order handoff re-tested.

## v98 — phone: garment box, quantity, Add to quote in the bottom bar (Oct 6)
Stephen asked to check the phone view once a garment is selected.
- **Garment box (phones):** photo and name/prices share the top row; vendor chips, the stock table, Pick color and swatches use the full width below (they were squeezed into a 228px column beside the photo, and the stock table cut off at 2XL). Stock table scrolls sideways if a style has many sizes. Swatches are bigger (30px) and the row opens scrolled to the picked color. "96 colors · or tap a swatch below" hidden on phones.
- **Quantity:** 4-across grid (24 36 48 72 / 100 144 250 other) instead of a ragged wrap.
- **Bottom bar:** adds **Add to quote** next to Share (now an outline button). Tapping it adds the line and scrolls to the quote. With the builder empty and lines in the quote, the bar shows the **quote total** and **Quote (n) ↓** to jump there (it used to keep showing the last line's price).
- Laptop / iPad unchanged. Create order's "← Quote" now points at v98. No pricing changes; handoff re-tested.

## v99 — Start from works on phones (Oct 6)
- **Start from** didn't drop down on Stephen's phone: the button's container had `overflow:auto` on small screens, which clipped the menu. Now visible.
- Fixed a v98 slip: an empty grey garment box showed before any search (the phone grid rule overrode the hidden state).
- Bottom-bar **Add to quote** starts disabled until there's something to price (it was missing its first update because the bar sits after the script).
- Create order's "← Quote" now points at v99. No pricing changes.

## Create order — garment color from the quote (Oct 6) · `pom-create-order-live.html`
Stephen: "Why does it ask me to pick a color when I already did in the quote?"
- The quote line carries the color (e.g. "… 3001 … - Black"), but Create order asked Airtable for only the first **12** Garments of the style. The 3001 has ~100 colors in Airtable (238 records containing "3001" incl. CVC / Y / T variants), so Black usually wasn't in those 12 → "pick the color".
- Now: one query for the exact style + color (`TRIM({Product Number})` and `LOWER(TRIM({Colorway}))`, since some records have trailing spaces like "3001 " and "Dark Grey Heather "), then every color of the style (paged) for the dropdown.
- A matched garment shows as **✓ Bella Canvas 3001 - Black · matched from the quote · change**, no dropdown. If the color really isn't in Airtable it says so: *"Black" isn't in Airtable for 3001 — pick the color*. Dropdown lists color names only.

## v100 — Start from on iPhone, bottom bar, vendor garment on each quote line (Oct 6)
- **Start from** still didn't open on Stephen's iPhone (v99's fix worked in Chromium, which is all we can test here). On touch screens it's now the phone's own picker: an invisible `<select>` over the button. Laptops keep the pop-up menu.
- **Bottom bar covered buttons:** the v90 code that adds room under the page for the bar ran before the bar existed, so it never did anything. And the page scrolls inside `<body>`, which ignores bottom padding anyway. Now a spacer after the content is sized to the bar's real height (iPhone home bar included). Quote PDF / Create order clear the bar when scrolled to the bottom.
- **Vendor garment on each quote line** (`vg`): vendor, brand, style #, color, sizes offered, price tiers, so Create order works from the vendor's own naming instead of parsing the line name.

## Create order — vendor naming wins over Airtable (Oct 6) · `pom-create-order-live.html`
Stephen: "Feel free to start using the vendor naming to override Airtable so we start cleaning that up. Right now we manually add those."
- Match on Product Number + Colorway **or** `[S&S] Color Name` (trimmed, case-insensitive).
- **Matched but named differently** → preview shows **PATCH Garments**: Product Number / Colorway / [S&S] Color Name set to the vendor's exact text (e.g. "Heather Navy " → "Heather Navy", "3001 " → "3001"); Manufacturer filled only if empty. On screen: "Fixes Colorway, [S&S] Color Name in Airtable to S&S's naming". Cost is not touched on existing garments.
- **Not in Airtable** → preview shows **CREATE Garments** from the vendor: Manufacturer (mapped to the existing Airtable choice, e.g. "BELLA + CANVAS" → Bella Canvas), Product Number, Colorway, [S&S] Color Name, Cost = vendor price, 2XL–5XL up-charges from the vendor tiers, size checkboxes from the sizes the vendor stocks. The line item links to it. "pick an existing one instead" still offers the dropdown.
- A brand that isn't an Airtable Manufacturer choice is flagged ("ask Stephen"), never added.
- Still a read-only preview: nothing is written until the real build. Garment Name is a formula (Manufacturer + Product Number + " - " + Colorway), so it follows automatically.
- Phone bottom padding now includes the iPhone home-bar area.

## Create order — easier customer search (Oct 6) · `pom-create-order-live.html`
Stephen: "Can we make the customer search more intuitive?"
- **Before typing**, the box lists the orders **waiting for proof** (all customers, newest first): order #, customer, sales person, "created 2 days ago", and "2 lines already" when the order isn't empty. 8 shown, "Show all N". One tap picks the customer *and* that order.
- **Typing** filters that list instantly by customer name or order # — words in any order, partial words, "&" = "and" ("tree ban" finds Banshee Tree, "10958" finds the order). Matches are highlighted.
- Below, **Other customers · no order waiting for proof** from the Customers table (every typed word must appear), so a customer whose Pipedrive deal hasn't moved yet is still findable and the page explains why there's no order.
- Keyboard: ↓ ↑ Enter, Esc clears. Placeholder: "Customer or order #".
- Once picked, the customer shows as a yellow chip with **change**; the Order row only appears then. Order chips say "created today / 3 days ago" instead of raw dates.
- Same Airtable reads as before plus one: Orders where Order Status = Awaiting Proof (paged, up to 300). Still read-only.

## Create order — Past orders folded by default (Oct 6)
- Stephen: make past orders an optional dropdown. The Past orders panel is now one line: "Past orders · 3 orders · last 10612, Jun 12, 2026 — reorder or repeat art ▾". Tap to open the search + proofs; tap again to fold. Open/closed is remembered on this computer.
- "Repeat art…" on imprints still searches past imprints whether the panel is open or not.

## Is "Awaiting Proof" set by Pipedrive? (Oct 6)
- Checked the last 200 Orders: all 27 now at **Awaiting Proof** had Order Status set within 60 seconds of the record being created (`Order Status Last Modified Time` ≈ `createdTime`) and never changed since. Every other order had its status changed later. No Airtable automation sets Awaiting Proof. So the status arrives **with the order**, from whatever creates it (the Pipedrive → Airtable connection), not from a later step. Can't see the Zap itself from here; if it ever needs proving, the create step's Order Status field should read "Awaiting Proof" (or the Order Status field has it as its default).
- Safety net in Create order: orders that arrive with a **blank** status also show in the waiting list, tagged "no status yet", so a missed status never hides an order. Past orders exclude blank-status ones.

## Create order — only recent Awaiting Proof orders (Oct 6)
- 75 Orders sit at Awaiting Proof; only ~29 are from the last 60 days. The rest (2022 → Jun 2026) were never moved on or cancelled.
- The waiting list now shows Awaiting Proof orders created in the **last 45 days** (`RECENT_DAYS`). Searching still finds older ones, in their own section "Older than 45 days · probably stale", so nothing is unreachable. A customer's Order chips also ignore stale ones when a recent one exists.
- Checked before any cleanup: no Airtable automation fires on **Cancelled / Voided** (customer emails fire only on Completed / Ready to Order), so cancelling stale orders sends nothing.

## Airtable cleanup — stale Awaiting Proof orders cancelled (Oct 6)
Stephen OK'd: switch the Awaiting Proof orders created before July 2026 to **Cancelled / Voided**. 46 changed; 29 remain at Awaiting Proof (Aug 4 onward). No automation fires on Cancelled / Voided (checked first).
- Changed (order #): 2026-06: 10201, 10172 · 2026-04: 9959, 9958, 9942, 9941, 9940, 9939, 9938, 9937, 9914, 9832, 9831, 9830 · 2025: 9009, 8878, 8768 · 2024: 7153, 7108, 6533, 6527, 6318, 6064, 5995, 5936 · 2023: 5587, 5461, 5361, 5280, 5051, 5029, 5007, 4995, 4986, 4967, 4945, 4943, 4897, 4883, 4847, 4843, 4817, 4743, 4708, 4627 · 2022: 4609.
- To undo one: set its Order Status back to Awaiting Proof.
- Left for sales to check: 10627 Subculture Cyclery (Aug 13, 6 lines), 10569 Cheba Hut HQ (Aug 4, 2 lines), and the September ones (oldest 10804 West Kill Brewing, Sep 8).

## Create order — pick several imprints from a past order (Oct 6)
Stephen: "When a past order has a few imprint ids can we select multiples as well."
- In an opened past order, the imprint cards are now tick-boxes (✓ in the corner), plus "select all". **Repeat N imprints in this order** brings in just those.
- Each pick attaches to a print already on this order with the same location **and** method (e.g. 10612-A Front discharge → your Front screen print), setting Repeat of / ink type / screens / nickname. If there's no such print it's added as a new repeat imprint on every line (untick under "Goes on"). A green line says where each one went.
- "Copy whole order" (now the white secondary button) still brings in all line items + imprints.

## Create order — repeat plan with quote checks (Oct 6)
Stephen saw picked past imprints merge into the quote's prints and asked to walk through it. Merging stays, but it's now visible and checkable first:
- **Repeat N imprints** opens **Where each one goes**: one row per pick (proof, ID, location · type · screens) → a dropdown of this order's prints (default: same location + method, not already a repeat; two picks can't land on the same print) or **Add as a new imprint**. Nothing changes until **Apply**; cancel backs out.
- **Checks against what the quote priced** (shown on the plan and, after Apply, under "Repeat of" on the imprint card):
  - screen count differs: "Quote priced 3 screens; this art has 4"
  - underbase: quote priced one but the art's ink type has none (No Base W/B, Discharge), or the art uses EZP Base / Bleed Blocker and the quote didn't price one
  - method differs (e.g. quote embroidery, art screen print)
  - new imprint: "not priced in the quote — re-quote or price it by hand"
  - otherwise ✓ "Matches the quote (3 screens)"
- Warnings don't block Create order; they're for sales to re-quote if needed. On Apply the print keeps its location, garments and quoted price; Repeat of, ink type, screens, inks and (if blank) nickname come from the past imprint.
- "Goes on" chips use the short garment name for vendor-added garments.
- Stephen confirmed (Oct 6): **Discharge counts as no underbase.** A discharge repeat on a quote that priced an underbase is correctly flagged.

## v101 — Create order even with nothing filled out (Oct 6)
- Stephen: we need a Create order button even if nothing is filled out. Before, it lived only in the quote box, which is hidden until a line is added.
- **Laptop / iPad:** a yellow-outlined **Create order →** at the right end of the top bar, always there.
- **Phone:** the bottom bar's button reads **Create order →** whenever there's nothing to price and the quote is empty (then Add to quote → Quote (n) ↓ as before).
- Both save the current quote first, so an empty POM hands over an empty quote — a leftover quote from earlier can't sneak in.
- The quote box's button now says **Create order with this quote →**.
- Create order's empty start says what works today: pick the order, then copy a past order or repeat past imprints; adding line items by hand comes with the real build. Its "← Quote" points at v101.

## Create order — add line items and imprints by hand (Oct 6)
Stephen: in future Awaiting Proof orders won't have line items attached, and there was no way to add a line item or imprint here.
- **+ Add line item** (under Line items): Type buttons from Airtable's Product Type (Printed / Embroidered Apparel, Flatstock Printing, Woven Patches, Embroidered Patches (100%), More… for the rest), **Qty × $/pc** typed in (= line total shown), and for apparel a **Style #** box → Find loads every color of that style from Garments → pick the color. Sizes get the grey suggestion from the qty. Non-apparel types need no garment; sizes go to OSFA = qty automatically. "other style" re-opens the style box.
- **+ Add imprint** (under Imprints): Method buttons (Screenprint, Embroidery, Supacolor, Decopress, Patch & label, Flatstock, Finishing) → the matching Airtable Imprint Types (buttons, or a list for Supacolor), location, screens + ink changes for screen print, Goes on, nickname, Repeat art…. Starts on every line.
- Line item cards can now tick imprints on/off directly (same links as the imprint's "Goes on"). Any line or imprint has **remove**; removing a line keeps the other links right.
- Checks: hand lines need qty and price (and a garment for apparel types). Hand-added imprints aren't compared to a quote ("Added by hand — price it on the line items").

## Create order — screens by buttons (Oct 6)
Stephen: screens is a typed box; explore buttons.
- Screen-print imprints now have **Colors** buttons 1–6 + a 7+ list (to 12) and a **+ Underbase** toggle. **Screens** is worked out (colors + underbase) and shown with "as quoted", or an amber **quote priced N** when it no longer matches what the quote priced.
- Picking the **ink type sets the underbase**: EZP Base / Bleed Blocker → on, Discharge / No Base W/B → off (Discharge = no underbase, per Stephen). The toggle still overrides it.
- Repeats fill colors + underbase from the old art (its screens minus 1 if its ink type has a base).

## Create order — prices that were missing (Oct 6)
Stephen: price isn't showing up in Create order.
- Quote lines carry their price (checked: a 72-pc quote line arrives at $14.20). The gap was **past-order lines**: 601 Line Items with a qty have no **Price Input** (older orders, patch lines), so Past orders showed "× $0.00" and "Copy whole order" brought them in at $0.
- Past line price now falls back: **Price Input** → **Line Total ÷ Total Quantity** → Airtable **Autoprice**. The card says which ("from the past order (its line total ÷ qty)").
- Any line still without a price shows a **$ / pc** box with "no price on the old order — enter it", and the checklist lists it. A price can also be changed by hand ("change").
- Past order detail marks lines with "no price" or where the price came from.

## Create order — vendor price check (Oct 6)
Stephen: pull in pricing from vendors (or Airtable) and scan vendors so we aren't under-charging.
- Runs on its own once garments are matched (and again after Copy whole order / picking a garment; "re-check" in the rail). Uses the same worker the POM uses (`pine-workers…/proxy`): S&S `/products` (customerPrice; rows from another brand with the same style # are dropped), SanMar `/sanmar/pricing`, AS Colour variants + the AS Colour pricelist the POM caches in this browser. Vendor price = **cheapest across colors**, per size tier, cheapest vendor wins — the same rule quotes use.
- Each garment line gets a **Price check** row:
  - **Garment up since it was priced**: vendor XS–XL today vs the garment cost the quote used (`snap.garmentCost`), or Airtable Garment Cost for past / hand-added lines → "$0.40/pc … about $19.20 less margin".
  - **2XL+ not covered**: the line has one price, so 2XL/3XL/4XL+ pieces × (their vendor price − XS–XL price) → "14 pcs in 2XL+ cost $21.00 more — add about $0.15/pc". (This is the open 2XL+ upcharge question, now with a number.) Recomputes as sizes are typed.
  - Info lines: Airtable Garment Cost out of date vs vendor today; vendor prices when there's nothing to compare against.
  - ✓ "Not under S&S's price today" only when there was a basis to compare.
- Rail: "⚠ 3 lines may be under-charging · ~$50.70" or "✓ Prices check out against vendors today".
- Read-only: nothing is written (Airtable Garment Cost is shown, not changed).

## Create order — POM pricing for every line (Oct 6)
Stephen (phone screenshot of a hand-added 3001 Black × 100, price box empty): still not pulling in vendor pricing or printing cost.
- Create order now loads **price-o-matic-v101.html in a hidden iframe** (same site) and calls its own `computeApparelAt` / `computeFlatstockAt`, so prices match quotes exactly — no second copy of the rate grids. **When the POM gets a new version, bump the iframe `src` here.**
- Per line, **POM price today** = garment (today's cheapest vendor price → Airtable Garment Cost → the quote's cost, +10% as the POM does) + the imprints linked to that line (screen print colors/underbase/ink changes, embroidery band or application, Supacolor recipe at 4×4, Decopress material at 2.5×2.5; fleece from the quote, Airtable "Fleece?", or the garment name) → gross-up and $0.05 rounding by the POM. Flatstock lines: colors of the linked Flatstock imprint, French paper.
- Shown with the breakdown: "garment $4.06 ($3.69 S&S today +10%) + prints: 10961-A Front · 2c $4.84 · 10961-B Left Chest · embroidery $4.50".
- Lines with **no price** (hand-added, old orders) take the POM price and keep following it as garment/prints/qty change, until someone types a price. Typed or quoted prices are never overwritten: the row says "$X/pc more than quoted / the typed price" with **Use $X**, or "✓ matches today".
- Not priced here (says so): patches and other non-apparel types except flatstock, Patch/Label ONLY, Finishing; bandanas. 2XL+ still comes from the price check below it (its "✓ not under vendor price" line was dropped — the POM row is the verdict now).
- Tested with a local web server (the iframe needs a real origin; file:// can't share it).
