# Line Item Review app

Live: https://pineprintshop.github.io/reprint-lookup/pine-line-item-review-v1.html
Practice: https://pineprintshop.github.io/reprint-lookup/pine-line-item-review-v1.html?practice=1

## 2026-10-08 · v1

**Why:** After Create order, line items go into Line Item Review. Until now that happened in an Airtable interface. Stephen wanted an iPad-friendly app that also shows Airtable's internal comments (Comments / 2nd Eyes Feedback).

**What it shows**
- **Line items on orders in Awaiting Proof,** grouped by order, oldest order first. There are four tabs:
  - **Art to do:** no proof yet, or a proof is up but not marked for review.
  - **Review:** Ready for 2nd Eyes is on, and the line isn't approved for both quality and pricing.
  - **Ready to send:** Proof Quality Approved and Pricing Approved are both on, the same rule as the Proofs Ready to Send formula.
  - **All**
- **Default tab** depends on who you are: Art Department opens on Art to do, everyone else on Review.
- **Detail view** has:
  - order header: salesperson, ASAP/Hard, due date, proof timer
  - links to the client art folder (Customers › Art Folder, saved from Create order), customer art, and the record in Airtable
  - chips to move between the order's other lines
  - a 4-step progress bar
  - proof images, with Attach proof
  - imprints with Sep file and folder links
  - garment and sizes
  - editable notes: proofing, sales, production, shipping
  - the comments thread
  - pricing: price, autoprice and line total, plus a cost breakdown down to margin per piece and line margin. Warnings show for under-autoprice, thin margin and losing money.
- **Action bar** at the bottom, sticky, with big buttons:
  - **Awaiting Review** sets *Ready for 2nd Eyes*. This is what Art taps once layouts are uploaded.
  - **Quality Approved** sets *Proof Quality Approved*.
  - **Pricing Approved** sets *Pricing Approved*.
  - **Next →** goes to the next line in the tab.
  - Tapping a button that's already on asks before undoing it.

**Writes (all faked in `?practice=1`)**
- Checkboxes, the four notes fields and Price Input on Line Items (PATCH).
- Proof files go to Line Items › Proof Images through Airtable's upload endpoint (`content.airtable.com …/uploadAttachment`). The limit is 5 MB per file; bigger files have to be attached in Airtable.
- Comments are posted with the record comments API (`POST /v0/{base}/{table}/{record}/comments`). Reading uses the same endpoint with GET.

**Comments with one shared key**
- Every comment posted through the API is signed by the owner of the Airtable token.
- To show who actually wrote it, the app has a **"Who are you?"** dropdown (Art Department, Chris, Garrett, Josh, Patrick, Stephen, Whitney). The choice is saved per device in `pine_lir_me`.
- Comments are posted as `[Chris] message`, and the app shows that name as the author. In Airtable they read as `[Chris] …` under the key owner's name.
- **Notify** chips add real @mentions (`@[usr…]`), so Airtable notifies those people as usual.
- The mention list starts with Art Department, Chris Hoffman, Patrick Dawson and Whitney Bontrager, the people seen on Line Item comments. The app adds anyone else it sees in threads (`pine_lir_people`).
- The token needs the **data.recordComments:read / write** scopes. If comments show "Couldn't load comments", add those scopes to the token.

**Automations checked before building**
- **2nd Eyes Notification** emails quality@ when a line enters the 2nd Eyes view, which happens when Awaiting Review is tapped. That's expected.
- **SLACK: Update in Proofing Notes** posts to Slack when Proofing Notes contains `UPDATE:`. The Notes box points this out.
- **Proof Upload Time** stamps Attachment Timestamp when proofs are attached.
- No automation fires on new comments (no `rowCommentCreated` trigger).

**Create order hand-off**
- `pom-create-order-live.html` has a **Line Item Review →** button in its top bar.
- Once an order is picked, the button opens `?order=<num>` on that order's first line.
- `?line=rec…` also works.

**Refresh:** every 3 minutes, and whenever the iPad comes back to the tab. It skips the refresh while notes or a comment are being typed.

**Tested** with mocked Airtable in Playwright on iPad landscape, iPad portrait, desktop and phone, in both live and practice mode:
- art uploads a proof and marks it Awaiting Review
- a reviewer comments with an @mention and approves pricing
- a losing-money line triggers the warning
- price and notes edits are saved
- the ready tab updates
- the deep link from Create order opens the right order

**Ideas for later**
- Post an automatic comment like "[Chris] ✓ Quality approved" on approvals, so the thread shows who approved.
- A "Send proofs" step that moves the order to Sent - Awaiting Payment once every line is ready.
- Add a Line Item Review tile in Pine Central.

## 2026-10-08 · v2

Stephen's feedback after using v1:
- **Order headers kept getting tapped as if they were line items.** In the list, each order is now a dark band, the same look as the top bar: yellow order #, customer in caps, and the salesperson, ASAP/Hard and age underneath. Line items stay white and have a › arrow. Tapping the band now opens that order's first line instead of doing nothing.
- **Margins are totals only.** Pricing shows Margin / pc, Margin % and Line margin, right under the price tiles. Margin % turns red under 15%; Margin / pc and Line margin turn red when negative. The warnings stay: under autoprice, thin margin and losing money. The labor, overhead, materials and shipping breakdown is gone.
- **The comments error now says what to fix.** v1 showed "Couldn't load comments: Invalid permissions" because the shared token lacks the comment scopes. The box now explains how to add `data.recordComments:read` and `data.recordComments:write` to the existing token; the token string doesn't change. Practice mode still reads real comments and only fakes writes, so it shows the same message.
- Create order's **Line Item Review →** button now opens v2.

## 2026-10-08 · v3

**Master design link for reorders.** Each imprint card shows a yellow **📁 Master design** button (with the master's I-number) that opens the canonical design folder.
- If the imprint has a Canonical Design, the app uses its *Master Folder URL* lookup, or its own *Canonical Folder URL* if it's the master itself.
- New reorders usually only have *Previous Imprint ID* set; none of today's 10975 repeats has a Canonical Design yet. For those, the app follows Previous Imprint ID back up to 3 reorders until it finds a folder. The card then says "Repeat of 9871-A", for example.
- If it finds nothing, a reorder shows "No master folder yet". It's a candidate for the canonical promotion app.
- 292 imprints have master/canonical folder data today.
- Read-only: nothing is written.

Create order's **Line Item Review →** button now opens v3.

## 2026-10-08 · v4

Airtable margin math was rebuilt on the $133k/mo cost basis (see `notes/pricing-formula-review.md`). Margin now means profit after garment, press time and a full share of shop costs, so about 10% is normal. The thin-margin warning moved from <15% to **<5%** (`THIN`), and a one-line note under the margin tiles says what margin means. Create order now opens v4.

## 2026-10-08 · v5

**Invoice-only fees are filtered out**, using the same rule as Purchasing v94: a line with Product Type "Misc." and no garment (shipping, rush and other fees that exist only for the invoice). Those lines no longer appear in the list, the tab counts, the order's line chips, **Next →** or deep links. The order header shows them once, e.g. "+ 1 invoice fee ($25.00)", so the total still makes sense. Create order now opens v5.

## 2026-10-08 · v6: Send for signature (PandaDoc)

**What's new:** once every real line on an order is Quality + Pricing approved, the order header shows **✓ All N lines approved → Send for signature**. Until then it shows "X of N lines approved".

The sheet:
1. **Who and what:** signer = the order contact email; CC = the salesperson (Orders › Sales Rep Email). Subject and message are prefilled and editable.
2. **The packet,** built in the browser with pdf-lib and pdf.js, loaded only when needed:
   - **Terms of Service** (`assets/pandadoc-terms-v1.pdf`, the 5 initials already tagged).
   - **Every approved proof file,** each file once even when several lines share it. Each page gets an initials tag in art's APPROVED white box, found by reading the "APPROVED" text with pdf.js. A page without art's stamp, or an image proof, gets an added APPROVED box.
   - **The invoice,** drawn from Airtable in the extension's layout:
     - logo, bill/ship to, terms, delivery method
     - every line including fee lines, with sizes OSFA–6XL, price, 2XL+ up-charges and line totals
     - the order's own discount, subtotal, sales tax, Colorado retail delivery fee, payments and outstanding
     - signature, name and date tags
     - 13 lines per page; totals and signature on the last page
     - the Order Date shows the local date (the extension shows 10955 as 10/4; it's 10/5)
3. **Checks before sending:** pages tagged, lines with no proof, line totals vs the order subtotal, size limit.
4. **Preview:** page thumbnails (works on iPad); tap one to open the full PDF, or Download.
5. **Send:** the worker creates and sends the PandaDoc named "10955 | Customer" (same naming, so the QuickBooks zap still matches). Then the app writes **PandaDoc URL** and **Order Status = Sent - Awaiting Payment** (checked: no automation fires on that status) and the order leaves the queue.
6. **Practice mode:** builds the preview and sends nothing.

**Safety:**
- While the worker has the **Sandbox** key, documents are created but **never sent to a customer** (worker v17). The salesperson sees "PandaDoc is still on the Sandbox key".
- Proof files load directly, or through the worker if Airtable blocks cross-origin reads (v17 `/pandadoc/file` route).

**Tested** with mocked Airtable and worker on 10955's real proofs: 5 pages; tag sizes identical to the proven API-TEST-9; practice, live and sandbox-blocked paths; phone sheet. The v5 review tests also pass on v6.

**To go live:**
1. Deploy `workers/pine-workers-v17.js`.
2. Swap `PANDADOC_KEY` to the Production key ($2 per document).
3. Send one real order to yourself first.

## 2026-10-08 · v7: invoice matches the extension

Stephen compared a v6 invoice (order 10569) with the extension's and found missing lines, and asked for the black-outline logo.
- **Table lines:** the extension's 16 vertical column dividers, positions measured from 10955's PDF, drawn through the header and every 27.7 pt row. Columns now use the extension's exact widths.
- **Pills:** product type in light blue and garment in lavender (the extension's colors). The garment pill grows to two lines for long names.
- **Logo:** `assets/pine-invoice-logo-outline.png`, the same logo inverted to black line art on white, without the black block.
- **6XL:** only when an order has 6XL does a 6XL column get squeezed into the size area, with a smaller header. Otherwise sizes are OSFA–5XL like the extension.
- **Paging:** 12 rows per invoice page; totals and signature on the last page.
- **Checks:** "no proof" names repeat garments once, with "+N more".
- **Tested** on 10955 (practice + live) and on a 15-line order with 6XL. Create order now opens v7.
