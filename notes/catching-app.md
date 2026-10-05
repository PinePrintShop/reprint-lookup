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
