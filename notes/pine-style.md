# Pine style (shared look for every app)

## 2026-10-14 · v2, from the Pine Brand Standards
**Why:** the app audit (https://claude.ai/artifact/XmKpze8p95vdCFp9o9jpyN, 14 apps, 116 screens) found two foundations: 6 apps load `pine-design-v1.css` and 8 copy their own colors. On top of that:
- at least five main-button styles
- three tag shapes
- a different top bar, version label and practice marker in every app
- 8–10px labels on the iPads and the wall TV
- green, amber and red meaning different things in different apps

The plan is to combine the apps early next year, so they need one look first.

**Decisions (Stephen, Oct 14):**
- **Colors:** only black, white, cream `#EFE2CD` and Pantone 107 yellow `#FBE122` (replacing the old `#E8E832`).
  - Meaning comes from fill and shape: yellow = needs you or the main action, black = done, cream = plain facts.
  - Red `#C62828` is a functional exception, used only for real problems (errors, lost money, data that didn't save). It is not a brand color.
- **Type:** Poppins Black (Google Fonts) for screen titles and the one big number on a screen. Helvetica for everything else. No Courier: numbers use tabular digits.
- **Logo:** the Pine script from the brand PDF, as `assets/pine-script.svg`. It is also inlined in the CSS as `.p-logo` (a mask, so it takes the text color). White on the black top bar.

**Files:**
- `pine-style-v2.css`: tokens (`--p-…`) and components (`p-…`). The prefix lets it sit beside an app's old styles while that app moves over.
  - top bar `.p-bar`
  - section header `.p-section` (the brand's black "secondary headline" box)
  - buttons: `.p-btn-main` (yellow, one per screen), `-dark`, plain, `-quiet`, `-danger`, plus `-lg` 56px for the floor
  - tags: `.p-tag` with `-soft` / `-wait` / `-done` / `-alert`
  - ID badge `.p-id`
  - tabs `.p-tab`
  - rows `.p-row` and lists `.p-list`
  - form fields `.p-input`
  - notes `.p-note`
  - pop-up `.p-modal`
  - toast `.p-toast`
  - stat tile `.p-stat`
  - wall-TV scale `.p-tv`
- `pine-style.html`: the reference page, with every piece live and Catching re-drawn in the new style.

**Rules:**
1. One yellow main button per screen.
2. Four colors only; red only for a real problem.
3. The same black top bar everywhere: Pine logo, app name, version, practice pill, then the app's own controls.
4. Poppins Black only for titles and one big number; no Courier.
5. Nothing under 12px. Touch targets at least 44px, and 56px on the floor iPads.
6. IDs always use the black-and-yellow badge.
7. Pop-ups and toasts look and behave the same in every app.

**Rollout:** each app adopts the style in its next version (rule in CLAUDE.md), the same way as the self-update. The checklist is on `pine-style.html`.

**Bugs found by the audit, still to fix:**
- Pine Central's menu links point at deleted versions (Seps is a 404). They should use the permanent links.
- Production Board dark mode is unreadable.
- Seps and Screens call today "Tomorrow".
- Price-O-Matic's product tabs are clipped at desktop and iPad widths.
- Purchasing on the iPad has a cramped warehouse column and clipped header buttons.
- Line Item Review on a phone shows the approval steps twice.
- Board Arrange mode cuts IDs short at 1440px.
- Seps shows grey "?" ink swatches.
- Day Fill's sticky header band is offset.
- Screens wraps the ID onto two lines on the iPad.

## 2026-10-14 · Whitney's (Art Director) tweaks
- **Logo:** the Pine logo sits in a **black square**, as on Pine design proposals and mood boards. New `.p-mark` component in three sizes (`-sm` 40, default 64, `-lg` 120). On the black top bar the square is the bar's left end.
- **Headlines in capitals:** `.p-h1`, `.p-display` and the top bar's app name are uppercase. Mixed case in Poppins Black was hard to read.
- **Spacing:**
  - Poppins Black is no longer squeezed: tracking went from −.01/−.02em to +.005em, with slightly wider word spaces (.08em).
  - Small section labels went from .07em tracking to .03em, with word spacing at .14em, so "ON A REAL SCREEN" and "MOVING THE APPS OVER" read evenly.
- **Section label width:** section labels hug their text instead of stretching across the page.

## 2026-10-14 · More color: two directions (`pine-colors.html`)
**Why:** Whitney asked to try more of the brand colors. The page mocks two directions from the Brand Standards palettes on Schedule (desktop), Catching (iPad) and the Pine Central home. Customers on it are made up, since it's a public page.

| | A · Creativity is our currency | B · Consume design |
|---|---|---|
| Press 1 (Next) | 7683 `#426DA9` | 7473 `#1E988A` |
| Press 2 (You) | 637 `#4EC3E0` | 7563 `#D69A2D` |
| Embroidery | 151 `#FF8200` | 7579 `#DC582A` |
| Heat press | 540 `#003057` | Red 032 `#EF3340` |

- **Same in both:** each press and department has one color in every app. 107 yellow stays "main button / waiting on you", and the black bar stays.
- **Stephen (Oct 14): A for the presses** at first, then **B for everything** the same day ("the more muted colorways"). Schedule v6 uses B: Press 1 7473, Press 2 7563, Embroidery 7579, Heat Red 032, on cream `#EFE2CD`. Warnings are black "!" marks because red means heat press.
- Canvas version (editable, private): https://claude.ai/artifact/KPpUGp25pmtjEQrdTX7YuR

- **Oct 14, Schedule v11:** Flatstock = 7683 denim `#426DA9` (white text). Finishing = dusty plum `#8E6C8A` (not a brand Pantone; picked to match B's muted style).

## 2026-10-15 · Page kit: the apps should feel the same, not just look the same
**Why:** a side-by-side of the seven updated apps at iPad size ("Pine App Feel Check", private artifact) showed one look but seven ways to do the same thing. Refresh sat in four places, filters came in four shapes, there were three list-card layouts, and yellow was used for facts. Stephen said go on the six rules (Oct 15).

**Added to `pine-style-v2.css`** (additive; nothing existing changed):
1. **Bar order:** logo, app name, version, practice pill, the app's own views (`.p-bar-views`), then on the right `.p-barbtn` Refresh (icon + word) and ⚙. Token and practice live inside ⚙.
2. **One filter row** `.p-filters` under the bar: search (`.p-search`), sort and range on the right (`.p-filters-end`), and chips `.p-chips` on one line that scrolls sideways.
3. **Page head** `.p-head`: title box, one-line summary, controls on the right.
4. **List card** `.p-lc`: ID, name and one sub-line, numbers (`.p-num`) on the right, one action, tags on row 2. It opens in place (`.is-open` + `.p-lc-body`), one at a time. It stacks on a phone.
5. **Yellow is your next move:** one `.p-btn-main` per screen; card actions use `.p-btn-dark` or `.p-btn`; yellow tags only for "needs you".
6. **Central wears the same bar.**

The demo is in `pine-style.html` under "Page kit". The rules list and the app status table are updated.

**First apps:** Central, Purchasing and the Damage Log.
**Operator next version:** the ink-type tag goes cream (a fact, not "needs you").
- **Kit fixes from the first apps (same day):**
  - `hidden` now beats the inline-flex kit pieces.
  - Bar views are 44px tall; under 900px they move to their own scrolling row.
  - The version tag hides under 420px.
  - New pieces: `.p-chips-inline` (few chips share the search line), `.p-lc-check` checkbox slot so IDs line up, `.p-lc.is-sel` selected card, `.p-menu` for the ⚙ drop-down (token, practice).
- **Two-pane desktop layout `.p-split`** (from Damage Log v21): at 1400px and wider, the list is on the left and the picked record fills the right, each with its own scroll. Below that, cards open in place. Desktop apps use the full width. Stephen saw v20 capped at 1100px on a wide screen: "is there a reason this doesn't take up more of the screen".

## 2026-10-15 · Job workspace: `pine-job-v1.css` (Seps v41, Screens v28, Ink Queue v101)
**Why:** the review of the three pre-press apps found the same imprint drawn three ways: list cards, ID badge, day heads, job header, Previous run, ink rows and notes. Stephen OK'd phase 0 + 1.
**Load order:** `pine-style-v2.css`, then `pine-job-v1.css`, then the app's `<style>`. `<body class="p-app p-job">`. Each piece is prefixed `p-job-`.
1. **Bar:** 72px in every app.
2. **Filter row:** search ("Imprint ID, order #, customer, design") · chips · on the right the app's own button, then Hide list (`.p-job-listbtn`).
3. **Day head:** `section.p-job-dayg > .p-job-day` holds ▾ `.p-job-fold` · `.p-job-date` (black box) · one `.p-tag.p-job-when` (red "2 days late", "Today", "Tomorrow", "in 3 work days"; "work" hides below 1600px) · the count `.p-job-n`. `.is-closed` folds the day.
4. **Order line:** `.p-job-order` = `.p-job-cust` (CUSTOMER, cut with …) · `.p-job-ordno` (#order).
5. **List card** `.p-lc-head.p-job-card`, ~96px:
   - an 80×64 `.p-job-thumb`
   - `.p-job-ctitle`: a small ID + title, 2 lines at most
   - `.p-job-csub`: location · type
   - `.p-job-cnums`: 4 screens · 144 qty, with the app's one action `.p-job-cact` beside it
   - `.p-job-cfoot`: one status tag + facts
   - no inks on cards
6. **Job header** `.p-lc-head.p-job-head`:
   - `.p-job-hid` ID badge (16px, the same everywhere) + `.p-job-hname` + tags
   - `.p-job-hsub`: customer #order · location · type · press · print date
   - `.p-job-hnums`: Screens · Qty (Ink adds Inks)
   - `.p-job-hact`: the one yellow "✓ verb" button (44px)
7. **Mockup:** `.p-job-mock` (white frame) with `.p-job-mockimg`. The `.p-job-mockf` footer appears only when needed: ‹ 1/N › · file name · ↩ Previous run (+ Fill from) · Full screen.
8. **Inks:** `.p-job-inksh` = a black `.p-section` "INKS (n)" + the app's toolbar on one line. `.p-job-inklist` holds `.p-job-ink` rows, 38px:
   - `.p-job-ink-drag` · `.p-job-ink-n` (burn #) · `.p-job-ink-sw` (28px swatch)
   - `.p-job-ink-main` (name + type tag) · `.p-job-ink-x` (app extras)
   - `.p-job-ink-sub` (Ink's recipe line)
   - `.ink-2col` on an ancestor (set by each app's fitInks) makes two columns, 1–5 down the left and 6–10 down the right
9. **Notes:** `.p-job-notes` with the labels above; the box grows with its text.

**Shared Pantone table:** `pine-pantone-v1.js` holds the 1,404-line table that was byte-identical in all three apps, as one global, `PANTONE_HEX`. Each app keeps its own lookup function for now.

**Shared files are versioned by name** and never changed after shipping. A change means `pine-job-v2.css` / `pine-pantone-v2.js`, so older app versions keep the file they were built with.

**Next (phase 2, not built):** one shared script for two panes, Hide list, ↑/↓, day heads, drag, notes, proof viewer and the ⚙ menu. Later: Seps and Screens save swatch colors (an Airtable write, needs Stephen's OK), and a calendar in Ink.


## 2026-10-16 · `pine-job-v2.css` (Seps v42, Screens v29, Ink Queue v102)
**Why:** Stephen, comparing Ink v101 and Screens v28 at ~2000px: "very subtle but you can see the ink and screen / sep box around the mockup is ever so slightly different if you scan back and forth....also it is ok to get this granular right? just trying to make this the best it can be and really visually flow". The open job used the shared pieces, but each app still had its own pane rules: Ink split the job 55 : 45 with a 16px gap and 12/16/16 padding and had an extra line under the header; Seps and Screens split 3 : 2 with a 12px gap; the mockup footer was there only sometimes; the controls column had 6, 8 or 10px between rows.
**v2 = v1 + one geometry for the open job in the right pane.** Flipping between the three apps, the frame, the mockup and the controls sit on the same pixels at 1100–2000px; only the content differs. v1 stays as shipped for Seps v41, Screens v28 and Ink v101.
1. **New, section 10, the open job (two panes):** markup `.p-lc-body.p-job-body > .p-job-grid > ( .p-job-mock · .p-job-ctl )`.
   - the same pane padding, card and header; no extra line under the header (the body's top line is the one line)
   - body padding 12px; 8px on short laptops (768–860px tall; this was Ink only)
   - **mockup : controls = 58 : 42**, the controls at least 400px, 12px between them. Seps and Screens were 3 : 2, Ink 55 : 45. 58 : 42 keeps the mockup the bigger part, and gives Ink's recipe lines and Seps' Type / Sep file / Separator rows 430px at 1440 (Seps and Screens lose 14px of mockup there, Ink gains 54px).
   - **two columns of inks** (`.ink-2col`): 45 : 55, the controls at least 480px (Seps and Screens were 3 : 2, Ink 40 : 60)
   - the controls column `.p-job-ctl`: 8px between rows, no inset, only it scrolls
   - one-line rows `.p-job-line` (label `.p-job-lbl` 96px on the left, `.p-label` look, 40px tall): Seps Type / Sep file / Separator, Screens Sep file
   - an app's inks block `.p-job-inksec`: 8px apart, the same as the column
   - notes: labels 12px, 3px above a 40px box with 15px text; the box grows to ~8 lines in all three
2. **Header:** its first line stays one line (the name, then the tags, shorten with …), so 3 tags no longer push the mockup down at 1100px.
3. **Mockup footer is always there** (52px): ‹ 1/N › (2+ proofs) · file name · ↩ Previous run (a reorder) + Fill from · Full screen. Under 460px wide the buttons drop their words (`.p-job-w`), so it stays one line. The image sits top-left (Ink centered it).
4. **Inks header row** is 40px like the one-line rows.

## 2026-10-16 · Office apps: `pine-office-v1.css` (Price-O-Matic v106, Create order v18, Line Item Review v19)
**Why:** the review of the three apps on the order path (Quote › Order › Review) found three top bars, three ways to draw an order, a line item, an imprint and a price, yellow meaning "add within a step" in one app and "the main action" in another, Courier numbers, green ticks and 77 / 14 / 15 CSS rules under 12px. Stephen (Oct 16): *"Three apps sharing one look (pine-office-v1.css)."*
**Load order:** Poppins 800/900, `pine-style-v2.css`, then `pine-office-v1.css`, then the app's `<style>`. `<body class="p-app p-off">`. Each piece is prefixed `p-off-`.
1. **Bar** `.p-bar.p-off-bar` (64px): logo · app name · version (`'v'+PineUpdate.ver`) · practice pill · the step nav `.p-off-steps` **Quote › Order #11031 › Review** (the current step is the yellow pill, the order number rides along) · the app's own bits (Line Item Review: who are you `.p-off-me`) · Refresh (`PineUpdate.check()`) · ⚙ `.p-menu` (token, practice). Under 1100px the steps get their own row.
2. **Filter row:** the kit's `.p-filters`, kept on one line when it fits (search · chips · end).
3. **Two panes** `.p-off-split > .p-off-pane.p-off-list + .p-off-pane` from 1200px; each scrolls on its own. The app sets `--p-off-top`; `.is-nolist` hides the list. Below 1200px it's one pane.
4. **Order header** `.p-off-oh`: `#` badge (the pine-job header badge, 16px) · CUSTOMER · tags / rep · Hard/ASAP due · links `.p-off-link` (Deal ↗ · Art folder ↗ · Airtable ↗) | numbers (lines · pcs · total) | `.p-off-oh-act`: **the one yellow button, always top-right** (Create order / Send for signature).
5. **Line item** `.p-off-li`: garment · color, size breakdown, imprint ID badges, one status tag, pcs · $/pc · line total, actions. `.is-compact` for lists (title wraps to 2 lines, no numbers).
6. **Imprint row** `.p-off-imp`: ID badge · location · type · screens / nickname · inks · actions · notes.
7. **Price block** `.p-off-price`: label · **$/pc as the one Poppins number** · line total · comparison numbers (Autoprice, margins) · actions.
8. **Checklist** `.p-off-chk`: done = black ✓, open = empty ring.
9. **Step buttons** `.p-off-stepbar > .p-off-step`: done = black ✓, only the next one yellow (Stephen: *"finished steps black (✓), only the next step to do is yellow"*).
10. **Order row** `.p-off-orow`: # badge · CUSTOMER / created · rep · tag.
**Rules used:** one yellow button per screen (Add to quote / Create order / the next approval step or Send); box saves are black; picked buttons black with yellow text; facts cream; done black; red only for real problems.
**Versioned by name:** never edit after shipping; a change is `pine-office-v2.css`.
**Next (not built):** one shared script for the bar (steps, Refresh, ⚙) — it's a small copy in each app for now; the Quotes table so a quote carries into Create order (Stephen's answer 3, a later step).
