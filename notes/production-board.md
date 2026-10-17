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
