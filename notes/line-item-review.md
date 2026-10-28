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

## 2026-10-08 · v8: step bar across Quote › Create order › Review

Stephen asked to move both ways through POM → Create order → Line Item Review.
- **Step bar:** POM v102, Create order and Line Item Review v8 share one bar (`flowNav()`, same code in all three): **① Quote › ② Create order › ③ Review**, current step in yellow. Phones show Quote · Order · Review.
- **Order number travels with you:**
  - Create order → Review opens that order.
  - Review → Create order opens Create order on the selected order (new: Create order reads `?order=` and picks that Awaiting Proof order).
  - Back to Quote keeps the quote (it's saved in the browser).
- **Practice mode** carries through every link.
- **Top bars streamlined:** yellow **PINE** wordmark, then the step bar, then each app's own controls. The full design pass is saved for when everything moves into Central.
- **Tested** on desktop + phone (every link, forward and back, with the order number). The v7 send flow and v5 review tests pass on v8.

## 2026-10-08 · v9: pinned top bar
Stephen: scrolling "changes the top and feels wonky". The top bar scrolled away while the order list (sticky) stayed, so the layout jumped.
- **The bar stays put:** the top bar (PINE + steps + who/refresh) is pinned at the top. The order list now sits just under it: its sticky top and height follow the bar's real height (`--toph`, measured with a ResizeObserver). Scrolling to a section lands below the bar (`scroll-padding-top`).
- **Phone:** the bar is compacted to two short rows: PINE + Quote · Order · Review, then PRACTICE + who + refresh (98 px).
- Same change in POM v103 (pinned on iPad/computer only; on phones its 3-row bar with the product tabs scrolls normally) and in Create order. The step bar now points to POM v103 and Line Item Review v9.
- **Tested** by scrolling on computer, iPad and phone: the bar stays at top 0 and the list stays aligned. Review tests pass on v9.

## 2026-10-09 · v10: bigger proof, one-row line strip, approvals in the step row
Stephen asked for a bigger mockup, less white space beside it, tighter line-item buttons, and to keep the approval buttons from hiding the proof.
- **The steps are the buttons.** The four steps (Proof uploaded › Awaiting review › Quality approved › Pricing approved) are the approval buttons now, with **Next →** at the end.
  - On iPad and computer the row is pinned right under the top bar, so it never covers the proof.
  - The floating bottom bar is gone there.
  - Phones keep the bottom bar for thumb reach.
- **Bigger proof.** It fills the proof box width and is sized to fit the screen below the pinned rows. It uses Airtable's full-size thumbnail for a sharper image. Two or more proofs sit side by side.
- **Comments/pricing beside the proof only at ≥1500px.** On iPads and 1366px laptops the proof gets the full width, and comments and pricing follow underneath.
- **Line strip: one row instead of three.** It reads ‹ chips › with a "3 / 11" counter. The chips scroll sideways, and the current one stays centred.
- **Shorter header.** The art folder, customer art and Airtable links moved up beside the salesperson and dates.
- **Links updated.** Create order and POM v104 now open Review v10.
- **Tested** with mocked Airtable on an 11-line order at 1366, 1680, iPad landscape and portrait, and phone:
  - the proof is never covered
  - the pinned row sits under the top bar
  - the ‹ › arrows and centring work
  - the approval toggles work from the step row
  - no console errors

## 2026-10-09 · v11: desktop layout (three panes)
Stephen: Review is used almost only on a desktop, so v11 is designed for it.
- **Three panes that fit the screen (≥1200px wide):** queue | proof | details. The page itself no longer scrolls.
  - The queue and the details column each scroll on their own.
  - The proof always fills the middle, from the step buttons to the bottom of the screen, so it never scrolls away.
- **Details column (380–480px):** imprints, garment and sizes, pricing, comments, notes, in that order (check the art, then the price).
  - Its scroll position is kept when the page refreshes itself, e.g. after an approval or when comments load.
  - Imprint cards stack their buttons under the description so the text doesn't get squeezed.
- **Several proofs:** one big proof, with thumbnails underneath to switch. Clicking the big proof opens the full file.
- **Shorter header on desktop:** "X of N lines approved" is a small pill at the top right (the explanation is in its tooltip). The full "Send for signature" bar still appears once every line is approved.
- **Keyboard:** ← / → move between the order's lines and N goes to the next line in the tab. Keys are ignored while typing.
- **Below 1200px** it falls back to the v10 layout.
- **Always-latest links:** `pine-line-item-review.html` and `price-o-matic.html` are tiny redirect pages that open the current version and keep `?practice=1` / `?order=`.
  - The step bar in POM v105, Create order and Review v11 uses them, so a new Review or POM version doesn't need a link-only release of the others.
  - When shipping a new version, update the one line in the redirect file.
- **Tested** with mocked Airtable at 1366×768, 1440×900, 1680×1050, 1920×1080, 2560×1440 and iPad:
  - nothing runs past the screen
  - the proof is fully visible
  - the details column keeps its scroll after an approval
  - the arrow keys and N work
  - proof thumbnails switch
  - the redirects keep the query string
  - no console errors

## 2026-10-09 · v12: comments first
Stephen: the team uses comments a lot, so they go at the top of the right-hand column. Order is now comments, imprints, garment and sizes, pricing, notes. A long thread scrolls inside its own box (up to about half the screen), so the reply box stays near the top. `pine-line-item-review.html` now opens v12. Re-ran the v11 desktop tests at 1366–2560 and on iPad: no errors.

## 2026-10-09 · v13: archive orders
Stephen: some orders sit in Ready to send because nobody has marked them cancelled yet. An archive clears them out, and an order can come back later if it's revived.
- **New Orders fields** (additive, agreed): **Review Archived** (checkbox, `fld0rhj54aWspxNO0`) and **Review Archived By** (text, `fld4i9bBzliG12fIf`, e.g. "Chris · 2026-10-09"). Checked first: no automation watches them.
- **🗄 Archive order** in the order's header links.
  - It asks first, then hides the whole order from Art to do / Review / Ready to send / All. Nothing is sent or cancelled, and Order Status doesn't change.
  - The app moves on to the next line in the tab.
- **Archived tab** (5th tab) lists archived orders. Opening one shows "Archived by … · ↩ Un-archive" where the send bar normally is.
  - Un-archive puts the order back in the queue and switches to All.
  - If every line is approved, **Send for signature** is right there again, with the "already has a PandaDoc" note when one was sent before.
- Practice mode fakes the archive and saves nothing.
- `pine-line-item-review.html` now opens v13.
- **Tested** with mocked Airtable, practice and live:
  - archive, then the counts move
  - Archived tab, then un-archive
  - live mode PATCHes only the two order fields
  - the v11/v12 desktop layout tests at 1366–2560 and iPad pass with no errors

## 2026-10-09 · v14: salesperson filter
Stephen: salespeople should be able to run through just the orders they need to send.
- **Salesperson buttons** under the tabs ("Everyone 5 · Chris 3 · Garrett 2"), counted for the current tab.
  - Picking one filters the list and the tab counts.
  - **Next / N** only steps through that salesperson's lines.
  - The choice is remembered on each computer (`pine_lir_rep`).
  - When the filtered list is empty, it says so, with a "show everyone" link.
- **Ready to send** is grouped by salesperson (then oldest first). The other tabs stay oldest first.
- `pine-line-item-review.html` now opens v14.
- **Tested** with mocked Airtable:
  - the filter and counts work
  - the choice survives a reload
  - archive tests pass
  - desktop layout tests at 1366–2560 and iPad pass with no errors

## 2026-10-09 · v15: "Last time" pop-up for repeat imprints
Stephen: when an imprint has a Previous Imprint ID, show quickly what it was last time.
- An imprint card with a Previous Imprint ID gets a yellow **🕘 Last time · 9871-A** button. It opens a pop-up on the page:
  - **Header:** the previous imprint ID, order #, customer, order date and proof-approved date.
  - **Last proof, big,** with thumbnails for every proof on that order's lines. Click it to open the full file.
  - **Last time vs this order:** location, type, screens, inks. Rows that differ are highlighted "changed". A row is only flagged when both sides have a value.
  - **Imprint notes, sep file and design folder** from last time.
  - **Garments last time:** garment, quantity, price per piece, and that line's proofing notes.
  - **← Earlier** walks back to the time before (follows Previous Imprint ID again). **Airtable ↗** opens the old imprint.
- Close with the button, Esc or a click outside. The arrow and N keys are paused while it's open.
- **Read-only:** reads Imprints (Line Items, Invoice / Order Lookup, Order Date, Customer, Proof Approved Date) and the old lines.
- `pine-line-item-review.html` now opens v15.
- **Tested** with mocked Airtable at 1680 and 1366:
  - pop-up content and changed rows
  - thumbnails, ← Earlier, Esc
  - layout tests at 1366–2560 and iPad pass with no errors

## 2026-10-10 · v16: edit imprint info
Stephen: let the team adjust imprint info from Review, the same fields they can edit in Airtable's Imprints table.
- **✎ Edit** on each imprint card opens a form in the card:
  - Location and Print type (the Airtable options)
  - Screens, Ink changes, Custom ink charges
  - Repeat
  - Nickname, Print notes (size, placement), Sep file link
  - **Previous Imprint ID:** type it (e.g. 9871-A). The app looks it up and won't save an ID that doesn't exist, or the imprint's own ID. Blank removes the link.
- **Shared imprints** show "Shared by N lines · changes apply to all", because the imprint record is shared.
- **Save writes only the changed fields** to the imprint, then reloads the imprints and this line, so Autoprice and margin pick up new screen or ink-change counts. The toast says "Autoprice updated" when that applies.
- **Inks stay read-only.** They're linked Ink records, so they're edited in Airtable.
- **Safety:**
  - Automations checked first: none watch these Imprint fields.
  - Typed values survive background refreshes and failed saves. The 3-minute auto-refresh pauses while the form is open.
  - Practice mode fakes the save.
- `pine-line-item-review.html` now opens v16.
- **Tested** with mocked Airtable, practice and live:
  - a bad Previous ID is refused and the edits are kept
  - a good save PATCHes only the changed fields
  - "no changes" is handled
  - the layout and Last-time tests pass with no errors

## 2026-10-14 · v17: remove pages before sending, edit quantities
Sales feedback, via Stephen:

**Remove pages from the PandaDoc before sending**
- Every page in the Send for signature preview has a **✕ Remove** button. A removed page is grayed out and stamped "Removed", and **↺ Put back** restores it.
- A line above the pages says how many go out ("1 page removed · 4 of 5 go to the customer · put all back").
- The PDF that is sent (and downloaded) is rebuilt from the kept pages only. A removed page's PandaDoc initials tag goes with it.
- **The invoice signature page can't be removed** (marked "signs here"), so every packet keeps a place to sign.
- Page captions now name the page: Terms / Proof · garment · p2 / Invoice · signature.
- Thumbnails stay visible while sending (before, the sheet re-render wiped them).

**Edit quantities in the right column**
- The Garment panel has **✎ Edit qty**. It shows a box per size: S–3XL plus any size already used, with "more sizes" for XS, 4XL+ and one size.
  - It shows "50 → 52 pcs" while you type. Save qty writes only the sizes that changed; 0 clears a size.
- After saving, the app re-reads the line (Total Qty, Autoprice, Line Total and margins are formulas) and the order (subtotal, tax, outstanding). So the invoice in Send for signature is current and the "line totals vs subtotal" check stays honest.
- A yellow note shows "Qty 50 → 52 · Autoprice $35.00 → $34.80 · Price/pc is $35.00 **[Use $34.80]**". One tap sets the new price. Saving a price by hand also re-reads the order now.
- **Approvals aren't reset** by a quantity change. This is meant for last-minute tweaks on orders that are ready to send.
- **Safety:**
  - Automations checked first: none watch the Line Item size fields.
  - The 3-minute auto-refresh pauses while the size form is open.
- **Practice mode** fakes the save. It updates the line total and the order subtotal/outstanding locally, but Autoprice isn't recalculated.

- `pine-line-item-review.html` now opens v17.
- **Tested** with mocked Airtable (practice and live), recorded in `lir17.js`:
  - the size edit PATCHes only the changed sizes (2XL cleared to null)
  - "Use $34.80" PATCHes the price
  - the order is re-read, so no mismatch warning
  - removing a proof page sends 4 of 5 pages to the worker, and the order moves to Sent
  - practice says "would send · 1 page removed"
  - no errors

## 2026-10-14 · v18: screenshots in comments, no @ for yourself
The Art Director asked for screenshots in comments, to point out small details to the outsourced art team. They work in the Airtable interface today and will move to this app.

**New Airtable field (OK'd by Stephen 10/14):** Line Items › **Comment Screenshots** (`fldIGuJmx4jPgYiB1`, attachments). No automation watches it.

**Screenshots:**
- Three ways to add one in the comment box:
  - **paste** (⌘V)
  - **drag** an image onto the box
  - **📷 Add screenshot**
- Previews show before posting, with ✕ to remove. You can post a screenshot with no text.
- On Post, each image uploads to the line's Comment Screenshots field with an easy-to-match name (`10955_1014-1840.png`: order, date, time). The comment gets a line **"📷 Screenshot: 10955_1014-1840.png"**.
- In this app that line shows as a thumbnail inside the comment; click it for full size.
- In Airtable, the comment shows the 📷 line, and the file with that name is in Comment Screenshots.
- Images only, 5 MB max each (Airtable's upload limit). Practice mode keeps them on screen only.

**Notify chips:** once you pick your name at the top right, your own @ button is hidden. The match is by first name, or by the full name.

**Self-update + version:** `pine-update.js` is added. The version (v18) shows next to ↻, and ↻ also checks for a new version. It won't reload while notes, an imprint or quantity edit, the send sheet, a typed comment or a pending screenshot is open.

- `pine-line-item-review.html` now opens v18.
- **Tested** with mocked Airtable, practice and live:
  - Chris's own chip is hidden.
  - Paste, file pick and ✕ work.
  - Post uploads to `fldIGuJmx4jPgYiB1` and then comments with the 📷 line and the mention; the thumbnail renders in the comment.
  - No errors.

## 2026-10-16 · v19: the shared office look, art folder per order, done steps black
**Why:** the review of the three order-path apps (Oct 16). Stephen's answers:
- *"Step ② … → the real Create order."* The step nav's Order step opened the old mockup `pom-create-order-live.html`; it opens `create-order.html` now.
- *"Art folder: one link per ORDER. LIR reads Orders › Artwork Folder Link first (fall back to the customer field / Customer Art if empty), and where LIR lets someone save an art folder, it saves to Orders › Artwork Folder Link."*
- *"Price: Price-O-Matic wins for now; LIR may show Autoprice beside it for comparison (keep what it shows)."*
- *"'Who are you' stays only in LIR."*
- *"LIR step buttons: finished steps black (✓), only the next step to do is yellow."*

**What changed (same Airtable writes as v18):**
- The same black bar as Price-O-Matic and Create order: logo, LINE ITEM REVIEW, version, practice pill, **Quote › Order #11031 › Review**, who are you, Refresh, ⚙ (token, practice). Search, the five tabs and the salesperson chips are one filter row under it.
- **Art folder:** reads Orders › Artwork Folder Link (`flddst7TDoJfSqb0s`, what Create order saves) first, then the customer's Customers › Art Folder (`fldxohp41phv6Qbms`). Customer art (`fldriiZiENIPeJRRV`) still shows as its own link. Line Item Review has no place to save a folder link (it didn't in v18 either), so nothing here writes one; "No art folder saved" points to Create order.
- **Approval steps:** done = black with ✓, the next one = yellow, the rest white. When the proof is the next step, tapping it attaches the proof. Next → is black.
- **The shared order header:** #, CUSTOMER, rep, Hard/ASAP + due, created, invoice fees, Art folder ↗, Customer art ↗, Airtable ↗ (this line), Archive order, lines · pcs · subtotal, and **Send for signature** top-right — greyed with "1 of 3 lines approved" until every line is approved, then yellow.
- **List:** up to 460px wide on wide screens, and the line cards wrap the garment name onto a second line instead of cutting it. One status tag per line: Needs proof (white), Proof up (cream), Awaiting review / Quality ✓ · 1 to go (yellow), Ready to send (black).
- Imprints, the price block ($/pc is the one Poppins number; Autoprice, margin/pc, margin and line margin beside it) and the line cards use the shared pieces. Box saves (Save notes, Save qty, Save price, Post, Save imprint) are black; the one yellow is the next step or Send.
- Below 1200px it's one pane (the list, then the line, ‹ All line items goes back). On phones the approval steps show only in the bottom bar (they showed twice).
- Fixed: closing the send sheet while page thumbnails were still drawing threw an error (v18 did it too).

**Tested** with mocked Airtable, content API and worker (`office/v1/lir_cmp.js`): Awaiting review / Quality / Pricing approved and undo, sales notes, qty edit (M 20→22), price 14.75, a comment with @Whitney, an imprint nickname edit, a proof upload, Send for signature (PandaDoc through the worker + the order PATCH) and Archive. **The 13 writes are identical to v18.** The art folder link shows the order's folder for 11031 and falls back to the customer's for 11019. Practice: 0 writes. No page errors; nothing under 12px, one yellow button, no sideways scroll at 1920/1440/1280/1024/390.

## 2026-10-16 · v20: the quoted price beside Price and Autoprice
**Why:** Stephen: *"Price-O-Matic's price wins; LIR may show Autoprice beside it for comparison"* and *"Quotes Table looks great build away"*.
- The Pricing box shows **Quoted · Q-41 $11.50** next to Autoprice, read-only. It comes from the order's quote (Orders › Quotes `fldUKg4jFYXhEAu0q`, linked by Create order v19): the Quote Line with the same garment style # and color, else the same style and qty, else the same qty, else the order's only quote line. Hovering shows which quote line it is. Orders without a quote show nothing new.
- Read once per load (two small reads: Quotes, then their Quote Lines). **No new writes.**
- **Tested** (scratchpad `office/v2/lir_cmp.js`): the 13 writes are identical to v19, with and without a quote; 1717 Graphite / Moss / Richardson 112 Black/White each show their own quoted price ($14.20 / $11.50 / $17.00), 11019 (no quote) shows none. Practice: 0 writes. No page errors; nothing under 12px, one yellow button, no sideways scroll at 1920/1440/1280/1024.

## 2026-10-16 · v21: jobs already sent leave the queue
Stephen: "Let's remove from the app sent awaiting payment but don't change Airtable just how we show jobs in the app."

- **Why:** reps send the proof and invoice from Pipedrive ("ACTION NEEDED: Approve your proof & invoice") and move the deal to Awaiting Approval. The Airtable order stays Awaiting Proof, so the job sat in Ready to send. On Oct 16, 29 jobs were in Ready to send and 28 of their deals were at Awaiting Approval.
- **Now:** each Awaiting Proof order's Pipedrive deal is checked through the worker's read-only `/pipedrive/deal?order=` route (4 at a time).
  - A deal at Awaiting Approval, Ready for Production, Awaiting Payment, Order Confirmed (or Order Confirmed: Proof & Invoice), or won counts as **sent**.
  - Sent jobs leave Art to do / Review / Ready to send / All and go to a **Sent** tab, so they're still reachable when a customer asks for changes.
  - The order shows "Sent · Pipedrive deal is at …" with a link to the deal.
  - Its yellow "Send for signature" becomes a plain "Send again".
- The check is remembered for 20 minutes on that computer; **Refresh** checks again.
- If Pipedrive can't be reached or the deal isn't found, the job shows as before.
- **Nothing is written** to Airtable or Pipedrive.
- **Tested** with mocked Airtable and worker:
  - With order 11019's deal at Awaiting Approval: Ready to send 0, Sent 1, the note shows, and a reload uses the saved check.
  - The full review flow writes exactly what v20 wrote (13 writes), and practice still writes 0.
- **Later, if loading is slow:** a worker route that returns every order's deal stage in one call would replace the per-order lookups. That's a worker deploy for Stephen.

## 2026-10-16 · v22: "sent" needs the proof email
Stephen, on 11025 Underground Enterprises: "I would do that what you suggest."

- **Why:** Chris moved 11025's deal to Awaiting Approval after emailing mockups, before any "Approve your proof & invoice" email. v21 then filed it under Sent.
- **Now, a deal at Awaiting Approval** counts as sent only if its Pipedrive emails include "Approve your proof & invoice". That's the template's subject, and replies keep it.
  - Without that email, the job stays in the queue.
  - The order shows "Pipedrive deal is at Awaiting Approval · no "Approve your proof & invoice" email yet, so it stays in the queue."
- **Unchanged:** Ready for Production, Awaiting Payment, Order Confirmed or a won deal still count as sent without the email check.
- **Limits:**
  - The worker returns a deal's 15 newest emails that it can read.
  - A deal whose mailbox the worker can't read stays in the queue, which errs toward showing too much rather than hiding.
- The saved check moved to a new key (`pine_lir_sent_v2`), so v21's answers aren't reused.
- **Tested** with mocked Airtable and worker:
  - Awaiting Approval with mockups only: stays in Ready to send, with the note.
  - Awaiting Approval with the proof email: goes to Sent ("proof email sent").
  - Awaiting Payment: goes to Sent.
  - The full flow writes exactly what v20 wrote (13), and practice still writes 0.

## Monday plan (agreed Oct 16): "Send to client" counts as sent
Stephen: "I am on mobile so I can't upload a new worker. So maybe we make this a Monday project!"

- **Finding:** every deal gets a Pipedrive "Send to client" task when it moves to Awaiting Approval, and the reps tick it once the proof is out, however they sent it. On the 28 Ready-to-send jobs on Oct 16:
  - 11 were ticked and had the proof email.
  - 12 were ticked with no proof email visible, mostly Patrick's (Gmail or PandaDoc directly, or no template subject).
  - 5 weren't ticked (10907, 10972, 11025, 11022, 10838) and really weren't sent.
- **Plan:**
  1. Worker v24: `/pipedrive/deal?order=` also returns whether the deal's "Send to client" task is done (read-only). Stephen pastes it into Cloudflare.
  2. Line Item Review v23: a job counts as sent when the deal is at Awaiting Approval or later AND (the "Send to client" task is done OR the proof email is there).

## 2026-10-19 · v23: no second PandaDoc after a failed save · "Send to client" counts as sent
- **Double packet send fixed.**
  - Before: PandaDoc sent the packet, then the Airtable save (link + *Sent - Awaiting Payment*) failed. The app said "Didn't send", and a retry sent the customer a second, billed PandaDoc.
  - Now, once PandaDoc says it went, the app never says "didn't send". The sent document (link and id) is remembered on this computer before the Airtable save.
  - If the save fails, the sheet says "Sent to pat@… ✓ — but saving to Airtable failed". The order header's button becomes *Retry save*, and a red note says "Sent to the customer, but saving to Airtable failed" with a link to the PandaDoc.
  - *Retry save* only re-tries the Airtable save. Send stays blocked for that order until the save goes through, even after a reload.
  - Before any send, the order is re-read from Airtable. If it has a PandaDoc link the sheet didn't show (sent from another screen) or is already *Sent - Awaiting Payment*, nothing is sent. *Send again* on an order you already saw still works as before.
- **"Send to client" counts as sent** (the Monday plan, needs worker v24).
  - A deal at Awaiting Approval counts as sent when its "Send to client" task is ticked OR the proof email is there.
  - Later stages and won deals still count as sent, as in v22, so a confirmed job never drops back into Ready to send.
  - The Sent note says why: "Send to client ✓ Oct 18" or "proof email".
  - A waiting job says '"Send to client" not ticked and no "Approve your proof & invoice" email yet'.
  - With the old worker (v23, no task field) it works exactly like v22. The saved check moved to `pine_lir_sent_v3`.
- **Pine confirm box** (pine-confirm.js) replaces the browser's confirm(): leaving unsaved notes, 0 pieces, archive, undo a step, no proof yet, losing money, "Some checks need a look" (red *Send anyway*), leaving practice.
- **Tested** (Playwright, mocked Airtable + worker, 1440×900):
  - Airtable save 500 after the send: 1 PandaDoc, toast "Sent … saving to Airtable failed", *Retry save* in the sheet and the header, still there after a reload.
  - A retry that fails again doesn't send. The next *Retry save* saves the DOC1 link + status, still 1 PandaDoc, and the pending record is cleared.
  - Order already given a new PandaDoc link elsewhere: 0 sends.
  - The checks confirm: Cancel sends 0. *Send anyway* makes 1 send and 1 save.
  - Practice: 0 sends, 0 writes.
  - Worker v24: ticked shows Sent "Send to client ✓ Oct 18"; not ticked with no email stays in the queue; the proof email shows Sent "proof email".
  - Worker v23 (no field): the v22 results. There were no page errors.

## 2026-10-19 · v24: new jobs no longer vanish into Sent
Stephen (screenshot: Review 0, Ready to send 17, Sent 64): jobs "had for one sec ... and then they all went to 0".
- Cause: in Pipedrive's main pipeline the order is To be Qualified → In Progress → **Order Confirmed** → Awaiting Approval → Awaiting Payment → Ready for Production. "Order Confirmed" (stage 23) is the stage that creates the Airtable order, before any proof. Since v21 the app counted it as "sent", so every new order showed for a second, then the Pipedrive check moved it to Sent.
- Fix: sent = Awaiting Approval (with the Send to client tick or the proof email), Awaiting Payment, Ready for Production, pipeline 2's "Order Confirmed: Proof & Invoice", or won. Saved Pipedrive checks are reset (`pine_lir_sent_v4`) so the next load re-checks every order.
- Tested: with a deal at Order Confirmed, v23 put 3 orders in Sent; v24 shows them in Review. All v23 tests pass on v24.

## 2026-10-20 · v25: Art brief in the Art to do tab
Stephen: "in line item review under the Art to Do section...can we walk through best ways to show the art dept information....they need imprint id and actually the garment which right now you have to go to the right and scroll down." Then: "that would be only for Art To Do — we do still need comments and every other section to be similar."
- **Art brief (Art to do tab only)**, at the top of the line, under the order header, line chooser and steps:
  - The garment once: "on Gildan 2000 · Black ● · 100 pcs (S 20 · M 80)". The dot is a rough colour swatch for plain colours only (black, white, navy, forest, maroon …); other colours get no dot rather than a guess.
  - One block per imprint, always in the same order: big imprint ID with a Copy button, "Front · Discharge · 10"W · 3 colours", the ink names with Pantone dots, the nickname, "New art" or "Repeat of 10804-A — last proof ↗ · seps ↗ · master design ↗", then the imprint's Print notes and Ink notes in full.
  - Proofing notes and Sales notes in full, in small boxes.
  - Red "Missing: …" only for real gaps: no imprint linked, no location, no ink colours, no garment.
  - Due date, Art folder and Customer art are not repeated in the brief: they're in the order header right above.
- **Attach proof right under the brief**, next to **Copy file name** ("11040 | 2000-BK" = order # | Product Number-Colorway Abbreviation, the way the real proofs are named). Once a proof is on the line it offers the next version ("V2 11040 | 2000-BK", then V3 …). On a 1440×900 screen a long brief would push the button off screen, so that row stays pinned at the bottom of the column.
- **Art to do list cards** show the imprint ID(s) and the garment, e.g. "11040-A 11040-B Gildan 2000 Black". Search also finds imprint IDs.
- Every other tab, the comments, the right column (imprints, garment, pricing, notes) and sending work exactly as in v24. Nothing new is written to Airtable.
- Read-only fields it uses: Line Items › Imprint ID Lookup; Imprints › Pantone, Ink Notes, Proof Images (from Line Items) (for the last proof of a repeat); Garments › Product Number, Colorway Abbreviation, Colorway. There's no print-size field on Imprints, so the size shows only when the print notes say it (e.g. 10"W).
- Tested (Playwright, mocked Airtable, 1440×900 and 1920×1080): brief content for new art, a repeat with last proof, no inks (flag), no location (flag), no imprint (flag); copy file name 11040 | 2000-BK, V2 and V3; list cards; Review and All tabs show no brief and keep attach in the proof box; comments present; one yellow button; nothing under 12px; practice attach + review = 0 writes; no errors. All v24 tests pass on v25.

## 2026-10-20 · v26: Art to do, decluttered — one "Proof done" button
Stephen on v25's Art to do screen: "still feels cluttered. Let's walk through what needs to stay at the top...pricing doesn't really get checked until review which is what reviews all 3 buttons". Then: "proof uploaded and awaiting review are the same thing...once that is clicked it slacks sales and production manager to approve quality and price". And on the ink flag: "drop it for missing inks".
All of this is the **Art to do tab only**. Review, Ready to send, All, Sent and Archived look and work exactly as in v25.
- **Order header is one line**: "#11040 DEAF CO · Chris · HARD DATE · Due Oct 28 · Art folder ↗ · Customer art ↗ · Airtable ↗". Art folder only when one is saved, Customer art only when there is some. Gone from Art to do: Lines / Pcs / Subtotal, Send for signature and "0 of N lines approved", "Proof took", "Created … ago", "No art folder saved", Archive order, and the Pipedrive "not sent yet" note. (If a PandaDoc was sent but didn't save, that red warning and Retry save still show.)
- **No 4-step approval bar and no Next button** on Art to do. Quality and pricing are checked in Review.
- **One yellow button at the end of the brief: "Proof done → send to Review"**, after Attach proof and Copy file name. It does exactly what clicking the "Awaiting review" step did: it ticks Awaiting Review on the line (the same single change, nothing else), and the Airtable automation Slacks sales and the production manager. It is greyed out with "Attach the proof first" until a proof is on the line. After it saves: "Sent to Review — sales and production are notified" with an **Undo** button, the line moves to Review, and the next Art to do line opens. If the save fails, the line stays put with a red "Didn't send to Review" message. Attach proof is black before a proof and plain white after; Copy file name is plain.
- **No line chooser strip** on Art to do (the list on the left already shows every line).
- **Notes once**: when Proofing notes and Sales notes say the same thing ("Art is repeat"), it shows once, labelled "Proofing notes · Sales notes". Blank lines are trimmed.
- **No ink-colour flag** at all. Red "Missing" stays only for no imprint linked, no location, and no garment.
- **Comments are quieter**: the @Art Dept / @Chris … notify chips appear once you click into the comment box. Everything else in comments is the same.
- Tested (Playwright, mocked Airtable, 1440×900 and 1920×1080): compact header on Art to do and full header on Review; step bar, Next and line strip hidden on Art to do and back on Review/All; Proof done disabled without a proof, enabled with one; it sends the identical PATCH as v25's "Awaiting review" step (`{"fields":{"fldycrq3VJYSFd8Gi":true}}`), the line moves to Review, the next line opens, Undo sends Awaiting Review = false and brings it back, a failed save keeps the line; duplicate notes merged; no ink flag; chips hidden until focus; one yellow button; nothing under 12px; practice = 0 writes; no errors. The v25 Art tests (updated for the changes) and the v24 suite pass on v26.

## 2026-10-20 · v27: drag & drop the proof
Stephen: "can we drag and drop the PDF as well".
- Drop a PDF or image on the Art brief or the Proof box and it uploads as that line's proof (the same upload as Attach proof; practice fakes it). The box gets a dashed outline while the file is over it. Other file types are skipped with a message.
- Dropping on the comment box still adds a comment screenshot. A file dropped anywhere else no longer makes the browser open it and leave the app.
- Tests: new drop tests (brief upload, wrong type, comment box, elsewhere, practice) pass; v26 suite passes except the one check for the old hint wording; v24 suite 30/30.

## 2026-10-20 · v28: art folder first, the folder's files, proof saved to Drive too
Stephen: "we do work in Google Drive a lot....so sales creates the folder > puts in the customer artwork > art dept goes to that folder grabs it > makes the mockup > attaches it to Airtable and uploads it to google". He agreed to: make the art folder the obvious first step, upload the proof once and have it saved to both Airtable and the order's Drive folder, and show the folder's files in the brief. And: "Remove the copy buttons".
All of this is the **Art to do tab only**. The other tabs look and work exactly as in v27.
- **Open art folder ↗** is the first thing in the Art brief: a big black button that opens the order's Artwork Folder Link in a new tab (or the customer's Art Folder if the order has none, same as before). With no folder: a red line "No art folder yet — ask Chris" (the order's rep). The Art folder link is no longer repeated in the one-line header (Customer art ↗ and Airtable ↗ stay).
- **In the folder (N)** under the button: the folder's files, newest first, each with a thumbnail (or its type, e.g. AI, PDF), name and date; click opens it in Drive. Subfolders show as small chips that open in Drive. Read once per order folder; Refresh reads it again. This uses the worker's new Drive routes (worker v25). Until Drive is connected on the worker it just says, in grey, "Drive files will show here once Drive is connected". If the worker can't read the folder: "Can't read this folder (is it in the shared drive?)".
- **Attach proof saves to both.** Attaching a proof (button or drag & drop) uploads it to Airtable as before, then copies the same file into the order's art folder. Each file then shows "Saved to Airtable ✓ · Drive ✓". If the Drive copy fails it says "Drive copy failed — Retry"; Retry only re-sends to Drive, and the Airtable proof is kept either way. With no folder, or Drive not connected yet, it saves to Airtable only, as today. Practice mode fakes the Drive copy too.
- **Copy buttons removed**: the Copy button next to each imprint ID and the "Copy file name" button.
- Tested (Playwright, mocked Airtable and worker, 1440×900, 1920×1080, phone): folder button and the red no-folder line; file list order, subfolder chip, thumbnails (fetched with the token, shown as images); one folder read per order, Refresh re-reads; not connected (503), old worker (404) and folder-not-found show only the grey line and no errors; upload goes to Airtable first, then Drive with the right folder, file name, file bytes and type; a failed Drive copy keeps the Airtable proof and Retry sends only to Drive; drag & drop does both; All tab attach = Airtable only; practice = 0 writes; copy buttons gone; one yellow button; nothing under 12px. The v26 Art tests (updated for the header and copy buttons), the v27 drop tests and the v24 suite (30/30) pass on v28.

## 2026-10-20 · v29: add the art folder right in the brief
Stephen (screenshot of "No art folder yet — ask Patrick"): "it would be great to also be able to upload in this section as well".
- No folder on the order: the red line now says "No art folder yet — paste the Drive link below, or ask <rep>", with a box to paste the Drive folder link and **Save folder** (Enter works too). It saves to the order's Artwork Folder Link, the same Airtable field Create order fills, so everyone sees it. Then the big "Open art folder ↗" appears (and, once Drive is connected, the folder's files).
- A folder that's already set has a small **Change link**.
- Only Google Drive folder links are accepted; anything else gets a plain "In Drive: right-click the folder → Share → Copy link" message and nothing is saved. Practice fakes the save.
- Tests: new folder-link tests pass (bad link rejected, exact PATCH to Artwork Folder Link, button appears, Change/Cancel, practice 0 writes); the v28 Drive suite passes except its old wording check for the red line.

## 2026-10-20 · v30: the garment in the Art brief opens the vendor's page
Stephen: "what if the garment in Art To Do actually sent you to the vendor link....so S&S for most things...Sanmar for when it is only at Sanmar and ASColour as well".
Art to do tab only; every other tab is the same as v29.
- In the Art brief, "on **Gildan 2000 · Black**" is now a link that opens the vendor's page in a new tab, with a small tag after it saying where it goes: **S&S ↗**, **SanMar ↗** or **AS Colour ↗**.
- Which vendor: AS Colour garments (the Garment's Brand is AS Colour) go to AS Colour. Everything else goes to S&S when S&S carries the style (S&S's style list, the same one Purchasing and Price-o-Matic already keep for a day). If S&S doesn't have it but SanMar does (e.g. Port & Company, or a Bella color only SanMar stocks), it goes to SanMar. If nobody answers or the style isn't found anywhere, it goes to an S&S search for the style.
- Link forms: S&S product page `ssactivewear.com/p/<brand>/<style>` (the same link Purchasing uses), S&S search `ssactivewear.com/ps/?q=<style>` as the fallback, SanMar search `sanmar.com/search/?text=<SanMar style code>`, AS Colour search `ascolour.com/search.php?search_query=<style>` (as Purchasing). None of the vendors take a colour in the link, so the page opens on the style and the artist picks the colour there.
- The checks only read (nothing is saved, practice or not), happen once per style per session, and never hold up the brief: the plain garment name shows first and becomes a link a moment later.
- Airtable has no vendor field on Garments, so the vendor is worked out from the Brand field and live vendor lists.
- Tests: Gildan 2000 → S&S product page; AS Colour 5001 → AS Colour with no lookup; Bella 3501 (not at S&S, at SanMar) → SanMar; S&S list down → S&S search; plain name while waiting; one S&S read and one SanMar read per style; no writes; practice 0 writes; v29 and v28 suites pass on v30.

## 2026-10-20 · v31: Review tab — mockup, price and comments big
Stephen, about the Review tab: "I still feel like at this point the mockup and comments and pricing might be more important...let's walk through ways to get those bigger". His answers: "1. Production Manager approves quality and Sales Manager approves pricing 2. Changes go through comments today...but maybe later we can explore moving a job back ... 3. Yes qty and prices will be edited on this page 4. Yeah let's keep ready to send for now the way it is".
Review tab only. Art to do (apart from the Carolina Creative change below), Ready to send, All, Sent and Archived look and work exactly as in v30.
- **One-line order header**: "#11029 DEPPEN BREWING · Patrick · ASAP · Due Oct 27 · 3 lines · $2,412.50 · Airtable ↗", with a small, plain **Send for signature** at the right (greyed until every line is approved; Retry save shows there if a PandaDoc save failed). Gone from Review: Archive order, "Proof took", "No art folder saved"/Art folder, the numbers block, the Pipedrive "no proof email yet" note (it only explains why a job is still in the queue, so it isn't useful to the person approving), the line chooser strip, the 4-step bar, Next and the phone bottom bar.
- **Left (60%): the mockup, as big as the screen allows.** With several files, thumbnails down the left side switch them. Click the mockup for **full screen**: + / − / Fit, mouse wheel to zoom, drag to move around, ‹ › (or the arrow keys) for the other files, Open file ↗, Esc or Close. Under it, **"✓ Quality OK — production manager"**. It does exactly what clicking the "Quality approved" step did (ticks Proof Quality Approved; the same single change). Once ticked it reads "Quality ✓ (undo)".
- **Right (40%)**: a small status line "Quality ✓ · Price —", then the **Price card**: qty with the size breakdown and ✎ Edit qty (the same size editor and the same save as the Garment box's Edit qty), Price / pc you can type in with Save price and Use autoprice (the same save as before), Autoprice, Quoted (Q-n), Margin %, Margin / pc, Line margin (red when the margin is under 5%, the same rule as before), a single warning line, and the **Line total**, which changes as you type a new qty or price ("was $1160.00 · not saved yet") and comes back from Airtable after saving. Then **"✓ Price OK — sales manager"**, the same change as the "Pricing approved" step. Then **comments**, filling the rest of the column, scrolled to the newest. The @-notify chips appear once you click into the comment box, as on Art to do.
- **One yellow button**: Quality OK until quality is approved, then Price OK.
- **Details ▸ 2 imprints · Bella Canvas 3501 Navy · S–2XL · notes** under both columns. It opens the usual Imprints, Garment and Notes boxes (editing imprints and notes works as before; the qty is edited in the Price card only).
- **Review list: "Changes requested"** on a line when its newest comment is newer than its newest proof. The proof time is Airtable's **Proof Images Timestamp** (a last-modified time on Proof Images), so attaching a new proof clears the tag. A line with no proof time gets no tag. The Review list now reads each line's comments (a few at a time, read only) so the tag can show. Nothing is written.
- **Art to do, Carolina Creative** (Stephen: "carolina creative is an internal product we just keep on hand and the art dept has ready to go stock photos for bandanas so they can be left out of the garment finder for Art To Do"): when the garment's Brand is Carolina Creative, or its name starts with Carolina Creative, the brief shows the garment as plain text. There's no vendor link and no S&S/SanMar tag, and the vendor lists aren't checked.
- Practice mode fakes every save (approvals, qty, price, comments, uploads).
- Tested (Playwright, mocked Airtable, 1440×900 and 1920×1080): compact header contents; no step bar, line strip or Next on Review, and they're still there on Ready to send; Art to do is unchanged; the mockup fills the column (470px tall at 900px, 650px at 1080px) with Quality OK and Details on screen; full screen, zoom, wheel, file switching and Esc all work. Quality OK, Price OK, a qty edit and a price edit send **exactly** the same PATCHes as v30's step clicks, Edit qty and price box (compared side by side): `{"fields":{"fldsVU7LXUN6LszvB":true}}`, `{"fields":{"fldR8jKCpNAhfyt5G":true}}`, `{"fields":{"fldCZr5lB6Jx80lfG":30}}` and `{"fields":{"fldtMZWzA4dfPxEXx":12.5}}`, each with returnFieldsByFieldId. Also tested: the live total; Undo sends false; a 3% margin is red and 12% isn't; Details opens; "Changes requested" logic (comment after proof → tag; proof after comment → none; no proof time → none; a new upload clears it); one yellow button; nothing under 12px; practice = 0 writes; no errors. Carolina Creative (Brand or name) → plain text, no lookups, and Gildan still links. Rerun on v31: the v30 and v29 suites pass, and the v24 sending suite passes 30/30. The v26 Art suite passes apart from its 3 old checks that Review has the full header, step bar and visible chips (changed on purpose) and 2 wording checks that already failed on v30.

## 2026-10-20 · v32: Review shows what's approved quietly and points at what's left
Stephen: "should it show what is approved...or does that not make sense on this page". We agreed approvals should show quietly while the page points at what's still needed. And: "sometimes other people approve....but those managers are the usual people", so approvals are never locked to a person: "— production manager" / "— sales manager" are only hints, anyone can click.
Review tab only. Art to do, Ready to send, All, Sent and Archived are the same as v31 (the All tab still says e.g. "Pricing ✓ · 1 to go").
- **List tags say what's left**: "Needs quality" (price is done), "Needs price" (quality is done) or "Needs quality + price". "Changes requested" stays as it was.
- **Needs quality (n) / Needs price (n)** chips at the top of the Review list, right above the lines they filter (the filter row is already full). Click one to show only those lines, click it again for all; only one at a time. A line needing both shows under either. The counts follow the salesperson and the search. Each computer remembers the choice.
- **No status line** ("Quality — · Price ✓") any more. Each approval shows its own state where it's clicked: once price is approved the big button becomes a small "✓ Price approved · undo" in the Price card; once quality is approved, a small "✓ Quality approved · undo" under the mockup. Undo asks first and sends the same change as v31. "Changes requested" now sits next to the Comments title.
- Same saves as v31 (Quality approved / Pricing approved true, undo false). Practice fakes them. One yellow button: the next approval still needed.
- Tested (Playwright, mocked Airtable, 1440×900 and 1920×1080): tag text for each state; chips filter, one at a time, counts follow search, remembered after reload, not shown on other tabs; status line gone; approved states show the small line and undo sends only `{"fields":{"fldR8jKCpNAhfyt5G":false}}` / `{"fields":{"fldsVU7LXUN6LszvB":false}}`; approve PATCHes identical to v30/v31; one yellow; nothing under 12px; practice 0 writes (approve and undo); no errors. The v31 suite (status-line checks updated), the Carolina Creative tests and the v24 sending suite (30/30) pass on v32.

## 2026-10-20 · v33: edit the invoice in Ready to send, with safeguards
Stephen: "can it have a warning and how could we edit the invoice in the ready to send section?" Then: "reps will edit the invoice....and it really doesn't happen much...but I think just having that ability with safe guards could be helpful. I think showing who edited would be perfect. 1. Yes unlink the line from the order....that usually creates issues for us when it isn't unlinked and then shows up in the other apps. 2. since it is rare I think it can change the price after approved...but maybe a warning if it causes us to lose money....vs if we still have good margins then the sales manager really doesn't have any reason to double check". And about removing: "this would also remove the imprint id as well as the line item correct?"
Ready to send only. Art to do, Review, All, Sent and Archived are the same as v32.
- **Invoice box** under the step bar: one row per invoice line, fee lines too (type · garment · imprint · sizes · qty · price/pc · line total). These are the very same rows the PDF invoice draws, so what you see is what the customer gets. Under it: Discount %, Subtotal, Sales tax, Retail delivery fee, Outstanding (Airtable works those out; they're read-only).
- **✎ Edit** on a row: change the sizes and/or the price per piece; the line total and the order totals follow as you type ("Not saved yet"), with the margin shown under the row. **Save** sends the same changes as Review's qty editor and Save price. The Garment box's "Edit qty" and the Pricing box on this tab now open this same editor, so every change on Ready to send goes through the checks.
- **Margin check**: if the new price leaves under 5% margin or loses money, it asks first ("This price leaves a thin margin (3%)" / "This price loses money (−$12.00) … It goes back to Review for the sales manager"). Saving then also unticks Price approved, so the line goes back to Review as "Needs price". A healthy margin saves without asking and leaves the approvals alone.
- **Discount %**: Orders › Discount % is a plain number field, so it can be typed here (Save). If it ever becomes a formula, the app shows it read-only.
- **Remove from order** (asks first, red button): unlinks the line from the order's Line Items, and unlinks its imprints from the order's Imprints link too, so Seps / Screens / Schedule stop showing them. An imprint another line on the order still uses stays ("Takes Gildan 2000 Black and imprint 11040-B off order #11040. Imprint 11040-A stays (also on Bella 3001)."). The line item and its link to its imprints stay in Airtable. The app re-reads the order first, so lines or imprints added elsewhere aren't lost. **Undo** (in the message that pops up) puts both links back, the line in the same place.
- **Who edited**: every edit posts a signed comment on the line in Airtable, e.g. "[Patrick] Invoice edit: qty 24 → 36, price $9.50 → $9.00 (total $228.00 → $324.00)" (discount changes go on the order's first line; removals on the removed line, naming the imprints). The row then shows "Edited by Patrick · Oct 20". You have to pick who you are first; until then Edit and Remove are greyed.
- **Send for signature**: if you remove every proof page of a line but the line is still on the invoice, a red note says "Bella Canvas 3501 Peacock Teal is still on the invoice ($1,160.00). Remove it from the order too?" with a button that does the same Remove (with the question) and rebuilds the packet. You can still send without it. Any invoice edit rebuilds an open preview, keeping the other pages you removed, so the PDF invoice always matches Airtable.
- Practice mode fakes every save, including the comments and the order links.
- Tested (Playwright, mocked Airtable, real pdf-lib / pdf.js, 1440×900): panel rows = the invoice's rows (qty, price, totals, fee line), order totals; qty and price saves send exactly Review's PATCHes; comment text with name and before → after; "Edited by"; thin edit → question, cancel saves nothing, save sends price then Price approved = false and the line shows "Needs price" on Review; healthy edit → no question, approvals untouched; losing-money wording; discount PATCH `{"fldHP6kskiv7OOBvH":10}` + comment, read-only mode; remove → order re-read, one order PATCH with the remaining lines (a line added elsewhere kept) and imprints without the removed line's own imprint (shared one kept), comment, Undo puts both back in place; no name → Edit/Remove disabled; packet note appears only when all of a line's proof pages are removed, its button removes and rebuilds (removed pages stay removed), an edit with the preview open rebuilds it and the invoice adds up; practice = 0 writes; one yellow button; nothing under 12px; no errors. The v32 Review suite (110 checks) and the v24 sending suite (30/30) pass on v33.

## 2026-10-20 · v34: the invoice opens in a pop-up
Stephen (on v33, order 11022 with 5 lines): "looks like the proof disappeared and you can't scroll on the invoice edit section....maybe we make that an open up pop up to edit vs showing it all right away".
The v33 Invoice box sat between the step bar and the proof. On a laptop screen it took most of the height, so the proof and comments were pushed off, and that part of the page doesn't scroll. Ready to send only. Art to do, Review, All, Sent and Archived are the same as v33.
- **Ready to send is back to the v32 layout**: proof on the left, comments, imprints, garment and pricing on the right (the right column scrolls as before). At 1440×900 with a 5-line order, the proof and the first comment are on screen without scrolling.
- **One summary line** under the order header: "Invoice · 5 lines · $2,208.00 · Outstanding $2,375.01", plus "Edited by Whitney · Oct 18" when someone has edited it, and an **✎ Edit invoice** button. It's a plain button; Send for signature is still the one yellow button.
- **Edit invoice opens the v33 invoice in a wide pop-up** (up to 1100px, scrolls inside when there are many lines). Everything in it works the same as v33: edit qty / price with live totals, discount, margin check, Remove (with its imprints) and Undo, signed "Invoice edit" comments, "Edited by". The pop-up stays open after a save, and the summary line updates.
- **Closing**: ✕, Esc or a click outside. If a row or the discount has unsaved changes, it asks "Discard changes?" (Discard / Keep editing).
- The Garment box's **✎ Edit qty** and the Pricing box's **✎ Edit price in the Invoice** open the pop-up already scrolled to that line, in edit mode.
- The Send for signature note ("… is still on the invoice. Remove it from the order too?") works as before. Its button asks first, then takes the line off without opening the pop-up.
- Same saves as v33. Practice mode fakes all of them.
- Tested (Playwright, mocked Airtable, 1440×900): with a 5-line order the proof panel is fully on screen and only 64px shorter than v32 (the summary line); the page doesn't scroll and the right column does; the summary numbers equal the invoice rows and the order's Outstanding; with a 12-line order the pop-up is 1100px wide, under 90% of the screen tall, and scrolls to Outstanding; a redraw keeps its scroll position; N / → don't move lines behind it; Esc / ✕ / clicking outside close it with no question when nothing changed; an unsaved row or discount asks "Discard changes?" (Keep editing keeps the typing); closing writes nothing; Garment Edit qty and Pricing Edit price open on that row in edit mode; a save from the pop-up sends the same PATCH and updates the summary line. The whole v33 invoice suite also passes inside the pop-up (same PATCHes, comments, margin questions, discount, Remove / Undo, packet note and rebuild, practice = 0 writes). One yellow button, nothing under 12px, no errors: 103/103. The v32 Review suite (110/110) and the v24 sending suite (30/30) pass on v34.

## 2026-10-20 · v35: non-garments skip the garment lookup
Stephen (on a patch job showing "Missing: garment"): "we can really exclude all non-garments from this vendor look up"
- **What counts as apparel:** only lines with Product Type Printed Apparel, Embroidered Apparel, Live Printing or Contract Printing get the garment finder. That means the vendor link and "Missing: garment".
- **Other lines:** patches, woven labels, stickers, pins, promo, flatstock, finishing and artwork show their Product Type ("Embroidered Patches (100%)") with no vendor link and no red tag.
- **No Product Type:** the line counts as a non-garment when every imprint on it is Patch/Label ONLY or Flatstock.
- **No location needed:** Patch/Label ONLY and Flatstock imprints no longer show "Missing: location", since they aren't placed on a garment.
- **Garment box:** reads "Item" on non-garment lines.
- **Tests:** new test 10/10 (`scratchpad/lir35/t35.js`); the v34 suite passes 103/103 on v35.

## 2026-10-20 · v36: phone bar is two rows ("Who are you?" moves into ⚙)
**Why:** Stephen's top-bar review. On a phone (390 wide) the "Who are you?" picker pushed the bar to three rows (160px), and its text was cut off.
- **At 700px and under:**
  - The picker is the first row of the ⚙ menu. It is the same select, so picking, signing comments and invoice edits work as before.
  - Until someone is picked, ⚙ gets the yellow ring the picker had.
  - "Choose who you are" (an invoice edit with no name) opens ⚙ with the picker focused.
  - The Practice pill moves to the steps row, which has room for it.
  - The bar has two rows (116px): Pine · app · version · Refresh · ⚙, then Quote › Order › Review.
- **Wider than 700px:** the bar is unchanged. At 1440, 1280, 1024, 768 and 701 its geometry is identical to v35.
- **Tested:**
  - The v34 suite passes 103/103 on v36, and the v35 test passes 10/10.
  - A new picker test passes. It covers the picker in ⚙ on a phone and in the bar on desktop, moving back when the window is resized, the ring, and needMe.
  - At 1440 and 390 there are no console errors and practice mode makes 0 writes.

## 2026-10-20 · v37: find the order's Drive folder by order #, and say what's wrong with Drive
Stephen saved an order's Drive folder link in Art to do and got "Can't read this folder (is it in the shared drive?)", which didn't say what was wrong. He also asked: "can we search the google drive and assign the matching folder sales creates to line item". Sales makes one folder per order in the shared drive, with the order number in its name. Needs **worker v26** (with v25 the app behaves exactly like v36).
- **Art to do, order with no saved folder:** the app asks the worker for folders with the order number in their name (once per order per session; Refresh doesn't repeat it).
  - **Exactly one** → saved to the order's Artwork Folder Link automatically (the same write as Save folder; practice fakes it). A quiet line says "Linked Drive folder "11029 Deppen Brewing" (found by order #)", next to the usual Change link, and the folder's files show as before.
  - **Several** → a list (name opens in Drive, date, plain "Use this folder" button). The paste box stays underneath.
  - **None** → the paste box as today, with "No Drive folder with 11029 in its name yet".
  - Search failed, Drive not connected, or old worker → the paste box as today, nothing else.
  - If the automatic save fails, the folder is offered with "Use this folder" and the error.
- **Saved folder that can't be read:** shows the worker's own message (e.g. "Pine's Drive connection can't open this folder — share it (or the shared drive) with the service account", "Google sign-in failed: invalid_grant …"). For not in the shared drive / not found / no access there's also **Find the folder by order #**, which searches and lets you pick (it never saves on its own).
- **⚙ › Google Drive:** "Connected · <drive name> · as <service account>" or what's wrong (in red), with Check again. Read once when the app opens, on Refresh, and when ⚙ is opened if the last check is over 20 seconds old.
- **Tested** (Playwright, mocked Airtable and worker, 1440×900 and 390 phone), new test 78/78:
  - one match → exactly 1 PATCH `{"fields":{"flddst7TDoJfSqb0s":"https://drive.google.com/drive/folders/…"}}`, the same body as Save folder; quiet line; files listed; no second search on reopen or Refresh; practice 0 writes and stays linked after a reload
  - several → picker, buttons not yellow, Use this folder → 1 PATCH; none → hint; search error → plain paste box
  - worker v25 → the brief's HTML is identical to v36 (no folder and unreadable folder), 0 writes
  - each error code shows its message, Find shown only for folder problems, Find → pick → PATCH, Find with no match says so
  - ⚙ connected / sign-in error (red) / old worker / phone width; Check again re-reads
  - one yellow button, nothing under 12px, no console errors
  - Existing suites on v37: v34 103/103, v35 10/10, v32 110/110, v24 sending 30/30, v29 folder 11/11, v36 picker 31/31, v28 Drive 60/61 (its old "No art folder yet — ask Sam" wording check, which also fails on v36; its folder-not-found check now expects the worker's message).

## 2026-10-20 · v38: folders only, Client Provided opened in the brief
Drive is connected (worker v27, Printshop shared drive). On 11029 Stephen: "looking nice! Can we just keep the folders and remove the other things in the folder....also is it possible to grab the content in the customer provided if it has stuff in the folder"
- **Folders only:** the art brief lists the order folder's subfolders as "Folders (N)" chips, each opening in Drive. Loose files in the main folder are no longer listed.
- **Client Provided opens in the brief:** if a subfolder's name has "client" or "customer" in it and it holds files, they show under its name (e.g. "Client Provided (2)"). Each gets a thumbnail, newest first, up to 12, then "+ N more in Client Provided ↗". An empty one shows as a chip only.
- **One read:** the Client Provided folder is read once per session, like the main folder.
- **Tests:** new test 13/13 (`scratchpad/lir38/t38.js`); v34 103/103. The v37 suite passes 76/78; its two misses expect loose files listed, which v38 removes on purpose.

## 2026-10-20 · v39: folders open in place, previews, Client Provided anywhere, "From last time"
Stephen approved four changes to the Art brief's Drive section. On the reprint row and previews: "Oh that would be great". Previews need **worker v28** (`drive/file`). With worker v27 everything else works, and a preview shows "Open in Drive ↗" instead.
- **Folders open in place:** clicking a folder chip opens it inside the brief, showing its files (with thumbnails) and its own subfolders as nested chips. Click again to close. The small ↗ on each chip opens the folder in Drive. Client Provided starts open.
- **Previews:** clicking a file opens a big pop-up with the file name (and subfolder path), date, page count and "Open in Drive ↗". Esc, ✕ or a click outside closes it.
  - Images show from a blob.
  - PDFs show every page (up to 20), scrollable, using the pdf.js the app already loads.
  - Other types (ai, eps, psd, rtf, Google Docs…) show the Drive thumbnail or the type badge, with "open it in Drive".
  - Reopening a file doesn't download it again (the last 10 are kept).
- **Client Provided found anywhere:** customer files sitting in subfolders up to 2 levels deeper are shown too, each labelled with its subfolder, e.g. "Logos / deppen.pdf". Newest first, up to 12, then "+ N more".
- **"From last time" row:** when an imprint says "Repeat of 9044-B", the app searches Drive for order 9044's folder. The row reads "From last time · 9044 <folder name> ↗", with that folder's Client Provided and Seps files (found anywhere, up to 8, previewable).
  - One row per earlier order, at most 3.
  - Several matching folders → the newest one, plus "(+N more)".
  - Nothing found → no row.
  - Each order number is searched once per session.
- **Lighter on Drive:**
  - Folder reads are cached for the session (Refresh still re-reads them).
  - At most 4 Drive reads run at once.
  - Thumbnails load only when a file is on screen and are swapped in place. v38 fetched thumbnails for every loose file in the order folder, even though they're hidden.
- **Stale replies:** a folder, search or preview that answers after you've moved to another job only fills the cache. It never redraws or draws into the job on screen.
- **Review tab comments fixed.** Stephen: "the new Review section does weird things for comments etc".
  - The problem, on screens 1200px and wider: the comments card had a fixed 200px base and a 240px minimum. With several long comments the list shrank to a 60px slice, and "📷 Add screenshot", "Shows in Airtable's comments too" and Post spilled out of the card.
  - Now the card always takes its full content height. On a desktop the price + comments column scrolls as one when it's taller than the screen. The mockup, the Quality button and the Details row keep their places.
  - The list shows up to about half the screen (at least 260px, or every comment), with the newest in view.
  - Post sits on the Add screenshot row, with "Shows in Airtable's comments too" under it.
  - Opening the composer scrolls the whole composer into view.
  - Art to do and Ready to send are unchanged.
  - Test `scratchpad/lir39/rvc/rvc.js`, 81/81:
    - Review at 1024×768, 1100×800, 1180×820, 1280×800, 1366×768 and 1440×900, with 5 long comments and with 2
    - nothing sticks out of the card, before or after opening the composer
    - the list is at least 200px tall or shows every comment, and the newest is in view
    - Post on the Add screenshot row
    - the column stays inside the grid, with Details below it
    - Art to do and Ready to send cards fit
    - no console errors
- **Tests:** new test 79/79 (`scratchpad/lir39/t39.js`):
  - expand/collapse, nested and remembered
  - each folder read once
  - Client Provided 2 levels deep (3rd level not read), newest first
  - image, PDF (2 pages), .ai and Google Doc previews; Esc, ✕ and outside click; focus returns
  - reprint row found, (+2 more), none, 4 earlier orders → 3 rows
  - worker v27 fallback
  - stale folder reply (no redraw) and stale preview
  - at most 4 reads at once across 32 folders
  - visible-only thumbnails
  - practice 0 writes
  - 390 phone
  - one yellow button, nothing under 12px, no console errors
- **Earlier suites on v39:**
  - v34: 103/103.
  - v32 Review: 110/110.
  - v38: 12/13. The miss expects Client Provided's subfolder files left out; v39 shows them on purpose.
  - v37: 72/78. The 4 new misses count every Drive search, and the 11040 brief now also searches 10804 for its "From last time" row. With those searches left out it's 76/78, the same as v38.

## 2026-10-21 · v40: "From last time" starts folded
On 11029 (a repeat of 9044) the row showed 8 old Seps and Client Provided files straight away. Stephen: "can we not show the past stuff right away....maybe have it a drop down or an option to open....when you see it all right away it can be a bit much"
- **Folded by default:** each "From last time" row is one line: ▸ From last time · 9044 · folder name ↗ (+N more) · Client Provided and Seps files.
- **Opens on click:** clicking the row opens its files, and clicking again folds it. It stays open for that order # for the rest of the session.
- **No early reads:** nothing is read from the old folder until the row is opened (the order # search still runs, so the row only appears when a folder exists).
- **Tests:** new folding checks 7/7 plus the v39 suite run with rows open, 46/46 (`scratchpad/lir40/t40.js`); the full v39 suite with rows open 78/79 (only its "shows v39" check); v34 103/103.

## 2026-10-21 · v41: download straight from the app
Stephen: "are we able to download straight from the app or does it open that link then download" → "yes please check if I did and let's get this updated". Worker v28 was confirmed live: the deployed code matches workers/pine-workers-v28.js.
- **⬇ on every file card:** each Drive file in the brief (Client Provided, opened folders, From last time) has a ⬇ button. It saves the file with its real name through worker v28 drive/file. That includes .ai, .eps and .psd files that can't be previewed.
- **⬇ Download in the preview pop-up**, next to Open in Drive. A file already previewed downloads from memory, with no second fetch.
- **Google Docs, Sheets and Slides:** they have no file to download, so there's no ⬇ and Open in Drive stays.
- **Older worker without drive/file:** ⬇ opens the file in Drive instead.
- **No writes:** downloads only read; nothing is written to Airtable.
- **Tests:** new download test 13/13 (`scratchpad/lir41/t41.js`); the v39 suite with rows open 78/79 (only its "shows v39" check); v34 103/103.

## 2026-10-21 · v42: upload into Drive from the Art brief, proofs into Proofs
Right after v41's downloads, Stephen: "can we also have an upload feature in the app....just trying to really streamline stuff". This uses worker v28's existing `POST drive/upload` (no worker change).
- **⬆ Upload in every open folder:** each opened folder panel in the brief (Client Provided, Seps, Proofs, Embroidery, nested ones like Embroidery › Hats) has a heading with its name and file count and a small white ⬆ Upload button. The button opens a file picker that takes several files.
- **Main folder:** an ⬆ Upload next to "Folders (N)" puts files in the order folder's top level. Loose top-level files stay hidden (v38), except the ones uploaded here, which show as cards after the re-read.
- **Drag and drop:** drop files on any open folder panel. The panel gets a solid black outline on cream, and a black tip by the pointer says "⬆ Drop to upload to Seps". The innermost folder under the pointer wins. The Folders chips area counts as the main folder.
- **Progress:** each file gets a row (⬆ name uploading…). It turns into ✓ name (a link to the file in Drive), or the error in red with Retry.
  - Uploads run 3 at a time.
  - When the batch is done, that folder is re-read so the new files show with thumbnails, and a toast says "Uploaded 3 files to Seps", or how many failed.
  - "Clear" removes the rows.
- **Limits:**
  - Files over 25 MB (the worker's limit) are refused before anything is sent: "huge.tif · over 25 MB, too big to upload here · Open in Drive ↗", plus a toast. The rest of the drop still uploads.
  - Empty files are refused too.
- **No upload on "From last time"** rows (old orders).
- **Proof copies go into Proofs:** when the order folder has a subfolder named Proofs (preferred), Proof or For Proof (any case), the Drive copy of an attached proof goes there. With none, it goes to the top level as before. The hint says where: "saved to Drive › Proofs too" or "saved to the Drive folder too". The saves line reads "Saved to Airtable ✓ · Drive › Proofs ✓".
- **Two drop targets, never both:** a drop on a Drive folder panel only uploads to Drive. The rest of the brief and the Proof box still attach the proof to Airtable, as in v27. The proof target keeps its dashed yellow highlight and now also shows a "Drop to attach as the proof" tip.
- **Practice:** no POST. Rows say "practice, not uploaded" instead of ✓, and the toast says "Practice — 2 files not uploaded to Seps".
- **Busy:** `window.pineBusy()` is true while uploads run, so self-update waits.
- **Fixed on the way:** after a proof's Drive copy, the saves line redraws even when the target folder isn't on screen. Before, it could stay on "Copying…" until the next redraw.
- **Tests:** new test 73/73 (`scratchpad/lir42/t42.js`):
  - picker into Seps (3 files), Client Provided and the main folder, with the right folder IDs, names, Content-Type, raw body and token
  - at most 3 at a time
  - pineBusy on during uploads and off after
  - re-read shows the new files, with toasts
  - drag-drop onto Seps, nested Hats and the chips row; highlight and tip shown, then cleared
  - 26 MB refused while the small file in the same drop still uploads
  - 502 then Retry
  - proof copy into Proofs, and to the top level when there's no Proofs folder, with the name preference order
  - a PDF dropped on a folder panel attaches no proof; the proof drop zone still attaches
  - practice: 0 POSTs and 0 writes
  - no upload on "From last time"
  - one yellow button, nothing under 12px, 390 phone with no sideways scroll, no console errors
- **Earlier suites on v42:** v34 103/103; v41 13/13; v39 with rows open 78/79 (only its "shows v39" check).

## 2026-10-28 · v43: the page list for signed packets
For signed PandaDocs back into Airtable (pandadoc.md).
- **Send for signature** also saves PandaDoc Pages on the order: which packet page is which proof page of which line(s), and where the customer initials. A proof file shared by several lines lists all of them.
- **On load**, pine-signed.js stores new signed packets and checks them. A toast says how many were saved, and how many signed mockups don't match the proof in Airtable (see Signed Check on the line).
- Send test: the same writes as v42, plus PandaDoc Pages and the sweep call.

## 2026-10-28 · v44: imprint rows in a narrow panel
Stephen, with a screenshot of 11101-A spelled down the page one letter per line: "some weird spacing on line item review details".
- **Cause:** the imprint row is a three-column grid (ID · description · buttons). The buttons column (No master folder yet / Master design · 🕘 Last time · ✎ Edit) took its full one-line width, which left the description 0 px wide in a narrow detail panel, so it broke after every letter.
- **Fix:** the panel is a size container. The buttons can take at most half its width, and below 620 px they move to their own row under the description.
- Checked with the real classes: a 430 px panel went from a 0 × 1041 px description to 278 × 61 px; a 900 px panel is unchanged.
- The rule lives in this version only; the shared pine-office-v1.css is unchanged, so other office apps aren't affected.
