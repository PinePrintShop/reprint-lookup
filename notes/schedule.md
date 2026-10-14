# Pine Schedule (`pine-schedule.html`)

Scheduler v13 and Day Fill v15 in one app. Purchasing schedules the presses here instead of the Airtable calendar interface.

## 2026-10-14 · v1
**Why:** two apps answered the two halves of one question, and neither one saved anything.
- **Scheduler v13** had a drag board but writes were switched off (`WRITES_ENABLED=false`). It also had bugs:
  - Auto-schedule never saved.
  - Notes saved to a field called "undefined".
  - It read *Payment Received* as the due date.
  - It overwrote real start times when it loaded.
  - Drag-and-drop didn't work on iPad.
- **Day Fill v15** suggested days, but only as a read-out. Hold and Pin lived on one computer.
- **The two disagreed** on units (minutes vs weighted pieces), the qty field, the due date field, status lists, Friday rules and Press 2 limits.

### What it does
- **Board:**
  - Week, 3 Day and Day views have a row per press, a column per day, and a fill bar per cell (minutes used / that press's hours).
  - Month view looks like the Airtable calendar month: "P1 8:30 10815-B 🟡", "+N more" opens that day, and P1/P2 fill % shows per day.
  - Department tabs: All, Screen, Embroidery, Heat, Other.
- **Unscheduled list** (left):
  - Grouped by order, with hard deadlines and the earliest due dates first.
  - Each card shows the proof thumbnail, press, qty, run time, and "Not received" when garments aren't all checked in.
  - Search by order, customer or job.
- **Drag and drop** (mouse; on iPad, hold a card for a moment, then drag):
  - **Onto a cell:** sets the press and day. Where you drop it sets the order.
  - **Start times:** the moved job starts after the job before it. Jobs after it move later only if they'd overlap, so gaps left on purpose (lunch, a late truck) stay.
  - **Back onto the list:** unschedules the job.
  - Every move shows "Undo".
- **Tap a card** to see:
  - the proof, customer, print, qty, run time
  - due date + buffer ("3 workdays before due")
  - Sep'd / Screens / Inks / Garments in
  - press + date + exact time pickers, and Scheduling Notes
- **✨ Suggest** fills the next 20 workdays with dashed cards. Nothing is saved until you place them. You can **Place all**, tap one to **Place here / Skip**, or drag one somewhere else. Rules (from Day Fill):
  - Hard deadlines first, then the earliest due date, then the bigger orders.
  - Print 2 workdays before due if possible, 1 at the latest (Settings). Stephen: due date is often the ship date, so 2–3 days ahead is ideal.
  - Not before the garments: the workday after the expected arrival. If garments aren't checked in and no date is set, 2 workdays out at the soonest.
  - Whole orders together on one press and day. If that doesn't fit, each print goes on its own. If nothing fits by the due date, it's placed on the first open day and flagged "after the due date".
  - Press 2 only takes ≤4 screens (≤2 on bandanas). 5+ screens, or 3+ prints in an order, go to Press 1.
  - A press that already runs the same platen that day wins (bandanas with bandanas), then the emptier press.
  - A cell is full when its minutes are used or the run would end past close (105% slack).
  - Inside an order the print order is back, sleeve/left chest, front, pocket. A 15-minute changeover is added when the platen changes.
- **Time model:** one model, Airtable's own *Estimated Run Time* formula (10 min/screen setup; P1 250/h, bandanas 150/h; P2 225/h, bandanas 135/h; embroidery from stitch count; heat presses per piece), plus *Manual Run Time Add*.
  - When a job moves to another press, the app works the formula out for that press.
  - Fleece runs ×1.35 on the screen presses (Day Fill's bumper, editable).
- **Settings** (saved per computer):
  - **Fridays:** No Friday shift (default, from this week) / Press 1 only / Both presses (2027 busy season).
  - Hours per day per press: P1 8.25, P2 8, Embroidery 8, Heat D3/Tag 7, Hat 6.
  - Buffer days before due, and the fleece factor.

### Airtable
- **Reads** Imprints.
  - Scheduled jobs from a week back to about 25 workdays ahead.
  - Unscheduled jobs: no Scheduled Start Time, not finished or caught, not Patch/Label ONLY, and order status in Ready to Order / Ordered / Pre-press / Scheduled, Screened & Inbound / Received & Staged / On-Press / Delayed.
  - All queries page through every record.
- **Writes** only *Equipment* and *Scheduled Start Time* (shop clock stored as Z, `2026-10-15T08:30:00.000Z` = 8:30 am, same as Operator), plus *Scheduling Notes* from the card. Up to 10 records per request, typecast.
- **Practice:** `?practice=1` fakes every write.
- **Automations:** "SLACK: Scheduled Imprint Changed Automation" watches the order's scheduled-time rollup, so moving a job posts to Slack the same way moving it in the Airtable calendar does. "Scheduling Audit Email" (Mon–Thu) reads the same fields. Nothing else fires.
- **No new fields.** Skipping a job in Suggest lasts until the page reloads.
  - If skips and pins should stick for everyone, it needs a field (e.g. a "Schedule hold" checkbox). That needs Stephen's OK.

### Style and updates
- Pine style v2 (black bar, Poppins titles, black/white/cream/107 yellow, red only for late or failed saves).
- `pine-update.js` and the version on the bar. `pineBusy` covers a drag, an open card, a save, and unplaced suggestions.
- iPad: the list becomes a drawer ("Unscheduled" button) and touch dragging uses hold-then-drag. Phone: the top bar is compact and the board scrolls.

### Tested (mocked Airtable, Chromium, 1440 / iPad landscape + portrait / phone)
- Dragging from the list between two Press 2 jobs wrote one record with Equipment + 9:30 start. The toast said where it went, with Undo.
- Suggest placed 9 jobs:
  - the hard deadline split across days so it makes the date
  - not-received jobs 2 workdays out
  - embroidery and heat on their presses
  - nothing after close
- Place all wrote all 9 in one request.
- Month, Day, card, ghost card, Settings, iPad drawer and phone screens were checked.

### Not yet
- Holidays: Day Fill had July 3 hard-coded. Add a holiday list if wanted.
- Day Fill's back-room finishing strip and helper flag.
- Hold/Pin that everyone sees (needs a field).

## 2026-10-14 · v2: press colors
- **Press 1 and Press 2 have their own colors.** These are from direction A in `pine-colors.html` (Stephen's pick): Press 1 (Next) is 7683 blue `#426DA9` with white text, and Press 2 (You) is 637 sky `#4EC3E0` with black text.
- **Where the colors show:**
  - row headers
  - job cards
  - fill bars
  - the P1/P2 chips in Month view
  - the press tag on unscheduled cards
- **What stays the same:**
  - Suggested cards stay yellow and dashed.
  - Over-capacity bars and late cards stay red.
  - Embroidery and heat stay plain until Whitney picks their colors.
- Tested with mocked Airtable (drag, Suggest, Place all, Month).
