# Vendor Bills (invoices → QuickBooks)

## 2026-11-10: table created
Stephen: "create the vendor bills. can we just send bills directly to quickbooks since we can connect it to our api"

- Airtable table **Vendor Bills** `tbll36BD4hZelQIUL` (base appJkaLk8DykjsgHR). One row per vendor invoice, or per order confirmation for AS Colour and LA Apparel (their confirmation is the bill).
- Fields: Bill (vendor + doc #), Vendor, Kind, Document #, Bill date, Due date, Terms, PO as printed, Pine PO, Warehouse, Subtotal, Freight, Tax, Other charges (card surcharge), Total, Lines, Samples, Supplier (→ Suppliers), Matched lines (→ garment lines), Match, Status (New / Checked / Sent to QuickBooks / Skip / Error), QuickBooks bill ID, Gmail message ID, Attachment, Read notes, Lines JSON.
- Filled by the worker's invoice reader (`/proxy/invoices/read`, v43). Reads were checked on Bandana, SanMar, AS Colour, LA Apparel and SLC.
- **Matching order:**
  1. Exact Pine PO + vendor (+ warehouse).
  2. Swapped digits (AS Colour 091126 → 110926).
  3. Shop order # in the PO box (LA Apparel "FOR 11060").
  4. Vendor + date ±2 days + total ±$1.
  5. Otherwise "Needs a look".
- SLC prints the PO as `<last 4 of SLC order #>-<PO>` (order 1000306041 → 6041-110526).
- **QuickBooks:** direct from the worker through the QuickBooks Online Accounting API (Stephen's choice over Zapier). Needs an Intuit developer app, OAuth connect once, and the refresh token kept in Cloudflare KV.

## 2026-11-10: Intuit production pages
Intuit's production-keys form needs public terms and privacy links. Added `qbo-eula.html` and `qbo-privacy.html`. They say this is an internal tool used only by Pine's staff.

## 2026-11-10: worker v44 + invoice-check v4
- **QuickBooks card:** test company or live books, Connect / Reconnect / Disconnect, recent errors with intuit_tid, and **Report a problem** (copies the errors).
- **Save as a bill** on a read invoice creates a Vendor Bills record (New).
- **Vendor Bills list:** Mark checked → Send to QuickBooks.
- **Next:**
  1. Stephen tests on Intuit's test company (connect, send a bill, disconnect, reconnect).
  2. Production keys plus `QBO_ENV=production`.
  3. Matching to Purchasing lines, the daily auto-save, and the Purchasing screen.
