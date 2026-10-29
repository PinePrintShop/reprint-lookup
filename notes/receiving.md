# Receiving dashboard

## What the app does
- Runs on a **desktop** (Stephen, Oct 15), not the iPad. Permanent link: `receiving.html`. Files are `receiving-dashboard-vNN.html`. `receiving-dashboard.html` is an old full copy; don't use it.
- Lists the garment lines that are ordered and not yet received, grouped by order and by print date. Lines that are open mis-ships, or that were received in the last 24h, also show.
- **Receive a line:** count the box and type a count only where a size is different. Then tap Receive. A difference opens a check that can flag a mis-ship.
  - Writes the Line Item's Actual sizes and Received ✓.
  - When every apparel line on an order is in, with no open mis-ship, the order moves from *Ordered - In Production* to *Received & Staged*.
- **All here:** receives every waiting line on an order. It uses typed counts, otherwise ordered + extras. A line with counts off goes through the mismatch check (v77).
- **Undo:** reverses the last receive, including the status change.
- **Mis-ships:**
  - **Flag** sets Mis-ship ✓, the details and In progress ✓.
  - **Mark resolved** sets Resolved ✓.
- **Printing:** when an order is all in, a panel walks through box labels (4×6, with the Box Logic Feedback "correct?" bar) and then the job sheet.
- **Practice mode:** `?practice=1`, or ⚙ → Practice. Nothing is saved. That includes the status change and box feedback.
- **Airtable token:** stored on the device. Set it under ⚙ → Airtable token.

## 2026-10-19 · v77: staging fixes, All here keeps counts, Receive under the boxes
**Why:** a scan of v76 found orders that never moved to *Received & Staged*, a practice-mode leak, and some screens that made more work than they should. Receiving is a desktop app, so this pass was checked at 1440 and 1920 wide.

**Staging (orders moving to Received & Staged):**
- Marking the last open mis-ship resolved now stages the order when every line is in. Before, it never did, so those orders sat in *Ordered - In Production*.
- Refresh now stages any order on the board that is already complete: every apparel line received, no open mis-ship, and still *Ordered - In Production*. It's the same rule a receive uses, and a toast lists the orders it staged.
- If the app can't read whole orders, a red note says so and nothing stages. Refresh tries again.
- If a stage write fails, a message says so and Refresh tries again.
- A receive waits for its stage write to finish, so Undo can't run halfway through.
- A stage only becomes part of Undo when it came from the receive being undone.
- Turning practice on or off reloads from Airtable. Lines "received" in practice only exist on screen, so they can't count toward a real stage any more.

**Receiving:**
- **All here** uses any counts you typed.
  - A line whose typed counts match goes in with the rest.
  - A line whose counts are off gets the normal "Counts don't match" check, so you can receive it as counted or flag a mis-ship.
  - The confirm button says so, e.g. "Receive 1, check 1?". Before, All here quietly saved the ordered numbers over what you'd typed.
- **Receive** sits right under the Counted boxes, with the hint beside it. Pressing Enter in a count box receives that line. The boxes are narrower.
- **Go back** in the check now empties the boxes Receive had filled in, so they don't look like typed counts. Flag mis-ship from the check does the same.
- The "Order is all in" pop-up only opens when the whole order is in, not after every line. "Print again" on a received line still opens it.

**Mis-ships:**
- Marking a mis-ship resolved on a line that hasn't arrived keeps the line on screen, because it still needs receiving. Before, it vanished until Refresh.
- A received line with an open mis-ship now shows in the Mis-ships tab. It used to be hidden for 24h. A received line doesn't offer Receive again.

**Screen:**
- Line names show the garment colour again ("Gildan 5000 - Black"), and search finds colours. The box-label code had its own function with the same name, which replaced the screen one. It is now `getLabelGarmentName`.
- Every tab count is a number of orders. Mis-ships and Late used to count lines. Empty tabs are dimmed, as in Damage Log and Screens.
- Filter row: search · tabs · vendor and Sort at the right end, like the other apps.
- The ⚙ icon is the kit size.
- Pieces on an order counts the whole order, not just the lines the tab shows.
- "Old box label editor" moved from every order to ⚙. It opens for the order that's open.
- Pop-ups use the kit's `.p-modal`. The mismatch buttons sit on one row on a desktop. The toast is the kit's `.p-toast`, and problem messages stay up longer.
- Removed unused code: `quickFill`, `togPrintMenu`, `misTag`, `snap`, `getLargeUrl`.
- `pine-confirm.js` is loaded for later. There are no confirm() boxes today.

**Safety:**
- Box feedback messages are only accepted from label windows this app opened, on the same site.

**Not changed:**
- Airtable writes for the normal flows. These were checked against v76 and are identical:
  - receive
  - receive with counts off
  - flag a mis-ship
  - last line stages
  - Undo with status
  - resolve
  - All here
- The whole-order read also fetches the ordered size fields, to count pieces. Read only.
- Labels and the job sheet.

**Tested (Playwright, mocked Airtable):**
- Every scan bug was reproduced and is now fixed.
- Failure cases: the progress read fails, and a stage write fails. Both are retried on Refresh.
- Practice made 0 writes. That covered receive, flag, resolve that would stage, All here with counts, staging on load, and box feedback.
- Screenshots at 1440×900 and 1920×1080. Also checked at 1024 and 390: no sideways scroll, nothing under 12px, one yellow button.

**Live check (read only, Oct 19):** none of the 14 orders in *Ordered - In Production* has every apparel line received, so none is stuck right now.

## 2026-10-15 · v76: desktop first, two panes
**Why:** Receiving runs on a desktop, so it should use the width.

**What changed:**
- **At 1400px and wider, two panes** (kit `.p-split`, the same pattern as Damage Log v21):
  - Left: the order list with its date labels.
  - Right: the picked order, with the prints, the lines, the counting table and Receive.
  - Each pane scrolls on its own.
  - The first order is picked when the page opens. Click an order, or use ↑/↓, to move.
  - The picked order opens its first waiting line, so you can start counting right away.
  - The page re-draws when the window crosses 1400px.
- **Below 1400px:** cards open in place as in v75, now full width with 24px gutters. At 1400px and wider the filter chips share one line with search.
- **Typed counts:**
  - They stay when you switch orders or Refresh, as in v74.
  - A list card shows **Counts typed** so they aren't forgotten.
  - They still count as busy for self-update.
- **Fixed:** the Total row now counts blank sizes as "all there", the same way Receive does. Before, typing M = 8 of 10 showed "8 · −24"; now it shows "30 · −2".
- No Airtable changes.

**Tested:**
- Payloads are identical to v75 at 1920, 1440, 1024 and 390 wide: receive, receive with a count off, mis-ship, staging + Undo, resolve, All here.
- Typed counts survive switching orders and Refresh at every width.
- ↑/↓ moves to the next order.
- Practice mode sent 0 writes.
- Self-update: moves when idle, and shows the bar when counts are typed.
- No page errors, nothing under 12px, and no sideways scroll.

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

## 2026-10-19 · v78: Receive back on top
Stephen (screenshot of v77): "I like the recieve all button on the top of the page just feels more intuitive".
- The Receive button is back at the top right of each line, across from Flag Mis-ship, with the one-line hint under it. Enter in a count box still receives.
- Nothing else changed. v77's tests pass (except the one that checked the old button spot), and the saves are identical to v77.

## 2026-10-19 · v79: Promo page
Stephen: "in the receiving can we get a separate page that is just a quick look up for promo....right now we get boxes from overseas that say nothing and have no order number....so it would be great to open up the box and then we can quickly visualize where it goes". Then: "Airtable also has a promo receiving dashboard that we could grab info from the vendor etc...it is in the Line Items table".

**What's new:**
- The black bar has **Garments | Promo**. The computer remembers which one you used last. The Promo button shows how many promo items are coming in.
- **Promo** is a wall of pictures. Each card is mostly the line's mockup (Proof Images). Under it: order #, pieces, the product, the customer, when it's expected (red if late), "Vendor shipped", the vendor and the due date. A line with no mockup shows its description in big letters instead.
- The list is exactly the Airtable view **Line Items › Promo Receiving Dashboard**: Ordered ✓, Received not ticked, Product Type = Promo Product, and the order isn't Completed or cancelled. Soonest expected first, then due date.
- **Search** takes any words, in any order. For example "blue tumbler", "hobor", "rugby", "10885" or a PO all work. If nothing is coming in that matches, but something received matches, one tap shows it.
- **Type chips** (Drinkware, Bags, Bandanas, Matches, Other…) are worked out from the description words. They only show when there are at least two kinds.
- **Show: Coming in / Received, last 14 days.** Use this when a second box turns up for an order that's already ticked.
- **Click a card** to open the big view:
  - the mockup large, plus every mockup on the line and a link to the PDF
  - the description, pieces (and extras)
  - order status, vendor, PO, expected date, due date and deadline, vendor tracking, delivery method
  - the notes: shipping (yellow when it says "direct"), sales, finishing, the order notes
  - everything on the order, garments too, with what's already in
  - ← / → move to the next card and Esc closes.
- **✓ Mark received** ticks the same **Received** box the garments use, and nothing else. Undo is in the bar, as for garments. Practice fakes it.
- **Print box label** prints a promo 4×6 label in the same look as the garment box label. It has the big order #, customer, due date, vendor, PO, delivery, what's inside and how many, and a QR code to the order's mockups. "Box 1 of 1" and every line on the label can be edited before printing. It doesn't do the garment auto-boxing or the "packed right?" logging.

**Why it's built this way:**
- Promo has nothing to count by size. So receiving is one button, with no count check.
- Promo data is only read when you open Promo. The garment screens read and save exactly as v78.

**Not included:**
- Patches, pins and stickers. The Airtable view only has Promo Product. The "Promo Item View for Label" view also has patches and pins, so they could be added if they come in unlabeled too.

**Tested** (Playwright, mocked Airtable, 1440, 1920, 1024 and 390 wide):
- The list comes from the view and is in the right order.
- Search, chips, and the Received switch.
- Pictures load lazily. A picture that's missing or broken falls back to the description.
- The big view.
- Mark received writes only `Received = ✓`. Undo writes it back with no order status change. A failed save leaves the line in place with no Undo.
- Practice writes nothing.
- The label.
- The remembered view.
- Nothing is under 12px, there's one yellow button, and nothing scrolls sideways.
- v78's tests pass on v79. The one that checked the old Receive button spot was already expected to fail. The garment saves are identical to v78 in all 8 flows.

## 2026-10-19 · v80: Promo filters
Stephen: "can we make sure we can filter by promo items" (on the Receiving Promo page).
- Two menus next to Coming in / Received: **vendor** (every vendor in the list, with how many items) and **arrival** (Late · Expected this week · Vendor shipped · No expected date). They work together with the search box and the type chips (Drinkware, Bags, …).
- When nothing matches, a **Clear filters** button resets everything.
- On a phone the menus wrap instead of pushing the page sideways.
- Tests: v79's promo tests all pass on v80, plus new filter tests (vendor, late, shipped, no date, clear). Garment saves identical.

## 2026-10-19 · v81: patches, pins and stickers on the Promo page
Stephen: "Yes to patches and stickers etc".
- The Promo page now also shows lines whose Product Type is any patch (Embroidered 50/75/100%, Woven, Sublimated, DecoPress, Leather, Silicon), Woven Clip Labels, Pins or Stickers. Same rule as promo: Ordered ticked, not received, order not Completed or cancelled (and Received in the last 14 days for the other list).
- Airtable's "Promo Receiving Dashboard" view only holds Promo Product, so these come from a second query with that rule written out. Nothing in Airtable changed.
- Each type gets its own chip (Patches, Pins, Woven labels, Stickers). A line with no description is titled by its type ("Woven Patches from Kiki Creations"). Searching a type name ("woven", "pins") finds them.
- Mark received and the box label work the same (the same Received checkbox).
- Tests: new patch/pin/sticker test; v79/v80 promo and filter tests still pass; garment saves identical.

## 2026-10-19 · v82: long links in promo notes
Stephen (screenshot of order 10926's Sales note): a Rivers Promo product link ran off the right edge of the note box.
- Web links in the big view's notes now show as a short link with the site name ("riverspromo.com ↗", opens the page), and any other long word wraps inside the box. Everything else in the note is unchanged (still escaped).
- Tested with that exact link: the note box no longer overflows; promo, patch and garment tests still pass.

## 2026-10-20 · v83: top bar and filter row to the Pine standard
Stephen: "review ... the first ones that we did with the new brand colors to make sure to clean up the top bar that we did for the last few". The references are Line Item Review v35, Shipping v11, Seps v45 and Screens v30.
- **Garments filter row on one line:** the chips share the search line (`.p-chips-inline`, as in Seps) and scroll sideways if they run out of room. The search is capped at 360px. v82 put the chips beside the search only at 1400px and wider, and with an auto width, so at 1440 and 1280 they dropped to a second line (124px). Now the band is 71px, and at 1440 all five chips show.
- **Promo filter row:** this page has three menus on the right (vendor, arrival, show), so its type chips can't share the line without hiding most of them. The search and the menus are line 1, and the chips get their own full line under them (124px, all chips showing). v82 put the chips beside the search and pushed the three menus onto a lone second line on the right. At 1900px and wider, everything is on one line.
- **Phone bar:** 8px gaps, as in Seps (116px with the views row, was 120).
- **Receive buttons stay where Stephen asked:** "I like the recieve all button on the top of the page". The open line's Receive is still top right (checked).
- Nothing else changed: the same reads, writes, Undo and practice.
- **Tested** (Playwright, mocked Airtable). The v82 tests pass on v83: garments 73/74, promo 70/70, filters, link, patch, and payloads (8 the same as v78). The one failure is "10a Receive sits in the row under the count boxes". It also fails on v82, because it is a v77 check that v78 undid on purpose (Receive is back on top). At 1440, 1280 and 390 there are no console errors and practice makes 0 writes.

## 2026-10-28 · v84: no browser pop-up in the box-label window
Stephen: "Do the 5 bugs first".
- In the box-label window, "✕ Remove Box" on the only box showed a browser `alert()`. It now shows a short black note at the bottom of that window ("This is the only box — it can't be removed."). It goes after 4 seconds and is hidden when printing. The note lives in the label window itself (where the click was), not the main page.
- No other `alert/prompt/confirm` left in Receiving. Reads, writes and practice unchanged.
- **Tested** (Playwright, mocked Airtable, practice): order with 3 boxes → remove down to 1 → Remove again shows the note, the box stays, no native dialog (the test fails on any), the note is hidden in print media and fades; add + remove still work; 0 writes.

## 2026-10-29 · v85: Order Notes on the line
Stephen: "can we add order notes into this section maybe right below the cream. it is how purchasing can call out things to receiving".
- The line item's **Order Notes** (fldF378cgWuOcWNL6, the note Purchasing writes on the line) now loads with the line.
- Open line: the note shows first, right under the cream header and above Flag Mis-ship / Receive, in a white box with a black edge labelled "ORDER NOTES" (line breaks kept, 16px).
- Closed line: a "Note" tag next to PO / Arrives, so a note isn't missed before the line is opened.
- Read only: Receiving doesn't edit the note.
- Tested with a mocked order (one line with a two-line note, one without).

## 2026-10-29 · v86: Late = not counted in 4 days before the print date
Stephen asked how Late worked: it was only "the arrival date has passed and the line isn't received". He said: "let's change receiving to be 4 days before scheduled print date".
- A line is now **Late** when it isn't received and **its print date (else the order's due date) is 4 days away or less**. It's also Late, as before, when its arrival date has passed.
- The Late tab counts orders with any late line.
- The line's tag says why: "Late · prints Oct 31" (with the arrival date next to it), "Late · order due …", or "Late · due Oct 29" (arrival passed).
- Tested with mocked lines (print in 2 days / arrival passed / neither / received): Late = 2 orders (was 1).
