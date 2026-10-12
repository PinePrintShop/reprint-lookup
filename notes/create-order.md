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
