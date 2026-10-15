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
