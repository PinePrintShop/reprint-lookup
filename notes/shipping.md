# Shipping app (`pine-shipping-vN.html`, permanent link `pine-shipping.html`)

Desktop app for the shipping computer (1440–1920 wide, mouse and keyboard, USB scale).

## 2026-10-19 · v6: rebuilt from scratch (v5 never went live)

**Why:** today a shipper opens ShipStation, finds the order, and if the address or notes look wrong they go and dig in Airtable. Tracking never reaches Airtable: on the 337 orders completed in the last 60 days, the Tracking, Carrier, Ship Date and Shipment ID fields were all empty. v5 (June) bought labels itself, but it had real bugs: its ShipStation calls now get a 401, a scale set to pounds was read as ounces, it sent no address changes to ShipStation, and customer names went onto the page unescaped. It never left preview.

v6 keeps **label buying in ShipStation**. Buying labels in the app is a 2027 project. The app does everything around the label.

**The flow (left: the queue, right: one order; stacked below 1400px):**

1. **Queue.** The queue lists Orders with Order Status = *Caught - Awaiting Ship*, sorted by due date.
   - Each card shows: order #, customer, shipping method, due date (red when late), and boxes. Boxes come from Boxes Packed, or "N est." rounded up from Total Estimated Boxes.
   - Each card has one status tag:
     - **Ready**
     - **Address differs**
     - **Address TBD** (red: TBD order with no address in Airtable)
     - **No ShipStation order**
     - **Waiting for label** (weights sent, no label yet)
     - **Label bought** (ShipStation shows it shipped, Airtable doesn't yet)
     - **Delivery**
   - The **Shipped today** tab lists orders completed today with a Ship Date of today, which only this app writes.
   - The search finds any order by number or customer.
2. **Address check.** Airtable and ShipStation sit side by side: name, company, street, city, state, ZIP, country, phone, and method / requested service.
   - Rows that really differ are highlighted. The app ignores case, spacing, St/Street-type abbreviations, state names vs codes, and ZIP+4.
   - **Use Airtable address in ShipStation** updates the ShipStation order and leaves everything else on it as it was.
   - **Use ShipStation address in Airtable** writes only the fields that changed. That matters because the Slack "Updated Address Bot" posts on every address change; the confirm box says so.
3. **Shipping notes.** The line items' Shipping Notes are shown in a yellow box at the top. Order Notes, Notes and Packing Handoff sit under "Other order notes". There is no order-level shipping-notes field.
4. **No ShipStation order yet** (Pick-Up orders that ended up shipping, and Address TBD orders): an **Add to ShipStation** form, filled in from Airtable and editable.
   - It creates the ShipStation order the same way the Zap does: order number = Order Reference ("10990-Customer"), order key = the bare order number, awaiting shipment, and one line "Order 10990 — Hoodie", qty = total pieces.
   - It also saves the address you typed back to the Airtable order, so Airtable records where the order actually went.
5. **Weigh.** There is one row per box, preloaded from Boxes Packed or the estimate.
   - − / + changes the count and saves **Boxes Packed** about a second later, as one save.
   - **Read scale:** the active box shows the live reading. Enter or Lock takes it once the scale is steady, then moves to the next box. You can also type a weight.
   - **Save weights to ShipStation** sends the total as the order's weight (ounces) and adds "Pine Shipping · 3 boxes: 5.2, 4.8, 6.1 lb (16.1 lb total)" to the order's internal notes, so the shipper sees each box when splitting packages. Existing notes are kept; a re-save replaces only this line.
6. **Ship from & billing.**
   - **Blind ship:** pick a ShipStation ship-from location.
   - **Bill to customer's account:** recipient or third party, account #, ZIP, country. There is a one-click "use Airtable Shipping Account #".
   - The current ShipStation values are shown. Save writes them to the ShipStation order.
7. **Open in ShipStation** (the yellow button once weights are saved): buy and print the label there.
8. **Label & finish.** The app checks ShipStation for a label every minute, and again when you come back to the tab. Voided labels are ignored.
   - When a label shows up: tracking, carrier, service, cost and ship date appear, and **Mark shipped** becomes the next step.
   - Mark shipped asks first: "Emails the customer/rep." It then writes Tracking, Carrier, Ship Date, Shipment ID and Shipping Cost, and sets Order Status = **Completed**, which fires the existing Completed emails.
   - With more than one label (multi-box), the tracking numbers are joined with ", " and the costs added up.
   - Delivery orders get **Delivered — mark Completed** instead, which emails the rep.

**Safety:**
- Every ShipStation update re-reads the order first and sends that fresh copy with the change. It refuses if ShipStation already shows the order shipped or cancelled, or if the order has no order key.
- Add to ShipStation checks again that the order isn't there already.
- Mark shipped re-reads Airtable and skips the write if the order is already Completed.
- Buttons are locked while a save runs.
- Errors show in place with a Retry.
- Leaving an order with unsaved weights asks first.

**Scale:** this uses any USB scale that speaks the HID point-of-sale standard (Mettler Toledo and others), in Chrome or Edge.
- v5's unit codes were off by one. They are now grams = 2, kg = 3, oz = 11, lb = 12.
- Under-zero, overweight and re-zero statuses are shown.
- The scale reconnects on its own after the first "Connect scale".

**Standards:**
- Pine style v2 (black bar, version shown).
- Self-update through `pine-update.js` → `pine-shipping.html`.
- Practice (`?practice=1`) fakes every Airtable and ShipStation write; reads stay real.
- PineConfirm for every "are you sure".
- All customer text is escaped.
- ShipStation goes through the worker with the Airtable token (worker v24).

**Fields used (Orders `tbl8Tf0AeS9gnHOOS`):**
- Read: Invoice / Order Number `fld4S3B5yJANKlE7l`, Order Reference `fldHarZYpYjQrJoof`, [TEXT] Customer Name `fldoRraeYHsgfeWhj`, Shipping Method `fldrjFuIBn45ewFU5`, Shipping Account # `fldoOZSIN4PpJcQ4V`, [TEXT] Contact Phone `fldRK2p80OPfhxzPv`, [TEXT] Customer Email `fldSQShbnSLkVQ8uK`, Shipping Notes Lookup `fldBonIzc2NKa6TYD`, Notes `fldh9WFXo6qhAahaQ`, Order Notes `fldzzDJNF6rvTCmRq`, Packing Handoff `fldu2NmUdYx6yd9DU`, Total Estimated Boxes `fldIbPucKznpcZQqI`, Customer Due Date `fldphJYdlBNS0dmAK`, Total Quantity Rollup `fldWQYE3o2IZjZXSU`, Garment Type Lookup `fldqTKwC8ctX59UeP`.
- Written:
  - Shipping Contact `fldpHFCU70jZpuKs6`, Address `fldDf4gRxe2NoUVPy`, City `fldh0KVzmy5QsWj2D`, State `fldTlayqsfEWPaph0` and ZIP `fld4uEiBVeL9w48R3`, only when they change.
  - Boxes Packed `fldu7dXQAwg3S974s`.
  - Tracking Number `fldLjGNoUKrxuX0O7`, Carrier `fldjSezoa5NtveYvm`, Ship Date `fldlMlDIr9hLYFfbL`, ShipStation Shipment ID `fldBvbKYP48LiKO1Z`, Shipping Cost `fldK95tJ2WHYKxzM8`.
  - Order Status `fldhS4z28CdGmS1j5` → Completed.
- ShipStation V1 calls:
  - `GET orders?orderStatus=awaiting_shipment`, `GET orders?orderNumber=`, `GET orders/{id}`
  - `POST orders/createorder` (creates, or updates when the orderKey matches)
  - `GET warehouses`, `GET shipments?orderId=`

**Guesses to check with Stephen:**
- The "Open in ShipStation" link is a search (`ship.shipstation.com/orders/all-orders-search-result?quickSearch=<order #>`), not a direct order page.
- The Zap's order key: v5 notes say orderKey = the bare order number and orderNumber = "number-customer".
- Airtable has no country, company or street-2 fields. The app assumes US, and splits "123 Main St, Suite 4" into two lines for ShipStation.
- Dimensions are not sent. A ShipStation V1 order holds one set, not one per box.
