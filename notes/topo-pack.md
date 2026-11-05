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

## 2026-11-05 — v4: box size menu
- Stephen: "can we include the pine box sizes and then a vendor one to add a custom size".
- Box size, both the default and each carton, is now a menu: **Pine S 12×12×6, Pine M 24×16×6, Pine L 24×16×14** (the sizes Shipping v8 and Receiving use), or **Vendor box…**, which opens L × W × H boxes in inches.
- A vendor box with fewer than 3 numbers counts as "No box size yet" in the checks.
- Sizes are stored and printed as "24 x 16 x 14".
- Tested: carton 1 set to Pine S, carton 2 to a vendor 18×14×10, the rest on the Pine L default. The check flags the vendor box until all 3 numbers are in. No page errors.

## 2026-11-05 — v5: Topo's own packing list, filled
- Stephen sent the v3 packing list back: "packing slip is still a little wild.....are you able to match the XLSX they provided".
- **How:** drop Topo's packing list workbook once (the one with the "PKL" sheet). It's kept in this computer's browser storage, so Topo's file stays out of the repo.
  - The browser unzips it (`DecompressionStream`), fills the PKL sheet through the DOM and zips it back (`CompressionStream`). Fonts, borders, column widths, the hidden columns, merges, the QTY group header and the TOTAL SUBTOTAL row all stay Topo's.
- **Header cells:** F3 ship to, F4 invoice (Pine order #), F5 date, F6 PO + memo, and H7 "From: Pine Printshop To: …".
- **Rows 10–123:**
  - B–D carton range, E Manufacturer PO (Pine order #), F Cust PO, G SKU#, H Color, J Destination, K Description, L Size, M QTY CTN, N PCS/CTN, O Total QTY.
  - Cartons in a row with the same SKU and quantity share one row ("6 - 8", QTY CTN 3).
  - A mixed carton gets a row per SKU, with B–D merged down, as in their sample (7 - 7 over three rows).
- **Clean-up:** the template's sample numbers and merges are cleared, unused data rows are hidden so it prints on one page, `calcChain` is dropped and `fullCalcOnLoad` set so TOTAL recalculates. Topo's hidden sheets are left as they were.
- **No template added:** the plain v3 layout is used and a toast says so.
- **Tested** with Topo's workbook and PO0003352, as 9 cartons with one mixed (LS XXL + SS XXL in carton 5): it opens and prints on 1 page in LibreOffice, and every XML part parses. Destination and Description are cut off by Topo's own column widths.

## 2026-11-05 — v6: packing list rebuilt with ExcelJS
- Stephen: "the xslx has never worked.....can we wipe the slate clean on that and try to build it back up to work".
- **Removed:** v1–v5's hand-written .xlsx (my own XML and zip) and v5's "drop Topo's workbook" filler, including the template card and its localStorage copy.
- **Now:** ExcelJS 4.4.0 (cdnjs) writes Topo's Packing Details (PKL) layout directly, with styles taken from their sheet:
  - Calibri 20 bold title; Arial 10 bold labels; Tahoma 10 values; Calibri 10 bold headers with thin black borders.
  - The QTY group header over PCS/CTN + Total QTY.
  - Data rows Calibri 10, with CTN# in Calibri 11.
  - A grey TOTAL row with SUBTOTAL formulas (and cached results).
  - Topo's row heights (24 / 22.5 / 18 / 27.75 / 12.75 / 25.5 / 15).
- **Changed from theirs:** the hidden Order and REMARK columns are left out. Destination (26) and Description (36) are wider than theirs (11 / 18) so the text isn't cut off. SKU and PO are stored as text, so they never turn into 4.1E+11.
- **Fits** one landscape page wide, print area set, gridlines off.
- **Runs:** cartons in a row with the same SKU and quantity share one row ("6 - 8", QTY CTN 3); a mixed carton gets a row per SKU with CTN# merged down.
- **Tested** with PO0003352, 9 cartons with one mixed: valid zip, every XML part parses, LibreOffice opens it and prints 1 page. I could not open it in Excel from here.

## 2026-11-05 — v7: packing list fills a Letter landscape page
- Stephen: "it is working....can we make it fill an 8.5x11 landscape paper".
- **Page:** fit to exactly 1 × 1 page, Letter landscape, centred on the page.
- **Row height:** worked out so the sheet has the page's shape (10.2 × 7.5″ inside the margins), between 15 and 48 pt. The sheet's width comes from the column widths (a character ≈ 7 px + 5 px padding at 96 dpi).
- **Text:** carton-row text grows with the rows, 10–12 pt, centred in the cell. SKU (18), Destination (30), Description (40) and Size (12) are a little wider so nothing wraps.
- **Tested** with PO0003352, 9 cartons with one mixed: LibreOffice prints 1 Letter page (792 × 612) that the table fills, with no wrapping.

## 2026-11-05 — v8: ask before picking up saved cartons
- Stephen: "I messed it up and trying to re upload the PO but it picks up where I left off".
- **Re-dropping a PO** that has saved cartons now asks first: "You have N cartons saved for PO …". OK picks up where you left off; Cancel starts fresh and clears the saved cartons.
- **Start over** now also clears season, Pine order # and ship date, and resets the empty box weight to 2.
- **Tested:** 10 cartons saved; re-drop + OK gives 10, re-drop + Cancel gives 0 and the save is cleared. No page errors.
