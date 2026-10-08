// ---------------------------------------------------------------------------
// GAMES: COMPARE (#games, "Compare")
// Each game's runs with no stack vs on one chosen stack. One number per game
// (CMP_GET), its direction (CMP_TEXT.metric), and a verdict that describes the
// gap, never its cause (same rule as Tracker insights):
//   gap  = stack average − no-stack average
//   size = |gap| / pooled spread of both sides   (how big vs your normal swing)
// The first CMP_CONFIG.warmup real runs of each game are left out (learning).
// Sample runs (run.sample) are made-up demo data; they never count toward a
// game's personal best or recent runs, and can be removed in one click.
// Wording and settings: CMP_TEXT / CMP_CONFIG in content/games.js.
// ---------------------------------------------------------------------------
const CMP = { phase: "ready", stackId: null };
const CMP_GET = { sequence: r => r.score, reaction: r => r.median, timing: r => r.error };
const CMP_GAMES = Object.keys(CMP_GET);

const cmpMean = a => a.reduce((x, y) => x + y, 0) / a.length;
const cmpSd = a => a.length < 2 ? 0 : Math.sqrt(a.reduce((x, y) => x + (y - cmpMean(a)) ** 2, 0) / (a.length - 1));

// A game's runs that count: real runs after the warm-up, plus any sample runs.
function cmpRuns(game) {
  const all = (gameDefs()[game].st.runs || []).filter(r => CMP_GET[game](r) != null);
  const real = all.filter(r => !r.sample).sort((a, b) => (a.at < b.at ? -1 : 1));
  return real.slice(CMP_CONFIG.warmup).concat(all.filter(r => r.sample));
}

// Stacks that have counted runs in any game: id → { name (latest), n }.
function cmpStacks() {
  const out = {};
  CMP_GAMES.forEach(g => cmpRuns(g).forEach(r => {
    if (!r.stack) return;
    const s = out[r.stack.id] || (out[r.stack.id] = { name: r.stack.name, n: 0, at: "" });
    s.n++;
    if (r.at > s.at) { s.at = r.at; s.name = r.stack.name; }
  }));
  return out;
}

// The comparison for one game against one stack.
function cmpGame(game, stackId) {
  const runs = cmpRuns(game), get = CMP_GET[game], C = CMP_CONFIG;
  const base = runs.filter(r => !r.stack), on = runs.filter(r => r.stack && r.stack.id === stackId);
  const a = on.map(get), b = base.map(get);
  const res = { game, base, on, a, b, need: Math.max(0, C.minRuns - b.length), needOn: Math.max(0, C.minRuns - a.length) };
  if (res.need || res.needOn) return res;
  const ma = cmpMean(a), mb = cmpMean(b), gap = ma - mb;
  const pooled = Math.sqrt(((a.length - 1) * cmpSd(a) ** 2 + (b.length - 1) * cmpSd(b) ** 2) / (a.length + b.length - 2));
  const size = pooled ? Math.abs(gap) / pooled : gap ? Infinity : 0;
  const better = CMP_TEXT.metric[game].better === "higher" ? gap > 0 : gap < 0;
  const lastBase = base.reduce((m, r) => (r.at > m ? r.at : m), "");
  const after = on.filter(r => r.at > lastBase).length / on.length;
  return Object.assign(res, { ma, mb, gap, size, better, level: size < C.small ? "none" : size < C.clear ? "small" : "clear", practice: better && after >= C.practice });
}

function cmpRender() {
  const box = document.getElementById("game-stage");
  if (!box) return;
  const T = CMP_TEXT, stacks = cmpStacks(), ids = Object.keys(stacks);
  box.dataset.phase = "compare";
  if (!ids.includes(CMP.stackId)) CMP.stackId = ids.sort((x, y) => stacks[y].n - stacks[x].n)[0] || null;
  const hasSample = CMP_GAMES.some(g => (gameDefs()[g].st.runs || []).some(r => r.sample));
  box.innerHTML = `<div class="seq-card cmp">
    ${ids.length ? `<div class="seq-start">
      <div class="field"><label for="cmp-stack">${esc(T.stackLabel)}</label>
        <select id="cmp-stack">${ids.map(id => `<option value="${esc(id)}"${id === CMP.stackId ? " selected" : ""}>${esc(stacks[id].name)}</option>`).join("")}</select></div>
      ${hasSample ? `<span class="cmp-badge">${esc(T.sample.badge)}</span>` : ""}
    </div>` : `<p class="hint">${esc(T.noStacks)}</p>`}
    ${CMP.stackId ? CMP_GAMES.map(g => cmpCard(cmpGame(g, CMP.stackId), stacks[CMP.stackId].name)).join("") : ""}
    <p class="hint">${esc(T.warmup.replace("{n}", CMP_CONFIG.warmup))}</p>
    <p class="cmp-caveat">${esc(T.caveat)}</p>
    <div class="seq-actions">
      ${hasSample ? `<button class="linkish" data-act="cmp-unsample">${esc(T.sample.remove)}</button>`
        : `<button class="btn ghost small" data-act="cmp-sample">${esc(T.sample.load)}</button><span class="hint">${esc(T.sample.loadHint)}</span>`}
    </div>
  </div>`;
}

function cmpCard(c, name) {
  const T = CMP_TEXT, M = T.metric[c.game], fmt = v => Math.round(v).toLocaleString();
  let verdict;
  if (c.need || c.needOn) {
    verdict = c.need && c.needOn ? T.need.replace("{base}", c.need).replace("{stack}", c.needOn).replace("{name}", name)
      : T.needOne.replace("{n}", c.need || c.needOn).replace("{side}", c.need ? T.sideBase : T.sideStack.replace("{name}", name));
  } else {
    verdict = T.verdict[c.level].replace("{name}", name).replace("{metric}", M.name.toLowerCase())
      .replace("{dir}", c.better ? T.dir.better : T.dir.worse).replace("{a}", fmt(c.ma)).replace("{b}", fmt(c.mb)).replace("{unit}", M.unit);
  }
  // Strip plot: every counted run as a dot on one shared axis, the average as a tick.
  const all = c.a.concat(c.b);
  const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.08 || 1;
  const x = v => ((v - lo + pad) / (hi - lo + 2 * pad) * 100).toFixed(1);
  const row = (label, vals, cls) => `<div class="cmp-row ${cls}"><span class="cmp-label">${esc(label)}<span class="hint">${esc(T.runs.replace("{n}", vals.length))}</span></span>
    <span class="cmp-track">${vals.map(v => `<span class="cmp-dot" style="left:${x(v)}%" title="${fmt(v)} ${esc(M.unit)}"></span>`).join("")}
      ${vals.length ? `<span class="cmp-mean" style="left:${x(cmpMean(vals))}%" title="${esc(T.avg.replace("{v}", fmt(cmpMean(vals))))}"></span>` : ""}</span></div>`;
  return `<section class="cmp-game" data-level="${c.level || "need"}"${c.better != null ? ` data-better="${c.better}"` : ""}>
    <div class="cmp-head"><h3>${esc(GAMES_PICK[c.game])}</h3><span class="hint">${esc(M.name)} · ${esc(M.unit)} · ${esc(T.betterArrow[M.better])}</span></div>
    ${all.length ? `<div class="cmp-plot">${row(T.noStack, c.b, "base")}${row(name, c.a, "on")}
      <div class="cmp-axis"><span>${fmt(lo)}</span><span>${fmt(hi)} ${esc(M.unit)}</span></div></div>` : ""}
    <p class="cmp-verdict">${esc(verdict)}</p>
    ${c.practice ? `<p class="cmp-warn">${esc(T.practice)}</p>` : ""}
  </section>`;
}

// Made-up runs for the demo: alternating days over the last 16 days, seeded (CMP_CONFIG.sampleSeed) so every demo looks the same.
// Deliberately mixed: Sequence clearly better, Threshold a little better, Reaction about the same.
function cmpSampleRuns(seed) {
  const n = CMP_CONFIG.sampleRuns, day = 864e5, start = Date.now() - 2 * n * day;
  const rnd = seqRng(seed), norm = (m, s) => m + s * Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
  const stack = { id: "sample", name: CMP_TEXT.sample.stackName, saved: true }, out = { sequence: [], reaction: [], timing: [] };
  for (let i = 0; i < 2 * n; i++) {
    const on = i % 2 === 1, at = new Date(start + i * day + 9 * 36e5).toISOString(), base = { v: 1, at, sample: true, stack: on ? stack : null };
    const score = Math.round(norm(on ? 101 : 94, 9));
    out.sequence.push({ ...base, game: "sequence", seed: 0, seconds: 60, score, level: Math.min(7, 1 + Math.floor(score / 18)), finished: Math.floor(score / 6), mistakes: 2, clean: Math.floor(score / 8), seqs: [] });
    const trials = Array.from({ length: 10 }, () => Math.round(norm(on ? 248 : 250, 22)));
    out.reaction.push({ ...base, game: "reaction", trials, early: 0, median: rtMedian(trials), mean: Math.round(cmpMean(trials)), best: Math.min(...trials), sd: Math.round(cmpSd(trials)), slow: 0 });
    const error = Math.round(norm(on ? 37.5 : 40, 4));
    out.timing.push({ ...base, v: 2, game: "timing", tries: [], points: Math.round(norm(on ? 1650 : 1500, 150)), peak: Math.round(norm(on ? 15 : 14, 2)), end: 12, bestStreak: 6, error, median: error, bias: 3, perfect: 6, good: 10, miss: 5, noPress: 0, closest: null, elite: { seen: 0, hit: 0 } });
  }
  return out;
}
function cmpLoadSample() {
  gamesLoad().then(() => {
    const runs = cmpSampleRuns(CMP_CONFIG.sampleSeed);
    CMP_GAMES.forEach(g => { gameDefs()[g].st.runs.push(...runs[g]); });
    gamesSave(); cmpRender();
  });
}
function cmpRemoveSample() {
  CMP_GAMES.forEach(g => { const st = gameDefs()[g].st; st.runs = (st.runs || []).filter(r => !r.sample); });
  gamesSave(); cmpRender();
}

document.addEventListener("change", e => { if (e.target.id === "cmp-stack") { CMP.stackId = e.target.value; cmpRender(); } });
