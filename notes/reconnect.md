# Reconnect (was Sales Targets)

## 2026-10-15 · v4 + worker v23: Pipedrive owners, Patrick's exclusions, and a $1k floor for no-rep cold customers
**Stephen:** "yeah bring the Pipedrive worker route! Garrett still has a few clients he works with and sometimes Chris handles them...but Chris always marks them as Garrett. Yes 537 min spend of $1k is a good idea and a note that no rep is currently assigned...and to confirm before assigning"

- **New file** `reconnect-v4.html` (permanent link `reconnect.html` now opens v4; same settings and marks).
- **Pipedrive is on by default.** On every load the app reads worker v23's `GET /proxy/pipedrive/reconnect`, with the Airtable token as Bearer.
  - The orders show first. Pipedrive is applied when it arrives, which can take a few tries (see "Worker v23" below).
  - The header then says "Pipedrive: owners + last contact as of 3:42 pm".
  - If the worker is still v22 (it answers "Pipedrive path not allowed"), or the route fails, v4 works exactly like v3. ⚙ "Pipedrive checks" then says "Off — worker v23 not deployed" or gives the error.
  - `?pd=0` turns Pipedrive off.
- **With Pipedrive:**
  - **Rep = the Pipedrive organization owner.** Patrick Dawson → Patrick, Chris Hoffman → Chris, Garrett → Garrett.
  - Owners who have left show as **Unassigned (was …)** so Stephen can hand them out. That covers Josh and Stephen, plus older Pipedrive accounts like Grant, who still owns many 2020-era organizations.
  - When two Pipedrive organizations have the same name, an active rep wins.
  - **Patrick's exclusions:** a customer tier, the Inactive / Platinum / Gold / Silver / Bronze Customer workflows, or an email sent since the quarter started. These customers leave Warm, Cold and Recent. The header shows "N left out by Pipedrive", and the new **Left out by Pipedrive** tab lists them with the reason. Other workflows (the drips) don't count.
  - **Pipedrive's last activity counts as contact**, as in v3's hook. A cold customer with a call logged 7 months ago is Warm, and its "Why now" says so.
  - **Matching:** Pipedrive organizations are matched to customers by normalized name, the same rule as duplicate customer records. A read-only check on real data, 2026-10-15, counts only, outside the repo:
    - 100 of 100 organizations from the most recently won deals matched an Airtable customer.
    - 97 of 100 from the oldest won deals (2020–21) matched.
- **Garrett stays an active rep** (`RULES.activeReps` = Chris, Patrick, Garrett, always in the rep filter). Chris often handles Garrett's clients but marks the orders as Garrett, so "Garrett" in Airtable or Pipedrive can mean Chris did the work.
- **Cold needs $1,000+ when there's no rep on file** (`RULES.coldNoRepMin`). Those cards and the detail say "No rep currently assigned — confirm before assigning", in plain grey, not red.
  - On the real order history (Pipedrive off), Cold goes from 1,197 to 948, and its no-rep customers from 537 to 288.
  - Warm (539) and Recent (70) are unchanged.
- **Tested** with mocked Airtable and a mocked worker route (made-up names, Playwright), 91 checks:
  - Pipedrive on, still loading (202 twice), worker v22 (403), 404, error and `?pd=0`
  - owner mapping (Chris, Patrick, Garrett, and Josh / Stephen / Grant → Unassigned) and duplicate organization names
  - each exclusion, plus a drip workflow and a last-quarter email that must not exclude
  - the Left out tab, the cold $1k rule and its note
  - Copy list, no token, no Airtable writes, no page errors, nothing under 12px, no sideways scroll at 1920 to 390
- **Open questions for Stephen:**
  - Organizations still owned in Pipedrive by people who left (Grant, Connor, Morgan, Trevor) now show as Unassigned, even when Patrick or Chris took the last order. Reassign them in Pipedrive, or should the Airtable rep win in that case?

### Worker v23 (`GET /proxy/pipedrive/reconnect`)
- **Read-only.** It returns `{ok, asOf, orgs:[{id, name, owner, lastActivity, lastEmailSent, tier, workflows}]}` for organizations with 1+ won deal. No emails, phones or person names.
- **Auth:** the Airtable-token gate, plus the token must be able to read this base (1 Orders record, 1 field, cached 10 min). The route answers only `https://pineprintshop.github.io` (CORS). Every other route is unchanged; a unit test checks them against v22.
- **Key:** `PIPEDRIVE_KEY` (the sales@ user, Chris, who sees every organization: checked 2026-10-15). No new secret is needed. The optional `PIPEDRIVE_RECONNECT_KEY` secret would replace it with an admin key if visibility ever changes.
- **Where each field comes from:**
  - The organizations are those of all deals. The worker reads deals 500 at a time, with only the workflow field and "last email sent".
  - Owner, tier, won-deal count and last activity come from organizations, read 100 ids at a time.
  - The last activity date comes from that activity.
  - Workflows are "Enroll in Workflow" on any of the organization's deals and leads.
  - Last email sent is the newest "Last email sent" on the organization's deals. Organizations have no such field, and persons would mean reading contact details.
- **Subrequests:** about 110 Pipedrive calls for a full read. That is roughly 45 deal pages, 30 organization batches, 30 activity batches and a few for leads and field lists.
  - Cloudflare's free plan allows 50 per request, so the worker reads in steps of 40 and answers 202 until it's done. The page asks again by itself, about 3 tries.
  - On the paid plan, add the plain variable `RECONNECT_BUDGET` = `400` to finish in one request.
  - The result is cached 1 hour. If Pipedrive rate-limits (429), the worker waits once and then the page retries.
- **Tested** in Node with mocked Airtable and Pipedrive, 47 checks:
  - auth 401/403, CORS, read-only guard
  - only won organizations; exactly those 7 fields; no contact details
  - workflow and tier labels from deals and leads; email and activity dates
  - free-plan steps (at most 42 subrequests per request), the 400 budget in one request, 429 handling, cache
  - 15 old routes byte-identical to v22

### To deploy (Stephen)
1. Open `https://pineprintshop.github.io/reprint-lookup/copy-worker.html`. It should say **Worker v23**. Click **Copy worker code**.
2. Cloudflare dashboard → **Workers & Pages** → **pine-workers** → **Edit code**. Click into the code, select all, paste, then **Deploy**.
3. No new secret is needed: it uses `PIPEDRIVE_KEY`.
   - Optional: if the account is on the Workers paid plan, go to pine-workers → **Settings** → **Variables** and add `RECONNECT_BUDGET` = `400` (plain text) so the read finishes in one go.
4. **Check it worked:** open `https://pineprintshop.github.io/reprint-lookup/reconnect.html` and wait a few seconds after the orders show.
   - The header should read "Pipedrive: owners + last contact as of …", and a **Left out by Pipedrive** tab should appear.
   - ⚙ → Pipedrive checks should say "On, as of …: N customer organizations, M matched".
   - If it says "Off — worker v23 not deployed", the paste didn't deploy.
   - If it says "Off — Pipedrive was still loading", click Refresh after a minute.

## 2026-10-15 · v3: Patrick's warm list, for everyone; Josh and Stephen removed
**Stephen:** "here is the logic Patrick uses for reconnecting...can we review this against the one we built and make it similar to Patrick's but for everyone! and we can remove Josh and Stephen as Josh is no longer here and I am in a new position now and all of my past clients have been moved to either Chris or Patrick"

Patrick's Pipedrive filter "[WARM] Inactive Customers (Patrick)": 1+ won deal, no deal closed in the last 2 months, last activity 4–12 months ago, not emailed this quarter, not in the Inactive Customer or Platinum/Gold/Silver/Bronze workflows, no customer tier, and owner = Patrick.

- **New file** `reconnect-v3.html` (same permanent link `reconnect.html`, same settings and marks).
- **Views (one per customer)** replace the v2 reason chips. Rules are in `RULES`:
  - **Warm · 4–12 months** (the default; Patrick's list for every rep): 1+ paid order, no paid order in the last 2 months, and the last order of any kind (including $0 reprints and open orders, which mean we were in touch) between 4 and 12 months ago. The boundaries match Pipedrive's "before 4 months ago" and "after 12 months ago".
  - **Cold · 12+ months**: last order 12 to 36 months ago. It is not the default, and it replaces most of v2's "Gone quiet".
  - **Recent · due by Q1**: ordered in the last 4 months (but not the last 2), no order in progress, and either due for a reorder or ordered in that quarter before. These are the v2 targets Patrick's filter would skip.
  - **"Ordered in Q1 before" and "Due for a reorder"** stay as tags and as a "reason" filter inside each view.
- **Reps**:
  - Josh and Stephen are retired (`RULES.retiredReps`). The rep filter shows only active reps, meaning reps on orders created in the last 90 days: Chris, Patrick and Garrett today.
  - A customer's rep is the rep on their newest order who is still active.
  - Customers who only ever had Josh or Stephen show as **Unassigned (was Josh)** or **Unassigned (was Stephen)**, so Stephen can hand them out. Airtable orders keep the old rep name, but Pipedrive has the new owner.
  - A v2 rep setting of Josh or Stephen resets to All reps.
- **Pipedrive conditions** (owner, last activity, last email sent, customer tier, workflow) are not in Airtable. The worker has no route that returns them per organization (`/proxy/pipedrive/deal` works per order and `/emails` per email address). The app has a hook ready:
  - `loadPipedrive()` / `mergePipedrive()` read `GET /proxy/pipedrive/reconnect`. It is off until that route exists; add `?pd=1` to try it.
  - When the data is there:
    - The Pipedrive org owner becomes the rep.
    - Pipedrive's last activity counts as a touch.
    - A tier, those workflows, or an email sent this quarter leave the customer out ("N left out by Pipedrive").
  - The route must stay read-only and Airtable-token gated, and should check the token can read this base (not only whoami). It must return no contact details.
- **Copy list** gains Rep and View columns.
- **Tested** with mocked Airtable and made-up customers (Playwright), 47 checks:
  - the 2-, 4-, 12- and 36-month boundaries, a $0 reprint and an open order inside the window
  - rep reassignment, active-rep detection, the Unassigned filter and the reset of an old Josh/Stephen setting
  - a mocked Pipedrive route (owner override, tier, workflow, emailed this quarter, activity moving a cold customer to warm)
  - views, reason filter, marks, Copy list, no token
  - no Airtable writes, no page errors, nothing under 12px, no sideways scroll at 1920 to 390
- **On the real order history** (counts only, 2026-10-15):
  - Warm: 539 customers (Patrick 289, Chris 230, Garrett 3, Unassigned (was Stephen) 17).
  - Cold: 1,197 (537 of them have no rep on file, from before 2024).
  - Recent: 70.
  - 82 former Josh customers (all cold) and 36 former Stephen customers are now Unassigned.
- **Open questions for Stephen:**
  - Is Garrett a sales rep? He has 9 orders in the last 90 days, so he shows in the filter. If not, add him to `retiredReps`.
  - Should Cold need a minimum spend?
  - Add the Pipedrive route to the worker? This would apply Patrick's other filter lines and the real owners.

## 2026-10-15 · v2: renamed to Reconnect
**Stephen:** "can we change it from sales target to outreach Q1 or something more about it being an outreach helper with historical order history but make it sound better than that"
- **New name:** Reconnect. The top bar says RECONNECT, and the big tile says "Worth a call · Q1 2027".
- **Links:**
  - The permanent link is now `reconnect.html`.
  - The old `sales-targets.html` link forwards to it.
  - Nothing else changed: same rules and same screens.
- **Settings and Contacted / Skip marks carry over:** they're stored under the same browser keys.


Which past customers sales should reach out to for the coming quarter (Q1 2027 by default), from the order history in Airtable. A desktop office app (wide screen first), also works on an iPad or phone.

## What it does
- **Reads** every order in the Orders table (2018 on), only the fields it needs: customer (link + name), order reference and number, status, sales person (name), payment received date, creation date, subtotal (no tax), order source, product types, quantity. Cancelled / Voided orders are left out.
- **Read-only:** no Airtable writes at all, so there is no practice mode. Contact names, emails and phones are not loaded (they live in Pipedrive), and reps show by name only (no emails).
- **No customer data in the repo:** everything loads at runtime with the Airtable token saved on the computer (`pine_at_key`, ⚙ menu). Tests use made-up customers.
- **Customers** are grouped by the Customer record; records whose names match after trimming, lower-casing and dropping "Inc / LLC / Co / The" are merged (duplicate customer records).
- **An order's date** is the payment received date, or the creation date if it was never marked paid. $0 orders (reprints, samples) show in the history but don't count toward spend, orders or rhythm.
- **Rep** is the sales person on the customer's latest order that has one. Older orders have none ("No rep on file" in the rep filter).

## How targeting works (rules are the `RULES` block at the top of the script)
A customer is a target if at least one reason applies:
- **Ordered in Q1 before:** ordered in the same quarter last year and/or the year before (Q1 2026 / Q1 2025). Earlier years in that quarter are mentioned and add a little to the score.
- **Due for a reorder:** 2+ separate buys (orders within 14 days of each other count as one buy). Their usual gap (median of the last 5 gaps, between 45 days and 18 months) puts the next order between 4 months ago and the end of the target quarter.
- **Gone quiet:** $1,500+ lifetime or 2+ buys, nothing in the last 9 months, but something in the last 3 years.

**Score (0–100)**, shown as a sum on each customer:
- past spend: up to 30 (square-root scale, full at $20,000)
- orders: 3 per buy, up to 15
- same-quarter history: 15 per recent year (last year and the year before), +5 for older years
- due for a reorder: 15
- ordered in the last 18 months: 5

Each customer gets a one-line **Why now**, e.g. "Ordered in Feb 2025 and Mar 2026 ($4,200 each). Nothing since March."

## Screen
- Black bar: logo, SALES TARGETS, version, Refresh (reloads orders + checks for a new version), ⚙ (token, read-only note, clear marks).
- Filter row: search, rep (remembered on the computer), lifetime spend minimum (remembered), sort (score, spend, oldest last order, name), target quarter (the next four quarters), and chips: All targets · Ordered in Q1 before · Due for a reorder · Gone quiet · Contacted / skipped.
- Summary tiles: number of targets, their sales in the same quarter last year and the year before, their lifetime spend. They follow the filters.
- List cards: score, customer, rep, usual months, lifetime spend, number of orders, last order month and amount, reason tags.
- Customer detail (right pane at 1400px and wider; opens in place below that): Why now, customer since, first order source, rhythm, last two same-quarter totals, a 12-month strip (how many years they ordered in each month, target quarter outlined), the score sum, and the order history (date paid, order #, subtotal, product types, qty, status · rep, link to the order in Airtable; target-quarter orders in yellow).
- **Copy list** (the yellow button) copies the filtered list as tab-separated text for a spreadsheet.
- **Mark contacted / Skip** are kept in this browser only (localStorage), never in Airtable. Skipped customers leave the reason chips; contacted ones sink to the bottom.

## 2026-10-15 · v1
**Why:** Stephen asked for "a quick simple to use webpage / app that helps sales look at past customers that we might target now for Q1 of 2027 based on historical Airtable order data".
- New app `sales-targets-v1.html` with the permanent link `sales-targets.html`. Pine style v2 + page kit, self-update (`pine-update.js`, `data-link="sales-targets.html"`), version in the bar.
- Loads about 9,000 orders in three side-by-side streams by year created (about 90 requests, retries on Airtable's rate limit), with a progress bar.
- **Tested** with mocked Airtable and made-up customers (Playwright): paging across the three streams, crafted cases for each reason (and for cancelled-only, $0-only, too-old and one-small-order customers that must not show), duplicate customer records merged, rep filter and its memory, reason chips, minimum spend, quarter switch, Copy list, marks, no token, no Airtable writes, no page errors, nothing under 12px, no sideways scroll at 1920, 1440, 1024, 768 and 390 wide. The scoring was also checked against the real order history outside the repo (counts only).
- **Open questions for Stephen:** the thresholds in `RULES` (9 months for gone quiet, $1,500, the 4-month "overdue" window), whether "Gone quiet" should need a higher spend (it is the biggest group), and whether marks should be shared between reps (that would need a small Airtable field or table).

## 2026-10-15 · v5: departed Pipedrive owners give way to the latest order's rep
**Stephen** answered "yes" to: when the Pipedrive owner has left (Josh, Stephen, Grant and other old accounts), should the customer go to whoever took the latest order?
- **Now:** if the Pipedrive org owner is no longer an active rep, the customer goes to the rep on their newest order who is still active (Chris, Patrick or Garrett). The detail says "newest order with an active rep (Pipedrive owner … has left)".
- **Unassigned:** only customers with no active rep on any order show as "Unassigned (was …)". Active Pipedrive owners still win over the order rep.
- **Tested:** the v4 suite on v5. The 4 checks that expected Grant- or Stephen-owned orgs to be Unassigned now show the latest active order rep, as intended. The other 87 checks pass, with 0 writes and no page errors.

- **2026-10-16:** Stephen deployed worker v23. The code in Cloudflare matches `workers/pine-workers-v23.js`. Stephen confirmed Reconnect shows Pipedrive owners and last contact ("it is working!").
