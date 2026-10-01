# Box logic review (early 2027)

Goal: tighten auto boxing in the Receiving app using the "packed right?" log
(Airtable table `tblX7y8RsEbMttDuF`). Fill it in by tapping the green bar under each box label.

## Done so far
- **v72:** the box size is picked from what's left of that garment type on the order, not from one line item. 2×100 bandanas now go in one M box instead of two S boxes.

## What the log showed (51 entries as of Oct 1, 2026, nearly all bandanas)
| Order | Auto | Actually packed |
|---|---|---|
| 10580, 10789 | 100/box | 200 in one |
| 10686 | 100/box | 300 in one |
| 10576 | 300/box | 500 in one |
| 10670 | 300/box | 600 in one |
| 10536 | 500/box | 1,000 in one |
| 9748 (caps) | 50/box | 150 in one |

## To decide with more data
1. **Box capacities**, now set in `getBoxSizeAndCapacity`:
   - bandana: S 100 / M 300 / L 500
   - cap: S 50
   - tee: 100 per box (S ≤24, M ≤50, L >50)
   - hoodie: L 15
   - sweatshirt: L 24
   - The log suggests bandanas and caps can go much higher.
2. **Bigger sizes take more room:** count 2XL+ as more than 1 (no tee/hoodie data yet).
3. **Keep each size whole in one box:** easier staging, but it can cost an extra box. Only worth doing where it doesn't add a box.
4. **Small leftovers** of hats/bandanas riding in a tee box instead of their own box.
5. **Log the box size picked** (S/M/L/Vendor) with each feedback entry, so we learn which box was actually used, not just the count.
