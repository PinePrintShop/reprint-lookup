# App triage: which app to clean up next (Oct 5, 2026)

Read-only reviews of the latest version of each main app, done the same way as the Operator cleanup. Line numbers refer to the file named.

## Ranking
| # | App (latest) | Who / how often | Needs cleanup | Effort | Why |
|---|---|---|---|---|---|
| 1 | **Catching** `pine-catching-v145` | Catchers at the dryer, all day | **8/10** | L | Can delete logged damage; duplicate issues; loads cut off silently; no 4XL–6XL damage |
| 2 | **Price-O-Matic** `price-o-matic-v92` | Sales, every quote | 7/10 | M | Wrong numbers → lost money: $0 transfers, negative prices, stale cart prices |
| 3 | **Ink Queue** `pine-ink-queue-v94` | Ink room, all day | 7/10 | M–L | Ink links wiped; duplicate inks; "No date" cards open blank |
| 4 | **Seps** `seps-v34` | Art dept, all day | 6/10 | M | Sep'd double-tap; failed saves show "saved"; ink adds overwrite each other |
| 5 | **Receiving** `receiving-dashboard-v72` | Receiving, daily | 6/10 | M | Practice-mode leaks; All Here partial failure; 6XL missing on job sheet |
| 6 | **Screens** `screens-v21` | Screen room, daily | 6/10 | M | Old notes overwrite new; Imaged double-tap; no phone/iPad layout |
| 7 | **Damage Log** `damage-log-v17` | Production manager, desk | 5/10 | M | Refund email can be sent twice; old open issues hidden by the date range |
| 8 | **Production Board** `pine-production-board-v41` | Wall TV | 5/10 | S–M | Never rolls to the next day; an `alert()` every 60s when wifi drops |

**Quick win: Pine Central's menu is out of date.** Only Reprint and KPI point at the latest version. Six links point at files that are no longer in the repo: Operator v24, Catching v97, Seps v8, Screens v10, Receiving v11 and Purchasing v68.

## Catching v145: top bugs
1. **Deletes damage that was already logged** (confirmed: 755, 3272–3279).
   - Tally counts live only in memory.
   - After a reload or a tab eviction, the card reopens at 0. "Mark QC Done" then *removes* the Order Issues and Damage Details written earlier (the written-keys list in localStorage says they exist; zero counts mean "removed").
   - Approved issues are not protected.
2. **Duplicate issue on Retry** (3226–3242): when the Order Issue is written but the Damage Detail fails, Retry creates a second Order Issue.
3. **No paging** (933, 1120): imprints are capped at 100 and orders at 50. Orders past 50 get no customer, shipping method or record ID.
4. **4XL / 5XL / 6XL** aren't read from line items (705–712), so their damage can't be logged.
5. **A failed Caught write still hides the card** until a full reload (3649).
- **Floor UX:** tiny tap targets (9–10px buttons), counts lost on sleep, too many steps per pile, no practice mode.

## Price-O-Matic v92: math bugs (reproduced in node)
1. An NA Supacolor size → the transfer is priced at $0 with no warning (1286/1319).
2. A size invalid for the recipe → $0 transfer (1286).
3. Combined with more fleece impressions than qty → negative price (1314).
4. A cart qty outside the price range keeps the old unit price (2665). Flatstock 20000 → clamped to $0.
5. Possible typos (unsure): Decopress Reflective 100–199 = 2.64 (Metallic is 1.64); the 5000+ row costs more than 2500 in both grids (1062).
- **Flow:** garment cost uses the lowest price across all colors; slow lookups can overwrite newer ones; the cart isn't saved.

## Ink Queue v94
1. "Add to Job" before the recipes load, or after they fail, unlinks every other ink (4178, 3265).
2. "No date" cards open blank (3172).
3. Double-tapping Add creates duplicate ink records (4109).
4. The save error never clears (2115).
5. Mark Ready can hit the next card after a re-render (4795, unsure).
- Opening a repeat job writes to Airtable automatically (3786).
- Recipe edits change the shared ink for every job without a warning.

## Seps v34
1. Double-tapping Sep'd / Order placed can leave Airtable false while the card vanishes (1547/1562, 1495).
2. Failed saves still flash "saved" (1939/1912).
3. A failed Sep'd save removes the card for good (1495/1562).
4. Two quick ink adds overwrite each other (4619).
5. TBA slot double-tap leaves orphan Inks records (4533).
- Unscheduled jobs drop off after 14 days (691).

## Receiving v72
1. Practice off doesn't reload, so fake receives still show (958).
2. An apostrophe breaks the proof viewer (867).
3. No 6XL on the job sheet (1608).
4. All Here batches aren't all-or-nothing (1301).
5. Undo ignores Practice (1334).
- No iPad/phone layout; a print modal after every line; pop-ups blocked on iPad.

## Screens v21
1. Old notes overwrite new ones after a re-render (966/721).
2. Notes failures look like success (1172).
3. Imaged double-tap (1043).
4. Ink list errors stick (2990).
5. The previous run's inks are written to the new job on reorder (3049, unsure).
- The color "Set" never saves; no token re-entry; no media queries.

## Damage Log v17
1. Re-tapping Approve during the write → duplicate refund email (806/554).
2. The email is sent before the issues are marked (640).
3. The date range hides old open refunds (270).
4. Issues with no order can't be opened (293).
5. Range loads aren't sequenced (824).

## Production Board v41
1. Never rolls to a new day (553/1815).
2. An `alert()` inside the 60s refresh (851).
3. Overlapping loads (840).
4. Dead "Done for the day" tap (1145).
5. Refresh kills Arrange drags (1815).
- All state is per device (cross-offs, crew, order).
