# Pine Central (home launcher)

## 2026-10-14 · v171: links fixed, new Pine style, missing apps added
- **Links:** the menu pointed at old versions, five of which no longer exist (Seps v8 gave a 404; also Operator v24, Catching v97, Screens v10, Receiving v11, Purchasing v68).
  - Every app now opens through its always-latest link: `pine-operator.html`, `pine-catching.html`, `seps.html`, `screens.html`, `receiving.html`, `pine-ink-queue.html`, `pine-purchasing.html`.
  - KPIs and Reprints have no permanent link, so they stay on `pine-kpi-v22.html` and `reprint-lookup-v3.html`.
  - The machine bar (ROQ Next, …) still passes `#machine=` through `pine-operator.html`.
- **Apps added** as a new **Sales & office** group, in the sidebar and as a row of black tiles on the home screen. Each opens inside Pine Central like the others:
  - Create order
  - Line Item Review
  - Price-O-Matic
  - Damage Log
  - Production Board
  - Day Fill
- **Pine style v2** (brand standards, Stephen + Whitney 10/14):
  - **Colors:** cream background, Pantone 107 yellow for the machine bar and labels, and black instead of green for the tagline and running dots.
  - **Type:** Poppins Black in capitals for the greeting, clock and section headers, which are black boxes as in the brand guide. Helvetica for everything else.
  - **Size:** text is no smaller than 12px, up from 8–10px in the ticker, labels and View as.
  - **Fit:** icons now scale to the screen height as well as its width, so everything fits on desktop. On the iPad the page scrolls a little.
- **Self-update + version:** `pine-update.js` is added, and "Pine Central v171" shows at the bottom of the sidebar.
- **Tested** with mocked Airtable at 1440 and on the iPad:
  - Every menu entry loads its current version (Seps v34, Screens v21, Operator v126, Catching v158, Receiving v72, Purchasing v105, Ink Queue v94, Damage Log v17, Line Item Review v18, Create order v17, Price-O-Matic v105, Production Board v41, Day Fill v15, KPIs v22, Reprints v3).
  - No 404s and no errors.

## 2026-10-14 · v172: the ticker shows real numbers
**Why:** the yellow ticker's numbers were wrong and slow.
- Every load paged through all ~11,000 burned-screen records (up to 200 requests) and then threw the result away.
- The "week" queries only read the first 100 records, which were the oldest ones from 90–180 days back, so recent work was mostly missed.
- Labels said "on Tuesday" over 7-day totals, dates were UTC (wrong after 6pm), and the Receiving "3" / Catching "2" badges were typed into the page.

**Now:**
- **One small query per stat.** Airtable filters to the day, so each query returns only that day's records. About 9 requests in all.
- **The last workday, in Fort Collins time** (`America/Denver`). If that weekday had no work at all (no Friday shift), it steps back a day, up to 3 times. The label says "yesterday", or the weekday's name when it was further back.
- **Stats:**

  | Ticker label | What it counts | Field(s) |
  |---|---|---|
  | Today | jobs on today's schedule, plus impressions on Press 1/2 | Scheduled Start Time |
  | Art | jobs sep'd | Sep'd + Sep'd Timestamp |
  | Ink room | inks mixed (each ink counted once) for N jobs | Inks Ready + Inks Ready Timestamp, Inks links |
  | Screen room | screens burned for N jobs | Screens Burned + Screens Burned Timestamp, Screen Count |
  | Presses | impressions printed on Press 1/2 | Run Finished + Run End Actual, Total Impressions (Active Impressions is 0 once a job is done) |
  | Embroidery | stitches on N pieces | Total Stitches on TAJIMA jobs that finished |
  | Heat press | pieces pressed | |
  | Catching | jobs caught and counted | Caught At |
  | Receiving | garments checked in on N line items | Received Timestamp |
  | Shipping | orders completed | Completed Date (Automated) |

- **Threads:** there is no record of thread used. Thread Name is only filled in for special-order thread. Stitches sewn is the closest real number. If a thread count is wanted, it needs a field Embroidery fills in.
- **Badges:** Receiving's static badge is gone. Catching's badge is live: Press 1/2 jobs finished in the last 3 days and not caught yet.
- **Loading:** stats load once even though both page load and token-save trigger them. Ticker labels are 12px.
- **Tested** with mocked Airtable: every stat line, the badge, and 9 queries per load.

## 2026-10-14 · v173: Schedule in the menu
- "Sales & office" now has **Schedule** (`pine-schedule.html`) in place of Day Fill. Schedule does what Day Fill did, and more.
- `pine-day-fill.html` still works for anyone who has it saved.
