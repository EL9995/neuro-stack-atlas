// ---------------------------------------------------------------------------
// JOURNEY chapter 3, Small intestine: out of the stomach through the pylorus (the ring opens around the
// hero granule; the other granules rush past and fade), into the villi. The hero granule dissolves into
// molecules (only molecules can be absorbed), and the hero molecule crosses a lining cell into a capillary.
// Core and chapter system: js/journey.js. Wording and knobs: JOURNEY.intestine / intestineChoreo.
// ---------------------------------------------------------------------------

// The central villus the hero enters: centre x, width, tip y, base y. Lining (the absorbing cells) is
// the outer 36 units; inside it the core carries a capillary loop.
const JY_VIL = { cx: 500, w: 260, top: 420, base: 1400, lining: 36 };
// Hero waypoints [q, x, y]: in the stomach, through the pylorus, the duodenum, out over the villi, beside
// the villus, at its surface, inside a lining cell, in the capillary, down it.
const JY_INT_PATH = C => [[0, 500, -1700], [C.pylorus[1] * 0.6, 500, -930], [C.pylorus[1], 520, -560], [C.villi, 700, 140],
  [C.melt[1], 668, 470], [C.wall, 636, 600], [C.cell, 612, 636], [C.vessel, 530, 690], [1, 530, 1180]];

// The pylorus: the stomach funnels down to a ring of muscle at y = -900 that opens around the hero as it
// passes, then widens into the duodenum, whose walls flare away before the villi. Half-width of the
// channel at depth y with the hero at depth py.
const JY_PYL = { y: -900, top: -2700, bottom: 0, layers: [[0, "#f4a3a3"], [14, "#d76d7e"], [40, "#9c3550"]] };
function jyPylHalf(y, py) {
  const Y = JY_PYL.y;
  let w = y < Y ? 70 + 470 * jySmooth(jyClamp((Y - y) / 650)) : 70 + 170 * jySmooth(jyClamp((y - Y) / 320));
  w -= 26 * Math.exp(-(((y - Y) / 70) ** 2));                 // the ring itself
  // opens as the hero passes, and stays open for the granules trailing about 300 units behind it
  const open = Math.max(Math.exp(-(((py - Y) / 260) ** 2)), Math.exp(-(((py - 300 - Y) / 260) ** 2)));
  w += 46 * Math.exp(-(((y - Y) / 110) ** 2)) * open;
  if (y > -380) w += ((y + 380) / 260) ** 2 * 1500;          // duodenum opens out into the villi field
  return Math.max(16, w);
}
function jyPylorus(py) {
  document.querySelectorAll(".jy-pyl").forEach(el => {
    const [off, side] = [JY_PYL.layers[+el.dataset.l][0], +el.dataset.side];
    // the ring is thicker muscle: the dark band starts closer to the channel there
    const o = y => off === 40 ? 40 - 24 * Math.exp(-(((y - JY_PYL.y) / 90) ** 2)) : off;
    const pts = [];
    for (let y = JY_PYL.top; y <= JY_PYL.bottom; y += 20) pts.push(`${(500 + side * (jyPylHalf(y, py) + o(y))).toFixed(1)} ${y}`);
    el.setAttribute("d", `M${pts.join("L")}L${500 + side * 2600} ${JY_PYL.bottom}L${500 + side * 2600} ${JY_PYL.top}Z`);
  });
}

function jyVillus(cx, w, top, base, detail) {
  const fin = (ww, t) => `M${cx - ww / 2} ${base} L${cx - ww / 2} ${t + ww / 2} A${ww / 2} ${ww / 2} 0 0 1 ${cx + ww / 2} ${t + ww / 2} L${cx + ww / 2} ${base} Z`;
  const L = JY_VIL.lining, r0 = w / 2, r1 = w / 2 - L, cy = top + w / 2;
  let cells = "";
  if (detail) {   // cell borders and nuclei along the lining, so the crossing reads as "through a cell"
    const seg = (x1, y1, x2, y2) => `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    const nuc = (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/>`;
    let lines = "", nucs = "";
    for (let y = cy; y < base; y += 34) {
      lines += seg(cx - r0, y, cx - r1, y) + seg(cx + r0, y, cx + r1, y);
      nucs += nuc(cx - (r0 + r1) / 2, y + 17) + nuc(cx + (r0 + r1) / 2, y + 17);
    }
    for (let a = 180; a <= 360; a += 13) {
      const t = a * Math.PI / 180, t2 = (a + 6.5) * Math.PI / 180;
      lines += seg(cx + r0 * Math.cos(t), cy + r0 * Math.sin(t), cx + r1 * Math.cos(t), cy + r1 * Math.sin(t));
      if (a < 360) nucs += nuc(cx + (r0 + r1) / 2 * Math.cos(t2), cy + (r0 + r1) / 2 * Math.sin(t2));
    }
    cells = `<polygon id="jy-int-cell" points="${cx + r1},618 ${cx + r0},618 ${cx + r0},652 ${cx + r1},652"/>
      <g stroke="#c45f72" stroke-width="2">${lines}</g><g fill="#9b3550" opacity=".7">${nucs}</g>`;
  }
  const loop = `M${cx - 30} ${base} L${cx - 30} ${top + 66} A30 30 0 0 1 ${cx + 30} ${top + 66} L${cx + 30} ${base}`;
  return `<g>
    <path d="${fin(w, top)}" fill="#f4aaa9"/>
    <path d="${fin(w - 14, top + 7)}" fill="#e27f8a"/>
    <path d="${fin(w - 2 * L, top + L)}" fill="#a8435b"/>
    ${cells}
    <path d="${loop}" fill="none" stroke="#7d1428" stroke-width="30"/>
    <path d="${loop}" fill="none" stroke="#c8243f" stroke-width="20"/>
  </g>`;
}

function jyIntestineSvg() {
  let r = 3; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const V = JY_VIL;
  const fluidDots = Array.from({ length: 46 }, () => `<circle cx="${(-500 + rnd() * 2000).toFixed(0)}" cy="${(-500 + rnd() * 900).toFixed(0)}" r="${(2.5 + rnd() * 2).toFixed(1)}"/>`).join("");
  const others = [[-140, 230, 520], [180, 250, 470], [820, 240, 480], [1140, 230, 560], [-460, 240, 500], [1460, 240, 470]]
    .map(([cx, w, top]) => jyVillus(cx, w, top, V.base, false)).join("");
  return `<svg class="jy-layer" id="jy-intestine" width="1000" height="1600" viewBox="0 0 1000 1600">
    <defs><linearGradient id="jy-int-fluid" gradientUnits="userSpaceOnUse" x1="0" y1="-2400" x2="0" y2="1300">
      <stop offset="0" stop-color="#c9702c"/><stop offset=".35" stop-color="#e9a547"/><stop offset="1" stop-color="#d5852f"/></linearGradient></defs>
    <rect x="-1100" y="-2800" width="3200" height="4400" fill="url(#jy-int-fluid)"/>
    ${JY_PYL.layers.map((l, i) => [-1, 1].map(side => `<path class="jy-pyl" data-l="${i}" data-side="${side}" fill="${l[1]}"/>`).join("")).join("")}
    <g fill="#fff2d6" opacity=".75" id="jy-int-dots">${fluidDots}</g>
    ${others}
    ${jyVillus(V.cx, V.w, V.top, V.base, true)}
    <rect x="-1100" y="${V.base - 2}" width="3200" height="400" fill="#b34a62"/>
    <rect x="-1100" y="${V.base + 60}" width="3200" height="400" fill="#8a2f47"/>
    <circle id="jy-int-glow" cx="612" cy="636" r="30" fill="#fff4e8" opacity="0"/>
    <g fill="#fff2d6" id="jy-int-flow">${Array.from({ length: 12 }, () => `<circle r="3.2"/>`).join("")}</g>
  </svg>`;
}

function jyFrameIntestine(q, v, own) {
  const C = JOURNEY.intestineChoreo, S = JOURNEY.stomachChoreo, { cx, cy, s, rm } = v;
  const span = (a, b) => jyClamp((q - a) / (b - a));
  // Where the hero is (piecewise along the waypoints), and how close the camera is.
  const P = JY_INT_PATH(C);
  let j = 0; while (j < P.length - 2 && q > P[j + 1][0]) j++;
  const t = jySmooth(jyClamp((q - P[j][0]) / (P[j + 1][0] - P[j][0])));
  const hx = jyLerp(P[j][1], P[j + 1][1], t), hy = jyLerp(P[j][2], P[j + 1][2], t);
  const k = rm ? 1 : q < C.pylorus[1] ? C.pylorusZoom
    : q < C.villi ? jyLerp(C.pylorusZoom, C.zoomStart, jySmooth(span(C.pylorus[1], C.villi)))
    : q < C.melt[1] ? jyLerp(C.zoomStart, 1, jySmooth(span(C.villi, C.melt[1])))
    : q < C.cell ? jyLerp(1, C.zoomCell, jySmooth(span(C.melt[1], C.cell))) : jyLerp(C.zoomCell, 1.6, jySmooth(span(C.cell, 1)));
  if (q < C.villi + 0.05) jyPylorus(hy);
  document.getElementById("jy-intestine").style.transform = `translate(${cx}px, ${cy}px) scale(${s * k}) translate(${-hx}px, ${-hy}px)`;
  document.getElementById("jy-int-dots").setAttribute("transform", `translate(${(q * 120).toFixed(1)} ${(q * 60).toFixed(1)})`);
  // The cell the hero passes through lights up; absorbed molecules flow down the capillary.
  const inCell = span(C.wall, C.cell) * (1 - span(C.vessel, C.vessel + 0.1));
  document.getElementById("jy-int-cell").setAttribute("fill", `rgba(255, 196, 190, ${(0.6 * inCell).toFixed(3)})`);
  document.getElementById("jy-int-glow").setAttribute("opacity", (0.18 * inCell).toFixed(3));
  const V = JY_VIL, loopLen = 2 * (V.base - V.top - 66) + Math.PI * 30;
  [...document.querySelectorAll("#jy-int-flow circle")].forEach((c, i) => {
    let d = ((i / 12) * loopLen + q * 900) % loopLen;   // along the loop: up the left side, over the top, down the right
    const up = V.base - V.top - 66;
    let x, y;
    if (d < up) { x = V.cx - 30; y = V.base - d; }
    else if (d < up + Math.PI * 30) { const a = Math.PI + (d - up) / 30; x = V.cx + 30 * Math.cos(a); y = V.top + 66 + 30 * Math.sin(a); }
    else { x = V.cx + 30; y = V.top + 66 + (d - up - Math.PI * 30); }
    c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1));
  });
  if (!own) return;
  const melt = jySmooth(span(C.melt[0], C.melt[1]));
  jyActor({
    rot: S.floatTilt, zoom: (rm ? 1 : S.sinkZoom) * S.heroZoom, dissolve: 1, spill: S.spill, hero: 1,
    // Squeeze into a column on the way to the ring, through it with the hero, then open out and rush past.
    funnel: jySmooth(span(C.funnel[0], C.funnel[1])) * (1 - jySmooth(span(C.burst[0], C.burst[1]))),
    burst: jySmooth(span(C.burst[0], C.burst[1])), melt,
    // Keep every granule in the fluid: inside the channel at its height, clear of the lining.
    bound: q < C.villi ? (x, y, r) => {
      const sk = s * k, wy = hy + y / sk, half = Math.max(0, (jyPylHalf(wy, hy) - 14) * sk - r);
      return [jyClamp(hx * sk + x, 500 * sk - half, 500 * sk + half) - hx * sk, y];
    } : null, mols: melt * (1 - jySmooth(span(C.wall, C.cell))),
  });
}

jyChapter({ key: "intestine", layers: jyIntestineSvg, frame: jyFrameIntestine, notToScale: true });
