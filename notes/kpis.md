# KPIs

Permanent link: `pine-kpi.html`, a desktop office app. Read-only.

## 2026-10-16 · v23: the math matches Airtable's KPI Tracker
Stephen: "KPIs math is all wrong so maybe you scan those to really dial that in to match the Airtable KPI interface."

### What was wrong in v22
- **Hard-coded values:**
  - Proof turn always showed 6.4h.
  - Embroidery spoilage always showed 0%.
  - "Scheduled value" was impressions × $0.75.
- **Print and bandana spoilage were the same number.** It was a median over Order Issues; Airtable averages line items instead.
- **Wrong dates:** most tiles used the date a record was created, not the date the work happened (orders this month, QC, completed value…).
- **Missing records:** fetches stopped after 1–6 pages, so busy periods came out low.
- **Wrong aggregation:** some tiles used a median where Airtable uses an average, and the other way round.
- **"POs received" was wrong:** it counted line items.

### How v23 was matched
- Every element on the KPI Tracker (Production Overview interface, page `page37mFoKnj4qdTH`) was reverse-engineered on Oct 16. Four read-only agents pulled the exact records each tile aggregates and matched them record-for-record against table queries.
- v23 pulls the same fields through the REST API (every page) and applies the same filters and the same median / average / sum.
- **Test:** real Airtable data from Oct 16, served through a mocked REST API 100 records a page, gave the same values as the interface on every tile and every chart month. Values that day:
  - **Turnaround** (median work days from Payment Received to Scheduled Start; orders completed in the past 30 days, status Completed):
    - Printed apparel 15 (142 imprints; screen-print types, not bandanas).
    - Bandanas 15 (70).
    - Heat press 11 (14; equipment "Heat press…").
    - Embroidery 12.5 (28).
    - Patch & label apps 15 (17).
  - **Production:**
    - Impressions completed in 30 days: 56,999 (317 imprints).
    - Impressions scheduled this calendar week (Sun–Sat, order not completed): 6,035.
    - Screens imaged: 84 in 7 days, 197 this month.
  - **Value:**
    - Printed: $68,888.85 completed in 7 days, $75,569.31 scheduled in the next 7 days, $120,201.46 incomplete (paid, not completed or cancelled).
    - Embroidered: $22,617.25, $13,696.60 and $25,003.35.
  - **Art & prep:**
    - Proof turn median 6:01 (lines created this month, proof quality approved, not cancelled).
    - Sep turn median 2 (screen-print lines sep'd in the past 30 days).
    - Screen turn average 3.59 (burned this month).
    - Screens burned before print average 7.87.
    - Inks ready before print median 5.
  - **Purchasing:**
    - Time to order median 1 (paid this month, value > 0).
    - Time to receive median 9 (ordered in the past 30 days and received): S&S 9, SanMar 9, Carolina Creative 9, AS Colour 10.
    - Received before print median 3.
  - **Sales:** 89 orders originated this month (not cancelled); days to payment average 1.12.
  - **Spoilage** (average over every line, 0 when there's no Order Issue; orders completed in the past 30 days):
    - Print 2.04% (Printed Apparel, not bandana).
    - Bandana 2.85% (print location includes Bandana).
    - Embroidery 1.31%.
  - **Charts:**
    - Turnaround by month (past year).
    - Impressions and screens by month (2026).
    - Proofs approved per week (Sunday weeks).
    - Spoilage by month.
    - Customer-initiated issues, reprints (RE-PRINT and approved) and refunds (REFUND and approved) by the month they were logged.

### Two Airtable tiles that don't do what they say
- **"Total Screens Scheduled – Next 7 days"** sums Scheduled Start Time in the *past* week (133 on Oct 16). v23 shows the actual next 7 days (139) with a note. Fix the tile's filter in the interface to make them agree.
- **"Impressions Scheduled – Next 7 days"** is this calendar week (Sun–Sat), and v23 does the same. The "(AVG)" tiles all use median, and v23 labels them "median".

### One open question: spoilage on lines with several Order Issues
A line with two issues looks up two spoilage values. The API can't show which way Airtable's tile combines them. The options give different bandana numbers on Oct 16:
- **sum per line:** 2.85%
- **average per line:** 2.27%
- **average of all values:** 2.17%
- **first value:** 2.23%

v23 uses "sum" (`SPOIL_RULE`). If the live Bandana Spoilage tile shows a different number, switch the rule in the next version.

### Also
- Pine style v2, self-update (`pine-update.js`, data-link `pine-kpi.html`), and the version in the bar.
- Refresh re-pulls the data and checks for a new version. The data also reloads every 30 minutes.
- Pine Central v175 opens `pine-kpi.html`.

## 2026-10-20 · v24: the "Updated" stamp matches the bar
**Why:** Stephen's top-bar review of the first apps in the new brand colors.
- The "Updated 6:26 PM" stamp in the bar had an inline 70%-white colour. It now uses the `.stamp` class only: 13px, 55% white, the same as the version tag.
- No behaviour changes. The app is read-only.
- **Tested:** with the Oct 16 data mock, v24's tiles and charts match v23 exactly at 1440 and 390. There are no console errors, and practice mode makes 0 writes.
