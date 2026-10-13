# Always-latest links (iPads and computers)

## 2026-10-12
**Problem (Stephen):** updating an iPad meant opening the new version's link, adding it to the home screen, deleting the old icon, and pasting the Airtable key again. On iPad, each home-screen icon has its own storage, so a new icon starts with no key.

**Fix:** one permanent link per app. It forwards to the current version and keeps `?practice=1`, `?order=` and so on. Add the icon **once** and paste the key **once**. After that, every update shows up the next time the app is opened, and the key stays because it's still the same icon. Every app saves the key as `pine_at_key`.

| App | Permanent link | Opens now |
|---|---|---|
| Operator | `pine-operator.html` | v125 |
| Catching | `pine-catching.html` | v151 |
| Damage Log | `damage-log.html` | v17 |
| Ink Queue | `pine-ink-queue.html` | v94 |
| Purchasing | `pine-purchasing.html` | v105 |
| Receiving | `receiving.html` | receiving-dashboard v72 |
| Production Board | `pine-production-board.html` | v41 |
| Seps | `seps.html` | v34 |
| Screens | `screens.html` | v21 |
| Day Fill | `pine-day-fill.html` | v15 |
| Pine Central | `pine-central.html` | v170 |
| Price-O-Matic | `price-o-matic.html` | v105 |
| Line Item Review | `pine-line-item-review.html` | v16 |
| Create order | `create-order.html` | v7 |

Base: `https://pineprintshop.github.io/reprint-lookup/`

**One-time switch per iPad:**
1. Open the permanent link in Safari.
2. Share › Add to Home Screen.
3. Open the new icon and paste the key once.
4. Delete the old versioned icon.

**Picking up an update:** close the app (swipe it away) and open it again. GitHub Pages can take up to about 10 minutes after a release to serve the new page.

**When shipping a new version:** change the one `location.replace('…')` line in that app's permanent link (CLAUDE.md says so too).

`receiving.html` is used because `receiving-dashboard.html` is an old full copy of the app. `pine-scheduler.html` and `pine-lunch-punchclock.html` are also old full apps, so they got no permanent link.
