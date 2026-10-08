// ---------------------------------------------------------------------------
// GAMES: THRESHOLD (#games, "Threshold")
// A marker sweeps left to right across a bar; press Space or click when it's in
// the zone. The zone's centre is a target time (centre × sweep); a try scores by
// how close the press lands to it, early or late alike:
//   closeness = 100 × (1 − |press − target| / half the zone), never below 0
//   points    = closeness × (1 + level × SS_CONFIG.bonus)
// The signed error is recorded too (early < 0 < late) but not scored.
// Elite zones: a rare SS_CONFIG.elite.zone-ms zone, gated on level and Perfects in a row.
// The zone is drawn at SS_CONFIG.drawScale × the scored window; scoring never uses the drawn size.
// Smart ramp: SS.step climbs on hits (two at a time on a long streak) and drops
// on misses; each step is a slightly faster sweep and a slightly smaller zone.
// Timing: the sweep starts at its first animation frame; a press is the input
// event's timeStamp. The marker is drawn one frame ahead, so what's on screen
// matches the clock, and it freezes where it is the moment you press.
// Wording and tuning: content/games.js. Scope: docs/games/threshold-game.md
// ---------------------------------------------------------------------------
const SS = { phase: "ready", k: 0, step: 0, streak: 0, perfectRun: 0, tries: [], cur: null, state: "idle", t0: 0, frame: 16.7, prevFrame: 0, bestStreak: 0, barW: 0, timers: [], raf: 0, runs: null };

const ssSteps = () => SS_CONFIG.ladder.steps;
const ssBest = () => realRuns(SS).reduce((b, r) => (!b || r.points > b.points ? r : b), null);
const ssMean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const ssFmt = ms => Math.round(ms).toLocaleString();

// Sweep time and zone size at a ladder step, easing geometrically from Start to End.
function ssRung(step) {
  const L = SS_CONFIG.ladder, f = step / (L.steps - 1);
  return { sweep: L.sweepStart * (L.sweepEnd / L.sweepStart) ** f, zone: L.zoneStart * (L.zoneEnd / L.zoneStart) ** f };
}

// Can an elite zone spawn now? Level and Perfects-in-a-row gates; the chance is rolled in ssMakeTry.
const ssEliteOpen = (step, perfectRun) => step + 1 >= SS_CONFIG.elite.fromLevel && perfectRun >= SS_CONFIG.elite.perfectsInRow;

// One try at a step: sweep, zone size (jittered, or elite) and centre, all in ms on the sweep's clock.
// The centre range keeps the *drawn* zone inside the bar.
function ssMakeTry(step, rnd, eliteOpen) {
  const C = SS_CONFIG, r = ssRung(step), elite = !!eliteOpen && rnd() < C.elite.chance;
  const good = elite ? C.elite.zone : r.zone * (1 + (rnd() * 2 - 1) * C.jitter), half = good * Math.max(1, C.drawScale) / r.sweep / 2;
  const lo = Math.max(C.centerFrom, half), hi = Math.min(C.centerTo, 1 - half);
  const center = lo + rnd() * Math.max(0, hi - lo);
  return { step, level: step + 1, sweep: r.sweep, good, perfect: good * C.perfect, center, target: center * r.sweep, elite };
}

// Closeness, grade and points for a press `err` ms from the target (sign ignored).
function ssScore(err, t) {
  const a = Math.abs(err), half = t.good / 2, close = Math.max(0, 100 * (1 - a / half));
  return { close, pts: Math.round(close * (1 + (t.step || 0) * SS_CONFIG.bonus) * (t.elite ? SS_CONFIG.elite.bonus : 1)), grade: a <= t.perfect / 2 ? "perfect" : a <= half ? "good" : "miss" };
}

// The smart ramp: next step and streak after a try. Missing an elite zone changes nothing.
function ssClimb(step, streak, hit, elite) {
  const C = SS_CONFIG;
  if (!hit && elite) return { step, streak };
  if (!hit) return { step: Math.max(0, step - C.down), streak: 0 };
  streak++;
  return { step: Math.min(ssSteps() - 1, step + (streak >= C.streakBoost ? 2 : 1)), streak };
}

function ssRender() {
  const box = document.getElementById("game-stage");
  if (!box) return;
  const T = SS_TEXT, G = GAMES_TEXT;
  box.dataset.phase = SS.phase;
  if (SS.phase === "ready") {
    const best = ssBest();
    box.style.setProperty("--hue", gameHeat(0));
    box.innerHTML = `<div class="seq-card">
      <ul class="seq-rules">${T.rules.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
      <div class="seq-start">
        ${gameCtxField()}
        <button class="btn seq-go" data-act="ss-start">${esc(G.start)}</button>
        <span class="hint">${esc(G.startHint)}</span>
      </div>
      ${best ? `<p class="hint">${esc(T.results.personalBest)}: <b>${ssFmt(best.points)}</b> · ${esc(G.level)} ${best.peak}</p>` : ""}
    </div>`;
  } else if (SS.phase === "play") {
    box.innerHTML = `<div class="seq-hud">
        <span class="seq-level" id="ss-level"></span>
        <span class="ss-streak" id="ss-streak"></span>
        <span class="seq-score"><span class="hint">${esc(T.results.points)}</span> <b id="ss-points">0</b></span>
        <span class="rt-count ss-count" id="ss-count"></span>
      </div>
      <div class="ss-area" id="ss-area" role="button" aria-label="${esc(T.press)}">
        <p class="ss-elite-tag" id="ss-elite">&nbsp;</p>
        <div class="ss-bar" id="ss-bar"><div class="ss-zone" id="ss-zone"><span class="ss-perfect" id="ss-perfect"></span></div><span class="ss-marker" id="ss-marker"></span></div>
        <div class="ss-result" id="ss-result"><p>&nbsp;</p><p class="hint">&nbsp;</p></div>
      </div>
      <button class="btn ghost small seq-restart" data-act="ss-start">${esc(G.restart)} <kbd>R</kbd></button>`;
    document.getElementById("ss-area").addEventListener("pointerdown", e => { if (e.button === 0) { e.preventDefault(); ssPress(e.timeStamp); } });
  } else if (SS.phase === "done") {
    box.innerHTML = ssResults(SS.lastRun);
  }
}

function ssClear() { SS.timers.forEach(clearTimeout); SS.timers = []; cancelAnimationFrame(SS.raf); }
function ssStop() { ssClear(); if (SS.phase === "play") SS.phase = "ready"; }

function ssStart() {
  ssClear();
  gameCtxRead();
  Object.assign(SS, { phase: "play", k: 0, step: 0, streak: 0, bestStreak: 0, perfectRun: 0, tries: [] });
  ssRender();
  ssNext();
}

// Draw the next zone with the marker parked at the left, then sweep.
function ssNext() {
  const t = SS.cur = ssMakeTry(SS.step, Math.random, ssEliteOpen(SS.step, SS.perfectRun)), T = SS_TEXT;
  const zone = document.getElementById("ss-zone"), perf = document.getElementById("ss-perfect"), bar = document.getElementById("ss-bar");
  if (!bar) return;
  const w = t.good * SS_CONFIG.drawScale / t.sweep, pw = t.perfect / t.good;
  zone.style.left = `${(t.center - w / 2) * 100}%`; zone.style.width = `${w * 100}%`;
  perf.style.left = `${(1 - pw) / 2 * 100}%`; perf.style.width = `${pw * 100}%`;
  bar.dataset.grade = "";
  bar.classList.toggle("elite", t.elite);
  document.getElementById("ss-elite").innerHTML = t.elite ? esc(T.elite.replace("{ms}", Math.round(t.good))) : "&nbsp;";
  SS.barW = bar.getBoundingClientRect().width;
  document.getElementById("game-stage").style.setProperty("--hue", gameHeat(t.step / (ssSteps() - 1)));
  document.getElementById("ss-level").innerHTML = `${esc(GAMES_TEXT.level)} <b>${t.level}</b>`;
  document.getElementById("ss-count").textContent = T.of.replace("{n}", SS.k + 1).replace("{total}", SS_CONFIG.tries);
  ssStreak();
  document.getElementById("ss-result").innerHTML = `<p>&nbsp;</p><p class="hint">&nbsp;</p>`;
  ssMarker(0);
  SS.state = "lead"; SS.t0 = 0; SS.prevFrame = 0;
  SS.timers.push(setTimeout(() => {
    SS.state = "sweep";
    const step = now => {
      if (!SS.t0) SS.t0 = now;
      // Average frame length, so the marker can be drawn where it will be when the frame shows.
      if (SS.prevFrame) SS.frame = SS.frame * 0.8 + Math.min(now - SS.prevFrame, 50) * 0.2;
      SS.prevFrame = now;
      const el = now - SS.t0;
      if (el >= t.sweep) { ssMarker(1); ssDone(null); return; }
      ssMarker(Math.min((el + SS.frame) / t.sweep, 1));
      SS.raf = requestAnimationFrame(step);
    };
    SS.raf = requestAnimationFrame(step);
  }, SS_CONFIG.lead));
}
function ssMarker(p) { const m = document.getElementById("ss-marker"); if (m) m.style.transform = `translateX(${p * SS.barW}px)`; }
function ssStreak() {
  const el = document.getElementById("ss-streak");
  if (!el) return;
  el.innerHTML = SS.streak >= 2 ? `${esc(SS_TEXT.streak)} <b>${SS.streak}</b>` : "";
  el.classList.toggle("hot", SS.streak >= SS_CONFIG.streakBoost);
}

function ssPress(ts) {
  if (SS.phase !== "play" || SS.state !== "sweep" || !SS.t0) return;
  ssDone(ts - SS.t0 - SS.cur.target);   // the marker stays exactly where it is
}

// Record a try: err is the signed miss in ms (null = no press before the sweep ended).
function ssDone(err) {
  cancelAnimationFrame(SS.raf);
  SS.state = "shown";
  const t = SS.cur, T = SS_TEXT, s = err == null ? { pts: 0, grade: "miss" } : ssScore(err, t);
  SS.tries.push({ level: t.level, sweep: Math.round(t.sweep), good: Math.round(t.good), target: Math.round(t.target), err: err == null ? null : Math.round(err), pts: s.pts, grade: s.grade, elite: t.elite });
  const bar = document.getElementById("ss-bar"), res = document.getElementById("ss-result");
  if (bar) { bar.dataset.grade = ""; void bar.offsetWidth; bar.dataset.grade = err == null ? "none" : s.grade; }
  if (res) {
    res.dataset.grade = err == null ? "none" : s.grade;
    res.innerHTML = err == null ? `<p>${esc(T.none)}</p><p class="hint">&nbsp;</p>`
      : `<p><b>${esc(T[s.grade])}</b> · ${esc(T.off.replace("{ms}", Math.round(Math.abs(err))))}${s.pts ? ` · +${s.pts}` : ""}</p>
         <p class="hint">${esc(T.targetYou.replace("{target}", ssFmt(t.target)).replace("{you}", ssFmt(t.target + err)))}</p>`;
  }
  const pts = document.getElementById("ss-points"); if (pts) pts.textContent = ssFmt(SS.tries.reduce((n, x) => n + x.pts, 0));
  Object.assign(SS, ssClimb(SS.step, SS.streak, s.grade !== "miss", t.elite));
  SS.perfectRun = s.grade === "perfect" ? SS.perfectRun + 1 : 0;
  SS.bestStreak = Math.max(SS.bestStreak, SS.streak);
  ssStreak();
  SS.k++;
  SS.timers.push(setTimeout(SS.k >= SS_CONFIG.tries ? ssFinish : ssNext, SS_CONFIG.after));
}

function ssFinish() {
  ssClear();
  const tries = SS.tries, hit = tries.filter(x => x.err != null), abs = hit.map(x => Math.abs(x.err));
  const closest = hit.reduce((b, x) => (!b || Math.abs(x.err) < Math.abs(b.err) ? x : b), null);
  const run = {
    v: 2, game: "timing", at: new Date().toISOString(),
    // [level, sweep ms, zone ms, target ms, signed error ms or null, points, 1 if elite] for every try
    tries: tries.map(x => [x.level, x.sweep, x.good, x.target, x.err, x.pts, x.elite ? 1 : 0]),
    elite: { seen: tries.filter(x => x.elite).length, hit: tries.filter(x => x.elite && x.grade !== "miss").length },
    points: tries.reduce((n, x) => n + x.pts, 0),
    peak: Math.max(...tries.map(x => x.level)), end: SS.step + 1, bestStreak: SS.bestStreak,
    error: Math.round(ssMean(abs)), median: rtMedian(abs), bias: Math.round(ssMean(hit.map(x => x.err))),
    perfect: tries.filter(x => x.grade === "perfect").length, good: tries.filter(x => x.grade === "good").length,
    miss: tries.filter(x => x.grade === "miss").length, noPress: tries.length - hit.length,
    closest: closest ? { level: closest.level, target: closest.target, err: closest.err } : null,
    stack: gameCtxRecord()
  };
  SS.phase = "saving";
  gamesLoad().then(() => {
    const prev = ssBest();
    run.newBest = !prev || run.points > prev.points;
    SS.runs.push(run);
    gamesSave();
    SS.lastRun = run;
    SS.phase = "done";
    if (current === "games" && GAMES.which === "timing") ssRender();
  });
}

function ssResults(run) {
  const R = SS_TEXT.results, G = GAMES_TEXT, T = SS_TEXT, best = ssBest(), max = ssSteps();
  const biasSub = Math.abs(run.bias) < 5 ? R.biasNone : run.bias < 0 ? R.biasEarly : R.biasLate;
  const recent = realRuns(SS).slice(-SS_CONFIG.recentRuns).reverse();
  const c = run.closest;
  const gradeOf = (lv, good, err) => err == null ? "none" : ssScore(err, { good, perfect: good * SS_CONFIG.perfect, step: lv - 1 }).grade;
  return `<div class="seq-card seq-results">
    <div class="seq-res-head"><h2>${esc(G.results.title)}</h2>${run.newBest && SS.runs.length > 1 ? `<span class="seq-best">${esc(G.results.newBest)}</span>` : ""}</div>
    <div class="seq-stats">
      ${gameStat(R.points, ssFmt(run.points), R.pointsSub)}
      ${gameStat(R.peak, run.peak, R.peakSub.replace("{max}", max))}
      ${gameStat(R.streak, run.bestStreak, R.streakSub)}
      ${gameStat(R.error, run.error, R.errorSub)}
      ${gameStat(R.bias, `${Math.abs(run.bias)} ms`, biasSub)}
    </div>
    ${run.elite && run.elite.seen ? `<p class="ss-elite-sum">${esc(R.elite.replace("{hit}", run.elite.hit).replace("{seen}", run.elite.seen))}</p>` : ""}
    ${c ? `<p class="ss-closest">${esc(R.closest.replace("{ms}", Math.abs(c.err)).replace("{target}", ssFmt(c.target)).replace("{you}", ssFmt(c.target + c.err)).replace("{level}", c.level))}</p>` : ""}
    ${ssCloseChart(run)}
    <div><h3>${esc(R.ladder)}</h3>
      <div class="ss-ladder">${run.tries.map(([lv, , good, target, err, pts], i) => `<span class="ss-rung ${gradeOf(lv, good, err)}" style="height:${(100 * lv / max).toFixed(1)}%;--hue:${gameHeat((lv - 1) / (max - 1))}" title="${i + 1}: ${esc(G.level)} ${lv}, ${err == null ? esc(T.none) : esc(T.off.replace("{ms}", Math.abs(err)))}"></span>`).join("")}</div>
    </div>
    <details class="ss-every"><summary>${esc(R.every)}</summary>
      <table><thead><tr>${R.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>
        ${run.tries.map(([lv, , good, target, err, pts], i) => `<tr class="${gradeOf(lv, good, err)}"><td>${i + 1}</td><td>${lv}</td><td>${good} ms</td><td>${ssFmt(target)}</td><td>${err == null ? "–" : ssFmt(target + err)}</td><td>${err == null ? esc(T.none) : (err < 0 ? "−" : "+") + Math.abs(err)}</td><td>${pts}</td></tr>`).join("")}
      </tbody></table>
    </details>
    <div class="seq-recent"><h3>${esc(G.results.recent)}</h3>
      <table><tbody>${recent.map(r => `<tr${r === run ? ' class="now"' : ""}><td>${esc(gameWhen(r))}</td><td>${esc(r.stack ? r.stack.name : G.noStack)}</td><td><b>${ssFmt(r.points)}</b></td><td>${esc(R.recentPeak.replace("{n}", r.peak))}</td><td>${r.error} ms</td></tr>`).join("")}</tbody></table>
      ${best ? `<p class="hint">${esc(R.personalBest)}: <b>${ssFmt(best.points)}</b> (${esc(gameWhen(best))})</p>` : ""}
    </div>
    <div class="seq-actions">
      <button class="btn seq-go" data-act="ss-start">${esc(G.again)}</button>
      <span class="hint">${esc(G.startHint)}</span>
      <button class="linkish seq-clear" data-act="seq-clear">${esc(G.clear)}</button>
    </div>
    <p class="hint seq-note">${esc(G.results.note)}</p>
  </div>`;
}

// One column per try: the target is the middle line, the press a dot (late above, early below),
// the try's zone a band behind it. The scale fits the biggest zone with room to spare;
// presses beyond it are pinned to the edge.
function ssCloseChart(run) {
  const R = SS_TEXT.results, T = SS_TEXT, P = SS_CONFIG.perfect;
  const scale = Math.max(...run.tries.map(x => x[2] / 2)) * 1.5;
  const y = ms => 50 - Math.max(-1, Math.min(1, ms / scale)) * 50;
  return `<div><h3>${esc(R.close)}</h3>
    <div class="ss-close">
      <span class="ss-axis late">${esc(R.late)} ↑</span><span class="ss-axis mid">${esc(R.target)}</span><span class="ss-axis early">${esc(R.early)} ↓</span>
      <div class="ss-cols">${run.tries.map(([lv, , good, target, err, , elite], i) => {
        const g = ssScore(err || 0, { good, perfect: good * P }).grade, out = err != null && Math.abs(err) > scale;
        return `<div class="ss-col${elite ? " elite" : ""}" title="${i + 1}: ${esc(T.targetYou.replace("{target}", ssFmt(target)).replace("{you}", err == null ? "–" : ssFmt(target + err)))}">
          <span class="ss-band" style="top:${y(good / 2)}%;bottom:${100 - y(-good / 2)}%"></span>
          <span class="ss-band hi" style="top:${y(good * P / 2)}%;bottom:${100 - y(-good * P / 2)}%"></span>
          ${err == null ? `<span class="ss-dot none" style="top:50%">×</span>` : `<span class="ss-dot ${g}${out ? " out" : ""}" style="top:${y(err)}%"></span>`}
        </div>`; }).join("")}</div>
    </div>
    <p class="hint">${esc(R.closeHint)}</p>
  </div>`;
}

// Keys while Threshold is on screen.
function ssKey(e) {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (SS.phase === "play") {
    if (k === "r" || k === "Escape") { e.preventDefault(); ssStart(); return; }
    if (k === " ") { e.preventDefault(); if (!e.repeat) ssPress(e.timeStamp); }
  } else if (k === "Enter" || (k === "r" && SS.phase === "done")) {
    if (k === "Enter" && e.target.closest && e.target.closest("button")) return;
    e.preventDefault(); ssStart();
  }
}
