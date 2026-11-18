# Backorders (Nov 2026)

Stephen approved (2026-11-18): back-ordered garments (the customer paid, we printed what we had) get a home. One Airtable
record per back-ordered garment, a Backorders tab in Purchasing, Catching creates the record, and Slack pings purchasing (Mike)
and the order's sales rep when a backorder comes back in stock or its ETA arrives. Telling the customer is the rep's job, from
that ping.

Not in this round (fields are ready for them): the worker's stock watch (writes Stock Found / Stock Checked At and flips
Status to Back in stock), the ETA check (flips Status to ETA reached on the Estimated Restock date), and the Schedule /
Shipping hookups (Received → print, Printed → ship).

## Flow
1. **Catching v179:** Note › Back ordered with pieces per size › ✓ Done (or Save after the fact). Besides the Shipping Notes
   line (as v178), it creates **one Backorders record**: Status Waiting, Created From "Catching 11/18".
   - Purchasing can also add one by hand: Backorders › **+ Add backorder** (order # → line → pieces missing → vendor, notes).
2. **Purchasing v121 › Backorders** (badge = open backorders): one card each, Open / All.
   - Card: order #, garment, sizes missing, vendor, days waiting, status, In cart / ETA tags.
   - Open card: Stock found (the watch's last result) or "no stock feed" for SLC / Carolina Creative / mill direct / other;
     **Order these** (warehouse picker, that vendor's warehouses first); Estimated restock date; Notes; Set status
     (Waiting / Ordered / Received / Cancelled; Cancelled asks first).
   - **Order these** puts the missing sizes in that warehouse's normal cart (the same `pickWh` + `addToCart` path as a
     line). The cart item reads "11190 Backorder". The cart's **✓ Ordered** (or Order all) writes the backorder's Status
     Ordered, PO # and Ordered From. The original line item is not touched (its PO, supplier and sizes stay as they were).
     A garment bought above its Airtable cost still raises the Garment cost, as for any cart line.
   - A backorder left in a cart survives a reload (same cart storage as lines).
3. **Back in stock / ETA reached** → Slack (below). Purchasing then uses Order these.
4. Later: Received → Schedule prints it → Printed → Shipping ships it → Shipped.

## Airtable: table Backorders `tblYvkScMwZ8HwdDP`
| Field | Id | Type / notes |
|---|---|---|
| Name (primary) | `fldHjsyZNGtE9XiNo` | text written by the apps: `11221 · EC8056 Natural · L×4` (a primary field can't be created as a formula through the API) |
| Order | `flduOSQoYZnJqoy5I` | link → Orders (inverse on Orders: `fldHMjz2FH70tUjzK`) |
| Line Item | `fldY8R2fhM7vedBTU` | link → Line Items (inverse on Line Items: `fldY9KHcYHQi88P1j`) |
| Vendor | `fldZJ6FyIWHIi3F5n` | single select: S&S, SanMar, SLC, AS Colour, Carolina Creative, Mill direct, Other (Purchasing's names) |
| Style | `fldewwkrrVTjHr8eF` | brand + style, "Comfort Colors 1717" |
| Colour | `fldrJLSJFesde0bP7` | text |
| Garment ID | `fldzDVRa5Nv36J3Cx` | the Garments record id as text (not a link, so Garments got no new field) |
| Sizes | `fldnPRCNV3gxiGWJ3` | `M:2, L:4` (like Extras Sent) |
| Qty | `fldOlt5JWDAswq0rZ` | number |
| Status | `fldRkAyDlbvq6zVKi` | Waiting · Back in stock · ETA reached · Ordered · Received · Printed · Shipped · Cancelled |
| Stock Found | `fldlPey8fqF3xejlT` | long text, the stock watch's last result (first line goes in the Slack message) |
| Stock Checked At | `fldes3VogG6vI8tOH` | date-time |
| Estimated Restock | `flda5Q2gleN1jYqea` | date (typed in Purchasing for vendors with no stock feed) |
| Notes | `fld18fwYwUh9Dd5DI` | long text |
| Created From | `fldaWhwaSIsDskC68` | "Catching 11/18" / "Purchasing 11/18" |
| PO # | `fldqXyLAFn6s4RT12` | set by the cart's ✓ Ordered |
| Ordered From | `fldtxlSaXtISmmqV9` | warehouse name, set by ✓ Ordered |
| Status Changed At | `fldQaOlNgozDi4hMV` | date-time, written with each status change from Purchasing |
| Slack Sent At | `fldKCVyqVWKR418At` | date-time, written by the automation |
| Created | `fldnKLkV6RCafIXTG` | created time (days waiting) |
| Order # | `fld7rB9xbD53giYdN` | lookup Orders › Invoice / Order Number |
| Sales Person | `fldJbz9qudrIMl0o9` | lookup Orders › Sales Person |
| Rep Slack ID | `fld34vmfEGzjU1SoH` | lookup Orders › Slack ID (`fld9AYyITMsBtc2hi`, a SWITCH on Sales Person → U…) |
| Purchasing Slack ID | `fldAYQa1icSUMYVGN` | formula, **empty (`""`) until Mike's Slack user id is known**: edit it to `"U…"` |
| Notify | `fldG3F0Dx9n68DkTb` | formula: "🔁 Back in stock" / "⏰ ETA today" / empty |
| Slack Mentions | `fldd6jVhTS1ReAUBx` | formula: `<@purchasing> <@rep>` (whichever ids exist) |
| Slack Message | `flduyPJVywosVXBUg` | formula: `🔁 Back in stock: #11221 EC8056 Natural — L×4 (S&S, Olathe L 6 available) · <@…> <@…>`; ETA: `⏰ ETA today: … (SLC, ETA 12/3) · …` |

Status choice ids: Waiting `seldsTDxm2wKJLxT2`, Back in stock `sel4T4IPc8KL30STF`, ETA reached `selHhJ2pw1AE4DbF1`,
Ordered `selrfvLjtzbTFx2qR`, Received `selGoNgQvv2O2lp4K`, Printed `sel36md4DrVeQrT8M`, Shipped `selnDADVKherqSaGL`,
Cancelled `sel6Sb0FdPgVRcVgq`.

No test records were written to the real table (all testing used a mocked Airtable).

## Automation "SLACK: Backorder back in stock / ETA" `wflQVIrPATLTy9GjF` — OFF
- Trigger: a Backorders record **starts matching** Status is any of Back in stock, ETA reached. It fires again only if the
  record leaves those statuses and comes back.
- Action 1: Slack (connection `eacpZRU7hR8PZnRbT`, the same one "SLACK: OOS notification" uses), channel `C084R0B0G11`
  (the channel the OOS notification posts to: out-of-stock garments, sales + purchasing), as "Backorder Bot": the record's
  **Slack Message** + "Open the backorder" link.
- Action 2: Slack Sent At = now.
- **Why it's off:** Mike's Slack user id isn't in any automation or field (Orders › Slack ID only maps the five sales
  people). `U084HFTQYJW` is tagged by "Thread To Order" and "Re-digitizing Alerts", but nothing says that's Mike, so it wasn't
  used. To turn it on: (1) put Mike's id in the **Purchasing Slack ID** formula (`"U…"`), (2) confirm the channel (or pick
  another in the Slack step), (3) Test, then turn on in Airtable.
- Nothing in the apps sets Back in stock / ETA reached yet, so it has nothing to send until the stock watch / ETA check exist
  (Stephen can test by setting a status by hand on a test record, then deleting it).

## Changelog
- 2026-11-18: table, fields and automation created (approved by Stephen); Purchasing v121 Backorders tab; Catching v179
  creates the record from a Back ordered note.

## 2026-11-18 · Slack ping is on (OOS channel, with mentions)
- Mike's Slack ID `U084CGXQ1M0` is in the **Purchasing Slack ID** formula (`fldAYQa1icSUMYVGN`), so the message @mentions Mike and the order's sales rep (Patrick `U084V81Q5R7`, Chris H `U084HD7QNQK`, from Orders' Slack ID).
- **"SLACK: Backorder back in stock / ETA"** (`wflQVIrPATLTy9GjF`) is ON. It posts to the out-of-stock channel (`C084R0B0G11`). Stephen: "so OOS is it for now!"
- Direct messages were the first choice, but the Slack step uses the OOS automation's Slack connection, and neither the API nor Stephen could change it. To switch later, either the person who owns that connection changes "Send to", or the automation is duplicated under another Slack connection.
- Added for that: **Rep Slack (text)** (`fldAEUSPKz1PhU5zK`, the rep's ID as plain text) for conditional DM branches. Not used yet.
