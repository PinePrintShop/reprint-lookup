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

## 2026-10-15 · v38: the mockup stays put; no floating button; narrower list
**Stephen:** "still feel like the left section is too big and can we work on not having to scroll down if there is a lot of pantones etc would love for that mockup area be static and let's remove the floating buttons"
- **At 1400px and wider:**
  - **List:** 320–360px wide (was 380–440). Cards are more compact: smaller ID, 40px thumbnail, no ▸.
  - **Open job:** it never scrolls as a whole.
    - The mockup stays put and fills the height.
    - Only the controls column scrolls: type, sep file, separator, inks, notes.
    - When the next job opens, the controls column starts at the top.
  - **Button:** Mark sep'd / Order placed (with qty and cost on Supacolor jobs) moved from the floating bottom bar into the job's header, next to Screens.
- **Below 1400px:** the button is the first thing in the open job's controls. It no longer floats.
- **The real cause of the Pantone drag problem:**
  - The ink list had its own small scroll box (max 420px) inside the scrolling page. With many inks, the list scrolled inside a scroll, the bottom rows were clipped, and a drag couldn't reach the top.
  - That box is gone, so the list is just part of the controls column.
  - The drag auto-scroll now uses whichever box around the ink actually scrolls.
  - Tested with 10 inks: the last ink went to the top in one drag, with one write.
- **Tested:**
  - The 26 v37 flows send the same writes on v38, and practice mode sends 0.
  - With a 10-ink job, the page and the right pane don't scroll; only the controls column does.
  - No text under 12px and no sideways scroll at 2000, 1440, 1024 and 390.

## 2026-10-15 · v39: the open job never scrolls on a desktop
**Stephen** (on Screens; Seps works the same way): "looks like it still scrolls on screens is there a way to not have it ever scroll on a desktop?"
- **Why it still scrolled:**
  - The static two-pane layout only started at 1400px wide. A 1280 or 1366 laptop, or a 1440 screen with browser zoom, got the one-job-at-a-time layout, where the whole page scrolls.
  - On wide screens the controls column scrolled for every job, even one with 3 inks (300px too tall at 1440×900). The causes were boxed sections, 44px buttons, 48px ink rows, the bases on two lines, a two-line ink search and an 88px notes box.
- **Two panes from 1100px** (was 1400). Below 1400 the list is 280–320px, with a slightly smaller ID badge.
- **Compact controls column** (two panes only):
  - Type, Sep file, Separator and Print notes are one flat line each, label on the left. Only the inks keep their white box.
  - The inks header and the base chips share a line when there's room. The chips are smaller and have no color dot, and "(6 of 6)" keeps "paid screens" in its tooltip.
  - Ink rows are ~38px on one line: handle, number (burn order, new), swatch, name, type tag, ✕.
  - When the inks still don't fit and there are more than 5, they go into two columns (1–5 down the left, 6–10 down the right) and the column gets a little wider for that job. The drag handle shows on hover; the whole row drags.
  - "+ Add slot (TBA)" and the ink search share a line. "Inks found in the proof PDF" is a slim row.
  - Print notes are a one-line box when empty, 2–3 lines with text, and grow while you type.
  - Buttons in the column are 36px; Mark sep'd in the header is 44px. These are desktop, mouse-sized controls.
- **Only beyond that** does the controls column scroll; the page and the right pane never do. Dragging an ink near its top or bottom still scrolls it.
- **Fixed:** in v38, if the window was resized across the breakpoint with a job open, the in-body Mark sep'd button could be left behind or missing. It now moves with the layout.
- **Does it scroll?** (page / right pane / controls column), jobs with 3, 6 and 10 inks:

  | Window | v38 | v39 |
  |---|---|---|
  | 1100×700 | the page scrolls (one job at a time) | column scrolls 14 / 15 / 104px |
  | 1280×720 | the page scrolls | 3 and 6 inks: nothing; 10 inks: column 84px |
  | 1366×768 | the page scrolls | 3 and 6 inks: nothing; 10 inks: column 36px |
  | 1440×900 | column scrolls 304 / 451 / 647px | nothing scrolls |
  | 1536×864 | column scrolls 340 / 487 / 683px | nothing scrolls |
  | 1920×1080 | column scrolls 22 / 169 / 415px | nothing scrolls |
  | 2000×1000 | column scrolls 102 / 249 / 445px | nothing scrolls |
- **Below 1100px unchanged:** screenshots are pixel-identical to v38 at 390, 768, 1024 and 1099 wide.
- **Tested** (Playwright, mocked Airtable, made-up customers):
  - The 26 compare flows send the same writes as v38 at 1440, 1280, 1100 and 1024. The main flow (16 writes, live) is identical at 1440, and practice mode sends 0.
  - Dragging the last of 10 inks to the top is one write in the right order at 1920, 1440, 1366, 1280 and 1100, with the page and pane not moving.
  - Resizing across 1100px with a job open keeps one Mark sep'd button and keeps what you typed.
  - No page errors, no text under 12px and no sideways scroll.

## 2026-10-15 · v40: print notes show the whole note
**Stephen** (screenshot): a longer print note was cut off after two lines in the box.
- **Cause:** v39 gave the notes box on wide screens a fixed height: one line when empty, 62px when it had text, 128px while typing. Anything longer was cut off until you clicked in.
- **Now:** the box sizes to its text, up to about 8 lines, then scrolls. It's one line when empty. It resizes on every redraw, while typing and on window resize.
- **Tested:**
  - A 4-line note fits fully at 1440, 1280, 1024 and 390. In v39 at 1440 it showed 58px of 133px.
  - Same writes as v39.

## 2026-10-15 · v41: one job workspace with Screens and Ink (phase 0 + 1)
**Why:** the review of Seps v40, Screens v27 and Ink v100 found the same job drawn three ways. Stephen OK'd phase 0 + 1: Hide list in the filter row, "Qty" everywhere, Repeat ≠ Reorder, and no inks on list cards.
- **Shared look** from the new `pine-job-v1.css` (also used by Screens v28 and Ink v101):
  - **Bar and filter row:** the same 72px bar. Search says "Imprint ID, order #, customer, design". The chips sit together, and Hide list is on the right.
  - **Day heads:** ▾ fold · date · one timing tag (red "2 days late", "Today", "Tomorrow", "in 3 work days") · the count in a circle. Days start open, and a fold is remembered for the session.
  - **Order line:** CUSTOMER · #order.
  - **List cards (~86–110px, were ~180):**
    - 80×64 mockup, a small ID badge and the design name (2 lines at most)
    - location · type, then "4 screens · 144 qty"
    - one status tag plus facts (Reorder, ↩ previous run, ink coverage)
    - **+ Claim beside the numbers**, no longer on its own row
  - **Job header:**
    - ID, design and tags on the first line
    - customer #order · location · type · press · print date on the second
    - Screens · Qty, then the yellow button, on the right
  - **Mockup:** a white frame. Its footer shows only on a reorder: **↩ Previous run** and Fill from (moved from the Type row) and Full screen.
  - **Inks:** a black "INKS (n of m)" box with the base chips beside it, then 38px rows (handle · burn # · swatch · name · type · ✕). Burn numbers now also show in place.
  - **Print notes:** the label is above the box.
- **Phase 0 fixes:**
  - **Qty shows once** on Supacolor / Decopress jobs (it was in the header and again in the Order placed box).
  - **Order placed is a normal yellow button.** When no cost is typed, the cost box is yellow and reads "Enter the cost first". Clicking still says so and puts the cursor in the box. v40 faded the button and gave the reason only in a tooltip.
- **Pantone table:** moved to `pine-pantone-v1.js` (shared, the same in all three apps). The app keeps its own lookup.
- **Repeat vs Reorder** (Stephen: Repeat = we're fixing an order we messed up or a shortage; Reorder = the client reorders something we printed before). Checked in Airtable (read only): the Imprints checkbox `flda9L7041ahNZT0b` is named **"Repeat?"** but is the client-reorder flag. Create Order ticks it when a past imprint is picked and links Previous Imprint ID, and all 156 imprints ticked in the last 45 days have a previous imprint and no Order Issue. So it now reads **Reorder** (chip: Reorders). There is no imprint field that marks a fix or shortage reprint. Fixes go through Order Issues (the imprint's Order Issues link, "Issue Re-print?" on the issue) and the old [REPRINT] checkboxes on the same imprint, last used in September. So no "Repeat" tag is shown. Showing one needs a new Imprints field (for example a lookup of the issue's "Issue Re-print?"), which needs Stephen's OK.
- **New read:** Equipment (press) for the header. No new writes.
- **Tested** (Playwright, mocked Airtable, made-up customers):
  - The 26 compare flows send the same writes as v40 at 1920, 1440, 1280, 1100, 1024 and 390. Practice mode sends 0 writes.
  - Dragging the last of 10 inks to the top is one write in the right order, with the page and the pane not moving. Checked at 1920, 1440, 1366, 1280 and 1100, and in place at 1024.
  - Fold, Hide list, ↑/↓, calendar jump and resizing across 1100 all work.
  - No page errors, no text under 12px, no sideways scroll and no overlapping card parts at 1100, 1366, 1440, 1920, 1024 and 390.
  - Laptop scroll is the same as v40.

## 2026-10-16 · v42: the open job lines up with Screens and Ink
**Why:** Stephen, comparing live Ink v101 and Screens v28 at ~2000px: "very subtle but you can see the ink and screen / sep box around the mockup is ever so slightly different if you scan back and forth....also it is ok to get this granular right? just trying to make this the best it can be and really visually flow".
- **Shared geometry from the new `pine-job-v2.css`** (also used by Screens v29 and Ink Queue v102; see pine-style.md). Flipping between the three apps with a job open, the card, header, mockup frame, footer and controls column sit on the same pixels at 1100, 1366, 1440, 1920 and 2000 wide, with the list shown or hidden and with two columns of inks. Only the content differs.
  - **Mockup : controls = 58 : 42** (was 3 : 2), the controls at least 400px, 12px between them. With two columns of inks: 45 : 55, the controls at least 480px.
  - **The mockup footer is always there** (52px): file name · ↩ Previous run + Fill from (on a reorder; it was only shown then) · Full screen. Narrow mockups (under 460px, 1100px screens) show "↩ 9317-A" and "⛶" so it stays one line. The image sits top-left.
  - Body padding 12px (8px on 768–860px tall laptops, which only Ink had). The header's first line stays one line (name and tags shorten with …).
  - Controls column: 8px between rows (was 6px). Type, Sep file and Separator are the shared one-line rows: label 96px on the left in the standard label look (was bolder, 11px indented), 40px tall.
- **Print notes:** a one-line note is a one-line box (40px). The resize code started from 2 rows, so it was 59px.
- **New read:** the proof's file name, from the proof attachment Seps already reads. Airtable writes: same as v41.
- **Tested** (Playwright, mocked Airtable, made-up customers):
  - The v41 compare flows send the same writes as v41 (19 + 7 steps, all the same). Practice mode sends 0 writes.
  - Dragging the last of 10 inks to the top is one write in the right order at 1920, 1440, 1366, 1280 and 1100, and in place at 1024.
  - The open job measured against Screens v29 and Ink v102 at 1100, 1366, 1440, 1920 and 2000 (also with the list hidden and with two columns of inks): pane, card, header, body, mockup frame, image, footer, gap and controls column are the same to the pixel.
  - No page errors, no text under 12px, no sideways scroll and no overlapping card parts at 1100, 1366, 1440, 1920, 1024 and 390.

## 2026-10-20 · v43: Bandanas only, forgiving search, a faster ink picker
**Why:** Stephen: "can you look at adding a bandana only toggle in the screen and seps app.....as well as looking into the scroll feature for selecting inks....also can we make the search logic really find anything we are typing vs having to type it very exactly." His screenshot of the Add-ink list showed big two-line rows ("PANTONE BLACK BB - EZP / Black BB · EZP"), about 9 on screen, and a lot of scrolling.
- **Bandanas only:** a toggle at the right of the filter row, with how many bandana jobs are in the tab you're on. It works with the tabs (To sep, No sep file, Reorders, Sep'd), the search and the Calendar. This computer remembers it. Bandana = the imprint's "Bandana Emoji Identifier" is filled in (the same thing that shows the ink coverage buttons).
- **Search that forgives** (the shared `pine-search.js`): any word order, parts of words, first letters ("dcb" finds Deaf Co Brewing), "11040a" finds 11040-A, and one typo ("brewnig"). It looks in the imprint ID, order #, customer, design, type, location, press, separator and the ink names. The list keeps its date order. Garment and colour are not in what Seps loads, so they are not searched yet.
- **Ink picker:**
  - The whole Inks library (about 1,700 inks) loads once when you first click into the box, and this computer keeps a copy so it's instant next time. Refresh loads it again. Until it has loaded, typing searches Airtable as before.
  - Same forgiving search, best match first: "blakc bb" finds Black BB, "dtf 185" finds 185 Direct-to-fabric, "pms 1807c", "wg3" and "warm grey 3" all work.
  - One-line rows: swatch · name · type (e.g. ■ Black BB  EZP). 34px rows instead of about 60, and the list can be up to 60% of the screen tall. That's about twice as many inks in view.
  - ↑/↓ moves the highlight, Enter adds it (the best match is already highlighted, so typing and pressing Enter is enough), and Esc closes the list. The mouse wheel scrolls only the list, not the page behind it.
  - With the box empty you see **Recent** (the last 8 inks this computer added), then **Previous run** (on a reorder), then every ink.
  - Type chips at the top (All, OW, EZP, SOW, Direct-to-fabric, Discharge, Graphics) narrow the list. They come from the library itself.
  - **+ Create new ink** works as before.
- **Fix:** clicking out of the ink box and straight back in could close the list a moment later.
- **New read:** the Inks library (Name, Pantone Number, Ink Type, Display Hex). Airtable writes are the same as v42. Adding an ink is the same PATCH of the imprint's Inks link.
- **Tested** (Playwright, mocked Airtable, made-up customers, 1440×900):
  - Bandanas only: shows only the 2 bandana jobs, count 2, works with the search, is remembered after a reload, and shows all 5 when turned off.
  - Queue search finds the right jobs for "11040a", "11040 a", "dcb", "brewnig", "tee deaf", "hilltop hoody", "kayk northwind" and "bandana", and finds nothing for "zzzz".
  - Ink picker:
    - The library loads in 3 pages.
    - The top match is right for the six searches above.
    - Arrow keys and Enter add Black BB with exactly v42's PATCH (one write). The list closes and the box clears.
    - Esc closes the list but not the job.
    - Recent shows first, and Previous run shows on a reorder.
    - The type chip narrows the list.
    - A mouse click adds an ink.
    - Custom ink sends the same POST and then the PATCH.
    - Nothing in the picker is under 12px, and swatches are 18px.
  - Practice mode sends 0 writes. No page errors. No sideways scroll at 390.

## Ideas not built yet
- Jobs with no print date drop off 14 days after they were created (the load window), even if they still need a sep.
- On a phone the kit card puts Screens and *+ Claim* on separate rows, so cards are tall.
