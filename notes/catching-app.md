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
