# Product demo script: Neuro Stack Atlas

Drafted 2026-10-06. A 5-minute walkthrough for portfolio reviews, plus a 90-second version.
The story is one loop: **learn → build safely → follow the plan → measure → compare.**

## The pitch (say this first, 15 seconds)
> People stack supplements on vibes. This site walks you through it like an engineer would: understand what each
> one does to your brain chemistry, build a stack that's checked for interactions, follow it, and then *measure*
> whether anything changed, with short cognitive games and an honest comparison against your own baseline.

## Before you start (setup checklist)
1. Fresh browser profile or private window (so tours show and nothing old is saved).
2. Open http://localhost:8010 (or the live site). Desktop width; the mobile pass isn't done.
3. Have Games → Compare → **Load sample runs** ready for the end (made-up runs, clearly labelled, removable).
4. A fresh browser starts with the stack **"Example: focus day"** (caffeine, L-theanine, L-tyrosine, B6, omega-3,
   D3, magnesium). The walkthrough uses it.

## The 5-minute walkthrough

### 1. Explore: learn the system (60 s)
- **Home:** scroll the "What are neurotransmitters?" scene. *"Six chemical messengers; every supplement here is mapped to one."*
- Click **Dopamine**. Scroll the assembly line: precursor → enzymes → dopamine. Point at the **slowest step** valve.
  *"This is why more L-Tyrosine isn't always more dopamine: the slow step caps it."*
- Open **L-Tyrosine**: evidence rating, dose range, "Watch out for" interactions.
- Talking point: every claim has an evidence level; wording is plain English, not medical advice.

### 2. Stack builder: build safely (90 s)
- **Step 0, About you:** add a medication (e.g. an SSRI). *"Stays in this browser, never sent anywhere."*
- **Build:** the starting stack **"Example: focus day"** is already there (the **Templates** tab shows other
  starting points). Add **5-HTP** to trigger a real warning.
- **Check:** the SSRI + 5-HTP finding is critical and **pauses** the stack. Show "Review the warnings",
  then remove 5-HTP. *"The product refuses to let you track a dangerous stack without an explicit review."*
- **Acknowledge and approve**, then **Plan your protocol:** drag meals and a fasting window; timing tips update.
- **Save.** Talking point: the safety gate is a deliberate product decision (see `docs/stack-builder-review.html`).

### 3. Tracker: follow the plan (40 s)
- The saved stack appears as a **daily checklist**. Tick doses, rate focus / energy / mood / calm / sleep.
- Mention **insights**: after 10+ logged days it says things like "On days you logged X, you rated focus higher",
  descriptive only, never "X caused Y".

### 4. Games: measure (60 s)
- **Games** tab. Set **Playing on** to the saved stack.
- Play one **Reaction** run (30–40 s, the easiest to watch): black → white → click. Results: median ms, spread, false starts.
- Show **Threshold** briefly: the smart ramp, streaks, and the "Target X ms · You Y ms" readout.
  *"Three games, three different skills: keyboard speed, raw reaction, and timing."*

### 5. Compare: the payoff (40 s)
- **Compare** tab → **Load sample runs**. Three cards, each a strip plot of no-stack vs on-stack runs.
- Read the verdicts aloud: Sequence **clearly better**, Threshold **a little better**, Reaction **about the same**.
  *"It tells you when a difference is just your normal day-to-day swing, and warns when practice alone could
  explain it. It never says the stack caused it."*
- **Remove sample runs.**

### Close (15 s)
> "Learn, build safely, follow, measure, compare: one loop, all in the browser, nothing sent to a server.
> It was built with AI under my direction: I set the product and safety decisions; Claude wrote the code."

## 90-second version
Dopamine scene (15 s) → example stack + the SSRI/5-HTP pause (30 s) → one Reaction run on the stack (25 s) →
Compare with sample runs (20 s).

## Gaps found while scripting this (not built; candidates for next)
1. **No front door to the tools.** Home has a reserved spot for links to Stack builder / Tracker / Games
   (`js/home.js` ~line 159). A first-time visitor only finds them in the top bar.
2. **Tracker doesn't point to Games.** A "Take a 1-minute check-in" link on the Tracker day (pre-selecting the
   active stack under "Playing on") would close the loop the demo narrates.
3. **Games don't know the Tracker's active stack.** "Playing on" remembers its own choice; defaulting to the
   Tracker's stack (when it's saved and not paused) would cut a step.
4. **Compare needs time to mean anything** for a real user (3 warm-up + 5 runs per side). The sample data covers
   the demo; a short "how to run your own comparison" guide (alternate days, same time of day, same device)
   would cover real use.
5. **Mobile.** The whole demo is desktop-only for now.
