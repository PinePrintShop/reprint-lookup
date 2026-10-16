# Quotes table (Airtable)

## 2026-10-16 · created
**Stephen:** "Let's build a new Airtable Quotes Table since that won't interfere with anything" and "Quotes Table looks great build away".
- **Two new tables in base appJkaLk8DykjsgHR.** Neither has automations. The only change to existing tables is the reverse link field Airtable adds to Orders.
- **Quotes** `tblZNUTfj6VfK6oQx`: one record per quote PDF.
  - Quote # `fldh6oYoQzaLgJZt1` (autonumber, shown as Q-n)
  - Quote Date `fldlIT3dglFtsm1zE`
  - Rep `fldjQrjmvvTROYcOZ`
  - Customer `fldZyze7GKixWgsof`
  - Pipedrive Deal # `fldmnLNCQUrLRBYOH`
  - Status `fldE0CSpMJnKOFzOh` (Draft / Sent / Won / Lost)
  - Quote Total `fldWdp85QylkT65ls`
  - Notes `fldaI7X4KlP7UmWlk`
  - Order `fld9weNcXuTZiDqaa` (link to Orders; reverse field on Orders `fldUKg4jFYXhEAu0q`)
  - POM Version `fldi1xxm49NHohh9Q`
  - Quote Lines (reverse link) `flduyX96TKTc4A1eJ`
- **Quote Lines** `tbljlrtUFTWlAYSav`: one record per garment line.
  - Line `fldXr35Fs4XM2WuBa`
  - Quote `fldl6j4sMRu5vgOZ6`
  - Product Type `fldUkIq6BRh063DnE`
  - Garment Style `fldVfvIOyQ9c7DvHg`
  - Color `fldEkffqOI43A4TmP`
  - Quantity `fldXZBTHFnTpvrR3y`
  - Sizes `fldWcnaEmk0nBoj7N`
  - Prints `fld31JSgfm0SknVIp`
  - Price / Piece `fldyDk23N00qhEvOI`
  - Line Total `flds296VbytvLYnfS`
  - Price Breaks `fldDKa39n0smi8Lft`
  - Quote Data `fldsj9rEcgPE57pNt` (JSON of the full Price-O-Matic line, so Create order can rebuild it exactly)
- **Next:**
  - Price-O-Matic saves the quote and its lines when the PDF is made, and puts Q-n on the PDF.
  - Create order finds the quote by the order's Pipedrive deal # (or Q-n), fills in the line items from it, and links the Order.
  - Price-O-Matic's price wins. Line Item Review keeps Autoprice beside it for comparison.
