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

## 2026-10-14 · v3: one column per day, pick your machines
**Why (Stephen):** the Airtable calendar keeps every machine's jobs together on the day, with a toggle for all machines or some. The row per press in v1/v2 meant scrolling down to find things.
- **Week and 3 Day:** each day is one column, with every shown machine's jobs in time order.
  - Each card starts with its machine (P1, P2, EM, D3, TAG, HAT). Press 1 and Press 2 cards are filled with their colors.
  - The day header (pinned while you scroll) shows each machine's load, e.g. "P1 59% · P2 31% · EM 12%". It has a red outline when a machine is over.
- **Machine chips** (new row under the toolbar):
  - All, or any mix of machines. Tap one while All is on to see just that one, tap others to add them, and tap again to remove one.
  - Each chip shows how many jobs that machine has in view. Your pick is remembered on this computer.
  - The chips also filter the Unscheduled list, Month view, and what ✨ Suggest fills.
- **Dragging onto a day column:**
  - The job keeps its machine, or the one Suggest picked. A job with no press yet goes on the only machine shown (or Press 1 for screen print when several are shown).
  - Where you drop it among that machine's jobs sets its place, and later jobs on that machine move only if they'd overlap.
  - To change machines, tap the card or use Day view.
- **Day view** keeps one column per machine for moving jobs between machines.
- Heat presses are labeled D3, TAG and HAT (was HT for all three).
- Tested with mocked Airtable:
  - A drop into Thursday among mixed machines landed after the right Press 1 job and pushed the next two Press 1 jobs later.
  - With only Press 2 selected, the list and the board showed just Press 2.
  - Suggest with Press 1 + Press 2 selected only placed screen-print jobs.

## 2026-10-14 · v4: garment names, and fleece really counts
**Bug (Stephen):** a job card showed a record ID (`recDs3Bz…`) under Garments. The Imprints "Garment Type" lookup points at linked Garments records, and through the API it returns their IDs, not names. Because of that, v1–v3 never spotted fleece either, so fleece jobs got no extra run time.
- **Garment types:** each job's Line Items are read for their garment type (Garments' type select: T-Shirt, Pullover Hoodie, Bandana…) and qty. They load right after the board shows and are cached.
- **Fleece share:** fleece pieces (Sweatshirt, Pullover Hoodie, Zip Up Hoodie, Youth Fleece, Day Fill's list) / all pieces. Run time on the screen presses is × (1 + share × 0.35), so a half-fleece job gets half the bump. The card shows "60% fleece" and "(fleece +21%)".
- **Garment names** load when you open a card (Garments table, primary field), e.g. "Bella Canvas 3001 - Black". The type shows first while the names load.
- Tested with mocked Airtable: a hoodie job went from 78 to 105 minutes on Press 1, and the card showed the garment name.

## 2026-10-14 · v5: garments always fill in
**Bug (Stephen):** with real data, cards showed "…" under Garments. The background Line Items load (hundreds of line items across every loaded job) was either still running or had hit Airtable's 5-requests-a-second limit (429). On any error it threw away everything it had loaded.
- **Opening a card** now loads that job's own line items and garment names right away. It shows the names, or "Not listed on the line items".
- **Background load:**
  - Retries a 429 up to 4 times with a growing wait, and leaves 250 ms between batches.
  - Keeps every batch that arrived, even if a later one fails.
  - Loads unscheduled jobs and the jobs in view first.
- Tested with mocked Airtable that returned 429 twice and answered slowly: the open card filled in, and all 73 jobs got their garment types.

## 2026-10-14 · v6: direction B colors for every machine
**Stephen:** go with B, the more muted "Consume design" colors, for everything (this replaces the earlier A pick for the presses).
- **Colors** (black text on all of them):
  - Press 1 (Next): 7473 teal `#1E988A`
  - Press 2 (You): 7563 mustard `#D69A2D`
  - Embroidery and sewing: 7579 burnt orange `#DC582A`
  - Heat presses D3, Tag, Hat: Red 032 `#EF3340`
  - The page ground is Pine cream `#EFE2CD`.
- **Where they show:** cards, day-header load chips, machine chips (when on), Day view column headers and fill bars, Month chips, and the press tag on unscheduled cards.
- **Warnings are black "!" marks now,** because red means heat press:
  - an over-capacity load chip or bar
  - a late card (black outline plus a "!" dot)
  - "Not received"
  - overdue due dates and the reasons Suggest couldn't place a job
- `pine-colors.html` now marks B as the pick.

## 2026-10-14 · v7: day-header load chips line up
**Stephen:** the load chips changed from day to day (only the machines with work that day), so they wrapped differently and looked messy.
- **Same chips every day:** each day shows the same machines in the same spots, three per row. That's Press 1 and Press 2 always, plus any other machine with work anywhere in the view.
- **Faded chips:** a machine with nothing that day shows "P2 –", and a closed day shows "P1 off".
- **Labels:** the sewing machines are BT (Bartacker) and PB (Post-bed). Both used to be "SW".

## 2026-10-14 · v8: one lane per person/department
**Stephen:** all the heat presses are one person, and embroidery + sewing are one person, so group them.
- **Lanes:** the board works in four lanes:

  | Lane | Machines | Hours/day |
  |---|---|---|
  | Press 1 | ROQ Next | 8.25 |
  | Press 2 | ROQ You | 8 |
  | Embroidery & sewing | Tajima, Bartacker, Post-bed | 8 |
  | Heat press | D3, Tag, Hat | 7 |

  Flatstock, Finishing and Split show only when they have work. Each lane has one machine chip, one Day view column, one load % against that person's hours (Settings), and one capacity for ✨ Suggest.
- **Jobs keep their exact machine in Airtable** (Equipment). Every card shows its machine (EM, BT, PB, D3, TAG, HAT), now in Day view too.
- **Moving a job:**
  - Within its lane, it keeps its machine.
  - Into another lane, it takes that lane's main machine (Tajima or D3).
  - To pick an exact machine, tap the card and use the press picker.
- Tested with mocked Airtable using mixed machines: a Tag job moved within Heat stayed on Tag, a Press 1 job moved to Heat became D3, and the Heat lane load counted D3 + Tag together.

## 2026-10-14 · v9: job times from real press history
**Stephen:** do option 1 (the Schedule app uses the calibrated model). Airtable's Estimated Run Time formula (option 2) is still being discussed. Background: `notes/schedule-calibration.md`.
- **Press 1/2 job time** = setup + printing + Manual Run Time Add:
  - Setup: 8.2 min/screen on Press 1, 8.9 min/screen on Press 2.
  - Printing speed (pieces per hour):

    | | Tee | Bandana | Fleece | Tote |
    |---|---|---|---|---|
    | Press 1 | 253 | 239 | 194 | 176 |
    | Press 2 | 231 | 189 | 171 | 149 |

  - A part-fleece job blends the tee and fleece speeds by its fleece share. Split uses both presses' speeds added together.
- **Embroidery** is the stitch formula plus 18 min of hooping.
- **Kept on Airtable's formula for now:**
  - **Heat presses.** The measured speeds (D3 33/hr, Tag 36, Hat 39) come from only 37 jobs and are about 2× slower than the formula; check with the heat press person first.
  - **Sewing and finishing.**
- **Gaps between jobs** (loading, takedown, cleanup):

  | | Same product | Product change (bandana ↔ tee ↔ fleece) |
  |---|---|---|
  | Press 1 | 11 min | 21 min |
  | Press 2 | 13 min | 30 min |
  | Other lanes | 5 min | 5 min |

  These gaps are used for start times when moving or suggesting jobs. They replace the flat 15-minute platen changeover.
- **Capacity:** "100%" is now a normal full day of press time: Press 1 6.75 h, Press 2 6 h (Embroidery 8 h, Heat 7 h unchanged). Suggest also won't let a run end after **5:15 pm** ("Last job ends by" in Settings).
- **Settings:** the fleece × factor is gone (fleece comes from data now). The hours setting is relabeled "Press time per day (setup + printing)" with an explanation. Settings saved on a computer before v9 keep their Friday choice and buffer days but not the old 8.25 h / 8 h.
- **Job card:** shows "Press time 1h 44m · setup 33m + printing 1h 11m".
- Tested with mocked Airtable. Examples:
  - 300 tees, 4 screens, Press 1: 1h 52m → 1h 44m.
  - 150 bandanas, 4 screens, Press 1: 1h 40m → 1h 11m.
  - 96 bandanas, 1 screen, Press 2: 53m → 40m.

## 2026-10-14 · v10: 90% fill cushion
**Stephen asked:** "is the new timing conservative?" Not really. The calibrated job times come out about 4–8% shorter than actual, and 100% is a typical full day, so half of real days fit more and half fit less. He chose to have Suggest fill days to 90%.
- **Suggest** only fills a lane-day up to **90%** of its press time per day. That leaves about 40 min of cushion on Press 1 and 35 min on Press 2. It's editable in Settings ("Suggest fills each day to": 80–100%). Before this, it filled up to 105%.
- **Dragging by hand** can still go past 90%. The "!" warning shows above 100%.
- Tested with mocked Airtable: every day Suggest filled landed between 56% and 88%.

## 2026-10-14 · v11: Flatstock and Finishing colors
- **Flatstock:** Pantone **7683** denim `#426DA9`, from the brand's other palette, with white text (black reads poorly on it).
- **Finishing:** dusty plum `#8E6C8A`, with black text. It isn't a brand Pantone; the brand book says "feel free to get creative". The muted brand colors left are taken (teal, mustard, burnt orange, Red 032), and the remaining ones are too bright (sky, 107 yellow) or too dark (540 navy). Plum differs from the other lanes in both color and lightness.
- **Where they show:** cards, machine chips, day-header loads, Day view headers and bars, Month chips and unscheduled tags, same as the other lanes.

## 2026-10-14 · v12: ink changes count
- v9–v11 left planned ink changes out of Press 1/2 job time. They now add **15 min each**.
- That's measured: jobs with 1 ink change ran 15 min over the model and jobs with 2 ran about 26 min over (1,888-job history). Airtable's Ink Change time field assumes 25 min each.
- The count comes from Ink Change time ÷ 25 min.

## 2026-10-14 · v13: Allocated Production Time
**Stephen:** Allocated is the scheduler's adjustable time, and the app needs that feature. In Airtable, *End Time* = Scheduled Start + Allocated, and Operator and the Production Board read Allocated.
- **Job length** on the board is **Allocated Production Time when it's set** (the scheduler's call), else the estimate.
- **Job card:**
  - **Estimate** with its breakdown (setup + printing).
  - **Allocated (min)**, editable, with a "Use estimate" button (rounds up to 5 min). Blank clears it.
- **Placing a job** with no Allocated (drag, card move, Suggest, Place all) fills it from the estimate, rounded up to 5 min, in the same write. Operator, the Board and the Airtable calendar then show the same length. Existing Allocated values are never overwritten by a move, and Undo puts them back.
- **Estimate** is the calibrated model, now the same numbers as Airtable's Estimated Run Time (see `schedule-calibration.md`).
- Tested with mocked Airtable: dropping an unscheduled job wrote Equipment + Start + Allocated 40 min. Setting Allocated to 90 on a card wrote 5,400 s, and the job became 90 min on the board.

## 2026-10-14 · v14: Allocated in 15-min steps; unlinked imprints; formula errors
**Stephen's screenshot:** proof pictures were missing, and "[object Object]" showed after the job IDs.
- **Cause:** those imprints (e.g. 10957-E, 10996-A, 10627-C) have **no Line Items linked** in Airtable. So they have no qty (Total/Active Impressions 0), no proof (it comes from the line items), and no garments, and the *Due Date Warning* formula returns `#ERROR!`. The API sends that as an object, which printed as "[object Object]".
- **Fixes:**
  - Status icons only show text values, so formula errors are hidden.
  - Unlinked imprints get a **"No line items"** tag instead of "Not received". ✨ Suggest skips them and explains why.
  - With no proof, the **Seps** file's thumbnail is used as the picture when there is one.
- **Allocated** filled from the estimate, and the "Use estimate" button, round **up to the next 15 min** (was 5). The minutes box steps by 15.
- Tested with mocked Airtable:
  - An unlinked imprint with an `#ERROR!` warning showed "No line items", no "[object Object]", and the Suggest reason.
  - A drop filled Allocated at 45 and 75 min for 40- and 71-minute estimates.

## 2026-10-14 · v15: only jobs whose garments are ordered
**Stephen:** the list was pulling in orders that aren't ordered yet.
- **Unscheduled list and ✨ Suggest** now start at **Ordered - In Production**. That covers Ordered, Pre-press, Scheduled/Screened & Inbound, Received & Staged, On-Press and Delayed.
- **"Ready to Order"** (garments not ordered yet) is left out.
- **Mockups:** Stephen wants them on Day view only, which is how it already worked. A brief try at thumbnails on Week/3 Day cards was taken back out before shipping.
- **Imprints with no Line Items linked** are no longer listed. A note at the bottom of the Unscheduled list names them ("N imprints not shown … link them or delete them: 10957-E, …"). On Oct 14 this covered 10957-E/F, 10996-A and 10627-C/D/E/I. Their orders are real, but those print records were never connected to line items, so there's no qty, mockup or garment.

## 2026-10-15 · v16: 2 Week view + mouse drag fix
**Stephen:** add a 2 week view.
- **2 Week** sits between Week and Month. It shows this week and next as two Mon–Fri rows, with a thicker line between the weeks.
  - Every job is listed (Month cuts off at 7 per day). Each day shows its load for every machine (P1, P2, EM, HT, FS, FN).
  - ‹ › moves two weeks at a time. Tap a date to open that day.
- **Dropping a job with no press** on a Month or 2 Week day now guesses the press the way Week does: the one machine shown, or else the likely press for that kind of job (Press 1 for screen print). Before, it only said "Pick a press first".
- **Bug fix (was in v15 too):** grabbing a job by its mockup picture with a mouse started the browser's own image drag, so the card didn't move. That image drag is now blocked. Touch on the iPads wasn't affected.
- **Tested with mocked Airtable** at 1440 / 1024 / 390 wide:
  - Dragged an unscheduled job onto next Wednesday. It saved Press 1, 12:15 pm, 45 min Allocated.
  - Navigated next and back, and the view choice is remembered.
  - Re-ran the v15 test on v16 (Week drops, Press 2 only, Allocated edit). All passed.

## 2026-10-15 · v17: Pine page kit (same feel as the other apps)
**Stephen OK'd the page kit:** every app gets the same bar, filter row and cards. Mike is beta testing on real data, so scheduling, the time model and every Airtable write are unchanged.
- **Bar:** Pine mark · SCHEDULE · version · Practice tag · the views (Day / 3 Day / Week / 2 Week / Month) · ↻ Refresh · ⚙. The views moved up from the tool row into the bar. Settings and Refresh were big outline buttons.
- **⚙ menu:** Airtable token, practice on/off, and a Settings button that opens the shop settings (Fridays, press time, Suggest). With no token, the menu opens by itself.
- **One filter row:** ‹ Today › and the dates · machine chips on one line (they scroll sideways on a phone) · ✨ Suggest. The separate "Machines" row is gone, so the calendar starts about 90 px higher on a phone.
- **One yellow button:** ✨ Suggest. While a suggestion is on screen, **Place all** is the yellow one.
- **Unscheduled list:** cards use the kit list card: picture, imprint ID badge, Qty and Time on the right, job name, then the tags. They still drag the same way. Touch still needs a hold, and grabbing the picture with a mouse still works (the v16 fix).
- **Job card pop-up:** the Save / Place buttons stay in view while the middle scrolls. Before, you had to scroll down to Save on an iPad. It uses the kit inputs and tags, and every button is at least 44 px.
- **Small fixes:**
  - Tapping outside the ⚙ menu closes it without also opening the card under your finger.
  - The version shown if the update check can't load said v15.
- **Tested with mocked Airtable** at 1440 / 1024 / 768 / 390:
  - The same 12 drags and edits ran on v16 and v17, and the Airtable writes were identical. They covered: drops in Week, Press 2 only, Suggest → Place all, Allocated 90, a card move to Press 2 at 10:00, notes, drag back to the list + Undo, a 2 Week drop, a Day view drop, and an iPad hold-to-drag from the drawer.
  - Practice mode made 0 writes.
  - A quick touch swipe doesn't drag.
  - Checked: no page errors, no text under 12 px, no button under 44 px, and no sideways page scroll.

## 2026-10-15 · v18: Ready to Order jobs show again
**Stephen:** "can you see why the Scheduler isn't pulling in the jobs that got pushed through yesterday / today… It should show up when it is ready to order."
- **Cause:** v15 started the list at **Ordered - In Production**, after Stephen's earlier "Garments ordered on". The orders moved forward yesterday and today were at **Ready to Order**, so the Schedule skipped them. In Airtable, Oct 15, every recent unscheduled print was on an order still at Awaiting Proof, Sent - Awaiting Payment or Ready to Order.
- **Now:** the list and ✨ Suggest start at **Ready to Order**.
  - Those jobs carry a yellow **"Garments not ordered"** tag.
  - Suggest places them no sooner than **4 workdays out** (order + ship), unless the line has an arrival date. Jobs whose garments are ordered but not in yet keep the 2-workday rule.
- **Tested with mocks:**
  - The Airtable formula now includes Ready to Order.
  - The tag shows on the side card.
  - With today set to Wed 10/14, Suggest put a Ready to Order job on Tue 10/20 and a not-received job on Mon 10/19 (Friday has no shift).
  - The 12 v17 drag/edit flows send identical writes on v18.

## 2026-10-15 · v19: search finds scheduled jobs too; start–end times on cards
**Stephen:** "in the search area for scheduler can it just search everything scheduled as well and not just unscheduled. maybe a toggle or a button to just show unscheduled". Also: "can we also view start time and end time in the cards".
- **Search:** under the search box there are two chips: **All** (the default) and **Unscheduled only**. The choice is remembered on this computer.
  - With no search text, the list is the same as before in both states.
  - With text and **All**, the matching unscheduled jobs come first, then a **Scheduled** section.
  - The Scheduled section lists scheduled jobs that aren't finished, from any date. Each card shows the ID, day, start–end time, a press chip in its lane color, the customer and job, and tags (On press, order status, after due).
  - It searches Imprint ID, order #, customer and job nickname. It asks Airtable once, 300 ms after typing stops, for the first 50 by start time. It merges those with what's already loaded, so a job you just moved shows where it is now.
- **Tap a scheduled result:** the calendar jumps to that day, scrolls to the card and flashes it.
  - The view stays the same, except Month switches to Week (Month cuts off at 7 jobs a day).
  - If that machine was filtered out, the chips go back to All.
  - On the iPad and phone, the list drawer closes.
- **Scheduled results don't drag.** You drag from the calendar, where you can see what's around the job. Dragging from the list could drop a job onto another day without seeing the day it came from.
- **Start–end times:** every calendar card shows the time range, e.g. "1:00p–2:45p". The end is start + the card's length (Allocated, else the estimate), the same length the board uses for placement. Suggested (dashed) cards show their suggested range.
  - The job length is shown only on Day view cards now; elsewhere the range says it.
  - 2 Week shows ranges. Month keeps the start time only (no room).
  - The job card pop-up has a **Time** line (Start–End · day · length, or **Suggested** for a dashed card). Search results show the range too.
  - On Day view cards, the ID wraps to the next line instead of being cut off.
- **Tested with mocked Airtable** at 1440 / 1024 / 390:
  - Typing "paddlers" sent 1 query, not 8. It found a Dec 3 job outside the loaded weeks and skipped a finished one. Tapping it jumped to Nov 30 – Dec 4 and flashed the card.
  - "odell" showed 2 unscheduled and 11 scheduled jobs. Unscheduled only hid the scheduled ones and was still on after a reload.
  - Dragging a result wrote nothing.
  - The range updated right after a drop.
  - The v17 drag/edit flows send identical writes to v18, and practice mode made 0 writes. No page errors and no text under 12 px.

## 2026-10-15 · v20: lock-in, all proofs, Mike's notes
Mike ran the schedule on real data for a few hours. Stephen had also asked for a way to lock jobs in.

### Lock in (Stephen)
- **One job:** the job card has a **Lock in** button (Unlock once it's locked).
- **A whole day:** the **Lock in day · N** button.
  - Week and 3 Day: at the bottom of each day. Day view: top right. 2 Week: in each day.
  - It locks the day's unlocked jobs on the machines shown and asks first (not in practice).
  - Today and later only. Month has no button; open the day.
- **What it does:** ticks the Imprints **Scheduled** checkbox. Nothing else is written, and the status doesn't change. Undo unticks.
- **Slack:** Airtable's bots read it.
  - Once every print on an order is ticked, "Preliminary Scheduling Notification" posts the order.
  - After that, any start-time change posts "There has been a change to this Scheduled Job" with the new days.
- **Moving a locked job keeps it locked.** Airtable's change bot then tells Slack the new days. The move message ends "still locked in". To take the lock off, use Unlock on the job card.
- **Locked jobs show a small black "✓ Locked"** on their calendar cards, and a Locked tag in the list and search results. It isn't a padlock, because Airtable's Due Date Warning already uses 🔒 for "deadline today".

### Mike's notes
- **Proofs:** "WARGAME is only showing the black/orange longsleeves, as opposed to the black/blue and white/red ones too"
  - Cause: the imprint's Proof Images lookup has one file per line item, and every version since v1 showed only the first.
  - The job card now shows every proof, named from the file (e.g. "1301-BK-WARGAME EXTERMINATOR"). Tap one for full size. The same file on two line items shows once.
- **Color changes:** "could be neat to display how many color changes as well, if possible"
  - With 2 or more different proofs, a **"3 colorways"** tag shows on the job card and the side card. It counts proofs. The app doesn't try to work out the actual ink changes from the art.
  - When the job has Ink Change time in Airtable, the job card also says "2 ink changes planned".
- **Side cards:** "I think just the location instead would be perf!" The side cards show the imprint **Location** (Front, Back, Left Chest…) instead of the nickname. Search still finds nicknames.
- **15-minute logic:** "For suggested allocated time, suggest in 15 minute chunks … it should automatically go to the exact end time of the previous job (instead of adding 15 mins every time)"
  - **Job length:** a job with no Allocated time uses the estimate **rounded up to 15 min**. That's on the side card, the calendar and the Allocated box. It's the same number placing the job writes as Allocated.
  - **Dropping a job:** it starts at the **exact end of the job before it**. There's no changeover gap (11–30 min on the presses before) and no rounding up to the next 15. Jobs after it move only if they'd overlap, to the exact end of the one before.
  - **Lunch and gaps:** add them by hand (pick a time on the card). Gaps you leave stay.
  - **✨ Suggest is unchanged.** It still leaves the measured gaps between jobs.
- **End time:** "would love to see the end time when clicking the cards". The job card's Time line reads "**8:30** to **10:15** · Thu Oct 15 · 1h 45m". It updates as you type a new Allocated time.
- **Save moved jobs:** "when I click save, it keeps removing it from the sidebar and automatically putting it on the next day"
  - For an unscheduled job, the card's press, day and time now start **blank**.
  - Save with no day keeps the job in the list and saves only the other edits (Allocated, notes, and the press if one was picked).
  - Filling in a day schedules it as before. With no press picked, it uses the job's own press or the likely one.
- **Machine chips:** "it would be better if that remains static no matter what I'm selecting at the top!" The chips now filter **only the calendar**. The Unscheduled list stays the same. ✨ Suggest still follows the chips.
- **Job name:** "see the job name on the cards when they're on the sched in addition to the job number"
  - Calendar cards show the customer under the ID, e.g. "WARGAME Co.". That's the name the order carries in Airtable ("8373-WARGAME Co.").
  - Week, 3 Day and Day: its own line. 2 Week: a second line, so the days are taller. Month: after the ID, cut off when there's no room.
- **8:30 start:** "let's change the earliest start time when I drag it on a fresh day to be 8:30, not 8am!" The first job on an empty day starts 8:30, for drops, the card's "Next open" and Suggest.
- **Turnaround:** "would be nice to see the turnaround calculator (shows how many business days it is)"
  - The job card has a Turnaround line, e.g. "Prints on **day 11** · due on day 14 · today is day 8 · Business days since paid Tue Oct 6".
  - It's counted the same way as Airtable's Imprints **Turnaround Calculator**, `WORKDAY_DIFF(Payment Received, Scheduled Start)`: Mon–Fri, and the day paid is day 1. That's the same count as POM's turnaround and the Orders Turnaround field.
  - Fridays count even with no Friday shift, as they do in Airtable.
  - With no payment yet, it says "Not paid yet".

### Tested with mocked Airtable (1440 / 1024 / 768 / 390)
- **Side cards and chips:**
  - Side cards show Location and "3 colorways".
  - Picking a machine chip left the list at 10 jobs.
  - All 52 week cards show the customer.
- **Proofs:** 4 proof files (one a duplicate) showed as 3 proofs, with "2 ink changes planned".
- **Unscheduled job card:**
  - Press, day and time were blank.
  - Save with Allocated 60 wrote only Allocated, and the job stayed in the list.
  - Picking only a press wrote only Equipment.
  - Picking an empty day wrote 8:30.
- **Turnaround:** matched an independent count of Mon–Fri days from payment.
- **Locking:**
  - Lock in wrote only `Scheduled: true`, and Unlock wrote `false`.
  - The day button locked 12 jobs in one go, and Undo unticked them.
  - Moving a locked job sent no lock change.
  - Practice mode made 0 writes.
- **Drag/edit flows (the v17 set) compared with v19:**
  - Allocated, notes and unschedule writes are identical.
  - Start times differ only as intended: a drop after a 10:15 end now starts 10:15 (was 10:30), an empty day starts 8:30 (was 8:00), and pushed jobs move to the exact end.
  - Suggest picks moved a little, because unallocated lengths now round up to 15.
- **Search:** the v19 search test still passes.
- **Checks:** no page errors, no text under 12 px, no pop-up button under 44 px, no sideways scroll in any view.

## 2026-10-19 — v21: "Imprint Ready?" on every card
Stephen: "can we add the already existing function in airtable > imprints 'Imprint Ready?' On the cards in the same place I see the due date emojis and bandanas emoji. It would be very helpful to see that right away!"
- Imprints field `fldzVhAgy4FnzQX2a` (formula → 👍 / 🛑; the same one the Production Board reads) is loaded and shown FIRST in the emoji row after the job ID — calendar cards (Day / 3 Day / Week / 2 Week / Month), the Unscheduled side list and the job pop-up. Hover says "Imprint Ready? (Airtable)".
- The rule stays in Airtable's formula (Stephen pasted it): presses / flatstock = goods received + inks ready + screens burned; embroidery = goods received; patches / woven labels, sewing, heat press = goods + transfers/trims received; finishing types always 👍.
- Tested with mocks in Week / Day / Month: the mark shows on every card, no errors.

## 2026-10-19 — v22: ink changes and embroidery times fixed, day end times
From a code review of v21. Permanent link `pine-schedule.html` now opens v22.
- **Ink changes were under-counted.** The app took Airtable's Ink Change time and divided it by 25 min (the old rate). Since 2026-10-14 that field is 15 min per change, so 2 changes counted as 1, 3 as 2 and 4 as 2. v22 reads the number straight from Imprints **Ink Changes** (`fld6Tv0llCxjjyyHJ`) and adds 15 min each, the same as Airtable's Ink Change time and Estimated Run Time formulas.
- **Embroidery hooping was counted twice.** Airtable's Estimated Run Time already adds 18 min hooping on the Tajima (embroidery, patches, woven labels, Decopress). The app added another 18. It's counted once now. A job moved onto the Tajima from another machine also gets the 18 min once.
- **Day end time.** Day view shows "Done by 12:45p" under each machine's bar. If the last job runs past "Last job ends by" (⚙, default 5:15p) it says "! Runs to 5:30p, past 5:15p". Week, 2 Week and Month mark that machine's day chip with "!", and the chip's hover says when the last job ends. Gaps between jobs count because it uses the actual start times.
- **"Are you sure?" boxes** (Place all, Lock in day, switching practice with a suggestion up) use the Pine confirm box instead of the browser's grey pop-up. They still don't show in practice mode.
- The version on screen comes from the file name. The old built-in "20" is gone.
- **Tested with mocked Airtable at 1440×900:**

| Job | v21 | v22 | Airtable estimate |
|---|---|---|---|
| Press 1, 200 tees, 3 screens, 2 ink changes | 88 min | 103 min | 102 min |
| Press 1, 100 tees, 1 screen, 4 ink changes | 62 min | 92 min | 92 min |
| Press 2, 144 tees, 4 screens, 3 ink changes | 104 min | 119 min | 118 min |
| Embroidery, 48 pcs, 8,000 stitches | 228 min | 210 min | 210 min |
| Patch application, 60 pcs | 106 min | 88 min | 88 min |

  Jobs with 1 ink change didn't change. Cancel on each confirm box writes nothing, and confirming writes as before. Practice mode made 0 writes. No JS errors.

## 2026-10-20 — v23: "why is it this full?" pop-up, impressions goals back
Stephen: "on the scheduling app.....can we add a pop up in the percentage to include the reasoning why it might be over 100% and also bring back in our impressions goals per press". And: "the why can include palet changes / ink changes / sweatshirts...just a quick pop up to help us learn how to always better schedule".
- **Click any %** (Day view bar, Week / 3 Day header chips, 2 Week / Month cells; hover says so) and a pop-up shows:
  - Available press time (⚙ Settings) and Planned time, in hours and minutes, plus impressions.
  - **Over 100%:** "Why it's over 100%", biggest first, one line each with the minutes it adds, only when it applies:
    - hours over
    - screen setup (names a 5+ screen job)
    - pallet changes (product switches bandana ↔ tee ↔ fleece in the day's order, about 21 min on Press 1 and 30 on Press 2; these push the end time and aren't in the %)
    - ink changes × 15 min
    - sweatshirts/fleece pieces and the extra time against tee speed (P1 194 vs 253/hr, P2 171 vs 231/hr)
    - bandanas against tee speed
    - 3+ small runs (under 50 pcs)
    - embroidery hooping
    - Allocated longer than the estimate
    - rounding up to 15 min
    - one job taking half the day
    - Hard Deadline jobs
    - suggested (dashed) jobs
    - runs past close
  - **Under 100%:** how much is free and the top 3 "Where the time goes".
  - **"Next time" tip** when there's an easy one: "Group the fleece jobs together to save 1 pallet change", or "Move 11042-A (2h) to Fri: Press 2 has 3h free".
  - **Each job's line:** start–end, setup (screens × min + ink changes × 15) + printing (pcs, fleece share) = estimate (rounded up to 15) or Allocated, then the minutes. The minutes add up to the % (minutes ÷ available).
- **Impressions goals are back** (Day Fill v15 had 1,100 / 950):
  - New defaults: **Press 1 1,400 / day, Press 2 1,200 / day.** They're still pending Stephen's OK.
  - **How they were measured:** the last 120 days of Run End Actual. Impressions = the summed line qty of each imprint. A full day = first run start to last run end of 6.5 h or more. The goal is a good day (top quarter, p75). The median is a normal day.

    | | Full days | Median | Top quarter (p75) | p90 |
    |---|---|---|---|---|
    | Press 1 | 61 | 1,010 | 1,395 | 1,620 |
    | Press 2 | 58 | 949 | 1,200 | 1,550 |
  - **Editable in ⚙ Settings → Impressions goal per day.** Only a changed goal is saved on that computer, so new defaults still reach the others.
  - **Where they show:**
    - Day view under each press's %
    - Week / 3 Day headers, on days with work
    - 2 Week / Month cells: "Planned 1,150 impressions · goal 1,400" (shorter where space is tight) with a small bar
    - in the pop-up
  - Under 60% of the goal shows muted. Over the goal is fine and isn't flagged.
  - **What counts as an impression:** each imprint's qty (one print location), summed per press per day. So pieces × print locations.
  - Once a job is finished, the Imprints qty rollup reads 0, so it uses the line items' qty instead.
  - Only Press 1 and 2 have goals. Embroidery and heat stay time-based.
- No new Airtable writes.
- **Tested with mocked Airtable at 1440×900:**
  - **Over-100% Press 2 day** (fleece 6 screens, Hard Deadline bandana, tee Allocated 2h, fleece; runs to 5:30p):
    - The jobs' minutes were 165 + 120 + 120 + 90 = 495. 495 ÷ 360 = 138%, the same as the chip.
    - The reason lines were all correct and sorted.
    - The tip said to group the fleece jobs.
    - Impressions: 770 = 200 + 300 + 150 + 120.
  - **Embroidery day:** hooping 36m.
  - **Under-100% Press 1 day:** 52%, no "why" list, "3h 15m free".
  - **Each view:** the pop-up opens from Day, Week, 2 Week and Month.
  - **Settings:** the goal saves and stays after a reload.
  - **Writes and errors:** no writes, and practice mode made 0 writes. No JS errors. Nothing under 12px.
  - **v22 test:** passes on v23.

## 2026-10-20 — v24: "Suggest" without the emoji
**Why:** Stephen's top-bar review of the first apps in the new brand colors.
- The filter row's yellow button reads "Suggest" (was "✨ Suggest"). The ✨ on suggested jobs in the calendar stays. The bar keeps `position:relative`, since Schedule is a fixed 100vh layout.
- No behaviour changes.
- **Tested:** the v23 test passes on v24 (ALL PASS). At 1440 and 390 there are no console errors and practice mode makes 0 writes.

## 2026-10-21 — v25: same-ink jobs together
Stephen: "in scheduler can we also make sure to keep jobs that share inks together...meaing discharge white bandana on a few banadanas get shcedulerd together".
- **Inks:** v25 also reads Imprints ink names (`fldMM5hp8kEpo3KKT`, the same field Seps and Ink Queue read). It's a read only, with no Airtable changes. TBA slots are ignored.
  - Names are normalised: "Pantone 186 C - Discharge" and "186 - Discharge" are the same ink, "EZP WHT" reads as white, and a name without " - type" takes the imprint's type.
  - The job pop-up lists the inks.
- **How alike two jobs are:** the number of shared ink names, +1 for the same Imprint Type (Discharge with Discharge), +2 for the same white or base (e.g. Discharge White). Two jobs "share ink" when at least one ink is shared.
- **Suggest:**
  - **Press:** same platen first (as before), then shared inks, then the emptier press.
  - **Day:** from the first day with room, Suggest looks up to 2 more workdays ahead and picks the day already running the most shared inks. It never goes past the "print N workdays before due" day or past the fill target. With no shared inks anywhere, it takes the first day as before.
  - **Order within a day:** a greedy chain after the jobs already there. The next job is always the same product (bandana / tee / fleece) that shares the most ink with the one before it. Two prints of one order keep back → sleeve → front → pocket. The new order is only used when it beats the old one.
  - **Hard Deadline and locked jobs** keep exactly the day, press and time v24 would give them. Jobs already on the calendar never move.
  - **Example (test):** three Discharge White bandanas and a plastisol bandana on Press 2 run DW, DW, DW, plastisol (v24: DW, plastisol, DW, DW). A 7579 plastisol bandana moves from Tue to Wed, next to the 7579 bandana already there.
- **% pop-up (v23):**
  - **"Ink runs"**, e.g. "3 jobs in a row on Discharge White · saves about 30 min of ink changes". This is an estimate: 15 min (the ink-change rate since 2026-10-14) for each ink that stays on the press between neighbours.
  - **"Next time" tip** when same-ink jobs aren't back to back, e.g. "Run 11042-A right after 11040-A (both Discharge White)". It names a job that can move (not locked or Hard Deadline).
- **Day view:** a small "Same ink · Discharge White" join line (12px, black rule) between neighbouring cards that share ink. Suggested jobs get it too.
- **Group by ink** (Day view, under a press's "Done by"; also in the pop-up):
  - Shows only when it would help and no suggestion is up.
  - Re-orders that day's unlocked, non-Hard-Deadline jobs. Locked, Hard Deadline, running and finished jobs keep their slot, and gaps stay where they were.
  - A confirm box lists the new order and how many jobs get new start times. It shows in practice too, so the order can be previewed.
  - It writes only *Scheduled Start Time* for the jobs that moved (plus Allocated if a job had none, as for any move), with Undo. Practice writes nothing.
  - Nothing else re-orders hand-placed jobs.
- **Fix:** suggested jobs with no press set yet got no changeover gap between them, because v1–v24 used the job's empty Equipment. The gap now comes from the lane: 11/21 min on Press 1, 13/30 on Press 2.
- **Fix:** the version fallback said 23.
- **Tested** (mocked Airtable, Chromium, 1440×900 and 390):
  - Suggest put the three DW bandanas back to back. The Hard Deadline suggestion was identical to v24's. No placed job moved.
  - The marker shows (≥12px). The pop-up line and the tip are correct.
  - Group by ink: Cancel wrote nothing. Re-order wrote 1 PATCH with 2 records, start time only (11041-A 9:30, 11040-A 10:30). The Hard Deadline and locked jobs were untouched. Afterwards the pop-up said "3 jobs in a row on Discharge White · saves about 30 min".
  - Practice: Group by ink + Suggest + Place all made 0 writes. No console errors.
  - The v23 suite and the v22 suite pass on v25.
- Not shipped by this change: the permanent link `pine-schedule.html` still points at v24.

## 2026-10-24 — v26: late jobs no longer fail to save
Stephen: "Can you also have an agent look into this issue with the Scheduler app". Saving a job failed with:
`Save failed (422): … Cannot parse date value "2026-10-28T24:30:00.000Z" for field Scheduled Start Time`.
- **Cause:**
  - `setStart` (v25 line 661) built the time as text from "minutes since midnight": `day + 'T' + hours + ':' + minutes`. It never rolled over to the next day.
  - "Next open" (`planMove`), the push-later chain (`pushLater`), Suggest and Group by ink all stack each job at the end of the one before it. A job placed after a day that already runs past midnight got minute 1470. That was written as hour 24 ("24:30"), and Airtable rejects it.
  - Example from the test: a job at 4:30 pm with 8 h allocated ends at 24:30.
  - It isn't a time zone offset. Times are stored as shop clock time marked Z (08:30Z = 8:30 am, the same as Operator, the Board and the Airtable calendar). The app does no offset math.
  - `setStart` is the only place that writes a date. Undo writes back the old value, Allocated is a number and Lock is a checkbox.
- **Fix:** `setStart` now uses `new Date(Date.UTC(y, m-1, d, 0, minutes)).toISOString()`.
  - Minutes past midnight roll over to the next day, month or year: Oct 28 + 24:30 → `2026-10-29T00:30:00.000Z`.
  - Times stay shop clock time marked Z, so normal slots write exactly what v25 wrote. DST doesn't affect them, because they are clock times and not real instants.
  - Nothing else changed.
- **Tested** (mocked Airtable that rejects hour 24+ with the same 422, Chromium, 1440×900):
  - **v25 reproduces the error:** Next open after a job ending 24:30 wrote `2026-10-28T24:30` → 422. Fri after a job ending 25:00 wrote `2026-10-30T25:00` → 422.
  - **v26 fixes both:** they wrote `2026-10-29T00:30:00.000Z` and `2026-10-31T01:00:00.000Z`. The job reads back on the right day.
  - **Same as v25 for normal slots:** 6:30 pm, empty morning 8:30, picked 10:00 and picked 5:00 pm match v25 exactly.
  - **Rollover edge cases:** month (Oct 31 → Nov 1), year (Dec 31 → Jan 1) and Feb 28 + 24:00 → Mar 1.
  - All 6 writes were valid and there were no console errors. The v25 suite passes on v26.
- **Still open (a flow question for Stephen):** a job pushed past midnight now saves, but it lands at 12:30 am the next day (or on a Saturday from a Friday). A better flow would warn when "Next open" goes past the end of the day, or move the job to the next workday's morning.
