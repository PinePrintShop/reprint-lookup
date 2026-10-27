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
