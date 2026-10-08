// ---------------------------------------------------------------------------
// JOURNEY chapter 7, Synapse. The hero, a building block now in the brain, is taken up into a neuron's
// terminal through a carrier, goes down the assembly line (two enzymes, a cofactor docking on each)
// and becomes a messenger (an amber halo; the hero itself stays cyan), is packed into a vesicle, waits
// while a spark runs down the axon and around the terminal's rim to its vesicle, spills into the cleft when the vesicle fuses, docks in a receptor on
// the next neuron. Then the hero hands over to the signal: the camera leaves the molecule (which is cleared
// and pulled back in by reuptake, in view behind it) and rides the new electrical signal slowly through the
// next neuron's cell body and part way down its axon; the signal then launches off along the axon and the
// journey ends with the calls to action (JOURNEY.cta, drawn by js/journey.js).
// Drawn in screen units (the viewBox is the screen); the scene uses world units scaled around the hero.
// Shares the keyframe, door and show helpers with js/journey-barrier.js (loaded before this file).
// Core and chapter system: js/journey.js. Wording and beats: JOURNEY.synapse / synapseChoreo.
// ---------------------------------------------------------------------------

// The terminal: an axon from the left swelling into a bulb (ellipse centre (-300, 0), 420 x 330). The next
// neuron's membrane is a curve bulging toward it, about 70 units across the cleft.
const JY_SY = {
  bulb: [-300, 0, 420, 330], post: [[230, -340], [180, -150], [180, 150], [230, 340]],
  entry: { at: [-200, -320.5], rot: 11, n: [0.19, -0.98] },      // carrier in the top of the bulb (n = outward normal)
  uptake: { at: [74, 150], rot: 123, n: [0.839, 0.545] },        // reuptake carrier facing the cleft
  e1: [-420, -170], e2: [-250, -120],                             // the two enzymes
  ves: [-130, -60], dock: [88, 0],                                // the hero's vesicle, and where it docks at the membrane
  rimFrom: -1150,                                                 // where the signal starts along the axon (just off the terminal)
  others: [[-60, -170], [10, -110], [-30, 110], [-120, 170], [-200, 60]],
  recY: [-180, -120, -60, 0, 60, 120, 180],
  // the next neuron: cell body (nucleus above the signal's path), its axon from x 1260 to a terminal far
  // off to the right (ellipse centre (3800, 0), 330 x 260); the signal launches toward it at the end
  nucleus: [680, -170, 95], axon2: [1260, 55], term2: [3800, 0, 330, 260],
};
// x of the next neuron's membrane at height y (samples the curve)
const jySyPostX = (() => {
  const [a, b, c, d] = JY_SY.post, pts = [];
  for (let i = 0; i <= 60; i++) { const t = i / 60, u = 1 - t; pts.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]); }
  return y => pts.reduce((m, p) => Math.abs(p[1] - y) < Math.abs(m[1] - y) ? p : m)[0];
})();

// Offsets inside beats were tuned when the chapter was C.tunedAt screens long; o() keeps their timing in
// screens the same whatever C.screens is.
const jySyO = C => x => x * C.tunedAt / C.screens;
function jySyPlan(C) {
  const S = JY_SY, o = jySyO(C), side = (d, k) => [d.at[0] + d.n[0] * k, d.at[1] + d.n[1] * k];
  const [e1, e2, v, dk] = [S.e1, S.e2, S.ves, S.dock];
  const tEntry = C.enter[1] - o(0.025), tVes = C.pack[0] + o(0.03), tUp = C.pass[0] + o(0.03);
  const rec = y => [jySyPostX(y) - 13, y];
  const a0 = C.assemble[0];
  const hero = [[0, -170, -480], [tEntry - o(0.005), ...side(S.entry, 24)], [tEntry, ...S.entry.at], [tEntry + 0.018, ...S.entry.at], [C.enter[1] + o(0.01), ...side(S.entry, -26)],
    [a0 + o(0.035), e1[0] - 8, e1[1]], [a0 + o(0.08), e1[0] - 8, e1[1]], [a0 + o(0.115), e2[0] - 8, e2[1]], [a0 + o(0.16), e2[0] - 8, e2[1]], [C.assemble[1] - o(0.01), -200, -90],
    [tVes - o(0.005), v[0] - 54, v[1]], [tVes, v[0] - 30, v[1]], [tVes + 0.018, v[0] - 30, v[1]], [tVes + o(0.035), ...v], [C.spark[0], ...v], [C.spark[0] + o(C.vesTravel), ...dk],
    [C.release[0], ...dk], [C.release[0] + o(0.045), dk[0] + 52, dk[1] + 8], [C.fire[0] - o(0.02), ...rec(0)], [C.pass[0], ...rec(0)],
    [tUp - o(0.005), ...side(S.uptake, 24)], [tUp, ...S.uptake.at], [tUp + 0.018, ...S.uptake.at], [tUp + o(0.03), ...side(S.uptake, -26)], [C.soma[1], -10, 95], [1, -20, 88]];
  // the new signal in the next neuron: from the receptors, through the cell body, down the axon, into its terminal
  // (it waits at the receptors while the camera hands over, crosses the cell body slowly so the clearing
  // behind it stays in view, rides part way down the axon, then launches off along it)
  const r0x = jySyPostX(0) + 10;
  const sig = [[0, r0x, 0], [C.pass[1], r0x, 0], [C.soma[1], S.axon2[0], 0], [C.axon[1], S.axon2[0] + C.axonRide, 0], [1, S.axon2[0] + C.axonRide, 0]];
  // the vesicle carries the hero to the membrane
  const vesicle = [[0, ...v], [C.spark[0], ...v], [C.spark[0] + o(C.vesTravel), ...dk], [1, ...dk]];   // moves off as the spark starts, so it docks while the signal is on the rim
  // other messengers: packed in the hero's vesicle (offsets), spill when it fuses, most dock in receptors
  const inV = [[-10, -12], [12, -10], [-12, 10], [10, 13], [0, 0]], to = [rec(-120), rec(-60), rec(60), rec(120), [260, -260]];
  const mols = inV.map(([ox, oy], i) => {
    const r0 = C.release[0] + o(0.01 + i * 0.006), c0 = C.pass[0] + o(i * 0.006);
    return [[0, v[0] + ox, v[1] + oy], [C.spark[0], v[0] + ox, v[1] + oy], [C.spark[0] + o(C.vesTravel), dk[0] + ox, dk[1] + oy], [r0, dk[0] + ox, dk[1] + oy],
      [r0 + o(0.04), dk[0] + 50 + ox, dk[1] + oy * 4], [C.fire[0] - o(0.01 - i * 0.004), ...to[i]], [c0, ...to[i]], [c0 + o(0.06), to[i][0] - 40 - i * 12, to[i][1] + (i % 2 ? 50 : -50)], [1, to[i][0] - 60 - i * 12, to[i][1] + (i % 2 ? 70 : -70)]];
  });
  return { hero, sig, vesicle, mols, doors: { entry: [tEntry], ves: [tVes], uptake: [tUp] } };
}

function jySynapseSvg() {
  const S = JY_SY, [bx, by, rx, ry] = S.bulb, P = S.post;
  const ax = bx - rx * Math.sqrt(1 - (55 / ry) ** 2);
  const pre = `M-2200 -55L${ax.toFixed(1)} -55A${rx} ${ry} 0 1 1 ${ax.toFixed(1)} 55L-2200 55Z`;
  const [a2x, a2y] = S.axon2, [tx, ty, trx, try_] = S.term2, tl = tx - trx * Math.sqrt(1 - (a2y / try_) ** 2);
  const post = `M${P[0]}C${P[1]} ${P[2]} ${P[3]}C450 470 1000 330 ${a2x} ${a2y}L${tl.toFixed(1)} ${a2y}A${trx} ${try_} 0 1 0 ${tl.toFixed(1)} ${-a2y}L${a2x} ${-a2y}C1000 -330 450 -470 ${P[0]}Z`;
  const rim2 = sd => `M${a2x} ${a2y * sd}L${tl.toFixed(1)} ${a2y * sd}A${trx} ${try_} 0 0 ${sd < 0 ? 1 : 0} ${tx + trx} ${ty}`;
  const lobes = `<rect x="-17" y="-22" width="15" height="44" rx="7"/><rect x="2" y="-22" width="15" height="44" rx="7"/>`;
  const door = (id, o) => `<g id="${id}" class="jy-bb-door on" transform="translate(${o.at}) rotate(${o.rot})">${lobes}</g>`;
  const vesIn = (x, y) => [[-10, -12], [12, -10], [-12, 10], [10, 13], [0, 0]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="4.5"/>`).join("");
  const enzyme = (id, [x, y], chip) => `<g id="${id}" transform="translate(${x} ${y})">
      <ellipse class="jy-sy-eglow" rx="70" ry="80" opacity="0"/>
      <path class="jy-sy-enz" d="M-24 -38Q-24 -48 -14 -48H14Q24 -48 24 -38V38Q24 48 14 48H-14Q-24 48 -24 38V18L-8 0L-24 -18Z"/>
      <g class="jy-sy-chip"><rect x="-42" y="-13" width="84" height="26" rx="13"/><text y="5" text-anchor="middle">${esc(chip)}</text></g>
    </g>`;
  const rec = S.recY.map((y, i) => { const x = jySyPostX(y); return `<g transform="translate(${x.toFixed(1)} ${y})"><circle class="jy-sy-rglow" data-i="${i}" cx="-10" r="26" opacity="0"/><path class="jy-sy-rec" d="M6 -14H-16M6 14H-16M6 -14V14"/></g>`; }).join("");
  const L = JOURNEY.labels.synapse, lab = k => `<text id="jy-sy-t-${k}">${esc(L[k])}</text>`;
  return `<svg class="jy-head" id="jy-synapse" viewBox="0 0 1000 1000" preserveAspectRatio="none">
    <defs><radialGradient id="jy-sy-fluid" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#16205a"/><stop offset="1" stop-color="#0b1030"/></radialGradient>
      <radialGradient id="jy-sy-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7fe6ff" stop-opacity=".8"/><stop offset="1" stop-color="#7fe6ff" stop-opacity="0"/></radialGradient></defs>
    <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#jy-sy-fluid)"/>
    <g id="jy-sy-world">
      <path id="jy-sy-post" class="jy-sy-cell" d="${post}"/>
      <circle cx="${S.nucleus[0]}" cy="${S.nucleus[1]}" r="${S.nucleus[2]}" fill="#121c44" stroke="#3a5aa8" stroke-width="4"/>
      <path id="jy-sy-postglow" d="${post}" fill="none" stroke="#7fe6ff" stroke-width="10" opacity="0"/>
      <g id="jy-sy-rim2" fill="none" stroke-linecap="round">${[-1, 1].map(sd => `<path class="jy-sy-rimw" d="${rim2(sd)}" pathLength="1"/><path class="jy-sy-rimt" d="${rim2(sd)}" pathLength="1"/><path class="jy-sy-rimh" d="${rim2(sd)}" pathLength="1"/>`).join("")}</g>

      <path class="jy-sy-cell" d="${pre}"/>
      <g id="jy-sy-rim" fill="none" stroke-linecap="round">${[-1, 1].map(sd => {
        const d = `M${S.rimFrom} ${55 * sd}L${ax.toFixed(1)} ${55 * sd}A${rx} ${ry} 0 0 ${sd < 0 ? 1 : 0} ${bx + rx} ${by}`;
        return `<path class="jy-sy-rimw" d="${d}" pathLength="1"/><path class="jy-sy-rimt" d="${d}" pathLength="1"/><path class="jy-sy-rimh" d="${d}" pathLength="1"/>`;
      }).join("")}</g>
      <g id="jy-sy-spark"><line x1="-260" y1="0" x2="0" y2="0" stroke="#7fe6ff" stroke-width="14" stroke-linecap="round" opacity=".5"/><circle r="70" fill="url(#jy-sy-glow)"/><circle r="12" fill="#e9fbff"/></g>
      ${rec}
      <circle id="jy-sy-flash" cx="${S.dock[0] + 30}" cy="${S.dock[1]}" r="90" fill="url(#jy-sy-glow)" opacity="0"/>
      ${enzyme("jy-sy-e1", S.e1, L.cofactor)}${enzyme("jy-sy-e2", S.e2, L.cofactor)}
      <g class="jy-sy-ves">${S.others.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="30"/>`).join("")}</g>
      <g class="jy-sy-msg">${S.others.map(([x, y]) => vesIn(x, y)).join("")}</g>
      <g id="jy-sy-hv"><circle id="jy-sy-hvc" class="jy-sy-ves" cx="${S.ves[0]}" cy="${S.ves[1]}" r="30" pathLength="1"/>${door("jy-sy-dv", { at: [S.ves[0] - 30, S.ves[1]], rot: -90 })}</g>
      ${door("jy-sy-de", S.entry)}${door("jy-sy-du", S.uptake)}
      <g class="jy-sy-msg">${[0, 1, 2, 3, 4].map(i => `<circle id="jy-sy-m${i}" r="4.5"/>`).join("")}</g>
      <circle id="jy-sy-mol" r="6" fill="#7fe6ff" opacity="0"/><circle id="jy-sy-molring" fill="none" stroke="#ffb340" opacity="0"/>
      <g id="jy-sy-sig" opacity="0"><line x1="-220" y1="0" x2="0" y2="0" stroke="#7fe6ff" stroke-width="14" stroke-linecap="round" opacity=".5"/><circle r="70" fill="url(#jy-sy-glow)"/><circle r="12" fill="#e9fbff"/></g>
    </g>
    <circle id="jy-sy-halo" r="17" fill="none" stroke="#ffb340" stroke-width="3" opacity="0"/>
    <g class="jy-bb-labels">${["neuron", "enzymes", "vesicle", "cleft", "receptors", "next", "body", "axon", "precursor", "made"].map(lab).join("")}</g>
  </svg>`;
}

function jyFrameSynapse(q, v, own) {
  const C = JOURNEY.synapseChoreo, St = JOURNEY.stomachChoreo, S = JY_SY, { H, rm } = v, W = innerWidth, cx = W / 2, cy = H / 2;
  const span = ([a, b]) => jyClamp((q - a) / (b - a)), o = jySyO(C);
  const plan = JY.syPlan || (JY.syPlan = jySyPlan(C));
  const u = Math.min(W, H) / 820;
  document.getElementById("jy-synapse").setAttribute("viewBox", `0 0 ${W} ${H}`);
  // The camera follows our molecule, then hands over to the new signal in the next neuron.
  // Handover, in two steps so nothing ghosts: first (camera still) our molecule swaps from the actor to a
  // copy drawn in the scene at the same spot; then the camera glides to the signal waiting at the receptors.
  const [mx, my] = jyBbAt(plan.hero, q), [sx, sy] = jyBbAt(plan.sig, q);
  const swap = jySmooth(span([C.pass[0], C.pass[0] + o(0.008)])), sw = jySmooth(span([C.pass[0] + o(0.01), C.pass[1]]));
  // the launch: the camera stops and the signal accelerates off along the axon into the last caption
  const launch = span(C.launch), gx = sx + C.launchTo * launch * launch * launch, gy = sy;
  // as it launches, the camera eases down so the axon rises clear of the last caption and its buttons
  const hx = jyLerp(mx, sx, sw), hy = jyLerp(my, sy, sw) + C.endRise * jySmooth(launch);
  // Camera zoom per beat, eased between beats: [q, zoom] stops.
  const Z = C.zooms, zs = [[0, Z.enter], [C.assemble[0] + o(0.03), Z.assemble], [C.pack[0] + o(0.04), Z.pack], [C.spark[0] + o(0.03), Z.spark], [jyLerp(C.spark[0], C.spark[1], C.rimAxon), Z.spark], [C.spark[1], Z.converge], [C.release[0] + o(0.02), Z.release],
    [C.fire[0] - o(0.02), Z.cross], [C.fire[0] + o(0.04), Z.fire], [C.pass[1], Z.pass], [C.soma[0] + o(0.03), Z.soma], [C.axon[0] + o(0.03), Z.axon], [C.launch[1], Z.launch]];
  const k = rm ? 1.3 : Math.exp(jyBbAt(zs.map(([t, z]) => [t, Math.log(z), 0]), q)[0]);
  const sc = k * u;
  document.getElementById("jy-sy-world").setAttribute("transform", `translate(${cx} ${cy}) scale(${sc.toFixed(4)}) translate(${(-hx).toFixed(1)} ${(-hy).toFixed(1)})`);
  // Doors: the same rocking carriers as the barrier.
  const lobe = (id, s) => { const a = 14 * (1 - 2 * s), [l, r] = document.querySelectorAll(`#${id} rect`); l.setAttribute("transform", `rotate(${(-a).toFixed(2)} -9.5 0)`); r.setAttribute("transform", `rotate(${a.toFixed(2)} 9.5 0)`); };
  lobe("jy-sy-de", jyBbDoor(q, plan.doors.entry)); lobe("jy-sy-dv", jyBbDoor(q, plan.doors.ves)); lobe("jy-sy-du", jyBbDoor(q, plan.doors.uptake));
  // Enzymes: helpers dock as the hero arrives, the enzyme glows while it works.
  const a0 = C.assemble[0];
  [["jy-sy-e1", a0 + o(0.035), a0 + o(0.08)], ["jy-sy-e2", a0 + o(0.115), a0 + o(0.16)]].forEach(([id, t0, t1]) => {
    const g = document.getElementById(id), dock = jySmooth(span([t0 - o(0.03), t0]));
    g.querySelector(".jy-sy-chip").setAttribute("transform", `translate(0 ${jyLerp(-110, -62, dock).toFixed(1)})`);
    g.querySelector(".jy-sy-chip").setAttribute("opacity", (dock * (1 - 0.6 * jySmooth(span([t1 + o(0.02), t1 + o(0.06)])))).toFixed(3));
    g.querySelector(".jy-sy-eglow").setAttribute("opacity", (0.28 * Math.sin(Math.PI * span([t0, t1]))).toFixed(3));
  });
  // The hero's vesicle rides to the membrane, then fuses (its outline opens up and fades).
  const [vx, vy] = jyBbAt(plan.vesicle, q), fuse = jySmooth(span([C.release[0], C.release[0] + o(0.04)]));
  document.getElementById("jy-sy-hv").setAttribute("transform", `translate(${(vx - S.ves[0]).toFixed(1)} ${(vy - S.ves[1]).toFixed(1)})`);
  const hvc = document.getElementById("jy-sy-hvc");
  hvc.style.strokeDasharray = fuse > 0.001 ? `${(1 - fuse).toFixed(3)} ${fuse.toFixed(3)}` : "";
  hvc.setAttribute("opacity", (1 - fuse).toFixed(3));
  document.getElementById("jy-sy-dv").setAttribute("opacity", (1 - jySmooth(span([C.spark[0], C.spark[0] + o(0.03)]))).toFixed(3));
  // Other messengers; after the handover they let go and are cleared (they fade as they drift off).
  plan.mols.forEach((P, i) => {
    const [x, y] = jyBbAt(P, q), el = document.getElementById("jy-sy-m" + i);
    el.setAttribute("cx", x.toFixed(1)); el.setAttribute("cy", y.toFixed(1));
    el.setAttribute("opacity", (1 - jySmooth(span([C.pass[0] + o(0.05), C.soma[1]]))).toFixed(3));
  });
  // Our molecule, drawn in the scene once the camera leaves it (the actor fades): reuptake, back near a vesicle.
  const mol = document.getElementById("jy-sy-mol");
  mol.setAttribute("cx", mx.toFixed(1)); mol.setAttribute("cy", my.toFixed(1)); mol.setAttribute("opacity", swap.toFixed(3));
  const ring = document.getElementById("jy-sy-molring");
  ring.setAttribute("cx", mx.toFixed(1)); ring.setAttribute("cy", my.toFixed(1)); ring.setAttribute("r", (17 / sc).toFixed(1)); ring.setAttribute("stroke-width", (3 / sc).toFixed(2));
  ring.setAttribute("opacity", swap.toFixed(3));
  // First spark: runs down the axon and around the terminal's rim; the two fronts meet at the hero's vesicle.
  const g = span(C.spark), axFrac = C.rimAxon;
  const spark = document.getElementById("jy-sy-spark");
  spark.setAttribute("transform", `translate(${jyLerp(S.rimFrom, -714, jyClamp(g / axFrac)).toFixed(1)} 0)`);
  spark.setAttribute("opacity", (g > 0 ? 1 - jySmooth(jyClamp((g - axFrac + 0.05) / 0.1)) : 0).toFixed(3));
  const rim = (sel, p, fade) => document.querySelectorAll(sel + " path").forEach(el => {
    const head = el.classList.contains("jy-sy-rimh"), len = head ? Math.min(0.05, p) : p;
    el.style.strokeDasharray = `${len.toFixed(4)} 2`;
    el.style.strokeDashoffset = head ? (-(p - len)).toFixed(4) : "0";
    el.setAttribute("opacity", (p > 0 ? (head ? 1 - jySmooth(jyClamp((p - 0.97) / 0.03)) : fade) : 0).toFixed(3));
  });
  rim("#jy-sy-rim", g, 1 - jySmooth(span([C.release[0] + o(0.02), C.release[0] + o(0.06)])));
  document.getElementById("jy-sy-flash").setAttribute("opacity", Math.sin(Math.PI * span([C.spark[1] - o(0.015), C.release[0] + o(0.04)])).toFixed(3));
  // Receptors light up and the next neuron's cell body glows; they fade as the messengers are cleared.
  const lit = jySmooth(span([C.fire[0] - o(0.02), C.fire[0]])) * (1 - jySmooth(span([C.pass[1], C.soma[1]])));
  document.querySelectorAll(".jy-sy-rglow").forEach(r => r.setAttribute("opacity", (+r.dataset.i === 0 || +r.dataset.i === 6 ? 0 : lit * 0.85).toFixed(3)));
  document.getElementById("jy-sy-postglow").setAttribute("opacity", (0.45 * Math.sin(Math.PI * span([C.fire[0], C.soma[1]]))).toFixed(3));
  // The new signal: appears at the receptors as the camera hands over, then rides through the cell body
  // and down the axon (whose rim lights up as it passes) into the terminal, which flashes on arrival.
  const sig = document.getElementById("jy-sy-sig");
  sig.setAttribute("transform", `translate(${gx.toFixed(1)} ${gy.toFixed(1)})`);
  sig.setAttribute("opacity", (jySmooth(span([C.fire[0] + o(0.02), C.pass[0]])) * (1 - jySmooth(span([C.launch[1] - o(0.01), C.launch[1]])))).toFixed(3));
  const [tx, , trx] = S.term2, g2 = gx <= S.axon2[0] ? 0 : jyClamp((gx - S.axon2[0]) / (tx + trx - S.axon2[0]));
  rim("#jy-sy-rim2", g2, 1);
  // The amber halo and the tag belong to our molecule: they fade when the camera hands over.
  const halo = document.getElementById("jy-sy-halo"), made = jySmooth(span([a0 + o(0.13), a0 + o(0.16)]));
  halo.setAttribute("cx", cx); halo.setAttribute("cy", cy);
  halo.setAttribute("opacity", (made * (1 - swap)).toFixed(3));
  // Labels, each during its beat, centred on what it names.
  const during = ([a, b]) => jySmooth(jyClamp((q - a) / o(0.02))) * (1 - jySmooth(jyClamp((q - b) / o(0.02))));
  const lab = (key, x, y, on) => {
    const el = document.getElementById("jy-sy-t-" + key);
    el.setAttribute("x", (cx + (x - hx) * sc).toFixed(1)); el.setAttribute("y", (cy + (y - hy) * sc).toFixed(1));
    el.setAttribute("text-anchor", "middle"); el.setAttribute("opacity", on.toFixed(3));
  };
  lab("neuron", -560, -120, during([0, C.enter[1]]));
  lab("enzymes", (S.e1[0] + S.e2[0]) / 2, -250, during(C.assemble));
  lab("vesicle", S.ves[0], S.ves[1] - 48, during([C.pack[0], C.spark[0]]));
  lab("cleft", 155, -330, during([C.release[0], C.fire[0]]));
  lab("receptors", 300, -210, during([C.fire[0] - o(0.04), C.pass[0]]));
  lab("next", S.nucleus[0], S.nucleus[1] - S.nucleus[2] - 40, during([C.fire[0] + o(0.02), C.pass[1]]));
  lab("body", S.nucleus[0], S.nucleus[1] - S.nucleus[2] - 40, during([C.pass[1], C.soma[1]]));
  lab("axon", S.axon2[0] + C.axonRide / 2, -110, during([C.soma[1], C.launch[0]]));
  // The tag beside our molecule: "Precursor" until the second enzyme has worked on it, then "Neurotransmitter".
  [["precursor", 1 - made], ["made", made * (1 - swap)]].forEach(([key, on]) => {
    const el = document.getElementById("jy-sy-t-" + key);
    el.setAttribute("x", (cx - 24).toFixed(1)); el.setAttribute("y", (cy + 4).toFixed(1)); el.setAttribute("text-anchor", "end");   // to its left: it always enters things from the left
    el.setAttribute("opacity", on.toFixed(3));
  });
  if (!own) return;
  jyActor({ rot: St.floatTilt, zoom: (rm ? 1 : St.sinkZoom) * St.heroZoom, dissolve: 1, spill: St.spill, hero: 1, others: 0, melt: 1, mols: 0, fade: 1 - swap });
}

// During the spark the action is the axon on the left, so the caption moves right on wide screens.
const jySyCapRight = q => { const C = JOURNEY.synapseChoreo; return q >= C.spark[0] && q < C.release[0]; };
// The journey ends here: the calls to action show once the signal has reached the next terminal.
const jySyDone = q => q >= JOURNEY.synapseChoreo.cta;
jyChapter({ key: "synapse", layers: jySynapseSvg, frame: jyFrameSynapse, notToScale: true, capRight: jySyCapRight, done: jySyDone });
