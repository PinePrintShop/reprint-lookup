# Seps (`seps.html`)

The art department's separation queue: imprints that need a sep (separation) file, inks and a separator before the screen room can image them, grouped by print date. A desktop app (wide screen first), also works on an iPad or phone.

## What it does
- **Queue:** imprints from Airtable (Imprints table) whose print date is in the last 14 / next 60 days (or that were created in the last 14 days), are in an active order status and aren't sep'd yet. Embroidery, patches and other non-sep types are skipped. Grouped by print date, late ones first, then by order; "No print date" last.
  - Each job shows the imprint ID, proof thumbnail, design, location and type, screens (or qty on Supacolor / Decopress transfers), who claimed it, and tags (Repeat, sep file, ink coverage).
  - An open job shows the proof, Imprint Type, the previous run (on repeats), the sep file, separator, ink coverage (bandanas), inks (bases, slots, search, PDF scan, drag to reorder) and print notes.
  - Repeats fill the sep file, inks and notes from the previous run on screen; they're saved with *Mark sep'd*.
- **Filters:** To sep · No sep file · Repeats · Sep'd (today or the last workday). Search by imprint ID, order # or customer.
- **Calendar:** read-only look-ahead by print date, Mon–Fri, 1–4 weeks. Tap a job to open it in the queue.
- **Writes to Airtable:**
  - Imprints: Sep'd, Sep URL, Separator, Print Notes, Inks (links and order), Imprint Type, Ink Coverage. Supacolor / Decopress *Order placed* writes Sep'd + Screens Burned + Cost in one PATCH (undo clears all three).
  - Inks: creates new Inks (a typed Pantone or custom ink, or a TBA slot).
- The Airtable token comes from `pine_at_key` in the browser, the same as the other apps. `?practice=1` fakes every write.

## 2026-10-15 · v35
**Why:** move Seps to Pine style v2 and the page kit, build it for wide desktop screens, add self-update and practice mode, and fix the audit and triage bugs.
- **Pine style v2 + page kit:**
  - `pine-style-v2.css` and Poppins. Only black, white, cream and yellow; red only for late print dates and failed saves. Nothing under 12px; buttons and chips at least 44px.
  - The black bar: logo square, SEPS, version, practice pill, Queue / Calendar views, Refresh, ⚙ (token + practice). The full-page token box and the preview banner are gone.
  - One filter row: search, the four filter chips with counts, and the week range (Calendar only).
  - Jobs are kit list cards: imprint ID badge + proof thumbnail, design over location · type, Screens (Qty on transfers), claim, and tags on row 2. Dates are page heads ("TODAY · Thu, Oct 15", "2 DAYS AGO"); the order is a quiet line above its jobs. The collapsible order bands are gone.
  - Ink types are cream tags. The previous run is a black button (was amber).
- **Desktop first:** full width. At 1400px and wider: two panes, queue on the left and the picked job on the right (proof beside the controls), each with its own scroll; ↑/↓ move between jobs. Below that, jobs open in place, one at a time.
- **Flow:**
  - One yellow button per job: *Mark sep'd* (or the cost and *Order placed* on Supacolor / Decopress), kept in view at the bottom of the open job. Marking a job sep'd moves to the next one on wide screens.
  - Separator and ink coverage are one-tap buttons (tap the chosen one again to clear) instead of a dropdown.
  - A job opened low on an iPad or phone scrolls up so its controls show; the phone proof is shorter. Calendar jumps stop below the bar.
  - Typed print notes are saved before the list redraws (search, filter, claim), not lost.
- **Self-update:** `pine-update.js` with `data-link="seps.html"`, Refresh checks for a new version, the version shows in the bar. Busy while saving, typing, the ⚙ menu or proof is open, a link box is open, a search is typed, or a job is open in place.
- **Practice mode:** `?practice=1` or the ⚙ switch. Every Airtable write (Sep'd, separator, link, notes, inks, type, coverage, cost) works on screen and sends nothing; the toasts say "practice, not saved".
- **Fixes:**
  - Today's group said "Tomorrow": the print date was taken at noon and today at midnight, so today rounded to +1 day.
  - Grey "?" ink swatches for bases, bare Pantone numbers and named colors, and the ink's Display Hex was ignored. Inks with no known color show an empty dashed swatch.
  - A failed Sep'd save removed the job anyway, and other failed saves still flashed "saved". Now the job stays (the button comes back) and the toast says it wasn't saved; failed separator, coverage and cost saves put the old value back.
  - Double taps on *Mark sep'd* / *Order placed* could flip Airtable back while the card vanished; the button now waits for Airtable ("Saving…").
  - Double-tapping *+ Add slot* made orphan TBA Inks records; two quick ink adds overwrote each other. Ink writes for a job now run one at a time.
  - An undone job no longer shows "Sep'd" on the calendar.
- **Same Airtable reads and writes as v34** (PATCH / POST bodies compared in the test).
- **Tested** (Playwright, mocked Airtable, made-up customers): 1920×1080, 1440×900, 1024×768, 768×1024, 390×844.
  - Live, compared with v34 step by step (26 flows, all identical): Mark sep'd on a repeat (seeded file, inks and notes in one PATCH), separator set and clear, link and replace sep file, notes, bases on/off, TBA slot, ink search add, new ink, drag reorder, ink remove, type, cost, Order placed and its undo, coverage set and clear, card claim and release, undo on the Sep'd tab.
  - Failed save: the job stays and the toast says "Not saved". Double taps: one write. Practice: the same flows, 0 writes. Self-update: moves to the new version when idle, shows "Update now" when busy.
  - No page errors, no text under 12px, no sideways scroll, at most one yellow main button per screen.

## 2026-10-15 · v36: the mockup is the focus on desktop
**Stephen** (screenshot of v35 on a wide screen): "can we try and get a focus on the mockup and enlarge it maybe by reducing the left side? open to ideas to just make that mockup fuller"
- **At 1400px and wider:**
  - **Narrower list:** 380–440px, was 560–640. On a list card the Claim button moved to the tag row, so the design name gets the full width and doesn't wrap.
  - **Bigger proof:** about 60% of the open job, was 40%. It stays in view and fills the height of the pane.
  - **Sharper proof:** it loads Airtable's full-size image. Before, it used the 512px thumbnail, which would blur when shown bigger.
  - **Hide list:** a "Hide list" button in the filter row gives the open job the whole width. The choice is remembered on this computer, and ↑/↓ still move between jobs.
- **Proof size, landscape proof sheet:**

  | Screen width | v35 | v36 | v36, list hidden |
  |---|---|---|---|
  | 2000px | 496×383 | 855×661 | about 915×707 |
  | 1440px | 272×210 | 506×391 | about 785×607 |
- The proof is capped at the height left under the job header, so the whole sheet shows without scrolling.
- **Below 1400px** (iPad, phone): no change.
- **Tested with mocked Airtable:**
  - The 26 v35 flows send the same writes on v36, and practice mode sends 0.
  - The Hide list choice is still there after a reload.
  - No page errors, no text under 12px and no sideways scroll at 2000, 1440, 1024 or 390.

## 2026-10-15 · v37: list cards fixed; dragging an ink scrolls the job
**Stephen** sent a screenshot where "✓ ORDERED / ✓ SEP FILE" sat on top of "WHITNEY ✕". He also said: "the pantone cards are hard to move around like if I try to scroll up it doesn't move the screen and I have to move them one at a time instead of taking the lowest and moving it to the top".
- **List cards on wide screens:**
  - **Cause:** in v36 the claim shared the tag row, which squeezed the tags into about 55px, so they spilled over the claim tag.
  - **Now:** the claim (+ Claim, or a name with ✕) gets its own row under the tags, on the right.
- **Dragging an ink:**
  - Hold it within about 90px of the top or bottom of the job and the job scrolls. The nearer the edge, the faster it scrolls.
  - The bottom edge counts as the top of the Mark sep'd bar, which used to cover it.
  - Works in the right pane on wide screens and on the page itself on smaller screens.
  - The lowest ink can now go straight to the top in one drag.
- **Tested:**
  - Comparing v36 and v37, a drag from the bottom ink to the top sends the same single write.
  - The card was screenshotted before and after.

## Ideas not built yet
- Jobs with no print date drop off 14 days after they were created (the load window), even if they still need a sep.
- On a phone the kit card puts Screens and *+ Claim* on separate rows, so cards are tall.
