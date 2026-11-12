# Laser Prep (sep PSD → laser-ready PSD)

Permanent link: `laser-prep.html`. A desktop app for the art department. No Airtable, so no practice mode. Nothing is uploaded: the PSD is read and written in the browser.

## 2026-11-12 · v1
**Why (Stephen):** the new Saati 8012 laser holds much more detail, and the Xitron RIP images at about 1270 dpi. "Need a way to make sure the sep files are setup so that they will rip cleaner." The workflow stays the same: the sep PSD (spot channels) is placed in the .AI, and Xitron makes the TIFF. Shop limits: dots hold at 6%, lines no thinner than 1pt.

**What was wrong with the samples** (11140 and 11113, 200 LPI seps; one spot channel each, placed at 300 ppi, 20″):
- 300 → 1270 is a 4.23× stretch, so edges come out in uneven 4- and 5-dot steps.
- Anti-aliased edges are grey, so the RIP turns them into small halftone dots: speckled, fuzzy edges. 11140 had about 87,000 grey edge pixels; 11113 had about 3,900 under 6%.

**What it does**
- Drop the sep PSD. It reads every channel with its name and spot colour: Grayscale, Multichannel, CMYK or RGB; 8 or 16-bit; RLE or uncompressed; PSD or PSB.
- **Resolution:** 635 ppi (exactly half of 1270; default) or 1270 ppi (one pixel per laser dot, 4× the size). The physical size is unchanged.
- **Solid channels:** blur at the source (Light 0.6 / Normal 1.0 / Strong 1.4 source px), scale up, cut at 50%. The result is pure black and white. Ink coverage on the samples changed by under 0.01%.
- **Halftone channels:** found automatically (mid-tones away from any solid edge). Resized only (Catmull-Rom); tones are kept for the RIP's dots. Dots under the minimum can be left, dropped to 0% or raised to the minimum.
- You can switch a channel between Solid and Halftone.
- **Checks:**
  - lines and gaps (knocked-out lines) thinner than the set line (1pt);
  - dots under 6%, and tones over 94%, on halftone channels.
  - Each has numbered places to click; the channel picture shows them in red.
  - A "thin" bit must be more than a line-width away from the solid shape it belongs to, so edge staircases and leaf points don't count.
- **Preview:** 0.4″ at 1270 dpi, "As it rips now" and "Laser-ready". The halftone is simulated (round dot, 22.5°, at the chosen LPI). It's an approximation of Xitron, not its exact output.
- **Output:** "<name>-laser635.psd". Same mode, channels, names and spot colours (resources 1006 / 1045 / 1077 / 1007 / 1053), resolution set to 635, no layers, RLE.
- Place it at 100% in the .AI in place of the old one, then rip as usual. Files over 30,000 px a side at 1270 are refused (use 635).

**Tested** (Playwright and Chromium). Test PSDs were made from the two samples' rasters by a separate Python writer; outputs were read back with psd-tools.
- 11140 (Grayscale + spot + a test halftone channel, RLE): checked in about 7 s, written in about 5 s. 12700 × 12664 at 635 ppi = 20.0 × 19.94″. Names and spot colours kept. Spot channel pure 0/255, ink 11.866% → 11.863%. Tone channel kept its tones.
- 11113 (Multichannel, uncompressed): 12689 × 12700, ink 18.506% → 18.499%.
- 1270 ppi: 25400 px, written in 16 s, 33 MB. "Drop to 0%" removed the 3% band.
- Flags found real problems: hatching under 1pt on 11140, slits in the leaves under 1pt on 11113.
- **Not yet tested:** a real Photoshop sep PSD (only the .AI files were available), and a burn on the 8012.
