# Catching app — cleanup + flow (Oct 2026)

## v146 — data safety + practice mode
- **Tallies survive a reload.** Saved per card on that iPad (`pine_catch_qc_v1`, kept 2 days). Before, a reload, an iPad sleep or a tab eviction wiped every count.
- **Logged damage is never deleted by accident.**
  - A bucket's issues are only removed when the catcher actually counted that card down to zero.
  - An issue that's already been reviewed (anything but "Awaiting Review") is never deleted; the catcher sees a toast instead.
  - Before, reopening a card after a reload showed zero, and "Mark QC Done" deleted the issues that were already logged.
- **No duplicate issue on Retry.** The Order Issue is remembered the moment it's created. If the Damage Detail failed, Retry creates and links it instead of creating a second issue.
- **Paging.** List reads follow Airtable's offset. Before, today's imprints were capped at 100 and orders at 50; orders past 50 had no customer, ship method or record.
- **4XL / 5XL / 6XL.** These are now read from the line items, so they can be counted and damaged. 6XL damage goes to Damage Details only, since Order Issues has no [RP] 6XL; see 6xl-sizes.md.
- **A failed Caught write puts the card back** in the queue with an error. Before, it vanished until a full reload.
- **Orders no longer stuck at Partially Completed.** Imprints that never come through catching (heat press, sewing, tags… or no line items) now count as done for the order status.
- **Practice mode** `?practice=1`:
  - Live data, nothing saves (same design as Operator).
  - Its own tally and written keys, plus a "Reset" button.
  - Good for training new catchers.
- **Bigger tap targets.** Press tabs, small buttons and Back were 9–10px text. The phone layout no longer overflows on the Caught row.

## Flow today (per pile)
1. Queue → tap the card.
2. Tap Front / Back location chips (multi-location piles; Submit stays grey until all are ticked).
3. For each damaged piece, pick a size, then a reason.
4. Tap Submit QC.
5. If anything is TBD, a modal to assign each one to Print Team / Other.
6. Preview modal: size table, extras chips (tap each extra going in the box), notes.
7. Tap Create N Issues, which returns to the card.
8. Tap Mark Complete (or Complete on the order in the queue).
9. Packing slip.

That's roughly 6–8 taps of overhead per pile, on top of the damage taps.

## Proposed flow (mockup: `pine-catching-mockup.html`, sample data) — Oct 5
Stephen's answers:
- Location chips were an idea for tracking where you're at (3-location orders), not a gate.
- The production manager uses the Damage Log, so unsure pieces go there.
- Extras not used to replace damage go in the box as bonus (tracked).
- Catching has 2 iPads.

The mockup:
- **One screen per press.** A pile list (grouped by order, "x/y piles") sits next to the open pile. The press tab is remembered per iPad.
- **A clean pile is 2 taps:** open it, then **✓ Done with pile**.
- **Damage:** tap a size, then a reason, as today; the size stays selected.
- **Unsure:** "Unsure — production manager decides in Damage Log", with no pop-up at submit.
- **Location chips are tracking only** ("Checked 1/3") and don't block anything.
- **Footer summary replaces the submit pop-ups:** damage, caught count, and extras worked out automatically (cover damage first, the rest go in the box as bonus).
  - **Review** opens a sheet with the size table, extras exceptions ("keep out of the box") and notes. It's optional.
- **Done with pile** saves the issues, marks the pile caught and moves the order on, all in one step.
  - If the order has more piles, the next one opens, with a toast and Undo.
  - On the last pile, an "Order complete" card shows the new status (Caught – Awaiting Ship or Completed) and buttons for 🖨 Packing slip, Next pile and Undo.
- **Needs Airtable / Damage Log work for unsure → PM:**
  - a "TBD" accountability option on Order Issues and Damage Details;
  - Damage Log being able to set Print Team / Other on a TBD issue.

### Mockup v2: finger-path layout (Oct 5)
- **Mirrors the new Operator:** the pile list is on the RIGHT and the work is on the left. **⇄ Side** flips this per iPad, for a left-handed catcher.
- **Everything tapped sits in one vertical lane, in tap order:**
  1. Sizes: a big row at the top of the lane.
  2. Reasons: 2 rows of 6 right under the sizes.
     - Print Team on the first row.
     - Other ×4, Unsure and Undo on the second.
  3. Checked locations: full-width chips under the reasons. They're tracking only.
  4. **Done with pile:** full width at the bottom, with the totals printed on the button.
- **The finger only moves down.** Size → reason is about 1–2 inches. Nothing tapped is in a corner any more: before, sizes were top-left, locations tiny top-right, and Done bottom-right.
- **Read-only info is a slim strip on top:** proof, order, chips.
- **Landscape:** the reason buttons stretch to fill the lane, so there's no dead gap between the reasons and Done.
- **Portrait:** the lane stays compact in the bottom half (thumb zone), and the pile list takes the spare room above it.
- **Phone:** one column, with locations and Done stuck to the bottom.

### Mockup v3: big proof (Oct 5)
- **Landscape:** the proof is a tall column on the far left of the work area (about 40% of the panel, full height). That's away from a right hand tapping the lane, so the hand never covers it.
  - ‹ › step through the locations (Front / Back / Sleeve), and a tap zooms to full screen.
  - The tap lane sits right next to the proof, and the pile list stays on the right.
  - ⇄ Side mirrors the layout for a left-handed setup.
- **Portrait:** pile strip on top, then the proof filling the spare height, then the compact tap lane at the bottom.
- **Phone:** a 300px proof above the lane.

### Mockup v4: less repeated text (Oct 5)
Each fact now shows once, where it's used:
- **Press:** only on the top tab. The pile-list header and "This iPad remembers its press" are gone.
- **Damage:**
  - per size on the size chips;
  - the total on Done;
  - "3 dmg" on the pile card in the list.
  - Removed "damaged so far".
- **Selected size:** only the highlighted chip. Removed "· L" from the group labels.
- **Pieces:** shown as "57/60 caught" on Done. Removed the "60 pcs" chip.
- **Extras:** "+n" on the size chips and "1 bonus extra" on Done. Removed the "+3 extras" chip and the long extras sentence.
- **Locations:** the "Checked" chips. Removed "1/3 · tracking only".
- **Labels:** cut down to Size / Print team / Other / Checked. Removed the step numbers, "Not sure", "PM decides", "last tap", "tap to zoom" (now a 🔍), and "/2 piles" → "0/2".

## v147 — the new screen on real data (Oct 5)
`pine-catching-v147.html`. v146 stays as the fallback, and `?practice=1` works.
- **Layout:** the mockup on v146's data layer.
  - Proof big on the left; tap it for the full viewer with pages and zoom.
  - One tap lane: size → reason (Print team ×6 / Other ×4 + Unsure + Undo) → Checked locations → **Done with pile**.
  - Piles on the right, grouped by order with done/total. ⇄ flips the side, and the iPad remembers its side and its press.
- **Done with pile:**
  - Saves the damage through the v146 write path, without the modal. All the v146 protections still apply: no duplicates, never deletes reviewed issues, tallies survive reloads.
  - Opens the next pile in the order, with a 6-second **Undo** toast.
  - Marks the previous pile caught (and moves the order status on) when the Undo window ends, the next Done is tapped, or the app is backgrounded.
  - On the last pile of the order, an **Order complete** card shows the expected status and the next step (readyCopy), with 🖨 Packing slip / Next pile / Undo. Packing slip or Next commits right away.
- **Unsure:** one tap, no note pop-up. Until the Damage Log can assign TBD, Done still asks Print team / Other for unsure pieces (the existing pop-up), then carries on.
- **Extras:** by default, every extra that didn't replace damage goes in the box (bonus). Review → tap an extra to keep it out. This is written to Extras Sent like v143.
- **+ caught (absorbed)** is next to the Size label when a size is selected; the size chip shows "+1 caught".
- **Bandanas:** a "N more to print" bar at the top of the lane.
- **Review:** the old submit sheet (size table, extras, notes, the issues that will be created), with a Done button.
- **Completed tab:** unchanged.
- **Tests (mock Airtable):**
  - Layouts: landscape and portrait have no scroll.
  - Done → next pile → last pile → order card → caught written on Next. Undo writes nothing.
  - The Unsure → resolve → Done path works, and extras default to the box.
  - All v146 data tests still pass.

## v148 — fill the lane, bigger proof (Oct 5)
- **No empty lane before a size is picked.** The reason buttons are always on screen, faded, with each one showing the pile's total for that reason. Tapping a faded button flashes the size row ("pick a size first"). The layout no longer jumps when a size is picked.
- **Reasons are 3 across in landscape and desktop**, so each button is bigger and they fill the lane top to bottom. Portrait keeps 6 across.
- **Bigger proof:** half the work area (no max width), and the pile list goes from 250 to 215px.
- **Sharper proof:** page 1 of the proof PDF is rendered once per line item at the panel's real size (×2 pixel density) and cached; up to 12 are kept. Before, it used Airtable's small preview image. The preview shows until the render is ready, and stays if the render fails.
- **Practice pill moved into the top bar**, shortened to "Practice ↺ Reset". It was covering Done with pile.
- Not testable here: PDF.js loads from cdnjs, which this environment blocks. The fallback (the preview image) is what the tests saw.

## v149 — damage reasons per machine + heat press comes through catching (Oct 5)
- **Reason buttons depend on the job's press** (`dmgSet(press)`):
  - **Screen print** (P1 / P2 / Flatstock): unchanged.
  - **Embroidery team:** Thread Break / Skipped Stitch, Puckering, Outline / Registration Off, Wrong Thread Color, Hoop Burn, Needle Hole / Snag, Off-Center, Backing Showing. **Other:** Mill Flaw, Stain, Jawn.
  - **Heat press team:** Not Sticking / Lifting, Scorched, Crooked / Off-Center, Wrong Placement, Ghosting / Double Image, Press Marks. **Other:** Bad Transfer (vendor), Mill Flaw, Stain, Jawn.
- **Accountability still saves as "Print Team" / "Other"**, in the same Order Issue and Damage Detail fields. Only the label changes: on screen, in the Unsure resolve pop-up, and in the issue description ("1 damaged (Heat Press Team) [1M]: Scorched").
- **Airtable (Oct 5):** the 16 new names were added as choices on Order Issues (QC Reasons - Print Team / Other / legacy QC Reasons) and on Damage Details (Damage Reasons). No existing choices were changed.
  - The metadata tool can't edit select choices. On Damage Details, a temporary record created them and was then deleted.
  - On Order Issues, a record create sends an email, so the choices came from a write to one old resolved record (rec04g98siaSkOxBs), which was then cleared back to empty. Only the 3 reason fields were touched; no automation watches them.
- **Heat press jobs now come through catching:** Heat press, D3, Hat Press and Tag Press have a new **Heat Press** tab, which matches any equipment containing "heat press". SKIP_PRESS is now sewing / finishing / bartacker / post-bed only. The order-caught count needs heat press imprints to be truly caught now.
- With 8 embroidery team reasons, that grid goes 4 across in landscape. Each half of the lane is sized by its number of rows.
- **Tests (mock Airtable):**
  - Heat, embroidery and P1 each show the right lists, and sewing stays out.
  - The heat press Done writes Scorched → Print Team and Bad Transfer (vendor) → Other.
  - The embroidery Unsure resolve pop-up offers the embroidery reasons.
  - The v148 flow and layout tests and the v146 data tests all still pass.

## v150 — "Line Item" instead of "pile" (Oct 5)
- "Pile" sounded odd said out loud. Every on-screen use now says **Line Item**, which matches the Airtable wording:
  - the list header "Line Items" and its ⇄ tooltip
  - "Pick a line item"
  - "✓ Done with line item"
  - the toast "✓ Line item saved · N more in order …"
  - "Next line item ▸" on the order-complete card
  - the absorbed-caught tooltip
- Code names (`donePile`, `cw-pile`) are unchanged.
- **Tabs:** the six press tabs (Heat Press was added in v149) were cut off on a landscape iPad (1180px). Below 1300px wide they're now a little tighter, and all of them fit. Portrait still scrolls sideways.
- **Tests:** the v148 flow and layout tests pass unchanged. The toast and order card show the new wording.

## v151 — say it once (Oct 5)
Trimmed wording that repeated itself:
- **Done button:** "✓ Done with line item" → **"✓ Done"**; the line item is already on screen. The review sheet says "Review" and "✓ Done".
- **Toast:** "✓ Line item saved · 1 more in order 90010" → **"✓ Saved · 1 more in 90010"**.
- **Order card:** "Next line item ▸" → **"Next ▸"**; "↺ Undo — not done yet" → **"↺ Undo"**.
- **Review sheet:**
  - "Additional notes (optional)" → **"Notes"**.
  - The extras line reads "**1 in the box · 2 replaced damage**".
  - Each damage issue was 5 lines (team tag, garment, "1 damaged (Print Team) [1M]: Smudge", "1 damaged", "Smudge"). It's now one line: **team · count · reasons**, under "Damage to report". The garment shows only if the job has more than one.
  - The table column "TBD" now says **Unsure**, like the button.
- **Unsure pop-up:**
  - Title "**Sort the unsure pieces**". The warning banner is gone.
  - Rows read "Black · M · 1 piece", with no "(no note)" lines.
  - "Bucket" → **Team**. "Resolve all & continue" → **"Save & finish"**.
- **Completed tab:** "today" appeared three times; the date is already in the header.
- What gets saved to Airtable is unchanged. The issue description still reads "1 damaged (Print Team) [1M]: Smudge".

## v152 — packing slip "Order record not found" fix (Oct 13)
- **The bug:** in v151, "🖨 Packing slip" on the **Order complete** card said "Order record not found for 10906". The button saves the last catch first, and that takes the order's job off the queue right away. The slip lookup searched only the queue, so the order was gone. The same thing happened for any slip opened after the order was finished.
- **The fix:**
  - When a job is finished, Catching now remembers the order's Airtable record, so the slip still opens instantly.
  - The lookup also checks the finished jobs.
  - As a last resort it looks the order up by its number in Airtable. This also covers the order details not having loaded yet.
- **Tested** with mocked Airtable:
  - v151 shows the alert in both cases (card and after done).
  - v152 opens the slip from the card, after the order is done, and through the lookup by number.

## v153 — friendlier reorder box on the packing slip (Oct 14)
- Stephen asked for wording that sounds less like a chore.
- The heading changed from "Need a reorder?" to **"When it's time to get more!"**.
- The QR label changed from "Scan to reorder" to **"Scan to get more"**.
- The line now reads: "Scan the code to send <rep> your order. Your imprint IDs are already filled in, so it prints exactly the same."
- Nothing else changed. reorder.html (the page the QR opens) still says "Reorder".

## v154 — packing slip for any order + iPads stay current (Oct 14)
- **Why:** an iPad still said it couldn't find order 10901 (and 10906) after v152 shipped. Both orders are in Airtable, both Completed, and v153 only says "not found" when Airtable has no such order. So the iPad was almost certainly still running an older version: home-screen apps can stay open for days without reloading. Nothing showed the version, so nobody could tell.
- **Version on screen:** the Refresh button now shows "v154".
- **Stays current:** Catching checks which version `pine-catching.html` points to on Refresh, when the app comes back to the front, and every 15 minutes.
  - If there's a newer one and nothing is mid-catch, it reloads into it. Practice (`?practice=1`) is kept.
  - If something is mid-catch, a black **"New Catching version · Update now"** bar shows instead.
  - Old iPads need one last manual restart to get v154: swipe the app away and open it again.
- **Completed tab:**
  - **Any order** box at the top: type an order # and tap 🖨 Packing slip. It works for any order, any day, any status. It looks the order up in Airtable by number. A wrong number says "No order 55555 in Airtable".
  - Each completed order's header also gets a 🖨 Packing slip button.
  - The summary now says "N jobs today", since the tab only lists today's catches.
- **Browser tabs** (not the home-screen app): the slip window opens right away, before the Airtable lookup, so Safari doesn't block it as a pop-up.
- **Tested** with mocked Airtable:
  - lookup of 10901 opens the slip in a browser tab and in the home-screen overlay
  - 55555 gives the not-found message
  - the Order complete card path still works
  - the update check reloads when idle and shows the bar when busy
  - no errors

## v155 — logo back in the packing-slip PDF; leave items off the slip (Oct 14)
- **Logo missing from the 📄 PDF on the iPads:**
  - The slip's line logo (since v145) is an SVG with no width/height. iPad Safari draws a size-less SVG blank onto a canvas, and the PDF is made from a canvas (html2canvas). So the logo vanished from the PDF while showing fine on screen and in Print.
  - Now the PDF uses a PNG copy of the logo built into the app (`PINE_LINE_LOGO_PNG`), and the SVG has a real size too.
  - Tested by making Chromium skip SVGs on canvas the way Safari does: v154's PDF corner had 1,380 dark pixels (no logo); v155's has 10,105 (logo).
- **Leave items off the slip** (Stephen: part of an order may have shipped earlier):
  - Every item on the slip has **✕ Leave off**. The item collapses to a dashed, struck-through strip with **↺ Put back**, and the top bar says "1 item left off".
  - Left-off items don't print and aren't in the PDF. The buttons never print. The PDF rebuilds after each change.
  - Only the slip changes. Nothing is written to Airtable.
- **Tested** with mocked Airtable: 4 items → leave 1 off → print media shows 3 items and 0 buttons, PDF capture shows 3. The order-card slip path still opens with no errors.

## v156 — logo in the PDF on Safari too (Oct 14)
- Stephen: after v155 the logo showed in the PDF on Chrome, but still not on Safari.
- **Cause:** v155 swapped the logo to a PNG inside the copy of the page that html2canvas captures. Safari keeps reporting the old (SVG) source until the new image finishes loading. html2canvas reads that and still draws the SVG blank.
- **Fix:** the capture now doesn't draw the logo at all; it's hidden in the capture. After the page image goes into the PDF, the PNG logo is stamped onto page 1 at the same spot with jsPDF. That takes no canvas or browser image step, so it works in any browser.
- **Tested** with mocked Airtable by rendering the finished PDF with pdf.js and checking the logo corner:
  - Normal Chromium: v155 and v156 both have the logo.
  - With every image blocked from canvas, as a worst-case Safari: v155 has no logo (317 dark px) and v156 has it (3,010 dark px). See the screenshot check in `logo156t.js`.

## v157 — department handoff on mixed orders (Oct 14)
**Why (Stephen):** each department packs its own work. Embroidery packs on its desktop. Catching packs apparel and bandanas on the iPads. All-heat-press orders get packed by Heat press. Mixed orders usually ship together but sometimes split, and today nothing on screen connects the departments.

**New Airtable field (agreed with Stephen 10/14):** Orders › **Packing Handoff** (`fldu2NmUdYx6yd9DU`, long text).
- One line per handoff, e.g. "Oct 14 3:10pm · 👕 Apparel done · 85 pcs · 2 boxes · Shipping prep".
- Shorts and extras are NOT kept here. They stay on the Line Items (final per size, extras, extras sent), and the slip reads them from there.
- No automation watches the field.

**What the app does:**
- **Departments** come from the imprint's press: 👕 Apparel (P1, P2, Flatstock), 🧵 Embroidery (Tajima) and 🔥 Heat press (heat press, D3, hat press, tag press).
  - Who's done comes from the imprints' Caught flags in Airtable, so the Embroidery desktop and the iPads always agree.
- **Header chips on mixed orders,** e.g. "👕 Apparel ✓ · 2 boxes · Shipping prep · 🧵 Embroidery · not done yet (you)" with "whoever finishes last packs it". One-department orders look the same as before.
- **Finishing first is a handoff card:**
  - "Apparel's part is done · still waiting on Embroidery".
  - Number of boxes (− 1 +) and **Pick-Up / Shipping prep** (set by default from the shipping method), then **✓ Hand off**, which writes the line.
  - No customer slip. The order goes to Partially Completed, same as before.
- **Ship my part now instead:**
  - It confirms first, then logs "shipped separately (Shipment 1)".
  - The slip opens with the other department's items left off and says "Shipment 1 · the rest of your order ships separately".
- **Finishing last is "You're packing this order":**
  - A checklist built from the handoff lines, e.g. "☐ Add 👕 Apparel's 2 boxes from Shipping prep".
  - 🖨 Packing slip unlocks only when everything is ticked. The slip covers all departments' items, with shorts and extras from the Line Items.
  - It logs "packed the whole order". If a part shipped earlier, the checklist says so, those items are left off, and the slip says "Shipment 2".
- **Bug fixed along the way:** on a mixed order with both parts scheduled the same day, finishing a department's last item jumped to the other department's job, even on a different press tab, and the order card never showed. Now "done" is judged per department.
- **Slip support:** items can start out left off (`_slipOpts[order] = {leaveOff, note}`), with a custom bottom note.
- **Tested** with mocked Airtable, P1 + Embroidery on order 90010:
  - Apparel first: handoff of 2 boxes to Shipping prep, then Partially Completed.
  - Embroidery last: the checklist locks the slip until ticked; the slip has tees and hats; logs "packed the whole order"; then Caught – Awaiting Ship.
  - Ship my part now: the hats are left off and the note says Shipment 1.
  - Regression checks pass: single-department order card, Completed-tab search, slip in both the browser and home-screen app. No errors.

## v158 — opened from Operator ("Catch it →") (Oct 14)
- `?press=em|ht&job=<imprint record id>&from=operator` (sent by Operator v126):
  - **One press only:** the other press tabs are hidden, and the iPad's saved press choice isn't changed.
  - **Opens that exact job.** It loads even if it wasn't scheduled for today (Embroidery and Heat press run from an open queue): load asks Airtable for today's imprints OR that record.
  - Already caught? It shows "already caught ✓", with the order under Completed.
  - **← Operator** button in the top bar closes the tab back to Operator, or goes to `pine-operator.html`.
- The self-update keeps those parameters.
- **Tested** with mocked Airtable:
  - Embroidery job 90010 opens on its own with only the Embroidery tab showing and the back button visible.
  - Saved press is untouched.
  - The pack-the-order flow runs end to end from there.

## v159 — Pine style v2, self-update fix, Completed counts right away (Oct 15)
- **Pine style v2:** Poppins Black and `pine-style-v2.css`. Only black, white, cream and Pantone 107 yellow are used. Red shows only for damage counts, errors and "set shipping". Nothing is under 12px. Main floor buttons are 56px.
- **Top bar:** the same black bar as the other apps: Pine logo, CATCHING, the version (v159) and the Practice pill.
  - Press tabs have each press's Schedule color dot. On the iPad they use short names (P1, P2, Flat, Embroidery, Heat), so all six fit on one row in landscape, even in practice. In v158, Heat Press was cut off.
  - A press with nothing to catch shows no number.
  - "Active" is gone: tapping a press is Active. Completed sits after the presses.
  - The 🔑 button only shows until a token is set. After that, "Change Airtable token" is at the bottom of Completed.
  - The practice pill is the reset button.
- **Work screen:**
  - Order # is a black-and-yellow badge, and the title is in Poppins.
  - **✓ Done** is the one yellow button. A picked size is yellow.
  - Counted reasons turn black with a yellow number. Team reasons are white, Other is cream and Unsure is dashed, so the two buckets stay apart without red and amber.
  - The − button moved to the bottom corner, so it no longer covers the reason name (e.g. "MILL FLAW").
  - The work screen is tighter, so the Jawn / Unsure / Undo row fits on a 1024×768 iPad without scrolling.
  - Embroidery's 4-across reasons no longer overlap the Other row.
- **Pop-ups and toasts** (order complete, hand off, pack, review, sort the unsure pieces, proof viewer, update bar) all use the shared look.
  - The order # is the one big number.
  - Next ▸ is yellow on the order card. On the pack card, the slip is yellow once everything is ticked.
- **Completed tab:**
  - Poppins title and a big "N jobs caught today" number.
  - The any-order box is labeled "Packing slip for any order".
  - The order # on each card is gone, since the order header already shows it. Imprint IDs are badges.
- **Self-update bug:** v154–158 counted any open job as "mid-catch". The work screen always has a job open, so iPads never moved to a new version by themselves.
  - Now `pineBusy` is true only when someone is mid-task: a tap in the last 3 minutes, the Undo window, a save in flight, an open pop-up or slip, or typed text.
  - Tallies already survive a reload (v146), so an idle iPad reloads into the new version. `?practice=1` and the Operator parameters are kept.
- **Bug: a line item caught on this iPad disappeared from both lists until Refresh.** It now moves to Completed right away. That fixes:
  - the Completed count and list
  - the line-item list's "n/N" (it said 1/1 instead of 2/2)
  - the order card's damage count
  - the **Packing Handoff** line, which only counted the last line item ("30 pcs" instead of "57 of 60 pcs (3 short)")
- Also: the page no longer scrolls 56px under the work screen (padding left over from the old sticky submit bar).
- **Not changed:** Airtable reads and writes; the printed packing slip.
- **Tested** with mocked Airtable (Playwright) at 1024×768, 768×1024, 390×844 and 1440×900.
  - Flows: tally → Review → Done → next line item → hand off (mixed order) → pick-up order card → bandana → Completed. Also Embroidery opened from Operator → pack card checklist → slip, and Unsure → sort the unsure pieces.
  - Live-mode writes are identical to v158, except the corrected handoff text. Practice sends no writes.
  - Update check: idle iPad reloads with the job open; busy shows the bar.
  - No page errors and no text under 12px.

## v160 — bandana headline says what's left to catch (Oct 15)
- **Why:** before anything was caught, the bandana headline said "0 · ORDER COMPLETE". Sizes nobody has tapped count as caught, so the screen claimed the order was done before the catcher started.
- **Now:**
  - Until the line item is Done, it says "**50** TO CATCH" (the line item's pieces).
  - Once damage is tallied, it still says "N more to print to complete".
  - After Done, the existing wording shows.
- Other job types don't have a headline like this. The Done button's "30/30 caught" is a preview of what Done will save, so it stays.
- **Tested** with the v159 mocks at 1024×768, 768×1024 and 390×844, before and after:
  - Live writes are identical to v159 in the main, pack, unsure and bandana flows.
  - Practice sent 0 writes.
  - No page errors.

## v161 — Pine page kit around the work screen (Oct 15)
- **Why:** Stephen wants every app to feel the same (`pine-style-v2.css` "PAGE KIT"). The tally/work screen is purpose-built and stays as it was.
- **Top bar:**
  - Logo · CATCHING · version · yellow "Practice" tag.
  - The presses are the app's views (`.p-bar-views`), each with its color dot and job count. Completed is a view too. On a narrow iPad the presses use short names, and on a phone they get their own row.
  - Then ↻ Refresh (the word hides on the iPad) and ⚙.
- **⚙ menu:**
  - Airtable token: Change / Add token. A yellow dot shows on ⚙ while no token is set.
  - Practice mode: Turn on / Turn off, which reloads with or without `?practice=1`. Reset practice tallies sits here while practice is on.
  - These replace the old practice pill and the 🔑 "Change Airtable token" link at the bottom of Completed.
- **Completed:**
  - A `.p-head` with "Completed" and "N jobs · N pcs caught today".
  - "Packing slip for any order" is the one yellow button.
  - Each order is a `.p-lc` card: order #, customer, garments, Jobs/Pcs, and a ✓ Caught time. Its own 🖨 Packing slip button is plain.
  - A card opens in place, one at a time, to show its line items: imprint IDs, location, pcs and time. Tapping one shows the proof.
- **Order complete / hand off / pack pop-ups:** one `.p-modal` shell.
  - Title plus the order # badge, then a body, then actions at the bottom right with the main one last: Next ▸ / ✓ Hand off / 🖨 Packing slip.
  - Undo and "Ship my part now instead" are quiet links.
- **Not changed:** Airtable reads and writes, the work screen, the self-update.
- **Tested** with mocked Airtable at 1024×768, 768×1024 and 390×844.
  - Live writes are identical to v160 in the main, pack, unsure and bandana flows. Practice sent 0 writes.
  - ⚙ opens, closes on an outside tap, and practice on reloads with `?practice=1`.
  - The idle self-update still reloads, and no page errors.
