// ---------------------------------------------------------------------------
// JOURNEY chapter 2, Stomach: drop onto the gastric fluid, sink, the shell dissolves, and the hero
// granule takes over from the capsule.
// Core and chapter system: js/journey.js. Wording, sources and knobs: JOURNEY.stomach / stomachChoreo.
// ---------------------------------------------------------------------------
// The stomach: the esophagus enters at the top, the chamber widens (pink wall bands), and a
// pool of warm gastric fluid fills the bottom. The fluid surface sits at y = 900.
const JY_CAVITY = "M405 -700 L405 40 C398 230 140 330 -60 560 L-60 2500 L1110 2500 C1160 1700 1320 900 1220 600 C1120 300 820 130 595 60 L595 -700 Z";
const JY_SURFACE = "M-1000 900 Q-875 882 -750 900 T-500 900 T-250 900 T0 900 T250 900 T500 900 T750 900 T1000 900 T1250 900 T1500 900 T1750 900 T2000 900";
const JY_FLUID = JY_SURFACE + " L2000 2500 L-1000 2500 Z";
function jyFluidGrad(id) {
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="880" x2="0" y2="2200">
    <stop offset="0" stop-color="#f2b24e"/><stop offset=".28" stop-color="#dc8c36"/><stop offset=".65" stop-color="#b8612a"/><stop offset="1" stop-color="#8a3d22"/></linearGradient>`;
}
function jyStomachSvg() {
  const streak = (y, w, col, o, ph) => `<path d="M-900 ${y} ${Array.from({ length: 7 }, (_, i) => `C${-900 + i * 500 + 160} ${y - 46 * Math.sin(i + ph)} ${-900 + i * 500 + 340} ${y + 46 * Math.sin(i + ph + 1)} ${-400 + i * 500} ${y}`).join(" ")}" fill="none" stroke="${col}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"/>`;
  return `<svg class="jy-layer" id="jy-stomach" width="1000" height="2400" viewBox="0 0 1000 2400">
    <defs>
      <clipPath id="jy-cav-clip"><path d="${JY_CAVITY}"/></clipPath>
      <radialGradient id="jy-cav" gradientUnits="userSpaceOnUse" cx="560" cy="560" r="900"><stop offset="0" stop-color="#7a2840"/><stop offset="1" stop-color="#3a0f1f"/></radialGradient>
      ${jyFluidGrad("jy-fluid")}
    </defs>
        <g fill="none">
      <path d="${JY_CAVITY}" stroke="#9c3550" stroke-width="150"/>
      <path d="${JY_CAVITY}" stroke="#d76d7e" stroke-width="80"/>
      <path d="${JY_CAVITY}" stroke="#f4a3a3" stroke-width="22"/>
    </g>
    <path d="${JY_CAVITY}" fill="url(#jy-cav)"/>
    <g clip-path="url(#jy-cav-clip)">
      <path d="${JY_FLUID}" fill="url(#jy-fluid)"/>
      <g id="jy-streaks">
        ${streak(1060, 70, "#ffd27a", .2, 0)}${streak(1210, 110, "#8f3a1d", .22, 2)}${streak(1360, 60, "#ffcf70", .18, 4)}
        ${streak(1520, 130, "#7c2f18", .22, 1)}${streak(1700, 80, "#f7b95a", .16, 3)}${streak(1880, 120, "#6d2716", .24, 5)}
      </g>
      <path d="${JY_SURFACE}" fill="none" stroke="#ffd98c" stroke-width="5" stroke-opacity=".85"/>
      <path d="${JY_SURFACE}" fill="none" stroke="#fff1c8" stroke-width="2" stroke-opacity=".35" transform="translate(0 16)"/>
      <g id="jy-ripples" fill="none" stroke="#ffe7b0" stroke-width="3">
        <ellipse cx="500" cy="902" rx="30" ry="7"/><ellipse cx="500" cy="902" rx="30" ry="7"/><ellipse cx="500" cy="902" rx="30" ry="7"/>
      </g>
    </g>
  </svg>`;
}
// The fluid again, drawn see-through in front of the pill, so it looks half-submerged at the surface
// and tinted once it sinks.
function jyStomachFrontSvg() {
  return `<svg class="jy-layer" id="jy-stomach-front" width="1000" height="2400" viewBox="0 0 1000 2400">
    <defs><clipPath id="jy-cav-clip2"><path d="${JY_CAVITY}"/></clipPath>${jyFluidGrad("jy-fluid2")}</defs>
    <g clip-path="url(#jy-cav-clip2)"><path d="${JY_FLUID}" fill="url(#jy-fluid2)"/>
      <path d="${JY_SURFACE}" fill="none" stroke="#ffd98c" stroke-width="5"/></g>
  </svg>`;
}

function jyFrameStomach(q, v, own) {
  const C = JOURNEY.stomachChoreo, S1 = JOURNEY.swallowChoreo, { cx, cy, s, rm } = v;
  const span = (from, to) => jyClamp((q - from) / (to - from));
  const a = span(0, C.contact), c = span(C.contact, C.under), u = span(C.under, C.dissolve), d = span(C.dissolve, C.release), h = span(C.release, C.end);
  // Drop to the surface (y = 900), bob into it, sink, then drift slowly while the shell dissolves.
  const y = jyLerp(420, 872, jySmooth(a)) + 40 * jySmooth(c) + 330 * jySmooth(u) + 110 * d + 60 * h;
  const sink = 1 + (C.sinkZoom - 1) * jySmooth(u), focus = 1 + (C.heroZoom - 1) * jySmooth(h);
  const k = rm ? 1 : (0.75 + 0.25 * jySmooth(a)) * sink * (1 + 0.3 * jySmooth(h));
  const T = `translate(${cx}px, ${cy}px) scale(${s * k}) translate(-500px, ${-y}px)`;
  document.getElementById("jy-stomach").style.transform = T;
  document.getElementById("jy-stomach-front").style.transform = T;
  document.getElementById("jy-streaks").setAttribute("transform", `translate(${(-q * 320).toFixed(1)} 0)`);
  // Ripples spread from where the pill touches the surface, then fade as it sinks.
  [...document.querySelectorAll("#jy-ripples ellipse")].forEach((e, i) => {
    const t = jyClamp(c * 1.5 - i * 0.22);
    e.setAttribute("rx", (30 + 280 * t).toFixed(1)); e.setAttribute("ry", (7 + 50 * t).toFixed(1));
    e.style.opacity = (c > 0 ? (1 - t) * 0.8 * (1 - u) : 0).toFixed(3);
  });
  if (!own) return;
  // The fluid in front of the pill: see-through at the surface, fading as the granules come out.
  document.getElementById("jy-front-stomach").style.opacity = (0.5 * (1 - 0.75 * jySmooth(jyClamp(u * 2))) * (1 - jySmooth(d))).toFixed(3);
  jyActor({
    rot: S1.tubeTilt + (C.floatTilt - S1.tubeTilt) * jySmooth(c),
    zoom: (rm ? 1 : sink) * focus,
    dissolve: jySmooth(d),
    spill: C.spill * (0.75 * jySmooth(jyClamp((d - 0.2) / 0.8)) + 0.25 * jySmooth(h)),
    hero: jySmooth(h),
  });
}

jyChapter({ key: "stomach", layers: jyStomachSvg, front: jyStomachFrontSvg, frame: jyFrameStomach });
