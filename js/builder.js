// ---------------------------------------------------------------------------
// VIEWS: STACK BUILDER
// ---------------------------------------------------------------------------
// Six numbered steps: name, day, add, check, timeline, save. The check comes before the timeline
// so nobody reaches the schedule without seeing the warnings first. Wording in content/stack-builder.js.
// Steps open one at a time ("Next" at the end of each); "Skip the tour" opens them all.
// How far this browser has got is kept in localStorage (nsa-builderOpen, 1–6).
// Open steps can also be folded down to a one-line summary (nsa-builderExpanded: the step numbers shown in full).
const BSTEPS = ["name", "day", "add", "check", "timeline", "save"];
const builderOpen = () => Math.min(6, Math.max(1, +lsGet("nsa-builderOpen", 1) || 1));
function builderExpanded() {
  const open = builderOpen(), saved = lsGet("nsa-builderExpanded", null);
  return new Set(Array.isArray(saved) ? saved.filter(n => n <= open) : open === 6 ? [1, 2, 3, 4, 5, 6] : [open]);
}
const setExpanded = set => lsSet("nsa-builderExpanded", [...set].sort());

// Undo / redo for the Stack builder: a snapshot of what the person edits (supplements, doses,
// times, meals, wake and bed) is taken on every change (touch). History is per stack and lasts for the visit.
const HIST_FIELDS = ["items", "meals", "wake", "bed"];
const histSnap = st => JSON.stringify(HIST_FIELDS.map(f => st[f]));
const histOf = st => (App.hist || (App.hist = {}))[st.id] || (App.hist[st.id] = { past: [], future: [], cur: histSnap(st) });
let histApplying = false;
function recordHistory(st) {
  if (histApplying) return;
  const h = histOf(st), now = histSnap(st);
  if (now === h.cur) return;
  h.past.push(h.cur); if (h.past.length > 50) h.past.shift();
  h.cur = now; h.future = [];
}
function histGo(dir) {
  const st = active(), h = histOf(st), from = dir < 0 ? h.past : h.future, to = dir < 0 ? h.future : h.past;
  if (!from.length) return;
  to.push(h.cur); h.cur = from.pop();
  JSON.parse(h.cur).forEach((v, k) => { st[HIST_FIELDS[k]] = v; });
  histApplying = true; touch(st); histApplying = false;
  closeAddWarn(); closeDoseWarn(); refreshBuilder();
}
function renderHistBtns() {
  const h = histOf(active()), set = (id, off) => { const b = document.getElementById(id); if (b) b.disabled = off; };
  set("hist-undo", !h.past.length); set("hist-redo", !h.future.length); set("stack-clear", !active().items.length);
}

// ---- About you: medications and conditions (localStorage only, never sent anywhere) ----
function saveAbout(a) { lsSet(ABOUT_KEY, a); renderAbout(); renderChecks(); renderSave(); renderSuggest(); renderTimeline(); }
// Find a medication class from a typed name: exact name first, then the longest name contained in it.
function medClassFor(name) {
  const q = name.trim().toLowerCase(); if (!q) return null;
  let best = null;
  MED_CLASSES.forEach(c => c.names.forEach(n => { if ((q === n || q.includes(n) || (n.length > 4 && n.includes(q))) && (!best || n.length > best.n.length)) best = { cls: c.id, n }; }));
  return best ? best.cls : "other";
}
function renderAbout() {
  const el = document.getElementById("b-about"); if (!el) return;
  const T = ABOUT_TEXT, a = aboutYou(), open = !!App.aboutOpen;
  const medsCount = new Set([...a.meds, ...a.names.map(n => n.cls)].filter(m => m !== "none" && m !== "pnts")).size, condCount = a.conds.filter(c => c !== "none" && c !== "pnts").length;
  const summary = !a.meds.length && !a.names.length && !a.conds.length ? T.summaryEmpty
    : T.summary.replace("{meds}", a.meds.includes("pnts") ? T.summaryPnts : a.meds.includes("none") ? T.summaryNone : medsCount).replace("{conds}", a.conds.includes("pnts") ? T.summaryPnts : a.conds.includes("none") ? T.summaryNone : condCount);
  const chip = (list, id, label) => `<button class="pill chip about-chip" data-act="about-toggle" data-list="${list}" data-id="${id}" aria-pressed="${a[list].includes(id)}">${esc(label)}</button>`;
  el.innerHTML = `<div class="about${open ? " open" : ""}">
    <button class="about-head" data-act="about-fold" aria-expanded="${open}" aria-controls="about-body">
      <svg class="caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5 7 5 3 8.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <b>${esc(T.heading)}</b><span class="about-opt">${esc(T.optional)}</span><span class="about-sum">${esc(summary)}</span>
    </button>
    ${open ? `<div class="about-body" id="about-body">
      <p class="hint">${esc(T.intro)}</p>
      <p class="about-privacy">🔒 ${esc(T.privacy)}</p>
      <div class="about-group"><span class="field-label">${esc(T.medsLabel)}</span>
        <div class="about-search"><label for="about-q" class="sr">${esc(T.medsSearchLabel)}</label>
          <input id="about-q" type="search" placeholder="${esc(T.medsSearch)}" autocomplete="off">
          <button class="btn small" data-act="about-add">${esc(T.medsAdd)}</button></div>
        <p class="hint" id="about-match" aria-live="polite">${App.aboutNote ? esc(App.aboutNote) : ""}</p>
        ${a.names.length ? `<ul class="about-names">${a.names.map((n, k) => `<li><b>${esc(n.name)}</b> <span>${esc(medLabel(n.cls))}</span><button class="x" data-act="about-remove" data-k="${k}" aria-label="${esc(T.remove)} ${esc(n.name)}">×</button></li>`).join("")}</ul>` : ""}
        <div class="about-chips">${MED_CLASSES.map(c => chip("meds", c.id, c.label)).join("")}${chip("meds", "none", T.none)}${chip("meds", "pnts", T.pnts)}</div>
      </div>
      <div class="about-group"><span class="field-label">${esc(T.condLabel)}</span>
        <div class="about-chips">${CONDITIONS.map(c => chip("conds", c.id, c.label)).join("")}${chip("conds", "none", T.none)}${chip("conds", "pnts", T.pnts)}</div>
      </div>
    </div>` : ""}
  </div>`;
}

// ---- Side effects on "What is this?" and supplement pages (content/side-effects.js) ----
function safetyHtml(sid, compact) {
  const e = seOf(sid), D = MED_RULES.display;
  const srcs = e.source.map(k => SE_SOURCES[k]).filter(Boolean);
  const tag = `<span class="se-tag">${esc(D.notReviewed)}</span>${e.needsSource ? `<span class="se-tag warn">${esc(D.needsSource)}</span>` : ""}`;
  const list = (h, arr, cls = "") => arr.length ? (compact ? `<p class="${cls}"><b>${esc(h)}:</b> ${arr.map(esc).join("; ")}.</p>` : `<div class="list-card ${cls}"><h3>${esc(h)}</h3><ul>${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>`) : "";
  const common = e.needsSource && !compact ? byId[sid].se : e.common;
  return `<div class="safety${compact ? " compact" : ""}">
    ${compact ? `<div class="safety-tags">${tag}</div>` : ""}
    ${list(D.sideEffects, common)}
    ${list(D.stopSigns, e.stopSigns, "stop")}
    ${list(D.avoidIf, e.avoidIf.map(c => (CONDITIONS.find(x => x.id === c) || {}).label || c))}
    <p class="safety-src">${compact ? "" : tag + " "}${srcs.length ? `${esc(D.sources)}: ${srcs.map(x => `<a href="${x.url}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join(", ")}` : ""}</p>
  </div>`;
}

// Step 3's add panel: Search, Browse or Templates, one at a time (remembered for this visit).
const addTab = () => App.addTab || "search";
function setAddTab(k) {
  App.addTab = k;
  document.querySelectorAll(".sp-tab").forEach(t => t.setAttribute("aria-selected", String(t.dataset.addTab === k)));
  ["search", "browse", "templates"].forEach(p => { const el = document.getElementById("add-pane-" + p); if (el) el.hidden = p !== k; });
  if (k === "search") document.getElementById("add-q")?.focus();
}

function viewBuilder() {
  const st = active(), T = BUILDER_TEXT, P = T.steps, G = T.gate, open = builderOpen(), shown = builderExpanded();
  const step = (n, id, heading, body) => n > open ? `
      <li class="pr-step bstep locked" id="${id}">
        <span class="pr-num" aria-hidden="true">${n}</span>
        <div class="pr-body">
          <h2 class="pr-h">${esc(heading)}</h2>
          <p class="lock-note">${LOCK_ICON}${esc(G.locked.replace("{n}", n - 1))}</p>
        </div>
      </li>` : `
      <li class="pr-step bstep${shown.has(n) ? "" : " folded"}" id="${id}">
        <span class="pr-num" aria-hidden="true" data-act="step-toggle" data-step="${n}">${n}</span>
        <div class="pr-body">
          <h2 class="pr-h"><button class="step-toggle" data-act="step-toggle" data-step="${n}" aria-expanded="${shown.has(n)}" aria-controls="${id}-body">${esc(heading)}<svg class="caret" width="14" height="14" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></h2>
          <p class="step-sum" id="${id}-sum"></p>
          <div class="step-content" id="${id}-body"${shown.has(n) ? "" : " hidden"}>
          ${body}
          ${n === open && n < 6 ? `<div class="step-next"><button class="btn" id="step-next" data-act="step-next">${esc(G.next)} ${esc(P[BSTEPS[n]].heading)} →</button><span class="hint" id="step-next-hint"></span></div>` : ""}
          </div>
        </div>
      </li>`;
  const seenTour = lsGet("nsa-tourSeen", false);
  const skip = open < 6 ? `<button class="btn ghost" data-act="tour-skip">${esc(T.skipButton)}</button>` : "";
  return `<div class="stack">
    <div class="page-head">
      <span class="eyebrow">${esc(T.eyebrow)}</span>
      <h1>${esc(T.title)}</h1>
      <p class="lede">${esc(T.lede)}</p>
      ${seenTour ? `<div class="tour-row"><button class="btn ghost" data-act="tour" data-tour="page">${esc(T.tourButton)}</button>${skip}</div>`
        : `<div class="tour-prompt"><span>${esc(T.tourPrompt)}</span><button class="btn" data-act="tour" data-tour="page">${esc(T.tourButton)}</button>${skip}</div>`}
    </div>

    ${open > 1 ? `<div class="fold-all"><button class="linkish" data-act="steps-all" data-show="1">${esc(T.fold.expandAll)}</button><span aria-hidden="true">·</span><button class="linkish" data-act="steps-all" data-show="0">${esc(T.fold.collapseAll)}</button></div>` : ""}
    <ol class="pr-steps bsteps">
      ${step(1, "bs-name", P.name.heading, `
          <p class="pr-intro">${esc(P.name.intro)}</p>
          ${st.example ? `<p class="hint">${esc(P.name.exampleNote)}</p>` : ""}
          <div class="toolbar">
            <div class="field">
              <label for="stack-select">Your stacks</label>
              <select id="stack-select">${App.stacks.map(s => `<option value="${s.id}"${s.id === st.id ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select>
            </div>
            <div class="field grow">
              <label for="stack-name">Name</label>
              <input id="stack-name" value="${esc(st.name)}" maxlength="60">
            </div>
            <div class="toolbar-btns">
              <button class="btn" data-act="new-stack">New stack</button>
              <button class="btn ${App.confirmDelete ? "danger" : "ghost"}" data-act="del-stack">${App.confirmDelete ? "Confirm delete" : "Delete"}</button>
            </div>
          </div>`)}
      ${step(2, "bs-day", P.day.heading, `
          <p class="pr-intro">${esc(P.day.intro)}</p>
          <div class="day-set">
            <div class="field"><label for="wake">Wake</label><input id="wake" type="time" value="${esc(st.wake)}"></div>
            <div class="field"><label for="bed">Bed</label><input id="bed" type="time" value="${esc(st.bed)}"></div>
            <div class="field grow"><span class="field-label">Meals</span><div id="b-meals"></div></div>
          </div>
          <div><button class="linkish tour-link" id="tour-meals" data-act="tour" data-tour="meals">${esc(P.day.mealsTour)} →</button></div>
          <div id="b-about"></div>`)}
      ${step(3, "bs-add", P.add.heading, `
          <p class="pr-intro">${esc(P.add.intro)}</p>
          <div class="stack-panel">
          <div class="sp-add">
            <div class="sp-tabs" id="add-tabs" role="tablist" aria-label="${esc(P.add.addLabel)}">
              <span class="sp-tabs-label">${esc(P.add.addLabel)}</span>
              ${[["search", P.add.tabSearch], ["browse", P.add.tabBrowse], ["templates", P.add.tabTemplates]].map(([k, l]) => `<button class="sp-tab" role="tab" id="add-tab-${k}" data-act="add-tab" data-add-tab="${k}" aria-controls="add-pane-${k}" aria-selected="${addTab() === k}">${esc(l)}</button>`).join("")}
            </div>
          <div class="sp-pane" id="add-pane-search" role="tabpanel" aria-labelledby="add-tab-search"${addTab() === "search" ? "" : " hidden"}>
          <div class="adder big">
            <label for="add-q" class="sr">${esc(P.add.searchLabel)}</label>
            <input id="add-q" type="search" placeholder="${esc(P.add.searchPlaceholder.replace("{n}", S.length))}" autocomplete="off">
            <div id="add-results" class="results"></div>
          </div>
          </div>
          <div class="sp-pane browse" id="add-pane-browse" role="tabpanel" aria-labelledby="add-tab-browse"${addTab() === "browse" ? "" : " hidden"}>
            <div id="bs-browse" class="browse">
            <div class="browse-tabs" role="tablist"><button class="browse-tab wide" role="tab" data-act="browse-nt" data-nt="foundation" style="--hue:var(--c-foundation)" aria-selected="${App.browseNT === "foundation"}"><b>${esc(P.add.foundationTab)}</b><span>${esc(P.add.foundationSub)}</span></button>${NTS.map(n => `<button class="browse-tab" role="tab" data-act="browse-nt" data-nt="${n.id}" style="--hue:${ntColor(n.id)}" aria-selected="${App.browseNT === n.id}"><b>${esc(n.word)}</b><span>${esc(n.name)}</span></button>`).join("")}</div>
            <div id="b-browse"></div>
            </div>
          </div>
          <div class="sp-pane" id="add-pane-templates" role="tabpanel" aria-labelledby="add-tab-templates"${addTab() === "templates" ? "" : " hidden"}>
            <div class="templates" id="bs-templates">
            ${TEMPLATES.map((t, i) => `<button class="pill chip" data-act="tpl" data-i="${i}">+ ${esc(t.name)}</button>`).join("")}
            </div>
            <p class="hint">${esc(P.add.templatesNote)}</p>
          </div>
          </div>
          <div class="sp-list">
            <div class="sp-list-head"><h3 class="sub-h">${esc(P.add.inStack)}</h3><span class="sp-count" id="sp-count"></span>
              <span class="fold-mini"><button class="linkish" data-act="items-all" data-show="1">${esc(T.fold.expandAll)}</button> · <button class="linkish" data-act="items-all" data-show="0">${esc(T.fold.collapseAll)}</button></span>
              <span class="sp-hist">
                <button class="btn small ghost" id="hist-undo" data-act="hist" data-dir="-1" title="${esc(P.add.undoKey)}">↶ ${esc(P.add.undo)}</button>
                <button class="btn small ghost" id="hist-redo" data-act="hist" data-dir="1" title="${esc(P.add.redoKey)}">↷ ${esc(P.add.redo)}</button>
                <button class="btn small ghost danger-ghost" id="stack-clear" data-act="stack-clear">${esc(P.add.clear)}</button>
              </span></div>
            <div id="b-items"></div>
          </div>
          </div>
          <div id="b-suggest"></div>`)}
      ${step(4, "bs-check", P.check.heading, `
          <p class="pr-intro">${esc(P.check.intro)} <button class="linkish" data-act="about-open">${esc(ABOUT_TEXT.fromCheck)}</button></p>
          <div id="b-checks"></div>`)}
      ${step(5, "bs-timeline", P.timeline.heading, `
          <div class="tl-bar-row">
            <p class="sec-intro">${esc(P.timeline.intro)} <b>Drag any bar or meal to move it</b> (arrow keys work too). Light = kicking in, solid = working, fade = wearing off, dashed = builds over weeks. Faded bars mean food is cutting absorption. The red line is the current time.</p>
            <div class="tl-actions"><span class="fold-mini"><button class="linkish" data-act="lanes-all" data-show="1">${esc(T.fold.expandAll)}</button> · <button class="linkish" data-act="lanes-all" data-show="0">${esc(T.fold.collapseAll)}</button></span><button class="btn" data-act="optimize">Optimize timing</button><a href="#sim" data-go="sim" class="sim-link">${esc(SIM_TEXT.open)}</a></div>
          </div>
          <div id="b-opt"></div>
          <div id="b-timeline"></div>`)}
      ${step(6, "bs-save", P.save.heading, `
          <p class="pr-intro">${esc(P.save.intro)}</p>
          <div id="b-save"></div>`)}
    </ol>
  </div>`;
}

// Browse by neurotransmitter: its supplements in three groups, strongest evidence first, one tap to add.
// "What do the dots mean?": a fold-out key for the evidence dots (wording in content/stack-builder.js).
function evLegend() {
  const E = BUILDER_TEXT.evidence;
  return `<details class="ev-legend"${App.evOpen ? " open" : ""} ontoggle="App.evOpen = this.open"><summary>${esc(E.summary)}</summary>
    <p class="hint">${esc(E.intro)}</p>
    <dl>${["strong", "moderate", "limited", "theoretical"].map(k => `<div><dt>${evDots(k)}<span class="ev-label">${esc(k)}</span></dt><dd>${esc(E[k])}</dd></div>`).join("")}</dl>
    <p class="hint">${esc(E.note)}</p></details>`;
}

// Clicking "✓ In stack" (Browse, Foundations, search): a small menu to remove it or add another dose.
function showInStackMenu(anchor, sid) {
  const P = BUILDER_TEXT.steps.add, n = active().items.filter(i => i.sid === sid).length;
  closeAddWarn(); closeDoseWarn();
  const pop = Object.assign(document.createElement("div"), { className: "addwarn addwarn-pop instack-pop", id: "addwarn-pop" });
  pop.setAttribute("role", "menu");
  pop.innerHTML = `<b>${esc(byId[sid].name)}</b><span class="hint">${esc((n > 1 ? P.inStackN : P.inStack1).replace("{n}", n))}</span>
    <div class="addwarn-btns">
      <button class="btn small ghost danger-ghost" role="menuitem" data-act="instack-remove" data-sid="${sid}">${esc(n > 1 ? P.removeAll : P.remove)}</button>
      <button class="btn small ghost" role="menuitem" data-act="instack-again" data-sid="${sid}">${esc(P.addAgain)}</button>
    </div>`;
  document.body.append(pop);
  const r = anchor.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight, below = r.bottom + 8 + h < innerHeight || r.top - 8 - h < 0;
  pop.style.left = Math.min(Math.max(12, r.right - w), innerWidth - w - 12) + scrollX + "px";
  pop.style.top = (below ? r.bottom + 8 : r.top - 8 - h) + scrollY + "px";
  pop.querySelector("button").focus({ preventScroll: true });
}

function renderBrowse() {
  const el = document.getElementById("b-browse");
  if (!el) return;
  const nt = ntById[App.browseNT], P = BUILDER_TEXT.steps.add;
  document.querySelectorAll(".browse-tab").forEach(t => t.setAttribute("aria-selected", String(t.dataset.nt === App.browseNT)));
  if (App.browseNT === "foundation") { el.innerHTML = browseFoundations(); return; }
  if (!nt) { el.innerHTML = `<p class="hint">${esc(P.browseHint)}</p>${evLegend()}`; return; }
  const rows = MAP.filter(r => r[1] === nt.id), inStack = new Set(active().items.map(i => i.sid));
  const groups = [["Precursors", r => r[2] === "precursor"], ["Cofactors", r => r[2] === "cofactor"], ["Modulators", r => r[2] !== "precursor" && r[2] !== "cofactor"]];
  el.innerHTML = evLegend() + `<div class="browse-groups" style="--nt:${ntColor(nt.id)}">${groups.map(([title, test]) => {
    const items = rows.filter(test).sort((a, b) => EV[b[3]] - EV[a[3]]);
    if (!items.length) return "";
    return `<div class="browse-group"><h4>${title}</h4>${items.map(([sid, , role, ev, note]) => {
      const s = byId[sid], has = inStack.has(sid);
      return `<div class="browse-item${has ? " has" : ""}">
        <div class="browse-main"><span class="item-name">${esc(s.name)}</span>${title === "Modulators" ? `<span class="role">${ROLE[role]}</span>` : ""}${tierBadge(s)}${ixBadge(s)}
          <span class="browse-note">${esc(note)}</span></div>
        <span class="browse-ev" title="${ev} evidence">${evDots(ev)}<span class="ev-label">${esc(ev)}</span></span>
        ${has ? `<button class="btn small ghost" data-act="in-stack" data-sid="${sid}" aria-haspopup="menu" aria-label="${esc(s.name)} is in your stack: remove or add another dose">✓ ${esc(P.added)} ▾</button>`
          : `<button class="btn small" data-act="add-supp" data-sid="${sid}" data-stay="1" aria-label="Add ${esc(s.name)}">${esc(P.add)}</button>`}
      </div>`;
    }).join("")}</div>`;
  }).join("")}</div>`;
}

// Foundations + recovery: the FOUNDATIONS list (content/recommendations.js) with its short tag and why.
function browseFoundations() {
  const P = BUILDER_TEXT.steps.add, inStack = new Set(active().items.map(i => i.sid));
  return `<div class="browse-groups" style="--nt:var(--c-foundation)"><div class="browse-group"><h4>${esc(P.foundationTab)}</h4>${FOUNDATIONS.filter(([sid]) => byId[sid]).map(([sid, tag, why]) => {
    const s = byId[sid], has = inStack.has(sid);
    return `<div class="browse-item${has ? " has" : ""}">
      <div class="browse-main"><span class="item-name">${esc(s.name)}</span><span class="role">${esc(tag)}</span>${tierBadge(s)}${ixBadge(s)}
        <span class="browse-note">${esc(why)}</span></div>
      <span></span>
      ${has ? `<button class="btn small ghost" data-act="in-stack" data-sid="${sid}" aria-haspopup="menu" aria-label="${esc(s.name)} is in your stack: remove or add another dose">✓ ${esc(P.added)} ▾</button>`
          : `<button class="btn small" data-act="add-supp" data-sid="${sid}" data-stay="1" aria-label="Add ${esc(s.name)}">${esc(P.add)}</button>`}
    </div>`;
  }).join("")}</div></div>`;
}

// Add-time warning: a small panel that pops up next to the "+ Add" button that was pressed, listing the
// new conflicts with "Swap out X" (for each supplement already in the stack that it clashes with),
// "Add anyway" and "Cancel". Escape or a click elsewhere cancels.
function showAddWarn(anchor) {
  const p = App.pendingAdd, A = LOAD_RULES.addWarn;
  closeAddWarn(true);
  const swaps = [...new Set(p.cross.flatMap(f => f.ids || []))].filter(id => id !== p.sid && active().items.some(i => i.sid === id));
  const pop = Object.assign(document.createElement("div"), { className: "addwarn addwarn-pop", id: "addwarn-pop" });
  pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", A.heading.replace("{name}", byId[p.sid].name));
  pop.innerHTML = `<b>${esc(A.heading.replace("{name}", byId[p.sid].name))}</b>
    ${p.cross.map(f => `<div class="addwarn-f"><span class="sev sev-${f.sev}">${f.sev}</span><div><div class="check-title">${esc(f.title)}</div><p>${gloss(f.body)}</p></div></div>`).join("")}
    <div class="addwarn-btns">
      ${swaps.map(id => `<button class="btn small" data-act="addwarn-swap" data-from="${id}">${esc(A.swap.replace("{name}", byId[id].name))}</button>`).join("")}
      <button class="btn small ghost" data-act="addwarn-anyway">${esc(A.anyway)}</button>
      <button class="linkish" data-act="addwarn-cancel">${esc(A.cancel)}</button>
    </div>`;
  document.body.append(pop);
  // Place it under the button (or above if there's no room), kept inside the window; page coordinates so it scrolls with the page.
  const r = (anchor && anchor.isConnected ? anchor : document.getElementById("b-items") || document.body).getBoundingClientRect();
  const w = pop.offsetWidth, h = pop.offsetHeight, below = r.bottom + 8 + h < innerHeight || r.top - 8 - h < 0;
  pop.style.left = Math.min(Math.max(12, r.right - w), innerWidth - w - 12) + scrollX + "px";
  pop.style.top = (below ? r.bottom + 8 : r.top - 8 - h) + scrollY + "px";
  pop.querySelector("button")?.focus({ preventScroll: true });
}
// Dose monitor popup, next to the dose box. Escape or a click elsewhere keeps the old dose.
function showDoseWarn(i, d) {
  const s = byId[i.sid], W = LOAD_RULES.doseWarn, u = s.dose[2], amt = n => `${num(n)} ${u}`;
  closeDoseWarn(); closeAddWarn();
  App.pendingDose = { id: i.id, dose: d };
  const total = active().items.filter(x => x.sid === i.sid && x.id !== i.id).reduce((a, x) => a + (+x.dose || 0), d);
  const pop = Object.assign(document.createElement("div"), { className: "addwarn addwarn-pop", id: "dosewarn-pop" });
  pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", W.heading);
  pop.innerHTML = `<b>${esc(W.heading)}</b>
    <p>${esc(W.body.replace("{name}", s.name).replace("{dose}", amt(d)).replace("{range}", `${range(s.dose[0], s.dose[1])} ${u}`))}${s.ul && total > s.ul ? " " + esc(W.ul.replace("{ul}", amt(s.ul))) : ""}</p>
    <div class="addwarn-btns">
      <button class="btn small" data-act="dosewarn" data-choice="max">${esc(W.useMax.replace("{max}", amt(s.dose[1])))}</button>
      <button class="btn small ghost" data-act="dosewarn" data-choice="keep">${esc(W.keep.replace("{dose}", amt(d)))}</button>
      <button class="linkish" data-act="dosewarn" data-choice="change">${esc(W.change)}</button>
    </div>`;
  document.body.append(pop);
  const inp = document.querySelector(`.dose-in[data-item="${i.id}"]`);
  if (inp) inp.value = i.dose;   // not applied until they choose
  const r = (inp?.closest(".dose") || document.getElementById("b-items") || document.body).getBoundingClientRect();
  const w = pop.offsetWidth, h = pop.offsetHeight, below = r.bottom + 8 + h < innerHeight || r.top - 8 - h < 0;
  pop.style.left = Math.min(Math.max(12, r.right - w), innerWidth - w - 12) + scrollX + "px";
  pop.style.top = (below ? r.bottom + 8 : r.top - 8 - h) + scrollY + "px";
  pop.querySelector("button").focus({ preventScroll: true });
}
function closeDoseWarn() { document.getElementById("dosewarn-pop")?.remove(); App.pendingDose = null; }
document.addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("dosewarn-pop")) closeDoseWarn(); });
document.addEventListener("pointerdown", e => { const pop = document.getElementById("dosewarn-pop"); if (pop && !pop.contains(e.target) && !e.target.closest(".dose")) closeDoseWarn(); });
window.addEventListener("hashchange", () => closeDoseWarn());

function closeAddWarn(keepPending) {
  document.getElementById("addwarn-pop")?.remove();
  if (!keepPending) App.pendingAdd = null;
}
document.addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("addwarn-pop")) closeAddWarn(); });
document.addEventListener("pointerdown", e => { const pop = document.getElementById("addwarn-pop"); if (pop && !pop.contains(e.target) && !e.target.closest("[data-act='add-supp'], [data-act='in-stack']")) closeAddWarn(); });
window.addEventListener("hashchange", () => closeAddWarn());

function renderItems() {
  const el = document.getElementById("b-items");
  if (!el) return;
  const items = [...active().items].filter(i => byId[i.sid]).sort((a, b) => mins(a.time) - mins(b.time));
  const P = BUILDER_TEXT.steps.add, open = App.itemsOpen || (App.itemsOpen = new Set());
  const cnt = document.getElementById("sp-count"); if (cnt) cnt.textContent = items.length ? `${items.length} ${items.length === 1 ? BUILDER_TEXT.steps.timeline.one : BUILDER_TEXT.steps.timeline.many}` : "";
  // Grouped like the timeline: one folding group per pathway, then Foundations + recovery.
  const groups = [...NTS.map(n => ({ id: n.id, name: n.name })), { id: "foundation", name: P.foundationTab }]
    .map(g => ({ ...g, items: items.filter(i => laneOf(i.sid) === g.id) })).filter(g => g.items.length);
  const item = i => {
    const s = byId[i.sid];
    const ab = absorb(i, active());
    return `<div class="item" style="--nt:${laneColor(laneOf(i.sid))}">
      <div class="item-main">
        <a href="#${s.id}" data-go="${s.id}" class="item-name">${esc(s.name)}</a>${tierBadge(s)}
        ${ab.label ? `<span class="ab ab-${ab.level}">${ab.level === "good" ? "✓ " : ab.level === "warn" || ab.level === "bad" ? "! " : ""}${esc(ab.label)}</span>` : ""}
        <span class="item-meta">${FOOD[s.food]} · typical ${range(s.dose[0], s.dose[1])} ${esc(s.dose[2])} ·
          <button class="linkish" data-act="info" data-sid="${s.id}" aria-expanded="${App.openInfo.has(s.id)}">${App.openInfo.has(s.id) ? "Hide info" : "What is this?"}</button></span>
      </div>
      <div class="dose">
        <button class="dose-step" data-act="dose-step" data-dir="-1" data-item="${i.id}" aria-label="Less ${esc(s.name)}">−</button>
        <input class="dose-in" type="number" min="0" step="any" inputmode="decimal" value="${i.dose}" data-item="${i.id}" aria-label="Dose of ${esc(s.name)}">
        <button class="dose-step" data-act="dose-step" data-dir="1" data-item="${i.id}" aria-label="More ${esc(s.name)}">+</button>
        <span>${esc(s.dose[2])}</span>
      </div>
      <button class="x" data-act="remove" data-item="${i.id}" aria-label="Remove ${esc(s.name)}">×</button>
      ${App.openInfo.has(s.id) ? itemInfo(s) : ""}
    </div>`;
  };
  el.innerHTML = items.length ? `<div class="items">${groups.map(g => {
    const isOpen = open.has(g.id), n = g.items.length;
    // Folded groups still say when something inside needs a look (caution tag or a food/timing flag).
    const flagged = g.items.filter(i => byId[i.sid].tier === "caution" || ["warn", "bad"].includes(absorb(i, active()).level)).length;
    const names = [...new Set(g.items.map(i => byId[i.sid].name))].join(", ");
    return `<div class="item-group${isOpen ? " open" : ""}" style="--nt:${laneColor(g.id)}">
      <button class="group-head" data-act="items-group" data-group="${g.id}" aria-expanded="${isOpen}">
        <svg class="caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5 7 5 3 8.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <b>${esc(g.name)}</b><span class="group-count">${n} ${n === 1 ? BUILDER_TEXT.steps.timeline.one : BUILDER_TEXT.steps.timeline.many}</span>
        ${flagged ? `<span class="group-flag">! ${flagged} ${esc(P.groupFlag)}</span>` : ""}
        ${isOpen ? "" : `<span class="group-names">${esc(names)}</span>`}
      </button>
      ${isOpen ? g.items.map(item).join("") : ""}
    </div>`;
  }).join("")}</div>` : `<div class="empty">Nothing here yet. Search, browse or pick a template above.</div>`;
}

// Timeline lanes: each supplement sits under one pathway. Foundations (content/recommendations.js)
// and anything not linked to a neurotransmitter go in "Foundations + recovery".
const laneOf = sid => FOUNDATIONS.some(f => sameGroup(f[0], sid)) || !MAP.some(r => r[0] === sid) ? "foundation" : primaryNT(sid);
const laneColor = lane => lane === "foundation" ? "var(--c-foundation)" : ntColor(lane);

const TL_START = 5 * 60, TL_END = 25 * 60, TL_SPAN = TL_END - TL_START;
const pct = m => Math.max(0, Math.min(100, (m - TL_START) / TL_SPAN * 100));

function renderTimeline() {
  const el = document.getElementById("b-timeline");
  if (!el) return;
  const st = active();
  // Don't help run a bad stack: no schedule or Optimize while a serious/critical finding is open.
  const paused = stackPaused(st), Z = LOAD_RULES.paused;
  document.querySelectorAll("[data-act='optimize']").forEach(b => { b.hidden = paused; });
  if (paused) {
    el.innerHTML = `<div class="paused-box"><b>${esc(Z.timeline)}</b><p>${esc(Z.timelineBody)}</p><div><button class="btn small" data-act="step-toggle" data-step="${BSTEPS.indexOf("check") + 1}" data-open="1">${esc(Z.goToCheck)}</button></div></div>`;
    return;
  }
  // While dragging, keep rows in the order they had when the drag started so the row under the pointer never moves.
  const order = drag && drag.order;
  const items = [...st.items].filter(i => byId[i.sid])
    .sort(order ? (a, b) => order.indexOf(a.id) - order.indexOf(b.id) : (a, b) => mins(a.time) - mins(b.time));

  const ticks = [];
  for (let h = 6; h <= 24; h += 3) ticks.push(`<span style="left:${pct(h * 60)}%">${h % 12 || 12}${h < 12 || h === 24 ? "a" : "p"}</span>`);
  const now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
  const wake = mins(st.wake), bed = mins(st.bed);
  // Shared background for every track: night shading, meal windows, now line
  const backdrop = `<span class="tl-night" style="left:0;width:${pct(wake)}%"></span><span class="tl-night" style="left:${pct(bed)}%;right:0"></span>` +
    (st.meals || []).map(m => { const t = mins(m.time); return `<span class="tl-meal" style="left:${pct(t - 30)}%;width:${pct(t + 120) - pct(t - 30)}%"></span>`; }).join("") +
    (nowM >= TL_START && nowM <= TL_END ? `<span class="tl-now" style="left:${pct(nowM)}%"></span>` : "");

  // Coverage per neurotransmitter, 15-minute slots
  const SLOT = 15, slots = TL_SPAN / SLOT;
  const cov = {};
  const addCov = (sid, from, to, scale) => MAP.filter(r => r[0] === sid).forEach(([, nt, role]) => {
    const w = ROLE_WEIGHT[role] * scale;
    if (!w) return;
    const arr = cov[nt] || (cov[nt] = new Array(slots).fill(0));
    for (let k = 0; k < slots; k++) { const m = TL_START + k * SLOT; if (m >= from && m < to) arr[k] += w; }
  });

  const mealRow = `<div class="tl-row meals-row"><span class="tl-label">Meals<small>${(st.meals || []).length ? "drag to move" : "none set"}</small></span>
    <div class="tl-track">${backdrop}${(st.meals || []).map(m => `
      <span class="tl-mealchip" data-drag="meal:${m.id}" tabindex="0" role="slider" aria-label="${esc(m.label)} time" aria-valuetext="${fmt12(m.time)}" style="left:${pct(mins(m.time))}%">${esc(m.label)}</span>`).join("")}</div></div>`;

  const T = BUILDER_TEXT.steps.timeline, open = App.tlOpen || (App.tlOpen = new Set());
  // One row per supplement; shown under its lane when that lane is opened.
  const row = i => {
    const s = byId[i.sid], t = mins(i.time), ab = absorb(i, st);
    const color = laneColor(laneOf(i.sid));
    const strength = Math.max(0.3, Math.min(1, ab.factor)).toFixed(2);
    let bars;
    if (s.onset[0] == null) {
      bars = `<span class="tl-steady" style="--bc:${color};opacity:${strength}"></span>`;
    } else {
      const on = (s.onset[0] + s.onset[1]) / 2 + ab.delay, durAvg = (s.dur[0] + s.dur[1]) / 2 * 60, durMax = s.dur[1] * 60;
      const a = t, b = t + on, c = t + on + durAvg, d = t + s.onset[1] + ab.delay + durMax;
      bars = `<span class="tl-ramp" style="left:${pct(a)}%;width:${pct(b) - pct(a)}%;--bc:${color};opacity:${strength}"></span>
        <span class="tl-bar" style="left:${pct(b)}%;width:${Math.max(0.6, pct(c) - pct(b))}%;--bc:${color};opacity:${strength}"></span>
        ${d > c ? `<span class="tl-tail" style="left:${pct(c)}%;width:${pct(d) - pct(c)}%;--bc:${color};opacity:${strength}"></span>` : ""}`;
    }
    const flag = ab.level === "warn" || ab.level === "bad" ? `<em class="ab-${ab.level}">${esc(ab.label)}</em>` : "";
    return `<div class="tl-row tl-child" style="--nt:${color}"><span class="tl-label">${esc(s.name)}<small>${num(+i.dose || 0)} ${esc(s.dose[2])} · ${fmt12(i.time)}</small>${flag}</span>
      <div class="tl-track drag" data-drag="item:${i.id}" tabindex="0" role="slider" aria-label="${esc(s.name)} dose time" aria-valuetext="${fmt12(i.time)}">${backdrop}${bars}<span class="tl-dose" style="left:${pct(t)}%"></span></div></div>`;
  };

  // Coverage: each neurotransmitter lane sums every supplement acting on it (as before);
  // the Foundations + recovery lane sums its own members.
  items.forEach(i => {
    const s = byId[i.sid], ab = absorb(i, st), t = mins(i.time);
    let from = TL_START, to = TL_END, scale = 0.3 * ab.factor;
    if (s.onset[0] != null) { from = t + (s.onset[0] + s.onset[1]) / 2 + ab.delay; to = from + (s.dur[0] + s.dur[1]) / 2 * 60; scale = ab.factor; }
    addCov(i.sid, from, to, scale);
    if (laneOf(i.sid) === "foundation") {
      const arr = cov.foundation || (cov.foundation = new Array(slots).fill(0));
      for (let k = 0; k < slots; k++) { const m = TL_START + k * SLOT; if (m >= from && m < to) arr[k] += scale; }
    }
  });

  const lanes = [...NTS.map(n => ({ id: n.id, name: n.name })), { id: "foundation", name: T.foundationLane }].map(L => {
    const members = items.filter(i => laneOf(i.sid) === L.id), arr = cov[L.id];
    if (!members.length && !(arr && arr.some(v => v > 0))) return "";
    let spans = "", k = 0;
    while (arr && k < slots) {
      const v = arr[k];
      let j = k; while (j < slots && arr[j] === v) j++;
      if (v > 0) spans += `<span class="tl-heat" style="left:${k / slots * 100}%;width:${(j - k) / slots * 100}%;opacity:${(0.15 + 0.85 * Math.min(1, v / 2)).toFixed(2)}"></span>`;
      k = j;
    }
    const isOpen = open.has(L.id) && members.length, n = members.length;
    const from = [...new Set(items.filter(i => MAP.some(r => r[0] === i.sid && r[1] === L.id && ROLE_WEIGHT[r[2]] > 0)).map(i => byId[i.sid].name))];
    const count = n ? `${n} ${n === 1 ? T.one : T.many}` : `${T.from} ${from.length > 2 ? from.slice(0, 2).join(", ") + ` +${from.length - 2}` : listJoin(from)}`;
    return `<div class="tl-lane${isOpen ? " open" : ""}" style="--nt:${laneColor(L.id)}">
      <div class="tl-row lane"${n ? ` data-act="tl-lane" data-lane="${L.id}"` : ""}>
        <span class="tl-label">${n ? `<button class="tl-lane-btn" data-act="tl-lane" data-lane="${L.id}" aria-expanded="${!!isOpen}"><svg class="caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5 7 5 3 8.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><b>${esc(L.name)}</b></button>` : `<b>${esc(L.name)}</b>`}<small title="${esc(count)}">${esc(count)}</small></span>
        <div class="tl-track">${backdrop}${spans}</div>
      </div>
      ${isOpen ? members.map(row).join("") : ""}
    </div>`;
  }).join("");

  el.innerHTML = `${approvalValid(st) && stackBlocked(st) ? `<p class="approved-note">${esc(LOAD_RULES.approve.timelineNote)}</p>` : ""}<div class="tl">
    <div class="tl-row axis"><span class="tl-label"></span><div class="tl-axis">${ticks.join("")}${nowM >= TL_START && nowM <= TL_END
      ? `<span class="tl-nowtag" style="left:${pct(nowM)}%">Now · ${fmt12(hhmm(nowM))}</span>` : ""}</div></div>
    ${mealRow}
    ${lanes ? `<div class="tl-divider"><span class="eyebrow">Pathway coverage</span></div>${lanes}
    <p class="tl-caption">Darker means more of your stack is acting on that pathway at that hour, adjusted roughly for food. It's a map of your schedule, not a measurement of brain chemistry.</p>`
      : `<div class="empty small">Add supplements to see them on the timeline.</div>`}
  </div>`;
}

function renderMeals() {
  const el = document.getElementById("b-meals");
  if (!el) return;
  const meals = [...(active().meals || [])].sort((a, b) => mins(a.time) - mins(b.time));
  el.innerHTML = `<div class="meals">${meals.map(m => `
    <div class="meal">
      <input type="time" class="meal-time" data-meal="${m.id}" value="${esc(m.time)}" aria-label="${esc(m.label)} time">
      <input class="meal-label" data-meal="${m.id}" value="${esc(m.label)}" maxlength="24" aria-label="Meal name">
      <div class="flags">${["protein", "fat", "carbs"].map(f => `<button data-act="meal-flag" data-meal="${m.id}" data-flag="${f}" aria-pressed="${!!m[f]}">${f[0].toUpperCase() + f.slice(1)}</button>`).join("")}</div>
      <button class="x" data-act="meal-remove" data-meal="${m.id}" aria-label="Remove ${esc(m.label)}">×</button>
    </div>`).join("")}
    <div class="meal-adds"><button class="pill chip" data-act="meal-add" data-kind="meal">+ Meal</button><button class="pill chip" data-act="meal-add" data-kind="snack">+ Carb snack</button></div>
  </div>`;
}

function renderOpt(result) {
  const el = document.getElementById("b-opt");
  if (!el) return;
  if (!result) { el.innerHTML = ""; return; }
  el.innerHTML = result.changes.length ? `<div class="opt">
      <div class="opt-head"><b>Moved ${result.changes.length} dose${result.changes.length > 1 ? "s" : ""}</b><button class="btn ghost" data-act="undo-opt">Undo</button></div>
      <ul>${result.changes.map(c => `<li><b>${esc(byId[c.sid].name)}</b> ${fmt12(c.from)} → ${fmt12(c.to)} <span class="hint">${esc(c.why)}</span></li>`).join("")}</ul>
    </div>` : `<div class="opt"><b>Your timing already looks good.</b> <span class="hint">Nothing would clearly improve by moving.</span></div>`;
}

// "Keep one per system": in each chemical system with 2+ supplements, keep the one with the best
// evidence for that system's neurotransmitter (supplement-links.js) and list the rest for removal.
// Supplements that skip the pathway's slow step (Mucuna, 5-HTP) are only kept when nothing gentler is there.
function trimPlan(stack) {
  const ids = [...new Set(stack.items.filter(i => byId[i.sid]).map(i => i.sid))], remove = new Set(), keep = [];
  LOAD_RULES.systems.forEach(sys => {
    const mem = ids.filter(id => byId[id].tags.includes(sys.tag) && !remove.has(id));
    if (mem.length < 2) return;
    const ev = id => Math.max(-1, ...MAP.filter(r => r[0] === id && r[1] === sys.nt).map(r => EV[r[3]]));
    const best = mem.slice().sort((a, b) => pastSlowStep(a, sys.nt) - pastSlowStep(b, sys.nt) || ev(b) - ev(a))[0];
    keep.push(best); mem.filter(id => id !== best).forEach(id => remove.add(id));
  });
  return { keep, remove: [...remove].filter(id => !keep.includes(id)) };
}

// Serious stacks: the banner offers "Review the warnings" or "Keep one per system". Reviewing opens the
// full list, where each serious / to-review warning needs a "Reviewed" tick. Only then does the
// "Approve stack" panel at the bottom unlock. Ticks are kept per stack for the visit.
const revKey = f => `${f.rule || f.cat + ":" + f.title}:${f.sev}`;
const needsReview = f => SEV_ORDER[f.sev] <= SEV_ORDER.moderate;
const reviewedSet = st => (App.reviewed || (App.reviewed = {}))[st.id] || (App.reviewed[st.id] = new Set());

// Warning-sign cards: serotonin (any serotonin finding at "to review" or above) and stimulants.
function emergencyCards(F) {
  const E = MED_RULES.emergency, bad = f => SEV_ORDER[f.sev] <= SEV_ORDER.moderate;
  const isSero = id => byId[id]?.tags.includes("serotonergic");
  const sero = F.some(f => bad(f) && (f.system === "serotonergic" || f.rule === "med:sero-meds" || (f.cat === "Interactions" && (f.ids || []).filter(isSero).length >= 2)));
  const stim = F.some(f => bad(f) && (f.rule === "stim" || f.rule === "med:adhd"));
  const card = c => { const src = SE_SOURCES[c.source]; return `<div class="emergency" role="note"><b>${esc(c.title)}</b><p>${esc(c.intro)}</p>
    <ul>${c.signs.map(x => `<li>${esc(x)}</li>`).join("")}</ul>${src ? `<p class="safety-src">Source: <a href="${src.url}" target="_blank" rel="noopener">${esc(src.label)}</a></p>` : ""}</div>`; };
  return (sero ? card(E.serotonin) : "") + (stim ? card(E.stimulant) : "");
}

function approvePanel(F) {
  const st = active(), A = LOAD_RULES.approve, R = LOAD_RULES.review, todo = F.filter(needsReview), done = todo.filter(f => reviewedSet(st).has(revKey(f))).length;
  if (!canApprove(F)) return `<div class="approve-box"><p class="hint">${esc(A.criticalBlocked)}</p></div>`;
  const all = done === todo.length;
  return `<div class="approve-box" id="approve-box">
    <b>${esc(A.heading)}</b>
    <div class="review-progress"><span style="--p:${todo.length ? done / todo.length : 1}"></span></div>
    <p class="hint">${esc(R.progress.replace("{n}", done).replace("{total}", todo.length))}${all ? "" : " " + esc(R.tickAll)}</p>
    <label class="save-ack${all ? "" : " off"}"><input type="checkbox" id="approve-ack"${all ? "" : " disabled"}> ${esc(A.confirm)}</label>
    <div><button class="btn small danger" id="approve-go" data-act="approve-go" disabled>${esc(A.go)}</button></div>
  </div>`;
}

function renderChecks() {
  const el = document.getElementById("b-checks");
  if (!el) return;
  const st = active(), F = analyze(st);
  if (!F.length) { el.innerHTML = `<div class="empty">Add supplements to see conflicts, timing tips and missing cofactors.</div>`; return; }
  const count = sev => F.filter(f => f.sev === sev).length, V = LOAD_RULES.verdict, A = LOAD_RULES.approve, R = LOAD_RULES.review;
  const stop = F.some(isStop), review = count("moderate") > 0, approved = stop && approvalValid(st, F);
  const gated = stop && !approved, reviewing = gated && App.checkReview === st.id;
  const top = F.filter(needsReview).slice().sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]).slice(0, 3);
  const trim = trimPlan(st), stops = F.filter(isStop);
  const when = approved ? new Date(st.approved.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  const verdict = `<div class="verdict ${stop ? (approved ? "v-review" : "v-bad") : review ? "v-review" : "v-good"}">
    <b class="verdict-h">${esc(approved ? V.approved : stop ? V.bad : review ? V.review : V.good)}</b>
    ${top.length ? `<span class="eyebrow">${esc(V.reasons)}</span><ol class="verdict-list">${top.map(f => `<li><span class="sev sev-${f.sev}">${f.sev}</span> ${esc(f.title)}</li>`).join("")}</ol>` : `<p>${esc(V.goodBody)}</p>`}
    ${approved ? `<div class="approve-done"><span>✓ ${esc(A.done.replace("{when}", when).replace("{n}", stops.length).replace("{s}", stops.length === 1 ? "" : "s"))}</span><button class="linkish" data-act="approve-withdraw">${esc(A.withdraw)}</button></div>` : ""}
    ${gated ? `<div class="verdict-choices">
      <div class="choice"><button class="btn" data-act="check-review">${esc(reviewing ? R.reviewing : R.button)}</button><span class="hint">${esc(R.hint)}</span></div>
      ${trim.remove.length ? `<div class="choice"><button class="btn ghost" data-act="trim-systems">${esc(V.trim)}</button><span class="hint">${esc(V.trimHint.replace("{names}", listJoin(trim.remove.map(id => byId[id].name))))}</span></div>` : ""}
    </div>` : trim.remove.length ? `<div class="verdict-trim"><button class="btn small" data-act="trim-systems">${esc(V.trim)}</button><span class="hint">${esc(V.trimHint.replace("{names}", listJoin(trim.remove.map(id => byId[id].name))))}</span></div>` : ""}
  </div>`;
  const sum = [
    [count("critical"), "critical", "critical"], [count("major"), "serious", "major"], [count("moderate"), "to review", "moderate"], [count("minor"), "minor", "minor"], [count("info"), "tips", "info"]
  ].filter(x => x[0]).map(([n, l, c]) => `<span class="sum-chip sev-${c}"><b>${n}</b> ${l}</span>`).join("");
  let html = verdict + emergencyCards(F) + (sum ? `<div class="sum-row">${sum}</div>` : "");
  if (gated && !reviewing) { el.innerHTML = html + `<p class="hint">${esc(R.folded)}</p>`; return; }
  const seen = reviewedSet(st);
  CHECK_CATS.forEach(cat => {
    const list = F.filter(f => f.cat === cat);
    if (!list.length) return;
    html += `<div class="check-group"><h3>${cat}</h3><div class="checks">${list.map(f => `
      <div class="check sevline-${f.sev}${reviewing && needsReview(f) ? " needs-review" + (seen.has(revKey(f)) ? " is-reviewed" : "") : ""}">
        <span class="sev sev-${f.sev === "good" ? "beneficial" : f.sev}">${f.sev === "good" ? "Good" : f.sev === "info" ? "Tip" : f.sev}</span>
        <div><div class="check-title">${esc(f.title)}</div><p>${gloss(f.body)}</p>
        ${f.adds && f.adds.length ? `<div class="check-adds">${f.adds.map(id => `<button class="pill chip" data-act="add-supp" data-sid="${id}" data-stay="1">+ Add ${esc(byId[id].name)}</button>`).join("")}</div>` : ""}
        ${f.about ? `<div class="check-adds"><button class="pill chip" data-act="about-open">${esc(ABOUT_TEXT.open)} →</button></div>` : ""}
        ${f.move ? `<div class="check-adds"><button class="pill chip" data-act="move" data-item="${f.move.item}" data-time="${f.move.time}">Move to ${fmt12(f.move.time)}</button></div>` : ""}
        ${reviewing && needsReview(f) ? `<label class="review-tick"><input type="checkbox" data-review="${esc(revKey(f))}"${seen.has(revKey(f)) ? " checked" : ""}> ${esc(R.tick)}</label>` : ""}
        </div>
      </div>`).join("")}</div></div>`;
  });
  if (reviewing) html += approvePanel(F);
  el.innerHTML = html;
}

function itemInfo(s) {
  const where = MAP.filter(r => r[0] === s.id);
  const serious = s.ix.filter(x => x[1] === "major").map(x => x[0]);
  return `<div class="item-info">
    <p>${gloss(s.sum)}</p>
    ${where.length ? `<div class="where small">${where.map(([, nt, role]) => `<a href="#${nt}" data-go="${nt}" style="--wc:${ntColor(nt)}"><b>${esc(ntById[nt].name)}</b><span>${ROLE[role]}</span></a>`).join("")}</div>` : ""}
    <p><b>What it does:</b> ${s.fx.slice(0, 3).map(esc).join("; ")}.</p>
    ${serious.length ? `<p class="warn-line"><b>Don't combine with:</b> ${serious.map(gloss).join("; ")}.</p>` : ""}
    ${safetyHtml(s.id, true)}
    <a href="#${s.id}" data-go="${s.id}" class="more-link">Full details, dosing and interactions →</a>
  </div>`;
}

// Suggestions start folded behind one heading ("Suggestions · 4"), so nothing is pushed at people;
// opened, each is one compact row with its reason, dose range and an Add (or Swap) button.
function renderSuggest() {
  const el = document.getElementById("b-suggest");
  if (!el) return;
  if (stackBlocked(active())) { el.innerHTML = ""; return; }   // don't suggest adding more to a stack with a serious warning
  const P = BUILDER_TEXT.steps.add, list = suggest(active()), open = !!App.suggOpen;
  const label = o => {
    const f = listJoin(o.fors.map(id => byId[id].name));
    return o.kind === "swap" ? `Better than ${f}` : o.kind === "pair" ? `Pairs with ${f}` : o.kind === "cofactor" ? `Helps ${f}` : "Foundation";
  };
  const body = !list.length ? `<div class="empty small">${active().items.length ? "Nothing to add. This stack already covers its pairings and foundations." : "Add something to your stack and suggestions will show up here."}</div>`
    : `<p class="sec-intro">${esc(P.suggestionsIntro)}</p>
    <div class="sugg-list">${list.map(o => {
      const s = byId[o.sid];
      return `<div class="sugg-row">
        <div class="browse-main"><a href="#${s.id}" data-go="${s.id}" class="item-name">${esc(s.name)}</a><span class="sugg-kind kind-${o.kind}">${esc(label(o))}</span>${tierBadge(s)}
          <span class="browse-note">${[...new Set(o.reasons.map(([, r]) => r))].map(gloss).join(" ")}</span></div>
        <span class="sugg-dose">${range(s.dose[0], s.dose[1])} ${esc(s.dose[2])}</span>
        ${o.replace
          ? `<button class="btn small ghost" data-act="swap" data-from="${o.replace}" data-sid="${o.sid}">Swap in</button>`
          : `<button class="btn small ghost" data-act="sugg-add" data-sid="${o.sid}" data-time="${o.time}">${esc(P.suggestAdd)}</button>`}
      </div>`;
    }).join("")}</div>`;
  el.innerHTML = `<h3 class="sub-h"><button class="sugg-toggle" data-act="sugg-toggle" aria-expanded="${open}">
      <svg class="caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5 7 5 3 8.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      ${esc(P.suggestions)}${list.length ? `<span class="sugg-count">${list.length}</span>` : ""}</button></h3>
    ${open ? body : ""}`;
}

function refreshBuilder() { renderItems(); renderBrowse(); renderSuggest(); renderMeals(); renderTimeline(); renderChecks(); renderSave(); renderStepGate(); renderHistBtns(); renderAbout(); }

// Fold or unfold one step; unfolding scrolls it into view so it works as a jump.
function toggleStep(n, show) {
  const shown = builderExpanded(), li = document.getElementById("bs-" + BSTEPS[n - 1]);
  if (!li || li.classList.contains("locked")) return;
  show = show ?? !shown.has(n);
  show ? shown.add(n) : shown.delete(n); setExpanded(shown);
  li.classList.toggle("folded", !show);
  li.querySelector(".step-content").hidden = !show;
  li.querySelector(".step-toggle").setAttribute("aria-expanded", show);
  if (show && BSTEPS[n - 1] === "timeline") renderTimeline();
  const top = li.getBoundingClientRect().top;
  if (show || top < 0) li.scrollIntoView({ block: "start", behavior: "smooth" });
}

// One-line summaries shown under each heading while a step is folded.
function renderStepSummaries() {
  const st = active(), S = BUILDER_TEXT.fold, set = (k, t) => { const el = document.getElementById(`bs-${k}-sum`); if (el) el.textContent = t; };
  const items = st.items.filter(i => byId[i.sid]), F = analyze(st), meals = (st.meals || []).length;
  set("name", st.name);
  set("day", `${S.wake} ${fmt12(st.wake)} · ${S.bed} ${fmt12(st.bed)} · ${meals} ${meals === 1 ? S.meal : S.meals}`);
  const names = [...new Set(items.map(i => byId[i.sid].name))];
  set("add", items.length ? `${items.length} ${items.length === 1 ? S.supp : S.supps}: ${names.length > 3 ? names.slice(0, 3).join(", ") + ", …" : listJoin(names)}` : S.noSupps);
  const times = items.map(i => mins(i.time)).sort((a, b) => a - b);
  if (stackPaused(st)) set("timeline", LOAD_RULES.paused.summary); else set("timeline", times.length ? `${S.doses} ${fmt12(hhmm(times[0]))} – ${fmt12(hhmm(times[times.length - 1]))}` : S.noSupps);
  const n = sev => F.filter(f => f.sev === sev).length;
  set("check", [[n("critical"), "critical"], [n("major"), S.serious], [n("moderate"), S.review], [n("minor"), S.minor]].filter(x => x[0]).map(([k, l]) => `${k} ${l}`).join(" · ") || S.noIssues);
  set("save", st.savedAt ? S.saved : st.wasSaved ? S.changed : S.notSaved);
}

const LOCK_ICON = `<svg class="lock-ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;

// Step 3's "Next" waits until the stack has at least one supplement.
function renderStepGate() {
  const btn = document.getElementById("step-next");
  if (!btn) return;
  const blocked = builderOpen() === 3 && !active().items.some(i => byId[i.sid]);
  btn.disabled = blocked;
  document.getElementById("step-next-hint").textContent = blocked ? BUILDER_TEXT.gate.needItem : "";
}

// Opens the next step (or all of them), redraws, and in tour mode plays the new step's part of the tour.
let builderTouring = false;
function openSteps(n, opts = {}) {
  const shown = n === 1 ? new Set() : builderExpanded();
  if (n === 6 && opts.scrollTo === 0) [1, 2, 3, 4, 5].forEach(k => shown.add(k));   // Skip the tour: everything open
  else shown.delete(n - 1);   // Next: fold the step just finished
  shown.add(n); setExpanded(shown);
  lsSet("nsa-builderOpen", n);
  render("stack", true);
  const el = document.getElementById("bs-" + BSTEPS[(opts.scrollTo || n) - 1]);
  if (opts.scrollTo !== 0 && el) el.scrollIntoView({ block: "start", behavior: builderTouring ? "auto" : "smooth" });
  if (builderTouring && el) startTour("page", { within: el, onSkip: skipTour });
}
window.addEventListener("hashchange", () => { builderTouring = false; });
function skipTour() {
  builderTouring = false; tourEnd(); lsSet("nsa-tourSeen", true);
  openSteps(6, { scrollTo: 0 });
}

// Step 6: saving needs at least one supplement, and an explicit "I've read the warnings" when the check found serious or to-review items.
function renderSave() {
  const el = document.getElementById("b-save");
  if (!el) return;
  renderStepSummaries();
  const st = active(), P = BUILDER_TEXT.steps.save, F = analyze(st);
  const serious = F.filter(isStop).length, review = F.filter(f => f.sev === "moderate").length;
  const needsAck = serious + review > 0, n = st.items.filter(i => byId[i.sid]).length;
  const summary = [`${n} supplement${n === 1 ? "" : "s"}`, serious ? `${serious} serious` : "", review ? `${review} to review` : ""].filter(Boolean).join(" · ");
  const when = st.savedAt ? new Date(st.savedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  el.innerHTML = `<div class="save-box${st.savedAt ? " is-saved" : ""}">
    <div class="save-sum"><b>${esc(st.name)}</b><span>${esc(summary)}</span></div>
    ${st.savedAt ? `<p class="save-ok">✓ ${esc(P.saved)} ${esc(when)}. <a href="#track" data-go="track">${esc(P.openTracker)}</a></p>`
      : st.wasSaved ? `<p class="save-changed">${esc(P.changed)}</p>` : ""}
    ${!st.savedAt ? (n ? `
      ${needsAck ? `<label class="save-ack"><input type="checkbox" id="save-ack"> ${esc(P.ack)}</label>` : ""}
      <p class="hint">${esc(P.reminder)}</p>
      <div><button class="btn" id="save-btn" data-act="save-stack"${needsAck ? " disabled" : ""}>${esc(P.button)}</button></div>`
      : `<p class="hint">${esc(P.empty)}</p>`) : ""}
  </div>`;
}
let tlFrame = 0;
const scheduleTimeline = () => { if (!tlFrame) tlFrame = requestAnimationFrame(() => { tlFrame = 0; renderTimeline(); }); };
let lastOpt = null; // { stackId, times: {itemId: time} } for undo

function renderAddResults(q) {
  const el = document.getElementById("add-results");
  if (!el) return;
  q = q.trim().toLowerCase();
  if (!q) { el.innerHTML = ""; return; }
  const hits = S.filter(s => s.name.toLowerCase().includes(q) || s.aka.some(a => a.toLowerCase().includes(q)) || s.id.includes(q)).slice(0, 8);
  el.innerHTML = hits.length ? hits.map(s => {
    const nt = primaryNT(s.id), has = active().items.some(i => i.sid === s.id);
    return `<button class="result${has ? " has" : ""}" data-act="${has ? "in-stack" : "add-supp"}" data-sid="${s.id}" data-stay="1"${has ? ' aria-haspopup="menu"' : ""}>
      <span class="item-name">${esc(s.name)}</span>${tierBadge(s)}${has ? `<span class="result-has">✓ ${esc(BUILDER_TEXT.steps.add.added)} ▾</span>` : ""}
      <span class="item-meta">${nt ? esc(ntById[nt].name) + " · " : ""}${range(s.dose[0], s.dose[1])} ${esc(s.dose[2])}</span>
      <span class="result-sum">${esc(s.sum)}</span>
    </button>`;
  }).join("") : `<div class="empty small">No match. Try the ingredient name instead of a brand (“vitamin D”, “fish oil”). Multivitamins aren't supported yet, so add their key ingredients one by one.</div>`;
}

