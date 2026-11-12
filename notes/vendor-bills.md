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

## 2026-11-10: worker v45 + invoice-check v5
Saving and updating bills now uses the Airtable sign-in of the person clicking. This fixes the 403 on Save.

## 2026-11-10: sandbox passed; live connect waits for a QuickBooks admin
- **Sandbox:** connect → Save as a bill → Mark checked → Send worked. The bill was Sanmar, LLC #110526, 11/07, due 12/07, Cost of Goods Sold $241.90, "Invoice INV-166739651 DC-AZ", with the PDF attached. Disconnect and reconnect also worked.
- Intuit lists the app **In production**. The Production keys are in Cloudflare, plus `QBO_ENV=production` and the production redirect URI.
- Stephen's connect to the real company was refused: "You need admin permissions to connect this app to your company". Garrett (QuickBooks admin) is to connect it on 2026-11-11.
- Then test the duplicate guard on SanMar 110526, which is already in QuickBooks. Expected: "Already in QuickBooks … not sent again".
- **Later:** fill the bill's Terms box ("Net 30") from the invoice.

## 2026-11-11: invoice-check v6, sign-in box on top
Stephen cleared his browser, and the page "needs the token again but it doesn't have a place to place it".
- **Why:** the sign-in box was there, but at the bottom under everything else. The QuickBooks card said "Checking…" forever.
- **Now:**
  - The Airtable sign-in box is first, with the cursor already in it. Enter saves.
  - The QuickBooks card says "Sign in to Airtable first".

The same day, Garrett's QuickBooks connect returned `Intuit token 401: invalid_client`: the Client Secret in Cloudflare doesn't match the Production Client ID. Re-paste both from Intuit › Production, then Connect again.

## 2026-11-11: live
- Garrett's QuickBooks connected to Pine's real company.
- The SanMar test record had its sandbox bill ID (145) cleared and was set back to Checked, for a live duplicate test. Real QuickBooks has Sanmar 110526 $241.90 as bill 59294.
- **Worker v46** before any live SLC send: same-day bills are typed 110526-1 / -2.
- **2026-11-11, live duplicate test passed** (worker v46): Send to QuickBooks on Sanmar INV-166739651 (PO 110526, $241.90) answered "Already in QuickBooks as bill 59294. Not sent again." Nothing was created. Next: SLC 110526 → expect bill 59304 (110526-2); then one new SLC invoice sent for real.

## 2026-11-11: invoice-check v8, which sign-in, and can it save
"Save as a bill" kept getting Airtable 403 after Stephen cleared his browser and pasted a token. The new token is set up right (data.records:write; Pine Central, where he's a creator), so the page was probably still using another token.
- **New line under the top note:** "Airtable sign-in ••••abcd · can save" or "read only — can't save bills", from Airtable's whoami (scopes).
- **Change sign-in** opens the paste box any time. Enter saves.
- **Tested** (mocked whoami): a read-only token shows "read only"; after pasting a write token it shows "can save".
- **2026-11-11: first live bill.** SLC Activewear invoice 1443361 became QuickBooks bill **59373**:
  - Bill no. 111026; 11/11, due 12/11.
  - Pine MFG COGS, $2,088.72.
  - The PDF "SLC Activewear Invoice 1443361.pdf" is attached.
  - Memo "Pine Apps · Vendor Bills recZcz6iXKuITSeZ6".

  Checked through Garrett's QuickBooks connection in Zapier (read only).
  - **To fix next:** the reader put SLC's street address in Warehouse, so the bill description is long. It should be a short place name. Also fill the bill's Terms (SalesTermRef) from the invoice.
- The token pasted after Stephen cleared his browser couldn't write to Airtable. A fresh token pasted with Change sign-in fixed it. The working one yesterday was "Pine Apps Token" (shown in the revision history).

## 2026-11-12 · worker v47
- New Vendor Bills fields: **Line item IDs** (`fld1VRcnhMsokK4lq`, long text) and **Cart total** (`fld36EXtr9p4UhtVD`, currency).
- Invoices now save themselves every hour and get matched to Purchasing lines; see notes/worker.md (v47).
- The old **Matched lines** field (`fldsmatWtCBggl0xV`) links to Garments by mistake (inverse `fldIbdLip99WGPEEQ` on Garments).
  It's unused; asked Stephen before deleting it.
