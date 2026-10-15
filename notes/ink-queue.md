# Ink Queue (`pine-ink-queue.html`)

The ink room's list of which inks to mix for upcoming jobs. Used on a desktop screen in the ink room.

## What it does
- **Reads** Imprints printing from 5 days ago to 14 days ahead, plus up to 120 unscheduled, not-ready imprints (the "No date" pipeline). Only orders from *Ordered - In Production* onward show. Non-ink work is skipped: embroidery, Supacolor, Decopress, patches/labels, finishing, heat and tag presses, and Size Tag locations.
- **Groups:**
  - On press today: all of today's ink jobs, ready or not.
  - One group per upcoming print day, with a working-day countdown.
  - No date (the pipeline).
  - Completed: ready jobs, kept for 5 days after they print so one can be reopened.
  - Inside each group, a slim line per order (customer, #order) with its imprint cards below.
  - Today and the next 3 days with jobs start open; later days, No date and Completed start closed. A day you open or close stays that way for the session.
- **Tightest runway:** working days until the nearest job that still needs ink. 4 is the benchmark.
- **Filters:** All · No inks · Reorders · No date, plus a search (customer, order #, imprint, design).
- **An open job shows** (two panes at 1100px+ since v99, with *Hide list*; the job doesn't scroll as a whole, only its inks column does):
  - its proofs, big, with a full-screen viewer
  - beside the proof, its inks: swatch, name, type, maker, updated date, the recipe as a list (*Edit recipe* to change it), Label, *Mixed today*, and Remove
  - Print notes and Ink notes, below the inks
  - Add ink (from the ink library or a new color), copy/paste colors between locations, and drag to reorder (holding an ink near the top or bottom edge scrolls)
  - *Fill from* the previous run, on reorders
- **Labels:** 4×2in Rollo labels as a PDF (one label per page, black on white), for one ink, all inks on a job, or any ink in the library (*Print a label*). Print settings: paper 4 × 2 in, scale 100% / Actual size, margins None.
- **Writes to Airtable:**
  - Imprints: Inks (links and order), Inks Ready, Print Notes, Ink Notes. Opening a reorder also saves the inks, notes and ink types filled in from the previous run.
  - Inks: Pantone Number and Ink Type (from the name), Recipe, Display Hex, Manufacturer, Last Updated. It also creates new Inks.
- **Reads the line item name** (Line Items › Line Item Reference) only when an open job has no proof.
- The Airtable token comes from `pine_at_key` in the browser, the same as the other apps. `?practice=1` fakes every write.

## 2026-10-15 · v99: the list shows all the cards, with bigger mockups
**Why:** Stephen: "thoughts on best ways to organize the left side of the Ink queue? should it be similar to the seps and screens and just show all the cards...maybe bigger mockups and not the pantones since those would be when they open the card and maybe it can get tighter on the left side to make even more room for the mockup and pantones".

- **List cards (two panes):**
  - The same layout as Seps and Screens: day heads, a slim order line (customer left, #order right), then the cards.
  - Each card has a bigger mockup on the left: 84×72 (v98: 40×40). It shows the whole proof with its aspect kept, so landscape proofs are readable.
  - Next to it: the ID badge and the design (up to 2 lines), then "Front · Press 1 · **144** pcs".
  - The ink chips are gone. There's **one status tag**:
    - *No inks*
    - *N to fill* (TBA slots)
    - *N inks* (the ink names are in its tooltip)
    - *✓ Ready*
  - There's also a small *Note* tag when the job has an ink note (the whole note is in its tooltip), and *Reorder*.
  - *Mark ready* left the list cards. It's in the open job's header, the screen's one yellow button. Completed reads "open one to reopen it".
  - Day countdown tags are shorter in the list ("1 work day"; the whole text is in the tooltip) and are cut with … rather than running out of the list.
- **A tighter list:** 280–320px (v98: 320–360). The open job gets that width.
- **Two panes from 1100px wide** (v98: 1400), the same as Screens v26 and Seps v39. 1280 and 1366 laptops now get the static mockup and their own inks column.
  - From 1100 to 1399px the gutters are 16px and the mockup and inks sit side by side from a 640px job.
  - On narrow inks columns, *All labels* is just the 🏷 icon, so the toolbar stays on one row. At 1100–1279 the search box is 220px, so the filter chips and *Hide list* fit.
  - On screens 860px tall or less (laptops), the paddings around the job are slimmer.
- **Two columns of inks when they help:** when one column of inks overflows, the app tries two columns with the inks taking 60% of the job.
  - It keeps two columns only if that shows every ink, or 2+ more than one column does, because the mockup gets smaller.
  - It's re-checked when the job, its number of inks, the window size or *Hide list* change, never during a drag.
- **Below 1100px:** nothing changed. The cards open in place and keep their chips and *Mark ready*, because that's the only place to act there.
- **How many inks show without scrolling** (mocked jobs with real-length recipes, v98 → v99):

  | Screen | 2 inks | 4 | 6 | 8 | 10 | Mockup box |
  |---|---|---|---|---|---|---|
  | 1366×768 | 2 → 2 | 4\* → 4 (two columns) | 5\* → 4 | 5\* → 4 | 5\* → 4 | in place → 514×448, static |
  | 1440×900 | 2 → 2 | 4 → 4 | 4 → **6** (two columns) | 5 → 5 | 5 → **6** | 494×556 → 533×556 (390 wide in two columns) |
  | 1920×1080 | 2 → 2 | 4 → 4 | 6 → 6 | 8 → 8 | 10 → 10 | 767×736 → 789×736 |

  \* v98 was in place at 1366 (below its 1400px cut-off). Those counts are after scrolling the page so the job is at the top, and the mockup scrolls away with the inks. In v99 nothing scrolls but the inks column.

  Also in v99: 1100×700 shows 2, 1280×720 shows 2, and 2000×1000 shows 2/4/6/8/8, with the mockup at 833×656 (v98: 811). At 1440, *Hide list* still shows all 6.
- **Kept from v97/v98:**
  - days open/close by default and are remembered for the session
  - ↑/↓ go through all jobs
  - after *Mark ready*, the next job that needs ink opens
  - *Hide list*, the static mockup, the compact ink grid, drag reorder with auto-scroll, the no-proof message, practice mode and self-update
- **Airtable writes:** the same as v98.
  - The v98 write-compare flow gave identical writes (16, in the same order) at 1440×900, 1366×768 and 1100×700. v99 marks ready from the job header.
  - Practice mode sends 0 writes.
  - A 10-ink job: dragging the last ink to the top in one drag gave one write with the right order at 2000, 1440, 1366 and 1100.
- **Tested** with mocked Airtable (made-up customers) at 2000, 1920, 1440, 1366, 1280, 1100, 1024 and 390:
  - no page errors, no horizontal scroll and no text under 12px
  - no overlaps on any list card (bounding boxes of the mockup, title, sub-line, tags and buttons, all 23 cards)
  - day heads stay inside the list

## 2026-10-15 · v98: every ink in view, easier to scan
**Why:** Stephen on v97: "can we look at making ink queue also not scroll in the pantones section as well easier to scan and review". In v97 each ink was a tall card (64px swatch, big name, type/maker/updated line, the recipe one part per line, then a row of buttons), so two inks filled the column. He also sent a screenshot of the list: on a card, long ink chips ("7687 DIRECT-TO-FABRIC -") ran under *Mark ready*.

- **Compact ink cards:**
  - A 40px swatch, the Pantone number in big type (7579) and the type tag (DISCHARGE) on one line.
  - The recipe reads across, and wraps: "DC Base **419**  Super 75 **139**  | Yellow M3G **24.94**  Orange MGD **18.20** …". The amounts are bold. A short black bar marks the shop's "-" line (bases, then pigments). Most recipes take 1–3 lines (v97: one line per part).
  - The maker and the Updated date moved to tooltips (on the name, and on *Mixed today*).
  - A click on the name opens the name box (same save as before). TBA slots show the box straight away.
  - Click the recipe or *Edit* to edit it, the same box and save as v96.
- **Actions are small and quiet:** Edit, Label, Mixed today and Remove.
  - On a two-column card they're one row of small grey words under the recipe.
  - On a wide one-column card (1440 screens) they move up beside the name as small icons (✎ 🏷 📅 ✕, each with a tooltip). The card is then just the name line and the recipe.
  - Drag the handle to reorder. Auto-scroll is the same as v97.
- **A grid:**
  - Inks sit in two columns once the inks column is 600px or wider (1920 and 2000 screens, or 1440 with *Hide list*), and one column below that.
  - On wide screens the inks column is now 45% of the job (v97: 36%). It's 46% on 1400–1700px screens (v97: 42%).
  - The mockup stays static and is still the bigger half. It's a little smaller: about 767px wide at 1920×1080 (v97: 896) and 811px at 2000×1000 (v97: 947, which was height-limited anyway).
  - The column scrolls only when there are more inks than fit. There's still no inner scroll box, so the last ink goes to the top in one drag.
- **One toolbar row** over the inks: Inks (N) · 🏷 All labels · Copy colors (· Paste / Fill from / Last run) · + Add ink on the right.
- **Notes:** Print notes and Ink notes are one line each, side by side under the inks, and grow to show their text.
- **How many inks show without scrolling** (mocked jobs with real-length recipes, v97 → v98):

  | Screen | 2 inks | 4 | 6 | 8 | 10 |
  |---|---|---|---|---|---|
  | 1440×900 | 1 → 2 | 1 → 4 | 1 → 4 | 1 → 5 | 1 → 5 |
  | 1440×900, list hidden | | | 1 → 6 | | |
  | 1920×1080 | 2 → 2 | 2 → 4 | 2 → 6 | 2 → 8 | 2 → 10 |
  | 2000×1000 | 1 → 2 | 1 → 4 | 1 → 6 | 1 → 7 | 1 → 8 |

  At 1440 with the list showing, a 6-ink job with long recipes shows 4 at a time. Short recipes show more. *Hide list* shows all 6.
- **List cards (Stephen's screenshot):**
  - The ink chips and *Mark ready* now share one wrapping row. The button sits to the right of the last chip line, or on its own line, so a chip can never run under it.
  - A very long chip is cut with … (the full name is in its tooltip).
  - Chip names are tidied: the Pantone number plus the type, with the type in its normal case and no trailing " -". "7687 DIRECT-TO-FABRIC -" now reads "7687 Direct-to-fabric".
  - Checked with 5 chips (long Direct-to-fabric names) and an ink note, at 2000, 1920, 1440, 1024 and 390. No chip overlaps a button (bounding boxes checked on every card). v97 overlapped at 1440 and wider.
- **Below 1400px** the same compact cards are used (one column) in place, at 1024 and on phones.
- **Airtable writes:** the same as v97.
  - The v97 write-compare flow (name, recipe, drag reorder, labels, notes, *Mixed today*, swatch color, remove, add from library, add new, copy/paste, reorder seed, Mark ready, Undo, a No-date note): all 16 writes are identical, in the same order.
  - Practice mode sends 0 writes.
  - A 10-ink job: dragging the last ink to the top in one drag gave one write with the right order, at 2000 and 1440 (column scroll) and at 1024 (page scroll).
- **Tested** with mocked Airtable (made-up customers): no page errors, no horizontal scroll and no text under 12px at 2000, 1920, 1440, 1024 and 390.

## 2026-10-15 · v97: a bigger, static mockup; a list you can move through
**Why:** Stephen on v96:
- "do we need that white bar and smaller mockup above the bigger mockup"
- "can we fix the spacing on these so the names are left aligned and the order number imprint ids are right aligned"
- "can we also walk through how best it might be for moving with jobs in this section on the left"
- on dragging inks (same as Seps): "if I try to scroll up it doesn't move the screen and I have to move them one at a time instead of taking the lowest and moving it to the top"
- then: "still feel like the left section is too big and can we work on not having to scroll down if there is a lot of pantones etc would love for that mockup area be static and let's remove the floating buttons"
- and he asked why flatstock jobs show no mockup.

- **The open job:**
  - The tall white head with a small mockup is gone. One slim head: the ID, the design and tags like REORDER on one line, then customer #order · location · press · print date. Pcs, Inks and *Mark ready* are on the right.
  - The ink chips left the head, because the ink cards beside the proof show the same inks. In place (below 1400px), an open card also hides its small mockup and chips.
  - Two panes: the job never scrolls as a whole. The mockup fills the height and stays put, with ‹ 1/2 › under it. Only the inks column scrolls, so a job with many Pantones scrolls in that column. A new job starts at the top of its inks.
  - On wide screens the proof takes 64% of the job (it was 58%). At 2000×1000 the mockup went from 810×594 to 896×676 and starts 86px higher.
  - There are no floating or sticky bars. v96 had a sticky job head and a sticky proof; the fixed layout replaces both.
- **The list (two panes):**
  - It's narrower: 320–360px (v96: 380–440).
  - "N need ink · Tightest runway …" is one line. The full text is in the tooltip.
  - Under each day there's a slim order line: the customer on the left (cut with …), and the #order badge in a fixed column on the right, so the badges line up down the list. "2 imprints" shows only when an order has more than one.
  - Orders don't open and close any more; their cards sit straight below. Most orders have one imprint, so the ▶ was an extra click for nothing.
  - Compact cards:
    - a 40px thumbnail
    - the ID badge and the design, which gets the width
    - "Bandana · Press 2 · **120** pcs · **2** inks"
    - ink chips that wrap, with *Mark ready* at the bottom right
  - Day heads stay on one line, and the count gives way first.
- **Moving through the jobs:**
  - Days start open for today and the next 3 days with jobs. Later days, No date and Completed start closed, with their count. *On press today* starts closed when all its inks are ready.
  - Opening or closing a day is remembered for the session. v96 kept closed days in localStorage for good.
  - A search or a filter opens every day. The open job's day is always open.
  - The whole card is the click target. ↑/↓ walk every job and open a closed day on the way.
  - The first job picked is the first one that still needs ink. v96 picked the first card, even a ready one.
  - After *Mark ready*, the next job that still needs ink opens, even in a closed day. In place (below 1400px) it opens too, with its head near the top. v96 only closed the card.
- **Dragging inks:** holding an ink within 90px of the top or bottom edge scrolls, faster nearer the edge. It scrolls the nearest scrolling box around the ink (the inks column in two panes, the page otherwise). This works the same way as Seps v37/v38. The ink list has no inner scroll box, so the last ink goes to the top in one drag.
- **No proof (flatstock):** Airtable has flatstock proofs as PDFs on the line items, like the others. Some flatstock imprints have no proof on their line item (e.g. 10927-B, line item "10927-Pine Printshop-FLATSTOCK"), or no line item at all.
  - The job now says **No proof in Airtable**, names the line item to add it to, and has *Open the line item in Airtable*.
  - With no line item, it says so.
  - The name is a new read-only lookup of Line Items › Line Item Reference, made only when an open job has no proof.
  - PDF-only proofs (small and large thumbnails, no full) show their large thumbnail. This was checked.
- **Airtable writes:** the same as v96.
  - Checked with the v95/v96 write-compare flow (name, recipe, drag reorder, labels, notes, *Mixed today*, swatch color, remove, add from library, add new, copy/paste, reorder seed, Mark ready, Undo, a No-date note). All 16 writes are identical, in the same order.
  - Practice mode sends 0 writes.
  - A 10-ink job: dragging the last ink to the top in one drag gave one write with the right order, at 2000, 1440 and 1024 (in place, page scroll).
- **Tested** with mocked Airtable (made-up customers): no page errors, no horizontal scroll and no text under 12px at 2000, 1440, 1024 and 390.

## 2026-10-15 · v96: the mockup and the inks first; Rollo labels checked
**Why:** Stephen: "let's really explore usability for this as well. Ink is really focused on Mockups and then adding the correct colors and looks like that is hard to read / use right now", and "can you also look at the label logic in the ink queue and make sure that it will print correctly with a rollo printer".
- **Two panes (1400px+):**
  - The list is narrower (380–440px, was 560–640), the same as Seps v36 and Screens v23.
  - *Hide list* in the filter row gives the open job the whole width. It's remembered on this computer, and ↑/↓ still move between jobs.
- **The open job is the mockup and the inks:**
  - The proof takes about 58% of the job and is as tall as the pane. It stays in view while the inks scroll.
  - It loads Airtable's full-size image. v95 used the 512px thumbnail, which was blurry when shown big.
  - ‹ 1/2 › and *Full screen* sit under the proof, not over it. Clicking the proof opens full screen on the proof you were looking at (v95 always opened the first one).
  - The inks sit beside the proof as cards: a big swatch, the ink name in big type, the type tag, the maker and a small Updated date.
  - The recipe reads as a list: part on the left, amount on the right, numbers lined up. A "-" line is a rule.
  - *Edit recipe* (or a click on the recipe) opens the same box as before, and it saves the same way. v95 showed the recipe in a small box that cut it off.
  - Created dates are gone. Label and *Mixed today* are small buttons, and Remove is a quiet text button.
  - Print notes and Ink notes moved below the inks.
  - Smaller screens: the proof sits above the inks once the job is narrower than 760px (phones), and the ink cards shrink a little on 1400–1600px screens and iPads.
- **Labels (Rollo):**
  - The label was already right for a Rollo: a 4×2in PDF, one label per page, no margins, no rotation, pure black on white. The shop's other label app (Receiving) prints 4×6 on its label printer. The ink label was always 4×2, so the Rollo in the ink room needs 4×2 stock and a 4×2 paper size.
  - Recipes print bigger. v95 shrank long recipes to 5–7pt, which is hard to read on a 203dpi thermal print. Lines are now tighter and a "-" line is a thin rule. Normal recipes print at 9–14pt, and very long ones go into two columns before shrinking (never under 7pt).
  - Long Pantone names ("1625 (Ward Sutton)", "TOPO off white", "Cool Gray 11 C") wrap onto 2–3 big lines, never inside a number. Long ink names wrap to 2 lines in the black band.
  - Characters the PDF font can't draw (→, ≈, emoji) are swapped or dropped, so they can't print as garbage.
  - A label now prints the recipe as it is on screen. v95 printed the recipe from when the ink list loaded, so a just-edited recipe printed the old one.
  - The preview hides the PDF toolbar. On Safari, Print opens the PDF in a tab, because Safari can't print a PDF inside the page.
  - The label pop-up says which print settings to use. *Print all labels* says the labels opened in a new tab, one per page.
- **Airtable writes:** the same as v95. Checked with a write-by-write diff over name, recipe, drag reorder, notes, *Mixed today*, swatch color, remove, add (library and new), copy/paste, reorder seed, mark ready/undo and labels. Practice mode sends 0 writes.

## 2026-10-15 · v95
**Why:** move to Pine style v2 and the page kit, build for the desktop, add self-update and practice mode, and fix the bugs found on the way.
- **Pine style v2 + page kit:**
  - `pine-style-v2.css` and Poppins replace `pine-design-v1.css`.
  - The black bar has the Pine square, INK QUEUE, the version and the practice pill, then Refresh and ⚙.
  - The token strip and 🔑 button moved into the ⚙ menu, next to the practice switch.
  - One filter row: search, the four filter chips with counts, and *Print a label*.
  - Each group has a page head: a title box, a tag and a count. The countdown tags are yellow when a job prints in 1–3 work days and cream after that.
  - Tightest runway is in the first head. It's red under 4 work days, yellow at 4, and black ("done") above 4.
  - Jobs are kit list cards:
    - proof thumbnail and imprint ID badge
    - design, location and press
    - Pcs and Inks
    - Mark ready
    - row 2: *No inks* and *N colors to fill* (yellow), ink swatches, Reorder
  - Ink swatches are still the real ink colors. Only the app chrome uses black, white, cream and yellow.
  - Nothing is under 12px and there's no Courier. Buttons are 44px. Pop-ups are kit pop-ups, and alerts became one toast at a time.
- **Desktop first:**
  - At 1400px and wider there are two panes: the queue on the left and the picked job on the right. Each scrolls on its own, and the job's header stays at the top.
  - ↑/↓ move between jobs.
  - Narrower than 1400px, a job opens in place, one at a time.
  - The open job puts the proof beside the inks when there's room, and above them when there isn't.
- **Flow:**
  - *Mark ready* on the open job is the screen's one yellow button. In the two panes, marking it moves straight to the next job that needs ink.
  - A toast says "Inks ready ✓" and offers **Undo**.
  - Ink Notes moved from every collapsed card into the open job, beside Print Notes. When a job has a note, its card shows it on one line.
  - *+ Add ink* is a button over the ink list, and the form opens with the cursor in the search box.
  - Refresh keeps the open job and re-reads ink names and colors. Before, it cleared the screen and kept ink names from the first load.
  - Search is new.
  - Chip counts now match what each chip shows.
  - The separate ink-type tags show only when there are no swatches, because the swatch names already say the type.
- **Self-update:** loads `pine-update.js` (link `pine-ink-queue.html`), and Refresh checks for a new version too.
  - The app counts as busy while a save is running or queued, a pop-up or the ⚙ menu is open, someone is typing, the add-ink form is open, or (below 1400px) a job is open.
- **Practice (new):** `?practice=1` or the ⚙ switch. Every PATCH/POST is stopped in one place (`api()`), and nothing is sent.
  - The app answers with what would have come back, so the screen still behaves normally, for example when adding a new color.
  - The pill shows, and the URL keeps practice on through a reload or an update.
- **Bugs fixed:**
  - "No date" jobs opened to an empty box. The app only looked them up among the dated jobs, so their edits also never reached the in-memory record.
  - After one failed save, the card said "Save failed — click to retry" forever, and clicking did nothing. Now a new save clears it, and a failure shows a red toast.
  - Removing an ink and then adding one could give two rows the same id, so the next Remove could take off the wrong ink.
  - *Mixed today* on an ink with no Created date added a second "Updated" stamp.
  - The page stopped loading if the PDF library didn't load.
  - The *Copy colors* / *Print all* buttons were unstyled browser buttons (`.btn` didn't exist in the old CSS).
  - Removed unused code: the inline PDF pager and the ↑/↓ reorder arrows (drag-and-drop replaced them in v73).
- **Tested** (Playwright, mocked Airtable, made-up customers):
  - Flows run in v94 and v95 with the same edits:
    - type a Pantone into a TBA slot
    - recipe, Print notes, Ink notes
    - Mixed today, swatch color, remove an ink
    - add an ink from the library, add a new color
    - copy and paste colors
    - open a reorder (fills from the last run)
    - Mark ready
  - All 13 writes match v94 field for field. v95 adds two writes v94 couldn't make: Undo on Mark ready, and a note on a No-date job.
  - Also tested:
    - Update this color everywhere
    - label preview
    - Refresh keeping the open job
    - switching between two panes and one at 1400px
    - ↑/↓
    - search
    - a failing save (red toast, card stays not ready)
    - `pineBusy`
  - Practice mode sent 0 writes, both from `?practice=1` and from the ⚙ switch. There were no page errors.
  - Screens at 1920×1080, 1440×900, 1024×768, 768×1024 and 390×844. No text under 12px and no horizontal scroll.
