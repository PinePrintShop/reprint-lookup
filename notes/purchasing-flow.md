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
- PO # holds both, e.g. `1234 / 5678`, unless told otherwise.
- The split sizes are written into Order Notes, e.g. `Split: S&S Reno M 10, L 10 · S&S Olathe 2XL 4`.

## Later phases
- **Live stock/price** per warehouse, from S&S / SanMar / AS Colour through the worker. This drives splits.
- **Truck scan:** scan the UPS 1Z label when boxes come off the truck, match it to the line item's **Tracking Number** (`fldb48U3afClKC6p4`) and so the PO, and log a real arrival time.
  - Tracking can come from the S&S orders API and SanMar ship notices.
  - This gives true ship time per warehouse and flags late boxes before print day.
- **S&S API ordering:** needs a worker POST route with auth.
