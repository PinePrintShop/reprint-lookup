# Reprints

Permanent link: `reprints.html`, a desktop office app (it works on a phone too). File names: `reprint-lookup-vN.html`.
The old `reprint-lookup.html` is a first version, not a redirect, and is left as it is.

## 2026-10-17 · v4: Pine look, two panes, a safer link
Stephen: "Let's go! Onto the next" (the round of updates for the remaining apps).

**What it does** (unchanged): find a customer's past imprints, open one, and link a new reorder imprint back to it.
- The new imprint gets Previous Imprint ID = the past imprint, and Repeat? (the reorder flag, labelled "Reorder" in the shop apps) is ticked.
- The past imprint is never changed.
- No automation watches those two fields (checked Oct 17).

**Changes:**
- **Pine look:** Pine style v2, the same top bar, self-update and the version on screen.
- **Practice mode:** `?practice=1` fakes the link and saves nothing.
- **Layout:**
  - Desktop has two panes: results on the left, and the picked imprint on the right, with a big proof, inks, "Came from" (the imprint it was itself a reorder of) and an Airtable link.
  - Phones get one column.
- **Search:** by customer, imprint ID (10612-A) or order # (10612). Every page loads; v3 stopped at 500.
- **Filters:**
  - Screen print (the four screen-print types), Embroidery & apps, and Other.
  - Location, with counts.
  - v3's "Screen Print" filter included everything that wasn't embroidery.
- **One new-imprint box** (v3 had two). As you type, it looks the imprint up and shows its customer, nickname and location. It flags:
  - an ID that doesn't exist
  - the same imprint
  - a different customer
  - an imprint that is already linked to something else
  - Linking asks to confirm in the last two cases.
- **↩ Undo** after linking puts back the new imprint's earlier Previous Imprint ID and Repeat?.
- **Fixes from v3:**
  - "Prev Linked" showed a record number until it loaded; it now shows the imprint ID.
  - Text was 9–10px.
  - Colors were off-brand (green, amber).
- **Writes:**
  - v4 writes `Previous Imprint ID = ["rec…"]` (the API's documented form) and `Repeat? = true`. v3 sent `[{id:"rec…"}]`.
  - Undo writes back the earlier values.
- **Tested** with mocked Airtable:
  - search by customer and by order #
  - filters
  - "Came from"
  - the wrong-ID message
  - the different-customer and already-linked warnings
  - link: one PATCH with the two fields, on the new imprint only
  - undo: one PATCH restoring them
  - practice: 0 writes
  - desktop and phone screenshots

## 2026-10-19 — v5: Pine confirm box
- "Link … as a reorder of …?" (asked when the new imprint already has a link or the customers differ) now uses the shared Pine box (`pine-confirm.js`) instead of the browser's grey pop-up. The yes button says **Link**.
- Nothing else changed.
- **Tested** with mocked Airtable: Cancel → no write; Link → one update to the new imprint (Previous Imprint ID + Repeat?). Practice: 0 writes. No errors.

## 2026-10-20 · v6: top bar and filter row to the Pine standard
Stephen: "review ... the first ones that we did with the new brand colors to make sure to clean up the top bar that we did for the last few". The references are Line Item Review v35, Shipping v11, Seps v45 and Screens v30.
- **Practice marker:** the kit's square yellow tag (`p-tag p-tag-wait`), the same as every other app. v5 still had the old round `.p-practice` pill.
- **One filter row under the bar:** the search, the Search button and the filter chips are now one white `.p-filters` row. v5 had its own padded search band (77px) plus a separate cream chips band under it. Desktop gutters are 24px, as in Seps and Screens.
  - On desktop the chips sit on the search line (`.p-chips-inline`). When they don't all fit, they wrap to a second row inside the band and the search stays on line 1. No chip is ever hidden off to the side, because hidden filters are worse than a taller band.
  - On a phone the search and Search share line 1, and the chips go on line 2 and scroll sideways.
- **Phone bar:** 8px gaps, as in Seps, so the practice tag fits beside Refresh and ⚙ (in v5 they dropped to a second row).
- Nothing else changed: the same search, filters, link, undo and Airtable writes.
- **Tested** (Playwright, mocked Airtable). The v5 confirm-box test passes on v6: Cancel makes 0 writes, Link makes 1 PATCH, practice makes 0 writes. At 1440, 1280 and 390 the bar is 64px and there are no console errors. With a typical search the band is 123px at 1440 and 1280: line 1, plus a second row of chips, with every chip visible.
