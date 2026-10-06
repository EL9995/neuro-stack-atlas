# Handoff: Neuro Stack Atlas ("Mind" pillar)

For a new Claude instance picking this up. Read this first, then `README.md` and `content/README.md`.

## The person
- **Eric**, founder. Doesn't write code; directs and reviews. GitHub: `EL9995`.
- Explain in plain English. After each piece of work: **3–5 bullets** on what changed and how to check it.
- **Review flow (since 2026-10-05):** no before/after screenshot sets for routine work. Verify it yourself, point Eric at the live local copy (http://localhost:8010, see below), and **commit/push only when he says so**. Team specs that say "no screenshot approval needed, build, test, commit" can be committed directly.
- **Ask before deleting anything or changing how something looks or behaves.**
- **Never change scientific content or wording unless asked.** New wording goes in `content/` files and is marked `// DRAFT`; list every new factual claim for his review. Check new claims against the site's own data first (e.g. `content/timing-and-safety.js`).
- **Desktop first.** Mobile pass comes later.
- Umbrella vision: **Mind · Body · Food**. This repo is *Mind* (neurotransmitters, nootropics). Other Claude instances are building Supplement Transparency (CoAs, tier list) and Food Recalls/Transparency in parallel.

## Where things are
- Live site: https://el9995.github.io/neuro-stack-atlas/
- Repo: https://github.com/EL9995/neuro-stack-atlas (public)
- Local folder: `~/Documents/neuro-stack-atlas`
- Run locally: **`python3 tools/serve.py 8010`** (no-cache server; plain `http.server` on 8003 lets Chrome keep stale JS, which once blanked "In this stack"). Open http://localhost:8010. The original one-file prototype is in `baseline/` (serve that folder on 8001 for before/after). The in-app browser pane can't read ~/Documents from `.claude/launch.json`, so start servers in Eric's Terminal panel.
- Machine: Python 3.9 and Google Chrome only. **No Node, no Homebrew, no `gh` CLI.** zsh: avoid `echo ====` (zsh treats `=word` specially).

## Publishing
- Commits are authored `Eric <337937552+EL9995@users.noreply.github.com>` (already set in the repo's git config). End commit messages with the Co-Authored-By line from your system instructions.
- **Eric pushes from GitHub Desktop ("Push origin").** The command-line git here has no GitHub credentials, so don't try to push.
- GitHub Pages runs from a **GitHub Actions workflow** (`.github/workflows/pages.yml`) that publishes only the site files (index.html, favicon.svg, og-image.png, css/, js/, content/, food/). `baseline/`, `tools/`, `docs/` and `*.md` are not served. Pages Source must stay set to "GitHub Actions".
- GitHub Pages caches files for 10 minutes; tell Eric to hard-refresh (Cmd+Shift+R) or use a private window. *Offered, not yet built:* version-stamping asset URLs at deploy time so reviews always see fresh files.

## Current state (as of 2026-10-05, evening)
- Committed and pushed by Eric: "Stack builder safety review, compact steps, and a first Simulator page". The team's medications / side effects / expand-all round is committed on top (see git log); Eric pushes from GitHub Desktop.
- **Uncommitted files from the Supplement Transparency instance live in this folder:** `demo/`, `pilot/`, `tools/pilot_magnesium.py`. Don't commit, move or delete them; ask Eric. Food instance owns `food/`.
- Team review page for legal/ethics (extreme doses, approval flow): `docs/stack-builder-review.html` (also published as a private claude.ai artifact).
- **Known failing test on purpose:** `tools/test_checker.py` "stimulant + breakdown-slowing herb" (caffeine + hordenine only reaches "to review"; the team hasn't decided whether it should pause the stack).

## How the code is organized
- Plain static site: `index.html` loads `css/*.css` and then classic `<script>`s in order: `content/*.js` (data and wording), then `js/*.js`. **Everything shares global scope; order in index.html matters.** No build step.
- `content/`: all data and user-facing wording (supplements, pathways, enzymes, scene captions, landing page, stack builder text, safety tags). `content/README.md` maps "I want to change…" to files.
- Router: `js/router.js` (hash routes: `""` home, `<nt>`, `<nt>.<supp>`, `<supp>`, `enzyme:<id>`, `stack`, `track`, `scan`). Scroll scenes are started at the end of `render()`, after the top bar has its final size.
- **Scroll scenes** (sticky stage, scroll position → progress 0–1, SVG world plus HTML labels positioned from world coordinates):
  - `js/scene-story.js`: home "What are neurotransmitters?" Ends at "The next cell fires" (`NS_END = .785` trims the old animation).
  - `js/scene-protocol.js`: home "Start smart" (foundation / cycles / recovery).
  - `js/scene-pathway.js`: the per-neurotransmitter assembly line. `psSetup(nt)` lays out from pathway data. Intro slides (heading, low/high cards) come first. Labels use level-of-detail by zoom. The end is "explore mode": the chain is clickable with info cards. Height is set so every scene scrolls the same distance per caption (`psHeight`).
  - **Gotcha:** measure the stage *after* setting `--chrome-h` (it resizes the stage), or HTML labels drift off the SVG.
- `js/pages.js`: neurotransmitter page (scene, then three supplement blocks: Precursors / Cofactors / Modulators) and supplement pages. `js/enzymes.js` + `content/enzymes.js`: 10 enzyme pages (reached from scene info cards).
- Safety tags (`js/helpers.js`): "Use caution" (tier `caution`, 5 supplements) and "Serious interactions" (any `major` interaction in data), with hover text from `content/tags.js`. "Deep cut" labels were removed.
- **Stack builder** (`js/builder.js`, `content/stack-builder.js`, `css/builder*.css`, `js/tour.js`): optional **step 0 About you** (medications/conditions, shared by all stacks, never locked or required; intro says the checks need it, status line shows checks on/off), then five steps (`BSTEPS`, `LAST`): name, **build** (one panel: Search / Browse / Templates on top, "In this stack" grouped by pathway below, Undo / Redo / Clear, folded Suggestions), **check** (+ final gate), **Plan your protocol** (Timing tips capped at 3 with "Show all", then the timeline; step id still `timeline`. The timeline's top rows ARE the day editor: Day bar with draggable wake/bed handles, Meals chips (drag; click or Enter opens `openTlEditor` for name/time/Protein-Fat-Carbs/remove; "+ Meal" / "+ Snack"), Fasting blocks (`st.fasts` [{id, from, to}], may wrap past midnight; drag to move, drag either edge to stretch, click to edit; shaded across every lane). Fasting heads-ups in `analyzeTiming`: meals inside a fast, and `with_fat`/`with_food` supplements dosed during one ("Best taken with food"). Wording in `BUILDER_TEXT.dayRows` / `.fasting`), save. Wording that names a step number lives in content/recommendations.js and content/stack-builder.js; renumber it if steps change. **Split since 2026-10-05:** steps 2–3 are the shopping list and its safety check (doses, interactions, meds, load); all *when* advice (spacing, time of day, food vs meals) is `analyzeTiming()` and shows only in step 4. Timing tips are advice only and never pause anything; only `analyze()` findings gate the timeline and Tracker. **Final gate (end of step 3, every stack even clean ones):** "Acknowledge and approve" (`stackAcked`/`ackSig` in stack-checker.js, `st.ack`, wording `LOAD_RULES.ack`). Step 4, the step-3 Next button and Save stay locked until it is done; `stackReady` = not paused + acknowledged. It covers exactly the supplements, doses and findings: changing any of them asks again, moving times does not. `analyze()` must never read dose times (it would silently void approvals); time-dependent rules belong in `analyzeTiming()`. Approving serious warnings ("Approve anyway") also sets the acknowledgment. Steps open one at a time (`nsa-builderOpen`) and fold to one-line summaries (`nsa-builderExpanded`). Tours are data-driven and play per step. Any edit clears `savedAt`. The **Tracker only shows the dose checklist for saved stacks that aren't paused**.
- **Stack check** (`js/stack-checker.js`): interactions, **Medications & conditions**, **Stack load** (`LOAD_RULES` in `content/recommendations.js`: same system, too much at once, too many items, LAT1 amino acids, dose ranking 2× serious / 5× critical), timing, dose, tolerance, food, recovery. Severities: info < minor < moderate ("to review") < major ("serious") < critical. **Serious/critical pause the timeline and the Tracker** until the person presses "Review the warnings", ticks "Reviewed" on every to-review/serious finding, and approves at the bottom (`st.approved` covers exactly those findings; a new or worse one re-pauses). `LOAD_RULES.approve.allowCritical` stays `true` (team decision). Add-time and dose-monitor pop-ups ask before adding conflicts or going above range.
- **About you** (`content/medications.js`: drug classes + name lookup + conditions; `content/med-rules.js`: rules). Stored only in localStorage `nsa-about`, shared across stacks, never sent anywhere (tested: no network calls). Rules use the existing "Watch out for" entries in the supplement data (`ixMatch`) plus team rules by tag/id; each rule notes its source or NEEDS SOURCE.
- **Side effects** (`content/side-effects.js`): `common`, `stopSigns`, `avoidIf`, `liver`, `pregnancy`, `source`, `verified`. **Sources allowed: NIH ODS fact sheets, NCCIH, NIH LiverTox, MedlinePlus only.** Entries without one are `needsSource: true` and carry the site's existing side-effect data. Shown on "What is this?" and supplement pages with a "Not yet reviewed" tag. ODS blocks scripted downloads (Cloudflare); read the fact sheets in the browser pane.
- **Review process for `verified: false`:** a reviewer opens each entry's sources, checks every listed side effect, stop sign and "avoid if" against them, fixes or removes anything not supported, then sets `verified: true` (the "Not yet reviewed" tag disappears). `needsSource` entries need a source added first. Do the same for rules in `med-rules.js` marked NEEDS SOURCE.
- **Simulator** (`#sim`, `js/simulator.js`, `content/simulator.js`, `css/simulator.css`): six assembly lines, shared LAT1 doorway, slow-step valves, cofactors "from food" vs in stack, PubMed-cited sources. Phase 1 only; time slider and warning visuals are phases 2–3.
- **Tracker insights** (`js/tracker-insights.js`): descriptive only, no causal wording. "On days you logged X, you rated Y higher (a vs b)". Needs 10+ logged days (ratings + doses), 3+ days with and without. The low-mood safety message (with 988) must stay word for word.
- Scanner is frozen (basic paste mode off claude.ai). Account sync is paused (data stays in localStorage).

## Review tooling (`tools/`)
- `shoot.py <url> <dir>`: the fixed screenshot set at desktop and phone, frozen clock, no cache, fresh port each run. Saves `dom.json` for content diffs.
- `make_compare.py`: builds `screenshots/compare.html` (before | after | changed pixels). Send Eric http://localhost:8003/screenshots/compare.html.
- `domdiff.py`: content comparison (masks the timer-animated scene).
- `test_explore.py <nt>`: click-through of a neurotransmitter page. `test_builder.py`: Stack builder tours, browse, add, search, save, Tracker gate. `test_checker.py`: load rules, verdict, pause, review + approval, dose ranking, dose monitor. `test_safety.py`: medications/conditions, side effects, About you stays local, Expand/Collapse all. All take a base URL (default http://localhost:8010).
- `serve.py [port]`: no-cache local server (default 8010).
- `readme_images.py`: re-takes `docs/images/*` and the GIF (the GIF is encoded in-browser; no image libraries needed).
- `screenshots/` is git-ignored. If screenshots look stale, check for a leftover headless Chrome (`ps aux | grep headless`).

## Backlog / open threads
1. Version-stamp assets on deploy (cache-busting). Offered.
2. Mobile pass (scenes cramped, title card wraps).
3. Logo: concepts A–G in `tools/logo-concepts.html`; Eric hasn't picked one ("not vibing yet"). The favicon is a placeholder.
4. Tracker walkthrough/tour.
9. Team decision: should stimulant + breakdown-slowing herb (caffeine + hordenine) be serious? (test fails until decided)
10. Simulator phases 2 (time slider) and 3 (warning visuals); legal/ethics review of the approval flow and dose thresholds.
11. Review every `verified: false` entry in `content/side-effects.js` and NEEDS SOURCE rules in `content/med-rules.js`.
5. The header status text "Saved in this browser" may be confused with step 6 "Save stack". Consider "Draft kept in this browser".
6. Add enzymes to search; maybe make enzyme labels in the scene link to enzyme pages.
7. Games at `#games`, proof of concept: Sequence (arrow combos), Reaction (black → white, click) and Sweet Spot (timed press in a moving zone; smart ramp + elite zone, tuned with Eric's play feedback). Files: js/games.js (page shell + game registry + Sequence), js/game-reaction.js, js/game-timing.js, content/games.js, css/games.css, tools/test_games.py. Scope and what's on hold: `docs/games/*.md`. Next: server storage + end-of-day summary, Sequence memory mode, practice run, convert Reaction for mobile.
8. Hub page for Mind · Body · Food.

12. **Stewing (Eric, 2026-10-05):** meal size / digestion time (idea: Snack / Light / Regular / Large per meal, fat lengthens the window; maybe meals as bars instead of thin shading so they don't drown under the lanes) and onset/duration sourcing (many entries use a repeated 30–60 min / 2–4 h default with no source; idea: add a source field, audit, mark unsourced "approximate").
13. **Warning audit:** advanced day protocols trip a dozen flags (alert fatigue). Proposed: sort every flag into must-block / should-know / nice-to-know, collapse tips into "N notes", let people dismiss a tip per stack, show positives. Serious/critical gates never change.
14. Step 5 still has its own "I've read the warnings in step 3" checkbox, which repeats step 3's "Acknowledge and approve". Offered to remove it; Eric hasn't decided.

## DRAFT wording awaiting Eric's review
`content/landing-page.js`, `content/scene-captions.js` (incl. PROTOCOL_SCENE, explore labels), `content/enzymes.js` (all 10 pages; key claims listed in the conversation: TH feedback inhibition, TPH not saturated / ~90% gut serotonin, AADC + carbidopa, PKU, GAD + B6 seizures, AChE + huperzine/donepezil, ~half of choline recycled), `content/tags.js`, `content/stack-builder.js` (meal tour lines; step/tour/undo/fold wording; evidence-level definitions, which must match how ratings were assigned), `content/recommendations.js` (`LOAD_RULES`: thresholds, dose wording, review/approve flow), `content/simulator.js` (all; science captions cite PubMed), `content/medications.js`, `content/med-rules.js`, `content/side-effects.js`, and the Mucuna evidence sentence added in `content/supplement-links.js`.
