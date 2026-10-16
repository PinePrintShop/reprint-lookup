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
- **Next:** see the 2026-10-16 · built entry below.

## 2026-10-16 · built (Price-O-Matic v107, Create order v19, Line Item Review v20)
- **Done:** Price-O-Matic saves the quote and its lines when the PDF is made (making it again updates the same quote and replaces its lines) and puts "Q-n" on the PDF. Details: `notes/price-o-matic.md` (v107).
- **Done:** Create order finds the quote by the order's Pipedrive deal # (or a Q-number / customer search), "Fill from quote" fills the imprints and line items from Quote Data, and Create order links the Order (Quotes › Order) and sets Status Won. Details: `notes/create-order.md` (v19).
- **Done:** Price-O-Matic's price wins (it is the line's Price / Piece). Line Item Review shows the quoted $/pc beside Autoprice, read-only. Details: `notes/line-item-review.md` (v20).
- **Writes, all practice-safe:** POM: Quotes POST/PATCH, Quote Lines POST (10 per call) and DELETE (when a quote is re-made). Create order: one Quotes PATCH {Order, Status Won} after its usual writes. Neither table has automations.
- **Still open:** Sizes on Quote Lines stays empty (Price-O-Matic doesn't take a size breakdown). Lost / Draft are never set by an app; set them by hand in Airtable.
