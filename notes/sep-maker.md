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
- It can't open PSD yet (AI and PDF open since v12). Export a PNG from Photoshop first.
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
