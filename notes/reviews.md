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
