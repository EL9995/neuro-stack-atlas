// ---------------------------------------------------------------------------
// PATHWAY SCENE: a neurotransmitter's assembly line (scroll + time driven).
// Shown on each neurotransmitter page and laid out from that neurotransmitter's
// pathway data: one station per enzyme, a chute for each supplement that joins
// the line, cofactors docking onto their enzymes, then the modulators.
// psSetup(nt) fills the layout below; psInit() starts it once it's on the page.
// ---------------------------------------------------------------------------
const PS_HUE = { dopamine: "#ffb340", norepinephrine: "#ff6961", serotonin: "#c77dff", gaba: "#40e0d0", glutamate: "#ff6b8b", acetylcholine: "#4da3ff" };
const PS_PRE_COL = ["#8aa4ff", "#c4a7ff", "#6fe0c8"];
const PS_X0 = 120, PS_V = 210;
let PS_NT, PS_MOLS, PSM, PS_EXS, PS_COL, PS_SUP, PS_MODS, PSB, PSK, PS_Z, PS_X1, PS_LUT, PSS, PSP, PS_REC;
const psColAt = x => PS_EXS.filter(e => x >= e).length;
// This neurotransmitter's note for a supplement; steps shared with another pathway
// (norepinephrine is made through dopamine) fall back to that pathway's note.
const psRow = id => MAP.find(r => r[0] === id && r[1] === PS_NT.id) || MAP.find(r => r[0] === id);
const psName = id => byId[id].name.replace(/ \(.*\)$/, "");
const psLabel = n => n.id === "gaba" ? "GABA" : n.name.toLowerCase();
const psFill = (s, n) => s.replace(/\{nt\}/g, psLabel(n)).replace("{madeFrom}", PATHWAY_SCENE.madeFrom[n.id] || "");
function psSpeed(x) { for (const m of PSM) if (Math.abs(x - m.x) < 85) return m.rl ? .28 : .62; return 1; }
const psT = x => PS_LUT.ts[nsC(Math.round((x - PS_X0) / 2), 0, PS_LUT.ts.length - 1)];
function psX(t) { const ts = PS_LUT.ts; let lo = 0, hi = ts.length - 1; if (t >= ts[hi]) return PS_X1; while (hi - lo > 1) { const m = (lo + hi) >> 1; ts[m] <= t ? lo = m : hi = m; } return PS_LUT.xs[lo] + 2 * (t - ts[lo]) / Math.max(1e-6, ts[hi] - ts[lo]); }

function psSetup(nt) {
  PS_NT = nt;
  const path = nt.path.slice(0, nt.path.findIndex(s => s.final) + 1);   // steps after the finished chemical stay in the diagram below
  const mols = path.filter(s => s.m), enz = path.filter(s => s.e);
  PS_MOLS = mols.map((s, i) => ({ name: s.m, x: 200 + 640 * i, from: s.from || [] }));
  PS_EXS = enz.map((_, i) => 520 + 640 * i);
  PS_Z = PS_MOLS[PS_MOLS.length - 1].x;
  PS_X1 = PS_Z + 130;
  PS_COL = PS_MOLS.map((_, i) => i === PS_MOLS.length - 1 ? PS_HUE[nt.id] : PS_PRE_COL[i % PS_PRE_COL.length]);

  // Cofactors dock in groups: enzymes needing the same cofactors share one caption.
  const groups = [];
  PSM = enz.map((s, i) => {
    const co = (s.co || []).map(c => c[0]), coIds = (s.co || []).map(c => c[1]), key = co.join("+");
    let g = key ? groups.find(g => g.key === key) : null;
    if (key && !g) groups.push(g = { key, co, coIds, n: 0 });
    return { name: s.e, x: PS_EXS[i], co, rl: !!s.rl, g, j: g ? g.n++ : 0 };
  });
  groups.forEach((g, k) => { g.t = groups.length > 1 ? .663 + .037 * k / (groups.length - 1) : .663; });
  PSM.forEach(m => { m.dock = m.g ? m.g.t + .002 + .01 * m.j : .612; });

  const sups = PS_MOLS.slice(0, -1).filter(m => m.from.some(f => byId[f]));
  PS_SUP = sups.map((m, i) => {
    const id = m.from.find(f => byId[f]), r = psRow(id);
    return { id, name: psName(id), ev: r ? r[3] : null, note: r ? r[4] : byId[id].sum, x: m.x, on: .18 + .08 * i };
  });

  // Modulator cards: a two-column grid inside the receiving cell, between the legend and the caption.
  // Strongest evidence first; at most 10 (the rest are in the supplement list below the scene).
  const labels = PATHWAY_SCENE.modulatorLabels[nt.id] || {};
  const rows = MAP.filter(r => r[1] === nt.id && r[2] !== "precursor" && r[2] !== "cofactor" && byId[r[0]]);
  const ids = [...new Set(rows.map(r => r[0]))].sort((a, b) => EV[rows.find(r => r[0] === b)[3]] - EV[rows.find(r => r[0] === a)[3]]).slice(0, 10);
  const perCol = Math.ceil(ids.length / 2), rowGap = 66, y0 = 375 - (perCol - 1) * rowGap / 2;
  PS_MODS = ids.map((id, i) => {
    const r = rows.find(r => r[0] === id), col = i < perCol ? 0 : 1, row = col ? i - perCol : i;
    return { id, role: labels[id] || ROLE[r[2]], x: PS_Z + (col ? 735 : 555), y: y0 + row * rowGap, name: psName(id), ev: r[3] };
  });

  // Captions: wording in content/scene-captions.js, the numbers are scroll points.
  const T = PATHWAY_SCENE.captions, rl = PSM.find(m => m.rl), late = rl && PS_SUP.find(s => s.x > rl.x);
  const cofNote = g => g.coIds.map(id => psRow(id)).filter(Boolean).map(r => r[4]).join(" ");
  PSB = [
    [0, psFill(T.start[0], nt), psFill(T.start[1], nt)],
    ...(PS_SUP.length ? [[.13, ...T.precursors]] : []),
    ...PS_SUP.map(s => [s.on, s.name, s.note]),
    late ? [.43, T.slowestStep[0], T.slowestStep[1].replace("{enzyme}", rl.name).replace("{lateSupplement}", late.name)] : [.43, ...T.enzymes],
    ...(groups.length ? [[.60, ...T.cofactors]] : []),
    ...groups.map(g => [g.t, g.co.join(" and "), cofNote(g)]).filter(b => b[2]),
    ...(PS_MODS.length ? [[.78, psFill(T.modulators[0], nt), psFill(T.modulators[1], nt)]] : []),
    ...(PATHWAY_SCENE.evidence[nt.id] ? [[.86, ...PATHWAY_SCENE.evidence[nt.id]]] : []),
    [.94, ...T.end]
  ];

  // Camera: [scroll point, center x, center y, width, height] in scene units.
  const focus = rl || PSM[Math.floor((PSM.length - 1) / 2)], e0 = PSM[0].x, e1 = PSM[PSM.length - 1].x;
  // Starts and ends on the full pipeline; zooms in (with some room around) for each step in between.
  const overview = [(PS_X0 + PS_X1) / 2 - 60, 390, Math.max(PS_X1 - PS_X0 + 450, 1500), 640];
  PSK = [[0, ...overview], [.10, ...overview],
    ...PS_SUP.map((s, i) => [s.on - .03 + .01 * i, s.x + Math.max(40, 100 - 30 * i), 300, 900, 600]),
    [.42, focus.x, 490, 760, 470], [.56, focus.x, 490, 720, 450],
    [.60, (e0 + e1) / 2, 400, e1 - e0 + 600, 620], [.74, (e0 + e1) / 2, 400, e1 - e0 + 600, 620],
    [.80, PS_Z + 400, 440, 900, 600], [.93, PS_Z + 400, 440, 900, 600],
    [1, ...overview]];

  PS_LUT = (() => { const xs = [], ts = []; let t = 0; for (let x = PS_X0; x <= PS_X1; x += 2) { xs.push(x); ts.push(t); t += 2 / (PS_V * psSpeed(x)); } return { xs, ts, T: t }; })();
  PSS = [{ ex: PS_X0, n: 10, on: 0, sup: false }, ...PS_SUP.map(s => ({ ex: s.x, n: 5, on: s.on, sup: true }))];
  PSP = [];
  PSS.forEach((s, si) => { const cl = s.sup ? Math.hypot(150, 268) / 260 : 0, D = cl + (PS_LUT.T - psT(s.ex)); for (let i = 0; i < s.n; i++) PSP.push({ s, cl, D, ph: (i / s.n) * D + si * .9, dx: null, dy: null }); });
  PS_REC = [-100, -50, 0, 50, 100].map(dy => [PS_Z + 670 - 250 * Math.sqrt(1 - (dy / 230) ** 2) - 6, 430 + dy]);
  PS.ang = PSM.map(() => 0); PS.glow = PSM.map(() => 1); PS.t = 0;
}
const PS = { stage: null, refs: null, p: 0, t: 0, last: 0, loop: 0, visible: false, beat: -1, sw: 0, W: 1000, H: 600, A: 1.6, ang: [], glow: [], rm: false };

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
    const funnel = m.rl ? `<path d="M${m.x - 85} 417 L${m.x - 22} 425 M${m.x - 85} 443 L${m.x - 22} 435 M${m.x + 22} 425 L${m.x + 85} 417 M${m.x + 22} 435 L${m.x + 85} 443" stroke="#7fe6ff" stroke-opacity=".55" stroke-width="2" fill="none"/>` : "";
    return `<rect x="${m.x - 85}" y="355" width="170" height="150" rx="22" fill="#16254a" fill-opacity=".6" stroke="#3a5aa8" stroke-width="2"/>
      <rect id="ps-mg${i}" x="${m.x - 85}" y="355" width="170" height="150" rx="22" fill="none" stroke="#7fe6ff" stroke-width="3" opacity=".5"/>
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
    <ellipse cx="${PS_Z + 670}" cy="430" rx="250" ry="230" fill="url(#ps-soma)" stroke="#34508f" stroke-width="2"/>
    <path d="M${PS_Z + 320} 290 Q${PS_Z + 334} 430 ${PS_Z + 320} 570" stroke="#3a5aa8" stroke-width="3" fill="none"/>
    ${rec}
    <rect x="${PS_X0 - 10}" y="417" width="${PS_X1 - PS_X0 + 40}" height="26" rx="13" fill="#101a36" stroke="#26345a" stroke-width="1.5"/>
    <line id="ps-belt" x1="${PS_X0}" y1="430" x2="${PS_X1 + 20}" y2="430" stroke="#2c3d6b" stroke-width="2" stroke-dasharray="6 14"/>
    ${chutes}
    <circle id="ps-ves" cx="${PS_Z + 210}" cy="430" r="58" fill="${PS_HUE[PS_NT.id]}" fill-opacity=".1" stroke="${PS_HUE[PS_NT.id]}" stroke-opacity=".7" stroke-width="2"/>
    ${mach}
    ${PSP.map((_, k) => `<circle id="ps-q${k}" r="8" opacity="0"/>`).join("")}
    ${[0, 1, 2, 3, 4, 5].map(k => `<circle id="ps-rd${k}" r="6" fill="${PS_HUE[PS_NT.id]}" opacity="0"/>`).join("")}
    ${[0, 1].map(k => `<circle id="ps-cd${k}" r="6" fill="${PS_HUE[PS_NT.id]}" opacity="0"/>`).join("")}
  </svg>`;
}
function psTagsHtml() {
  const ev = e => `<em class="ev ev-${e}">${e[0].toUpperCase() + e.slice(1)} evidence</em>`;
  return `<div class="ps-tags">
    ${PSM.map((m, i) => `<span class="ps-tag ps-hit" data-ps="enz:${i}" data-wx="${m.x}" data-wy="430" aria-label="${esc(m.name)}"></span>`).join("")}
    ${PS_MOLS.map((m, i) => `<span class="ps-tag ps-mol" data-ps="mol:${i}" data-wx="${m.x}" data-wy="476"><i style="background:${PS_COL[i]}"></i>${esc(m.name)}</span>`).join("")}
    ${PSM.map(m => `<span class="ps-tag ps-enz" data-ps="enz:${PSM.indexOf(m)}" data-wx="${m.x}" data-wy="532">${esc(m.name)}${m.rl ? "<em>Slowest step</em>" : ""}</span>`).join("")}
    ${PS_SUP.map((s, i) => `<span class="ps-tag ps-sup" data-ps="sup:${i}" data-wx="${s.x - 150}" data-wy="104" data-on="${s.on}"><b>${esc(s.name)}</b>${s.ev ? ev(s.ev) : ""}</span>`).join("")}
    ${PSM.map((m, i) => m.co.map((c, j) => `<span class="ps-tag ps-co" data-ps="co:${i}:${j}" data-m="${i}" data-j="${j}">${esc(c)}</span>`).join("")).join("")}
    ${PS_MODS.map((m, i) => `<span class="ps-tag ps-mod" aria-hidden="true" data-wx="${m.x}" data-wy="${m.y}" data-i="${i}"><b>${esc(m.name)}</b><small>${esc(m.role)} · <em class="ev ev-${m.ev}">${m.ev[0].toUpperCase() + m.ev.slice(1)}</em></small></span>`).join("")}
  </div>`;
}
function pathwayHtml(nt) {
  psSetup(nt);
  const B = PATHWAY_SCENE.buttons;
  return `
  <section class="ns ps" id="ps" style="${psHeight(PSB.length + 2)}" aria-label="How your body makes ${esc(psLabel(nt))}, a scroll-through map">
    <div class="sr">${PSB.map(b => `<p><b>${esc(b[1])}.</b> ${esc(b[2])}</p>`).join("")}</div>
    <div class="ns-stage ps-stage" id="ps-stage">
      ${psSceneHtml()}
      ${psTagsHtml()}
      <div class="ns-legend ps-legend" aria-hidden="true">${PS_MOLS.map((m, i) => `<span class="ns-chip on"><i style="background:${PS_COL[i]}"></i>${esc(m.name)}</span>`).join("")}${PS_SUP.length ? `<span class="ns-chip on ps-supkey"><i class="ring"></i>${esc(B.legendSupplement)}</span>` : ""}</div>
      <div class="ns-cap" id="ps-cap" aria-hidden="true">
        <p class="ns-t" id="ps-t">${esc(PSB[0][1])}</p><p class="ns-b" id="ps-b">${esc(PSB[0][2])}</p>
        <p class="ps-hint" id="ps-hint" hidden>${esc(PATHWAY_SCENE.explore.hint)}</p>
        <div class="ps-modlist" id="ps-modlist" hidden>${PS_MODS.map(m => `<span><b>${esc(m.name)}</b> ${esc(m.role.toLowerCase())}</span>`).join("")}</div>
      </div>
      <div class="ns-prog" aria-hidden="true"><i id="ps-pf"></i></div>
      <div class="ps-pop" id="ps-pop" role="dialog" aria-live="polite" hidden></div>
      <div class="ps-intro" id="ps-intro">
        <span class="eyebrow">${esc(nt.cls)} · ${esc(nt.abbr)}</span>
        <h1>${esc(nt.name)} is <em style="color:${PS_HUE[nt.id]}">${esc(nt.word.toLowerCase())}</em>.</h1>
        <p class="ps-intro-lede">${esc(nt.fn)}</p>
        <div class="ps-intro-bal" id="ps-intro-bal">
          <div><h3>Often linked to low levels</h3><ul>${nt.low.map(x => `<li>${gloss(x)}</li>`).join("")}</ul></div>
          <div><h3>Often linked to too much</h3><ul>${nt.high.map(x => `<li>${gloss(x)}</li>`).join("")}</ul></div>
        </div>
      </div>
    </div>
  </section>`;
}
// Same scrolling per caption as the home page scenes: (112svh - 0.2 x stage) per caption, plus one stage height.
function psHeight(n) {
  const stage = u => `clamp(440px, calc(100${u} - var(--chrome-h, 62px) - 24px), 780px)`;
  return ["vh", "svh"].map(u => `height: calc(${n * 112}${u} - ${(0.2 * n - 1).toFixed(2)} * ${stage(u)})`).join("; ") + ";";
}
function psRefs() {
  const $ = id => document.getElementById(id), st = PS.stage;
  return {
    hint: $("ps-hint"), pop: $("ps-pop"),
    legend: st.querySelector(".ps-legend"),
    intro: $("ps-intro"), introBal: $("ps-intro-bal"),
    world: $("ps-world"), belt: $("ps-belt"), ves: $("ps-ves"), q: PSP.map((_, k) => $("ps-q" + k)),
    mg: PSM.map((_, i) => $("ps-mg" + i)), r: PSM.map((_, i) => $("ps-r" + i)), cg: PS_SUP.map((_, i) => $("ps-cg" + i)),
    rd: [0, 1, 2, 3, 4, 5].map(k => $("ps-rd" + k)), cd: [0, 1].map(k => $("ps-cd" + k)), rg: PS_REC.map((_, k) => $("ps-rg" + k)),
    tags: [...st.querySelectorAll(".ps-tag")], cap: $("ps-cap"), t: $("ps-t"), b: $("ps-b"), modlist: $("ps-modlist"), pf: $("ps-pf")
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
    const o = on * (g.chute ? nsC(g.u * 8) : 1) * (1 - nsC((q.dx - (PS_Z + 95)) / 45));
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
    if (u < .35) { const v = u / .35; x = nsL(PS_Z + 268, PS_Z + 324, v); y = nsL(430 + dy * .4, 430 + dy * .8, v); }
    else { const v = nsC((u - .35) / .45); x = nsL(PS_Z + 324, PS_REC[r][0] - 12, v); y = nsL(430 + dy * .8, PS_REC[r][1], v); }
    const o = zv * nsC(u * 10) * (1 - nsS(nsG(u, .82, .95)));
    recGlow[r] = Math.max(recGlow[r], nsW(u, .72, .8, .86, .96));
    el.setAttribute("cx", x.toFixed(1)); el.setAttribute("cy", y.toFixed(1)); el.setAttribute("opacity", f(PS.rm ? zv * (u < .8 ? 1 : 0) : o));
  });
  R.rg.forEach((el, r) => el.setAttribute("opacity", f(zv * recGlow[r])));
  R.cd.forEach((el, k) => { const P = 3.2, u = ((t + k * 1.6) % P) / P; el.setAttribute("cx", nsL(PS_Z + 370, PS_Z + 348, u).toFixed(1)); el.setAttribute("cy", nsL(470, 640, u).toFixed(1)); el.setAttribute("opacity", f(zv * nsC(u * 8) * (1 - u))); });
  // overlays
  const place = (el, wx, wy, o) => {
    const x = (wx - vx) * sc, y = (wy - vy) * sc, inside = x > -120 && x < PS.W + 120 && y > -60 && y < PS.H + 60;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
    el.style.opacity = inside ? f(o) : "0";
  };
  // Labels only show once the camera is close enough for them not to overlap.
  const zoomed = lo => nsC((sc - lo) / .2);
  R.legend.style.opacity = (1 - .85 * zoomed(1.05)).toFixed(3);   // the color key is for the wide view; close up, every dot has its own label
  // Full-pipeline view (start and end): every label shows, laid out like the end map.
  const ovSc = PS.W / Math.max(PSK[0][3], PSK[0][4] * PS.A), full = sc <= ovSc * 1.12;
  // End of the scene: the whole chain is clickable (explore mode).
  const explore = p >= .965;
  if (explore !== PS.explore) {
    PS.explore = explore; PS.stage.classList.toggle("explore", explore); R.hint.hidden = !explore;
    R.tags.forEach(el => { if (el.dataset.ps) { el.tabIndex = explore ? 0 : -1; el.setAttribute("role", "button"); } });
    if (!explore) psClosePop();
  }
  R.tags.forEach(el => {
    const c = el.classList;
    if (c.contains("ps-hit")) {
      el.style.width = (170 * sc).toFixed(0) + "px"; el.style.height = (150 * sc).toFixed(0) + "px";
      place(el, +el.dataset.wx, +el.dataset.wy, explore ? 1 : 0);
    } else if ((explore || full) && c.contains("ps-co")) {
      const m = PSM[+el.dataset.m], j = +el.dataset.j, off = m.co.length === 2 ? (j ? 1 : -1) * Math.max(50, 30 / sc) : 0;
      place(el, m.x + off, 355 - 22 / sc, 1);
    } else if ((explore || full) && c.contains("ps-sup")) {
      place(el, +el.dataset.wx, +el.dataset.wy, 1); c.remove("hot");
    } else if (c.contains("ps-co")) {
      // Cofactors sit docked on their enzyme; in the cofactor part they lift off (line stops), then dock back.
      const m = PSM[+el.dataset.m], j = +el.dataset.j, off = m.co.length === 2 ? (j ? 1 : -1) * Math.max(50, 30 / sc) : 0;
      const k = p < m.dock - .012 ? nsS(nsG(p, .60, .612)) : 1 - nsS(nsG(p, m.dock - .012, m.dock));
      const show = Math.max(nsS(nsG(p, .585, .60)), zoomed(.8));
      place(el, m.x + off * (1 + 1.4 * k), nsL(346, 240, k), show);
    } else if (c.contains("ps-enz")) {
      place(el, +el.dataset.wx, explore || full ? 545 : +el.dataset.wy, explore || full ? 1 : zoomed(.5));
    } else if (c.contains("ps-sup")) {
      const on = +el.dataset.on; place(el, +el.dataset.wx, +el.dataset.wy, (.45 + .55 * nsS(nsG(p, on - .015, on + .005))) * zoomed(.5));
      c.toggle("hot", p >= on - .01 && p < on + .085);
    } else if (c.contains("ps-mod")) {
      const s0 = .80 + +el.dataset.i * .01; place(el, +el.dataset.wx, +el.dataset.wy, nsS(nsG(p, s0, s0 + .02)) * (1 - nsS(nsG(p, .95, .97))));
    } else place(el, +el.dataset.wx, +el.dataset.wy, 1);
  });
  R.pf.style.height = (p * 100).toFixed(1) + "%";
  let bi = 0; PSB.forEach((b, i) => { if (p >= b[0]) bi = i; }); psBeat(bi);
  R.modlist.hidden = !(PS.stage.classList.contains("narrow") && p >= .78 && p < .94);
}
function psMeasure() {
  const st = PS.stage; if (!st) return;
  // Set the top-bar height first: it changes the stage's size, which we measure next.
  const ch = document.querySelector(".chrome"); if (ch) document.documentElement.style.setProperty("--chrome-h", ch.offsetHeight + "px");
  PS.W = st.clientWidth || 1000; PS.H = st.clientHeight || 600; PS.A = PS.W / PS.H;
  st.classList.toggle("narrow", PS.W < 640);
}
// The first PS_I of the scroll is the intro (heading, then the low/high cards); the line runs in the rest.
const psIntroShare = () => 2 / (PSB.length + 2);
function psProgress() {
  const sec = document.getElementById("ps"); if (!sec || !PS.stage) return null;
  const r = sec.getBoundingClientRect(), top = parseFloat(getComputedStyle(PS.stage).top) || 0;
  PS.visible = r.bottom > -50 && r.top < (window.innerHeight || 800) + 50;
  const raw = nsC((top - r.top) / Math.max(1, r.height - PS.stage.offsetHeight)), I = psIntroShare();
  psIntro(raw / I);
  return nsC((raw - I) / (1 - I));
}
function psIntro(q) {
  const R = PS.refs; if (!R || !R.intro) return;
  const out = nsS(nsG(q, .82, 1));
  R.intro.style.opacity = (1 - out).toFixed(3);
  R.intro.style.visibility = out >= 1 ? "hidden" : "visible";
  R.introBal.style.opacity = nsS(nsG(q, .35, .55)).toFixed(3);
  R.introBal.style.transform = `translateY(${(14 * (1 - nsS(nsG(q, .35, .55)))).toFixed(1)}px)`;
  R.cap.style.opacity = out.toFixed(3);
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
  PS.refs = psRefs(); PS.beat = 0; PS.explore = null; PS.rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  PSP.forEach(q => { q.dx = null; });
  psMeasure(); const p = psProgress(); PS.p = p === null ? 0 : p; psFrame(PS.p, 0); psOnScroll();
}
window.addEventListener("scroll", psOnScroll, { passive: true });
window.addEventListener("resize", () => { psMeasure(); psOnScroll(); if (PS.refs) psFrame(PS.p, 0); });


// ---------------------------------------------------------------------------
// Explore mode: click any part of the finished chain for a short info card.
// All wording comes from existing content (enzymes.js, supplement-links.js,
// neurotransmitters.js); labels are in content/scene-captions.js (explore).
// ---------------------------------------------------------------------------
function psCard(kind, title, body, link) {
  const X = PATHWAY_SCENE.explore;
  return `<button class="ps-pop-x" type="button" data-ps-close aria-label="${esc(X.close)}">×</button>
    <span class="ps-pop-kind">${esc(kind)}</span><h3>${esc(title)}</h3>${body}
    ${link ? `<a class="ps-pop-more" href="#${link}" data-go="${link}">${esc(X.readMore)}</a>` : ""}`;
}
function psPopHtml(ref) {
  const X = PATHWAY_SCENE.explore, nt = PS_NT, [kind, a, b] = ref.split(":"), i = +a;
  const path = nt.path, fin = path.findIndex(s => s.final);
  if (kind === "mol") {
    const m = PS_MOLS[i], step = path.filter(s => s.m)[i], last = i === PS_MOLS.length - 1;
    if (last) {
      const after = [];
      for (let k = fin + 1; k + 1 < path.length; k += 2) after.push(`<li>${esc(path[k].e)} → <b>${esc(path[k + 1].m)}</b></li>`);
      return psCard(X.kinds.neurotransmitter, m.name, `<p>${gloss(nt.fn)}</p>${after.length ? `<p class="ps-pop-sub">${esc(X.after)}</p><ul>${after.join("")}</ul>` : ""}`);
    }
    const idx = path.indexOf(step), next = path[idx + 1], to = path[idx + 2];
    const sups = (step.from || []).filter(id => byId[id]);
    return psCard(X.kinds.molecule, m.name,
      `${sups.length ? `<p class="ps-pop-sub">${esc(X.from)}</p><ul>${sups.map(id => `<li><b>${esc(byId[id].name)}</b>${psRow(id) ? `: ${gloss(psRow(id)[4])}` : ""}</li>`).join("")}</ul>` : ""}
       <p class="ps-pop-sub">${esc(X.next)}</p><p>${esc(next.e)} → <b>${esc(to.m)}</b></p>`);
  }
  if (kind === "enz") {
    const m = PSM[i], e = enzymeFor(m.name);
    return psCard(X.kinds.enzyme + (m.rl ? ` · ${X.slowest}` : ""), e ? e.name : m.name,
      `${e ? `<p>${gloss(e.sum)}</p>` : ""}${m.co.length ? `<p class="ps-pop-sub">${esc(X.needs)}</p><p>${m.co.map(esc).join(", ")}</p>` : ""}`,
      e ? `enzyme:${e.id}` : null);
  }
  if (kind === "co") {
    const m = PSM[i], j = +b, step = path.filter(s => s.e)[i], [label, id] = step.co[j], e = enzymeFor(m.name), r = psRow(id);
    return psCard(X.kinds.cofactor, label,
      `${e && e.needs[label] ? `<p>${gloss(e.needs[label])}</p>` : ""}${r ? `<p class="ps-pop-sub">${esc(X.inSupplements)} ${esc(byId[id].name)}</p><p>${gloss(r[4])}</p>` : ""}`,
      `${nt.id}.${id}`);
  }
  if (kind === "sup") {
    const s = PS_SUP[i];
    return psCard(X.kinds.supplement + (s.ev ? ` · ${s.ev[0].toUpperCase() + s.ev.slice(1)} ${X.evidence}` : ""), byId[s.id].name, `<p>${gloss(s.note)}</p>`, `${nt.id}.${s.id}`);
  }
  return "";
}
function psOpenPop(el) {
  const R = PS.refs; if (!R || !PS.explore) return;
  R.tags.forEach(t => t.classList.toggle("sel", t === el));
  R.pop.innerHTML = psPopHtml(el.dataset.ps); R.pop.hidden = false;
  // Open on the side away from what was clicked, so the card never covers it.
  const r = el.getBoundingClientRect(), st = PS.stage.getBoundingClientRect();
  R.pop.classList.toggle("left", r.left + r.width / 2 > st.left + st.width / 2);
}
function psClosePop() {
  const R = PS.refs; if (!R || !R.pop) return;
  R.pop.hidden = true; R.tags.forEach(t => t.classList.remove("sel"));
}
document.addEventListener("click", e => {
  if (!PS.refs || !PS.explore) return;
  const t = e.target.closest("[data-ps]");
  if (t && t.closest("#ps-stage")) { psOpenPop(t); return; }
  if (e.target.closest("[data-ps-close]") || (e.target.closest("#ps-stage") && !e.target.closest("#ps-pop"))) psClosePop();
});
document.addEventListener("keydown", e => {
  if (!PS.explore) return;
  if (e.key === "Escape") psClosePop();
  if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("#ps-stage [data-ps]")) { e.preventDefault(); psOpenPop(e.target.closest("[data-ps]")); }
});

// Pause the assembly line (and every CSS animation) while the tab is hidden; resume on return.
document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("tab-hidden", document.hidden);
  if (document.hidden) { if (PS.loop) cancelAnimationFrame(PS.loop); PS.loop = 0; PS.last = 0; }
  else psOnScroll();
});
