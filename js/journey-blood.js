// ---------------------------------------------------------------------------
// JOURNEY chapter 5, Bloodstream. Picks up from chapter 4's red flood: a rush down the vessel (red cells
// stream out of the vanishing point), easing into a side view where the cyan hero rides the plasma with
// red cells drifting past at different depths; then the vessel narrows to a brain capillary (cells in
// single file) and deep brain blue shows beyond the wall, ending close on the wall: the next chapter is
// the blood-brain barrier. Drawn in screen units (the viewBox is the screen), centred on the hero.
// Core and chapter system: js/journey.js. Wording and beats: JOURNEY.blood / bloodChoreo.
// ---------------------------------------------------------------------------

// Red cells: [x0 0..1, lane -1..1, depth, tilt, speed]. Seeded, so the same every visit.
const JY_BL_CELLS = (() => {
  let r = 29; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 18 }, (_, i) => {
    let lane = rnd() * 2 - 1; if (Math.abs(lane) < 0.22) lane += lane < 0 ? -0.3 : 0.3;   // keep the middle lane mostly clear for the hero
    return { x0: rnd(), lane, depth: 0.55 + rnd() * 0.9, tilt: -40 + rnd() * 80, speed: 0.7 + rnd() * 0.6, single: i < 5 };
  }).sort((a, b) => a.depth - b.depth);   // far ones first, so near ones draw on top
})();

function jyBloodSvg() {
  const cell = (c, i) => `<g class="jy-bl-cell" data-i="${i}"><ellipse rx="50" ry="30" fill="#c8344a"/><ellipse rx="27" ry="14" fill="#9e1f35"/></g>`;
  return `<svg class="jy-head" id="jy-blood" viewBox="0 0 1000 1000" preserveAspectRatio="none">
    <defs>
      <radialGradient id="jy-bl-bg" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#7a1527"/><stop offset="1" stop-color="#3a0812"/></radialGradient>
      <linearGradient id="jy-bl-brain-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3a86"/><stop offset="1" stop-color="#121a44"/></linearGradient>
    </defs>
    <rect id="jy-bl-bgr" x="-2000" y="-2000" width="6000" height="6000" fill="url(#jy-bl-bg)"/>
    <g id="jy-bl-scene">
      <path id="jy-bl-out-top" fill="#2a0c16"/><path id="jy-bl-out-bot" fill="#2a0c16"/><path id="jy-bl-brain" fill="url(#jy-bl-brain-grad)" opacity="0"/>
      <g id="jy-bl-cells">${JY_BL_CELLS.map(cell).join("")}</g>
      <path id="jy-bl-wall-top" fill="#b4636a"/><path id="jy-bl-edge-top" fill="none" stroke="#e7a59c" stroke-width="6"/>
      <path id="jy-bl-wall-bot" fill="#b4636a"/><path id="jy-bl-edge-bot" fill="none" stroke="#e7a59c" stroke-width="6"/>
    </g>
  </svg>`;
}

function jyFrameBlood(q, v, own) {
  const C = JOURNEY.blood && JOURNEY.bloodChoreo, S = JOURNEY.stomachChoreo, { H, rm } = v, W = innerWidth, cx = W / 2, cy = H / 2;
  const span = ([a, b]) => jyClamp((q - a) / (b - a));
  const svg = document.getElementById("jy-blood");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const dive = rm ? 0 : 1 - jySmooth(span(C.dive)), app = jySmooth(span(C.approach)), bound = jySmooth(span(C.boundary));
  const u = Math.min(W, H) / 820;   // size unit for this screen
  // The vessel: half-gap between the walls narrows from a big artery to a capillary; the scene tilts
  // toward the storyboard's diagonal as we close in on the wall, and the wall comes up to meet the hero.
  const gap = jyLerp(0.46 * H, 70 * u, app) - 22 * u * bound;
  const tilt = -22 * app;
  document.getElementById("jy-bl-scene").setAttribute("transform", `rotate(${tilt.toFixed(2)} ${cx} ${cy})`);
  const wave = (x, ph) => 14 * u * Math.sin(x / (160 * u) + q * 9 + ph) * (1 - 0.6 * app);
  const wallLine = (side) => {
    const pts = [];
    for (let x = -W; x <= 2 * W; x += 30 * u) pts.push([x, cy + side * (gap + wave(x, side)) + (side > 0 ? -40 * u * bound : 0)]);
    return pts;
  };
  [["top", -1], ["bot", 1]].forEach(([k, side]) => {
    const pts = wallLine(side), far = cy + side * 3 * H, thick = 60 * u;
    const line = "M" + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L");
    document.getElementById("jy-bl-edge-" + k).setAttribute("d", line);
    // the wall: a band of tissue; beyond the bottom wall, brain blue shows through as we approach
    const band = line + " " + pts.slice().reverse().map(p => `L${p[0].toFixed(1)} ${(p[1] + side * thick).toFixed(1)}`).join(" ") + " Z";
    document.getElementById("jy-bl-wall-" + k).setAttribute("d", band);
    // beyond the wall: body tissue (and, past the bottom wall, the brain, which turns blue as we approach)
    const beyond = `M${pts.map(p => `${p[0].toFixed(1)} ${(p[1] + side * (thick - 2)).toFixed(1)}`).join(" L")} L${2 * W} ${far} L${-W} ${far} Z`;
    document.getElementById("jy-bl-out-" + k).setAttribute("d", beyond);
    if (side > 0) document.getElementById("jy-bl-brain").setAttribute("d", beyond);
  });
  const walls = 1 - dive;
  ["top", "bot"].forEach(k => ["wall", "edge", "out"].forEach(part => document.getElementById(`jy-bl-${part}-${k}`).setAttribute("opacity", walls.toFixed(3))));
  document.getElementById("jy-bl-brain").setAttribute("opacity", (walls * jySmooth(jyClamp(app * 1.4 - 0.2))).toFixed(3));
  // Red cells. Side view: they drift past (right to left, as we travel), each lane inside the vessel,
  // nearer ones bigger. Dive: they stream out of the vanishing point toward us. In the capillary only a
  // few remain, in single file.
  svg.querySelectorAll(".jy-bl-cell").forEach(g => {
    const c = JY_BL_CELLS[+g.dataset.i];
    const t = ((c.x0 + q * C.flow * c.speed) % 1 + 1) % 1;
    const sx = cx + (0.5 - t) * W * 1.6, sy = cy + c.lane * gap * 0.82 * (1 - 0.9 * app * (c.single ? 1 : 0));
    const sz = u * c.depth * (1 - 0.45 * app);
    const a = c.x0 * Math.PI * 2, tt = ((c.x0 + q * 6) % 1 + 1) % 1, d = tt * tt * 0.9 * Math.max(W, H);
    const tx = cx + Math.cos(a) * d, ty = cy + Math.sin(a) * d, tsz = u * (0.15 + 2.4 * tt * tt);
    const x = jyLerp(sx, tx, dive), y = jyLerp(sy, ty, dive), size = jyLerp(sz, tsz, dive);
    g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(c.tilt - tilt).toFixed(1)}) scale(${size.toFixed(3)})`);
    g.setAttribute("opacity", ((c.single ? 1 : 1 - app) * (dive > 0 ? Math.min(1, tt * 4 + (1 - dive)) : 1)).toFixed(3));
  });
  if (!own) return;
  jyActor({ rot: S.floatTilt, zoom: (rm ? 1 : S.sinkZoom) * S.heroZoom, dissolve: 1, spill: S.spill, hero: 1, others: 0, melt: 1, mols: 0 });
}

jyChapter({ key: "blood", layers: jyBloodSvg, frame: jyFrameBlood, notToScale: true });
