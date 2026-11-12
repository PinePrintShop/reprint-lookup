# Approve: our own order approval + signing (to replace PandaDoc)

Permanent link: `approve.html`, the customer-facing page. File names: `approve-vN.html`.

## 2026-11-06 — v1: prototype on a sample order
Stephen: "let's start building something so we can review it in real time. I think have an quick tabable signing and having them go through everything is a good flow...forces them to have to read over the details and we should make all the fields required".
- **Why:** PandaDoc packets are built by hand, or cost $2 each through the API, and the signatures never reach Airtable.
  - Checked first: on the 5 most recent completed packets every box was filled (7–12 initials + signature + name + date). PandaDoc's API doesn't expose a field's "required" setting.
  - Templates: Terms of Service (5 initials) and Customer Supplied Waiver (5 initials + text + signature).
- **Flow (phone first):**
  1. **Start ▸** → "Who's signing?": full name, initials (auto from the name, editable), email, and the e-sign consent checkbox. "Adopt & continue" is locked until all four are done.
  2. **Next ▸** walks every required box in order and lights the next one yellow. Tap it to stamp the initials; the page moves on by itself.
     - 5 Terms initials. The text is Pine's real Terms of Service PDF from Drive: proof revisions $50, changes after signing $100, print size, payment & turnaround, damages & spoilage.
     - An "Approve — initial here" on every proof (image + print size, placement, colors, quantities).
     - The invoice signature (adopted typed style, or drawn), printed name (pre-filled) and date (today).
  3. **Finish ✓** only when every box is done. A progress bar shows "6 of 11 done".
  - **Request a change** on any proof replaces its approve box with a note. The signature isn't needed then, and the button becomes **Send changes** once every proof is approved or has a written change.
- **Prototype only:** a sample order ("Sample Co.", #00000, drawn mockups). Nothing is saved or sent. The finish screen shows what the live version records: signer, email, time, consent, every field with its time, or the change notes.
- **Live version, next:**
  - a worker route + a private per-order link that loads the real packet (proof images, specs, invoice lines);
  - on submit, write approvals / signature / signed PDF + audit page to Airtable and Drive;
  - an Airtable automation emails the link.
  - Needs Stephen's OK on the Order fields and a worker update.
- **Tested** (Playwright, iPhone 13 + 1440 desktop):
  - Sign path: adopt locked until consent; 11 fields walked with Next; name and date filled in; Finish → done screen.
  - Change path: one change → 10 fields + the note → Send changes.
  - No page errors.

## 2026-11-06 — v2: what you're approving stays on screen
Stephen (on his phone): "Looking good. Can we space it better so the proof invoice are viewable while you sign".
- **Phone layout:**
  - The top bar scrolls away instead of sticking.
  - Proof image capped at about a third of the screen. Specs in two tight columns. The approve box sits beside "Request a change".
  - Tighter invoice table. Shorter signature box. Name and date side by side. Slimmer bottom bar.
- **Next scrolling:**
  - On a proof, Next lands the whole proof card at the top: image, specs and its box together.
  - On the signature, the box sits just above the bottom bar, so the invoice and total stay in view.
- The date box no longer runs past the card edge on iPhone (`appearance:none`, `min-width:0`).
- **Tested** (iPhone 13, measured where Next lands):
  - v1: proof image cut off (−168..164), first invoice row off screen.
  - v2: proof image, specs and box fully visible on proofs 1 and 3; signature view shows the first invoice row, the total and the sign box together; name and date both visible.
  - No errors.

## 2026-11-06 — v3: a Pine welcome screen first
Stephen: "Can we make this first part a little more pine fun and not show the top of the terms".
- The page opens on a black Pine card:
  - the order # badge in yellow;
  - "Hey Jordan! Let's get **Sample Co.** on press." (Poppins Black, the customer in yellow);
  - "Three quick steps and we start printing — about 3 minutes";
  - the steps as yellow-numbered rows: Read the terms (5 quick initials) · Check your proofs (3 proofs to initial) · Sign & approve (your invoice · total);
  - one big yellow **Let's go ▸**, "Every box is required…", then due date / shipping / rep chips.
- Terms, proofs, invoice and the bottom progress bar stay hidden until Let's go. Then the adopt step opens and Next walks the boxes as before.
- The welcome fits one phone screen: button bottom at 560 of 664 px on an iPhone 13. On an iPhone SE it's 18 px past the edge with the demo banner, which won't be on the live page.
- **Tested:**
  - Terms and progress bar hidden before Start.
  - The v2 layout checks still pass (proof image, specs and box all visible; invoice, total and signature together).
  - No errors.

## 2026-11-06 — v4: sample client Garrett, "Who's signing?" starts empty
Stephen: "Can we make the sample client Garrett and then can we not have the name and email part auto filled but just that greyed out text".
- The sample contact is Garrett Sample <garrett@sample.co>, so the welcome says "Hey Garrett!".
- In "Who's signing?" the full name, initials and email boxes start empty. The order's contact shows as grey placeholder text ("Garrett Sample", "GS", "garrett@sample.co"), so the signer types their own.
  - Initials fill in as they type their name.
  - The signature preview shows a faded "Your name" until then.
  - "Adopt & continue" stays locked until name, initials, email and the consent box are all done.
- Later on, the printed name next to the signature still fills in from the name they typed.
- **Fonts** (Stephen: "let's not have cursive for the initals and let's try a different one for the signature part"):
  - Initials are plain bold print (Helvetica, blue ink).
  - The typed signature uses Google Fonts' **Mrs Saint Delafield**. The sign step offers three styles to pick from (Mrs Saint Delafield, Homemade Apple, Caveat), or Draw. The picked style is used on the signed box.
- **Tested:**
  - The adopt boxes start empty with the three placeholders.
  - Typing the name gives initials GS and unlocks Adopt.
  - The rest of the flow and the layout checks pass. No errors.

## 2026-11-06 — v5
Stephen: "let's just do Dancing Script....also some things still get cut off in teh terms part when you are scrolling through the initials so let's really clean that up to make it readable while signging"
- **Signature:** Dancing Script only (PandaDoc's default look). The style picker is gone; the sign step is "Use this" or Draw.
- **Terms while initialing:** each Next scrolls the whole term to the top of the screen (not just its box), and the term being initialed gets a cream highlight with a yellow edge. On phones the terms text is 15px with tighter spacing so long terms fit.
- **Tested (iPhone 13 and iPhone SE):** all 5 terms land fully visible above the bottom bar and are highlighted. v4 cut off Payment and Damages. The signature renders in Dancing Script. No errors.

## 2026-11-06 — v6
Stephen: "looks like the description of the terms gets cut off during the flow"
- **Cause:** on iPad and computer screens the black top bar stays pinned, and v5 scrolled each term to the very top of the window — under the bar. Only the last line of the term showed. (Phones were fine; the bar scrolls away there. The v5 test measured against the window top, so it missed this.)
- **Fix:** the page measures the pinned bar and sets the scroll padding to its height, so terms and proofs stop just below it.
- **Tested** (iPhone 13, iPhone 14 Pro Max, iPad portrait and landscape, 1440×900, 1280×720): every term lands fully between the top bar and the bottom bar. v5 cut every term on iPad and desktop. Full flow signs, no errors.

## 2026-11-06 — v7
Stephen: "still skips 1 - Terms section that says Please take the time...."
- After adopting a signature, the first step used to jump straight to the first term, so the "1 · Terms" heading and the "Please take the time to look over your proofs…" intro scrolled away unread.
- Now the first step lands on the "1 · Terms" heading, so the intro and the first term (with its box) show together. If a screen is too short for all of that, the whole first term is kept in view instead (`showFirstTerm`).
- **Tested** (iPhone 13, 14 Pro Max, SE, iPad portrait and landscape, 1440×900, 1280×720): the heading and intro are visible, the first term is fully above the bottom bar, and the later terms are still whole. Full flow signs, no errors.

## 2026-11-06 — v8
Stephen: "let's do one more scan to see if things get cut off with the next bar on any text"
- **Scan:** walked all 10 steps on 8 screens (iPhone 13, 14 Pro Max, SE, Pixel 7, iPad portrait and landscape, 1440×900, 1280×720). At each step it checks that everything the step needs sits between the top bar and the Next bar: the term and its box; the proof title, image, specs, box and "Request a change"; the total, the signing note and the sign box; the name and date.
- **Found in v7:**
  - On short wide screens (1280×720 laptop, iPad landscape), the proof image was too tall, which pushed the specs and the Approve box under the Next bar.
  - The "By signing you approve…" line sat below the name and date, so it was cut, and it came after signing.
  - Lines of the next item were sliced in half at the Next bar's edge.
- **Fixed:**
  - The proof image height is capped so the whole proof fits between the bars.
  - The signing note now sits above the signature box, so it's read before signing.
  - A 28px white fade above the Next bar, so text running under it reads as "more below" instead of chopped.
- **v8 scan:** nothing a step needs is under either bar on any of the 8 screens. Full flow signs, no errors.

## 2026-11-06 — v9: desktop version
Stephen: "can we work on the desktop version now!" · "also on mobile the next bar sits on top the the name and date at the bottom after you sign" · "and on desktop let's really fill up the screen"
- **Desktop (1100px and wider)**
  - Fills the whole window.
  - A sticky **order panel** on the right with:
    - order #, customer, total, due date and ship method
    - the 3 steps with live counts (click a step to jump to it; a green ✓ when it's done; yellow for the current step)
    - the progress bar
    - the one yellow Next/Finish button (the bottom bar is hidden on desktop)
  - Proofs: the image on the left, and the specs, Approve box and "Request a change" on the right.
  - The invoice and the signature sit side by side.
  - The welcome screen is two columns at full height, with a bigger headline.
  - At 1500px and wider, the terms are in two columns.
- **Mobile Next bar over the name/date**
  - Cause: real iPhones add the home-indicator space under the Next bar (about 34px). The page assumed a fixed 96px clearance and the phone emulator doesn't add that space, so it wasn't caught.
  - Fix: the page now measures the bar and sets `scroll-padding-bottom` to its real height, and the bottom padding includes `env(safe-area-inset-bottom)`.
  - Scan with a home-bar-height bar: v8 had the sign box and name/date under the bar on every iPhone; v9 is clear.
- **Flow:** signing now fills in the printed name and today's date together, so the next tap is Finish.
- **Fixes**
  - The welcome card could reappear under the steps (`display:grid`/`flex` beat `[hidden]`).
  - The v8 white fade drew a band over the cream gaps on wide screens, so it's now phones only.
- **Tested**
  - Scan on 9 screens (including 1920×1080) with an iPhone-height bar: everything each step needs is visible. The only flag is iPhone SE + home bar on the last term, a combination that doesn't exist (the SE has a home button).
  - Desktop: Finish from the panel reaches the Thank-you screen.
  - Phones: full flow signs, no errors.

## 2026-11-06 — v10: real proofs, one initial per page
Stephen tested with a real order ("Can we do a test with our actual proofs and invoices?"), then: "Fix away and initial per page like we currently do".
- **Test with real order 11157 (already signed in PandaDoc)**
  - Sources:
    - the 3 proof PDFs from the order's Drive Proofs folder (Illustrator sheets: a proof sheet plus a close-up page per print)
    - the invoice lines from the PandaDoc packet
    - sizes and ASAP from Airtable
  - Built as a private file in the session scratchpad only. Customer data and art stay out of this public repo.
- **One initial per proof page**, as in our PandaDoc packets.
  - 11157 has 7 proof pages, so 5 terms + 7 pages + signature/name/date = 15 steps.
  - Data: `proof.pages=[{img, label, appr, ar}]`, with keys `p:<proof>:<page>`.
  - Request a change still covers the whole proof.
  - The audit says "Proof 1 page 3 approved".
- **The sheet's printed APPROVED box takes the initials.**
  - `appr` is the white box as fractions of the page.
  - For Illustrator PDFs it's found from the word APPROVED (pdftotext) and then the box edges in the pixels; Mockup Maker PDFs already store it (PINE-INKS "appr", v194).
  - The box pulses yellow while it's the next one, can be tapped, and shows the initials once approved.
- **Tall pages on phones:** the first Next shows the page; if the Approve box isn't on screen, the next Next brings it into view.
- **Invoice:** each line shows its sizes (`l.sz`, e.g. S 5 · M 15 · L 17 · XL 13).
- **Proofs counter:** "x of 7 pages initialed" when proofs have close-ups.
- **Tap any page to see it full size.**
- **Tested**
  - 11157 on desktop and iPhone: every page's box reachable, the printed box tap works, Finish shows the per-page audit, no errors.
  - Sample page: scan clean on 9 screens; signs and finishes.

## 2026-11-06 — v11
Stephen: "I think we should move away from those boxes and do it like we had before with this new flow. It is netter"
- Removed the v10 initials-in-the-printed-APPROVED-box overlay. Each page is initialed with our own yellow Approve button only.
- Everything else from v10 stays:
  - one initial per page
  - Next shows a tall page, then its box
  - sizes on the invoice
  - the page counter
  - tap to enlarge
- Tested: the real-order private test on desktop and iPhone (all 7 pages, per-page audit, no errors); the sample-page scan on 9 screens; full flow.

## 2026-11-08 — v12: questions go back to the email
Stephen: "Since they will click this from an email. Can the have questions take them back to that email?" → "Let's build"
- **A Question? button on every screen:**
  - the top bar (desktop and iPad)
  - next to the progress count in the phone's Next bar
  - the desktop order panel
  - the welcome screen
- **It opens a panel with three things:**
  - **Email <rep>** starts a reply to the approval email: `mailto:` to `O.repEmail` with the subject "Re: " + `O.subject`, so it usually files into the same thread, and a body with the order # and the step they're on (e.g. "question about Proof 2, page 3 — AS Colour 5026 · Cypress").
  - The address is shown as text with Copy, since mail links can do nothing on some phones.
  - Back to my order.
- **Progress is kept in this tab (sessionStorage).** A trip to the email app and back, or a reload, resumes where they left off. It's cleared on Finish.
- The live version needs `repEmail` and `subject` (the approval email's subject) from the order.
- **Tested** (iPhone and desktop):
  - the link's subject and body
  - Copy, and its fallback of selecting the address
  - reloading mid-flow resumes at the same step
  - Finish clears the saved progress
  - the scan on 9 screens and the full flow pass with no errors

## 2026-11-10 — v13: name and email fill in again
Stephen: "can we put back the name email auto fill in the approval app."
- "Who's signing?" starts with the order's contact name and email filled in (v4 had made them grey hints only). The signer can change either; the initials follow the name unless typed.
- If the signer already adopted a name in this tab, theirs is shown instead.
- Tested: prefill Garrett Sample / garrett@sample.co → GS; typing a new name updates the initials; no errors.

## 2026-11-12 · v14 · previews real orders from Line Item Review
Stephen: "create a practice line item review with the approval concept built in … see how our mockups and invoices work with
some real jobs".
- `approve-v14.html?preview=1`, opened by Line Item Review v57's **Preview approval**, waits for the order's packet from the
  page that opened it (postMessage, same site only). Packet: proof pages as pictures `{blob, ar, label, appr:[x,y,w,h]}`,
  invoice rows `{d, q, p, t, sz}`, `totals:{sub, tax, total, paid, rows:[[label, amount]]}`, contact, rep, repEmail, due, ship.
- Yellow note: "Preview of order N from Line Item Review. Nothing you enter here is saved or sent to the customer."
  Its own saved progress key, cleared on load.
- Spec cells with no value are left out, since real proofs carry size, placement and colors on the sheet. Quantities show
  per proof. The invoice uses each row's own total and the order's totals rows; "Balance due" when payments were received.
- Without `?preview=1` it's the v13 sample page, as before. `approve.html` → v14.
