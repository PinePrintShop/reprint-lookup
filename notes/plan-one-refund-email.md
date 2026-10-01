# Plan: one bookkeeper email per order (Damage Log v17)

Status: LIVE as of Oct 1, 2026. Fields created, new automation on, per-issue email step removed, Slack repointed to Refund Amount, 211 past approved refunds backfilled In Refund Request. Team switches to Damage Log v17.

## Today
- Automation **Order Issue Resolutions** runs when an issue's **Approve Resolution** box is checked.
- On the REFUND branch it does three things:
  1. Emails finance@ (cc/reply-to `fld80uF2dXd3HQXlv`), using the **old** refund field `fldKpxD1dxMGnfVmr`.
  2. Sets the issue to Resolved.
  3. Posts to Slack, also using the old field.
- So the bookkeeper gets one email per approved refund issue.

## Proposed

### 1. Airtable fields (I can create these via the API once you OK them)
| Table | Field | Type | Who writes it |
|---|---|---|---|
| Orders | Refund Request Amount | Currency | Damage Log |
| Orders | Refund Request Details | Long text: one line per line item, same text as *Copy refund for QuickBooks* | Damage Log |
| Orders | Refund Request At | Date/time, **the trigger field** | Damage Log |
| Orders | Refund Request Count | Number: 1 = first request, 2+ = additional | Damage Log |
| Order Issues | In Refund Request | Checkbox: this issue's refund has already gone to the bookkeeper | Damage Log |

### 2. Automation changes (you make these in the Airtable UI, since the API can't edit automations)
1. **Order Issue Resolutions → REFUND branch:**
   - Turn **off/delete** the *Send email* step.
   - Keep *Set Resolved* and the Slack step.
   - Repoint the Slack "REFUND DUE" value from the old field to **Refund Amount** (`fldvlOAwvSLBHEaVu`).
2. **New automation, "Refund Request — one per order":**
   - Trigger: *When record updated* → Orders → watch **Refund Request At**.
   - Condition: Refund Request Amount > 0.
   - Send email:
     - To finance@pineprintshop.com.
     - Subject: `Refund Request: {Customer} - Invoice {Order #}` (with "(additional)" when Count > 1).
     - Body: `Please issue a "Damages" reimbursement of {Amount} to {Customer} for Invoice {Order #}.` followed by {Details}.
     - CC/reply-to: whoever the old cc was. That field lives on Order Issues, so we need to pick an Orders-side equivalent.

### 3. Damage Log v17
- Approving refund issues (single, Approve all, or batch) works as today, then sends **one** request per order covering every approved REFUND issue not yet marked *In Refund Request*.
- It writes the Amount, Details, Count + 1, and At = now, then ticks *In Refund Request* on those issues.
- A refund issue approved later sends a second, "additional" email for just the new amount.
- The order card shows "Sent to bookkeeper · {date}" and the history of requests.
- Practice mode writes nothing.

## Decisions for tomorrow
1. **Refunds approved outside the Damage Log** (the Airtable interface, or the Catching app if it approves) would no longer email anyone once the per-issue email step is off. Options:
   - All refund approvals go through the Damage Log only.
   - The Damage Log shows a "not yet requested" flag so nothing is missed. *(I'd suggest both.)*
2. **Additional-refund email** when a new refund issue comes in after the first request: yes (suggested) or roll it into a manual step?
3. **CC/reply-to** on the new email: who should it be?
4. **Refund receipt email:** Stephen fixed the Zap so the QuickBooks email comes from the invoice. Add a line to the new email: "Send refund receipt to: {email}" + the QuickBooks invoice link (Orders `fldykkdxIu7nqdYct`). Orders has two email lookups through the linked contact, `fldtqZM37i9bKUPaT` and `fldk67LeCepv46n38` (identical on the latest orders). Confirm which one matches the invoice email. The bookkeeper uses **Save and send** on the Refund Receipt / Credit Memo.
5. **Cut-over order**, so nothing double-sends or goes missing:
   - Ship v17 (test in practice mode).
   - Create the fields.
   - Build the new automation and turn it on.
   - Turn off the old email step.
   - Switch the bookmark.
   - Do it all in one sitting.
