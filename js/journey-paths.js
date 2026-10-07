// ---------------------------------------------------------------------------
// JOURNEY chapter 4, Different paths, drawn as an assembly line (like the Simulator): stations joined by
// tracks. The hero molecule stays at the screen centre (the actor) while the camera pulls back from the
// villi into the Small intestine station and then follows it along the line. Small groups of the other
// molecules peel off one track at a time: never absorbed -> Large intestine -> Stool; everyone else ->
// Liver (some stay, processed) -> Heart <-> Lungs -> Arteries; a group branches to Kidneys -> Bladder ->
// Urine; the hero's group heads on toward the brain, and the camera dives into its vessel. A track lights
// up behind its group, and station labels show only while their track is active. The order follows the
// blood (kidneys only see what has passed the liver). Spec: HANDOFF.md.
// Core and chapter system: js/journey.js. Wording, groups and beats: JOURNEY.paths / pathsChoreo.
// ---------------------------------------------------------------------------

// Stations: [key, x, y, kind]. "box" = a station, "end" = where a track leaves the body. Main line runs
// left to right at y = 0 (Small intestine -> Liver -> Heart -> Arteries -> Kidneys -> Bladder -> Urine); the
// lungs sit above the heart, the stool branch drops down, the brain branch goes up from the arteries.
const JY_DP_STATIONS = [["small", 0, 0, "box"], ["large", 0, 300, "box"], ["stool", 0, 560, "end"], ["liver", 420, 0, "box"], ["heart", 840, 0, "box"],
  ["lungs", 840, -300, "box"], ["arteries", 1260, 0, "box"], ["kidney", 1640, 0, "box"], ["bladder", 2000, 0, "box"], ["urine", 2290, 0, "end"], ["brain", 1260, -420, "end"]];
const JY_DP_ROUTES = {
  stool: "M0 0 L0 560",
  portal: "M0 0 L420 0",
  heart: "M420 0 L815 0 L815 -300 L865 -300 L865 0 L1260 0",   // into the heart, up to the lungs and back, out to the arteries
  kidney: "M1260 0 L2290 0",     // the arteries feed the kidneys and the brain side by side (shown one after the other)
  brain: "M1260 0 L1260 -560",
};
const JY_DP_START = [0, 0];   // the hero, in the Small intestine station, when the chapter opens
const JY_DP = { len: {}, el: {}, dots: null };

function jyPathsSvg() {
  const L = JOURNEY.labels.map;
  // The Small intestine station holds a row of villi, so the pull-back from chapter 3 lands on familiar shapes.
  const villi = [-90, -45, 0, 45, 90].map(x => `<path d="M${x - 16} 52 V${-10} A16 16 0 0 1 ${x + 16} ${-10} V52 Z" fill="#e27f8a"/><path d="M${x - 5} 52 V${-6} A5 5 0 0 1 ${x + 5} ${-6} V52" fill="none" stroke="#c8243f" stroke-width="3"/>`).join("");
  const station = ([k, x, y, kind]) => kind === "box"
    ? `<g class="jy-dp-st" id="jy-dp-s-${k}" transform="translate(${x} ${y})"><rect x="-120" y="-62" width="240" height="124" rx="22"/>${k === "small" ? `<g clip-path="url(#jy-dp-clip)">${villi}</g>` : ""}<text y="${k === "small" ? 92 : 9}" text-anchor="middle">${esc(L[k])}</text></g>`
    : `<g class="jy-dp-st jy-dp-end" id="jy-dp-s-${k}" transform="translate(${x} ${y})"><circle r="14"/><text y="${k === "brain" ? -34 : 50}" text-anchor="middle">${esc(L[k])}</text></g>`;
  return `<svg class="jy-head" id="jy-paths" viewBox="0 0 1000 1000">
    <defs><clipPath id="jy-dp-clip"><rect x="-120" y="-62" width="240" height="124" rx="22"/></clipPath></defs>
    <g class="jy-dp-tracks">${Object.values(JY_DP_ROUTES).map(d => `<path d="${d}"/>`).join("")}</g>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${Object.entries(JY_DP_ROUTES).map(([k, d]) => `<path class="jy-dp-route" id="jy-dp-r-${k}" d="${d}" stroke="${k === "stool" || k === "kidney" ? "#f2c98a" : "#f3c3cf"}" stroke-width="10" opacity="0"/>`).join("")}
    </g>
    ${JY_DP_STATIONS.map(station).join("")}
    <g id="jy-dp-dots">${Array.from({ length: 11 }, (_, i) => `<circle data-i="${i}" opacity="0"/>`).join("")}</g>
  </svg>
  <div class="jy-tint" id="jy-paths-tint"></div>`;
}

// Track lengths and elements, measured once when the tour starts.
function jyPathsInit(root) {
  Object.keys(JY_DP_ROUTES).forEach(k => { const el = root.querySelector("#jy-dp-r-" + k); JY_DP.el[k] = el; JY_DP.len[k] = el.getTotalLength(); });
  JY_DP.dots = jyDpDots();
}
const jyDpAt = (k, f) => { const p = JY_DP.el[k].getPointAtLength(jyClamp(f) * JY_DP.len[k]); return [p.x, p.y]; };

// The other molecules: each has a group, a small offset (a loose cloud that tightens into a stream on the
// tracks) and a lag (later ones move within a later slice of each beat).
function jyDpDots() {
  const G = JOURNEY.pathsChoreo.groups;
  let r = 13; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 11 }, (_, i) => {
    const group = i < G.stool ? "stool" : i < G.stool + G.liver ? "liver" : i < G.stool + G.liver + G.kidney ? "kidney" : "brain";
    const a = rnd() * Math.PI * 2, d = 30 + rnd() * 60;
    return { group, off: [Math.cos(a) * d * 1.2, Math.sin(a) * d * 0.45], lag: 0.15 + rnd() * 0.7 };
  });
}
// The tracks a group travels, in order, each with its beat.
function jyDpLegs(group) {
  const C = JOURNEY.pathsChoreo;
  if (group === "stool") return [["stool", C.stool]];
  const legs = [["portal", C.liver]];
  if (group === "liver") return legs;
  legs.push(["heart", C.heart]);
  legs.push(group === "kidney" ? ["kidney", C.kidney] : ["brain", C.brain]);
  return legs;
}
function jyDpPos(group, lag, q) {
  let pos = JY_DP_START;
  jyDpLegs(group).some(([k, [a, b]]) => {
    const w = (b - a) * 0.72, s0 = a + lag * (b - a - w);
    if (q < s0) return true;
    pos = jyDpAt(k, jySmooth(jyClamp((q - s0) / w)));
  });
  return pos;
}

function jyFramePaths(q, v, own) {
  const C = JOURNEY.pathsChoreo, S = JOURNEY.stomachChoreo, { H, rm } = v;
  const span = ([a, b]) => jyClamp((q - a) / (b - a));
  const svg = document.getElementById("jy-paths");
  if (!JY_DP.dots) return;
  // Camera: centred on the hero. Starts deep in the villi of the Small intestine station, pulls back to
  // show the line around it, and dives into the hero's vessel at the end.
  const hero = jyDpPos("brain", 0, q);
  const fit = Math.min(H / 1650, innerWidth / 1100);
  const pull = jySmooth(span(C.pull)), dive = jySmooth(span(C.dive));
  // The kidney row is long: pull back a little during its beat so it fits on screen.
  const wide = jySmooth(span([C.kidney[0] - 0.03, C.kidney[0]])) * (1 - jySmooth(span([C.brain[0] - 0.02, C.brain[0] + 0.03])));
  const unit = (rm ? fit : fit * Math.pow(40, 1 - pull) * Math.pow(14, dive)) * jyLerp(1, Math.min(1, innerWidth / 2300 / fit), wide);
  jyHeadCamera(svg, hero[0], hero[1], unit);
  // The hero is drawn by the actor; the others are dots the same size on screen.
  const heroPx = JY.pillUnit * JY.base * S.sinkZoom * S.heroZoom * (JY_GRAINS[JY_HERO][2] - 2.8);
  const tighten = 1 - 0.8 * jySmooth(span([C.stool[0] - 0.02, C.stool[0] + 0.04]));   // the cloud forms up before the tracks
  svg.querySelectorAll("#jy-dp-dots circle").forEach(c => {
    const d = JY_DP.dots[+c.dataset.i], pos = jyDpPos(d.group, d.lag, q);
    c.setAttribute("cx", (pos[0] + d.off[0] * tighten).toFixed(1)); c.setAttribute("cy", (pos[1] + d.off[1] * tighten).toFixed(1));
    c.setAttribute("r", (heroPx / unit).toFixed(2));
    const exit = d.group === "stool" ? C.stool[1] : d.group === "kidney" ? C.kidney[1] : 2;   // stool and urine groups fade on arrival
    c.setAttribute("opacity", (0.9 * pull * (1 - jySmooth(jyClamp((q - exit) / 0.05)))).toFixed(3));
    c.classList.toggle("amber", d.group === "liver" && q > C.liver[1] - 0.02);
  });
  // Tracks light up behind their group, then dim.
  const beat = { stool: C.stool, portal: C.liver, heart: C.heart, kidney: C.kidney, brain: C.brain };
  Object.entries(beat).forEach(([k, b]) => {
    const el = JY_DP.el[k], L = JY_DP.len[k], p = jySmooth(span(b));
    el.style.strokeDasharray = `${L} ${L}`; el.style.strokeDashoffset = (L * (1 - p)).toFixed(1);
    el.setAttribute("opacity", (p > 0 ? 1 - 0.7 * jySmooth(jyClamp((q - b[1]) / 0.06)) : 0).toFixed(3));
  });
  // Station labels show only while their track is active; the station's outline lights up with them.
  const win = { small: [C.pull[1] - 0.04, C.stool[1]], large: C.stool, stool: [C.stool[0] + 0.08, C.stool[1] + 0.03], liver: [C.liver[0], C.heart[0] + 0.02], heart: C.heart,
    lungs: [C.heart[0] + 0.03, C.heart[1] - 0.02], arteries: [C.heart[1] - 0.03, C.dive[0]], kidney: [C.kidney[0], C.kidney[1] - 0.03], bladder: [C.kidney[0] + 0.05, C.kidney[1]], urine: [C.kidney[0] + 0.08, C.kidney[1] + 0.03], brain: [C.brain[0], C.dive[0] + 0.02] };
  JY_DP_STATIONS.forEach(([k]) => {
    const g = document.getElementById("jy-dp-s-" + k), [a, b] = win[k];
    g.style.setProperty("--on", Math.min(jyClamp((q - a) / 0.03), jyClamp((b - q) / 0.03)).toFixed(3));
  });
  // The Liver station glows amber while the group passes through it.
  document.getElementById("jy-dp-s-liver").style.setProperty("--amber", (jySmooth(span([C.liver[0] + 0.04, C.liver[1]])) * (1 - jySmooth(span([C.heart[0], C.heart[0] + 0.06])))).toFixed(3));
  // Red flood as the camera dives into the vessel.
  document.getElementById("jy-paths-tint").style.opacity = jySmooth(span([C.dive[0] + 0.03, C.dive[1] - 0.02])).toFixed(3);
  if (!own) return;
  jyActor({ rot: S.floatTilt, zoom: (rm ? 1 : S.sinkZoom) * S.heroZoom, dissolve: 1, spill: S.spill, hero: 1, others: 0, melt: 1, mols: 0 });
}

jyChapter({ key: "paths", layers: jyPathsSvg, init: jyPathsInit, frame: jyFramePaths, notToScale: true });
