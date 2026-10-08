// ---------------------------------------------------------------------------
// VIEWS: GAMES (#games)
// One page, a switcher between games (GAMES.which). Each game draws into #game-stage
// and keeps its runs in one "games" document: { v, sequence: [...], reaction: [...], timing: [...] }.
// Each game registers in gameDefs(); Reaction lives in js/game-reaction.js, Threshold in js/game-timing.js.
//
// Sequence: arrows appear, type them with the arrow keys or WASD. A wrong key
// clears the input for that sequence. Lengths ramp up by SEQ_CONFIG.levels, then
// hold at the last length until the clock runs out. Score = correct arrows.
// Every run is seeded, so it can be replayed exactly (seqMake(len, seqRng(seed))).
// Runs are saved under the "games" key with the site's storage (Persist).
// Wording and tuning: content/games.js. Scope: docs/games/sequence-game.md
// ---------------------------------------------------------------------------
const ARROWS = ["up", "right", "down", "left"];
const ARROW_KEYS = { ArrowUp: "up", ArrowRight: "right", ArrowDown: "down", ArrowLeft: "left", w: "up", d: "right", s: "down", a: "left" };
// Level colour, cold to hot: f = 0 (easiest) is blue, then yellow, orange, f = 1 (hardest) red.
// The four stops are --heat-0…3 in css/games.css (darker in light mode so yellow stays readable).
function gameHeat(f) {
  f = Math.min(Math.max(f, 0), 1) * 3;
  const i = Math.min(Math.floor(f), 2), t = f - i;
  return `color-mix(in oklch decreasing hue, var(--heat-${i}) ${Math.round(100 - t * 100)}%, var(--heat-${i + 1}))`;
}
const GAMES = { which: lsGet("nsa-game", "sequence"), loading: null };
// Every game: its state (phase, runs, last), wording (title, lede), and hooks. A function, because the
// other games' files load after this one.
const gameDefs = () => ({
  sequence: { st: SEQ, text: GAMES_TEXT, render: seqRender, stop: seqStop, key: seqKey },
  reaction: { st: RT, text: RT_TEXT, render: rtRender, stop: rtStop, key: rtKey },
  timing: { st: SS, text: SS_TEXT, render: ssRender, stop: ssStop, key: ssKey },
  // Not a game: no runs of its own (noSave), no keys.
  compare: { st: CMP, text: CMP_TEXT, render: cmpRender, stop: () => {}, key: () => {}, noSave: true }
});
const gamesPlayable = () => Object.entries(gameDefs()).filter(([, g]) => !g.noSave);
// A game's own runs, without the Compare sample data.
const realRuns = st => (st.runs || []).filter(r => !r.sample);
const gameDef = () => gameDefs()[GAMES.which] || gameDefs().sequence;
function gamesStop() { Object.values(gameDefs()).forEach(g => g.stop()); }
const gamesIdle = () => Object.values(gameDefs()).every(g => g.st.phase === "ready");
const SEQ = { phase: "ready", seed: 0, rnd: null, k: 0, seq: [], pos: 0, t0: 0, seqT0: 0, seqMistakes: 0, mistakes: 0, done: [], timers: [], raf: 0, runs: null, loading: null, last: null };

// Small seeded generator (mulberry32): the same seed always gives the same sequences.
function seqRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Easy: one or two repeating arrows (↑↑↑↑, ↑↓↑↓), or only one change of direction (↑↑↓↓, ↑↑↑→).
function seqIsEasy(s) {
  const period2 = s.every((a, i) => i < 2 || a === s[i - 2]);
  const runs = s.reduce((n, a, i) => n + (i && a !== s[i - 1] ? 1 : 0), 1);
  return period2 || runs <= 2;
}

function seqMake(len, rnd) {
  const C = SEQ_CONFIG;
  for (;;) {
    const s = [];
    while (s.length < len) {
      const n = s.length;
      if (n >= 2 && s[n - 1] === s[n - 2] && rnd() >= C.tripleChance) {
        const others = ARROWS.filter(x => x !== s[n - 1]);
        s.push(others[Math.floor(rnd() * others.length)]);
      } else s.push(ARROWS[Math.floor(rnd() * ARROWS.length)]);
    }
    if (!seqIsEasy(s) || rnd() < C.easyChance) return s;
  }
}

// Level and length of the k-th sequence in a run (0-based).
function seqLevelAt(k) {
  const L = SEQ_CONFIG.levels;
  let n = 0;
  for (let i = 0; i < L.length; i++) { n += L[i][1]; if (k < n) return { level: i + 1, len: L[i][0] }; }
  return { level: L.length, len: L[L.length - 1][0] };
}

function gamesLoad() {
  // Deferred a tick: on a direct visit to #games the page renders before boot starts Persist.
  if (!GAMES.loading) GAMES.loading = Promise.resolve().then(() => Persist.load("games")).then(d => {
    gamesPlayable().forEach(([id, g]) => { g.st.runs = d && Array.isArray(d[id]) ? d[id] : []; });
  });
  return GAMES.loading;
}
function gamesSave() {
  Persist.save("games", () => gamesPlayable().reduce((d, [id, g]) => { d[id] = g.st.runs || []; return d; }, { v: 1 }));
}

// "Playing on": no stack, or one of the stacks. Remembered across games.
function gameCtxField() {
  const T = GAMES_TEXT, ctx = lsGet("nsa-gameCtx", "none");
  return `<div class="field"><label for="game-ctx">${esc(T.contextLabel)}</label>
    <select id="game-ctx"><option value="none">${esc(T.noStack)}</option>${App.stacks.map(s => `<option value="${s.id}"${s.id === ctx ? " selected" : ""}>${esc(s.name)}${s.savedAt ? "" : " " + esc(T.notSaved)}</option>`).join("")}</select></div>`;
}
function gameCtxRead() {
  const sel = document.getElementById("game-ctx");
  if (sel) lsSet("nsa-gameCtx", sel.value);
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
}
function gameCtxRecord() {
  const st = App.stacks.find(x => x.id === lsGet("nsa-gameCtx", "none"));
  return st ? { id: st.id, name: st.name, saved: !!st.savedAt } : null;
}
const gameWhen = r => new Date(r.at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const gameStat = (label, val, sub) => `<div class="seq-stat"><span class="hint">${esc(label)}</span><b>${val}</b>${sub ? `<span class="hint">${esc(sub)}</span>` : ""}</div>`;
const seqBest = () => realRuns(SEQ).reduce((b, r) => (!b || r.score > b.score ? r : b), null);

function seqArrow(dir, cls) {
  return `<span class="seq-arrow seq-${dir}${cls ? " " + cls : ""}" aria-label="${dir}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 21 12.5h-5.5V21h-7v-8.5H3z"/></svg></span>`;
}

function viewGames() {
  const T = GAMES_TEXT, G = gameDef().text;
  return `<div class="games">
    <div class="game-pick" role="tablist">${Object.entries(GAMES_PICK).map(([id, name]) =>
      `<button class="game-tab${id === "compare" ? " cmp-tab" : ""}" role="tab" aria-selected="${id === GAMES.which}" data-act="game-pick" data-game="${id}">${esc(name)}</button>`).join("")}</div>
    <div class="page-head">
      <span class="eyebrow">${esc(T.eyebrow)}</span>
      <h1>${esc(G.title)}</h1>
      <p class="lede">${esc(G.lede)}</p>
    </div>
    <div class="seq-stage" id="game-stage" data-game="${GAMES.which}" aria-live="polite"></div>
  </div>`;
}

function renderGames() { gameDef().render(); }

function gamePick(id) {
  if (id === GAMES.which) return;
  gamesStop();
  GAMES.which = id; lsSet("nsa-game", id);
  document.getElementById("view").innerHTML = viewGames();
  renderGames();
}

function seqRender() {
  const box = document.getElementById("game-stage");
  if (!box) return;
  const T = GAMES_TEXT;
  box.dataset.phase = SEQ.phase;
  if (SEQ.phase === "ready") {
    const best = seqBest();
    box.innerHTML = `<div class="seq-card">
      <ul class="seq-rules">${T.rules.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
      <div class="seq-start">
        ${gameCtxField()}
        <button class="btn seq-go" data-act="seq-start">${esc(T.start)}</button>
        <span class="hint">${esc(T.startHint)}</span>
      </div>
      ${best ? `<p class="hint">${esc(T.results.best)}: <b>${best.score}</b> · ${esc(T.level)} ${best.level}</p>` : ""}
      <p class="seq-touch">${esc(T.keyboardOnly)}</p>
    </div>`;
  } else if (SEQ.phase === "countdown") {
    box.innerHTML = `<div class="seq-count" id="seq-count"></div>`;
  } else if (SEQ.phase === "play") {
    box.innerHTML = `<div class="seq-hud">
        <span class="seq-level" id="seq-level"></span>
        <span class="seq-score"><span class="hint">${esc(T.score)}</span> <b id="seq-score">0</b></span>
        <span class="seq-time"><b id="seq-time">${SEQ_CONFIG.seconds}</b><span class="hint">s</span></span>
      </div>
      <div class="seq-bar"><span id="seq-bar"></span></div>
      <div class="seq-row" id="seq-row"></div>
      <button class="btn ghost small seq-restart" data-act="seq-start">${esc(T.restart)} <kbd>R</kbd></button>`;
    seqShow();
  } else if (SEQ.phase === "done") {
    box.innerHTML = seqResults(SEQ.last);
  }
}

// Draw the current sequence and the level badge.
function seqShow() {
  const row = document.getElementById("seq-row"), lv = document.getElementById("seq-level");
  if (!row) return;
  const { level } = seqLevelAt(SEQ.k), max = level === SEQ_CONFIG.levels.length;
  document.getElementById("game-stage").style.setProperty("--hue", gameHeat((level - 1) / (SEQ_CONFIG.levels.length - 1)));
  lv.innerHTML = `${esc(GAMES_TEXT.level)} <b>${level}</b>${max ? ` <span class="seq-max">${esc(GAMES_TEXT.max)}</span>` : ""}`;
  row.innerHTML = SEQ.seq.map((d, i) => seqArrow(d, i < SEQ.pos ? "hit" : "")).join("");
}

function seqClear() { SEQ.timers.forEach(clearTimeout); SEQ.timers = []; cancelAnimationFrame(SEQ.raf); }
// Leaving the page stops a run without saving it.
function seqStop() { seqClear(); if (SEQ.phase === "countdown" || SEQ.phase === "play") SEQ.phase = "ready"; }

function seqStart() {
  seqClear();
  gameCtxRead();
  SEQ.phase = "countdown";
  renderGames();
  const el = document.getElementById("seq-count");
  for (let i = 0; i <= SEQ_CONFIG.countdown; i++) {
    SEQ.timers.push(setTimeout(() => {
      if (i < SEQ_CONFIG.countdown) { el.textContent = SEQ_CONFIG.countdown - i; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
      else seqBegin();
    }, i * 1000));
  }
}

function seqBegin(seed) {
  SEQ.seed = seed == null ? Math.floor(Math.random() * 2 ** 32) : seed;
  SEQ.rnd = seqRng(SEQ.seed);
  Object.assign(SEQ, { phase: "play", k: 0, pos: 0, mistakes: 0, seqMistakes: 0, done: [] });
  SEQ.seq = seqMake(seqLevelAt(0).len, SEQ.rnd);
  SEQ.t0 = SEQ.seqT0 = performance.now();
  renderGames();
  const tick = () => {
    const left = Math.max(0, SEQ_CONFIG.seconds * 1000 - (performance.now() - SEQ.t0));
    const t = document.getElementById("seq-time"), bar = document.getElementById("seq-bar");
    if (t) t.textContent = Math.ceil(left / 1000);
    if (bar) bar.style.transform = `scaleX(${left / (SEQ_CONFIG.seconds * 1000)})`;
    if (left <= 0) seqFinish(); else SEQ.raf = requestAnimationFrame(tick);
  };
  SEQ.raf = requestAnimationFrame(tick);
}

const seqScore = () => SEQ.done.reduce((n, d) => n + d.len, 0) + SEQ.pos;

function seqInput(dir) {
  const row = document.getElementById("seq-row");
  if (dir === SEQ.seq[SEQ.pos]) {
    row?.children[SEQ.pos]?.classList.add("hit");
    SEQ.pos++;
    if (SEQ.pos === SEQ.seq.length) {
      const now = performance.now();
      SEQ.done.push({ len: SEQ.seq.length, ms: now - SEQ.seqT0, mistakes: SEQ.seqMistakes, level: seqLevelAt(SEQ.k).level });
      SEQ.k++; SEQ.pos = 0; SEQ.seqMistakes = 0; SEQ.seqT0 = now;
      SEQ.seq = seqMake(seqLevelAt(SEQ.k).len, SEQ.rnd);
      seqShow();
    }
  } else {
    SEQ.mistakes++; SEQ.seqMistakes++; SEQ.pos = 0;
    if (row) {
      [...row.children].forEach(c => c.classList.remove("hit"));
      row.classList.remove("miss"); void row.offsetWidth; row.classList.add("miss");
    }
  }
  const sc = document.getElementById("seq-score"); if (sc) sc.textContent = seqScore();
}

function seqFinish() {
  seqClear();
  const s = SEQ_CONFIG.seconds;
  const run = {
    v: 1, game: "sequence", at: new Date().toISOString(), seed: SEQ.seed, seconds: s,
    score: seqScore(), level: SEQ.done.length ? seqLevelAt(SEQ.k).level : 1,
    finished: SEQ.done.length, mistakes: SEQ.mistakes, clean: SEQ.done.filter(d => !d.mistakes).length,
    // [length, milliseconds, mistakes] for every finished sequence
    seqs: SEQ.done.map(d => [d.len, Math.round(d.ms), d.mistakes]),
    stack: gameCtxRecord()
  };
  SEQ.phase = "saving";
  // Wait for earlier runs to load, so saving never overwrites them.
  gamesLoad().then(() => {
    const prevBest = seqBest();
    run.newBest = !prevBest || run.score > prevBest.score;
    SEQ.runs.push(run);
    gamesSave();
    SEQ.last = run;
    SEQ.phase = "done";
    if (current === "games") renderGames();
  });
}

function seqResults(run) {
  const R = GAMES_TEXT.results, best = seqBest();
  const byLen = {};
  run.seqs.forEach(([len, ms]) => { (byLen[len] = byLen[len] || []).push(ms); });
  const avgs = Object.entries(byLen).map(([len, a]) => [len, a.reduce((x, y) => x + y, 0) / a.length / 1000]);
  const top = Math.max(...avgs.map(a => a[1]), 0.001);
  const pct = run.finished ? Math.round(100 * run.clean / run.finished) : 0;
  const when = gameWhen, stat = gameStat;
  const recent = realRuns(SEQ).slice(-SEQ_CONFIG.recentRuns).reverse();
  return `<div class="seq-card seq-results">
    <div class="seq-res-head"><h2>${esc(R.title)}</h2>${run.newBest && SEQ.runs.length > 1 ? `<span class="seq-best">${esc(R.newBest)}</span>` : ""}</div>
    <div class="seq-stats">
      ${stat(R.score, run.score, R.scoreSub)}
      ${stat(R.level, run.level, "")}
      ${stat(R.speed, (run.score / run.seconds).toFixed(2), R.speedSub)}
      ${stat(R.accuracy, pct + "%", R.accuracySub.replace("{mistakes}", run.mistakes))}
      ${stat(R.finished, run.finished, "")}
    </div>
    ${avgs.length ? `<div class="seq-bylen"><h3>${esc(R.byLength)}</h3>
      ${avgs.map(([len, sec]) => `<div class="seq-bl"><span>${len} arrows</span><span class="seq-bl-bar"><span style="width:${(100 * sec / top).toFixed(1)}%"></span></span><b>${sec.toFixed(2)}s</b></div>`).join("")}
    </div>` : ""}
    <div class="seq-recent"><h3>${esc(R.recent)}</h3>
      <table><tbody>${recent.map(r => `<tr${r === run ? ' class="now"' : ""}><td>${esc(when(r))}</td><td>${esc(r.stack ? r.stack.name : GAMES_TEXT.noStack)}</td><td><b>${r.score}</b></td><td>${esc(GAMES_TEXT.level)} ${r.level}</td><td>${(r.score / r.seconds).toFixed(2)}/s</td></tr>`).join("")}</tbody></table>
      ${best ? `<p class="hint">${esc(R.best)}: <b>${best.score}</b> (${esc(when(best))})</p>` : ""}
    </div>
    <div class="seq-actions">
      <button class="btn seq-go" data-act="seq-start">${esc(GAMES_TEXT.again)}</button>
      <span class="hint">${esc(GAMES_TEXT.startHint)}</span>
      <button class="linkish seq-clear" data-act="seq-clear">${esc(GAMES_TEXT.clear)}</button>
    </div>
    <p class="hint seq-note">${esc(R.note)} ${esc(R.seed)}: <code>${run.seed}</code></p>
  </div>`;
}

// Clears only the game on screen.
function gamesClearScores() {
  if (!confirm(GAMES_TEXT.clearConfirm.replace("{game}", GAMES_PICK[GAMES.which]))) return;
  Object.assign(gameDef().st, { runs: [], last: null, phase: "ready" });
  gamesSave(); renderGames();
  toast(esc(GAMES_TEXT.cleared));
}

document.addEventListener("keydown", e => {
  if (current !== "games" || e.metaKey || e.ctrlKey || e.altKey) return;
  gameDef().key(e);
});

// Keys while Sequence is on screen.
function seqKey(e) {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (SEQ.phase === "play" || SEQ.phase === "countdown") {
    if (k === "r" || k === "Escape") { e.preventDefault(); seqStart(); return; }
    const dir = ARROW_KEYS[k];
    if (dir || k === " ") e.preventDefault();
    if (dir && SEQ.phase === "play" && !e.repeat) seqInput(dir);
  } else if (k === "Enter" || (k === "r" && SEQ.phase === "done")) {
    // Enter on a focused button is already a click.
    if (k === "Enter" && e.target.closest && e.target.closest("button")) return;
    e.preventDefault(); seqStart();
  }
}
