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
