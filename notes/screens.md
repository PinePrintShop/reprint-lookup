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

## 2026-10-15 · v24: no small mockup above the big one; dragging an ink scrolls
**Stephen:** "do we need that white bar and smaller mockup above the bigger mockup"
- **Header:** on wide screens the open imprint's header no longer shows the small proof or the ink strip. The inks are already listed beside the big mockup. The header is shorter, so the mockup starts higher and gets a little bigger: portrait proofs about 12–16% more area, landscape up to 6%.
- **Dragging an ink:** hold it within about 90px of the top or bottom of the job and the job scrolls, the same as Seps v37.
- **Unchanged:** list cards and the iPad and phone layouts.
- **Tested:** all v23 flows send the same writes at 1440, 1024 and 390 (live, practice and failed save). Practice mode sends 0 writes. No text under 12px and no sideways scroll.

## 2026-10-15 · v25: the open imprint doesn't scroll; the mockup stays put
**Stephen** (looking at Seps, "or I guess scrolling also on Screens"): "still feel like the left section is too big and can we work on not having to scroll down if there is a lot of pantones etc would love for that mockup area be static and let's remove the floating buttons"
- **Narrower queue** (two panes, 1400px and wider): 320–360px (was 380–440px; set in the app's CSS, the kit is unchanged). Compact cards: 40px proof thumb on the left of design / customer · #order · type; under them the ID badge (smaller), Screens and Qty; tags and inks wrap below. Nothing cut off or overlapping (Imaged, No sep file, Repeat and previous-run tags checked).
- **The open imprint never scrolls as a whole.** It's a fixed-height column: a slim header (ID, design, Screens / Qty, Hide list, Imaged), then the body fills the rest of the screen. The mockup fills the body's height and stays put; the *Previous run* button sits under it, inside the screen. Only the right column (sep file, inks / burn order, print notes) scrolls, and it starts at the top each time a new imprint opens. With 10+ inks, you scroll that column, not the page.
- **Dragging an ink** near the top or bottom of that column scrolls it (the auto-scroll now uses the nearest scrolling box around the ink), so the last of 11 inks goes to the top in one drag: one write, right order.
- **No floating buttons:** Imaged and Hide list are in the imprint's header; nothing sticks to the bottom (only the short-lived Undo toast).
- Mockup (made-up 1650×1275 landscape proof sheet), v25 with the list showing: 1440×900 574×443 · 1920×1080 862×666 · 2000×1000 910×703 (landscape with a previous-run button: 846×654 at 2000).
- **Below 1400px unchanged** (screenshots pixel-identical to v24 at 1024, 768, 390 and 1399 wide). Same Airtable writes as v24.
- **Tested** (Playwright, mocked Airtable, made-up customers, imprints with 10 and 11 inks) at 1440×900, 1920×1080, 2000×1000: the page and the right pane don't scroll, the proof doesn't move while the controls column scrolls (scroll wheel over the proof does nothing), the whole proof and the previous-run button are visible, the list is readable; new imprint and ↑/↓ reset the column to the top; ink drag near the column top scrolls it. All v24 flows (Imaged, Undo, link sep file, print notes, ink drag, Undo imaged, proof viewer, calendar jump) send identical writes at 1920, 1440, 1024 and 390; practice 0 writes; failed save puts the imprint back. No page errors, no text under 12px, no sideways scroll.

## 2026-10-15 · v26: the open imprint never scrolls on a desktop
**Stephen:** "looks like it still scrolls on screens is there a way to not have it ever scroll on a desktop?"
- **Why it still scrolled:** the static two-pane layout only started at 1400px wide. A 1280 or 1366 laptop, or a 1440 screen with browser zoom, got the one-card-at-a-time layout, where the whole page scrolls. On wide screens a job with many inks also made the controls column scroll (52–68px ink rows, a 72px notes box).
- **Two panes from 1100px** (was 1400). Below 1400 the list is 280–320px (it was 320–360 above that, unchanged).
- **Compact controls column** (two panes only):
  - Sep file and print notes are one line each, label on the left.
  - Ink rows are ~38px, all on one line: handle, number, swatch, name, type tag. The name no longer repeats the type ("Pantone 186 - OW" + OW tag is now "Pantone 186" + OW tag); the full name is in the tooltip.
  - When the inks still don't fit and there are more than 5, they go into two columns (1–5 down the left, 6–10 down the right) and the column gets a little wider for that imprint. The drag handle shows on hover there; the whole row drags.
  - Print notes are a one-line box when empty, 2–3 lines with text, and grow while you type.
- **Only beyond that** does the controls column scroll; the page and the right pane never do. Dragging an ink near its top or bottom still scrolls it.
- **Does it scroll?** (page / right pane / controls column), 3, 6 and 10 inks:

  | Window | v25 | v26 |
  |---|---|---|
  | 1100×700, 1280×720, 1366×768 | the page scrolls (one card at a time) | nothing scrolls for 3, 6 or 10 inks |
  | 1440×900 | 10 inks: controls column scrolls 258px | nothing scrolls (10 inks in one column) |
  | 1536×864 | 6 inks: column scrolls 20px; 10 inks: 244px | nothing scrolls |
  | 1920×1080 | nothing scrolls | nothing scrolls |
  | 2000×1000 | 10 inks: column scrolls 76px | nothing scrolls |
- **Below 1100px unchanged:** screenshots are pixel-identical to v25 at 390, 768, 1024 and 1099 wide.
- **Tested** (Playwright, mocked Airtable, made-up customers):
  - Imaged, Undo, link sep file, print notes, ink drag, Undo imaged, proof viewer and calendar jump send the same writes as v25 at 1920, 1440, 1366, 1280, 1100, 1024 and 390, live and with a failed save. Practice mode sends 0.
  - Dragging the last of 11 inks to the top is one write in the right order at 1920, 1440, 1366, 1280, 1100 and 1024.
  - The proof stays put and is fully visible. A new imprint and ↑/↓ start the controls column at the top. Hide list still works.
  - No page errors, no text under 12px, no sideways scroll, and no list cards cut off or overlapping at 1100–2000.

## 2026-10-15 · v27: print notes show the whole note
**Stephen** (screenshot): a longer print note was cut off after two lines in the box.
- **Cause:** v26 gave the notes box on wide screens a fixed height: one line when empty, 62px when it had text, 128px while typing. Anything longer was cut off until you clicked in.
- **Now:** the box sizes to its text, up to about 8 lines, then scrolls. It's one line when empty. It resizes on every redraw, while typing and on window resize.
- **Tested:**
  - A 4-line note fits fully at 1440, 1280, 1024 and 390. In v26 at 1440 it showed 58px of 133px.
  - Same writes as v26.

## 2026-10-15 · v28: one job workspace with Seps and Ink (phase 1)
**Why:** the review found the same job drawn three ways in Seps, Screens and Ink. Stephen OK'd the shared layout.
- **Shared look** from the new `pine-job-v1.css`:
  - **Bar and filter row:** the same 72px bar and filter row. **Hide list moved from the job header to the right end of the filter row**, the same place as in Seps and Ink.
  - **Day heads:** ▾ fold · date · one timing tag (red "3 days late", "Today", "Tomorrow", "in 4 work days") · the count in a circle. Days start open, and a fold is remembered for the session.
  - **Order line (new):** CUSTOMER · #order. The cards no longer repeat the customer and order #.
  - **List cards (~80–118px):** 80×64 mockup · ID + design · location · type · "4 screens · 144 qty" · one status tag (No sep file / ✓ Imaged) + facts (Reorder, ↩ previous run). **The ink swatches left the cards** (Stephen's call, as in Ink v99).
  - **Job header:** ID + design + tags · customer #order · location · type · press · print date · Screens · Qty · ✓ Imaged.
  - **Mockup:** a white frame. Its footer shows only for a previous run: ↩ Previous run · Full screen.
  - **Inks:** a black "INKS (n)" box with "burn order · drag to reorder", then 38px one-line rows in one list.
  - **Print notes:** the label is above the box.
- **Pantone table:** moved to `pine-pantone-v1.js` (shared).
- **Repeat vs Reorder** (Stephen: Repeat = we're fixing an order we messed up or a shortage; Reorder = the client reorders something we printed before). Checked in Airtable (read only): the Imprints checkbox `flda9L7041ahNZT0b` is named **"Repeat?"** but is the client-reorder flag. Create Order ticks it when a past imprint is picked and links Previous Imprint ID, and all 156 imprints ticked in the last 45 days have a previous imprint and no Order Issue. So it now reads **Reorder** in Screens too (chip: Reorders). There is no imprint field that marks a fix or shortage reprint. Fixes go through Order Issues (the imprint's Order Issues link, "Issue Re-print?" on the issue) and the old [REPRINT] checkboxes on the same imprint, last used in September. So no "Repeat" tag is shown. Showing one needs a new Imprints field (for example a lookup of the issue's "Issue Re-print?"), which needs Stephen's OK.
- **Reads and writes:** Location and press are now shown. They were already in the full-record read. Writes are the same as v27.
- **Tested** (Playwright, mocked Airtable, made-up customers):
  - The v27 flows send the same writes at 1920, 1440, 1366, 1280, 1100, 1024 and 390, live and with a failed save, and behave the same:
    - Imaged and Undo
    - link sep file, print notes, ink drag, Undo imaged
    - proof viewer, calendar jump, ↑/↓
  - Practice mode sends 0 writes.
  - Dragging the last of 11 inks to the top is one write. Checked at 1920 through 1100, and in place at 1024.
  - No page errors, no text under 12px, no sideways scroll and no overlapping card parts.

## 2026-10-16 · v29: the open job lines up with Seps and Ink
**Why:** Stephen, comparing live Ink v101 and Screens v28 at ~2000px: "very subtle but you can see the ink and screen / sep box around the mockup is ever so slightly different if you scan back and forth....also it is ok to get this granular right? just trying to make this the best it can be and really visually flow".
- **Shared geometry from the new `pine-job-v2.css`** (also used by Seps v42 and Ink Queue v102; see pine-style.md). Flipping between the three apps with a job open, the card, header, mockup frame, footer and controls column sit on the same pixels at 1100, 1366, 1440, 1920 and 2000 wide, with the list shown or hidden and with two columns of inks. Only the content differs.
  - **Mockup : controls = 58 : 42** (was 3 : 2, the controls at least 360px), the controls at least 400px, 12px between them. With two columns of inks: 45 : 55, the controls at least 480px.
  - **The mockup footer is always there** (52px): file name · ↩ Previous run (it was only shown then) · Full screen. Narrow mockups (under 460px, 1100px screens) show "↩ 9317-A" and "⛶" so it stays one line. The image sits top-left.
  - Body padding 12px (8px on 768–860px tall laptops, which only Ink had). The header's first line stays one line (name and tags shorten with …).
  - Controls column: 8px between rows (was 10px), no 2px inset; Sep file is the shared one-line row; the inks block 8px apart (was 6px). Three header tags no longer push the mockup down at 1100px.
- **Print notes:** a one-line note is a one-line box (40px). The resize code started from 2 rows, so it was 59px.
- **New read:** the proof's file name, from the proof attachment Screens already reads. Airtable writes: same as v28.
- **Tested** (Playwright, mocked Airtable, made-up customers):
  - The v28 flows send the same writes at 1920, 1440, 1366, 1280, 1100, 1024 and 390, live and with a failed save, and behave the same. Practice mode sends 0 writes.
  - Dragging the last of 11 inks to the top is one write at 1920 through 1100, and in place at 1024.
  - The open job measured against Seps v42 and Ink v102 at 1100, 1366, 1440, 1920 and 2000 (also with the list hidden and with two columns of inks): the same to the pixel.
  - No page errors, no text under 12px, no sideways scroll and no overlapping card parts at 1100, 1366, 1440, 1920, 1024 and 390.


## 2026-10-20 · v30: Bandanas only + forgiving search
**Why:** Stephen: "can you look at adding a bandana only toggle in the screen and seps app ... also can we make the search logic really find anything we are typing vs having to type it very exactly."
- **Bandanas only** switch at the end of the filter chips, with a count of bandana jobs on the current tab. It sits on top of every tab (To image, No sep file, Reorders, Imaged), the search and the Calendar. Tap again to turn it off. Each computer remembers it (`screens_bandana_only`), so the bandana station can leave it on.
  - A bandana is an imprint whose Imprints **"Bandana Emoji Identifier"** (`fldo7l8t4IhhWoeXl`, filled in when the garment is Carolina Creative) is not empty. Seps uses the same field. An imprint with location "Bandana" counts too. Screens already got this field in its full-record read, so nothing new is read and nothing is written.
  - If nothing on a tab is a bandana, the screen says "No bandanas here · Turn off Bandanas only to see every job."
- **Search finds what you mean** (shared `pine-search.js`): any word order ("coffee deaf"), parts of words, first letters ("wg3" for Warm Grey 3), "pms 185", order numbers without the dash ("11040a"), one typo ("mountian"). The best match comes first. It looks at imprint ID, order #, customer, design, print type, location, press, separator and ink names. Garment and garment colour are not in Screens' data. Searching those needs a garment-name field on Imprints. The current one (`fldXLTrmEf8E9BpOn`) only returns record links.
- **Airtable writes:** same as v29.
- **Tested** (Playwright, mocked Airtable, made-up customers):
  - The bandana count is right, the switch limits the queue and the Calendar, and it works with the tabs and the search.
  - It stays on after a reload, and turning it off shows every job again.
  - Search cases: 11040a, "coffee deaf", hkc, "hello kity", mountian, "pms 185 kitty", 11042b, 11041 (best first).
  - Imaged sends the same one PATCH as v29. Practice mode sends 0 writes.
  - No console errors. No sideways scroll at 390.

## 2026-10-26 · v31: the sep file from Google Drive, inside the app
**Stephen:** "now that we have google drive setup....can we scan Seps and Screens app and see how we can improve those", then "you can have an agent start working on Seps and Screens".
- **View sep file** opens the full-screen viewer (it opened a new Drive tab). The file comes through the Pine worker (`drive/file`). PDFs, .ai files saved PDF-compatible, PNG and JPG show in the app. Other files (.psd, .eps, .tif) show Drive's thumbnail and say they can't show here. The viewer always has **Open in Drive ↗**. The page arrows only show for PDFs with more than one page.
- **No sep file linked:** under Sep file, the order's Drive **Seps** folder (named Seps, Separations or Sep, any case; else the order folder) shows as small tiles with thumbnails. Folders open in place and the path at the top goes back. Tap a file to look at it. **Link as sep file** on a tile saves its Drive link to Sep URL, the same one-field write as the paste box.
- **Paste a link instead** is still there. It now takes Google Drive links only (drive.google.com / docs.google.com) and says so plainly for anything else.
- **Replace link** next to View sep file fixes a wrong link (as in Seps). It shows the same tiles and paste box, with Cancel.
- **A folder link** in Sep URL shows that folder's files as tiles, with Open in Drive and Replace link.
- **Drive is read only for the open job**, once per order. Refresh reads it again. The queue makes no Drive calls. If Drive isn't connected, one calm line says so. The paste box and the plain Drive link still work.
- **Flow:** ✓ Imaged is still the one yellow button. The new controls are plain buttons.
- **Airtable writes:** the same as v30. Practice mode fakes the new link writes too.
- **Tested** (Playwright, mocked Airtable and mocked worker, made-up customers, 1440×900, plus 1024×768 and 390×844), 53 checks passed:
  - A PDF sep renders from `drive/file`. A .psd sep linked as `open?id=` shows the thumbnail and Open in Drive. The proof viewer still works.
  - A no-sep job lists the SEPS folder: one search plus two folder reads, cached when the job is opened again. Thumbnails load, a PDF and a PNG tile open, and the subfolder and back work.
  - Link as sep file sends exactly `{records:[{id,fields:{fldiBqdFTRMahiMeI:<webViewLink>}}]}`. Replace link (paste) writes the new link, and Cancel writes nothing.
  - The paste box rejects a Dropbox link with no write. Practice mode sends 0 Airtable writes.
  - With Drive returning 503, the job and the viewer say so, and pasting and the plain link still work.
  - Imaged, Undo, the No sep file tab, search and the Calendar still work.
  - No page errors, no text under 12px, and no sideways scroll at 1024 or 390.

## 2026-10-28 · v32: the signed mockup, and a check before reorder screens
Stephen's case: a reorder whose back print changed in PandaDoc, but whose imprint still pointed at the old run's screens.
- Each imprint reads its line items' Signed Proof and Signed Check (filled by pine-signed.js; see pandadoc.md).
- **Card tags:** "✓ Signed", or red "Check signed mockup".
- **The open imprint, "Signed by the customer":**
  - the reason in red, on a CHECK;
  - "Reorder of 10977-B: compare the signed mockup with the previous run before reusing its screens", on a reorder;
  - **Signed mockup ↗** and **↩ Previous run** side by side.
- **✓ Imaged** on a CHECK: the first tap explains and the button becomes "✓ Imaged anyway"; the second tap images.
- Tested with mocks, live and practice.
