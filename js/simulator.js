// ---------------------------------------------------------------------------
// VIEWS: SIMULATOR (#sim)
// All six assembly lines from neurotransmitters.js, drawn side by side, with the
// chosen stack running through them as dots:
//   blood → blood-brain barrier (LAT1 doorway shared by the "lat1" amino acids,
//   or the supplement's own route) → a rail above its line → the step where it
//   joins (supplement-links / path "from") → along the line → the neurotransmitter.
// The slowest step ("rl" in the path) is a valve with a fixed throughput, and
// LAT1 is one door with a fixed throughput shared by everything that uses it,
// including competing amino acids from a protein meal. Numbers are in
// SIM_TEXT.model (content/simulator.js); wording too.
// This is an illustration of the mechanism, not a prediction.
// ---------------------------------------------------------------------------
const SIM_LINES = ["dopamine", "norepinephrine", "serotonin", "acetylcholine", "glutamate", "gaba"];
const SIM_G = { W: 1200, top: 64, rowH: 132, pillX: 18, pillW: 150, wallX: 226, wallW: 24, x0: 380, x1: 1130, speed: 170 };
const SIM = { raf: 0, last: 0, t: 0, run: true, model: null, svg: null, pool: [] };

function viewSim() {
  const T = SIM_TEXT, st = active();
  return `<div class="sim">
    <div class="page-head">
      <span class="eyebrow">${esc(T.eyebrow)}</span>
      <h1>${esc(T.title)}</h1>
      <p class="lede">${esc(T.lede)}</p>
      <p class="sim-disclaimer">${esc(T.disclaimer)}</p>
    </div>
    <div class="sim-bar">
      <div class="field"><label for="sim-stack">${esc(T.stackLabel)}</label>
        <select id="sim-stack">${App.stacks.map(s => `<option value="${s.id}"${s.id === st.id ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select></div>
      <button class="btn ghost small" data-act="sim-play" id="sim-play">${esc(T.pause)}</button>
      <a href="#stack" data-go="stack" class="sim-edit">${esc(T.edit)}</a>
    </div>
    <div class="sim-stage" id="sim-stage"></div>
    <p class="sim-note" id="sim-note"></p>
    <div class="sim-cols">
      <section class="sim-panel"><h2>${esc(T.warningsTitle)}</h2><div id="sim-warn"></div></section>
      <section class="sim-panel"><h2>${esc(T.legendTitle)}</h2>
        <dl class="sim-legend">${T.legend.map(([k, txt]) => `<div><dt><span class="sim-key sim-key-${k}" aria-hidden="true"></span></dt><dd>${esc(txt)}</dd></div>`).join("")}</dl>
      </section>
    </div>
    <section class="sim-panel sim-sources"><h2>${esc(T.sourcesTitle)}</h2><p class="hint">${esc(T.sourcesIntro)}</p>
      <ol>${T.sources.map(([claim, cite, url]) => `<li>${esc(claim)} <span class="cite">${url ? `<a href="${url}" target="_blank" rel="noopener">${esc(cite)}</a>` : esc(cite)}</span></li>`).join("")}</ol>
    </section>
  </div>`;
}

// Build the model for one stack: geometry for every line, entry points, gates, and the dot sources.
function simModel(st) {
  const G = SIM_G, M = SIM_TEXT.model, items = st.items.filter(i => byId[i.sid]);
  const has = id => items.some(i => sameGroup(i.sid, id));
  const lines = SIM_LINES.map((id, r) => {
    const nt = ntById[id], path = nt.path, y = G.top + 40 + r * G.rowH;
    const xs = path.map((_, k) => G.x0 + k * (G.x1 - G.x0) / (path.length - 1));
    const fin = path.findIndex(p => p.final), rl = path.findIndex(p => p.rl);
    return { id, nt, path, y, xs, fin, rl, entries: [], arrivals: [], valve: rl >= 0 ? { x: xs[rl] - 40, y, cap: M.valveCapacity, tokens: 0, queue: [] } : null };
  });
  // Every unique supplement in the stack: total dose, and where it joins each line
  const sids = [...new Set(items.map(i => i.sid))];
  const lat1 = { x: G.wallX, y: (lines[0].y + lines[2].y) / 2, cap: M.lat1Capacity, tokens: 0, queue: [] };
  const sources = [], mods = {};
  sids.forEach(sid => {
    const s = byId[sid], dose = items.filter(i => i.sid === sid).reduce((a, i) => a + (+i.dose || 0), 0);
    const ab = Math.min(...items.filter(i => i.sid === sid).map(i => absorb(i, st).factor));
    const entries = [];
    lines.forEach(L => L.path.forEach((p, k) => { if (k <= L.fin && (p.from || []).some(f => sameGroup(f, sid))) entries.push({ L, k }); }));
    entries.forEach(e => e.L.entries.push({ sid, k: e.k, bypass: e.L.rl >= 0 && e.k > e.L.rl }));
    // Modulators (not raw materials or cofactors) are listed on the lines they act on
    MAP.filter(r => r[0] === sid && ROLE_WEIGHT[r[2]] > 0 && r[2] !== "precursor").forEach(r => (mods[r[1]] = mods[r[1]] || []).push(`${s.name} · ${ROLE[r[2]]}`));
    if (!entries.length) return;
    const mid = (s.dose[0] + s.dose[1]) / 2, ratio = Math.max(0.4, Math.min(M.maxDoseFactor, dose / mid));
    sources.push({ sid, s, dose, above: dose > s.dose[1], lat1: s.tags.includes("lat1"), entries, rate: M.dotsPerSecond * ratio * Math.max(0.3, ab), acc: 0, rr: 0, foodHit: ab < 0.85 });
  });
  // Pills in the blood column: amino acids that use LAT1 first, then the rest
  sources.sort((a, b) => b.lat1 - a.lat1);
  sources.forEach((src, k) => { src.y = G.top + 30 + k * 40; });
  // Own-route doors on the rows that need one
  lines.forEach(L => { L.door = L.entries.some(e => !byId[e.sid].tags.includes("lat1")) ? { x: G.wallX, y: L.y - 34 } : null; });
  const protein = sources.some(s => s.lat1 && s.foodHit) ? { y: G.top + 30 + sources.length * 40 + 6, rate: M.proteinDots, acc: 0 } : null;
  const H = Math.max(lines[5].y + 92, (protein ? protein.y : sources.length * 40 + G.top) + 40);
  return { st, lines, sources, lat1, protein, mods, H, dots: [], has };
}

// SVG for everything that doesn't move.
function simStatic(m) {
  const G = SIM_G, T = SIM_TEXT, hue = id => PS_HUE[id] || "#8aa4ff";
  const txt = (x, y, s, cls = "", anchor = "start") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(s)}</text>`;
  let out = `<rect x="0" y="0" width="${G.W}" height="${m.H}" class="sim-bg"/>`;
  out += txt(G.pillX, 32, T.blood, "sim-zone") + txt(G.x0 - 30, 32, T.brain, "sim-zone");
  // Blood-brain barrier with the shared LAT1 doorway and any own-route doors
  out += `<rect x="${G.wallX}" y="44" width="${G.wallW}" height="${m.H - 60}" class="sim-wall"/>`;
  out += `<text class="sim-wall-label" transform="translate(${G.wallX + G.wallW / 2 + 4} ${m.H - 24}) rotate(-90)">${esc(T.barrier)}</text>`;
  const anyLat1 = m.sources.some(s => s.lat1);
  out += `<g class="sim-door lat1${anyLat1 ? " on" : ""}"><rect x="${G.wallX - 4}" y="${m.lat1.y - 18}" width="${G.wallW + 8}" height="36" rx="8"/>
    ${txt(G.wallX + G.wallW + 12, m.lat1.y - 6, "LAT1", "sim-door-label")}${txt(G.wallX + G.wallW + 12, m.lat1.y + 9, T.lat1Short, "sim-door-note")}</g>`;
  m.lines.forEach(L => { if (L.door) out += `<g class="sim-door own on"><rect x="${G.wallX - 2}" y="${L.door.y - 9}" width="${G.wallW + 4}" height="18" rx="6"/>${txt(G.wallX + G.wallW + 10, L.door.y + 4, T.otherRoute, "sim-door-note")}</g>`; });
  // Pills
  m.sources.forEach(src => {
    out += `<g class="sim-pill${src.above ? " above" : ""}" data-sid="${src.sid}"><rect x="${G.pillX}" y="${src.y - 15}" width="${G.pillW}" height="30" rx="15"/>
      <text x="${G.pillX + 14}" y="${src.y - 1}" class="sim-pill-name">${esc(src.s.name.replace(/ \(.*\)$/, ""))}</text>
      <text x="${G.pillX + 14}" y="${src.y + 11}" class="sim-pill-dose">${esc(`${num(src.dose)} ${src.s.dose[2]}${src.above ? " · " + T.aboveRange : ""}`)}</text></g>`;
  });
  if (m.protein) out += `<g class="sim-pill protein"><rect x="${G.pillX}" y="${m.protein.y - 13}" width="${G.pillW}" height="26" rx="13"/>${txt(G.pillX + 14, m.protein.y + 4, T.protein, "sim-pill-dose")}</g>`;
  // Lines
  m.lines.forEach(L => {
    const col = hue(L.id), live = L.entries.length > 0, y = L.y;
    out += `<g class="sim-line${live ? " live" : ""}" style="--hue:${col}">`;
    out += txt(G.x0 - 30, y - 56, L.nt.name, "sim-line-name");
    if (!live) out += txt(G.x0 + 120, y - 56, T.nothingHere, "sim-line-empty");
    if (m.mods[L.id]) { const md = m.mods[L.id]; out += txt(G.W - 16, y - 56, `${T.actsHere}: ${md.slice(0, 2).join(", ")}${md.length > 2 ? ` +${md.length - 2}` : ""}`, "sim-mods", "end"); }
    out += `<line x1="${L.xs[0]}" y1="${y}" x2="${L.xs[L.xs.length - 1]}" y2="${y}" class="sim-track"/>`;
    // Rail above the line for each entry point
    L.entries.forEach(e => { out += `<path d="M ${G.x0 - 30} ${y - 30} H ${L.xs[e.k]} V ${y - 8}" class="sim-rail"/>`; });
    L.path.forEach((p, k) => {
      const x = L.xs[k], after = k > L.fin;
      if (p.m) {
        const fin = k === L.fin;
        out += `<g class="sim-mol${fin ? " final" : ""}${after ? " after" : ""}"><circle cx="${x}" cy="${y}" r="${fin ? 13 : 7}"${fin ? ` id="sim-fin-${L.id}"` : ""}/>${txt(x, y + (fin ? 32 : 24), p.m, "sim-mol-label", "middle")}</g>`;
        const ent = L.entries.filter(e => e.k === k).map(e => byId[e.sid].name.replace(/ \(.*\)$/, ""));
        if (ent.length) out += txt(x, y - 38, [...new Set(ent)].join(" + "), "sim-entry-label", "middle");
        if (fin) out += `<text x="${x}" y="${y + 47}" class="sim-overflow" id="sim-over-${L.id}" text-anchor="middle"></text>`;
      } else {
        const rl = k === L.rl, w = 70;
        out += `<g class="sim-enz${rl ? " rl" : ""}${after ? " after" : ""}"><rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="7"/>
          ${rl ? `<path d="M ${x - 10} ${y - 13} L ${x - 3} ${y} L ${x - 10} ${y + 13} M ${x + 10} ${y - 13} L ${x + 3} ${y} L ${x + 10} ${y + 13}" class="sim-valve"/>` : ""}
          ${txt(x, y + 28, p.e.replace(/ \(.*\)$/, ""), "sim-enz-label", "middle")}${rl ? txt(x, y - 20, T.slowest, "sim-rl-label", "middle") : ""}</g>`;
        (p.co || []).forEach(([label, id], c) => {
          const on = m.has(id), cx = x + (c - ((p.co.length - 1) / 2)) * 66;
          out += `<g class="sim-co${on ? " on" : ""}"><rect x="${cx - 31}" y="${y + 36}" width="62" height="18" rx="9"/>${txt(cx, y + 49, label.replace(/ \(.*\)$/, ""), "", "middle")}<title>${esc(`${label}: ${on ? T.inStack : T.fromFood}`)}</title></g>`;
        });
        if (rl) out += `<text x="${x - 40}" y="${y - 20}" class="sim-wait" id="sim-wait-${L.id}" text-anchor="end"></text>`;
      }
    });
    out += `</g>`;
  });
  out += `<text x="${G.wallX - 8}" y="${m.lat1.y + 34}" class="sim-wait" id="sim-wait-lat1" text-anchor="end"></text>`;
  return out;
}

// ---- moving dots ----
function simSpawn(m, src) {
  const G = SIM_G, e = src.entries[src.rr++ % src.entries.length], L = e.L, y = L.y;
  const door = src.lat1 ? m.lat1 : L.door;
  const pts = [[G.pillX + G.pillW, src.y], [door.x - 6, door.y]];
  const gates = { 1: src.lat1 ? m.lat1 : null };
  pts.push([door.x + G.wallW + 8, door.y], [G.x0 - 30, y - 30], [L.xs[e.k], y - 30], [L.xs[e.k], y]);
  for (let k = e.k + 1; k <= L.fin; k++) {
    if (k === L.rl && L.valve) { gates[pts.length] = L.valve; pts.push([L.valve.x, y]); }
    pts.push([L.xs[k], y]);
  }
  m.dots.push({ pts, gates, seg: 0, x: pts[0][0], y: pts[0][1], hue: PS_HUE[L.id], L, waiting: null });
}
function simSpawnProtein(m) {
  const G = SIM_G, p = m.protein;
  m.dots.push({ pts: [[G.pillX + G.pillW, p.y], [m.lat1.x - 6, m.lat1.y], [m.lat1.x + G.wallW + 40, m.lat1.y + 6]], gates: { 1: m.lat1 }, seg: 0, x: G.pillX + G.pillW, y: p.y, hue: "#7d879c", L: null, waiting: null, protein: true });
}
function simStep(m, dt) {
  const M = SIM_TEXT.model;
  m.t = (m.t || 0) + dt;
  m.sources.forEach(src => { src.acc += src.rate * dt; while (src.acc >= 1 && m.dots.length < 420) { src.acc -= 1; simSpawn(m, src); } });
  if (m.protein) { m.protein.acc += m.protein.rate * dt; while (m.protein.acc >= 1) { m.protein.acc -= 1; simSpawnProtein(m); } }
  // Gates let a fixed number of dots per second through, first come first served
  [m.lat1, ...m.lines.map(L => L.valve).filter(Boolean)].forEach(g => {
    // Amino acids that wait too long at the doorway stay in the blood and get used elsewhere in the body
    if (g === m.lat1) g.queue = g.queue.filter(d => { if (m.t - d.since > M.queueLife) { d.gone = true; return false; } return true; });
    g.tokens = Math.min(1.5, g.tokens + g.cap * dt);
    while (g.queue.length && g.tokens >= 1) { g.tokens -= 1; const d = g.queue.shift(); d.waiting = null; d.seg++; }
  });
  const v = SIM_G.speed * dt;
  m.dots = m.dots.filter(d => {
    if (d.gone) return false;
    if (d.waiting) return true;
    let left = v;
    while (left > 0) {
      const [tx, ty] = d.pts[d.seg + 1] || [];
      if (tx === undefined) {   // reached the end of its path
        if (d.L) d.L.arrivals.push(m.t);
        return false;
      }
      const dx = tx - d.x, dy = ty - d.y, dist = Math.hypot(dx, dy);
      if (dist <= left) {
        d.x = tx; d.y = ty; left -= dist;
        const g = d.gates[d.seg + 1];
        if (g && !d.passed?.has(d.seg + 1)) { (d.passed = d.passed || new Set()).add(d.seg + 1); d.waiting = g; d.since = m.t; g.queue.push(d); return true; }   // released by the gate, then carries on
        d.seg++;
      } else { d.x += dx / dist * left; d.y += dy / dist * left; left = 0; }
    }
    return true;
  });
  m.lines.forEach(L => { L.arrivals = L.arrivals.filter(t => t > m.t - 6); });
}
// Waiting dots line up in front of their gate
function simQueuePos(g, k, lat1) {
  // LAT1: columns of 12 stacked against the doorway (at most 5 columns shown); valves: a single line
  return lat1 ? [g.x - 9 - Math.min(4, Math.floor(k / 12)) * 9, g.y - 50 + (k % 12) * 9] : [g.x - 8 - Math.min(k, 9) * 8, g.y];
}
function simDraw(m) {
  const layer = SIM.svg?.querySelector("#sim-dots"); if (!layer) return;
  while (SIM.pool.length < m.dots.length) { const c = document.createElementNS("http://www.w3.org/2000/svg", "circle"); c.setAttribute("r", "4"); layer.append(c); SIM.pool.push(c); }
  const counts = new Map();
  m.dots.forEach((d, k) => {
    let x = d.x, y = d.y;
    if (d.waiting) { const n = counts.get(d.waiting) || 0; counts.set(d.waiting, n + 1); [x, y] = simQueuePos(d.waiting, n, d.waiting === m.lat1); }
    const c = SIM.pool[k]; c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1)); c.setAttribute("fill", d.hue); c.style.display = "";
    c.setAttribute("class", d.protein ? "dot protein" : "dot");
  });
  for (let k = m.dots.length; k < SIM.pool.length; k++) SIM.pool[k].style.display = "none";
  const T = SIM_TEXT, M = T.model, setTxt = (id, s) => { const el = document.getElementById(id); if (el && el.textContent !== s) el.textContent = s; };
  setTxt("sim-wait-lat1", m.lat1.queue.length > 2 ? T.waiting.replace("{n}", m.lat1.queue.length) : "");
  m.lines.forEach(L => {
    if (L.valve) setTxt(`sim-wait-${L.id}`, L.valve.queue.length > 2 ? T.waiting.replace("{n}", L.valve.queue.length) : "");
    const rate = L.arrivals.length / 6, fin = document.getElementById(`sim-fin-${L.id}`);
    if (fin) fin.setAttribute("r", (13 + Math.min(9, rate * 4)).toFixed(1));
    const over = rate > M.overflowRate;
    fin?.parentNode.classList.toggle("over", over);
    setTxt(`sim-over-${L.id}`, over ? T.overflow : "");
  });
}
function simLoop(now) {
  SIM.raf = 0;
  if (!document.getElementById("sim-stage") || !SIM.model) return;
  const dt = Math.min(0.05, (now - (SIM.last || now)) / 1000); SIM.last = now;
  if (SIM.run && !document.hidden) { simStep(SIM.model, dt); simDraw(SIM.model); }
  SIM.raf = requestAnimationFrame(simLoop);
}

function renderSim() {
  const stage = document.getElementById("sim-stage"); if (!stage) return;
  const T = SIM_TEXT, st = active(), m = SIM.model = simModel(st);
  stage.innerHTML = `<svg viewBox="0 0 ${SIM_G.W} ${m.H}" role="img" aria-label="${esc(T.title)}">${simStatic(m)}<g id="sim-dots"></g></svg>`;
  SIM.svg = stage.querySelector("svg"); SIM.pool = []; SIM.last = 0;
  const lineIds = new Set(m.sources.map(s => s.sid));
  document.getElementById("sim-note").textContent = !m.sources.length ? T.empty : lineIds.has("5-htp") ? T.route5htp : "";
  // Warnings from the stack check, with a "Show" that highlights the supplements involved
  const F = analyze(st).filter(f => SEV_ORDER[f.sev] <= SEV_ORDER.moderate);
  document.getElementById("sim-warn").innerHTML = F.length ? `<ul class="sim-warnlist">${F.map((f, k) => `<li><span class="sev sev-${f.sev}">${f.sev}</span><div><b>${esc(f.title)}</b><p>${gloss(f.body)}</p>
      ${(f.ids || []).length ? `<button class="linkish" data-act="sim-show" data-ids="${esc(f.ids.join(","))}">${esc(T.show)}</button>` : ""}</div></li>`).join("")}</ul>`
    : `<p class="hint">${esc(T.warningsNone)}</p>`;
  // Reduced motion: run the model forward and show one still frame
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  SIM.run = !still;
  document.getElementById("sim-play").textContent = SIM.run ? T.pause : T.play;
  if (still) { for (let k = 0; k < 600; k++) simStep(m, 1 / 30); simDraw(m); }
  if (!SIM.raf) SIM.raf = requestAnimationFrame(simLoop);
}
function simHighlight(ids) {
  document.querySelectorAll(".sim-pill.hl").forEach(p => p.classList.remove("hl"));
  ids.forEach(id => document.querySelectorAll(`.sim-pill[data-sid="${id}"]`).forEach(p => p.classList.add("hl")));
  document.getElementById("sim-stage")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  clearTimeout(SIM.hlT); SIM.hlT = setTimeout(() => document.querySelectorAll(".sim-pill.hl").forEach(p => p.classList.remove("hl")), 4000);
}
