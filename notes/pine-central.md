# Pine Central (home launcher)

## 2026-10-14 · v171: links fixed, new Pine style, missing apps added
- **Links:** the menu pointed at old versions, five of which no longer exist (Seps v8 gave a 404; also Operator v24, Catching v97, Screens v10, Receiving v11, Purchasing v68).
  - Every app now opens through its always-latest link: `pine-operator.html`, `pine-catching.html`, `seps.html`, `screens.html`, `receiving.html`, `pine-ink-queue.html`, `pine-purchasing.html`.
  - KPIs and Reprints have no permanent link, so they stay on `pine-kpi-v22.html` and `reprint-lookup-v3.html`.
  - The machine bar (ROQ Next, …) still passes `#machine=` through `pine-operator.html`.
- **Apps added** as a new **Sales & office** group, in the sidebar and as a row of black tiles on the home screen. Each opens inside Pine Central like the others:
  - Create order
  - Line Item Review
  - Price-O-Matic
  - Damage Log
  - Production Board
  - Day Fill
- **Pine style v2** (brand standards, Stephen + Whitney 10/14):
  - **Colors:** cream background, Pantone 107 yellow for the machine bar and labels, and black instead of green for the tagline and running dots.
  - **Type:** Poppins Black in capitals for the greeting, clock and section headers, which are black boxes as in the brand guide. Helvetica for everything else.
  - **Size:** text is no smaller than 12px, up from 8–10px in the ticker, labels and View as.
  - **Fit:** icons now scale to the screen height as well as its width, so everything fits on desktop. On the iPad the page scrolls a little.
- **Self-update + version:** `pine-update.js` is added, and "Pine Central v171" shows at the bottom of the sidebar.
- **Tested** with mocked Airtable at 1440 and on the iPad:
  - Every menu entry loads its current version (Seps v34, Screens v21, Operator v126, Catching v158, Receiving v72, Purchasing v105, Ink Queue v94, Damage Log v17, Line Item Review v18, Create order v17, Price-O-Matic v105, Production Board v41, Day Fill v15, KPIs v22, Reprints v3).
  - No 404s and no errors.
