// ---------------------------------------------------------------------------
// ROUTING
// ---------------------------------------------------------------------------
let current = null;
const NAVST = { trail: [], mem: {}, back: false };
function render(token, force) {
  if (token === current && !force) return;
  const sameView = token === current;
  if (!sameView && current !== null) {
    NAVST.mem[current] = window.scrollY;
    if (!NAVST.back) { NAVST.trail.push(current); if (NAVST.trail.length > 50) NAVST.trail.shift(); }
  }
  current = token;
  const view = document.getElementById("view");
  const crumbs = document.getElementById("crumbs");
  const [a, b] = token.split(".");
  const home = `<a href="#" data-go="">All neurotransmitters</a>`;
  const sep = `<span class="sep">/</span>`;
  const nt = ntById[a];
  const s = nt ? (b ? byId[b] : null) : byId[a];
  const ez = token.startsWith("enzyme:") ? enzymeById[token.slice(7)] : null;
  const tab = ["stack", "track", "scan", "sim"].includes(token) ? token : "explore";
  document.body.classList.toggle("is-home", !(["stack", "track", "scan", "sim"].includes(token) || s || nt || ez));
  document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-current", t.dataset.tab === tab ? "page" : "false"));
  document.documentElement.style.setProperty("--nt", nt ? ntColor(nt.id) : "var(--accent)");
  App.confirmDelete = false;

  if (token === "stack") {
    view.innerHTML = viewBuilder(); crumbs.innerHTML = ""; refreshBuilder();
    document.title = "Stack Builder · Neuro Stack Atlas";
  } else if (token === "track") {
    view.innerHTML = viewTracker(); crumbs.innerHTML = ""; renderTrackDay(); renderHistory();
    document.title = "Tracker · Neuro Stack Atlas";
  } else if (token === "sim") {
    view.innerHTML = viewSim(); crumbs.innerHTML = ""; renderSim();
    document.title = "Simulator · Neuro Stack Atlas";
  } else if (token === "scan") {
    view.innerHTML = viewScanner(); crumbs.innerHTML = ""; renderScanInput(); renderScanResult();
    document.title = "Scanner · Neuro Stack Atlas";
  } else if (ez) {
    view.innerHTML = viewEnzyme(ez);
    crumbs.innerHTML = home + sep + `<span>${esc(ez.name)}</span>`;
    document.title = `${ez.name} · Neuro Stack Atlas`;
  } else if (s) {
    view.innerHTML = viewSupp(s, nt ? nt.id : "");
    crumbs.innerHTML = home + (nt ? sep + `<a href="#${nt.id}" data-go="${nt.id}">${esc(nt.name)}</a>` : "") + sep + `<span>${esc(s.name)}</span>`;
    document.title = `${s.name} · Neuro Stack Atlas`;
  } else if (nt) {
    view.innerHTML = viewNT(nt);
    crumbs.innerHTML = home + sep + `<span>${esc(nt.name)}</span>`;
    document.title = `${nt.name} · Neuro Stack Atlas`;
  } else {
    view.innerHTML = viewHome();
    jrInit();
    crumbs.innerHTML = "";
    document.title = "Neuro Stack Atlas";
  }
  document.getElementById("status-wrap").hidden = tab === "explore" || tab === "scan";
  document.getElementById("search-wrap").hidden = tab !== "explore";
  const q = document.getElementById("q"); if (q && document.activeElement !== q) q.value = "";
  hideSearch();
  setStatus();
  hideTip();
  const bk = document.getElementById("back");
  if (bk) bk.hidden = !(NAVST.trail.length && token !== "");
  const sb = document.querySelector(".subbar"); if (sb) sb.hidden = token === "";
  if (!sameView) window.scrollTo(0, NAVST.back ? (NAVST.mem[token] || 0) : 0);
  // Scroll scenes measure the top bar, so start them only after it has its final size for this page.
  if (token === "") { nsInit(); pcInit(); }
  else if (nt && !s) psInit();
}

function go(token) {
  try { if (location.hash.slice(1) !== token) location.hash = token; } catch (e) {}
  render(token);
}

// ---------------------------------------------------------------------------
// EXPLORE SEARCH: supplements by name or nickname, neurotransmitters by name or job
// ---------------------------------------------------------------------------
function searchAll(q) {
  q = q.trim().toLowerCase();
  if (!q) return [];
  const score = (name, akas) => {
    const n = name.toLowerCase(), a = akas.map(x => x.toLowerCase());
    return n.startsWith(q) ? 0 : n.includes(q) ? 1 : a.some(x => x.startsWith(q)) ? 2 : a.some(x => x.includes(q)) ? 3 : 9;
  };
  return [
    ...NTS.map(n => ({ kind: "nt", id: n.id, sc: score(n.name, [n.abbr, n.word]) })),
    ...S.map(s => ({ kind: "s", id: s.id, sc: score(s.name, [...s.aka, s.id]) }))
  ].filter(x => x.sc < 9).sort((a, b) => a.sc - b.sc || (a.kind === "nt" ? -1 : 1)).slice(0, 8);
}
function renderSearch(q) {
  const box = document.getElementById("q-results");
  if (!q.trim()) { box.hidden = true; box.innerHTML = ""; return; }
  const hits = searchAll(q);
  box.innerHTML = hits.length ? hits.map(h => {
    if (h.kind === "nt") {
      const n = ntById[h.id];
      return `<button class="result" data-go="${n.id}" style="--nt:${ntColor(n.id)}"><span class="item-name nt-hit">${esc(n.name)}</span><span class="item-meta">Neurotransmitter · ${esc(n.word)}</span></button>`;
    }
    const s = byId[h.id], nt = primaryNT(s.id);
    return `<button class="result" data-go="${s.id}"><span class="item-name">${esc(s.name)}</span>${tierBadge(s)}
      <span class="item-meta">${nt ? esc(ntById[nt].name) + " · " : ""}${CAT[s.cat]}</span><span class="result-sum">${esc(s.sum)}</span></button>`;
  }).join("") : `<div class="empty small">No match for “${esc(q.trim())}”. Try another name or a nickname like “fish oil”.</div>`;
  box.hidden = false;
}
function hideSearch() { const b = document.getElementById("q-results"); if (b) b.hidden = true; }

let toastTimer;
function toast(html) {
  const t = document.getElementById("toast");
  t.innerHTML = html; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
}

