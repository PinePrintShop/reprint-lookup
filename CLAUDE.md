# Pine apps: how we work

Single-file HTML apps on GitHub Pages (`https://pineprintshop.github.io/reprint-lookup/<file>`), backed by Airtable (base `appJkaLk8DykjsgHR`). Per-app history is in `notes/`.

## Every app update
- **New version file for each change** (`pine-catching-v151.html` → `v152`). Old versions stay untouched; links on the shop floor point at specific versions.
- **Always-latest links:** `price-o-matic.html` and `pine-line-item-review.html` redirect to the current version. Update the one line in them when you ship a new version; the step bar links to them.
- **Fix the bugs AND review the flow and UI.** Every cleanup also looks at how the screen is used:
  - finger and mouse travel
  - what's on screen at each step
  - repeated or wordy text (say it once, plainly)
  - iPad and phone layouts
- Suggest better flows proactively.
- Keep the black and yellow Pine look.
- **Practice mode** (`?practice=1`) on apps that write to Airtable: writes are faked, nothing is saved.
- **Test with mocked Airtable** (Playwright, Chromium preinstalled) before shipping, and screenshot the key screens. Then commit → PR → merge, and give normal `https://` links (live and practice).
- Add a dated entry to the app's file in `notes/` describing what changed and why.

## Airtable
- Talk to Stephen before large Airtable changes (new fields, changed options, bulk edits). Small additive changes are OK once agreed.
- Watch automations before writing test records. Creating an Order Issue sends an email, for example.

## Shop context
- One iPad per press. Catching has 2 iPads.
- The production manager works in the Damage Log.
- Quotes use the vendor **sale** price for garments (cheapest across colors). Vendor price grids are copied from vendor sheets; don't "fix" them without asking.
