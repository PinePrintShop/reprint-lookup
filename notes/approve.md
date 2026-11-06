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
