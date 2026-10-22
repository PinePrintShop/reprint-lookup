# Always-latest links (iPads and computers)

## Which device each app is built for (Stephen, 2026-10-15)
- **iPad (floor, touch, 56px buttons):** Operator, Catching.
- **Desktop (mouse, wide screens, use the full width):** Purchasing, Receiving, Seps, Screens, Ink, Damage Log.
- **Also desktop** (Stephen confirmed): Schedule, Price-O-Matic, Line Item Review, Create order, KPIs, Reprints lookup, Reconnect.
- **Wall TV:** Production Board.
- Pine Central: not listed yet.
- Every app still has to work on an iPad and a phone. The list sets which layout gets designed first and tested hardest.

## 2026-10-12
**Problem (Stephen):** updating an iPad meant opening the new version's link, adding it to the home screen, deleting the old icon, and pasting the Airtable key again. On iPad, each home-screen icon has its own storage, so a new icon starts with no key.

**Fix:** one permanent link per app. It forwards to the current version and keeps `?practice=1`, `?order=` and so on. Add the icon **once** and paste the key **once**. After that, every update shows up the next time the app is opened, and the key stays because it's still the same icon. Every app saves the key as `pine_at_key`.

| App | Permanent link | Opens now |
|---|---|---|
| Operator | `pine-operator.html` | v130 |
| Catching | `pine-catching.html` | v169 |
| Damage Log | `damage-log.html` | v23 |
| Ink Queue | `pine-ink-queue.html` | v104 |
| Purchasing | `pine-purchasing.html` | v112 |
| Receiving | `receiving.html` | receiving-dashboard v83 |
| Shipping (desktop, shipping computer) | `pine-shipping.html` | v11 |
| Production Board | `pine-production-board.html` | v48 |
| Seps | `seps.html` | v45 |
| Screens | `screens.html` | v30 |
| Day Fill | `pine-day-fill.html` | v15 (replaced by Schedule) |
| Schedule | `pine-schedule.html` | v25 |
| Pine Central | `pine-central.html` | v176 |
| Price-O-Matic | `price-o-matic.html` | v118 |
| Line Item Review | `pine-line-item-review.html` | v42 |
| Create order | `create-order.html` | v24 |
| Reconnect (was Sales Targets; desktop office app) | `reconnect.html` | v6 |
| KPIs (desktop office app) | `pine-kpi.html` | v24 |
| Reprints (desktop office app) | `reprints.html` | v6 |

Base: `https://pineprintshop.github.io/reprint-lookup/`

**One-time switch per iPad:**
1. Open the permanent link in Safari.
2. Share › Add to Home Screen.
3. Open the new icon and paste the key once.
4. Delete the old versioned icon.

**Picking up an update:** close the app (swipe it away) and open it again. GitHub Pages can take up to about 10 minutes after a release to serve the new page.

**When shipping a new version:** change the one `location.replace('…')` line in that app's permanent link (CLAUDE.md says so too).

`receiving.html` is used because `receiving-dashboard.html` is an old full copy of the app. `pine-scheduler.html` and `pine-lunch-punchclock.html` are also old full apps, so they got no permanent link.

## 2026-10-14 · Apps update themselves (`pine-update.js`)
**Problem:** home-screen apps stay open for days, so an iPad kept running an old Catching. Refresh only reloaded the data, and GitHub can cache pages for up to 10 minutes.

**Fix (Catching v154+, every app from its next version on):** the app checks its permanent link for a newer version on load, when it comes back to the front, every 15 minutes, and when Refresh is tapped. The check skips the cache.
- **Nothing in progress:** it switches to the new version by itself, keeping `?practice=1`.
- **Someone mid-task:** a black **"New version ready · Update now"** bar shows instead.
- **Version on screen:** each app shows its version, so anyone can see which one an iPad is on.

**How to add it to an app** (shared file `pine-update.js`):
```html
<script src="pine-update.js" data-link="pine-operator.html"></script>
<script>window.pineBusy = () => /* true while a form/catch/upload is open */ false;</script>
```
- Call `PineUpdate.check()` from the Refresh button.
- Show `'v'+PineUpdate.ver` somewhere small.
- Without `pineBusy`, the app never reloads on its own; it only shows the bar.

**After an app has it:** after a release, wait about 5 minutes, then tap Refresh or just switch back to the app. Only the first move onto a version that has it needs the old swipe-away-and-reopen.

**Status:**
- Catching: built in since v154.
- Every other app: added the next time it ships a version (rule in CLAUDE.md).
