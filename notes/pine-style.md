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
