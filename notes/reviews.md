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

## 2026-11-12 · mockup v2 (`pine-reviews-mockup-v2.html`)
**Why:** Stephen: "make the questions a little more prominent and … make everything required even comments … I am trying to avoid someone just hitting numbers."
- **Questions are the headline:** 22px bold (19px on a phone), a yellow-on-black number box, a black bar down the left of each question, and the short name (JOB COMPETENCE) as a small label above.
- **Everything is required, in reviews and check-ins:**
  - every rating needs a comment, including "Skills fully used" and the check-in ratings;
  - every open question is required (peers now answer both, not one of two);
  - the check-in's leadership-gaps box is required too ("None" plus a reason is fine).
- **"Real sentence" rule:** a comment needs at least 20 characters. The box says Required → Add a bit more → ✓ as you type, and "Send" jumps to the first thing missing.
- **The comment prompt follows the score:** 1–2 "What would help?", 3 "What would make it a 4?", 4 "Give one example", 5 "What makes it a 5?".
- **Results go question by question:** each question shows the manager's number and comment, then the peer average and every peer comment (labelled "A peer", mixed order). The score table stays at the top.
- v1 left as is.

## 2026-11-12 · mockup v3 (`pine-reviews-mockup-v3.html`)
- Stephen: "remove Why? and just leave give one example". Before a number is picked, and on every check-in rating, the comment label is now just **"Give one example"**. The score-based prompts for reviews stay ("What would make it a 4?" etc.).

## 2026-11-12 · mockup v4 (`pine-reviews-mockup-v4.html`)
- Stephen: "peer and manager should all read the same way". Every comment box on every form (manager, peer, check-in) now says **"Give one example"**, whatever the score. The score-based prompts are gone.

## 2026-11-12 · mockup v5 (`pine-reviews-mockup-v5.html`) + walkthrough video
**Why:** Stephen asked to see the flow for an employee who gets the link, and how it's secured. Decisions: **text and email** both carry the link; **link + 4-digit PIN** for now (not everyone has a Google account).
- **Employee link mode** (`#t=demo`, or "Try the employee link" in the bar):
  1. the text and email they get;
  2. pick a PIN, enter it again ("Forgot it? Ask the office to reset it.");
  3. a phone-first list of just the peer reviews they owe;
  4. each review full screen with "‹ My reviews";
  5. after the last one is sent, "All done".
  It hides the mockup controls and the check-in, so it shows only the peer flow.
- **Walkthrough video** (about 1 minute, 1080p, 9 captioned steps) recorded from this mode with Playwright, sent in chat, not in the repo.
- **Security plan (agreed direction, not built):**
  - a private reviews base, reachable only through the worker;
  - PINs stored scrambled (hashed), never readable, only reset;
  - link codes that expire at the end of the cycle and can be turned off;
  - the worker removes peer names before results reach a lead.

## 2026-11-12 · mockup v6 (`pine-reviews-mockup-v6.html`)
**Why:** Stephen: "that send save for later bar is really strong and feels in the way on mobile let's look at really focusing on the 1-5 and the comments".
- **No bar at the bottom.** "Save for later" is gone because answers save as you go. **Send is one big button at the end** of the form.
- **A slim progress line** sticks under the top bar: "3 of 8 · saved".
- **On a phone the questions aren't boxed:** a line between questions, bigger 1–5 buttons (60px, 26px numbers).
- **Said once:** "1 is low, 5 is high. Every answer needs one example." sits at the top of every form. The per-question "Tap 1 to 5" and "Required" labels are gone; the box shows only "Add a bit more" or ✓.
- The peer note is shorter: "Your name is never shown to Devin."
- The walkthrough video was re-recorded on v6.

## 2026-11-12 · mockup v7 (`pine-reviews-mockup-v7.html`)
**Why:** Stephen: "after you filled out the text and close the keyboard on an iPhone can we make it auto move through the questions".
- **Tap a number → its example box opens** with the keyboard up (only when the box is still empty, so changing a score later doesn't pop the keyboard).
- **Close the keyboard → the page glides to the next unanswered question,** with it at the top under the progress line. After the last one it lands on Send. Closing the keyboard means Done, the return key (now labelled "done", and it no longer adds a new line), or tapping on the page.
- **It stays put when:**
  - the example is under 20 characters (the box says "Add a bit more");
  - the keyboard closed because they tapped another box or button themselves.
- Works the same on desktop (Enter or clicking away). Tested with iPhone 13 emulation in Playwright. Walkthrough video re-recorded on v7.

## 2026-11-12 · mockup v8 (`pine-reviews-mockup-v8.html`)
**Why:** Stephen liked the score-based prompts from v2 ("what would get them to a four if they clicked 3"), which v4 had replaced with one label. They're back, and they read the same way on all three forms:

| Score | Manager & peer | Check-in (about yourself) |
|---|---|---|
| none yet | Give one example | Give one example |
| 1–2 | What would help them improve? Give one example | What would help? Give one example |
| 3 | What would get them to a 4? | What would make it a 4? |
| 4 | Give one example | Give one example |
| 5 | What makes it a 5? Give one example | What makes it a 5? Give one example |

## 2026-11-12 · mockup v9 (`pine-reviews-mockup-v9.html`): the quarterly check-in
**Why:** Stephen: "what would the quarterly check in look like since that is really just questions and answers to be reviewed with the manager at the check in meeting".
- **The employee's side is the Quarterly Conversation Guide, word for word:** 10 questions in its order, under its three headings. Every answer is required (a sentence or two), and auto-advance works.
  - Four questions also get a quick 1–5 so we can see how people feel over time (not scored):
    - #2 success is clear (Not at all → Completely)
    - #6 vibe (Poor → Great)
    - #8 communication (Poor → Great)
    - #9 voice (Not at all → Completely)
  - Their example box uses the score prompts ("What would make it a 4?").
  - #10 leadership gaps: 🔒 owner and office manager only.
  - Send says "Send to Jordan". The done screen says the lead will go over the answers on Thursday, and that next steps come by text after.
- **The lead's side is a meeting screen** (Check-ins tab), the agenda in order:
  1. last quarter's next steps, ticked off;
  2. each question with the employee's answer and an optional notes box;
  3. Issues & opportunities;
  4. Next steps we agreed (type, then Add);
  5. Finish check-in.
  - The employee gets the next steps by text. The lead's notes stay private.
  - #10 shows only "goes to the owner and office manager" to the lead. The owner sees the answer.
- **Phone demo:** `#t=checkin` shows the employee's check-in flow (text and email → PIN → straight into the form → "Sent to Jordan"). `#t=demo` is still the peer reviews. Both links are in the mockup note; the bar's "Try the employee link" button was removed (said once).
- The Results tab's "Latest check-in" now shows the four 1–5s and points to the Check-ins tab for the answers.
- **Open questions for Stephen:**
  - Should the employee see the next steps in the app too, not only by text?
  - Should check-in answers stay required, given the meeting covers them?

## 2026-11-12 · mockup v10 (`pine-reviews-mockup-v10.html`): next steps in the app
**Stephen:** check-in answers stay **required**, and "I like having the next steps in the app".
- **"Your next steps"** shows for the employee:
  - at the top of their To do (desktop) and their phone list;
  - at the top of their check-in form;
  - on the "Sent to Jordan" screen.
- The employee ticks a step when it's done ("You marked done").
- **The lead's meeting screen** shows "Alex says done" (yellow) next to those steps. The lead ticks the ones they agree are done.
- **Finish check-in** moves the new next steps into the employee's list. Steps that aren't done carry over, and confirmed ones drop off. The employee still gets a text.

## 2026-11-13 · Going real: decisions and the build spec
**Stephen (Nov 13):**
1. The 7 tables are approved.
2. Nicole uses the **admin screens only**. The raw base is shared with **Stephen and Garrett only**.
3. **Email first.** At go-live, Stephen also sends each person their link on **WhatsApp** himself.
4. Admin accounts use a **6-digit PIN**.

### Pieces
- **Base "Pine Reviews"**, separate from `appJkaLk8DykjsgHR`. Collaborators: Stephen and Garrett.
- **Worker `pine-reviews`**: a new Cloudflare worker (`workers/pine-reviews-vN.js`), separate from `pine-workers`.
  - **Secrets:**
    - `REVIEWS_AIRTABLE_TOKEN` (a personal access token scoped to the Pine Reviews base only)
    - `PIN_PEPPER` (random, 32+ bytes)
    - `REVIEWS_BASE_ID`
  - **KV:** `REVIEWS_KV` (sessions, lockouts).
  - **CORS:** only `https://pineprintshop.github.io`.
- **App:** `pine-reviews-vN.html`, with the permanent link `reviews.html`.

### Tables (field names exact; the worker uses names)
- **People:** Name (primary) · Role (Employee / Lead / Admin) · Department · Lead (→ People) · Email · Phone · Active (checkbox) · Link hash · PIN hash · PIN set (date-time) · Wrong PINs (number) · Locked until (date-time) · Link sent (date-time) · Email link (text; the plain link sits here only until the email automation sends it and clears it)
- **Cycles:** Name (primary) · Type (Review / Check-in) · Opens (date) · Due (date) · Status (Draft / Open / Closed) · Manager weight (percent, 75) · Min peers (number, 2)
- **Questions:** Key (primary) · Form (Manager review / Peer review / Check-in) · Order · Section · Wording · Short name · Scale (Expectations / Skills used / Not at all–Completely / Poor–Great / None) · Counts in score (checkbox) · Private (checkbox) · Active (checkbox)
- **Assignments:** Label (primary, written by the worker) · Cycle (→ Cycles) · Kind (Manager review / Peer review / Check-in) · Writer (→ People) · About (→ People) · Status (Not started / In progress / Sent) · Sent at · Met at · Lead notes (long text, JSON by question) · Issues & opportunities (long text)
- **Answers:** Label (primary) · Assignment (→ Assignments) · Question (→ Questions) · Score (number) · Text (long text)
- **Next steps:** Step (primary) · Person (→ People) · From (→ Assignments) · Employee done (checkbox) · Lead confirmed (checkbox) · Created (created time)
- **Activity log:** What (primary) · Who (→ People) · Detail (long text) · When (created time)

### Security rules the worker enforces
- **Link code:** 32 random bytes, base64url, stored as SHA-256 only. It sits in the URL fragment (`#k=`). A new code is made each time a link is sent; the old one stops working.
- **PIN:** PBKDF2-SHA256 (100k rounds), salted with the person's record ID, plus `PIN_PEPPER`. 4 digits, or 6 for Admins.
- **Wrong PINs:** 5 → locked for 15 min. 10 → locked until an admin resets it.
- **Sessions:** a random token in KV with a 30-minute idle timeout, a 12-hour maximum, and an end on sign-out. The app keeps it in sessionStorage.
- **Every route checks role and relationship:**
  - Employees: their own assignments and steps.
  - Leads: their crew. Peer answers have no writer and are hidden below Min peers; Private questions are hidden.
  - Admins: everything.
- **Sent assignments are read-only.** Closed cycles refuse writes and sign-ins (except for Admins).
- **Activity log:** sign-ins, wrong PINs, sends, link sends, PIN resets, admin views.
- **Headers:** `Cache-Control: no-store` and `Referrer-Policy: no-referrer` on every response.

### 2026-11-13 · worker v1 written (`workers/pine-reviews-v1.js`), not deployed
- **Tests:** 17 with a fake Airtable and KV. Run `node --test workers/test/*.test.mjs`; on Node 22 use the glob, not the folder. All pass.
- **Routes:**
  - `/r/version`
  - Signing in: `/r/hello`, `/r/pin/set`, `/r/signin`, `/r/signout`
  - Own forms: `/r/me`, `/r/assignment/get`, `/r/assignment/save`, `/r/assignment/send`, `/r/steps/mark`
  - Lead or admin: `/r/crew`, `/r/results`, `/r/checkin`, `/r/checkin/save`, `/r/checkin/finish`
  - Admin: `/r/admin/people`, `/r/admin/cycles`, `/r/admin/link`, `/r/admin/pin/reset`, `/r/admin/assign`, `/r/admin/cycle/open`, `/r/admin/cycle/close`
- **It won't start without its settings:** `REVIEWS_AIRTABLE_TOKEN`, `REVIEWS_BASE_ID`, `PIN_PEPPER` and `REVIEWS_KV`.
- **Choices made while building:**
  - Manager and peer questions are paired by Key.
  - Answer rows are labelled `<assignment>:<question>`.
  - Leads and admins can sign in when no cycle is open. Employees can only if they have open next steps.
  - The 10th wrong PIN locks the link until an admin resets it.
  - Peer comments come back shuffled within each question. Only admins get who wrote what (`byWriter`).
  - Closing a cycle expires links only when asked, and never an admin's.
  - A lead sees a check-in only after the employee sends it.
- **Still to do:**
  - the Pine Reviews base (waiting on the Airtable connector reaching it)
  - the email automation
  - the real app
  - Stephen's Cloudflare setup

### 2026-11-13 · Pine Reviews base created
- **Base:** `app18uATdd147oIth`, in Stephen's private workspace. Collaborators: Stephen and Garrett (Stephen adds Garrett himself).
- **Tables:**
  - People `tblZ7oc8i9ZrxcPOg`
  - Cycles `tbltZH8X1yxkD4gHT`
  - Questions `tblUjO4iEn2jpdsfs`
  - Assignments `tblvBdPygBCIwQVKf`
  - Answers `tblXrUAgaHPIStYZ6`
  - Next steps `tblQTR22orpzR3Jak`
  - Activity log `tblgbQjIOi8NNVBAZ`
  - Airtable's empty starter "Table 1" is still there; Stephen can delete it.
- **Field names** match the spec and `workers/pine-reviews-v1.js` exactly.
- **Questions loaded (27):**
  - Manager review: 6 counted + Skills used + 2 open
  - Peer review: 6 counted + 2 open
  - Check-in: the Conversation Guide's 10 questions, with #10 Private
- **Time zone** on date-time fields: America/Chicago (display only).

### 2026-11-13 · Roles (Stephen)
- **Stephen is the only Admin** in the app. Nicole, Chris, Whitney and Mike are **managers**: they review their own people and see only their own crew's results, with no peer names and no leadership-gap answers.
  - This replaces the earlier "Nicole uses the admin screens": only Stephen sends links, resets PINs and sets up cycles.
- **Garrett has access to the raw base only.** He has no account in the app.
- **People rows created:** Stephen (Admin), plus Nicole, Chris, Whitney and Mike (Role "Lead", Lead = Stephen). Everyone else is added by Stephen in Airtable.
- **Contact details go only into the base,** never into GitHub: the repository is public.
- **Wording to do:** the base and worker say "Lead". Stephen calls the role "Manager". Rename the option and the field to Manager, together with the worker, once the app is built.

### 2026-11-13 · App v1 (`pine-reviews-v1.html`) + permanent link `reviews.html`. Not live until the worker is deployed.
- **Built from mockup v10** and wired to worker v1. `reviews.html` forwards to v1 and keeps `?practice=1` and the `#k=` code. The app reads the code once, then wipes it from the address bar. The code and the session live in sessionStorage only.
- **Screens:**
  - PIN set / PIN keypad
  - Your next steps + To do
  - review and check-in forms: the same feel as v10, with autosave to the worker (1.5 s after typing; "saved" only once the worker confirms)
  - Results and the Check-ins meeting screen for managers and the admin
  - Setup for the admin:
    - people with link and PIN state
    - **Send on WhatsApp**: a new link, then a wa.me message ready to send
    - Email link and Reset PIN
    - Open / Close cycles
    - the Assign builder
- **Practice (`?practice=1`)** runs the real worker code inside the page on made-up people. It makes no network calls.
- **Visible wording** says "manager" (the base and worker still say Lead; to rename later). The private check-in question says "Only the owner sees this answer, not your manager."
- **Tests:**
  - 45/45 end-to-end checks, run against the real worker on a fake Airtable: the PIN flow, autosave and reload, send validation, results without peer names, the private answer hidden from the manager, link rotation, lockout, zero network calls in practice, and phone/iPad/desktop layout.
  - Worker unit tests: 17/17.
- **The worker URL is assumed** to be `https://pine-reviews.stephen-dab.workers.dev`. If Cloudflare gives it another name, change `API` in the app.

### 2026-11-13 · Worker deployed
- **Stephen deployed `pine-reviews`** (`/r/version` → 1) and added the KV binding and the three settings.
- **First admin link:** made by hand. The code was generated in the session, and only its SHA-256 went into Stephen's People row. The link itself was given to Stephen in chat only.
- **Stephen's next step:** open the link and set a 6-digit PIN. Then send himself a fresh link from Setup (Send on WhatsApp / Copy), which retires the one shared in chat.
