# Pine Central — Vision & Roadmap

Living document. Update it as decisions are made. Last updated: 2026-09-29.

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
| 2. Shell + easy apps | Nov 2026, ~4 wks | Sidebar shows only permitted apps; migrate Reprint Lookup, Floor Status, Lunch Punchclock, Day Fill, KPI, Shipping. Standalone apps keep working in parallel |
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
- Reprints link back to the thread explaining why.

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

## Open questions

- Login style: PIN on shared tablets, Google sign-in, or both?
- Devices: shared stations vs. personal phones/computers?
- Who uses which apps? (Phase 0 inventory)

## Idea backlog

_Add new Pine Central ideas here as they come up._
