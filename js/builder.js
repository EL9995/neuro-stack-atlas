// ---------------------------------------------------------------------------
// VIEWS: STACK BUILDER
// ---------------------------------------------------------------------------
// Five numbered steps: name, day, add, timeline, check. Wording in content/stack-builder.js.
function viewBuilder() {
  const st = active(), T = BUILDER_TEXT, P = T.steps;
  const step = (n, id, heading, body) => `
      <li class="pr-step bstep" id="${id}">
        <span class="pr-num" aria-hidden="true">${n}</span>
        <div class="pr-body">
          <h2 class="pr-h">${esc(heading)}</h2>
          ${body}
        </div>
      </li>`;
  const seenTour = lsGet("nsa-tourSeen", false);
  return `<div class="stack">
    <div class="page-head">
      <span class="eyebrow">${esc(T.eyebrow)}</span>
      <h1>${esc(T.title)}</h1>
      <p class="lede">${esc(T.lede)}</p>
      ${seenTour ? `<div><button class="btn ghost" data-act="tour" data-tour="page">${esc(T.tourButton)}</button></div>`
        : `<div class="tour-prompt"><span>${esc(T.tourPrompt)}</span><button class="btn" data-act="tour" data-tour="page">${esc(T.tourButton)}</button><button class="linkish" data-act="tour-dismiss">${esc(T.dismiss)}</button></div>`}
    </div>

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
          <div><button class="linkish tour-link" id="tour-meals" data-act="tour" data-tour="meals">${esc(P.day.mealsTour)} →</button></div>`)}
      ${step(3, "bs-add", P.add.heading, `
          <p class="pr-intro">${esc(P.add.intro)}</p>
          <div class="adder big">
            <label for="add-q" class="sr">${esc(P.add.searchLabel)}</label>
            <input id="add-q" type="search" placeholder="${esc(P.add.searchPlaceholder)}" autocomplete="off">
            <div id="add-results" class="results"></div>
          </div>
          <div class="browse" id="bs-browse">
            <span class="eyebrow">${esc(P.add.browseLabel)}</span>
            <div class="browse-tabs" role="tablist">${NTS.map(n => `<button class="browse-tab" role="tab" data-act="browse-nt" data-nt="${n.id}" style="--hue:${ntColor(n.id)}" aria-selected="${App.browseNT === n.id}"><b>${esc(n.word)}</b><span>${esc(n.name)}</span></button>`).join("")}</div>
            <div id="b-browse"></div>
          </div>
          <div class="templates" id="bs-templates">
            <span class="eyebrow">${esc(P.add.templatesLabel)}</span>
            ${TEMPLATES.map((t, i) => `<button class="pill chip" data-act="tpl" data-i="${i}">+ ${esc(t.name)}</button>`).join("")}
          </div>
          <h3 class="sub-h">${esc(P.add.inStack)}</h3>
          <div id="b-items"></div>
          <h3 class="sub-h">${esc(P.add.suggestions)}</h3>
          <p class="sec-intro">${esc(P.add.suggestionsIntro)}</p>
          <div id="b-suggest"></div>`)}
      ${step(4, "bs-timeline", P.timeline.heading, `
          <div class="tl-bar-row">
            <p class="sec-intro"><b>Drag any bar or meal to move it</b> (arrow keys work too). Light = kicking in, solid = working, fade = wearing off, dashed = builds over weeks. Faded bars mean food is cutting absorption. The red line is the current time.</p>
            <button class="btn" data-act="optimize">Optimize timing</button>
          </div>
          <div id="b-opt"></div>
          <div id="b-timeline"></div>`)}
      ${step(5, "bs-check", P.check.heading, `
          <p class="pr-intro">${esc(P.check.intro)}</p>
          <div id="b-checks"></div>`)}
    </ol>
  </div>`;
}

// Browse by neurotransmitter: its supplements in three groups, strongest evidence first, one tap to add.
function renderBrowse() {
  const el = document.getElementById("b-browse");
  if (!el) return;
  const nt = ntById[App.browseNT], P = BUILDER_TEXT.steps.add;
  document.querySelectorAll(".browse-tab").forEach(t => t.setAttribute("aria-selected", String(t.dataset.nt === App.browseNT)));
  if (!nt) { el.innerHTML = `<p class="hint">${esc(P.browseHint)}</p>`; return; }
  const rows = MAP.filter(r => r[1] === nt.id), inStack = new Set(active().items.map(i => i.sid));
  const groups = [["Precursors", r => r[2] === "precursor"], ["Cofactors", r => r[2] === "cofactor"], ["Modulators", r => r[2] !== "precursor" && r[2] !== "cofactor"]];
  el.innerHTML = `<div class="browse-groups" style="--nt:${ntColor(nt.id)}">${groups.map(([title, test]) => {
    const items = rows.filter(test).sort((a, b) => EV[b[3]] - EV[a[3]]);
    if (!items.length) return "";
    return `<div class="browse-group"><h4>${title}</h4>${items.map(([sid, , role, ev, note]) => {
      const s = byId[sid], has = inStack.has(sid);
      return `<div class="browse-item${has ? " has" : ""}">
        <div class="browse-main"><span class="item-name">${esc(s.name)}</span>${title === "Modulators" ? `<span class="role">${ROLE[role]}</span>` : ""}${tierBadge(s)}${ixBadge(s)}
          <span class="browse-note">${esc(note)}</span></div>
        <span class="browse-ev" title="${ev} evidence">${evDots(ev)}</span>
        <button class="btn small${has ? " ghost" : ""}" data-act="add-supp" data-sid="${sid}" data-stay="1" aria-label="Add ${esc(s.name)}">${has ? `✓ ${esc(P.added)}` : esc(P.add)}</button>
      </div>`;
    }).join("")}</div>`;
  }).join("")}</div>`;
}

function renderItems() {
  const el = document.getElementById("b-items");
  if (!el) return;
  const items = [...active().items].sort((a, b) => mins(a.time) - mins(b.time));
  el.innerHTML = items.length ? `<div class="items">${items.map(i => {
    const s = byId[i.sid];
    if (!s) return "";
    const ab = absorb(i, active());
    return `<div class="item" style="--nt:${primaryNT(i.sid) ? ntColor(primaryNT(i.sid)) : "var(--muted)"}">
      <input class="time-in" type="time" value="${esc(i.time)}" data-item="${i.id}" aria-label="Time for ${esc(s.name)}">
      <div class="item-main">
        <a href="#${s.id}" data-go="${s.id}" class="item-name">${esc(s.name)}</a>${tierBadge(s)}
        ${ab.label ? `<span class="ab ab-${ab.level}">${ab.level === "good" ? "✓ " : ab.level === "warn" || ab.level === "bad" ? "! " : ""}${esc(ab.label)}</span>` : ""}
        <span class="item-meta">${FOOD[s.food]} · typical ${range(s.dose[0], s.dose[1])} ${esc(s.dose[2])} ·
          <button class="linkish" data-act="info" data-sid="${s.id}" aria-expanded="${App.openInfo.has(s.id)}">${App.openInfo.has(s.id) ? "Hide info" : "What is this?"}</button></span>
      </div>
      <div class="dose">
        <input class="dose-in" type="number" min="0" step="any" value="${i.dose}" data-item="${i.id}" aria-label="Dose of ${esc(s.name)}">
        <span>${esc(s.dose[2])}</span>
      </div>
      <button class="x" data-act="remove" data-item="${i.id}" aria-label="Remove ${esc(s.name)}">×</button>
      ${App.openInfo.has(s.id) ? itemInfo(s) : ""}
    </div>`;
  }).join("")}</div>` : `<div class="empty">Nothing here yet. Search, browse or pick a template above.</div>`;
}

const TL_START = 5 * 60, TL_END = 25 * 60, TL_SPAN = TL_END - TL_START;
const pct = m => Math.max(0, Math.min(100, (m - TL_START) / TL_SPAN * 100));

function renderTimeline() {
  const el = document.getElementById("b-timeline");
  if (!el) return;
  const st = active();
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

  const rows = items.map(i => {
    const s = byId[i.sid], t = mins(i.time), nt = primaryNT(i.sid), ab = absorb(i, st);
    const color = nt ? ntColor(nt) : "var(--muted)";
    const strength = Math.max(0.3, Math.min(1, ab.factor)).toFixed(2);
    let bars;
    if (s.onset[0] == null) {
      bars = `<span class="tl-steady" style="--bc:${color};opacity:${strength}"></span>`;
      addCov(i.sid, TL_START, TL_END, 0.3 * ab.factor);
    } else {
      const on = (s.onset[0] + s.onset[1]) / 2 + ab.delay, durAvg = (s.dur[0] + s.dur[1]) / 2 * 60, durMax = s.dur[1] * 60;
      const a = t, b = t + on, c = t + on + durAvg, d = t + s.onset[1] + ab.delay + durMax;
      bars = `<span class="tl-ramp" style="left:${pct(a)}%;width:${pct(b) - pct(a)}%;--bc:${color};opacity:${strength}"></span>
        <span class="tl-bar" style="left:${pct(b)}%;width:${Math.max(0.6, pct(c) - pct(b))}%;--bc:${color};opacity:${strength}"></span>
        ${d > c ? `<span class="tl-tail" style="left:${pct(c)}%;width:${pct(d) - pct(c)}%;--bc:${color};opacity:${strength}"></span>` : ""}`;
      addCov(i.sid, b, c, ab.factor);
    }
    const flag = ab.level === "warn" || ab.level === "bad" ? `<em class="ab-${ab.level}">${esc(ab.label)}</em>` : "";
    return `<div class="tl-row"><span class="tl-label">${esc(s.name)}<small>${num(+i.dose || 0)} ${esc(s.dose[2])} · ${fmt12(i.time)}</small>${flag}</span>
      <div class="tl-track drag" data-drag="item:${i.id}" tabindex="0" role="slider" aria-label="${esc(s.name)} dose time" aria-valuetext="${fmt12(i.time)}">${backdrop}${bars}<span class="tl-dose" style="left:${pct(t)}%"></span></div></div>`;
  }).join("");

  const lanes = NTS.filter(n => cov[n.id] && cov[n.id].some(v => v > 0)).map(n => {
    const arr = cov[n.id];
    let spans = "", k = 0;
    while (k < slots) {
      const v = arr[k];
      let j = k; while (j < slots && arr[j] === v) j++;
      if (v > 0) spans += `<span class="tl-heat" style="left:${k / slots * 100}%;width:${(j - k) / slots * 100}%;opacity:${(0.15 + 0.85 * Math.min(1, v / 2)).toFixed(2)}"></span>`;
      k = j;
    }
    return `<div class="tl-row lane" style="--nt:${ntColor(n.id)}"><span class="tl-label"><b>${esc(n.name)}</b></span><div class="tl-track">${backdrop}${spans}</div></div>`;
  }).join("");

  el.innerHTML = `<div class="tl">
    <div class="tl-row axis"><span class="tl-label"></span><div class="tl-axis">${ticks.join("")}${nowM >= TL_START && nowM <= TL_END
      ? `<span class="tl-nowtag" style="left:${pct(nowM)}%">Now · ${fmt12(hhmm(nowM))}</span>` : ""}</div></div>
    ${mealRow}
    ${rows || `<div class="empty small">Add supplements to see them on the timeline.</div>`}
    ${lanes ? `<div class="tl-divider"><span class="eyebrow">Pathway coverage</span></div>${lanes}
    <p class="tl-caption">Darker means more of your stack is acting on that pathway at that hour, adjusted roughly for food. It's a map of your schedule, not a measurement of brain chemistry.</p>` : ""}
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

function renderChecks() {
  const el = document.getElementById("b-checks");
  if (!el) return;
  const F = analyze(active());
  if (!F.length) { el.innerHTML = `<div class="empty">Add supplements to see conflicts, timing tips and missing cofactors.</div>`; return; }
  const count = sev => F.filter(f => f.sev === sev).length;
  const sum = [
    [count("major"), "serious", "major"], [count("moderate"), "to review", "moderate"], [count("minor"), "minor", "minor"], [count("info"), "tips", "info"]
  ].filter(x => x[0]).map(([n, l, c]) => `<span class="sum-chip sev-${c}"><b>${n}</b> ${l}</span>`).join("");
  let html = sum ? `<div class="sum-row">${sum}</div>` : "";
  CHECK_CATS.forEach(cat => {
    const list = F.filter(f => f.cat === cat);
    if (!list.length) return;
    html += `<div class="check-group"><h3>${cat}</h3><div class="checks">${list.map(f => `
      <div class="check sevline-${f.sev}">
        <span class="sev sev-${f.sev === "good" ? "beneficial" : f.sev}">${f.sev === "good" ? "Good" : f.sev === "info" ? "Tip" : f.sev}</span>
        <div><div class="check-title">${esc(f.title)}</div><p>${gloss(f.body)}</p>
        ${f.adds && f.adds.length ? `<div class="check-adds">${f.adds.map(id => `<button class="pill chip" data-act="add-supp" data-sid="${id}" data-stay="1">+ Add ${esc(byId[id].name)}</button>`).join("")}</div>` : ""}
        ${f.move ? `<div class="check-adds"><button class="pill chip" data-act="move" data-item="${f.move.item}" data-time="${f.move.time}">Move to ${fmt12(f.move.time)}</button></div>` : ""}
        </div>
      </div>`).join("")}</div></div>`;
  });
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
    <a href="#${s.id}" data-go="${s.id}" class="more-link">Full details, dosing and interactions →</a>
  </div>`;
}

function renderSuggest() {
  const el = document.getElementById("b-suggest");
  if (!el) return;
  const list = suggest(active());
  if (!list.length) { el.innerHTML = `<div class="empty">${active().items.length ? "Nothing to add. This stack already covers its pairings and foundations." : "Add something to your stack and suggestions will show up here."}</div>`; return; }
  const shown = App.showAllSugg ? list : list.slice(0, 4);
  const label = o => {
    const f = listJoin(o.fors.map(id => byId[id].name));
    return o.kind === "swap" ? `Better than ${f}` : o.kind === "pair" ? `Pairs with ${f}` : o.kind === "cofactor" ? `Helps ${f}` : "Foundation";
  };
  el.innerHTML = `<div class="sugg-grid">${shown.map(o => {
    const s = byId[o.sid], time = o.time;
    return `<div class="sugg">
      <div class="sugg-top"><span class="sugg-kind kind-${o.kind}">${esc(label(o))}</span>${tierBadge(s)}</div>
      <a href="#${s.id}" data-go="${s.id}" class="item-name">${esc(s.name)}</a>
      <p>${o.reasons.map(([, r]) => gloss(r)).join(" ")}</p>
      <div class="sugg-act">
        ${o.replace
          ? `<button class="btn" data-act="swap" data-from="${o.replace}" data-sid="${o.sid}">Swap in ${esc(s.name)}</button>`
          : `<button class="btn" data-act="sugg-add" data-sid="${o.sid}" data-time="${time}">Add at ${fmt12(time)}</button>`}
        <span class="hint">${range(s.dose[0], s.dose[1])} ${esc(s.dose[2])}</span>
      </div>
    </div>`;
  }).join("")}</div>
  ${list.length > 4 ? `<button class="linkish" data-act="more-sugg">${App.showAllSugg ? "Show fewer" : `Show ${list.length - 4} more`}</button>` : ""}`;
}

function refreshBuilder() { renderItems(); renderBrowse(); renderSuggest(); renderMeals(); renderTimeline(); renderChecks(); }

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
    const nt = primaryNT(s.id);
    return `<button class="result" data-act="add-supp" data-sid="${s.id}" data-stay="1">
      <span class="item-name">${esc(s.name)}</span>${tierBadge(s)}
      <span class="item-meta">${nt ? esc(ntById[nt].name) + " · " : ""}${range(s.dose[0], s.dose[1])} ${esc(s.dose[2])}</span>
      <span class="result-sum">${esc(s.sum)}</span>
    </button>`;
  }).join("") : `<div class="empty small">No match. Try the ingredient name instead of a brand (“vitamin D”, “fish oil”). Multivitamins aren't supported yet, so add their key ingredients one by one.</div>`;
}

