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
