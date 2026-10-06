# Sweet Spot: scope (proof of concept)

Agreed with Eric, 2026-10-05. A timing game (inspired by the timed-reload mechanic in Gears of War; mechanic
only, own name and look). Measures *anticipation timing*: predicting when a moving marker reaches a target,
which Reaction (responding to a change) and Sequence (keyboard speed) don't.

## Rules
- A marker sweeps left → right across a bar. Press Space or click once per sweep.
- The zone: bright centre (middle third), dimmer edges both sides. Every try draws a new **size** (from the
  level's range, in ms) and **centre** (55–92% of the bar, so in the second half).
- **Points per try = closeness to the centre**, early and late alike: 100 at dead centre → 0 at the zone edge.
  275 vs 325 ms on a 300 ms target score the same. The signed error is recorded (not scored) as "Tendency".
- 21 tries. **Smart ramp** (changed 2026-10-05 after Eric's first plays; the fixed 7-level table felt slow and clunky):
  a ladder of 20 levels, each a slightly faster sweep and smaller zone, easing from 1600 ms / 500 ms zone
  (level 1) to 650 ms / 80 ms (level 20). (Was 240 → 35 ms, then 300 → 80; widened 2026-10-05/06 so players
  stay engaged rather than discouraged. 35 ms is at the limit of human timing.)
- **Elite zone** (35 ms, "for the freaks"): can only spawn at level 15+ with 2 Perfects in a row, then 30% of
  the time. Red-hot and tagged; 2× points; missing it costs nothing (no level drop, streak kept).
- **Drawn vs scored:** the zone is drawn at `drawScale` × the scored window (1.2 at Eric's request, 2026-10-06);
  scoring never uses the drawn size. Risk noted: a press inside the drawn edge can score as a miss. Below 1 is the
  "generous" alternative (near misses just outside the drawn zone count). A hit climbs 1; from 5 hits in a row each hit climbs 2 (streak boost);
  a miss or no press drops 2 and ends the streak. Settles where you hit about 2 tries in 3. Zone size varies ±15%.
- Points per try = closeness × level bonus (1 + 0.1 × level step), so hard levels pay more.
- **Crisp stop:** the marker is drawn one frame ahead (so the screen matches the clock) and freezes where it is on
  press; the bar flashes by grade. (Before: it was drawn a frame behind, then jumped back to the press time.)
- **Target vs you:** each try shows "Target X ms · You Y ms" (ms from the start of the sweep); results show the
  closest try as a shareable line, a "How close each try was" chart (signed miss per try against
  that try's zone band), the level-by-try chart, and a table of every try.
- Level colour runs cold → hot (blue → teal → yellow → orange → red), shared with Sequence.
- Why ms and not bar %: the zone's on-screen width is window ÷ sweep. A faster sweep with the same ms window only
  draws a wider zone; it isn't harder to time. Difficulty = the window in ms (precision) + sweep time (prep).
- Results: points (score), average and median miss in ms, perfect/good/miss, tendency, miss by level.
- Numbers are a first guess for Eric's human feedback; all tunable in `content/games.js` (`SS_CONFIG`).

## Later
- A single "your timing window is ~N ms" number from the ladder (e.g. average zone over the last 10 tries).
- No-press tries are excluded from the average miss (they count as misses); revisit if people skip on purpose.
- Mobile conversion with the other games.
