# Pine Central — Vision & Roadmap

Living document. Update it as decisions are made. Last updated: 2026-09-30.

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

## How an order flows today (confirmed 2026-09-30)

1. **Ordered** is clicked. The job appears on the **Seps**, **Ink** and **Receiving** dashboards at the same time.
2. **Schedule** happens soon after ordering. The print date sets the order of work on every dashboard.
3. Three lanes work toward the print date in parallel:
   - **Garments:** Purchasing orders blanks, then Receiving. Usually the slow lane.
   - **Art:** Seps. When a sep is done, the job appears on the **Screens** dashboard.
   - **Ink:** Ink Queue.
4. All three lanes must be ready by print day, then **Print → Catch → Ship**.

**Idea: at-risk check.** Every scheduled job shows three lights (garments / art / ink). If a lane
isn't done a set number of days before the print date (e.g. garments not received 2 days out), the
job is flagged **at risk**: a Blocker in its thread, highlighted on the schedule and on that lane's
dashboard. The scheduler sees problems before print day, not on it.

## Architecture direction

- **Frontend:** Pine Central shell plus one module per department app.
- **Backend:** `pine-workers` on Cloudflare holds the Airtable key and vendor credentials,
  checks the logged-in user, and enforces what each role may read or write.
- **People and permissions:** an **Employees** table in Airtable (name, role, PIN,
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
| 1. Real login | Oct 2026, ~2–3 wks | Employees table, **PIN login** (decided 2026-09-30), sessions in KV, Worker enforces permissions; secure vendor routes |
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

## Press teams

Presses are run by teams (e.g. 3 people on Press 1), not one operator.
- Today the Imprints table has a single-select **Operator** (one name), so crew credit and stats are wrong.
- **Station mode:** the tablet at each press is logged in as the station ("Press 1"), and crew
  members tap in with their PIN at the start of the day. Swaps are one tap.
- Every scan at that press is credited to the whole crew on shift, which feeds per-crew and
  per-person stats (impressions/hour, setup time, spoilage).
- Airtable: replace the single-select Operator with a **Crew** link to Employees (multiple people).

## Scan-driven flow

Principle: **a scan moves the order to the next stage.** The apps stay for details (counts,
notes, issues), but nobody has to remember to tick a box.

**Hardware:** USB/Bluetooth 2D scanners (~$30–80 each) type like a keyboard, so they work in any
web app with no setup. A phone camera works as a backup. Each station gets a tablet + scanner.

**What gets a code:** job ticket (per imprint), box labels (the Boxes table already has Box IDs),
screen tags, inbound receiving labels. Each QR is a short Pine Central link (e.g. `/s/<id>`). A
phone camera opens the page; a scanner inside the app just reads the ID.

| Station | Scan | Moves to |
|---|---|---|
| Receiving | Inbound box / receiving label | Line item received; when all are in, the order becomes **Received & staged** |
| Screens | Screen tag / job ticket | Imprint **Screens burned** |
| Ink | Job ticket | **Inks ready** |
| Press | Job ticket (crew already signed in) | **Setup started** → **Running** → **Run finished**, timestamped and credited to the crew |
| Catching | Job ticket at the dryer | **Caught** (then enter counts in the app) |
| Packing | Box label | Box **packed** |
| Shipping | Box label | ShipStation label created; box **shipped**; order **Completed** when every box ships |

Seps and proofs are desk work, so they stay as buttons in the app, not scans.

## Status cleanup (from the Airtable review, 2026-09-29)

**Found:**
- **Order Status** has 16 options mixing four different things: stage ("Pre-press"), payment
  ("Sent - Awaiting Payment"), problems ("Delayed - Mis-Print - Needs Order") and combos
  ("Scheduled, Screened, & Inbound").
- Of 212 orders not Completed/Cancelled: **none** are in On-Press, Caught - Awaiting Ship, Shipped
  or any Delayed status. Orders go straight from "Received & Staged" to Completed, so the shop
  floor stages aren't really tracked at the order level.
- About **32 orders created 2022–2025 are still "Awaiting Proof"**, and 8 have no status at all.
- Real progress lives on **Imprints as ~20 checkboxes** (Sep'd, Screens Burned, CTS Printed, Inks
  Ready, Setup Started/Finished, Run Started/Finished, Quality Checked, Caught…). Most have no
  timestamp; only Caught has "Caught At".
- Reprints are tracked with **duplicate checkboxes** ([REPRINT] Sep'd, [REPRINT] Screens Burned…).
- **Orders** repeats Sep'd and Burned checkboxes that also exist on Imprints.
- Mis-ships use **5 checkboxes** on Line Items (Mis-Ship, In Progress, Shipped, Resolved,
  Replacements Received?), even though an **Order Issues** table with a Status already exists.

**Proposed:**
1. **Split status into separate fields:**
   - **Stage** (computed from scans, not set by hand): Awaiting proof → Awaiting payment → Ready to
     order → Garments ordered → Pre-press → Ready to schedule → Scheduled → On press → Caught →
     Packed → Shipped → Completed.
   - **Health**: On track / Blocked (from open blockers such as a garment issue or misprint).
   - **Payment**: already covered by Payment Received Date.
2. **Scan Events table:** one row per scan (who/crew, station, imprint or box, event, time). The
   checkboxes become formulas off this table, so existing views keep working, and every stage gets
   a timestamp. That gives real durations per stage and shows where orders wait.
3. **Reprints as their own run records** linked to the original imprint, replacing the [REPRINT]
   checkbox copies.
4. **Mis-ships and garment issues go through Order Issues** (with its Status), replacing the 5 checkboxes.
5. **One-time cleanup:** close or cancel the stale 2022–2025 "Awaiting Proof" orders and fix the 8 blank ones.
   Reviewed 2026-09-30: 59 stale/blank open orders found, grouped as paid-but-stuck (5), unclosed
   quotes (8), $0 shells (24), likely 2026 test orders (14) and blank (8). Left as-is for now.

## How errors, damages and reprint costs are tracked today (Airtable review, 2026-09-30)

**Tables**
- **Order Issues** (1,769 records since late 2024): one record per problem on a line item.
  Per-size counts ([RP] OSFA, XS…5XL), originator, category, QC reasons, accountability, photos.
- **Damage Details** (child of Order Issues, used on 766 issues): per-size counts again
  (D OSFA…6XL), its own reasons + accountability, attachments, AI photo summary.
- Rolled up to **Line Items** (DMGs per size, Spoilage %, Reprint Qty), **Imprints** (Reprint Qty),
  **Orders** (Total Damage Refunds) and **Operators** (Spoilage all-time / 30 days / this week).

**Key formulas**
- **Shipped %** = Total Final Quantity ÷ Line Item Total Quantity.
- **Resolution** (auto, can be overridden by "Change Resolution"):
  under 95% shipped → RE-PRINT; 95–100% → REFUND; bandanas have their own 5% rule for
  customer-initiated issues; otherwise NO ACTION.
- **Total Refund Due or Bandana Replacements** (the cost number):
  REFUND → missing pieces × price per piece; RE-PRINT → damaged pieces × **garment purchase cost by size**;
  bandana NO ACTION → 1.35 × OSFA count.
- **Spoilage %** = damaged ÷ ordered, rolled up to Operators.

**What the data shows**
- 2026 so far: 1,063 issues, ~8,300 damaged pieces, ~$25.6k in computed refunds/reprints
  (2025: 683 issues, ~7,800 pieces, ~$23.6k).
- Issues jumped from ~60/month to ~200/month in June 2026 (more QC logging, or more problems?).
- 86% are QC-initiated; 7% customer-initiated.
- Top reasons: Corner (358), Smudge (282), **Mill Flaw (264)**, Print Error (262), Dryer Grease (257),
  Wrinkle (151), Light Ink (119).
- Resolutions: NO ACTION 1,412 · REFUND 227 (~$18.4k) · RE-PRINT 130 (~$17.9k).

**Gaps**
1. **Reprint cost counts blanks only.** No labor, press time, ink, screens, re-shipping, so true cost is understated.
2. **Damage counts live in two places** ([RP] fields on Order Issues and D fields on Damage Details).
   Checked 2026-09-30: they agree on 762 of 766 issues. Only 2 issues (Aug 2026, 29 pieces) have
   counts in Damage Details alone, and 4 Damage Details records (1 piece) aren't linked to an issue.
   Not a real problem, but one place to count is still simpler.
2b. **The cost formula depends on Total Final Quantity**, which often isn't final when Catching logs
   an issue per line item. Found: 11 REFUNDs on lines under 50% shipped (~$7.3k, including three in
   Sep 2026 at $1,050–$1,225), 35 RE-PRINTs under 50% shipped (~$9.5k), 25 issues with a negative
   Shipped %, and one negative cost. Fix: base cost on the damaged pieces Catching actually reports,
   and decide refund vs reprint when the order closes.
   **Context from Stephen (2026-09-30):** many low-shipped refunds are real, whole-line refunds that
   aren't damage at all: a **missed deadline** where the customer no longer needed the items, or an
   **outsourced job made in the wrong material** (should have been polyester; the Sep 2026 refunds).
   The formula lands near the right number by accident (0% shipped means refund everything), but the
   records look like damage. The negative Shipped % ones still need a look.
3. **Reasons live in four fields** (QC Reasons, QC Reasons - Print Team, QC Reasons - Other,
   Damage Details Reasons); 1,003 issues have none in the first three. Accountability is blank on 1,003.
4. **Status is loose:** 182 blank, 184 "Awaiting Review".
5. **People are hardcoded in formulas** (salesperson email and Slack ID switches, Originator list),
   so every staff change means editing formulas.
6. **Imprints "Waste Rate" and "Damages (%)" are the same formula**; the reprint emoji depends on
   the old Order Status "Delayed - Mis-Print - Needs Order".
7. **Spoilage credits one Operator**, not the press crew.
8. **Mill flaws are the vendor's fault** but nothing tracks claiming credit back from S&S/SanMar/etc.

**Pine Central direction**
- One **Issue** record with a clear type. Not every refund is damage:
  - **Production:** misprint, garment damage in the shop
  - **Vendor:** mill flaw, mis-ship, **outsourced job wrong** (e.g. wrong material)
  - **Service:** **missed deadline**, customer changed their mind
  - **Customer complaint** after delivery
  Type drives who's accountable, whether a vendor/outsourcer claim is opened, and how cost is
  calculated (damaged pieces for damage; whole-line refund for deadline or spec misses).
- Missed-deadline refunds feed back into the **at-risk check** so the shop can see what they cost.
- Each issue record also has one reason list, one set of per-size counts, accountability (print crew, pre-press, vendor,
  shipping, customer), photos, resolution.
- **Full reprint cost** = blanks + press time (crew × minutes) + screens/ink + re-shipping.
- **Vendor and outsourcer claims** for mill flaws, mis-ships and outsourced jobs done wrong: tracked from flag to credit received.
- People and Slack IDs come from the Employees table, never from formulas.
- Crew-level spoilage from scan data; trends by reason, press, crew and customer in KPI.

## Issues v2: clean issue tracking (plan, 2026-09-30)

Goal: one clean way to record anything that goes wrong on an order, with the 1,769 existing
Order Issues brought over as history. Built in Airtable first so it's useful before Pine Central;
Pine Central later gives it a better screen, using the same structure.

### One table: Issues
| Field | Notes |
|---|---|
| Issue # | Autonumber |
| Reported by / Station | Person (Employees) and where: Receiving, Press, Catching, Shipping, Sales |
| **Caught by** | Us (press, catching, packing) or **the customer**. Customer-caught = an escaped defect |
| Order · Line Item · Imprint | Links |
| **Type** | Production · Vendor · Service · Customer complaint (required) |
| **Reason** | One list, grouped by type (required). Production: Corner, Smudge, Print Error, Light Ink, Out of Square, Dry-in, Dryer Grease, **Warping**. Pre-press: **Artwork / file issue**. Vendor: Mill Flaw, Mis-ship, Short shipment, Outsourced job wrong. Service: Missed deadline, Customer no longer needs it |
| Pieces by size | OSFA, XS…6XL, in **one** place only |
| Accountable | Suggested from type + reason, can be changed: Print crew, Pre-press, Receiving, Vendor, Outsourcer, Sales, Customer |
| Crew | Filled from the press scan when available |
| **Resolution** | Reprint · Refund · Credit · No action, chosen by a person (the formula only suggests) |
| Decided by / on | Who made the call and when |
| Costs | Blanks (auto) · Press time (later, from scans) · Refund amount · Total |
| Claim | Vendor/outsourcer · Status (none, filed, credited, denied) · Credit received |
| **Status** | Open → Decided → Done → Closed (never blank) |
| Photos, Notes | |

### Guardrails (stop bad data at the door)
- Type and Reason are required to save.
- Counts can't be negative; final quantity can't be negative or far above ordered.
- A refund can't be larger than the line's value.
- Status always has a value; new issues start as Open.
- Cost is computed from damaged pieces, not from ordered minus final.

### Moving the old data over
1. Build the Issues table next to Order Issues. Nothing old is deleted.
2. Point the Catching app at the new table (write to both for a few weeks).
3. Copy the 1,769 old issues in, mapping fields:
   - QC Reasons (all three fields) → Reason; Mill Flaw → Vendor, the rest → Production
   - Category / Originator → Reported by / Station
   - Resolution / Change Resolution → Resolution; old cost → Refund amount (marked legacy)
4. Anything that doesn't map cleanly goes to a **Needs review** list rather than being guessed:
   no reason (~1,000), negative Shipped % (25), refunds on low-shipped lines (11), no status (182).
   Old records that are never reviewed stay as "Legacy · unclassified" and don't pollute new reports.
5. Once the new table has run cleanly for a month, the old fields become read-only.

### Damage rate vs impressions (analysis, 2026-09-30)

Chart page: https://claude.ai/artifact/Kg2ZsLSxi1pgurqFtueAzD

- Jun–Sep: impressions 170.5k → 220.7k (+29%); damaged pieces 3,652 → 4,071 (+11%);
  damage per impression 2.14% → 1.84% (14% lower). Jan–May isn't comparable (2025 logging started in March).
- Spikes were single jobs redone in full on Press 1: Nov 2025 #8811 NDLON (264/250 bandanas; month
  is 2.3% without it), Feb 2026 #9333 Kate O'Hara (520 of 500 bandanas; month is 2.1% without it).
- **Bandanas (Carolina Creative 4800): 45% of impressions, 74% of damage, 3.43% rate vs 0.99% for everything else.**
- **Whole-run redos:** 41 line items damaged at ≥90% of quantity = 2,562 pieces (~18% of all damage); 21 on Press 1.
- By equipment (Jun 2025–Sep 2026): Press 2 2.82%, Press 1 2.32%, Hat press 2.38%, Finishing 1.15%,
  Embroidery 0.85%, Tag press 0.67%, Saturn 0.34%.
- Older issues have no reasons recorded, so why those runs failed isn't in the data. Issues v2
  (required reason + crew from scans) fixes that going forward.

- **Why bandana runs fail (from Stephen, 2026-09-30):** artwork problems, or the client rejects the
  whole order for errors we didn't catch, or for **warping**.
- **Checkpoints this suggests:**
  1. **Art check before screens:** proof vs. sep side by side, sign-off recorded in the thread.
  2. **First-piece approval at the press:** crew scans the job, prints one, photographs it, compares to
     the proof, taps approve. Blocks whole-run redos from art or setup errors.
  3. **Bandana QC at Catching:** a quick warp/square check on a sample from each run, logged.
- **New KPI: escaped defects** = issues caught by the customer ÷ all issues. Shows how much QC is missing
  before orders leave the shop.

## Open questions
- What is "Jawn"? Is "Wrinkle" a production issue or a vendor one?
- Who decides refund vs. reprint: Stephen, the salesperson, or either?
- Which outsource partners should be listed for claims?

## Open questions

- Devices: shared stations vs. personal phones/computers?
- Who uses which apps? (Phase 0 inventory)
- Reprint tracking: what does the current Airtable view track, and what's missing?
- Station tablets: which stations already have a screen, and which need one?

## Idea backlog

_Add new Pine Central ideas here as they come up._

- **Stuck order watchdog:** a daily check that flags orders that are paid but not moving, past the
  customer due date, or sitting in one stage too long. It posts a Blocker/Ask on the order and
  appears on the management home screen. (Prompted by the 2026-09-30 review, which found
  $6,800+ of paid orders stuck in "Ready to Order".)
