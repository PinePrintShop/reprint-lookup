# Reviews (performance reviews + quarterly check-ins)

## 2026-11-12 · mockup v1 (`pine-reviews-mockup-v1.html`)
**Why:** moving performance reviews off Gusto into a Pine app. Stephen wants peer-to-peer plus manager reviews, with most of the weight on the manager, all rated 1–5. A clickable mockup first, with no Airtable, to try the flow.

**Decisions (Stephen, Nov 12):**
- **Two kinds of cycle:** a **performance review twice a year** (manager + peers) and a **quarterly check-in** (the employee's own answers + the lead's notes). There's no self review in the performance review: the self part is the check-in.
- **Score = manager 75% + peers 25%.** Peers count only when at least 2 have answered; otherwise the manager's score stands alone, and the page says so.
- **Peers are anonymous to everyone**, leads included. The lead sees ratings and comments without names and goes over them in the sit-down. Comments are shown in a mixed order.
- **Who reviews whom:** leads review their crews; Stephen reviews the leads and managers. Stephen and Nicole pick 2–4 peers per person, based on who they work with most.
- **Rated questions (1–5, counted):** job competence (Gusto), reliability, quality & detail, teamwork, positive workplace (Gusto), takes feedback & grows. Manager and peer each get their own wording. Safety / clean workspace left out for now.
- **Manager only, not counted:** skills fully used (Gusto). 5 = ready for more.
- **Open questions:** outstanding work / room to improve (Gusto). Required for the manager; peers answer at least one.
- **A 1, 2 or 5 needs one example**, so scores come with a reason.
- **Scale:** 1 Needs significant improvement · 2 Below expectations · 3 Meets expectations · 4 Exceeds · 5 Exceptional, a role model.
- **Check-in** (from the Quarterly Conversation Guide): 6 agree/disagree ratings (success is clear, role is clear, tools & training, vibe, communication, voice) plus the open questions. **"Leadership gaps" goes only to Stephen and Nicole**, not to the lead running the check-in.

**Mockup screens:** To do (forms) · Results (the lead's sit-down screen: score, manager vs peers per question, "Talk about" when they differ by 1+, anonymous peer comments, the latest check-in) · Check-ins · Setup (owner/office: peers, managers, progress, start a cycle). "Viewing as" switches between owner, press lead and press operator. People are made up (public page).

**Next, before a real version:**
- **Privacy:** reviews can't be open to anyone with the link like the shop apps. Plan: a personal sign-in per person, all reads/writes through the Cloudflare worker with a who-is-asking check, and a separate Airtable base so shop tokens can't read reviews. Tables roughly People · Cycles · Assignments · Responses. Talk to Stephen before creating anything.
