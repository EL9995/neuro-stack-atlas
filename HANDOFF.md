# Handoff: Neuro Stack Atlas ("Mind" pillar)

For a new Claude instance picking this up. Read this first, then `README.md` and `content/README.md`.

## The person
- **Eric**, founder. Doesn't write code; directs and reviews. GitHub: `EL9995`.
- Explain in plain English. After each piece of work: **3–5 bullets** on what changed and how to check it.
- **Show screenshots before committing.** Nothing gets committed until he approves.
- **Ask before deleting anything or changing how something looks or behaves.**
- **Never change scientific content or wording unless asked.** New wording goes in `content/` files and is marked `// DRAFT`; list every new factual claim for his review. Check new claims against the site's own data first (e.g. `content/timing-and-safety.js`).
- **Desktop first.** Mobile pass comes later.
- Umbrella vision: **Mind · Body · Food**. This repo is *Mind* (neurotransmitters, nootropics). Other Claude instances are building Supplement Transparency (CoAs, tier list) and Food Recalls/Transparency in parallel.

## Where things are
- Live site: https://el9995.github.io/neuro-stack-atlas/
- Repo: https://github.com/EL9995/neuro-stack-atlas (public)
- Local folder: `~/Documents/neuro-stack-atlas`
- Run locally: `python3 -m http.server 8003` in the folder, open http://localhost:8003. The original one-file prototype is in `baseline/` (serve that folder on 8001 for before/after).
- Machine: Python 3.9 and Google Chrome only. **No Node, no Homebrew, no `gh` CLI.** zsh: avoid `echo ====` (zsh treats `=word` specially).

## Publishing
- Commits are authored `Eric <337937552+EL9995@users.noreply.github.com>` (already set in the repo's git config). End commit messages with the Co-Authored-By line from your system instructions.
- **Eric pushes from GitHub Desktop ("Push origin").** The command-line git here has no GitHub credentials, so don't try to push.
- GitHub Pages runs from a **GitHub Actions workflow** (`.github/workflows/pages.yml`) that publishes only the site files (index.html, favicon.svg, og-image.png, css/, js/, content/, food/). `baseline/`, `tools/`, `docs/` and `*.md` are not served. Pages Source must stay set to "GitHub Actions".
- GitHub Pages caches files for 10 minutes; tell Eric to hard-refresh (Cmd+Shift+R) or use a private window. *Offered, not yet built:* version-stamping asset URLs at deploy time so reviews always see fresh files.

## Current state (as of 2026-10-05)
- **Two saves are committed but NOT pushed:** "Stack builder: numbered steps, click-through tours, browse by neurotransmitter" and "Stack builder step 6: save after reviewing warnings…". Under them sits a save made by the **Food instance**: "Add food recall check test page at /food/" (adds `food/index.html` and adds `food` to the publish workflow). Pushing publishes all three, including `/food/` going live. Eric was told and decides when to push.
- **Uncommitted files from the Supplement Transparency instance live in this folder:** `demo/`, `pilot/` (magnesium pilot spreadsheet and data), `tools/pilot_magnesium.py`. Don't commit, move or delete them; ask Eric. Recommendation given: each project in its own repo, plus a hub page (the empty `Eric-Portfolio-` repo could become `EL9995.github.io`).
- Also uncommitted: this `HANDOFF.md` and an updated `docs/images/stack-builder.jpg`. Commit them when Eric approves.

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
- **Stack builder** (`js/builder.js`, `content/stack-builder.js`, `css/builder-steps.css`, `js/tour.js`): six numbered steps: name, day, add (big search, browse by neurotransmitter, templates, items, suggestions), timeline, check, save. Tours are data-driven (`BUILDER_TEXT.tours`). Step 6 needs "I've read the warnings" when the check has serious or to-review items. Any edit clears `savedAt` (sets `wasSaved`). The **Tracker only shows the dose checklist for saved stacks**.
- **Tracker insights** (`js/tracker-insights.js`): descriptive only, no causal wording. "On days you logged X, you rated Y higher (a vs b)". Needs 10+ logged days (ratings + doses), 3+ days with and without. The low-mood safety message (with 988) must stay word for word.
- Scanner is frozen (basic paste mode off claude.ai). Account sync is paused (data stays in localStorage).

## Review tooling (`tools/`)
- `shoot.py <url> <dir>`: the fixed screenshot set at desktop and phone, frozen clock, no cache, fresh port each run. Saves `dom.json` for content diffs.
- `make_compare.py`: builds `screenshots/compare.html` (before | after | changed pixels). Send Eric http://localhost:8003/screenshots/compare.html.
- `domdiff.py`: content comparison (masks the timer-animated scene).
- `test_explore.py <nt>`: click-through of a neurotransmitter page. `test_builder.py`: Stack builder tours, browse, add, search, save, Tracker gate.
- `readme_images.py`: re-takes `docs/images/*` and the GIF (the GIF is encoded in-browser; no image libraries needed).
- `screenshots/` is git-ignored. If screenshots look stale, check for a leftover headless Chrome (`ps aux | grep headless`).

## Backlog / open threads
1. Version-stamp assets on deploy (cache-busting). Offered.
2. Mobile pass (scenes cramped, title card wraps).
3. Logo: concepts A–G in `tools/logo-concepts.html`; Eric hasn't picked one ("not vibing yet"). The favicon is a placeholder.
4. Tracker walkthrough/tour; Stack builder: collapse finished steps for returning users.
5. The header status text "Saved in this browser" may be confused with step 6 "Save stack". Consider "Draft kept in this browser".
6. Add enzymes to search; maybe make enzyme labels in the scene link to enzyme pages.
7. Reflex games to measure stack effects (priority 3 originally).
8. Hub page for Mind · Body · Food.

## DRAFT wording awaiting Eric's review
`content/landing-page.js`, `content/scene-captions.js` (incl. PROTOCOL_SCENE, explore labels), `content/enzymes.js` (all 10 pages; key claims listed in the conversation: TH feedback inhibition, TPH not saturated / ~90% gut serotonin, AADC + carbidopa, PKU, GAD + B6 seizures, AChE + huperzine/donepezil, ~half of choline recycled), `content/tags.js`, `content/stack-builder.js` (meal tour lines on fat/protein/carb snack).
