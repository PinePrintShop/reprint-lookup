# Purchasing app: ordering flow redesign (Oct 2026)

v90's "By vendor" checkbox screen didn't fit how purchasing actually works. This plan starts from his [MGR] Apparel RFO view.

## How he works today (the view, left to right)
1. Rows are grouped by order and stacked by due date.
2. Each line shows: Product type · ASAP · Due · Imprint · Garment.
3. Sizes XS → 6XL, then Total.
4. Order Notes, then **Supplier** and **PO #**.
5. Extra XS → 5X, then List of Extras.
6. Cost per size bracket, then Inbound freight.
7. **Ordered ✓**, then Total line cost.
8. Context, far right: Salesperson, Production / Sales / Proofing notes, Print location, Shipping / Finishing notes, **Scheduled imprint**, Shipping method.

He works order by order, batching into vendor carts across orders. When a warehouse is short, he splits a line across warehouses. Supplier is a multi-link, so one line can carry two warehouses.

## New flow (left → right)
- **Orders:** sorted by due date. Each shows ASAP / Hard Deadline and the print date.
- **This order:** the context goes in a header (salesperson, print date, shipping method, flagged notes). Each line runs:
  1. sizes
  2. extras
  3. warehouse, with a ship-time estimate and arrival date, plus **+ split**
  4. cost
  5. **Add to cart**
- **Carts:** one per warehouse, built up across orders. None of the vendor sites has a quick-order / bulk paste, so each cart item gets an **Open on vendor ↗** link and its sizes laid out like the site's size grid, to type in. After checkout, he enters the PO and ticks ✓ Ordered. That writes Ordered, PO, Supplier, extras and costs to every line in the cart.

## Mockup color check
- Each line card shows the proof thumbnail from **Proof Images** (`flddhvdkKI31tFTdX`). Airtable makes thumbnails for PDF attachments.
- Tapping the thumbnail opens a popup with the big proof image next to the line item's garment and **color**, plus **✓ Color matches** / **✗ Doesn't match**, and a link to open the full PDF.
- A mismatch is appended to **Production Notes** and flagged red on the card. Adding that line to the cart asks to confirm first.

## Notes (editable, written back to Airtable)
- Every note column in his view is its own long-text field on the line item, so each line card has a notes row:
  - Order Notes `fldF378cgWuOcWNL6`
  - Production Notes `fld4FjoCQ5bXdwjJj`
  - Sales Notes `fldG3tzTzUC3QQJ1I`
  - Proofing Notes `fldWdnT83KLEvBrg4`
  - Shipping Notes `fld7rY74m37acM2Ik`
  - Finishing Notes `fldqsj7nZgHrtRbEn`
- Notes that have text show up already open. **+ Add a note…** opens any of the others.
- Editing saves on leaving the box: a PATCH of that one field on that line item, then "✓ saved to Airtable".
- The order header only counts the notes.

## Ship time
- **UPS Ground estimate** from the warehouse's city to the shop (Fort Collins 80524), by straight-line distance, in business days:
  - under 250 mi: 1 day
  - under 750 mi: 2 days
  - under 1,150 mi: 3 days
  - farther: 4 days
- Results:
  - **2 days:** SLC (Salt Lake, Phoenix) · S&S Olathe, Ft. Worth, Dallas · Sanmar Phoenix, Dallas, Minneapolis · Bella Canvas Las Vegas.
  - **3 days:** S&S Reno, Lockport, Bolingbrook, Fresno, West Chester · Sanmar Reno, Seattle, Cincinnati · AS Colour CA.
  - **4 days:** S&S Georgia, Reading, Orlando, Middleboro · Sanmar Jacksonville, NJ, Richmond · AS Colour NC · Bella Canvas MD.
- Reno (781 mi) sits on the 2/3-day line.
- The app needs each warehouse's location; Carolina Creative's is unknown.
- The Suppliers table's **Days In Transit** field (and so Expected Blank Arrival) disagrees with these numbers. It could be updated to match later; ask first.
- History (Ordered → Received) isn't used, because Received marks when a box is processed, not when it lands.

## Splits
- Supplier links both warehouses.
- PO # = the order date, `MMDDYY` (e.g. `100126`), auto-filled and editable. A split placed the same day has one PO; one placed on a later day gets both, e.g. `100126 / 100226`.
- The split sizes are written into Order Notes, e.g. `Split: S&S Reno M 10, L 10 · S&S Olathe 2XL 4`.

## Invoice check tab (reporting)
- POs are the order date (`MMDDYY`), shared by every vendor that day, so a row is **one PO at one warehouse**. Each row has:
  - warehouse, date, lines, pieces and orders
  - the **Airtable total** (sum of Total Line Cost: (ordered + extras) × bracket cost, plus Inbound Freight)
  - a box to type the **vendor invoice total**
- Status: Not checked / ✓ Matches (within 50¢) / Invoice ±$X.
- "To check" (default) hides POs that match. Tap a PO to see its lines, so you can find what's off.
- **Open question: where the invoice total is saved.** Nothing in Airtable holds it today. The suggestion is a small new **Vendor Invoices** table (PO #, warehouse, invoice #, invoice total, date, checked by, matched), linked to the line items. Ask before creating it.
- Split lines placed on different days (PO `100126 / 100226`) need care: Airtable has one cost per line, so the app splits it by the sizes that went to each warehouse.
- Later: pull invoice totals automatically (the S&S API has invoices; check SanMar / AS Colour) instead of typing them.

## Later phases
- **Live stock/price** per warehouse, from S&S / SanMar / AS Colour through the worker. This drives splits.
- **Truck scan:** scan the UPS 1Z label when boxes come off the truck, match it to the line item's **Tracking Number** (`fldb48U3afClKC6p4`) and so the PO, and log a real arrival time.
  - Tracking can come from the S&S orders API and SanMar ship notices.
  - This gives true ship time per warehouse and flags late boxes before print day.
- **S&S API ordering:** needs a worker POST route with auth.
