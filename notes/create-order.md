# Create order

## 2026-10-12 · blank-order mockup (`create-order-blank-mockup.html`)
Stephen: bring sales into Create order slowly. They start from a blank order and add garments and sizes themselves. Pre-filling from the Price-O-Matic quote is the end goal, but it comes later. Adding every imprint first and then remembering which line each goes on is confusing.

**Flow (practice-only mockup with mock data and no Airtable; edit in place):**
1. **Order:** pick the order Pipedrive made (10902 New Millennium or 10939 Black Fox Provisions).
2. **Garments:**
   - Search a style # (5026, 3001, 1134, "dad hat", "checker") and tap every color. **Each color becomes its own line.**
   - Sizes per line with a running total, or type a total and **Spread over sizes** (OSFA for hats).
   - Women's/Youth toggles on each line.
3. **Designs, one at a time:**
   - **Repeat of past art…** (that customer's past imprints, with thumbnails), or Location, Method, Ink/type, Colors (+ underbase), Ink changes.
   - **Goes on:** garment chips with color swatches, or "all garments".
   - **+ Add the next design.**
   - Warns when a screen-print design goes on dark and light garments with no ink change, with a one-tap "+1 ink change".
4. **Order map & prices:**
   - A grid of garments × designs with tap-to-change ticks.
   - Price per piece defaults to today's Price-O-Matic price. Typing a lower price turns red ("under POM $20.80").
   - **+ Add fee** for invoice-only lines.
5. **Rail:** a checklist (order, sizes, designs complete, every garment has a design, prices), counts and the total. **Create order** unlocks when everything is ticked. In the mockup it shows what it would write.

**Pricing in the mockup** is today's POM screen-print math: 12 min/screen, 230/hr, $579.29/hr, $35 per ink change, garment +10%, $0.65 shipping, ÷0.97, rounded to $0.05. Embroidery and patches use the tier tables. Order 10902 on AS Colour 5026 reproduces Airtable's Autoprice exactly: Black $20.80, White $18.95.

**Tested** in Playwright:
- 10902: two colors, sizes typed and spread, design A as a repeat with the ink-change warning, B and C backs, the map, prices set under POM and flagged, a fee, then create.
- 10939: 7 hat and tee lines and a patch design on all of them.
- No errors.

**Next:** Stephen and sales click through it. Then decide whether price defaults to the POM price or is typed in, and wire it to Airtable in `pom-create-order-live.html`.

## 2026-10-12 — Mockup rebuilt around products (big-order flow)
Checked against WARGAME 10500 (13 lines, 7 imprints) and 10975 (9 lines, 9 imprints). In Airtable today, sales make every imprint in Imprint Creator first, typing each nickname. Then they make line items one at a time (e.g. "3001 White"), find the right imprint IDs, tick them, submit and repeat. On 10500 that is 34 imprint look-ups.

The new flow works one product at a time:
- **Product**: one design idea (H20 BOY, 92 SHIRT, OG BRAND 3D). The name groups the versions and starts each line nickname ("92 SHIRT – Blue 293 on White").
- **Prints**: one row per location. Each is its own imprint ID with **its own Imprint Nickname** (per location, like "Damn Proud" on the left sleeve and "USN Emblem" on the left chest). A print can be new, a repeat of past art, or one that's already on this order (the size tag shared by every product).
- **Versions**: each row is garment + color + ink colors + sizes + print toggles. Each row becomes a line item. "Same garment, other inks" copies the row so only the ink colors need typing.
- **Ink changes are counted automatically**: the number of different ink colors typed on the versions that share a screen print, minus one. They can be overridden per print.
- **Step 3** shows every line × imprint with today's POM price; under-POM prices show red. The rail compares this flow with the Airtable way.

Each order card has "Start blank" and "See it built" (loaded with the real order). 10902 reproduces Airtable's $20.80 / $18.95 autoprice exactly. Garment costs for the WARGAME styles are placeholders, so their red under-POM flags are rough.

## 2026-10-12 — No typed product name; line names come from the Airtable formula
Stephen pointed out that the line item name is a formula, e.g. `10977-Murf.studio-IND-IND4000Z-BK` (order-customer-brand code-style-color code), and only imprints get typed nicknames. The mockup now matches:
- The "product name" box is gone. Each **group** is titled with its own prints' nicknames, e.g. "Ragin Mess MENS". Shared prints like a size tag are left out of the title.
- Step 3 shows each line's automatic name. One note explains that lines on the same garment and color share a name, and the imprints tell them apart. On 10977 both lines are IND4000Z Black (MENS and WOMENS backs).
- Added 10977 Murf.studio as the small real example. Added IND4000Z to the mock catalog. The POM estimate uses the fleece shipping allowance.

## 2026-10-12 — "Same garment again" copies the whole row
Stephen: a second row on the same garment is usually another design (10977 MENS vs WOMENS back), not just other inks. The button now copies the last row's garment, color, ink colors and print ticks; sizes start empty. Sales then tick the different prints or change the inks. 10977 is now shown as one group with two rows (A B C and A C D), the way it would really be entered. "Add another group" is only for a separate set of prints, such as hats.

## 2026-10-12 — Fresh start: built for the common order, with reorder as its own door
Stephen felt the product/group flow was layered on itself and not yet better than Airtable, so the mockup was rewritten from scratch. It's based on the last 12 months of Airtable data (1,698 orders, cancelled left out):
- 51% of orders have 1 line, 34% have 2–3, 14% have 4–9, and 1.6% have 10+. 56% have exactly one imprint.
- 30% reuse some past art and 15% are a straight reorder of one past order. Repeats go back a median of 7 months, and 27% are over a year old.
- 226 imprints are ticked Repeat? with no previous imprint linked.

Ideas taken from other print-shop software: Printavo (imprints attached to groups of garments), DecoNetwork (reorder and reuse of artwork) and YoPrint (decoration as a priced service).

The flow:
1. **Pick the order** (Pipedrive made it).
2. **Two doors** when the customer has history:
   - **Reorder** lists their past orders with art thumbnails. One tap copies the garments and makes the imprints as repeats with Previous Imprint ID filled. It shows last time's sizes and price.
   - **New order** is everything else.
3. **One card per line item.** Proofs stay per line, as today. Each card has:
   - Garment search, ranked by style #.
   - Color chips.
   - Sizes: grid, or **paste from the email** ("6 S, 6 M, 15 XL", "S-10 M-20", "10 small 20 med", "2X 3"). The sample Pipedrive email sits on screen to copy from.
   - Prints, each added from one of three tabs:
     - **On this order:** same imprint ID.
     - **Customer's past art:** searchable thumbnails; makes a repeat.
     - **New art:** nickname, location, type, colors, inks.
   - Ink colors per print per garment. A difference counts as an ink change.
4. **More lines:** "Another garment, same prints" (men's and women's tees), "Copy last line" (same hoodie with a different back, as on 10977) or a blank line.
5. **Rail:** checklist, imprint list, total and Create. **A clock** times each order from picking it to Create, for the stopwatch test against Airtable.

Real data comes from Mill City Church (7 past orders, 23 imprints), 10977 Murf.studio and WARGAME. A 10193 reorder of 6210 gives 10193-A/B as repeats of 6210-A/B. 10977 built by hand gives Airtable's exact line names and 4 imprints, with prices within about $1 of Airtable.

Found while pulling data: Autoprice is #ERROR! on lines of finished orders, because the imprint quantity rollup reads 0 there. This was not caused by the October formula changes. Open orders price normally.

## 2026-10-12 — Pipedrive: worker v18 (read-only email lookup)
Stephen added `PIPEDRIVE_KEY` (sales@ user) as a Cloudflare secret. The live worker was checked first and matches `workers/pine-workers-v17.js`; v18 is v17 plus:
- `GET /proxy/pipedrive/me`: checks the key and returns only the key owner's name.
- `GET /proxy/pipedrive/emails?email=<customer email>`: finds the Pipedrive person by exact email. Airtable stores no Pipedrive IDs, and Orders carry the customer email. Returns their deals and newest synced emails, with plain-text bodies for the newest 3. Cached for 2 minutes.
- Same Airtable-token gate as PandaDoc. GET only; nothing in Pipedrive can be changed through the worker.
- Tested locally against a fake Pipedrive. A live test needs the deploy. **Deploy:** Cloudflare → Workers & Pages → pine-workers → Edit code → paste `workers/pine-workers-v18.js` → Deploy. Then open `pipedrive-test.html`.
- Emails only show if sales@ has email sync on in Pipedrive and the emails are linked to the person.
- Checked through the new Pipedrive connector (read-only), logged in as Chris Hoffman. One login sees a customer's emails from **every synced mailbox**: Patrick's hello@, Josh's and the Airtable automation emails all appear under Joseph @ Murf.studio. So hello@ doesn't need its own key.
- v18 (not yet deployed) now skips bulk sends (anniversary-discount blasts) and robot senders (Airtable, ShipStation), so the real conversation shows first.
- 10977's October sizes email is **not** in Pipedrive (Murf.studio's newest is July), so not every order's sizes arrive by synced email. The paste box stays the fallback.
- **Deployed Oct 12:** Stephen pasted v18 into Cloudflare, and the Pipedrive check page works (key OK, customer emails show).

## 2026-10-12 — create-order-v1: the real build (writes to Airtable)
Built from the fresh mockup's flow on real data. It reuses pom-create-order-live's Airtable reads and the POM pricing engine (`price-o-matic-v105.html` in a hidden iframe; **bump it when the POM gets a new version**). Permanent link: `create-order.html`. Practice: `?practice=1`, where every write is faked and nothing is sent.

**Flow**
1. Orders waiting for proof (last 45 days, search by customer or #; `?order=` opens one).
2. If the customer has history: **Reorder** (their past orders with proof thumbnails; copies garments, and the imprints as repeats with Previous Imprint ID and inks linked) or **New order**.
3. Customer emails from Pipedrive (worker v18), found by the order's contact email, to copy sizes from.
4. One card per line item, with:
   - type (folded; Printed Apparel by default, Embroidered Apparel when every print is embroidery)
   - garment by style # (Airtable Garments)
   - color
   - sizes (grid, or paste from the email; "use same sizes" on reorders)
   - Women's / Youth
   - prints, from on this order, the customer's past art, or new art (nickname, location, method, type, colors, underbase, inks)
   - ink colors per print per garment
5. Price per line: today's POM price, following changes until someone types a price. **Shared prints are priced at the pieces they print across the whole order** (POM's impressionPrice at the print's total qty), the same way Airtable's autoprice works. 10977 comes out at $42.05 / $51.60, exactly Airtable's. Pricing each line on its own gave $71.50 for the 20-pc women's line.

**What it writes** (checked against the automations first)
- **Imprints, one call each, in order:**
  - Linked Orders, Imprint Type, Location, Nickname, Screen Count, Ink Changes (screen print).
  - Repeats also get Repeat?, Previous Imprint ID and Inks.
  - **It never writes Imprint ID:** the "Copy Imprint ID" automation fills it from the order link, so letters continue after any imprints the order already has.
- **Line Items, 10 per call:**
  - Both order links (Order Reference is what automations read), Product Type, Garment, Imprints, Price Input, sizes, Women's / Youth.
  - Proofing Notes, built from the imprints, e.g. "10977-B Left Sleeve · Damn Proud · 1c + UB · inks: White". "UPDATE:" is kept out because it posts to Slack.
- **Never written:** Order Status (it emails customers), Ready for 2nd Eyes (emails quality@), Ordered, Received.
- **If a write fails partway**, it lists what's already in Airtable and the button becomes **Finish creating**, which only adds what's missing. Already-created lines and prints can't be removed here.
- After creating: the page locks, shows the real IDs (read back after the automation runs) and links to **Review**.

**Tested with mocked Airtable + worker:**
- Mill City reorder of 6210.
- 10977 by hand.
- An order that already has imprints: new ones are C to F.
- Practice mode: zero writes.
- Failure on line items, then retry: no duplicate imprints.
- Phone at 390px with no sideways scroll.

**Not in v1 yet:**
- Quote prefill from the POM (on purpose, for now).
- Order fields (rep, due, shipping, source).
- Adding a new garment from the vendor.
- 2XL+ up-charges in the total (Airtable adds them).
- Vendor price check.
- Non-apparel pricing (typed by hand).

## 2026-10-13 — v2: right rep's emails, read email & fill, print notes, line notes
- **Emails from the right inbox.** On 10999 UpSlope (Patrick's order), v1 showed a thread with Chris. That's because the worker returned the customer's newest emails from any Pine inbox.
  - Worker **v19** now sends each email's to/cc and deal.
  - v2 shows emails to/from/cc the order's rep first: Patrick = hello@, Chris = sales@ (`REP_BOX`). Others fold under "show N emails with other Pine inboxes".
  - With worker v18 still deployed (no to/cc), v2 shows all emails as v1 did.
- **✨ Read email & fill the order.** Sends the rep's newest emails (up to 4), the customer's past imprints, and the allowed locations and print types to worker v19 `POST /proxy/ai/order-from-email`.
  - Claude (`claude-opus-5-5`, structured JSON output, refusal fallback on) returns a **draft**:
    - lines: style, brand, color, sizes, women's/youth, which prints, notes
    - prints: nickname, location, type, colors, underbase, inks, repeat of a past imprint, print notes
    - questions still to ask the customer
  - The draft shows first; **Use this draft** fills the form.
  - Garments are matched in Airtable by exact style # (+ brand), then color. If no match, the style is typed into the garment search and the line says what the email said.
  - Unanswered questions stay on screen ("Still to check with the customer"). Nothing is saved until Create order, and practice mode still fakes the writes.
- **Print notes** on every print chip → Imprints **Print Notes** (`fldNuEzGIYI8FWqXu`). Every line on that imprint shows them through the lookup. Rail shows 📝 when a print has notes.
- **Notes** row on every line → added under the print rows in **Proofing Notes** as "Notes: …". "UPDATE:" is still neutralized (it posts to Slack).
- **Airtable fields checked 10/13.** Print Notes and Ink Notes live on Imprints. Line Items has Sales / Production / Order / Shipping / Finishing / Proofing Notes. No automation watches Imprints Print Notes on create.
- **Tested with mocks** (cov2.js), desktop + phone, 10999 UpSlope:
  - Patrick's hello@ email shown first; Chris's sales@ email folded.
  - Only Patrick's email was sent to the reader.
  - Draft → 1 line IND4000 Black 4/8/8/4 (24 pcs, POM $57.05), prints 10999-A Front 2c+UB White/PMS 7409 "About 11 in wide" and 10999-B Left Sleeve.
  - Writes: Print Notes on each imprint, and Proofing Notes ending "Notes: Logo centered 3 in below collar". No errors.

### Turning on email reading (one time, Stephen)
1. **Create an Anthropic API key:** go to https://console.anthropic.com, sign in or create the Pine org, open **Settings → Billing**, add a card and some credit ($10–20 is plenty to start; each email read costs about 1–3¢). Then go to **Settings → API keys → Create key**, name it "pine-workers", and copy it (it starts `sk-ant-`, and is shown only once).
2. **Add it to the worker:** Cloudflare dashboard → Workers & Pages → **pine-workers** → Settings → Variables and Secrets → **Add** → type **Secret**, name `ANTHROPIC_API_KEY`, paste the key, Deploy.
3. **Deploy worker v19:** open https://pineprintshop.github.io/reprint-lookup/copy-worker.html and tap **Copy worker code**. Then pine-workers → Edit code → select all → paste → Deploy. v19 includes everything v18 did; Pipedrive emails now carry to/cc.
4. **Check:** open Create order (practice link), pick an order with emails, tap **✨ Read email & fill the order**.
   - "Email reading isn't switched on yet" → the secret is missing.
   - "needs worker v19 deployed" → step 3 didn't save.
- Optional: Anthropic console → Settings → Limits → set a monthly spend limit.

## 2026-10-13 — v3 + worker v20: the right conversation, and each rep's emails private
- **What v2 got wrong (Stephen's real orders):**
  - **10999 UpSlope (Patrick):** Patrick's hello@ held only Patrick's own two July 2025 emails. Brady's replies were in Chris's sales@ thread, so v2 showed nothing useful and also exposed Chris's emails under "other inboxes".
  - **Boxcar (Patrick):** Jon sent the "Re-order" (S 20 / M 18 / L 14 / XL 20) to **chris@pineprintshop.com**. The reader drafted from the older 10925 proof/payment emails instead.
  - **Why Patrick's mail was missing:** the Pipedrive key belongs to the sales@ user, and Pipedrive email sync is **private per user** (every message is `connection_type: private`). That key sees Chris's mail plus only the emails Patrick sent from inside Pipedrive.
- **Privacy rule (Stephen chose "customer's emails only"):** a rep sees:
  - **their own conversations**, minus anything another Pine address wrote
  - **anything the customer wrote to any other Pine address**, with quoted earlier messages cut off and labeled "sent to another Pine inbox"

  Another rep's own emails are filtered out in the worker, so they never reach the browser.
- **Rep addresses** (`REP_BOX` in v3): Patrick = hello@ + patrick@; Chris = sales@ + chris@. Reps without an entry (Garrett, Josh, Stephen) get no emails until added.
- **Worker v20:**
  - **Keys:** each rep's own Pipedrive key reads their private mail: **`PIPEDRIVE_KEY_HELLO`** for Patrick (secret name = `PIPEDRIVE_KEY_` + the part before @). `PIPEDRIVE_KEY` stays Chris/sales@. Customer-written mail is gathered with every key the worker has.
  - **Messages:** each carries its thread id, and full text comes for the customer's newest 5.
  - **Checking a key:** `/proxy/pipedrive/me?inbox=hello@pineprintshop.com` says which Pipedrive user a key belongs to.
  - **Reader:** it gets `currentLines` and is told older proof/invoice/payment emails are background only.
- **v3 screen:**
  - Emails are grouped into conversations, one button each, newest customer-written first, and the reader reads the selected one.
  - "No emails from the customer in Pipedrive" shows when there's nothing from them.
  - Draft lines that match a line already on screen (e.g. after Reorder: same style + color) fill that line's sizes instead of adding a new line.
- **Tested** (worker in Node with fake Pipedrive keys; page with Playwright mocks):
  - **Patrick's view of Boxcar:** Jon's reorder (from Chris's mailbox, Chris's quoted note cut off) plus Patrick's own thread, with no Chris-written email.
  - **Chris's view:** the mirror image.
  - **Boxcar flow:** the reorder fills the existing 1717 Black line with 20/18/14/20. UpSlope shows the "no emails from the customer" note. A Garrett order shows no emails.
- **To finish (Stephen):**
  1. Deploy worker v20 from copy-worker.html.
  2. Patrick creates his own Pipedrive API key (logged in as Patrick: Personal preferences → API) → Cloudflare secret **`PIPEDRIVE_KEY_HELLO`**.

## 2026-10-13 — v4 + worker v21: the Pipedrive deal is the source
- **Why (Stephen):** v3 "is getting a little crazy". On Boxcar 10998 it showed 7 conversation buttons (old 10925 proofs, payment reminders, a hat catalogue…). Starting from the customer pulls in everything they ever sent Pine.
- **What Pipedrive holds** (16 real deals checked 10/13):
  - **Order link:** the order # is in the deal title, "10998 | Boxcar Coffee".
  - **Structured fields:** shipping, delivery method, Hard Deadline/ASAP (+ expected close date), salesperson.
  - **Web-form leads:** Typeform "Project Description" (qty range, locations, ink count, artwork link).
  - **Not used:** products and the Front/Back/Sleeve Colors, Merch Type and Approx Qty fields are always empty.
  - **Emails only:** garment, color, sizes and print details. The approved proof is a PandaDoc link in the "REVISED PROOFS!" email.
- **v4:**
  - Finds the deal by order # (worker v21 `/proxy/pipedrive/deal?order=`) and shows **only the emails linked to that deal**, plus the deal link, owner, deadline and delivery, and the web-form description.
  - No inbox lists, no thread buttons, no other orders.
  - The reader reads those emails plus the web-form text.
  - A customer email that isn't on the deal (e.g. sent to another rep) shows once someone links it to the deal in Pipedrive. The screen says so when only Pine's emails are on the deal.
- **Worker v21:**
  - Reads deal emails with every Pipedrive key it has (`PIPEDRIVE_KEY` + any `PIPEDRIVE_KEY_*`), since synced mail is private to the rep who synced it.
  - Patrick's key is still needed for his private mail. Any `PIPEDRIVE_KEY_<NAME>` name works now, e.g. `PIPEDRIVE_KEY_PATRICK`.
- **Tested with mocks:**
  - **Boxcar 10998:** deal + Jon's reorder; the reader filled 1717 Black with 20/18/14/20.
  - **UpSlope 10999:** web form shown, plus the "only Pine's emails" note; the reader got the email + web form.
  - **No deal:** clear message. No errors.
- **Next idea (not built):** save the Price-O-Matic quote (garment, colors, prints, price) to the order when it's sent, so Create order only needs sizes from the email.

## 2026-10-13 — v5: emails only (no web form)
- **Live check:** Patrick's key (`PIPEDRIVE_KEY_PATRICK`) is in Cloudflare and worker v21 is live. On 10999 UpSlope, v4 showed the deal's emails, including Brady's reply quoted in Patrick's "Re: Patrick from Pine": "Comfort Colors 1717 … Blue Spruce, with a single-color vintage cream ink (HEX #F3EBD7) for both the front chest logo and large back graphic". That matches what Airtable has for 10999.
- **Stephen:** the web-form description isn't needed, because details change a lot over the email thread. v5 no longer shows it or sends it to the reader.
- **Softer note** when only Pine-sent emails are on the deal: the customer's words are often quoted inside them.
- **Still open:**
  - **Artwork folder link:** no Orders field holds a Google Drive folder URL (only a yes/no "Proofs Uploaded to Google Drive"). Proposed: add a URL field "Artwork Folder" on Orders, filled by Create order. Needs Stephen's OK (new field).
  - **Already-entered orders:** orders like 10999 already have lines. Proposed: the list shows only orders with no lines yet, or marks the others "already entered — open in Line Item Review".

## 2026-10-13 — v6: "needs lines" pills + Artwork Folder Link
- **Why (Stephen):** orders like 10999 already have line items. He asked for a label and pill buttons to tell orders that need lines from ones that already have some. He also OK'd the Artwork Folder Link field.
- **Order list:**
  - Pills: **Needs lines** (the default) · **Has lines** · **All**, each with a count.
  - Orders that have lines show "already entered · N lines" plus a **Line Item Review →** link to that order. They can still be opened to add more.
- **Artwork folder:**
  - New Orders field **Artwork Folder Link** (`flddst7TDoJfSqb0s`, URL), added with Stephen's OK. It's additive, and no automation watches it.
  - Paste the Google Drive folder under the order header. An "open ↗" link checks it.
  - It's optional: the rail shows "Artwork folder link (optional)" until it's filled, but doesn't block Create.
  - On Create, after the imprints and line items, Create order PATCHes only that one field on the order. Practice mode fakes the write as usual.
- **Tested with mocks:** pill counts (2 / 1 / 3), the label and the LIR link on 10999, and the write order (imprints → line items → the artwork PATCH). No errors.

## 2026-10-13 — v7 + worker v22: fix open questions in one tap
- **Why (Stephen):** on GRIT the reader asked "Does the Olive Gray hat get the HOT GIRLS GO TO GRIT embroidery too?" when Chris had already said both hats get the same design. He wanted to tap "add to this line item" instead of asking the customer. He also asked for full nicknames: they were cut at "HOT GIRLS GO TO GR".
- **Open questions are a checklist with fixes:**
  - **Same art on another line:** "＋ HOT GIRLS GO TO GRIT on 4 · Atonal A601 Olive Gray" adds the same imprint (no new screens).
  - **Sizes:** "Fill Pine's usual mix", for lines where the email gives a total but no breakdown.
  - **Artwork:** "Paste the artwork folder" jumps to the folder box.
  - **Tick when handled:** each question has a tick box. Fixing one ticks it.
  - **Copy open questions:** builds a short email ("Hi Kayla, a few quick questions before we set up your proofs: 1. … 2. …") from the customer-friendly wording.
- **Pine's usual size mix:**
  - **Unisex:** XS 2% · S 16% · M 27% · L 29% · XL 18.5% · 2XL 6% · 3XL 1%. That's the average of 1,496 past apparel lines (24+ pcs) in Airtable, pulled 10/13. 75 pcs → 2/12/20/22/14/4/1.
  - **Women's:** too few past lines to average (4), so a standard curve: XS 8 · S 22 · M 30 · L 25 · XL 12 · 2XL 3. 50 pcs → 4/11/15/13/6/1. Tell Claude if Pine's curve differs.
  - **Where:** a yellow "Email asks for 75 pcs" bar on the line. Typing just a number in the sizes paste box (e.g. `75`) does the same. "redo" refills after toggling Women's.
- **Copy to other lines…** on every print card: one tap puts the same imprint on another line, or on All. Works on any order, with or without the email reader.
- **Full text:** print cards are full width. The nickname, print notes and line notes wrap and grow to fit, and on phones the thumbnail hides to make room.
- **Toasts:** a new toast replaces the last one; they used to overlap.
- **Worker v22** (paste via copy-worker.html): the reader now returns `qty_total` per line, and each question as {text, ask_customer, kind, lines, prints}. kind is sizes / same_art / print_details / artwork / scope / other. It's also told not to ask what the thread already answers, and to apply it instead. With worker v21 still deployed, v7 works but questions are plain text. Size fixes still work (the total comes from the notes, e.g. "Total of 75"), and "copy to other lines" covers the hats.
- **Tested with mocks (GRIT-style order):** 4 lines, 4 questions. The hat fix put B on line 4. The mix filled 1717 (75) and 6110 women's (50). The copied email held the 2 questions left. The old-worker output worked too. Saves are unchanged (imprints → line items → artwork PATCH). No errors, desktop and phone.

## 2026-10-13 — Mockup: scan → pick (create-order-scan-mockup.html)
- **Why (Stephen):** v7 "looking weird". The tick only struck a question out. The reader merged the Cotton Heritage hoodie into the hats. Fix buttons on top of a pre-filled form are confusing. "Let's slow down… maybe it should create a clickable field we select to then build the order." Keep the current habit: **pick garments, then add art**.
- **Real case: 10980 Grit FOCO** (deal 22317, 12 emails, Sep 5 – Oct 8):
  - **Garments:** 1717 Graphite 75 · B+C 6110 Vintage White women's 50 · SS3000 Heather Gray 75 · M2635 Vintage Black box hoodie 75 (back print only) · A601 Vintage Black 25 · A601 Olive Gray 25.
  - **Quoted prices** in Chris's Sep 28 email: $12.00 / $13.25 / $18.50 / $25.00 / $14.75.
  - **Hats:** "HOT GIRLS GO TO GRIT will be the black hat". The Olive Gray hat's design is genuinely undecided (HOT GIRLS, or the two-tone left-mockup logo).
  - **Not received yet:** print-ready art. Phoebe asked Pine to recommend sizes.
- **Name mismatches:** all six garments are in Airtable, but the email says "Olive Gray" / "Heather Gray" and Airtable has "Olive Grey" / "Grey Heather". That's why v7 said "pick the garment above". The scan needs to match spelling variants.
- **Mockup flow:**
  1. **Left, "From the emails":** tappable cards, each with the quote it came from: garments (qty, quoted price, Airtable match), art (confirmed / best guess / not decided) and details (samples, billing, resale ID, deadline).
  2. **"＋ Add" or "＋ Add all":** puts a garment on the order with its quoted price and the art the emails tie to it.
  3. **Order side, per garment:** art chips (tap on/off, with the imprint ID shown). "maybe?" chips mark undecided art, e.g. the Olive hat. Sizes have a "Pine's mix" button. Inks, notes and price are tucked under "More".
  4. **Still open:** each question is either answered by doing it on the order (sizes filled, art picked, folder pasted) or "goes in your reply". "Copy for my reply" writes the email.
- **Nothing is read live and nothing is saved.** The data is typed in from the real emails.

## 2026-10-13 — Mockup: one grid (create-order-grid-mockup.html)
- **Why (Stephen):** reading the emails can't settle details like "the graphite shirt, the box hoodie and the gray sweatshirt, we will do 75". Is that 75 each or total? Is the hoodie back-only? So make the manual step faster: put garments and imprint IDs on one Create order page, and keep the print details (location, method, colors, underbase, inks, notes).
- **Layout:**
  - **Rows are garments** (one line item each): qty, $/pc and sizes (expand, or Pine's mix).
  - **Columns are imprint IDs** (10980-A, -B…). The header shows the nickname, location, colors + UB, screens, inks and total pcs. ✎ opens the full imprint form (nickname, location, method/type, ink colors, underbase, inks or thread, print notes, repeat of past art). It's set once, and every garment with a dot uses it.
  - **A square is a dot:** that line item gets that imprint. A dot on a screen print has its own "inks" link, for an ink change on that garment only.
- **From the emails:** a row of dashed shortcut chips (garments with qty/price, imprints with params). Tapping one adds it, and dots the garments the emails tie it to. A shared quantity ("75" for three garments) shows amber until confirmed ("75 each ✓") or changed. "Add everything" puts it all in at once.
- **Bottom bar:** line items, imprints, pcs, total, what's missing, and Create.
- **Tested on 10980:** Add everything, dot the Olive Grey hat with E, confirm the 75s, Pine's mix, set A's inks to White. Result: 6 line items · 5 imprints · 325 pcs · $5,562.50 · ready. No errors, desktop and phone. Nothing is saved.
- **Same day, Stephen asked:** "What if you don't want to add everything, can you still create an order?" Yes. Create only checks what's on the grid: every garment row needs a qty, sizes that add up (or one size), at least one imprint and a price, and every *used* imprint needs a name, location and method. Email chips you don't tap never block. Fixed: an imprint column with no dots used to block Create; now it shows "not used · won't be created" and is skipped. Tested: 1 garment + 1 imprint is ready ($900); adding an unused imprint still leaves it ready.
- **Same day, Stephen:** "The screen print button doesn't work on mobile, or any of the print methods." Two bugs, both fixed:
  - **The method was never remembered.** It was worked out from the type, so on a new imprint, tapping Screen print or Supacolor (several types each) left nothing selected. Imprints from the email chips already had a type, so the earlier tests missed it. The method is now stored on its own, and the type chips appear right away.
  - **Taps after typing were lost.** Nickname, inks and notes saved on blur and redrew the sheet, so on a phone the first tap after typing only closed the keyboard. They now save as you type, without redrawing.
  - **Tested** on an emulated iPhone 13 with touch taps. Typing the nickname and then tapping location → Screen print → EZP → 2 colors → Underbase worked, as did switching to Embroidery, Supacolor and Patch & label. No errors. The real v8 needs the same two fixes.

## 2026-10-13 — Mockup: cards (create-order-cards-mockup.html)
- **Why (Stephen):** "I do like when garments and imprints are their own cards. Visually easier to see." It has the same logic as the grid mockup (and its fixes), laid out as cards.
- **Garment cards** (left; one card = one line item; stacked on phone/iPad portrait):
  - Header: number, garment and color, ready / "needs …", qty and $/pc boxes, ✕.
  - An amber note when the email's qty is shared ("75 each ✓").
  - **Imprints:** only the ones on this garment, as yellow chips. Tap the name for its details; "inks" changes inks for this garment only; ✕ takes it off. **＋ Imprint** opens a short picker of this order's other imprints (embroidery first on hats, prints first on apparel) plus "New imprint", which is made, put on this garment and opened.
  - **Sizes:** inputs always visible, with Pine's mix, "N of qty" and a women's toggle. Hats show one size.
- **Imprint cards** (right; below on phone): ID, nickname, location · colors + UB · screens, inks/thread, notes, and "On 1717 Graphite · 75 pcs". Tap to open the full form. An unused one is dashed and "won't be created". **＋ Imprint** card at the end.
- **Tested** on desktop and an emulated iPhone 13 with touch: Add everything, add E to the Olive Grey hat from the picker, confirm the 75s, Pine's mix, and a new imprint from the 1717 card (Left Sleeve, Screen print, No Base). Result: 6 line items · 6 imprints · 325 pcs · $5,562.50 · ready. No errors.

## 2026-10-13 — v8: back to the Airtable forms, with the deal's emails beside them
- **Why (Stephen):** the scan / grid / cards ideas moved too far from the Airtable interface sales know. "Wipe the slate clean": make a better Imprint Creator + Line Item Creator, and use the Pipedrive connection only to help the salesperson eyeball the conversation and find answers while they build the order. The current flow is: imprints first, then pick the garment, tick the imprints, sizes and price.
- **1. Imprint Creator** (same fields as the Airtable form, as buttons):
  - **Always:** Linked Orders filled in · Repeat? (this customer's past imprints with thumbnails; picking one fills it in, ticks Repeat? and links Previous Imprint ID) · Imprint Type (all 26 Airtable choices, grouped: Screen print, Embroidery, Supacolor, Patch & label, Decopress, Flatstock, Finishing) · Location (Airtable's 16; v7's "Back Neck"/"Other" weren't real choices).
  - **By type:**
    - Screen print: Screen Count 1–8 (+) and Ink Changes 0–4 (+), as Stephen asked.
    - Embroidery: **Stitch Count** with the form's hint ("Enter an estimate if design hasn't been digitized"); quick ≈5,000/7,500/10,000/15,000/20,000 from the POM bands.
    - Supacolor: **Supacolor Transfer Size** (all 14 Airtable sizes, 4 quick).
    - Patches: nothing extra; patch size is on the line item, like Airtable.
  - Then Nickname · **Colors** (typed: names / hex / PMS) · Imprint Notes (→ Print Notes).
  - **Colors aren't a field on the imprint.** Stephen: sales put color call-outs and client requests in **Proofing Notes**, which is what art reads. So the colors go into the Proofing Notes of each line item the imprint is on, and can be changed per garment. Ink Notes stays the ink room's field.
  - **"+ Back print for the same garments"** after adding one: same type, Location Back, and it goes on every line item the first imprint is on (ticking the first ticks it too, with a toast).
- **2. Line Item Creator:**
  - Product Type (all 21) · Garment + color · **tick this order's imprint IDs** · Proofing Notes **written from the ticks** (e.g. "10980-A Front · GRIT logo · 2 screens · Colors: Cream #F3EBD7"), editable · Line Item Notes (→ Sales Notes; recent records show sales use it for "LC is REPEAT / FOLD AND BAG").
  - Patch Size / Sticker Size / promo Description only for those types.
  - Sizes OSFA–6XL with the paste box and Pine's mix · Price / Piece with the POM price beside it.
  - Additional Notes (Shipping, Finishing, Production, Product Description) behind one link · Women's / Youth.
  - **"+ Same garment, next color"** keeps the style, ticks, price and notes.
  - Supplier and the proof upload stay in Line Item Review.
- **3. Deal emails beside the forms** (no AI; v2–v7's "Read email & fill" is gone; worker v21's deal route is all it needs):
  - Finder buttons highlight Qty / Sizes / Colors / Garments / Placement / Inks (PMS, hex, underbase, thread…) / Art / Dates, plus a word search with "next ›".
  - **Tap any sentence to add it to the last field you were in** (nickname, colors, notes, sizes paste box…).
  - On iPad portrait / phone the emails open from a "✉ Deal emails" button.
- **Writes:** v7's, plus Imprints Stitch Count (fld3nysvEoi0hb7iC) and Supacolor Transfer Size (flddqYCsxScYXQccG), and on Line Items Sales Notes, Production / Shipping / Finishing Notes, Product Description, Promo Product Description, [PATCHES] Patch Size, [STICKERS] Size. All are existing fields; no Airtable changes. Nothing is saved until Create order; practice mode fakes it.
- **Fixed while testing (both apply on a real iPad):**
  - Leaving a field (price, a size) redrew the page right as the tap on the next field landed, so the tap was lost. Redraws from leaving a field now wait a tick.
  - Fields could scroll up under the sticky black header; they now stop below it.
- **Tested** with mocked Airtable + deal emails on desktop and an emulated iPhone (touch):
  - 4 imprints: EZP front, back print for the same garments, embroidery (blocked until a stitch count was given), and a repeat of 4221-A.
  - 4 line items: 1717 Graphite (pasted sizes, line note + a tapped email sentence), Pepper via "next color" + Pine's mix, A601 Olive Grey hat, Woven Patches 3″.
  - The write payloads matched; no errors.

## 2026-10-13 — v9: the deal's emails are easier to read
- **Why (Stephen):** "the way the email area is broken up is pretty dense… but everything else is flowing nicely." Pipedrive gives each email as one block: the reply, the signature and the whole quoted chain ("2 October at 13:13, GRIT Info … wrote: …") run together.
- **Each email now shows:**
  - **What that person wrote**, one sentence per line, each still tappable to add to a field.
  - **The quoted chain and the signature folded** behind "▸ quoted earlier email (N lines)". It recognizes "On … wrote:", Apple Mail's "2 October at 13:13, … wrote:", Outlook's "From: … Sent:", and Pine's "------" signature.
  - **Quoted sentences already in someone's own email on the deal are dropped**, so they appear once. On the test thread that took a 6-line quoted chain down to 1.
- **Only the newest 2 emails are open.** Older ones show their first line; tap to open.
- **With a finder or search on, "Only the matching sentences" is on by default.** The panel becomes a short list under each sender, e.g. Qty → "25 Atonal Vintage Black Dad Hats", "25 Olive Gray Atonal Dad Hats", "For the women's shirt, we will do 50.", "…the gray sweatshirt, we will do 75.", "…start with 25 each." Untick it to see whole emails with highlights.
- **Qty finder** also catches "25 Atonal Vintage Black Dad Hats" (a number, up to 4 words, then a garment word).
- **Forms:** unchanged from v8.
- **Tested** on desktop and emulated iPhone with a 4-email thread shaped like 10980's. Full order flow and Create still pass; no errors.
