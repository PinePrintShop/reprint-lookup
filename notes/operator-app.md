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

## Still to fix (needs real head-settings data to test)
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
