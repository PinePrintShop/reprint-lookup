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
