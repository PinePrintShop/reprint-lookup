# Always-latest links (iPads and computers)

## Which device each app is built for (Stephen, 2026-10-15)
- **iPad (floor, touch, 56px buttons):** Operator, Catching.
- **Desktop (mouse, wide screens, use the full width):** Purchasing, Receiving, Seps, Screens, Ink, Damage Log.
- **Also desktop** (Stephen confirmed): Schedule, Price-O-Matic, Line Item Review, Create order, KPIs, Reprints lookup, Reconnect.
- **Reviews:** desktop-first for leads and admins (Results, Check-ins, Setup); phone-first for everyone's own forms.
- **Wall TV:** Production Board.
- Pine Central: not listed yet.
- Every app still has to work on an iPad and a phone. The list sets which layout gets designed first and tested hardest.

## 2026-10-12
**Problem (Stephen):** updating an iPad meant opening the new version's link, adding it to the home screen, deleting the old icon, and pasting the Airtable key again. On iPad, each home-screen icon has its own storage, so a new icon starts with no key.

**Fix:** one permanent link per app. It forwards to the current version and keeps `?practice=1`, `?order=` and so on. Add the icon **once** and paste the key **once**. After that, every update shows up the next time the app is opened, and the key stays because it's still the same icon. Every app saves the key as `pine_at_key`.

| App | Permanent link | Opens now |
|---|---|---|
| Operator | `pine-operator.html` | v139 (signed packet = ✓ Signed; skipped mockup initials are a grey note) |
| Catching | `pine-catching.html` | v182 (the Line items list stays where it was when you tap a line item; a print whose line item isn't on an order doesn't show) · v181 (a line item done on a shared print shows done on both Catching iPads: Imprints › Caught Cards; 11022) |
| Damage Log | `damage-log.html` | v25 (+ Add damage for damage found after Catching) |
| Ink Queue | `pine-ink-queue.html` | v108 (signed packet = ✓ Signed; one signed row per colourway) |
| Purchasing | `pine-purchasing.html` | v124 (Tab moves between Blank cost boxes) · was v123 (View email shows the email in the app, no Google sign-in, with worker v55; Backorders tab since v121) |
| Receiving | `receiving.html` | receiving-dashboard v91 (Re-prints tab: line cards open to the re-print sizes; "Replacements received" ticks Replacements Received?, which posts the re-print Slack message) |
| Shipping (desktop, shipping computer) | `pine-shipping.html` | v12 (shared side panel) |
| Production Board | `pine-production-board.html` | v48 |
| Seps | `seps.html` | v55 (splits signed packets into line pages in the background; signed packet = ✓ Signed; one signed row per colourway) |
| Screens | `screens.html` | v37 (signed packet = ✓ Signed; one signed row per colourway) |
| Day Fill | `pine-day-fill.html` | v15 (replaced by Schedule) |
| Schedule | `pine-schedule.html` | v38 (sales rep in job details) · v37 (search finds printed jobs; grey = ✓ Printed) · v36 (quieter PP suggested pill) · was v35 |
| Pine Central | `pine-central.html` | v176 |
| Price-O-Matic | `price-o-matic.html` | v119 |
| Line Item Review | `pine-line-item-review.html` | v64 (one card per order on Ready to send; Preview approval under Send for signature; ⋯ menu) |
| Create order | `create-order.html` | v30 (side panel standard) |
| Reconnect (was Sales Targets; desktop office app) | `reconnect.html` | v7 (shared side panel; totals in one strip) |
| KPIs (desktop office app) | `pine-kpi.html` | v24 |
| Reprints (desktop office app) | `reprints.html` | v10 (side panel standard) |
| Order (desktop first; internal order status page that every app will link to) | `order.html` | v2 (simpler: status bar + blockers + big mock-ups, Open in… menu; read-only) · was v1 (imprints, line items, issues, notes) |
| Sep Maker (desktop, art dept) | `sep-maker.html` | v61 |
| Laser Prep (desktop, art dept: sep PSD ready for the Saati 8012 / Xitron) | `laser-prep.html` | v1 |
| Mockup Maker (desktop, art dept) | `mockup.html` | v294 (a clip label proof dropped in opens as the label art instead of the old-proof puller) · v293 (embroidery proofs with a size tag: the tag goes under the garment, clear of APPROVED; the hoodie length mark moves on your own photos; a clip label proof PDF opens as just the label art, with its size and colour) · v292 (long-sleeve tees, crews and hoodies get a long flat sleeve sized for the size, long sleeve prints keep their size, the sleeve print stays on the front photo; sleeve placement "below shoulder seam" again) · v291 (black art = Black, white = White) · v290 (sign-in warning names what Airtable refused) · v289 (ink suggestions: names from the file, the proof or the order first; else the closest ink mixed in this garment's type (OW / DC / direct) within ΔE 8, "in stock · ΔE 5"; else the nearest, "not in stock"; "Multiple Locations" imprints: "Prints on: Front / Back / Left sleeve / Right sleeve / Left chest" per garment, guessed from the art's file name or notes; "Texture: Keep all / Dots / Smooth" for distressed art: Keep all sends the art's own soft grain in every ink layer and the BASE; Upscale / Trace always shown; traced art sends a vector `…-TRACED.ai`, one group per ink, with the PSD; trace Clean-up Fine / Normal / Clean; "Handles in front": mark a bag's handles or straps on the photo so the print sits behind them; an editable copy of the proof for Illustrator, "… (editable).pdf", next to the proof in Drive and on Download; Pick up brings the proof back exactly; bigger Visual center warning; BASE layer in the setup PSD) |
| Sticker Proof (now in Mockup Maker) | `sticker-proof.html` → `mockup.html` | – |
| Topo Packing (desktop office: carton labels + packing list) | `topo-pack.html` | v12 (reads POs with an Expected Receipt Date column) |
| Approve (customer page: order approval + signing, prototype) | `approve.html` | v19 (signed copy: initials only in the boxes) |
| Reviews (office: performance reviews + quarterly check-ins; people open it from their personal link `reviews.html#k=…`, phones too) | `reviews.html` | v1 |
| Worker copy (phone: paste the newest worker into Cloudflare) | `worker-copy.html` | – |

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
