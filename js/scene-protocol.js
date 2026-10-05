// ---------------------------------------------------------------------------
// PROTOCOL SCENE: "Is it safe?" on the home page (scroll driven).
// Three chapters drawn in one picture:
//   1. Foundation: a cell's wall firms up, its enzymes start turning once
//      vitamins and minerals arrive, its energy fills, then raw material flows.
//   2. Cycles: two weeks of 5-on / 2-off doses. Daily floods make the receiving
//      cell pull its receptors ("docks") in; days off bring them back.
//   3. Recovery: days off refill the sending cell's supply, sleep clears
//      leftovers, and the scene ends on a Foundation -> Cycles -> Recovery loop.
// Caption wording lives in content/scene-captions.js (PROTOCOL_SCENE).
// ---------------------------------------------------------------------------
const PC_AT = [0, .06, .12, .19, .26, .36, .42, .48, .54, .63, .73, .80, .86, .93];  // where each caption appears
const PCB = PC_AT.map((p, i) => [p, ...PROTOCOL_SCENE.captions[i]]);
const PC_CH = [0, .345, .725];                                                          // chapter starts
const PC = { stage: null, refs: null, p: -1, beat: -1, raf: 0, sw: 0 };
const PC_DOCK_Y = [80, 132, 184, 236, 288, 340];
const PC_DOCK_X = y => 596 - 20 * Math.sin(Math.PI * (y - 20) / 380);                   // follows the curved cell wall
const PC_VES = [[230, 110], [320, 160], [215, 205], [330, 245], [235, 300]];

// Docks out (0-6) and supply (0-1) at the start of each day of the 5-on / 2-off cycle.
const PC_ON = d => d % 7 < 5;
const PC_DAYS = (() => {
  const out = [{ r: 6, v: 1 }];
  for (let d = 0; d < 14; d++) {
    const { r, v } = out[d];
    out.push(PC_ON(d) ? { r: Math.max(2.5, r - .7), v: Math.max(.35, v - .13) } : { r: Math.min(6, r + 1.75), v: Math.min(1, v + .33) });
  }
  return out;
})();
function pcState(dayF) {
  const d = nsC(Math.floor(dayF), 0, 13), f = nsC(dayF - d), a = PC_DAYS[d], b = PC_DAYS[d + 1];
  return { d, f, r: nsL(a.r, b.r, nsS(nsG(f, .45, .95))), v: nsL(a.v, b.v, nsS(nsG(f, .2, .9))) };
}

function pcGear(cx, cy, r, n) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * .78 : r;
    d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a0)).toFixed(1)} ${(cy + rr * Math.sin(a0)).toFixed(1)} L${(cx + rr * Math.cos(a1)).toFixed(1)} ${(cy + rr * Math.sin(a1)).toFixed(1)} `;
  }
  return `<path d="${d}Z"/><circle cx="${cx}" cy="${cy}" r="${(r * .32).toFixed(1)}" fill="#060a14"/>`;
}

function pcSceneHtml() {
  const L = PROTOCOL_SCENE.labels;
  const lab = (x, y, t, extra = "") => `<text x="${x}" y="${y}" text-anchor="middle" class="pc-lab" ${extra}>${esc(t)}</text>`;
  const flow = Array.from({ length: 10 }, (_, i) => `<circle id="pc-f${i}" r="7" opacity="0"/>`).join("");
  const cof = [["B", 380, 30], ["Mg", 500, 14], ["Fe", 620, 30]].map(([t, x, y], i) =>
    `<g id="pc-co${i}" data-x="${x}" data-y="${y}" opacity="0"><circle r="16" fill="#7fe6ff" fill-opacity=".16" stroke="#7fe6ff" stroke-width="1.6"/><text text-anchor="middle" y="5" class="pc-chip">${t}</text></g>`).join("");
  const docks = PC_DOCK_Y.map((y, k) => `<g id="pc-r${k}"><path d="M${PC_DOCK_X(y) + 14} ${y - 15} H${PC_DOCK_X(y) - 4} Q${PC_DOCK_X(y) - 14} ${y - 15} ${PC_DOCK_X(y) - 14} ${y - 5} V${y - 3} H${PC_DOCK_X(y) - 4} V${y + 3} H${PC_DOCK_X(y) - 14} V${y + 5} Q${PC_DOCK_X(y) - 14} ${y + 15} ${PC_DOCK_X(y) - 4} ${y + 15} H${PC_DOCK_X(y) + 14}" fill="#26345a" stroke="#7fe6ff" stroke-width="1.8"/><circle id="pc-rf${k}" cx="${PC_DOCK_X(y) - 8}" cy="${y}" r="5.5" fill="#ffb340" opacity="0"/></g>`).join("");
  const dose = Array.from({ length: 12 }, (_, j) => `<circle id="pc-d${j}" r="5.5" fill="#ffb340" opacity="0"/>`).join("");
  const ves = PC_VES.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="22" fill="#ffb340" fill-opacity=".08" stroke="#ffb340" stroke-opacity=".7" stroke-width="1.6"/><circle id="pc-v${k}" cx="${x}" cy="${y}" r="17" fill="#ffb340" fill-opacity=".75"/>`).join("");
  const days = Array.from({ length: 14 }, (_, d) => `<g id="pc-day${d}"><rect x="${282 + d * 34}" y="398" width="28" height="28" rx="6" class="${PC_ON(d) ? "pc-on" : "pc-off"}"/>${PC_ON(d) ? "" : `<text x="${296 + d * 34}" y="416" text-anchor="middle" class="pc-offt">${esc(L.off)}</text>`}</g>`).join("");
  // Sleep step: green "repair and restock" particles settle into both cells
  const waste = Array.from({ length: 10 }, (_, i) => `<circle id="pc-w${i}" r="${3 + (i % 3)}" fill="#6fe0c8" opacity="0"/>`).join("");
  const stars = [[420, 30], [470, 70], [530, 22], [575, 64], [445, 110], [520, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#c9d4ea"/>`).join("");
  const loop = [["Foundation", -90], ["Cycles", 30], ["Recovery", 150]].map(([t, a], i) => {
    const x = 500 + 128 * Math.cos(a * Math.PI / 180), y = 205 + 128 * Math.sin(a * Math.PI / 180);
    return `<g id="pc-ln${i}" opacity="0"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="52" fill="#101a38" stroke="#7fe6ff" stroke-width="2"/><text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle" class="pc-loopt">${esc(PROTOCOL_SCENE.chapters[i])}</text></g>`;
  }).join("");
  return `<svg class="pc-svg" id="pc-svg" viewBox="0 0 1000 440" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <radialGradient id="pc-soma" cx="40%" cy="40%" r="70%"><stop offset="0" stop-color="#2d4585"/><stop offset="1" stop-color="#101a38"/></radialGradient>
      <radialGradient id="pc-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7fe6ff" stop-opacity=".5"/><stop offset="1" stop-color="#7fe6ff" stop-opacity="0"/></radialGradient>
      <marker id="pc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#7fe6ff"/></marker>
    </defs>

    <g id="pc-c1">
      <path d="M70 215 H340" stroke="#2a3a66" stroke-width="12" stroke-linecap="round"/>
      <path d="M660 215 H930" stroke="#2a3a66" stroke-width="12" stroke-linecap="round"/>
      ${lab(170, 188, L.rawIn)}${lab(830, 188, L.out)}
      <circle id="pc-glow1" cx="500" cy="215" r="210" fill="url(#pc-glow)" opacity="0"/>
      <circle cx="500" cy="215" r="160" fill="url(#pc-soma)"/>
      <circle id="pc-wall" cx="500" cy="215" r="160" fill="none" stroke="#7fe6ff" stroke-width="2" stroke-dasharray="3 12" stroke-opacity=".5"/>
      ${lab(500, 42, L.wall, 'id="pc-lw"')}
      <g id="pc-g0" class="pc-gear">${pcGear(445, 205, 40, 9)}</g>
      <g id="pc-g1" class="pc-gear pc-rev">${pcGear(522, 168, 27, 7)}</g>
      ${lab(455, 290, L.workers, 'id="pc-lg"')}
      <rect x="560" y="226" width="64" height="34" rx="6" fill="none" stroke="#c9d4ea" stroke-width="2"/>
      <rect x="624" y="236" width="6" height="14" rx="2" fill="#c9d4ea"/>
      <rect id="pc-bat" x="564" y="230" width="0" height="26" rx="3" fill="#6fe0c8"/>
      ${lab(594, 290, L.energy, 'id="pc-le"')}
      ${cof}
      ${flow}
    </g>

    <g id="pc-c2" opacity="0">
      <ellipse cx="220" cy="205" rx="170" ry="185" fill="url(#pc-soma)" stroke="#34508f" stroke-width="2"/>
      ${ves}
      ${lab(230, 58, L.sending)}
      <ellipse cx="850" cy="205" rx="270" ry="240" fill="url(#pc-soma)"/>
      <ellipse id="pc-calm" cx="850" cy="205" rx="300" ry="260" fill="url(#pc-glow)" opacity="0"/>
      <path d="M600 20 Q570 205 600 380" fill="none" stroke="#3a5aa8" stroke-width="3"/>
      ${docks}
      ${lab(760, 30, L.receiving)}
      ${lab(628, 70, L.docks, 'text-anchor="start" id="pc-ld"')}
      ${dose}
      ${waste}
      <rect x="940" y="90" width="16" height="250" rx="8" fill="#101a36" stroke="#2a3a66"/>
      <rect id="pc-meter" x="942" y="92" width="12" height="246" rx="6" fill="#ffb340"/>
      <text x="954" y="74" text-anchor="end" class="pc-lab">${esc(L.meter)}</text>
      <text x="270" y="417" text-anchor="end" class="pc-lab">${esc(L.day)}</text>
      ${days}
      <g id="pc-night" opacity="0">
        <rect x="-200" y="-100" width="1400" height="640" fill="#02040a" opacity=".38"/>
        ${stars}
        <path d="M486 26 a20 20 0 1 0 22 26 a16 16 0 1 1 -22 -26 z" fill="#e9fbff"/>
      </g>
    </g>

    <g id="pc-loop" opacity="0">
      <path d="M560.1 92 A128 128 0 0 1 627.9 209.5" fill="none" stroke="#7fe6ff" stroke-width="2" marker-end="url(#pc-arrow)"/>
      <path d="M567.8 313.6 A128 128 0 0 1 432.2 313.6" fill="none" stroke="#7fe6ff" stroke-width="2" marker-end="url(#pc-arrow)"/>
      <path d="M372.1 209.5 A128 128 0 0 1 439.9 92" fill="none" stroke="#7fe6ff" stroke-width="2" marker-end="url(#pc-arrow)"/>
      ${loop}
    </g>
  </svg>`;
}

function protocolHtml() {
  const P = LANDING.safety, B = PROTOCOL_SCENE.buttons;
  return `
  <section class="pr" id="safe" aria-labelledby="pr-h">
    <div class="pr-head">
      <h2 class="sec" id="pr-h">${txt(P.heading)}</h2>
      <p class="sec-intro">${txt(P.intro)}</p>
    </div>
    <div class="ns pc" id="pc">
      <div class="sr">${PCB.map(b => `<p><b>${esc(b[1])}.</b> ${esc(b[2])}</p>`).join("")}</div>
      <div class="ns-stage pc-stage" id="pc-stage">
        ${pcSceneHtml()}
        <div class="ns-legend" aria-hidden="true">${PROTOCOL_SCENE.chapters.map((c, i) => `<span class="ns-chip pc-chap" id="pc-ch${i}"><i></i>${i + 1} ${esc(c)}</span>`).join("")}</div>
        <p class="pc-note">${esc(PROTOCOL_SCENE.disclaimer)}</p>
        <div class="ns-cap" id="pc-cap" aria-hidden="true"><p class="ns-t" id="pc-t">${esc(PCB[0][1])}</p><p class="ns-b" id="pc-b">${esc(PCB[0][2])}</p><button class="tc-btn ns-cta" id="pc-cta" data-scroll="six" type="button" hidden>${esc(B.next)}</button></div>
        <div class="ns-prog" aria-hidden="true"><i id="pc-pf"></i></div>
      </div>
    </div>
  </section>`;
}

function pcRefs() {
  const $ = id => document.getElementById(id), ids = (pre, n) => Array.from({ length: n }, (_, i) => $(pre + i));
  return {
    c1: $("pc-c1"), c2: $("pc-c2"), loop: $("pc-loop"), wall: $("pc-wall"), glow1: $("pc-glow1"), bat: $("pc-bat"),
    g: ids("pc-g", 2), co: ids("pc-co", 3), f: ids("pc-f", 10), lw: $("pc-lw"), lg: $("pc-lg"), le: $("pc-le"),
    r: ids("pc-r", 6), rf: ids("pc-rf", 6), d: ids("pc-d", 12), v: ids("pc-v", 5), day: ids("pc-day", 14), w: ids("pc-w", 10),
    meter: $("pc-meter"), night: $("pc-night"), calm: $("pc-calm"), ln: ids("pc-ln", 3), ch: ids("pc-ch", 3),
    cap: $("pc-cap"), t: $("pc-t"), b: $("pc-b"), cta: $("pc-cta"), pf: $("pc-pf")
  };
}
function pcBeat(i) {
  if (i === PC.beat) return; PC.beat = i;
  const R = PC.refs; R.cap.classList.add("swap"); clearTimeout(PC.sw);
  PC.sw = setTimeout(() => { R.t.textContent = PCB[i][1]; R.b.textContent = PCB[i][2]; R.cap.classList.remove("swap"); }, 150);
}

function pcFrame(p) {
  const R = PC.refs, f = v => v.toFixed(3), set = (el, k, v) => el.setAttribute(k, v);

  // Chapter visibility
  const into2 = nsS(nsG(p, .33, .37)), into3 = nsS(nsG(p, .71, .74)), loopIn = nsS(nsG(p, .92, .955));
  set(R.c1, "opacity", f(1 - into2));
  set(R.c2, "opacity", f(into2 * (1 - .85 * loopIn)));
  set(R.loop, "opacity", f(loopIn));
  R.ln.forEach((g, i) => set(g, "opacity", f(nsS(nsG(p, .925 + i * .012, .945 + i * .012)))));
  const ch = p < PC_CH[1] ? 0 : p < PC_CH[2] ? 1 : 2;
  R.ch.forEach((el, i) => el.classList.toggle("on", i === ch || p >= .93));

  // 1. Foundation: wall, enzymes, energy, then flow
  const wall = nsS(nsG(p, .06, .11)), feed = nsS(nsG(p, .12, .17)), energy = nsS(nsG(p, .19, .24)), flowT = nsG(p, .26, .33);
  set(R.wall, "stroke-width", nsL(2, 7, wall).toFixed(2));
  set(R.wall, "stroke-dasharray", `${nsL(3, 1000, wall).toFixed(1)} ${nsL(12, 0, wall).toFixed(1)}`);
  set(R.wall, "stroke-opacity", f(nsL(.5, .9, wall)));
  R.lw.classList.toggle("hot", p >= .06 && p < .12);
  R.co.forEach((g, i) => {
    const t = nsS(nsG(p, .12 + i * .012, .16 + i * .012)), [tx, ty] = [[420, 150], [470, 255], [548, 128]][i];
    set(g, "transform", `translate(${nsL(+g.dataset.x, tx, t).toFixed(1)} ${nsL(+g.dataset.y, ty, t).toFixed(1)})`);
    set(g, "opacity", f(nsS(nsG(p, .115, .13)) * (1 - into2)));
  });
  R.g.forEach(g => { g.classList.toggle("run", feed > .5); g.style.setProperty("--gear", feed > .5 ? "#7fe6ff" : "#3a4a73"); });
  R.lg.classList.toggle("hot", p >= .12 && p < .19);
  set(R.bat, "width", (56 * nsL(.15, 1, energy)).toFixed(1));
  R.le.classList.toggle("hot", p >= .19 && p < .26);
  set(R.glow1, "opacity", f(.5 * wall * feed * energy));
  R.f.forEach((c, i) => {
    const u = nsC((flowT * 1.6) - i * .06), x = 70 + u * 860;
    set(c, "cx", x.toFixed(1)); set(c, "cy", (215 + Math.sin(u * 9 + i) * 6).toFixed(1));
    set(c, "fill", x < 560 ? "#8aa4ff" : "#ffb340");
    set(c, "opacity", f(u > 0 && u < 1 ? nsC(u * 12) * nsC((1 - u) * 12) : 0));
  });

  // 2 + 3. Days: an intro dose (day "-1"), 12 days of the cycle in chapter 2, then the 2 days off in chapter 3
  const intro = nsG(p, .365, .41);
  const dayF = p < .41 ? -1 + intro : p < .725 ? 12 * nsG(p, .41, .715) : 12 + 2 * nsG(p, .725, .79);
  const st = dayF < 0 ? { d: -1, f: intro, r: 6, v: 1 } : pcState(dayF);
  const doseDay = st.d < 0 || PC_ON(st.d);
  R.r.forEach((g, k) => {
    const out = nsC(st.r - k);
    set(g, "transform", `translate(${(42 * (1 - out)).toFixed(1)} 0)`);
    set(g, "opacity", f(.3 + .7 * out));
  });
  R.d.forEach((c, j) => {
    const k = j % 6, y0 = 120 + (j * 37) % 190, ty = PC_DOCK_Y[k], tx = PC_DOCK_X(ty) - 8, open = nsC(st.r - k) > .5;
    const u = nsS(nsC((st.f - .05 - j * .018) / .4));
    const x = nsL(400, open ? tx : tx - 30, u), y = nsL(y0, open ? ty : ty + (j % 2 ? 22 : -22), u);
    set(c, "cx", x.toFixed(1)); set(c, "cy", y.toFixed(1));
    set(c, "opacity", f(doseDay && into2 > .5 && st.f > .05 + j * .018 ? (1 - nsS(nsG(st.f, .55, .75))) * (open ? 1 : .6) : 0));
  });
  R.rf.forEach((c, k) => set(c, "opacity", f(doseDay && into2 > .5 ? nsC(st.r - k) * nsS(nsG(st.f, .35, .45)) * (1 - nsS(nsG(st.f, .7, .85))) : 0)));
  R.v.forEach(c => set(c, "r", (17 * Math.sqrt(st.v)).toFixed(2)));
  set(R.meter, "height", (246 * st.r / 6).toFixed(1)); set(R.meter, "y", (92 + 246 * (1 - st.r / 6)).toFixed(1));
  R.day.forEach((g, d) => { g.classList.toggle("now", d === st.d); g.classList.toggle("past", d < st.d); });

  // 3. Recovery: night, leftovers cleared, calm
  set(R.night, "opacity", f(into3));
  // Sleep: repair-and-restock particles drift down into the sending cell's vesicles and the receiving cell's docks
  const rest = nsG(p, .80, .865);
  R.w.forEach((c, i) => {
    const u = nsS(nsC(rest * 1.5 - i * .05)), tgt = i % 2 ? [PC_DOCK_X(PC_DOCK_Y[(i >> 1) % 6]) + 14, PC_DOCK_Y[(i >> 1) % 6]] : PC_VES[(i >> 1) % 5];
    const sx = 380 + (i * 47) % 240;
    set(c, "cx", nsL(sx, tgt[0], u).toFixed(1)); set(c, "cy", nsL(-30, tgt[1], u).toFixed(1));
    set(c, "opacity", f(nsS(nsG(p, .79, .81)) * nsC(u * 6) * (1 - nsS(nsG(u, .85, 1))) * (1 - loopIn)));
  });
  set(R.calm, "opacity", f(nsS(nsG(p, .86, .9)) * (1 - loopIn) * .55));

  R.pf.style.height = (p * 100).toFixed(1) + "%";
  R.cta.hidden = p < .955;
  let bi = 0; PCB.forEach((b, i) => { if (p >= b[0]) bi = i; }); pcBeat(bi);
}
function pcUpdate() {
  PC.raf = 0;
  const sec = document.getElementById("pc"); if (!sec || !PC.stage || !PC.refs) return;
  const r = sec.getBoundingClientRect(), top = parseFloat(getComputedStyle(PC.stage).top) || 0;
  const p = nsC((top - r.top) / Math.max(1, r.height - PC.stage.offsetHeight));
  if (Math.abs(p - PC.p) > 1e-4) { PC.p = p; pcFrame(p); }
}
function pcSchedule() { if (!PC.raf) PC.raf = requestAnimationFrame(pcUpdate); }
function pcInit() {
  PC.stage = document.getElementById("pc-stage"); if (!PC.stage) { PC.refs = null; return; }
  PC.refs = pcRefs(); PC.p = -1; PC.beat = 0; pcUpdate();
  if (PC.p < 0) { PC.p = 0; pcFrame(0); }
}
window.addEventListener("scroll", pcSchedule, { passive: true });
window.addEventListener("resize", () => { PC.p = -1; pcSchedule(); });
