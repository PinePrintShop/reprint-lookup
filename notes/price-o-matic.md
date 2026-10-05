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
