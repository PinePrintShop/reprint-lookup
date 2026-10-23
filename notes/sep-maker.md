# Sep Maker (art → films)

Permanent link: `sep-maker.html`. A desktop app for the art department. It makes no Airtable writes, so it has no practice mode.

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
