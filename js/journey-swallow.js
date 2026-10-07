// ---------------------------------------------------------------------------
// JOURNEY chapter 1, Swallow: dive into the mouth, down the esophagus, to the top of the stomach.
// Core and chapter system: js/journey.js. Wording and knobs: JOURNEY.swallow / swallowChoreo.
// ---------------------------------------------------------------------------
const JY_SW = { walls: [] };

// The mouth, seen from above: a soft mound with a layered opening. The camera dives into the
// hole at (500, 600).
function jyMouthSvg() {
  return `<svg class="jy-layer" id="jy-mouth" width="1000" height="700" viewBox="0 0 1000 700">
    <defs>
      <linearGradient id="jy-mound" gradientUnits="userSpaceOnUse" x1="0" y1="470" x2="0" y2="1100"><stop offset="0" stop-color="#cf7b76"/><stop offset="1" stop-color="#8e434b"/></linearGradient>
    </defs>
    <path fill="url(#jy-mound)" d="M-1100 1500 L-1100 690 C-200 690 80 470 500 470 C920 470 1200 690 2100 690 L2100 1500 Z"/>
    <path fill="none" stroke="#f0b3a9" stroke-opacity=".35" stroke-width="3" d="M-400 640 C80 600 220 478 500 478 C780 478 920 600 1400 640"/>
    <ellipse cx="500" cy="562" rx="270" ry="122" fill="#e7a49b"/>
    <ellipse cx="500" cy="576" rx="232" ry="102" fill="#b25b5f"/>
    <ellipse cx="500" cy="590" rx="200" ry="82" fill="#7c3240"/>
    <ellipse cx="500" cy="600" rx="168" ry="64" fill="#4a1a27"/>
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
  // 1. Dive into the mouth: the hole starts below the pill and grows until it fills the screen.
  const a = jyClamp(q / C.diveEnd), ea = Math.pow(a, 1.6);
  const m = rm ? 1 : Math.pow(C.diveZoom, ea), off = 0.3 * H * (rm ? 1 : 1 - ea);
  mouth.style.transform = `translate(${cx}px, ${cy + off}px) scale(${s * m}) translate(-500px, -600px)`;
  mouth.style.opacity = rm ? 1 - a : a < 0.9 ? 1 : (1 - a) / 0.1;
  // 2. Down the esophagus: the walls close in, then the body slides up past the pill.
  const b = jyClamp((q - C.tubeStart) / (1 - C.tubeStart));
  const k = rm ? 1 : 1 + (C.tubeZoom - 1) * (1 - jySmooth(jyClamp(b / 0.18))) ** 2;
  const y = JY_TUBE.y0 + (JY_TUBE.y1 - JY_TUBE.y0) * b;
  tube.style.transform = `translate(${cx}px, ${cy}px) scale(${s * k}) translate(-500px, ${-y}px)`;
  tube.style.opacity = jyClamp((q - C.tubeStart) / 0.04);
  jyWalls(y);
  const call = document.getElementById("jy-call");
  call.classList.toggle("on", own && q > 0.2 && q < 0.8);
  if (!own) return;
  // The pill turns lengthwise as it enters the tube; the Esophagus label rides the right-hand wall.
  jyActor({ rot: C.hoverTilt + (C.tubeTilt - C.hoverTilt) * jySmooth(jyClamp(b / 0.3)) });
  const ly = -150;
  call.style.left = (cx + (jyHalf(y + ly, y) + 24) * s * k) + "px";
  call.style.top = (cy + ly * s * k) + "px";
}

jyChapter({
  key: "swallow",
  layers: () => `<div class="jy-rise">${jyMouthSvg()}</div>${jyTubeSvg()}`,
  init: root => { JY_SW.walls = [...root.querySelectorAll(".jy-wall")]; },
  frame: jyFrameSwallow,
});
