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
