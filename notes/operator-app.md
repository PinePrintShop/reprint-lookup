# Operator app — bugs + flow (Oct 2026)

## Fixed in v114
- **End Run "did nothing"**: the "Add head settings first?" prompt (Press 1/2/ROQ jobs with no head settings) opened at z-index 500, *behind* run mode (9000). Now on top; "Add head settings" leaves run mode first and opens the right press (it passed the machine id, so 0 heads rendered). Head check time-boxed to 5s after the iPad wakes.
- **Crew reset on refresh**: crew is saved per machine for the day (`pine_op_crew`).
- **Page reloading by itself**: every press-view render loaded a new proof PDF and never freed the old one → Safari memory pressure → tab reload. Old PDF is destroyed now.
- Log lines (Additional Notes) written one at a time per job (read-append-PATCH used to race and drop lines).
- Airtable 429 / dropped connection retried with backoff (api, apiPatch, apiPatchAny).
- Status flag writes (Setup/Run Started/Finished, start/end overrides, operator links) show a red toast on failure instead of failing silently.
- End Run only from run/paused, once (a double tap logged a second RUN COMPLETE with 0 run time).
- Running timers are saved every 30s, so an overnight/stale reload freezes at the last tick, not at Start Run.
- Undo after End Run puts the press back in Paused (it stayed "done" with no way to finish).
- saveState can't throw.

## Head-settings bugs (all fixed in v117, see below)
1. **Head values shift onto the wrong heads**: head-setting lookups drop blanks, so a Flash head (blank color/PSI/…) shifts every later head's values by one; editing then writes them back shifted. Fix: read values from the Head Settings records by id (like `enrichHeadsFromHsRecords`) for every field.
2. **Head-setting save race / duplicates**: `origCards` reset to current cards after the awaits (edits during a save are lost); a half-failed save re-creates records. Snapshot at save start; treat any card with `hsRecId` as existing.
3. **Press Setup refresh** can overwrite edits made during its fetch; `F.hsAngle` isn't loaded so the angle can be blanked.
4. Clearing a head's notes / switching to Flash doesn't clear old values; queued saves link to the global `activeFmJob`.
5. Opening another job on the same press wipes the first job's in-progress state (one state slot per machine).
6. No pagination on operators / today's jobs / order issues; lightbox retry loop on non-expiry PDF errors.

## iPad layout (measured at 1180×820 landscape and 820×1180 portrait)
- Machines, crew, press view (every phase), run mode, Press Setup fit without scrolling with test data.
- Job list scrolls in landscape once there are 6+ jobs (61px with 6).
- Real jobs add colorway proofs, notes and head previews — need a screenshot of the screens that scroll on the iPads to pin those down.

## Proposed flow (mockup: `pine-operator-mockup.html`, sample data)
- **The iPad knows its press**: picked once, then it opens straight to it (with a small "switch").
- **Crew in the header**, set once per shift ("Alex, Sam · QC Jo · Change"), kept through refresh/sleep.
- **One screen per press**, no scrolling (landscape and portrait):
  - **Left, Now**: the current job (big mockup, pieces/screens/location/inks, head-settings status, notes), a stepper Setup → Approve → Run → Done, the timer, and **one big yellow next-step button**. Secondary actions (Fix needed, Pause) sit beside it.
  - **Right, Up next**: today's queue in order, NEXT highlighted, "+ N more", and Done today (jobs + pieces).
- **Fewer taps**: "Setup done" → "Approved — start run ▸" opens the run screen in one tap (Fix needed is the alternative).
- **Head settings at Start Setup** (when they're being set), never at End Run.
- **Run screen** as today (mockup, timer, Pause with reasons, End run); ✕ goes back to the press screen without stopping the run.
- **After End Run**, the summary (setup / run / pieces) stays in Now with "Next: 90002-A — start setup ▸".
- **One live job per press**: switching while a job is live asks to finish or pause first (fixes the "opening another job wipes progress" bug).
- **Picks up where it left off** after a reload/sleep (state + crew saved on the iPad).
- **One iPad per press** (confirmed Oct 3), so "the iPad knows its press" holds.
- **Works on all three sizes:**
  - **iPad:** landscape and portrait, no scrolling.
  - **Desktop:** the iPad layout, capped at 1500px wide.
  - **Phone:** one scrolling column. The progress bar, timer and main button are pinned to the bottom of the screen, and labels shorten ("✓ Approved ▸", "✗ Fix").

## v115 — new flow (Oct 3)
`pine-operator-v115.html`. v114 stays as the fallback.
- **The iPad remembers its press.** Once today's crew is set, it opens straight to the work screen. **⇄ Switch** in the header changes the machine. The crew shows in the header with **Change crew**, once per shift.
- **One work screen.** The job you're on is on the left: proof, then the facts / timer / buttons / head settings beside it. **Up next** is on the right.
  - iPad portrait: Up next is a 2-column strip under the job.
  - Phone: one column, with the buttons stuck to the bottom.
  - Desktop: capped width.
- **Up next is reorderable** with ▲▼. The order is kept on that iPad, per press, and it sets which job opens next. NOW and NEXT are tagged, and finished jobs go under "Done today" (hold to reopen).
- **Head settings are asked at Start Setup**, for jobs with none saved: "Start setup + set heads" / "Start setup". There's no nag at End Run or Mark complete.
- **Approved · Start Run** is one tap.
- **After End Run**, Done becomes **Next: X ▸**. The Done panel on the job also has the Next button.
- **One live job per press:**
  - Running: "Pause the run first".
  - Paused: confirm, and the job can be picked back up later (rebuilt from the log).
  - Setup / approved / fix: confirm with "Switch anyway".
- A log reopen (`REOPENED`) now rebuilds as Paused, not Done.
- Tested with mock data at 1180×820, 1024×768, 820×1180 and 1680×1000: no page scroll and no inner scroll with 6 jobs. Up next scrolls inside its own panel if a press has a lot of jobs.

## v116 — practice mode (Oct 3)
`pine-operator-v116.html?practice=1`. Without `?practice=1`, v116 is the same as v115.
- It reads **live Airtable data**, but every POST/PATCH/DELETE to Airtable is answered inside the browser with a fake success. Nothing reaches Airtable.
- What practice "saved" goes into a local overlay (`pine_practice_overlay`) and is merged back into what Airtable returns. So refresh, reload and reopen behave as if it really saved.
  - Server-side filters don't see practice saves; for example, a job finished in practice still comes back from the "today" query, but it shows as finished.
- Press, crew, timers and the Up next order use separate `pine_practice_op_*` keys, so practice can't disturb the real app on the same iPad. The Airtable token is shared.
- The yellow **Practice · nothing saves** pill is in the header, and **↺ Reset** clears all practice state.

## v117 — head settings fixed (Oct 3)
`pine-operator-v117.html`, built on v116, so `?practice=1` works too.
1. **Values on the wrong head:** confirmed on real data. On 10707-B (8 heads, with 3 flashes), Airtable's REST lookups drop blanks, so 5 colors / PSIs slid onto the first heads.
   - Fix: heads are now read straight from the Head Settings records by id: `fetchHsRecordsById`, `headFromHsRecord`, `headsFromHsLink`.
   - This applies on load (one batched read for all of today's jobs), when Press Setup opens, and in the previous-imprint pre-fill.
   - The lookup parse is only a fallback if that read fails.
2. **Save race / duplicates:** saves work from a snapshot, and only the snapshot is marked saved, so edits made during a save get saved next.
   - A card with a record id is always updated, never re-created.
   - Progress is recorded step by step, so a half-failed save retries without duplicates.
   - A delete that hits 404 counts as done.
3. **Refresh clobbering:** the Press Setup refresh is skipped while a save is pending, and its result is discarded if edits or a save happened during the fetch. The angle is read from the record.
4. **Values not clearing:** notes, stroke count and color order are always written, so clearing them clears Airtable. Flash/Stamp heads blank the print fields, and print heads blank the flash fields. The save links to the job being saved, not whatever job is open.
5. One state slot per press: handled by v115's one-live-job rule.
6. **Pagination and retries:**
   - Operators and today's jobs are paged.
   - The lightbox refreshes an expired link once instead of looping.
- **Same mock test on v116 vs v117**:
  - Heads shown: v116 wrong (shifted); v117 right.
  - Duplicate record after a failed save: v116 yes; v117 no.
  - Edit made during a save: v116 lost; v117 saved.
  - Edit made during a refresh: v116 lost; v117 kept.
  - Cleared note: v116 stayed in Airtable; v117 cleared.
- **Not done:** records saved by older versions after an operator edited shifted values may hold wrong values. No automatic cleanup; check jobs that have flash heads.

## v118 — practice day picker (Oct 3)
`pine-operator-v118.html`, which is v117 plus this. It only changes practice mode.
- In practice, the jobs come from the day picked in the yellow practice pill: Today or any of the next 14 days.
- With nothing picked, it uses today, or **the next day that has jobs** if today has none (e.g. on a weekend).
- `&day=YYYY-MM-DD` in the link picks a day too.
- The query matches `DATETIME_FORMAT({Scheduled Start Time},'YYYY-MM-DD')` to the day. Scheduled times are stored as shop-local clock times (08:30Z = 8:30 am).
- The live app still uses `{Is Today (Local)}`.

## v119 — practice jobs load more reliably (Oct 3)
v118 picked the practice day with a `DATETIME_FORMAT` filter and still showed no jobs on the real base.
v119 practice works like this:
- It loads today's jobs.
- If there are none, or a day is picked, it loads the upcoming scheduled jobs and groups them by date in the app. The filter is `IS_AFTER({Scheduled Start Time}, DATEADD(TODAY(),-2,'days'))`, the same syntax the live open-queue query already uses. Up to 4 pages.
- The practice pill shows what loaded ("23 jobs" / "no jobs that day") or the exact Airtable error.

Live mode is unchanged.

## v120 — bug sweep (Oct 3)
Three reviews (run flow, Press Setup, work screen/practice). Each fix was verified with a targeted mock test.

**Run flow**
- **Wrong job:** if the live job dropped off today's list (rescheduled or moved), Pause / End Run hit the next job.
  - Live jobs now always load by record id, and `activeJob()` never pairs a live timer with another job.
  - This also makes "pause today, resume tomorrow" work for Press 1/2.
- **Split jobs** ("Press 1 & 2 - SPLIT", one record on both presses):
  - Done is tracked per press.
  - Run Finished is only set once both presses have logged RUN COMPLETE.
  - The timer rebuild only reads that press's log lines.
- **Setup rebuild:** a stopped setup, a fix, or a teardown came back as a setup clock running for hours.
  - Stop Setup now logs `SETUP STOP`, and the rebuild understands SETUP STOP / FIX START / Tear Down / SETUP COMPLETE.
- **Late rebuild:** a rebuild finishing after the operator moved on can no longer pull the screen back to the old job.
- **Double taps:**
  - Phase guards on start/stop setup, approve, start run, pause and resume.
  - A 450ms lock after buttons change. A double tap on Stop Setup used to approve and start the run.
- **Undo:**
  - Undo in run mode refreshes the overlay to Paused (the stale "Complete / Next" was left up).
  - Reopen waits for its saves before rebuilding, so it no longer snaps back to Done.
  - A rebuilt Done shows real times.
- **Overnight:** a run frozen by the next-day reload logs an automatic RUN PAUSE.

**Press Setup**
- **Pre-fill from the previous run:**
  - It is saved even if nothing is edited.
  - It only runs after Airtable confirms the job has no heads, and never over existing cards.
  - Changing the donor asks first and deletes the records the old pre-fill made.
- **Removing a card:** removing another card while the detail sheet is open no longer moves edits to the wrong head.
- **Saving:**
  - The save queue is per job.
  - A failed save retries on its own (5s, 10s … up to 6 times).
  - The editing paths never fall back to the shifted lookups.
- **Dragging and colors:**
  - iPad drag: no callout or text select, and no scroll once a drag starts. Still needs a check on a device.
  - The same ink can go on two heads.

**Work screen / practice**
- A stale proof load can't destroy the current proof.
- The error banner clears on the next successful refresh.
- The lightbox opens on the page you were viewing.
- The practice day picker overrides `?day=`.

**Not done (low):**
- Drop-ramp saved only on Done.
- Practice completions vanish from the heat press / embroidery / flatstock open queue.
- `pine_op_order` is never pruned.
- Log writes aren't retried after a failure.
