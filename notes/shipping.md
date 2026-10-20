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

## 2026-10-19 · v7: quick add boxes, no box-count logic
Stephen: "for shipping app let's not use the box logic right now and maybe just make a quick add boxes".
- Every order starts at 1 box. **+ Add box** adds a row and makes it the one being weighed (the scale reading keeps going); **×** on a row removes it.
- The app no longer reads Boxes Packed or the box estimate, and no longer writes Boxes Packed. Queue cards don't show a box count. (Catching v168 still saves Boxes Packed; the field is there when we want to use it again.)
- Weights, the internal-notes line ("3 boxes: 5.2, 4.8, 6.1 lb") and everything else are unchanged. All mocked tests pass; practice makes 0 writes.
- Stephen asked where the list comes from: **To ship** = every Airtable order with Order Status "Caught - Awaiting Ship". When everything's gone out it's empty; search finds any order.

## 2026-10-19 · v8: box sizes and dimensions
Stephen: "we need dimensions and a drop down for the classic 3 pine box sizes and then one for vendor boxes which can vary in sizes".
- Each box row has a size menu: **Pine S 12×12×6, Pine M 24×16×6, Pine L 24×16×14** (the same sizes Receiving prints on box labels), or **Vendor box…**, which opens L × W × H boxes (inches).
- New boxes start with the size of the box above; the first box starts with the last size used on this computer (Pine M the very first time).
- Save weights also sends **box 1's dimensions** to the ShipStation order (an order holds one set) and adds every box's size to the notes line, e.g. "3 boxes: 5.2, 4.8, 6.1 lb (16.1 lb total) · sizes: L 24×16×14, M 24×16×6, Vendor 18×14×10". Reopening the order reads the sizes back from that line.
- A vendor box without all three numbers stops the save with a plain message.
- Tests: all mocked tests pass, including the new size checks; practice makes 0 writes.

## 2026-10-19 · v9: carrier and service in plain words
Stephen, about "Carrier ups_walleted / Service ups_ground": "can we clean that up to not show that...but what you showed me".
- Shows "UPS (ShipStation account) · Ground", "UPS · 2nd Day Air", "FedEx · Ground", "USPS · Priority Mail" instead of ShipStation's codes. "ShipStation account" = UPS paid from the ShipStation balance (code `ups_walleted`). Hovering shows the raw code.
- Airtable's Carrier field now gets the short name (UPS, FedEx, USPS) instead of the code.

## 2026-10-20 · correction: when the ShipStation order is made
From Stephen's Zap list: the Zap "Shipment Creator - Payment Trigger" (QuickBooks payment → ShipStation) creates the ShipStation order when the customer PAYS, not when the deal is confirmed (that's "[TAXJAR] Order Confirmed > … > +Order to AT", which creates the Airtable order). So an unpaid order correctly shows "No ShipStation order" in the Shipping app until payment. Shipping-address changes sync Pipedrive → Airtable through the "Shipping Contact/Street/City/State/ZIP > Update in PD > AT" Zaps.

## 2026-10-20 · v10: review fixes
A review of v9 found these. All fixed; the rest of the app is unchanged.
- **Delivery orders.** They always show **Ready for delivery — mark Completed** and the **Delivery** chip, even when the payment Zap already made a ShipStation order. Before, a paid Delivery order went down the label path. There is no address check for them (10816 and 10919 have no address in Airtable). Completed fires Airtable's "Delivery Email Notification", which emails the rep that the order is ready to deliver. So the button says "ready for delivery", not "delivered". **Ship it instead** opens the normal ShipStation flow if a Delivery order really ships.
- **Pick-Up orders.** Catching sets Pick-Up orders straight to Completed, so they shouldn't reach the queue. If one does, its chip says **Pick-Up?** and the order shows a red note: Completed sends the customer the pick-up email. The Mark shipped confirm says so too.
- **Saving and switching orders.** You can't open another order while a save is running; the app shows "Saving… one sec". Every save also stays on the order it started on. Before, a slow save could put one customer's ShipStation order and tracking onto another order.
- **Add to ShipStation item name** is "Pine order 10936". The garment names came from Garment Type Lookup, which returns linked record IDs. That field is no longer read.
- **Multi-line and international addresses.** On 10936 the whole address is in Street, one part per line, and City/State/ZIP are empty. The form now fills Street "59 22nd Street West", Street 2 "Unit #404", City "North Vancouver", Province "BC", Postcode "V7M 0B6" and Country "CA". A yellow line says what was read from Street, and plainly lists any City, State / Province, ZIP / Postcode or Country that's still empty. International orders no longer default to US. A country name (Canada, United Kingdom…) becomes its 2-letter code.
- **Airtable writes never blank a field.** Empty values are skipped in "Use ShipStation address in Airtable" and in Add. When Airtable's Street holds a whole multi-line address, Add leaves it as it is and fills only the empty City/State/ZIP, because Airtable has no country field.
- **Unpaid orders.** The Add form shows "Not paid yet — the payment Zap may also create a ShipStation order." "Paid" means Payment Received Date (`fld5RAeEEGMltdES0`, read only) is filled. The orderKey logic is unchanged.
- **Practice toggle** in ⚙ now reloads the page with `?practice=1` added or removed, so fake results don't stay on screen.
- **Smaller fixes:**
  - `orderDate` is sent in Pacific time ("2026-10-20T09:15:00.0000000"), which is how ShipStation V1 reads it.
  - Enter only locks a scale reading from a weight box or when no control has focus. A focused button keeps its Enter.
  - Typing a weight hides Lock. After a lock, the cursor moves to the next box to weigh.
  - Mark shipped writes today as Ship Date, so the order shows in "Shipped today". If the label is dated another day, the confirm says so.
- **Tests:** mocked Playwright. All v9 tests pass on v10, plus new ones for each fix:
  - a Delivery order with a ShipStation order
  - the save race, with a forced switch: no cross-writes
  - no record IDs in the item name
  - the 10936 address split and its warnings
  - the international no-US default
  - an empty ShipStation value not written to Airtable
  - Enter and Lock
  - the practice reload
  - 0 writes in practice, nothing under 12px, no console errors
