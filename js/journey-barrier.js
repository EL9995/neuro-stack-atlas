// ---------------------------------------------------------------------------
// JOURNEY chapter 6, Blood-brain barrier. Two views, both centred on the hero:
//   1. The capillary web: pull back from chapter 5's close-up to red capillaries threading blue brain
//      tissue (every brain cell sits close to one), then push back in to the hero's vessel wall.
//   2. The wall in cross-section: blood above, one layer of wall cells (seams sealed by tight junctions),
//      brain below. Beats: a large molecule bounces off a seam and another gets pumped back out; small
//      fat-soluble ones pass straight through; a door (LAT1, two lobes that rock: open to the blood, then
//      to the cell) carries amino acids one at a time; the hero queues behind competitors from a protein
//      meal, crosses through the blood-side door, the cell and the brain-side door; red resolves to
//      brand blue as it gets in.
// Drawn in screen units (the viewBox is the screen); the wall uses world units (y 0 = blood-side
// membrane, y 140 = brain-side membrane) scaled around the hero.
// Core and chapter system: js/journey.js. Wording and beats: JOURNEY.barrier / barrierChoreo.
// ---------------------------------------------------------------------------

const JY_BB = { wall: 140, seams: [-750, -250, 250, 750], door1: [-70, 0], door2: [10, 140], pump: [120, 0] };

// A branching vessel: each segment a gentle curve, splitting in two and narrowing; segments are collected
// by depth (out[0] = trunks ... out[n-1] = finest) so each width is one path.
function jyBbTree(rnd, x, y, ang, len, depth, out, lvl = 0) {
  const a = ang + (rnd() - .5) * 0.5, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, bend = (rnd() - .5) * len * 0.5;
  const mx = (x + ex) / 2 - Math.sin(a) * bend, my = (y + ey) / 2 + Math.cos(a) * bend;
  out[lvl] = (out[lvl] || "") + `M${x.toFixed(0)} ${y.toFixed(0)}Q${mx.toFixed(0)} ${my.toFixed(0)} ${ex.toFixed(0)} ${ey.toFixed(0)}`;
  if (depth > 1) [-1, 1].forEach(sd => jyBbTree(rnd, ex, ey, a + sd * (0.35 + rnd() * 0.4), len * (0.72 + rnd() * 0.12), depth - 1, out, lvl + 1));
  return out;
}
// Brain tissue, close up: capillary trees winding between neurons (pyramidal cells, apical dendrite up,
// as in the cortex), with the hero's capillary through (0, 0), level there so the push-in lands on a
// horizontal wall. Seeded: same every visit.
const JY_BB_NET = (() => {
  let r = 41; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const trees = [];
  // trunks branch off the hero's vessel and off-screen vessels, spreading across the view
  [[-500, -10, -1.9], [350, 30, -1.2], [-150, 0, 1.7], [700, 60, 1.3], [-900, 60, 2.2], [-1100, -700, 0.2], [1100, -650, 2.9], [-1000, 800, -0.3], [1050, 750, -2.8]]
    .forEach(([x, y, a]) => jyBbTree(rnd, x, y, a, 250, 5, trees));
  const hero = "M-1400 120 C-900 -60 -450 0 0 0 S800 110 1400 -60";
  let soma = "", proc = "";
  const f = v => v.toFixed(0);
  for (let n = 0, tries = 0; n < 34 && tries < 600; tries++) {
    const x = (rnd() - .5) * 2200, y = (rnd() - .5) * 1700;
    if (Math.abs(y) < 110 || Math.hypot(x, y) < 220) continue;   // keep the hero's vessel and spot clear
    n++;
    const s = 14 + rnd() * 9, t = (rnd() - .5) * 0.5, c = Math.cos(t), sn = Math.sin(t);
    const P = (dx, dy) => [x + dx * c - dy * sn, y + dx * sn + dy * c];   // rotate a local point
    const pt = (dx, dy) => P(dx, dy).map(f).join(" ");
    soma += `M${pt(0, -s * 1.5)}Q${pt(s * 0.4, -s * 0.2)} ${pt(s, s * 0.8)}Q${pt(0, s * 1.2)} ${pt(-s, s * 0.8)}Q${pt(-s * 0.4, -s * 0.2)} ${pt(0, -s * 1.5)}Z`;
    const ap = 150 + rnd() * 140, w = () => (rnd() - .5) * 40;
    proc += `M${pt(0, -s * 1.5)}Q${pt(w(), -ap * 0.5)} ${pt(w(), -ap)}`;                                        // apical dendrite
    proc += `M${pt(w() * 0.3, -ap * 0.45)}Q${pt(-40, -ap * 0.6)} ${pt(-70 - w(), -ap * 0.75)}M${pt(w() * 0.3, -ap * 0.6)}Q${pt(40, -ap * 0.75)} ${pt(70 + w(), -ap * 0.9)}`;
    [-1, 1].forEach(sd => proc += `M${pt(sd * s, s * 0.8)}Q${pt(sd * (s + 40), s + 30 + w())} ${pt(sd * (s + 70 + w()), s + 80 + w())}`);   // basal dendrites
    proc += `M${pt(0, s * 1.2)}Q${pt(w(), s + 120)} ${pt(w(), s + 220 + rnd() * 80)}`;                         // axon
  }
  return { trees, hero, soma, proc };
})();

// The whole brain, side view (frontal lobe left), in its own units. An artery branches over the surface;
// the hero's spot is where one of its fine branches ends, and the drawing is shifted so that spot is (0, 0).
const JY_BB_BRAIN = (() => {
  let r = 7; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const cerebrum = "M-440 120C-470 0 -430 -160 -320 -240C-200 -320 0 -340 160 -310C320 -280 450 -180 470 -40C485 60 450 140 380 180C330 205 260 200 220 190C160 230 60 250 -40 240C-140 230 -200 200 -230 150C-260 175 -330 190 -380 175C-420 165 -440 145 -440 120Z";
  let folds = "";   // meandering grooves, clipped to the cerebrum
  for (let i = 0; i < 48; i++) {
    let x = -440 + rnd() * 900, y = -330 + rnd() * 560, a = rnd() * 6.28;
    folds += `M${x.toFixed(0)} ${y.toFixed(0)}`;
    for (let k = 0; k < 3; k++) {
      a += (rnd() - .5) * 1.8;
      const nx = x + Math.cos(a) * 50, ny = y + Math.sin(a) * 50;
      folds += `Q${(x + Math.cos(a - 0.6) * 40).toFixed(0)} ${(y + Math.sin(a - 0.6) * 40).toFixed(0)} ${nx.toFixed(0)} ${ny.toFixed(0)}`;
      x = nx; y = ny;
    }
  }
  let folia = "";
  for (let y = 205; y < 330; y += 16) folia += `M160 ${y}Q300 ${y + 14} 440 ${y - 4}`;
  const art = jyBbTree(rnd, -210, 140, -0.75, 120, 4, []);
  // the hero's spot: the end of a fine branch near the top of the brain
  const ends = [...art[3].matchAll(/ (-?\d+) (-?\d+)(?=M|$)/g)].map(m => [+m[1], +m[2]]);
  const spot = ends.reduce((b, p) => Math.hypot(p[0] + 20, p[1] + 150) < Math.hypot(b[0] + 20, b[1] + 150) ? p : b);
  return { cerebrum, folds, folia, art, spot };
})();
// Molecules in the wall view: [id, radius, colour]. c = amino acids (competitors), s = small fat-soluble,
// b = large or water-loving (turned away), p = pumped back out.
const JY_BB_MOLS = [["c0", 5, "#9fb0d8"], ["c1", 5, "#9fb0d8"], ["c2", 5, "#9fb0d8"], ["c3", 5, "#9fb0d8"], ["c4", 5, "#9fb0d8"],
  ["s0", 3.5, "#ffe08a"], ["s1", 3.5, "#ffe08a"], ["b0", 10, "#c9a8e6"], ["b1", 10, "#c9a8e6"], ["p0", 5, "#f29bb5"]];

// Where things are over the chapter. Keyframes [q, x, y] (eased between), built from the beats.
const JY_BB_QUEUE = k => [JY_BB.door1[0] + (k % 2) * 4, -24 - 16 * k];
function jyBbPass(t, [ex, ey]) {   // through the blood-side door, across the cell, out the brain-side door, on to [ex, ey]
  const [ax, ay] = JY_BB.door1, [bx, by] = JY_BB.door2;
  return [[t, ...JY_BB_QUEUE(0)], [t + 0.008, ax, ay], [t + 0.026, ax, ay + 2], [t + 0.034, ax + 4, 22], [t + 0.05, bx - 4, by - 22],
    [t + 0.056, bx, by], [t + 0.074, bx, by + 2], [t + 0.082, bx + 4, by + 22], [t + 0.11, ex, ey]];
}
// Door state over the chapter: 0 = open to the side above, 1 = open below. Each passage rocks it over
// and back, empty.
function jyBbDoor(q, times) {
  let s = 0;
  times.forEach(t => { s = Math.max(s, jySmooth(jyClamp((q - t) / 0.018)) * (1 - jySmooth(jyClamp((q - t - 0.022) / 0.012)))); });
  return s;
}
function jyBbPlan(C) {
  const [d0, q0, x0] = [C.door[0] + 0.02, C.queue[0], C.cross[0]];
  const tops = [d0, q0 + 0.02, q0 + 0.065, x0];   // c0, c1, c2, hero step into the blood-side door
  const park = (x, y, a, b) => [[a, x, y], [b, x, y]];
  const H = [[0, -20, -70], [C.door[1] - 0.02, -40, -76], [q0 + 0.02, ...JY_BB_QUEUE(2)], [q0 + 0.04, ...JY_BB_QUEUE(1)], [tops[2] - 0.004, ...JY_BB_QUEUE(1)], [tops[2] + 0.012, ...JY_BB_QUEUE(0)], ...jyBbPass(tops[3], [30, 230]), [1, 60, 290]];
  return {
    tops, hero: H,
    door1: tops.map(t => t + 0.008), door2: tops.map(t => t + 0.056),
    pump: [C.away[0] + 0.07],
    mols: {
      c0: [[0, -200, -300], [d0 - 0.03, -110, -120], ...jyBbPass(d0, [-150, 330])],
      c1: [[0, -120, -330], [C.door[1] - 0.02, -130, -150], [q0 + 0.01, ...JY_BB_QUEUE(0)], ...jyBbPass(tops[1], [190, 310])],
      c2: [[0, -60, -290], [C.door[1] - 0.02, -170, -220], [q0 + 0.015, ...JY_BB_QUEUE(1)], [q0 + 0.04, ...JY_BB_QUEUE(0)], ...jyBbPass(tops[2], [-60, 400])],
      c3: [[0, -260, -330], [q0 + 0.02, -150, -200], [q0 + 0.06, ...JY_BB_QUEUE(3)], [tops[2] + 0.02, ...JY_BB_QUEUE(2)], [tops[3] + 0.02, ...JY_BB_QUEUE(1)], [1, ...JY_BB_QUEUE(1)]],
      c4: [[0, -300, -290], [q0 + 0.05, -180, -250], [q0 + 0.09, ...JY_BB_QUEUE(3)], [tops[3] + 0.02, ...JY_BB_QUEUE(2)], [1, ...JY_BB_QUEUE(2)]],
      // small fat-soluble: straight through membrane, cell and membrane, no door
      s0: [[0, 40, -200], [C.through[0], 50, -60], [C.through[0] + 0.03, 52, 0], [C.through[0] + 0.055, 46, 140], [C.through[1] + 0.04, 60, 300]],
      s1: [[0, 110, -240], [C.through[0] + 0.02, 85, -70], [C.through[0] + 0.05, 82, 0], [C.through[0] + 0.075, 76, 140], [C.through[1] + 0.06, 90, 310]],
      // large: drifts to a seam, bounces off the tight junction; the other bumps the membrane
      b0: [[0, 330, -170], ...park(330, -150, C.wall[0], C.away[0]), [C.away[0] + 0.035, 254, -12], [C.away[0] + 0.065, 360, -130], [1, 420, -170]],
      b1: [[0, 200, -220], ...park(210, -170, C.wall[0], C.away[0] + 0.01), [C.away[0] + 0.045, 190, -12], [C.away[0] + 0.075, 170, -150], [1, 140, -200]],
      // pumped: slips into the membrane, the pump grabs it from the cell side and throws it back out
      p0: [[0, 190, -150], ...park(180, -110, C.wall[0], C.away[0] + 0.02), [C.away[0] + 0.05, 160, 10], [C.away[0] + 0.07, JY_BB.pump[0], 6], [C.away[0] + 0.088, JY_BB.pump[0], -4], [C.away[0] + 0.11, 150, -150], [1, 160, -170]],
    },
  };
}
function jyBbAt(P, q) {
  let j = 0; while (j < P.length - 2 && q > P[j + 1][0]) j++;
  const t = jySmooth(jyClamp((q - P[j][0]) / ((P[j + 1][0] - P[j][0]) || 1)));
  return [jyLerp(P[j][1], P[j + 1][1], t), jyLerp(P[j][2], P[j + 1][2], t)];
}
// Colours resolve from blood red to the brand's deep blues as the hero gets in.
const JY_BB_TONES = { lumen: ["#7a1527", "#1a2146"], cell: ["#b4636a", "#3f4a7c"], mem: ["#e7a59c", "#8fa3e0"], nuc: ["#8e3c4c", "#2c3566"], brain: ["#24307a", "#121a4a"] };
function jyMix(a, b, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(jyLerp(v, B[i], t)).toString(16).padStart(2, "0")).join("");
}

function jyBarrierSvg() {
  const B = JY_BB, N = JY_BB_NET, BR = JY_BB_BRAIN, w = B.wall;
  const lobes = cls => `<g class="${cls}"><rect x="-17" y="-22" width="15" height="44" rx="7"/><rect x="2" y="-22" width="15" height="44" rx="7"/></g>`;
  const tj = x => `<path class="jy-bb-tj" d="${[6, 14, 22, 30, 38].map(y => `M${x - 7} ${y}h14`).join("")}"/>`;
  const neuron = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -14L12 8L-12 8Z"/><path d="M0 -14L-6 -60M0 -14L14 -52M12 8L60 30M-12 8L-58 22M0 8L4 70" fill="none" stroke-width="3"/></g>`;
  return `<svg class="jy-head" id="jy-barrier" viewBox="0 0 1000 1000" preserveAspectRatio="none">
    <defs><radialGradient id="jy-bb-tissue" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#22306e"/><stop offset="1" stop-color="#0e1434"/></radialGradient></defs>
    <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#jy-bb-tissue)"/>
    <g id="jy-bb-net">
      <g fill="none" stroke-linecap="round">
        <path d="${N.trees.join("")}${N.hero}" stroke="#5e0f20" stroke-width="22"/>
        ${N.trees.map((d, i) => `<path d="${d}" stroke="#c8344a" stroke-width="${[16, 13, 10, 8, 7][i]}"/>`).join("")}
        <path d="${N.hero}" stroke="#d93a52" stroke-width="10"/>
      </g>
      <path d="${N.proc}" fill="none" stroke="#8ea2ee" stroke-width="5" stroke-linecap="round" opacity=".6"/>
      <path d="${N.soma}" fill="#a9b9f5" opacity=".85"/>
    </g>
    <g id="jy-bb-whole" opacity="0">
      <g transform="translate(${-BR.spot[0]} ${-BR.spot[1]})">
        <radialGradient id="jy-bb-cgrad" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#3d50b0"/><stop offset="1" stop-color="#26347e"/></radialGradient>
        <clipPath id="jy-bb-cclip"><path d="${BR.cerebrum}"/></clipPath>
        <clipPath id="jy-bb-kclip"><ellipse cx="300" cy="262" rx="140" ry="74"/></clipPath>
        <path d="M150 210C150 300 170 360 185 440L245 440C230 360 225 300 235 215Z" fill="#26346f" stroke="#6f84d8" stroke-width="4"/>
        <ellipse cx="300" cy="262" rx="140" ry="74" fill="#2a3a82" stroke="#6f84d8" stroke-width="4"/>
        <path d="${BR.folia}" clip-path="url(#jy-bb-kclip)" fill="none" stroke="#16204e" stroke-width="5"/>
        <path d="${BR.cerebrum}" fill="url(#jy-bb-cgrad)" stroke="#7d92e0" stroke-width="5"/>
        <path d="${BR.folds}" clip-path="url(#jy-bb-cclip)" fill="none" stroke="#1f2b6e" stroke-width="7" stroke-linecap="round" opacity=".8"/>
        <path d="M-230 145C-120 85 20 60 170 20M50 -330C25 -220 75 -120 35 -10" clip-path="url(#jy-bb-cclip)" fill="none" stroke="#16204e" stroke-width="9" stroke-linecap="round"/>
        <g fill="none" stroke="#e0485f" stroke-linecap="round">${BR.art.map((d, i) => `<path d="${d}" stroke-width="${[9, 7, 5, 3.5][i]}"/>`).join("")}</g>
      </g>
    </g>
    <circle id="jy-bb-mark" r="22" fill="none" stroke="#7fe6ff" stroke-width="2" opacity="0"/>
    <g id="jy-bb-wall">
      <rect id="jy-bb-lumen" x="-3000" y="-3000" width="6000" height="3000"/>
      <rect id="jy-bb-brain" x="-3000" y="${w}" width="6000" height="3000"/>
      <g id="jy-bb-neurons" fill="#4a5ca8" stroke="#4a5ca8" opacity="0">${neuron(-240, 420, 1.3)}${neuron(220, 360, 1)}${neuron(620, 520, 1.5)}</g>
      <rect id="jy-bb-cell" x="-3000" y="0" width="6000" height="${w}"/>
      ${[-560, 150, 640].map(x => `<ellipse class="jy-bb-nuc" cx="${x}" cy="${w / 2}" rx="62" ry="24"/>`).join("")}
      <path class="jy-bb-mem" d="M-3000 0H3000M-3000 ${w}H3000${B.seams.map(x => `M${x} 0V${w}`).join("")}"/>
      ${B.seams.map(tj).join("")}
      <g id="jy-bb-rbc">${[0, 1].map(i => `<g class="jy-bb-rbc" data-i="${i}"><ellipse rx="50" ry="30" fill="#c8344a"/><ellipse rx="27" ry="14" fill="#9e1f35"/></g>`).join("")}</g>
      <g id="jy-bb-d1" class="jy-bb-door" transform="translate(${B.door1})">${lobes("l")}</g>
      <g id="jy-bb-d2" class="jy-bb-door" transform="translate(${B.door2})">${lobes("l")}</g>
      <g id="jy-bb-pump" class="jy-bb-door jy-bb-pump" transform="translate(${B.pump})">${lobes("l")}</g>
      ${JY_BB_MOLS.map(([id, r, c]) => `<circle id="jy-bb-${id}" r="${r}" fill="${c}"/>`).join("")}
    </g>
    <g class="jy-bb-labels">${["blood", "cell", "brain", "tj", "door", "pump"].map(k => `<text id="jy-bb-t-${k}">${esc(JOURNEY.labels.barrier[k])}</text>`).join("")}</g>
  </svg>`;
}

// Set a view's opacity; take it out of rendering entirely when invisible (a hidden, hugely zoomed view
// still costs paint time otherwise).
function jyBbShow(el, op) { el.setAttribute("opacity", op.toFixed(3)); el.style.display = op < 0.002 ? "none" : ""; }

function jyFrameBarrier(q, v, own) {
  const C = JOURNEY.barrierChoreo, S = JOURNEY.stomachChoreo, { H, rm } = v, W = innerWidth, cx = W / 2, cy = H / 2;
  const span = ([a, b]) => jyClamp((q - a) / (b - a));
  const u = Math.min(W, H) / 820;
  const plan = JY.bbPlan || (JY.bbPlan = jyBbPlan(C));
  document.getElementById("jy-barrier").setAttribute("viewBox", `0 0 ${W} ${H}`);
  // 1. Brain tissue, then the whole brain: one continuous zoom out from chapter 5's close-up (still tilted
  // like its ending) until the tissue is a spot on the brain, then back in to the hero's vessel wall.
  // zn = px per tissue unit (log-eased); the brain is drawn at zn * C.brainRatio.
  const out = jySmooth(span(C.pull)), back = jySmooth(span(C.push)), toWall = jySmooth(span(C.toWall));
  const lz = (a, b, t) => Math.exp(jyLerp(Math.log(a), Math.log(b), t));
  const zn = rm ? C.netZoom : back > 0 ? lz(C.wholeZoom, C.closeZoom * 2, back) : out < 0.5 ? lz(C.closeZoom, C.netZoom, out * 2) : lz(C.netZoom, C.wholeZoom, out * 2 - 1);
  const whole = rm ? 0 : jySmooth(jyClamp(Math.log(C.netZoom * 1.1 / zn) / Math.log(2)));   // brain cross-fades in while the tissue still fills the screen
  const tilt = -22 * (1 - jySmooth(jyClamp(out * 2)));
  const net = document.getElementById("jy-bb-net");
  net.setAttribute("transform", `translate(${cx} ${cy}) rotate(${tilt.toFixed(2)}) scale(${(zn * u).toFixed(4)})`);
  jyBbShow(net, (1 - toWall) * (1 - whole));
  const wb = document.getElementById("jy-bb-whole");
  wb.setAttribute("transform", `translate(${cx} ${cy}) scale(${(zn * u * C.brainRatio).toFixed(4)})`);
  jyBbShow(wb, whole);
  const mark = document.getElementById("jy-bb-mark");
  mark.setAttribute("cx", cx); mark.setAttribute("cy", cy); mark.setAttribute("opacity", (whole * whole).toFixed(3));
  // 2. The wall, centred on the hero.
  const [hx, hy] = jyBbAt(plan.hero, q);
  const k = rm ? C.wallZoom : q < C.queue[0] ? C.wallZoom * (1 + 0.8 * (1 - toWall))
    : q < C.cross[0] ? jyLerp(C.wallZoom, C.queueZoom, jySmooth(span(C.queue)))
    : q < C.brain[0] ? jyLerp(C.queueZoom, C.crossZoom, jySmooth(span([C.cross[0], C.cross[0] + 0.03])))
    : jyLerp(C.crossZoom, C.brainZoom, jySmooth(span(C.brain)));
  const sc = k * u, wall = document.getElementById("jy-bb-wall");
  wall.setAttribute("transform", `translate(${cx} ${cy}) scale(${sc.toFixed(4)}) translate(${(-hx).toFixed(1)} ${(-hy).toFixed(1)})`);
  jyBbShow(wall, toWall);
  // Red resolves to blue as the hero crosses.
  const res = jySmooth(span([C.cross[0] + 0.03, C.brain[0] + 0.03]));
  const T = JY_BB_TONES, tone = key => jyMix(T[key][0], T[key][1], res);
  if (wall.dataset.res !== res.toFixed(3)) {   // only repaint the big shapes when the colour changes
    wall.dataset.res = res.toFixed(3);
    document.getElementById("jy-bb-lumen").setAttribute("fill", tone("lumen"));
    document.getElementById("jy-bb-cell").setAttribute("fill", tone("cell"));
    document.getElementById("jy-bb-brain").setAttribute("fill", tone("brain"));
    wall.querySelector(".jy-bb-mem").setAttribute("stroke", tone("mem"));
    wall.querySelectorAll(".jy-bb-nuc").forEach(n => n.setAttribute("fill", tone("nuc")));
  }
  document.getElementById("jy-bb-neurons").setAttribute("opacity", (0.6 * jySmooth(span(C.brain))).toFixed(3));
  // Tight junctions glow while the wall is introduced and while a molecule bounces off one.
  const tjOn = Math.max(jySmooth(span([C.wall[0], C.wall[0] + 0.04])) * (1 - jySmooth(span([C.away[0] + 0.08, C.away[1]]))), 0.25);
  wall.style.setProperty("--tj", tjOn.toFixed(3));
  // Doors rock as molecules pass; the pump rocks the other way (it takes from the cell, releases to the blood).
  const lobe = (id, s) => {
    const a = 14 * (1 - 2 * s), [l, r] = document.querySelectorAll(`#${id} rect`);
    l.setAttribute("transform", `rotate(${(-a).toFixed(2)} -9.5 0)`); r.setAttribute("transform", `rotate(${a.toFixed(2)} 9.5 0)`);
  };
  lobe("jy-bb-d1", jyBbDoor(q, plan.door1)); lobe("jy-bb-d2", jyBbDoor(q, plan.door2));
  lobe("jy-bb-pump", 1 - jyBbDoor(q, plan.pump));
  const doorOn = jySmooth(span([C.door[0], C.door[0] + 0.03]));
  document.getElementById("jy-bb-d1").classList.toggle("on", doorOn > 0.5); document.getElementById("jy-bb-d2").classList.toggle("on", doorOn > 0.5);
  // Molecules, with a little drift while they're in the blood.
  const wob = (i, y) => y < -8 ? [6 * Math.sin(q * 40 + i * 1.7), 4 * Math.cos(q * 33 + i)] : [0, 0];
  JY_BB_MOLS.forEach(([id], i) => {
    const [x, y] = jyBbAt(plan.mols[id], q), [wx, wy] = wob(i, y), el = document.getElementById("jy-bb-" + id);
    el.setAttribute("cx", (x + wx).toFixed(1)); el.setAttribute("cy", (y + wy).toFixed(1));
  });
  // Red cells keep sliding past in the blood above (continuity with chapter 5); gone once the colour turns.
  wall.querySelectorAll(".jy-bb-rbc").forEach(g => {
    const i = +g.dataset.i, t = ((i * 0.5 + q * 3) % 1 + 1) % 1;
    g.setAttribute("transform", `translate(${(hx + 900 - t * 1800).toFixed(1)} ${(-170 - 60 * i).toFixed(1)}) rotate(${10 - 25 * i})`);
    g.setAttribute("opacity", (1 - res).toFixed(3));
  });
  // Labels, in screen space next to what they name, each only during its beat.
  // Blood / wall cell / brain sit at the right edge (clear of the chapter dots); the rest are centred on what they name.
  const lab = (key, x, y, on, edge, end) => {
    const el = document.getElementById("jy-bb-t-" + key);
    el.setAttribute("x", edge ? W - 64 : (cx + (x - hx) * sc).toFixed(1)); el.setAttribute("y", (cy + (y - hy) * sc).toFixed(1));
    el.setAttribute("text-anchor", edge || end ? "end" : "middle");
    el.setAttribute("opacity", (on * toWall).toFixed(3));
  };
  const during = ([a, b]) => jySmooth(jyClamp((q - a) / 0.025)) * (1 - jySmooth(jyClamp((q - b) / 0.025)));
  const intro = during([C.wall[0], C.away[0]]);
  lab("blood", 0, -90, intro, true);
  lab("cell", 0, JY_BB.wall / 2 + 5, intro, true);
  lab("brain", 0, JY_BB.wall + 34, Math.max(intro, during(C.brain)), true);
  lab("tj", JY_BB.seams[2] - 12, 116, during([C.wall[0], C.away[1]]), false, true);
  lab("pump", JY_BB.pump[0], -36, during([C.away[0], C.away[1]]));
  lab("door", JY_BB.door1[0], 52, during([C.door[0], C.cross[0] + 0.03]));
  if (!own) return;
  jyActor({ rot: S.floatTilt, zoom: (rm ? 1 : S.sinkZoom) * S.heroZoom, dissolve: 1, spill: S.spill, hero: 1, others: 0, melt: 1, mols: 0 });
}

jyChapter({ key: "barrier", layers: jyBarrierSvg, frame: jyFrameBarrier, notToScale: true });
