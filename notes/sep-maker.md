# Sep Maker (art → films)

Permanent link: `sep-maker.html`. A desktop app for the art department. It makes no Airtable writes, so it has no practice mode.

## 2026-10-25 · v11: no outline round everything (sim)
**Why (Stephen):** "why does everything still have an outline".

**Cause:** in sim, when a white or cream in the art was the EZ layer, that layer wasn't choked at all. It ran to the edge of every colour sitting on it, which showed as a cream line round the grid squares, branches and type. Spot didn't have this problem.

**Fix**
- The EZ layer is full size only where the cream itself shows (no on-base colour on top). Everywhere else it's choked under the colours, the same rule as spot.
- Dark colours printed straight on the shirt (black, dark grey) spread 1 px over the small gap kept between them and the base, so no shirt-coloured ring shows round them either.

**Tested** on 10695 art, sim, royal shirt, at 4×: grid squares, branches and type have clean edges.

## 2026-10-25 · v10: base and stroke controls, no base peeking out
**Why (Stephen):** "I still can't really control the bases like I should be able to select add a base or something and then adjust the choke and then be able to adjust the stroke on all top colors as well". Then, about TOPO with a cream ring around it: "the base is peaking out vs being under the top colors".

**Section 5 is now Bases and strokes**
- **Underbase (BB):**
  - tick it on or off
  - Full / 1/2 / 1/4
  - its own **choke** in px, measured inside the EZ layer
- **Light layer (EZ):**
  - tick it on or off
  - EZWHT / EZPWHT / EZCRM / EZOFFWHT
  - its own **choke** in px, measured inside the colours
- **Auto until you tick them yourself:** BB is on for dark shirts, EZ for coloured or dark shirts. The note under each says "Auto: …" or "Set by you · back to auto".
- **Ticking a base on when no colour sits on it** puts all the colours on it.
- **Colours on the base: All / None** buttons. Each colour's own setting still works.
- **Top colour stroke:** a −4 … +4 px slider that grows or shrinks every top colour, applied after the traps. In sim, tonal screens get a grey max/min filter.
- Works in spot, index (BB on/off) and sim. House defaults are unchanged: 2 px + 2 px.

**Base peeking out (sim):** the soft rim round black type on the shirt was solved as "grey/cream ink on base". Three changes fix it:
1. **Edge snap.** A pixel that's just the blend of two very different colours (2 px either side) takes the nearer one. Dropped or transparent pixels count as the shirt colour.
2. **The base has to earn it.** It only goes where it beats printing straight on the shirt by a margin.
3. **Cleaner base.** Hairline slivers of base are opened away, and the base stays 1 px clear of anything printed straight on the shirt.

**Tested** (Playwright):
- 10991 on navy: BB is under EZ, which is under 310.
- BB choke 4 shrinks BB only.
- BB off removes it.
- Stroke ±2 grows or shrinks the colour by the expected amount.
- A white shirt is auto-off; ticking EZ puts the colours on base.
- 10695 art in sim on royal: TOPO and the grid edges are clean, with no grey or cream ring.

## 2026-10-24 · v9: sim stacks only where the art blends
**Why (Stephen):** "looks like all the colors stack......vs only some like the gold is all under the red vs just where the bird is and not hte solid text".

**Cause:** in v8 the solver stacked a second ink wherever that got even slightly closer to the art. Gold sat under 99% of the solid red, and 74% of all printed pixels had two or more inks.

**Fix**
- **One ink on its own wins.** If a single ink, printed over what's beneath it, matches a colour within 10 ΔE, that colour prints with that ink alone at 100%.
- **Stacking costs more.** Each extra ink costs λ 6 instead of 3, so it's only used where it clearly helps (the birds' blends).
- **Ink picking is unchanged in spirit.** Auto still picks inks by how well they *can* rebuild the art (λ 2 while picking), so the stricter rule doesn't starve the palette.

**Tested** (10695 art, black and royal shirts):

| | v8 | v9 |
|---|---|---|
| Gold under solid red | 99% | 0% |
| Printed pixels stacked | 74% | 4–6% |

The orange chest still mixes. The real PNG (for tuning against Pine's sep) is still pending; only `10695N-SLOW-TOTE.eps` (361 MB) is on the drive.

## 2026-10-24 · v8: base on coloured shirts, drop background everywhere, solid inks
**Why (Stephen):** "doesn't look like the base is turning on? can you look into that". Then: "Still add information in the middle that is not there. also how to control what gets halftones...meaning the squares in the back should be solid since we are only reducing the ink".

**Changes**
- **Base on coloured shirts.** v7 only put a base under colours on dark shirts (L\* < 50), so on a royal or bright blue shirt everything printed straight on the garment.
  - Now every shirt except white, natural and light heather gets the EZ layer under its colours.
  - BB (blocker) stays for dark shirts only.
  - Black and very dark inks still print straight on the shirt.
  - The shirt line says which of the three cases applies.
- **Drop background → Everywhere, not just at the edges.**
  - The edge-only drop left the grid lines boxed in by the birds as white ink ("information in the middle that is not there").
  - The new option removes that colour all through the art, with a tighter match (8 ΔE) so cream bellies stay.
  - The note now points to this option when the background colour also shows up inside the art.
- **Solid inks (sim).**
  - A **Solid** tick on each ink means it prints 100% or nothing and is never halftoned: a tint mixed down in the bucket, like 10695's grid.
  - The stacking solver only gives that ink 0 or 100%.
  - Any colour that's 15%+ of the art always gets its own screen and starts Solid.

**Tested** (Playwright): 10695 art, sim, royal shirt.
- The 5517 grid gets its own ink and is ticked Solid.
- BB and EZ7527 are under the colours, with black and 447 straight on the shirt.
- With "Everywhere" ticked, all the grid lines show the shirt.
- 45 LPI shows dots only in the tonal screens.

## 2026-10-24 · v7: halftone preview
**Why (Stephen):** "would be cool to have it also be able to simulate 45lpi / 55lpi at 22.5 angle as well on all the layers just to preview them and then we will still let the rip handle the actual halftones".

**What it does:** a **Halftone** switch next to the zoom.
- Settings: Off / 45 / 55 / 65 LPI. Every screen gets round dots at 22.5°.
- **Where it shows:** On shirt (the stack, including toggles, order and ▶ play) and the single-screen view.
- **Resolution:** drawn at 300 dpi. Turning it on jumps to 4× zoom so the dots are visible.
- **Dot method:** a pixel prints where the screen's tone beats a round-dot threshold. That is area-true up to about 78%, where the dots touch.
- **Preview only:** exports stay continuous tone, and the Xitron makes the real dots.

**Tested:** the 10695 art at 10.5″ renders in about 1 s. At 8×, the red dots sit over gold in the orange chest. Turning it off goes back to the fast preview.

## 2026-10-24 · v6: screens (not film), print order and stack, stacked file for the Xitron, new sim logic
**Why (Stephen):**
- "we don't use film.....we are about to move to the Saati Laser 8012. So we stack all of our colors and have them assigned pantones and send an .ai file to our Xitron....can we have a preview where it is the actual sep files and you can toggle on and off colors and watch it stack etc and maybe we can also change the print order depending on how it stacks"
- On v5's sim of the 10695 art: "I think we have some work to do on the simulated process logic". The orange chest came out pink, the white grid lines came out blue, and the art looked washed out.
- "we might need to make it a little more editable......like if he you look at the original sep we have a tonal color going straight on the garment and not on a base"

**Print order panel (On shirt view)**
- The preview is built from the actual screens, listed in print order.
- **Tick a screen off** to see the print without it. It still exports.
- **Drag a screen (or use ↑ ↓)** to change the order. The order carries into everything:
  - the overlaps (the screen printed earlier runs under the later one)
  - the sim mix
  - the n/N names
  - the export
- **▶ Watch it stack** plays the screens down one at a time. **Reset** goes back to the default order.

**Export seps (the main button)**
- **Stacked .ai / .pdf:**
  - one page, where every screen is an 8-bit image in its own spot colour named like the screen (`230M-630OW`)
  - overprinting, in print order
  - registration marks and the label on /All
  - Illustrator opens it, and the Xitron reads each spot as its own screen
  - checked with Ghostscript: one separation per screen, with the right names
- TIFF per screen is still available.
- "Films" is now "Screens" everywhere.

**Sim process, rebuilt**
- Every colour in the art is matched by **stacking the inks in print order** over the EZ layer, or over the shirt. A small solver picks each ink's amount (0–100%) so the printed colour matches, with a small cost per ink. Yellow under red makes orange, and a flat colour lands on one ink at 100%.
- **Picking the inks:** with Auto colours, Sep Maker takes about 12 candidates from the art, then adds inks one at a time, keeping whichever rebuilds the art best when stacked. It stops at Pine's usual 8 screens, counting BB and EZ, or when another ink barely helps. A blue that's 3% of the art now beats a third grey.
- **Roles count:**
  - "On base" colours stack over the EZ layer.
  - "On shirt" colours print straight on the garment, solid or tonal, with no base under them, like 10695's TNTCLR grid.
  - Each art colour takes whichever rebuilds it better, and only the on-base ones get base.
- **Drop background warning:** if "drop background" removed a colour that also appears inside the art (white grid lines touching the edge), a note says so.

**Tested** (Playwright):
- The 10695 art re-separated on black: blue feathers, orange chest (7407 gold under 1788 red) and flat red graphics, in 6 screens.
- Setting 5483 to On shirt prints it straight on the garment, named `230M-5483` with no OW.
- Toggle, ↑ and play all work.
- The stacked .ai holds one separation per screen.
- The TIFF zip still works.
- Spot output is unchanged: 10997 gives BB / EZ7527 / 7546.

**Next:** Stephen will send the original PNG for 10695, so the sim can be tuned against Pine's actual sep pixel for pixel.

## 2026-10-24 · v5: sim process the Pine way
**Why:** Stephen sent a real sim-process sep, `10695-45LPI-SLOWSeps` (.ai, 25 MB). It stays in the private scratchpad, not the repo.

**What that job is:** 8 screens at 10.5″, 45 LPI, F-A:
- `230M-TNTCLRBSE` → `158M-PINEBRWNEZP` → `230M-101OW` → `230M-1655OW` → `230M-WRMRDOW` → `230M-404OW` → `230M-292OW` → `230M-Black`
- The raster tiles are 600 ppi. The films are mirrored, which none of the spot jobs were; I'm asking Stephen.

**Measured** (rendered at 150 dpi, share of inked pixels at full strength):

| Screen | Solid | What it is |
|---|---|---|
| TNTCLR base | 98% | the flat tint grid |
| Brown EZP light layer | 94% | a solid silhouette under all the colour |
| Warm red | 79% | graphics, mostly solid |
| 101, 1655, 404, 292 | 2–6% | tonal: the photo part, halftoned by the RIP |
| Black | 13% | tonal, plus the solid TOPO type |

- There's no separate highlight white; the cream EZ layer is the highlights.
- The order is the same as the spot jobs: base → EZ → colours light to dark → black.

**What changed in Sim process**
- **Base: Solid (Pine)** is the new default:
  - The EZ layer is a solid silhouette under every colour on the base, choked 1 layer.
  - A white or cream colour in the art is that layer itself.
  - BB sits under it on dark shirts.
  - **Tonal** keeps v4's soft base.
- **Highlight white:** off by default, now labelled "Extra highlight white screen".
- **Flat colours print solid:** a colour within 8 ΔE of one ink prints that ink solid, so graphics stay solid and only blends are tonal.
- **The shirt colour itself gets no ink.**
- **Names:** colours on the base are named …OW, as on Pine's films.

**Checked** by re-separating the 10695 print (from its own films) on black:

| Screen | v5 solid | 10695 solid |
|---|---|---|
| BB / EZ | 100% / 100% | 98% / 94% |
| Grid | 81% | 98% |
| Red graphics | 92% | 79% |
| Photo colours | 4–28% (rest tonal) | 2–12% (rest tonal) |

Spot and index are unchanged.

## 2026-10-24 · v4: Check view (chokes and overlaps)
**Why (Stephen):** "is there a way to preview the overlap and or the choke on a base".

**New Check tab:** the print on the shirt at 300 dpi, dimmed, with marks on top:
- **yellow** where a colour on the base has no base under it (the choke)
- **magenta** where two colours both print (the overlap / trap)
- **a yellow-and-magenta checker** where both happen at once. That's the usual case where a light colour runs under a dark one right at the edge of the base, as on 10997.

**Legend:** shows the choke and trap in px and inches (2 px = .007″), or "none".

**Zoom:** the button steps Fit → 1:1 → 4× → 8× and centres the view, so single pixels are visible.

**Also changed:** retyping the same print width no longer re-runs the separation.

**Tested** (Playwright): 10997 on black shows the 2 px rim as choke and overlap together. 10991 on navy shows a yellow band 4 px wide (base 4 px inside the colour) and no overlap.

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
- Opens PNG, JPG, AI, PDF (v12) and PSD (v21).
- Pantone matching works from the screen colour, so always check the names.
- It doesn't place films onto the 16×21.25 template artboards.

## 2026-10-26 — v12
Stephen: "can you also update sep maker to be able to get .ai or .pdf files as well".

- **Opens .ai and PDF art.** The artboard is drawn with pdf.js 3.11.174, the same reader Mockup Maker uses. It renders at up to 300 ppi (max 6000 px a side) on a clear background, so there's no white box to drop.
- **Print size from the file:** an artboard is measured in points, so the art comes in at its real size and the print width is right straight away.
- **Spot colours:** spot colours named in the file (Illustrator swatches, PDF separations) pop up when it opens, to check the ink names against.
- **Old .ai files:** an .ai needs its built-in PDF copy ("Create PDF Compatible File", on by default in Illustrator). Without it there's a clear message to re-save it with that ticked or export a PNG.
- **Still PNG/JPG only:** PSD.
- Tested with Playwright: a 10″ × 6″ two-colour logo as .pdf and as .ai.
  - It came in at 9″ × 4.2″ after trimming, matching the art's 8.96″ × 4.17″.
  - It separated into 158M-BB, 158M-EZWHT, 186 and 654 on black.
  - A non-PDF-compatible .ai showed the re-save message.

## 2026-10-26 — v13
Stephen: "in the .ai file it looks like an image vs being assigned the pantones...I would like to be able to click separation preview to check in .AI".

- **Why it looked like an image:** v12's stacked file put each screen in as a greyscale image in its own spot colour. A RIP reads that, but Illustrator (as far as I can tell) turns spot-coloured images into plain images when it opens a PDF, so Separations Preview has nothing to list. I couldn't confirm this in Illustrator itself. What Illustrator keeps as spot swatches is vector shapes filled with a spot colour.
- **"Stacked .ai (vector, Pantones)", now the default:** every screen is vector shapes in its own spot colour named like the screen (230M-630OW), overprinting, stacked in print order, each in its own layer.
  - Solid screens are traced exactly from the 300 dpi screen.
  - Tonal screens (sim blends) become vector halftone dots: round, at the Halftone setting (55 LPI if Off), at 22.5°, sized to the ink in each cell. The RIP prints those dots as they are.
- **"Stacked .pdf (RIP screens it)"** is the v12 file: continuous tone for the RIP. Illustrator shows it as an image.
- **Sim process bug fixed:** v12's 1 px trap on dark sim colours counted everything beyond the art's edge as full ink, so those screens got a frame round the art. Beyond the edge is now "no ink".
- **Tested:**
  - A 2-colour logo .ai exported to 4 vector screens; Ghostscript separations list exactly 158M-BB, 158M-EZWHT, 230M-186OW, 230M-654, plus one layer per screen.
  - A 7-screen sim glow exported in 4 s at 6.9 MB, with 2 tonal screens as dots (checked at 300 dpi) and 5 solid screens.
  - No frame on any screen.
- **Not checked in Illustrator itself:** whether Separations Preview lists the screens. Stephen to confirm on a real job.

## 2026-10-26 — v14
Stephen: "let's not vectorize it and maybe let's include a .psd on channels as well".

- **Stacked .ai / .pdf are v12's again:** each screen is a continuous-tone image in its spot colour, and the Xitron makes the halftones. The vector .ai from v13 is gone.
- **New export, "Photoshop .psd (spot channels)":** a grayscale document at 300 ppi.
  - The composite is left white. Every screen is a **spot channel** named like the screen (230M-630OW), in its ink colour, in print order; ink is black in each channel, as Photoshop draws spot channels.
  - It opens in Photoshop with Window › Channels showing every screen. From there it can be checked, edited, or saved as DCS for the .ai template.
  - Under the hood: names in resources 1006/1045; ink colour, solidity and kind = spot in 1077; 300 ppi in 1005; RLE-compressed channels, no layers.
- **Kept from v13:** sim traps no longer put a frame round the art.
- **Tested:**
  - A 2-colour logo .ai → .psd at 2700 × 1260: psd-tools reads 5 channels (white composite + 158M-BB, 158M-EZWHT, 230M-186OW, 230M-654), all marked spot with the right colours. Each channel's pixels are correct.
  - A 7-screen sim job → .psd (1.1 MB) reads back with all 7 spot channels.
  - **Not opened in Photoshop itself yet.**

## 2026-10-26 — v15
Stephen: "can we also include an eye dropper so we can grab colors from the original and make the colors it does pick have an easier selector to change them".

- **Eyedropper (4 · Inks › Eyedropper):**
  - Tap it, then tap the art. The view switches to the original art while picking, and Esc stops.
  - The colour there (a small average of the original) is added as an ink named for its nearest Pantone, with the usual role (on base / on shirt) for the shirt colour, and its own screen appears.
  - If it's practically identical to an existing ink (within ΔE 2.5), that ink's picker opens instead.
  - Picked colours are kept when the colour count changes, unless the scan already found the same Pantone or a very close colour.
- **Easier ink picker:** tap an ink's swatch to open a panel under it:
  - the 12 closest Pantones to the art colour as tappable chips (the current one highlighted)
  - a search box (186, Cool Gray, Reflex…)
  - "Re-pick from the art", to sample that ink's colour again with the eyedropper

  Typing in the name box still works.
- **Tested:**
  - A blue panel with a tiny green dot (about 0.2% of the art): the auto scan missed the green, and the eyedropper added 355 with its own screen 230M-355OW. After + there was no duplicate.
  - Picker chips, search ("cool gray" → Cool Gray 11…7), choosing a chip, and re-picking from the art all worked.

## 2026-10-26 — v16
Stephen: "does a weird thing with the .psd it was adding one of the colors in channels to the grey". His screenshot of 11080-A-F-SEPS.psd showed:
- Channels listed Gray + 3 spot channels, but the job had 4 screens.
- The canvas showed a checkerboard in the shape of the missing screen.

- **Why:** the v14/v15 .psd had no layer section. Photoshop then treats the first extra channel as the background layer's transparency, so the first screen disappeared from Channels and showed as see-through on the canvas.
- **Fix:** the .psd now has one plain, opaque layer ("Base", white) with no transparency channel (a positive layer count), so every extra channel can only be a spot channel.
- Tested with psd-tools:
  - 1 layer (Base, gray channel only), no transparency.
  - Merged image: a white Gray channel plus every screen as a named spot channel with correct pixels (logo: 4 of 4; sim glow: 7 of 7).
- **To confirm:** Stephen to re-check in Photoshop that all screens show in Channels and nothing is see-through.

## 2026-10-26 — v17
Stephen: "can I also just export as a 300dpi transparent .png as well".

- **New export, "Transparent .png (300 dpi)":** the print as it will look, at full print size.
  - The screens are drawn in their ink colours, stacked in print order, solid. The on-screen see-through used for previewing on a dark shirt isn't applied.
  - It's see-through wherever no ink prints, with soft edges kept as partial transparency.
  - 300 dpi is written into the file (pHYs chunk), so Photoshop and Illustrator open it at the real size.
- **Tested:**
  - A 9″ × 4.2″ logo exported as 2700 × 1260 RGBA at 300 dpi, with transparent corners and the navy exactly 0/58/112.
  - A 7-screen sim job exported as 2700 × 2700 with a transparent background.

## 2026-10-26 — v18
Stephen: "I changed a color in the sep and then it looked like it added that to another color as well".

- **Why:** Sim process rebuilds every colour in the art by mixing the inks, and it did that maths with each ink's Pantone colour. A new Pantone on one ink changed the whole mix, so that ink moved into other colours' areas (or out of its own).
- **Fix:** each ink keeps the colour it was separated with. That's set when the colours are found, or when the ink is added or re-picked with the eyedropper.
  - A new Pantone (chip, search or typed name) now only renames and recolours that screen; the films stay the same.
  - The picker says so: "A new Pantone renames and recolours this screen only. To change what it separates, use Re-pick."
  - Spot and Index weren't affected; they match pixels by the art colour.
- **Tested:** 7-screen sim glow, third ink changed to Reflex Blue.
  - v17: that screen went to 0 (−100%), two others grew by 19–24%, and the base halved.
  - v18: every screen's coverage is unchanged; only the name became 230M-REFLEXBLUEOW.
  - The eyedropper still adds a missed colour.

## 2026-10-26 — v19
Stephen, after comparing the tama tee original (RGB, not CMYK) with Sep Maker's PNG: "it is all for screen printing. maybe we can also have access to any color in the options as well not just the closest".

- **Why the colours looked muted:** the art's electric blue #2931DC sits outside the Pantone range. The nearest inks (Blue 072, 2736) are ΔE ≈ 19 away, so the PNG honestly shows 2736 (#1E22AA). The file was RGB, not CMYK.
- **Ink picker (tap a swatch) now has two views:**
  - **Closest:** the 12 nearest to the art colour, as before.
  - **All Pantones:** the whole shared table (1,369 inks, without the shop shorthand like BB, CRM, CG1, WG1), sorted by colour — greys light to dark, then round the hue wheel in 15° steps, each light to dark — in a scrollable grid.
- **Search** covers the whole table (up to 60 matches), so any Pantone is reachable.
- Tested: Closest shows 12, All shows 1,369, a search for "2728" finds it, and choosing Bright Red from All renames the screen to 230M-BRIGHTRED.

## 2026-10-26 — v20
Stephen: "I feel like we can usually get it pretty dialed in with the actual printed inks. I have always had a hard time with pre selecting pantones when the customer didn't provide them" — then "let's just [do] 1 and 2 right now".

- **1 · Pine's own inks first:**
  - Sep Maker reads the Inks table (read only): ink name, plus a rollup per ink. That rollup is read as how many imprints used the ink (1,709 inks, 4,536 uses, 1,007 distinct; the top 100 cover ~73%).
  - Names are normalised to Pantone names: CG2 → Cool Gray 2, R032 → Red 032, W RED → Warm Red, "Pantone 186 C" → 186, BLK → Black. The result is cached for a day (`pine_sm_inkuse_v1`).
  - When picking a Pantone for an art colour, an ink Pine has run gets an allowance against the very nearest: 1.5·1.4·log10(1+uses), capped at 3.5 ΔE (1 use ≈ 0.6, 10 ≈ 2.1, 40+ ≈ 3.4). So a much-used ink wins when it's nearly as close.
  - Auto picks made before the history loaded are re-picked once it arrives; names the art dept changed are left alone.
  - The picker's Closest view sorts the same way and shows "run 45×" on inks Pine has used.
- **2 · How close each pick is:** every ink shows ✓ close (ΔE under 5), ~ near (5–10) or ! far (over 10), with the exact ΔE on hover. A far ink's picker says "brighter than any ink can go — dial it in on press" and offers two starting points:
  - **Closest:** the nearest ink overall.
  - **Same brightness:** the nearest ink at the same lightness and hue, judged in OKLab, because Lab bends blues toward purple. For the tama blue, Lab called 266 (a purple) the same hue; OKLab picks 2728.
- **Not done (3):** learning from the art dept's corrections needs a small new Airtable table. Not approved yet.
- **Tested, with a mocked Inks table** (541 ×46, 286 ×40, 186 ×45, CG2 ×24, 185 ×3) on art with an electric blue (#2931DC), a 654 navy and a 186 red:
  - Without history: Blue 072 (! far, 18.9), 654 (✓), 186 (✓).
  - With history: the navy becomes 541 (✓ 1.3, run 46×).
  - The blue's picker shows the far note with Closest: Blue 072 and Same brightness: 2728.
  - The eyedropper and the "rename doesn't reshuffle sim screens" check still pass.
  - **Not tested against the live Inks table:** no Airtable key in the test sandbox.

## 2026-10-26 — v21
Stephen: "oh we should also have it do .psd files as well".

- **Opens .psd art** via ag-psd 31.0.2, the same reader as Mockup Maker.
  - It reads just the flattened image and skips layer pixels, so big files don't run out of memory.
  - A PSD saved without a flattened copy (Maximize Compatibility off) is built from its visible layers, respecting hidden groups and layer opacity.
  - It's capped at 6000 px a side.
  - Print size comes from the PSD's resolution.
- **Spot channels:** their names pop up when the file opens, like an .ai's spot colours.
- **An already-separated PSD** (spot channels, white composite) only gives its names. The composite is blank, so there's nothing to separate.
- Tested with Playwright:
  - A 6000 × 7500 two-layer PSD opened in 7.5 s at its real size (16.75″ after trimming) and separated into 1795 / 2728 / 0131.
  - Sep Maker's own spot-channel .psd opened at 9″ and showed "Spot colours in the file: BB, EZWHT, 186OW, 654".

## 2026-10-26 — v22
Stephen: "also the sep maker can't combine colors and it probably should". It could, but only from the bottom of each ink's How-it-prints menu ("Merge into").

- **4 · Inks › Combine similar** (with **Undo**):
  - Smallest colour first, each one joins the nearest bigger colour within ΔE 15, or one with the same Pantone.
  - A colour that has taken another in stays put, and merges don't chain. (A first draft at ΔE 24 with chaining collapsed a 6-step gradient into one ink. Now it goes 6 → 4.)
  - Colours under 1% of the art that sit between two bigger colours, or between a colour and the shirt, are blended edges and join the nearer colour.
  - A small real accent (a 0.2% green dot) stays.
- **Each ink's picker** has "Combine with" chips: tap the ink this one should print as.
- **A merged ink** says "merged into 725 · Unmerge". Unmerge puts back its old role.
- Tested on a gradient, on flat art with forced extra colours, and on art with a tiny accent.

## 2026-10-26 — v23
Stephen: "doesn't look like I can add a highlight white in the sep maker". It was only under Sim process settings, and only did anything on dark shirts.

- **One "Highlight white (HLWHT)" box**, now with the base layers (Underbase / Light layer), for every method:
  - **Spot and Index:** an HLWHT screen over the white areas of the art (the white/cream inks, and the EZ layer's own colour), printed after the colours and before black, with no choke.
  - **Sim process:** the art's brightest near-neutral areas, tonal: full strength at pure white, fading out by about 78% lightness. Works on any shirt. Asking the sim mix for a white gave an empty screen, because the EZ base already supplies white.
  - **No white in the art:** a note says so.
- Tested on navy art with white text (15% white), black shirt:
  - Spot: HLWHT 15.1%. Index: 15.0%, after the colours. Sim: 14.9%. Sim on a white shirt: 14.9%.
  - Off: no HLWHT. Art with no white: the note shows.

## 2026-10-26 — v24
Stephen: "trying to open up a .psd file and saying CMYK not supported".

- CMYK .psd files open. The Photoshop reader (ag-psd) refuses CMYK, so the flattened image is read straight from the file (RGB/CMYK/grayscale, 8/16 bit, raw or RLE), with its ppi and spot channel names. CMYK → RGB without a colour profile (same reader as Mockup Maker v31).
- Tested: a CMYK RLE PSD opens at 300 ppi; a 16-bit RGB PSD with spot channels still opens through ag-psd.

## 2026-10-26 — v25
Separation .psd files (spot channels) open with every ink, the same reader as Mockup Maker v34 (Stephen, in Mockup Maker: "this is suppose to have more colors but I am only seeing blue"). The PSD's flattened copy leaves spot channels out; now each spot channel is laid in with its own colour and solidity. Tested: Sep Maker's own spot export now separates to 186 / 654 / White (was White only); CMYK PSD still opens.

## 2026-10-26 — v26
Same PSD reader as Mockup Maker v35: Multichannel and Duotone seps open, and channels with no colour record get their colour from their name.

## 2026-10-26 — v27
Same as Mockup Maker v36: inks kept as plain saved channels (e.g. "blk", "blue" in a CMYK PSD) are laid in. Each takes the artwork's colour where it's inked, or its name.

## 2026-10-26 — v28: the order's Google Drive folder
Stephen: "the sep one should do the google drive access to the folder so we can download the art work...also can we upload to the drive from teh app as well?"
- **Customer's files** under 1 · Art once an order is picked: the order folder opened at Client Provided, as tiles with thumbnails. Folders open in place, and the path goes back up.
  - Tap art (PNG, JPG, PDF, .AI, .PSD) to open it in Sep Maker.
  - ⬇ downloads any file. Other files open in Drive.
- **⬆ Upload here**, or drop on the panel: files go into the folder that's open, up to 25 MB each.
- **Export › "Also save to the order's Drive"** (ticked, shown when the order has a folder) puts the export in the order's Seps folder as well as downloading it. Seps / Separations / Sep, else the top of the order folder. Exports over 25 MB download only, with a note.
- The same worker routes as Mockup Maker v38. Practice uploads nothing.
- Tested with a mocked worker:
  - the panel, download, 2 uploads to Client Provided;
  - opening logo.png from a tile;
  - a transparent PNG export saved to Seps (drive/upload?folder=SP).

## 2026-10-26 — v29: the export becomes the imprint's sep file
From the Seps / Screens review. Stephen: "now that we have google drive setup....can we scan Seps and Screens app and see how we can improve those" → "you can have an agent start working on Seps and Screens".
- In Export, under "Also save to the order's Drive", a new tick: **"Make it 11075-A's sep file"**. When the export is saved to the order's Seps folder, its Drive link goes into Imprints › Sep URL. That's the field the Seps and Screens apps open, so nobody copies links by hand.
- It's ticked when the imprint has no sep link. If it has one, it reads "Replace 11075-A's sep file link" and starts unticked.
- Not offered for the transparent .png (a picture of the print, not seps), or when the Drive save is off. Exports over 25 MB download only, so they aren't linked.
- Practice fakes the save.
- Tested with a mocked worker: a .psd export uploads to drive/upload?folder=SP, then PATCHes the imprint with `{"fields":{"fldiBqdFTRMahiMeI":"<webViewLink>"}}`; the toast says it's now 11080-A's sep file.

## 2026-10-26 — v30: Separations preview
Stephen: "can we mimic the separation preview from .ai more in this one or the channels in photo shop where you can see how the traps and chokes are...the check area is ok but kind of lacking".
- The **Check** tab is now **Separations**, built like Illustrator's Separations Preview and Photoshop's Channels:
  - **The screen list sits beside the picture** (the same list as On shirt). Tick a screen to show or hide it. **Click a screen's name to see only that screen**; click it again for all of them.
  - **Show:**
    - **Inks:** the visible screens in their ink colours on the shirt.
    - **Film:** black = ink, like a channel in Photoshop. With one screen showing it's that screen's film; with several, the films together.
    - **Edges:** the print dimmed, with each visible screen's outline drawn in its own colour. You can see the gap between a base's edge and a colour's edge (the choke), and where two colours run into each other (the trap).
  - **Mark chokes and overlaps** (on by default): yellow = a based colour with no base under it, magenta = two colours print. Now for the visible screens only, so hiding screens lets you check one pair at a time.
  - **Point at the picture** to read each visible screen's ink there, e.g. "x 786 y 807 px · 158M-BB 100% · 158M-EZWHT 100% · 230M-107OW 100%". It's like Illustrator's separation percentages.
  - Zoom 4× or 8× to see the 2 px chokes. The screen list now stays in view while a zoomed picture scrolls (in On shirt too).
- Tested (Playwright, art.png on black):
  - the three views; the readout over the circle, the rectangle and the shirt;
  - solo (4 of 5 hidden) and back;
  - 8× at the circle/rectangle corner shows the yellow choke band and the magenta trap;
  - the v29 export → Sep URL test and the highlight-white tests pass.

## 2026-10-27 — v31: defaults that match how Pine seps
From a study of 51 recent Pine sep files (`<order>-45/55/200LPI-SEPS.ai`) and 421 Airtable imprints. The files and imprint data stay in the private scratchpad; none are in this repo. Stephen approved items 1–3, and corrected the study: Pine uses "Just waterbase products." That means:
- waterbase on a blocker base (BB / EZP);
- waterbase direct on the shirt;
- discharge (DC);
- specialty waterbase (puff, glow).

**What changed**
1. **Base strength from the garment's fabric** (`bbFromGarment`, `fabricMix`, `autoBB`). Auto until the art dept picks one; "back to auto" undoes it.
   - 100% cotton (Comfort Colors 1717, AS Colour, garment-dyed): **1/4BB**.
   - CVC, heather, 60/40 and other cotton-rich blends (Next Level 6210, Bella 3001CVC, 3739): **1/2BB**.
   - Poly, 50/50 and more poly, tri-blend, camo, poly hoodies (35%+ poly): **Full BB**.
   - It reads Garments › Fabric ("60% Cotton, 40% Polyester", "60/40 cotton/polyester", "50% Polyester, 25% Cotton, 25% Rayon"), then the colour (heather), then a few known styles when the fabric is blank.
   - A base already on the imprint's Pantone list ("Pantone 1/2 BB - EZP") wins over the fabric.
   - No order picked, or a fabric it can't read: 1/4BB, the shop's most used.
   - The note under Strength says why, e.g. "Auto: 1/2BB — 60/40 cotton/poly · Airtable ink 1/2 BB - EZP".
2. **Naming and chokes**
   - The base screen is always **`158M-BB`** (spot colour, .psd channel, TIFF name), whatever the strength. v30 called it `158M-1/4BB`.
   - The strength shows in the film label (`1/4-158M-BB (1/4BB)`), the top legend, and the screen card with its Airtable ink name ("Underbase 1/4BB · ink 1/4 BB - EZP"). Sep Maker writes no ink names to Airtable itself. Proof chips still say BASE.
   - Default chokes **3 px at 300 ppi**: BB inside the EZ layer, and EZ inside the colours. They scale with the output size as before. The colour-to-colour trap stays **2 px**.
   - **Thin lines** (`thinCore`): a colour line **7 px (.023″) or wider** keeps a thinner base along its middle (BB 2 px in from the edge, so 3 px of BB on a 7 px line, with the EZ 1 px round it). Lines **6 px or thinner** drop it, show red on the BB film and get the warning. Pine's files keep base from 9 px and drop it at 6, so 7–8 px is our call. "Keep fine lines in the base" still keeps everything.
3. **Discharge matches the shop**
   - Every colour is its own DC screen, butted against its neighbours with the 2 px trap. Nothing sits on a WHTDC underlay any more, and there's still no BB.
   - The white is just another screen in the print order. It isn't forced first; drag it and the traps follow.
   - White names: WHTDC, **CRMDC** or **OFFWHTDC**, from Light layer › Ink, or from an ink named White / Cream / Off White. A Pantone cream keeps its number (`7527DC`).
   - **Plain waterbase extras** (BLK, 433 and other very dark inks, L\* under 25) keep their plain name, with no DC, and print last. Each ink's menu on a discharge job reads Discharge (DC) / Waterbase, no DC (prints last) / White DC, so any ink can be switched.
   - Ticking Discharge re-sets the roles that way; merges stay. The base section and the shirt line say "discharge: no base".

**House rules, updated from the study** (waterbase only)
- Of 49 jobs with readable films: 21 waterbase on a base, 18 discharge, 10 waterbase direct.
- Base strength in Airtable: 1/4 BB on 80 imprints, 1/2 BB on 33, FULL BB on 25, plus EZP WHT on 117. Discharge whites: WHT DC 60, OFF WHT DC 17, CRM DC 17.
- Measured chokes: BB inside EZ, median 2.6 px (49 prints); EZ inside the colours, 3.0 px (26 prints). Colour traps: 2.2 px (64 pairs). The house rule is now 3 / 3 / 2.
- The base film is named `158M-BB`; the strength is only in the label (`1/3-1/4BB`).
- Discharge colours butt with a ~2 px trap (e.g. 4985DC × WHTDC on 10813). Waterbase extras on discharge jobs keep plain names: 433 on 10813; BLK and R032 on 10976.
- White can print mid-order on a discharge job (11012: 2995DC → 297DC → WHTDC → 172DC → 1797DC).
- File names carry the LPI: 55 LPI (24 files), 45 LPI (17), "200 LPI" (8; not a halftone setting, see v1).

**Not done yet**
- Halftone tools: split a colour into a solid screen plus a halftone screen, flat tints, `-45LPI-` / `-55LPI-` in the export name, and a warning or cap at 8 screens.
- Highlight white as `158M-HIWHT` on 158 mesh, printed last (Sep Maker still makes `230M-HLWHT` before black).
- Presets for puff, glow, totes and bandanas.
- Shared films across colourways (one set of screens for several garment colours).
- Real sim-process samples to tune against: the drive copies were too big to download.
- Sim process keeps its own base (the thin-line rule is spot only), and Index places the base exactly under the dots, as before.

**Tested** (Playwright, mocked Airtable, synthetic art at 300 ppi):
- Strength: the 1717 gives 1/4BB, the 6210 1/2BB, a 100% poly tee Full BB, and an imprint listing "1/2 BB - EZP" gives 1/2BB. 16 real Garments › Fabric strings land as expected.
- A yellow square on black: EZ 3 px inside the colour, BB 3 px inside the EZ. Blue/red butt: 2 px trap.
- Lines of 4 / 6 / 7 / 8 / 9 / 12 px give BB 0 / 0 / 3 / 4 / 3 / 4 px.
- The stacked .ai has spot `158M-BB` and the label `158M-BB (1/4BB)`.
- Discharge on royal gives WHTDC → 1795DC → BLK, with no WHTDC under the red, a 2 px overlap at the butt, and BLK plain and last. WHTDC moves to second. CRM gives CRMDC, OFFWHT gives OFFWHTDC. Index + discharge works the same way.
- The earlier Sep Maker tests (v20–v30) pass on v31.

## 2026-10-27 — v32: Pull the art out of an old proof
Stephen: "can we get that mockup puller also in the separations tool. That might be helpful since the actual artwork should be in there with the size spelled out".
- An old proof PDF (named like "10125 | 1717-GR.pdf" or "V2 …", or anything named proof/mockup), from a file, a drop or Drive, now opens as **Art in the old proof** instead of the whole page. The tiles show:
  - drawn art cut out over each shirt, with the shirt photos blanked (pdf-lib swaps every image for a see-through dot). It's sharp, on a clear background, and redrawn at 300 dpi for the proof's own width;
  - pictures placed on the shirts, at their own size.
- Each tile names the print and width from the proof ("BACK -10125-D · 11″ wide"). It has **Separate for 11089-D · Back**, and the button for the matching imprint is dark. The art loads on that imprint at that width, ready to separate. The file is named "Back art (from the old proof).png", so the old order number isn't picked up as the imprint.
- Page arrows step through a multi-page proof. **Open the whole page** keeps the old way. Art PDFs (not proofs) open straight in as before.
- Same code as Mockup Maker v49, including the real-proof fixes (cut above the labels, keep the main block).
- Also: the same file can now be opened twice in a row. Before, picking it again did nothing.
- Tested (Playwright, mocked Airtable) on the real 10125 | 1717-GR.pdf, 11/11. It found 2 prints, matched them to 11090-A Left Chest at 2.2″ and 11090-D Back at 11″, and loaded the back at 3286 px. It separated as 158M-BB → 158M-EZ7499 → 230M-141OW. Open the whole page works, an art PDF goes straight in, and nothing was written to Airtable.

## 2026-10-27 — v33: bandana default
Stephen: "yes natural is direct to fabric" and "that works for the default for bandanas as long as we can edit it". This is the same rule as Mockup Maker v50.
- A bandana imprint starts at the **20.6″** all-over size from the study (it was 20″).
  - **Discharge** is ticked to start on a coloured bandana.
  - It's unticked, meaning direct to fabric, on **Natural or White**.
  - A DC on the imprint's Pantones ticks it whatever the colour.
- The Discharge box still changes it.
- **Bandanas never get a base**, whether they discharge or print direct. The BB and EZ Auto settings are off on a bandana, and the shirt line says "bandana: direct to fabric, no base". Before this, a coloured bandana printed direct got an EZ layer.
- Bandanas now draw in their stock colour. The colour chart from Mockup Maker is copied in: the closest Pantone from Stephen's sheet, plus Black, White, Natural and Hippie. "Natural" isn't a web colour name, so before this a Natural bandana kept the previous line's colour.
- Tested (Playwright, mocked Airtable): 9/9. The checks were:
  - Navy: Discharge ticked at 20.6″, can be unticked;
  - Natural: direct with no base, can be ticked;
  - Natural with "186 - DC": ticked;
  - Navy art: 1795DC → BLK;
  - Navy printed direct: 1795 → BLK, with no BB or EZ;
  - nothing written to Airtable.

  The v31 and v32 tests still pass.

## 2026-10-27 — v34: bandana proofs pull as one piece; Export window tidied
- **Bandana proofs.** Stephen, on 11075 | 4800-HPP.pdf: "on this bandana it makes the art 3 separate images....vs just the white and blue that I want for the sep". Same fix as Mockup Maker v51:
  - the bandana picture counts as the garment and is the only thing blanked;
  - everything on it comes out as one tile;
  - the page's "Width:" is used for a lone garment;
  - a low-res note points to the real art file.
  - On the real proof the result is **230M-WHTDC → 230M-2995DC** at 19.9″: only the white and blue, no pink. The proof's pictures are only about 26 ppi at that size, so for production seps the real art file is still better.
- **Export window.** Stephen: "can we clean up how this is spaced with the wording".
  - The screens are chips that never break mid-name ("230M-141OW" used to split across lines).
  - The formats are an even 2-column grid with short names (.ai · Xitron, .pdf · stacked, .psd · channels, .png · 300 dpi, TIFF per screen), with one plain sentence under them.
  - The options sit below a rule with room between them. "Also save to the order's Drive" is now "Save to the order's Drive".
- The tile buttons wrap inside their tile.
- **Tested** (Playwright, mocked Airtable), 8/8:
  - a Hot Pink bandana has Discharge ticked;
  - the real bandana proof gives 1 tile with only white and blue (0% pink, 5964 px), separating as WHTDC → 2995DC with no base;
  - the Export window has no sideways scroll and each screen name sits on one line.

  The v31–v33 tests still pass.
- **Fine print in the tiles** (Stephen's 11085 | 73051-MDN.pdf: the tiles came out as the proof's fine print). Illustrator clips its shirt photos to the shirt, but the photo's box can reach the fine print and the labels.
  - The proof is now drawn twice, with and without the photos. The pixels that change mark where the garment really shows, and only art inside that is kept.
  - On the real 11085 proof the result is the clean back art at 11″ and the left chest at 3.5″.
  - This also fixed the 10125 left chest, which had picked up extra again (back to 645×857).

## 2026-10-27 — v35: exports in Pine's sep template
Stephen: "can you review our sep template that is what we need the exports to be in".

**Standard-sep-template.ai.** The same file is copied into every order folder (Illustrator 26.5, Feb 2025). It's one 16 × 21.25″ artboard (1152 × 1530 pt) with:
- a 2-line label at the top: six "n- Pantone" slots, then Print Width and Print Location;
- two register targets on the centre line, each a circle with a cross and an X, about 0.59 × 0.39″.

**The finished seps** (10798, 10868, 10948, 11046, 9368) show how the template gets filled in:
- one page per print;
- the label is in the registration colour at 1.64–1.92″ from the top, on the side away from the art. Line 1 is half the films plus the width ("1/3-1/4BB 2/3-EZWHT 3”"); line 2 is the rest plus location-letter ("3/3-7574OW LC-A");
- the films leave the mesh off the label, and the base shows its strength;
- the top target is centred 2.25–2.64″ down, and the bottom one about 1″ under the art;
- the art's top is 3.56″ down. A left chest sits about 3.7″ right of centre, as on the shirt;
- files are named `<order>-45LPI-SEPS` for jobs on a base and `-55LPI-` for discharge or direct.

**What the stacked .ai / .pdf export does now** (marks on): it lays the film out that way.
- The artboard is 16 × 21.25″. It only grows when the art can't fit (e.g. a 20.6″ bandana).
- The label is Helvetica 10 pt in /All, top left or right, laid out as above.
- The targets match the template's shape. The top one is centred 2.45″ down; the other sits 1.2″ under the art.
- The art top is at 3.56″, centred, or ±3.6″ for a left or right chest (from the imprint's placement).
- The file is named `11090-45LPI-SEPS LC-A.ai`. The PNG, PSD and TIFF zip get the same name start.
- Untick "Registration marks and label" for the bare art, as before.
- The spot names are unchanged (`158M-BB`, `230M-107OW`…).

**Measured on the export** (pdftoppm at 36 dpi; the template's figures in brackets):
- label 1.64–1.92″ (1.64–1.92);
- target 2.25–2.61″ × 7.69–8.28″ (2.25–2.64 × 7.69–8.28);
- art top 3.56″ (3.56).

**Not yet:**
- One file with a page per print for the whole order, which is how the shop's own seps are saved. Today each print exports on its own.
- The TIFF-per-screen films still use the old cropped layout, because a full 16 × 21.25″ page at 300 dpi per screen is very large.

**Tested** (Playwright, mocked Airtable), 9/9: the name, the 16 × 21.25″ size, the label text and position, the target position and shape, the art top, and the back print ("11”", "B-B", label on the right). All earlier tests pass; the t_seps label check was updated to the template style.

## 2026-10-27 — v36: a tidier panel; the whole order in one file
Stephen approved both halves of the flow review: the panel cleanup ("let's build all of it") and one sep file per order with a page per print ("yes").

**The panel** (heights of the left panel at 1440 × 900, mocked order 11090):

| | v35 | v36 |
|---|---|---|
| no order | 1938 px | 1013 px |
| order picked | 2037 px | 1114 px |
| art open | 2314 px | 1361 px |
| bandana (discharge) | 2248 px | 1276 px |

The panel is the same height at 390 px wide. On a phone the preview now comes first, so the 2000+ px is no longer above it.

- **Steps** run from 1: **1 · Job → 2 · Art → 3 · Inks → 4 · Bases and strokes**.
  - Method (Spot / Index / Sim) and Discharge are one row at the top of Inks.
  - The shirt is part of the Job.
- **Bases and strokes** is closed to one line, e.g. "BB 1/4 · EZWHT · choke 3/3 · trap 2 · Edit". Edit opens every control as before.
  - On a discharge job it's "4 · Traps": "Discharge: no base · WHTDC · trap 2". Only the trap, the stroke and the DC white's name (WHTDC / CRMDC / OFFWHTDC) are left. Those still change the seps.
  - On a bandana printed direct it's "Bandana: direct, no base · trap 2".
  - This replaces 715 px of disabled base controls.
- **Shirt:** once a line is picked it's one line, "Hot Pink · discharge · Change". Change shows the swatches. With no order the swatches stay open.
- **Imprint and Location** are text when they come from the job ("11090-C · Bandana · Edit").
- **Line:** an order with one line shows it as text; it was already picked automatically. With 2+ lines the menu stays.
  - The garment name isn't repeated under the imprints any more.
- **ⓘ taps** (tap again to hide) replace the hints that were always on screen:
  - the inks legend (by the Inks title);
  - the house rule (by Trap);
  - Discharge, Keep fine lines, and drop the background / Everywhere;
  - the Index "Solid areas" and "Smooth" notes.
- **Inks controls on one row:** − Auto + · Combine · Eyedropper. "Combine similar" is now "Combine"; the tooltip still explains it.
- **🔎 Find the art** in the Drive box, the same as Mockup Maker v41. It's read-only: worker drive/search, drive/list and drive/file, plus Airtable GETs.
  - The buttons "This order #… / Reprint of #… / 🔎 Find the art" sit above the files. A reprint with no Drive folder of its own opens the original's.
  - Find the art lists, in this order:
    - the original imprints' **Last proofs (Airtable)**; a proof opens in Pull the art out;
    - every art file two folders down in the reprint's folder, this order's folder and the customer's 6 newest other orders (Sales, Invoices, Embroidery and Old seps are skipped).
  - A folder with no art offers Find the art right there.
  - New read-only fields: Orders › Customer, and Imprints › previous imprint / nickname / Proof Images.
- **Pull the art out:** "Separate for" is said once above the imprint buttons, and each button stays on one line. The tiles are wider.
- **House style:** sliders are black, the disabled export formats are greyed out, and nothing in the panel is under 12 px.
- **Phone (≤ 900 px):** once art is open, the preview sits on top and stays there (sticky, 46% of the screen) while the panel scrolls under it. Nothing is wider than the screen at 390 px.
- **No order:** "No order — just separating" (as before), and the hint says "No order? Just open art and separate.", like Mockup Maker's wording.

**Whole order in one file.** The shop saves seps as one file per order with a page per print (`10798-45LPI-SEPS.ai`). When a line has 2+ prints, Export offers **This print** or **Whole order: all N prints, one page each**.
- Each print with art is separated with its own saved settings onto its own 16 × 21.25″ template page. Each page has its own label (films, width, LOC-letter), placement (a left chest 3.6″ off centre, the back centred) and spot colours.
- The spot names can repeat across pages (158M-BB on both); each page is its own set of separations.
- It's named `11090-45LPI-SEPS.ai`: 45 if any page is on a base, else 55 (the v35 rule, worked out for each print).
- Prints with no art are listed as "skipped: no art". Progress shows "Print 1 of 2 · 11090-A: Screen 3 of 5: 230M-107OW".
- **Drive:** it saves to the order's Seps folder. There's a "Make it …'s sep file" tick for each print in the file, ticked when the print has no sep link yet and unticked when it would replace one. Practice uploads and writes nothing.
- The print you were on comes back exactly as it was: the same settings, inks and preview.
- PSD, PNG and TIFF stay one print at a time. In Whole order they're greyed out, and the window says "Whole order is .ai / .pdf only".

**Tested** (Playwright, mocked Airtable and worker):
- **New tests** (`sm36/t36.js`): 56/56 live, 55/55 practice.
  - The moved controls work: bases Edit and summary, shirt Change, imprint Edit, the ⓘ taps, and the line picked automatically.
  - The inks bar is on one row.
  - Find the art shows 4 groups, opens a last proof in the Pull dialog, and uses only GET search/list.
  - The Separate-for buttons are 40 px tall.
  - Whole order gives 2 pages of 1152 × 1530 pt. Page 1's label has LC-A and page 2's has 11” and B-B. The art is centred at 11.6″ and 8.0″, and both pages have `/Separation` names. The print is restored.
  - Live, it uploads to `folder=SP` and PATCHes Sep URL on both imprints. Practice uploads and writes nothing.
  - The single-print export is still `11090-45LPI-SEPS B-B.ai`.
- **Panel test:** 5/5 at 1440 and 7/7 at 390 (no sideways scroll, preview on top and sticky).
- **Earlier tests, re-run on v36** (selectors updated where controls moved; collapsed sections are opened, nothing loosened): t35 9/9, t32 11/11, t33 9/9, t34 8/8, t_seps 32/32, t_fabric 22/22.

## 2026-10-27 — v37: tidy Separations toolbar; bases show in the .ai
- **Separations toolbar.** Stephen: "can we clean up the toggle section.....it get funky under the text".
  - Before, the switch, the tick, the two colour keys and the point-at-the-picture readout shared one wrapping row. As the mouse moved, the readout ("x 160 y 44 px · no ink — shirt") changed length and pushed everything around.
  - Now there are three steady lines:
    - Inks / Film / Edges plus "Mark chokes and overlaps";
    - the keys, shortened to "Choke · 3 px (.010″) per layer" and "Overlap · 2 px (.007″)", with their meaning on hover;
    - the readout on one line that never wraps.
  - The toolbar has its own full row under the tabs, with Halftone and 1:1 on the right.
  - Tested: moving the pointer to 4 spots leaves the toolbar height and width and the picture's position unchanged, at 1440 and 1280.
- **Bases show in the .ai.** Stephen: "when a sep comes out....can we slightly add a color to the bases so we can see them when we open up the .AI file".
  - In the stacked .ai / .pdf, each screen's display colour (its spot colour's alternate) is now:
    - BB: light blue-grey (C28 M12 Y0 K12);
    - EZ layer and white or near-white screens (WHTDC, HLWHT, a cream EZ): light warm tan (C4 M14 Y32 K0);
    - all other screens: their ink colour.
  - This only changes how Illustrator shows them. The spot names, which are what the Xitron goes by, are unchanged, so the films are the same.
  - Checked in the exported file: /158M-BB 0.28 0.12 0 0.12 and /158M-EZWHT 0.04 0.14 0.32 0. A Ghostscript overprint render shows the bases as tinted areas under the inks.
  - The .psd's channel colours are unchanged.
- **Tests on v37:** t35 9/9, t36 56/56, t_seps 32/32, t_fabric 22/22. Panel heights are the same as v36.

## 2026-10-27 · v38: left-panel spacing; Discharge in Bases
Stephen: "can we clean this up as well....maybe do another spacing scan for the mockup creator and the separation maker", and "can I select discharge in the separations app" (then: "found the button!").
- **Customer's files / Find the art:** the same layout as Mockup Maker v56.
  - One-line heading with small Upload / Open in Drive ↗, then one compact "This order | Reprint #10125 | 🔎 Find the art" row, then the folder path.
  - Find headings are one line: "Last proofs · open one to pull the art out", "Reprint #10125 · Cohesion Brewing Co · Open in Drive ↗", "This order #…", "Other order #…".
  - The "No Drive folder" note has its own line (`#driveNote`).
- **Spacing:**
  - 24px between the numbered steps and 12px inside them (`--p-s5` / `--p-s3`; was 18 / 10).
  - Empty hints and an empty imprint row no longer add double gaps.
  - The empty ink-count badge is hidden.
  - Ink rows: "✓ close · 52% of art" sits on one line.
  - Bases: "Top colour stroke" and "Trap" line up.
- **Discharge in 4 · Bases and strokes:** an "Underbase | Discharge" choice at the top of the section. It's the same setting as the Discharge tick beside Spot / Index / Sim under 3 · Inks, kept in step, and hidden for Sim.
- Scan (`scratchpad/sm38/scan.js`): the wraps, two-row button rows, 0px and uneven gaps are all gone. The imprint tabs still wrap when there are 3 (they can't fit in 368px).
- Tests on v38: t36 56/56 (practice 55/55), t35 9/9, t37 3/3, t_seps 32/32, t_fabric 22/22. t36's source-button and heading checks were updated for the new wording.

## 2026-10-27 · v39: inks follow the proof; Check the proof
Stephen: "it would be great in the separation app a way to review the mockup to make sure it pulled the correct colors. I pulled a job in to test and it re colored it different than the mockup had called out".
- **Reading the proof:** opening a line reads its latest proof (Line Items › Proof Images, last one, through the worker's Airtable-attachment route).
  - Mockup Maker v57+ proofs: the `PINE-INKS` callouts in the PDF Keywords.
  - Older Illustrator proofs: the chips (`141`, `WHT`, `107OW` …) in the text under each "… - 10125-A" label. Mockup proofs from before v57 are pictures, so nothing can be read from them.
- **Naming the inks:** after the imprint's Pantone list, the proof wins.
  - When the proof says which art colour became which ink, each sep ink takes the ink of the nearest art colour (within ΔE 40). Recolours carry over: red art printed as 285 is named 285.
  - Otherwise names are matched one to one by nearest colour (within ΔE 45).
  - If the proof arrives after the art is open, inks nobody has typed over are renamed.
  - A line under the ink list says "Ink names from the proof (V2 …): BASE WHT · 107OW · 285OW".
- **3 · Inks › Check the proof:**
  - the proof's pages on the left (page tabs);
  - on the right, the imprint's chips, then each sep ink → what the proof calls it (✓, "Proof: 285" in red, or "not on the proof"), then "On the proof but not in the seps: …";
  - **Use the proof's inks** renames any that differ;
  - an imprint the proof doesn't cover, or a picture-only proof, gets "compare by eye".
- Tests:
  - new: `scratchpad/sm38/t39.js` 12/12: v57 proof with a recolour, a late-arriving proof, an imprint not on the proof, and the 10125 Illustrator proof (reads `141 WHT`);
  - on v39: t36 56/56, t35 9/9, t37 3/3, t_seps 32/32, t_fabric 22/22.

## 2026-10-27 · v40: a reprint finds its sep; APPROVED box spaced
Stephen: "with reprints that should have a sep file...can it scan all past jobs associated with this nwe imprint id and find the folder that has the sep if it doesn't have a master created yet". The master is the canonical file system (Canonical Promotion app), "but that only gets added when we have reprinted that design at least 2 times". Then: "yes build".
- **What the data showed:**
  - new reprints link one job back (Previous Imprint ID), and the chain often goes further: 11093-A → 9698-A → 9460-A, and 11089-A → 10125-A → 8783-A;
  - most older imprints have no Sep File URL, so their seps live only in their order's Drive folder.
- **1 · Job › "Sep for this reprint"** shows when the imprint is a repeat and has no Sep File URL:
  - **Master design** first: the imprint's Canonical Design `Master Folder URL` (`fld0Bu2TH7Rgflvm4`, lookup) or its own `Canonical Folder URL`, or the first one found back along the chain. Its sep files are listed.
  - then back along Previous Imprint ID, up to 8 jobs. For each job, its Sep File URL, else its order's Drive folder: the Seps / Separations / Sep folders (and one level of subfolders), plus the order folder itself.
  - What counts as a sep file: .ai / .pdf / .psd / .eps whose name has SEP or LPI or that job's imprint code. Templates don't count. Files named for the imprint come first, then the newest.
  - It stops at the nearest job that has one.
  - Each find has Open ↗ and **Make it 11093-A's sep file**, which writes Imprints › Sep File URL (the field Export already fills). Practice writes nothing.
  - An imprint that already has its sep file just shows "Sep file · linked · Open ↗". Nothing found → "No sep found in 9698-A → 9460-A".
- **APPROVED box** on the proof is spaced out, as Mockup Maker v58.
- Tests:
  - new: `scratchpad/sm38/t40.js` 7/7: found 2 jobs back, link written, master via the chain, practice, not a repeat, nothing found;
  - on v40: t39 12/12, t36 56/56, t35 9/9, t37 3/3, t_seps 32/32, t_fabric 22/22.

## 2026-10-27 · v41: Review an old sep, then Save as the new number
Stephen tried "Make it 11075-A's sep file", then: "can we undo sep file attached to Airtable just did 11075-A and was just seeing how it works.....was hoping it would pull it into the App to quickly review and then save with the new number".
- **Undone:** 11075-A's Sep File URL was cleared in Airtable, back to empty as it was that morning.
- **Each sep found** under "Sep for this reprint" now has **Review** and **Save as 11075-A**. The link-only button is gone.
- **Review** opens the file in the app (downloaded through `/proxy/drive/file`):
  - every artboard (page tabs);
  - its spot colours, read from the PDF's `/Separation` names (a PSD's spot channels for .psd);
  - where it came from, plus Save as.
  - Files over 200 MB, or ones it can't read, offer Open in Drive.
- **Save as:**
  - the name is ready to edit: the old number becomes the new one (8107-A → 11075-A; "LC-A" keeps the new letter);
  - it goes into this order's Drive Seps folder (the same one Export uses);
  - "Make it 11075-A's sep file" is ticked, which writes Sep File URL with the copy's link.
  - The copy is Drive's own (**worker v32** `POST /proxy/drive/copy`, any size). With an older worker, files up to 25 MB are copied through the app (download + upload); bigger ones ask for worker v32.
  - The old file is never changed. With no Drive folder for the order, it says so. Practice copies and writes nothing.
- A Sep File URL that's a folder link is opened, and its sep files are listed.
- Tests:
  - new: `scratchpad/sm38/t41.js` 12/12, with a real sep (11014-55LPI-Seps.ai → 1 spot colour, 230M-WHTDC): Review, Save as name, copy into #11093 › Seps, link written, master file, no folder, practice;
  - on v41: t39 12/12, t36 56/56, t35 9/9, t37 3/3, t_seps 32/32, t_fabric 22/22.

## 2026-10-27 · v42: template layers inside the .ai (a test)
Stephen: "and can we leave the template layer in there." → "I think everything and we can maybe have it autohide and then we can turn them on if we need to make slight adjustments" → (told Illustrator may not read layers from a PDF-style file) "let's do the embedded-layers version first and see how that works".
- **Export › "Template layers, hidden"** shows for .ai / .pdf. It's off by default and needs registration marks on.
- **What it does:**
  - the order's `Standard-sep-template.ai` (its Drive order folder, or a Seps / Templates folder there) is downloaded and laid over each page (pdf-lib `embedPdf` + `drawPage`, top-left on top-left);
  - its own layers (PDF optional content) come with it, under their own names, all **off**: Left Chest Area, Long Sleeve Area, Sleeve Area, Pocket Area, NO ART ZONE, Size Tags - Saturn, Double Smooth Reg Marks, REG/TM Symbols, Adjuster, Reg Marks, Artwork;
  - the seps are wrapped in a new **"Artwork (seps)"** layer, on (`/OC /PineArt BDC … EMC`);
  - the catalog gets `OCProperties` with the order and ON / OFF.
  - The films are unchanged: same spot colours (158M-BB, 230M-107OW …), same 16 × 21.25″ page.
  - No template in the folder → exported without it, and a toast says so.
- **Checked with poppler:** with the layers off it draws exactly as before. With all on, the template's guides appear (NO ARTWORK AREA, sleeve / left chest areas, size tags).
- **Unknown until Stephen opens one:** whether Illustrator shows these as layers (it may flatten PDF layers into one, and could show the hidden guides). The guides are process colours, not spot films.
- Tests:
  - new: `scratchpad/sm38/t42.js` 6/6, with the real template;
  - on v42: t41 12/12, t39 12/12, t36 56/56, t35 9/9, t37 3/3, t_seps 32/32, t_fabric 22/22.

## 2026-10-27 · v43: fewer scrolls in the pop-ups
Stephen asked for a count of how often people scroll in the pop-ups. Before, on a 1366×768 laptop: Save as on "Review an old sep" was ~400px down, the last old-proof art tile ~430px, Download on a whole-order export ~160px, and "Use the proof's inks" was below the screen on laptops.
- **Every pop-up keeps its title and buttons on screen**; only the middle scrolls (done inside Sep Maker only, so old versions and other apps are untouched).
- **Review an old sep / Check the proof:** the picture fits the screen instead of a fixed tall size → Save as and Close always visible, 0 scrolls at every size.
- **Export:** 900px wide, two columns on wide screens (what to export + file type | marks, template, Drive save, sep-file ticks); shorter hints → 0 scrolls from 1366 up (a few px at 1280×720).
- **Art in the old proof:** 1200px wide, side-on tiles 3 across; page arrows stay in the pinned footer → 6 tiles fit with 0 scrolls.
Measured with the scroll-audit scripts at 1920/1440/1366/1280.

## 2026-10-27 · v44: Drive files show up on their own (shared pine-drive-watch.js)
Stephen: "yes let's add those update timers for the mockup maker and sep maker" (after Seps v50 got them — the art dept drops files in Drive by hand and wants them to show without reloading).
- The folders on screen are re-checked every 25 s while the tab is visible. A new file gets a yellow **New** tag (a re-saved one **Updated**) and goes first; folder tiles and the This order / Reprint tabs show "N new". Marks clear when you leave the folder, or after 30 min.
- "↻ Updated just now / 3 min ago" next to the folder path; tap it to check now.
- Our own uploads, attached proofs, setup files, exports and Save-as copies never show as New; a trashed or moved file doesn't come back from a check already on its way.
- Repaints only on a real change, keeps scroll, waits while someone is clicking, uploading or typing. No checks with the tab hidden or a dialog / menu open; checks at once on coming back. After 20 min with no mouse or keys, every 5 min instead. Errors back off up to 5 min. An order with no Drive folder is searched again every 2 min.
- **Refresh** updates in place and keeps the open order, garment, art and scroll.
- The timer code is one shared file, pine-drive-watch.js, so Line Item Review, Screens and Seps can use the same one later.
- About 290 worker requests an hour per open Mockup Maker tab (430 for Sep Maker); ~24–36 an hour when idle; none when hidden.

## 2026-10-27 · v45: no Proof tab
Stephen: "we can remove the PROOF in sep maker that isn't needed". The Proof tab (proof pages, Attach proof, Proof done) is gone — proofs are made and attached in Mockup Maker. "Check the proof" (the mockup proof's inks beside these) stays. The order picker now just says "Order".

## 2026-10-27 · v46: the ink picker finds Pine's inks as you type
Stephen (typing "cr" in the ink picker and getting 0 matches): "and we have the easy search in Seps as well right?". Same as Mockup Maker v65: Pine's named inks from Airtable › Inks (EZP Cream, EZP Off White, SOW Red Rum Red …, with their Display Hex or a starting colour) come first, then the Pantones; words in any order, part words, shop shorthand (crm, wht, cg8) and small typos match. New "Pine's inks" tab, most printed first; "Closest" now includes them. Bases aren't offered.

## 2026-10-28 · v47: WHT DC in the ink picker
WHT DC is the white discharge ink, not a base (as Mockup Maker v69): it's in the picker's Pine's inks again, first as the most printed, with a white starting colour.

## 2026-10-28 · v48: split black into halftone + solid screens; bases follow "On base"; ink choices stick; fit on a laptop
- **Split solid / halftone** (Stephen: "in simulated process if we are doing black in the halftones and it also has a lot of solid black text to be able to separate those into 2 different black / screens"). In Sim, a dark ink row offers **Split solid / halftone**: 230M-BLK keeps the shading, 158M-BLKSOLID takes big solid shapes (bold text) and prints right after it. Solid = coverage ≥ "Solid from" (90%) AND at least "Thinnest solid" wide (9 px = .03″, so dots / specks / hairlines stay halftone) AND a hard edge in the art (photo shadows that fade stay halftone). No double printing outside the Trap setting. Sliders, a live count, See both films, Merge back. Both screens go through Screens, Separations, print order, .ai/.pdf spot colours, .psd channels, TIFF zip and PNG; the split survives colour-count and shirt changes.
- **Ink choices stick** (Stephen: "everytime I change a garment color it brings back all the inks even though I have combined some and removed some"). Inks set by hand (how it prints, merge / combine / unmerge, shirt — no ink, Solid, split) keep their setting through a shirt change, colour count −/+/Auto, Spot ↔ Sim, drop background and discharge on/off; renames, meshes, hidden screens and print order stay with the right ink.
- **Bases follow "On base"** (Stephen: "having an issue with adding bases as well and not showing up under colors I have selected as OW" · "we usually always do 2 bases and like we have done before sometimes it will be the lightest color in the design"). Any colour set On base (OW) now turns on both bases on Auto — 1/2 BB and the EZ layer (the lightest colour in the design, as before) — on any shirt, bandanas included; the Bases summary, Auto text and shirt line say so. A name only gets OW when a base really prints. Sim makes the base with BB only, and keeps the white when there's no EZ.
- **Fixes from a code audit:** names ending in C (WHT DC → WHTDC, not WHTDDC; 186 DC → 186DC; 107OW not 107OWOW; EZP White/Cream/Off White → EZWHT/EZCRM/EZOFFWHT); export file names say 45LPI only when a base screen is in the seps; eyedropper inks stay with their print; Export right after a change waits for it; "Use the proof's inks" also sets 107OW → On base and DC → discharge.
- **Fits a laptop** (Stephen's screenshot): the art on screen is sized to the room left under the tabs and notes, so it no longer runs off the bottom.
