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
