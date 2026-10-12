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
