# Receiving dashboard

## What the app does
- Permanent link: `receiving.html` (the iPad icon). Files are `receiving-dashboard-vNN.html`. `receiving-dashboard.html` is an old full copy; don't use it.
- Lists the garment lines that are ordered and not yet received, grouped by order and by print date. Lines that are open mis-ships, or that were received in the last 24h, also show.
- **Receive a line:** count the box and type a count only where a size is different. Then tap Receive. A difference opens a check that can flag a mis-ship.
  - Writes the Line Item's Actual sizes and Received ✓.
  - When every apparel line on an order is in, with no open mis-ship, the order moves from *Ordered - In Production* to *Received & Staged*.
- **All here:** receives every waiting line on an order at its ordered + extras counts.
- **Undo:** reverses the last receive, including the status change.
- **Mis-ships:**
  - **Flag** sets Mis-ship ✓, the details and In progress ✓.
  - **Mark resolved** sets Resolved ✓.
- **Printing:** after a receive, a panel walks through box labels (4×6, with the Box Logic Feedback "correct?" bar) and then the job sheet.
- **Practice mode:** `?practice=1`, or ⚙ → Practice. Nothing is saved. That includes the status change and box feedback.
- **Airtable token:** stored on the device. Set it under ⚙ → Airtable token.

## 2026-10-15 · v75: Pine page kit
**Why:** the apps should feel the same, not just look the same. Receiving now matches Damage Log v20 and Purchasing v107.

**What changed:**
- **Bar:** mark · RECEIVING · version · Practice tag, then:
  - Undo, only after a receive
  - ↻ Refresh
  - ⚙ menu (`.p-menu`) with the Airtable token (Save / Clear, and whether a token is saved) and the practice switch. This replaces the old ⚙ sheet and the separate token strip.
- **One filter row (`.p-filters`):** search, then vendor and sort, then the filter chips on one line that scrolls sideways on a phone.
- **Orders are `.p-lc` cards:**
  - ID badge · customer, with the PO under it · Pieces · All here (the card's one action).
  - The status tag is on row 2. Waiting and partly-in are cream facts, all in is black, a mis-ship is red.
  - Cards open in place, one order at a time.
  - Prints moved from the Print ▾ dropdown into the open card: Box labels · Job sheet · Old box label editor.
- Date sections are still `.p-section` labels. Receive is still the one yellow button.
- **Phone:** Pieces sits under the ID next to the tags, and All here is full width. The kit default puts Pieces on a row of its own.
- No Airtable changes.

**Tested:**
- Payloads are identical to v74 for every flow: receive, receive with a count off, mis-ship, staging + Undo, resolve, All here.
- Refresh keeps typed counts, and the payload after a refresh is the same as v74's.
- Practice mode sent 0 writes.
- Self-update: moves when idle, and shows the bar when busy.
- No page errors. Nothing under 12px, no targets under 44px, and no sideways scroll on a phone.

## 2026-10-15 · v74: Refresh keeps typed counts
**Why:** Refresh used to wipe counts that were typed but not received yet, so a box could be counted twice.

**What changed:**
- Typed counts now carry across the reload for lines that are still open: the same record, still not received.
- A line received elsewhere, or no longer on the list, drops its counts.
- A toast says "Kept your counts on N lines". If the load fails, the counts stay.
- Keeping the counts was chosen over a confirm question. They are physical counts of a box, so they stay true after a reload. The only risky case, a line received on another iPad, is dropped automatically.
- There is no timed auto-reload in this app. The self-update reload is held back while counts are typed, as in v73.
- The line's difference pill counts blank sizes as "all there", the same way Receive does. Before, typing M = 8 of 10 showed −24; now it shows −2.
- No Airtable changes.

**Tested:**
- Type counts on two lines, have one of them received elsewhere, then Refresh: the open line keeps M = 8, the received line drops out, and Receive sends the same payload as without the refresh.
- Payloads for every v73 flow, including All here, are identical to v73. Practice mode sent 0 writes.
- Self-update: moves when idle, and shows the bar when counts are typed (also right after a Refresh).
- No page errors. Checked at 1024×768 and 390×844.

## 2026-10-15 · v73: Pine style v2, self-update, cleanup
**Style:**
- Uses `pine-style-v2.css` and Poppins instead of `pine-design-v1.css`.
- Black top bar: Pine mark, RECEIVING, version, practice pill, then Undo / Refresh / ⚙.
- Colors are black, white, cream and yellow only:
  - yellow = needs you (Receive button, partly-in orders)
  - black = done
  - red only for mis-ships, late shipments and errors
  - green and amber are gone
- No Courier. Nothing under 12px. Touch targets are 44px or more, and Receive and the count boxes are 56px.
- Order numbers use the black-and-yellow ID badge. Date headers are black section labels. Toasts and pop-ups match the other apps.

**Self-update:**
- Loads `pine-update.js` with `data-link="receiving.html"`. The version shows in the bar.
- Refresh checks for a new version after it reloads the orders.
- The app counts as busy, and shows "Update now" instead of reloading, when any of these is true:
  - counts are typed and not saved
  - a pop-up is open
  - a save or load is running
  - an "All here" confirm is waiting
  - the last receive was under 5 minutes ago, so Undo still works

**Practice:**
- The pill replaces the old banner.
- Turning practice on or off from ⚙ updates the URL, so an update reload stays in practice.
- Turning practice on clears Undo, so a practice tap can't undo a real receive.

**Flow / UI:**
- Order header: the ID badge, then the customer (up to 2 lines, no longer cut off), with the PO under it.
- In the date view the "Prints in Nd" tag is gone because the section header already says when the order prints. It still shows when sorted by PO.
- Section headers say "Due …" when the date is a due date, not a print date.
- Line detail:
  - Dropped the block that repeated supplier, PO, arrival, print date and totals from the tags just above.
  - Dropped the View Proof button. Tap the picture instead.
  - Shorter hint.
- The Practice: Off button and the always-there grey Undo are off the main screen:
  - Practice and Token are under ⚙.
  - Undo shows only when there is something to undo.
- Filter tabs are renamed: Prints soon · Mis-ships · Late · Received (24h).
- iPad portrait and phone: tags wrap under the order, buttons sit on the right, and Receive is full width on a phone. There is no sideways scroll.

**Bugs fixed:**
- Opening a line, or flagging or resolving a mis-ship, re-drew the order from every record. Lines received in the last 24h popped back into the All tab, and the order's status word didn't update. Now the whole order is re-drawn using the current tab's filter.
- A failed single receive left Undo pointing at a receive that never saved. The previous undo is now put back.
- If one batch of All here saved and a later batch failed, Undo wasn't offered. Now it is, and the message says to Refresh.
- Receive no longer errors if its button is gone from the screen by the time the save runs.

**Not changed:**
- Airtable reads and writes.
- The printed label and job sheet layouts. These are print documents and keep their own fonts and sizes.

**Tested:**
- Playwright with mocked Airtable at 1024×768, 768×1024 and 390×844, in live and practice mode.
- Live payloads are identical to v72 for each flow:
  - receive all match
  - receive with a count off, through the mismatch check
  - flag a mis-ship
  - receive the last line, which stages the order
  - Undo, which also reverses the status
  - resolve a mis-ship
  - All here
- Practice mode sent no writes.
- Self-update moves to a newer version when idle and shows the bar when counts are typed.
- No page errors. No text under 12px and no touch targets under 44px on the phone screen. Date headers are correct in Mountain time.
