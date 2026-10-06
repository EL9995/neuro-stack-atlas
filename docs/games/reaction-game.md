# Reaction game: scope (proof of concept)

Agreed with Eric, 2026-10-05. Simple reaction time: a black panel turns white after a random wait;
click, tap or press Space as fast as possible.

## In scope (v1)
- 10 tries per run. Random wait 1.5–4 s before white, so it can't be timed.
- Clicking before white, or faster than 100 ms (a guess, not a reaction), is a **false start**: the try is redone.
- **Score: median** reaction time in ms (one slow try doesn't skew it). Also shown: fastest, spread
  (standard deviation), slow responses (over 500 ms, the usual "lapse" cut-off), false starts, every try.
- Same context picker (no stack / a saved stack), same storage key (`games`, list `reaction`), same
  results-after-run, restart (R/Esc) and Clear my scores as Sequence.
- Tunable in `content/games.js` (`RT_CONFIG`).

## Known limits
- Times include the screen's and mouse's own delay (often 10–50 ms, varies by device). Compare runs on the
  **same device**; don't compare across devices.

## Later: convert for mobile (noted 2026-10-05)
Tapping already works, but it isn't designed for phones yet:
- Full-screen panel while playing (no page chrome, no accidental scroll or zoom).
- Bigger, edge-to-edge tap target; ignore multi-touch; haptic tick on response where supported.
- Record the device type with each run, since touch screens add their own delay.
