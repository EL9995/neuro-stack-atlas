// ---------------------------------------------------------------------------
// PATHWAY SCENE: dopamine assembly line (scroll + time driven)
// ---------------------------------------------------------------------------
const PS_PATH = ntById.dopamine.path;
const PS_MX = [200, 840, 1480, 2120], PS_EXS = [520, 1160, 1800];
const PS_MOLS = PS_PATH.filter(s => s.m).map((s, i) => ({ name: s.m, x: PS_MX[i], from: s.from || [] }));
const PSM = PS_PATH.filter(s => s.e).map((s, i) => ({ name: s.e, x: PS_EXS[i], co: (s.co || []).map(c => c[0]), rl: !!s.rl, dock: [.665, .675, .705][i] }));
const PS_COL = ["#8aa4ff", "#c4a7ff", "#6fe0c8", "#ffb340"];
const psColAt = x => x < PS_EXS[0] ? 0 : x < PS_EXS[1] ? 1 : x < PS_EXS[2] ? 2 : 3;
const psRow = id => MAP.find(r => r[0] === id && r[1] === "dopamine");
const psName = id => byId[id].name.replace(/ \(.*\)$/, "");
const PS_SUP = PS_MOLS.slice(0, 3).map((m, i) => { const id = m.from[0], r = psRow(id); return { id, name: psName(id), ev: r[3], note: r[4], x: m.x, on: [.18, .26, .34][i] }; });
const PS_MODS = [["rhodiola", "Levels under stress", 2330, 330], ["pea", "Release", 2490, 205], ["hordenine", "Keeps PEA around", 2490, 252], ["sam-e", "Turnover", 2490, 655],
  ["citicoline", "Receptors", 2720, 330], ["uridine", "Release and receptors", 2720, 380], ["omega-3", "Receptor function", 2720, 430], ["caffeine", "Lifts the brakes", 2720, 500], ["theacrine", "Lifts the brakes", 2720, 550]]
  .filter(m => byId[m[0]] && psRow(m[0])).map(([id, role, x, y]) => ({ id, role, x, y, name: psName(id), ev: psRow(id)[3] }));
const PSB = [
  [0, "The dopamine assembly line", "Your body already makes dopamine from amino acids in food. Each station is an enzyme that changes the molecule one step."],
  [.13, "Precursors: where supplements join", "Precursors are raw materials. Different supplements add them at different points on the line."],
  ...PS_SUP.map(s => [s.on, s.name, s.note]),
  [.43, "Enzymes: the slowest step", `${PSM[1].name} is the bottleneck, and your body sets its pace. That's why precursors before it are gentler than ${PS_SUP[2].name}, which joins after it.`],
  [.60, "Cofactors: what enzymes run on", "Take the vitamins and minerals away and the line stops. Raw material piles up and goes nowhere."],
  [.663, `${PSM[0].co.join(" and ")}`, `${psRow("iron")[4]} ${psRow("l-methylfolate")[4]}`],
  [.70, PSM[2].co.join(" and "), psRow("vitamin-b6")[4]],
  [.78, "Modulators: after dopamine is made", "They aren't building blocks. They change how dopamine is stored, released, received, or cleared."],
  [.86, "Mostly early evidence", "Most modulators here have limited evidence, and several findings come from animal studies. Caffeine is the best supported, and it adds no dopamine."],
  [.94, "That's the whole map", "Precursors feed the line, cofactors keep it running, and modulators shape what happens next."]
];
const PSK = [[0, 1180, 420, 2300, 700], [.15, 300, 330, 700, 520], [.24, 900, 330, 700, 520], [.33, 1520, 330, 700, 520], [.42, 1160, 420, 600, 380], [.56, 1160, 420, 560, 360], [.60, 1160, 400, 1700, 560], [.74, 1160, 400, 1700, 560], [.80, 2520, 440, 760, 560], [.93, 2520, 440, 760, 560], [1, 1500, 430, 2900, 760]];
const PS_X0 = 120, PS_X1 = 2250, PS_V = 210;
function psSpeed(x) { for (const m of PSM) if (Math.abs(x - m.x) < 85) return m.rl ? .28 : .62; return 1; }
const PS_LUT = (() => { const xs = [], ts = []; let t = 0; for (let x = PS_X0; x <= PS_X1; x += 2) { xs.push(x); ts.push(t); t += 2 / (PS_V * psSpeed(x)); } return { xs, ts, T: t }; })();
const psT = x => PS_LUT.ts[nsC(Math.round((x - PS_X0) / 2), 0, PS_LUT.ts.length - 1)];
function psX(t) { const ts = PS_LUT.ts; let lo = 0, hi = ts.length - 1; if (t >= ts[hi]) return PS_X1; while (hi - lo > 1) { const m = (lo + hi) >> 1; ts[m] <= t ? lo = m : hi = m; } return PS_LUT.xs[lo] + 2 * (t - ts[lo]) / Math.max(1e-6, ts[hi] - ts[lo]); }
const PSS = [{ ex: PS_X0, n: 10, on: 0, sup: false }, ...PS_SUP.map(s => ({ ex: s.x, n: 5, on: s.on, sup: true }))];
const PSP = [];
PSS.forEach((s, si) => { const cl = s.sup ? Math.hypot(150, 268) / 260 : 0, D = cl + (PS_LUT.T - psT(s.ex)); for (let i = 0; i < s.n; i++) PSP.push({ s, cl, D, ph: (i / s.n) * D + si * .9, dx: null, dy: null }); });
const PS_REC = [-100, -50, 0, 50, 100].map(dy => [2790 - 250 * Math.sqrt(1 - (dy / 230) ** 2) - 6, 430 + dy]);
const PS = { stage: null, refs: null, p: 0, t: 0, last: 0, loop: 0, visible: false, beat: -1, sw: 0, W: 1000, H: 600, A: 1.6, ang: [0, 0, 0], glow: [1, 1, 1], rm: false };

function psCam(p) {
  let i = 0; while (i < PSK.length - 2 && p > PSK[i + 1][0]) i++;
  const a = PSK[i], b = PSK[i + 1], t = nsS(nsG(p, a[0], b[0]));
  return [nsL(a[1], b[1], t), nsL(a[2], b[2], t), Math.exp(nsL(Math.log(a[3]), Math.log(b[3]), t)), Math.exp(nsL(Math.log(a[4]), Math.log(b[4]), t))];
}
function psSceneHtml() {
  const chutes = PS_SUP.map((s, i) => `<path d="M${s.x - 150} 150 L${s.x} 418" stroke="#1b2a52" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path id="ps-cg${i}" d="M${s.x - 150} 150 L${s.x} 418" stroke="#7fe6ff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".25"/>
    <ellipse cx="${s.x - 150}" cy="146" rx="28" ry="11" fill="#16254a" stroke="#3a5aa8" stroke-width="2"/>`).join("");
  const mach = PSM.map((m, i) => {
    const offs = m.co.length === 2 ? [-34, 34] : [0];
    const funnel = m.rl ? `<path d="M${m.x - 85} 417 L${m.x - 22} 425 M${m.x - 85} 443 L${m.x - 22} 435 M${m.x + 22} 425 L${m.x + 85} 417 M${m.x + 22} 435 L${m.x + 85} 443" stroke="#7fe6ff" stroke-opacity=".55" stroke-width="2" fill="none"/>` : "";
    return `<rect x="${m.x - 85}" y="355" width="170" height="150" rx="22" fill="#16254a" fill-opacity=".6" stroke="#3a5aa8" stroke-width="2"/>
      <rect id="ps-mg${i}" x="${m.x - 85}" y="355" width="170" height="150" rx="22" fill="none" stroke="#7fe6ff" stroke-width="3" opacity=".5"/>
      ${offs.map(o => `<rect x="${m.x + o - 26}" y="344" width="52" height="18" rx="9" fill="#0b1328" stroke="#3a5aa8" stroke-width="1.5"/>`).join("")}
      <g id="ps-r${i}"><circle cx="${m.x}" cy="388" r="17" fill="none" stroke="#5a78c0" stroke-width="2.5"/><path d="M${m.x} 371 V405 M${m.x - 15} 380 L${m.x + 15} 396 M${m.x - 15} 396 L${m.x + 15} 380" stroke="#5a78c0" stroke-width="2.5"/></g>
      ${funnel}`;
  }).join("");
  const rec = PS_REC.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="9" fill="#26345a" stroke="#4c6aa8" stroke-width="1.5"/><circle id="ps-rg${k}" cx="${x}" cy="${y}" r="24" fill="url(#ps-glow)" opacity="0"/>`).join("");
  return `<svg class="ns-world" id="ps-world" viewBox="0 0 900 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <radialGradient id="ps-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7fe6ff" stop-opacity=".8"/><stop offset="1" stop-color="#7fe6ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="ps-soma" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#2d4585"/><stop offset="1" stop-color="#101a38"/></radialGradient>
    </defs>
    ${nsStars()}
    <ellipse cx="2790" cy="430" rx="250" ry="230" fill="url(#ps-soma)" stroke="#34508f" stroke-width="2"/>
    <path d="M2440 290 Q2454 430 2440 570" stroke="#3a5aa8" stroke-width="3" fill="none"/>
    ${rec}
    <rect x="${PS_X0 - 10}" y="417" width="${PS_X1 - PS_X0 + 40}" height="26" rx="13" fill="#101a36" stroke="#26345a" stroke-width="1.5"/>
    <line id="ps-belt" x1="${PS_X0}" y1="430" x2="${PS_X1 + 20}" y2="430" stroke="#2c3d6b" stroke-width="2" stroke-dasharray="6 14"/>
    ${chutes}
    <circle id="ps-ves" cx="2330" cy="430" r="58" fill="#ffb340" fill-opacity=".1" stroke="#ffb340" stroke-opacity=".7" stroke-width="2"/>
    ${mach}
    ${PSP.map((_, k) => `<circle id="ps-q${k}" r="8" opacity="0"/>`).join("")}
    ${[0, 1, 2, 3, 4, 5].map(k => `<circle id="ps-rd${k}" r="6" fill="#ffb340" opacity="0"/>`).join("")}
    ${[0, 1].map(k => `<circle id="ps-cd${k}" r="6" fill="#ffb340" opacity="0"/>`).join("")}
  </svg>`;
}
function psTagsHtml() {
  const ev = e => `<em class="ev ev-${e}">${e[0].toUpperCase() + e.slice(1)} evidence</em>`;
  return `<div class="ps-tags" aria-hidden="true">
    ${PS_MOLS.map((m, i) => `<span class="ps-tag ps-mol" data-wx="${m.x}" data-wy="476"><i style="background:${PS_COL[i]}"></i>${esc(m.name)}</span>`).join("")}
    ${PSM.map(m => `<span class="ps-tag ps-enz" data-wx="${m.x}" data-wy="532">${esc(m.name)}${m.rl ? "<em>Slowest step</em>" : ""}</span>`).join("")}
    ${PS_SUP.map((s, i) => `<span class="ps-tag ps-sup" data-wx="${s.x - 150}" data-wy="104" data-on="${s.on}"><b>${esc(s.name)}</b>${ev(s.ev)}</span>`).join("")}
    ${PSM.map((m, i) => m.co.map((c, j) => `<span class="ps-tag ps-co" data-m="${i}" data-j="${j}">${esc(c)}</span>`).join("")).join("")}
    ${PS_MODS.map((m, i) => `<span class="ps-tag ps-mod" data-wx="${m.x}" data-wy="${m.y}" data-i="${i}"><b>${esc(m.name)}</b><small>${esc(m.role)}</small>${ev(m.ev)}</span>`).join("")}
  </div>`;
}
function pathwayHtml() {
  return `
  <section class="ns ps" id="how" aria-label="How a supplement reaches a neurotransmitter, a scroll-through map">
    <h2 class="sr">How a supplement reaches a neurotransmitter</h2>
    <div class="sr">${PSB.map(b => `<p><b>${esc(b[1])}.</b> ${esc(b[2])}</p>`).join("")}</div>
    <div class="ns-stage ps-stage" id="ps-stage">
      ${psSceneHtml()}
      ${psTagsHtml()}
      <div class="ns-legend ps-legend" aria-hidden="true">${["Phenylalanine", "L-Tyrosine", "L-DOPA", "Dopamine"].map((n, i) => `<span class="ns-chip on"><i style="background:${PS_COL[i]}"></i>${n}</span>`).join("")}<span class="ns-chip on ps-supkey"><i class="ring"></i>From a supplement</span></div>
      <button class="ns-skip" data-scroll="six" type="button">Skip to the six</button>
      <div class="ns-cap" id="ps-cap" aria-hidden="true">
        <p class="ns-t" id="ps-t">${esc(PSB[0][1])}</p><p class="ns-b" id="ps-b">${esc(PSB[0][2])}</p>
        <div class="ps-modlist" id="ps-modlist" hidden>${PS_MODS.map(m => `<span><b>${esc(m.name)}</b> ${esc(m.role.toLowerCase())}</span>`).join("")}</div>
        <div class="ps-ctas" id="ps-ctas" hidden><button class="tc-btn" data-go="dopamine" type="button">Open dopamine</button><button class="tc-ghost" data-scroll="six" type="button">Pick another of the six</button></div>
      </div>
      <div class="ns-prog" aria-hidden="true"><i id="ps-pf"></i></div>
    </div>
  </section>`;
}
function psRefs() {
  const $ = id => document.getElementById(id), st = PS.stage;
  return {
    world: $("ps-world"), belt: $("ps-belt"), ves: $("ps-ves"), q: PSP.map((_, k) => $("ps-q" + k)),
    mg: PSM.map((_, i) => $("ps-mg" + i)), r: PSM.map((_, i) => $("ps-r" + i)), cg: PS_SUP.map((_, i) => $("ps-cg" + i)),
    rd: [0, 1, 2, 3, 4, 5].map(k => $("ps-rd" + k)), cd: [0, 1].map(k => $("ps-cd" + k)), rg: PS_REC.map((_, k) => $("ps-rg" + k)),
    tags: [...st.querySelectorAll(".ps-tag")], cap: $("ps-cap"), t: $("ps-t"), b: $("ps-b"), modlist: $("ps-modlist"), ctas: $("ps-ctas"), pf: $("ps-pf")
  };
}
function psBeat(i) {
  if (i === PS.beat) return; PS.beat = i;
  const R = PS.refs; R.cap.classList.add("swap"); clearTimeout(PS.sw);
  PS.sw = setTimeout(() => { R.t.textContent = PSB[i][1]; R.b.textContent = PSB[i][2]; R.cap.classList.remove("swap"); }, 150);
}
function psFrame(p, dt) {
  const R = PS.refs, f = v => v.toFixed(3), t = PS.t, snap = dt === 0;
  const [cx, cy, bw, bh] = psCam(p), vw = Math.max(bw, bh * PS.A), vh = vw / PS.A, sc = PS.W / vw, vx = cx - vw / 2, vy = cy - vh / 2;
  R.world.setAttribute("viewBox", `${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
  if (!PS.rm) R.belt.setAttribute("stroke-dashoffset", (-(t * 60) % 20).toFixed(1));
  const run = PSM.map(m => !(p >= .612 && p < m.dock - .004));
  PSM.forEach((m, i) => {
    PS.glow[i] += ((run[i] ? 1 : 0) - PS.glow[i]) * (snap ? 1 : Math.min(1, dt * 5));
    if (run[i] && !PS.rm) PS.ang[i] = (PS.ang[i] + dt * (m.rl ? 45 : 140)) % 360;
    R.r[i].setAttribute("transform", `rotate(${PS.ang[i].toFixed(1)} ${m.x} 388)`);
    R.mg[i].setAttribute("opacity", f(PS.glow[i] * .55));
  });
  // particles
  const tg = PSP.map(q => {
    const s = q.s, l = (t + q.ph) % q.D;
    if (l < q.cl) { const u = l / q.cl; return { x: nsL(s.ex - 150, s.ex, u), y: nsL(150, 418, u), chute: true, u }; }
    return { x: psX(psT(s.ex) + (l - q.cl)), y: 430, chute: false, u: 1 };
  });
  const queues = PSM.map(() => []);
  tg.forEach((g, k) => {
    if (g.chute) return;
    for (let i = 0; i < PSM.length; i++) { const m = PSM[i]; if (!run[i] && PSP[k].s.ex < m.x && g.x > m.x - 85) { queues[i].push(k); g.q = i; break; } }
  });
  queues.forEach((list, i) => { list.sort((a, b) => tg[b].x - tg[a].x).forEach((k, r) => { tg[k].x = PSM[i].x - 96 - Math.floor(r / 3) * 15; tg[k].y = 430 + ((r % 3) - 1) * 13; }); });
  PSP.forEach((q, k) => {
    const g = tg[k], el = R.q[k];
    if (q.dx === null || snap || Math.abs(g.x - q.dx) > 500) { q.dx = g.x; q.dy = g.y; }
    else { const a = Math.min(1, dt * 7); q.dx += (g.x - q.dx) * a; q.dy += (g.y - q.dy) * a; }
    const on = q.s.on === 0 ? .8 : nsS(nsG(p, q.s.on - .015, q.s.on + .005));
    const o = on * (g.chute ? nsC(g.u * 8) : 1) * (1 - nsC((q.dx - 2215) / 45));
    el.setAttribute("cx", q.dx.toFixed(1)); el.setAttribute("cy", q.dy.toFixed(1)); el.setAttribute("opacity", f(o));
    el.setAttribute("fill", PS_COL[psColAt(g.chute ? q.s.ex : q.dx)]);
    if (q.s.sup) { el.setAttribute("stroke", "#ffffff"); el.setAttribute("stroke-width", "2.2"); el.setAttribute("stroke-opacity", ".9"); }
  });
  PS_SUP.forEach((s, i) => R.cg[i].setAttribute("opacity", f(.25 + .65 * nsS(nsG(p, s.on - .015, s.on + .005)))));
  // modulator zone
  const zv = nsS(nsG(p, .74, .80));
  R.ves.setAttribute("fill-opacity", f(.1 + .14 * zv));
  const recGlow = PS_REC.map(() => 0);
  R.rd.forEach((el, k) => {
    const P = 2.6, u = ((t + k / 6 * P) % P) / P, r = k % 5, dy = ((k * 29) % 40) - 20;
    let x, y;
    if (u < .35) { const v = u / .35; x = nsL(2388, 2444, v); y = nsL(430 + dy * .4, 430 + dy * .8, v); }
    else { const v = nsC((u - .35) / .45); x = nsL(2444, PS_REC[r][0] - 12, v); y = nsL(430 + dy * .8, PS_REC[r][1], v); }
    const o = zv * nsC(u * 10) * (1 - nsS(nsG(u, .82, .95)));
    recGlow[r] = Math.max(recGlow[r], nsW(u, .72, .8, .86, .96));
    el.setAttribute("cx", x.toFixed(1)); el.setAttribute("cy", y.toFixed(1)); el.setAttribute("opacity", f(PS.rm ? zv * (u < .8 ? 1 : 0) : o));
  });
  R.rg.forEach((el, r) => el.setAttribute("opacity", f(zv * recGlow[r])));
  R.cd.forEach((el, k) => { const P = 3.2, u = ((t + k * 1.6) % P) / P; el.setAttribute("cx", nsL(2490, 2468, u).toFixed(1)); el.setAttribute("cy", nsL(470, 640, u).toFixed(1)); el.setAttribute("opacity", f(zv * nsC(u * 8) * (1 - u))); });
  // overlays
  const place = (el, wx, wy, o) => {
    const x = (wx - vx) * sc, y = (wy - vy) * sc, inside = x > -120 && x < PS.W + 120 && y > -60 && y < PS.H + 60;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
    el.style.opacity = inside ? f(o) : "0";
  };
  R.tags.forEach(el => {
    const c = el.classList;
    if (c.contains("ps-co")) {
      const m = PSM[+el.dataset.m], j = +el.dataset.j, off = m.co.length === 2 ? (j ? 34 : -34) : 0;
      const k = p < m.dock - .012 ? nsS(nsG(p, .60, .612)) : 1 - nsS(nsG(p, m.dock - .012, m.dock));
      place(el, m.x + off * (1 + 1.4 * k), nsL(352, 240, k), 1 - k);
    } else if (c.contains("ps-sup")) {
      const on = +el.dataset.on; place(el, +el.dataset.wx, +el.dataset.wy, .45 + .55 * nsS(nsG(p, on - .015, on + .005)));
      c.toggle("hot", p >= on - .01 && p < on + .085);
    } else if (c.contains("ps-mod")) {
      const s0 = .80 + +el.dataset.i * .01; place(el, +el.dataset.wx, +el.dataset.wy, nsS(nsG(p, s0, s0 + .02)) * (1 - nsS(nsG(p, .95, .97))));
    } else place(el, +el.dataset.wx, +el.dataset.wy, 1);
  });
  R.pf.style.height = (p * 100).toFixed(1) + "%";
  let bi = 0; PSB.forEach((b, i) => { if (p >= b[0]) bi = i; }); psBeat(bi);
  R.modlist.hidden = !(PS.stage.classList.contains("narrow") && p >= .78 && p < .94);
  R.ctas.hidden = p < .945;
}
function psMeasure() {
  const st = PS.stage; if (!st) return;
  PS.W = st.clientWidth || 1000; PS.H = st.clientHeight || 600; PS.A = PS.W / PS.H;
  st.classList.toggle("narrow", PS.W < 640);
}
function psProgress() {
  const sec = document.getElementById("how"); if (!sec || !PS.stage) return null;
  const r = sec.getBoundingClientRect(), top = parseFloat(getComputedStyle(PS.stage).top) || 0;
  PS.visible = r.bottom > -50 && r.top < (window.innerHeight || 800) + 50;
  return nsC((top - r.top) / Math.max(1, r.height - PS.stage.offsetHeight));
}
function psTick(now) {
  PS.loop = 0; if (!PS.refs || !document.getElementById("ps-stage")) return;
  const dt = PS.last ? Math.min(.05, (now - PS.last) / 1000) : 1 / 60; PS.last = now; PS.t += dt;
  psFrame(PS.p, dt);
  if (PS.visible) PS.loop = requestAnimationFrame(psTick); else PS.last = 0;
}
function psOnScroll() {
  if (!PS.refs) return; const p = psProgress(); if (p === null) return; PS.p = p;
  if (PS.rm) psFrame(p, 0);
  else if (PS.visible && !PS.loop) { PS.last = 0; PS.loop = requestAnimationFrame(psTick); }
}
function psInit() {
  PS.stage = document.getElementById("ps-stage"); if (!PS.stage) { PS.refs = null; return; }
  PS.refs = psRefs(); PS.beat = 0; PS.rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  PSP.forEach(q => { q.dx = null; });
  psMeasure(); const p = psProgress(); PS.p = p === null ? 0 : p; psFrame(PS.p, 0); psOnScroll();
}
window.addEventListener("scroll", psOnScroll, { passive: true });
window.addEventListener("resize", () => { psMeasure(); psOnScroll(); if (PS.refs) psFrame(PS.p, 0); });

