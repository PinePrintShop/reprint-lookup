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

## 2026-10-30 · v112 (+ pine-ai-parts.js): fixes from the overnight bug test (agent, mocked Airtable/Drive)
- **High, shared proof names.** Two lines with the same style and colour make the same proof name, so line B's proof moved line A's PDFs to unused ("Attach to all" even moved A's brand-new proof). Now:
  - when another line on the order has the same proof name, Drive is left alone;
  - otherwise only the proofs taken off the line, and older V-numbers of its name, move (never a newer one).
  - Retested: single line moves V1/V2; shared name moves nothing.
- **Undo** is offered whenever Drive files moved, and says if any couldn't be put back (it used to say "Put back" even when the move failed).
- **Ink names from the proof** were lost when the art was rebuilt (Drop background etc.) and never came back. They're worked out again on each rebuild.
- **The garment line** says "your photo" after Add photo.
- **Layer picker:**
  - a layer the file hid, ticked back on, is now in the opened art (it was dropped because no occ was passed). Retested.
  - the buttons stay on screen and only the middle scrolls (on a phone they were below the screen);
  - "(hidden in file)" is 12px.
- Not changed (suspected only): ink-name matching by art colour within ΔE 40 is loose; knockout leaves holes where the design uses the background colour, so it's only on by default for fabric/background layers.

## 2026-10-30 · v113: "Change this ink" no longer covers colours
Stephen (screenshot: "Colours · 4" with only 3 showing): "looks like some colors are getting hidden with this new bigger window".
- The window opened just under the colour you tapped, so with two rows of colours it covered the second row.
- It now opens under the whole colour list. Every colour stays in view, and you can tap from one to the next.
- Phones under 600px still get the bottom sheet, as before.
- Tested at 622px with 4 colours, tapping the 3rd: v112 covered the 4th; v113 shows all 4.

## 2026-10-30 · v114: Pull the art out of a PNG / JPG mockup
Stephen, with a customer's front + back mockup that sales said was "the only file they got from the client": "would we also be able to pull information from a png that has mutiple images".
- A PNG / JPG / WebP that is shirts on a plain, non-see-through background opens as **art tiles**, like an old proof PDF's "Pull the art out". Each shirt's print is cut off the shirt colour using v55's photo cut. The pieces of one print stay together (the names beside the toucan).
- **Naming.** Each tile is named by where it sits: a small print high on one side is Left Chest or Right Chest (the wearer's side); a big print on the shirt that has no chest print is the Back; otherwise it's Front. The matching imprint is pre-picked.
- **Shirts that touch** at the sleeves are split by the body width 60% down.
- **Width** is estimated from the shirt (a tee's body taken as 20″ across), capped at 4″ for a chest and 12″ for front/back, because mockups draw prints big. The tile also shows how big the mockup drew it, and the ppi.
- A note says the result is fine for the proof but needs redrawing or vectorizing for seps.
- **Other images still open as plain art:**
  - "Put the whole picture on the shirt" opens the picture as it is.
  - Pictures with see-through corners (logos), and shapes that aren't wider at the sleeves than the body (badges, posters), open as before.
- **Tested with the customer's file** (1536 × 1024 px):
  - Left Chest "global leadership": 4″, about 33 ppi (drawn about 5.3″);
  - Back toucan + names: 12″, about 44 ppi (drawn about 18.5″);
  - Use for B · Back put it on 11120-B at 12″, read as White;
  - a see-through logo, a badge on white and a poster on white still opened as plain art.

## 2026-10-30 · v115: a sleeve print always shows on the shirt
Stephen, with 11022 | CT106656-CH (a Carhartt long sleeve, "SKYBEAR" down the left sleeve, back print, no front print): "can you see how we did this sleeve mockup and try and create an easy way for us to replicate that in the mockup builder".
- **What the art dept did by hand:** the front photo with the sleeve print rotated down the wearer's left sleeve (on the right as you look), with the sleeve art (2.3 × 15″) on its own page.
- **Why Mockup Maker didn't show it:** since v56 it draws a sleeve print along the shirt's sleeve in the FRONT view (true size, rotated with the sleeve, narrowed ×0.65 on long sleeves). But the front view only came up when there was a front print. A sleeve + back job showed only the flat sleeve.
- **Now:** a sleeve print brings in the front view (mockup, proof page 1, Colourways). Sleeve + back gives FRONT (with the sleeve), BACK and LEFT SLEEVE, as on 11022's proof. Nothing to set: give the imprint the Left Sleeve or Right Sleeve location and open its art.
- **Tested with 11022's own front photo** (as "your photo") and its sleeve art at 2.3″: proof page 1 shows the shirt with SKYBEAR down the left sleeve beside the flat sleeve, labelled "LEFT SLEEVE - 11022-D · 2.3 × 14.9″ · 3″ below shoulder seam".

## 2026-10-30 · v116: the sleeve on the shirt matches the art dept's
Stephen: "can we work on that sleeve to try and match what we actually did" (11022 | CT106656-CH, SKYBEAR down the left sleeve).
- **What the art dept did:** the print at full width, toward the outside of the sleeve and running off it, so the letters are cut where the sleeve turns away and it reads as going round the arm.
- **v115** put it in the middle of the sleeve, squeezed to 65%.
- **v116**, on a long-sleeve photo:
  - the print keeps its width;
  - it sits toward the outside of the sleeve (offset 42% of its width);
  - it's cut off where the garment ends, using a mask of the photo's garment (everything but the plain background).
- Short sleeves and the drawn stand-in shirt are unchanged.
- **Compared side by side with 11022's proof at the same scale:** the width, the outer-edge position, the wrap and the clipped "SK" at the shoulder all match. The art dept's starts about 1″ lower; that's the placement ("AS SEEN", about 4″ below the shoulder seam), which can be dragged or typed.

## 2026-10-30 · v117: ink chips say CG 10 / WG 3
Stephen, with 11111's proof (the "COOL GRAY 6 OW" chip spilled out of its square and "COOL GRAY 10" was cut off): "can we tighten up how the longer text fit in the swatch box.....we can appreviate these to CG 10 etc".
- On the proof's colour chips, Cool Gray is shortened to **CG** and Warm Gray to **WG**: CG 6 / OW, CG 10 / OW, WG 3.
- "CG 10" stays on one line.
- A chip's text first gets a little smaller, then breaks into words, then shrinks further (down to 3 pt) until it's inside the square.
- Only the chip text changes; ink names elsewhere are as before.
- Tested with BASE, Cool Gray 6 OW, Cool Gray 10 OW, Warm Gray 3, 7621 OW and BLK: v116 overflowed two chips, v117 fits all six.

## 2026-10-30 · v118: "Try a 300 dpi upscale" for low-res art
Stephen: "can we explore putting in an upscaling tool for low res files to 300dpi? still a warning but just so we can see if we can get a clean upscale".
- **How it works:** for flat spot-colour art, the art is enlarged to 300 dpi at its print width (4000 px at most) and softened a little (blur ≈ 0.6 × the scale). Then every pixel is set to the nearest of its scanned inks and is either in or out, so edges are redrawn crisp instead of blurry.
- **Explored on the customer's toucan back print (44 dpi at 12″):**
  - a plain smooth resize is blurry;
  - "ink-snap" gives clean names and line art;
  - more softening (0.6 × scale) gives rounder edges than 0.35 × scale;
  - the tiniest specks soften.
- **In the app:** next to the Low-res / Mockup-only warning, **Try a 300 dpi upscale** appears. It's offered only for flat art (not blended or photo-like with more than 6 colours, not vector PDF/.ai).
  - After it runs, the warning stays: "Upscaled from ~44 dpi to ~300 dpi at 12″ — check the edges and small details before seps".
  - The proof note "Upscaled to 300 dpi" is added.
  - **Back to the original** undoes it and takes the note off.
  - Download print art uses the upscaled art.
- **Tested:** the toucan went 532 px → 3600 px in about 9 s; the warning and note were right; undo put back 532 px.
- **Not done:** AI upscaling (an ESRGAN-type model is many MB and is made for photos; for screen-print art, snapping to the inks is the better fit). Sep Maker already smooths low-res edges when it separates.

## 2026-10-30 — v119: upscaler dialled in, and print art saved to Drive for seps
- **Stephen:** "it only upscaled to 200dpi and still could use some work getting cleaned up more" (The Mill Glen Arbor bandana PNG, 2000 px).
  - **Fixed:** v118 stopped at 4000 px, which is only about 200 dpi on a 20″ bandana. It now goes to a true 300 dpi (6000 px). Only art over about 50 MP is held back, and the message says so.
  - **Cleaner:** the softening step used to thin out fine lines (fish outlines, small letters). Anything the plain enlargement shows as solid now stays solid. The outer edge also gets a soft 2–3 px ramp instead of a jagged cut.
  - **Tested on the Mill Glen Arbor PNG:** 97 → 300 dpi at 20″ in about 7 s, with clean letters and fins.
- **Stephen:** "can we also have the art we rebuilt or upscaled be uploaded to the drive folder as well to make seps quicker".
  - When a proof is attached, each printed imprint's art also goes to Drive. It's the same 300 dpi PNG as Download print art, with the ink changes.
  - **Where:** the order's Seps › working files; if there's no such folder, then Seps; otherwise Proofs › working files.
  - **File name:** `<order> <imprint> … · Mockup print art.png`.
  - The older copy for that imprint goes to the Drive trash. Nothing else in the folder is touched.
  - **Which art:**
    - raster art always (upscaled, pulled from a mockup, cropped, background dropped);
    - vector PDF/AI only when it was changed here.
  - Attach to all lines sends it once. Practice mode only says where it would go.
  - **Tested with mocked Drive:** the upload landed in Seps › working files, the old copy was trashed, and the customer's file was left alone.

## 2026-10-30 — v120: orders with proofs attached stay on the menu until sent to Review
- **Stephen** (#11113 The Mill Hospitality): "looks like the mill is missing now but it hasn't been clicked for ready to review".
- **Why it was missing:** since v108, an order left the order menu as soon as every line had a proof attached.
- **Now:** an order whose proofs are all attached but which has a line not yet sent to Review stays on the menu, in a "Proof attached — not sent to Review yet" group at the bottom.
- **The hint under the menu** counts:
  - orders awaiting proof;
  - orders in this new group;
  - orders already sent;
  - archived orders.
- Once every line is sent to Review, the order leaves the menu.

## 2026-10-30 — v121: no ring round the print on a discharged bandana
- **Stephen** (The Mill on brown): "the mockup has a weird ring" … "bandanas never get a base it is just either discharge or direct to fabric".
- **Cause:** the discharge preview was drawn like a shirt's underbase, choked (pulled in) 1/64″. That left a band of ink straight on the brown round every shape, which looked like an outline.
- **Fix:** on a bandana the discharge is the ink itself, so the discharge preview now covers the whole shape with no choke.
- Shirts' white, cream and discharge bases are unchanged.
- **Tested:** rendered The Mill badge on brown before and after.

## 2026-10-30 — v122: every close-up uses the new template; the art department's questions aren't change requests
- **Stephen:** "our close up proof reverted back to the old layout vs the new one we worked on the other day".
  - v76 moved only the single-garment close-up page to the art department's 11 × 11″ template.
  - Bandanas and the per-garment close-ups (a proof with several garments or "Also show on") kept the old layout.
  - Now every print gets the template page:
    - logo, imprint ID, Location / Dimensions / Placement, the garment-colour block and APPROVED;
    - on each garment's own colour;
    - with a "Garment:" line (e.g. "Brown · Bandana 22″ · Discharge") when the proof has more than one garment;
    - with "Print: Discharge" when it's discharged.
  - Garments that would look the same still share a page.
- **Stephen:** "black hills is attached proof but it still shows up as needing a proof" (11110).
  - The Art Department asked sales "keep it as DISCHARGE or switch it to BASE?" right after the proof. Any comment with a "?" or a change word after the proof counted as "changes asked".
  - Now the Art Department's own comments never count, here and in Line Item Review v52.
  - So 11110 sits under "Proof attached — not sent to Review yet" until it's sent.
- **Tested:** bandana close-up pages, one and two garments.

## 2026-10-30 — v123: the upscale comes out in the art's real inks
- **Stephen** (one-white toucan / Pura Vida names): "I tried the upscale again and it still isn't getting me one clean white".
- **Cause:** the colour scan found two inks: #fafbfb (89%) and a light blue-grey #d7dae1 (11%), which is the shading along the art's edges. The upscale snaps to the scanned inks, so it kept both.
- **Fix:** a small ink (under 25%) that is only a lighter or darker shade of an ink at least twice its size is folded into that ink. "Same shade" means the same hue/chroma within 8 and lightness within 30.
  - Real colours, meaning any hue change, are kept.
  - The toast says how many shades were folded in. "Back to the original" undoes it.
- **Tested:** the toucan came out 86% white + 12% grey before; now it is one white.
- **Stephen also asked** whether Download print art is the cleaned version: it is whatever art is on the imprint now — the upscaled art after an upscale, otherwise the original grab. The same goes for the copy in Seps › working files.

## 2026-10-30 — v124: Trace to vector, and a thin-line check
- **Stephen:** "any ideas for getting an even tighter and cleaner upscale" → "yeah let's build that".
- **Trace to vector** sits next to Try a 300 dpi upscale, for the same flat art.
  - **How it works:**
    1. Each ink is found on a smoothed 2–4× copy of the art (at most 16 MP).
    2. The ink is traced into smooth curves with Potrace. This uses esm-potrace-wasm 0.5.1, loaded from jsdelivr only when first used.
    3. The curves are drawn at 300 dpi at the print width.
  - **Download .svg** gives the vector for Illustrator, with real inches.
  - **Back to the original** undoes it. The proof gets the "upscaled" note.
  - **Speed:** about 5 s for the toucan at 12″ and 9 s for The Mill at 20″.
- **Edge halos fold into their ink** (upscale and trace).
  - v123's shade rule covers inks under 25% within 30 lightness / 8 hue of a bigger ink.
  - **New:** an ink under 10% that sits at least 80% on edges, next to a bigger ink within 60 lightness / 14 hue, folds into that ink.
  - **Example:** The Mill's leaves kept a grey edge, the old white background blended in. It came out as a traced grey outline round every leaf; now it's one olive.
  - **Real colours are kept:** tested with red + blue + a 6 px yellow outline + white text, and all 4 inks stayed.
- **Thin-line check** after an upscale or a trace.
  - **What it flags:** lines under about 1 pt at print size, found by opening the shape by half a point. It counts a run about ¼″ long, not pointed tips or corners.
  - **What you see:** a warning with the number of spots, and "Show where" opens a small picture with them boxed in red.
  - **Tested:** a 3 px × 2″ line was caught; the 12 px line, tips and bold text were not. The toucan at 12″ has none.

## 2026-10-30 — v125: Retype the text…
- **Stephen:** "can we also build the font idea and can we automate that feature so if selected the app can handle all the spelling to match the image".
- **Where:** a "Retype the text…" button in the art box. It shows after Trace to vector or the upscale, or on print-ready raster art.
- **How it works:**
  1. **Reads the text** with Tesseract.js 5.1.1, using the core and English data from jsdelivr (about 10 MB the first time).
     - The art is read at about 1300 px and about 2400 px wide, and each line keeps its surer reading. That beat one read at full size: the toucan's names went from 3–4 wrong to 1 ("Mia" read "Ma").
     - Lines under 80% are boxed yellow to check. Drawing scraps (short or unsure) start unticked.
  2. **The list:** each line has a tick and an editable text box. The app types exactly what's in each box, so spelling is checked there.
  3. **Finds each line's letters** as the shapes inside its box (padded ¼ of a line). Artwork that touches the box isn't one of them, so it stays.
  4. **Ranks about 70 Google Fonts.** Only the letters needed are loaded, via `text=`.
     - Each line is squeezed to 256 × 40 and compared to the font's rendering.
     - The font's letter spacing is fitted to the art's width : height first. Art lettering is often spaced wider than the font; without that, the slanted Kalam Bold won on the toucan.
  5. **Shows the first ticked line** in the art, then in the 8 closest fonts. Tap one, or pick any from the list, or "Another Google Font…" to load one by name.
     - Stephen: "I thought a few other fonts fit better than the patrick hand bold". So the pick is the user's, and the ranking only orders the list.
  6. **Retype ticked lines:**
     - each line's letters and their 3 px soft edge are taken out;
     - the line is typed back with its size from the letters' height and spacing from their width, centred where it was (tilted lines keep their angle);
     - it uses the ink nearest the letters' colour.
     - A traced .svg is traced again so it includes the new type. Undo is in the toast.
- **Fixed before shipping:** the fonts were first loaded with only the sample lines' letters, so other letters fell back to a serif. Every ticked line's letters are now loaded before the preview and the retype.
- **Tested:** the toucan at 12″ — the trace, then Retype.
  - 33 of 34 names read right with no typing.
  - Patrick Hand Bold and Gaegu Bold rank first.
  - The names were retyped in place and the .svg re-traced (about 25 s to read and rank).

## 2026-10-30 — v126: Retype fixes — names stay inside the art, compare, movable window, matching line weight
- **Stephen:** "looks like some names got pushed out of the art border".
  - **Cause:** when the font is wider than the art's lettering even at its tightest spacing (−5%), the line came out wider. Lines are centred where they were, so names starting at the art's left edge were cut off.
  - **Fix:** a line that would come out wider now has its size brought down to the original width. Its centre is also kept far enough inside that nothing passes the art's edge.
  - **Tested** with Short Stack, a very wide font: every left-hand name is inside.
- **Stephen:** "can we make the little pop up moveable....or at least show the original along with what it found so i can compare". Now:
  - The window drags by its title.
  - "Compare whole art" shows the original and the retyped art side by side, and follows the font picked.
  - Tapping a line's text box previews that line against the fonts.
- **Stephen:** "didact gothic looked nice". Fonts are now thickened to the art's line weight before they are compared and drawn.
  - Stroke ÷ height is measured as 2 × ink area ÷ outline length, and an outline is added (up to 20% of the size) until the font matches.
  - So a light font is judged on its shapes and comes out as heavy as the art. Didact Gothic has no bold.
  - On the toucan, Didact Gothic only needed a little (1.5%) and still ranks lower on shape; it can be picked from the list.
- **Stephen** on v125: "I think the font it suggested turned out great!"

## 2026-10-30 — v127 (+ pine-ai-parts.js): pick one design off a slide PDF
- **Stephen** (BANDANA.pdf): "the pdf pop up to grab art didn't work with this one".
- **The file:** saved from Preview, an 11 × 8.5″ page that is one flat picture (3305 × 1584): three bandana designs on a light grey card. It has no layers, so it opened whole.
- **Why the picker didn't come up:** numbered pieces were only offered on huge sheets (over 26″). Even then, the flat picture was all one piece, because its card isn't see-through.
- **pine-ai-parts.js** (shared with Sep Maker):
  - A normal-size page with two or more separate designs, each 1.5″ or more, now gets the picker with numbered pieces.
  - When much of the page is solid (at least 40% — a flattened picture, not a vector sheet), its most common light grey/white is paper, not ink.
  - Pieces there join across about 0.12″ instead of 0.25″ (the slide's panels are about 0.23″ apart).
- **Mockup v127:** a bandana design that comes in under 8″ (drawn small on a slide or mockup) opens at 20″, the usual most, with a note to change it.
- **Tested:**
  - BANDANA.pdf: picker with 3 pieces; piece 2 opens alone at 20″.
  - The layered bandana PDF still gets its layer picker; proofV2.pdf still opens straight away.

## 2026-10-30 — v128: Pull the art out finds the designs on a slide too
- **Stephen:** "v127 and still not working".
- **Cause:** a PDF named like an order proof ("11113 | BANDANA.pdf") opens in Edit PDF's "Pull the art out" step, not the opening picker v127 fixed. That step looks for shirts, and on this slide it returned the whole picture as one "Drawn art" tile.
- **Fix — "Pull the art out" (PDF) and PNG / JPG mockups:**
  - When there are fewer than 2 shirt tiles, separate designs (two or more, at least 1.5″ each) become a tile each, numbered left to right and row by row.
  - The shared piece finder is used; the page's paper colour doesn't count as art.
  - Designs are found on a copy at no more than 2 px per point, then cut from the full page. At full size, compression specks along the edges bridged the 0.19″ gap and two panels came out as one.
  - A bandana's tile opens at 20″.
- **`pine-ai-parts.js?v=128`:** the page now asks for the new shared picker by version, so a browser can't keep the old one for its 10-minute cache after an update.
- **Tested** with BANDANA.pdf as "11113 | BANDANA.pdf" (Pull the art out), as "BANDANA.pdf" (opening picker) and as a PNG of the slide: 3 designs each time, and the third opens alone at 20″.

## 2026-10-30 — v129: upscale / trace on a bandana picked from a PDF slide
- **Stephen:** "does the upscale and or vectorize not show up on bandanas?"
- **Cause:** it was the file, not the bandana. A design picked in the opening picker is still a PDF, and every PDF was taken as vector, so the buttons never showed. The message only said "has a picture placed in it".
- **Now:** a PDF that is a picture gets its real dpi.
  - The dpi is the picture's pixels ÷ the page's inches (a floor), times the piece's inches on the page, ÷ the print width. BANDANA.pdf piece 3 is ~42 dpi at 20″.
  - It gets the same "Mockup only" / "Low-res" warning and the upscale / trace buttons as a PNG.
- **Colour count:** the limit is now checked after edge shades fold in, cached per scan. The paisley scanned 7 with its shades, over the 6 allowed for photo-like art.
- **Messages:** "Upscaled / traced from ~X dpi" uses that real dpi too. The result counts as a picture (png), so it reads "Vector trace…", not "a PDF with a picture"; undo puts the PDF back.
- **Tested:** BANDANA.pdf piece 3 through the picker shows both buttons and traces cleanly at 20″. The "Pull the art out" route already showed them.

## 2026-10-31 — v130: open EPS files
- **Stephen:** "Can we also be able to open an eps and select the correct layer or image".
- **How:** an EPS is PostScript, which a browser can't draw. It's turned into a PDF in the browser with Ghostscript, then opens like any PDF.
  - **Library:** @okathira/ghostpdl-wasm 1.1.0 from jsdelivr, loaded only the first time an EPS is opened (about 15 MB).
  - **Ghostscript flags:** `-dSAFER -dEPSCrop -dAutoRotatePages=/None -sDEVICE=pdfwrite`, so it's cropped to the EPS bounding box.
  - **Name:** the file becomes "<name> (EPS).pdf", so Edit PDF works on it too.
- **The picker:**
  - Tap a numbered piece (each separate design or placed picture), drag a box round any part, or tick "Drop the background colour".
  - Real layers aren't possible: PostScript keeps none. Illustrator's layer data in an EPS isn't readable, so pieces and boxes stand in for them.
- **Where:** the file chooser, drag-and-drop and Drive tiles all accept .eps now.
- **Licence:** Ghostscript is AGPL. We load it unchanged from the CDN; it isn't modified or hosted by us.
- **Tested** with a hand-made EPS (a red circle with type, and a blue square with a placed picture):
  - converted in the browser;
  - the picker offered both pieces;
  - piece 1 opened alone.
- **Not tested:** a real Illustrator EPS. Stephen to try one.

## 2026-11-02 — v131: Rotate
- **Stephen:** "in the mockup creator can I be able to rotate an image".
- **The control:** "Rotate" sits next to Crop and opens a row with:
  - ↺ 90° and ↻ 90° (art that came in sideways);
  - an Angle box for any angle (a tilted print) — plus turns right, minus left;
  - Straight, to put it back.
  - The button shows the angle ("Rotate · −12°").
- **How:** the turn is the last step of building the art, after the background drop and crop, which keep working in the file's own pixels; then the art is trimmed again.
  - So the mockup, proof, print art, upscale, trace and Retype all follow it.
  - The print keeps its scale: a 12 × 13.9″ toucan turned 90° is 13.9 × 12″, and −12° is 13.1 × 13.5″.
- **Saved and undone:** the angle is saved with the setup. Upscale / trace / Retype bake the turn in (the angle goes back to 0), and their undo restores it.
- **Not for** a print made of several files ("+ Add file"), same as Crop.
- **Tested:** the toucan on a black tee: ↻ 90°, then −12°, then Straight, with the sizes as above and 12″ back at the end.

## 2026-11-02 — v132: a vendor photo of a person doesn't set the size
- **Stephen** (a hoodie whose vendor back photo is a person wearing it): "how do we handle dimensions when the only visual is from the site and it has a body in it".
- **Cause:** the scale comes from the garment's height in the photo, taken as the spec length plus above the HPS. On that photo the "garment" was the whole person, head to shoes, so the inches were far too big and the 12.5″ back print covered the back and the pants.
- **Now:**
  - A photo whose garment outline is more than 1.65× taller than wide is "on a person". A flat-laid hoodie or tee is about 1.2×; the person was 2.2×.
  - That side is drawn to size as the plain hoodie / tee shape in the garment colour, with "**BACK IMAGE UNAVAILABLE" on the proof as before.
  - The garment line says "the back photo is on a person, so it's drawn to size — add a flat photo", and its button is "Add a back photo".
  - Adding your own photo for one side now keeps the vendor's photo for the other side. Before, it dropped it.
- **Not touched:** caps, totes and other accessories, which are sized across, not by height.
- **Stephen also asked how close the front close-up is:**
  - The close-up page (v76 template) blows the print up to fill its block — up to 6.9 × 6.8″ — to show detail. It is not to scale.
  - Page 1 (the garments) is the true-size view.
- **Tested** with Stephen's screenshot: front flat-lay 1.24× (kept), back on a person 2.2× (drawn to size); the summary line and button as above.

## 2026-11-02 — v133: size a photo on a person from their height; how body length is measured
- **Stephen:** "I don't have a flat photo...so can we figure out what a true to size print would be on this photo since it is all I have". The vendor: "Male model is 5'10 and is wearing a size Medium"; M = Length 26 1/2″ × Chest 52 1/2″.
- **New box:** when a side's photo is on a person, the garment line shows "Height of the person in the back photo".
  - It takes 5'10", 5 10, 70 or 178cm.
  - Head to shoes in the photo = that height, so the real photo is used at true size.
  - The yellow collar line starts 15% of the height down from the top of the head; drag it onto the collar / hood seam. It's kept separately from flat-photo collar lines.
  - The height is kept on this computer per style + colour + side (`pine_person`).
  - Leave the box empty to go back to the drawn-to-size shape (v132).
- **Stephen:** "can we also see how the 29 is being measured? meaning from the collar to the bottom seam or ... the sleeve?"
  - **Body length** is spec-sheet length: from the high point of the shoulder (where the shoulder seam meets the collar) straight down to the bottom hem. It is not the sleeve and not the hood.
  - A flat photo's garment height = body length + what rises above the shoulder (4.5″ of hood on a hoodie, 0.5″ of collar otherwise).
  - **Why 29:** no S&S spec sheet, and the type wasn't a hoodie, so the typical 29″ was used and no hood.
  - **Fix for that job:** in Change, set the type to Pullover Hoodie and Body length 26.5 (the vendor's M).
  - The box now reads "Body length (in) · shoulder to hem", with the full explanation on hover.
- **Tested** with Stephen's screenshot as the photos: the height box shows for the back; 5'10" → "the back photo is on a 5′10″ person — sized from their height", and the 12.5″ print sits in proportion on the hoodie.

## 2026-11-02 — v134: adding your own photo of a person works
- **Stephen:** "the back image with the person is not uploading....I might just need to wait for a minute but I am on the new version".
- **Cause:** it was uploading, but a photo on a person waits for their height (v132/v133). The height box was hidden while Change was open — which is where your own photo is added — and the hint just said "Back photo in". So nothing seemed to happen.
- **Now:**
  - The height box shows with Change open.
  - The hint and a toast say "it's on a person, so type their height in the box (like 5'10")".
  - The cursor goes to the box.
- **Tested:** the back of Stephen's screenshot added as your own back photo, with Change open → height box shown and focused → typed 5'10" → "the back photo is on a 5′10″ person — sized from their height".

## 2026-11-02 — v135: centring on a photo of a person
- **Stephen:** "Closer....but it doesn't let me center it and I don't want to use the tool because it will be true center but If I use the tool it will say it is moved over".
- **Cause:** on a person photo, the garment's middle was the middle of the whole person, and arms, hands and pants pull it off. A true-centre print sat off the hoodie's middle, and fixing it with Off center would have printed "moved over" on the proof.
- **Now, automatic:** the middle comes from the shoulders-to-chest rows, 12–30% down the person: the median of each row's left/right midpoint, where the garment is widest and symmetric. On the test photo it moved 14 px (of 520) from the figure's middle.
- **Now, by hand:** the yellow collar line on a person photo drags sideways as well as up and down (move cursor). That sets the garment's middle (`NECKX`, a share of the person's height, at most ±15%).
- **The print's own Off center stays 0**, so the proof still says true center.
- The height box hint says so.
- **Tested:** the back of Stephen's earlier screenshot as your own photo at 5'10"; a 12.5″ print centred on the hoodie, and a 30 px sideways drag of the collar line stored the nudge.

## 2026-11-02 — v136: a garment's close-ups share one colour (the darker)
- **Stephen** (11122-A front vs 11122-B back): "since the lighting for the back is slightly different the close up change...but I think keeping it uniform is better...so it should match the darker one".
- **Cause:** each close-up page took its own side's photo colour, and a brighter-lit back photo made a lighter back close-up.
- **Now:** a garment's close-ups — the single-garment pages and the per-garment ones — all use the darker of its front / back photo colours (`closeHex`). Garments with a photo on one side only use that side's colour. Bandanas still use the bandana colour.
- **Unchanged:** the mockup itself still shades each side by its own photo.
- **Tested:** front #5c4a40 with back #8a7a6a; both close-ups fill 92,74,64.

## 2026-11-02 — v137: no "Save photo" on the stand-in garment
- **Stephen:** "whoops I just saved this to a garment called - Customer Supplied 0000 - Any but that is a stock drop down".
- **Airtable (asked for):** Garments › Customer Supplied 0000 - Any (rec6v500ytRYFcdan) had only the two photos just saved — "Pine mockup - Customer Supplied 0000 Any - Front.jpg / - Back.jpg". Both were cleared, so its Front / Back are empty again, as before.
- **App:** Save photo / Replace photo is hidden on stand-in garments, and saving is refused there too.
  - **What counts:** "Customer Supplied" in the name or brand, style 0000, or a name ending "- Any".
  - **Not caught:** Gildan 5000, Port 10000, "Any Color".
  - Your photo still works for the job, on screen and on the proof.

## 2026-11-02 — v138: type in the garment (customer supplied / not in the system yet)
- **Stephen:** "can we have it be able to custom the garment and fabric for customer supplied and or products that are not in the system yet".
- **Where:** Garment › Change › "Type in the garment".
  - It opens by itself on the Customer Supplied stand-in.
  - Fields: Brand, Style, Colour + swatch, Fabric content, Kind (tee, long sleeve, tank, youth tee, crew, hoodie, zip hoodie, youth fleece, onesie, other).
  - "Use this garment" applies it; "Back to the order's garment" undoes it.
  - The swatch follows the colour name until you pick one.
- **What it drives:**
  - the proof page's Garment / style / Colorway / Fabric Content;
  - the mockup colour;
  - the stand-in shape and size from the Kind (hoodie: hood and long sleeves);
  - a style S&S knows still brings its photo.
  - The "Garment photo not found" label is left off a typed-in garment's front; "**BACK IMAGE UNAVAILABLE" stays on the back.
- **Kept:** per line on this computer (`pine_mk_customg`) and in the saved setup, so "Pick up where you left off" brings it back on another computer. Airtable is not changed.
- **Also:** the stand-in shape for hoodies, crews and long-sleeve tees now has long sleeves (it had a tee's).
- **Tested:** Customer Supplied 0000 - Any → the panel opened by itself → Etwood / H100 Heavyweight Hoodie / Brown #5c4a40 / 100% Cotton, 14 oz French Terry / Hoodie → proof page 1 shows them; brown hoodie stand-in front and back; "Back to the order's garment" restores it.

## 2026-11-02 — v139: the garment line wraps; no Save photo on a typed-in garment
- **Stephen** (screenshot after Done: "Elwood Clothing CORE HOODIE · Vintage Brown · M · the back photo is on a 5′10″ person…" squeezed to a letter a line beside "Add a back photo", "Save photo" and "Change").
- **Layout:** the garment line now wraps. The text keeps at least 220 px, and the buttons go under it when they don't fit beside it.
- **Save photo:** hidden on a typed-in garment, and refused if pressed. Its record is still the order's — here Customer Supplied — so saving would have put the photo on the shared stand-in again (as in v137).
- **Tested:** the long line with three buttons at 1400 / 820 / 390 px wide wraps under the text; Save photo is hidden for the typed-in hoodie.

## 2026-11-02 — v140: flat lays first, ghost shots as the fall-back
- **Stephen:** "can you check Sanmar and S&S and see if comfort colors has flat shots now?" → "can we have it scan for flats first. and the fall back is 'ghost'".
- **What we found:**
  - **S&S:** the Comfort Colors product photos are ghost-mannequin shots (1717 all 68 colours, 1566 20 of 21, 1467 all 11, 6014 all 51; on-model shots separately).
  - **SanMar:** true flat lays front and back for all of them (1717 81 colours, 1566 19, 1467 10, 6014 46 fronts / 50 backs), dated 2018–2025. Mockup Maker was taking S&S first.
- **Now:**
  - For every brand but AS Colour, SanMar and S&S are asked at the same time.
  - The order is: a SanMar flat (`frontFlat`), else the S&S ghost shot, else SanMar's model / product photo.
  - SanMar's brand must match the garment's: a shared style number can't bring another brand. Bella 3001 is BC3001 at SanMar, so it still comes from S&S.
- **Collar on a flat:** the `COLLAR` scan was made on S&S ghost shots, so a flat uses its own readings (`SAN_COLLAR`, share of the body width from the top of the photo), read on ruled close-ups:

  | Style | Front | Back |
  |---|---|---|
  | CC 1717 | 0.225 | 0.055 |
  | 1566 | 0.235 | 0.065 |
  | 6014 | 0.21 | 0.055 |
  | 1467 (hood V / hood bottom) | 0.60 | 0.47 |
  | Gildan 5000 | 0.245 | 0.07 |
  | 18000 | 0.29 | — |
  | 18500 | 0.63 | 0.52 |
  | PC54 | 0.265 | — |

  Other styles' flats use defaults: front tee 0.25 / crew 0.27 / hoodie 0.61 / tank 0.33; back 0.06 / 0.065 / 0.5. The line still drags, and is remembered.
- **Scale on a hoodie flat:** the hood stands up, about 31% of the body length above the shoulder (read on 1467 and 18500), instead of the 4.5″ used for ghost shots. Without this, prints on hoodie flats would draw about 15% too big.
- **Tested live** (the worker, real SanMar / S&S):
  - 1717 Bay, 1467 Black and 18500 Sport Grey come up as SanMar flats in 2.7–4.8 s; Bella 3001 Black comes from S&S.
  - The collar line lands on the 1717's rib and the 18500's hood V.

## 2026-11-02 — v141: Fabric look moved to the Art step
- **Stephen:** "did we lose the fabric adjustments for how a print looks like on a shirt..>I can't seem to find it right now".
- **Cause:** not lost. "Fabric look on the print" (Off / Light / Medium / Strong) was inside the garment's Change panel, which has been folded into one line since v53.
- **Now:** it sits in step 2 · Art, right under Ink opacity, with the other "how the print looks" settings. It's no longer in the Change panel.
- Same setting and behaviour as before.
- **Tested:** CC 1717 Bay with a print — the row shows under Ink opacity, and Strong switches on and redraws.

## 2026-11-02 — v142: crop the garment photo
- **Stephen:** "can we also get a feature where we can crop the actual photo as well...that way if it is a person wearing it we can just crop to mostly just show the hoodie".
- **Where:**
  - Change › your-photo area › "Crop the photo · Front / Back" (shown for any side with a photo — vendor or yours).
  - "Crop the photo" next to the person's-height box when a side is on a person.
  - It uses the same drag-a-box window as the art Crop; "No crop" shows the whole photo again.
- **How:** only what shows changes. The size, the garment's middle and the collar line are still measured on the whole photo, so a cropped model photo stays true to size and the print keeps its size against the garment.
- **Saved:** per style + colour + side on this computer (`pine_mk_pcrop`). The button shows ✓ when a crop is set.
- **Tested:** Stephen's model photo at 5'10" with a 12.5″ back print, cropped round the hoodie in the window: the view zooms to the hoodie and the print keeps its proportion; the crop is stored and the ✓ shows.

## 2026-11-02 — v143
Stephen: "Also let's build the embroidery into the mock creator" (after the sew-out study).

- **Embroidery drawn as stitches**, built from our digitizer's sew-outs (`<order>A-<NAME>_final.jpg` in the digitizing folders: CULT, MOOTS, LUCID, FRISCO). Each thread colour is its own object. Narrow columns are **satin**: the stitches run across the column, with a rounded top and a shine that changes with the stitch direction. Wide areas are **tatami fill**: rows 0.4 mm apart, 3 mm stitches, brick offset. The edges dip into the fabric with small teeth, and two soft shadows sit under it (0.5 mm / 45% and 1.6 mm / 25%). This replaces the old diagonal sheen filter. Fabric look still applies on top, at the lower strength for thread.
- **Art step › Stitches:** Auto / Satin / Fill + satin edge, per imprint, saved with the setup.
  - **Auto:** satin up to ~11 mm wide, fill above. This matches MOOTS, which was all satin.
  - **Satin:** everything satin.
  - **Fill:** tatami with a 1.1 mm satin border, and only fine strokes stay satin. This is how CULT was stitched.
- **Fine lettering stays sharp:** columns under ~1.5 mm keep crisp edges, with less dip and no teeth. The outline is cut a touch wide, so 1/8″ text stays solid.
- **Wide shapes stay clean:** a corner of a wide shape takes the width of its widest column of the same thread within 1.5 mm, so it doesn't turn into streaks of satin.
- **Stitch pictures aren't stitched twice:** if the art is already a stitch picture (the digitizer's render), it is shown as it is, and the Stitches row says so. The test is mostly textured thread: it caught all four digitizer renders and no flat art.
- **Speed:**
  - Worked out at about 250 ppi of the stitched size. Low-res art is enlarged, and the work is capped at 2.2 MP, about 0.3–1.2 s.
  - The result is cached per art, size and style.
  - On the live mockup and Colourways, a size change shows the last result and catches up 0.2 s after you stop.
  - Proofs and downloads wait for the real one.
- Tested in Chromium on flat versions of the four sew-out designs against the real photos, on a 1/8″ small-text sample, and in the app: Stitches row, Fill saved, and the digitizer render skipped.

## 2026-11-03 — v144
- **Hoodie backs sized right.** Stephen: "this back mockup is looking pretty big compared to the size it says and the print is 11" wide so it should feel bigger" (District DT6102 New Navy).
  - A hoodie photo is sized by body length plus what stands above the shoulder. That was the standing hood: ~31% of the body length on a flat lay, 4.5″ on a ghost shot.
  - From the back, the hood lies down the back, so only ~1″ counts there now.
  - Back prints on hoodie photos were drawn ~20% small. The DT6102 back's 11″ print is now 27% bigger, which matches the body length.
- **Semi-opaque swatches.** Stephen: "we usually just show a pine swatch with the more dull print vs a bright print...on a bandana that is not dischargable like the green or royal one".
  - The drawn SEMI-OPAQUE → FULLY-OPAQUE bar is gone.
  - Page 1 of a bandana proof shows the art department's two swatches, as on 11048 L.A. TACO: the Pine logo in the print's lightest ink, dull on the bandana's own colour (SEMI-OPAQUE) and bright on black (FULLY-OPAQUE), labelled in proof blue.
  - They sit in the left column under the colours when there's room, otherwise under the art beside APPROVED.
  - Elsewhere the note is just "EXPECT SEMI OPAQUE PRINT".
- **Ink panel:** Done is in the title bar. Stephen: "clean up that floating done banner"; it floated over Remove / Erase. On a phone, the title bar stays at the top of the sheet.
- **Special inks.** Stephen: "adding puff and or actually special effects...metallic inks and glow in the dark".
  - Tap an ink › Effect: None / Metallic / Glitter / Puff. One ink only; the rest stay flat. The ink gets a ✦ in the list. Saved with the setup.
  - The effect is guessed from the ink's name: Metallic …, Gold, Silver, Pearl, Celestial, Pantone 871–877 / 8xxx metallics, … Glitter, Puff, HD.
  - Tuned on the shop's photos (Drive › MISC › Pine Support Images from Hoffman, Glitter Swatches, ORB_PUFF):
    - **Metallic:** a fine grain under a soft, wide sheen.
    - **Glitter:** ~0.25 mm flakes, the bright ones a little tinted on light inks, some dark.
    - **Puff:** a chalkier colour, a suede grain, rounded raised edges and a soft shadow.
  - **Embroidery › Stitches › 3D puff:** satin over foam, with a taller column and a deeper shadow.
  - Glow in the dark, reflective and neon wait on photos. Matsui's "Glow" pigments are fluorescent, not glow-in-the-dark. CCI neon is D-FLO (discharge) and W-FLO (over a base).
- Tested in Chromium:
  - the DT6102 back via the live worker (SanMar flat);
  - bandana proofs with and without discharge;
  - the ink panel on desktop and phone;
  - effect renders next to the shop's photos.

## 2026-11-03 — v145
Stephen, on 11123: "the only file for the separator is the .png and not a file with the layers". He used the customer's PSD, changed the red, and the proof was approved. Answers: "use the file name sales assigned", "you can stop saving the .png", "per ink layers would be great along with the approved art".

- **Layered setup PSD instead of the flat PNG.**
  - **When:** attaching a proof saves `<order><letter>-<FILE NAME>_<LOCATION>_setup.psd` to Seps › working files (else Seps, else Proofs › working files).
  - **Name:** from the imprint's File Name in Airtable (`fldyGOHRKNz00MaYQ`, what sales typed), e.g. `11123A-ROACH-RIPPER_FRONT_setup.psd`. The location is left off when the name already says it (`8594B-TOPO-JAPANESE-LC`).
  - **Layers:**
    - **Approved art** on top: exactly as approved, ink changes and all.
    - Under it, an **Inks** group with one layer per ink, named as on the proof (2028, BLK, 186 OW …). Each pixel goes to its nearest ink.
  - **Size:** the print size, up to 300 dpi. The file records its real dpi.
- **No more "· Mockup print art.png".** Only our own earlier copy, with the same name, goes to the Drive trash. The separator's files are never touched.
- **Download setup PSD** (was Download print art) gives the same file, zipped when there are several.
- **Vector art:** art the app didn't change still isn't copied, because the original is the file to separate. A vector with an ink change now gets a setup PSD too, since the change is only in the app.
- Tested (Chromium, mocked Airtable) on 11123-like art: two inks with the red changed to 2028. The PSD reads back with an Inks group (2028, 419) under Approved art; the ink layers add up exactly to the art; the file was 0.9 MB. File names checked for 11123-A, 8594-B, a bandana and a back.

## 2026-11-03 — v146
Stephen: "so we are not going to have a .ai setup file?" … "yes build away".

- **Vector art stays vector.** When the art came from an .ai, .pdf or .eps and was changed here (an ink changed, cropped), the setup file is `<order><letter>-<FILE NAME>_<LOCATION>_setup.ai`:
  - The customer's page is placed at the print size and cut to the art, using the same box as the mockup, after any crop.
  - Every fill and stroke in a changed ink is rewritten to the new ink inside the file's own drawing code (RGB, CMYK, grey; forms nested up to 6 deep).
  - A colour belongs to its nearest scanned ink. CMYK gets more room because 100% K shows as #2c2c34 on screen.
  - Nothing is turned into pixels.
  - It's a PDF-based file, which Illustrator opens as editable art. **Check the first real one in Illustrator.** If it doesn't open as .ai, it becomes `_setup.pdf`.
  - No per-ink layers: Illustrator drops PDF layers. Each ink is one colour, so Select › Same › Fill Color picks it.
- **Falls back to the v145 layered PSD** when it can't stay vector:
  - background dropped, turned, an ink erased;
  - layers picked or the background knocked out in the picker;
  - pieces, upscale or trace;
  - a turned page;
  - or no colour in the file matched the changed ink.
- **Unchanged vector art** still isn't copied: the original is the file.
- **Download setup file** (was Download setup PSD) gives whichever one the imprint gets.
- Tested (Chromium) on a generated vector page with a CMYK black bar, an RGB red circle and a grey bar:
  - red → green: 1 swap, no pictures in the file, 12″ wide, cut to the art;
  - all three changed: 3 swaps;
  - raster art still gives the layered PSD.

## 2026-11-03 — v147
Stephen, his photo of a mocha hoodie on a grey studio wall: "when it was removing the background it got a little intense". White blotches appeared across the lit hood and right sleeve.

- **Cause:** the backdrop is shaded (lighter in the middle, darker at the edges). The clean-up loosened its colour match to cope (up to 90 apart, steps of 14), then crept along the fabric's lit side, which is close to the light grey.
- **Fix, in "Your photo" › Front / Back:**
  - A pixel more colourful than the backdrop is never backdrop.
  - The reach is capped at 70 and steps at 10.
  - The clean-up is redone inside the backdrop shrunk by 3 px, then grown back, so it can't slip through gaps narrower than ~7 px.
- **Tested** on Stephen's photo:
  - v146 blotches on the hood and sleeve; v147 keeps the whole hoodie.
  - Same garment box, about 0.4 s.

## 2026-11-03 — v148
Stephen, on his mocha hoodie photo (on a person, cut off at the thighs): "the 11" wide print feel[s] smaller". I offered two fixes: "let's do both!"

- **A person cut off at the bottom is sized by the head.**
  - The photo was sized as head-to-shoes = the height typed. When the person runs off the bottom of the photo, that squeezed the whole height into half a body; this photo drew the print about 40% small.
  - Now the head's width is used instead: the widest row before the outline narrows into the neck, taken as 0.106 of the height (≈7.4″ at 5′10″). It's never smaller than the old head-to-shoes figure.
  - The collar line starts 1½ head-widths below the top of the head.
  - The garment line says "(cut off at the bottom, so by the head)".
- **Hem width:** a new box next to the height.
  - Type the garment's spec hem width, e.g. 22. A yellow "hem 22″" bar sits on the hem (first guess: the run through the middle, 80% down a cut-off photo, 55% otherwise).
  - Drag the bar up or down, or either end to the hem's edge.
  - The hem wins over the height, and the photo can be used with just the hem.
  - Saved per style + colour + side on this computer (`pine_mk_hem`). The bar shows on screen only, not on the proof.
- Tested (Chromium) on Stephen's photo with a 5′10″ height:
  - v147: 12.5 px/in.
  - v148 by the head: 18.6 px/in.
  - v148 with a 22″ hem: 17.0 px/in, with the bar on the hem; the guess runs a little wide over the right arm until its end is dragged in.

## 2026-11-03 — v149
Stephen, with Elwood's "CORE HOODIES" line sheet (4 pages, one colour a page, front and back flats on white): "can you also make the photo upload be able to upload a pdf and then select the garment I need".

- **Front / Back photo (and Add photo) take a PDF.** A window shows every page (up to 40) with its garment photos, found as separate pieces on the page. Under each photo are **Front** and **Back** buttons; a page with two photos also gets **Use both (front + back)** (left = front, right = back).
- **The page naming this garment's colour is first and outlined.** It's read from the page's text. Elwood draws its names as shapes, so when a PDF has no text, the header above the photos is read with the same OCR as Retype; the cards are renamed and re-sorted as it reads ("CORE HOODIE - CH0001W · VINTAGE BROWN").
- **The chosen photo** is cut from the page at about 200 dpi, with a little room around it, then cleaned and measured like any photo you add.
- Tested (Chromium) on the Elwood PDF with an Elwood CH0001W Vintage Brown line:
  - the four pages were read and named, with Vintage Brown first;
  - Use both gave a clean front and back (flats, not on a person).

## 2026-11-03 — v150
Stephen, Elwood CH0001W from the v149 PDF picker: "now the back is too small and the 11" wide print looks huge. where is the adjust hem height button".

- **Hem width for every photo.** Garment › Change, next to Body length: "Hem width (in) · optional".
  - It's one hem per style + colour, the garment's, with the bar's spot remembered per side. Saved on this computer (`pine_mk_hem`); v148's per-side entries carry over.
  - Set it and each side is sized from its hem. A yellow "hem 24″" bar sits just above the lowest point of the garment's middle; drag its ends to the hem's edges, or the bar up and down.
  - Before, it was only next to the height of a person, so a flat lay had no way to set it.
- **A hoodie's back now matches its front's width.**
  - v144 counted ~1″ of hood above the shoulder on every back. That's right for SanMar's DT6102 (hood lying down), not for a flat whose hood stands, like Elwood's.
  - With a front photo too (and no hem set), the back is scaled so its body is as wide as the front's.
- **Elwood's sizing in this test:** the CORE hoodie is boxy, so sizing by the default body length draws it narrow (~22″) and the print large. With its 24″ hem the print draws 10% smaller.
- Tested (Chromium) on the Elwood PDF: front 4″ and back 11″ prints, then a 24″ hem with the bar on both sides.

## 2026-11-03 — v151
Stephen typed Elwood's spec: "Length 26 1/2" x Chest 52 1/2"". The result: "makes it huge and the 11" print super super tiny".

- **The box takes a spec sheet's chest.** Elwood's chest is all the way round. 52½″ taken as "across" drew the hoodie twice its width (26¼″ laid flat), so the print came out half size.
  - 36″ or more is now read as all the way round and halved, and a toast says so ("52½″ is all the way round, so 26¼″ across").
  - "52 1/2" is read as 52.5.
  - The box is now "Width (in) · chest or hem, optional".
  - The bar reads "26¼″ across".
- **Where the bar starts** (Stephen: "is chest laid flat really include the sleeves as well?" — no): at chest height, side seam to side seam on the body only.
  - The ends come from the body's sides at the bottom: each half of the narrowest run through the middle, just above the hem where the cuffs don't touch, with the narrower half mirrored.
  - An earlier build of v151 spanned the arms, which made the garment look too wide.
- **Vendor flats fold the sides under.** On Elwood's photos the visible body is far narrower than the 26¼″ chest. Sized by that width, the hoodie would come out ~50″ long.
  - For styled flats, Body length (shoulder to hem) is the number to use, and the width box's tip and toast say so.
  - With Elwood's M length (26½″) and no width, the size is consistent: hood ~4½″ above the shoulder, the cuffs about level with the hem.
- **The collar line stays put** on a flat with a width set. In v150 it moved, because the person-photo collar rule was applied to flats.
- Tested on the Elwood PDF with "52 1/2": stored as 26.25″. The bar runs on the body only on both sides, and the collar lines are back.

## 2026-11-03 — v152
Stephen, Elwood CH0001W with 26″ across: "still looking huge compared to the print". Then: "I can't zero out the width and only use the height".

- **A width that doesn't fit the photo is set aside.** On a flat, the width is checked against the photo's own length (Body length + what stands above the shoulder).
  - More than 20% off → the photo is sized by the length, and the yellow bar reads "26″ across doesn't fit this photo — sized by body length".
  - Elwood's flats fold the sides under, so 26″ across the visible body had made the hoodie ~50″ long.
  - Photos on a person aren't checked: the bar there is placed on the hem by hand.
- **0 clears the width**, as well as an empty box (0 was refused as "too small"). It says "Width off — sized by Body length". The placeholder is "e.g. 26 · empty = off".
- Tested on the Elwood PDF:
  - With 26″, the sizes match no width at all (front 27.0, back 30.25 vs 29.9 width-matched), and the bar carries the note.
  - "0" empties the store and the sizes go back.

## 2026-11-03 — v153
Stephen: "based on the sizing I provided from the vendor do you think this is how large an 11" wide print would look? still feels huge".

- **The back still matches the front's width** when a width has been set aside (v152). Without this, the back fell to its own length with ~1″ counted above the shoulder, but Elwood's back hood stands up. On the Elwood test that was a ~1% difference.
- **Why it still feels huge** (not changed here):
  - Against the length (26½″), the 11″ print is drawn true to size.
  - Elwood's photos fold the hoodie's sides under. Measured from its length, the visible body is ~18–19″ across, but the real chest is 26¼″. So the print takes up ~60% of the visible width, where on the real hoodie it would be ~42%.
  - Option offered to Stephen: stretch the photo sideways to the spec's proportions, or use an unfolded flat (our own photo of a blank).

## 2026-11-03 — v154
Stephen: "Widen to spec ... sounds like a good idea" · "we just need to have tools to make it look more realistic to the final print".

- **"Widen the photo to this width"** is a tick box under Width, shown once a width is set. It's for vendor flats with the sides folded under, like Elwood.
  - The photo keeps its true length scale (Body length).
  - It's stretched sideways until the yellow bar is the spec width, from ×0.8 to ×1.6. The garment then has its real proportions, so the print looks as big as it will on it.
  - The bar reads "26¼″ across · photo widened ×1.60". Drag its ends onto the side seams and the stretch follows.
  - Everything that maps onto the photo follows the stretch: prints, fabric look, sleeve placement, the long-sleeve mask, and the bar's drag.
  - Saved per style + colour (`pine_mk_hem` › widen).
- **The width bar's first spot:** at chest height, halfway between the hem's body-only ends and the outside at chest height (sleeves included). On a flat the side seams sit under the hanging sleeves. The hem rib alone had given ×2.
- **The "doesn't fit this photo" note** now says to tick Widen the photo.
- **Tested on the Elwood PDF** with Length 26½″ and Chest 52½″ (26¼″ across), Widen on: ×1.6 on both sides. The body comes out about as wide as it is long, as the spec says, and the 11″ back print covers ~45% of the width. Without Widen, a width that doesn't fit is still set aside (v152).

## 2026-11-03 — v155
Stephen, on Widen: "squishes it a little too much since it looses the height as well now".

- **A widened photo keeps its height.** It had been shrunk to fit its slot's width, so the garment lost height along with it.
- **It may run up to 20% past its slot.** At 30% the outer sleeves were cut off at the edge of the view.
- **No white box over the next side.** A widened photo is drawn from the cut-out (no white background), so it can overlap the side next to it.
- **Tested on the Elwood PDF** with Widen at ×1.6: both sides stay taller than in v154 and are fully in view, and the 11″ back print reads at a believable size.

## 2026-11-03 — v156
Stephen: "still pretty squishy but we are getting closer" · "can you show me a visual line for how we are doing the height of the hoodie".

- **Widen stretches only the body.** Only the part between the yellow bar's ends (the side seams) is widened toward the spec width. The sleeves keep their own width and move out. The photo is drawn in three pieces, and prints, the fabric look, the long-sleeve mask, sleeve prints and the bar all use the same mapping. It can now go up to ×1.8.
- **Widen slider** next to the tick: 0% is the photo as it is, 100% is the spec width (`pine_mk_hem` › widenAmt), so it can be set by eye. Elwood's spec (26¼″ × 26½″ body) is as wide as it's long, and the full spec looks heavy on its styled photo.
- **Height line** (on screen, beside a flat photo, at the garment's left edge):
  - a solid span: "26.5″ body length · shoulder to hem (size M)", measured up from the bottom at the photo's scale;
  - a dashed span above it: "+4.5″ hood above the shoulder" (or collar).
  - It shows how the app splits the photo's height, so a wrong body length or hood allowance is easy to spot.
- Tested on the Elwood PDF with Length 26½″, Chest 52½″, Widen at 60%:
  - ×1.48 on both sides, sleeves at their own width;
  - height lines: front +4.5″ hood, back +1.5″.

## 2026-11-03 — v157
Stephen: "looks like the line goes down the sleeve vs just to the bottom hem".

- **A flat's height runs to the hem, not the cuff.** On a hoodie or crew flat, the garment box ends at a sleeve cuff hanging below the hem. The size and the height line now run to the bottom of the hem at the middle of the garment (`hemBot`, found when the photo is read).
  - Body length + the hood allowance now covers top-to-hem, not top-to-cuff.
  - On Elwood's flats this draws the garment ~10% bigger (the print relatively smaller).
  - Tee flats are unchanged: their hem is the lowest point.
- **The height line sits on the body.** It's just inside the width bar's left end, or 3.5″ left of the middle. Its body-length label is lower, clear of the width bar's label.
- Tested on the Elwood PDF:
  - the line ends on the hem rib on both sides;
  - sizes front 27.0 → 24.4 and back 29.9 → 27.0 px/in (no width set).

## 2026-11-03 — v158
Stephen: "the back should start closer to where I have the collar distance one that is usually how they size from that top seam part on the collar on one of the edges".

- **The back is sized from its collar line** once that line has been dragged by hand.
  - On spec sheets, body length runs from the high point of the shoulder (where the shoulder seam meets the collar) to the hem. From the back, that's about ¾″ above the back collar seam.
  - So: hem (at the middle) − collar line = body length − ¾″.
  - The back's height line then starts there, and whatever is above it is shown as hood.
  - Until the collar line is set, the back still matches the front's width (v150), because the default collar spot on a hoodie back can be the hood's point.
  - A hem width that fits the photo still comes first. With Widen on, the widen scale uses the collar sizing too.
- **Tested on the Elwood PDF** with the back collar line set on the hood seam:
  - the back's body-length line starts just above the collar line, with +3.8″ hood above it;
  - the back draws ~11% bigger than when matched to the front (28.3 → 25.2 px/in).

## 2026-11-03 — v159
Stephen, editing an old proof (10282 → 11135) and attaching it: "clicking attach the updated numbers but nothing is happening" · "oh it is saying it is too big for Airtable....but this old proof is from Airtable" · "so maybe we need to increase the MB send".

- **An edited proof over 5 MB attaches.** Airtable's own window takes big files, but the upload apps use is capped at 5 MB, and that cap is Airtable's to set.
  - When the edited PDF is over 4.9 MB, it's rebuilt with each page (edits included) as a picture: 150 dpi JPEG, then 125, then 100 if still too big. That's how our own proofs are made.
  - The button reads "Making it smaller…" meanwhile. Download still gives the full-size file.
- **Messages show on top of an open window.** The "too big" message was behind the PDF editor, so it looked like nothing happened.
  - A toast now goes into the open dialog.
  - Long messages stay up longer (up to 9 s).
- **Tested** on a generated 4-page, 62 MB worst-case PDF (noise images): 4.3 MB at 150 dpi in ~1 s, 4 pages at the same page size. The toast appears inside the open PDF window.

## 2026-11-03 — v160
Stephen, a Supacolor logo (Integrated Pediatric Therapy / Iron Horse, a white panel inside a black frame with a heart sitting over the top edge): "we still need the white in the image inside the black lines to be filled in".

- **On a heat transfer, the background drop keeps the white inside an outline.**
  - The edge-in background removal got through the tiny gap where the heart's own white meets the frame, and knocked out the whole inside panel.
  - On a transfer that white is printed, so the removal is now redone inside the background shrunk by R (≈0.6% of the art's size), then grown back. It can't pass gaps under about 1% of the art's size.
  - Screen print is unchanged, because there the white inside can be the garment.
- **Tested** on Stephen's logo as a heat transfer:
  - v159: the left panel's white was dropped (alpha 0 in the middle).
  - v160: it stays (255), and the outside is still dropped.

## 2026-11-03 — v161
Stephen: "since supacolor is a full color printing option we don't really need to pull colors...can you have an agent scan mockups that have supacolor and grab how those look".

An agent read 14 of the art department's Supacolor proofs in Drive (2022–2026). The 2026 ones show:
- the **Supacolour logo** under "Colors" in place of ink chips (10401, 10482, 10948, 11094);
- no OW / BASE / Pantone chips;
- shirt headings the same as screen print ("FRONT - 10948-A");
- one transfer note, on V4 10482.

What changed in the app:
- **Heat transfer imprints don't pull colours.**
  - The Colours list in the Art step is off for a transfer. A line under the method says why: "colours aren't pulled — the proof shows the Supacolour logo under Colors, and white inside the design stays".
  - The proof's Colors area shows the Supacolour logo (`assets/supacolour.png`, the image from the art department's proofs).
  - The setup PSD's ink layers ignore it.
- **The heading drops "HEAT TRANSFER ·"** (page 1, the proof page, close-ups), matching the art department's "FRONT - 11140-A".
- **New note** "PLEASE NOTE: SUPACOLOR TRANSFERS CANNOT CONTAIN TRANSPARENCIES. A SOLID SHAPE WILL BE PLACED BEHIND ARTWORK TO MATCH THE GARMENT COLOR, BUT A PERFECT COLOR MATCH CANNOT BE GUARANTEED".
  - Its wording is the art department's.
  - It's suggested for a transfer whose art has see-through edges (over 8% part-transparent pixels).
- **Tested** with Stephen's logo as a heat transfer:
  - the Colours list is hidden and the line shows;
  - page 1 has "FRONT - 11140-A" and the Supacolour logo under Colors;
  - the white inside the frame is kept (v160).

## 2026-11-03 — v162
Stephen, on v161: "not seeing the white in the design staying" · "nope still not working".

- **Switching the method redoes the background drop.** It used to be done once, as whatever the method was when the art went in (screen print). Switching to Heat transfer afterwards kept the knocked-out inside.
- **On a transfer, "drop it everywhere" works from the edges too**, so the white inside outlines is kept: on a transfer that white is printed.
- **Tested** on Stephen's logo, art in as screen print, then switched to Heat transfer:

  | Version | Middle of the white panel |
  |---|---|
  | v161 | alpha 0 after the switch, 0 with "everywhere" |
  | v162 | 255 after the switch, 255 with "everywhere" |

## 2026-11-03 — v163

Stephen, on the IPTA / Iron Horse logo as a heat transfer: "still getting this", then "oh is that because the box has a slight opening?", then "let's also still have an option for a full removal of the background in heat transfers as well.....and the options to re color colors".

- **Yes, the opening was the cause.** The frame is broken where the heart sits on it. The seal that stops the background drop slipping through a gap (v160) was 0.6% of the file's size. On the full 2000 px file that was enough. The "Design 1" tile pulled from the file is a tight 1531 px crop, so the seal came out 9 px, and 10 were needed to close the gap beside the heart. The seal is now 0.9% (min 4 px).
- **Auto-drop on transfers.** When a transfer's art sits on a plain solid edge (every border pixel opaque and the same colour), "Art has a solid background — drop it" is ticked automatically. This happens when the art is opened and when the method is switched to Heat transfer. Unticking it keeps it off.
- **"Everywhere" is a full removal again on transfers.** It removes every pixel of the background colour, including white inside outlines. Leaving it off keeps the white inside (the default for transfers). v162 had made it edges-only.
- **Recolour on transfers.** The colour list shows on transfers again, titled "Recolour". The proof still shows the Supacolour logo under Colors, not ink chips. The method hint now says so in one line.

## 2026-11-03 — v164

Stephen, 11136: "I used the provided .ai file and it still sent a .PSD file", then "oh I did remove the background".

- A vector setup .ai was only made when the approved art matched the file exactly. Dropping the background (or knocking it out, hiding a layer or stripping crop marks in the picker, rotating, erasing a colour) quietly fell back to the PSD only.
- Now art opened from a vector file always sends `<stem>_setup.ai`. It is the customer's vector at print size, with the colour changes made.
- When the approved look can't be kept exactly in vector, the layered `<stem>_setup.psd` goes alongside it. The .ai still has the background, and the separator removes it in Illustrator. The PSD shows exactly what was approved.
- The same applies to Download setup file, which zips both.
- Tested with a PDF holding a white background box: untouched gives the .ai only; with the background dropped it gives the .ai (12″ wide) plus the PSD.

## 2026-11-03 — v165

Stephen, on the 11136 bandana proof: "seems like Discharge is said a lot and the bandana color is funky", and "make sure the swatch boxes all stay the same and stack text if needed. Scan past mockups to find the pattern".

- **Swatches.** An agent read about 20 art-department bandana proofs made before 2026-10-20 and measured three of them. Every box is the same ~20.7 pt square, with one word per line ("OFF / WHT / DC", "179 / DC") in bold at about 9.5 pt. Light colours get an outline.
  - The bandana page's swatches used to grow wider for long names ("OFF WHITE DC"). Every proof page now uses the garment template's fixed-square rule.
  - Names now start at 9.5 pt (8.5 pt for two lines, 6 pt for three) and shrink only to fit.
  - WHITE / CREAM / BLACK read WHT / CRM / BLK, and "OFF WHT DC" goes on three lines, as the art department writes them.
- **Discharge said once.** Past proofs show it as DC on the swatches, plus a caution note when there is one. A bandana's page 1 keeps its "Print · Discharge" in the spec panel and page 2 keeps "Print: Discharge". The extra "· DISCHARGE" after the heading (page 1 and close-ups) is gone on bandanas. Garment proofs are unchanged.
- **Bandana colour.** Rendering the real 11136 proof showed:
  - Page 1 drew the bandana as fabric (weave, soft shading, ink sitting in it).
  - Page 2 drew a flat, wider-than-tall box of #004d28 with brighter cream ink, so the two pages didn't match and page 2 didn't look like a square bandana.
  - Page 2 now draws the bandana square, exactly as page 1 does.

## 2026-11-03 — v166

Stephen: "we can also remove the Print:Discharge on the close up. that isn't normal for us".

- The close-up page (page 2) no longer has the "Print: Discharge" line, on any garment. The inks' DC says it, as on the art department's proofs. "Garment:" still shows when the page names a garment.
- Page 1 of a bandana proof no longer shows "Closest Pantone 3537" under the bandana colour (Stephen: "remove the closest color reference that is just internal for customers it is just forest green"). The app still draws each bandana in its closest Pantone. The proof shows only the colour name.

## 2026-11-03 — v167

Stephen: "can we also get nerdy and really clean up the spacing of the text on the left side of the mockup".

The bandana proof's left column is now on the art department's grid, measured off their bandana proofs 4747 and 7649:
- **Groups:** Bandana Color / Fabric Content / Bandana Dimensions (and Print · Discharge when it's discharge). Each is an 8 pt label with its 17.5 pt bold value 0.29″ below it, one group every 0.56″. Text sits 0.47″ from the edge, and a long colour name shrinks to fit. The groups end above the print block. Before, the gaps were uneven and there was a big empty space under Order #.
- **Print block:** the same block as the garment template (rule, heading, Width/Height, Placement, rule, Colors, swatches), with its first rule at 5.02″ as on their proofs. Semi-opaque swatches go under the colours when there's room, else beside APPROVED.
- **Heading:** a bandana's print heading no longer adds "· DISCHARGE" here either.
- **Checked:** a tee's page 1 is pixel-identical to v166.

## 2026-11-03 — v168

Stephen: "almost...looks like you are still adding some wording. can you pull up the reference and this one so we can compare and also the line weight on the approval box on page 1 is way thicker than page 2 and page 2 is more accurate also some blue text is gets added that doesnt need to be there".

I compared his V2 11136 proof side by side with the art department's 11048 L.A. TACO bandana proof.
- **Wording:** page 1 has no "Print · Discharge" group (the inks' DC says it). The print heading reads "PRINT - 11136-A" and the colours label "COLORS" in bold caps, as 11048 does.
- **APPROVED box:** page 1 uses the same thin-line box as page 2. It was the old box with a thick black frame.
- **Blue text on page 2:** a bandana's note ("EXPECT SEMI OPAQUE PRINT") sits centred in blue between the header and the bandana, as on 11048. It was tiny at the bottom-left. Page 1 still shows the semi-opaque swatches instead of the note.

## 2026-11-03 — v169

Stephen: "looks like we are missing the blue text on the front that has the warning".

- Page 1 of a bandana proof now has the art department's blue note beside APPROVED, word for word as 11048: "PLEASE NOTE: SIZING IS NOT TO SCALE ON / GARMENT REPRESENTATION / (REFER TO PRINT LOCATION FOR ACTUAL SIZE)". It is 7.5 pt bold, 3.25″ in, level with the APPROVED box.
- The print's own notes (if any) now start further right, at 6.05″.

## 2026-11-03 — v170

Stephen, 11136 V2: "did the code go back to only doing .psd files or do you think it is something that happened when I picked back up vs re uploading the .ai again".

- **Cause:** the pick-up. A saved setup ("Pick up where you left off", from this computer or the "… Mockup Maker setup.json" on Drive) brought the art back as a PNG only. The customer's vector file wasn't saved, so after a pick-up only the PSD went to Seps. Reproduced in v169 with a vector bandana with its background dropped: the .ai + .psd before saving, only the .psd after a pick-up.
- **Fix:** the setup now keeps the vector file (a Blob on this computer, a data URL in the Drive copy) and a pick-up restores it. v170 gives the .ai + .psd both ways.
- **Size:** the Drive setup grows by about 1.35× the vector file. A 2.5 MB .ai adds about 3.4 MB, well under the 24 MB limit.
- **Older setups** saved before v170 don't hold the vector file, so for those, open the .ai again once.

## 2026-11-03 — v171

Stephen: "also for location it should just always say Front". An agent also collected the close-ups (page 2) of 12 past art-department semi-opaque bandana proofs (10426–11030).

- **Location:** a bandana's close-up always reads "Location: Front", as on every one of those proofs.
- **Notes:** a bandana close-up shows one note per line, centred above the bandana, with "EXPECT SEMI OPAQUE PRINT" last (as 10978, 10994 and 11030). v168 put them on one line joined with "·".
- **Not changed yet:** those proofs draw the close-up bandana as a flat square of the fabric colour. Ours has the fabric texture since v165. This waits on Stephen.

## 2026-11-03 — v172

Stephen: "can you see why the NDLON updated to new numbers not save the proof to the drive folder?"

- **Cause:** "11135 | LS15001-NAT.pdf" went onto line 11135-A in Airtable at 18:50 UTC. The "11135 - NDLON" Drive folder didn't exist until about 19:12 UTC. With no folder for the order, saving to Drive skipped quietly: the toast just said "Proof attached" with no "and saved to Drive".
- **Fix:**
  - The toast now says the proof wasn't saved to Drive because there's no folder for the order yet.
  - The app tries again every 3 minutes for 30 minutes while the page stays open. It saves the proof as soon as the folder appears, then the setup and the print art too if the same order is still open.
  - After 10 tries it says to attach again once the folder exists.
- **Tested:** with a stand-in Drive, it saved on the 3rd try; with no folder ever, it gave the closing message after 10 tries.

## 2026-11-03 — v173

Stephen: "yep! 85% is a great opacity for those". An agent measured the semi-opaque swatches on 19 art-department bandana proofs (10426 … 11048). Every one uses the same template, and page 1 now matches it:
- **Squares:** two 1.00″ squares, 0.10″ apart, 0.10″ under the colour chips. That puts their top at about 6.34″, as on 11048.
- **SEMI-OPAQUE:** the Pine logo in white at 85% on the bandana colour. FULLY-OPAQUE: white at 100% on near-black #110F0D.
- **Logo colour:** always white, whatever the ink. Before, the logo used the print's lightest ink at 60%, which read too dull and too tinted.
- **Logo size:** 0.68″ wide (68% of the square), a little above centre.
- **Captions:** 9 pt bold process cyan #00A1E0, 0.19″ under the squares.
- **Below the swatches:** a bandana's APPROVED box moved to 7.6″, as on their proofs, and the blue sizing note moved with it.
- **No room:** when the colours run to two rows, the swatches go beside APPROVED, smaller but in proportion.
- 2026-11-03, Stephen on the close-up's bandana: "No I like the fabric texture". Page 2 keeps the textured bandana (v165), unlike the art department's flat square. Don't change it.

## 2026-11-03 — v174

Stephen: "S&S has value cap 300A but it is not pulling in that hat".

- **Cause:** S&S lists the hat as **VC300A** (Valucap's short prefix, styleID 494). The app searched S&S for "300A" (nothing found), then for the brand name in front ("VALUCAP300A", also nothing).
- **Fix:** when both fail, the app looks in S&S's full style list (cached a day) for the brand's style ending in that number, allowing up to 4 extra letters in front. It uses it only when exactly one such style exists. Brand names match loosely, so "Valucap" and "Value Cap" both work.
- **Tested live through the worker:** v173 found nothing for 300A. v174 finds 494 for both "Valucap" and "Value Cap", with its front and back photos. 1717 and OAD 108 still resolve as before.

## 2026-11-03 — v175

Stephen (screenshot of 11131-D, Patch): "should it be trying to open the main customer folder and not a specific letter".

- **Cause:** 11131's Embroidery folder holds imprint folders "11131-A" and "11131-B" (made 18:59). Drive's search for the order number finds those too, and the app took the first result. So "This order" opened the empty 11131-B. Proofs, setups and print art would also have been saved there. The proofs attached earlier today went in before those folders existed, so they're in the right place.
- **Fix:** `orderFolder()` picks the order's own folder ("11131 - Lydia Cruz Illustration"; any "NUM - …" name) first. Then any name that isn't an imprint letter. An imprint-letter folder ("11131-B") is used only when it's the only match. Opening, saving and Find the art all go through it.
- **Tested** with the folders returned in different orders: it always picks the order folder.

## 2026-11-03 — v176

Stephen, 11131-B (an embroidered dog on a Burgundy corduroy BA703 cap; the customer wrote "Ebony and Bone White (I would like the negative space in the png to be filled in with the bone white)"): "thoughts on how we could handle something like that in the mockup creator?", then "also need to create logic to help this image wrap around curved surfaces if this is all the stock photos have".

- **Fill the open space inside the outline** (a new checkbox under "Art has a solid background — drop it"):
  - The see-through or dropped space inside the drawing's outline becomes solid white. The outside stays clear.
  - Gaps in a sketchy outline are sealed, the same way as transfers (0.9% of the art's size).
  - White then appears in the colours, and you tap it to recolour it to the thread or ink asked for (Bone White).
  - It's kept in the setup and comes back on pick-up.
  - Tested on a transparent ellipse with a gap: inside filled, outside clear, the dark patch untouched, and colours read White + Black.
- **Curve round the crown** (cap or beanie photo):
  - Wrap / Turn / Arc sliders under the placement, plus Flat.
  - The art is laid on a cylinder. **Wrap** sets how far round it goes; it starts from the print's width on a ~3.2″-radius crown (3.5″ for a beanie), so a 4″ cap print starts at 50. The sides squeeze in and shade a little.
  - **Turn** is for a 3/4 photo, so one side squeezes more. **Arc** makes the ends rise (+) or drop (−); a cap starts at 10.
  - Only the mockup on the photo curves. The proof's close-up and the setup file stay flat.
  - Kept in the setup.
  - Tested on the real S&S BA703 Burgundy photo through the worker: flat, default and turned −25 all look right.

## 2026-11-03 — v177

Stephen (11131-B dog on the BA703 cap):
- "can we keep working on this and maybe just try and make it one slider....just need it to disappear or become part of the hat fold. I believe photo shop has a mockup filter for this"
- "also the fill get it a border as well instead of just filling inside"
- "it is saying this image is a stitch already but it is not...so can we have that be a toggle"

**Blend into the hat** is one slider (0–100, starts at 50, plus a Flat button). It replaces v176's Wrap / Turn / Arc and follows how Photoshop mockups work (Displace filter with a desaturated, blurred copy of the photo, plus Multiply / Blend If shading, plus a warp):
- **Curve:** the art goes round the crown on a cylinder. The angle comes from the print's width on a ~3.2″ crown, times the slider. It never goes past the visible edge.
- **Turn:** which side turns away is read from where the print sits against the photo's garment box (left of it on a 3/4 photo → the left side turns away), capped at ±35.
- **Fade:** the edges darken and fade as they turn away, so the art goes into the fold.
- **Folds and shadows:** the print is drawn first (stitches or ink, on its own layer). Then the photo under it is read as blurred luminance (a 120-wide grid, blurred twice, bilinear). Its slope pushes the print's pixels (displacement) and its darks shade them (multiply-like, strength from the slider).
- **Still flat:** the proof's close-up and the setup file.

**Fill without a border:** v176 also whitened the line's soft outer edge, which made a white halo round the drawing. Now only see-through pixels inside are filled, and a soft edge pixel is filled only where it touches the fill. The seal is finer (0.5%), so less gets filled between legs.

**Already a stitch picture:** the "this art is a stitch picture already" guess is now a checkbox in the Stitches row. Untick it and flat art gets the stitch look. It's kept in the setup. The curved / shaded copy carries the art's own answer, so the shading isn't mistaken for thread texture.

**Tested** on the S&S BA703 photo through the worker with an embroidered test design at 0 / 50 / 100: clean stitches, folds shading over them, and the left side fading where the crown turns. An earlier draft shaded before the stitches, which drew contour lines; the stitches now go first.

## 2026-11-03 — v178

Stephen: "also what are the measurements on a hat like that....can we use the specs on the site and reverse engineer how it might look to size?"

- **Before:** a cap photo was sized as if the whole hat, brim included, were 8¼″ wide. A 3/4 photo's brim made that drift.
- **Now:** a cap is sized from its **crown height**. Crown top to the brim seam on the photo = the crown height + 0.3″ for the button.
  - The crown height comes from S&S's spec sheet when the style lists "Crown Height" (VC300A 3″, 6245CM 3⅛″; checked live). Otherwise 3″ for a low-profile / dad / unstructured cap, 3½″ for a trucker / structured / high one.
  - BA703 has no spec rows on S&S, so it uses 3″.
- **Brim seam line:** a yellow dashed line labelled "brim seam · 3″ crown". It starts at 64% of the hat's height and can be dragged onto the real seam. It's saved per style and colour, the same way as the collar line.
- **Placement:** the front panel's middle (Down from center 0) sits half a crown above the seam.
- **Tested** on the S&S BA703 Burgundy photo: a 4 × 2.1″ print fills the front panel as on a real cap, in line with S&S's suggested 2¼ × 4½″ area for VC300A.

## 2026-11-03 — v179

Stephen (screenshot of the dog on the BA703 cap): "looks like the new one tool just stretches it and then fades it vs bends it to the hat … and the image is still hanging off the hat vs feeling like it folds around".

- **Why v177 looked wrong:** it mapped the curved art back into the full print box, which stretched the part facing you. It then faded the turned-away part, which washed the white chest grey. And nothing kept the art inside the hat.
- **Now a true projection round the crown:**
  - The art is laid round the crown at its real size: its arc length = its width, radius from the slider. The part facing you stays 1:1, the turned-away part gets narrower, and the art's own middle stays where it's placed. The box shrinks to the projected width.
  - Every line curves as a circle round the crown does seen from a little above: lowest where it faces you, higher toward the sides (tilt 0.16, more with the slider). The turned-away side darkens a little.
  - **Cut to the hat's outline** (the photo's garment mask, as for long-sleeve prints), so whatever goes round the side disappears behind it.
  - The photo's folds and shadows still go over the finished print (v177).
- **The slider:** starts at 40, which is the print's true angle on a ~3.2″ crown; higher bends more. Turn is read from where the print sits on the photo (up to ±60).
- **Tested** on the S&S BA703 photo, with an embroidered test design 0.5″ left of centre, at 0 / 40 / 100.

## 2026-11-03 — v180

Stephen: "still looks like the blend is fading it vs shouldn't that tool just be how it folds against the hat?"

- **Renamed:** the slider is now **Bend round the hat**, and it only changes the shape: how far the art goes round the crown and how much its lines curve. 40 is true to a dad hat's curve.
- **What made it read as a fade:**
  - The slider also set the strength of the photo's fold shading. That shading is now fixed and light (0.3), the same at any bend.
  - The turned-away side was darkened up to 45%. Now it's at most 12%, and only right at the turn.
- **Tested** on the S&S BA703 photo at 40 and 100: the whites stay white to the edge, and the art bends and tucks behind the side.

## 2026-11-03 — v181

Stephen: "looks like when I click an embroidery option for the visual it just removes all the options" and "I noticed you are not following the curve of the bill? can we build the frame to include those curves".

- **Stitches row stays:**
  - **Cause:** shaded art (the pencil dog) reads as "blended tones" once its colours are scanned. That showed it as print and hid the whole Stitches row. The click redrew the panel after the scan.
  - **Now:** the row always shows for embroidery. Picking a style stitches shaded art anyway (`a.embForce`, kept in the setup).
  - **Tested** by forcing "blended": in v180 the row went hidden; in v181 it stays through Satin / Fill / Auto.
- **Curves on the frame:**
  - A bent hat print's dashed frame follows its curve: top and bottom edges from the projection.
  - The yellow brim-seam line bends the same way, as the crown's circle at the seam, lowest where it faces you.
  - Flat prints keep the straight box and line.
  - **Tested** on the S&S BA703 photo at 40 and 100.

## 2026-11-03 — v182 + v183

Stephen: "curve should be the other way....since the bill curves down", "looks a little high still vs hugging the curve of the bill", then he drew the grid on the BA703 photo in the Hat Bend Grid page: "this is the grid it should fit inside....not necessarily how big the image can be".

- **v182 (not shipped on its own):** the cylinder bend arched the other way (high at the front, down at the sides) and the default brim seam went lower (0.69). It was a step toward v183.
- **v183: a cap's front panel.** Stephen's 4×4 points become the panel: a 4¼″ × 2″ surface along the crown, its bottom row on the brim seam. They're stored as shares of the photo's garment box (BA703 box 45, 310, 912.5 × 632.5).
  - **Placement:** a print is placed at its real size; Down / Off center are measured from the panel's middle. It's drawn flat with its stitches / ink, then warped smoothly through the panel (Catmull-Rom surface, 28×14 mesh of triangles), so it follows the crown's cone, drops with the bill, and squeezes where the panel turns away.
  - **Masking:** cut to the hat's outline; the photo's folds are still laid over it.
  - **Two starting panels:**
    - **3/4:** Stephen's, for S&S's side-on shots. Mirrored when the hat faces the other way.
    - **Front-on:** a symmetric panel measured by eye on VC300A, for straight-on shots.
    - Which is used: read from the photo (the crown reaching further one side of the garment box's middle than the other).
  - **Fit front panel** shows the 16 dots to drag onto any photo. It's saved per style and colour; Reset panel goes back.
  - **Slider:** at 100 (the default on a cap) the print lies on the panel; lower blends toward flat.
  - **Guides:** the yellow outline marks the panel ("front panel · 4¼″ × 2″"). The print's label says when it's bigger than the panel. The frame follows the warped print.
  - The proof's close-up and setup files stay flat.
- **Tested** on the S&S BA703 photo: a 4 × 2.1″ embroidered test grid follows the panel and is flagged as bigger than it (2.1″ > 2″). The panel dots show when fitting.

## 2026-11-03 — v184

An agent compared Mockup Maker's tee, front+back, hat, embroidered and tote proofs with the art department's own (10998, 11014, 10971, 10933, 10703, 10891). Stephen: "let's match the proof we are referencing so red. I would leave what we had going" (the blue "SHOWN TO SCALE ON A SIZE M GARMENT" note stays). This version does the tee:
- **Fabric bar:** only the fibre content, e.g. "100% COTTON". It used to show the vendor's whole spec line (weight, yarn, singles).
- **Notes:** a print's notes ("ANY THIN LINE DETAILS <1 POINT MAY NOT PRINT", …) go on its close-up, red bold, centred above the art, as on 10998. They're no longer on page 1 or tiny at the bottom of page 2. Embroidery notes are unchanged (pink, as on the hat proofs).
- **No BASE swatch** on the tee page; the inks only, as on 10998.
- **Close-up:** reads "Location: FRONT", in capitals.
- **Next up:** the garment on page 1 is ~¾″ wider than theirs; then the embroidered shirt (their tee layout with thread strips), the hat (square sew-out box, no fabric bar, one page) and the tote.

## 2026-11-03 — v185

Stephen: "oh we need the base swatch when we are adding a base. and I personally like the vendor's product description and would like to continue to use that".

- The BASE swatch is back on the tee page whenever a base is added. v184 had dropped it to match 10998.
- The fabric bar shows the vendor's product description again. v184 had cut it to the fibre content.
- Kept from v184: red notes above the art on the close-up, and "Location: FRONT" in capitals.
- **House choices:** where our proofs differ from the art department's on purpose, keep these two.

## 2026-11-03 — v186

Stephen: "looks like one of the mockup creator updates removed the glitter ink selectors etc".

- **Not removed:** the Effect row (None / Metallic / Glitter / Puff) is still in the colour popover; tap a colour in the list. It works the same in v144, v160, v175 and v185 on flat art.
- **Hidden since v144 when:**
  - the art reads as a photo or shaded drawing (`a.scan.photo`). That's common for client art like 11131's pencil dog. **Fixed:** effects now show for any screen-print or transfer ink, whatever the art.
  - the imprint is embroidery or a patch. Unchanged: embroidery has its own 3D puff in Stitches.
- **Tested:** with the photo flag forced, v185 hid the row and v186 shows it.

## 2026-11-03 — v187

Stephen: "I see them now....but it isn't changing the ink color I selected....also can we review the color pop up window and clean it up to really reduce scrolling".

- **Effects draw on photo / shaded art:** the per-ink effect map (`fxMapOf`) still skipped photo / shaded art, so v186 showed the buttons but nothing drew. Now it works on any screen-print or transfer art. Tested with the photo flag forced: Glitter changes the mockup in v187, and didn't in v186.
- **Colour pop-up fits one screen:** 863 → 509 px tall on a 1440 × 900 desktop, with the swatch you tapped already open.
  - **Preview:** up to 110 px tall (was 200).
  - **Controls:** the mode / scope buttons are 34 px.
  - **Colour tiles:** four across, 38 px tall with 28 px swatches (were three across at 50 px).
  - **Effect hint:** now a tooltip on the Effect buttons.
  - **Under "More":** merge, remove, erase and the resets are folded under "More: merge, remove, erase, reset".
  - Phones keep the bottom sheet.

## 2026-11-03 — v188

Stephen: "can we also review the fabric filter strength....it doesn't seem to be really doing anything when I toggle between them".

- **Measured before the fix:** on a 1717 Black, Light / Medium / Strong changed the print's tonal spread by less than 1% from each other. Two causes:
  - all three only followed big folds, which a flat vendor photo barely has (grain blurred away);
  - the result was clamped to 0.55–1.25 and then compressed with a ^0.75 curve before the strength applied.
- **Now three clear steps** (`SHADES`: fold strength, texture, range, sink):
  - **Light:** folds and light only.
  - **Medium:** stronger folds, plus about half of the fabric's own texture (the photo sharp minus its blurred self: weave, heather, garment dye). The ink is 3% see-through.
  - **Strong:** deep folds, full texture and a wider range (0.42–1.45). The ink is 10% see-through, so it sits in the fabric.
  - Thread and patches follow less, as before.
- **Tested** on 1717 Black, 3001 Heather Mauve and DT6102 New Navy. The print's tonal spread now rises clearly Off → Light → Medium → Strong (13.5 → 14 → 15.6 → 19.4 on the 1717). On the hoodie, Strong shows the zipper, drawcords and fleece through the print.

## 2026-11-03 — v189 (+ worker v39)

Stephen: "and we are grabbing the correct body length per size and style if the specs are on S&S or SanMar or AS Colour right? let's try and always use the actual product specs and not just a filler we decide".

- **Before:** only S&S spec sheets were read. AS Colour styles (S&S doesn't carry them) and SanMar-only styles (PC54 …) got our typical numbers. So did any S&S style without a row for the size.
- **Now**, per size, in this order:
  1. **S&S spec sheet**, as before.
  2. **AS Colour's own size guide**, for AS Colour styles. It's the `sizeGuideURL` image on AS Colour's store, read in the browser with Tesseract, with rows "Body Width (inches)" / "Body Length (inches)" by size. An OCR slip like "29-12" is read as 29½.
  3. **SanMar's measurements PDF**, for other styles. It's the `<specSheet>` in SanMar's product info, fetched through the new worker route `/proxy/doc` (v39) and read with pdf.js. Labels handled: Body Length / Length, Body Width / 1/2 Chest / Chest (halved).
  4. Only then the typical number, now labelled "typical … — no spec sheet found" in the garment line, so it's obvious.
  - A vendor table is kept a week on this computer (`pine_mk_vspec_v1`).
- **Tested live through the worker:** AS Colour 5001 (M 20½ × 29½, L 22¼ × 31, all 9 sizes) and 5161 (M 23½ × 28¾) read correctly, and a 5001 at size L sizes from them. 1717 still uses S&S (20¼ × 28). The table reader was also tested on two SanMar-style layouts.
- **Gaps:**
  - SanMar PDFs need worker v39 deployed; I couldn't download a real SanMar sheet from here, so check PC54 once it's live.
  - AS Colour 5102's own guide link is broken (404 on their site).
  - 5080's guide is on AS Colour's second store address, which also needs v39.

## 2026-11-03 — v190

Stephen: "can we actually make the second page in bandanas a square of color. Also do we autocrop when bringing in a png with a background? or ways to make sure it feels true to size when we set it up".

- **Bandana close-up (page 2):**
  - A flat square of the bandana's colour (Display Hex / closest Pantone), with the print on it at true scale (its size and spot on the 22″ bandana). This replaces the textured bandana from v165. Stephen's new call supersedes his earlier "I like the fabric texture" (2026-11-03).
  - Notes stay centred above, in blue.
- **Autocrop:**
  - **Already happening (unchanged):** see-through margins are always trimmed. Any picture with no see-through pixels (JPG, flat PNG) opens with "Art has a solid background — drop it" on, so its background is dropped from the edges in and the print is sized to the art. In the test, a 1500 × 1000 picture with a 600 × 300 logo was sized as the logo at 11″ × 5.5″, in v189 too.
  - **New:** art pulled from a PDF or mockup, or a flat PSD, on a plain solid edge also gets this (v163 did it for transfers only).
  - **New:** a toast says what happened and the size used: "The picture's plain background was dropped, so the print is sized to the art itself — 11″ × 5.5″. Untick … to keep it". It doesn't show on pick-up. Unticking keeps it off.

## 2026-11-03 — v191: bandanas drawn from Pine's own photos
Stephen: "Turns out we did have pictures of our actual bandanas! These should all be labeled and easy to change over to this one".
- A bandana mockup now uses Pine's own bandana photo from Drive folder `1psiFJhAPUOCn2xo8nSwMrSsjuKXL1Xwg` (the art dept's bandana photos), matched by file name (`bright yellow.png`, `burnt-orange.png`, `kellygreen.png`, …). Aliases cover the name differences (Charcoal Gray → charcoal-grey, Olive Green → olive, Brown → cocoa, Athletic Gold → gold, …).
- The photo is trimmed to the bandana and squared to the same 20″ frame as the drawn bandana, so the print sits in the same place as before. Its body colour (centre 40%) only shades the print; the page-2 colour square stays Whitney's Pantone.
- The folder list and photos load once per session through the worker's Drive routes (same login as the rest of the app). Colours without a photo (Forest, Turquoise, Purple today) keep the drawn bandana; adding a photo to the folder with the colour's name picks it up.
- Tested with mocked Drive: Black, Bright Yellow and Burnt Orange use their photos; Forest falls back to the drawn one.

## 2026-11-03 — v192: Forest uses green.png; photos checked against Whitney's Pantones
Stephen: "and then I guess we just need to cross reference that these match the pantones Whitney created for these as well." → "yes please proceed".
- All 26 photos measured (median of the centre 40%) against BAND_PMS / PMS_SHEET (ΔE2000). Close (<5): Royal, Maroon, Silver, Kelly. 5–10 (lighting): most others; shifts go both ways, the photos come from several shoots.
- Off: grey.png #848484 sits between Silver 429 and Charcoal 431; hot-pink.png #f554bf is lighter/lilac vs 219 #e01783; orange.png #e25700 is nearer 717 than 1655. Asked Stephen; no Pantone changed.
- green.png (#386237) is Forest: Forest bandanas now use it (alias FOREST → GREEN). Turquoise and Purple still have no photo.
- The page-2 colour square was already Whitney's Pantone (bandHex reads BAND_HEX first); the photo colour only shades the print.

## 2026-11-03 — v193: bandana photos shifted to their Pantones on load
Stephen (Light Blue): "our photo is a lot more green than the actual product" → reviewed a shifted Light Blue: "I think it looks great....let's just have it run on load for now while we keep dialing it in".
- When a bandana photo loads, its body colour (centre 40%) is measured and every pixel is moved in Lab by the same amount to land on the colour's Pantone from Whitney's sheet (BAND_PMS → PMS_SHEET), or the custom colour if one is set. Folds, shadows and the hem keep their light and dark. The Drive files are untouched.
- `BAND_SHIFT` (1 = all the way) sets the strength, for dialling in.
- Black, White, Natural (no Pantone) and Grey (no Pantone yet) stay as photographed. Hot Pink is shifted to 219 while Stephen checks that one.
- Tested with all 26 real photos behind mocked Drive: Light Blue #a4c7d4 → #9bb7d4, Hot Pink #f453be → #e01783, Forest (green.png) #376036 → #004d28, Burnt Orange #bb4b00 → #d65f00, Black unchanged.

## 2026-11-03 — v194: APPROVED box position saved in the proof
- Stephen (11138 PandaDoc): every mockup page had two APPROVED boxes. Line Item Review couldn't find the mockup's own box (the proof is a picture) and added one.
- Each page's white initial box is now saved in the PDF callouts (`PINE-INKS` JSON, `appr`: one `[x0,y0,x1,y1]` per page in PDF points, y up). Line Item Review v53 puts the PandaDoc initials there. Sep Maker and Mockup Maker ignore the new key.

## 2026-11-04 — v195: "On top" for prints made from several files
Stephen: "when you are bringing in more files in the mockup creator can the stack function stack on top of themselves".
- Files in this print now has **Stack · Side by side · On top · Center**. Stack still puts them one under the other.
- **On top** puts every file on top of the first one:
  - Files cut from the same page size (colour layers exported from one artboard, each trimmed) go back where they sat on that page, at the first file's scale, so they line up as drawn.
  - Any other file is centred on the first one at its own width.
- Which file is on top is the existing layer order in the file list; each file can still be dragged after.
- Tested: a red ring and blue "PINE" text exported as two 1200 px layers. After On top, the text sat centred inside the ring as on the artboard (ring 11″, text 4.64″ at 4.8″ down).

## 2026-11-04 — v196: no "· DISCHARGE" after the imprint ID
Stephen (11071-A, screenshot of "FRONT - 11071-A · DISCHARGE"): "we don't need it to say discharge after the imprint id".
- Every proof heading (page 1 info block, page 2 headings, the old layout) now reads "FRONT - 11071-A". The inks' DC chips (298 DC, 7591 DC …) already say it's discharge. Bandanas lost it in v165.

## 2026-11-04 — v197: every upload is checked for lines under 1 pt
Stephen: "when I upload a file into Mockup Maker does it scan to find any line weights under 1pt and if it doesn't can it".
- **Before:** the thin-line check (v124) only ran after Upscale or Trace to vector, and its message sat inside the art-quality box, which is hidden for print-ready art.
- **Now:** every screen-print upload is checked at its print size, one ink at a time.
  - The art is drawn at 216 dpi (1 pt = 3 px); each ink's shape is opened by 1 px, and what disappears is under 1 pt.
  - **Gaps** are checked the same way (an ink closed by 1 px), so a thin white line or cut through a dark shape is found.
  - A colour too small for the colour scan (that thin white line) counts as its own ink.
  - Counted in ¼″ squares; a run about ¼″ long counts, a pointed tip or corner doesn't.
  - Re-checked half a second after the width changes, since a line that's thin at 10″ can hold at 20″.
- **The box** (its own, under the art): "⚠ Lines or gaps under 1 pt at 10″ wide in 7626 and White — they may not hold on press." It has two buttons:
  - **Show where:** a small picture with the spots boxed in red.
  - **Add the note to the proof:** adds "ANY THIN LINE DETAILS <1 POINT MAY NOT PRINT". The button hides once the note is on.
- **Tested** (Playwright, practice): a 10″ art with red lines of 0.5 / 0.8 / 1.5 / 3 pt and a 0.5 pt white line through a black bar.
  - At 10″: the 0.5 and 0.8 pt lines and the white line were flagged; the 1.5 and 3 pt lines weren't.
  - At 20″: nothing flagged (the thinnest is now 1 pt).
  - Bold type, Georgia italic and a 3 pt ring at 11″: nothing flagged.
  - About 2 s on a 20″ print.

## 2026-11-04 — v198: Thicken to 1 pt
Stephen: "is there a way to have a simple thicken lines tool?"
- The thin-line box (v197) has **Thicken to 1 pt**. It works on the art's own pixels (`a.src`, its resolution), one ink at a time:
  1. Each ink's parts that a 1 pt opening removes (the thin lines) grow by about half a point on each side, in that ink. They grow over see-through, the dropped background or a neighbouring ink, never over another ink's thin line.
  2. A thin see-through cut inside an ink opens up the same way (the ink around it goes see-through, or the dropped background colour).
  3. Everything else is untouched.
- **After it runs:** the box says "✓ Thickened: no lines under 1 pt now." and the button becomes **Undo thicken**; the toast also has Undo.
- **Files sent:** the proof and the layered setup PSD use the thickened art. The exact-vector `_setup.ai` isn't offered for thickened art (`canVector` false); the customer's vector still goes along as the loose `.ai` (v163).
- **Not offered:** for prints made of several files, or when PSD layers are hidden (it says to turn them back on). Art under ~86 ppi at print size is told to try the 300 dpi upscale first.
- **Tested** (Playwright, practice): 10″ art at 300 ppi.

  | Line | Before | After |
  |---|---|---|
  | 0.5 pt red line | 0.54 pt | 1.63 pt |
  | 0.5 pt white cut through black | 0.54 pt | 1.63 pt |
  | 1.5 pt and 3 pt lines | — | unchanged |

  - The check finds nothing after; Undo puts back the exact original (48 spots again).

## 2026-11-04 — v199: auto-crop after erasing a background; colour changes survive rebuilds
Stephen: "can we also look at doing an auto crop once we remove the background" and "also ever time I do a change it re works all the colors and adds back colors I erased etc".
- **Auto-crop:** erasing a colour everywhere in the colour list (Erase, "this print" scope), e.g. a black box behind the type, now crops the art to what's left.
  - Same scale, so the art doesn't jump. The width becomes the art's own, and the note says "Cropped to the art after erasing — same scale as the file."
  - The toast says the new size ("Cropped to the art that's left: 4.1″ × 2″ (same scale)") and has Undo.
  - It uses the Crop tool's crop. The erase stays a colour change, so soft edges are kept.
  - A background dropped with the checkbox was already trimmed (v190).
- **Colour changes kept:**
  - **Cause:** every rebuild of the art (drop background on/off, Everywhere, Fill, Crop, layers, rotate, Thicken) threw the colour list's changes away (`buildArt` deleted `RECOL`), so erased colours came back and recolours reset.
  - **Now:** before a rebuild, the changes and the old inks are kept. After the new scan, each change follows its ink by colour (nearest within ΔE 15) onto the new list, and the mockup redraws. Ink edits (combine / rename) come back when the inks scan the same, as v29 did.
- **Tested** (Playwright, practice): a 10″ art (black box, red and blue type).
  - Recoloured red → green and erased black: cropped to 4.13″ × 2.03″ (the type's own size at the same scale).
  - The erase and the green kept their place after Fill on and Fill off (two rebuilds); the mockup shows the type only, green and blue.

## 2026-11-04 — v200: the auto-crop works on JPEGs; "Crop to the art" button
Stephen: "how does the auto crop work when removing the background I am still not seeing it".
- **Cause:** a JPEG's box isn't one flat colour. Erasing it in the colour list left faint specks (partly see-through, from the compression noise) all over the box, and v199's crop counted any pixel over 6% as art, so the box never shrank.
- **Now:** only solid pixels count (over ~38%), and a row or column needs more than a speck (0.2% of its length) to count as art.
- **Crop to the art** (new, under the colours next to Combine similar): the same crop, any time. "Already cropped to the art" when there's nothing to trim.
- **How it's used:**
  - A plain background touching the edges is dropped by "Art has a solid background — drop it" (on by default for flat pictures) and the art is trimmed then.
  - A box or panel colour inside the edge is erased in the colour list (tap the colour › Erase, All garments). That now crops right away, with Undo.
- **Tested** (Playwright, practice):
  - JPEG with a black box (2400 px) behind red/blue type on white, erased: the box went 11″ → 5.39″ × 2.6″, the type's own size at the same scale. v199 left it at 11″.
  - The clean PNG test still crops to 4.12″ and keeps the erase + green recolour through Fill on/off.

## 2026-11-05 — v201: fabric line in the middle, all proof notes blue, old base names → BASE
Stephen: "a middle ground for the fabric content … between super simple and a little more information", "make all the warnings blue and nothing red", "for reprint jobs instead of keeping the old base swatches that had 1/2 blocker etc. can we also update those along with the text".
- **Fabric Content** (`fabMid`, page 1 of garment proofs and the older layout): **weight · what it's made of · one standout**.
  - Kept: ring-spun, organic, recycled, pima. The standout is garment dyed, pigment dyed, fleece or tri-blend.
  - Dropped: yarn counts ("30 singles"), seams, labels, "combed", brand words (Airlume), CA weights.
  - If it can't read the vendor's line, the line stays as written. Bandanas unchanged (already simple).
  - Examples:

    | Vendor line | Proof shows |
    |---|---|
    | 6.1 oz., 100% ring spun cotton, garment dyed, soft washed, double-needle stitching | 6.1 OZ · 100% RING-SPUN COTTON · GARMENT DYED |
    | 5.3 oz./yd² (US) …, 100% cotton | 5.3 OZ · 100% COTTON |
    | 4.2 oz., 100% Airlume combed and ring-spun cotton, 32 singles | 4.2 OZ · 100% RING-SPUN COTTON |
    | 4.3 oz., 60/40 combed ring-spun cotton/polyester, 30 singles | 4.3 OZ · 60/40 RING-SPUN COTTON/POLY |
    | 3.8 oz., 50/25/25 polyester/… cotton/rayon, tri-blend | 3.8 OZ · 50/25/25 POLY/COTTON/RAYON |
    | 8 oz., 50% cotton, 50% polyester fleece | 8 OZ · 50% COTTON, 50% POLY · FLEECE |
- **Notes blue:** the close-up's print notes (red since v184) and the embroidery template's pink notes are now the proof blue #1a9ad6. No red on the proofs.
- **Reprints:** `isBaseName` also knows the older base names: Blocker (1/2, 1/4, gray, black), Underbase / UB, White Base, Flash White. A reprint whose imprint copied "1/2 Blocker, 7527, 186" now shows BASE | 7527 OW | 186 OW (v200 also showed a "1/2 BLOCKER OW" swatch).
- **Tested** (practice): Comfort Colors 1717 with the vendor line above (page 1 shows the short line), thin-line note on the close-up in blue, and chips for three imprint texts.

## 2026-11-05 — v202: the quick reprint changeover relabels old base swatches
Stephen: "for reprint jobs instead of keeping the old base swatches that had 1/2 blocker etc. can we also update those along with the text" → "it was just that quick reprint changeover".
- **Edit PDF › Replace everywhere** (the old proof → the new order) now also relabels the old base swatches: a swatch reading a base name (1/2 BLOCKER, UNDERBASE, EZ WHT, 1/2 BB …) or a stacked pair (1/2 over BB / BLOCKER, UNDER over BASE) is covered in the swatch's own colour (sampled from its middle) and reads **BASE**, bold, centred.
- WHITE / BLACK ink swatches and the colour swatches are left alone.
- The button counts them ("Replace everywhere (4)") and the toast says "Changed 2 places · 2 old base swatches → BASE"; Undo works as for any edit.
- **Tested** (Playwright, practice): a made-up old proof with "10835-A", swatches 1/2-over-BB, 7527/OW, UNDER-over-BASE and WHITE. After Replace everywhere (10835 → 11200): PRINT - 11200-A; BASE, 7527 OW, BASE, WHITE; covers matched the swatch grey.

## 2026-11-05 — v203: SanMar flats for brands under a SanMar prefix (Bella+Canvas, Next Level, Alternative)
Stephen: "when you look for flat photos....is it for all brands or just comfort colors?" → "can you look up the 3010 by bella canvas and see if any of the vendors have flats of that one".
- **Cause:** the flat-first search (v140) is for every brand, but it asks SanMar by the vendor's style number. SanMar lists some brands under its own prefix: Bella+Canvas 3010 is **BC3010**. It has flat lays for all 177 of its colour/size rows, but "3010" found nothing, so the app used S&S's ghost photo.
- **Checked on SanMar** (worker):

  | Style | SanMar lists it as |
  |---|---|
  | Bella+Canvas 3010 / 3001 | BC3010 (177 rows) / BC3001 (741), all flats |
  | Next Level 3600 | NL3600 (350, flats) |
  | Alternative 1070 | AA1070 (flats) |
  | Comfort Colors 1717, Gildan 5000 / 8000, Port & Co PC54, District DT6000, Champion S700 | plain number, flats (already worked) |
- **Now:** `sanmarText(pn, brand)` asks the plain number first. If SanMar has nothing, it asks again with the brand's prefix (Bella+Canvas BC, Next Level NL, Alternative AA). Photos, the vendor name/fabric check and the spec sheet (body lengths) all use it.
- **Tested** (live vendor data through the worker): Bella+Canvas 3010 Black. v202 used the S&S ghost; v203 uses SanMar's flat (BC3010_black_flat_front.jpg), flat = true.

## 2026-11-05 — v204: the shoulder mark on the height guide drags
Stephen (screenshot of a flat with the "+0.5″ collar above the shoulder" mark a little off): "can we make this adjustable for when it doesn't quite hit right".
- **Before:** the height guide (v156) put the shoulder point a fixed amount below the photo's top: a tee's collar is taken as 0.5″ above the shoulder, a hood a share of the body length. The print's scale comes from the same split (photo height = body length + that amount).
- **Now:**
  - **Drag the solid shoulder tick** up or down to where the shoulder actually is on the photo. The collar / hood amount above it, and so the print's scale, follow.
  - The label says "· set by hand" (otherwise "· drag the mark to adjust").
  - **Double-click** (or double-tap) the tick to go back to the standard.
  - Kept per garment, colour and side on this computer (`pine_mk_hps`). Your own uploaded photos keep their own sizing.
- **Tested** (live vendor photo, Bella+Canvas 3010 Black flat from SanMar): the standard was 0.5″; dragging the tick up gave 0.06″ "set by hand"; double-click went back to 0.5″. No console errors.

## 2026-11-05 — v205: Size run, back shoulder mark, page 2+ dimensions
- **Size run** button (next to the PDF button). Stephen: "a quickdownload for print size across garments when the client wants to see how the design looks on all the sizes they are getting".
  - One PNG with the garment once per size on the line (sizes with quantities; S–2XL if none are entered yet).
  - Each size is drawn at its vendor body length and width. The print is the same real size on every one, so the client sees how it sits on a small vs a 2XL.
  - Each size is labelled with its length, width and pieces. Front and back get their own rows when both are printed. Sleeves, bandanas and accessories are left out.
- **Back shoulder mark drags again.** Stephen: "the back set collar isn't working".
  - Cause: once a back collar line had been set by hand (v158), the back was sized from it, so the v204 shoulder mark couldn't move.
  - Now a shoulder mark set by hand wins over the collar line, the front match and the hem width. Double-click the mark to go back.
- **Page 2+ header.** Stephen: "make sure we are not shrinking the fonts for the dimensions and we can move that text on the right a little".
  - Dimensions are always full 18 pt (they used to shrink to fit 1.2″).
  - Placement starts 0.3″ after the dimensions (never left of where it was). Its own text shrinks only if it runs out of room.
- **Tested** with live Bella+Canvas 3010 Black photos:
  - Size run: S–2XL at 27.5″–31.8″ long, with the print the same size on each.
  - Back mark: with a back collar line set, v204 didn't move and v205 does.
  - Proof page 2 with a 12.3″ wide print: dimensions at full size, Placement moved right.
  - No console errors.

## 2026-11-05 — v206: Attach proof turns on again
- Stephen, on 11152: "the attach to line is greyed out".
- **Cause:** v205 put its Size run comment in the middle of a line. That commented out the rest of the line, which turns on the Attach, PDF and art-download buttons once art is added, so they stayed grey.
- **Fix:** the comment moved to the end of the line. Nothing else changed.
- **Tested** with a mock of 11152 (1717 Ivory, 11152-A Front):
  - v204: on after art.
  - v205: stays grey with the label "Attach proof to line".
  - v206: on, reading "Attach proof to 1717 Ivory".
- Checked v205's other changes for the same mistake; none found.

## 2026-11-05 — v207: Edit PDF preview text the right size
- Stephen, changing 11154's order number: "looks to be shrinking the text when you update to the new order number".
- **Cause:** v202's note on the colour sampling had swallowed the line that sets the font. The preview drew typed or replaced text in the browser's default 10px font. The saved and attached PDF was always the right size.
- **Fix:** the font line is out of the note.
- **Same mistake elsewhere** (a `//` note in the middle of a line hiding the code after it). Searched the whole file and found two older ones, now fixed:
  - **v139:** the folded "Save photo" button (`gSave`) hadn't been following the garment since v139.
  - **v100:** the colour-compare slider is reset to hidden again before it's redrawn.
- **Tested** Edit PDF with "Order #: 10835" replaced by 11154:
  - v206: small text in the preview.
  - v207: same size and weight as the original.
  - No console errors.

## 2026-11-05 — v208: the proof's center line reads like the art department's
- Stephen: "on the mockup creator can we make that center line a little more readable on page 1". He sent the art department's example: a solid light-blue line with "center" under it, in the same blue as their measurements.
- **Proof** (page 1, and the multi-garment pages): the center line is now solid light blue (`CLINE_C` #4cc3e6), about 1.1 pt, with "center" in light blue under its end. It was a faint grey dashed line, 0.6 pt at 32%. The on-screen guide is unchanged.
- **Not changed:** our measurement lines (`drawDims`) are still red. In the example they're light blue too; switch them if Stephen wants.
- **Tested:** page 1 for the 1717 in Ivory and in Black. Clear on both; no console errors.

## 2026-11-05 — v209: measurements blue too
- Stephen: "yes all blue please".
- The proof's measurements (`drawDims`: inches below the neck, and the gap from center for an off-center print) are now the center line's light blue (`CLINE_C` #4cc3e6) instead of red.
- Their numbers and the "center" label are the same size (DPP × 0.13).
- **Tested:** 1717 Ivory page 1 with the center line and measurements on. All blue, no console errors.

## 2026-11-05 — v210: top-colour white reads EZP WHT
- Stephen: "can we change all the whites in the mockup creator to be EZP WHT". Asked which whites; he chose top-colour white only.
- **Changed:** `inkLabel` names a top white (WHT / WHITE / EZP WHT, with or without OW) "EZP WHT", except on discharge. That covers:
  - the proof chip (EZP / WHT, never OW on a base);
  - the ink list (was "White").
- **Unchanged:** underbases still read BASE, and discharge white still reads WHT DC.
- **"EZP WHT" is a colour now, not a base:**
  - `isBaseName` skips EZP (EZ WHT is still a base).
  - The white-base guess from an imprint's Pantones only takes "EZ WHT".
- **Tested** (proof chips, v209 → v210):

  | Garment | Imprint's Pantones | v209 | v210 |
  |---|---|---|---|
  | Black | WHT, 186 | BASE · WHT · 186OW | BASE · EZP WHT · 186OW |
  | Ivory | WHT, 186 | WHT · 186 | EZP WHT · 186 |
  | Black | WHT DC, 186 DC | WHT DC · 186 DC | unchanged |
  | Black | 1/2 BB, EZP WHT, 186 | BASE · 186OW | BASE · EZP WHT · 186OW |
  | Ivory | EZ WHT, 186 | BASE · 186OW | unchanged |
  | Ivory | EZP WHT, 186 | BASE · 186OW | EZP WHT · 186 |
  | Black | (none; scanned white art) | BASE · WHT | BASE · EZP WHT |

  - Ink list: "≈ White" → "≈ EZP WHT".
  - No console errors.

## 2026-11-05 — v211: Edit PDF cover stops at the line
- Stephen, 11158-A: "looks like when it replaced this imprint id it snuck ontop of the image".
- **Cause:** the white cover behind replaced text reached 26% of the text height below the baseline (`editGeom`), room for descenders. The imprint ID sits right on the photo, so the cover cut a white strip into the photo's top edge, in both the preview and the saved PDF.
- **Fix:** the cover goes that low only when the old or new text has hanging characters (g j p q y , ; ( ) [ ] { } | _). Otherwise it stops 7% under the line. The top stays where it was.
- **Tested:** "11158-A" on a dark box starting 1 pt under its baseline, replaced with 11159.
  - Light pixels in the box's top 3 pt: v210 306/306 (saved PDF and preview); v211 0/306 in both.
  - No console errors.

## 2026-11-05 — v212: the order list keeps itself up to date
- Stephen: "the mockup creator doesn't seem to be auto freshing when a new order comes through....can it scan so that when an order comes through it updates?"
- **Before:** the Awaiting Proof orders (the order menu and Art to do) were read once on load and on Refresh. Only the open order's lines were re-checked every 1½ min (v93).
- **Now:** `pollOrders()` reads them again (`loadOrders(true)`, quiet):
  - every 2 minutes while the page is open;
  - and when you come back to the tab after a minute or more away.
- **A new order:** a toast says "New order awaiting proof: #11160 · Lunar Outpost" (or the count, if several came in).
- **Unchanged during a check:** the open order, its art, the menu selection and Art to do's scroll.
- **Skipped** while the order menu is open, a proof is attaching (`J.busy`) or the tab is hidden.
- **Tested** with mocked Airtable:
  - 11152 open with art; 11160 added to Airtable; the check fired (2 minutes simulated).
  - Result: the menu lists #11160 and #11152; 11152 is still selected and open, with its art and Attach still on; the toast named 11160; no console errors.

## 2026-11-05 — v213: the shoulder mark keeps the print's size unless asked
- Stephen: "when I place artwork on the back and adjust the garment length it adjust the image size". Then: "I was just adjusting that new garment length tool and it was changing the image size". Asked what the mark should do; he chose "Both, with a lock".
- **Why it happened:** v204's drag sets the photo's scale (body length + collar above the shoulder). Moving the mark changes how many inches the photo stands for, so the print (still 11″) drew bigger or smaller on the shirt.
- **Now, by default:** dragging the mark moves it and the collar point together (`HPSOFF`, inches, localStorage `pine_mk_hpsoff`). "3″ below neck" is measured from that collar point. The print moves with them and keeps its size; the scale still comes from the spec length.
  - The length label then reads "26.9″ to the hem as marked · 28″ spec sets the scale".
- **"Mark fixes scale"** (button above the mockup, beside Fit; remembered in `pine_mk_hpsscale`): v204's drag, which re-scales the photo. It replaces a moved-only offset.
- **Double-click** the mark resets both.
- **Mistake caught in testing:** my new `// v213` note on the length-label line commented out the "collar above the shoulder" label after it. That's the third slip of this kind today, after v205 and v202. Fixed, and the whole file was re-checked for code after a `// vNNN` note.
- **Tested** with live photos of the 3010 Black, an 11″ back print, real mouse drags:
  - Normal drag down: 215 px wide either way; the print top moved 199 → 222 px with the mark.
  - "Mark fixes scale" on, dragged: 218.6 px (re-scaled), offset cleared.
  - Double-click: back to 215 px at 199.
  - Proof page 1 (Ivory, Black): no console errors.

## 2026-11-05 — v214: the shoulder mark starts the spec length again (flip of v213)
- Stephen, on a Champion S149 crew: "it is measured from where the shoulder hits the seam down ... if the garment specs say 28.5 shouldn't it start at that point and then have the dashes". He agreed to flip it.
- **Default drag (v204 again):** drop the mark where the shoulder seam meets the collar. The solid line is the spec (28.5″) to the hem, the collar above is dashed, and the print takes its true size.
  - Any earlier move-only offset is replaced.
- **"Keep print size"** (button by Fit; `pine_mk_hpskeep`) is v213's move-only drag, now the option.
- **That crew's screenshot:** "Champion S149 - Cardinal" (`recRQHv7zldlOT4QO`, created 2026-11-05) is typed **Pullover Hoodie** in Airtable; every other S149 is Sweatshirt. So the app assumed an 8.8″ standing hood above the shoulder and labelled it "hood". The type needs to be Sweatshirt; asked Stephen.
- **Tested** (3010 back, 11″ print, real drags):
  - Default drag: re-scaled, 215 → 206 px.
  - Keep print size: moved only, size held.
  - Double-click: reset.
  - Code-after-a-note check: 0. No console errors.

## 2026-11-05 — v215: the file's spot colours first; screen count on the proof
- **Spot colours first.** Stephen: "if the file has a spot color can we use that one first" · "it is not a pantone color we have".
  - **Before:** an .ai/.pdf's spot names were only listed in the scan box ("Spot colours named in the file"). The inks were named by the nearest Pantone in the shop's list, and the imprint's Airtable Pantones went on the proof ahead of them. PSD spot channels were already used (`fileInks`).
  - **Now:** `spotColours()` reads each spot's own colour at 100%:
    - Separation colour spaces with a CMYK / RGB / Gray / Lab / ICC alternate and a type 2 tint function (`/C1`), inline or as a separate object.
    - Also inside compressed object streams (ObjStm, inflated with DecompressionStream).
    - Also older .ai `%%CMYKCustomColor` / `%%RGBCustomColor` comments.
    - A spot with no readable colour but a Pantone number uses the Pantone's colour.
  - `spotNamePass()` runs after every scan: an ink within ΔE 15 of a spot takes the spot's name and colour (`ink.spot`). That covers a Pantone the shop doesn't stock, or a custom name ("BRAND RED").
  - The proof's Colors use those names first, ahead of the imprint's Pantones. Naming from a past proof or the imprint's Pantones (`nameFromProof`) skips spot-named inks.
  - The scan box says "Spot colours from the file: … — the inks and the proof's Colors use these".
  - `spotCols` is kept with the saved art.
- **Screen count.** Stephen: "bring in more imprint id information like the screen count sales is asking for".
  - Page 1's Colors heading reads "Colors · 3 screens"; the embroidery-style block reads "COLORS · 3 SCREENS".
  - `screenCount()` uses the imprint's Screens (Airtable, `fld8rgkIj1RPO97QU`) when set, otherwise one per swatch on the proof (BASE counts as a screen). Printed imprints only; not transfers.
- **Tested:**
  - A hand-built PDF with "Brand Red" (CMYK spot) and "PANTONE 7621 C" (Lab spot, separate tint-function object). The imprint's Pantones say 186.
    - Colours read: Brand Red [230,23,34], 7621 [177,24,31].
    - v214: Warm Red · 186. v215: BRAND RED · 7621, and the scan box flags 186 on the imprint but not in the art.
    - Proof page 1: "Colors · 2 screens" with BRAND / RED and 7621 swatches in their own colours.
  - v210's 7 white-ink cases are unchanged.
  - Code-after-a-note check: 0. No console errors.

## 2026-11-05 — v216: S&S lookup keeps to the garment's brand
- Stephen, 11161 (Lost Range CBD): "it shows products on S&S but it is not pulling them in", for Plum and Darkwood Tree Camo.
- **Cause:** those two garments had style "4000" in Airtable; the other six said IND4000. On S&S, "4000" is **Bayside 4000** and **Paragon 4000**. `ssStyleId` took the first exact match even though the brand didn't match. That style has no Plum, so there was no photo, and the v174 fallbacks never ran.
- **Fix:**
  - An exact style match from another brand is dropped. The brand-prefix ("IND"+"4000") and "brand's style ending in this number" fallbacks then find IND4000.
  - Airtable, with Stephen's OK: the two garments' Style Number changed 4000 → IND4000 (`recZpOR74NEbFgl9R` Plum, `rec0iGXGQfAaBA6Rl` Darkwood Tree Camo).
- **Tested** against live S&S:

  | Lookup | v215 | v216 |
  |---|---|---|
  | Independent 4000 Plum | not found | found |
  | Independent 4000 Darkwood Tree Camo | not found | found |
  | IND4000 Plum | found | found |
  | Bella+Canvas 3001 Black | found | found |

  - No console errors.

## 2026-11-05 — v217: "Attach to all" puts every mockup on every line
- Stephen, 11161 (8 lines on 11161-A): "if I attach all 8 mockups....it only sends them to each individual line item and doesn't add them to all the line items" → "all mockups on all line items".
- **Cause:** with "A page for each garment" unticked (`pine_mk_perg`=0, remembered per computer), each line's proof held only its own garment's page.
- **Fix:** `attachAll` turns the per-garment pages on while it attaches and puts the setting back afterwards. Every line's PDF has every garment's page, its own first, plus the Colorways page when on, and every garment's close-ups. The checkbox now only affects the single Attach. The button tooltip says so.
- **Tested** with mocked Airtable: 3 lines (1717 Ivory / Black / Pepper) on one imprint, checkbox off, Attach to all.
  - v216: each PDF was "Page 1 / Colorways / 11199-A".
  - v217: e.g. Black's PDF is "Black / Ivory / Pepper / Colorways / Black · 11199-A / Ivory · … / Pepper · …".
  - The setting was still off afterwards; no console errors.

## 2026-11-05 — v218: screen count off the proof
- Stephen: "can we remove the color - 2 screens call out above the swatch area".
- Page 1's heading reads "Colors" again, and so does the embroidery-style block. `screenCount()` stays in the file, unused, in case the count is wanted somewhere else, e.g. in the app rather than on the proof.
- **Tested:** the v215 spot-colour PDF's page 1 reads "Colors" with the BRAND RED and 7621 swatches. Code-after-a-note check: 0. No console errors.

## 2026-11-05 — v219: "Attach to all" gives each line only its own mockup
- Stephen, 11161: "when I saw attach all 8 it is added all eight to each line item vs just the one it matches". v217 had misread his earlier message ("all mockups on all line items") and put all 8 garments in every line's PDF (2.5 MB each).
- **Now:** `attachAll` turns off the per-garment pages and the Colorways page while it attaches, then restores both settings. Each line's PDF is its own garment's page 1 plus its close-ups. The single Attach still follows the checkboxes.
- **Tested** with mocked Airtable (3 lines, default settings): every line's PDF is "Page 1 / 11199-A", its own garment. Code-after-a-note check: 0. No console errors.
- **11161:** the 8 lines carry v217 PDFs with all 8 garments in each. Attach to all again on v219 replaces each one with that line's own proof.

## 2026-11-05 — v220: EZP WHT on screen prints only
- Stephen: "EZP WHT is just for screen printing and not for emboirdery etc". v210 had made every top white read EZP WHT.
- `inkLabel(t,suf,scr)` now takes whether the imprint is a screen print (`methOf(im)==='print'`). Embroidery, patches and transfers keep the white as typed, and an "EZP WHT" on one of them reads WHT. Screen prints are unchanged: EZP WHT on top, WHT DC on discharge, BASE for bases.
- Checked: WHT/White on a print → EZP WHT; WHT DC stays; WHT/EZP WHT on embroidery → WHT.

## 2026-11-05 — v221: stickers in Mockup Maker
- Stephen: "can we fold Sticker Proof into mockup creator", and "with stickers we do need a way to remove the background and do different shapes and borders".
- **Which lines:** an order's Stickers lines, plus Promo Product lines whose description or notes say sticker, decal or slap. They show in the Line menu as "Sticker · <name>". The name is the short first line of the Proofing / Sales Notes or Promo description ("Design 1"), else "Sticker N".
  - An order with only sticker lines opens the first one.
  - Art to do opens a sticker line straight away.
- **Picking a sticker:** the Art and Garment panels and the stage are replaced by the Sticker panel and the template. The template is the same as Sticker Proof v1, measured off 11156's PDFs.
- **Background off:** the commonest colour round the art's edge (white on most files) is flooded out, with a "How much of it" slider.
- **Shapes:** Die Cut (white edge follows the art), Circle, Square, Rectangle, Rounded Corners, Oval, Triangle. Kiss cut was dropped: it is never asked for in 172 sticker lines.
- **Borders:** None, 1/16, 1/8 (default) or 1/4 inch of the real sticker. On a die cut it's the white edge; on a shape it's the margin inside it.
- **Shape colour** for backgrounds; it is black when the notes say "black background".
- **Defaults come from the line's notes** (Description is a formula that always says "die-cut"):
  - size "3x3", "2x4.75" → width × height; for a die cut only the width, and the height follows the art;
  - circle / square / rectangle / rounded / oval / triangle;
  - finish: matte, metallic, gloss, semi.
- **Attach proof** goes through `uploadProof` with `{sticker:true}`: only the new proof stays and it is saved to the order's Drive Proofs folder, but there is no imprint setup file or print art. The file is named "<order> | STICKER-<NAME>.pdf".
- **Proof done → Review** ticks the line's Ready for Review.
- `?practice=1` writes nothing.
- `sticker-proof.html` now redirects to `mockup.html`. Sticker Proof v1 stays as a file.
- **Research (agent scan of 172 sticker lines, read only):**
  - Most common sizes are 3x3, 2x2 and 3.5". The Size field is a pricing bucket (2/3/4/5 inch).
  - Shapes: die cut 34, circle 34, square 14, contour ~9, rectangle 8, rounded 4, triangle 2, oval 1. Kiss cut 0.
  - Finish is rarely stated: semi-gloss 3, matte 1, metallic 1.
  - Vendors: Die Cut Stickers.com 90 (orders come in multiples of 50) and Stickerbeat 42 (rushes).
  - Backgrounds come up a lot (black, tie-dye, photo, colourways).
  - Sticker sheets and postcards: 3 lines. Not handled yet.
- **Tested:** mocked 11156 with a garment line, 2 Stickers lines and a Promo sticker line:
  - die cut with the 11156 art: 3 × 4 in;
  - the Promo line: Square with a black fill from its notes;
  - Circle, Triangle and Rounded corners;
  - back to the garment line, where the normal stage returns;
  - live run: upload "11156 | STICKER-DESIGN 1.pdf", then PATCH Ready for Review. No page errors.

## 2026-11-05 — v222: size run at one scale
- Stephen (11163, AA 1301 Black): "Can we emulate not just the print getting smaller but maybe we keep the print the same size and show the shirts getting larger....I just think that flows on the eye better".
- `sizeRun` reads every size's body length first. The longest fills its column, and each other size is drawn smaller in proportion (length ÷ longest), centred, with the collars on one line. Pixels per inch are therefore the same on every shirt, so the print is the same size everywhere and the shirts grow S → 2XL. The caption now says "Every size drawn to the same scale."
- Tested on a mocked 1717 Ivory, S–2XL: BIRD is 123–124 px wide on every shirt, and the shirts grow from 26.6″ to 31.6″ long.

## 2026-11-05 — v223: sticker background off follows the art's outline
- Stephen, 11156 art on black: "Looks like it did a rough knockout of that black". v221 flooded the background colour in from the edges. With art on black, it leaked through small gaps in the white outline, ate the black areas inside the design, and left a rough edge.
- **Now:**
  1. Pixels near the edge colour, within the tolerance, count as background.
  2. The art is grown by 0.6% of its size to close small gaps.
  3. The outside is filled in from the edges.
  4. The outside is grown back by the same amount, so the cut sits on the art's own edge.
  5. Only background pixels outside the outline are taken out, so black inside the design stays black.
- Square dilation runs on rows then columns with running counts, so it is linear in the pixel count.
- **Tested** with Stephen's 11156 PNG on black: the inner black areas are kept, the die-cut edge is smooth, and there are no page errors.

## 2026-11-05 — v224: the shoulder mark always takes the drag
- Stephen, CornerStone jacket front: "looks like I can't adjust that garment selector on the front now?"
- **Cause:** the canvas picked whichever handle was drawn last. Prints, and the collar-bottom line, were drawn after the shoulder mark, so they took the drag wherever they overlapped it. On a jacket front the collar bottom sits at shoulder height. The mark also couldn't go above the top of the photo.
- **Now:** `hit()` prefers the shoulder mark, then the hem ends, when the pointer is on them; otherwise it works as before. The mark can go up to 2″ above the photo's top, and HPS still stops at −2.
- **Tested** on a live SanMar CSJ60 Black:
  - drag down 5.8″;
  - onto the collar-bottom line (the hit boxes overlap) and drag again: the mark moves (4.5″);
  - drag above the photo: −1.6″.

## 2026-11-05 — v225: shared imprint, different inks · open any order
- Stephen, 11138: two bandanas (Natural 7563 / 7475; Olive Green 7579 DC / 7527 DC) proofed on one imprint, 11138-A. "can it do better in logic to help me not make this mistake again … some trigger when changing colors that help catch this … this is the one I need to fix and add another imprint ID but I can't find it".
- **Found:** in Airtable, the Olive Green line (recgJY9rDFDZiFJgT) is already on 11138-B, but its proof "V4 11138 | 4800-OG.pdf" was made while it shared 11138-A, so it still says PRINT - 11138-A. The order is in Pre-press, so it wasn't in the Awaiting Proof menu.
- **Shared imprint, different inks:** for each imprint on more than one line, each line's inks are read as the proof writes them: `inkChips(im,line)`, so recolours and OW / DC count, and bases are ignored.
  - If they differ, a red note under the imprints names each colourway ("11138-A prints in different inks — Natural: … · Olive Green: …") and says each colourway needs its own imprint ID in Airtable.
  - Attach and Attach to all ask before attaching. It's a warning, not a block.
- **Open order # (any status):** a box under the order menu. It finds the order by number, whatever its status, adds it to the menu marked with its status (as `?order=` does) and opens it.
- **Tested:** mocked order 11138 in Pre-press with 2 lines (1717 Ivory, Black) on one imprint.
  - Open order # 11138 opens it.
  - The note shows "Ivory: 7626 · Black: 7626OW" and Attach asks first.
  - No page errors.

## 2026-11-05 — v226: ink names as typed, and extra inks
- Stephen: "can we also make a manual change or add ink color. I have 7501 OW but the art dept want it to Say 7501 EZP so i need both options".
- **Change:** tap the ink, then Rename, and type "7501 EZP". A chip whose name already ends in its type (EZP, SOW, OW or DC, after a space) now prints exactly as typed. Before, the proof added OW or DC on top ("7501 EZP OW").
- **Add:** a new "Add an ink to the proof" box under the ink list. It adds a chip to this imprint's proof, uppercased as typed, with the colour from its Pantone where known. The chips show under the box, and × takes one off. They're kept in the job's saved work (`imps[id].extra`) and come back on Pick up.
- **Tested** with a mocked 1717 Ivory + Black line (Black has a base):
  - before: 7626 / BASE · 7626OW;
  - renamed: 7501 EZP on both lines (no OW added);
  - added "7502 sow": 7502 SOW chip on both;
  - × removes it.

## 2026-11-06 · v227: Madeira threads + Straight on / Slanted switch for caps
Stephen: "can we get all the Maderia pantones into our mockup builder...and for embroidery can it be a toggle for that guide if the hats are slanted". Then a camo cap screenshot: "this image is 4" wide and it going off the edges".
- **Madeira threads:** `pine-madeira-v1.js` has all 412 Madeira Polyneon 40 threads (number, Madeira's name, colour).
  - Source: Pine's "Embroidery Thread Colors.pdf" on Drive (Madeira's Polyneon chart, 9 pages).
  - Numbers and names were paired by their position on the page. Colours were sampled from each swatch on a 144 dpi render. Checked by eye on pages 1, 6, 8 and 9.
  - 1822 and 1938 are printed twice on the chart (Coconut Cream / Bone White, Doe Skin / Beige). The first is kept.
- **Picker on embroidery imprints:** tapping a thread colour lists threads first, as "1756 MD" with the Madeira name.
  - With no search: the 8 threads closest to the tapped colour.
  - Search by number ("1756") or name ("pea green").
  - Pantones follow under "Pantone". Screen-print imprints don't list threads.
  - Picking one recolours the stitches and puts "1756 MD" on the proof's Thread Colors (the way Pine writes Madeira).
- **Cap front panel switch:** "Hat photo: Straight on · Slanted, bill left · Slanted, bill right", under Bend round the hat.
  - v183 guessed from the photo which panel to use. On Stephen's camo cap (a straight-on photo) it picked the slanted 3/4 panel, so the print skewed off the side. The guess is probably thrown off by the bill's shadow on one side of the box.
  - A pick is kept per style + colour and replaces a fitted panel. Until then, it says "guessed from the photo".
- **Tested** (Playwright, live S&S photos):
  - VC300A Black is guessed Straight on and BA703 Black Slanted.
  - Each button switches the panel and is saved.
  - A 4″ print centred on VC300A sits inside the straight-on panel; with the slanted panel it skews, which reproduces the camo screenshot.
  - Threads: closest 8 to a navy; "pea green" and "1756" both find 1756 MD; picking it gives the chip "1756 MD"; a screen-print imprint lists no threads.
  - No new page errors.

## 2026-11-06 · v228: photos of stand-in garments are kept with the job
Stephen (11122): "how do we store the photos for none API garments".
- **How garment photos are stored:**
  1. **Vendor garments (S&S, SanMar, AS Colour):** photos come from the vendor each time; nothing to store.
  2. **A garment with its own Garments record** (not in a vendor API): "Save photo" puts it in the record's Front / Back photo fields (v54). Every later job with that garment opens with it.
  3. **The shared stand-in (Customer Supplied 0000 - Any) and typed-in garments:** never saved to the Garments record, because the stand-in is shared by every customer-supplied order (v137). Until v228 their photos lived only until the page closed. That's what happened on 11122.
- **v228:** for case 3 the photo goes in the line's setup:
  - on this computer as you work (a few seconds after adding the photo);
  - in "… Mockup Maker setup.json" in the order's Proofs folder (working files) when the proof is attached.
  - "Pick up where you left off" brings the photo back with the art.
  - The photo hint says where it's kept.
- 11122's photos from before v228 are gone. They need adding once more, and then they stay.
- **Tested** (Playwright, mocked Airtable, practice):
  - A stand-in hoodie line: art plus a front photo; the setup holds the photo (22 KB).
  - Closed and opened in a new page: no photo until Pick up; after it, the own photo is back.
  - 0 Airtable writes, no page errors.

## 2026-11-09 — v229: Drive files in the Sticker panel
- Stephen: "in mockup creator can the sticker portion still have access to the google drive folder"
- **Cause:** sticker mode hides the Art panel, and the Customer's files browser (`#driveBox`) lives in it, so sticker lines had no Drive access.
- **Fix:**
  - While a sticker line is open, the same browser moves into the Sticker panel, under the drop box (`stkDrive(true)` in `stkOpen`). It goes back to the Art panel when a garment line opens (`stkOff`).
  - Tapping an art file, or "Use this art" in its preview, downloads it and loads it as the sticker art (`stkLoad`) instead of opening it on a garment.
  - Upload, Find the art, folders, New tags and Open in Drive work as before.
  - The drop box now says "…or tap it in the customer's files below".
- **Tested (practice, mocked Drive for 11156 → Client Provided → oddity-sticker.png):**
  - The files show in the Sticker panel; tapping the PNG loads it (3″ × 4″ die cut).
  - Attach and Proof done still work (practice). The promo sticker line still works.
  - Switching to the garment line puts the browser back in the Art panel.
  - No writes, no errors.

## 2026-11-09 — v230: different art → its own imprint ID
- Stephen: "when we do need to create a new imprint-id if the mockup creator finds the artwork is different can we automate that and have a quick add imprint id to the order"
- **Flow:**
  1. On a print shared by 2+ garments, tick **Different art on <colour>** and open that garment's file.
  2. **Make it its own imprint ID** appears. Its dialog says what will happen.
  3. **Create imprint** then does four things:
     - **Imprints record:** creates a new one linked to the order. It copies the shared imprint's print type, location, screens, ink changes, stitches, Supacolor size, Pantone text, ink notes and inks. The nickname is "<nickname> – <colour>". It doesn't copy previous imprint/repeat, proof images or seps.
     - **The ID:** Airtable's "Imprint Created" automation gives it the next free letter (e.g. 11095-B). The app waits up to ~20 s to show it.
     - **The line:** that garment's line item moves from the shared imprint to the new one (only `Imprints` on that line changes). The other garments keep the shared ID.
     - **The art:** the garment's own art, spot and print settings (placement text, opacity, curve, base, effects, extra inks, notes) become the new imprint's. The order reloads on the new imprint.
- **Practice:** nothing is written; a toast says what would happen.
- **Automations checked before building:**
  - Creating an imprint fires only the ID automation.
  - Changing a line's imprints can fire "SLACK: Scheduled Imprint Changed" (it watches the order); that's meant for scheduled orders, and proofs come before scheduling.
- **Also:** the "Same spot on all garments / Own spot" switch now shows only when the print is on 2+ garments (it showed whenever the order had 2+ lines).
- **Tested (mocked Airtable, order 11095 with 11095-A on Navy and Khaki):**
  - The button shows only after the tick plus the file.
  - Live: exactly 2 writes — POST imprint (fields as above, "Ink logo – Khaki") and PATCH the Khaki line's Imprints to the new record. It comes back as 11095-B with the Khaki art; Navy keeps 11095-A and its art. The button and switch hide afterwards.
  - Practice: no writes.
  - The v229 sticker Drive test still passes. No errors.

## 2026-11-09 — v231: name a colour made from a #hex
- Stephen: "having a hard time just changing the name of a color I put in the hex code and now want to name it"
- **Cause:** a recolour to a hex was stored as the bare hex (`RECOL[imp][scope][j]="#1a7a4c"`). "Just rename it" renamed the scanned colour underneath (`ed.name`), but the chip and the proof show the recolour, so the hex never went away.
- **Fix:**
  - On an ink that has been recoloured, Just rename it names the new colour. It's stored as "<NAME> #hex" (e.g. "PINE GREEN #1a7a4c").
  - `inkHex` and `pantoneHexOf` read the trailing hex as the colour. `inkLabel` and the proof chip labels drop it, so only the name shows.
  - The panel title shows what you're naming ("Call #1a7a4c").
  - An ink that wasn't recoloured renames as before.
- **Tested (practice):**
  - White recoloured to #1a7a4c, then renamed "Pine Green": swatch "EZP WHT → PINE GREEN", proof chip PINE GREEN in #1a7a4c.
  - Renamed again to "Pine Forest": same colour.
  - A plain rename to "7501 EZP" still works.
  - No errors.

## 2026-11-09 — v232: readable EZP chips; "Colors will be determined by Separation"
- **EZP chips.** Stephen, with a chip reading "EZP OFF WHT OW" in tiny type: "when we have EZP Off WHT can we make it more readable?"
  - **Cause:** over a base every top ink got " OW" added, EZP inks included, so four words were squeezed into the 0.29″ square at ~3–4 pt.
  - **Fix:** an EZP or SOW ink is already its type, so no OW is added (same reason as "7501 EZP" in v226). A three-word EZP or SOW name goes a word a line (EZP / OFF / WHT) at the size past proofs used.
  - Unchanged: EZP CRM → "EZP / CRM", SOW 186 → "SOW / 186"; 7501 OW, CG 7 OW and BASE stay as before.
- **Separation text.** Stephen: "can we also have a Colors will be determined by Separation".
  - A tick under "Add an ink to the proof": **Colors will be determined by Separation**.
  - When it's on, every proof page that shows the imprint prints that sentence under Colors instead of the chips. It's per imprint (`SEPDET`), kept with the job's saved work (`imps[id].sepDet`), and hidden for Supacolor.
- **Tested (practice):**
  - Chip render, v231 vs v232 side by side.
  - Proof page 1 with the tick on shows the sentence; untick and the chips return.
  - The v229 sticker Drive test passes. No errors.

## 2026-11-09 — v233: separation note wording
- Stephen: "let's make it say this INK COLORS TO BE DETERMINED BY SEPARATIONS".
- The tick and the proof now read **INK COLORS TO BE DETERMINED BY SEPARATIONS** (was "Colors will be determined by Separation"). It wraps to the Colors box width as before. Nothing else changed.
- **Tested (practice):** proof render with the tick on; no errors.

## 2026-11-09 — v234: art from a customer's spec-sheet PDF
- Stephen, with a customer's bandana spec sheet: "This is having a hard time pulling out the artwork... is this pdf have the artwork on a specific layer?"
- The file has no layers (saved as PDF/X-1a, which flattens them). Each page is a spec sheet: a header bar, an order box, Pantone swatches and the design drawn on a fabric-colour square. These sit about 0.28″ apart, so the picker joined the header, the order box and the square into one piece. The navy/royal square also wasn't offered as a background to drop.
- **Fix (shared `pine-ai-parts.js`, loaded as `?v=234`):**
  - The picker also looks for pieces without joining across gaps. A solid square at least 2″ a side is offered as its own piece and picked to start.
  - A picked piece drawn on a solid colour gets "Drop the background colour (crops to the print)", ticked to start. It opens as just the print.
  - Other files are unchanged: the extra piece only appears when its four corners share one solid colour.
- **Tested (practice):** both pages open to the design alone (5.2″ and 5.5″ as drawn; a bandana line still opens at 20″). The fabric colour is dropped (52% of the art see-through). No errors, no writes.

## 2026-11-09 — v235: PSDs coloured with fill layers
- Stephen, with NORMAL GIRL.psd: "since the layers are .psd and they are using a color fill it is just grabbing all the black ink instead of the color filled green and pink". He had also stacked the file twice to try to give each part its own colour.
- The PSD's art is black, in two groups. Each group is coloured by a colour fill clipped onto it: "2286 C" over Group 2, "232 C" over Group 1. A black "Color Fill 1" over the whole canvas stands in for the shirt.
- **Fixes (layer picker / compositing):**
  - A clipped layer now colours the group under it, as in Photoshop. Before, clipped layers only worked over a plain layer, so the fills were skipped and everything came out black.
  - A solid colour over the whole canvas at the bottom (above or instead of Background) is left out like the Background, marked "solid background". Untick or tick as needed.
  - When the fills are named as inks, those are the art's inks (232 C, 2286 C), with the fill colours. The art doesn't need stacking twice to get two colours.
- **Tested (practice):** a PSD built the same way opens green and pink. Color Fill 1 and Background are unticked. Inks read 232 and 2286 from the file. No errors, no writes.

## 2026-11-09 — v236: garment sizes in Airtable; placement text per garment
- **Garment sizes** (Stephen: "when I save a garment to Airtable does it also save the update dimensions I used from the vendor site?" It didn't. Then: "add away").
  - New Garments fields (agreed with Stephen; no automations watch Garments): **Body Length M (in)** `fldw2NQoALou3UAGy` and **Body Width M (in)** `fldhbaBGwSvfC3vCM`.
  - Save photo also saves the sizes you set. "Save sizes to Airtable" (under the size boxes) shows when your sizes differ from Airtable's, with or without a new photo.
  - A typed body length is stored as its size-M equivalent (the shown size's step taken off).
  - A garment opens at: the body length typed for this job, then Airtable's (stepped for the size shown), then the vendor's spec sheet, then typical. The width uses this computer's, then Airtable's. Emptying the width box turns Airtable's off on this computer.
  - A typed body length is now also kept with the job's saved work (before, Refresh lost it).
  - The stand-in and typed-in garments are never written to, same as photos.
- **Placement text per garment** (Stephen: "why the location for the print can't be unique text per line item... I want it here on XS and then for Mens I want it here").
  - The print's spot could already be per garment ("Own spot for …"), but the typed placement text was one per imprint, so it showed on every garment.
  - With "Own spot for …" picked, the placement text box is that garment's own (labelled "Placement text on 1717 Navy's proof"). With nothing typed, it reads that garment's own spot.
  - The switch names the garment by style and colour, and says the text follows it.
  - The text is kept with the job and copied when a print is split into its own imprint ID.
- **Tested (mocked Airtable):**
  - Navy (own spot) and Khaki show different placement text on their proofs.
  - Khaki with 28.5″ in Airtable opens at 28.5″.
  - Typing 30″ and 21″ shows the save button. Saving writes one PATCH to that garment with both fields. Size L then reads 31″.
  - No errors.

## 2026-11-09 — v237: inside size-tag section on the proof
- Stephen, with an art department proof: "can we get a similar supacolor tag section when we need to add inside tags? Please match pixel to pixel for this".
- A print whose Airtable location is **Size Tag** is drawn in page 1's left column, under Fabric Content, at that proof's own positions (measured from the PDF in points):
  - a 0.5 pt rule at 312.8 pt;
  - "SIZE TAG -<imprint ID>" in 12.57 pt bold;
  - Width / Height and "Placement: 0.5" below tape" in 10.06 pt;
  - a second rule at 379 pt;
  - the Supacolour logo at 117.24 × 26.03 pt (ink chips instead when the tag is screen printed);
  - the tag on the garment's colour in a 196.6 × 114.6 pt panel, the art filling 79% × 87% of it.
- With a tag, the blue size note moves to the right of APPROVED, as on that proof.
- The tag isn't drawn on the garment picture (only while you're editing it, so you can place it) and gets no close-up page.
- A tag opens 3″ wide, placed 0.5″ below the tape; its placement text reads "below tape".
- **Tested (practice):**
  - Overlaid on the PDF at 150 dpi: rules, logo, panel and text line up to within font smoothing.
  - The garment and its info block are unchanged.
  - Proof pages have no tag close-up. No errors.

## 2026-11-09 — v238: the inside tag stays off the garment
- Stephen, with the tag drawn over the front print: "also the inside tag shows up on the garment as well".
- v237 drew the tag on the mockup while you were on it, so it could be placed. It's now never on the garment picture, only in the proof's tag section.
- **Tested (practice):** a tag imprint, while selected, doesn't appear on the shirt. The tag section and its recolour (including #hex) still work. No errors.

## 2026-11-09 — v239: saved colours; a size per line; line list by imprint ID
- **Saved colours** (Stephen: "when we have a color added can we also get access to that for later as well". He picked named #hex colours and added inks, shared by every computer).
  - New Airtable table **Mockup Colours** (`tblMzOnFQvpU6tYm4`): Name, Hex, Kind (Named colour / Added ink). No automations watch it. Rows can be edited or deleted there.
  - A #hex colour given a name (Just rename it) is added as a Named colour. An ink typed into Add an ink is added as an Added ink.
  - The recolour search lists matching saved colours first, marked "saved", and typing their hex finds them too. The Add an ink box suggests saved names.
  - Loaded at start and cached on the computer. Practice mode writes nothing.
- **A size per line** (Stephen: "when you change a garment size it changes it for the other garment vs just that one you have selected").
  - "Show at size" is now kept per line (M to start). Each line's proof page and body sizes use its own size, and it's saved with the job.
- **Line drop-down by imprint ID** (Stephen: "organize them by the Imprint Id that is assigned as well as the garment").
  - Lines are grouped under their imprint IDs (e.g. "11172-A + 11172-B"), with garments A–Z inside each group.
- **Not changed:** the heat-press tag's hex search worked in testing (the colours list appears and #hex recolours it). Stephen sees no colours to pick; waiting on his tag file to find why.
- **Tested (mocked Airtable):**
  - The saved colour loads and shows first in search. Naming #ff3366 "Hot Pink" and adding "7501 EZP" each POST one row.
  - Navy at L, Khaki stays M, and Khaki's proof uses M.
  - The drop-down groups by imprint ID. No errors.

## 2026-11-09 — v240: the #hex search forgives typing
- Stephen, recolouring a heat-press tag, typed "7acoo" and got "Nothing like". It was 5 characters, and the O's were letters, not zeros. The search only took an exact 6-character hex, so this wasn't specific to tags.
- Now the search:
  - reads the letter O as zero (7aCOOO → #7ac000);
  - ignores spaces and a missing #;
  - takes the 3-character short form when typed with # (#7a0 → #77aa00).
- A code that's 4–5 characters says "A #hex has 6 characters — “7acoo” has 5".
- Pantone numbers (186, 7501) and words still search as before.
- Earlier note: v239 waited on Stephen's tag file for the "no colours" report. His screenshot showed this was the cause.

## 2026-11-09 — v241: placement text on several lines
- Stephen: "When adding specific location information can we be able to do multiple lines".
- The placement text box is now a text area: Enter starts a new line, up to 3 lines.
- Where the lines go:
  - **Page 1's info block** and the **embroidery block** stack the lines and move the rule and colours down.
  - The **close-up header** shows line 1 at 18 pt and the rest under it at 13 pt; the Garment line makes room.
  - The **tag section** fits two lines above its rule (8.6 pt); a third joins the second.
  - The small labels (the stage's size tag, colourway headers, bandana close-up) put the lines on one line with " · ".
- Works with each garment's own placement text (v236).
- **Tested (practice):** 3 lines on the front and 2 on the tag render cleanly on page 1 and the close-up. No errors.

## 2026-11-09 — v242: Supacolour logo as wide as the rule above it
- Stephen, with a proof where the Supacolour logo under a sleeve print's Colors was much narrower than the hairline above: "can we make the supacolor logo the same size as the line above it".
- On page 1's info block, a transfer's Supacolour logo is now drawn as wide as the rule above Colors (1.32″, 0.30″ tall). On the embroidery-style block it matches that block's 1.78″ rule.
- Ink chips and the tag section are unchanged.
- **Tested (practice):** a Supacolour sleeve print's logo spans the rule. No errors.

## 2026-11-09 — v243: less scrolling in the left panel; .svg art
- **Audit** (1440×900, an order with art open): the panel was 2,729 px in an 836 px window. One imprint's work went files (y≈2,060) → size (1,210) → colours (2,190) → placement (1,610) → garment (2,490) → back up to the chips (284): about 7,200 px of scrolling and four changes of direction.
- Stephen: "Let's reduce the scrolling and maybe have an agent work on a tab version for us to review here". The tab version is being built separately as a preview.
- **v243 (reorder, nothing removed):**
  - The imprint chips stay pinned at the top of the panel. Picking another imprint brings its art section up under them.
  - The order collapses to one line, "#11095 · Customer · Change order", above the Line picker.
  - The "different inks" warning shows two lines; tap for the rest.
  - **2 · Art** now runs in the order of the work: method → open art → Customer's files → size and low-res box → Colours (recolour, add ink) → placement → **More print options**.
  - Customer's files folds to a "Show" button once the imprint has art.
  - More print options holds ink opacity, fabric look, underbase, proof notes and the background tick boxes. It's folded, shows a one-line summary of what's set, and remembers if it was left open.
  - The method hint is two lines (full text on hover).
  - Result: the panel is 2,148 px, and one imprint is ~1,800 px of scrolling, all downward.
- **.svg art** (Stephen: "can we make it that we can also place .svg files...right now it is just taking me to the google drive"):
  - .svg opens from the order's Drive files and the file picker. Before, Drive sent it off to Drive.
  - It's drawn sharp at up to 4,000 px. Its size comes from the file's width when it gives units (in, pt, mm, cm), otherwise Illustrator's 72 units an inch.
- **Tested (practice / mocked Airtable):**
  - The new panel was measured again. The pinned chips work while scrolling.
  - A 4 in SVG opens at its real size.
  - Saved colours, the size per line, the grouped line list and recolour still pass. No errors.

## 2026-11-09 — v244: "Just an ink change"
- Stephen: "also an ink change is not a different design always...sometimes it is just an ink change".
- Since v225, the same imprint printing different inks on different garments raised a red warning ("each colourway needs its own imprint ID"). Attaching asked to confirm.
- Now the warning has **Just an ink change** for each imprint. That imprint keeps one imprint ID with different inks per garment. The warning and the attach question go, and a small "just an ink change per garment ✓ · Undo" line stays.
- It's kept with the job's saved work.
- A different design is still pointed to "Make it its own imprint ID" (under placement).
- Only the long ink list in the warning folds to two lines (tap it). The button always shows.
- **Tested (practice):** the warning shows on the sample order; Just an ink change clears it and attaching no longer asks; it's saved with the job; Undo brings it back. No errors.

## 2026-11-09 — v245: colour picker cleaned up
- Stephen, with the picker open: "can we also clean this up".
- The picker's choices now sit under one heading per group: Saved colours, Pine's inks, Madeira threads, Pantone. Before, each saved tile carried a "saved" tag, which wrapped to "save d".
- The list is a little taller and fades at the bottom only when there's more to scroll. Before, it cut a row in half.
- Effect (metallic / glitter / puff) moved under "More: effect, merge, remove, erase, reset".
- **Tested (practice):** the groups and headings show (with a search too); no fade when everything fits. No errors.

## 2026-11-09 — Tabs preview (for review, not the live app)
- Stephen: "maybe have an agent work on a tab version for us to review here".
- `pine-mockup-tabs-preview.html` is built from v242, so it doesn't have v243–v245. It's for comparing layouts only; `mockup.html` still opens the scrolling panel. Share the practice link: without `?practice=1` it writes to Airtable like the real app.
- **Layout:** the job area is pinned at the top (order on one row, line, imprint chips, "different inks" warning cut to two lines). Under it are tabs: **Art · Colours · Placement · Garment · Notes**, with badges (Art ✓, ink count, notes/comments count).
  - **Art:** method, open art, file buttons, size, low-res box, customer's files.
  - **Colours:** swatches, recolour, separations tick, add an ink, background tick boxes, layers.
  - **Placement:** placement, own spot, own imprint ID, proof notes.
  - **Garment:** the garment, plus ink opacity, fabric look and underbase.
  - **Notes:** the order's notes and comments.
- Each tab remembers its scroll position, and the open tab is remembered per computer.
- Measured at 1440×900, nearly every tab fits on one screen. Colours scrolls ~180 px with 10 inks.
- **Open questions:**
  - Should notes stay in front instead of behind a tab?
  - Underbase and opacity are on Garment, not Colours.
  - The order row has no labels.

## 2026-11-09 — v246
Stephen: "let's really do a nitty gritty audit of how this side panel works" · "we need new imprints when the design changes… a way to scan pixels and find oddities when sales thinks it can be shared but it isn't"

- **Design scan:** when a garment has its own art under a shared imprint ID, the app compares the two prints' shapes (ink coverage on a 96×96 grid, plus the proportions), ignoring the colours. 80%+ overlap with the same proportions = same design ("just different inks, it can stay"). Anything less = different design, which needs its own imprint ID.
- In the clash warning, "Just an ink change" only shows for the same design. A different design says so with the match % and points to "Make it its own imprint ID". Attaching the proof anyway asks to confirm first.
- **Side panel tidy:** the thin-lines box is no longer yellow (yellow = the main button). The Colours actions (Crop to art · Combine · Undo) sit in the header. The separations tick now reads "Colours to be set by separations". Dropped the "Tap a colour…" and "art is balanced" lines. Shorter size and same-spot hints. On desktop (mouse), buttons and inputs are more compact, so less scrolling.

## 2026-11-09 — v247
Stephen: "also looks like it isn't pulling in a sweatpants we get from ITC" (Independent PRM50PTPD).

- S&S had the style and photos all along. A pair of pants laid flat is tall and narrow (425×1140 px), so the photo check took it for a photo of a person and the app fell back to the plain tee.
- Pants are now their own kind, like caps and totes. A name or vendor title with pants / sweatpants / joggers / shorts / leggings / trousers picks it, or Kind › "Pants / shorts". The vendor photo is used as is, sized by ~24" across both legs at the hip. The print starts on the wearer's left thigh (the photo's right).

## 2026-11-09 — v248 + tabs preview rebuilt
Stephen: "the color pop up is still pretty big and you still have to scroll on a laptop....can we maybe not show all those colors and just use the search function" · "make the search function just a color search as well....so you type in red and it is also all the pantones that are red" · "looks like some undo buttons are missing" · "when you open colors it makes the side panel bigger" · tabs: "let's also make Notes first" · "the ink change isn't in the tab practice".

- **Colour pop-up:** it opens with only the search box (focused on a computer) and a one-line hint. No colours show until you type.
- **Colour words:** red, pink, orange, yellow, gold, green, lime, olive, teal, turquoise, mint, blue, navy, royal, sky, purple, lavender, maroon, burgundy, brown, tan, beige, cream, khaki, magenta, coral, peach, forest, sage, mustard, rust and aqua, plus gray / charcoal / silver / black / white. Each word finds inks by their colour: Lab distance ≤ 22 to a few reference colours, nearest first. Light / pale, dark / deep and bright / neon narrow the results ("light blue", "dark green"). Names that match still come first, and the results stay under the Saved / Pine's inks / Pantone headings.
- **Panel size:** the side column no longer widens while the pop-up is open (v98's wider column is gone), and the before/after preview is shorter (84px).
- **Undo** next to Crop to art / Combine now also shows after a recolour or an erase. Before, it only showed for list edits. It takes the colours back to the scan, with an Undo on its message.
- **Tabs preview** (`pine-mockup-tabs-preview.html`): rebuilt by an agent on v247 and given the v248 search. The tabs are Notes · Art · Colours · Placement · Garment.
  - Pinned at the top: the job, the imprint chips, and the clash note with "Just an ink change" always visible.
  - The colour pop-up floats beside the panel on a computer and is a bottom sheet on narrower screens. The panel's height doesn't change when it opens.
  - The remembered tab is stored under `pine_mk_tab_v2`.
  - Tests: 26/26 checks at 1440×900 and 768×1024, with mocked Airtable in practice mode.

## 2026-11-09 — v249: tabs become the main version; colours the scan missed
Stephen: "let's roll the tabs into the main version....it is the winner for flow" · "can we have a feature to add colors....looks like this dropped 2 colors out of the grab" (a badge with a blue-grey river and a peach flame centre).

- **Tabs:** v249 is the tabs preview (Notes · Art · Colours · Placement · Garment, with the job pinned at the top) with "preview" taken off the title and version pill. `mockup.html` now opens it. `pine-mockup-tabs-preview.html` stays as it was, unlinked.
- **Why the colours were dropped:** the scan drops a small colour that sits between two big ones, because the soft edge where cream meets dark green makes exactly such a colour. The river (blue-grey, between cream and green) and the peach (between cream and brown) fit that test.
- **Scan fix:** it now also looks at the shape. For each colour it measures the share of its pixels whose four neighbours are the same colour. An edge is a thin line (low share); an ink fills an area (high share).
  - A "between" colour is dropped only if under 35% of its pixels are inside its own area.
  - A colour from 0.4% of the print (was 1%) is kept when at least half of its pixels are inside its area.
  - Test badge: the river at 2.5% and the peach at 0.5% are now found. v248 found neither.
- **+ Add colour** (next to Crop to art / Combine): opens the art; click a spot and its colour (a 5×5 average) is offered with its closest ink, then **Add**.
  - A colour already in the list says so.
  - Picked colours go at the end of the list, so ink changes keep their place, and every colour's share is counted again.
  - Picked colours are kept on rescans and crops (stored in `a.picked`).
- **Dialogs fix:** dialogs inside a hidden tab can't show (the crop, PDF edit and garment-photo dialogs had moved into the Art tab). At load, every side-panel dialog now moves to the end of the page.
- **Tests:** 26/26 tabs checks at 1440×900 and 768×1024, plus the badge scan and the picker, with mocked Airtable in practice mode. No page errors.

## 2026-11-09 — v250: Pantones up to 7771 only; sleeve prints on hoodies
Stephen: "we can not go over PMS 7771. it is the highest number we can go....can we make sure we have the whole pantone libarary up to that number" · "working on adding a sleeve print … it is shared on a hoodie and it shows up in the close up view but not on the actual hoodie sleeve".

- **pine-pantone-v2.js** (new shared file; v1 is unchanged, per the versioning rule): v1 plus the 515 Pantone Solid Coated numbers v1 was missing. That's 459 in the 2000s (2001–2775, e.g. 2132 and 2286) and 56 in the 3000s (3500s). It now has 1,825 numbered Pantones, the highest being 7771.
  - The colours come from X-Rite's PANTONE+ Solid Coated V3 colour book (Lab, D50, from the `color-books` npm package), converted to sRGB with Bradford adaptation to D65.
  - On the 1,285 colours both files have, the conversion averages 4.8/255 from v1's values.
  - Not covered: colours Pantone added after that book (newer than 2016) aren't in any free dataset I found.
- **The 7771 limit:** `pmsOk()` refuses any Pantone number above 7771 (with or without OW / DC / C / U). It applies to the scan's ≈ names (`inkList`), the colour search, colour words, and Pine's own ink list from Airtable. Tested with a made-up Pine ink "8003": it never comes up.
- **Sleeve prints on long sleeves:** the front view placed a sleeve print at fixed points of the garment box (a tee's sleeve positions), then clipped it to the garment. On a hoodie photo the sleeves hang beside the body, so the print landed on the body's edge and was mostly cut away. The close-up doesn't use the photo, so it still showed there.
  - `sleeveFromPhoto()` now finds the sleeve in the photo's garment mask: its outer edge on that side, and the shoulder (where that edge stops sloping).
  - The sleeve's middle is half the gap to the body in from the edge, or 3.6" in when the sleeve touches the body.
  - Short sleeves are unchanged.
  - Tested with S&S's Independent SS4500 photo: the print now sits on the left sleeve.
- **Tests:** 26/26 tabs checks with mocked Airtable in practice mode. No page errors.

## 2026-11-09 — v251: a size per garment on the inside size tag
Stephen: "I want to have the size tag reference be unique per garment....meaning if I am showing a Medium I select medium...if I am showing an XS I can show XS". Each size is its own art in the tag file (separate artboards, pages or layers).

- On a Size Tag imprint, Placement › **Another size on <garment>** opens the same tag file again (kept as `a.srcFile` when the art is opened) with its artboard / layer picker. Pick that garment's size and its proof's Supacolor tag section shows it. **Pick another size** changes it later.
- It stays the same imprint: the design scan doesn't call a different size a different design, and the "same design / different design" hint and "Make it its own imprint ID" don't show for tags.
- **Tested** (mocked Airtable, practice): a 2-page tag PDF. Navy kept page 1 and Khaki got page 2, each on its own proof. No page errors.
- **Fixed before shipping:** a `//` comment had swallowed the start of `designDiffs` (`const out=[]`).

## 2026-11-09 — v252: tag size per garment, in the Art tab
Stephen on v251: "not working for me....can you walk me through this". His screenshot (11172, Navy, 11172-D Size Tag) was on the Art tab, and his tag sizes are separate .ai files in Drive (IMPRINT-B.ai, IMPRINT-F.ai). v251 only offered it on the Placement tab, and it only reopened the same file.

- On a Size Tag imprint shared by 2+ garments, the Art tab now has a **Tag size on <garment>** row under the file buttons:
  - **From <file>** (for .ai / PDF / .psd): another artboard or layer of the same file.
  - **Another file**: then click that size's file in Customer's files, or click the art card to pick a file on the computer. The next art opened goes to this garment only.
  - **Same as the others**: undoes it.
- **Tested** (mocked Airtable, practice): an "M" file on Navy, then Another file → an "XS" file on Khaki. Each proof shows its own tag, and Same as the others returns Khaki to M. No page errors.

## 2026-11-09 — v253: a model with an arm out is a person, not a flat shirt
Stephen: "getting this funky thing when trying to place this garment with size specs". The photo was a model in a black long-sleeve, one hand at his ear. The yellow "29″ body length · shoulder to hem" bar ran from the top of his head to his trousers.

- **Cause:** a photo counted as a person only when it's 1.65× taller than wide. The raised arm made this one too wide, so it was read as a flat-laid garment: the whole picture was taken as the shirt, and the body length and the print's scale were measured over the whole person.
- **Now** a photo is also a person when its top 12% is mostly skin, in a narrow shape (under 45% of the width: a head, not shoulders), over a body that isn't skin-coloured (rows 30–50% down are under 20% skin).
  - Skin is tested in YCbCr (Cb 77–127, Cr 137–173), which works across skin tones.
  - The body check keeps a tan hood on a tan hoodie from looking like a face.
  - Tests: people with dark, light and medium skin and an arm out → person. Flat black, tan, peach and pink tees, and black and tan hoodies → flat. Real vendor flats (AS Colour 5029, S&S SS4500) → still flat.
- **The body-length bar on a person photo** runs up from the hem you marked (the yellow line across the hem). With no hem marked it isn't drawn, rather than measuring the whole person.
- **Tests:** 26/26 tabs checks, with mocked Airtable in practice mode. No page errors.

## 2026-11-09 — v254: links in notes and comments open
Stephen: "can you add a hyperlink from the print notes? Airtable does". 11180's proofing note had the garment's page on the vendor's site as plain text.

- Any `http(s)://` or `www.` address in the brief's Proofing / Sales notes and in comments is a link that opens in a new tab (`linkUrls()`).
- A trailing `. , ; : ! ? ) ]` stays outside the link, unless a `)` closes a `(` inside the address.
- The full address keeps its `&…` parts.
- **Tests:** Stephen's note, a link ending in a full stop, a link in brackets, a `www.` address, and text that isn't a link. Plus 26/26 tabs checks with mocked Airtable in practice mode. No page errors.

## 2026-11-10 — v255: when Drive files were saved
Stephen: "with the google drive connection can we see when the most recent files got uploaded?"

- Every file tile in Customer's files shows when it was last saved, after the size: "today 2:14 pm", "yesterday", "Nov 6", or "Nov 6, 2025" for another year. Drive's `modifiedTime` is a save date, so a re-saved file shows its new date. Files that open in Drive show it too.
- **Newest first** (next to Upload) lists the files by that date instead of art first. Remembered on this computer (`pine_mk_drv_newest`). The header row now wraps so it never overflows.
- Unchanged: the New / Updated tags, and the date in the 🔍 preview.
- **Fixed before shipping:** the setting was first declared after the Drive list's code, so the page stopped on load ("Cannot access 'DRV_NEWEST' before initialization"). It's now read with the app's other saved settings.
- **Tests:** mocked Drive and Airtable, practice mode: dates on every tile, Newest first order, and the header fits at 1440. Plus 26/26 tabs checks. No page errors.

## 2026-11-10 — v256: patches and clip labels from the resource sheets
Stephen: "Here is clip and patches that we are trying to streamline can we scan these and get these specs in to the mockup creator. Also can we work on how we can select patches." Before, any patch was a white rounded box the size of the art (white art vanished on it, sizes like 2.6″ × 2″ that aren't a real patch).
- **Art tab › Method › Patch** opens a picker: **Patch | Clip label**.
- **Patches:** the 14 standard shapes from the Patches sheet (P1 2.25″ circle … P14 Badge III), each a button with its outline and overall size. Picking one sets the size (width/height boxes lock; Custom frees them). The patch is drawn in that shape, the art fitted into its artwork area, with a merrowed edge.
- **Type:** Woven, Embroidered (the art gets the stitch look), Sublimated (the art runs to the edge), Leather (no merrow; the art pressed in, a running stitch 1/8″ in).
- **Backing / Border colours:** Auto (the art's own background, else a backing the art shows up on), 9 shop colours, or any colour.
- **Clip labels:** the 4 sizes from the Woven Clip Labels sheet (1″×½″, ¾″ sq, 1″ sq, ¾″×1¼″), drawn as the visible area with a tack-down (zig-zag) or straight stitch across the top.
- The spec line under the picker gives the overall size, artwork area and that type's detail limits (line width, letters, thread colours).
- The first shape is picked from the art (round art → circle/oval, square-ish → square/rectangle); Airtable's "Hem Label" / "Woven Label Application" start as a clip label, "Decopress - Leather" as leather.
- **Proof:** the block reads e.g. "WOVEN PATCH P5 · FRONT", with the shape's width and height. Quarter inches now read as quarters everywhere (2.25″, not 2.3″).
- Saved with the mockup like the method. Patch pricing from the sheet (Nov 2026) isn't in Price-O-Matic yet.
- Tested with mocked Airtable at 1440: all 14 shapes, each type, the 4 labels, the proof; the tabs regression (26 checks) passes; no errors, 0 writes.

## 2026-11-10 — v257: designs fit the patch picked; die-cut "Cut to art"; felt
Stephen, with the 11181 felt patch proof: "Can we have the design auto adjust to match the patch selected....and can we also have a custom option that let's us do something like this."
- **The design fits the patch:** the art is trimmed to what's drawn, and a solid colour all round it (a logo on a navy box) is taken off and becomes the backing, so the design takes the patch's shape instead of sitting on it as a box. On round, oval and badge shapes the design is fitted inside the shape itself, not its bounding box.
- **Design: Fit · Fill · Stretch** (standard shapes): Fit shows all of it; Fill fills the shape and cuts what runs past; Stretch fills the artwork area.
- **Cut to art** (was Custom): a die-cut patch that follows the design's outline, a border round it (Thin / Medium / Wide) and a stitch line in the border, like the felt proof. Any size: the width typed is the whole patch, the height follows. Border colour from Border (Auto = black).
- **Felt** type (any shape): full colour on felt with a soft texture. Leather cut-to-art presses the design in.
- Fix: v256's Custom snapped back to a standard shape when picked.
- Proof reads e.g. "FELT PATCH · DIE-CUT".
- Tested at 1440 with mocked Airtable (pennant and boxed-logo art on every mode), tabs regression 26/26, no errors, 0 writes.

## 2026-11-10 — v258: sew-on thread colour
Stephen: "can we be able to adjust the thread color when we are sewing these patches on the hats."
- The Patch picker has a **Sew-on thread** row: Auto (matches the border, what we usually use), 9 shop colours or any colour, and an optional thread name (e.g. Madeira 1747).
- The mockup shows the running stitch that sews the patch on: along the merrowed edge, 1/8" in on leather, in the border on a Cut-to-art patch. On a clip label it's the stitch across the top (the row reads "Stitch thread"; the Border row is hidden there).
- The proof adds "Sewn with: Madeira 1747 Red thread" (or the colour's name) under Placement, once a thread is picked or named. Auto adds nothing.
- Tested at 1440 with mocked Airtable; tabs regression 26/26; no errors, 0 writes.

## 2026-11-10 — v259: close-ups on the garment's own fabric
Stephen, 11184 (Colortone 8777 Funnel Cake tie-dye): "are we able to grab fabric texture from this tie dye to use for the close up."
- A close-up's background was one flat colour (the darker of the front / back photo colours), so a tie-dye or camo became a plain beige box.
- Now, when the garment photo is patterned, the close-up uses a crop of the photo's chest / belly (the middle of the garment, about life size, no print on it) behind the art. Solid garments keep the flat colour. The per-garment close-up pages do the same.
- Colours tab › How it looks on the mockup › **Close-up background**: Auto (fabric when the photo is patterned) · Colour · Fabric, per garment, with a line saying which it's using.
- "Patterned" = the colours across that crop vary a lot (tie-dye ~30, solid ~0 on the test; threshold 14). On-model photos and bandanas keep the flat colour.
- Tested with a mocked tie-dye and a solid photo: tie-dye → fabric, solid → colour, Colour forces flat; no errors, 0 writes.

## 2026-11-10 — v260: pick an ink's type by hand (OW, DC, …)
Request via Stephen: "can we be able to make specific inks or colors DC or OW etc".
- **Before:**
  - The proof wrote one type for the whole print: DC on discharge, OW on a base (dark garments), plain direct to fabric.
  - Getting a different type on one ink needed a Rename ("7501 DC", v226).
- **Now:** tap an ink in Colours. The pop-up has a **Type on the proof** row: Auto · Plain · OW · DC · SOW · EZP.
  - **Auto** is the old behaviour.
  - **Plain** drops the type. Any other choice prints the ink with that type, e.g. "7501 DC", "COOL GRAY 2 EZP", "WHT DC" (white on EZP stays "EZP WHT").
  - It applies to that ink in this imprint on every garment.
  - It shows on the ink list and on the proof's ink chips. The hint says "On the proof: WHT DC · every garment in this print".
  - It's kept with the job's saved work (`imps[id].inkType`), and it's copied when an imprint is copied.
  - It only shows for screen prints. It's matched by the ink's name, so 7501, "PANTONE 7501 C", "7501OW" and "7501 DC" are the same ink, and WHITE = WHT.
  - The row sits under the search box, not inside "More".
- **Tested** (mocked Airtable, practice, a 10-colour print on Navy and Khaki):
  - DC on the white made "WHT DC" on both garments.
  - EZP on Cool Gray 2 made "COOL GRAY 2 EZP" on both, with the other inks unchanged (OW on Navy, plain on Khaki).
  - Auto put it back. 0 writes, no errors.

## 2026-11-10 — v261: proof notes on the close-up page only
Stephen: "can we also remove the warning we attach from page 1 and just keep it on page 2 in the mockup builder".
- **Proof notes** (the disclaimers picked from the drop-down, e.g. "ANY THIN LINE DETAILS <1 POINT MAY NOT PRINT") showed twice on two layouts: under the print's name on page 1, and again on the print's close-up page.
  - Embroidery: page 1's notes list.
  - The older bandana page-1 layout.
  - The garment template (screen print) already kept them on the close-up only (v184).
- **Now page 1 leaves them out** for every print that has a close-up page, which is every print except size tags. Tags have no close-up page, so their notes stay on page 1.
- **Unchanged:**
  - the fixed blue line on page 1 ("PLEASE NOTE: PRINT SIZE IS SHOWN TO SCALE ON A SIZE M GARMENT…");
  - the embroidery thread-colour line;
  - the bandana sizing line and the semi-opaque swatches.
- **Tested** (mocked, practice) with an embroidery imprint and the thin-lines note:
  - v260: the note on page 1 (2 text lines) and on the close-up.
  - v261: page 1 has none, the close-up still has it.
  - A screen print was the same as before (close-up only). No errors.

## 2026-11-10 — v262: a new order starts blank
Stephen, on 11187 (no line items yet), whose screen showed 11185-B: "I accidentaly clicke something from another job 11185-B and now it looks connected...when we move to another job it either is blank...it doesn't move over the info from a job that does have a line item".
- **Cause:** `pickOrder` reset the line list but kept the last order's imprints (`J.imps`, `J.allImps`, the current imprint), its "Pick up where you left off" offer and its Notes brief.
  - If the new order had lines, picking its first line replaced them.
  - With no lines they stayed, so the last job's imprint, art and setup looked attached to 11187. Nothing was written to Airtable.
- **Fix:** switching orders clears the imprints, the attach state, the offer and the brief first.
  - An order with no lines shows "Pick a job to start" and "No lines with imprints".
  - Each imprint's art and settings are still kept by imprint, so going back to the old order brings them back.
- **Tested** (mocked, practice): on 11095, then an order with no lines, then back to 11095.
  - v261 kept 11095-A on the empty order.
  - v262 showed no imprints and no brief on it, and 11095-A came back with its art when switching back. No errors.

## 2026-11-11: v263, "Pull the art out" finds a drawn tag beside the shirts
Stephen, on proof 9954 | 5026-MS: "looks like the mockup creator is having a hard time pulling out this Inside Tag I want to grab".

**Why it failed:** the tag on page 1 is drawn art (Illustrator vectors) in the left column under "SIZE TAG - 9954-A / Width: 0.8" Height: 2" / Placement …". "Pull the art out" only offered:
- art on the shirt photos;
- loose placed pictures (here, the printer's logo).

Drawn art off the shirts was never a tile.

**v263:**
- Any "… TAG - <order>-<letter>" label (size, inside, neck, hang or woven tag, or label) gets its own tile.
- The tile is the art between that label's Width / Placement lines and the next text in its column (APPROVED, a note). Photos and placed pictures in that strip are left out.
- The width is taken from the label's own line.
- A flat swatch behind the tag (the garment colour) gives two tiles:
  - one with the background colour taken off (colour → see-through, inside letters too, edges unmixed);
  - one with its background.
- "Use for" picks the order's tag print.

**Tested** on the 9954 proof (Playwright, real pdf.js and pdf-lib):
- Tiles: LEFT CHEST, BACK, the new SIZE TAG - 9954-A (clean white art, 0.8″) plus its with-background version, and the logo.
- The 11011 BGE and VDBLK proofs, 11136 and 10695 give exactly the same tiles in v262 and v263.

## 2026-11-11: v264, extra proof pages
On 11011's hang tags and UPC / polybag labels, Stephen said the customer's own label files can be used as they are: "I am just more interested in being able to add a Page to the mockup and place the images in similar section or move them around". Carton labels are handled in the packing app.

**The 11011 research** (an agent read the proofs and the Drive folder):
- The extra pages were laid out by hand in Illustrator.
- The labels came from Illustrator data merges.
- The hang tag front and back were pasted onto 11×11 pages with their sizes in blue above them.

**v264:**
- **Proof › + Page:** an 11 × 11″ page with the close-ups' header (logo box, order number, the page's title, default "Hang tags & labels") and APPROVED box.
- **Getting pictures on:** **Add pictures** (PNG, JPG, PDF or AI), dropping files on the page, or pasting.
  - Each PDF page becomes its own picture, blank edges trimmed, at its real size. A UPC label PDF comes in at 1.39″.
  - Other pictures come in about 3″.
- **Moving and sizing:**
  - drag to move;
  - drag the blue corner to resize, or type the width;
  - arrow keys nudge (Shift for bigger steps);
  - Delete or **Take off** removes a picture (with Undo);
  - **Line up** puts the pictures in neat rows.
- **Notes:** a blue note above any picture. **Size** writes e.g. `1.23"w x 3.2"h`.
- **Saving:**
  - One set of pages per order, so every garment's proof gets them.
  - They're in the proof PDF.
  - They're saved with the job (on this computer and in the Drive setup file) and come back with Pick up.
  - **Remove page** (with Undo).

**Tested** (Playwright, mocked Airtable, 11095 mock order):
- + Page adds the tab and the bar.
- A PNG and a UPC PDF go on side by side.
- Dragging moves a picture by +1″ / +0.5″, and Size fills the note.
- The PDF has 5 pages (4 + the new one).
- Saving the setup and restoring it brings back 1 page with 2 pictures.
- No errors.
- (Again a `//` comment mid-line broke renderProof; fixed with `/* */` before shipping.)
