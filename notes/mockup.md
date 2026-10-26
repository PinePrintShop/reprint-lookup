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

## 2026-10-25 — v2
Stephen: "Can we have a garment selector in here. As well as front should be the stock starting point not back".

- **Garment picker** (step 3): search the Garments table by style, brand or colour (e.g. `1717`, `bella 3001 black`), pick the style, then the colour. It swaps the garment on the mockup, colourways and proof for that line, and the vendor photo and size-M body width reload. Airtable isn't changed; "Use the line's garment" swaps back. With no order picked, choosing a garment starts a quick mockup (Front / Left chest / Back). The typed style + colour row is now only shown when there's no Airtable key.
- **Front first:** imprint tabs run Front, Left Chest, Right Chest, Pocket, Sleeves, then Back (was alphabetical by imprint ID, so "-B" came first), and the app opens on the first one.
- Tested with mocked Airtable (garment search, style + colour switch, reset, no-order quick mockup, tab order) plus the v1 checks.

## 2026-10-25 — v3
Stephen: "Can it also search vendors as well" · "Can u also get a copy and paste for mobile for the worker · Might be a little hard on mobile to update cloudflare worker".

- **Vendor search:** the garment picker now searches Pine's Garments table and the full S&S and AS Colour style lists together (the lists are cached for a day, as in Price-O-Matic). Results say "N at Pine", "S&S" or "AS Colour". When a style is picked, the colour list adds every colour the vendor makes under "More from the vendor". Colours Pine has ordered come first. A vendor-only style's garment type comes from its title (hoodie, crew, tank, long sleeve, youth…) so the true-size body width and neck line suit it. Typing a colour picks it (`gildan 18500 sand`). SanMar has no style list on the worker, so SanMar-only styles aren't searchable yet; their photos still load for garments Pine has.
- The old typed style/colour row in step 1 is gone; the picker covers it, with or without an Airtable key.
- **Worker on a phone:** new `worker-copy.html` (`?v=30` by default, newest). Copy button → steps to paste into Cloudflare → "Check it's live". It also shows a one-line edit that does the same job. Worker v30 gains `GET /proxy/version` → `{"version":30}` for that check.

## 2026-10-25 — v4
Stephen: "Can I zoom in on mobile to see if the placement is looking good, can we also do a scan of the file to see possible colors in the design etc".

- **Zoom:**
  - Pinch on a phone or iPad, double-tap, ctrl/⌘ + scroll, or the − / + / Fit buttons.
  - **Zoom to print** frames the imprint you're on, with its neck line and some shirt around it.
  - The picture is redrawn sharper as you zoom (up to 3× resolution).
  - One finger on a print or the neck line drags it; anywhere else it pans. When not zoomed, it scrolls the page as usual.
  - Tapping a print selects that imprint.
- **Placement guides:** the imprint you're on gets a dashed box, a measured line from the neck ("3″"), its size and how far off centre it is. The labels stay the same size on screen at any zoom. The guides only show in the app, not on the proof.
- **Colour scan** (under the art, for each imprint):
  - The art's main colours, each with its share of the print and the nearest shop ink/Pantone (≈).
  - Blended edge pixels between two inks are ignored.
  - Tap a colour to see where it is in the art.
  - Lists the spot colours named in an .ai/PDF file (e.g. 1655OW, PINEBRWNEZP, with the mesh prefix dropped) and in PSD spot channels.
  - Compares with the imprint's Pantones: a ✓ on matches, "in the art but not on the imprint", and "on the imprint but not found". EZ, base and BB tokens are skipped.
  - Flags blended tones (likely sim process / halftones), white ink, and "mostly white" art that probably still has its paper background.
  - When the imprint has no Pantones, the proof's colour chips come from the scan.
- Tested with mocked Airtable/vendors/Drive on desktop (1600 px) and phone (390 px, touch): zoom to print, dragging while zoomed (1″ drag = 1″), the scan on a two-colour PNG (≈107 + ≈1795) and on the 10695 .ai (8 spot colours read).

## 2026-10-26 — v5
Stephen: "And it will pull in the actual garment right. Or does the new worker need to be updated for that".

Checked against the live worker (v29) rather than mocks:
- **S&S photos weren't loading.** S&S doesn't find a bare style number (`products/?style=1717` → "not found"); it needs its style ID. The app now looks the ID up first (`styles/?search=1717`, matched on style + brand, so "Bella Canvas" matches "BELLA + CANVAS"), then gets that style's colours, photos and size specs by ID. Live results:
  - Comfort Colors 1717 Pepper: S&S photo, 20.25″ body (Chest Width (Laid Flat))
  - Bella 3001 Heather Navy: 20″
  - Gildan 18500 Sand: 22″
  - SanMar PC54 Ash: SanMar flat photo, typical 20″ body
  - All of these are shaded and saveable through the worker's /img route (already in v29).
- **AS Colour photos** are hosted on AS Colour's BigCommerce store CDN, which the /img route didn't allow. Worker v30 now allows that store's path only, so AS Colour garments need v30 for photos. Until then they show the plain shape.
- **Neck line defaults** were re-measured on real flat photos (top of garment → collar seam):
  - tees: 1.25″ front / 0.5″ back
  - crews: 1.5″ / 0.75″
  - hoodies: 6.5″ front (hood V) / 9″ back (hood seam)
  - Still draggable.
- Fixed a race where switching garments quickly could leave the previous garment's photo or body width on screen.
- The same bare-style S&S lookup is in Sep Maker v11's proof photos; it isn't fixed there (Sep Maker is paused).

## 2026-10-26 — v6
Stephen: "Also the proof only needs to show the back if there is a back print same with the imprint if info. That is only if that is actually on the print".

- A print counts as "on the print" once it has art.
- **The proof only uses those prints.** That covers the front/back garment views, the info blocks (size, placement, colours), the detail pages, the page tabs and the Colorways page. The back view only appears when a back print has art.
- A front-only quick mockup (no order) now gives a one-garment proof.
- The Mockup view shows the sides that have art, plus the side of the imprint you're on so you can place it. Colourways shows the sides with art. The placement rows list only prints with art, plus the one you're on.
- The proof can be made once any print has art. Imprints without art are named above the picture ("No art yet for … — left off the proof") so an order's missing print isn't missed.

## 2026-10-26 — v7
Stephen (phone screenshot, line sitting at the top of the collar): "We size based on the bottom of the collar".

- **Neck line = bottom of the collar.** It's now labelled "collar bottom". The starting positions were measured on 7 real S&S/SanMar flats (1717 Pepper/White, 3001 Navy/White, PC54, 18000, 18500): the bottom of the front collar sits 2.5–3.6″ below the top of the garment in the photo.
  - Front: tee 3.25″, crew 3.25″, hoodie 6.5″ (hood V)
  - Back: 1″ / 1.25″ / 9″
  - Vendors' photos differ by about ±0.5″, so the line stays draggable. Once dragged for a style (brand + style number), that spot is remembered on that computer/phone. "X″ below neck" placement is measured from this line.
  - The line is easier to grab on a phone, and a print still wins where the two overlap.
- **Measuring real photos:**
  - White garments on the white photo background weren't found (3001 White measured 18 px wide). The background test is gentler now, so they measure like any other colour.
  - Body width now uses the narrowest lower-body row, so crewneck/hoodie sleeves hanging against the body aren't counted.
- **iPhone:** tapping a button twice no longer zooms the whole page (that's what pushed the screen sideways in the screenshot). The page fits 390 px with no sideways scroll.
- I tried an automatic collar finder (edge detection) and it wasn't reliable across vendors, so it isn't used.

## 2026-10-26 — v8
Stephen: "Meaning 3″ down is from the bottom · Not on the Gildan crewneck sweatshirt".

- **"3″ below neck" = 3″ below the bottom of the collar.** That's how the app measures it.
- **The v7 starting line was wrong on the Gildan crewneck.** At 3.25″ it sat in the middle of the 18000's wide rib; the bottom seam is at 4.4″.
- **Re-measured the bottom seam of the front collar at the centre** on the real flats, with the contrast turned up:
  - S&S tees: 2.1–2.6″
  - Gildan 18000 crew: 4.4″
  - SanMar PC54: 5.3″ (SanMar frames its flats with more shoulder above the neck)
  - Gildan 18500 hoodie V: about 7″
- **Starting line** is now set by photo source and garment type:

  | Garment | S&S / AS Colour | SanMar |
  |---|---|---|
  | Tee | 2.5″ | 5.25″ |
  | Crew | 4.4″ | 5.75″ (estimate) |
  | Hoodie | 7″ | 7″ |
  | Back | 1.1″ tee · 1.5″ crew · 9″ hoodie | same |

  Checked on 1717 Pepper/White, 3001 Navy/White, PC54, 18000 and 18500: the line lands on the bottom of the collar.
- **Still draggable and remembered per style.** An automatic collar finder was tried again and wasn't reliable (tags, rib stitching and different photo framing).

## 2026-10-26 — v9
Stephen (PC54 screenshot, line above the collar bottom): "But the others look good".
- Re-measured the PC54 flat at full resolution with a ¼″ ruler: the bottom edge of the front collar rib is 6.2″ below the top of SanMar's photo. My v8 reading of 5.3″ was wrong.
- SanMar tees now start at 6.25″, SanMar crews at 6.75″ (estimate). S&S, Gildan crew and hoodie are unchanged; Stephen said those look good.

## 2026-10-26 — v10
Stephen: "This says it is 11 wide print does that feel right?" · on scanning the vendors for the most common Pine garments to find the bottom of the collar: "yes run the agent".

**Collar scan**
- **Styles:** Pine's most-ordered styles came from Airtable (Garments › linked line items, all time; the top 60 cover about 70% of line items). 50 were found at S&S or SanMar.
- **What was measured:** for each style, two colours' front and back flat photos were pulled through the live worker and measured with the app's own photo logic. Each got a ruled close-up (¼″ ticks), and 10 helper agents read the bottom of the collar on 179 close-ups:
  - Front: the seam at the bottom of the rib, not the neck-opening edge.
  - Back: the bottom of the rib, not the lower back-neck tape.
  - Hoodies: the hood V.
- **Results:** 45 styles are now in the app (`COLLAR` table), per colour where that colour was measured and a style value otherwise.
- **Left out on purpose:** 3001Y front (two low-confidence reads 2.7″ apart) and hoodie backs where the hood lay over the seam (SS4500, SS4500Z, IND4000, AFX90UNZ, 3719, Paragon 220).
- **Not measured:**
  - AS Colour (5001, 5026, 5051, 4001, 5082, 4062, 5102, 5101, 5161, 5001G): their photos need worker v30.
  - Not at S&S/SanMar: LA Apparel 1801GD, BOTM 2222/2121, Cotton Collective box tee, Original Favorites Supima.
- **What the scan showed:**
  - The collar band height is steady within a style.
  - Vendors lay each colour's photo out differently: the neckline moves up to about 0.9″ between colours (6210, SS3000, 3200, 3023CL). That's why values are per colour where possible, and why a dragged line is now remembered per style **and colour**.
  - Typical bottom of the front collar: S&S tees about 3.3–4.8″, SanMar about 6–6.5″, crews about 3.6–4.5″, tanks 9–13″.
  - S&S's own photos for the Bella 6008 tank have front and back swapped.

**Collar line kept as a share of the garment in the photo**
- It's no longer stored in inches, so it stays on the collar whatever size is picked. Before this change it slid when the size changed; checked at M vs XL on 6 live garments, same spot.
- Fallbacks for unmeasured styles now come from the scan: tee 4.1″, crew 4″, SanMar 6″, tank 10″, hoodie 7″; backs 1.1″, 1.4″, 4″, 9″.

**Width note**
- Under the print width it now says where the width came from: "From the file: 300 ppi" / ".ai artboard size" / "Photoshop size at N ppi".
- When the file doesn't say its size, it shows in bold "The file doesn't say its size — this is the usual front width. Type the real width."
- Once typed it says "Set by you."

## 2026-10-26 — v11
Stephen: "Since some of these are not flat. Maybe we should try and use the heights for sizing. Right now I still feel the width of the design feels smaller than what is actual is when printed".

- **Measured to check:** on 80 S&S photos (40 styles × 2 colours), the scale from the garment's height (photo height ÷ spec body length) came out about 1.5× the scale from its width (body width in the photo ÷ spec laid-flat width). Every photo was narrower than a flat shirt: body width ÷ height is 0.43–0.49 on S&S and 0.52–0.55 on SanMar, against about 0.7 for a laid-flat shirt.
- **Why:** vendors shoot garments shaped (on an invisible mannequin). From the front, a shaped body looks about 2/3 as wide as its laid-flat width.
- **Effect:** the width-based scale drew prints at only about 2/3 of their real size. That's the "feels smaller".
- **Now:** true size comes from length. The scale is the garment's height in the photo ÷ (body length for the picked size + 0.5″ for the collar above the shoulder point, or + 4.5″ for a hood).
  - Body length comes from the S&S spec sheet. Otherwise a typical value: tee 29″, crew/hoodie 28″, tank 28″, youth 22″, ±1″ per size.
  - The hood allowance was checked against flat (SS4500) and shaped (IND4000, AFX90UNZ) hoodie photos.
- **Live results:** an 11″ print on a 1717 M now spans about 80% of the visible chest. Prints are 1.26–1.53× bigger than in v10 (1717, 3001, 18500, SS3000, PC54).
- **Step 3:** "Body width" became "Body length (in)", which can be overridden. The hint shows both the length and the width for the size.
- **Not changed:** the plain-shape fallback, for when there's no photo, still uses width, since it's drawn flat.
