// ===========================================================================
// GAMES WORDING AND TUNING
// The Games page (#games). Proof of concept: one game, Sequence.
// Scope: docs/games/sequence-game.md
// ALL TEXT HERE IS DRAFT (October 2026).
//
// HOW TO EDIT
//   - Change only text inside "quotes" and the numbers. Keep quotes, commas and brackets.
//   - "levels" is the difficulty ramp: [arrows per sequence, sequences at that length].
//     After the last level, sequences of the last length keep coming until time runs out.
//   - "tripleChance" is how often a third identical arrow in a row is allowed (0.1 = 10%).
//     "easyChance" is how often an easy pattern (↑↑↑↑, ↑↓↑↓, ↑↑↓↓) is kept instead of redrawn.
//   - Save, then refresh the page.
// ===========================================================================
const SEQ_CONFIG = {
  seconds: 60,
  countdown: 3,
  levels: [[4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3]],
  tripleChance: 0.1,
  easyChance: 0.15,
  recentRuns: 5
};

const GAMES_TEXT = {
  eyebrow: "Games",
  title: "Sequence",
  lede: "Arrows appear. Type them as fast as you can with the arrow keys or WASD. Sequences get longer every three. You have 60 seconds.",
  rules: [
    "A wrong key clears your input. Start that sequence again.",
    "Your score is every correct arrow in the time.",
    "Press R or Esc to restart at any time."
  ],
  contextLabel: "Playing on",
  noStack: "No stack (baseline)",
  notSaved: "(not saved)",
  start: "Start",
  startHint: "or press Enter",
  restart: "Restart",
  again: "Play again",
  clear: "Clear my scores",
  clearConfirm: "Delete all your {game} scores? This can't be undone.",
  cleared: "Scores cleared.",
  go: "Go",
  level: "Level",
  max: "max",
  time: "Time",
  score: "Score",
  keyboardOnly: "This game needs a keyboard for now. Phone controls are coming later.",

  results: {
    title: "Results",
    newBest: "New personal best",
    score: "Score",
    scoreSub: "correct arrows",
    level: "Level reached",
    speed: "Speed",
    speedSub: "arrows / second",
    accuracy: "Clean sequences",
    accuracySub: "{mistakes} mistakes",
    finished: "Sequences finished",
    byLength: "Average time by length",
    best: "Personal best",
    recent: "Recent runs",
    none: "No runs yet.",
    seed: "Seed",
    note: "Proof of concept: later, results will be saved to your account and shown in an end-of-day summary instead of right after the game."
  }
};

// ---------------------------------------------------------------------------
// REACTION: the screen turns white after a random wait; click, tap or press Space.
//   "trials" responses make a run; the score is the median, in milliseconds.
//   "waitMin"/"waitMax": the random wait before white, in milliseconds.
//   "tooFast": faster than this counts as a false start (a guess, not a reaction).
//   "slow": slower than this counts as a slow response (a lapse).
// Mobile: works with a tap already, but isn't designed for phones yet (see docs/games/reaction-game.md).
// ---------------------------------------------------------------------------
const RT_CONFIG = { trials: 10, waitMin: 1500, waitMax: 4000, tooFast: 100, slow: 500, pause: 900, recentRuns: 5 };

const GAMES_PICK = { sequence: "Sequence", reaction: "Reaction", timing: "Threshold" };

const RT_TEXT = {
  title: "Reaction",
  lede: "The panel is black. When it turns white, click it, tap it or press Space as fast as you can. Ten tries, usually under a minute.",
  rules: [
    "Wait for white. Clicking early is a false start, and that try is redone.",
    "Your score is your middle time (the median), so one slow try doesn't ruin it.",
    "Press R or Esc to restart at any time."
  ],
  get: "Get ready…",
  wait: "Wait for white",
  now: "Click!",
  early: "Too soon. Wait for white.",
  ms: "{ms} ms",
  of: "{n} / {total}",
  results: {
    median: "Median", medianSub: "ms, your score",
    best: "Fastest", bestSub: "ms",
    spread: "Spread", spreadSub: "ms, how much your times vary",
    slow: "Slow responses", slowSub: "over {ms} ms",
    early: "False starts", earlySub: "clicked before white",
    trials: "Every try",
    personalBest: "Personal best",
    recentHead: ["When", "Playing on", "Median", "Fastest", "False starts"]
  }
};

// ---------------------------------------------------------------------------
// THRESHOLD: a marker sweeps across a bar; press when it's in the glowing zone.
//   Smart ramp: difficulty is a ladder of "ladder.steps" levels. Every step shrinks the zone
//   and speeds up the sweep a little (smoothly from the Start to the End numbers).
//     - A hit (inside the zone) climbs 1 level; from "streakBoost" hits in a row, each hit climbs 2.
//     - A miss (or no press) drops "down" levels and ends the streak.
//   It settles where you hit about two tries in three.
//   "elite": a rare 35 ms zone for the best players. It can only spawn once you're at "fromLevel" or above
//     and have "perfectsInRow" Perfects in a row, and then only "chance" of the time (0.3 = 30%).
//     Worth "bonus" times the points; missing it doesn't drop your level or end your streak.
//   "drawScale": how big the zone is drawn compared with the window that's scored (1 = the same).
//     Above 1 looks easier, but a press inside the drawn edge can still score as a miss.
//     Below 1 is generous: near misses just outside the drawn zone still count.
//   "jitter": the zone's size varies by up to this much around the level's size (0.15 = ±15%).
//   The time window is what makes it hard: a faster sweep with the same window only draws a wider zone.
//   "perfect": the bright centre, as a share of the zone (1/3 = the middle third).
//   "centerFrom"/"centerTo": where the zone's centre can land, as a share of the bar (0.5 = halfway).
//   Points per try: 100 at dead centre, falling evenly to 0 at the zone's edge (early or late alike),
//   times the level bonus (1 + level × "bonus"), so hard levels pay more.
//   "lead": pause before the marker starts. "after": how long the result shows.
// ---------------------------------------------------------------------------
const SS_CONFIG = {
  tries: 21,
  ladder: { steps: 20, sweepStart: 1600, sweepEnd: 650, zoneStart: 500, zoneEnd: 80 },
  elite: { zone: 35, fromLevel: 15, perfectsInRow: 2, chance: 0.3, bonus: 2 },
  drawScale: 1.2,
  streakBoost: 5, down: 2,
  jitter: 0.15,
  bonus: 0.1,
  perfect: 1 / 3,
  centerFrom: 0.55, centerTo: 0.92,
  lead: 450, after: 850,
  recentRuns: 5
};

const SS_TEXT = {
  title: "Threshold",
  lede: "A marker sweeps across the bar. Press Space or click when it's in the glowing zone. Hit it and it gets faster and tighter; miss and it eases off. 21 tries.",
  rules: [
    "Points depend only on how close you are to the centre. Early and late count the same.",
    "Every hit climbs a level. Five in a row and you climb two at a time. A miss drops you two.",
    "Press R or Esc to restart at any time."
  ],
  press: "Space or click",
  perfect: "Perfect", good: "Good", miss: "Miss", none: "No press",
  off: "{ms} ms off",
  targetYou: "Target {target} ms · You {you} ms",
  elite: "Elite zone · {ms} ms · 2× points",
  eliteMiss: "No penalty for missing an elite zone.",
  streak: "Streak",
  of: "{n} / {total}",
  results: {
    points: "Points", pointsSub: "your score",
    peak: "Peak level", peakSub: "of {max}",
    streak: "Best streak", streakSub: "hits in a row",
    error: "Average miss", errorSub: "ms from centre",
    bias: "Tendency", biasEarly: "early on average (not scored)", biasLate: "late on average (not scored)", biasNone: "on time on average (not scored)",
    closest: "Closest: {ms} ms off. The target was {target} ms and you pressed at {you} ms (level {level}).",
    ladder: "Your level, try by try",
    close: "How close each try was",
    closeHint: "Each dot is a press: above the line is late, below is early. The band behind it is that try's zone (bright = perfect).",
    late: "late", early: "early", target: "target",
    elite: "Elite zones: {hit} of {seen} hit",
    every: "Every try",
    head: ["#", "Level", "Zone", "Target", "You", "Off", "Points"],
    personalBest: "Personal best",
    recentPeak: "level {n}"
  }
};
