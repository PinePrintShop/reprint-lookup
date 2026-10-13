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
