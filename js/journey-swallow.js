// ---------------------------------------------------------------------------
// JOURNEY chapter 1, Swallow: a head tilted back, mouth open; the pill drops in, down the throat, and the
// camera zooms until the throat becomes the esophagus, then down it to the top of the stomach.
// Core and chapter system: js/journey.js. Wording and knobs: JOURNEY.swallow / swallowChoreo.
// ---------------------------------------------------------------------------
const JY_SW = { walls: [] };

// The head: a profile tilted back, mouth open toward the upper right (silhouette from Eric / ChatGPT,
// source in docs/journey/head-mouth-open.svg, 640 x 800 units), restyled in the scene's skin tones. Added on
// top: the inside of the open mouth, a cutaway channel down the throat into the neck, a closed eye and an ear.
const JY_HEAD = {
  skin: "M 286.70,541.48 C 247.65,541.35 209.37,541.86 178.06,524.73 C 147.76,511.05 122.85,494.07 96.06,463.76 C 69.47,451.89 52.15,424.30 50.45,396.77 C 21.19,378.74 25.03,341.50 43.43,316.46 C 38.54,284.95 61.80,258.78 85.93,242.47 C 104.47,211.04 141.03,190.81 174.97,189.26 C 196.74,186.64 219.88,199.52 234.80,215.96 C 250.24,230.23 265.96,239.50 284.65,242.12 C 305.14,241.04 324.98,240.73 342.65,239.89 C 353.28,239.67 355.95,245.82 352.59,256.06 L 347.42,269.99 C 353.79,277.95 360.07,276.69 368.28,273.14 C 373.79,271.24 376.33,275.98 374.78,282.51 C 369.21,300.03 357.00,314.58 352.84,331.98 C 351.41,339.92 356.89,345.82 366.75,344.96 C 380.08,343.09 392.78,334.17 403.83,322.55 C 409.74,317.07 416.26,318.63 418.41,326.96 C 419.80,334.64 416.83,341.29 424.61,349.13 C 438.40,360.70 442.42,382.35 434.29,402.94 C 424.47,428.64 411.34,448.95 417.66,472.53 C 438,535 455,589 474,634 C 491,676 545,707 566,780 L 162,780 C 182,715 244,677 270,621 C 285,590 293,562 286.70,541.48 Z",
  mouth: "M374 282 C366 298 357 314 352 332 C351 340 356 345 366 345 C380 343 392 334 403 322 C392 306 382 294 374 282 Z",
};
// The throat channel: centre line [x, y] and half-width. It starts inside the open mouth (its top end is
// hidden in the mouth's dark gap) and curves down the back of the throat into the neck.
const JY_THROAT = [[384, 296, 20], [366, 328, 21], [353, 368, 21], [349, 420, 20], [353, 500, 19], [361, 600, 19], [369, 700, 19], [374, 800, 19]];
// The pill's path through the head, keyframes [q, x, y, camera px per drawing unit, pill angle]: out along
// the mouth's axis, at the lips, in the throat, down the neck. The pill keeps its size; the camera scale is
// chosen so the mouth and throat are always wider than the pill (headScale in content/journey.js).
const JY_HEAD_PATH = C => [[0, 432, 236, C.headScale[0], C.hoverTilt], [C.headEnd * 0.42, 372, 318, C.headScale[1], C.hoverTilt],
  [C.headEnd * 0.62, 351, 405, C.headScale[2], C.throatTilt], [C.headEnd * 0.84, 357, 540, C.headScale[3], C.throatTilt], [C.headEnd, 367, 690, C.headScale[3], C.throatTilt]];

function jyThroatPath() {
  const side = k => JY_THROAT.map(([x, y, w]) => `${(x + k * w).toFixed(1)} ${y}`);
  return `M${side(-1).join(" L")} L${side(1).reverse().join(" L")} Z`;
}
// Back layer (behind the pill): only what shows through the openings, the dark inside of the mouth and
// the throat channel. The face itself is drawn in front of the pill (jyMouthFrontSvg).
function jyMouthSvg() {
  const H = JY_HEAD, throat = jyThroatPath();
  return `<svg class="jy-layer" id="jy-mouth" width="640" height="800" viewBox="0 0 640 800">
    <defs>
      <linearGradient id="jy-skin" gradientUnits="userSpaceOnUse" x1="0" y1="190" x2="0" y2="800"><stop offset="0" stop-color="#d4847d"/><stop offset=".55" stop-color="#b0605f"/><stop offset=".74" stop-color="#94505a"/><stop offset="1" stop-color="#7e3843" stop-opacity="0"/></linearGradient>
      <linearGradient id="jy-gullet" gradientUnits="userSpaceOnUse" x1="0" y1="640" x2="0" y2="800"><stop offset="0" stop-color="#4a1a27"/><stop offset="1" stop-color="#4a1a27" stop-opacity="0"/></linearGradient>
      <linearGradient id="jy-rim" gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="790"><stop offset="0" stop-color="#f0b3a9" stop-opacity=".5"/><stop offset="1" stop-color="#f0b3a9" stop-opacity="0"/></linearGradient>
      <clipPath id="jy-skin-clip"><path d="${H.skin}"/></clipPath>
    </defs>
    <path d="${H.mouth}" fill="#4a1a27"/>
    <path d="${throat}" fill="url(#jy-gullet)" clip-path="url(#jy-skin-clip)"/>
  </svg>`;
}

// Front layer (in front of the pill): the face, with the mouth gap and the throat channel left open, so the
// pill slips in behind the lips and is seen inside the cut-away throat. The holes are cut with a clip and
// an even-odd fill rather than masks (much cheaper to draw while scrolling). The skin colour fades out at
// the shoulders. Reuses the defs from jyMouthSvg.
function jyMouthFrontSvg() {
  const H = JY_HEAD, throat = jyThroatPath();
  return `<svg class="jy-layer" id="jy-mouth-front" width="640" height="800" viewBox="0 0 640 800">
    <g clip-path="url(#jy-skin-clip)">
      <path d="M-100 -100 H740 V900 H-100 Z ${throat}" fill-rule="evenodd" fill="url(#jy-skin)"/>
      <g fill="none" stroke-linejoin="round" opacity=".9">
        <path d="${throat}" stroke="#e7a59c" stroke-width="10"/><path d="${throat}" stroke="#c97c79" stroke-width="4"/>
      </g>
    </g>
    <path d="${H.skin}" fill="none" stroke="url(#jy-rim)" stroke-width="1.6"/>
    <g fill="none" stroke="#5e2632" stroke-opacity=".5" stroke-linecap="round" stroke-width="2.4">
      <path d="M268 256 C276 264 288 266 298 260"/>
      <path d="M150 352 C164 344 178 356 174 372 C171 384 160 388 152 382"/>
    </g>
  </svg>`;
}

// The esophagus, cut open lengthwise: layered walls around a dark channel that opens into the
// stomach's warm glow at the bottom. The wall paths are redrawn as you scroll (jyWalls) so a muscle
// squeeze can follow the pill.
const JY_TUBE = { y0: 220, y1: 2620, top: -1100, bottom: 3700, layers: [[104, "#b4636a"], [44, "#c97c79"], [20, "#e7a59c"], [0, "url(#jy-lumen)"]] };
function jyTubeSvg() {
  return `<svg class="jy-layer" id="jy-tube" width="1000" height="2900" viewBox="0 0 1000 2900">
    <defs>
      <linearGradient id="jy-lumen" gradientUnits="userSpaceOnUse" x1="0" y1="2380" x2="0" y2="3000">
        <stop offset="0" stop-color="#4a1a27"/><stop offset=".35" stop-color="#7a3030"/><stop offset=".75" stop-color="#c9733c"/><stop offset="1" stop-color="#e39d4a"/></linearGradient>
    </defs>
    <rect x="-1000" y="-1200" width="3000" height="5000" fill="#9a4f56"/>
    ${JY_TUBE.layers.map((l, i) => `<path class="jy-wall" data-l="${i}" fill="${l[1]}"/>`).join("")}
  </svg>`;
}

// Half-width of the channel at depth y, with the pill at depth py: gently uneven, narrow at the two
// sphincters, opening wide into the stomach, stretched around the pill and squeezed just above it.
function jyHalf(y, py) {
  let w = 92 + 9 * Math.sin(y / 131) + 5 * Math.sin(y / 47 + 2);
  w -= 26 * Math.exp(-(((y - 380) / 60) ** 2));
  w -= 24 * Math.exp(-(((y - 2470) / 60) ** 2));
  if (y < 150) w += (150 - y) * 0.9;
  if (y > 2500) w += ((y - 2500) / 300) ** 2 * 600;
  w += 42 * Math.exp(-(((y - py) / 120) ** 2));
  w -= 36 * Math.exp(-(((y - py + 270) / 70) ** 2));
  return Math.max(18, w);
}
function jyWalls(py) {
  JY_SW.walls.forEach((el, i) => {
    const off = JY_TUBE.layers[i][0], L = [], R = [];
    for (let y = JY_TUBE.top; y <= JY_TUBE.bottom; y += 16) {
      const w = jyHalf(y, py) + (off ? off + 7 * Math.sin(y / (83 + i * 29) + i * 1.3) : 0);
      L.push(`${(500 - w).toFixed(1)} ${y}`); R.unshift(`${(500 + w).toFixed(1)} ${y}`);
    }
    el.setAttribute("d", `M${L.join("L")}L${R.join("L")}Z`);
  });
}

function jyFrameSwallow(q, v, own) {
  const C = JOURNEY.swallowChoreo, { cx, cy, H, s, rm } = v;
  const mouth = document.getElementById("jy-mouth"), tube = document.getElementById("jy-tube");
  // 1. The head: the pill drops into the mouth and down the throat; the camera follows and zooms in until
  // the throat fills the screen, then the head fades into the esophagus tube.
  const P = JY_HEAD_PATH(C);
  let j = 0; while (j < P.length - 2 && q > P[j + 1][0]) j++;
  const t = jySmooth(jyClamp((q - P[j][0]) / (P[j + 1][0] - P[j][0])));
  const px = jyLerp(P[j][1], P[j + 1][1], t), py = jyLerp(P[j][2], P[j + 1][2], t);
  const unit = rm ? C.headScale[0] : P[j][3] * Math.pow(P[j + 1][3] / P[j][3], t);   // zoom eases evenly (log scale)
  const headRot = jyLerp(P[j][4], P[j + 1][4], t);
  mouth.style.transform = `translate(${cx}px, ${cy}px) scale(${unit}) translate(${-px}px, ${-py}px)`;
  mouth.style.opacity = 1 - jySmooth(jyClamp((q - C.tubeStart) / (C.headEnd - C.tubeStart)));
  const front = document.getElementById("jy-mouth-front");
  front.style.transform = mouth.style.transform;
  if (own) document.getElementById("jy-front-swallow").style.opacity = mouth.style.opacity;
  // 2. Down the esophagus: the walls close in, then the body slides up past the pill.
  const b = jyClamp((q - C.tubeStart) / (1 - C.tubeStart));
  const k = rm ? 1 : 1 + (C.tubeZoom - 1) * (1 - jySmooth(jyClamp(b / 0.18))) ** 2;
  const y = JY_TUBE.y0 + (JY_TUBE.y1 - JY_TUBE.y0) * b;
  tube.style.transform = `translate(${cx}px, ${cy}px) scale(${s * k}) translate(-500px, ${-y}px)`;
  tube.style.opacity = jyClamp((q - C.tubeStart) / 0.04);
  if (q > C.tubeStart - 0.01) jyWalls(y);   // the walls are hidden before this; don't rebuild them
  const call = document.getElementById("jy-call");
  call.classList.toggle("on", own && q > JOURNEY.swallow[1].at && q < 0.8);   // after the caption leaves the right side
  if (!own) return;
  // The pill turns lengthwise as it enters the tube; the Esophagus label rides the right-hand wall.
  jyActor({ rot: q < C.tubeStart ? headRot : C.throatTilt + (C.tubeTilt - C.throatTilt) * jySmooth(jyClamp(b / 0.3)) });
  const ly = -150;
  call.style.left = (cx + (jyHalf(y + ly, y) + 24) * s * k) + "px";
  call.style.top = (cy + ly * s * k) + "px";
}

jyChapter({
  key: "swallow",
  layers: () => `<div class="jy-rise">${jyMouthSvg()}</div>${jyTubeSvg()}`,
  front: () => `<div class="jy-rise">${jyMouthFrontSvg()}</div>`,
  capRight: q => q < JOURNEY.swallow[1].at,   // the head fills the left; caption goes right until the esophagus
  init: root => { JY_SW.walls = [...root.querySelectorAll(".jy-wall")]; },
  frame: jyFrameSwallow,
});
