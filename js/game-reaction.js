// ---------------------------------------------------------------------------
// GAMES: REACTION (#games, "Reaction")
// A black pad turns white after a random wait; click it, tap it or press Space.
// RT_CONFIG.trials responses make a run. Pressing during the wait, or faster than
// RT_CONFIG.tooFast, is a false start and that try is redone. Score = median ms.
// Timing: the clock starts in the animation frame that paints white, and stops at
// the input event's timeStamp (same clock as performance.now). Screen and mouse
// delay are included, so only runs on the same device compare.
// Wording and tuning: content/games.js. Scope: docs/games/reaction-game.md
// ---------------------------------------------------------------------------
const RT = { phase: "ready", pad: "idle", trials: [], early: 0, t0: 0, timers: [], raf: 0, runs: null, last: null };

const rtMedian = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; };
const rtSd = a => { if (a.length < 2) return 0; const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
const rtBest = () => (RT.runs || []).reduce((b, r) => (!b || r.median < b.median ? r : b), null);

function rtRender() {
  const box = document.getElementById("game-stage");
  if (!box) return;
  const T = RT_TEXT, G = GAMES_TEXT;
  box.dataset.phase = RT.phase;
  if (RT.phase === "ready") {
    const best = rtBest();
    box.innerHTML = `<div class="seq-card">
      <ul class="seq-rules">${T.rules.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
      <div class="seq-start">
        ${gameCtxField()}
        <button class="btn seq-go" data-act="rt-start">${esc(G.start)}</button>
        <span class="hint">${esc(G.startHint)}</span>
      </div>
      ${best ? `<p class="hint">${esc(T.results.personalBest)}: <b>${Math.round(best.median)} ms</b></p>` : ""}
    </div>`;
  } else if (RT.phase === "play") {
    box.innerHTML = `<div class="rt-pad" id="rt-pad" data-pad="idle" role="button" aria-label="${esc(T.now)}">
        <span class="rt-msg" id="rt-msg">${esc(T.get)}</span>
        <span class="rt-count" id="rt-count"></span>
      </div>
      <button class="btn ghost small seq-restart" data-act="rt-start">${esc(G.restart)} <kbd>R</kbd></button>`;
    document.getElementById("rt-pad").addEventListener("pointerdown", e => { if (e.button === 0) { e.preventDefault(); rtPress(e.timeStamp); } });
    rtCount();
  } else if (RT.phase === "done") {
    box.innerHTML = rtResults(RT.last);
  }
}

function rtSet(pad, msg) {
  RT.pad = pad;
  const p = document.getElementById("rt-pad"), m = document.getElementById("rt-msg");
  if (p) p.dataset.pad = pad;
  if (m) m.textContent = msg;
}
function rtCount() {
  const c = document.getElementById("rt-count");
  if (c) c.textContent = RT_TEXT.of.replace("{n}", Math.min(RT.trials.length + 1, RT_CONFIG.trials)).replace("{total}", RT_CONFIG.trials);
}
function rtClear() { RT.timers.forEach(clearTimeout); RT.timers = []; cancelAnimationFrame(RT.raf); }
function rtStop() { rtClear(); if (RT.phase === "play") RT.phase = "ready"; }
const rtLater = (fn, ms) => RT.timers.push(setTimeout(fn, ms));

function rtStart() {
  rtClear();
  gameCtxRead();
  Object.assign(RT, { phase: "play", pad: "idle", trials: [], early: 0, t0: 0 });
  rtRender();
  rtLater(rtNext, RT_CONFIG.pause);
}

// Black, then white after a random wait.
function rtNext() {
  const C = RT_CONFIG;
  rtSet("wait", RT_TEXT.wait); rtCount();
  rtLater(() => {
    RT.t0 = 0;
    rtSet("go", RT_TEXT.now);
    RT.raf = requestAnimationFrame(t => { RT.t0 = t; });
  }, C.waitMin + Math.random() * (C.waitMax - C.waitMin));
}

function rtPress(ts) {
  const C = RT_CONFIG;
  if (RT.phase !== "play") return;
  if (RT.pad === "wait" || (RT.pad === "go" && (!RT.t0 || ts - RT.t0 < C.tooFast))) {
    rtClear(); RT.early++;
    rtSet("early", RT_TEXT.early);
    rtLater(rtNext, C.pause * 1.5);
  } else if (RT.pad === "go") {
    const ms = Math.round(ts - RT.t0);
    RT.trials.push(ms);
    rtSet("shown", RT_TEXT.ms.replace("{ms}", ms));
    rtLater(RT.trials.length >= C.trials ? rtFinish : rtNext, C.pause);
  }
}

function rtFinish() {
  rtClear();
  const a = RT.trials;
  const run = {
    v: 1, game: "reaction", at: new Date().toISOString(),
    trials: [...a], early: RT.early,
    median: rtMedian(a), mean: Math.round(a.reduce((x, y) => x + y, 0) / a.length), best: Math.min(...a),
    sd: Math.round(rtSd(a)), slow: a.filter(x => x > RT_CONFIG.slow).length,
    stack: gameCtxRecord()
  };
  RT.phase = "saving";
  gamesLoad().then(() => {
    const prev = rtBest();
    run.newBest = !prev || run.median < prev.median;
    RT.runs.push(run);
    gamesSave();
    RT.last = run;
    RT.phase = "done";
    if (current === "games" && GAMES.which === "reaction") rtRender();
  });
}

function rtResults(run) {
  const R = RT_TEXT.results, G = GAMES_TEXT, best = rtBest(), C = RT_CONFIG;
  const top = Math.max(...run.trials, C.slow);
  const recent = (RT.runs || []).slice(-C.recentRuns).reverse();
  return `<div class="seq-card seq-results">
    <div class="seq-res-head"><h2>${esc(G.results.title)}</h2>${run.newBest && RT.runs.length > 1 ? `<span class="seq-best">${esc(G.results.newBest)}</span>` : ""}</div>
    <div class="seq-stats">
      ${gameStat(R.median, Math.round(run.median), R.medianSub)}
      ${gameStat(R.best, run.best, R.bestSub)}
      ${gameStat(R.spread, "±" + run.sd, R.spreadSub)}
      ${gameStat(R.slow, run.slow, R.slowSub.replace("{ms}", C.slow))}
      ${gameStat(R.early, run.early, R.earlySub)}
    </div>
    <div class="seq-bylen"><h3>${esc(R.trials)}</h3>
      <div class="rt-trials" style="--slow:${(C.slow / top).toFixed(3)}">${run.trials.map((ms, i) => `<div class="rt-trial${ms > C.slow ? " slow" : ""}" title="${i + 1}: ${ms} ms"><span style="height:${(100 * ms / top).toFixed(1)}%"></span><i>${ms}</i></div>`).join("")}</div>
    </div>
    <div class="seq-recent"><h3>${esc(G.results.recent)}</h3>
      <table><tbody>${recent.map(r => `<tr${r === run ? ' class="now"' : ""}><td>${esc(gameWhen(r))}</td><td>${esc(r.stack ? r.stack.name : G.noStack)}</td><td><b>${Math.round(r.median)} ms</b></td><td>${r.best} ms</td><td>${r.early} early</td></tr>`).join("")}</tbody></table>
      ${best ? `<p class="hint">${esc(R.personalBest)}: <b>${Math.round(best.median)} ms</b> (${esc(gameWhen(best))})</p>` : ""}
    </div>
    <div class="seq-actions">
      <button class="btn seq-go" data-act="rt-start">${esc(G.again)}</button>
      <span class="hint">${esc(G.startHint)}</span>
      <button class="linkish seq-clear" data-act="seq-clear">${esc(G.clear)}</button>
    </div>
    <p class="hint seq-note">${esc(G.results.note)}</p>
  </div>`;
}

// Keys while Reaction is on screen (called from the Games keydown handler).
function rtKey(e) {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (RT.phase === "play") {
    if (k === "r" || k === "Escape") { e.preventDefault(); rtStart(); return; }
    if (k === " ") { e.preventDefault(); if (!e.repeat) rtPress(e.timeStamp); }
  } else if (k === "Enter" || (k === "r" && RT.phase === "done")) {
    if (k === "Enter" && e.target.closest && e.target.closest("button")) return;
    e.preventDefault(); rtStart();
  }
}
