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
