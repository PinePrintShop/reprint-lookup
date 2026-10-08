# PandaDoc: order packets for signature

## 2026-10-08 · Plan and sandbox test

**Today:** for every order, the salesperson builds a PandaDoc by hand from three uploads: Terms of Service (5 initials), proofs (an "APPROVED" initial per page) and the invoice from the Airtable extension (signature, name, date). They place every field by hand, then send to the contact. When the doc is completed, a QuickBooks zap sends the payment link.

**Goal:** Line Item Review builds the whole packet (Terms + approved proofs + invoice) once every line is Quality + Pricing approved. It tags the signing spots and sends to the order's contact email, CC'ing the salesperson. The order then moves to Sent - Awaiting Payment. The QuickBooks zap stays as it is (document name stays "10955 | Customer").

**Cost (Pine's plan):** documents made by hand are unlimited. API, Zapier and automation documents cost **$2 each** (0 credits included). That's about 76 docs/month (591 since Feb 15) → about $150/mo.

**What we tested:**
- **Manual upload with field tags:** `{initials___}` (TEST-1) and `[initials:Client___]` (TEST-2). **Not converted.**
- **Manual upload with native PDF form fields** ("Place fields"), TEST-3: **not converted.**
- **Clean rebuild with short tags** (TEST-4): **not converted.**
- So the manual-upload route (Option A) can't place fields. Next is a free **Sandbox API** test (Option B), since PandaDoc's API docs say field tags convert when a document is created from a file through the API.

**Worker v15** (`workers/pine-workers-v15.js`) = v14 + `pandadoc` route:
- `POST /proxy/pandadoc/documents` (multipart file + data): create a document, optionally wait for draft and send.
- `GET /proxy/pandadoc/documents/<id>`: details, including the fields PandaDoc made and counts by type.
- **Gate:** the caller's Airtable token (`Authorization: Bearer`), checked against Airtable whoami and cached 10 min.
- **Secret:** `PANDADOC_KEY`, the API key only, no email or password. Sandbox key first.
- Unit-tested locally with mocked Airtable and PandaDoc: auth refusals, details, create + poll + send, path guard, missing key. Existing routes are unchanged (byte-identical to deployed v14 before the edit).

**Test page:** `pandadoc-sandbox-test-v2.html`. Upload TEST-2 with yourself as signer, then **Check fields**. You should see 11 fields: 8 initials, 1 signature, 1 text, 1 date. The page also tries a CC recipient (`recipient_type: "CC"`) to see whether PandaDoc accepts CC on create.

**Test page v2:** waits out PandaDoc processing on its own (the first live run got a 409 "document.uploaded" because Check fields ran too early), checks fields automatically after upload, and accepts `?id=<docId>` to re-check an existing document.

**Round 2 (live sandbox):** upload + CC worked (`recipient_type: "CC"` is accepted on create). But API-TEST-10955 made **0 fields**, and the Client signer came back as CC. That happens when a recipient ends up with no fields, so PandaDoc never parsed the tags. Possible cause: the ID-tagged `[textfield:Client:name___]` was not declared in a `fields` object (PandaDoc says ID tags must be), which may invalidate the whole parse. Or the syntax is just different.

**Test page v3 + TAG-SYNTAX-TEST.pdf:** one page with every syntax variant, none with IDs. Initials: `[initials:client]`×1, `[i:client]`×2, `{initials:client}`×4, `{{initials:client}}`×8, `{i:client}`×16. Signature: `[signature:client]`×1, `{{signature:client}}`×2, `{signature:client}`×4. Date: `[date:client]`×1, `{{date:client}}`×2. Text: `[textfield:client]`×1, `{{textfield:client}}`×2. Counts are powers of two, so the totals show which styles converted. The page now has an editable role (default `client`) and blocks the same email as signer and CC.

**Round 3 result (TAG-SYNTAX-TEST, doc D4YekRuQov9kwvgcK7U5c9): 38 fields** = initials 28 (16+8+4), signature 6 (4+2), date 2, text 2, and the recipient stayed a **signer**.
- **Curly braces work, square brackets do not.** `{{initials:client}}`, `{{signature:client}}`, `{{date:client}}` and `{{textfield:client}}` all convert; `{initials:client___}` and `{i:client___}` also work.
- That explains the earlier 0-field runs: those files used square brackets.
- **Decision:** use double curly `{{type:client}}` in white text (invisible on the page, still read by PandaDoc).
- **Next:** API-TEST-2-10955.pdf (the real packet with 11 hidden tags), sent to Stephen with "Also send" to check the signer experience.

**Round 4 (API-TEST-2, sent to Stephen):** works end to end: email, signer view, signature, name and date on the invoice. Placement was off in two places: on proofs the initials box overlapped the black "APPROVED" label, and a white tag edge showed on the black; Terms initials sat unevenly on the lines.

**Round 5 (API-TEST-3), fields sized to the real boxes:**
- The app scans each page and makes every tag the exact size of its box, because PandaDoc sizes a field to its tag (font size sets the height, underscores the width).
- The role is shortened to `c` so tags fit small boxes, e.g. `{i:c}`, `{s:c__________}`, `{t:c____}`, `{d:c____}`.
- **Terms:** the 5 `_____________` signing lines (71 x 22 pt each).
- **Proofs:** the white box of art's APPROVED stamp, found relative to the "APPROVED" text: x from text.x1+15.4 to text.x1+58.6, y from text.y0-8.9 to text.y1+2, inset 3 pt. That matched both art templates.
- **Invoice:** the signature frame (the drawn rect around "I've reviewed…") and the Name/Date lines.
- Single-curly date/text tags (`{d:..}` `{t:..}`) are new this round; the double-curly forms are already proven if these fail.

**Rounds 5-6:** API-TEST-3 (role `c`, sized short tags, single-curly name/date) and API-TEST-4 (same, but double-curly name/date) both **failed processing** ("Document creation failed", 400). So name/date was not the cause; suspects are the one-letter role or tags without underscores (`{i:c}`), or the larger font sizes. API-TEST-5 uses only proven styles (role `client`, `{initials:client___}` sized, double-curly name/date) to isolate it.

**Worker v16:** for a failed document, the GET route also fetches PandaDoc's status record and returns it, so the failure reason comes back.

**Rounds 7-8:**
- **API-TEST-5 worked:** 11 fields with role `client` and sized `{initials:client_…}` / `{signature:client_…}` tags. But the proof initials were tiny (5 pt), since the long role has to fit the 43 pt box.
- **API-TEST-6 (role `cl`) failed** like the `c` versions, so PandaDoc rejects short roles. Keep `client`.
- **API-TEST-7:**
  - Terms and signature: as TEST-5.
  - Proofs: default-size `{{initials:client}}`, centered in art's white box. The default field is about 35.6 x 15.7 pt, left edge at the tag x, spanning baseline-12.5 to baseline+3 (measured from the round 4 screenshot).
  - Name/date: double curly.

**Round 9 (API-TEST-7):** Terms initials look great. Proof initials are inside the APPROVED white box (good). The signature field was much too tall: PandaDoc makes a signature field about **3.25 x the tag font size** tall (measured: 25 pt tag gave an 81 pt field, spanning baseline-2.78fs to baseline+0.47fs; width follows the tag width). **API-TEST-8:** signature tag font = available height / 3.25 (12.4 pt), so the field fills the 41 pt space under "I've reviewed…" (523-564 inside the 503-568 frame).

**Round 10 (API-TEST-9):** proof initials should fill the white box. Short-form sized tag `{i:client_}` at 9.4 pt, so the field is about 38 x 31 pt in the 43 x 39 box (2.5 pt margin). This assumes initials fields scale like signature fields (height about 3.25 x font), which this round verifies. Signature as in TEST-8; Terms unchanged.

### Final tag format (2026-10-08, verified in sandbox)
- **Role:** `client` (one recipient, the order contact). Short roles `c` and `cl` make processing fail. Tags without underscores (`{i:c}`) are suspect too, so always include at least one.
- **Style:** curly braces only. Square brackets are ignored.
- **Color:** white text, invisible on white areas. Never put a tag over a dark area, or it shows.
- **Field size:** PandaDoc sizes the field from the tag. Width = tag width; height ≈ **3.25 × font size**, spanning baseline−2.78·fs to baseline+0.47·fs.
- **Placement:**

| Spot | Tag | Placement |
|---|---|---|
| Terms initials | `{initials:client_…}` | on each `_____________` line (71 × 22 pt box). Looks great. |
| Proof APPROVED | `{i:client_}` at about 9.4 pt | centered in art's white box (text.x1+15.4 … +58.6, text.y0−8.9 … text.y1+2), 2.5 pt margin. Inside and works; doesn't quite fill the box. |
| Invoice signature | `{signature:client_…}` | font = available height ÷ 3.25, under "I've reviewed…" inside its frame |
| Name / Date | `{{textfield:client}}` / `{{date:client}}` at 8 pt | just right of the labels |

- **CC:** recipient with `recipient_type: "CC"` works. The signer and CC must be different emails.

## 2026-10-08 · Built into Line Item Review v6
- **Packet:** Terms asset + art's proof pages (APPROVED box located with pdf.js) + invoice generated from Airtable. All tags use the final format above.
- **Worker v17:** adds `/pandadoc/file` (proof downloads, Airtable hosts only) and the **sandbox guard**: a "[DEV]" document is never sent unless `allowSandbox:true`. Test page v4 sets that flag; Line Item Review never does.
- **Assets:** `assets/pandadoc-terms-v1.pdf` (the Terms page from 10955 with 5 hidden initials tags) and `assets/pine-invoice-logo.png`.
