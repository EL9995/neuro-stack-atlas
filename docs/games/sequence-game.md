# Sequence game: scope (proof of concept)

Agreed with Eric, 2026-10-05. A cognitive minigame: type arrow sequences as fast as you can.
Inspired by arrow-combo input mechanics (e.g. Helldivers 2 stratagems); the mechanic only. No names,
art, sounds or codes from that game.

## In scope (v1)
- **Loop:** a sequence of arrows appears; type it with arrow keys or WASD. Correct keys light up.
  Finishing a sequence brings the next one immediately. Arrow keys don't scroll the page during a run.
- **Generator:** random arrows from a seeded generator (every run stores its seed, so it can be replayed).
  Three of the same arrow in a row and "easy" patterns (↑↑↑↑, ↑↓↑↓, ↑↑↓↓) are allowed but made rare.
  The odds are tunable in `content/games.js`.
- **Difficulty:** Level 1 = 4 arrows ×3 sequences, Level 2 = 5 ×3 … Level 7 = 10 ×3 (21 sequences, 147 arrows).
  After Level 7, 10-arrow sequences continue until time runs out.
- **Rules:** 60 seconds. A wrong key clears your input; retype the *same* sequence (costs time only).
  3-2-1 countdown before the clock starts.
- **Score:** correct arrows (arrows in finished sequences, plus correct arrows in the unfinished one at time-up).
  Level reached is shown as a badge.
- **Recorded per run:** score, level, sequences finished, arrows/second, mistakes, % clean sequences,
  time per sequence (with its length), seed, date/time, and context (no stack, or which saved stack).
  Saved with the site's existing storage (this browser, or the account store when available).
- **Results:** shown at the end of each run (proof-of-concept only), with personal best and the last 5 runs.
- **Demo controls:** Play again, restart mid-run (R or Esc), and Clear my scores.

## On hold
- Memory mode (sequence shown briefly, then hidden).
- Practice / tutorial run.

## Later (big picture)
- Store results on a server and present them in an **end-of-day summary**, not right after the game.
  The end-of-run results screen is for the demo.
- Tracker integration (stack vs. no-stack comparison over time), phone input (swipe / on-screen pad),
  sound, combo meter, daily challenge, neurotransmitter theming.
