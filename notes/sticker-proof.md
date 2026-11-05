# Sticker Proof

`sticker-proof.html` → current version. Desktop app for the art department.

## 2026-11-05 — v1
Stephen sent 11156's two sticker proofs (made by hand in Illustrator) and said: "Here is our sticker template....I don't know yet how we make the mockups...but we can at least get this template setup in the system. Please match it exactly".

- Sticker lines have Product Type "Stickers" and no imprints or garment, so Mockup Maker doesn't list them. This is a separate small app.
- Steps: type the order number (Orders › `{Invoice / Order Number}`, then its lines), pick a sticker line, then drop in the art (PNG, JPG, PDF, or PDF-compatible .ai). Options:
  - take off a plain white background;
  - add a white die-cut edge (about 3.5% of the art size).
- The page is drawn from measurements of the template PDF, in points on letter landscape (792 × 612):
  - logo box, "Stickers" (Helvetica Bold 45) and Order #;
  - Shipping & Billing / ASI# / Order Contact / Payment Terms;
  - the grey #D0CFCD panel;
  - the blue #51ADE5 size marks (fixed, as on the template; only the labels change);
  - Border / Finishing / Colors, with the full-colour bar and FULL COLOR in Arial Black;
  - APPROVED.
- Fixed words are drawn at the exact width they have on the template, so tracking and font substitutes don't move anything. Variable words (order number, border, finishing) get the same squeeze as the template's words.
- Width comes from the line's Size ("3 inch"). Height comes from the art's proportions and can be changed.
- Border is guessed from the description (die / kiss); Finishing defaults to Semi-Gloss.
- Attach to line uploads "<order> | STICKER-<DESIGN>.pdf" to the line's Proof Images. As in Mockup Maker, only the new proof is kept. Download PDF saves the same file.
- `?practice=1`: Attach writes nothing.
- Tested with mocked Airtable and the art cropped out of 11156's two PDFs, overlaid on the originals. The text and lines match; the art is placed in the same box.
- Still open: how the sticker *mockups* are made (Stephen hasn't decided).
