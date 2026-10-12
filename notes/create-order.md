# Create order

## 2026-10-12 · blank-order mockup (`create-order-blank-mockup.html`)
Stephen: bring sales into Create order slowly. They start from a blank order and add garments and sizes themselves. Pre-filling from the Price-O-Matic quote is the end goal, but it comes later. Adding every imprint first and then remembering which line each goes on is confusing.

**Flow (practice-only mockup with mock data and no Airtable; edit in place):**
1. **Order:** pick the order Pipedrive made (10902 New Millennium or 10939 Black Fox Provisions).
2. **Garments:**
   - Search a style # (5026, 3001, 1134, "dad hat", "checker") and tap every color. **Each color becomes its own line.**
   - Sizes per line with a running total, or type a total and **Spread over sizes** (OSFA for hats).
   - Women's/Youth toggles on each line.
3. **Designs, one at a time:**
   - **Repeat of past art…** (that customer's past imprints, with thumbnails), or Location, Method, Ink/type, Colors (+ underbase), Ink changes.
   - **Goes on:** garment chips with color swatches, or "all garments".
   - **+ Add the next design.**
   - Warns when a screen-print design goes on dark and light garments with no ink change, with a one-tap "+1 ink change".
4. **Order map & prices:**
   - A grid of garments × designs with tap-to-change ticks.
   - Price per piece defaults to today's Price-O-Matic price. Typing a lower price turns red ("under POM $20.80").
   - **+ Add fee** for invoice-only lines.
5. **Rail:** a checklist (order, sizes, designs complete, every garment has a design, prices), counts and the total. **Create order** unlocks when everything is ticked. In the mockup it shows what it would write.

**Pricing in the mockup** is today's POM screen-print math: 12 min/screen, 230/hr, $579.29/hr, $35 per ink change, garment +10%, $0.65 shipping, ÷0.97, rounded to $0.05. Embroidery and patches use the tier tables. Order 10902 on AS Colour 5026 reproduces Airtable's Autoprice exactly: Black $20.80, White $18.95.

**Tested** in Playwright:
- 10902: two colors, sizes typed and spread, design A as a repeat with the ink-change warning, B and C backs, the map, prices set under POM and flagged, a fee, then create.
- 10939: 7 hat and tee lines and a patch design on all of them.
- No errors.

**Next:** Stephen and sales click through it. Then decide whether price defaults to the POM price or is typed in, and wire it to Airtable in `pom-create-order-live.html`.

## 2026-10-12 — Mockup rebuilt around products (big-order flow)
Checked against WARGAME 10500 (13 lines, 7 imprints) and 10975 (9 lines, 9 imprints). In Airtable today, sales make every imprint in Imprint Creator first, typing each nickname. Then they make line items one at a time (e.g. "3001 White"), find the right imprint IDs, tick them, submit and repeat. On 10500 that is 34 imprint look-ups.

The new flow works one product at a time:
- **Product**: one design idea (H20 BOY, 92 SHIRT, OG BRAND 3D). The name groups the versions and starts each line nickname ("92 SHIRT – Blue 293 on White").
- **Prints**: one row per location. Each is its own imprint ID with **its own Imprint Nickname** (per location, like "Damn Proud" on the left sleeve and "USN Emblem" on the left chest). A print can be new, a repeat of past art, or one that's already on this order (the size tag shared by every product).
- **Versions**: each row is garment + color + ink colors + sizes + print toggles. Each row becomes a line item. "Same garment, other inks" copies the row so only the ink colors need typing.
- **Ink changes are counted automatically**: the number of different ink colors typed on the versions that share a screen print, minus one. They can be overridden per print.
- **Step 3** shows every line × imprint with today's POM price; under-POM prices show red. The rail compares this flow with the Airtable way.

Each order card has "Start blank" and "See it built" (loaded with the real order). 10902 reproduces Airtable's $20.80 / $18.95 autoprice exactly. Garment costs for the WARGAME styles are placeholders, so their red under-POM flags are rough.

## 2026-10-12 — No typed product name; line names come from the Airtable formula
Stephen pointed out that the line item name is a formula, e.g. `10977-Murf.studio-IND-IND4000Z-BK` (order-customer-brand code-style-color code), and only imprints get typed nicknames. The mockup now matches:
- The "product name" box is gone. Each **group** is titled with its own prints' nicknames, e.g. "Ragin Mess MENS". Shared prints like a size tag are left out of the title.
- Step 3 shows each line's automatic name. One note explains that lines on the same garment and color share a name, and the imprints tell them apart. On 10977 both lines are IND4000Z Black (MENS and WOMENS backs).
- Added 10977 Murf.studio as the small real example. Added IND4000Z to the mock catalog. The POM estimate uses the fleece shipping allowance.

## 2026-10-12 — "Same garment again" copies the whole row
Stephen: a second row on the same garment is usually another design (10977 MENS vs WOMENS back), not just other inks. The button now copies the last row's garment, color, ink colors and print ticks; sizes start empty. Sales then tick the different prints or change the inks. 10977 is now shown as one group with two rows (A B C and A C D), the way it would really be entered. "Add another group" is only for a separate set of prints, such as hats.

## 2026-10-12 — Fresh start: built for the common order, with reorder as its own door
Stephen felt the product/group flow was layered on itself and not yet better than Airtable, so the mockup was rewritten from scratch. It's based on the last 12 months of Airtable data (1,698 orders, cancelled left out):
- 51% of orders have 1 line, 34% have 2–3, 14% have 4–9, and 1.6% have 10+. 56% have exactly one imprint.
- 30% reuse some past art and 15% are a straight reorder of one past order. Repeats go back a median of 7 months, and 27% are over a year old.
- 226 imprints are ticked Repeat? with no previous imprint linked.

Ideas taken from other print-shop software: Printavo (imprints attached to groups of garments), DecoNetwork (reorder and reuse of artwork) and YoPrint (decoration as a priced service).

The flow:
1. **Pick the order** (Pipedrive made it).
2. **Two doors** when the customer has history:
   - **Reorder** lists their past orders with art thumbnails. One tap copies the garments and makes the imprints as repeats with Previous Imprint ID filled. It shows last time's sizes and price.
   - **New order** is everything else.
3. **One card per line item.** Proofs stay per line, as today. Each card has:
   - Garment search, ranked by style #.
   - Color chips.
   - Sizes: grid, or **paste from the email** ("6 S, 6 M, 15 XL", "S-10 M-20", "10 small 20 med", "2X 3"). The sample Pipedrive email sits on screen to copy from.
   - Prints, each added from one of three tabs:
     - **On this order:** same imprint ID.
     - **Customer's past art:** searchable thumbnails; makes a repeat.
     - **New art:** nickname, location, type, colors, inks.
   - Ink colors per print per garment. A difference counts as an ink change.
4. **More lines:** "Another garment, same prints" (men's and women's tees), "Copy last line" (same hoodie with a different back, as on 10977) or a blank line.
5. **Rail:** checklist, imprint list, total and Create. **A clock** times each order from picking it to Create, for the stopwatch test against Airtable.

Real data comes from Mill City Church (7 past orders, 23 imprints), 10977 Murf.studio and WARGAME. A 10193 reorder of 6210 gives 10193-A/B as repeats of 6210-A/B. 10977 built by hand gives Airtable's exact line names and 4 imprints, with prices within about $1 of Airtable.

Found while pulling data: Autoprice is #ERROR! on lines of finished orders, because the imprint quantity rollup reads 0 there. This was not caused by the October formula changes. Open orders price normally.

## 2026-10-12 — Pipedrive: worker v18 (read-only email lookup)
Stephen added `PIPEDRIVE_KEY` (sales@ user) as a Cloudflare secret. The live worker was checked first and matches `workers/pine-workers-v17.js`; v18 is v17 plus:
- `GET /proxy/pipedrive/me`: checks the key and returns only the key owner's name.
- `GET /proxy/pipedrive/emails?email=<customer email>`: finds the Pipedrive person by exact email. Airtable stores no Pipedrive IDs, and Orders carry the customer email. Returns their deals and newest synced emails, with plain-text bodies for the newest 3. Cached for 2 minutes.
- Same Airtable-token gate as PandaDoc. GET only; nothing in Pipedrive can be changed through the worker.
- Tested locally against a fake Pipedrive. A live test needs the deploy. **Deploy:** Cloudflare → Workers & Pages → pine-workers → Edit code → paste `workers/pine-workers-v18.js` → Deploy. Then open `pipedrive-test.html`.
- Emails only show if sales@ has email sync on in Pipedrive and the emails are linked to the person.
