// Wording from content/*.js: escaped, with **bold** and [[glossary term]] tooltips.
const txt = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[\[(.+?)\]\]/g, (_, t) => gloss(t));

// ---------------------------------------------------------------------------
// VIEWS: EXPLORE
// ---------------------------------------------------------------------------
function heroArt() {
  const HUE = { dopamine: "#ffb340", norepinephrine: "#ff6961", serotonin: "#c77dff", gaba: "#40e0d0", glutamate: "#ff6b8b", acetylcholine: "#4da3ff" };
  const nodes = NTS.map((n, i) => {
    const a = (-90 + i * 60) * Math.PI / 180;
    const x = (200 + 140 * Math.cos(a)).toFixed(1), y = (200 + 140 * Math.sin(a)).toFixed(1);
    return `<a class="hn" href="#${n.id}" data-go="${n.id}" style="--i:${i}"><title>${esc(n.name)}</title>
      <circle class="hn-halo" cx="${x}" cy="${y}" r="25" fill="${HUE[n.id]}" opacity=".16"/>
      <circle cx="${x}" cy="${y}" r="17" fill="${HUE[n.id]}"/>
      <text x="${x}" y="${(+y + 3.6).toFixed(1)}" text-anchor="middle" font-size="${n.abbr.length > 3 ? 8.4 : 10}" font-weight="700" fill="#0a1226" font-family="'IBM Plex Mono', ui-monospace, monospace">${esc(n.abbr)}</text></a>`;
  }).join("");
  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="The six neurotransmitters arranged around a central eye">
    <defs>
      <radialGradient id="hg-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#4f7dff" stop-opacity=".5"/><stop offset="1" stop-color="#4f7dff" stop-opacity="0"/></radialGradient>
      <radialGradient id="hg-pupil" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#e3ecff"/><stop offset=".45" stop-color="#4f7dff"/><stop offset="1" stop-color="#1b38b8"/></radialGradient>
    </defs>
    <circle cx="200" cy="200" r="178" fill="url(#hg-glow)"/>
    <circle cx="200" cy="200" r="188" fill="none" stroke="#7fe6ff" stroke-opacity=".38" stroke-width="7" stroke-dasharray="1.2 14.7"/>
    <circle cx="200" cy="200" r="140" fill="none" stroke="#7fe6ff" stroke-opacity=".22" stroke-width="1" stroke-dasharray="2 6"/>
    <circle cx="200" cy="200" r="96" fill="none" stroke="#7fe6ff" stroke-opacity=".12"/>
    <circle cx="200" cy="200" r="56" fill="none" stroke="#7fe6ff" stroke-opacity=".16"/>
    <path d="M44 200 Q200 96 356 200 Q200 304 44 200 Z" fill="none" stroke="#7fe6ff" stroke-opacity=".5" stroke-width="1.2"/>
    <circle cx="200" cy="200" r="24" fill="url(#hg-pupil)"/>
    <circle cx="192" cy="192" r="6" fill="#fff" fill-opacity=".6"/>
    <g class="hs"><line x1="200" y1="200" x2="200" y2="14" stroke="#7fe6ff" stroke-width="1.4"/><circle cx="200" cy="14" r="3" fill="#7fe6ff"/></g>
    ${nodes}
  </svg>`;
}

const JR = { n: 0, timers: [], io: null, modName: "", modNote: "" };
const CYC_TEXT = LANDING.schedulePicker.schedules;   // schedule picker: not on the home page right now
const CYC = { "52": [i => i % 7 < 5, CYC_TEXT.fiveTwo.note], eod: [i => i % 2 === 0, CYC_TEXT.everyOther.note], daily: [() => true, CYC_TEXT.daily.note] };
function cycReadout(k) { const n = Array.from({ length: 14 }, (_, i) => CYC[k][0](i)).filter(Boolean).length; return `${n} dose days in 14, ${14 - n} rest days. ${CYC[k][1]}`; }
function cycDaysHtml(k) {
  const f = CYC[k][0];
  return ["M", "T", "W", "T", "F", "S", "S"].map(d => `<span class="cyc-dh" aria-hidden="true">${d}</span>`).join("") +
    Array.from({ length: 14 }, (_, i) => f(i)
      ? `<span class="cd on" role="img" aria-label="Day ${i + 1}, dose"></span>`
      : `<span class="cd off" role="img" aria-label="Day ${i + 1}, rest">off</span>`).join("");
}
function cycSet(k) {
  if (!CYC[k]) return;
  document.getElementById("cyc-days").innerHTML = cycDaysHtml(k);
  document.getElementById("cyc-read").textContent = cycReadout(k);
  document.querySelectorAll("[data-cyc]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cyc === k)));
}

function journeyHtml() {
  const path = ntById.dopamine.path.slice(2);
  const mod = MAP.find(r => r[1] === "dopamine" && r[2] === "modulator");
  JR.modName = byId[mod[0]].name.replace(/ \(.*\)$/, ""); JR.modNote = mod[4];
  const nodes = path.map((st, i) => st.m
    ? `<li class="jn jn-m${st.final ? " jn-final" : ""}"><span class="jn-tag">${i === 0 ? "Supplement" : st.final ? "Neurotransmitter" : "Intermediate"}</span><b>${esc(st.m)}</b>${st.final ? `<span class="jn-mod">+ ${esc(JR.modName)}</span>` : ""}</li>`
    : `<li class="jn jn-e"><span class="jn-tag">${st.rl ? "Slowest step" : "Enzyme"}</span><b>${esc(st.e)}</b><span class="jn-cof">${(st.co || []).map(c => `<i>+ ${esc(c[0])}</i>`).join("")}</span></li>`).join("");
  const dots = [[60, -6], [78, -3], [98, 0], [112, 3], [126, 6], [142, 9]].map(([y, dy], k) => `<circle class="vd" cx="176" cy="${y}" r="4.5" style="--k:${k};--dy:${dy}px"/>`).join("");
  return `
  <section class="jr" id="how" aria-labelledby="jr-h">
    <h2 class="sec" id="jr-h">How a supplement reaches a neurotransmitter</h2>
    <p class="sec-intro">Follow one example: tyrosine becoming dopamine. It plays once as you scroll here. Choose a step to look closer.</p>
    <div class="jr-steps">
      <button class="jr-step" data-jr="1" aria-pressed="false"><b>Precursors</b><p>The raw materials. Your body converts them, step by step, into the neurotransmitter.</p></button>
      <button class="jr-step" data-jr="2" aria-pressed="false"><b>Cofactors</b><p>Vitamins and minerals each conversion step needs. Without them, extra raw material doesn't go anywhere.</p></button>
      <button class="jr-step" data-jr="3" aria-pressed="false"><b>Modulators</b><p>Supplements that change how a neurotransmitter is made, used, or broken down without being a building block.</p></button>
    </div>
    <div class="jr-stage" id="jr-stage">
      <ol class="jr-chain">${nodes}</ol>
      <div class="jr-syn">
        <svg viewBox="0 0 460 206" role="img" aria-label="A sending cell releasing dopamine across a gap onto receptors on a receiving cell">
          <rect class="cell" x="20" y="26" width="156" height="148" rx="44"/>
          <rect class="cell cell-post" x="284" y="26" width="156" height="148" rx="44"/>
          <g class="ves"><circle class="vo" cx="62" cy="70" r="15"/><circle class="vo" cx="112" cy="104" r="15"/><circle class="vo" cx="66" cy="136" r="15"/>
            <circle class="vi" cx="62" cy="70" r="4"/><circle class="vi" cx="112" cy="104" r="4"/><circle class="vi" cx="66" cy="136" r="4"/></g>
          ${dots}
          <rect class="rc" x="274" y="62" width="10" height="24" rx="4"/><rect class="rc" x="274" y="92" width="10" height="24" rx="4"/><rect class="rc" x="274" y="122" width="10" height="24" rx="4"/>
          <path class="wave" pathLength="1" d="M310 112 H338 L350 70 L364 152 L376 96 L386 112 H420"/>
          <text class="lbl" x="98" y="196" text-anchor="middle">Sending cell</text>
          <text class="lbl" x="230" y="196" text-anchor="middle">Synapse</text>
          <text class="lbl" x="362" y="196" text-anchor="middle">Receiving cell</text>
        </svg>
      </div>
    </div>
    <div class="jr-bar">
      <button class="btn" id="jr-play" type="button">Play the journey</button>
      <button class="btn ghost" data-jr="4" aria-pressed="false" type="button">See it fire</button>
      <label class="jr-sw"><input type="checkbox" id="jr-nocof"> Leave out the cofactors</label>
      <p class="jr-cap" id="jr-cap" role="status"></p>
    </div>
  </section>`;
}

function jrCaption(n, miss) {
  if (n === 0) return "Press play, or choose a step.";
  if (n === 1) return "A supplement like L-Tyrosine supplies the raw material. What happens next is up to your body.";
  if (n === 2) return miss ? "Without iron and BH4, the first enzyme can't run. The extra tyrosine goes nowhere." : "Each step needs an enzyme, and each enzyme needs its vitamins and minerals. With them, the chain completes.";
  if (n === 3) return `Modulators don't add raw material. Example: ${JR.modName}. ${JR.modNote}`;
  return miss ? "Nothing reaches the synapse, because the chain stalled earlier." : "Dopamine is released and meets receptors on the next cell. This is a simplified picture: more raw material doesn't always mean more dopamine, and more isn't always better.";
}
function jrSet(n) {
  const st = document.getElementById("jr-stage"); if (!st) return;
  const miss = n >= 2 && document.getElementById("jr-nocof").checked;
  JR.n = n;
  const nodes = [...st.querySelectorAll(".jn")];
  const lit = n === 0 ? 0 : n === 1 ? 1 : (miss ? 2 : nodes.length);
  nodes.forEach((el, i) => {
    el.classList.toggle("on", i < lit);
    el.classList.toggle("stall", miss && i === 1);
    el.style.transitionDelay = n >= 2 && !miss ? (i * 0.3) + "s" : "0s";
  });
  st.classList.toggle("f-cof", n >= 2 && !miss);
  st.classList.toggle("f-miss", miss);
  st.classList.toggle("f-mod", n >= 3);
  st.classList.toggle("f-fire", n >= 4 && !miss);
  document.querySelectorAll("[data-jr]").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.jr === n)));
  document.getElementById("jr-cap").textContent = jrCaption(n, miss);
}
function jrClear() { JR.timers.forEach(clearTimeout); JR.timers = []; }
function jrPlay() {
  jrClear(); jrSet(0);
  [[1, 350], [2, 2300], [3, 5000], [4, 7000]].forEach(([n, t]) => JR.timers.push(setTimeout(() => jrSet(n), t)));
}
function jrInit() {
  jrClear(); if (JR.io) { JR.io.disconnect(); JR.io = null; }
  if (!document.getElementById("jr-stage")) return;
  jrSet(0);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  JR.io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { JR.io.disconnect(); jrPlay(); } }, { threshold: 0.55 });
  JR.io.observe(document.getElementById("jr-stage"));
}

function viewHome() {
  const H = LANDING.hero, N = LANDING.notice, G = LANDING.getStarted;
  return `
  <section class="tc" aria-labelledby="tc-h">
    <div class="tc-copy">
      <h1 id="tc-h">${txt(H.title)}</h1>
      <p class="tc-tag">${txt(H.tagline)}</p>
      <p class="tc-note">${txt(H.note)} <button class="tc-link" data-scroll="notice">${txt(H.noteLink)}</button></p>
      <div class="tc-search" id="hsearch" role="search">
        <label for="hq" class="sr">${txt(H.searchLabel)}</label>
        <input id="hq" type="search" placeholder="${esc(H.searchPlaceholder)}" autocomplete="off">
        <div class="tc-res" id="hq-results" hidden></div>
      </div>
    </div>
    <div class="tc-six" id="six">
      <span class="tc-six-label">${txt(H.gridLabel)}</span>
      <div class="tc-six-grid">
        ${NTS.map((n, i) => `
        <button class="tc-nt" style="--hue:${PS_HUE[n.id]};--i:${i}" data-go="${n.id}">
          <span class="tc-nt-word">${esc(n.word)}</span>
          <span class="tc-nt-name">${esc(n.name)}${n.abbr !== n.name ? ` · ${esc(n.abbr)}` : ""}</span>
          <span class="tc-nt-job">${esc(n.fn.split(". ")[0])}.</span>
        </button>`).join("")}
      </div>
      <!-- Reserved: a row of links to the Stack builder, Tracker and games can go here later. -->
    </div>
    <button class="tc-scroll" data-scroll="ns" type="button">${txt(H.scrollCue)}<span aria-hidden="true">&#8595;</span></button>
  </section>

  <section class="notice" id="notice">
    <h2 class="sec">${txt(N.heading)}</h2>
    <p class="notice-intro">${txt(N.intro)}</p>
    <div class="notice-grid">
      ${N.items.map(([title, body]) => `<div><b>${txt(title)}</b><p>${txt(body)}</p></div>`).join("\n      ")}
    </div>
  </section>

  ${nstoryHtml()}

  ${protocolHtml()}

  <section class="go" id="get-started" aria-labelledby="go-h">
    <div class="go-copy">
      <h2 id="go-h">${txt(G.heading)}</h2>
      <p>${txt(G.intro)}</p>
    </div>
    <div class="go-cta">
      <button class="tc-btn" data-go="stack" type="button">${txt(G.builderButton)}</button>
      <button class="tc-ghost" data-go="track" type="button">${txt(G.trackerButton)}</button>
    </div>
  </section>`;
}
