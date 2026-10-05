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
