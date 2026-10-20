# Pine worker (Cloudflare) — `workers/pine-workers-vNN.js`
Address: https://pine-workers.stephen-dab.workers.dev/proxy. Stephen pastes each new version into Cloudflare (Workers → pine-workers → Edit code → paste → Deploy). Version history is in the comment at the top of each file.

## 2026-10-19 — v24 (security + "Send to client")
From the Oct 19 app scan. Stephen: "We should have time to handle all 1-4 today! let's begin".
- **ShipStation route locked.** It answered anyone who knew the address: customer names, addresses, phones and emails, and it could buy labels on Pine's account. It now needs a Pine Airtable key. No current app uses it; only the retired July Shipping app did.
- **Pipedrive, PandaDoc and AI routes:** the key check used to pass any Airtable account, including a free one. Now the key must be able to read the Pine base (the same check Reconnect has used since v23).
- **"Send to client" tick:** `/pipedrive/deal?order=` now also says whether the deal's "Send to client" task is ticked. Line Item Review v23 uses it to count a proof as sent, whatever way the rep sent it.
- Not changed: the mockups route (used by the label QR codes) still works without a key; it needs the order's private record id, which can't be guessed.
- Tested with a mocked Airtable/Pipedrive: no key or a non-Pine key → refused (401) on ShipStation, Pipedrive, PandaDoc and AI; a Pine key → works; deal lookup returns the tick.

## 2026-10-20 — v25 (Google Drive for the art department)
Stephen: sales makes the Drive folder and adds the customer's art; art grabs it, makes the mockup, attaches it to Airtable and uploads it to Drive. He approved: show the folder's files in Line Item Review and save each proof to Drive too. Shared Google Workspace drive.
- New routes, all behind the Pine Airtable key: `drive/list?folder=` (files in the order's folder, newest first), `drive/thumb?id=` (thumbnail), `drive/upload?folder=&name=` (adds the proof to the folder; never deletes or overwrites).
- Only Pine's shared drive is reachable (`GOOGLE_DRIVE_ID`); anything else gets 403.
- Needs two Cloudflare settings: `GOOGLE_SA_KEY` (secret: the service account's JSON key) and `GOOGLE_DRIVE_ID`. Without them every Drive route answers 503 "not connected" and the apps hide Drive.
- Tested with a mocked Google and a real RSA key: sign-in token is valid, list/thumb/upload work, My Drive folders and missing folders are refused, no key → 401.
