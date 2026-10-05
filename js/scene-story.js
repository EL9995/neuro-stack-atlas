// Caption wording lives in content/scene-captions.js; these are the scroll points where each appears.
const NSB = [0, .10, .40, .50, .56, .67, .79, .87, .91, .96].map((p, i) => [p, ...STORY_SCENE.captions[i]]);
const NSK = [[0, 250, 400, 560, 380], [.14, 380, 400, 640, 300], [.40, 1500, 400, 640, 300], [.50, 1610, 400, 420, 340], [.58, 1715, 400, 330, 300], [.70, 1780, 400, 360, 320], [.78, 2050, 400, 900, 520], [.84, 1560, 400, 260, 240], [1, 1560, 400, 260, 240]];
const NS_REC = [-110, -66, -22, 22, 66, 110].map(dy => [2000 - 245 * Math.sqrt(1 - (dy / 235) ** 2) - 7, 400 + dy]);
const NSD = Array.from({ length: 14 }, (_, j) => {
  const sy = [352, 400, 448][j % 3] + (Math.floor(j / 3) - 2) * 7, bind = j < 6;
  return { j, sy, bind, tx: bind ? NS_REC[j][0] - 16 : 1700 + (j * 37) % 34, ty: bind ? NS_REC[j][1] : 330 + (j * 53) % 150 };
});
const NS = { stage: null, refs: null, p: -1, beat: -1, raf: 0, sw: 0, A: 1.6, W: 1000, H: 600 };
const nsC = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const nsS = t => t * t * (3 - 2 * t);
const nsL = (a, b, t) => a + (b - a) * t;
const nsG = (p, a, b) => nsC((p - a) / (b - a));
const nsW = (p, a, b, c, d) => nsS(nsG(p, a, b)) * (1 - nsS(nsG(p, c, d)));

function nsVes(x, y) {
  return `<circle cx="${x}" cy="${y}" r="24" fill="#ffb340" fill-opacity=".14" stroke="#ffb340" stroke-width="1.6"/>`;
}
function nsVesIn(x, y) {
  return `<g class="vin"><circle cx="${x - 7}" cy="${y - 5}" r="3.6" fill="#ffb340"/><circle cx="${x + 8}" cy="${y - 3}" r="3.6" fill="#ffb340"/><circle cx="${x}" cy="${y + 8}" r="3.6" fill="#ffb340"/></g>`;
}
function nsStars() {
  let s = 7, o = "";
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) o += `<circle cx="${(-100 + rnd() * 3000).toFixed(0)}" cy="${(40 + rnd() * 720).toFixed(0)}" r="${(0.8 + rnd() * 1.8).toFixed(1)}" fill="#8fa6d9" opacity="${(0.12 + rnd() * 0.35).toFixed(2)}"/>`;
  return o;
}
function nsSceneHtml() {
  const stat = [[1500, 345], [1490, 430], [1545, 470], [1550, 330]].map(([x, y]) => nsVes(x, y) + nsVesIn(x, y)).join("");
  const fuse = [352, 400, 448].map((y, f) => `<g id="ns-fv${f}">${nsVes(1590, y)}${nsVesIn(1590, y)}</g>`).join("");
  const rec = NS_REC.map(([x, y], k) => `<g><circle cx="${x}" cy="${y}" r="10" fill="#26345a" stroke="#4c6aa8" stroke-width="1.5"/><circle id="ns-rg${k}" cx="${x}" cy="${y}" r="28" fill="url(#ns-glow)" opacity="0"/><circle id="ns-rc${k}" cx="${x}" cy="${y}" r="10" fill="#7fe6ff" opacity="0"/></g>`).join("");
  const dots = NSD.map(d => `<circle id="ns-d${d.j}" r="5" fill="#ffb340" stroke="#ffb340" stroke-opacity=".3" stroke-width="8" opacity="0"/>`).join("");
  const myA = [380, 570, 760, 950, 1140].map(x => `<rect x="${x}" y="383" width="150" height="34" rx="17" fill="#1b2a52" stroke="#34508f"/>`).join("");
  const myB = [2300, 2490].map(x => `<rect x="${x}" y="383" width="150" height="34" rx="17" fill="#1b2a52" stroke="#34508f"/>`).join("");
  const dend = ["M120 380 Q60 340 20 300", "M115 420 Q50 450 0 500", "M150 330 Q120 270 90 230", "M150 470 Q130 530 95 570", "M105 400 Q40 400 -30 395"].map(d => `<path d="${d}" fill="none" stroke="#2a3a66" stroke-width="7" stroke-linecap="round"/>`).join("");
  const lab = (id, x, y, t) => `<text id="${id}" x="${x}" y="${y}" text-anchor="middle" fill="#b8c7e6" stroke="#060a14" stroke-width="3" paint-order="stroke" font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="14" opacity="0">${t}</text>`;
  return `<svg class="ns-world" id="ns-world" viewBox="0 0 900 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <radialGradient id="ns-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7fe6ff" stop-opacity=".85"/><stop offset="1" stop-color="#7fe6ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="ns-soma" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#2d4585"/><stop offset="1" stop-color="#101a38"/></radialGradient>
      <linearGradient id="ns-trail" gradientUnits="userSpaceOnUse" x1="-170" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#7fe6ff" stop-opacity="0"/><stop offset="1" stop-color="#7fe6ff" stop-opacity=".95"/></linearGradient>
    </defs>
    ${nsStars()}
    ${dend}
    <circle id="ns-sg" cx="200" cy="400" r="150" fill="url(#ns-glow)" opacity="0"/>
    <circle cx="200" cy="400" r="95" fill="url(#ns-soma)" stroke="#34508f" stroke-width="2"/>
    <circle cx="190" cy="395" r="36" fill="#0f1a38" stroke="#2c4478" stroke-width="2"/>
    <path d="M290 400 H1450" stroke="#2a3a66" stroke-width="16" stroke-linecap="round"/>
    <path d="M290 400 H1450" stroke="#3a5aa8" stroke-width="2"/>
    ${myA}
    <ellipse cx="1560" cy="400" rx="115" ry="135" fill="#16254a" stroke="#3a5aa8" stroke-width="2.5"/>
    ${stat}${fuse}
    <circle id="ns-tf" cx="1560" cy="400" r="25" fill="none" stroke="#7fe6ff" stroke-width="3" opacity="0"/>
    <ellipse cx="2000" cy="400" rx="245" ry="235" fill="url(#ns-soma)" stroke="#34508f" stroke-width="2"/>
    <ellipse id="ns-bf" cx="2000" cy="400" rx="300" ry="290" fill="url(#ns-glow)" opacity="0"/>
    <ellipse id="ns-bg" cx="2000" cy="400" rx="245" ry="235" fill="none" stroke="#7fe6ff" stroke-width="8" opacity="0"/>
    <ellipse cx="2070" cy="395" rx="78" ry="74" fill="#0f1a38" stroke="#2c4478" stroke-width="2"/>
    <path d="M2245 400 H2780" stroke="#2a3a66" stroke-width="16" stroke-linecap="round"/>
    <path d="M2245 400 H2780" stroke="#3a5aa8" stroke-width="2"/>
    ${myB}
    ${rec}
    ${dots}
    <g id="ns-pa" opacity="0"><line x1="-170" y1="0" x2="0" y2="0" stroke="url(#ns-trail)" stroke-width="10" stroke-linecap="round"/><circle r="46" fill="url(#ns-glow)"/><circle r="9" fill="#e9fbff"/></g>
    <g id="ns-pb" opacity="0"><line x1="-170" y1="0" x2="0" y2="0" stroke="url(#ns-trail)" stroke-width="10" stroke-linecap="round"/><circle r="46" fill="url(#ns-glow)"/><circle r="9" fill="#e9fbff"/></g>
    ${lab("ns-l0", 200, 282, "Cell body")}${lab("ns-l1", 800, 366, "Axon")}${lab("ns-l2", 1560, 252, "Axon terminal")}
    ${lab("ns-l3", 1540, 252, "Vesicles")}${lab("ns-l4", 1715, 300, "Synaptic cleft")}${lab("ns-l5", 1860, 318, "Receptors")}
  </svg>`;
}
function nsAsmHtml() {
  const txt = (id, x, y, t) => `<text id="${id}" x="${x}" y="${y}" text-anchor="middle" fill="#c9d4ea" font-family="'IBM Plex Sans', system-ui, sans-serif" font-weight="500" font-size="18" opacity="0">${t}</text>`;
  const chip = (id, t) => `<g id="${id}" opacity="0"><rect x="-34" y="-15" width="68" height="30" rx="15" fill="#7fe6ff" fill-opacity=".14" stroke="#7fe6ff" stroke-width="1.6"/><text text-anchor="middle" y="5.5" font-size="16" font-family="'IBM Plex Mono', monospace" fill="#e9fbff">${t}</text></g>`;
  return `<svg class="ns-asm" id="ns-asm" viewBox="0 0 800 460" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><radialGradient id="na-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7fe6ff" stop-opacity=".5"/><stop offset="1" stop-color="#7fe6ff" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="400" cy="230" rx="372" ry="206" fill="none" stroke="#1d2c52" stroke-width="2" stroke-dasharray="3 9"/>
    ${[170, 230, 290].map((y, i) => `<circle id="na-p${i}" cx="-60" cy="${y}" r="17" fill="#8aa4ff" stroke="#8aa4ff" stroke-opacity=".3" stroke-width="10" opacity="0"/>`).join("")}
    ${txt("na-lp", 95, 352, "Precursors")}
    <ellipse id="na-eg" cx="400" cy="230" rx="150" ry="170" fill="url(#na-glow)" opacity="0"/>
    <g id="na-enz" opacity="0"><path d="M330 150 Q330 120 360 120 H440 Q470 120 470 150 V310 Q470 340 440 340 H360 Q330 340 330 310 V260 L362 230 L330 200 Z" fill="#1b2a52" stroke="#c9d4ea" stroke-width="2.2"/></g>
    ${txt("na-le", 400, 378, "Enzyme")}
    ${chip("na-c0", "Iron")}${chip("na-c1", "B6")}
    ${txt("na-lc", 400, 44, "Cofactors")}
    <circle cx="650" cy="230" r="68" fill="#ffb340" fill-opacity=".07" stroke="#ffb340" stroke-opacity=".7" stroke-width="2" id="na-v" opacity="0"/>
    ${[0, 1, 2].map(i => `<circle id="na-o${i}" cx="470" cy="230" r="14" fill="#ffb340" stroke="#ffb340" stroke-opacity=".3" stroke-width="8" opacity="0"/>`).join("")}
    ${txt("na-ln", 640, 332, "Neurotransmitters")}
  </svg>`;
}
function nstoryHtml() {
  return `
  <section class="ns" id="ns" aria-label="What are neurotransmitters? A scroll-through story">
    <h2 class="sr">What are neurotransmitters?</h2>
    <div class="sr">${NSB.map(b => `<p><b>${b[1]}.</b> ${b[2]}</p>`).join("")}</div>
    <div class="ns-stage" id="ns-stage">
      ${nsSceneHtml()}
      ${nsAsmHtml()}
      <div class="ns-legend" aria-hidden="true"><span class="ns-chip ns-e" id="ns-le"><i></i>Electrical</span><span class="ns-chip ns-c" id="ns-lc"><i></i>Chemical</span></div>
      <div class="ns-cap" id="ns-cap" aria-hidden="true"><p class="ns-t" id="ns-t">${NSB[0][1]}</p><p class="ns-b" id="ns-b">${NSB[0][2]}</p><button class="tc-btn ns-cta" id="ns-cta" data-scroll="safe" type="button" hidden>See where supplements fit in</button></div>
      <div class="ns-prog" aria-hidden="true"><i id="ns-pf"></i></div>
    </div>
  </section>`;
}

function nsCam(p) {
  let i = 0; while (i < NSK.length - 2 && p > NSK[i + 1][0]) i++;
  const a = NSK[i], b = NSK[i + 1], t = nsS(nsG(p, a[0], b[0]));
  return [nsL(a[1], b[1], t), nsL(a[2], b[2], t), Math.exp(nsL(Math.log(a[3]), Math.log(b[3]), t)), Math.exp(nsL(Math.log(a[4]), Math.log(b[4]), t))];
}
function nsDot(d, p) {
  const t0 = .465 + d.j * .003, e = nsS(nsG(p, t0, t0 + .03)), k = d.j % 4, c = nsS(nsG(p, .52 + k * .012, .60 + k * .012));
  let x = nsL(1648, 1676, e), y = d.sy;
  if (c > 0) { x = nsL(1676, d.tx, c); y = nsL(d.sy, d.ty, c) + Math.sin(c * 9 + d.j) * 7 * (1 - c); }
  let o = nsS(nsG(p, t0, t0 + .012));
  o *= d.bind ? 1 - nsS(nsG(p, .74, .78)) : 1 - nsS(nsG(p, .64, .70));
  return [x, y, o];
}
function nsRefs() {
  const $ = id => document.getElementById(id);
  return {
    world: $("ns-world"), asm: $("ns-asm"), pa: $("ns-pa"), pb: $("ns-pb"), sg: $("ns-sg"), tf: $("ns-tf"), bf: $("ns-bf"), bg: $("ns-bg"),
    fv: [0, 1, 2].map(i => $("ns-fv" + i)), dots: NSD.map(d => $("ns-d" + d.j)),
    rg: NS_REC.map((_, k) => $("ns-rg" + k)), rc: NS_REC.map((_, k) => $("ns-rc" + k)),
    labels: [[$("ns-l0"), [0, .02, .10, .16]], [$("ns-l1"), [.12, .18, .32, .38]], [$("ns-l2"), [.36, .40, .44, .47]], [$("ns-l3"), [.46, .49, .55, .58]], [$("ns-l4"), [.52, .56, .66, .70]], [$("ns-l5"), [.58, .62, .70, .74]]],
    le: $("ns-le"), lc: $("ns-lc"), cap: $("ns-cap"), t: $("ns-t"), b: $("ns-b"), cta: $("ns-cta"), pf: $("ns-pf"),
    pre: [0, 1, 2].map(i => $("na-p" + i)), enz: $("na-enz"), eg: $("na-eg"), c0: $("na-c0"), c1: $("na-c1"), v: $("na-v"), o: [0, 1, 2].map(i => $("na-o" + i)),
    al: ["na-lp", "na-le", "na-lc", "na-ln"].map($)
  };
}
function nsBeat(i) {
  if (i === NS.beat) return; NS.beat = i;
  const R = NS.refs; R.cap.classList.add("swap"); clearTimeout(NS.sw);
  NS.sw = setTimeout(() => { R.t.textContent = NSB[i][1]; R.b.textContent = NSB[i][2]; R.cap.classList.remove("swap"); }, 150);
}
function nsFrame(p) {
  const R = NS.refs, f = v => v.toFixed(3);
  const [cx, cy, bw, bh] = nsCam(p), vw = Math.max(bw, bh * NS.A), vh = vw / NS.A, sc = NS.W / vw;
  R.world.setAttribute("viewBox", `${(cx - vw / 2).toFixed(1)} ${(cy - vh / 2).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
  R.labels.forEach(([el, w]) => { el.setAttribute("font-size", (12.5 / sc).toFixed(2)); el.setAttribute("stroke-width", (3 / sc).toFixed(2)); el.setAttribute("opacity", f(nsW(p, ...w))); });
  const ax = p < .14 ? nsL(215, 290, nsS(nsG(p, .08, .14))) : nsL(290, 1450, nsS(nsG(p, .14, .40)));
  R.pa.setAttribute("transform", `translate(${ax.toFixed(1)},400)`);
  R.pa.setAttribute("opacity", f(nsS(nsG(p, .08, .10)) * (1 - nsS(nsG(p, .40, .43)))));
  R.sg.setAttribute("opacity", f(nsW(p, .05, .09, .11, .20)));
  const tf = nsG(p, .40, .47);
  R.tf.setAttribute("r", nsL(25, 170, nsS(tf)).toFixed(1)); R.tf.setAttribute("opacity", tf > 0 && tf < 1 ? f((1 - tf) * .9) : "0");
  const fz = nsS(nsG(p, .42, .49)), spill = 1 - nsS(nsG(p, .47, .53)), dim = 1 - .6 * nsS(nsG(p, .53, .58));
  R.fv.forEach(g => { g.setAttribute("transform", `translate(${(57 * fz).toFixed(1)},0)`); g.setAttribute("opacity", f(dim)); g.querySelector(".vin").setAttribute("opacity", f(spill)); });
  NSD.forEach((d, i) => { const [x, y, o] = nsDot(d, p); const el = R.dots[i]; el.setAttribute("cx", x.toFixed(1)); el.setAttribute("cy", y.toFixed(1)); el.setAttribute("opacity", f(o)); });
  NS_REC.forEach((_, k) => { const arr = .60 + (k % 4) * .012, lit = nsS(nsG(p, arr - .015, arr)) * (1 - nsS(nsG(p, .74, .78))); R.rg[k].setAttribute("opacity", f(lit * .9)); R.rc[k].setAttribute("opacity", f(lit)); });
  const bf = nsW(p, .62, .67, .74, .80);
  R.bf.setAttribute("opacity", f(bf * .45)); R.bg.setAttribute("opacity", f(bf * .7));
  const bx = p < .72 ? nsL(1790, 2245, nsS(nsG(p, .66, .72))) : nsL(2245, 2780, nsS(nsG(p, .72, .80)));
  R.pb.setAttribute("transform", `translate(${bx.toFixed(1)},400)`);
  R.pb.setAttribute("opacity", f(nsS(nsG(p, .66, .68)) * (1 - nsS(nsG(p, .79, .82)))));

  const asm = nsS(nsG(p, .79, .85)); R.asm.style.opacity = f(asm); R.asm.style.visibility = asm > 0 ? "visible" : "hidden";
  const fs = nsC(14 / Math.min(NS.W / 800, (NS.H - 150) / 460), 17, 30).toFixed(1);
  R.al.forEach(el => el.setAttribute("font-size", fs));
  R.al[0].setAttribute("opacity", f(nsS(nsG(p, .84, .87)))); R.al[1].setAttribute("opacity", f(nsS(nsG(p, .87, .90)))); R.al[2].setAttribute("opacity", f(nsS(nsG(p, .91, .93)))); R.al[3].setAttribute("opacity", f(nsS(nsG(p, .95, .97))));
  R.pre.forEach((c, i) => { const s = i * .004, fly = nsS(nsG(p, .80 + s, .86 + s)), mv = nsS(nsG(p, .87, .91)); c.setAttribute("cx", nsL(nsL(-60, 95, fly), 332, mv).toFixed(1)); c.setAttribute("opacity", f(fly * (1 - nsS(nsG(p, .90, .92))))); });
  const ez = nsS(nsG(p, .85, .89)), sc2 = nsL(.85, 1, ez);
  R.enz.setAttribute("opacity", f(ez)); R.enz.setAttribute("transform", `translate(400 230) scale(${sc2.toFixed(3)}) translate(-400 -230)`);
  R.eg.setAttribute("opacity", f(nsS(nsG(p, .92, .94))));
  const cf = nsS(nsG(p, .89, .93));
  [[R.c0, 350], [R.c1, 450]].forEach(([g, x]) => { g.setAttribute("transform", `translate(${x} ${nsL(20, 92, cf).toFixed(1)})`); g.setAttribute("opacity", f(cf)); });
  R.v.setAttribute("opacity", f(nsS(nsG(p, .93, .95))));
  const slots = [[625, 205], [662, 240], [630, 262]];
  R.o.forEach((c, i) => { const a = .93 + .012 * i, t = nsS(nsG(p, a, a + .028)); c.setAttribute("cx", nsL(470, slots[i][0], t).toFixed(1)); c.setAttribute("cy", nsL(230, slots[i][1], t).toFixed(1)); c.setAttribute("opacity", f(nsG(p, a, a + .005))); });

  const eOn = (p > .06 && p < .44) || (p > .66 && p < .82), cOn = (p > .42 && p < .70) || p > .79;
  R.le.classList.toggle("on", eOn); R.lc.classList.toggle("on", cOn);
  R.pf.style.height = (p * 100).toFixed(1) + "%";
  R.cta.hidden = p < .955;
  let bi = 0; NSB.forEach((b, i) => { if (p >= b[0]) bi = i; }); nsBeat(bi);
}
function nsMeasure() {
  const st = NS.stage; if (!st) return;
  // Set the top-bar height first: it changes the stage's size, which we measure next.
  const ch = document.querySelector(".chrome"); if (ch) document.documentElement.style.setProperty("--chrome-h", ch.offsetHeight + "px");
  NS.W = st.clientWidth || 1000; NS.H = st.clientHeight || 600; NS.A = NS.W / NS.H;
}
function nsUpdate() {
  NS.raf = 0;
  const sec = document.getElementById("ns"); if (!sec || !NS.stage || !NS.refs) return;
  const r = sec.getBoundingClientRect(), top = parseFloat(getComputedStyle(NS.stage).top) || 0;
  const dist = Math.max(1, r.height - NS.stage.offsetHeight), p = nsC((top - r.top) / dist);
  if (Math.abs(p - NS.p) > 1e-4) { NS.p = p; nsFrame(p); }
}
function nsSchedule() { if (!NS.raf) NS.raf = requestAnimationFrame(nsUpdate); }
function nsInit() {
  NS.stage = document.getElementById("ns-stage"); if (!NS.stage) return;
  NS.refs = nsRefs(); NS.p = -1; NS.beat = 0; nsMeasure(); nsUpdate();
  if (NS.p < 0) { NS.p = 0; nsFrame(0); }
}
window.addEventListener("scroll", nsSchedule, { passive: true });
window.addEventListener("resize", () => { nsMeasure(); NS.p = -1; nsSchedule(); });

