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

## v121 — phone width fix (Oct 3)
- **Bug:** once heads were set, the one-line heads summary (`white-space:nowrap`) gave the Now panel a huge minimum width. On the phone the page laid out ~680px wide, so it slid sideways and the header got cut off. Reported from Stephen's iPhone; reproduced on a 390px viewport.
- **Fix:**
  - `min-width:0` down the Now panel chain.
  - The heads summary wraps to 2 lines.
  - The phone work view clamps to `100vw`.
- iPad and desktop layouts are unchanged (re-measured).

## v122 — stale paused jobs + full ink names (Oct 5)
**XMPLR 10647-A showed up on Monday**
- Its Airtable record has Run Started ✓ and Run Finished ✗. It was printed Sep 3 (RUN COMPLETE 2:09 PM), then **reopened** with "Undo mark-complete" at 3:44 PM to adjust the times, and never completed again.
- The press iPad still had that paused state saved locally. v120's "a live job always loads" brought it back.
- v122 only brings back a live job scheduled in the last 4 days (covers a weekend) that isn't finished. Older local state is dropped.
- **Airtable data:** 93 imprints have Run Started ✓ / Run Finished ✗ with a start more than 3 days ago (most are old). They don't show in the app, but they skew reporting. Cleanup is pending Stephen's OK.

**Ink names in full:** the swatch row wraps long names (it was "Red Ru…"), and the heads summary shows every head (no 2-line clamp).

## v123 — clock kept running on a finished job (Oct 5)
**What happened:** Poudre Valley 10836-A showed ✓ Complete, but the big clock read 5:09:11 and was still counting from "Started 8:32 AM". Setup and Run both read 0:00:00.
- The log shows the press iPad ran it from 8:32 to 9:32 (Run 60m 06s) and finished it.
- The screen with the ticking clock was a computer that had opened the job mid-run. It saved "running since 8:32" locally and never learned the job was finished: v104's rebuild-from-Airtable only runs when there's no local state, and good local state always won.
- The card showed Complete (from Run Finished), but the clock and summary came from that stale local state.

**Fix:** after every load or refresh, if a job is Run Finished in Airtable but this device still has it as live (setup / run / paused / fix), Airtable wins.
- The local timer is dropped.
- The Done summary (setup and run time) is rebuilt from the job's log.
- Split-press jobs are skipped; they have their own per-press done check.

**Tests (mock):** the same scenario in v122 shows the clock ticking at 5:00:07 → 5:00:09 with Setup/Run 0:00:00. v123 shows the clock stopped at 1:00:07, Setup 0:00:05, Run 1:00:07. The full v122 flow test gives the same result on v123.

## v124 — "Get ready · next up" card (Oct 5)
- **What it is:** while the press is running or paused, the empty middle column shows the **next job in the Up next list**, so the crew can stage while the press runs: proof thumbnail, customer, order #, pcs, screen count, location, garment, inks (swatch, Pantone and type, in print order) and the job's print notes.
- **Follows the Up next order:** moving a job up or down on the right updates the card right away. With nothing else queued, it says "Nothing else queued on this press."
- It isn't shown in idle, setup, review or done; those screens already fill the column.
- Inks use the same lookup and colors as the main swatch row. If a job has no linked inks, the ink names show as chips.
- **Tests (mock, practice):**
  - Desktop, landscape and portrait: the card is in run, not in idle.
  - Moving the next job down switches the card to the job after it.
  - No overflow and no errors.

## v125 — Get ready card, shorter (Oct 5)
- The header is just **"Get ready"**. "· next up" and "follows Up next" repeated the Up next column next to it.
- With nothing left in the queue it says **"Last job — nothing to stage."**

## v126 — "Catch it →" for Embroidery and Heat press (Oct 14)
- Stephen: Embroidery and Heat press run their machines and catch their own work, both on desktops.
- Catching stays one app; Operator now links straight into it.
- **When a Tajima or Heat Press job is marked complete** (✓ Complete or End Run), a pop-up asks **"Catch it now?"**: "Catch it →" or "Later — it stays under Done today".
- **Catch it →** opens Catching in its own browser tab (`pine-catching.html?press=em|ht&job=<imprint id>&from=operator`). It opens on that exact job, with only that press's tab and a **← Operator** button back. Practice carries over.
- **Done today rows** on Tajima and Heat Press get a yellow **🧺 Catch it** button, for counting later. The name on a done row that's also the current job is readable now.
- Presses 1/2 and Flatstock don't get the prompt; Catching iPads catch those. Split jobs don't either.
- **Self-update (`pine-update.js`):** Operator now moves to new versions by itself whenever nothing is in setup or a run, and no pop-up is open. Refresh also checks. The version was already in the header (v126).
- **Tested** with mocked Airtable (practice):
  - Heat press complete shows the prompt, and Catch it opens the right link.
  - The Done row has the button, and it opens the same link.
  - P1 complete shows no prompt.
  - pineBusy is false when idle.
  - No errors.

## v127 — Pine style v2 (Oct 15)
- **Look:** Pine style v2 (`pine-style-v2.css`, Poppins). Only black, white, cream and 107 yellow; red only for errors. The press badges use the Schedule press colors (P1 teal, P2 ochre, Embroidery orange, Heat red, Flatstock denim).
- **Same top bar as the other apps** on every screen: Pine logo, OPERATOR, version (`v127`, from `pine-update.js`) and the practice pill. The floating practice bar at the bottom is gone; it covered the machine list. Run mode and head setup also show the practice pill now.
- **Work bar, fewer buttons:** the press badge and name are one tap to switch machines (was a separate "⇄ Switch"). The crew names are one tap to change crew (was a separate "Change crew").
- **One yellow main button per screen**, 56px tall on the floor: Start Setup, Stop Setup, Approved · Start Run, End Run (Resume when paused), Next. Fix Needed and Pause are cream. The heads button stays black.
- **Nothing under 12px** (tags were 8px, labels 9–10px). Touch targets are at least 44px: Up next ▲▼ (were 34×26), run-mode ✕ (was 24px), drop-ramp steppers, lightbox and close buttons, Hold to reopen.
- The order # is the black-and-yellow ID badge. The job name and the big timer are in Poppins.
- **Head setup** says "✓ Done" once, in the footer. The header's second "Done — back to run →" is gone, and it read wrong when setup was opened before a run. Hints are shorter.
- **Bugs fixed:**
  - Self-update could reload with head setup, a pop-up or the crew picker open (only setup/run phases counted as busy). It now also waits for pending head-settings saves, retries and log writes, and for a focused text box.
  - On a phone the Start/End buttons were meant to stick to the bottom, but never did: the card's `overflow:hidden` trapped them. They stick now.
  - The Undo toast covered the "Next: …" button after End Run in run mode, and the Done button in head setup. In those screens it sits at the top now.
  - A Done-today row that is also the open job had white text on a light row.
  - iPad portrait: the Up next ▲▼ sit side by side, and the two-column list no longer runs off the right edge.
- **Not changed:** Airtable reads and writes (same field writes as v126).
- **Tested** with mocked Airtable:
  - Practice and live, at 1024×768, 768×1024, 390×844 and 1440 desktop: machine pick → crew → setup ask → setup → review → run mode → pause + reason → resume → End Run → Next, then the Done summary, head setup (empty head, color picker, detail sheet), and Heat press complete + Catch it.
  - Live mode sends the same 18 writes as v126, apart from timestamps. Practice sends none. No page errors, no horizontal scroll, no text under 12px.
  - Self-update against a mocked newer link: idle reloads into it. With head setup open, or a log write in flight, it shows the "New version" bar instead.

## v128 — Pine page kit (Oct 15)
- **One bar on every screen, in kit order:**
  - Pine mark, OPERATOR, version, then a yellow **Practice** tag.
  - This press (badge + name, tap to switch) and the crew (tap to change) are the app's own controls (`.p-bar-views`).
  - Then **↻ Refresh** and **⚙**. Refresh moved out of the page and still checks for a new version.
  - The work screen no longer draws its own bar. The clock is gone; the iPad shows the time.
- **⚙ menu** (`.p-menu`):
  - Airtable token: type it in and Save. The old gear only reloaded the page.
  - Practice: Start practice, or the jobs-from day picker, Reset practice and Leave practice. The bar is no longer crowded with practice controls.
- **Machine picker uses kit list cards** (`.p-lc`): press badge · name + who's checked in · Jobs count · ›, with a status tag on row 2. Paused / setup done is yellow, fix needed is red, idle is cream. The whole card is one tap, at least 88px tall.
- **Up next and Done today use kit rows** (`.p-list` / `.p-row`, at least 56px): the job you're on gets the yellow wash, the next job gets a "Next" tag, and Done rows are greyed.
  - **"↑ Next" replaces the ▲▼ pair.** One 44px button makes that job the next one, so rows are about half as tall. Any order can still be built (tap ↑ Next in reverse order). The order is kept on the iPad, as before.
  - Done rows: Catch it (black, no longer yellow) and Hold to reopen.
- **Tags:**
  - Facts are cream (`.p-tag-soft`): pcs, screens, location, ink type, estimated time. Ink type (Plastisol, Discharge…) and the split total used to be yellow.
  - Yellow only means "needs you" (Now, Paused, Setup done, Practice).
  - Flash heads, the "adjusted" drop ramp and flash chips are no longer yellow.
- Self-update also waits while the ⚙ menu is open.
- **Tested** with mocked Airtable at 1024×768, 768×1024 and 390×844:
  - Live mode sends the same 18 writes as v127, apart from timestamps. Practice sends none. No page errors.
  - ↑ Next reorders the list. The ⚙ menu opens, and closes on an outside tap.
  - Self-update: idle reloads into the new version; with head setup open or a log write in flight, it shows the "New version" bar.

## v129 — Done without a timer, takedown timer, Pine confirm box (Oct 19)
- **"✓ Done, no timer":** a job nobody timed (often embroidery) could never be finished, so it sat in Up next forever.
  - It's a small underlined link under Start Setup. It only shows while the job has never been timed: no setup or run on this iPad, and Setup Started / Run Started not ticked in Airtable. Once a timer starts it's gone, so it can't be hit on a timed job.
  - It asks first ("Finish without a timer?" → Mark done).
  - It writes what a normal finish writes: **Run Finished** ✓ (split jobs: once both presses are done) and a `COMPLETED | No timer` line in the log. It writes **no time**: Run Started / Setup Started stay unticked and the log line has no duration, so the job adds nothing to setup or run averages.
  - The Done screen says "Done · no timer" and shows pieces only, not 0:00:00. Undo puts the job back to Start Setup.
- **Takedown timer** (to check the 14 min/screen we're testing for 2027 pricing):
  - On the Done screen (run mode and the job screen): **⏱ Start takedown**, then a clock with **■ Stop**. If the crew moves to the next job, a slim "Takedown · job · clock · Stop" strip stays at the top. Starting the next job's setup stops and saves it by itself.
  - It saves minutes (1 decimal) on the job's Imprint, plus a `TAKEDOWN | 12m 30s` log line. That's the same pattern as setup, which is logged as `SETUP COMPLETE | Xm YYs` and timed in Airtable by the Setup Started / Setup Finished ticks (Setup Duration Actual → Setup Time / Screen).
  - Under 20 seconds isn't saved. Over 2 hours asks first. If it was left running past 2 hours when the next setup starts, it isn't saved.
  - **Hidden for now:** there's no takedown field in Airtable. It needs a **Number** field on **Imprints**, named **"Takedown Minutes"** (1 decimal). Paste its field id into `F.takedownMin` (now `PENDING_TAKEDOWN_MIN`) in the next version and the timer appears. Then a "Takedown / Screen" formula ({Takedown Minutes} / {Screen Count}) would sit next to Setup Time / Screen.
- **Pine confirm box:** the three browser `confirm()` pop-ups are now the shared Pine box (`pine-confirm.js`, big buttons): Reset practice, Remove screen card (red, it deletes) and "Use another run's head settings?". Self-update also waits while the box is open.
- **Not changed:** the normal timed flow sends the same writes as v128 (checked side by side).
- **Tested** with mocked Airtable at 1180×820:
  - Done, no timer: Cancel writes nothing. Mark done sends exactly `{Run Finished: true}` plus the `COMPLETED | No timer` log line, with no Setup/Run Started. It's gone once setup starts, and Undo brings it back.
  - Takedown: hidden with the field PENDING. With a test field id: 12.5 min saved to the field plus the log line, and it auto-saves when the next setup starts.
  - Practice: no writes at all, and the Reset practice box shows.
  - No JS errors.

## v130 — the standard Pine top bar (2026-10-20)
- **Why.** Stephen: "review ... the first ones that we did with the new brand colors to make sure to clean up the top bar that we did for the last few". Reference: Line Item Review v35, Shipping v11, Seps v45, and Catching v169 (built at the same time).
- **⚙ size:** `#gearBtn{font-size:20px}` is gone, so ⚙ is the kit's 44px button with 14px/800 text, as in the other apps.
- **Phone bar 70px → 64px.** The cause: the empty press/crew slot `<nav class="p-bar-views" hidden>` still showed, because the kit's `.p-bar-views{display:flex}` beats the `hidden` attribute. Under 900px the kit puts the views on their own row, so an empty 2px row plus the row gap was added under the bar. `#pBarViews[hidden]{display:none!important}` fixes it.
- **This press + crew** (work screen) now sit in the kit's dark views pill, the same as Catching's press tabs.
  - Before, they were two bordered boxes on a clear background, and the press had a full-height color block.
  - Now: the dark pill (rgba white .1, 4px padding) with 44px pill buttons.
  - The press is the selected one: yellow, with its press color as a 12px dot (black ring), then the name and ⇄. The crew button is plain white text with ✎.
  - Taps and what they open haven't changed.
  - Above 900px a long crew list shortens with "…" instead of wrapping the bar onto two rows. v129 wrapped to 114px at 1000 wide with four long names; v130 stays 64px.
- **Dead CSS removed:**
  - **The old work-screen header:** `#wkHead` and its `.wk-head*` rules, plus `.wk-press`, `.wk-btn`, `.wk-right`, `.wk-clock`, `.wk-ver`, `.wk-gear` and `.wk-prac`.
  - **The old bar pieces:** the `.prac-pill` rules, `.pb-gear` and `.pb-clock`.
  - **The hidden practice bar:** the `#practiceBar` div (`display:none!important`, kept only for its day picker; the ⚙ menu has its own) and its CSS.
  - **Bar display rules that cancelled each other:** `body.on-work #pBar{display:none}` / `{display:flex}`.
  - **Old views and phone rules:** the old `.op-views` overrides, the phone `.p-bar-app{font-size:16px}` at 640px (the kit does this at 420px, the same as the other apps), and the phone `.wk-crew` rules that made the crew button a full-width line.
  - Checked first that no script uses any of them. The hidden old `.topbar` (Operator View pill, clock, Back) is still there because the script still updates its elements; removing it needs a JS change, so it's left for later.
- Self-update, pineBusy, practice and the 56px floor buttons are unchanged.
- **Tested** (Playwright, mocked Airtable):
  - Bar at 1180×820, 820×1180 and 390, on the machine picker and the work screen, normal and practice.
    - 64px everywhere on the machine picker, and on the work screen at 1180.
    - At 820 and 390 the work screen's press/crew pill moves to its own row (120px), as in every kit app.
    - At 390 in practice, Refresh and ⚙ wrap, the same as the reference apps (the kit's layout).
  - Matches Catching v169 to the pixel.
  - No console errors. Practice made 0 writes.
  - A computed-style comparison outside the bar (v129 vs v130) showed no change apart from the bar height.
  - The v126 catch-prompt test still passes: practice 0 writes, live 4, the same as v129.

## 2026-10-22 · v131: "+ Add person" on the crew check-in
Stephen asked how many bandanas TeeJ has printed. My first count used the old Imprints single-select (fldOsVUlfs3U847oO), which nothing has filled since January. The real record has been there since v29:
- **Where crew is recorded:** every job links its Press Ops to Imprints › Operator Link (fld5pdD7bdND4CR8h) and its QC to Imprints › Quality Control (fldRp5koS5QTfy5XD), both linking to the Operators table tblQm9hy2WZCx9jnd. Line Items › Operators (fldm3rHQysBU7TPQw) gets the same links.
- **For reports, use those links, not the old select.** Via the link, TJ's finished bandana jobs come to about 195,000 bandanas: 2023 7.4k · 2024 49.9k · 2025 63.6k · 2026 74.1k.

Stephen: "Can we also have an add person button that writes to Airtable so we can keep accurate track if we have a seasonal person on QC".
- **The button:** every role on the check-in screen (Press Ops, Quality Control) has a dashed **+ Add person** chip. It opens a name box with Add and Cancel; buttons are 56px tall.
- **What Add does:** creates one Operators record, `{Operator (fldv4VQ7tshYKREn0): name}` with typecast so a new name becomes a select option. The person shows on every role's list straight away and is selected in the role they were added to. Earlier picks are kept.
- **Same name twice:** a name already on the list (any case) just selects that person; no duplicate record.
- **Practice mode:** fakes the save (0 real POSTs).
- **Tests:** 20/20, live and practice (`scratchpad/op131/t.js`).

## 2026-10-22 · v132: Andrew hidden from the check-in
Stephen: "Andrew is no longer with us and Annabelle is the ink lead".
- **Hidden list:** Andrew is now hidden from the crew check-in, like Ron and Gar. The list is in one place, `HIDDEN_CREW = ['Ron','Gar','Andrew']`, and names are compared trimmed.
- **Records kept:** the Operators records stay in Airtable for history. Andrew had no jobs linked.
- **Annabelle stays on the list** so she can be added if she helps on a press. She has no jobs linked yet.
- **Tests:** 22/22 (`scratchpad/op131/t132.js`).
