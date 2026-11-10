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

## 2026-11-10 — v7: office format, bigger mockups, a mockup viewer
Stephen: "get it in the new format and increase the reference mockups that pops up to be bigger and then be able to scroll through all the mockups for a client vs closing and opening."
- **Office format** (pine-office-v1.css, like Line Item Review and Create order): the same bar, results and the picked imprint in two full-width panes that scroll on their own.
- **Bigger mockup:** the picked imprint's mockup fills its pane's height. An imprint with several proofs shows them as tiles under it.
- **Mockup viewer:** clicking a mockup (or "⤢ View all N mockups") opens it full screen on a solid dark background.
  - ‹ › arrows, ← → keys or a swipe step through every mockup in the results (every proof of every imprint, newest first). The thumbnail strip along the bottom jumps anywhere; a small gap marks where the next imprint starts.
  - The top shows the imprint ID, nickname, place, customer, date, "proof 2 of 3" and "4 / 27".
  - "Open 10901-A" picks that imprint (to link a reorder) and closes; "✕ Close" or Esc closes. The filters apply (e.g. Embroidery only steps through embroidery).
  - The next and previous mockups load in the background, so stepping is quick.
- Linking (Previous Imprint ID + Repeat?) and practice mode are unchanged.
- Tested with mocked Airtable at 1440 and on a phone: 7 mockups across 5 imprints, keys, strip, open-imprint, filters; no errors, 0 writes.

## 2026-11-10 — v8: ↓ / ↑ go through the cards
Stephen: "can we also make it so the down key when you are on a card goes through the stack."
- On the results (not while typing in a box), ↓ opens the next card and ↑ the one before. The card stays in view and keeps the focus, so holding ↓ walks the stack; it stops at the ends.
- Tested: ↓↓ → 3rd card, ↑ → 2nd, stops at the last, typing in the reorder box doesn't move it; no errors, 0 writes.

## 2026-11-10 — v9: ↓ / ↑ work right after clicking a card
Stephen: "v8 doesn't seem to be working the up and down keys through the cards."
- Clicking a card puts the cursor in the New imprint ID box, and v8 ignored the arrow keys in any box, so they did nothing. (v8's test had focused the card directly, which hid it.)
- Now ↓ / ↑ step through the cards from the search box and from the New imprint ID box while it's empty; only an ID being typed keeps them.
- Tested the real flow (click a card, then ↓ ↓ ↑): 1st → 3rd → 2nd, stops at the last, typing an ID blocks it; no errors, 0 writes.
