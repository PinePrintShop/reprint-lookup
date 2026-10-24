# Sep Maker (art → films)

Permanent link: `sep-maker.html`. A desktop app for the art department. It makes no Airtable writes, so it has no practice mode.

## 2026-10-24 · v3: proof builder
**Why (Stephen):** "Tech pack would be like a proof builder that would be uploaded to the Review or Art to Do". Then: "You can find proof on Airtable. Grabbing photos form S&S, Sanmar, ASColour would be great. Showing placement would be great".

**The layout copies the art department's own proofs**, taken from four on Line Items › Proof Images (Oct 23): 11068, 11072, 11074 and 11075.
- Page 1 has:
  - the Pine box, "Proof" and the order number
  - the Fine Print, with separate garment and bandana versions
  - on the left: the garment (brand, style, colorway, fabric content) and the blue "sizing is not to scale" note
  - the front and back garment photos with the prints on them
  - per print: LOCATION - ID, Width/Height, Placement, and colour chips (BASE, EZP WHT, 7681 OW, 282 …)
  - the APPROVED box
- Then one page per print, with the big ID, Location, Dimensions, Placement and the art large.
- The format is letter landscape, the same as theirs, at about 0.3–0.5 MB.

**What it does**
- **0 · Job:** lists the orders awaiting proof (`{Order Status}="Awaiting Proof"`, the same rule as Line Item Review), then the line and its imprints, shown as chips.
  - It uses the same Airtable key as the other apps.
  - Each imprint keeps its own art and sep settings.
  - The imprint's Pantone list (Imprints › Pantone) names the inks it matches.
  - The location sets the starting print width (LC 3.5″, F/B 11″, bandana 20″). A file's own size is used only when it fits the location.
- **Garment photos:**
  - AS Colour garments: AS Colour first.
  - Everything else: S&S (front and back, large), then SanMar (front and back flats).
  - Colour comes from the vendor (S&S hex) or the photo's body. Without a photo it falls back to the colour name, so "Hot Pink" works.
  - No photo means a plain tee or hoodie shape. A missing back photo shows "**BACK IMAGE UNAVAILABLE", as the art department does now.
  - Carolina Creative bandanas get the bandana page.
- **Placement:**
  - Each print starts where the shop puts it: left chest 3″ below the neck and 3.6″ off centre, front 3″, back 3″ (5″ on hoodies), bandana centred.
  - Drag a print on page 1 to move it (¼″ steps). "3″ below neck" follows the drag.
  - A typed **Placement text** ("AS SEEN") overrides it, and **Mockup size** scales the picture.
- **Attach proof to line:**
  - Uploads `11074 | 1717-HYD.pdf` (V2, V3 … once a proof is already on the line) to Line Items › Proof Images.
  - Uses the same upload as Line Item Review, with a 5 MB limit.
- **Proof done → send to Review:**
  - Ticks Awaiting Review (`fldycrq3VJYSFd8Gi`), the same single change as Line Item Review's button.
  - The existing automation Slacks sales and the production manager.
- `?practice=1` fakes both writes.

**Needs worker v29** (`/proxy/img`) to save vendor photos into the PDF. Browsers can't export pictures from sites that don't send CORS headers. Without v29 the proof still shows the photos, but **Download / Attach** explains that the worker needs updating.

**Tested** with Playwright, mocked Airtable and vendors, using 10997 and 10991 art as 11074-A (left chest) and 11074-B (back):
- the order, line and imprint chips load, and the Pantone list names the inks 533 and 7527
- the left chest width stays 3.5″
- dragging the back print down 2″ changes "3″" to "5″ below neck"
- the PDF is 3 pages, 792×612 pt, titled "11074 | 1717-HYD"
- the upload goes to the right line and field with that filename
- the PATCH is exactly `{"fields":{"fldycrq3VJYSFd8Gi":true}}`
- practice sends nothing
- with no vendor photo, the plain shape and message show
- the bandana layout works
- spot seps are unchanged from v2 (10997 chokes and trap)

**Not yet**
- It doesn't also copy the proof into the order's Drive folder. Line Item Review does that when a proof is attached there.
- The sep settings aren't saved with the proof yet, so reopening for films means opening the art again.

## 2026-10-23 · v2: cleaner index seps
**Why (Stephen):** "I know this is a work in progress but how do we clean up index seps!" He sent phone screenshots of an index job in which every film had stray dots of other inks across flat areas, plus noise from the art.

**What changed** (index only; spot and sim are the same as v1):
1. **Smooth the art first:** on by default, a 3×3 median on the dot grid, so JPEG blocks and paper texture don't become dots.
2. **Solid areas** slider (default 12): a colour this close to an ink prints that ink solid and passes no error on. Flat areas stay flat, and only real blends get dots. Slide right for fewer dots.
3. **Dither:**
   - Diffusion: Floyd–Steinberg, now damped to 80% and capped, so error can't wander across the picture.
   - Pattern (tidy): an 8×8 ordered pattern between the two nearest inks. It is regular and leaves no stray dots, which is good for gradients.
4. **Hard edges stay hard:** where the art jumps sharply to a neighbour (more than 14 ΔE), the dot takes the nearest ink and no error carries on. The soft rim between two flat colours is now a clean edge, not a band of dots or a checkerboard.
5. **Stray dots:** remove lone dots (default), lone dots and pairs, or keep all. Two passes; a removed dot takes its neighbours' ink.

## 2026-10-23 · v1, first version
**Why (Stephen):** "Let's actually look at if we can really make the color counter more of a Sep software with simulated process and created bases etc". He also said: "Feel free to grab any .psd and the Sep file from drive folders you can scan to sample out… We use the Xitron rip. The Sep files should have all the choke and overlap traps in the files. We use Photoshop and Illustrator."

### House rules
Measured from 30+ finished jobs on the Printshop shared drive. The files sampled were the DCS 2.0 EPS seps and the `<order>-200LPI-SEPS.ai` film layouts, all 300 ppi. The customer files stayed private: none of them are in this repo.

**Film names**
- Pattern: `<mesh>M-<ink><suffix>`.
- Mesh: 158 for the base and the EZ layer, 230 for colours and discharge.
- `BB` is the underbase, in three strengths: Full BB, 1/2BB and 1/4BB. 1/4BB is "a blocker base that has been cut with EZP white" (Stephen).
- `EZWHT`, `EZCRM`, `EZ7528` and so on are the light layer. It prints over the base and is also the white or cream that shows in the art.
- EZ and EZP mean the same thing; "we just type them in" (Stephen).
- `OW` means a colour printed over white. `DC` means discharge.

**Print order:** BB, then the EZ layer, then colours from light to dark, with BLK last.

**Chokes and traps (300 ppi)**
- Each layer is choked 2 px: the base sits 2 px inside the EZ film, and the EZ layer 2 px inside a colour printed over white.
- Where colours touch, the lighter colour runs 2 px under the darker one.
- Bases are solid, with no pullback.
- There is no separate highlight white.
- Lines thinner than about 4 px drop out of the base.

**Which colours get a base**
- Dark colours print straight on a dark shirt; for example, the navy on 10997 has no base.
- Discharge jobs have no BB.

**Other notes**
- "200 LPI" in the file names was the owner's idea for sharper lines. It is not a halftone setting.

### What v1 does
**Setup**
- Open a PNG or JPG by dropping it, pasting it or picking the file.
- The app trims empty canvas and reads the file's ppi to suggest a print width.
- If the art sits on a solid background, the app removes it.
- Then pick the shirt colour.

**Methods**
- **Spot** follows the house rules above.
- **Index** makes Floyd–Steinberg square dots at 1, 2 or 3 px. It has no chokes, and the base sits exactly under the dots that need it.
- **Sim process** makes soft continuous-tone channels, plus a choked contone base and a highlight white, with a Blend slider. It is labelled as a try-out because there are no Pine sim seps to check it against yet.

**Inks**
- The app finds the art's colours (k-means in Lab). Anti-aliased edge blends between two colours are folded back into those colours. You can also set the number of colours with −/+.
- Each colour gets the nearest Pantone name. The name can be typed over.
- For each colour you choose one of: On base (OW), On shirt, EZ layer (the colour is the light layer itself, as with the cream 7528 on 10997), Shirt (no ink), or Merge into another colour.
- The default on a dark shirt: white or cream becomes the EZ layer, colours at L\* 40 or lighter go on the base, and darker colours print straight on the shirt.

**Base settings**
- Base strength: BB, 1/2BB or 1/4BB.
- EZ layer: EZWHT, EZPWHT, EZCRM, EZOFFWHT or none.
- Choke and trap sizes in px.
- Keep fine lines in the base. When this is off, a note lists the lines the base drops, and they show red on the BB film.

**Discharge**
- No BB.
- The light layer becomes WHTDC, CRMDC and so on.
- Colours with no base get DC.

**Views**
- On shirt: a composite in which colours without a base look dull on dark shirts.
- Films: each film with its print order, mesh and an editable name.
- Art: the original.
- The quick preview draws first, then the real 300 dpi films replace it, so the notes and films match what gets exported.

**Export**
- A zip with one 8-bit grayscale TIFF per film, at 300 dpi with black as ink.
- Each film has 0.75″ margins, four registration marks and a label: `n/N-158M-BB | 13" | F | 10991-A` plus the whole stack.
- The zip also holds a proof PNG.
- These go to the Xitron as they are, or can be placed on `Standard-sep-template.ai`.

### Checked against Pine's own films (Playwright, real art from the drive)
- **10991** (light blue on navy, 13.24″):
  - The app made BB → EZWHT → OW colour, the same stack as the shop's film.
  - Base to EZ edge: 3.0 px; the shop's film is also 3.0. Base to colour: 5.0; the shop's is also 5.0. (These are the analysis script's edge distances, which run 1 px above the choke.)
  - The Pantone match was 310 where the shop used 630, so check the names.
- **10997** (5″ left chest):
  - BB → EZ7527 (the shop used 7528) → navy straight on the shirt.
  - Base to EZ edge: 2.8 px; the shop's film: 3.0. Base to navy: −1.0; the shop's: −1.0. Cream under the navy edge: 1.0 px wide; the shop's: 1.0.
- **10948** (low-res JPEG on black): Spot, Index and Sim process all ran, the thin-line note showed, and the export worked.
- Discharge on 10997 gave 7527DC and 7546DC. 10991 on a white shirt gave a single film.
- At 390 px wide (phone), nothing scrolls sideways.

### Not done yet / next
- No real sim-process samples yet. Stephen is finding a couple of jobs. The ones on the drive are 100–340 MB, and the Drive connector can only download about 5 MB.
- It can't open PSD, AI or PDF yet. Export a PNG from Photoshop or Illustrator first.
- Pantone matching works from the screen colour, so always check the names.
- It doesn't place films onto the 16×21.25 template artboards.
