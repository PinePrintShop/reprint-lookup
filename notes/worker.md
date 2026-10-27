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

## 2026-10-20 — v26 (Drive: clear errors, status check, find the order's folder)
Stephen saved an order's Drive folder in Line Item Review v36 and got "Can't read this folder (is it in the shared drive?)". v25 answered every Drive problem with `folder_not_found` (a failed Google sign-in, a folder not shared with the service account and a Google error all looked the same), so we couldn't tell what was wrong. He also asked: "can we search the google drive and assign the matching folder sales creates to line item".
- **Clear error codes** on every Drive route (`{error, code}`):
  - `drive_signin_failed` (502): the worker couldn't sign in to Google. The message gives Google's reason (e.g. `invalid_grant: Invalid JWT Signature.`, "GOOGLE_SA_KEY is not valid JSON"). It never contains the key or a token.
  - `folder_not_found` (404), `no_access` (403: "Pine's Drive connection can't open this folder — share it (or the shared drive) with the service account"), `drive_error` (502: anything else Google says). `not_in_shared_drive` is unchanged.
  - Errors also carry `account` (the service account's email, not secret) so you know who to share with.
- **New `GET /proxy/drive/status`**: signs in, then reads the shared drive `GOOGLE_DRIVE_ID` (`drives.get`, useDomainAdminAccess off). OK → `{ok:true, drive:{name}, account}`. Also `drive_id_missing` (GOOGLE_DRIVE_ID not set) and `drive_not_found` ("Check GOOGLE_DRIVE_ID is the shared drive's ID (starts 0A) and the service account is a member"). Line Item Review v37 shows it in ⚙ › Google Drive.
- **New `GET /proxy/drive/search?order=11029`**: folders in the shared drive only (`corpora=drive`) named with the order number standing alone ("11029 Deppen Brewing", "11029 - Deppen", "#11029"; not 110290 or 211029), newest first, at most 10: `{ok:true, folders:[{id,name,webViewLink,modifiedTime}]}`. The order must be 3–7 digits. Needs `GOOGLE_DRIVE_ID` (else `drive_id_missing`). Read-only.
- list / thumb / upload answer exactly as in v25; every non-Drive route is byte-for-byte the same. The cached Google token is now tied to the key, so pasting a new key signs in again straight away.
- Same auth for all Drive routes: the Pine Airtable key.
- Tested (Node, mocked Google with a real RSA key, 43/43): no / non-Pine key → 401 on status, search and list; status OK (signed JWT verified), drive 404 → drive_not_found, 403 → no_access, ID missing; sign-in failure (invalid_grant, key not JSON, broken private key) → drive_signin_failed on status, list and search; folder 404 / 403 / 500 → folder_not_found / no_access / drive_error; My Drive → not_in_shared_drive; search query and shared-drive-only parameters, one match, several (exact-number filter, newest first), at most 10, none, bad order numbers → 400, no drive ID; list, thumb, upload, bad folder and My Drive answers identical to v25 side by side; v25 answers search with 403 "Drive path not allowed"; no key or token in any of the 43 responses.

## 2026-10-20 · v27: forgiving GOOGLE_DRIVE_ID
After Stephen added the service account to the shared drive, ⚙ › Google Drive still said "Check GOOGLE_DRIVE_ID is the shared drive's ID (starts 0A) and the service account is a member". v26 used the setting exactly as typed, so a space, line break, full Drive address or `?usp=…` tail would make Google answer 404.
- **Forgiving ID:** the worker now takes just the ID out of whatever was pasted, used everywhere the drive ID is read (status, search, the shared-drive check).
- **ID hint:** the "drive not found" message ends with a safe hint of the ID in use, e.g. "ID in use: 0Ab…OpQ (19 characters)", so a folder ID (starts 1, ~33 characters) or a bad paste shows at a glance.
- **Unchanged:** everything else. The v26 suite passes 43/43 on v27.

## 2026-10-20 · v28: download a Drive file (for previews in Line Item Review)
Stephen approved previewing the customer's PDFs and images right in Line Item Review v39 ("Oh that would be great"). The browser can't read Drive files itself, so the worker hands them over.
- **New `GET /proxy/drive/file?id=<file id or Drive file link>`**: streams the file's bytes from `files/{id}?alt=media&supportsAllDrives=true` with the file's Content-Type and the usual CORS headers (`Cache-Control: private, max-age=600`). Read-only.
- **Same guard as the other Drive routes:** the Pine Airtable key, then the same shared-drive check (`driveCheck`, now also reading `size`) before anything is downloaded.
- **Refused:**
  - a folder → 400 `not_a_file`
  - outside Pine's shared drive → 403 `not_in_shared_drive`
  - Google Docs/Sheets/Slides (`application/vnd.google-apps.*`, which can't be downloaded as bytes) → 415 `not_downloadable`
  - over 25 MB (from the metadata size, before downloading) → 413 `too_big`
  - missing / no access / Google errors / sign-in failures → the v26 codes
- **Unchanged:** everything else, byte for byte. `driveCheck` takes an optional extra field list; the other routes call it exactly as before.
- **Tested** (Node, mocked Google, real RSA key), 73/73: the 43 v27 checks, plus a PDF streams byte-for-byte with Content-Type and CORS, an image from a Drive file link, metadata check before download, folder 400, My Drive 403, Google Doc and Sheet 415, 26 MB 413 (nothing downloaded), missing 404, download 404, no access 403, bad id 400, POST 403, not connected 503, sign-in failure 502, no / non-Pine token 401, v27 answers 403 "Drive path not allowed", status/search/list/thumb/upload identical to v27 side by side, and no key or token in any response.

## 2026-10-24 · v29: vendor garment photos for proofs
Sep Maker v3 draws the vendor's garment photo into the proof and saves the proof as a PDF. A browser canvas can't export pictures from sites that don't send CORS headers, so the worker hands the photo over.
- **New `GET /proxy/img?u=<image url>`:** returns the image with CORS headers and a 1-day cache.
- **Allowed:** only S&S (`ssactivewear.com`), SanMar (`sanmar.com`) and AS Colour (`ascolour.*`), https only, image types only, up to 15 MB.
- **Refused:**
  - any other host → 403 `host_not_allowed`
  - not an image → 415 `not_image`
  - POST → 403
- **No key needed:** the same photos are public on the vendors' sites. Everything else is byte-for-byte v28.
- **Tested** in Node with a mocked fetch: S&S, SanMar and AS Colour images return 200 with CORS; other hosts, http, non-images and POST are refused.
- **Stephen deploys it:** paste `workers/pine-workers-v29.js` into the Cloudflare worker and Deploy. No new settings.

## 2026-10-27 · v31: move or trash a Drive file
For Mockup Maker v54 (Stephen: "can we add a way to delete proofs in the folders or move them around").
- **New `POST /proxy/drive/trash?id=`**, **`/restore?id=`** (Undo) and **`/move?id=&to=<folder>`**. Same Airtable-token gate and shared-drive check as the other Drive routes.
- Files only (a folder → 400 `not_a_file`); outside Pine's shared drive → 403; a trashed file can't be moved. Trash is Drive's trash (30 days), never a permanent delete; there's no delete route.
- Trash needs the service account to be a **Content manager** on the shared drive. If it's only a Contributor, Google refuses and the app says so.
- `/proxy/version` now gets past the route guard (v30's was blocked) → `{"version":31}`.
- Tested in Node with a mocked Google (real RSA key): 13/13.
- **Stephen deploys it:** open worker-copy.html, Copy worker v31, paste into Cloudflare (Workers → pine-workers → Edit code) and Deploy. No new settings.

## 2026-10-27 · v32: copy a Drive file
For Sep Maker v41's "Save as 11075-A" on a reprint's old sep.
- **New `POST /proxy/drive/copy?id=<file>&to=<folder>&name=<new name>`:** Drive's `files/{id}/copy` (supportsAllDrives) into another folder of Pine's shared drive, under a new name. Any size, nothing downloaded.
- Files only. Both the file and the folder must be in the shared drive. A name is required. The original is untouched.
- `/proxy/version` → 32.
- Tested in Node with a mocked Google: 17/17 (the v31 checks plus copy / other drive / no name / folder).
- **Stephen deploys it:** worker-copy.html → Copy worker v32 → paste into Cloudflare → Deploy.
