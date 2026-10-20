# Damage Log (`damage-log.html`)

The production manager's desk view of Order Issues. Used mostly on a laptop, sometimes on an iPad.

## What it does
- **Orders tab:** Order Issues from the chosen date range, grouped by order and then by line item. Each line shows ordered / extras / damaged / final per size, and each issue shows its refund math.
- **Filters:**
  - Refund needs approval
  - Not sent to bookkeeper
  - Awaiting review
  - Check these (possible duplicates, negative quantities)
  - Rules differ (cost rule vs today's rule)
  - Reprints
  - No action
  - All
- **Writes to Airtable:**
  - Approve Resolution: single, Approve all on an order, or a batch of checked orders. This fires the *Order Issue Resolutions* automation.
  - Change Resolution.
  - Delete a duplicate issue and its Damage Detail.
  - Mark a reprint done (Status = Completed).
  - Orders > Refund Issued.
  - The one-per-order refund request on the Order (Refund Request Amount / Details / Count / At). The *Refund Request* automation emails finance when this is written. Background: `plan-one-refund-email.md`.
  - The app never creates Order Issues.
- **Trends tab:**
  - Apparel vs bandanas.
  - Damaged pieces by reason, accountability and garment.
  - Cost by month.
  - Wow cost of extras sent.
  - Year-to-date totals with the same method: `damages-ytd.md`.
- Airtable token comes from `pine_at_key` in the browser, the same as the other apps. `?practice=1` fakes every write.

## 2026-10-15 · v18
**Why:** move to Pine style v2 and self-update, and fix a double-email risk.
- **Pine style v2:**
  - `pine-style-v2.css` and Poppins replace `pine-design-v1.css`.
  - The black top bar has the logo square, DAMAGE LOG, the version, the practice pill, the Orders/Trends tabs, Refresh, Practice and the token gear.
  - Colors: green "done" tags became black, amber "waiting" tags became yellow, and red stays only for real problems (refund not sent, possible duplicate, negative quantity, short counts).
  - Order numbers use the black-and-yellow ID badge. Charts are black.
  - Nothing is under 12px. Buttons, chips and selects are at least 44px.
  - The only yellow button is *Approve selected* on the batch bar.
- **Self-update:** loads `pine-update.js` (link `damage-log.html`). The new **Refresh** button reloads from Airtable and checks for a new version.
  - The app counts as busy while a save runs, orders are checked, the token box is open, a resolution is being picked, a card is open or a search is typed. When busy, it shows the "Update now" bar instead of reloading.
- **Bug: a double tap sent two refund emails.** In v17, tapping *Send to bookkeeper* twice while the first save was still running wrote two refund requests, so finance got two emails. Tested with a slow mock: v17 made 2 Order writes, v18 makes 1. Now any write is ignored while another is saving, and the app says "Still saving…".
- **Practice:**
  - Shows the practice pill.
  - The Practice button says *Leave practice* when practice is on (it used to say "Practice on", which read like an instruction).
  - Turning practice on or off now updates the URL, so an app update or reload keeps it.
  - Practice approvals of refunds now also fake the refund request. Before, the card turned red with "Refund not sent" right after a practice approve.
- **Small fixes:**
  - Toasts no longer stack on top of each other. The newest one replaces the last.
  - A refund request no longer says "Additional to $0.00 already requested".
  - A search with no results says so, instead of "everything has been sent to the bookkeeper".
  - Switching to Trends scrolls to the top.
  - Marking a refund issued no longer shows "Couldn't save" after a successful save when the order wasn't loaded.
- **Say it once:**
  - "Refund not sent" and the send button are one note.
  - The repeated totals at the bottom of an open order are gone, since the card header shows them.
  - The per-issue "Awaiting review" tag is gone when the Approve button is right there.
  - The duplicate and open-issue notes are shorter.
  - *Select all N to approve* replaces "Select all N shown".
  - Cards without a checkbox keep their order number aligned.
- **Removed:** the packing slip code and its embedded logo (about 30 KB). Nothing has opened the slip since v6, when it moved to Catching.
- **Phone:** the filter chips scroll sideways in one row, issue rows stack, and the trend tiles sit two per row.
- **Tested** (Playwright, mocked Airtable, made-up customers):
  - Approve one issue, send an unsent refund, change a resolution, delete a duplicate, batch approve, mark a reprint done, mark a refund issued, and Trends.
  - The live write payloads match v17 field for field. The one difference is the dropped "$0.00" line.
  - Practice mode sent 0 writes. There were no page errors.
  - Screens at 1440×900, 1024×768, 768×1024 and 390×844. No text under 12px, no horizontal scroll, no visible control under 44px.

## 2026-10-15 · v19
**Why:** "Mark refund issued" showed while the refund was still waiting for approval, or approved but not sent. The bookkeeper can't issue a refund they haven't been asked for.
- **QuickBooks step after the request:** *Copy refund for QuickBooks* and *Mark refund issued* now show only once a refund request has gone to the bookkeeper (at least one refund issue on the order is *In Refund Request*), or once the order is already marked Refund Issued (so *Undo refund issued* stays reachable).
  - Copy goes with Mark issued because both belong to the bookkeeper's QuickBooks step.
  - The *QuickBooks invoice* link and *Order in Airtable* still show at every step.
- **Tested** (same mocks as v18):
  - The live write payloads match v18 field for field.
  - Practice mode sent 0 writes. There were no page errors.
  - At 1440×900 and 1024×768: hidden on an order needing approval (10501) and on an approved-but-unsent order (10503), shown on an order already sent (10506).

## 2026-10-15 · v20
**Why:** the Pine page kit, so the Damage Log feels like the other apps (same bar, one filter row, one list card, yellow only for your next move).
- **Bar:** logo square, DAMAGE LOG, version, practice pill, then *Orders* (with the order count) / *Trends* as bar views, then *↻ Refresh* and *⚙*.
  - The token and the practice switch moved into the ⚙ menu (the separate *Practice* / *Leave practice* button and the token strip are gone). The menu opens by itself when there's no token, and closes on a tap outside or Esc.
- **One filter row:** search · date range · filter chips. The chips stay on one line and scroll sideways (they used to wrap to two rows on iPads). On Trends the *All / Apparel / Bandanas* switch is the chips (the separate "Show:" row is gone) and sits on the same line as the range.
- **Page head:** ORDERS · "7 orders · $126.00 refunds need approval" · *Select all N to approve* on the right.
- **Order cards** are the kit list card: checkbox · order # badge · customer, with "Last issue Oct 13 · 2 issues · 5 pcs" under it · Refund / Reprint would cost / Bandanas · one action. Status tags sit on the second row.
  - The action is *Approve all N*. With nothing left to approve but a refund not sent, it's *✉ Send to bookkeeper*, so that takes one tap from the list.
  - Cards open in place, one at a time. The tapped card stays put on screen when the one above it closes.
  - Bandanas only shows when there are bandana costs. Selected cards get a yellow wash.
- **Say it once:** the "N awaiting review" tag is gone (the *Approve all N* button says it), and so is the "N issues · N pcs" tag (it's in the line under the customer).
- **Tag colors follow the kit:** "Reprint needs approval" is yellow (it needs you, it isn't a problem), and "Reprint in progress" is cream (a fact). Red stays for refund not sent, possible duplicate and negative qty.
- *Approve selected* on the batch bar is still the only yellow button.
- **Small fixes:**
  - The batch bar stays visible when a filter or search hides the selected orders.
  - The "didn't send" toast now names the real button (*Send to bookkeeper*).
  - On iPad portrait, the mockup thumbnails on the card header are hidden and the money labels wrap, so the customer name has room.
- **Tested** (Playwright, mocked Airtable, made-up customers):
  - The v19 flows ran on v20: approve, send an unsent refund, change a resolution, delete a duplicate, batch approve, mark a reprint done, mark a refund issued, and Trends. The live write payloads match v19 field for field (13 writes), with the same confirm texts.
  - Practice sent 0 writes. A double tap on Send still makes 1 Order write. There were no page errors.
  - Checked: no token, the ⚙ practice switch, a tap outside the menu, and one card open at a time.
  - Screens at 1440×900, 1024×768, 768×1024 and 390×844: no text under 12px, no horizontal scroll, no control under 44px (the bar view tabs are 36px, as the kit sets them), chips on one line, and one yellow button.

## 2026-10-15 · v21
**Why:** Stephen uses the Damage Log on a wide desktop screen. v20 capped the page at 1100px, so about 2000px wide meant big empty margins, and the filter chips were cut off ("Reprints 4 (") even though there was room.
- **1400px and wider: two panes.**
  - The order list sits on the left (560–640px, its own scroll). The picked order's full detail fills the right (its own scroll, under the filter row).
  - Click a card to show it on the right. ↑/↓ move between orders. The first order is picked by default.
  - The picked card has a black edge and a cream head. A yellow wash still means "checked for approval".
  - Checkboxes, *Select all* and the batch bar work as before. A picked order doesn't count as "busy" for self-update.
- **Below 1400px:** orders still open in place (v20). The page is now full width with 24px gutters (16px on phones) instead of the 1100px cap.
  - Why no cap: screens this size (iPads, laptops) are at most about 1400px wide, and the list cards already handle that width.
  - The filter row and the list now line up, and the chips get the whole row.
- **Filter row:** full width with 24px gutters. The chips fit on one line whenever there is room (1440 and 1920). On narrower screens they still scroll sideways.
- **Trends:** the four charts sit side by side (3–4 across on desktop).
- **Kit candidate:** the two-pane CSS (`.p-split`, `.p-split-list`, `.p-split-detail`, `.p-split-empty`, `--p-split-top`) is in the app under a "KIT CANDIDATE" comment, ready to move into `pine-style-v2.css`.
- **Tested** (same mocks):
  - At 1440, 1920 and 1024, the 13 live writes match v20 field for field. Practice mode sent 0 writes, and a double tap still sends one refund request. There were no page errors.
  - At 1920, 1440, 1024 and 390: nothing under 12px, no horizontal scroll. At 1920 and 1440: no page scroll in two-pane mode and no clipped chips.

## 2026-10-19 · v22
**Why:** a refund request that failed halfway could email finance twice, and "This month" could include the evening of the last day of the month before.
- **One email per refund request, even after a failed save.**
  - The email comes from the "Refund Request (one per order)" automation. It fires when the Order's *Refund Request At* changes (checked in Airtable, read-only). Approving an issue only posts the Slack alert. It doesn't email finance.
  - v21 wrote the Order (with *Refund Request At*) first and marked the issues *In Refund Request* after. If marking the issues failed, the email had already gone, but the refund still showed "Refund not sent". *Send to bookkeeper* then emailed finance again, as an "(additional)" request.
  - v22 marks the issues first. Then it writes the amount, details, count and *Refund Request At* together in one save, so the email goes last, once.
  - The request is remembered on this computer from the moment it starts. If anything fails, the order shows "Refund request didn't finish — the bookkeeper hasn't been emailed $X yet" and the button says *Finish sending*.
  - *Finish sending* picks up the same request (same amount and text). It re-reads the Order first. If *Refund Request Count* already shows this request (the save landed but the answer got lost), it writes nothing more.
  - On another computer, a first request that stopped halfway is still caught: issues are *In Refund Request* but the Order has no request yet. A stuck additional request only shows on the computer that started it.
- **Months use the shop's clock.** *This month* and *Year to date* start at local midnight (v21 used UTC midnight, which is 6pm the day before in Denver). The "Damage cost by month" chart groups by local month. An entry at 7:30pm on Oct 31 now counts in October.
- **Pine confirm box** (pine-confirm.js) replaces the browser's grey confirm pop-ups. It names the action on the yes button: *Approve*, *Send to bookkeeper*, *Mark done*, *Mark issued*. *Delete* (duplicate) is red.
- **Tested** (Playwright, mocked Airtable, 1440×900, Denver time):
  - Marking the issues fails, so no *Refund Request At* write. The order shows *Finish sending*, and still does after a reload. Retrying makes exactly 1 email-field write (amount $20, count 1), after the issues.
  - The Order save landed but answered 500, so the retry re-read it and wrote nothing (1 write in total).
  - The Order save failed, so the retry wrote once (count 1). The issues were marked only once.
  - Approve with the new confirm: Cancel writes nothing. Approve writes *Approve Resolution* plus one refund request.
  - Practice made 0 writes and saved nothing on the computer.
  - The month start is 2026-10-01 06:00Z (Oct 1 at midnight in Denver). There were no page errors.

## 2026-10-20 · v23: top bar and filter row to the Pine standard
Stephen: "review ... the first ones that we did with the new brand colors to make sure to clean up the top bar that we did for the last few". The references are Line Item Review v35, Shipping v11, Seps v45 and Screens v30.
- **Filter row:** the chips now sit between the search and the date range (`.p-chips-inline`, as in Seps). In v22 they came after the range and dropped below the whole row.
  - When they don't all fit, the chips wrap to a second row inside the band. The search and the range stay on line 1, top right.
  - No filter is ever hidden off to the side. This is the production manager's main screen, so hidden filters are worse than a taller band.
  - At 1440 and 1280 the band is 123px, with the 8 Orders chips in 2 rows. On Trends it is one line (71px).
  - The search is capped at 280px on desktop, because "Order # or customer" is short.
  - On a phone the order is the same as before: search, then the range, then the chips on their own line, scrolling sideways.
- **⚙ menu:** now the kit's `.p-menu` (Airtable token, Practice), the same as Seps, Receiving and Reprints. v22 used its own `.menu p-card` card. The same ids are kept, so the token, practice and pineBusy work as before.
- Nothing else changed: the same filters, two panes, refund flow and Airtable writes.
- **Tested** (Playwright, mocked Airtable). The v22 test (`test_dl.js`: refund retry A–C, approve D, practice E with 0 writes, month start F) passes on v23, 29/29, three runs. The first run timed out once on a click, then passed on reruns. At 1440, 1280 and 390, on Orders and Trends, the bar is 64px (116 on a phone, where the Orders/Trends views get their own row, as in Seps), and there are no console errors.
