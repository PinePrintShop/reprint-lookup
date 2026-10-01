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
- **Carts:** one per warehouse, built up across orders. When an order is placed, he copies the cart, enters the PO and ticks ✓ Ordered. That writes Ordered, PO, Supplier, extras and costs to every line in the cart.

## Ship time
- Source: **Suppliers → Days In Transit** (`fldkxReU8bOwXpQXT`), counted in business days.
  - Airtable already computes **Expected Blank Arrival** from it.
  - Missing for some heavily used warehouses: **S&S Olathe**, **Sanmar Dallas**, Carolina Creative.
- The app shows "arrives Mon 10/6" next to the warehouse. It turns red when that's within a day of the scheduled print date.
- History (Ordered Timestamp → Received Timestamp, last 180 days, 2,003 lines) has a median of 8–10 business days for every major warehouse. That's because Received marks when the box is processed, not when it lands, so the history isn't used as ship time.

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
