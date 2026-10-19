# Production Board

Permanent link: `pine-production-board.html`. It runs on the wall TV.

## 2026-10-17 · v42: Pine look, and the next job stands out
Stephen: "Let's go! Onto the next" (the round of updates for the remaining apps).

**Same board, same tools.** These are all unchanged:
- roster and operator chips, Arrange (reorder / move / platen / colour change), Draw, sticky notes
- time off, the imprint overview on tap, tap-to-cross-off, dark mode, the stretch goals
- local layout, which stays in the TV's browser as before

**Changes:**
- **Pine style v2:**
  - The black Pine bar with the logo and Poppins headings.
  - Black press headers with white names and yellow operator chips (they were pastel).
  - Only black / white / cream / yellow, with red kept for someone out today.
  - A platen change is a black line (yellow in dark mode); a colour change is a yellow row tint. They were gold and teal; the two have different shapes, so colour isn't needed to tell them apart.
- **Across the room:**
  - The next job on each press (the first one not crossed off) is a yellow row.
  - Crossed-off jobs shrink and fade, so what's left stands out. They were full size with only a line through them.
  - On the Oct 15 board, that meant Press 2's one remaining job (10959-A) and Flatstock's 10941-A were the only big rows.
- **Text:** the progress strip and legend are bigger and plainer, with no Courier and nothing under 14px. "Up next" was added to the legend.
- **Self-update** (`pine-update.js`): it waits while someone is arranging, drawing, typing a note or has a pop-up open. The version shows in the bar.
- **Practice mode** (`?practice=1`): time-off requests are faked. The board writes nothing else to Airtable.
- **Tested** with Oct 15's real schedule (mocked Airtable) at 1920×1080, light and dark:
  - Tapping 10959-A moves "next" on; tapping it again moves it back.
  - Arrange hides "next" and counts as busy.
  - 0 Airtable writes; no errors.

## 2026-10-17 · v43: a phone layout
Stephen, with a phone screenshot: "I know this is for a tv and not mobile. But it is pretty wild on mobile."
- The TV sizes scale with the screen width, so a phone got five squeezed columns of tiny type, overlapping headers and a time-off card floating over the board.
- **Now, under 760px wide:**
  - Each press is a full-width section, one under another, on a normal scrolling page. Its header sticks to the top while you scroll through it.
  - Text sizes are fixed and readable.
  - The progress strip shows two presses to a row, and the legend wraps.
  - The time-off card sits in the page under the board.
  - Draw, Note, Arrange and Full screen are hidden on phones (TV tools).
- The TV view is unchanged: the same tests at 1920×1080 pass ("next" moves on tap and comes back on undo, Arrange hides it and counts as busy, 0 writes).

## 2026-10-17 — v44: phone layout, round 2
Stephen on v43's phone view: "Still bad".
- A phone held sideways (short screen) now gets the phone layout too; it was still getting the five TV columns.
- Top bar on phones: two tidy rows (Pine, PRODUCTION, date, version / ‹ Today › … Roster, Dark, ↻).
- Each press shows what's left: crossed-off jobs fold into one "✓ N done · show" line (tap to open; stays open on re-render). Platen lines only show between jobs still to run when folded.
- Each press header carries its own progress (done / total impressions, %, thin yellow bar) and the 🎯 stretch line, so the separate progress strip is hidden on phones. A press with nothing scheduled is one line ("nothing today").
- TV view unchanged (checked at 1920×1080). Tested at 390×844, 430×932, 932×430 and in dark mode, with cross-off taps.

## 2026-10-17 — v45: weekend cleanup
Stephen: "Just work on the apps we are using".
- **Wifi drop no longer freezes the TV.** The board reloads every minute; a failed load used to open a browser box ("Could not load schedule") that stopped the board until someone clicked OK. Now it keeps the last board up with a black bar: "Can't reach Airtable — showing the board from 2:41 PM. Trying again every minute." The bar goes away on the next good load. Tested by cutting the mock connection for two minutes.
- The old `pine-design-v1.css` is no longer loaded. Compared every element's style v44 vs v45 (TV, phone, roster, time-off request): identical except the Arrange "Local layout" badge, now yellow/black instead of orange; the Arrange drop target is pale yellow.

## 2026-10-19 — v46: header spacing on laptops
Stephen (laptop screenshot): "this spacing looks weird on the production board app".
- The date broke onto two lines ("Oct" / "19"); it's one line now ("MON Oct 19").
- Press headers: the operator chips / "+ add" sit on the same row as the press name (wrap under it only when there's no room) — headers are about half as tall.
- Laptop widths (761–1279px): Arrange / Draw / Note / Full screen are icon buttons (the bar ran off the right edge at ~1000px), and job rows use tighter columns so the full job number fits (was "1095…").
- TV (1920) and phone layouts checked; TV only gets the shorter headers.
