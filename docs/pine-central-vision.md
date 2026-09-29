# Pine Central — Vision & Roadmap

Living document. Update it as decisions are made. Last updated: 2026-09-29.

## Glossary (use these words consistently)

| Term | Meaning |
|---|---|
| **Reprint** | Fixing a mistake. Pine redoes work that went wrong (misprint, wrong garment, damage). Costs Pine money and is tracked in KPI. |
| **Reorder** | A client orders a design they've already printed with Pine. New revenue; reuses existing art, seps and screens info. |

Current usage in the apps (checked 2026-09-29):
- Operator, Catching, Purchasing and KPI already use **reprint** correctly.
- Sales Entry already uses **reorder** correctly.
- **The "Reprint Lookup" app is actually a reorder tool.** It finds a past imprint so a client can
  print it again ("New Imprint ID (the reorder)"). It becomes **Reorder Lookup** in Pine Central.
- Receiving's "Reprint Label" button means printing a label again, a third meaning. Rename it
  to "Print label again" to avoid confusion.
- The GitHub repo is named `reprint-lookup`; it can be renamed later (GitHub redirects old links).

## The goal

One app, **Pine Central**, replaces the separate department apps. Every employee logs in and
sees only the apps they need. Some people use several apps; each person's access is set individually.

## Where things stand today

- ~20 standalone HTML apps (Operator, Production Board, Receiving, Ink Queue, Catching, Seps,
  Screens, Price-o-matic, Scheduler, Purchasing, Sales Entry, Shipping, Day Fill, KPI, Reprint
  Lookup, etc.), each kept as many `vNN` copies.
- All apps use one Airtable base: `appJkaLk8DykjsgHR`.
- `pine-central-v170.html` already has a sidebar, a hardcoded employee list with roles, and a
  "view as" picker. It is **not real login**: anyone can pick any name.
- Each browser holds a full Airtable key in `localStorage` (`pine_at_key`). Whoever has the key
  can read and change the whole base, so a login screen alone would only hide menus.
- Cloudflare Worker **`pine-workers`** (v11) already proxies vendor APIs with secrets kept
  server-side: S&S (default route), AS Colour, SLC, SanMar, ShipStation, and a read-only
  Airtable lead-time route. This is the natural home for Pine Central's backend.

### Known risk (fix before or during Phase 1)

`pine-workers` has no authentication and allows any website to call it (`Access-Control-Allow-Origin: *`).
Anyone with the URL can use Pine's vendor accounts. The ShipStation route forwards any request,
including buying and voiding labels. Stopgap: restrict origins and lock down ShipStation
write calls. Full fix: require a Pine Central login session on every route.

## Architecture direction

- **Frontend:** Pine Central shell plus one module per department app.
- **Backend:** `pine-workers` on Cloudflare holds the Airtable key and vendor credentials,
  checks the logged-in user, and enforces what each role may read or write.
- **People and permissions:** an **Employees** table in Airtable (name, role, PIN or email,
  allowed apps). Staff are managed in Airtable, not in code.
- **Sessions:** Cloudflare KV.
- **High-volume data** (messaging): Cloudflare D1. Airtable allows about 5 requests/second per
  base, which messaging would exceed.
- **Source control:** one current file per app, with history in git instead of `vNN` copies.
  The Worker code is kept in this repo too.

## Roadmap

| Phase | When (target) | What |
|---|---|---|
| 0. Cleanup | Early Oct 2026, ~1 wk | One current file per app; old versions to `archive/`; Worker code into repo; inventory of who uses which apps |
| 1. Real login | Oct 2026, ~2–3 wks | Employees table, login (PIN and/or Google), sessions in KV, Worker enforces permissions; secure vendor routes |
| 2. Shell + easy apps | Nov 2026, ~4 wks | Sidebar shows only permitted apps; migrate Reorder Lookup (today's "Reprint Lookup"), Floor Status, Lunch Punchclock, Day Fill, KPI, Shipping. Standalone apps keep working in parallel |
| 2.5 Order messaging pilot | Dec 2026, ~3–4 wks | See below. Pilot with Production + Pre-Press |
| 3. Heavy apps | Dec 2026 – Jan 2027, ~8 wks | Operator, Production Board, Receiving, Ink Queue, Catching, Seps, Screens, Price-o-matic, Purchasing, Sales Entry; shared code pulled into common files |
| 4. Cutover | Feb 2027 | Retire standalone apps and browser Airtable keys; audit log of who changed what; per-person home screens; cross-department job timeline |

Timeline assumes steady weekly work sessions. Each phase delivers value on its own.

## Feature: Order Messaging

**Rule:** every conversation belongs to an order. No general channels. Strictly internal, never
customer-facing.

### Message types
- **Ask:** assigned to a person or a department; stays open until closed.
- **Blocker:** flags the order red on the Production Board until resolved.
- **FYI:** a note.
- **Reply:** threaded under any of the above.

The order header shows counts, e.g. "2 open asks · 1 blocker".

### Assignment
- `@Person` goes to that person only.
- `@Department` (e.g. `@Pre-Press`) goes to the department; whoever clicks **"I've got it"** claims it.
- Unclaimed department asks are highlighted in that department's inbox.

### Closing (only the asker closes)
1. **Open**: assigned.
2. **Done, needs review**: the assignee marks it handled.
3. **Closed** by the asker, or **Reopened** with a note.
- The asker is reminded after 1 workday in review.
- Management can close any ask (e.g. the asker is out).

### Other pieces
- Messages can be tied to a specific imprint (Front, Left sleeve…), not just the order.
- System events are posted automatically (screens burned, blanks received, printed, shipped),
  so the thread is also the order's timeline.
- **"My Asks" inbox** across all orders, for a person and their department.
- Reprints link back to the thread explaining why. Reorders link to the original order's thread.

### Moving off Slack and Airtable comments (where order talk happens today)
1. Import existing Airtable record comments into each order's thread.
2. Slack as a doorbell: DM on new ask, blocker or review request, with a link to the thread.
   The conversation itself happens in Pine Central.
3. Gradual cutover: order talk in Slack is redirected to the order. Slack stays for general chat.

### Storage and delivery
- Messages in Cloudflare D1; each Airtable order gets "open asks" / "last message" summary fields.
- Polling every few seconds for the pilot; Durable Objects later if it needs to feel instant.
- Depends on Phase 1 login (messages need a real author).

### Deferred
- Floor photos (Cloudflare R2).
- Instant live updates.

## Feature: Smart QR codes (job traveler)

**Today:** QR codes on Receiving labels and job sheets open the order's PandaDoc. That's useful
for customers, not the team, and anyone who scans a box can see the order's details.

**Idea:** the QR encodes a Pine Central order link, not the PandaDoc.
- **Logged-in employee scans:** the order opens at its current step, with the thread, open
  asks and the next action for their department.
- **Anyone else scans:** they see nothing useful (a "Pine Print Shop" page), and no order data is exposed.
- **Scan actions:** scanning at a station does the common thing in one tap. Receiving marks
  boxes received, a press starts or stops the job (feeds the Live Floor view), and Shipping
  opens the ShipStation label flow.
- The PandaDoc QR is dropped entirely. It solved a problem that no longer exists (decided 2026-09-29).

## Feature: Live Floor view

Builds on the existing Floor Status app (machines running). Adds **who** is on each machine
and **which job**, fed by QR scans at the press and by the Operator app. Can run on a TV
in kiosk mode. One shift, so there is no shift-handoff feature.

## Feature: Garment issue flag (missing / wrong garments)

**Today:** the issue is entered in Airtable, then a Slack automation pings people.

**Idea:** a **"Flag garment issue"** button on the order (or from a QR scan) that:
- Captures structured details: missing or wrong, style / color / size, quantity. Operator's
  existing "Wrong garment" reason feeds the same flow.
- Automatically opens a **Blocker** in the order thread, assigned to @Receiving / @Purchasing,
  and turns the order red on the Production Board.
- Sends the Slack DM "doorbell" (replaces the Airtable to Slack automation).
- Checks replacement stock at S&S / SanMar / AS Colour / SLC through `pine-workers`,
  so Purchasing sees availability right away.
- Is resolved when replacements arrive, which closes the blocker and logs how long the job was held.

## Feature: Personal home screen

- Each person lands on **their** screen: their queue, open asks, today's schedule. There's always
  a Home button to return to it.
- Fun and interactive: shop stats for the day (pieces printed, jobs shipped, on-time rate),
  personal stats, a random fact of the day, maybe birthdays and milestones.
- The app menu is still one tap away.

## Feature: Reprint cost tracking

Reprints only (Pine's mistakes), never reorders. **Today:** an Airtable view. **Idea:** tighten it into KPI.
- One standard list of reprint reasons shared by Reprint Lookup, Operator and the garment flag.
- Every reprint logs reason, cost (blanks + labor + ink) and links to the order thread.
- KPI shows the trend by reason, department and machine, so you can see what's causing reprints.

## Open questions

- Login style: PIN on shared tablets, Google sign-in, or both?
- Devices: shared stations vs. personal phones/computers?
- Who uses which apps? (Phase 0 inventory)
- Reprint tracking: what does the current Airtable view track, and what's missing?

## Idea backlog

_Add new Pine Central ideas here as they come up._
