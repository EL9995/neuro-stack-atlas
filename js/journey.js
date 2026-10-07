// ---------------------------------------------------------------------------
// JOURNEY (staging at #journey): the new landing page, built piece by piece.
// Piece 1: the first screen, two capsules on black. "Skip Journey" opens the Stack builder.
// Then the tour: "Start Journey" flies the pill to the centre, where it stays (the "actor"). Each
// chapter is its own small scene that scrolls and zooms around it, and cross-fades into the next:
//   1. Swallow: dive into the mouth, down the esophagus, to the top of the stomach.
//   2. Stomach: drop onto the gastric fluid, sink, the shell dissolves, the hero granule takes over.
// Files: this one is the core (capsule, actor, scrolling, captions). Each chapter lives in its own
// file (js/journey-<chapter>.js) and registers itself with jyChapter(); index.html loads them after
// this one, in story order. Wording, sources and choreography knobs: content/journey.js.
// Frames for review: python3 tools/journey_frames.py
// ---------------------------------------------------------------------------
// Granules seen through the clear half of the Start capsule: [x, y, r]. The bright one is the
// "hero" the tour follows once the shell dissolves.
const JY_GRAINS = [[192, 30, 5], [204, 52, 6], [196, 74, 5], [218, 24, 4.5], [222, 44, 5.5], [214, 68, 6], [236, 34, 5], [240, 58, 6],
  [232, 80, 4.5], [254, 42, 5], [258, 64, 5], [250, 22, 4], [266, 52, 4], [205, 88, 3.5], [244, 86, 3.5]];
const JY_HERO = 4;
// More granules hidden behind the solid half; they appear when the shell dissolves. Fixed seed, so
// they're the same every visit.
const JY_GRAINS_IN = (() => {
  let r = 11; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const out = [];
  for (let n = 0; out.length < 24 && n < 4000; n++) {
    const x = 20 + rnd() * 156, y = 12 + rnd() * 76, g = 3.5 + rnd() * 2.5;
    if (Math.hypot(x < 50 ? x - 50 : 0, y - 50) > 44 - g) continue;
    if (out.some(([a, b, c]) => Math.hypot(a - x, b - y) < c + g + 1.5)) continue;
    out.push([x, y, g]);
  }
  return out;
})();
// Where each granule drifts when it spills out: into a loose cloud around the hero granule (a seeded
// spot for each, so it's the same every visit). Stored as the move from its place in the capsule.
const JY_SPILL = (() => {
  let r = 5; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const [hx, hy] = JY_GRAINS[JY_HERO];
  return [...JY_GRAINS, ...JY_GRAINS_IN].map(([x, y]) => {
    const a = rnd() * Math.PI * 2, d = 11 + Math.pow(rnd(), 0.8) * 70;
    return [hx + Math.cos(a) * d - x, hy + Math.sin(a) * d - y];
  });
})();

// Molecules the hero granule breaks into when it dissolves (chapter 3): seeded directions and distances.
const JY_MOLS = (() => {
  let r = 9; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2 + rnd() * 0.5, d = 9 + rnd() * 14; return [Math.cos(a) * d, Math.sin(a) * d]; });
})();

// A capsule drawn like the scroll scenes: dark glassy shell, thin glowing outline. Start has a clear
// half full of granules; Skip is empty and quieter.
function jyCapsule(kind) {
  const start = kind === "start", id = "jy-" + kind;
  const g = (list, base) => list.map(([x, y, r], i) => `<circle class="jy-g${base + i === JY_HERO ? " jy-hero" : ""}" data-i="${base + i}" cx="${x}" cy="${y}" r="${r}" style="--d:${((base + i) * 0.37) % 3}s"/>`).join("");
  const [hx, hy] = JY_GRAINS[JY_HERO];
  return `<svg class="jy-cap" viewBox="0 0 280 100" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="${id}-clip"><rect x="1" y="1" width="278" height="98" rx="49"/></clipPath>
        <linearGradient id="${id}-shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${start ? "#24386e" : "#161d2c"}"/><stop offset="1" stop-color="${start ? "#0c1430" : "#0a0e16"}"/></linearGradient>
        <linearGradient id="${id}-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe6ff" stop-opacity="${start ? .16 : .04}"/><stop offset="1" stop-color="#7fe6ff" stop-opacity="${start ? .04 : .01}"/></linearGradient>
        <radialGradient id="${id}-grain" cx="40%" cy="35%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9fb6e8"/></radialGradient>
      </defs>
      ${start ? `<g fill="url(#${id}-grain)">${g(JY_GRAINS_IN, JY_GRAINS.length)}</g>` : ""}
      <g class="jy-shell" clip-path="url(#${id}-clip)">
        <rect x="0" y="0" width="180" height="100" fill="url(#${id}-shell)"/>
        <rect x="180" y="0" width="100" height="100" fill="url(#${id}-glass)"/>
      </g>
      ${start ? `<g fill="url(#${id}-grain)">${g(JY_GRAINS, 0)}</g>` : ""}
      <g class="jy-gloss" clip-path="url(#${id}-clip)">
        <line class="jy-seam" x1="180.5" y1="0" x2="180.5" y2="100"/>
        <path class="jy-sheen" d="M44 10 Q140 6 236 10"/>
      </g>
      <rect class="jy-edge" x="1" y="1" width="278" height="98" rx="49" pathLength="1"/>
      ${start ? `<g class="jy-mols">${JY_MOLS.map(() => `<circle cx="${hx}" cy="${hy}" r="1.3"/>`).join("")}</g><circle class="jy-ring" cx="${hx}" cy="${hy}" r="10"/>` : ""}
    </svg>`;
}

function jyPill(kind, label, hint) {
  return `<button class="jy-pill jy-${kind}" type="button" data-journey="${kind}" aria-describedby="jy-${kind}-hint">
      ${jyCapsule(kind)}
      <span class="jy-label">${esc(label)}</span>
      <span class="sr" id="jy-${kind}-hint">${esc(hint)}</span>
    </button>`;
}

function viewJourney() {
  jyStop();
  const P = JOURNEY.pills;
  return `
  <section class="jy" id="jy" aria-label="Neuro Stack Atlas">
    <div class="jy-world" aria-hidden="true">
      ${JY_CHAPTERS.map(ch => `<div class="jy-ch" id="jy-ch-${ch.key}">${ch.layers()}</div>`).join("")}
    </div>
    <div class="jy-pills">
      ${jyPill("start", P.start, P.startHint)}
      ${jyPill("skip", P.skip, P.skipHint)}
    </div>
    ${JY_CHAPTERS.filter(ch => ch.front).map(ch => `<div class="jy-front" id="jy-front-${ch.key}" aria-hidden="true">${ch.front()}</div>`).join("")}
    <div class="jy-hud">
      <button class="jy-skiptour" type="button" data-journey="skip">${esc(JOURNEY.skipTour)} <span aria-hidden="true">&rarr;</span></button>
      <ol class="jy-rail" aria-label="Chapters">${JOURNEY.chapters.map(c => `<li title="${esc(c)}"><span class="sr">${esc(c)}</span></li>`).join("")}</ol>
      <div class="jy-caption" id="jy-caption" aria-live="polite"><p class="jy-kick"></p><h2 class="jy-t"></h2><p class="jy-b"></p><p class="jy-fine"></p></div>
      <p class="jy-callout" id="jy-call"><i></i>${esc(JOURNEY.labels.esophagus)}</p>
      <p class="jy-scale">${esc(JOURNEY.notToScale)}</p>
      <p class="jy-cue">${esc(JOURNEY.scrollCue)}<span aria-hidden="true">&darr;</span></p>
    </div>
    <p class="jy-note">${esc(JOURNEY.disclaimer)} <a href="#" data-journey="note">${esc(JOURNEY.disclaimerLink)}</a></p>
  </section>
  <div class="jy-scroll" id="jy-scroll"></div>`;
}

// ----- The actor (the Start pill, fixed at the centre) -----
// Every chapter sets the whole state each frame, so scrolling backwards always undoes cleanly.
// rot: degrees. zoom: on top of the base size. dissolve: 0..1 shell fades and its outline breaks up.
// spill: 0..1 the other granules drift away. hero: 0..1 the camera re-centres on the hero granule.
// others: 0..1 how visible the other granules stay. melt: 0..1 the hero granule dissolves into molecules
// and shrinks to the hero molecule. mols: 0..1 how visible those released molecules are. fade: 0..1 the
// whole actor (the body map hides it and draws the hero as a dot instead). funnel: 0..1 the other granules
// squeeze into a column (on screen) to fit through a narrow passage with the hero. burst: 0..1 they rush
// outward from the hero, growing and fading, as if the camera were moving past them. bound(x, y, r): optional;
// given a granule's screen offset from the hero and its radius (px), returns a corrected [x, y] that keeps
// it inside the scene's space (the pylorus uses it to keep granules in the fluid, off the walls).
function jyActor({ rot, zoom = 1, dissolve = 0, spill = 0, hero = 0, others = 1, melt = 0, mols = 0, fade = 1, funnel = 0, burst = 0, bound = null }) {
  const A = JY.actor; if (!A) return;
  const base = JY.base, unit = JY.pillUnit * base * zoom;   // px per capsule unit (sizes measured once in jyMeasure, never mid-frame)
  const [hx, hy] = JY_GRAINS[JY_HERO], t = rot * Math.PI / 180, ox = hx - 140, oy = hy - 50;
  const dx = -(ox * Math.cos(t) - oy * Math.sin(t)) * unit * hero, dy = -(ox * Math.sin(t) + oy * Math.cos(t)) * unit * hero;
  const st = A.pill.style;
  st.setProperty("--rot", rot.toFixed(2) + "deg"); st.setProperty("--zoom", (base * zoom).toFixed(4));
  st.setProperty("--dx", dx.toFixed(1) + "px"); st.setProperty("--dy", dy.toFixed(1) + "px");
  A.shell.style.opacity = A.gloss.style.opacity = (1 - dissolve).toFixed(3);
  A.edge.style.opacity = (1 - dissolve * dissolve).toFixed(3);
  A.edge.style.strokeDasharray = dissolve > 0.001 ? `${(0.06 * (1 - dissolve)).toFixed(4)} ${(0.06 * dissolve).toFixed(4)}` : "";
  // The other granules only need updating when their state changes (or when bounded to a moving scene).
  const gKey = bound ? "" : [rot.toFixed(2), unit.toFixed(3), spill, burst, funnel, others].join();
  if (!gKey || gKey !== A.gKey) A.grains.forEach(g => {
    const i = +g.dataset.i;
    if (i === JY_HERO) return;
    const [sx, sy] = JY_SPILL[i], x = +g.getAttribute("cx"), y = +g.getAttribute("cy");
    let px = x + sx * spill - hx, py = y + sy * spill - hy;   // where it sits relative to the hero (capsule units)
    if (funnel > 0.001 || burst > 0.001 || bound) {   // work on screen axes: rotate, squeeze/expand, keep in bounds, rotate back
      const k = 1 + 3 * burst;
      let X = (px * Math.cos(t) - py * Math.sin(t)) * (1 - 0.84 * funnel) * k, Y = (px * Math.sin(t) + py * Math.cos(t)) * (1 + 0.35 * funnel) * k;
      if (bound) { const b = bound(X * unit, Y * unit, +g.getAttribute("r") * (1 + 1.4 * burst) * unit); X = b[0] / unit; Y = b[1] / unit; }
      px = X * Math.cos(t) + Y * Math.sin(t); py = -X * Math.sin(t) + Y * Math.cos(t);
    }
    const tx = px + hx - x, ty = py + hy - y;
    if (spill > 0.001 || burst > 0.001 || funnel > 0.001 || bound) g.setAttribute("transform", `translate(${tx.toFixed(2)} ${ty.toFixed(2)})` + (burst > 0.001 ? ` scale(${(1 + 1.4 * burst).toFixed(3)})` : "")   /* CSS scales each granule about its own centre (transform-box: fill-box) */);
    else g.removeAttribute("transform");
    const fadeOut = others * (1 - burst);
    g.style.opacity = spill > 0.001 || fadeOut < 1 ? ((spill > 0.001 ? 0.8 - 0.25 * spill : 0.8) * fadeOut).toFixed(3) : "";
  });
  A.gKey = gKey;
  A.ring.style.opacity = hero.toFixed(3);
  A.heroG.setAttribute("r", (JY_GRAINS[JY_HERO][2] - 3.6 * melt).toFixed(2));
  A.ring.setAttribute("r", (10 - 4.5 * melt).toFixed(2));
  if (melt !== A.melt) A.mols.forEach((m, i) => {
    if (melt > 0.001) m.setAttribute("transform", `translate(${(JY_MOLS[i][0] * melt).toFixed(2)} ${(JY_MOLS[i][1] * melt).toFixed(2)})`); else m.removeAttribute("transform");
  });
  A.melt = melt;
  A.molG.style.opacity = mols.toFixed(3);
  A.pill.style.opacity = fade < 1 ? fade.toFixed(3) : "";
  A.pill.classList.toggle("jy-free", dissolve > 0.001);
}

// ----- Chapters -----
const JY = { on: false, ready: false, raf: 0, cap: "", ch: -1, actor: null };
const jyClamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const jySmooth = t => t * t * (3 - 2 * t);
const jyReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const jyLerp = (a, b, t) => a + (b - a) * t;

// Chapters register themselves, in story order:
//   jyChapter({ key, layers, front?, init?, frame })
// key: names its wording list (JOURNEY[key]) and knobs (JOURNEY[key + "Choreo"], which needs `screens`).
// layers(): the HTML for its world layer. front(): optional layer drawn in front of the pill.
// notToScale: true shows the "Not to scale" note. capRight(q): optional, true puts the caption on the
// right on wide screens (when the scene's empty space is there). init(root): optional, runs when the tour starts. frame(q, v, own): q = 0..1 through the chapter,
// v = viewport numbers, own = true when this chapter is the one on screen (it then also drives the pill
// with jyActor(), and its front layer).
// Drawings live in "world units": 1 unit = 1 CSS px at scale 1. The pill always sits at the screen centre,
// and each frame function moves and scales its own drawing around it.
const JY_CHAPTERS = [];
function jyChapter(def) { JY_CHAPTERS.push(def); }
const jyScreens = ch => JOURNEY[ch.key + "Choreo"].screens;


// ----- Choreography -----
function jyStop() {
  JY.on = JY.ready = false; JY.cap = ""; JY.ch = -1; JY.actor = null; JY.max = undefined;
  cancelAnimationFrame(JY.raf);
  removeEventListener("scroll", jyOnScroll); removeEventListener("resize", jyOnScroll);
}

// Start: the Skip pill fades, the Start pill flies to the centre and becomes the blank puppet,
// then the mouth rises in and the page starts scrolling.
function jyStart() {
  const root = document.getElementById("jy"), pill = root && root.querySelector(".jy-start");
  if (!pill || JY.on) return;
  JY.on = true;
  const C = JOURNEY.choreo, rm = jyReduced();
  const r0 = pill.getBoundingClientRect();
  pill.insertAdjacentHTML("beforebegin", `<span class="jy-ghost" style="width:${r0.width}px;height:${r0.height}px"></span>`);
  pill.disabled = true; pill.tabIndex = -1;
  pill.style.setProperty("--fly", C.flightMs + "ms");
  root.classList.add("jy-going");
  pill.classList.add("jy-actor");
  JY.actor = { pill, shell: pill.querySelector(".jy-shell"), gloss: pill.querySelector(".jy-gloss"), edge: pill.querySelector(".jy-edge"),
    ring: pill.querySelector(".jy-ring"), grains: [...pill.querySelectorAll(".jy-g")], heroG: pill.querySelector(".jy-hero"),
    molG: pill.querySelector(".jy-mols"), mols: [...pill.querySelectorAll(".jy-mols circle")] };
  jyMeasure();
  jyActor({ rot: JOURNEY.swallowChoreo.hoverTilt, zoom: jyPillStart() });   // shrinks during the flight
  if (!rm) {   // play the flight from where the pill was (the centre of a box doesn't move when it rotates or scales)
    const r1 = pill.getBoundingClientRect();
    const dx = r0.left + r0.width / 2 - (r1.left + r1.width / 2), dy = r0.top + r0.height / 2 - (r1.top + r1.height / 2);
    pill.style.transition = "none";
    pill.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
    pill.getBoundingClientRect();
    pill.style.transition = ""; pill.style.transform = "";
  }
  JY_CHAPTERS.forEach(ch => ch.init && ch.init(root));
  setTimeout(() => {
    if (!JY.on || current !== "journey") return;
    document.getElementById("jy-scroll").style.height = JY_CHAPTERS.reduce((n, ch) => n + jyScreens(ch), 0) * 100 + "vh";
    root.classList.add("jy-inscene");
    JY.ready = true;
    jyMeasure();
    addEventListener("scroll", jyOnScroll, { passive: true }); addEventListener("resize", jyOnScroll);
    jyFrame();
    setTimeout(() => pill.classList.add("flown"), rm ? 0 : Math.max(0, C.flightMs - C.sceneDelayMs) + 50);
  }, rm ? 0 : C.sceneDelayMs);
}

function jyOnScroll(e) {
  if (current !== "journey") { jyStop(); return; }
  if (e && e.type === "resize") jyMeasure();
  cancelAnimationFrame(JY.raf); JY.raf = requestAnimationFrame(jyFrame);
}

// Layout sizes the frames need, read once at the start and on resize, so a scroll frame never forces the
// browser to recalculate layout (that was a source of choppiness).
function jyMeasure() {
  JY.max = document.documentElement.scrollHeight - innerHeight;
  JY.base = matchMedia("(max-width: 640px)").matches ? 0.62 : 0.72;
  if (JY.actor) JY.pillUnit = Math.min(JY.actor.pill.offsetWidth / 280, JY.actor.pill.offsetHeight / 100);
}
// Where we are, in screens: 0 at the top, sum of all chapters' screens at the bottom.
function jyPos() {
  if (JY.max === undefined) jyMeasure();
  const max = JY.max, total = JY_CHAPTERS.reduce((n, ch) => n + jyScreens(ch), 0);
  return { at: max > 0 ? jyClamp(scrollY / max) * total : 0, total, max };
}
// Scroll to a point in a chapter (used by tests and handy for tuning in the console): jyGoto("stomach", 0.5).
function jyGoto(key, q) {
  const { total, max } = jyPos();
  let start = 0;
  for (const ch of JY_CHAPTERS) { if (ch.key === key) break; start += jyScreens(ch); }
  const ch = JY_CHAPTERS.find(c => c.key === key);
  scrollTo(0, (start + jyClamp(q) * jyScreens(ch)) / total * max);
}

function jyFrame() {
  if (!JY.ready) return;
  const root = document.getElementById("jy"); if (!root) return;
  const H = innerHeight, v = { H, cx: innerWidth / 2, cy: H / 2, s: jyClamp(H / 820, 0.7, 1.3), rm: jyReduced() };
  const { at } = jyPos(), fade = JOURNEY.choreo.fadeScreens;
  // Which chapter owns this moment, and how far through it we are.
  let start = 0, own = 0;
  const spans = JY_CHAPTERS.map((ch, i) => { const sp = [start, start + jyScreens(ch)]; if (at >= start) own = i; start = sp[1]; return sp; });
  // Draw every chapter that's visible. A chapter fades in on top of the one before it around their
  // boundary; once it's fully opaque the one underneath is hidden.
  const op = spans.map(([a], i) => i === 0 ? 1 : jyClamp((at - (a - fade / 2)) / fade));
  JY_CHAPTERS.forEach((ch, i) => {
    const el = document.getElementById("jy-ch-" + ch.key);
    const covered = op[i + 1] === 1, shown = op[i] > 0 && !covered;
    el.style.visibility = shown ? "visible" : "hidden";
    el.style.opacity = op[i].toFixed(3);
    if (shown || i === own) ch.frame(jyClamp((at - spans[i][0]) / (spans[i][1] - spans[i][0])), v, i === own);
  });
  JY_CHAPTERS.forEach((ch, i) => { if (ch.front && i !== own) document.getElementById("jy-front-" + ch.key).style.opacity = 0; });
  // Captions, chapter dots and the scroll cue.
  const ch = JY_CHAPTERS[own], q = jyClamp((at - spans[own][0]) / (spans[own][1] - spans[own][0]));
  let ci = 0; JOURNEY[ch.key].forEach((c, j) => { if (q >= c.at) ci = j; });
  if (ch.key + ci !== JY.cap) jyCaption(ch.key, ci, JY.cap !== "" && !v.rm);
  if (own !== JY.ch) {
    JY.ch = own;
    root.querySelectorAll(".jy-rail li").forEach((li, i) => { if (i === own) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); li.classList.toggle("done", i < own); });
  }
  root.style.setProperty("--chap", q.toFixed(3));
  root.classList.toggle("jy-noscale", !!ch.notToScale);
  root.classList.toggle("jy-capright", !!(ch.capRight && ch.capRight(q)));
  root.classList.toggle("jy-moved", at > 0.1);
}

function jyCaption(key, i, animate) {
  JY.cap = key + i;
  const box = document.getElementById("jy-caption"), c = JOURNEY[key][i];
  const fill = () => {
    box.querySelector(".jy-kick").textContent = c.kicker;
    box.querySelector(".jy-t").textContent = c.title;
    box.querySelector(".jy-b").textContent = c.body;
    box.querySelector(".jy-fine").textContent = c.note || "";
    box.classList.remove("swap");
  };
  if (!animate) { fill(); return; }
  box.classList.add("swap"); setTimeout(fill, 180);
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-journey]");
  if (!b || current !== "journey") return;
  e.preventDefault();
  const k = b.dataset.journey;
  if (k === "skip") go("stack");
  else if (k === "note") { go(""); document.getElementById("notice")?.scrollIntoView(); }
  else if (k === "start") jyStart();
});
