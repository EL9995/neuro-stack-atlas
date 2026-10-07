// ---------------------------------------------------------------------------
// JOURNEY chapter 4, Different paths: the camera pulls back to a body map. Twelve dots (each a share of
// the dose, illustration only) split up: some are never absorbed (stool), the rest go up the portal
// vein to the liver (amber), which breaks some down (bile, stool); the rest enter the blood, where the
// kidneys filter some out (urine). Our hero stays in circulation, and the camera dives into its vessel.
// Core and chapter system: js/journey.js. Wording, split and knobs: JOURNEY.paths / pathsChoreo.
// ---------------------------------------------------------------------------

// Map geometry in world units (torso about 700 wide, centred on x = 500).
const JY_MAP = {
  colon: [[300, 880], [300, 470], [700, 470], [700, 900], [640, 1000], [560, 1060], [560, 1210]],
  portal: [[500, 610], [478, 470], [440, 380], [420, 330]],
  bile: [[440, 330], [410, 420], [380, 500], [372, 560], [360, 860], [330, 875]],
  hepatic: [[470, 255], [500, 235]],
  toKidney: [[500, 235], [500, 640], [300, 640], [220, 640], [215, 720], [300, 880], [420, 985]],
  up: [[500, 235], [500, -60]],
};
const jyPts = pts => "M" + pts.map(p => p.join(" ")).join(" L");

function jyPathsSvg() {
  const M = JY_MAP, L = JOURNEY.labels.map;
  const label = (x, y, t, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}">${esc(t)}</text>`;
  const gut = "M560 450 C520 500 400 520 360 560 H640 C680 560 680 620 640 620 H360 C320 620 320 680 360 680 H640 C680 680 680 740 640 740 H360 C320 740 320 800 360 800 H640 C680 800 680 860 640 860 H330";
  return `<svg class="jy-layer" id="jy-paths" width="1000" height="1400" viewBox="0 0 1000 1400">
    <path fill="#3a1220" d="M330 -420 L330 -120 C330 40 150 80 150 260 L160 1000 C170 1160 320 1260 500 1270 C680 1260 830 1160 840 1000 L850 260 C850 80 670 40 670 -120 L670 -420 Z"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M500 -420 V900 M500 640 H260 M500 640 H740" stroke="#7d1a2c" stroke-width="26"/>
      <path id="jy-map-blood" d="M500 -420 V900 M500 640 H260 M500 640 H740" stroke="#c8243f" stroke-width="12"/>
      <path d="M215 720 C230 850 400 900 420 985 M785 720 C770 850 600 900 480 985" stroke="#8e3550" stroke-width="9"/>
    </g>
    <ellipse cx="215" cy="640" rx="55" ry="86" fill="#8e3550"/><ellipse cx="785" cy="640" rx="55" ry="86" fill="#8e3550"/>
    <ellipse id="jy-map-bladder" cx="450" cy="1010" rx="62" ry="46" fill="#a8435b"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${jyPts(M.colon)}" stroke="#6e2540" stroke-width="54"/>
      <path d="${jyPts(M.colon)}" stroke="#97405a" stroke-width="40"/>
      <path d="M600 -420 L600 230" stroke="#c95a6c" stroke-width="20"/>
      <path d="${gut}" stroke="#c95a6c" stroke-width="34"/>
      <path d="${gut}" stroke="#ec8f98" stroke-width="18"/>
      <path id="jy-map-portal" d="${jyPts(M.portal)}" stroke="#9a2c56" stroke-width="14"/>
      <path d="${jyPts(M.bile.slice(0, 4))}" stroke="#c9a03a" stroke-width="7" stroke-dasharray="2 12" opacity=".8"/>
    </g>
    <path fill="#c95a6c" d="M560 215 C650 195 730 245 728 330 C726 425 640 470 565 452 C520 440 522 398 562 388 C606 378 640 360 622 322 C604 284 566 292 545 262 Z"/>
    <path id="jy-map-liver" fill="#d0607a" d="M195 250 C215 165 425 155 525 218 C548 236 528 292 472 324 C400 372 258 382 218 342 C188 312 188 280 195 250 Z"/>
    <g class="jy-map-labels">
      ${label(330, 238, L.liver)}${label(700, 205, L.stomach, "start")}${label(500, 905, L.small)}${label(720, 440, L.large, "start")}
      ${label(215, 760, L.kidneys)}${label(450, 1080, L.bladder)}${label(470, 470, L.portal, "end")}${label(520, -90, L.blood, "start")}
    </g>
    <g class="jy-map-tally">
      <text id="jy-tally-stool" x="590" y="1225" text-anchor="start"></text>
      <text id="jy-tally-urine" x="525" y="1018" text-anchor="start"></text>
      <text id="jy-tally-blood" x="520" y="-20" text-anchor="start"></text>
    </g>
    <g id="jy-map-dots">${Array.from({ length: 12 }, (_, i) => `<circle r="11" data-i="${i}"/>`).join("")}</g>
    <circle id="jy-map-ring" r="20"/>
  </svg>
  <div class="jy-tint" id="jy-paths-tint"></div>`;
}

// Each dot's journey as legs: [beat, waypoints]. Before a leg's beat the dot waits at its start;
// during it, it travels; after it, it waits at the end. Which dots go where comes from pathsChoreo.split.
function jyMapDots() {
  const C = JOURNEY.pathsChoreo, S = C.split, M = JY_MAP;
  let r = 21; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 12 }, (_, i) => {
    const start = [400 + rnd() * 200, 580 + rnd() * 260];
    const inLiver = [300 + rnd() * 140, 255 + rnd() * 70];
    const lag = rnd() * 0.25;   // so the dots don't move in lockstep
    if (i < S.notAbsorbed) return { fate: "stool", lag, legs: [[C.stool, [start, [360, 860], ...M.colon]]] };
    const toLiver = [C.liver, [start, ...M.portal, inLiver]];
    if (i < S.notAbsorbed + S.brokenDown) return { fate: "bile", lag, legs: [toLiver, [C.bile, [inLiver, ...M.bile, ...M.colon]]] };
    const out = [inLiver, ...M.hepatic];
    if (i < S.notAbsorbed + S.brokenDown + S.urine) {
      const inBladder = [425 + rnd() * 50, 995 + rnd() * 30];
      return { fate: "urine", lag, legs: [toLiver, [C.blood, [...out, ...M.toKidney, inBladder]]] };
    }
    const k = i - (S.notAbsorbed + S.brokenDown + S.urine);   // 0 = the hero, highest up the vessel
    return { fate: "blood", hero: k === 0, lag: k === 0 ? 0.1 : lag, legs: [toLiver, [C.blood, [...out, [500, -60 + k * 70]]]] };
  });
}

// Point a fraction t (0..1) of the way along a polyline, by length.
function jyAlong(pts, t) {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = t * seg.reduce((a, b) => a + b, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) { const f = seg[i] ? Math.min(1, d / seg[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; }
    d -= seg[i];
  }
}
function jyDotAt(dot, q) {
  let pos = dot.legs[0][1][0], done = false;
  dot.legs.some(([[a, b], pts], li) => {
    const w = (b - a) * 0.7, s0 = a + dot.lag * (b - a - w);   // each dot moves within its own slice of the beat
    if (q < s0) return true;
    const t = jyClamp((q - s0) / w);
    pos = jyAlong(pts, jySmooth(t));
    done = li === dot.legs.length - 1 && t >= 1;   // arrived only at the end of its last leg
  });
  return { pos, done };
}

function jyFramePaths(q, v, own) {
  const C = JOURNEY.pathsChoreo, I = JOURNEY.intestineChoreo, S = JOURNEY.stomachChoreo, { cx, cy, H, s, rm } = v;
  const span = (a, b) => jyClamp((q - a) / (b - a));
  if (!JY.mapDots) JY.mapDots = jyMapDots();
  // Dots: position, broken-down ones turn amber, tallies count the arrivals.
  const tally = { stool: 0, urine: 0, blood: 0 };
  let hero = [500, -60];
  document.querySelectorAll("#jy-map-dots circle").forEach((c, i) => {
    const d = JY.mapDots[i], { pos, done } = jyDotAt(d, q);
    c.setAttribute("cx", pos[0].toFixed(1)); c.setAttribute("cy", pos[1].toFixed(1));
    c.classList.toggle("amber", d.fate === "bile" && q > C.bile[0]);
    c.classList.toggle("hero", !!d.hero);
    if (done) tally[d.fate === "bile" ? "stool" : d.fate]++;
    if (d.hero) hero = pos;
  });
  const ring = document.getElementById("jy-map-ring");
  ring.setAttribute("cx", hero[0].toFixed(1)); ring.setAttribute("cy", hero[1].toFixed(1));
  const T = JOURNEY.labels.tally;
  [["stool", tally.stool], ["urine", tally.urine], ["blood", tally.blood]].forEach(([k, n]) => {
    const el = document.getElementById("jy-tally-" + k);
    el.textContent = n ? `${n} · ${T[k]}` : "";
  });
  // Liver beat: the liver and portal vein light up amber; the blood beat lights the vessels.
  const liverOn = span(C.liver[0], C.liver[0] + 0.05) * (1 - span(C.bile[1], C.bile[1] + 0.06));
  document.getElementById("jy-map-liver").style.fill = liverOn > 0.01 ? `color-mix(in srgb, #f0a24a ${(liverOn * 70).toFixed(0)}%, #d0607a)` : "";
  document.getElementById("jy-map-portal").style.stroke = liverOn > 0.01 ? `color-mix(in srgb, #f0a24a ${(liverOn * 80).toFixed(0)}%, #9a2c56)` : "";
  // Camera: start zoomed in on the small intestine, pull back to the whole body (shifted right of the
  // caption on wide screens), then dive onto the hero's vessel at the end.
  const narrow = innerWidth <= 640;   // phones: map uses the full width and sits above the caption
  const fit = Math.min((narrow ? 0.62 : 0.94) * H / 1320, (narrow ? 1.05 : 0.62) * innerWidth / 1000) / s, side = innerWidth > 760 ? innerWidth * 0.14 : 0, lift = narrow ? -0.16 * H : 0;
  const out = jySmooth(span(0, C.zoomOut)), dive = jySmooth(span(C.dive[0], C.dive[1]));
  let wx = 500, wy = jyLerp(700, 565, out), k = jyLerp(fit * 2.5, fit, out), ox = side * out;
  if (dive > 0) { wx = jyLerp(wx, hero[0], dive); wy = jyLerp(wy, hero[1], dive); k = fit * Math.pow(14, rm ? 0 : dive); ox = side * (1 - dive); }
  document.getElementById("jy-paths").style.transform = `translate(${cx + ox}px, ${cy + lift * (1 - dive)}px) scale(${s * k}) translate(${-wx}px, ${-wy}px)`;
  // Tint: amber over the liver beat, then the red flood of the dive.
  const tint = document.getElementById("jy-paths-tint"), red = jySmooth(span(C.dive[0] + 0.03, C.dive[1] - 0.02));
  tint.style.background = red > 0 ? "#8e1a2c" : "radial-gradient(60% 60% at 40% 30%, rgba(240,162,74,.35), rgba(240,162,74,0) 70%)";
  tint.style.opacity = (red > 0 ? red : liverOn).toFixed(3);
  if (!own) return;
  // The pill-actor (now the hero molecule) steps aside for the map, and takes over again in the vessel.
  const fade = (1 - jySmooth(span(0, 0.06))) + jySmooth(span(C.dive[1] - 0.04, C.dive[1]));
  jyActor({ rot: S.floatTilt, zoom: (rm ? 1 : S.sinkZoom) * S.heroZoom, dissolve: 1, spill: S.spill, hero: 1, others: 0, melt: 1, mols: 0, fade: Math.min(1, fade) });
}

jyChapter({ key: "paths", layers: jyPathsSvg, frame: jyFramePaths, notToScale: true });
