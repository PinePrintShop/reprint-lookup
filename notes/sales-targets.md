# Sales Targets (`sales-targets.html`)

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
