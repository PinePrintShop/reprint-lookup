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
