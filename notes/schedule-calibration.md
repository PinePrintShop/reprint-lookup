# Schedule: run-time calibration from history

## 2026-10-14 · First pass (Stephen asked for a fresh look at the Suggest logic)

**Data:**
- **Imprints:** 2,567 with Run Finished in the last 12 months. 1,888 Press 1/2 jobs had clean timestamps (setup start → run start → run end).
- **Garment types:** from 15,399 Line Items (Garments' type select).
- **Definitions:**
  - Setup = Setup Start Actual → Run Start Actual.
  - Run = Run Start Actual → Run End Actual.
  - Category: bandana, fleece (≥50% of pieces Sweatshirt/Hoodie/Zip/Youth Fleece), tote, else tee.

### Setup
| Screens | Press 1 setup (median) | Press 2 setup (median) |
|---|---|---|
| 1 | 10 min | 10 min |
| 2 | 17 | 16 |
| 3 | 21 | 23 |
| 4 | 27 | 33 |
| 5 | 37 | n/a |
| 6 | 45 | n/a |
| 8 | 54 | n/a |

- Averaged over all jobs: **Press 1 8.2 min/screen, Press 2 8.9 min/screen.** The formula uses 10.
- By product (per screen): tees 7.8–8.4, bandanas 8.1–9.5, fleece 8.5–10.3.

### Run speed (pieces per hour, trimmed average so totals add up)
| | Tee | Bandana | Fleece | Tote/other |
|---|---|---|---|---|
| **Press 1 actual** | 253 | **239** | **194** | 176 |
| Press 1 formula | 250 | 150 | 250 | 250 |
| **Press 2 actual** | 231 | **189** | **171** | 149 |
| Press 2 formula | 225 | 135 | 225 | 225 |

- Small runs are slower: tees under 50 pcs run at about 210/hr against 265–300/hr above 200. Part of each run is fixed time (first pieces, test prints).
- On tees, screen count barely changes run speed. On Press 2, 4-screen jobs are slow, but there are only 11 of them.

### How well each model predicts job time (setup + run, summed over all 1,888 jobs)
| | Tees | Bandanas | Fleece | All |
|---|---|---|---|---|
| Airtable Estimated Run Time (current) | 1.05× | **1.38×** | **0.86×** | 1.18× |
| Calibrated (rates above, 8.2/8.9 min/screen) | 0.96× | 0.96× | 0.92× | 0.96× |

- Today's formula **over-books bandana days by about 40%** and **under-books fleece by about 15%**.
- Median miss per job drops from 15 to 10 minutes.

### A real press day
| | Press 1 | Press 2 |
|---|---|---|
| Full days (first start → last end ≥ 7.5 h) | 125 | 81 |
| First start → last end | 8.7 h | 8.7 h |
| **Setup + run on those days** | **6.7 h** (402 min) | **6.1 h** (363 min) |
| Jobs | 5 | 6 |
| Impressions | 951 | 735 |
| Gap between jobs, same product | 11 min | 13 min |
| Gap between jobs, product change (bandana ↔ tee/fleece) | 21 min | 30 min |

- About 2 hours of a full day go to loading, takedown, cleanup and breaks, which aren't tracked.
- Scheduler v1–v8 compares job minutes against 8.25 h / 8 h, so its "100%" is really about 120–130% of a real day.
- Switching product costs an extra 10–17 minutes. Grouping bandanas together is worth keeping.
- Jobs ran on their scheduled day 95% of the time (5% ran early). Caveat: scheduled dates may be edited to match the day a job actually ran.

### Embroidery and heat
- **Embroidery:** the stitch formula (stitches ÷ 1000 × 3 min × qty ÷ 6 heads) matches actual run time almost exactly (actual/formula = 1.0, 167 jobs). Hooping/setup before the run is about **18 min** a job, and the formula leaves it out.
- **Heat press** (small samples):

  | Press | Actual | Formula | Jobs |
  |---|---|---|---|
  | D3 | 33/hr | 60/hr | 18 |
  | Tag | 36/hr | 80/hr | 11 |
  | Hat | 39/hr | 40/hr | 8 |

  D3 and Tag look about 2× slower than the formula. Worth a sanity check with the heat press person.

### Proposed changes (not applied; need Stephen's OK)
1. **Scheduler time model:**
   - Setup is 8 min/screen on Press 1 and 9 on Press 2.
   - Run speed by press × product uses the table above.
   - Embroidery adds 18 min hooping; heat uses the measured rates.
2. **Turnaround in the timeline:** add 11–13 min between jobs and 21–30 min on a product change, so suggested start times match the floor.
3. **Real capacity:** count a full day as about **6.75 h of press time on Press 1 and 6 h on Press 2** (editable in Settings), so 100% means a normal full day.
4. **Later:** update Airtable's *Estimated Run Time* formula to the same numbers, so Operator, the Board and pricing share one time model. It's an Airtable formula change, so it needs an explicit OK.


## 2026-10-14 · Decisions
- **Option 1 (Schedule app uses the calibrated model):** done in Schedule v9.
- **Cushion:** Suggest fills days to 90% (Schedule v10). Calibrated job times on their own run about 4–8% short of actual.
- **Option 2 (Airtable Estimated Run Time formula):** still under discussion. Allocated Production Time (filled in by hand) is what Operator and the Board read today.

## 2026-10-14 · Option 2 applied: Airtable formulas updated (Stephen: "15 minutes is great… update all the formulas to match")
**Changed (Imprints):**

| Field | Before | After |
|---|---|---|
| Ink Change time `fldTONDvKJ8o9KHFt` | Ink Changes × 25 min | **× 15 min** |
| Estimated Run Time `fldDYBnwwV6Z4VLBc` | 10 min/screen; P1 250/hr (bandana 150), P2 225/hr (bandana 135); no Split; "Finshing" typo | see below |

- **Press 1:** setup **8.2 min/screen**, then printing at bandana **239**/hr, or tee **253** / fleece **194** blended by fleece share, plus ink changes.
- **Press 2:** setup **8.9 min/screen**, bandana **189**, tee **231**, fleece **171**.
- **Split:** setup 8.9 min/screen; speeds are the sum of both presses (bandana 428, tee 484, fleece 365).
- **Fleece share** = [PRICE] Fleece Impressions ÷ Total Impressions. Those fields already existed, so no new field was needed.
- **Embroidery** (Tajima): same per-piece math as before, **+18 min hooping**.
- **Heat, sewing, finishing:** unchanged, except that **"Finishing - Bandana Hanger" is now spelled right**. It used to give 0.
- **Not touched:** pricing ([PRICE] fields, POM) and Allocated Production Time (typed by the scheduler).
- **Depends on Estimated Run Time:** only *Estimated vs. Actual Time*.

**Check on real jobs:** the 72 Press 1/2 jobs scheduled in the next 14 days went from **76.6 h → 62.5 h** of estimated time. Examples:

| Job | Before | After |
|---|---|---|
| 10989-A: 200 bandanas, 1 screen, 3 ink changes, Press 2 | 2h 54m | 1h 57m |
| 10878-A: 150 bandanas, 4 screens, Press 1 | 1h 40m | 1h 10m |
| 10945-A: 200 left chest, 3 screens, 2 ink changes, Press 1 | 2h 08m | 1h 42m |
| 10951-A: 45 pcs, 4 screens, Press 1 | 51m | 43m |

Airtable's computed values matched the model to the second.

**Rollback:**
- Ink Change time: `(({fld6Tv0llCxjjyyHJ}*25)/60)*3600`
- Estimated Run Time (previous):
```
IF(AND({fldv59OGU7EkBVofo}="Press 1 - ROQ NEXT",{fldKQIL0rSJBSeC8S}="Bandana"),((({fld8rgkIj1RPO97QU}*10)/60)+({fldFipR4ddfqMPeAX}/150))*3600+{fldTONDvKJ8o9KHFt},
IF(AND({fldv59OGU7EkBVofo}="Press 1 - ROQ NEXT",{fldKQIL0rSJBSeC8S}!="Bandana"),((({fld8rgkIj1RPO97QU}*10)/60)+({fldFipR4ddfqMPeAX}/250))*3600+{fldTONDvKJ8o9KHFt},
IF(AND({fldv59OGU7EkBVofo}="Press 2 - ROQ YOU",{fldKQIL0rSJBSeC8S}="Bandana"),((({fld8rgkIj1RPO97QU}*10)/60)+({fldFipR4ddfqMPeAX}/135))*3600+{fldTONDvKJ8o9KHFt},
IF(AND({fldv59OGU7EkBVofo}="Press 2 - ROQ YOU",{fldKQIL0rSJBSeC8S}!="Bandana"),((({fld8rgkIj1RPO97QU}*10)/60)+({fldFipR4ddfqMPeAX}/225))*3600+{fldTONDvKJ8o9KHFt},
IF(AND({fldv59OGU7EkBVofo}="Embroidery - TAJIMA 6-Head", {fldjNCuaGOkWgzH2K}="Embroidery"),ROUND( (({fld3nysvEoi0hb7iC} / 1000) * 3 * {fldFipR4ddfqMPeAX}) / 6 * 60, 0 ),
IF(AND({fldv59OGU7EkBVofo}="Embroidery - TAJIMA 6-Head", {fldjNCuaGOkWgzH2K}="Woven Label Application"),(({fldFipR4ddfqMPeAX}*7)/6)/60*3600,
IF(AND({fldv59OGU7EkBVofo}="Embroidery - TAJIMA 6-Head", {fldjNCuaGOkWgzH2K}="Patch Application"),(({fldFipR4ddfqMPeAX}*7)/6)/60*3600,
IF(AND({fldv59OGU7EkBVofo}="Embroidery - TAJIMA 6-Head", {fldjNCuaGOkWgzH2K}="Decopress - Leather"),(({fldFipR4ddfqMPeAX}*7)/6)/60*3600,
IF(AND({fldv59OGU7EkBVofo}="Embroidery - TAJIMA 6-Head", {fldjNCuaGOkWgzH2K}="Decopress - Woven / Twill"),(({fldFipR4ddfqMPeAX}*7)/6)/60*3600,
IF(AND({fldv59OGU7EkBVofo}="Embroidery - TAJIMA 6-Head", {fldjNCuaGOkWgzH2K}="Decopress - Metallic"),(({fldFipR4ddfqMPeAX}*7)/6)/60*3600,
IF(AND({fldv59OGU7EkBVofo}="Embroidery - TAJIMA 6-Head", {fldjNCuaGOkWgzH2K}="Decopress - Reflective"),(({fldFipR4ddfqMPeAX}*7)/6)/60*3600,
IF({fldv59OGU7EkBVofo}="Sewing - Bartacker",({fldFipR4ddfqMPeAX}*2)/60*3600,
IF({fldv59OGU7EkBVofo}="Sewing - Post-bed",({fldFipR4ddfqMPeAX}*2)/60*3600,
IF({fldv59OGU7EkBVofo}="Heat press - Tag Press",({fldFipR4ddfqMPeAX}*0.75)/60*3600,
IF({fldv59OGU7EkBVofo}="Heat press - D3",({fldFipR4ddfqMPeAX}*1)/60*3600,
IF({fldv59OGU7EkBVofo}="Heat press - Hat Press",({fldFipR4ddfqMPeAX}*1.5)/60*3600,
IF({fldjNCuaGOkWgzH2K}="Finishing - Fold & Bag",({fldFipR4ddfqMPeAX}*1.5)/60*3600,
IF({fldjNCuaGOkWgzH2K}="Finishing - UPC sticker",({fldFipR4ddfqMPeAX}*1)/60*3600,
IF({fldjNCuaGOkWgzH2K}="Finshing - Bandana Hanger",({fldFipR4ddfqMPeAX}*1.5)/60*3600,
0)))))))))))))))))))
```

**Still open:** heat press speeds (D3/Tag measured about 2× slower than the formula, from 37 jobs); confirm with the heat press person before changing.
