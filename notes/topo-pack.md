# Topo Packing

`topo-pack.html` → current version. Desktop office app: Topo carton labels and packing list.

## 2026-11-05 — v1
Stephen: "alright ready to start working on the Topo Packing Slips / Carton Labels", with Topo's PO0003352 (Topo x Toyota Pine Restock → Baja Fulfillment, 250 SS Beige + 250 LS Vintage Black; order 11011) and the SS cartons: 10/10 Smalls (18), 9/10 Mediums (75), 8/10 Large (76), 7/10 XL (43), ?/10 XXL (38). There are 10 cartons in all, with the LS in the other five; he will send which box size each one uses.

- **In:** drop Topo's PO PDF. pdf.js reads it in the browser; nothing is uploaded, and no customer data is in the repo.
  - For each line it reads: item SKU (12 digits; the labels use this, not the UPC), UPC, "<product> (<colour>, <size>)" and quantity.
  - A trailing M / W / U / Y on the product becomes GENDER (MENS…); sizes are spelled as on past labels (SMALL, MEDIUM, X-LARGE…).
  - It also reads PO# (PO0003352 → 3352), ship-to and the memo.
- **Cartons:** "One carton per size", or add cartons and mix SKUs in one carton.
  - Each carton has a carton number (any order; the labels and packing list sort by it), a box size and the gross weight. Net = gross − empty box (default 2 lbs, as on past labels: 9/7, 32.95/30.95).
  - Cartons are kept in localStorage per PO. Nothing is written to Airtable; the Boxes / Box Label tables there are unused for Topo.
- **Checks:** packed vs the PO per SKU, carton numbers missing or used twice, missing weights or box sizes, empty season.
- **Carton labels PDF:** Topo's V2 template, measured off TOPO-CARTON-LABEL-10695.pdf (A4 landscape, 2 pages per carton).
  - **LONG SIDE:** customer, COO, carton x of y, gross / net, dimensions, PO#, season.
  - **SHORT SIDE:** product (wraps), gender, colour, the two red SKU STICKER boxes, and the SKU / SIZE / QTY table (5 rows, more when a carton has more SKUs).
  - The originals are Myriad Pro. jsPDF's Helvetica is drawn with a horizontal scale taken from measured words, so the widths match.
- **Packing list .xlsx:** Topo's "Packing Details" sheet (from their PKL template).
  - Header: vendor, ship to, invoice (Pine order #), date, packing details of, consignee TOPO DESIGNS.
  - Columns: CTN# from–to, Manufacturer PO (Pine order #), Cust PO, SKU#, Color, Destination, Description, Size, QTY CTN, PCS/CTN, Total QTY, plus Gross, Net and Dimensions, and a TOTAL row.
  - Cartons in a row with the same SKU and quantity merge into "6 - 8".
  - Written as a real .xlsx (a stored zip, no library); it opened in LibreOffice.
- **Tested** with PO0003352: 10 SKUs and 500 pcs read, "one carton per size" with Stephen's SS numbers (S 10 … XXL 6), labels (20 pages) and packing list both checked.
- **Open:** season for this PO; LS carton numbers and box sizes; weights. Saving to the order's Drive "UPC & Carton Labels" folder could come next.

## 2026-11-05 — v2: Duplicate a carton
- Stephen: "would it be best to add a box field so I can add each boxes dimensions and maybe and a copy and paste for simliar ones…", then: "oh I just needed to click carton size!"
- Each carton row has **Duplicate**: a new carton with the same box size and weight, holding the next SKU still to pack (and its quantity left).
- With no cartons yet, the table says to click One carton per size or ＋ Carton.
- "Empty box weight (lbs)" is renamed, and its hint says about 2 lbs. Stephen had typed 35 there, which makes every net weight 0.
- Tested: the PO is read, One carton per size gives 10 cartons, and Duplicate copies the size and weight. No page errors.

## 2026-11-05 — v3: packing list tidied
- Stephen sent the v1 packing list back: "also this is funky".
- **What was wrong:** it printed across 3 portrait pages, the labels ran into their values, the Order column was empty, and the TOTAL row was tall.
- **Now:**
  - It fits one page wide in landscape (`fitToPage`, margins 0.4 / 0.5″).
  - The title spans the table.
  - The header labels (B:F) and values (G:J) are merged cells, and "Consignee: TOPO DESIGNS" has its own row.
  - The Order column and the "From / To" cell are gone.
  - CTN# and TOTAL span the carton-number columns, and the header row is 30 pt and wraps.
  - The TOTAL row adds up cartons, pieces, gross and net.
- Checked in LibreOffice with PO0003352 (10 cartons): it prints on 1 page.
