# Mockup Maker

Permanent link: `mockup.html` (desktop, art department). Live: https://pineprintshop.github.io/reprint-lookup/mockup.html · practice: `mockup.html?practice=1`

## 2026-10-25 — v1
Stephen: "let's pivot away from the separator and really maybe focus on a mockup creator" · "can we also take in .AI and .PSD files in the mockup creator to help streamline stuff" · "Art Dept will use it most" · "Pretty realistic would be great. and true to size visuals".

- **Job:** an order awaiting proof › line › imprints (same Airtable key as the other apps), or "No order" with a style + colour typed in.
- **Art per imprint:** PNG, JPG, PDF, .AI (its PDF-compatible copy, read with pdf.js 3.11.174) and .PSD (flattened image + layer switches, read with ag-psd 31.0.2). Or pick straight from the order's Drive folder (worker drive/search + drive/list + drive/file, two folders deep). Empty canvas is trimmed; a solid background can be dropped (edges or everywhere).
- **Real size from the file:** .AI/PDF artboards are in points, PSDs carry their resolution and PNG/JPG their dpi, so the print width starts at the art's real size (falls back to the location's usual width if it's out of range).
- **Realistic:** the vendor photo (AS Colour for AS Colour, else S&S, else SanMar; through the worker's /img route) with the print shaded by the photo's folds and heather, relative to the fabric's own colour. Switch off with "Realistic".
- **True to size:** the body width for the chosen size (S&S spec sheet, else a typical width by garment type, or typed in) is matched to the garment's measured width in the photo. A 1″ ruler shows the scale. Drag prints to place them; "X″ below neck" follows. The yellow neck line can be dragged to the real collar seam.
- **Colourways:** every line on the order that has the same imprints, front + back. The proof PDF gets a Colorways page when there are 2+.
- **Proof:** the art department's layout (page 1 + colourways + a page per imprint). The blue note now says the print is to scale on the size shown. Download PDF / PNG, Attach to the line (`11074 | 1717-HYD.pdf`, V2…), Proof done → Review (ticks Awaiting Review; the automation Slacks sales and the production manager). `?practice=1` fakes both writes.
- **Worker v30** (`workers/pine-workers-v30.js`): Drive file downloads up to 200 MB (were 25 MB) so big PSDs open from Drive. Uploads stay at 25 MB. Until it's pasted into Cloudflare, files over 25 MB say to download from Drive and drop them in.
- Tested with mocked Airtable, S&S, specs and Drive (Playwright): PNG with dropped background, a real .ai from Drive, a generated two-layer PSD (layer off → art re-trims), proof PDF 0.5 MB, attach + Review writes, and practice mode (no writes).
