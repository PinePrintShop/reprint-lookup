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

## 2026-10-26 — v12
Stephen: "How hard would it be to re color files. Do those need to be .ai or .psd files" · "Sure let's try the full version".

**Recolour any art.** It works on PNG/JPG/PDF/.AI/.PSD. It recolours the drawn picture for the mockup and proof; the customer's file and the seps aren't touched.
- **How:** tap an ink under "Colours in the art", then pick the new one (search Pantones and shop inks, e.g. 286, Cool Gray 7, White, or type a #hex). Each pixel is shifted by how much of each of its two nearest scanned inks it holds. Solid areas, soft edges, halftone dots and distressing all move together, so no halo of the old colour is left (test: 0 leftover red pixels of 2.4M after 1795 → 286).
- **Scope:** "All garments", or "Only <colour>" for the garment you're on (e.g. white ink on the black shirts, the original inks on the light ones). A garment's own choices win over the all-garments ones.
- **Colourways:** each garment shows with its own inks ("· its own inks" in the caption). Tapping a garment switches to it so its inks can be set. The proof's Colorways page follows.
- **Proof chips:** once art is recoloured, the colour chips show the new inks (e.g. "WHT 286" on Black and "107 286" on Hydrangea).
- **Reset:** "Back to the original" resets one ink; "Reset all inks" resets everything. New art, layer changes or dropping the background reset the recolour, since the inks change.
- **Limits:** flat spot-colour art recolours cleanly. On photo / sim-process art the panel warns that a recolour will only be approximate.
- **Pantone list:** "White" and "Black" were added to the ink picker (the shared list only had WHITE/WHT).

## 2026-10-26 — v13
Stephen: "also looks like when I upload a file it is pretty pixaleted in the preview".
- **Cause:** in Realistic mode, the print's fabric shading was worked out at the mockup's base size (1600 px wide) and then stretched 1.5–3× to the screen (more when zoomed), so it went blocky. Big art (a 4000 px PNG or a rendered .ai) was also shrunk in one jump, which makes fine lines and small type jagged, worst in Safari.
- **Now:**
  - Shading is worked out at the canvas's real pixel size (capped at 8 MP for speed).
  - Big art is shrunk in halving steps, and every draw uses high-quality smoothing.
  - Side by side on fine-line art (small type, 6 px rules) at "Zoom to print", v13 is crisp where v12 was blurry.
- **Proof garment bigger** (Stephen: "can we also make the garment larger on the main proof to fill up the page better"):
  - The proof photo is cropped to the garment (the vendor's white margins are dropped) and gets a taller space: 5″ tall from 1.55″ instead of 4.4″ from 1.75″. The info blocks sit just under it.
  - A front-only tee now fills most of the page height. Front and back sit side by side.
  - The Colorways page does the same. The on-screen Mockup view is unchanged (it has zoom).
- **Worker:** v30 is live (Stephen pasted it 2026-10-26). AS Colour photos come through `/proxy/img` (200, 111 KB). The new `/proxy/version` route is turned away by the worker's own route guard (`vendorGuard` doesn't list `version`); my miss. `worker-copy.html`'s "Check it's live" now recognises v30 by its AS Colour photo route instead. Fix the guard in v31 when there's a next worker change (`if (first === 'version') return null;`).

## 2026-10-26 — v14
Stephen (screenshot: AS Colour 5001 with Sputnik art, the mockup running off the bottom): "can we make the desktop version not have to scroll as much".
- **The mockup fits the screen height.** It was drawn at full stage width (about 1030×640 at 1440 px wide) with the message and placement rows around it, so the stage scrolled. Now it's sized to fit the space: 1440×900 and 1920×1080 have no scroll in the Mockup or Proof views (measured: stage scroll 0; it was 85 px in Mockup and 217 px in Proof on v13).
- **The picture is only as wide as the sides shown.** A front-only job uses a 900-wide picture instead of 1600, so the one garment is bigger.
- **Placement boxes** (below collar, off centre, proof text) moved into the sidebar under the art, for the imprint you're on.
- **The long instruction line** became a short hint in the zoom bar. The message line now only shows when there's something to say (missing art).
- **Proof page** fits the screen height.
- **Phones** keep the stacked layout (390 px, no sideways scroll).

## 2026-10-26 — v15
Stephen: "what is colour ways mean" · "can we also be able to select multiple garments if the design is sharing across a few colorways".
- **More garments on one mockup.** Step 3 has an "Also show on" list.
  - Tick other colours of the style ("Show the 1717 colours" loads them from S&S/AS Colour), or search another style and tick its colours too.
  - Each ticked garment joins the Colorways view and the proof's Colorways page, with the same prints.
  - Each can have its own inks: tap it on Colorways, then recolour "Only <colour>".
- **Works with or without an order.**
  - Added garments are for the mockup only, marked "· added". Airtable isn't changed.
  - Attach / Proof done stay on the order's own line. Working on an added garment says so above the picture.
  - Changing the main garment in a no-order mockup keeps the added ones.
- **Tab renamed "Colorways"** (US spelling, matching the proof page). The cards are smaller so 3 fit across at 1440 px.

## 2026-10-26 — v16
Stephen: "oh yeah we need bandanas as well on here".
- **Bandanas** (Carolina Creative 4800, 4900, 4927, 795, B22NOV "Hippie"; Airtable type Bandana) are drawn as a true-size square.
  - 22″ unless set in step 3 › Bandana size.
  - Drawn in the bandana colour with a stitched hem, two soft folds and a cotton weave over the print when Realistic is on.
  - The colour comes from a table of Pine's ~27 bandana colour names (Burnt Orange, Charcoal Grey, Kelly Green, Hot Pink…), otherwise the CSS name. Step 3 › Bandana colour fixes any that look off.
- **Placement:** the print starts centred and can be dragged. Placement reads "Centered", or e.g. "1″ below centre, 2″ right of centre". The step 3 boxes read "Down from centre / Off centre".
- **Without an order:** search "bandana" (it's turned into "carolina"). The mockup gets one Bandana imprint.
- **Also show on:** offers the style's colours from Airtable's Garments table (bandanas aren't at the vendors). Each added bandana shows on Colorways and the proof's Colorways page.
- **Proof:** the bandana layout draws the same bandana, larger (5.75″ square), and "Bandana Dimensions" follows the size.
- **Fixed an endless redraw** for garments with no vendor photo (every bandana, and any tee whose photo wasn't found). The Colorways view kept re-asking for the photo and redrawing. Each garment is now looked up once.
- **"Mostly white — is it the paper?"** now only shows for art that came on a solid background, not white-ink art on a transparent one.

## 2026-10-26 — v17
Stephen: "just got a exceeded memory for a large .psd".
- **Cause:** a PSD was read with every layer as a full-size image (a 6000×7500 file is about 180 MB per layer), and then the art was copied several more times at full size. A big layered file ran the browser out of memory.
- **Now:**
  - Only the flattened image and the layer names are read. A layer's pixels load the first time a layer is switched off. If even that is too big, the app says to hide the layer in Photoshop and save a copy.
  - PSDs saved without "Maximize compatibility" (no flattened copy) are built from the layers, as before.
- **Any art over 4000 px a side is shrunk to 4000 px to work with,** for every format and after switching layers. The print size still comes from the file's real size (ppi scaled to match), and 4000 px is still sharp at the deepest zoom.
- **Tested:** a generated 6000×7500, 300 ppi, 3-layer PSD (12 MB) opened in 1.3 s at 3200×4000 working size with its real size intact. Switching a layer off loaded the layers and recomposed correctly. The other tests pass.

## 2026-10-26 — v18
Stephen: "can we rework the bandana image....feels a little fakey right now" · "can we also combine colors when they are similar or have a way to edit them and or remove them".

**More real bandana.** The flat square with drawn folds is now a generated photo of cotton (1000 px, cached per colour):
- a height field with the crisp creases from being folded in quarters, faint second folds, tapered soft wrinkles near the edges and corners, and slow waves
- light from the top left, slightly darker in the deep folds
- a cotton weave
- slightly uneven edges (±0.3%, since "our bandanas are not 100% perfectly square"), a rolled hem with stitching, and a soft shadow underneath

The print is shaded by the same folds, the same way prints sit in the shirt photos (the bandana is passed in as the "photo"). A first version was too heavy (carved creases, stick-like wrinkles, jagged edge), so I toned it down before shipping.

**Editing the colours in the art.**
- **Combine similar** (in the panel header) merges colours within about ΔE 24 or with the same nearest ink. Test: 4 reds/oranges became 3.
- Tap a colour, then:
  - **Recolour the art** (as before; now applies to every colour merged into it).
  - **Just rename it:** call it e.g. 186 without changing the picture.
  - **Merge into** another colour.
  - **Remove from the list:** not an ink. The art is unchanged. "Put back" restores it.
  - **Erase from the art:** the colour's pixels go transparent, soft edges included. "Back to the original" undoes it.
- **Undo edits** returns the list to the scan.
- The count, the ✓ against the imprint's Pantones, the "where it is" preview and the proof's colour chips all follow the edits (test: rename → 186; blue erased and yellow removed → chips "186").
- **Speed fix:** the "where it is" preview recalculated the colour groups for every pixel (and the ink table was rebuilt on every lookup), which froze the page. Both are now worked out once.

## 2026-10-26 — v19
Stephen: "also you should be able to pull in all garments right even hats etc.." · "bandana is almost there. here is a good reference for us to try and mimic" (a flat Carolina Creative product photo) · "when it pulls in the drive folder....can we just focus on the customer provided folder and have it be able to open it and view the files inside that folder".

- **Hats, beanies, totes, anything else:** these were drawn like a 29″ shirt with a collar line. Now each kind has its own size, measured across the item in the vendor photo:
  - caps 8.25″
  - beanies 9″
  - totes 15″
  - anything else 20″

  Each also has its own print spot (cap front panel, beanie cuff, middle of the bag, centre) and a default print width (4″, 3″, 10″, 8″). Art can't start wider than the item.
- **Picking the kind:** it comes from the garment type, or from words like cap/hat/trucker/snapback/beanie/tote. Step 3 › **Kind** changes it for any style (e.g. a cap with no type in Airtable). **Width across (in)** sets the real size of a particular style.
- **Shirt-only parts dropped for these:** no collar line and no shirt size. Placement reads "Centered on the front panel" / "… on the cuff" / "… on the bag". Quick mode gives them Front + Back.
- **Proof wording for these:** the proof's fine print and blue note talk about "a typical cap" instead of "a size M garment". Switching between a shirt and a hat resets the placement (3″ below the collar means nothing on a hat).
- **Bandana:** redrawn to match the reference photo:
  - lying flat, with one soft fold down the middle (and a fainter one across)
  - slubby cotton weave: short thread streaks, not a grid
  - soft light from the right, falling off toward the lower-left corner
  - a few long, gentle ripples
  - straight edges with a thin hem and barely any shadow

  The old version had dark cross creases, wrinkles bunched at the edges and wavy hems.
- **Drive:** opens straight in the order folder's **Client Provided** folder (older orders: Customer Supplied / Content / Art). It shows what's in it as tiles with thumbnails and sizes.
  - Folders (e.g. "For Proof") open in place.
  - The path at the top goes back up, including to the order folder.
  - Art (PNG/JPG/PDF/AI/PSD) opens in the mockup with one tap. Other files open in Drive.
  - It no longer walks the whole order folder (Proofs, Seps, Sales…), so old proofs and seps stop showing up as art.
  - No worker change needed.
- Tested with Playwright and mocked Airtable, vendor photos and Drive:
  - cap / beanie / tote / untyped cap set to Cap: sizes, placement text and proof
  - bandana in 4 colours, compared against the reference photo
  - Drive: open Client Provided › For Proof › back › order folder › open art
  - the earlier regression scripts (recolour, ink edits, colourways, big PSD, bandana)

## 2026-10-26 — v20
Stephen (screenshot of order 11001, OAD 108 - Natural, showing "Photo not found — plain stand-in"): "we should have access to this OAD product".

- **The miss:** S&S does carry it, as **OAD108** "Jumbo Tote" (Black, Natural). Airtable has the style as "108", and the lookup only took an exact style-name match.
- **The fix:** a style not found on its own number is now looked up again with the brand in front (OAD + 108 → OAD108). Other brands that prefix their styles this way are fixed too.
- **Real width from S&S:** totes and other flat items now take their width across from S&S's Measurements line (OAD108: 20"W x 15"H x 5"D → 20″) instead of the typical 15″. The hint says where the size came from. Width across (in) still overrides it.
- Tested against live S&S through the worker: real photo found, width 20″ from S&S, print centred on the bag.

## 2026-10-26 — v21
Stephen: "oh I guess we do need methods as well...like printed or embroidery etc...since those say threads ....but this is a good start".

- **Method per imprint:** step 2 › Screen print / Embroidery / Patch / Heat transfer. It's read from Airtable's Imprints method field:
  - Embroidery → Embroidery
  - Patch Application, Decopress, labels → Patch
  - Supacolor → Heat transfer
  - Discharge, W/B, Flatstock and the rest → Screen print
  - An "Embroidered Apparel" line whose imprint has no method → Embroidery

  The stitch count from Airtable shows under the picker.
- **Embroidery:**
  - Drawn as satin stitches (slanted rows with a sheen), raised with a soft shadow, and following the fabric's folds less than ink does.
  - The colour list reads "Thread colours in the art". "Just rename it" now accepts any text, e.g. `1756 MD`, as Pine writes Madeira threads on its proofs.
  - Proof: the imprint block reads "EMBROIDERY · FRONT - 10797-A" with **Thread Colors**. The fine print says thread colors (not Pantone) and "Embroidery size". The art department's sew-out note is added: "PLEASE NOTE: THREAD COLOR ON PHYSICAL SEWOUT DOES NOT MATCH THREAD COLOR OF FINAL PRODUCT". Wording taken from real embroidery proofs (10656, 10797).
- **Patch:** the art on a white twill backing with a stitched border, inset inside the border, raised with a shadow.
- **Heat transfer:** flat, like a print.
- **Not done:** there's no thread chart, so threads aren't matched automatically. With Pine's Madeira thread list (numbers + colours), the scan could suggest the nearest thread the way it suggests Pantones.
- Tested with Playwright: tee left chest and cap in embroidery and patch, a thread renamed to 1756 MD, the proof page, the method mapping on real Airtable values, and the earlier regression scripts.

## 2026-10-26 — v22
Stephen, on garments no vendor has a photo of: "let's just do 1 for now" (= upload a photo in step 3). Also, while it was being built: "embroidery adds a weird filter on the image" (a photo of a cap set to Embroidery), and "this won't let me move the image up to front left chest" (a polo).

- **Your own garment photo:** step 3 › Your photo › Front photo / Back photo. Drop a photo on the button or tap to pick: a supplier's site image, or a phone photo laid flat, straight on, on a plain background.
  - The background is taken out by growing in from the photo's edges through pixels close to the edge colour, so gradients and soft shadows go too. The photo is then cropped to the garment and put on white like a vendor shot.
  - From there it works exactly like a vendor photo: true size (length for shirts, Width across for everything else), the collar line, fabric shading.
  - It applies to every line with the same style + colour and is kept until the page is closed. "Remove my photo" (or "Use the vendor photo" when there is one) goes back.
- **Embroidery look:**
  - The stitch texture is much subtler: fine stitches, a gentle sheen, no hard row lines, a lighter shadow.
  - Art that's a photo gets no stitch texture at all. A photo is spotted when more than 12% of neighbouring pixels differ a little, as grain and light do (a vendor bandana photo scores 18%, flat logos 0%). Halftones and blends are skipped as before.
- **Polo couldn't move up:** Airtable's garment type "Other" (polos and more) made v19 treat the garment as a flat item, measured from the centre, and dragging stopped at the centre. "Other" no longer means a flat item; only the Kind picker or words like cap/beanie/tote do. Hats, bags and bandanas can now also be dragged above centre.
- Tested with Playwright:
  - a phone-style photo (navy tee on a grey gradient with a drop shadow): garment box found exactly, sized and shaded, removed again
  - embroidery on flat art, and photo detection across 8 files
  - a polo with type "Other" reads as a shirt (Front, Left chest, Back); a cap print drags 1.5″ above centre
  - the earlier regression scripts

## 2026-10-26 — v23
Stephen (screenshot: a white "P" on a black Comfort Colors 1717, the print looking mottled): "the shirt filter seems a little intense....let's try a few more options to get that effect dialed in".

- **Why it was blotchy:** the print took the garment photo's brightness pixel for pixel, as a ratio to the fabric colour. On black that ratio swings hard, so the grain of a garment-dyed tee turned a white print blotchy.
- **Now:**
  - The photo's grain is blurred away first, so only folds and light come through.
  - The print is lightened or darkened by how far each spot is from the fabric's own colour, rather than by a ratio.
  - A floor keeps a black garment's small changes small.
- **Step 3 › Fabric look on the print:** Off / Light / Medium / Strong, replacing the Realistic checkbox.
  - Settings (smoothing, strength): Light = 0.2″, 40%; Medium = 0.12″, 70%; Strong = 0.05″, 100%.
  - Medium is the default. The choice is remembered on that computer.
- Compared on live S&S photos (1717 Black with a white P, 1717 Pepper with a two-colour print), all four settings, plus the earlier regression scripts.

## 2026-10-26 — v24
Stephen sent a cream tee on a white background ("here is what I wanted for the garment upload and the screenshot is what I got"): the photo came back as just a few fold lines.

- **Why:** the background clean-up was tuned for uneven phone-photo backgrounds. It allowed colours up to 95 away from the background and steps of 14 between neighbours. A cream shirt is only about 50 away from white, so the clean-up ran straight into the shirt.
- **Fix:** how far it may reach now depends on how even the photo's background is (the spread of the edge pixels).
  - A clean studio white allows only colours within about 10 of it.
  - An uneven phone background allows up to 90.
  - Each step may only move to a nearly identical neighbour (4–14).
- Tested with Stephen's cream tee: the whole shirt is kept, colour #ebe6d3. The navy phone-style photo still cleans up the same, and the regression scripts pass.

## 2026-10-26 — v25
Stephen (proof for 11080, Cotton Collective "OVERSIZED B…" running under the shirt photo): "Looks like the full garment name is getting cut off".

- **The fix:** the brand, style and colour in the proof's left column shrink to fit its 2.7″ width. Below half size they wrap onto a second line instead (up to 3 lines).
- **Short names are unchanged:** "1717" stays big.
- Tested with Cotton Collective "OVERSIZED BOXY HEAVYWEIGHT TEE" / White Cap Off White, which wraps cleanly in the column, plus the regression scripts.

## 2026-10-26 — v26
Stephen: "in the mockup creator it should have something when it is a reprint to gain access to that folder in the drive as well".

- **How a reprint is found:** an imprint linked to a previous imprint (Imprints › previous imprint, field fldAEQvMAAZX9gnhl, the same link the Seps app uses for the previous run) is a reprint. That imprint's ID (e.g. 9447-F) gives the original order number (9447).
- **Drive panel:** shows **This order #11080 · Reprint of #9447** (several originals each get their own button). Tap to switch; each opens at its Client Provided folder, and the path goes up to the whole order folder.
- **No folder yet:** if the new order has no Drive folder, the original's opens straight away with a note: "No Drive folder for #11080 yet — showing the original order #9447."
- **Speed:** folder look-ups are kept per order number for the session, so switching back is instant.
- Tested with mocked Airtable and Drive, with and without a folder for the new order; regression scripts pass.

## 2026-10-26 — v27
Stephen: "in the mockup creator I need to be able to sometimes just move one specific garment print location without moving it on all the garments".

- **Placement switch:** with 2+ garments on the order, the placement fields have a switch: **Same spot on all garments / Own spot for {colour}**.
  - Own spot copies the shared spot to this garment. From then on, dragging and typing move the print on this garment only: its mockup, its Colourways tile and its proof.
  - Same spot drops the garment's own spot again.
  - Changing the garment kind (shirt ↔ hat/bandana) clears own spots, along with the shared spot.
- Tested with a mocked 2-garment order (Black, Natural) sharing one front print:
  - A shared drag moves both.
  - Natural's own spot moved by typing (5″) and by dragging (+1″), while Black stayed.
  - Back to Same spot, Natural returned to the shared spot.
  - Regression scripts pass.

## 2026-10-26 — v28
Stephen: "also need to be able to add a base color on the mockup creator as well" → picked "Underbase under the print".

- **Underbase** under the method buttons (screen prints only): Auto / Off / White / Cream.
  - Auto lays a white base on dark garments (body colour darker than mid grey) or when the imprint's Pantones already list BASE, BB or EZ WHT. Light garments get none.
  - The base is the art's shape, choked about 1/64″, under the inks. The fabric shading runs over both.
  - Off on a dark garment: the inks sink into the shirt colour (white on black comes out grey), like printing with no base.
- **Show the base** shows only the base on the mockup (the art faint on top), so you can see where it prints. Tap again to show the print.
- The proof's colour chips start with **BASE WHT** / **BASE CRM** when there's a base (unless the Pantones already name one). Colourways pick Auto per garment.
- Per imprint, for this session (nothing new saved to Airtable).
- Tested with mocked Airtable (Playwright): black tee Auto → white base, Show the base, Off (inks sink), Cream; natural tee → no base; embroidery hides the row; proof chip; v25/v27 regression tests pass.

## 2026-10-26 — v29
Stephen: "on the mockup creator can we be able to add a few images to a location.....I am looking at a tote bag and they gave us text in a few files and then a reference to how to combine them" · "oh the reference I was talking about was just in the client folder.."

- **Several files in one print.** "+ Add a file to this print" (shown once a print has art): the next file opened goes into the current print. You can click to pick it, drop it, paste it or tap a Drive tile. It's stacked 1/4″ under what's there. A file with a real size keeps it; one without starts as wide as the first file.
- **Files in this print** list (top = on top). Each file has:
  - its own width;
  - ▲▼ to change which file is on top;
  - **BG** to drop its own solid background;
  - ✕ to take it out (with one file left it's a plain print again).
- **Stack** / **Side by side** / **Centre** (the picked file) line the files up.
- **Drag moves one file** (default after adding) or **the whole print**. The picked file has a yellow outline on the mockup. Moving one file leaves the others where they are on the garment.
- Typing a print width scales all the files together. Inks, underbase, sizes and the proof treat the files as one print. Moving files keeps ink changes when the inks are unchanged.
- **Add a reference**: pick the customer's layout picture (a Drive tile in Client Provided works). It shows under the list; tap it to see it big. It isn't printed or put on the proof.
- **Bandana proof close-ups** used the garment-photo colour, which bandanas don't have, so the page came out grey or the wrong colour. They now use the bandana's colour.
- **Underbase follow-ups**, Stephen: "we don't need to dull the print for when we remove a base" → Off just shows the print as before (the v28 "inks sink" look is gone). "bandanas never have a base" → no base and no Underbase row on bandanas.
- Tested with mocked Airtable (Playwright):
  - three text PNGs added, dragged, stacked, side by side and scaled to 10″;
  - reference shown; back to one file;
  - red bandana close-up is red; Underbase row hidden on bandanas;
  - v25/v27/v28 regression tests pass.

## 2026-10-26 — v30
Stephen: "I think I need to be able to crop as well that way the sizing is correct".

- **Crop**: the button next to Add a reference (one-file prints), or ✂ on a file in the Files in this print list. It opens the file big.
  - Drag a box round the part that prints. Drag inside the box to move it, or a corner to resize it.
  - While you drag, it shows the box's size at the file's scale.
- The art keeps its scale. After cropping, the print width is the real width of what's left, not the whole file stretched to the old width (e.g. 8.75″ file → left half → 4.37″).
- **No crop** puts the whole file back at its full width. The button reads "Crop ✓" while a crop is on.
- Crop runs after the background drop, so dropping a solid background still reads the file's own edges.
- Tested with mocked Airtable (Playwright):
  - crop / no crop / cancel on a one-file print;
  - crop on one file of a two-file print;
  - v25–v29 regression tests pass.

## 2026-10-26 — v31
Stephen: "mockup creator needs to be able to reference Discharge as well....also I like the idea of matching inks with what we have in stock. also if it goes on a base we do use OW after the number that mean On White. and DC for discharge. Direct to Fabric just is the pantone number" · "trying to open up a .psd file and saying CMYK not supported"

- **Discharge** is a fifth Underbase choice.
  - It's drawn as the garment colour lifted toward natural cotton under the print, with the inks a touch soft.
  - Auto picks Discharge when the imprint's Pantones say DC or discharge, and a white base when they say OW.
- **Ink names follow the base** on the art swatches and the proof chips:
  - white/cream base → `286OW`;
  - discharge → `286DC`;
  - direct to fabric → `286`.
  - The proof's BASE WHT/CRM chip stays for white/cream bases, not discharge.
- **Matching inks prefers Pine's inks.**
  - It reads Airtable › Inks (every mix, with its type: Direct-to-fabric / OW / SOW / Discharge) once a day, read-only. SOW counts as OW.
  - Like Sep Maker v20, an ink mixed often wins when it's nearly as close as the nearest Pantone (up to ΔE 3.5).
  - A swatch says **in stock** when that ink has been mixed before in the type this garment needs (OW, DC or direct). This counts past mixes; the Inks table has no on-hand quantity.
- **CMYK .psd files open.**
  - The Photoshop reader refuses CMYK, so the flattened image is read straight from the file (RGB/CMYK/grayscale, 8/16 bit, raw or RLE), with its ppi and spot channel names.
  - CMYK becomes RGB without a colour profile. There are no layer switches for these files; the white background drops like a JPG's.
- Fixed a v29 slip: a PSD with no flattened copy hit an undefined message box while building from layers.
- Tested with mocked Airtable (Playwright):
  - discharge / OW / plain names on swatches and proof; in-stock marks; Pantones "286 OW" → white base, "286DC" → discharge;
  - CMYK PSDs (raw and RLE) open red at 300 ppi;
  - v25–v30 regression tests pass.

## 2026-10-26 — v32
Stephen: "can we also have it make all the individual mockups for different garments when sharing a design and not just that colorway view".

- **A full mockup page for every garment** that shares the design. The proof (preview, PDF and Attach) is now: a page 1 for each garment, then Colorways, then the close-ups.
  - Each page 1 shows that garment's photo, colour name and fabric.
  - It uses that garment's own print spot and recolours.
  - Its ink chips follow that garment's base (OW on dark, plain number on light, DC for discharge).
- Page tabs are named by garment colour (Black / Natural / Colorways / 11080-A).
- **A page for each garment** (ticked by default, remembered) goes back to a single page 1 for the garment being worked on.
- The proof preview now draws only the page on screen (it drew every page on each change); the PDF draws them all.
- Tested with mocked Airtable (Playwright): a 2-garment order gives 4 pages (Black, Natural, Colorways, 11080-A); the Natural page has plain 107/1795 chips while Black has 107OW; turning it off gives 3 pages; the working garment stays put. v25–v31 regression tests pass.

## 2026-10-26 — v33: Art to do moves in (step 1), ink opacity
Stephen: "is this mockup creator kindof like the Art To Do on the Line Item Review section? how can we explore combining those" → "since we are not using these yet...I say let's explore 2" (Mockup Maker becomes the art department's home; Line Item Review keeps Review / Ready to send / Sent). Then: "we do need to be able to move the opacity on the mockup creator.....for when we know something doesn't discharge well but the client still wants it".

- **Art to do tab** (first in the views; the app opens on it):
  - It lists every line on an order in Awaiting Proof that still needs its proof. The rule is the same as Line Item Review's Art to do: no proof yet, or a proof that hasn't gone to Review. Invoice fees and archived orders are left out.
  - Grouped by order, oldest order first. The order bar shows #, customer, rep, ASAP / Hard date, and due.
  - Each line shows its imprint IDs, garment, pieces, and **Needs proof** or **Proof up · not sent to Review**.
  - Search covers order, customer, imprint and garment. There's a rep filter (remembered).
  - Tap a line and its order and line open on the Mockup tab. Picking a job any other way (dropdown, garment) also switches to the Mockup tab.
  - Attaching a proof turns the line to "Proof up"; Proof done → Review takes it off the list. The count is on the tab.
- **Art brief** under the job, as in Line Item Review. It replaces the one-line garment hint.
  - The order line: rep, ASAP/Hard, due.
  - The garment with pieces and sizes, plus Women's / Youth.
  - Each imprint: location, method, nickname, inks (Imprints › Inks, else the Pantone text), and its Print and Ink notes.
  - "Repeat of 9447-F — last proof ↗ · seps ↗" or "New art".
  - Proofing and Sales notes, shown once when they say the same thing.
- **Ink opacity** per print, 20–100 %, under the method buttons. Use it when the ink won't fully cover (a design that won't discharge well, but the client still wants it). Mockup, Colourways and proof all show it. Session only, nothing saved.
- Reads only (Orders: rep, ASAP/Hard, created, archived; Line Items: notes, sizes, imprint IDs; Imprints: notes, inks, nickname, repeat, seps, proof images). No new writes.
- **Next steps for option 2:** comments on the line (read and post, with @mentions); the fuller Drive panel (folders, download, upload, proof copy into Proofs); then retire Art to do in Line Item Review.
- Tested with mocked Airtable (Playwright):
  - 3 lines across 2 orders; the fee, the Review line and the archived order are left out; search and rep filter work;
  - tapping a line opens order 11080 / that line;
  - brief content (repeat with last proof + seps, notes once, sizes);
  - opacity 100 → 50 % halves the print's brightness; no writes;
  - v25–v32 regression tests pass.

## 2026-10-26 — v34: separation PSDs show every ink
Stephen (screenshot: V3 8107A-BROAD-FRONT.psd on a Hot Pink bandana, only light blue showing): "this is suppose to have more colors but I am only seeing blue".

- **Why:** a PSD's flattened copy (what the app read) holds only the normal colour channels. Spot channels, which is how the shop's sep files hold their inks (BB, EZWHT, 186OW …), aren't in it, so only what was on the layers showed.
- **Now:** a PSD with spot channels is read straight from the file.
  - Each spot channel's ink is laid on top in its own colour, taken from the file (RGB / CMYK / Lab / HSB / grey colour records).
  - It uses the channel's solidity. Black in the channel = ink.
  - Where there's no ink it's transparent, so white inks show on the garment; the background isn't dropped.
  - Spot names still show in "Spot colours named in the file".
  - No layer switches for these files.
- I couldn't open the real 8107A file (90 MB is too big for the Drive connector here).
- Tested on Sep Maker's own spot export (BB, EZWHT, 186OW, 654): before, it showed only White and a dark grey; now red 186, navy 654 and white text show and scan as 186 / 654 / White. CMYK PSDs and the v28–v33 tests still pass.

## 2026-10-26 — v35: more kinds of sep PSD, and what's inside on screen
Stephen, on v34: "still just pulling in the blue". The real file (90 MB) can't be opened from here, so:
- **Multichannel** PSDs (every channel an ink on white) and **Duotone** (read as grey) now open through the sep reader.
- Channel names come from the Unicode list when there is one. A channel with no colour record counts as an ink unless it's named like a selection (Alpha…, Transparency…). Its colour comes from its name: 186OW → Pantone 186, EZWHT / BB → white, BLK → black.
- **Under the file** it now says what it found, e.g. "PSD: RGB 8-bit · 9 channels · extra: 186OW, 7541 … · 6 spot inks laid in · 12 layers (3 hidden)". A file that still looks wrong can be screenshotted with the cause on screen. If it says layers are hidden, the other colours may be on hidden layers; switch them on in Photoshop layers.
- Tested: Sep Maker's spot export (Grayscale + 4 spots), a Multichannel PSD with 3 named inks and no colour records (186 C, 7541, EZWHT), CMYK PSDs, and the v33/v34 tests.

## 2026-10-26 — v36: inks kept as plain channels
Stephen's V3 8107A-BROAD-FRONT.psd on v35: "PSD: CMYK 8-bit · 7 channels · extra: Transparency (alpha), blk (alpha), blue (alpha)". The black and blue plates are plain saved channels, not spot channels, so v35 skipped them as selections.
- Any extra channel not named like a selection (Alpha…, Transparency, Mask…, Layer…, Selection…) is now an ink.
- A plain channel has no ink colour. It takes the artwork's colour where the channel is inked, or, where the artwork shows nothing there, its name: blk → black; blue, navy, royal, red, pink, yellow, gold, orange, green, purple, brown, tan, grey, silver, maroon, teal, cream; a number → that Pantone.
- Ink is the smaller part of a plain channel, so white-on-black and black-on-white channels both work.
- The info line now says "(channel)" or "(selection)" for each extra channel.
- Tested on CMYK files built like the 8107A one (Transparency + blk + blue, both polarities): blue square and black square both show. Spot exports, Multichannel and CMYK files still open.

## 2026-10-26 — v37: comments on the line, discharge on bandanas
Stephen: "yes let's start [comments]...also we do discharge bandanas so need that as well to make sure we are calling that out on the mockup".
- **Comments** (step 2 of moving Art to do in), under the Art brief:
  - The line's Airtable comments, oldest first, newest last (the last 3, or Show all). Each shows the name and how long ago; @mentions show as names; screenshots posted from Line Item Review are links.
  - Post as you, with Notify chips (@Art Dept, @Chris …). ⌘/Ctrl+Enter posts. Signed "[Name] text" with @[usr…] mentions, the same as Line Item Review, so Airtable notifies the same way. It shows in Airtable's comments too.
  - "Who you are" and the people list are the same ones Line Item Review keeps (shared on this site). Defaults to Art Department.
  - Practice fakes the post.
- **Discharge on bandanas:** Underbase shows on bandanas again with **Auto / Off / Discharge** (still never a white or cream base). Auto picks Discharge when the Pantones say DC. Inks print as DC.
- **Called out on the proof:** the print heading reads "FRONT - 11075-A · DISCHARGE" (any garment). A bandana's page 1 adds "Print: Discharge" under its size; the details move up to fit.
- Tested with mocked Airtable (Playwright):
  - comments load, names, @mentions; posting sends `{"text":"[Art Department] Proof is up, hops bigger\n@[usrIie9QUerxvDqmi]"}` to the line's comments; box clears;
  - bandana base row shows Auto/Off/Discharge; proof page 1 shows Discharge;
  - v28–v36 regression tests pass.

## 2026-10-26 — v38: Drive both ways
Stephen: "can we upload to the drive from the app as well?"
- **⬆ Upload here** in the customer's-files panel puts files in the folder that's open (Client Provided, a subfolder, the order folder …). Or drop files on the panel; it gets a black outline. Dropping anywhere else still opens art.
  - Up to 25 MB each (the worker's limit), 3 at a time. The folder re-reads so they show.
  - Failures are listed under the panel.
- **⬇** on every file downloads it.
- **Attach proof to line** also saves the PDF in the order's Drive folder, as Line Item Review does: its Proofs subfolder (Proofs / Proof / For Proof), else the top of the order folder.
- The same worker routes as Line Item Review (drive/search, list, file, upload). Practice uploads nothing.
- Tested with a mocked worker:
  - download → logo.png;
  - 2 files uploaded to Client Provided (POST drive/upload?folder=CP) and shown after the re-read;
  - a tap still opens art;
  - attach → Airtable upload, then drive/upload?folder=PR with the proof PDF.

## 2026-10-26 — v39: discharge ink names
Stephen: "can we add a space after the number and DC also we can add DC to all colors when we select discharge".
- With Discharge, every ink on the art swatches and the proof chips gets " DC": 107 DC, BLK DC, WHT DC, Cool Gray 7 DC. An imprint Pantone written "286 OW" shows as 286 DC.
- On a white/cream base, numbers stay 107OW (no space); with no base, just 107. Base chips (BASE, EZ…, BB) are left as written.
- Tested: swatches read "≈ 107 DC / ≈ 1795 DC" with Discharge, 107OW with a white base, 107 with Off; v37/v38 tests pass.

## 2026-10-26 — v40: bandana colours from the Pantone sheet
Stephen (with "Blank Bandana Pantone Colors.pdf"): "Here are the closest pantones for the danas."
- The 23 blank bandana colours are now drawn in their closest Pantone from that sheet: B. Yellow 101, Ath. Gold 4008, Br. Orange 717, Orange 1655, Lt. Pink 1892, Red 200, Maroon 7428, Turquoise 2393, Lt. Blue 644, Silver 429, Charcoal 431, Khaki 467, Sand 875, Brown 476, Teal 322, Royal 293, Navy 4145, Lime 2287, Kelly 355, Olive 2410, Forest 3537, Hot Pink 219, Dark Purple 2597.
- The colours are the sheet's own swatch colours. 7 of these Pantones (4008, 1892, 2393, 4145, 2287, 2410, 3537) aren't in Pine's Pantone table yet.
- Colour names match loosely: "Hot Pink", "HOT PNK"…; Burnt/Bright Orange both → 717, Charcoal Grey → 431, Forest Green → 3537.
- Used on the mockup, Colourways, the colour chips in "Also show on", and the proof's close-up background. Page 1 says "Closest Pantone 200" under the bandana colour.
- Black, white, natural and hippie are unchanged.
- Note: Sand is now Pantone 875 (a brown), as on the sheet; it was a light tan before.
- Tested: Red bandana proof says "Closest Pantone 200"; the close-up is #c20430; v37–v39 tests pass.

## 2026-10-26 — v41: Find the art
Stephen: "can we also look into why 11087 reprint is only 6305 but it doesn't have any artwork in the client provided...so we need ideas for how to find folders with artwork" → "1-4 sounds great!".
- **Why 11087 came up empty:** its imprints reprint 6305-A…E, and 6305's Client Provided holds only an empty For Proof folder. The art is in 6305 › Seps (`6305-45LPI-Seps.ai`) and 6305 › Proofs (the proof PDFs). None of the imprints have a master folder.
- **🔎 Find the art** (a button next to This order / Reprint of in the customer's-files panel) looks everywhere at once:
  1. **The original order's whole folder.** Every subfolder two levels down (Client Provided, Seps, Proofs, For Proof …), not just Client Provided. Sep templates ("…template…") and Sales / Invoices / Embroidery / Old seps are skipped.
  2. **The original imprints' last proofs** from Airtable. Tap one to open it as the art, then Crop to the design.
  3. **This order's own folder**, then **the same customer's other orders**: Airtable › Customers › Orders, the newest 6, each searched in Drive.
  4. Inside each, files named with the order #, an imprint ID or the design's nickname come first, then anything in Seps, then newest.
- Groups show as "Reprint of #6305 · 6305 - Ascent Studio · Open in Drive ↗", with the folder path under each file. Tap to open in the mockup; ⬇ to download.
- A reprint's folder with no art shows "No art in this folder. 🔎 Find the art …" right there. The panel now shows for every order, with Find the art even when there's no reprint.
- Reads only (Drive search/list, Airtable Customers › Orders). Results are kept per order until Refresh.
- Tested with a mocked worker built like 11087/6305: proof 6305-A first; then 6305-45LPI-Seps.ai and the proof PDF (template and invoice skipped); then 11087's staffapparel1.jpg and the old logo in "unused previous art files"; then Ascent Studio #10797. Opening the proof puts it in as the art. The v38–v40 tests pass.

## 2026-10-26 — v42: stock bandana colours in the Colour list
Stephen: "now that we have the stock bandana colors can we make that a drop down on the mockup creator"
- For a bandana, step 3's Colour list now has every stock colour with its closest Pantone ("Hot Pink · 219", "Dark Purple · 2597"; Black, White, Natural, Hippie without one), under "Stock bandana colours" after the colours Pine has ordered. They also show in "Also show on" for Colourways.
- Picking one redraws the bandana in that Pantone's colour, and the proof says that colour name and "Closest Pantone …". The fabric content carries over. Airtable isn't changed.
- One list instead of two: the always-open colour box is now a small **Custom colour** button for anything not on the list. A custom colour doesn't claim a Pantone, and picking from the list again drops it.
- Tested (Playwright, mocked Airtable): 12/12 new checks; the v41 tests (Find the art, comments, discharge, upload) still pass.

## 2026-10-27 — v43: phone fixes (order bandanas, "Cap" in a colour name)
Stephen: "I am on mobile and the bandana is still a color wheel type of thing", then a phone screenshot of 11080-A.
- A bandana opened from an order now shows step 3's Colour list straight away: its own colour first, then the stock colours with Pantones. In v42 the list only appeared after searching for the garment, so an order's bandana showed just the colour box.
- 11080-A's Cotton Collective tee comes in "White Cap Off White". The word "Cap" made the app treat it as a hat (Kind: Hat / cap, 8.25″ across). The hat/beanie/tote guess now ignores the colour name and never fires for tees, hoodies, crews, polos or tanks.
- The long "Show the … colours" button wraps instead of running off a phone screen.
- Tested at 390px (Playwright, mocked Airtable): 11/11 new checks; the v41/v42 tests still pass.

## 2026-10-27 — v44: the page can't be wider than a phone
Stephen's phone screenshots (taken on v42) showed a cream strip down the right side and a top bar that stopped short. The page was wider than the screen, so the phone shrank everything to fit. Something on the real orders doesn't wrap (a long file name, comment or Art to do card), and the mocked data doesn't show it.
- On phones (≤900px) the panels are capped at the screen width, long words and buttons wrap, and anything still too wide is clipped instead of widening the page.
- Tested at 390px with an injected 700px-wide block, a long unbroken file name and a long button: the page stays 390px wide (v43 went to 778px). The v41–v43 tests still pass.

## 2026-10-27 — v45: Undo for Proof done → Review
Stephen tapped Proof done → Review by accident on 11084-A (Purple bandana). I unticked Awaiting Review by hand; the Slack had already gone. He asked for an Undo: "Yes let's add that".
- The tap now waits 10 seconds before anything is sent. The button turns into "Undo · 10" and counts down, and a bar says "Sending 11084-A to Review in 10 s" with its own Undo. Undo sends nothing, so there's no Slack.
- Moving to another line while it counts sends it, as tapped. Closing the page tries to send it. The app's self-update waits until it's done.
- A line already in Review shows "In Review ✓" instead of the button.
- Tested (Playwright, mocked Airtable, 390px): 13/13. Undo sends nothing (checked 9 s later). The countdown sends one PATCH. Leaving the line sends it. The v41–v44 tests still pass.

## 2026-10-27 — v46: Edit PDF (change an old mockup to the new job number)
Stephen: "can you also edit PDF files in the mockup app? I ask because sometimes a job is referenced and it only has a mockup that the art dept edits to the new job number".
- Open the old mockup or proof PDF as art (order folder, Find the art, last proofs, or a file). The art card then has **✎ Edit PDF**.
- **Change … To …** is filled in with the referenced order's number and this order's number. **Replace everywhere (n)** changes it on every page. "6305-B" becomes this line's imprint ID ("11080-A"), or keeps its letter when the line has more than one imprint.
- **Tap any word** to retype it.
- **Cover & type**: for text turned into outlines, drag a box over it and type. The box is filled with the colour around it, so a cream panel stays cream.
- The changes are written into the PDF itself with pdf-lib 1.17.1 (loaded only when the editor opens; cdnjs, then jsDelivr). The rest of the page stays vector and sharp, and a test proof came out at a few KB. New text is Helvetica (bold where the old text was bold), in the old text's size and colour.
- **⬇ Download** saves "11080 | old name.pdf" (the old number in the name is swapped). **Attach to 11080-A** uploads it as the line's proof, the same way as Attach proof to line (Airtable plus the order's Drive Proofs folder; "V2 " is added when the line already has a proof). Practice uploads nothing.
- Known limit: the old text is covered, not deleted. It doesn't show, but a text search of the PDF could still find "6305".
- Tested (Playwright, mocked Airtable): 15/15 on a 2-page test proof. That covers the numbers filled in, 3 places found, the replacements, a retyped word, Cover & type, the cream panel colour, the download name and size, and attach as "V2 …". The pdftoppm render of the saved PDF is clean. Fits a 390 px phone. The v41–v45 tests still pass.

## 2026-10-27 — v47: old proofs open in the editor first
Stephen opened 10125 | 1717-YM.pdf from Last proofs on 11089. v46 put it on the shirt straight away, so he asked: "how do I edit it before it places it on the shirt?"
- A PDF that's an old proof or mockup now opens in the PDF editor, not on the shirt. That covers names like "10125 | 1717-YM.pdf" or "V2 10125 | …", or anything with "proof" or "mockup" in the name, from Last proofs, the Drive folders or a file. Change the job number, then **Attach to 11089-B**. The shirt isn't involved.
- **Put on the shirt** (in the editor) places the PDF as the art, with your changes, for when you want to crop the design out of it.
- Other PDFs (art files) still go straight on the shirt, and **✎ Edit PDF** is still on the art card.
- Tested (Playwright, mocked Airtable): 20/20. The checks were:
  - an old proof opens in the editor and isn't put on the shirt;
  - "10125 | 1717-YM.pdf": replace all, then Put on the shirt carries the edits;
  - a plain art PDF still goes straight on the shirt.

  The v41–v46 tests still pass.

## 2026-10-27 — v48: take art off the shirt
Stephen: "can we also make it so we can delete something we added to the shirt instead of just being only able to upload a new file".
- **✕ Remove** next to Crop takes the print's art off the shirt. That's one file, or every file in a multi-file print. Each file in a multi-file print still has its own ✕, and references still have Remove.
- A bar says "Removed art.png from 11080-A · Undo" for 10 seconds. Undo puts it back exactly: crop, size, spot and colour changes. Nothing in Airtable changes. The art only lives in the app until a proof is attached.
- **PDF editor fits without scrolling** (Stephen: "can we also make this so you don't have to scroll in the pdf editor"). The page is sized to the room left after the controls, by height as well as width, so a landscape proof shows whole, and it refits when the window changes size. Before, it was sized to the width only, so a 3-page proof like 10125 | 1717-GR.pdf ran below the window.
- Tested (Playwright, mocked Airtable): 8/8. The checks were:
  - remove, then the drop box is back to "Open art for 11080-A" with nothing printed on the shirt;
  - Undo restores the art and its spot;
  - a 2-file print removes both, and Undo brings both back.

  Also: at 1440×900 and 1280×700 the editor and page don't scroll, and Attach stays on screen (22/22 with the v47 checks). The v41–v47 tests still pass.

## 2026-10-27 — v49: Pull the art out of an old proof
Stephen: "let's walk through when the sales references a past order so art dept can grab the art files from that PDF and put it maybe on a new garment. but the art is only in the mockup". Then: "all old proofs should be PDF made from illustrator files" and "yes to both builds".
- In the PDF editor (old proofs open there since v47), **Pull the art out** shows a tile for each piece of art on the proof's shirts:
  - **Drawn art:** the page is redrawn with every picture blanked out. pdf-lib swaps each image for a see-through dot, so the shirt photos vanish and only what's drawn on top is left, on a clear background. A flat page colour touching the edges is cleared too. The art is then cut out over each shirt. When the proof gives the width, the art is redrawn at 300 dpi for that width (up to 6000 px), so it stays sharp.
  - **Placed picture:** a picture placed on a shirt (PNG art in the Illustrator file) at its own full size. A picture is counted as a shirt when it's big (4%+ of the page) and solid. A picture with see-through parts counts as art.
- Each tile reads the proof's own label and width under that shirt, e.g. "BACK -10125-D" and "Width: 11"". It has a **Use for 11089-D · Back** button for each imprint, and the one whose location matches the label is dark.
- Tapping a button picks that imprint, puts the art on the new garment, and sets the width from the proof.
- If a page has no shirt photos (shirts drawn as vectors, or a flattened PDF), it says so and points to Put on the shirt + Crop.
- Read-only: nothing goes to Airtable or Drive until you attach a proof.
- Tested (Playwright, mocked Airtable) on a test proof built like the Illustrator ones: two shirt photos, vector back art, a placed PNG on the left chest, and Width labels. 8/8 passed:
  - both tiles were found and labelled;
  - each was matched to 11080-D Back and 11080-A Left Chest;
  - the back art had no shirt colour and came out 3292 px wide for 11″;
  - each landed on the right imprint at 11″ and 2.2″.

  The v41–v48 tests still pass.
- **Tested on a real proof:** 10125 | 1717-GR.pdf (Illustrator 30, two CMYK shirt photos, vector art). The left chest monogram came out clean at 645 px for 2.2″, and the back art at 3286 px for 11″, each matched to its imprint.
  - The real proof showed that Illustrator's shirt photos run past the clipped shirt, down to the labels. Two fixes came from that:
    - each region is cut off above that shirt's label;
    - only the biggest block of art is kept, so rule lines and stray labels drop out.

## 2026-10-27 — v50: bandana default
Stephen: "yes natural is direct to fabric" and "that works for the default for bandanas as long as we can edit it".
- **Auto** on a bandana now means **discharge** on a coloured bandana: inks read "186 DC" and the proof says DISCHARGE. On **Natural or White** it means **direct to fabric**, with plain Pantone numbers. This follows the sep study: about 86 of 99 coloured bandanas discharged, and 28 of 38 Natural printed direct. A DC on the imprint's Pantones still means discharge.
- **Off** and **Discharge** still change it per print. The hint says which one Auto picked and how to change it.
- Tested (Playwright, mocked Airtable): 5/5. Red with Auto gives discharge, Off gives direct, Natural with Auto gives direct, Natural can be set to Discharge, and Navy with Auto gives discharge. The v41–v49 tests still pass.

## 2026-10-27 — v51: sleeve prints show; bandana proofs pull as one piece
**Sleeves.** Stephen, on 10977-A, a Left Sleeve on an IND4000Z: "I added a left sleeve design....but it isn't showing up".
- Sleeve prints were left out of the drawing on purpose, because there were only Front and Back views.
- A sleeve imprint now gets its own **LEFT SLEEVE** / **RIGHT SLEEVE** view next to Front and Back:
  - the sleeve is drawn flat in the garment's colour: long (24″, with a cuff) on hoodies, crews and long sleeves, short (8.5″) on tees;
  - the art is at true size, 3″ down from the shoulder seam, and can be dragged like any other print;
  - there's no collar line.
- Sleeves get their own panel on the proof and on Colourways. The proof says "3″ below shoulder seam".

**Bandana proofs.** Stephen, on 11075 | 4800-HPP.pdf: "it makes the art 3 separate images....vs just the white and blue that I want".
- In those Illustrator proofs the bandana is itself a see-through picture, so it was being counted as art.
- Now the biggest picture that other art sits on is the garment. Only that picture is blanked (matched by its size), and everything on it (the white layer, the blue layer and any drawn art) comes out as one tile, in place.
- With one garment on the page, the page's "Width: 19.9″" is used, since on a bandana proof it sits beside the bandana.
- When the proof's pictures are coarse (about 26 ppi at 19.9″ here), the tile says so.
- Small blocks split off from the art are dropped only when they hold under 12% of the ink, so scattered motifs stay.
- Same code as Sep Maker v34.
- When a line has one imprint, its button is the dark (suggested) one.

**Tested** (Playwright, mocked Airtable):
- Sleeve, 5/5: an LS print on a zip hoodie shows in the Left Sleeve view, at 3″, draggable, with the right placement text.
- The real 11075 bandana proof gives 1 tile.
- The real 10125 proof still gives its 2 tiles.
- The v41–v50 tests still pass.
- **Fine print in the tiles** (Stephen's 11085 | 73051-MDN.pdf: the tiles came out as the proof's fine print). Illustrator clips its shirt photos to the shirt, but the photo's box can reach the fine print and the labels.
  - The proof is now drawn twice, with and without the photos. The pixels that change mark where the garment really shows, and only art inside that is kept.
  - On the real 11085 proof the result is the clean back art at 11″ and the left chest at 3.5″.
  - This also fixed the 10125 left chest, which had picked up extra again (back to 645×857).

## 2026-10-27 — v52: close-ups and specs for every garment; Colorways shows the back
Stephen: "in mockup creator can we also get close ups and specs for all the garments that share a design...and I noticed for the Colorways it is only the front print can we include the back as well if it does have one"
- **Colorways shows every printed side.** The proof's Colorways page drew only the first side (the front). Now each garment shows front and back (and sleeves when printed) side by side, each labelled FRONT / BACK / LEFT SLEEVE, with the colour name under the group. The page picks how many garments go across so the pictures are as big as they can be (3 garments × front + back → 2 across, 2 rows). The on-screen Colorways already drew every side; it now labels them too. Bandanas still get one view, unlabelled.
- **Specs and close-ups for every garment.** With "A page for each garment" on (the default), each garment that shares the design (the order's other lines and the "Also show on" ones) already had its own spec page (since v32). Now it also gets its own **close-up page**: every print on that garment's colour, front first, then back, then sleeves, side by side. Each shows its location and code, size and placement, and its own ink chips: that garment's recolours, OW on a dark garment, DC when it discharges, plain numbers on white or direct, and the base chip.
- **One close-up page per garment, not one per print per garment.** 3 garments × front + back is now 7 pages: 3 spec pages, Colorways, 3 close-up pages. One page per print per garment would be 10. Up to 3 prints share a page; a 4th starts a second page. Two garments whose close-ups would look exactly the same (same colour, inks, base and placement, e.g. Black in two styles) share one close-up page that names both. Each still gets its own spec page.
- With one garment, or "A page for each garment" off, the proof is as before: a close-up page per print on the garment you're working on.
- Code: `colourwaysPage` (all sides), `closeupPage` / `closeupDefs` (new), `proofDefs`, and `inkChips` / `drawChips`, split out of `drawInfo` so the spec and close-up pages label inks the same way. `asLine` is the J.line swap that `page1For` used.
- PDF size: 0.78 MB for 3 garments × front + back with photos (0.85 MB with photographic art), well under Airtable's 5 MB.
- Tested (Playwright, mocked Airtable and worker): 24/24.
  - Black / White / Red tees with front + back: Colorways shows FRONT and BACK for each, on screen and in the PDF.
  - The pages, their names and order are right.
  - The ink chips are right: OW + BASE WHT on Black, plain on White, and Red's own recolour.
  - Two identical Black garments share one close-up page, and the toggle off keeps the old pages.
  - Red + Natural bandanas: one view each, 186 DC / DISCHARGE on Red, plain 186 on Natural.
  - A zip hoodie with LC + LS + Back, plus "Also show on" Navy: FRONT / BACK / LEFT SLEEVE, and a 3-print close-up page each.

  The v41–v51 tests give the same results as on v51.

## 2026-10-27 — v53: the left panel, cleaned up
Stephen: "can we also have an agent scan the left scroll side for the mockup and separation app and offer suggestions for making it flow easier and smoother" … "let's build all of it". A review measured the panel at 2286 px with a job loaded, 2729 px with art and 3488 px while recolouring an ink, with Print width 1257–2403 px down. Every feature stays; things moved, merged, folded or got shorter.
- **Width and placement under the art.** Print width / height, where the width came from, below collar / off centre, the placement text and Same spot / Own spot now sit right under the art and its file buttons. They show once the print has art (before, the width box did nothing without art). "Art has a solid background — drop it" follows, with **"Everywhere, not just at the edges" directly under it**. Then the Drive files, the inks and the Photoshop layers.
- **"Change this ink" is a popover** under the swatch you tapped, not a block in the panel. On a phone (≤600 px) it's a bottom sheet. Click outside, ✕ or Esc closes it. Everything is in it: the "where it is in the art" preview, Recolour / Just rename, All garments / Only Black, the ink search and options, Merge into, Remove from the list, Erase, Back to the original, Reset all inks. "Removed from the list: … (put back)" stays in the panel so it can be found after the popover closes.
- **The job brief folds into the imprint tabs.** Each tab has a second line, e.g. "No inks · New art" or "Black, 186C · Repeat of 9447-F". What the tabs don't say stays in one block: "#11080 Test Brewing · Patrick · ASAP · Due Oct 30", pieces and sizes, a repeat's last proof ↗ / seps ↗ links, the nickname, Print / Ink notes, and the Proofing / Sales notes.
- **Comments are closed** behind "Comments (n)". They open by themselves, marked "new", when the line has a comment newer than this computer has seen. The last-seen time is kept per line in localStorage (`pine_mk_cmtseen_<line>`), and opening or posting marks them seen.
- **Garment is one line**, e.g. "Independent IND4000Z · Black · M · no vendor photo", with **Change**. Behind Change: search, size / body length, kind, width across, bandana size and custom colour, the garment note, Your photo, Fabric look. Outside it, always visible: "Also show on" (Colorways), "Showing … instead of the line's …", and the Colour list (for a bandana from an order it shows straight away, as since v43). With no order the search stays open.
- **File buttons in one row** (40 px at the 380 px panel, even with all five showing): + Add file · Reference · Crop · Edit PDF · ✕ Remove, with full titles and aria-labels.
- **Old proofs open straight to "Pull the art out"**, as in Sep Maker v35. A PDF that `isProofPdf` used to open the PDF editor. Now it shows the art tiles, each with its "Use for …" buttons (the matching one dark), plus page ‹ › for proofs with more than one page. The two other ways out are **Edit the PDF instead**, which opens the editor (Change / To, Replace everywhere, Cover & type, Attach to this line), and **Put the whole page on the shirt**. The yellow Attach only shows in the editor, never next to the tiles. ✎ Edit PDF on a PDF that's art still opens the editor.
- **Shorter hints:** "Other colours to show." and "Flat, straight-on photo.". "No order — just a garment" matches Sep Maker's "No order — just separating" (it pointed to a "step 3" you couldn't see). The empty screen says "or search a garment".
- **House style:** range sliders are black (`accent-color`), the "66% of the print" captions are 12px, and nothing in the panel is under 12px (checked in the test).
- **Phone (≤900 px):** the mockup comes first and stays pinned while you scroll the controls. Only its zoom bar and picture stay (the picture is 36% of the screen high, sized to fit). The view tabs and buttons scroll away. The Proof, Colorways and Art to do views come first but aren't pinned. `body` clips with `overflow-x:clip` (not `hidden`), so v44's "nothing wider than the screen" still holds and sticky works.

- **Download print art** (Stephen: "yes to download print art"). It sits next to Download PNG / Download PDF and isn't yellow. It saves each imprint that has art as a print-ready transparent PNG:
  - **The art only.** Crop, the dropped background, several files combined as they sit, and the ink changes for the garment on screen (`RECOL`). The recolour is redone at full size (`recolFull`), because the on-screen one is a 2400 px preview. No garment, no base preview, no opacity preview (opacity is how the mockup shows a weak discharge, not a change to the art).
  - **300 dpi at the print width.** An 11″ print is 3300 px wide, and 300 dpi is written into the PNG (a pHYs chunk, as in Sep Maker's `transparentPng`), so Illustrator and Photoshop open it at 11″.
  - **Smaller art** keeps its own pixels and real dpi, and the toast says e.g. "11089-A is only ~236 dpi at 11″ — the real art file is better". Art over 4000 px was shrunk to 4000 px when opened (since v17), so a very wide print can fall under 300 dpi. The toast then adds "(the app works at up to 4000 px)".
  - **Named** like `11089-B Back art 11in 300dpi.png`, with the colour added when that garment has its own inks. Several imprints download as one zip (`11089 1717 print art.zip`, JSZip 3.10.1 from cdnjs, loaded when needed). If the zip can't load, the files download one after another.
  - It's local only, so practice mode downloads too.

**Panel height** (Playwright, mocked order with 3 imprints and 2 comments; v52 → v53, comments already seen / unseen):

| | 1440×900 | 1280×720 | 390 (page) |
|---|---|---|---|
| Job loaded | 2360 → **1104** / 1340 | 2360 → 1104 / 1340 | 3224 → 1839 / 2074 |
| With art | 2804 → **1787** / 2023 | same | 3662 → 2541 / 2777 |
| Recolouring an ink | 3562 → **2192*** / 2428 | same | 4247 → 2449 (sheet) |
| Bandana with art | 2593 → 1953 / 2189 | same | 3405 → 2644 |
| Print width, from the panel top | 1703 (2477 recolouring) → **838** | same | — |
| Phone: preview starts at | — | — | 2722–3919 → **377–398**, then pinned |

\*The popover is laid over the panel. It only adds height where it runs past the panel's end.
No horizontal scroll at any size (scrollWidth = width).

**Tested** (Playwright, mocked Airtable, `scratchpad/mk53/t53.js`): 61/61 at 1440, 64/64 at 390 and 62/62 in practice mode at 1280. The tests cover:
- the tabs' second line, the compact brief, comments auto-open / closed / seen / post (practice posts nothing);
- the garment summary and Change, size in the summary, Also show on, the bandana Colour list with Change closed;
- width, below collar, placement text, own spot, and Everywhere under its box;
- the file row on one line with Edit PDF, ✕ Remove and its Undo;
- the popover anchored under its swatch (a bottom sheet on the phone) with every control, recolour to 286, scope, and Esc / outside click / ✕;
- the real 10125 proof opening to 2 tiles with no yellow, "Edit the PDF instead" reaching the editor (10125 → 11080), Use for 10977-B at 11″, and Put the whole page;
- no text under 12px, the slider colour, the phone pin, no overflow, and the 10 s Proof done Undo (nothing sent; it sends after 10 s; practice sends nothing).

**Print art** (`t53art.js`), 14/14 normal and 14/14 practice:
- an 11″ back from a 3600 px file gives 3300×1747 px with pHYs 300 dpi, transparent around the art;
- the yellow recoloured to 286 (3,51,156 against 0,51,160) and the red unchanged; the opacity preview isn't baked in;
- the left chest from a 2601 px file at 11″ keeps 2601 px at 236.45 dpi, with the warning toast;
- both imprints come in one zip, named with size and dpi.

**Regression copies** (`scratchpad/mk/*__v53.js`, from the `__v52` ones plus `t52`, `t52b`, `t52photo`) give the same counts as on v52:
- t44 12, t45 13, t48 8, t49_51 8, t49real 1, t50 5, t51s 5, t52 14, t52b 10, t52photo 14, t99 12;
- t47 21 and t48fit 23: the v52 count plus a new "opens to the tiles" check;
- t49_50_51 3 + 1 fail, the same failure as on v52 (the synthetic proof's left-chest picture);
- t75, t83, t90, t92 and t98 only print output. t75 and t98 match. t83 and t90 differ only in the brief, as intended. t92 differs only in the order of two uploads.

What changed in the copies: an old proof now opens to the tiles, so t47, t48fit and t49* wait for the tiles and then tap "Edit the PDF instead" (or skip "Pull the art out"). t99 opens Change before checking the bandana's Custom colour.

## 2026-10-27 · v54: a proof per line, Colorways optional, saved garment photos, tidying doubles
Stephen, after saving mockups: "they do need to each be assigned to there own line item...right now it sends everythign to one line item", then "oh I see...I need to click on the left side which one I am sending it to." Also: "can we also make colorways optional....it really is great for designs shared across a lot of garments not needed for a tee and hoodie", "when we upload garments to the mockup creator is there a way to store them in Airtable to use again later", and "I was clicking a lot and ended up putting in doubles of the mockups in teh folder....can we add a way to delete proofs in the folders or move them around".
- **The attach button names the line**: "Attach proof to 3001 Black", then "Attach again to …". No more guessing which line gets it.
- **Attach to all N** (plain button next to it, when 2+ garments share the design): each line gets its own proof PDF with its own page first and its own file name (`V2 11080 | 3001.pdf`, `11080 | 18500.pdf`), saved to Drive too. Proof done then reads "Proof done → Review (2)" and sends those lines together (one 10 s Undo).
  - Not done: jumping to the next line after Attach, because the next tap is usually Proof done on the same line.
- **Colorways page is a tick** under the proof tabs, next to "A page for each garment". On by itself for 3+ garments, off for 2; resets per order.
- **Saved garment photos** (Garments › front photo `fld8EBpE20bnCZtQj` / back photo `fld8sJrbNfnQGcb9p`, existing fields, no automation on Garments):
  - after Your photo › Front/Back, **Save to Airtable for next time** uploads the cleaned photo as `Pine mockup - <brand pn colour> - Front.jpg` and keeps only that one in the field;
  - if the field already has a photo it asks first (button turns into "Replace the photo in Airtable", second tap saves);
  - next time any line with that garment opens, the "Pine mockup" photo is used first (as your photo, with "Use the vendor photo" to switch); an older photo in the field is used only when the vendor has none;
  - read through the worker's Airtable-attachment route (`/proxy/pandadoc/file`), since attachment URLs don't allow cross-origin reads;
  - garments typed in by hand (not in the Garments table) say they can't be saved;
  - practice saves nothing.
- **Tidying doubles**:
  - Proof › "On 3001 Black": the line's proofs in Airtable, each with ✕; Undo (10 s) puts it back.
  - Customer's files: every file tile has ⋯ › Move to <the order folder / its folders> or Move to Drive trash, each with Undo. Drive keeps trash 30 days; nothing is deleted for good. Needs **worker v31**; an older worker says so.
- Tests: `scratchpad/mk54/t54.js` 37/37 (practice 36/36: no Airtable or Drive writes), plus the v53 suites on v54: t53 61/61, t53art 28/28.

## 2026-10-27 · v55: pick up where you left off; mockup-only art flagged; art baked into old proof photos
Stephen: "let's talk through a way to make quick ink color changes in mockup creator flow a little better....when I tried on one it was really just starting from stratch vs picking up where we left off" (changes "can be inks size and placements"), "do we have a way to flag a file that might be able to create a mockup with but is not print ready", and on the 6305 proof: "do you think this is because this mockup is old and the art file is not in these".
- **Pick up where you left off.**
  - What's kept for each imprint on the line:
    - the art file's own pixels, before crop and background drop, plus several files if the print is built from them;
    - the crop, the background drop, the width;
    - the spot, plus each garment's own spot and the placement text;
    - ink changes (merges, names, recolours), base, opacity, method;
    - the size shown.
  - **On this computer** (IndexedDB) a few seconds after each change. Practice keeps its own copy.
  - **In Drive** with every attached proof: `<order> <line> · <line id> · Mockup Maker setup.json` in the order's Proofs folder (data-URL PNGs, up to 24 MB). Older setups for that line go to the Drive trash (worker v31). Setup files are hidden from the Customer's files tiles.
  - Opening a line with no art loaded shows **Pick up where you left off — date · proof · imprints** (newer of this computer / Drive), with Pick up / Start fresh. Opening art yourself hides it. Ink changes come back because the same pixels scan to the same inks.
- **Print-ready check** (screen print):
  - vector .ai/.pdf → fine; an .ai/.pdf with a placed picture → **Low-res** ("check that picture's resolution");
  - rasters by dpi at the print width (the file's own pixels): under 150 → **Mockup only**; 150–249 → **Low-res**; JPEG noted.
  - The tag sits on the imprint tab; the reason sits under the width. **Flag for vectorizing ($40)** ticks the line's `[ART] $40 Vectorization` (`fldOwRyczEEoFrPHu`, no automation on it), with Undo. Practice fakes it.
- **Pull the art out, old proofs with the art in the shirt photo** (6305 | BC3001-TR-staff: three ~300 px shirt photos, white art baked in):
  - drawn art now only counts where it sits on the shirt fabric (the photo's own background, flooded from its edges, doesn't count), so the "100% COTTON" bar overlapping a photo's white margin is no longer offered as FRONT art;
  - a shirt with no drawn art gets its prints **cut out of the photo**: on the shirt, not shirt colour, grouped, shirt colour unmixed from the edges, outline pixels and faint shading ignored;
  - each "Width / Height" on the proof is matched to the print of the closest shape (FRONT 3.5×1.4 → ASCENT STUDIO, SLEEVE 3.25×3.25 → STAFF triangle, BACK 10×10). These come in at ~8–14 ppi, so they're tagged Mockup only.
  - 10125, 11075 and 11085 pull exactly as before.
- Tests:
  - new: `scratchpad/mk55/t55.js` 25/25 (practice 22/22);
  - earlier suites on v55: t53 61/61, t53art 28/28, t54 37/37 and 36/36 practice (its Drive count now expects the setup files too).

## 2026-10-27 · v56: Customer's files tidied, spacing scan, sleeve prints on the shirt
Stephen, with a screenshot of the Customer's files / Find the art area: "can we clean this up as well....maybe do another spacing scan for the mockup creator and the separation maker", then "and for the sleeve can we also put it on the actual mock up as well".
- **Customer's files:**
  - The heading is on one line, with small "⬆ Upload" and "Open in Drive ↗" beside it, and a line sets it off from the art controls above.
  - One compact row follows: "This order | Reprint #6305 | 🔎 Find the art". The order number is in the hover title.
  - Then the folder path, then the files. The "No Drive folder for #…" note has its own line (`#driveNote`).
- **Find the art:**
  - It no longer repeats its own name, and it hides Upload / Open in Drive because each group has its own link.
  - Headings: "Last proofs · tap one to edit it or use it", and "Reprint of #6305 · <folder> · Open in Drive ↗" on one line (the folder name is cut short with … if it's long).
- "Colours in the art · about 2 colours" is now "Colours · about 2", so it fits beside Combine similar ("Threads" for embroidery).
- **Spacing scan** (`scratchpad/mk56/scan.js`; 1440 / 1280 / 390; states: job, reprint folder, Find the art, art, garment open):
  - before: "Customer's files" wrapped, the Find heading wrapped, the source pills ran onto 2 rows, there was a 0px gap above the files, and "Colours in the art" wrapped;
  - after: none. The panel is 20–70px shorter.
  - The only flags left are on purpose: the folder name cut with …, and the Upload button and the link being different heights.
- **Sleeve prints on the shirt:** in the front view (mockup, proof page 1, colourways), a left or right sleeve print is also drawn on the shirt's own sleeve.
  - The wearer's left sleeve is on the right as you look. The print sits its inches below the shoulder seam along the sleeve, at true size, rotated with the sleeve and a little narrower as the sleeve turns away (×0.8; ×0.65 on long sleeves).
  - Positions are in the shirt-outline units, mapped onto the photo's garment box or the drawn stand-in. Long sleeves (hoodies, crews, L/S) hang down beside the body; the stand-in always has short sleeves.
  - Checked on Bella 3001 Ash and Independent AFX90UNZ Black photos. The flat sleeve view with the measurements stays.
- Tests: t53 61/61, t53art 28/28, t54 37/37, t55 25/25 on v56.

## 2026-10-27 · v57: the proof carries its ink callouts (for Sep Maker)
Stephen: "it would be great in the separation app a way to review the mockup to make sure it pulled the correct colors. I pulled a job in to test and it re colored it different than the mockup had called out".
- **Why it happened:** proof pages are pictures (canvas → JPEG in the PDF), so Sep Maker couldn't read what they called out. Sep Maker named its inks from the imprint's Pantone field, or by its own nearest-Pantone match, which can differ from Mockup Maker's, and never knows about recolours.
- **The change:** the proof PDF's Keywords now hold `PINE-INKS {json}`:
  - for each printed imprint: code, location, method, base, and the chips as printed (`BASE WHT`, `107OW`, `285OW`);
  - and `inks: [{art: scanned art colour, ink: the ink it became (recolours included), hex}]`.
  - Nothing visible changes.
- Tests: t54 37/37 and t55 25/25 on v57. A v57 proof with red → 285 recoloured reads back as `{art:#cc1c2c, ink:285}`.

## 2026-10-27 · v58: APPROVED box spaced out
Stephen, with a screenshot of the proof's sign-off box: "this is nerdy...but can we space this out better". "APPROVED" ran into the white box.
- APPROVED now has even room on the left (0.4 × the box height), then a clear gap, then the white box to initial, inset evenly. The text is measured, and it shrinks if it wouldn't fit in 60% of the box.
- Sep Maker v40's proof builder draws the same box.
- Tests: t54 37/37, t55 25/25 on v58.

## 2026-10-27 · v59: proof notes (the shop's disclaimers) as a drop-down
Stephen: "look up order 11084-A to see how we add disclaimers for certain things...can you have an agent scan a lot of mockups to try and find the few disclaimers and we can make it a drop down feature to add to the mockups that need it...I believe another one is thin lines".
- **The research:** an agent read about 1,220 proof PDFs in Drive (2024–2026, full-text search). The disclaimers are all-caps stamp lines per imprint. Most used: thin lines under 1 pt (3 current wordings), fine textures, upscaled to 300 dpi, and "EXPECT SEMI OPAQUE PRINT" with a SEMI-OPAQUE → FULLY-OPAQUE scale (11084; discharge on coloured 4800 bandanas). The full report, with counts and examples, is in this session's history.
- **2 · Art › "+ Add a note to the proof…"** (per imprint, once there's art). The 16 notes in the shop's own words:
  - thin lines (`ANY THIN LINE DETAILS <1 POINT MAY NOT PRINT`), fine textures, upscaled to 300 dpi, expect semi-opaque print (+ scale);
  - large ink coverage, registration marks enlarged, artwork modified, halftones, layering of inks;
  - low resolution, gradients, metallic, discharge chemistry, tag remnants, middle hat seam, sewout thread;
  - or "Your own note…" (typed, saved in caps).
  - "Suggested for this print" comes first: semi-opaque and discharge chemistry for discharge (semi-opaque on bandanas), low-res / upscaled when the art is tagged Low-res or Mockup only, sewout for embroidery, hat seam for hats, coverage for bandanas.
  - Chosen notes show as chips with ✕.
- **On the proof:**
  - page 1: left column, each imprint's notes under "LEFT CHEST - 10977-C" (bandanas: beside APPROVED);
  - detail page: left of APPROVED;
  - close-ups: under that print's ink chips.
  - Proof blue (#1a9ad6), bold caps. The semi-opaque scale is a grey-to-black bar labelled SEMI-OPAQUE / FULLY-OPAQUE, with a blue marker toward semi.
- Notes are kept with "Pick up where you left off".
- **Still to confirm with Stephen:** which thin-lines wording to use as the default. Garments use "ANY THIN LINE DETAILS <1 POINT MAY NOT PRINT"; bandanas mostly use "PLEASE NOTE: LINES & DETAILS SMALLER THAN 1PT MAY NOT PRINT".
- Tests: `scratchpad/mk56/notes.js` 5/5, plus t53 61/61, t54 37/37 and t55 25/25 on v59.

## 2026-10-27 · v60: embroidery worksheets (Wilcom) open as art; proof headings fit their column
Stephen, with Precision Logo_4IN.pdf in Edit PDF: "embroidery files are not pulling the art work correctly. can you look into how we might be able to make this work?". Then, on 11094 (left + right chest embroidery): "got some spacing with imprint ids showing up". And: "it places the pdf on the garment right away vs opening the editor first".
- **What a worksheet is:** a Wilcom EmbroideryStudio "Production Worksheet" (page 2 is the "Color Film"). The left panel is the stitched design at 1:1 on a flat grey (193) panel, as two ~300 dpi pictures. Beside it: Stitches, Width / Height in inches, Design, and the Stop Sequence (`1. 5 898 Red 5 Wilcom` = stop, needle, stitches, thread, code, brand).
  - Before: Pull the art out looked for shirt photos, so the whole page went onto the garment.
- **Now:**
  - opening one (drop, a Drive tile, or Pull the art out) is detected from its text ("Production Worksheet" / "Color Film" + "Wilcom" / "EmbroideryStudio") and goes straight to the tiles;
  - there's one tile: the design cut off its panel (border trimmed, the panel grey flooded away from the edges, including the soft grey shadow round the stitches), at the pictures' own resolution;
  - the tile shows the design name, stitches, Width, and "Threads: 898 Red · 668 Black · 1,220 White …".
  - **Use for …** puts it on the imprint at the worksheet width, sets the method to **Embroidery**, and sets the stitch count if the imprint has none. It names the scanned colours after the worksheet's threads (nearest by colour), so Thread Colors read RED / BLK / WHT.
- **Checked on three real worksheets** (Precision 3 colours, Restoration 4 colours, SPORTS 1 white):
  - Precision: 1219 px over 4.03″ = about 300 dpi;
  - all three cut out cleanly;
  - 10125 / 11085 / 6305 pull exactly as before.
- **Proof page 1 headings:** "EMBROIDERY · LEFT CHEST - 11094-A" ran into the next print's column. Each heading now fits its column: up to about 15% smaller, then the imprint ID on its own line, then smaller still.
- Tests: `scratchpad/wilcom/inapp.js` 3/3, notes 5/5, t53 61/61, t54 37/37, t55 25/25 on v60.

## 2026-10-27 · v61: Show distances on the proof
Stephen, with a client's polo proof marked up in red: "is there a way to toggle showing the distance for the prints....this client paticulary likes reviewing that....maybe we use how we are currently doing it for the toggle".
- **Proof › "Show distances"** is a tick beside "A page for each garment" / "Colorways page". It's off by default and lasts for the session.
- **Drawn on page 1's garments** in the art department's red (#d2232a), as thin lines with end ticks and the inches:
  - down from the collar line to the top of each print; for an off-centre print the line runs along its inside edge;
  - for an off-centre print, from the centre line to its inside edge (|offset| − half the width; e.g. 3.75 − 1.75 = 2″).
  - Sizes are set from the page (line 0.012″, text 0.1″), so they read on the PDF.
- Not on bandanas or accessories.
- Tests: wilcom 3/3, notes 5/5, t53 61/61, t54 37/37, t55 25/25 on v61.

## 2026-10-27 · v62: before/after slider on "Change this ink", fewer scrolls in the pop-ups
- **Before/after slider** (Stephen: "maybe a slider to show the original one and what we are changing...just to make sure we are changing the correct thing"). In Change this ink, the ink you're changing stays in colour and the rest goes grey; once it's recoloured, drag the slider (or drag on the picture) — original on the left ("Original"), the change on the right ("Changed").
- **Pull the art out:** up to 1400px wide (4 tiles across on a big screen), side-on tiles, short chips ("B · Back") under one "Use for" label, the "baked into this proof's shirt photo" note said once above the tiles, and only the tile list scrolls (the header and buttons stay put).
- **Edit PDF:** the "Tap any word…" hint shares the tools row, so the page gets more room.
- **Change this ink:** Merge inline, the four buttons in two short rows, a shorter colour list.

## 2026-10-27 · v63: Drive files show up on their own (shared pine-drive-watch.js)
Stephen: "yes let's add those update timers for the mockup maker and sep maker" (after Seps v50 got them — the art dept drops files in Drive by hand and wants them to show without reloading).
- The folders on screen are re-checked every 25 s while the tab is visible. A new file gets a yellow **New** tag (a re-saved one **Updated**) and goes first; folder tiles and the This order / Reprint tabs show "N new". Marks clear when you leave the folder, or after 30 min.
- "↻ Updated just now / 3 min ago" next to the folder path; tap it to check now.
- Our own uploads, attached proofs, setup files, exports and Save-as copies never show as New; a trashed or moved file doesn't come back from a check already on its way.
- Repaints only on a real change, keeps scroll, waits while someone is clicking, uploading or typing. No checks with the tab hidden or a dialog / menu open; checks at once on coming back. After 20 min with no mouse or keys, every 5 min instead. Errors back off up to 5 min. An order with no Drive folder is searched again every 2 min.
- **Refresh** updates in place and keeps the open order, garment, art and scroll.
- The timer code is one shared file, pine-drive-watch.js, so Line Item Review, Screens and Seps can use the same one later.
- About 290 worker requests an hour per open Mockup Maker tab (430 for Sep Maker); ~24–36 an hour when idle; none when hidden.

## 2026-10-27 · v64: the proof fits a laptop screen
Stephen (laptop screenshot, Proof view): "still have slight scrolling on my laptop". The proof page left a fixed 250 px for everything above it; on a laptop the buttons, the attached-proof chip, the page tabs and the tick boxes take ~400 px, so APPROVED and the colour chips fell below the screen.
- The proof page's height is now the room actually left under it (measured), re-fitted on resize and when the attached-proof chip appears.
- The page tabs and the three tick boxes share one row (they wrap on narrow laptops).
- Checked at 1920×1080, 1440×800, 1366×768 and 1280×720, with and without the attached-proof chip: the whole page is on screen, no scrolling.

## 2026-10-27 · v65: Pine's own inks in the search, a search that finds as you type, BASE on the proof
- **Pine's inks** (Stephen: "they should be named like EZP Cream or something like that a lot of those that have custom names and not a pantone number"). "Change this ink" now lists the Airtable Inks table first — named mixes as the shop says them (EZP Off White, EZP Light Cream, SOW Red Rum Red, Cream, Celestial Pearl …; EZP and SOW inks get the line in front), most printed first, then the Pantones under a "Pantone" label. The starting list is our 12 most-printed inks. Bases are left out.
- **Their colour:** Inks › Display Hex if it's set; else the Pantone it's built on (CG8, 7477 (ho), 573 TINT); else a starting guess for the common named ones (Cream, Off White, Pine Brown …); else striped "no colour yet". A named ink shows a colour row — **Save colour** writes the hex to that ink's Display Hex in Airtable (Stephen: "Yes...it should be an option in the ink table"; no automation watches the Inks table; Seps and Ink Queue already read that field). Practice mode doesn't save.
- **Search as you type** (Stephen: "make the search intuitive so when you start typing similar verbiage it start pulling in options"): words in any order ("white off"), part words ("cre", "off wh"), shop shorthand (CG8 / gray 8, WHT, CRM, BLK, grey/gray), and small typos ("craem", "perl").
- **Proof chips:** any base (1/2 BB, FULL BB, EZ WHT, WHT DC, BASE WHT/CRM) reads just **BASE**, once (Stephen: "let's just make the Base say Base since we decide internally if we need 2 bases etc...but the client doesn't need to know those options").

## 2026-10-27 · v66: the proof's print info looks like the shop's proofs; CRM shows
- Stephen, with an Illustrator proof (10125) beside ours (11089): "Can we try and match our current mockups closer....disregard the ezp white for the base on the og one". Now: no rule above the heading, a bigger heading, one rule under Placement, and colour chips as squares with the ink over its type (141 / OW, CRM / OW), bold caps, outlined only when the chip is light. On a base every top ink reads OW (CRM OW as on the shop's proofs); WHT / BLK stay as they are. The base still reads BASE.
- Fix (Stephen: "I added crm and it is not showing up on the proof"): v65 read "EZP Cream" as a base and folded it into BASE. Only underbases are BASE now (BB, EZ WHT, WHT DC); creams are colours.
- Typed on the imprint: any ink name in the Pantone field is kept (CRM, EZP Cream, Red Rum Red), not only numbers / WHT / BLK / CG; Black → BLK, White → WHT, Cream → CRM.

## 2026-10-28 · v67: a big .psd shows on a phone
Stephen (on mobile): "selected the .psd but nothing is showing up on the mockup". Phones (iPhone Safari) can't make a canvas over ~16 million pixels; a print-size PSD (e.g. 6000 × 7500) went blank with no error. A PSD over 4000 px a side is now read by our own reader straight at working size (every 2nd/3rd row and column — the same 4000 px cap everything already gets), keeping its transparency and real print size, and only the rows it needs are unpacked (a fraction of the memory). If a file still comes out empty, it says so instead of showing nothing. Tested with a 6000 × 7500 PSD under a simulated phone canvas limit (v66 hung; v67 shows it in ~2.5 s) plus the small RGB / CMYK / multichannel / 16-bit PSDs.

## 2026-10-28 · v68: a garment can have its own art for a shared imprint
Stephen, on 11095 (one imprint, 11095-A Bandana, on two bandana colours, with Ink-for-NAVY.psd and Ink-for-KHAKI.psd): "I have a slight design change between two colorways but it keeps applying only one to the mockup for both bandana colors". Art was kept per imprint, so the last file opened went on every garment with that imprint.
- Under the art, when the print is on 2+ garments: **Different art on <colour>**. Tick it on that garment, then open its file — only that garment uses it (mockup, Colorways, its proof page, its ink chips); the others keep the shared art. Untick to go back to the shared art.
- The saved setup (pick up where you left off) keeps a garment's own art as its own.

## 2026-10-28 · v69: WHT DC reads WHT DC, not BASE
Stephen, on 11095's white bandana: "when it is white the proof says base instead of white dc". v65 counted WHT DC with the underbases, so a discharge white went into the BASE chip. WHT DC is the white discharge ink — a colour; only underbases (1/4 BB, 1/2 BB, FULL BB, EZ WHT) read BASE. WHT DC is offered in the ink search again (with a white starting colour), at the top as the shop's most-printed ink.

## 2026-10-28 · v70: preview an art file before opening it
Stephen: "is there a way to preview art files before loading them? in the mockup creator". Each art tile in Customer's files has a 🔍 (under the ⬇): it shows Drive's preview big, with the file type, size and date; ‹ › (or the arrow keys) step through the other art in the folder; **Use this art** (the one yellow button) opens it, Close / Esc doesn't load anything. Nothing is downloaded until you choose it. Files Drive has no preview for say so. (The preview is Drive's 400 px picture — enough to tell files apart.)

## 2026-10-28 · v71: Colors from a sep's screens; sales' screen count; Colorways fits a laptop
**Why (Stephen):** "if I make a sep in the app and drop it into the maker will it be able to use the .psd channels that it creates instead of trying to guess again" ("please build away"), and "it doesn't pull in the screen count sales assigned to the imprint".

**Colors from the file's screens**
- Art whose spot channels are named like the shop's films gets its proof Colors from those names, not from colours read off the picture. This covers Sep Maker's -SEPS.psd, .ai and .pdf (158M-BB, 230M-186OW, 158M-BLKSOLID).
- How the names are read:
  - Bases (BB, EZWHT) become one BASE chip.
  - The mesh comes off.
  - A split black (BLK + BLKSOLID) is one BLK, and HLWHT is WHT.
  - Cool Gray 7 becomes CG 7.
  - OW follows the garment's base, as before.
- Order of priority: recolouring the art, then the file's screens, then the imprint's Pantone field, then the picture.
- The Colours box says "Colours from the file's screens: …". Art with no film names works as before.

**Sales' screen count**
- The Colours box now starts with "Sales quoted N screens" (Imprints › `fld8rgkIj1RPO97QU`, read only).
- Next to it is what the art needs: the sep's screen count, or the proof's colours + base. It says "more than quoted, check with sales" when the art needs more.
- If sales hasn't set it, it says so.

**Colorways** no longer scrolls on a laptop. The garment pictures are as tall as the screen allows (no scroll at 1280×720, 1366×768, 1440×900 or 1920×1080). Phones are unchanged.

Tested with Playwright and mocked Airtable/Drive: sep chips and screen count 9/9, preview 9/9, per-garment art 8/8, fit check at 4 sizes.

## 2026-10-28 · v72: open any artboard or layer of an .ai
**Why (Stephen, with a customer .ai):** "in an .ai file that was uploaded it also had the front text you helped me build... can you find a way for us to open this and be able to pull out other layers as well".

**How it works**
- An Illustrator file (or PDF) with more than one artboard or layer now opens a picker first. It is shared with the other app in `pine-ai-parts.js`.
- The picker shows a tile per artboard, cropped to its art with the art's size, a tick box per layer (all on to start), and a big preview.
- **Open this** brings in that artboard with those layers, cropped to the art at its real size. The file line then says which part it is ("From artboard 2").
- Esc or Cancel leaves the art that was open. Files with one artboard and one layer open as before.
- **+ Add file** can bring a second artboard in as another piece (tested: front text + magpies).

**Example:** the test file had 4 artboards on 2 layers: the full back, the front text strip (9.5 × 0.5″), the back text alone and the magpies alone. Each opens on its own.

Tested with Playwright and mocked Airtable/Drive on that file. The customer file stays out of the repo.

## 2026-10-28 · v73: a .psd's colours are its channels; garment photos fill their space; a PNG per colourway
**Why (Stephen):**
- "looks like when it brought in the .psd file in the mockup it pulled in more colors than in the file". This was on 11097-45LPI-SEPS_B-A.psd: the proof showed 7696 (not in the file) and missed 7458.
- "the uploaded garments had a pretty big white border....when that is removed can we make sure to max these out on the mockup".
- "each individual colorway downloadable on its own as a transparent .png".

**A .psd's colours are its channels**
- A .psd with ink channels lists exactly those inks. This covers spot channels, the shop's seps and Sep Maker's, and plain channels named like inks.
- The Colours box is built from the channels: each pixel goes to the nearest channel colour, so overlaps and soft edges are no longer extra colours. Channels of the same colour (BB and EZ7541) count once.
- Names come from the channel: 230M-7458OW → 7458, PANTONE 186 C → 186, White → WHT, and EZ7541 → 7541 (a light layer that shows).
- The proof's Colors use those names, whether or not they're named like films.
- 11097-B/A now gives BASE, BLK, 7541, 7458, 7742, 3015, 7687 (OW on the base garment).
- The count no longer says "about". Recolour and Combine work as before. Art with no ink channels is read off the picture as before.

**Garment photos fill their space**
- Mockup and Colorways now size the garment by the garment itself, not the whole photo; the proof already did. A photo with a wide white border went from 42% to 88% of its space.

**⬇ PNG per colourway**
- Each Colorways garment has a ⬇ PNG button: that garment's sides at 2× with a transparent background, named "<order> <garment>.png".
- The background is cut from the edges inward, so a white shirt on white keeps its body.

Tested with Playwright and mocked Airtable/Drive, on the 11097 sep, a Sep Maker sep and a plain PSD, plus the v70–v72 suites (preview, per-garment art, .ai picker, laptop fit).

## 2026-10-28 · v74: the Mockup picture takes the garment's shape
**Why (Stephen):** "the images still look small in v73 for the mockup". Re-uploading the LA Apparel 1801GD Charcoal photos didn't help.

**Cause:** the saved garment photos were already cropped (737 × 594, wider than tall). The Mockup canvas was always 1000 tall, so a wide tee filled its width, left empty bands above and below, and the whole picture was shrunk to fit the screen height.

**Fix:** the canvas is now as tall as the garment needs, plus the side name and the 1″ ruler (520–1000). At 1366×768 a wide tee went from 316×322 px on screen to 405×356 px and fills the picture's height. Photos with no garment box, bandanas and sleeves are unchanged.

Tested with Playwright and mocked Airtable/Drive, plus the v70–v73 suites.

## 2026-10-28 · v75: bigger garments on the proof
**Why (Stephen):** "the tees in the mockup up section are now larger....but the proofs are still small?"

**Cause:** on the proof, front and back sit side by side, so a wide tee (LA Apparel 1801GD is wider than tall) runs out of width long before it uses the height.

**Fix**
- When a garment is width-limited, front and back overlap by up to 30%, with the front on top, and grow toward the full height. Each garment is cut out of its photo's plain background so the overlap is clean.
- The garment area also runs a little wider (3.2–10.75″ instead of 3.3–10.65″).
- On a wide tee the garments came out about 25% bigger.
- **Overlap front & back** in the proof bar turns it off. It only shows when it makes a difference.
- The size and placement info blocks stay in their columns.

Tested with Playwright and mocked Airtable/Drive, plus the v70–v74 suites.

## 2026-10-28 · v76: the proof matches the art department's template
**Why (Stephen):** "can we also really scan how this pdf is setup...to adjust our proof templates to really match what we currently send" (ASC5001 Template.ai on Drive, 134 MB).

**Source:** the .ai is too big for the Drive connector, so I measured "0000 | ASC5001EC.pdf" (exported from it today) and proofs sent from it: 10941 | ASC5001-CM, 11068 | 5001-WH and 10951 | 5001-NY. All are Helvetica, with page 1 at 11 × 8.5″ and one 11 × 11″ page per print.

**Page 1** (inches from the top-left, sizes in pt)
- Logo 0.98″ square at 0.49 / 0.50. "Proof" bold 51.8 at 1.62 (baseline 1.11). "Order #:" 18 at 1.66 (baseline 1.45).
- Fine print 8 pt at 4.13″, 6.46″ wide, 0.135″ lines. "The Fine Print:" is bold and the first "mock-up" is italic.
- Left column at 0.50″: Garment 8 / brand bold 17.8 / style bold 53 / Colorway 8 / colour bold 14 / Fabric Content 8.
- Fabric bar: #D5CD8D, 1.99 × 0.24″ at 0.49 / 3.74, with 7 pt bold text centred.
- Garments: 2.56–10.92″ across, 1.78–6.16″ down, side by side (wide ones overlap, from v75).
- Info block under each garment, about 0.6″ left of its middle (4.11″ / 8.22″ on the template):
  - a 0.5 pt rule 1.32″ long at 6.38″
  - the heading in bold 10 pt
  - Width / Height in 8 pt (Height at +0.61″)
  - Placement in 8 pt, with the value in 7.5 pt at +0.62″
  - a rule at 7.05″
  - Colors in 8 pt
  - 0.29″ square chips 0.06″ apart: 8 pt bold, 7 pt for 4 characters, 6–6.5 pt over 2–3 lines, light ones outlined 1 pt
- Blue note 8 pt bold #00A0DF at 0.45″.
- APPROVED box 2.61 × 0.54″ at 0.45 / 7.52, with "APPROVED" bold 19.5 pt in white.

**Print pages (11 × 11″)**
- Logo 0.65″. Imprint ID bold 51.8 at 1.27″.
- Location: / Dimensions: bold 18 at 4.45″, values regular 18. Placement: at 7.24″ with its value under it.
- Garment colour block 0.5–10.5 × 1.64–9.72″, with the art centred (up to 6.9 × 6.8″).
- APPROVED centred at 4.19 / 9.97.

**Also:** the PDF now mixes page sizes. The proof font is Helvetica first (Helvetica Neue is wider and wrapped the fine print onto a sixth line).

**Kept on purpose:** our blue note says the print *is* shown to scale, because it is in this app. The template says "sizing is not to scale". Bandana proofs and the per-garment close-up pages are unchanged.

Tested with Playwright and mocked Airtable/Drive: page renders compared side by side with the template, PDF page sizes 11×8.5 + 11×11 ×2, and the v70–v75 suites.

## 2026-10-28 · v77: pull one piece out of a tech pack
**Why (Stephen, with SKI_TEE_TECKPACK.ai):** "let's also explore how to handle files like this".

**The file:** 3 artboards, each a big sheet (35–37″ wide):
- the HUCK front art with red dimension marks and the line "FRONT GRAPHIC SIZE 3.75”W X 2.6”H", next to the C6014 front schematic;
- the back art with its own marks and schematic;
- the colourway grid with ink swatches.

**What changed** (in the shared `pine-ai-parts.js`, used when the app asks for it):
- The picker outlines each separate piece on the artboard (ink with clear space round it), numbered. Tap one to open just that piece, or drag a box round any part. **Whole artboard** goes back.
- Only that part is drawn, at the artboard's real size and full resolution.
- A size line on the artboard is read and shown ("From the tech pack: FRONT GRAPHIC SIZE 3.75″ × 2.6″"). When the piece has that shape, it sets the print width.
- **Leave out the measurement marks** (on when the artboard has a size line) clears the strong red and cyan the marks are drawn in. Untick it if the art itself is that red.
- One huge artboard on its own (over 26″) opens the picker too.
- Older app versions using the shared file are unchanged: the pieces only appear when the app asks for them.

**Result on the ski tech pack:** artboard 1 → piece 2 opens as HUCK alone, one green ink (375), 3.75″ wide.

Tested with Playwright on the file (kept out of the repo): pieces, spec line, piece open, width, drag a box, Whole artboard. The Sanpo .ai picker tests were re-run on this version too.

## 2026-10-28 · v78: off-centre is measured to the print's edge everywhere
**Why (Stephen):** "why does it say 2.5" from center on the mockup and the proof has 0.6" from center".

**Cause:** the Off centre box and the Mockup label measured from the centre line to the print's centre. The proof's red line measures to the print's nearest edge, as the art department draws it and as tech packs give it ("PLACE 2.5" OVER FROM CF"). 2.5″ to the centre of a 3.75″ print is 0.6″ to its edge.

**Fix**
- On garments the box is now **Centre to print edge (in)**: + is wearer's left, − is wearer's right, 0 is centred.
- The Mockup label says "2.5″ from centre to edge, wearer's left", the same number the proof shows.
- The app still stores centre to centre, so saved placements keep the print in the same spot.
- An old 2.5″ now shows as its edge distance (0.63″). Retype the tech pack number if that's what was meant.
- Bandanas and hats/bags keep centre to centre, since their prints are placed by their middle.

Tested with Playwright and mocked Airtable/Drive: typing 2.5 stores 4.375 (3.75″ print), the proof line shows 2.5, and 0 centres. The v70–v77 suites pass.

## 2026-10-28 — v79: name, colour and fabric from the vendor
Stephen: "can we also check that the naming and fabric content are pulled from the vendor and compared against Airtable and will it still update Airtable if Airtable doesn't match the vendor description" … "looks like blossom pulled from the vendor and pepper from Airtable" … "but it should all be from the vendor and then have the option to update airtable with the vendor info".

- Before: the proof printed the Garments record as it was. Both 11099 proofs came from Airtable. The 6014 records disagree: about half say "100% Cotton" (Pepper) and half have the S&S line pasted in (Blossom, created 2026-10-28). Nothing was compared or written.
- Now every garment is looked up at its vendor: S&S, then SanMar (AS Colour first for AS Colour).
  - The lookup reads the brand, the style, the vendor's spelling of the colour and the fabric line (the description line with the fibre content).
  - The vendor's spelling of the colour is matched exactly first. Failing that it takes a near miss (Washed Demin → Washed Denim), then a single partial match (Lagoon Blue → Lagoon).
  - A colour with its own blend gets that blend with the style's weight. Examples: SanMar "98/2 cotton/poly (Ash)" gives PC54 Ash "5.4-ounce, 98/2 cotton/poly"; S&S "Heather colors are 52/48 …".
  - The proof uses the vendor's values. The brand stays Airtable's when it's the same brand spelled out (SanMar "Port & Co").
- Under the garment summary, one of these shows:
  - "✓ Name, colour and fabric match S&S".
  - Each difference (Airtable crossed out → vendor), with a tick box and "Update Airtable to match S&S". That PATCHes only the ticked text fields (Colour, Fabric Content, and Product Number if ticked) on that Garments record. Nothing is written on its own.
  - The style number is unticked by default, since other apps look garments up by it.
  - Brand is a pick list, so a different brand is only flagged.
  - Practice mode fakes the write.
- SanMar's productinfo answer is about 3 MB, so it's now fetched once per style and shared by the photos and the check.
- Tested with live S&S/SanMar answers and mocked Airtable: 6014 Pepper (fabric differs), 6014 Washed Demin (colour spelling) and PC54 Ash (own blend). The update writes one PATCH with just the fabric, and practice writes nothing. No automations watch the Garments table.

## 2026-10-28 — v80: a new line shows up, no "Could not load"
Stephen: "I am getting this when a new line item is added and need to manually refresh to get it to show up". The Line box said "Could not load: Cannot read properties of undefined" on #11097 after the Cement line was added.
- **Crash:** the Proof page drew an info block for every garment side, even a side with nothing printed on it yet (a new line, before its art). That threw, and since picking a line redraws the Proof, picking the order showed it as "Could not load". A side with nothing printed now gets no info block. (This was in v76–v79.)
- **Stale lines:** the open order kept the lines it had when it was first opened. Refresh re-read the order list but not the open order's lines, so only reloading the page brought a new line in. Now:
  - picking an order reads its lines fresh from Airtable;
  - Refresh re-reads the open order's lines and adds a new one in place ("New line on this order — added");
  - coming back to the tab after a minute away does the same;
  - Art to do opens a line the app hadn't seen yet (it used to do nothing).
- Tested with a mock of 11097 (Charcoal with a proof; Cement added after the order was opened): Cement shows after Refresh and on re-picking, its Proof page draws, and there are no page errors.

## 2026-10-28 — v81: proof spacing with two prints on one side
Stephen, with #11094's J317 proof (left chest + right chest embroidery, back heat transfer): "looks like we have some spacing issues with the last pdf update".
- **Cause:** with two prints on one side, the info blocks split the front garment's column starting at its left edge (2.7″). The first block ran under the blue notes and the APPROVED box, which end at 3.06″.
- **Fix:** info blocks now always start at 3.25″ or later, and two or more blocks share what's left of their garment's column. A single block keeps its old place, which was already clear.
- Checked on a mock with a left chest, right chest and back: nothing overlaps.

## 2026-10-28 — v82: clean art from the digitizer's stitch files
Stephen, with the Precision Security stitch render: "can we update the logic to pull a cleaner image when pulling out of the embroidery proofs we get from digitazing dept. all the text still has the background in it and it isn't super clean".
- **Before:** "drop the background" cleared only the background it could reach from the file's edges, with a hard cutoff. The background stayed inside letters (P, R, O…) and between close stitching, and every stitch edge kept a dark rim and drop shadow.
- **Now, for embroidery and patch imprints:**
  - The background colour is the median of the file's border.
  - Every flat patch of that colour goes, anywhere in the picture. Flat means the brightness varies less than 12 across 5×5 pixels; specks smaller than about 0.004% of the image stay.
  - Thread is never flat (stitches have texture), so black thread on a near-black background stays.
  - Within 4 px of the background, the rim fades out smoothly, with the background colour taken back out of the see-through edge, and the render's darker drop shadow goes.
- Screen-print art keeps the old edge-in drop.
- **Tested** on a made-up stitch render: dark #1b1e1f background, white textured letters with counters and drop shadows, a red hexagon with a white outline, and black textured thread inside. Counters cleared, black thread kept, no dark rim on a green background.

## 2026-10-28 — v83: true centre line + "Visual centre" note
Stephen: "can we add a visual center line that can toggle on and off...sometimes we need to align something visually and not the true center", then "it should just be a true center line and then I align the print manually to be where I want it and then can add a note visual center".
- **Centre line** (zoom bar) toggles a dashed line down the true centre of each garment, labelled "true centre". It's on screen only, not on proofs or colourway PNGs. Drag the print by eye as before.
- A new proof note under "+ Add a note to the proof…": **Visual centre (not true centre)**. On the proof it reads "PLEASE NOTE: PRINT IS PLACED ON THE VISUAL CENTER OF THE DESIGN, NOT THE TRUE CENTER OF THE GARMENT".
- A first try that let the line be dragged and snapped prints to it was dropped at Stephen's word.

## 2026-10-28 — v84: "Center"
Stephen: "can we make it say Center ( USA right! )".
- US spelling everywhere the app shows the word: the Center line button and its "true center" label, the Visual center note, Center (arrange pieces), "below/above center" and "of center" in the proof's placement text, "Down from center", "Center to print edge", "from center to edge" and the hints.
- Internal names and the tech-pack text matching (which reads both spellings) are unchanged.

## 2026-10-28 — v85: the center line, subtler and on the proof
Stephen: "the center line needs to be more subtle and show up also on the proof for the client".
- The line is now thin, faint and dashed: dark grey on light garments, faint white on dark ones (the app's dark-garment rule). It runs from just above the collar to the hem.
- On screen it has a small grey "center" label; the black/white bar label is gone.
- With Center line on, it's also drawn on the proof (page 1 and the Colorways page), with no label.
- Checked on a mock: screen and proof page 1.

## 2026-10-28 — v86: gentler off-center, and the art's visual center
Stephen, with a Sanpo back print at −0.25 "Center to print edge" pushed well off the middle: "these moves look extreme....is there a way to have it find the visual center and the true center?"
- **Cause:** v78 measured every garment print from the center line to the print's nearest edge. On a 13″ back print, the first ¼″ step jumped it half its width.
- **Fix:** only chest prints (Left/Right Chest, Pocket) measure to the edge now. Front, back and everything else are "Off center (in)" again, center to center, in ¼″ steps.
- **Visual center:** the balance point of the art's ink. Every printed pixel counts by how solid it is, measured on a copy at most 400 px wide, and the result is kept for each file.
  - Under the placement, front/back prints get **True center** (the art's middle on the center line) and **Visual center** (its balance point on the center line).
  - Visual center also adds the "Visual center" note to the proof, which can be removed with ✕.
  - A hint says how far apart the two are, e.g. "The ink's balance point is 0.4″ left of the art's middle".
  - With Center line on, the picked print shows its visual center as a faint dotted line.
- Checked on a mock: back print Off center, hint 0.4″, Visual center sets dx 0.4375 and adds the note; a left chest keeps "Center to print edge" and has no buttons.

## 2026-10-28 — v87: True center takes the Visual center note off
Stephen: "when I move it back to true center the text still is left. For instance the front is back to true center not visual".
- **True center**, or typing 0 in Off center, now removes the "Visual center" note from that print.
- Checked on a mock: Visual center puts dx at 0.4375 with 1 note; True center puts dx back to 0 with no notes.

## 2026-10-28 — v88: the Visual center note says how far
Stephen: "can it also include the slight move in inches as well on the proof so the customer knows we are taking it serious".
- The note is now written from where the print currently sits: `PLEASE NOTE: PRINT IS PLACED ON THE VISUAL CENTER OF THE DESIGN, 0.4" TO THE WEARER'S LEFT OF THE GARMENT'S TRUE CENTER`.
- The number uses the same rounding as the mockup's other measurements, and it follows the print if it's moved.
- On true center it falls back to the plain wording; v87 already takes the note off there.
- The sidebar shows the same text.

## 2026-10-28 — v89: Edit PDF follows the reprint links, not the letters
Stephen, on Lunar Outpost 11101: "it didn't match the new imprint ids that where assign to the locations… I had to switch the sleeve to C and the back to B. Looks like sales put them in backwards with the new order".
- Airtable was right. The two orders just number their locations in a different order:

  | Location | 10940 | 11101 (Previous Imprint) |
  |---|---|---|
  | Left Chest | A | A (from 10940-A) |
  | Left Sleeve | B | C (from 10940-B) |
  | Back | C | B (from 10940-C) |

- Edit PDF's "Replace everywhere" kept the letter (10940-B → 11101-B), which put the back's ID on the sleeve.
- Now each old ID becomes the new imprint linked to it as its Previous Imprint (10940-B → 11101-C, 10940-C → 11101-B). Only an old ID with no link keeps its letter, as before.
- The hint lists the new IDs with their locations and says when the letters changed on this order. That helps most on outlined PDFs, where the new text goes in with Cover & type.
- Tested: ORDER #: 10940 → 11101; 10940-A/B/C → 11101-A/C/B; an unlinked 10940-D → 11101-D.

## 2026-10-28 — v90: make a reprint's Drive folder; type the height
**Reprint folder.** Stephen: "when customer folder is [not] created yet in Google Drive but it is just a reprint....can we have it create one for that reprint and then have it match all the same folders etc and then drop this in the new proof section?"
- When the order has no folder yet, the Drive panel shows the original's ("No Drive folder for #11097 yet — showing the original order #10940"). It now offers **Make #11097's folder like #10940's**.
- That button uses worker v37 `drive/mkorder`. The new folder goes next to the original and is named like it, with the order number swapped ("10940 Lunar Outpost" → "11097 Lunar Outpost"). It gets the same folders inside, up to 3 levels deep, names only; no files are copied.
- The app then opens the new folder and saves its link as the order's Art folder (Orders `flddst7TDoJfSqb0s`).
- From then on, Attach (including an edited old proof's Attach) saves into its For Proof / Proofs folder, the same as any order.
- Practice mode makes nothing.

**Height.** Stephen: "can we also be able to adjust heights as well in the mockup maker". Height is now a box like Width. Typing it sets the width to keep the art's proportions, and it goes through the width box's code (pieces scale the same way).

**Tested with a mocked Drive:** the button shows on a reprint with no folder; it calls mkorder, writes the Art folder link, and the panel switches to the new folder. Height 4″ on a 3.5 × 2.15″ print gives 6.5″ wide.

## 2026-10-28 — v91: the inside of stitched letters
Stephen, with a "Security" stitch file whose "e" kept a grey patch: "it is still leaving in the inside portion of the pulled out text".
- **Cause:** v82 only took away flat patches of the background colour. That patch is a flat light grey (the render's backing showing through).
- **New rule:** when most of the picture is textured thread (over 60% of the non-background pixels vary by 12 or more across 5×5 pixels), a flat patch of any colour is background too. A patch counts when:
  - it is very flat (varies by less than 6);
  - it is between the speck size and 1.5% of the picture;
  - it is compact, filling at least 35% of its bounding box, so thin outlines and satin borders stay.

  It also takes the 2 px edge of the patch in the patch's own colour (within 45), with no further growth, so it can't run along the thread.
- Flat vector art for embroidery (mostly flat) is left alone.
- Tested on the made-up stitch render with grey patches added over the P and R counters: the patches and their edges are gone, while the white hexagon border, red fill, black thread and letters stay.
- Two tries on the way were too greedy (they took the flat white border, then nibbled letters along stitch shadows), which is what led to the compact-blob and 2 px limits.

## 2026-10-28 · v92: fixes from a review of v86–v91
Stephen: "Let's do a review of the last few mockup makers".
- **Wrong side on back prints (customer-facing).** The Visual center note and the on-screen label always treated a move to the viewer's right as the wearer's left. That's only true from the front. On a back view the viewer's right is the wearer's right. Both now use `wearerSide(im,dx)`.
- **Balanced art:** Visual center that moves less than 1/32" no longer adds a note that says "not the true center" for a print on true center. It shows "This art is balanced" instead.
- **Touch on the iPad:** a tap on the print used to re-round a 1/16" Visual center to the 1/4" grid. A drag now needs at least 1/8" before it moves the print. Dragging back to 0 removes the Visual center note (like the True center button).
- **Make the reprint's folder:**
  - Only one request runs at a time.
  - The new folder opens straight from the worker's answer, because Drive's search can lag behind a brand-new folder (that lag could bring the button back and allow a second folder).
  - Switching orders while it runs is safe.
  - If the Art link fails to save to Airtable, the message says so.
  - A null-order guard comes first.
- **Height:** an empty or 0 Height puts the box back.
- **Tested** (mocked Airtable and worker):
  - The back note reads "0.3" TO THE WEARER'S LEFT" for a print moved to the viewer's left.
  - A 1px touch keeps -0.3125, and a drag to center gives dx 0 with the note gone.
  - Balanced art: no note.
  - A double click makes one folder and one Art link write, and the new folder shows.
  - Practice mode: no folder and no write.
- **Not changed (worth knowing):**
  - `idMap` takes the first match when two new imprints point at the same old one.
  - The visual balance point is weighed by ink alpha, so fully opaque art (a JPG with Drop background off) always reads as balanced.
  - The stitch-file flat-patch rule leaves counters over 1.5% of the picture, and would remove a small flat solid patch of any colour (e.g. applique fabric rendered flat).

## 2026-10-28 · v93: lines added later; AS Colour back photos and colours
- **Lines added later** (Stephen: "still needing that hard refresh to pull in orders that had line items added later").
  - The cause: a line only shows once it has imprints, and the v80 check only noticed new line IDs. Sales often add the line first and link the imprints later, so nothing changed as far as the check could tell.
  - Now the check compares each line's imprints and garment too. It runs on Refresh, when you come back to the tab, and every 1½ minutes while the page is open. A change reloads the order and keeps the line you're on.
  - The line menu says "N more lines waiting for imprints in Airtable" instead of hiding them.
- **AS Colour back photos** (Stephen: "ASColour 5001 ... isn't pulling in the back image for the Ecru tee"). The variants list has no back photo at all. The back now comes from `/catalog/products/<style>/images`, using the entry whose imageType is "<COLOUR> - BACK" (urlZoom).
- **AS Colour colours past page 1.** Variants come 250 to a page, and the 5001 has 569, so only about 33 of 70+ colours (up to roughly Granite) were read. Natural, Navy, White and the rest got no AS Colour photo or colour match. `ascVariants()` reads every page (cached per style). It's used for photos, the vendor colour list and the vendor name/colour check.
- **Careful:** AS Colour rate-limits hard. A fast scan from here got 429 ("try again in 27 seconds"), and the app then falls back to S&S photos. Keep any bulk scans slow.
- **Sep Maker v52 has the same one-page limit** (not changed yet).

## 2026-10-28 · v94: AS Colour fronts from the images list too
Stephen: "looks like it is on the 5071 as well...so maybe we scan all of ASColour".
- **The scan:** I checked Pine's 60 most-used AS Colour styles slowly (124 calls, waiting out each 429).
  - 47 styles: every colour gets front and back with v93.
  - 2 styles had more than 250 variants (5001, 5026). v93 fixed those.
  - 7 codes in Airtable are unknown to AS Colour: 5101 5130 5121 4069 1121 1111 1118 (old or renamed styles).
  - Caps and bags (1001, 1107, 1120, 1125) have no back photos. That's expected.
  - 5082 Faded Mushroom and 5080 Eucalyptus have no back photo at AS Colour at all.
- **Some colours have no front in the variants list** (5071 Espresso, Liberty, Pigeon Blue, Shadow; 5026 Espresso, Pigeon Blue; the faded colours on 5082, 5086 and 5166; several caps). The images list has them, labelled with the colour name. v94 takes the front from there too (`ascImages()`, cached and paged).
- **Tested on real data:** 5001 Ecru/Natural, 5071 Espresso/Shadow/Black, 5082 Faded Olive and 5026 Pigeon Blue all get front and back. A made-up colour still gives none.

## 2026-10-28 · v95: AS Colour photos from the images list first
Stephen: "5071 ecru ... nope still not loading".
- The variants list's front photo for 5071 Ecru (`…/17683/5071_CLASSIC_LS_ECRU__94154.1753147192…`) is a stale link that returns 404. The images list has the current one (`…/24547/…1792365285…`).
- Now the images list ("ECRU" / "ECRU - BACK", exact colour name) comes first for both sides. The variant's photo is only a fallback, and a fuzzy colour match is only used when the variant has nothing.
- **Lesson:** the v94 scan checked that a link existed, not that it loaded.
- Tested through the full order flow (real AS Colour data, through the worker's /img): 5071 Ecru front and back both load. The other colours tested before still work.

## 2026-10-29 · v96: pipeline links (Art to do ↔ Line Item Review)
Stephen: "let me explore the pipeline links but if you think it will make these better then let's go".
- **Changes asked on Art to do.** Before, Art to do only listed lines with no proof, or a proof not yet sent to Review. A line in Review where someone asked for a change never came back.
  - Now a line in Review with an open request shows too, tagged "Changes asked", with who asked and the request (shortened; the full text is in the tooltip and in Comments on the line).
  - The rule is Line Item Review v45's "Changes requested", copied as is (`REQ_RE`, `OK_RE`, `isRequest`, `changesReq`, in one marked block). It looks for the newest request-like comment after the newest proof (Proof Images Timestamp) and after Changes Resolved At. "Looks good!" doesn't count, and Mark resolved in Line Item Review clears it. Lines that are Ready to send (Quality and Pricing approved) are left out. **If Line Item Review changes this rule, change both.**
  - Attaching a new proof answers the request, because the proof time moves on and the line drops off again.
  - Lines Line Item Review v46 sends back (by unticking Awaiting Review) show as before, and get the tag too if there's a request.
- **Comments: which ones are read.** Airtable has no "last comment" field, so it takes one call per line. Only lines that have a proof on orders awaiting proof are read (in Review or sent back, not Ready to send). That's the same set Line Item Review's Review tab reads. They're read 4 at a time after the list shows, and again on Refresh. Lines with no proof can't have an open request, so they're never read.
- **"Review in Line Item Review ↗"** sits next to Proof done once the line is in Review (straight after Proof done, or already in Review). It opens `pine-line-item-review.html?order=<num>&line=<record id>` (plus `practice=1` in practice), which Line Item Review v45 already reads. It's hidden for orders that aren't awaiting proof, because Line Item Review only lists those.
- **`?order=` for any status.** An order that isn't in the Awaiting Proof list is fetched by number and opened. It's added to the order menu with its status ("#11050 · Sanpo Studios · Scheduled") and stays there through Refresh. It is never put on Art to do.
- Tested with mocked Airtable and comments:
  - A request comment shows the tag and text, and "Looks good!" doesn't.
  - A Changes Resolved At later than the comment hides it.
  - `?order=` opens a Scheduled order on the line asked for.
  - The link URL is right, with practice=1 in practice.
  - Practice mode makes no writes, and there are no native dialogs.

## 2026-10-29 · Planned (v97): embroidery proof layout + sew-out box
Stephen sent 10876 | VC300Y-NY-BERKELEY.pdf as the embroidery template: "the bottom right box is blank until quality approve is then we send it to digitizing and once we get back the sew out we will update the proof and add the close up of the sew out to that bottom right box". Ignore its youth and hat-seam warnings.
- **Layout to match the template:**
  - EMBROIDERY / Width · Height / Placement and THREAD COLORS chips go on the left, under Colorway.
  - Notes in pink, not the screen-print blue.
  - Hats read "Placement: FRONT" (the location name), not inches below the neck.
  - The bottom right has a box labelled with the imprint ID (10876-A).
- **Sew-out box:**
  - Blank until the sew-out comes back. Stephen: "yes blank until sew out".
  - Several embroidery spots on one garment get one box each, side by side. Stephen: "Yes to multiple embroidery locations".
  - "Add sew-out" on the imprint: drop in the photo, crop it to the box, and the proof is rebuilt as the next version.
- **Open question:** which file in the digitizing folder (e.g. `11100-A/11100A-FRISCO.DST/.EMB/.JPG/.PNG`) is the sew-out close-up, the .JPG or the .PNG? Stephen checks tomorrow. After that, Mockup Maker can find it in Drive automatically.

## 2026-10-29 · v97: embroidery proof layout + sew-out box
Stephen sent 10876 | VC300Y-NY-BERKELEY.pdf as the embroidery template: "the bottom right box is blank until quality approve is then we send it to digitizing and once we get back the sew out we will update the proof and add the close up of the sew out to that bottom right box". Then: "Yes to multiple embroidery locations", "yes blank until sew out".
- **Page 1 with embroidery** (any imprint whose method is Embroidery) now follows the template, measured off the PDF:
  - The info blocks sit on the left under Colorway / Fabric Content: hairline, **EMBROIDERY** and the location + imprint ID ("FRONT - 10876-A"), Width / Height, Placement, hairline, **THREAD COLORS** and the chips. Several imprints stack, each labelled. They shrink (down to 60 %) when they don't fit above APPROVED, and all use the same heading style.
  - The garment moves right and ends a little higher, to leave room for the sew-out boxes.
  - Notes are in the template's pink (#FF0049, sampled from the PDF), 10.5 pt, under the blocks. If they don't fit there, they go in the strip under the garment. Embroidery notes are pink on the print pages too.
  - Hats and beanies read "Placement: FRONT" (the imprint's location; with any offset after it). "Placement text on the proof" still overrides it.
  - The "PRINT SIZE IS SHOWN TO SCALE" note isn't on embroidery proofs (the template doesn't have it). The "THREAD COLOR ON PHYSICAL SEWOUT…" note appears once a sew-out photo is on the proof, unless an imprint already has it as a note.
  - Patches and heat transfers keep the screen print layout.
  - **Screen print proofs are unchanged.** Checked pixel for pixel against v96 on a tee (front + back, with a note), a screen-printed cap and a hoodie (2 chest prints). Every proof page was identical.
- **Sew-out box:** one per embroidery imprint at the bottom right, its ID above it. One imprint gets the template's 4.6 × 2″ box; several sit side by side and share the width. It's a thin outline until the sew-out is added.
- **Add sew-out** (Art section of an embroidery imprint, under the notes). Choose a file, drop it on the box, paste it, or pick it in the Drive panel, the same way as Reference. Drag the photo to position it and use Zoom to get in close; the proof shows the same crop. Replace and ✕ Remove sew-out (with Undo).
  - It's kept per imprint and line. Another garment with the same imprint uses it too, until it gets its own.
  - It's saved with the line's setup (`sew` in setup.json: a JPEG, at most 2000 px, plus the crop). Pick up where you left off brings it back.
- **Art to do on a phone** (Stephen, iPhone screenshot: "This is still happening on mobile"). The garment text was squeezed to a letter per line, because the IDs kept 150px and the status pill didn't wrap.
  - Now the IDs and the pill are on the first row and the garment (and any request) is below at full width. The search box gets more room too.
  - Row text was iOS-button blue. Buttons now default to Pine black: an element rule, so every class colour still wins. This also covers the method / Drive source toggles and the @mention buttons. On desktop the only change is #000 → Pine black #141412.
- Tested with mocked Airtable (Playwright):
  - A cap with one embroidery imprint: blank box, then a sew-out added, dragged and zoomed.
  - Two embroidery imprints on a cap (front + back) and on a hoodie (two chests), with notes.
  - A sew-out added by dropping it, and by picking it as if from Drive.
  - Pick up after a reload (and through the Drive JSON) restores the sew-out and crop.
  - Practice mode: attach and Proof done made no writes.
  - The phone Art to do at 390 × 844.
- **Still open:** which file in the digitizing folder is the sew-out close-up (.JPG or .PNG). Once Stephen confirms, Mockup Maker can offer it from Drive automatically.

## 2026-10-29 — v98
Stephen (iPhone screenshot, editing "Off center"): "Mobile get funky when trying to make changes." · "on laptop can you review the ink and or garment change color. It feels super tight to see".

- **Phone, typing in a field.** The pinned mockup plus a two-row zoom bar took ~40% of the screen, and the field being edited could sit under it. Now:
  - While a field in the controls is focused, the pinned mockup shrinks to a strip (30% of the height the keyboard leaves, the whole garment still shown) and the zoom bar is hidden.
  - The field and its label are scrolled to just under the strip, with the next fields below. The page also keeps a scroll padding the height of the pinned block, so iOS's ⌃ ⌄ arrows and other scrolls don't hide things under it.
  - Zoom bar on a phone is one row: − 1× + Fit · To print · Center (Center is a toggle chip on the right).
- **Number pad.** Number fields have `inputmode="decimal"`: iOS shows the number pad, not the full symbols keyboard. The pad has no minus key, so Off center / Center to print edge (and Down from center on bandanas and flat items) have a **±** button. On a non-zero value ± flips the sign; on 0 or empty it turns black (−) and the next number typed is negative. ± keeps the keyboard up. It's hidden on a mouse/trackpad, where "-" can be typed. The fields stay `type="number"` so the values, steps and arrow keys behave as before.
- **Keyboard no longer drops.** Every change rebuilt the placement rows, so the field being typed in was replaced, the keyboard closed, and the ⌃ ⌄ arrows landed nowhere. Now the rows are only rebuilt when they actually change; otherwise just the numbers are updated in place.
- **Laptop: ink and garment colours.**
  - The left column is wider on a laptop (up to 470px, was 380px).
  - While "Change this ink" is open it widens to up to 640px. The panel shows inks as a grid of 38px swatches with full names (14px), a taller before/after, and the two toggles side by side.
  - It has a yellow **Done** that stays in view. "Attach proof" turns white while the panel is open, so there's one yellow button.
  - "Also show on" garment colours use the same grid and get a taller list. The Colour list (after picking a style) shows open, 10 rows, instead of a closed menu.
  - What the buttons do is unchanged.
- The proof is unchanged: page 1 is pixel-identical to v97 for a screen-printed hoodie (front + back) and an embroidered cap.
- Tested with mocked Airtable (Playwright):
  - iPhone 390 × 844 with touch. Focused Off center, Print width and Below collar, then shrank the viewport to 390 × 420 for the keyboard. Each field and its label were fully visible under the strip and not covered.
  - ± flips the value, and ± on 0 then typing 1 gives −1. The field keeps focus and isn't rebuilt.
  - Ink and garment colour panels at 1440 × 900 and 1280 × 800, before and after.
  - Practice mode: recolour, attach and Proof done made no writes. No native dialogs.

## 2026-10-29 · v99: seps from Sep Maker
**Why (Stephen):** "let's actually have it start in the sep and then go into mockup maker that way we are making the mockup with a more accurate print setup". Screen print only for now ("For now that makes sense"); embroidery and transfers still start here. "No real rules yet....just working through flow right now", so nothing is gated: the two apps link and hand off.

- **`&imprint=<record id>`** in the link opens that imprint after the order and line (Sep Maker v54's "Make the mockup ↗" opens `mockup.html?order=…&line=…&imprint=…`).
- **Seps from Sep Maker.** A screen-print imprint with no art, whose order has a Sep Maker setup for it, shows: "**Seps from Sep Maker** — Oct 29 2:53 PM · 11097-A · 5 screens: 1/4BB, EZWHT, 186OW, 2756, BLK · 15.4″ wide · **Use the seps** / Not now".
  - Found in the order's Seps folder (or the order folder): the newest "<order> <imprint> · Sep Maker setup.json" for that imprint code, and its imprint record id must match. A copy saved on this computer by Sep Maker counts too (that's how practice works). Setup files are hidden from the file tiles.
  - With a "Pick up where you left off" too, the newer one is on top and the other says "(older)"; both can be used.
- **Use the seps** lays each film in its ink in print order (as a separated .psd's spot channels are laid in), at the setup's width. The art's inks are the films (the v73 path for a .psd's channels), so:
  - the proof's Colors read as the films: BASE, 186OW, 2756, BLK (a film printed direct stays plain, e.g. 2756, even on a base);
  - Underbase follows the films: a BB / EZ film → White (EZCRM only → Cream); DC films and no base → Discharge; otherwise Off;
  - Quick adjust works as for any art: recolouring 186OW to 286 shows 286OW on the proof (the OW/DC of the film is kept).
- Embroidery, patches and heat transfers: unchanged (no offer).
- **The proof from normal art is unchanged:** page 1 is pixel-identical to v98 for a tee with a front print (+ note) and a back print.
- Tested with Playwright, mocked Airtable and an in-memory Drive shared with Sep Maker v54 (the upload from Sep Maker is what Mockup Maker lists and downloads): banner, Use the seps (inks, width, base, chips), recolour, the newer-first order with a pick-up, no offer on embroidery; practice: no writes in either app; no native dialogs.

## 2026-10-29 · v100: CMYK seps, .psd layer picker, Attach replaces older proofs
**CMYK seps from Sep Maker v56** (Stephen, in Sep Maker: "can it also have a CMYK feature for the sep along with the other options of spot index and simulated process")
- v99's Use the seps laid each film over the ones before it, so a CMYK sep looked wrong (magenta covered yellow). Films marked `blend:"multiply"` now overprint: ink colour × what's under them (the base, the process inks before them), the same maths as Sep Maker's own preview. Base and highlight white stay opaque, and the base rules are as before.
- Checked against Sep Maker's preview PNG in the setup (an RGB photo on a black tee: base + Y M C K). The mean difference is 0.2/255 over black and over white. v99 was 17.9/255, with 11.6% of pixels clearly off.
- **Proof chips:** BASE, then **Y, M, C, K** in print order, under the heading "Colors · CMYK process". "PROCESS MAGENTA" won't fit a 0.29″ chip above 4.5 pt. A letter on the ink's own colour reads at the chip's normal 8 pt, and the heading says once what the letters are. The full film names (PROCESS CYAN …) stay in the data, the Colours list and the panels.
- **No recolouring of a process ink.** Every colour in the print is a mix of all four, so changing or erasing one ink makes no sense. Tapping one says so: "One of the four CMYK process inks … change the art in Sep Maker and use the new seps". The base white still works as before.
- A pick-up keeps the film chips: `fromSeps` / `cmyk` are now saved with the art.
- **Spot seps are unchanged.** The art is pixel-identical to v99, with the same chips and the same page 1.

**.psd layer picker** (ported from Sep Maker v55. Stephen: "I have a file where the artist added white back in and it looks like the BG might be pulling all of it out")
- A flattened .psd with no transparency came in with "Art has a solid background — drop it" ticked. White in the design that touched the background vanished with it.
- Now a .psd with 2+ pixel layers (CMYK too: the layer pixels are read here) opens the picker. Each layer and group has a tick box and a thumbnail, and a big preview shows the ticked layers on the garment colour.
  - Background, hidden layers and template / marks layers start unticked.
  - **Open this** makes see-through art from the ticked layers, and **drop background is not ticked**.
  - "Change the layers…" (under the art) opens it again. Cancel keeps the layers as they were.
- Test file (CMYK: Background, Red, Black, White text): 63,528 white text pixels kept. v99 kept 28,719, after its auto drop.
- Unchanged:
  - sep .psd files (ink channels, v73), including Sep Maker's -SEPS.psd;
  - one-layer files (identical to v99);
  - sew-out and reference pictures (no picker).
- Phones: the picker is only offered for files up to 12 MP (v67 memory).
- The code is marked as a shared-file candidate (the same as Sep Maker v55's).

**Attach replaces the older proofs** (Stephen: "looks like the lastest mockup maker when saving to Airtable keeps the other ones instead of removing them")
- uploadAttachment adds to Proof Images. After the upload, the line's Proof Images is now set to only the new proof (PATCH `[{id}]`). This applies to Attach, Attach to all lines and Edit PDF › Attach.
- The toast says "replaced N older proofs", with **Undo** for 10 s, which PATCHes the full list back (ids, original order). Attach to all lines has one toast and one Undo.
- Drive copies are untouched. Practice writes nothing, and the toast says what would be replaced.
- The V number on the next proof now comes from the newest proof's name (V3 → V4), not the count of proofs, which is now 1.
- Line Item Review gathers every proof on the line for the packet, so old proofs no longer go in. Signed pages map by filename|size of the current proofs, so this still works for packets built after the attach. A packet sent before a re-attach maps to proofs that are no longer on the line.
- The PATCH also moves Proof Images Timestamp (as the upload already did), so an Undo counts as a new proof for "Changes asked".

**Zoom → Fit:** the Sep Maker bug doesn't happen here. At 1440×900 and 1280×800, zoomed 5× or 8× (buttons or ctrl-wheel) and scrolled, Fit shows the whole garment in the first frame and it stays. Nothing changed.

Tested with Playwright, mocked Airtable and a shared in-memory Drive:
- Sep Maker v56 → setup → Mockup Maker (CMYK and spot) 15/15.
- .psd picker, flattened / sep .psd and normal proofs identical to v99, practice 16/16.
- Attach replace / Undo / batch / practice 16/16.
- Zoom → Fit 6/6.
- No native dialogs.

## 2026-10-29 · layer picker (pine-ai-parts.js): layers start as the artist left them
Stephen: "this is a PDF and it says it should have artwork...but it is just a giant white square" (22x22-Digital-Bandana_maroon.pdf).
The file has a hidden "Layer 1" that is a white sheet over the whole design. The picker ticked every layer, so that sheet covered the art.
Now each layer starts ticked or unticked the way it was saved in the file, and hidden ones say "(hidden in file)" so they can still be turned on.
Shared file, so Mockup Maker and Sep Maker both get it straight away (no new version numbers).
- Same day, follow-up: Stephen unticked "DO NOT PRINT - Fabric Base Color" to get rid of the maroon, and everything went. In this file the whole design (maroon and cream) is on that layer; the "ARTWORK" layer is empty. When nothing shows and a layer is unticked, the picker now says the art is on an unticked layer and points to "drop the background" (Everywhere), which takes the maroon out and keeps the cream.

## 2026-10-29 · v101: drop a solid background in the .ai / PDF picker, cropped to the print
Stephen: "would it be better to have that before open this as well....would it be able to autocrop to the actual print that I am uploading....right now ... I remove the background than manually crop so I can get it 20x20 since the 22x22 border stays".
- The picker (pine-ai-parts.js) shows "Drop the background colour (crops to the print)" with a swatch when all four corners of the art are one solid colour.
- It starts ticked when a layer that's on is named like a fabric/background layer ("DO NOT PRINT", "Fabric", "Base Color", "Background").
- Ticked: the preview takes that colour out everywhere, shows the rest on a dark see-through grid, and crops to it with its real size ("Print 20.9 × 20.9″" for the bandana; the outer cream border is 20.9″). The numbered pieces are hidden then; dragging a box still works.
- Open this: the art opens already see-through and cropped, so no "drop the background" and no Crop afterwards. Where the art meets the colour the blend is made part see-through with the colour taken back out, so the soft edges don't show up as extra colours (bandana: 2 colours, 97% / 3%, was 4).
- Only v101 / Sep Maker v57 ask the picker for this (opt.knock); v100 / v56 see the picker as before.
- Tested with the bandana PDF (mocked Airtable): picker, open, size 21 (the width box rounds to ¼″), colours.

## 2026-10-29 · v102: Add photo on the garment line; "Also show on" folds away
- Stephen: "we sometimes have garments from vendors that don't pull in photos like Shakawear on some blanks...but doesn't look like I can upload photos". Your photo was there, but hidden behind Change once step 3 folds to its one-line summary. With no vendor photo (and none of yours), the summary line now has **Add photo** (click, or drop a picture on the line); it's the front, and a toast says Change has the back and the size. The line reads "your photo" or nothing once one is in.
- Stephen: "can we also make the garment colors collapsible". "Also show on" is now a title with a chevron; the colours, filter and "Show this style's colours" fold under it. The count (+N) stays on the title. Closed to start; open/closed is remembered on that computer.
- Tested with a mocked Shaka Wear line (no vendor photo): Add photo shows, upload works and it goes away; Also show on opens and closes.

## 2026-10-29 · v103: Save photo on the garment line
Stephen: "can I still save to airtable a garment photo...not seeing that anymore". v102 put Add photo on the folded garment line, but "Save to Airtable for next time" stayed behind Change. Now, while a photo of yours isn't saved, the line shows **Save photo** (the same save: Garments › front/back photo, so that style and colour opens with it next time). After a save it goes away; it says "Replace photo" when Airtable already has one. It only shows for a garment linked to Garments in Airtable, as before. The toast after Add photo mentions it. Tested in practice mode (upload → Save photo → saved, button gone).

## 2026-10-29 · v104: the Colour list folds away
Stephen: "can we also make the bandana colors a collapsible tab as well". Step 3's Colour list (the open 10-row list on a laptop: bandana stock colours with their closest Pantones, or a style's colours) is now a title, "Colour · Maroon", with a chevron, like "Also show on". Click it to open the list; the picked colour stays on the title. Closed to start; open/closed is remembered on that computer. Tested with a 12-colour bandana list.

## 2026-10-29 · v105: a replaced proof's old PDFs go to Drive trash
Stephen: "Can we just move them to the Trash then? We don't need them if we are updating it." (instead of a Proofs › unused folder, which needs worker v38 to create folders).
- When Attach puts a new proof on a line and takes older ones off (v100), the PDFs in that order's Proofs folder **named exactly like the proofs taken off the line** (or an older copy with the new proof's own name) go to Drive trash. Customer files and anything else in the folder are never touched.
- Undo puts the Airtable proofs and the Drive files back (/drive/restore). The toast says when old PDFs went to trash.
- Practice: nothing is written or trashed. Attach to all lines works line by line.
- Tested with a mocked worker: V1 and V2 trashed, "customer logo.pdf" and the new V3 kept, Undo restored both.

## 2026-10-29 · v106: a .psd's ink-named layers name the inks (same as Sep Maker)
Stephen: "the seps found the pantones in the .psd but th emockup make did not....can we make sure those both are the same".
- Sep Maker reads a layer named like an ink as that ink: 186, PANTONE 186 C, 230M-186OW, BLK, WHT, Cool Gray 7, BASE, and so on (its `inkNamed` rule). Mockup Maker's .psd layer picker (v100) only drew the ticked layers, then guessed the colours from the pixels.
- Now, when every ticked layer is named like an ink (the same rule, copied in), each layer's name and its own colour are the inks. They show as "in the file, not a guess", the way spot channels already did. Change the layers re-reads them.
- A layer with any other name ("Layer 1", "Art") means the colours are guessed as before.
- Tested with a .psd built in the browser (layers "PANTONE 186 C" and "BLK"): v105 said 186 / 419, v106 says 186 / BLK.

## 2026-10-29 · v107: ink names from the attached proof / the imprint's Pantones (same as Sep Maker)
Stephen, with 11106's .psd (layers "Layer 2/3/4"): Sep Maker said BLK · 485 · 7510, Mockup Maker said ≈547 · ≈7597 · ≈7510. "just need them both to be the same!"
- v106 wasn't the cause. Sep Maker took the names from **the line's attached proof** (V2 11106 | 3604-NT-BK: its PINE-INKS callouts, which Mockup Maker writes into every proof), matching each ink by the art colour it came from. Without a proof, it uses **the imprint's Pantones** in Airtable (nearest, one to one). Mockup Maker only guessed the nearest ink.
- Now, after the colour scan, Mockup Maker uses the same two sources, in the same order (proof first, then the imprint's Pantones), and the same matching: art colour within ΔE 40, else nearest one to one within ΔE 45. It names only colours nobody has named. The file's own ink names (spot channels, ink-named layers) still win. The Colours panel says "Ink names from the proof (…): BLK · 485 · 7510."
- Tested with a mocked V2 proof carrying BLK / 485 / 7510 callouts: v106 said 433≈ / 7597≈ / 7510≈, v107 says Black / 485 / 7510.

## 2026-10-29 · v108: the order menu leaves out orders that already have their proofs
Stephen: "alot of these have proofs attached. Can we make sure the logic is scanning Airtable to confirm" / "and remove if the proof is attached".
- "Order awaiting proof" listed every order whose Order Status is Awaiting Proof.
- Now, once the lines are read from Airtable (the same read Art to do uses), an order is listed only while at least one of its lines (fee lines aside) has **no proof in Proof Images**, or has **changes asked**.
- The order on screen and orders opened with ?order= stay listed.
- The hint says, e.g., "2 orders awaiting proof. 1 more already has its proofs in Airtable."
- Attaching a proof updates the menu (the next time no line is open).
- Tested with mocked Airtable: an order with proofs on every line was left out; orders with a missing proof stayed.

## 2026-10-29 · v109: archived orders leave the order menu
Stephen, #10569 Cheba Hut HQ (archived in Line Item Review: outsourced to promo): "looks like this job is archived but is still showing up in the mockup creator but it is looking cleaner".
- Art to do already skipped archived orders.
- v108's menu kept any order whose lines it hadn't read, and archived orders' lines are never read. Now an archived order is left out. The open order and ?order= orders stay.
- The hint counts archived orders ("1 archived").
- Tested with mocked Airtable: an archived order with no proofs was left out; the rest are as in v108.

## 2026-10-29 · v110: a tidier Proofs folder (old proofs → unused, setup → working files)
Stephen, with 11106's Proofs folder (11106 | 3604-NT-BK.pdf, the setup .json, Terms of Service.pdf, unused, V3 11106 | 3604-NT-BK.pdf, working files): "unused is in all of the folder systems we use for order numbers. So let's look at how to makes these cleaner and what is the .json".
- **Old proofs → Proofs › unused.** When a new proof is attached, the line's older proof PDFs move into the order's own unused folder. Drive trash is used only when the folder has no unused. That replaces v105's trash, which was there because we thought unused would need creating.
  - "Older" = the same proof name with any V number or none ("11106 | 3604-NT-BK.pdf", "V2 …" when V3 goes in), or a proof just taken off the line in Airtable.
  - Other lines' proofs, Terms of Service, and anything else are never touched.
  - Undo moves them back.
- **The .json** is "… · Mockup Maker setup.json". It's what "Pick up where you left off" opens: the art (with its crop and dropped background), size, placement, ink changes and notes, so a proof can be reworked later without starting over. It's saved with each attached proof.
  - It now goes in **Proofs › working files**, and older copies (in working files or left in Proofs) go to trash. Pick up looks in both places.
- Tested with a mocked 11106 Proofs folder:
  - the un-numbered proof and V2 moved to unused;
  - Terms of Service.pdf and another line's proof stayed;
  - the setup was uploaded to working files and the two old setups trashed;
  - Undo moved both proofs back.
- Not changed yet: Sep Maker's "· Sep Maker setup.json" in Seps, and proofs attached from Line Item Review.

## 2026-10-29 · v111: Use the seps also looks in Seps › working files
Sep Maker v59 saves its setup there (Stephen: "yes do the same for both").
