# 6XL size support (parked Oct 2026)

6XL is rare (one line item ever: order 8494, 1 piece). Parked on purpose; record any
6XL damage/extras in the issue notes for now.

## Known gap
- Line Items **Total Final Quantity** leaves out 6XL while **Total Quantity** includes it,
  so a 6XL line reads 1 short per 6XL piece (8494 shows 359 of 360).
- Order Issues has no **[RP] 6XL**; Catching writes 6XL damage to Damage Details only.

## If we pick it up
Airtable (adds a 6XL term only; existing values unchanged except 8494 → 360):
- Order Issues: new **[RP] 6XL**; add to Total Damaged Pieces, Reprint Cost
  (use Affected Line Item 6XL Cost `fldLpIhGnYXfbv71S`).
- Line Items: new **Extra 6X**, **6XL (DMGs)** (rollup of [RP] 6XL like 5XL (DMGs) `fldzv55KQtBElF2Gb`),
  **Final 6X** = 6XL + Extra 6X − 6XL (DMGs); add 6XL to Total Final Quantity, Total (DMGs),
  Damages List, Extras Total Number, List of Extras, Total Line Cost.
- Leave the legacy refund field `fldKpxD1dxMGnfVmr` alone.
Apps: Catching (SZ_TO_RP 6XL), Damage Log (RP/ext/fin 6XL), Receiving (6XL extras).
