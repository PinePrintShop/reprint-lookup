# Pricing & cost formula review

## 2026-10-08

**Question (Stephen):** Are the Airtable/POM pricing and margin formulas based on real numbers, or are they placeholders? Started from a 50-piece bandana order (10978) showing −$0.28/pc margin on flat $8.50 pricing.

**Data used:**
- **Press history:** 2,569 imprints with Run Finished in the last 12 months, using actual setup and run durations and impressions.
- **Revenue:** 4,178 line items on orders completed in the last ~13 months (Line Total, Total Line Cost).
- **POM rates:** the `RATES` block in `price-o-matic-v101.html`.

### Three models of a "press hour"

| Where | What | $/press-hour | Basis |
|---|---|---|---|
| POM `computedOverhead()` | **selling** rate for screenprint | **$579.29** | $133,000/mo ÷ 180 h × 1.12 profit × 1.4 utilization ÷ 2 presses |
| Airtable Imprints · Price per Impression ("Textile SP") | **selling** rate | **$579.29** | copied from POM ✓ |
| Airtable Imprints · [PRICE] Labor Estimate + Overhead Estimate | **cost** used for margins | **$382.70 + $41.26 = $423.96** | Back-solves to about **$98.4k + $10.6k ≈ $109k/mo** with the same 180 h / 1.4 / 2 math. That's an older cost basis than the POM's $133k. |

The selling side is consistent between the POM and Airtable. The cost side of the margin formulas comes from an older monthly figure.

### Time assumptions vs. what the presses actually did (12 months)

| | Pricing formula assumes | Scheduling formula (Estimated Run Time) assumes | **Actual median** |
|---|---|---|---|
| Tees / textile SP | 230/hr (fleece 170) | Press 1: 250, Press 2: 225 | **Press 1: 247/hr, Press 2: 223/hr** |
| Bandanas | **100/hr** | Press 1: 150, Press 2: 135 | **Press 1: 227/hr, Press 2: 197/hr** |
| Setup per screen | 12 min (setup + takedown) | 10 min | **7–9 min** setup (takedown not tracked) |
| Embroidery (6-head) | 30,000 ÷ stitch count | stitch-based | 25 pcs/hr median |

- Tee assumptions match reality.
- **Bandanas are priced for cost at half their real speed.** That doubles the labor and overhead charged to every bandana line. It's the whole reason 10978 shows a loss: at the real speed, 10978-A would carry about $3.82/pc of labor instead of $5.73, and the margin would be about +$1.84/pc.
- Pricing and scheduling use two different time models; the scheduling one is closer to reality.

### What each press hour actually earns (line revenue − garment cost, single-imprint lines)

| | <75 pcs | 75–149 | 150–299 | 300+ |
|---|---|---|---|---|
| Bandana | $786/hr | $782/hr | $841/hr | $839/hr |
| Textile SP | $737/hr | $906/hr | $981/hr | $1,096/hr |
| Embroidery (machine hr) | $212/hr | $151/hr | | |

- **Small bandana orders earn per press hour about what small tee orders do.** They aren't money-losers; the "losing money" flag comes from the 100/hr assumption.
- Both screenprint types clear the POM's $579/hr selling rate at every size.
- Embroidery earns far less per machine hour. Whether that's a problem depends on how much labor and overhead an embroidery hour really costs. The formula charges $27.50 + $12.66/hr.

### Whole-shop check

- Revenue on completed orders is about **$300k/month** (Sept 2026: $493k), and garment cost about $115k/month. That leaves **about $190–230k/month** after garments, against the POM's **$133k/month** cost basis, before shipping and card fees.
- Tracked press time is **150–210 h/month** for Press 1 + Press 2 combined, plus 30–60 h of embroidery. The POM assumes 180 h × 2 presses × 60% = 216 h. So the utilization assumption is close, maybe slightly high.

### Formula problems found (Airtable unless noted)

1. **Bandana impressions/hour = 100** in [PRICE] Impressions / Hour. Actual is about 200–225. *Biggest error; makes bandana margins read negative.*
2. **Cost rates are stale:** Labor $382.70/hr + Overhead $41.26/hr ≈ a $109k/mo basis, while the POM uses $133k. Also, the "labor" rate is really the whole facility, equipment and payroll cost, not just labor.
3. **Margins break once orders finish.** Margin and labor formulas divide by *Total Active Impressions*, which drops to 0 when an order completes. Every historical line then shows Labor = Infinity and Margin = NaN, so realized margins can't be read from Airtable. *Total All-time Impressions* already exists and should be used instead.
4. **Materials reference a stale price field.** [PRICE] Consumables & Materials = 1.65% of *Price per Impression (legacy 11/25)*. Imprints › Estimated Impression Margin also uses the legacy price.
5. **3% Payment Processing Allowance overcharges bandanas.** It's calculated on garment + markup + impression price. For bandanas the flat price already includes the blank, so the 3% is taken on the blank twice: about 7¢/pc on 10978.
6. **Two time models:**
   - pricing: 12 min/screen, 230/170/100/130/60 per hour
   - scheduling: 10 min/screen, 250/225/150/135 per hour
   
   They should share one table, set from the actuals above.
7. **POM utilization math:** `((1−u)·h + h)/presses` multiplies by 1.4 for 60% utilization. Dividing by the hours actually used would be 1/0.6 = 1.67. This is the rate everything is priced from, so changing it needs a decision, not a quick fix.

### Suggested cleanup, in order (needs Stephen's OK; these are Airtable formula changes)

1. Bandana impressions/hour 100 → **200** (or per press: Press 1 225, Press 2 195). This fixes the false losses right away.
2. Switch the margin, labor and overhead formulas from *Total Active* to *Total All-time Impressions*, so finished orders keep a real margin. That would let us track realized margin per month.
3. Re-derive the labor and overhead rates from the current monthly cost ($133k, or whatever's current) using the same math as the POM. Better still, keep the rates in one place that both the POM and Airtable read.
4. Point Materials at the current Price per Impression; fix the 3% fee for bandanas.
5. One time table (setup min/screen, impressions/hr by press and product) used by both pricing and scheduling.

The selling prices themselves (POM grid → Airtable) don't need changing for any of this. Only the cost and margin side is off.


## 2026-10-08 · Changes applied (Stephen: "$133K for the rest of this year … if it doesn't change the auto price but just the margin math, move forward")

**Autoprice untouched.** Autoprice, the impression price, the press-time field and impressions/hour were all left alone. Before/after snapshot of 4,799 line items from the last 400 days: Autoprice, the Impression Price Rollup and the legacy Autoprice **changed on 0 lines**.

**What changed (margin math only):**

| Field | Before | After |
|---|---|---|
| Imprints · [PRICE] Labor Estimate | $382.70/press-hr; bandanas 100/hr; ÷ *Total Active Impressions* | **$466.88/press-hr**; bandanas **200/hr**; ÷ *Total All-time Impressions*; blank if 0 |
| Imprints · [PRICE] Overhead Estimate | $41.26/press-hr, same time and count issues | **$50.34/press-hr**, same fixes |
| Imprints · [PRICE] Consumables & Materials | 1.65% of the *legacy 11/25* price | 1.65% of the **current** Price per Impression (falls back to $579.29/hr math on finished orders) |
| Imprints · [PRICE] Estimated Impression Margin | legacy price − costs | **current** price − costs |
| Line Items · [PRICE] Payment Processing Allowance | gross-up of garment + impression price (blank counted twice on bandanas) | **3% × Price Input** |
| Line Items · [PRICE] Estimated Margin / Piece | same math | same math, **blank when there's no Price Input** |
| Line Items · [PRICE] Estimated Margin (%) | ÷ *legacy 11/25 Autoprice* | **÷ Price Input** |

- **Cost per press-hour:** $133,000 ÷ 180 h × 1.4 (utilization) ÷ 2 presses = **$517.22**. That's the same math as the POM without its 12% profit, split labor $466.88 + overhead $50.34 in the old 90/10 ratio. Embroidery ($27.50 + $12.66/hr) and Supacolor ($22.50 + $3.33/hr) are unchanged.
- **Cost time:** 12 min/screen. Bandanas run at 200/hr for cost; everything else uses the pricing speed (tees 230, fleece 170; 230 when an order is finished).
- **Supacolor 1C:** the formulas spelled these "Supacolor - Wearable 1C", but the real options are "Supacolor - 1C Wearable". 1C Supacolor was being costed at the screenprint rate. Both spellings now match.
- Every changed field has a description in Airtable explaining the change.

**Effect:**
- Margins now compute on all 4,799 lines; **3,882 were NaN/blank before** (finished orders).
- Bandana median margin: **−4.4% → +14%**. Order 10978 is now +$1.07/pc (12.6%).
- Tees: margin per piece is lower, because the hourly cost rose from $424 to $517.
- **What "margin" means now:** profit after garment, press time and a full share of the $133k. By design that lands near the POM's 12% profit goal, so about 10% is normal.
- **Reconciliation:** summed by month, Oct 2025 – Sep 2026, model margin is **5–16% of revenue ($15–60k/mo)**. The real leftover (revenue − garments − $133k) was **$28–178k/mo**. So the model is conservative, mostly because it prices 12 min/screen and full run time where the presses actually take less.
- **Data quirk:** line recT077e7qtYBB54Z (order 9212, Promo Product, 2,625 pcs) is linked to bandana imprint 9212-C, whose impression count only includes 4 pieces. Its "margin" is −$324k. Unlink it or ignore it.

**Line Item Review v4:** the thin-margin warning moved from <15% to **<5%**, and there's a one-line note on what margin means.

**Not changed (ask first):**
- **Calibrating cost time to actuals** (8 min/screen, Press 1 247/hr, Press 2 223/hr) would make margins less conservative.
- **Decopress, finishing and flatstock** still get the screenprint press rate.
- **The POM's 1.4 utilization factor** (vs 1/0.6 = 1.67) is unchanged, because it drives prices.

**Rollback:** previous formulas, for reference:

<details><summary>Line Items · [PRICE] Payment Processing Allowance (fldjTKtpDmrnNml2c)</summary>

```
({fldVtBTv42HG6WYs1}
+{fldlWcO6Hl5QnoIXf}
+{fldWnDcFeL1zE94Um}
+{fld0IVAS1IxcPoqc6}
+{fldbs9svKV48Xx3yq}
+{fld9nZF2L6vnqATrV}
+{fldCKWHYFtF4lK3o0})
/.97-
({fldVtBTv42HG6WYs1}
+{fldlWcO6Hl5QnoIXf}
+{fldWnDcFeL1zE94Um}
+{fld0IVAS1IxcPoqc6}
+{fldbs9svKV48Xx3yq}
+{fld9nZF2L6vnqATrV}
+{fldCKWHYFtF4lK3o0})

```
</details>

<details><summary>Line Items · [PRICE] Estimated Margin (%) (fldHnS5fBKoWbZx5f)</summary>

```
{fldU1y8VEpcg25vtr}/{fldjqIHjJO6Qa1nkX}
```
</details>

<details><summary>Imprints · [PRICE] Labor Estimate (fldSGssVzEkzjU4sI)</summary>

```
IF(
    OR({fldjNCuaGOkWgzH2K}="Embroidery",
        {fldjNCuaGOkWgzH2K}="Patch Application",
        {fldjNCuaGOkWgzH2K}="Hem Label Application",
        {fldjNCuaGOkWgzH2K}="Woven Label Application"),
            ({fldZR9k8zWPbgV1vm}*27.50)/{fldFipR4ddfqMPeAX},
IF(
    OR({fldjNCuaGOkWgzH2K}="Supacolor - Wearable",
        {fldjNCuaGOkWgzH2K}="Supacolor - Wearable 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Blocker",
        {fldjNCuaGOkWgzH2K}="Supacolor - Blocker 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Promotional",
        {fldjNCuaGOkWgzH2K}="Supacolor - Promotional 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Headwear",
        {fldjNCuaGOkWgzH2K}="Supacolor - Headwear 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Reflective"),
            ({fldZR9k8zWPbgV1vm}*22.50)/{fldFipR4ddfqMPeAX},

    (
    (({fld8rgkIj1RPO97QU}*.75*25.00)+
    {fldZR9k8zWPbgV1vm}*382.70))/{fldFipR4ddfqMPeAX}))
```
</details>

<details><summary>Imprints · [PRICE] Overhead Estimate (fldNRHdvfPRtGbkTV)</summary>

```
IF(
    OR({fldjNCuaGOkWgzH2K}="Embroidery",
        {fldjNCuaGOkWgzH2K}="Patch Application",
        {fldjNCuaGOkWgzH2K}="Hem Label Application",
        {fldjNCuaGOkWgzH2K}="Woven Label Application"),
            ({fldZR9k8zWPbgV1vm}*12.66)/{fldFipR4ddfqMPeAX},
IF(
    OR({fldjNCuaGOkWgzH2K}="Supacolor - Wearable",
        {fldjNCuaGOkWgzH2K}="Supacolor - Wearable 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Blocker",
        {fldjNCuaGOkWgzH2K}="Supacolor - Blocker 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Promotional",
        {fldjNCuaGOkWgzH2K}="Supacolor - Promotional 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Headwear",
        {fldjNCuaGOkWgzH2K}="Supacolor - Headwear 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Reflective",
        {fldjNCuaGOkWgzH2K}="Supacolor - Size Tags"),
            ({fldZR9k8zWPbgV1vm}*3.33)/{fldFipR4ddfqMPeAX},

    (
    
    {fldZR9k8zWPbgV1vm}*41.26)/{fldFipR4ddfqMPeAX}))
```
</details>

<details><summary>Imprints · [PRICE] Consumables & Materials (fldsr9vb8vaLMjhGM)</summary>

```
  IF(
    OR({fldjNCuaGOkWgzH2K}="Supacolor - Wearable",
        {fldjNCuaGOkWgzH2K}="Supacolor - Wearable 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Blocker",
        {fldjNCuaGOkWgzH2K}="Supacolor - Blocker 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Promotional",
        {fldjNCuaGOkWgzH2K}="Supacolor - Promotional 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Headwear",
        {fldjNCuaGOkWgzH2K}="Supacolor - Headwear 1C",
        {fldjNCuaGOkWgzH2K}="Supacolor - Reflective",
        {fldjNCuaGOkWgzH2K}="Supacolor - Size Tags"),
    {fldfybDdp66T1bGbR},
.0165*{fldJ1NVA0R4ZpMqXw})
```
</details>

<details><summary>Imprints · [PRICE] Estimated Impression Margin (fldYW0ByQo63banqz)</summary>

```
{fldJ1NVA0R4ZpMqXw}
-{fldSGssVzEkzjU4sI}
-{fldNRHdvfPRtGbkTV}
-{fldsr9vb8vaLMjhGM}
```
</details>

<details><summary>Line Items · [PRICE] Estimated Margin / Piece (fldU1y8VEpcg25vtr)</summary>

```
{fldtMZWzA4dfPxEXx}
-{fldVtBTv42HG6WYs1}
-{fld2NLpfI9x7E7eMq}
-{fldjTKtpDmrnNml2c}
-{fldgGJXMzYpSnr2Cw}
-{fldyuDjdP9KQx9Dui}
-{fld0IVAS1IxcPoqc6}
-{fldbs9svKV48Xx3yq}
```
</details>

## 2026-10-08 · Bandana shipping + 225/hr (order 10981)

**Why:** 10981 (Sight Line Provisions, 2,000 bandanas at $4.70, Free Shipping) showed −$0.16/pc. Two tee-sized assumptions caused it:
- **Shipping Allowance was a flat $0.65/pc.** On 2,000 bandanas that assumed about $1,300 of postage.
- **Bandana cost speed was 200/hr.**

**ShipStation history** (Orders › Shipping Cost):
- 1,809 bandana-only orders, 1,696 of them Free Shipping.

| Bandanas on the order | Real shipping / pc |
|---|---|
| under 100 | $0.29 |
| 100–199 | $0.20 |
| 200–499 | $0.16 |
| 500–999 | $0.12 |
| 1,000+ | $0.10 |

- Across all of them it averages about **$12 per order + $0.09 per piece** (linear fit on the 1,696 Free Shipping orders). That's about $0.14/pc overall, not $0.65.

**Changes (margin only; Autoprice unchanged):**

| Field | Before | After |
|---|---|---|
| Line Items · [PRICE] Shipping Allowance (`fld0IVAS1IxcPoqc6`) | $0.65/pc for everything | Bandana lines: **$0.09 + $12 ÷ line qty**. Everything else unchanged |
| Imprints · Labor Estimate, Overhead Estimate, Consumables & Materials | bandana speed 200/hr | **225/hr** |

- Pick-Up, Delivery and Fulfillment still get $0.
- The bandana test is the same one Autoprice uses (`{Print Location Rollup}="Bandana"`). Autoprice for bandanas reads only the flat grid, so no price moves.
- The $12 is per line. An order with several bandana colours counts it more than once, which leans conservative.
- Rollback: put `.65` back in place of the bandana branch, and `"Bandana",225` back to `"Bandana",200` in the three Imprint formulas.

**Result on 10981:**
- shipping $0.65 → $0.10/pc
- labor $2.39 → $2.13
- overhead $0.26 → $0.23
- margin **−$0.16 → +$0.68/pc (14.4%)**
- Autoprice still $4.65.

**Side effect:** Orders › [PRICE] Total Shipping Allowance, and "Shipping Allowance vs Shipping Cost", now use the realistic bandana number.

## 2026-10-08 · Shipping estimate for margins (tees, fleece, everything)

**Why:** Stephen asked to apply the bandana approach to tees and fleece. Sales use the margin to review pricing, so it should reflect real shipping. **Autoprice must not change.**

**The problem:** Autoprice reads `[PRICE] Shipping Allowance` for non-bandana lines, so that field can't change. Margin now uses a separate estimate instead.

**ShipStation history:** Orders › Shipping Cost on 3,163 Free Shipping orders, with line items sorted into tee, fleece, bandana and other.

| | Real shipping / pc | Old allowance |
|---|---|---|
| Tees <50 pcs | $0.86 | $0.65 |
| Tees 100–250 | $0.50 | $0.65 |
| Tees 500+ | $0.47 | $0.65 |
| Fleece <100 | ~$1.95 | $2.15 |
| Fleece 100–250 | $1.63 | $2.15 |

**Model:** each order costs about **$11 to ship**, spread over all its pieces, plus a per-piece rate. That adds up to about $180k against $183k actually spent.

| Item | Per piece |
|---|---|
| Tees and other apparel | $0.45 |
| Fleece | $1.55 |
| Bandanas | $0.09 |
| Patches, stickers, pins | $0.06 |

- Pick-Up, Delivery, Fulfillment, and Artwork / Pre-Order Setup Fees / Misc. lines = $0.

**Airtable changes (Line Items):**

| Field | Change |
|---|---|
| **[COST] Order Quantity** `fldwGflBp7IISO98H` | New rollup: SUM of Orders › Total Quantity Rollup |
| **[COST] Est. Shipping / pc** `fldObjUIJI9gHPqOf` | New formula, the model above |
| [PRICE] Estimated Margin / Piece `fldU1y8VEpcg25vtr` | Subtracts `[COST] Est. Shipping / pc` instead of `[PRICE] Shipping Allowance`. Margin % and Line margin follow |
| Estimated Shipping / Piece `fld5M8zqRzfmPBT1r` | Was broken (pointed at a deleted field). Now mirrors `[COST] Est. Shipping / pc` |

- `[PRICE] Shipping Allowance` and Autoprice are untouched.
- Line Item Review reads the Airtable margin fields, so no app change was needed.

**Effect:**
- Most tee lines gain about $0.10–0.20/pc of margin.
- Fleece lines gain about $0.45–0.55/pc.
- Very small tee orders lose a little.
- 10981 stays +$0.68/pc; 10871 goes from −$0.43 to −$0.39/pc.

**Rollback:** put `{fld0IVAS1IxcPoqc6}` back in place of `{fldObjUIJI9gHPqOf}` in Estimated Margin / Piece.

**Re-fit later:** re-run the ShipStation fit if carrier rates change a lot.
