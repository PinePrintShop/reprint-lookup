# Side panels: one size, one header, one card (standard from 2026-11-10)

Stephen: "just realized all of our left panels are different in each app? can we have an agent scan them all and come up with ideas to streamline how they are sized so moving between apps feels cohesive", then "will the shared style also match with the info on the card? still with the focus per app", then "alright let's start prepping for this!"

## What the scan found (22 current apps, rendered at 1100 / 1440 / 1920)
- **Seven widths for the same kind of list.** At 1440:

  | Width | Apps |
  |---|---|
  | 310 | Purchasing |
  | 317 | Seps / Screens / Ink |
  | 330 | Schedule |
  | 346 | Line Item Review / Create order |
  | 374 | Reprints |
  | 540 | Shipping |
  | 640 | Damage Log, Receiving, Reconnect |

- **Four breakpoints for two panes:** 901 (Reprints), 1100 (job apps), 1200 (office apps), 1400 (kit apps).
- **Gutters:** the page edge is 16 or 24px; the gap between panes is 16 or 20px.
- **Headers:** five list headers and five row styles. Search sits in the filter row everywhere except Schedule (inside its panel).
- **Already the same:** panes start 134–135px from the top in almost every app.

Screens and measurements: the agent's report, 2026-11-10 (scratchpad `leftpanels/`).

## The standard (in `pine-style-v2.css`, opt-in, "SIDE PANES" block)
| | Token | 1100 / 1440 / 1920 | Used by |
|---|---|---|---|
| List pane | `--p-pane-list: clamp(320px,24vw,420px)` | 320 / 346 / 420 | every record list: Seps, Screens, Ink, Damage Log, Receiving, Reconnect, Shipping, Purchasing (orders), Line Item Review, Create order, Reprints, Schedule |
| Tools pane | `--p-pane-tools: clamp(380px,30vw,480px)` | 380 / 432 / 480 | Mockup Maker, Sep Maker, Topo Packing, Price-O-Matic's quote rail (right side) |
| iPad floor rail | `--p-pane-rail: clamp(240px,24vw,360px)` | — | Operator "Up next", Catching "Line items" (both stay on the right; ⇄ moves them) |

- **Two panes from 1100px wide** in every desktop app. Below that the list comes first and a record opens in place. Schedule keeps its drawer.
- **Gutters:** the page edge is `--p-page-x` (16px, 24px from 1400), 16px between panes (`--p-pane-gap`), pane padding 16 / 4 / 32. Each pane scrolls on its own (`overscroll-behavior: contain`). The app sets `--p-panes-top`.
- **Markup:** `.p-panes` (`.is-tools` for a tools pane, `.is-nolist` to hide it) > `.p-pane-side` + `.p-pane-main`.
- **The top of every side pane:**
  - `.p-pane-head`: a `.p-section` label with its `.p-count`, plus an end slot (**Hide list**, sort).
  - An optional `.p-pane-hint` (one line).
  - Search stays in `.p-filters` above both panes.
- **Side:** lists and tools on the left. A right-hand column only for a summary or "next up" (Price-O-Matic's quote, Approve, the iPad rails).
- **Different widths that are justified:** the tools panes, Pine Central's nav rail and the iPad rails. They still use the same gutters, header block and scrolling.

## The card (`.p-lc.is-compact`): same slots, each app's own content
| Slot | Where | Rule |
|---|---|---|
| ID badge | top left | `.p-id`, black and yellow: order # or imprint ID. A thumbnail, if the app has one, goes first as `.p-lc-thumb` (48px). |
| Name | next to the ID | bold 15px: customer or job |
| Sub-line | under the name | grey, one line (a second only if it's really needed). Anything more goes in the main pane. |
| Number(s) | right | the one number this team works from |
| Tags | bottom row | yellow = waiting on you, black = done, cream = a fact, red = a real problem |

What goes in the slots, per app (to confirm with each team as the app adopts it):
| App | Sub-line | Number | Tags |
|---|---|---|---|
| Damage Log | garment · what's damaged | pcs short | Waiting on vendor, Reprint |
| Receiving | vendor / warehouse | boxes or pcs in/expected | Partial, Arrived |
| Seps / Screens / Ink | location · inks (thumbnail kept) | screens | Print date, Burned, Inks ready |
| Purchasing (orders) | due · rep | lines to order | In cart, Prints Fri |
| Line Item Review / Create order | order status | lines | Needs lines, Proof sent |
| Reprints | job name · location (thumbnail kept) | — | Embroidery, print date |
| Schedule (unscheduled) | location · qty | job length | Hard Deadline, Garments in |
| Shipping | ship method · city | boxes | Label made, Picked up |
| Reconnect | last order · rep | lifetime $ or orders | Due to reach out |

## Rollout (each app on its next version; the shared CSS above is already in)
1. ~~Tokens, pane classes and compact card in `pine-style-v2.css`, plus a demo on `pine-style.html`~~ (done 2026-11-10; additive, so no app changed).
2. ~~Line Item Review, Create order, Reprints~~ (done 2026-11-10: Line Item Review v56, Create order v30, Reprints v10; identical requests old vs new).
3. Seps, Screens, Ink: high use, small change (+3 to +80px).
4. Damage Log and Receiving: the biggest visible change (640 → 346, compact card). **Decided (Stephen, 2026-11-10): the standard 346**, "since it is when they open that is the most important".
5. Shipping, Reconnect (stat tiles move out of the list's way), Purchasing (Ordering columns on the tokens).
6. Schedule (search moves to the filter row), Mockup Maker, Sep Maker, Price-O-Matic, Topo Packing (mostly matching already).
7. Operator and Catching: header block and rail width only.

## 2026-11-10: plan for the next batches (Stephen)
- **Purchasing:** now (v119), while purchasing is off for the day: "Let's do purchasing now since he is done for the day".
- **2026-11-11:**
  1. Seps, Screens and Ink in the morning.
  2. Damage Log and Receiving at midday, at 346.
  3. Shipping and Reconnect in the afternoon.
- **Later:** Schedule, Mockup Maker, Sep Maker, Price-O-Matic and Topo Packing. Then Operator and Catching after a shift.
- **Every batch:** old vs new must make identical requests on the same scripted run, plus screenshots at 1100 / 1440 / 1920 / 390.
