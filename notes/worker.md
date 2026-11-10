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

## 2026-10-28 · v33: signed PandaDoc packets back into Airtable
- **New `GET /proxy/pandadoc/sweep`** (Airtable token, `?dry=1` only reports).
  - Lists PandaDoc's completed documents from the last 45 days and matches each to its order by the number in its name. [DEV] documents are ignored.
  - For orders not finished, it writes PandaDoc ID, Signed At and Signed Packet with the caller's token. A newer completed document replaces an older one.
- **New `GET /proxy/pandadoc/signed/<id>?exp=&sig=`** serves the completed PDF, so Airtable can fetch it.
  - It needs no token. The link is HMAC-signed with a key derived from PANDADOC_KEY and expires in 2 days.
  - Only completed documents are served.
- **`scheduled()`** runs the same sweep on a Cron Trigger, but only if the `AIRTABLE_WRITE_TOKEN` secret is set.
- `/proxy/version` → 33.
- Tested in Node with a mocked PandaDoc and Airtable: 13/13.
- **Stephen deploys it:** worker-copy.html → Copy worker v33 → paste into Cloudflare → Deploy. Optional cron and write token: see pandadoc.md.

## 2026-10-28 · v34: the 15-minute sweep uses the existing token
Stephen: "We have that read and write to Pine base already in Cloudflare...so does this worker have that 15 min check".
- `scheduled()` now uses `AIRTABLE_WRITE_TOKEN` if it's set, otherwise the existing `AIRTABLE_TOKEN`. If that token can only read, Airtable refuses the write and the worker logs it; nothing else breaks.
- The check runs only once a Cron Trigger is added in Cloudflare (Workers → pine-workers → Settings → Triggers → Cron Triggers → `*/15 * * * *`). Code pasted into the editor can't set the schedule.
- Tested in Node: 14/14 (v33's checks, plus: the cron runs with only AIRTABLE_TOKEN, and does nothing with no token at all).

## 2026-10-28 · v35: a signed packet that didn't arrive is tried again
- **What happened on v34's first runs:** 84 orders got a PandaDoc ID, but some have no Signed Packet file. Airtable's fetch of the PDF probably failed: PandaDoc turns away bursts, and 84 came at once.
- **Bug:** v33/v34 counted "PandaDoc ID set" as done, so those orders were never tried again.
- **Fix:**
  - An order now counts as done only when it has both the ID and the file.
  - At most 10 packets are stored per run; the rest go in the next 15-minute run.
  - A PandaDoc 429 on the signed link now answers 503 + Retry-After.
- `/proxy/version` → 35.
- Tested in Node: 15/15 (ID without a file = stored again; ID with a file = unchanged; 14 waiting = 10 now, 4 next run).

## 2026-10-28 · v36: the signed copy, not the plain download
- v33–v35 stored PandaDoc's plain `/download`, which had a "demo purposes only" watermark and no customer initials.
- Completed documents now come from `/documents/<id>/download-protected`; the plain download is only a fallback.
- Packets stored before v36 (any file not named "… signed (completed).pdf") are stored again, 10 per run.
- Tested in Node: 15/15. The signed link serves the protected copy.
- `/proxy/version` → 36.

## 2026-10-28 · v37: a reprint's own Drive folder
- **New `POST /proxy/drive/mkorder?from=<original order folder>&order=<new #>&old=<original #>`**, for Mockup Maker v90.
- It makes the new order's folder in the same parent as the original, named like the original with the number swapped. If the original's name has no number, the new number goes in front.
- It also makes the original's folders inside, 3 levels deep, 60 folders at most, names only (numbers swapped the same way). Files are never copied.
- If a folder for the new order already exists, nothing is made and that folder comes back (`exists:true`).
- Same Airtable-token gate and shared-drive check as the other Drive routes. Creating folders needs Contributor or higher on the shared drive; Content manager is already set for trash.
- Tested in Node with a mocked Google Drive: 10/10.
- `/proxy/version` → 37. Stephen deploys it from worker-copy.html.

## 2026-11-03 · v38: the order's own folder first
- **Stephen (11131):** "should it be trying to open the main customer folder and not a specific letter … let's change the worker since that is cleaner".
- **Cause:** `drive/search?order=` sorted matches newest first. Imprint folders made inside an order ("11131-A", "11131-B" in 11131 › Embroidery, 18:59) came back ahead of "11131 - Lydia Cruz Illustration" (18:30). Mockup Maker, Sep Maker, Seps, Screens and Line Item Review all take the first result, so they opened (and could save into) the empty 11131-B.
- **Fix:** results are ranked by `orderRank`:
  - 0: the order's folder ("11131 - …", "10940 Lunar Outpost").
  - 1: other names with the number ("PO11029", "V2 11029 …").
  - 2: imprint-letter folders ("11131-B", "11131 B").
  - Newest first within each rank.
- `drive/mkorder`'s "already has a folder" check skips imprint folders the same way.
- Mockup Maker v175 also picks the order folder itself, so it's right either way.
- Tested in Node with mocked Drive results: 5/5.
- `/proxy/version` → 38. **Stephen deploys it:** worker-copy.html → Copy worker v38 → paste into Cloudflare (Workers → pine-workers → Edit code) → Deploy.

## 2026-11-03 · v39: vendor spec sheets
- **Asked for:** Stephen, "always use the actual product specs and not just a filler".
- **New `GET /proxy/doc?u=<SanMar spec sheet PDF>`:**
  - Allowed hosts: docs.companycasuals.com and sanmar.com. PDFs only, 10 MB max, read-only, cached a week.
  - Mockup Maker v189 reads SanMar's body length and width per size from it.
- **`/proxy/img`:** also allows AS Colour's second store address, `store-hsi95a83fz.mybigcommerce.com`, where some size guides live (5080).
- `/proxy/version` → 39. **Stephen deploys it:** worker-copy.html → Copy worker v39 → paste into Cloudflare → Deploy. This also brings v38's Drive folder fix.

## 2026-11-05 · The Drive service account
- The worker reads Drive as **pine-apps-drive@pine-apps.iam.gserviceaccount.com**. It's not a secret; the worker shows it in Line Item Review › ⚙ › Google Drive: "Connected · Printshop · as …".
- Share any folder outside the Printshop shared drive with this address as **Viewer**. That includes the sales Pipedrive folders with the signed PandaDocs.

## 2026-11-05 · v40: the sales reps' signed PandaDocs folders (read-only)
- **Stephen:** "get me the new worker ... so we can see about getting into Chris's folder since I did share it with that google connection". Chris's Pipedrive Drive sync is reconnected, and his "Pipedrive (Pine Printshop)" folder gets each signed PandaDoc ("11139 | Outer Range Brewing.pdf").
- **Why a new worker:** v37 to v39 only open items in Pine's shared drive (`driveCheck`). The reps' folders are in their own Drive, so they were refused.
- **New, read-only, only these folders:**
  - `GET /proxy/drive/signed/status`: for each folder, whether the worker can open it, plus its 5 newest PDFs.
  - `GET /proxy/drive/signed?order=11139`: PDFs whose name starts with the order number. Not 111390, not "PO 11139".
  - `GET /proxy/drive/signed/file?id=`: the PDF. Only a PDF whose parent is one of these folders; 25 MB max.
- **Folders:** Chris (sales@) `1YxDfnUUoYDDEMkQqzJtKq9XIddndXWcD` and Patrick (hello@) `1UPMct3fRUQky2AjZZxlbyrAaPPGs4o79`.
  - Optional Cloudflare setting `SIGNED_FOLDERS` ("Chris: <id or link>, Patrick: <id or link>") replaces the list.
  - Each folder must be shared with pine-apps-drive@pine-apps.iam.gserviceaccount.com. Viewer is enough; Editor also works.
- **Nothing is written to Airtable yet.** The Signed Packet sweep stays paused (`SWEEP_PAUSED` in pine-signed.js). The next step, once both folders read fine: fill Signed Packet from these PDFs instead of PandaDoc downloads.
- **Check page:** `signed-check.html` uses the Airtable sign-in saved by the other apps. It shows each folder ✓/✕ with its newest PDFs and finds an order's signed PDF (Open).
- **Tested** in Node with mocked Google and a real RSA key, 12/12:
  - version; status with one folder shared and then both; order match (11139, not 111390 or "PO 11139"); bad order.
  - The file route serves a folder PDF and refuses a file outside the folders.
  - `SIGNED_FOLDERS` with a label and a full link; no token gives 401; drive/list still refuses non-shared-drive folders.
- The page was tested in Playwright against a mocked worker on v37, then v40 with one folder shared, then both.
- `/proxy/version` → 40. **Stephen deploys it:** worker-copy.html → Copy worker v40 → paste into Cloudflare → Deploy. It also brings v38 and v39 (the live worker was on v37).

## 2026-11-10 · v41: each new order's Drive folder, made on its own
- **Asked for:** Stephen wants every new order's Google Drive folder made automatically and its link saved in Airtable. Sales used to make it by hand. He approved each choice below.
- **What happens to a new order** (`ensureOrderFolder`):
  - The order's own folder already in the Printshop shared drive (`11185 - …` or `11185 Name`; not an imprint folder like `11185-B`, same ranking as v38)? Its link is saved and nothing is made (**linked**). Sales sometimes make it by hand.
  - Otherwise the worker makes `11185 - <Customer Name>` in **Proofs & Artwork** (`1lhVl349gMbi7PSCajptMFaO6snRVQTYf`) with these folders inside, no files:
    - Client Provided › unused previous art files, For Proof › unused
    - Proofs › unused, working files
    - Seps
    - Embroidery › unused, For Proof
    - Sales
  - Then it saves `https://drive.google.com/drive/folders/<id>` in **Artwork Folder Link**, the same format the apps save (**created**).
  - Folder name: no `/` or control characters (they become a space), at most 150 characters.
  - **No doubles:** the shared drive is searched again right before making the folder, and the same order asked twice at once makes one.
  - **Customer name still blank** (the name formula can fill a moment after the record is made): the instant step reads the order again up to 3 times, 4 s apart. Still blank → **pending**, and the cron makes it later.
  - **Never touched:** orders created before `FOLDERS_SINCE` (default 2026-11-10, midnight Fort Collins time), orders that already have a link, orders with no order number (**skipped**, with the reason).
- **Instant step — new `POST|GET /proxy/drive/neworder?rec=recXXXXXXXXXXXXXX`:**
  - Called by an Airtable automation (Orders → record created → run script). **No Airtable token**, so no key sits in the automation.
  - Safe without a token: it only acts on an order that exists, was made less than 6 hours ago and has a blank link. Anything else is a no-op that says why. The record id is checked strictly (`rec` + 14 letters/digits, else 400).
  - Answers `{ok, action: linked | created | skipped | pending, reason?, folder?: {id, name, url}}`. Takes a few seconds.
- **Backup — the 15-minute cron:**
  - The PandaDoc sweep runs exactly as before. Next to it, a folder sweep picks orders with a blank link, made in the last 3 days but over 10 minutes ago (so the instant step goes first) and on or after `FOLDERS_SINCE`.
  - At most 10 a run, oldest first. Blank customer name → skipped until it fills.
  - **Subrequest budget:** Cloudflare's free plan allows 50 calls per run, shared with the PandaDoc sweep, and one new folder takes up to 19. So the cron makes about 1 new folder per run (linking is cheaper) and leaves the rest for the next run. That's plenty for a backup. On the paid plan, the optional plain variable `FOLDER_SWEEP_BUDGET` = `300` lets it do all 10.
  - One failure never stops the other orders or the PandaDoc sweep. One log line: `[pine-folders] sweep eligible=… created=… linked=… skipped=… pending=… errors=… later=…`.
- **Settings:** none needed. It uses `AIRTABLE_WRITE_TOKEN` or `AIRTABLE_TOKEN` (already read + write), and `GOOGLE_SA_KEY` + `GOOGLE_DRIVE_ID`. Optional: `FOLDERS_SINCE`, `ORDER_FOLDER_PARENT` (a folder id or link), `FOLDER_SWEEP_BUDGET`.
- **Drive access:** making folders needs **Contributor or higher** on the shared drive. The service account is already a Content manager, which is higher.
- **Tested** in Node with a mocked Airtable, Google sign-in (real RSA key, signature verified) and Drive, 109/109:
  - A new order makes the exact tree and saves the link; asked again → skipped.
  - A hand-made folder is linked and nothing is made; it's chosen over a newer `11186-B` and never `111860`; only imprint folders → a new folder is made.
  - Skipped: link already set, over 6 hours old, before `FOLDERS_SINCE` (a timestamp, the default at Fort Collins midnight, an unreadable value falls back to the default), not found, no order number.
  - Blank name → pending after 3 re-reads 4 s apart; a name that fills on the 2nd re-read → created; a hand-made folder links without waiting.
  - Bad record ids → 400; missing token, key or drive ID → 503; a missing parent folder → 502 and no link; a Drive 500 is tried again; a folder Drive keeps refusing is listed in `missing`.
  - Three calls at once → one folder; a folder made between the search and the re-check → linked, nothing made. No token or key in any answer.
  - Cron: at most 10, oldest first; never under 10 minutes old, linked, over 3 days or before `FOLDERS_SINCE`; the next run makes the rest; the default budget keeps it at 30 calls or fewer; one failing order doesn't stop the next; a broken folder sweep doesn't stop PandaDoc; the PandaDoc sweep still runs (with or without the folder sweep).
  - `/proxy/version` → 41. 43 v40 routes answer byte-for-byte the same as v40, side by side.
- **Stephen deploys it:** worker-copy.html → Copy worker v41 → paste into Cloudflare → Deploy. Then add the Airtable automation (Orders → When a record is created → Run a script, input `recordId` = the record's ID) that calls the route.

## 2026-11-10 · v42: vendor invoices from purchasing@ (read-only)
Stephen: "Let's do the Worker route since I am an admin"; "all invoice go to purchasing@pineprintshop.com and get filtered to an invoice section". This is the first step toward vendor bills in QuickBooks. It only *reads* the invoice emails; nothing is sent, changed or deleted.
- **Routes** (Airtable token, like the Drive routes; GET only, everything else is 403):
  - `/proxy/invoices/status` returns the mailbox, the root label and the vendor labels.
  - `/proxy/invoices/list[?vendor=S%26S&max=10&after=2026-11-01]` returns the newest invoice emails: vendor, date, from, subject, snippet and attachments. With no vendor, it returns 3 per vendor label (fits the free plan's subrequest limit); with a vendor, up to 20.
  - `/proxy/invoices/attachment?id=&att=` returns the file (PDF), only for an email that carries one of the invoice labels (otherwise 403 `not_an_invoice`).
- **Google:**
  - The same service account (`GOOGLE_SA_KEY`) signs in as **one mailbox**, `INVOICE_MAILBOX` (default purchasing@pineprintshop.com), with scope `gmail.readonly`.
  - It reads only labels named `INVOICE_LABEL_ROOT` (default `2. Invoices`) or under it. The vendor is the sub-label minus " Invoices" (AS Colour, Bandana, First Tactical, LA Apparel, S&S, Sanmar, SLC, Staton, WooHoo).
- **Setup (Stephen):**
  1. Turn on 2-Step Verification for the admin account (required by Google).
  2. Enable the Gmail API in the pine-apps project.
  3. Add domain-wide delegation in admin.google.com for client ID `110397149940649014691` with `https://www.googleapis.com/auth/gmail.readonly`.
- **If delegation is missing:** 502 `gmail_signin_failed` "…domain-wide delegation for gmail.readonly is not set up…".
- **Tested** in Node with Google, Gmail and Airtable faked:
  - no token → 401;
  - status, list (3 per vendor, sorted) and the vendor filter work;
  - the JWT `sub` = purchasing@ and the scope = gmail.readonly;
  - the attachment comes back for an invoice email, and a non-invoice label → 403;
  - POST → 403, delegation missing → the 502 message;
  - `/proxy/version` → 42.
- **Check page:** `invoice-check.html` shows "✓ Worker v42 can read purchasing@ …" and lists the newest invoices per vendor, with Open buttons for the PDFs.
- **Next** (after a look at real invoices): read each PDF into fields (vendor, invoice #, dates, PO, warehouse, subtotal, freight, tax, total) with the worker's existing `ANTHROPIC_API_KEY`, then match to Purchasing carts. QuickBooks is one click per cart.
