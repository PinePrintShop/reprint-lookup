# Order page (`order.html` → `pine-order-v2.html`)

## 2026-11-23 · v2: status and mock-ups only
**Why:** Stephen on v1: "I think we can try and simplify it and really just focus in the status and maybe the mock-ups."

**Same as v1:**
- data loading: the order, then line items, imprints, Order Issues and Backorders by record ID
- the step rules and the fields that feed them (table under v1)
- the home screen: active orders, search, recent chips
- read-only: GET only; `?practice=1` shows the tag

**Kept on the page:**
1. **Header (two lines):**
   - order #, customer, status tag, Hard deadline
   - due date with work days left (or late in red), Pick-up / ship method, and the tracking link once shipped
   - v1's link row is now one small **Open in… ▾** menu: Mockups page (signed packet), Line Item Review (while proofing), Receiving, Schedule, Damage Log, Art folder, Airtable record. It closes on an outside tap.
2. **Status, the main thing:**
   - a big **NOW: <step>**: every step that's started but not done, plus the first step not done (e.g. "GARMENTS · PRE-PRESS"). When nothing is open, it's the last step done ("PICKED UP" + date).
   - **progress bar:** the 7 steps in one row (Proof → Garments → Pre-press → Scheduled → Printed → Caught → Shipped / Picked up). Each is ✓ (black), now (yellow) or not yet (empty), with one date or count under it. On a phone the bar stands up as a list.
   - **blockers only:** at most 4 lines, problems first, then "prints today / tomorrow", then the rest; "and N more" if there are more. Red only for real problems: an issue Awaiting Review, a mis-ship, a CHECK, a Delayed status, past due. An open Order Issue is just a blocker line now.
   - nothing blocking → one line, "On track" (or "Done · nothing open" for a finished order).
3. **Mock-ups:** one big tile per imprint × garment colour, 300–360px wide in a grid.
   - The picture is the line's Signed Proof page, else its Proof Images file, tagged "✓ Signed" or "Proof · not signed".
   - Caption: imprint ID, location, "on <colour>", then the imprint's short status. Examples: "Press 1 · tomorrow 8:30a · locked · sep ✓ screens ✓ inks ✓", "Printed ✓ … · not caught yet", "Caught ✓ Tue Nov 17". Missing prep shows on a yellow wash ("screens ✗"); "proof not initialed" shows when Signed Check says so.
   - Tap a tile for the **lightbox**: big image (Airtable's full thumbnail), ‹ › or ← → through the order's mock-ups, Open PDF ↗, ✕ / Esc / a tap outside closes it.

**Layout:** desktop has the status across the top and the mock-ups in a grid below. iPad and phone stack the same way (one column of mock-ups on a phone).

**Removed:**
- line-item size tables
- the notes list and the Line Item comment reads (one GET per line fewer: 6 GETs for the test order, was 8)
- the issues / backorders list
- the per-step detail lists
- the imprint cards (replaced by the mock-ups)

The v1 gaps still apply (no "sent" date, last-modified dates, embroidery has no prep step, re-print prep fields unused).

**Tested** (Playwright, mocked Airtable, made-up names; scratchpad `order2/t2.js`, 55 checks):
- **Mid-production order:**
  - Now = GARMENTS · PRE-PRESS, with the bar ✓ ● ● ✓ ○ ○ ○.
  - 4 blockers: the open issue red first, then 11164-B prints tomorrow (screens / inks), the Pepper line not in, the backorder.
  - 3 mock-ups (A and B on Black, C on Pepper), signed pages, each with its status.
  - The lightbox opens on the tapped tile, steps with →, closes on Esc.
  - The Open in… menu.
- **Pick-up order (by `?id=`):** all ✓, "Picked up Wed Nov 18", "Done · nothing open", not called late.
- **Ship order (by typing the #):** UPS tracking in the header, Now = Shipped Fri Nov 20, unsigned proof labelled.
- **Finding orders:** home, customer search, recent chip, no token.
- **Every run:** zero non-GET requests, no console errors, nothing under 12px, no sideways scroll at 1440 / 1024 / 390.

## 2026-11-23 · v1 for review (internal order status page)
**Why:** Stephen wants better communication between departments ("has come up in a few reviews"). The first piece is one internal page per order that every app can open. Then sales, art, purchasing, receiving, pre-press, the presses, catching and shipping all see the same picture.

**Device:** desktop first. From 1000px wide there are two panes: the pipeline and notes on the left, then imprints, line items and issues on the right. iPad portrait and phones get one column: the pipeline, then imprints / lines / issues, then the notes.

**Read-only:**
- The page only sends GET requests. It never writes to Airtable, so `?practice=1` just shows the practice tag (there is nothing to fake).
- Token: `pine_at_key`, set in the ⚙ menu like the other apps.
- Self-update: `pine-update.js` with `data-link="order.html"`. `pineBusy` is always false, because nobody is ever mid-task on this page. The version shows on the bar.

### Opening it
- `order.html?order=11164` (order #) or `order.html?id=rec…` (Orders record id).
- **Search box:** typing an order # opens that order. Anything else searches customer names, newest first. `?q=` works too.
- **Nothing open:** the page lists the active orders (everything except Shipped, Completed, Cancelled and Partially Completed), due soonest first, with Late and Hard tags.
- **Recent:** the last 6 orders opened on this computer show as chips beside the search box (localStorage `pine_order_recent`).

### What's on the page
- **Header:**
  - order #, customer, Order Status, Hard deadline / ASAP, rep
  - due date, with the work days left (or how late it is)
  - ship method and paid date
  - turnaround: Airtable's Turnaround once the order is completed, otherwise "Day N since paid" (work days)
  - pcs / lines / imprints
  - links: Mockups (`mockups.html?o=rec…`), Line Item Review (`?order=`, only while Awaiting Proof or Sent), Receiving, Schedule, Damage Log, Art folder, the Airtable record
- **Where it is now:**
  - "Now" names every step that has started but isn't done, plus the first step that isn't done.
  - Under it, in plain words, is what's holding the order up, e.g. "Waiting on: 11164-B prints tomorrow: screens not burned, inks not mixed".
  - Red is only for real problems: a mis-ship, a signed page that doesn't match (CHECK), an issue Awaiting Review, a Delayed status, or past due.
- **Seven steps:** each is done ✓, now, or not yet, with the date and who did it when Airtable has them. The fields are in the table below.
- **Imprints:**
  - ID, location, method, nickname and pcs.
  - Thumbnail: the line's Signed Proof first, otherwise its proof. Tapping it opens the PDF.
  - Prep: Sep'd / screens burned / inks mixed for screen print; transfers in for Supacolor, Decopress, patches and labels.
  - Scheduled slot: press, day and time, plus locked or re-print locked.
  - Printed (when, operator) and caught (when).
  - Inks and Pantone.
  - Catching ↗ (`pine-catching.html?job=<imprint rec>`) opens that job, or its completed order with the packing slip.
- **Line items:**
  - garment, colour, nickname, product type, PO, vendor, imprint IDs
  - size table: ordered, extras, in, with shorts in red
  - tags: ordered / from stock, in / short / not in yet + ETA, mis-ship, re-print replacements, backorders
- **Issues:**
  - Order Issues: resolution, status, pcs, imprint, garment, category, originator, date, description, resolution notes.
  - Backorders: style, colour, sizes, qty, status, vendor, PO, restock date, stock found, notes.
- **Notes:** every department in one list. Each note has a department tag and says where it came from.
  - Line Item comments come first, newest first. They are dated, and `[Chris] …` shows Chris as the author.
  - Note fields have no dates, so they follow in department order: Sales, Art, Office, Purchasing, Receiving, Pre-press, Ink, Schedule, Press, Catching, Finishing, Shipping.
  - Long notes fold to 6 lines with "Show all".

### Which fields feed each step
| Step | Done when | Fields |
|---|---|---|
| Proof | the order has Signed At or a Signed Packet, or every line has a Signed Proof. Order Status Ready to Order or later also counts, shown as "Approved" + "No signed packet saved in Airtable" | Orders: PandaDoc URL `fldqIIPwPEJXL7Efu` (sent), Signed Packet `fldSwLl9yIMSXcT0Y`, Signed At `fld2h7L1aqDHPfcQM`, Payment Received Date `fld5RAeEEGMltdES0`. Lines: Proof Images `flddhvdkKI31tFTdX`, Proof Quality Approved `fldsVU7LXUN6LszvB`, Signed Proof `fldYeu8XZgBNSQ3N6`, Signed Check `fldzHcS22EcdZ3xwN` (CHECK = red; NOT INITIALED = yellow while proofing) |
| Garments | every garment line is Received | Lines: Ordered `fldBnjGyTLLjzz97l` (+ Ordered Timestamp `fldhDUejzo0Q4X92k`), Pull from Stock `fldH2Hdp1kk5LmlY9`, Received `fldwaSkM0sJJ2oYsQ` (+ Received Timestamp `fldmMViJMYizJfOev`), PO # `fldIUAnkNscvEVDjU`, Supplier Name `fldj5Oq8JVUocLzS2`, Expected Blank Arrival `fld9EfCdiP8cgSepO`, the size / extras / Actual size fields (Receiving's field map), Mis-Ship `fldDlrzYoe2q31K0U`, Mis-Ship Resolved `fldt0vrDUpL3eKatw`, Mis-Ship Details `fldQP8hzBdUXl50Io`. Backorders: Status `fldRkAyDlbvq6zVKi`, Estimated Restock `flda5Q2gleN1jYqea`, Stock Found `fldlPey8fqF3xejlT` |
| Pre-press | screen print: Sep'd + Screens Burned + Inks Ready. Transfers / patches / labels: Transfers / Trims Received. Embroidery and finishing: nothing to prep | Imprints: Sep'd `fldlMcHtldbifKzDN` (+ `fldCkjATjNnBb7Aam`, Separator `fldTPKgZroX532qER`), Screens Burned `fldEL51Nwrxuyn9Zo` (+ `fldGE6YUG5NWIqq1g`), Inks Ready `fld2a1CPcDMSD26PS` (+ `fldnNmTNevL1AHrXQ`), Transfers / Trims Received `fldHqiXg8OqOc1dcV`, Imprint Type `fldjNCuaGOkWgzH2K` |
| Scheduled | every imprint (except Finishing) has a start time | Imprints: Scheduled Start Time `fldfqtIgcEfIlIeQk` (shop clock marked Z), Equipment `fldv59OGU7EkBVofo`, Scheduled (the lock) `fldYD2VrhaLfkXXkw`, [For RE-PRINT] Scheduled? `flduvuUWAzzDYby6y` |
| Printed | every imprint is Run Finished | Imprints: Setup Started `fldsYmRn7FwmWCH97`, Run Started `fldmnZof3Dce60JKv`, Run Finished `fldFuDZ68QdUMt3pM`, Run End Actual `fldtoIc7CRd5sXeBS`, Operator `fldOsVUlfs3U847oO` |
| Caught | every imprint is Caught | Imprints: Caught `fldIo2EmE7b25vtfS`, Caught At `fldfwVYinDPnvwOJn`. Orders: Boxes Packed `fldu7dXQAwg3S974s`. Order Issues: Total Damaged Pieces `fldC7uIwyU6QeHbZi`, Status `fldfLAjmK6XZqki9S`, Resolution `fldAT3sfeVSAqTRvk` |
| Shipped / Picked up | Order Status is Shipped, Completed or Partially Completed. Shows "Picked up" when Shipping Method includes Pick-Up | Orders: Shipping Method `fldrjFuIBn45ewFU5`, Tracking Number `fldLjGNoUKrxuX0O7`, Carrier `fldjSezoa5NtveYvm`, Ship Date `fldlMlDIr9hLYFfbL`, Completed Date `fldaqChiFnKJ5HN1N` |

**Order Status sets a floor.** Caught - Awaiting Ship marks Proof through Caught as done, and Shipped / Completed marks everything done. That way an old order doesn't read as waiting on a box nobody ticked.

**Notes fields:**
- Orders: Order Notes `fldzzDJNF6rvTCmRq`, Notes `fldh9WFXo6qhAahaQ`, Packing Handoff `fldu2NmUdYx6yd9DU`, Refund Request Details `fldga8BAM7XzmgDI9`.
- Lines:
  - Sales Notes `fldG3tzTzUC3QQJ1I`, Proofing Notes `fldWdnT83KLEvBrg4`
  - Order Notes `fldF378cgWuOcWNL6` (Purchasing's line note), Production Notes `fld4FjoCQ5bXdwjJj`, Replacement Order `fldLaOaYriGPxxQMu`
  - Mis-Ship Details, Signed Check, Damages / Mis-prints `fldluAKxFLXEDVwqP`
  - Finishing Notes `fldqsj7nZgHrtRbEn`, Shipping Notes `fld7rY74m37acM2Ik` (also holds Catching's "not printed" lines)
- Imprints: Print Notes `fldNuEzGIYI8FWqXu`, Ink Notes `fldk0Zbjyuh5NEIE8`, Scheduling Notes `fldjlfaH3dOBCtuTM`, Job Comments `fldnBE4NLaajisvcb`.
- Line Item record comments: GET `…/tblJx5UlwO7oMSk5H/<rec>/comments`, the same endpoint Line Item Review uses.

**Reads:** an order with 2 lines takes 8 GETs.
1. The order. The header shows as soon as this read is back.
2. Line items, imprints, Order Issues and Backorders, all by record ID, 40 per request, in parallel:
   - imprints come from Orders › Prints `fldFbR56c4K4xRow7`, the inverse of Imprints › Linked Orders. Orders › Imprints is not used: it's the repeat-job link.
   - issues come from Orders › Order Issues 2 and Lines › Order Issues.
3. One more batch for imprints, issues or backorders that are linked only from a line.
4. One comments read per line.

**Thumbnails** come straight from the line's Signed Proof / Proof Images attachments, which are already in the line read. Signed comes first, the same order `/proxy/mockups` uses, and there's no extra request. "Mockups ↗" opens `mockups.html?o=rec…`, which reads `/proxy/mockups` and previews the signed packet.

### Gaps in the data (for the review)
- **Proof sent date:** there's no timestamp for "sent" (PandaDoc URL has none). Line Item Review's Pipedrive "Send to client" check isn't read here; it would need the worker. The page shows "Sent" without a date.
- **Note fields have no dates or authors**, so only comments sort by time. A dated notes log (one line per note, `M/D Name: …`, like Catching's Shipping Notes lines) would let the page sort everything.
- **Ordered, Received, Sep'd, Burned, Inks and Run finished dates** are Airtable "last modified" fields. They move if someone unticks and reticks. Who ticked is only known for Sep'd (Separator) and Printed (Operator).
- **Embroidery digitizing** has no "ready" field, so embroidery shows no pre-press step.
- **Re-prints:** the steps don't use [REPRINT] Sep'd / Screens Burned / Inks Ready yet; they show the first run. Re-prints show in Issues, on the line (replacements ordered / in), and as "re-print locked" on the schedule.
- **Caught per line on a shared print:** Caught Cards isn't read; Caught is per imprint.
- **Partial shipments / several tracking numbers:** only the order's one Tracking Number is shown. Lines have their own Tracking Number fields, which nothing uses yet.
- **No deep links** into Receiving, Schedule or the Damage Log: they open on their home screen. There's no packing-slip URL either, because the slip is a button inside Catching; Catching ↗ opens the job.

### Where each app's "Order page ↗" link would go (not added yet; review first)
- **Line Item Review:** the order header's links row (next to Deal ↗ · Art folder ↗ · Airtable ↗).
- **Create order:** beside "Review 11160 →", after Create order succeeds.
- **Price-O-Matic:** none (a quote has no order yet).
- **Purchasing:** the order card header and the Backorders tab rows.
- **Receiving:** the order card header (left list) and the open order's header.
- **Seps / Screens / Ink Queue:** the job header sub-line, on the `#order` (`.p-job-ordno`).
- **Schedule:** the job card pop-up / side panel, on the order #.
- **Operator:** a small "Order ↗" in the job screen header (iPad; opens in a new tab).
- **Catching:** the order group header and the Completed order card (beside Packing slip).
- **Damage Log:** the issue header, on the order #.
- **Shipping:** the order header.
- **Production Board:** none (wall TV, no taps).
- **Pine Central:** the order search result rows, plus an "Order" menu tile.
- **mockups.html** (box-label QR, no login): none, because the order page needs the Airtable token.

The link is the same everywhere: `order.html?id=<Orders record id>`, or `?order=<#>` where only the number is known.

### Tested
Playwright with mocked Airtable and made-up names (scratchpad `order1/t1.js`), clock fixed at Mon Nov 23 2026, 9 am Denver.
- **Mid-production order, opened by `?order=`.** Setup: proof signed; one line in, one not; screens burned for A but not B; both scheduled tomorrow; embroidery imprint C; one damage issue Awaiting Review; one backorder. Results:
  - Now = Garments · Pre-press.
  - Waiting on: 11164-B prints tomorrow (screens, inks); the Pepper line not in (PO, ETA); the backorder (restock Dec 2).
  - Red: the open issue.
  - Scheduled is done, "tomorrow 8:30a", in shop clock time.
  - The signed thumbnail comes first.
  - Notes from 8 departments; comments newest first, with authors.
- **Finished pick-up order, opened by `?id=`:** every step done, "Picked up Wed Nov 18", the operator, Airtable's turnaround.
- **Ship order** (typing its order # opens it and keeps `?practice=1`): UPS tracking link, Shipped Fri Nov 20, re-print replacements in, the resolved issue.
- **Finding orders:** the home list (active orders only), customer search, clicking a result, the recent chip, Back, no match, and no token (⚙ opens).
- **Every run:**
  - zero non-GET requests, practice too
  - no console errors
  - nothing under 12px
  - at most one yellow button
  - no sideways scroll at 1440, 1024 or 390
  - 8 GETs for an order
