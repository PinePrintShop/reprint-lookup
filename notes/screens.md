# Screens (`screens.html`)

The screen room's queue: imprints that are sep'd and waiting to be imaged (burned onto screens), grouped by print date. A desktop app (wide screen first), also works on an iPad or phone.

## What it does
- **Queue:** imprints from Airtable (Imprints table) whose print date is in the last 14 / next 60 days, are in an active order status, have a proof, and are sep'd but not yet imaged. Grouped by print date, late ones first; "No print date" last.
  - Each imprint shows the proof thumbnail, imprint ID, design, customer, order #, print type, screens and quantity, plus tags (No sep file, Repeat, previous run) and the ink swatches in burn order.
  - Open an imprint to see the proof, the sep file, the inks in burn order (drag to reorder), and print notes.
- **Filters:** To image · No sep file · Repeats · Imaged (imaged today or the previous workday, from the Burned timestamp field). Search by imprint ID, order #, customer or design.
- **Calendar:** read-only look-ahead of the same imprints by print date, Mon–Fri, 1–4 weeks. Tap one to open it in the queue.
- **Writes to Airtable** (all on the Imprints table):
  - Burned (the *Imaged* button; *Undo imaged* puts it back).
  - Sep URL (*Link sep file*, only when none is linked).
  - Print Notes (saved when you leave the box).
  - Inks (new order after a drag = burn order).
- Airtable token comes from `pine_at_key` in the browser, the same as the other apps. `?practice=1` fakes every write.

## 2026-10-15 · v22
**Why:** move Screens to Pine style v2 and the page kit, add self-update and practice mode, and fix the two audit bugs.
- **Pine style v2 + page kit:**
  - `pine-style-v2.css` and Poppins replace `pine-design-v1.css`. Only black, white, cream and yellow; red only for late print dates and failed saves. Nothing under 12px; buttons and chips at least 44px.
  - The black bar: logo square, SCREENS, version, practice pill, Queue / Calendar views, Refresh, ⚙ (token + practice). The separate token page and preview banner are gone.
  - One filter row: search, the four filter chips, and the calendar's week picker (Calendar only).
  - Imprints are kit list cards: thumbnail + ID badge, design over customer · #order · type, Screens / Qty, tags and ink swatches on row 2. Date groups are page heads ("TODAY · THU, OCT 15", 2 imprints · 5 screens). The per-order header bands are gone (customer and order # are on each card).
  - Ink types are one cream tag (they were green / orange / purple). Inks are numbered 1, 2, 3… in burn order.
- **Desktop first:** full width. At 1400px and wider: two panes, queue on the left and the picked imprint on the right, each with its own scroll; ↑/↓ move between imprints. Below that, imprints open in place, one at a time. Calendar shows two weeks by default on wide screens.
- **Flow:**
  - *Imaged* is a yellow button on the open imprint (was a small checkbox inside the panel). The imprint leaves the queue, the next one opens, and the toast has *Undo*.
  - The proof thumbnail opens the full proof; previous-run proofs are buttons under the proof.
- **Self-update:** `pine-update.js` with `data-link="screens.html"`, Refresh checks for a new version, the version shows in the bar. Busy while saving, typing, the ⚙ menu or proof is open, a search is typed, or an imprint is open in place.
- **Practice mode:** `?practice=1` or the ⚙ switch. Imaged, sep link, print notes and burn order all work on screen and send nothing.
- **Fixes:**
  - Today's group said "Tomorrow" (and tomorrow showed a plain date): the print date was taken at noon and today at midnight, so today rounded to +1 day. Late groups also said "2d ago" for 3 days.
  - The imprint ID wrapped onto two lines on the iPad: it's now the one-line ID badge.
  - After *Imaged* the open detail panel stayed on screen without its card. Now the list redraws.
  - A failed Imaged save left the imprint marked; now it comes back and the toast says it wasn't saved. Failed notes no longer flash "saved".
  - Print notes being typed are saved before the list redraws (v21 could drop them).
  - The grey "?" swatch for inks with no color is an empty dashed swatch.
- **Same Airtable reads and writes as v21** (PATCH bodies compared in the test).
- **Tested** (Playwright, mocked Airtable, made-up customers): 1440×900, 1024×768, 768×1024, 390×844. Live: Imaged, Undo, link sep file, print notes, ink drag, Undo imaged on the Imaged tab; the 4 shared PATCH bodies match v21 exactly. Practice: same flows, 0 writes. Failed save: the imprint comes back. No token: the ⚙ menu opens. No page errors, no text under 12px, no sideways scroll.

## 2026-10-15 · v23: the mockup is the focus on desktop
**Why:** Stephen, looking at the desktop two-pane view (Seps, and "same with Screens since they are similar"): "can we try and get a focus on the mockup and enlarge it maybe by reducing the left side? open to ideas to just make that mockup fuller". On a wide screen the queue took ~640px and the proof was only ~35–40% of the open imprint, inside a white frame. Same design as Seps v36.
- **Narrower queue** (two panes, 1400px and wider): 380–440px instead of the kit's 560–640px (overridden in the app's own CSS, the kit is unchanged). List cards are re-laid for that width: proof thumb with the ID badge under it on the left, design / customer · #order · type on the right with Screens · Qty under them, tags and inks below. Long titles wrap; nothing is cut off.
- **Bigger proof:** the proof takes ~60% of the open imprint (inks / sep file / notes get the rest, at least 360px). It has no white frame, sits flush left, stays put while the right side scrolls, and is as tall as the pane allows under the imprint's header, so the whole sheet shows without scrolling. On desktop it shows Airtable's full-size thumbnail (the 512px one looked soft when enlarged). Tap / click still opens the full proof.
- **Hide list / Show list:** a plain button next to *Imaged* on the open imprint folds the queue away so the imprint (and its proof) gets the full width. Remembered on this computer (`screens_list_off` in the browser). ↑/↓ still move between imprints with the list hidden, and *Imaged* still opens the next one.
- Proof size (made-up 1650×1275 landscape proof sheet / 1275×1650 portrait), v22 → v23:
  - 1440×900: 258×199 → 516×399 (4× the area); portrait 258×334 → 450×582.
  - 1920×1080: 440×340 → 814×629 (3.4×); portrait 440×570 → 589×762. List hidden: 919×710.
  - 2000×1000: 471×364 → 815×630 (3×); portrait 471×609 → 527×682.
- **iPad and phone (below 1400px) unchanged** (screenshots pixel-identical to v22 at 1024, 768, 390 and 1399 wide). Same Airtable reads and writes as v22.
- **Tested** (Playwright, mocked Airtable, made-up customers) at 1440×900, 1920×1080, 2000×1000, 1024×768, 390×844: Imaged, Undo, link sep file, print notes, ink drag, Undo imaged send the same PATCH bodies as v22 at every size; practice 0 writes; failed save puts the imprint back; list toggle hides / shows, survives a reload, works when browser storage is blocked; ↑/↓ with the list hidden; calendar jump; proof viewer opens. No page errors, no text under 12px, no sideways scroll.
