// ---------------------------------------------------------------------------
// EVENTS
// ---------------------------------------------------------------------------
function addToStack(sid, stay) {
  const st = active(), s = byId[sid];
  st.items.push({ id: newId(), sid, dose: s.dose[0], time: placeFor(sid, st) });
  touch(st);
  if (current === "stack") {
    const q = document.getElementById("add-q"); if (q) { q.value = ""; renderAddResults(""); }
    refreshBuilder();
    toast(`Added ${esc(s.name)}.`);
  } else {
    render(current, true);
    toast(`Added ${esc(s.name)} to “${esc(st.name)}”. <button data-go="stack">Open stack builder</button>`);
  }
}

document.addEventListener("click", e => {
  if (!e.target.closest("#search-wrap")) hideSearch();
  const g = e.target.closest("[data-go]");
  if (g) {
    e.preventDefault();
    if (g.closest("#q-results")) { document.getElementById("q").value = ""; document.getElementById("q").blur(); }
    go(g.dataset.go); return;
  }
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act, st = active();
  if (act === "toggle-deep") { App.showDeep = !App.showDeep; lsSet("nsa-showDeep", App.showDeep); render(current, true); }
  else if (act === "add-supp") addToStack(el.dataset.sid, el.dataset.stay);
  else if (act === "sup-tab") {
    const i = el.dataset.i, tab = document.getElementById("sup-tab-" + i), open = tab.getAttribute("aria-selected") !== "true";
    document.querySelectorAll(".sup-tab").forEach(t => t.setAttribute("aria-selected", String(open && t === tab)));
    document.querySelectorAll(".sup-panel").forEach(p => { p.hidden = !(open && p.id === "sup-panel-" + i); });
    if (!open || el.classList.contains("sup-less")) tab.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  else if (act === "remove") { st.items = st.items.filter(i => i.id !== el.dataset.item); touch(st); refreshBuilder(); }
  else if (act === "tpl") {
    const t = TEMPLATES[+el.dataset.i];
    const ns = makeStack(t.name, t.items);
    App.stacks.push(ns); App.activeId = ns.id; saveState();
    if (current === "stack") render("stack", true); else go("stack");   // from the home page: also update the address
    toast(`Created “${esc(t.name)}”.`);
  }
  else if (act === "new-stack") {
    const ns = makeStack(`Stack ${App.stacks.length + 1}`, []);
    App.stacks.push(ns); App.activeId = ns.id; saveState(); render("stack", true);
    document.getElementById("stack-name")?.select();
  }
  else if (act === "del-stack") {
    if (!App.confirmDelete) { App.confirmDelete = true; el.textContent = "Confirm delete"; el.classList.replace("ghost", "danger"); return; }
    App.stacks = App.stacks.filter(s => s.id !== st.id);
    if (!App.stacks.length) App.stacks.push(makeStack("Stack 1", []));
    App.activeId = App.stacks[0].id; saveState(); render("stack", true);
    toast(`Deleted “${esc(st.name)}”.`);
  }
  else if (act === "info") { const id = el.dataset.sid; App.openInfo.has(id) ? App.openInfo.delete(id) : App.openInfo.add(id); renderItems(); }
  else if (act === "more-sugg") { App.showAllSugg = !App.showAllSugg; renderSuggest(); }
  else if (act === "sugg-add") {
    const s = byId[el.dataset.sid];
    st.items.push({ id: newId(), sid: s.id, dose: s.dose[0], time: el.dataset.time });
    touch(st); refreshBuilder(); toast(`Added ${esc(s.name)} at ${fmt12(el.dataset.time)}.`);
  }
  else if (act === "swap") {
    const to = byId[el.dataset.sid];
    st.items.forEach(i => { if (i.sid === el.dataset.from) { i.sid = to.id; i.dose = to.dose[0]; } });
    touch(st); refreshBuilder(); toast(`Swapped in ${esc(to.name)}.`);
  }
  else if (act === "optimize") {
    const res = optimize(st);
    lastOpt = { stackId: st.id, times: Object.fromEntries(st.items.map(i => [i.id, i.time])) };
    res.changes.forEach(c => { const i = st.items.find(x => x.id === c.id); if (i) i.time = c.to; });
    if (res.changes.length) touch(st);
    refreshBuilder(); renderOpt(res);
  }
  else if (act === "undo-opt") {
    if (lastOpt && lastOpt.stackId === st.id) { st.items.forEach(i => { if (lastOpt.times[i.id]) i.time = lastOpt.times[i.id]; }); touch(st); }
    lastOpt = null; refreshBuilder(); renderOpt(null); toast("Restored your previous times.");
  }
  else if (act === "move") {
    const i = st.items.find(x => x.id === el.dataset.item);
    if (i) { i.time = el.dataset.time; touch(st); refreshBuilder(); toast(`Moved ${esc(byId[i.sid].name)} to ${fmt12(i.time)}.`); }
  }
  else if (act === "meal-flag") {
    const m = st.meals.find(x => x.id === el.dataset.meal);
    if (m) { m[el.dataset.flag] = !m[el.dataset.flag]; touch(st); el.setAttribute("aria-pressed", String(m[el.dataset.flag])); renderItems(); renderTimeline(); renderChecks(); }
  }
  else if (act === "meal-remove") { st.meals = st.meals.filter(x => x.id !== el.dataset.meal); touch(st); refreshBuilder(); }
  else if (act === "meal-add") {
    const snack = el.dataset.kind === "snack";
    st.meals.push({ id: newId(), label: snack ? "Snack" : "Meal", time: snack ? "15:30" : "17:00", protein: !snack, fat: !snack, carbs: true });
    touch(st); refreshBuilder();
  }
  else if (act === "day") {
    const d = +el.dataset.d;
    App.trackDate = d === 0 ? todayKey() : addDays(App.trackDate, d);
    if (App.trackDate > todayKey()) App.trackDate = todayKey();
    render("track", true);
  }
  else if (act === "go-day") { App.trackDate = el.dataset.date; render("track", true); }
  else if (act === "rate") {
    const day = ensureDay(App.trackDate), m = el.dataset.m, v = +el.dataset.v;
    if (day.r[m] === v) delete day.r[m]; else day.r[m] = v;
    el.parentElement.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === day.r[m])));
    saveDay(App.trackDate); renderHistory();
  }
});

document.addEventListener("change", e => {
  const t = e.target, st = active();
  if (t.id === "stack-select" || t.id === "t-stack") { App.activeId = t.value; saveState(); render(current, true); }
  else if (t.id === "stack-name") { st.name = t.value.trim() || "Untitled stack"; touch(st); const o = document.querySelector(`#stack-select option[value="${st.id}"]`); if (o) o.textContent = st.name; }
  else if (t.classList.contains("dose-in")) { const i = st.items.find(x => x.id === t.dataset.item); if (i) { i.dose = Math.max(0, +t.value || 0); touch(st); renderTimeline(); renderChecks(); renderSuggest(); } }
  else if (t.classList.contains("time-in")) { const i = st.items.find(x => x.id === t.dataset.item); if (i && t.value) { i.time = t.value; touch(st); renderTimeline(); renderChecks(); renderSuggest(); } }
  else if (t.id === "wake" || t.id === "bed") { if (t.value) { st[t.id] = t.value; touch(st); renderTimeline(); renderChecks(); renderSuggest(); } }
  else if (t.classList.contains("meal-time")) { const m = st.meals.find(x => x.id === t.dataset.meal); if (m && t.value) { m.time = t.value; touch(st); renderItems(); renderSuggest(); renderTimeline(); renderChecks(); } }
  else if (t.classList.contains("meal-label")) { const m = st.meals.find(x => x.id === t.dataset.meal); if (m) { m.label = t.value.trim() || "Meal"; touch(st); renderItems(); renderSuggest(); renderTimeline(); renderChecks(); } }
  else if (t.dataset.act === "take") {
    const day = ensureDay(App.trackDate), item = st.items.find(x => x.id === t.dataset.item);
    if (!item) return;
    if (t.checked) { const n = new Date(); day.taken[item.id] = { sid: item.sid, dose: item.dose, unit: byId[item.sid].dose[2], time: item.time, at: `${pad(n.getHours())}:${pad(n.getMinutes())}` }; }
    else delete day.taken[item.id];
    t.closest(".tick").classList.toggle("done", t.checked);
    const items = st.items.filter(i => byId[i.sid]);
    const hint = document.querySelector("#t-day .panel-head .hint"); if (hint) hint.textContent = `${items.filter(i => day.taken[i.id]).length} of ${items.length} taken`;
    saveDay(App.trackDate); renderHistory();
  }
});

document.addEventListener("input", e => {
  const t = e.target;
  if (t.id === "add-q") renderAddResults(t.value);
  else if (t.id === "q") renderSearch(t.value);
  else if (t.id === "t-note") { ensureDay(App.trackDate).note = t.value; saveDay(App.trackDate); }
});
// Drag doses and meals along the timeline (15-minute snap). Listeners live on
// window so the timeline can re-render underneath an active drag.
let drag = null;
const dragTarget = key => { const [kind, id] = key.split(":"), st = active(); return kind === "meal" ? (st.meals || []).find(m => m.id === id) : st.items.find(i => i.id === id); };
const clampT = m => Math.max(TL_START, Math.min(24 * 60 - 15, Math.round(m / 15) * 15));
document.addEventListener("pointerdown", e => {
  const el = e.target.closest("[data-drag]");
  if (!el || e.button !== 0) return;
  const obj = dragTarget(el.dataset.drag), track = el.closest(".tl-track");
  if (!obj || !track) return;
  const order = [...active().items].sort((a, b) => mins(a.time) - mins(b.time)).map(i => i.id);
  drag = { key: el.dataset.drag, obj, x0: e.clientX, m0: mins(obj.time), w: track.getBoundingClientRect().width, moved: false, order };
});
window.addEventListener("pointermove", e => {
  if (!drag) return;
  const dx = e.clientX - drag.x0;
  if (!drag.moved && Math.abs(dx) < 4) return;
  if (!drag.moved) { drag.moved = true; document.body.classList.add("dragging"); hideTip(); }
  e.preventDefault();
  const t = hhmm(clampT(drag.m0 + dx / drag.w * TL_SPAN));
  if (t !== drag.obj.time) { drag.obj.time = t; scheduleTimeline(); }
});
const endDrag = () => {
  if (!drag) return;
  const d = drag; drag = null;
  document.body.classList.remove("dragging");
  if (d.moved) { touch(active()); renderOpt(null); refreshBuilder(); }
};
window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);

document.addEventListener("keydown", e => {
  if (e.target.id === "add-q" && e.key === "Enter") { const first = document.querySelector("#add-results .result"); if (first) first.click(); return; }
  if (e.target.id === "q") {
    if (e.key === "Enter") { e.preventDefault(); const first = document.querySelector("#q-results .result"); if (first) first.click(); }
    else if (e.key === "Escape") { e.target.value = ""; hideSearch(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); document.querySelector("#q-results .result")?.focus(); }
    return;
  }
  if (e.target.closest && e.target.closest("#q-results") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    e.preventDefault();
    const el = e.target.closest(".result"), sib = e.key === "ArrowDown" ? el?.nextElementSibling : el?.previousElementSibling;
    (sib || (e.key === "ArrowUp" ? document.getElementById("q") : null))?.focus();
    return;
  }
  const el = e.target.closest && e.target.closest("[data-drag]");
  if (el && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    e.preventDefault();
    const key = el.dataset.drag, obj = dragTarget(key);
    if (!obj) return;
    obj.time = hhmm(clampT(mins(obj.time) + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 60 : 15)));
    touch(active()); refreshBuilder();
    document.querySelector(`[data-drag="${key}"]`)?.focus();
  }
});
function renderHSearch(q) {
  const box = document.getElementById("hq-results"); if (!box) return;
  if (!q.trim()) { box.hidden = true; box.innerHTML = ""; return; }
  const hits = searchAll(q);
  box.innerHTML = hits.length ? hits.map(h => h.kind === "nt"
    ? `<button class="hres" data-go="${h.id}"><b>${esc(ntById[h.id].name)}</b><span>${esc(ntById[h.id].word)}</span></button>`
    : `<button class="hres" data-go="${h.id}"><b>${esc(byId[h.id].name)}</b><span>${esc(CAT[byId[h.id].cat])}</span></button>`).join("")
    : `<div class="hempty">No match for \u201c${esc(q.trim())}\u201d. Try another name.</div>`;
  box.hidden = false;
}
document.addEventListener("input", e => { if (e.target.id === "hq") renderHSearch(e.target.value); });
document.addEventListener("keydown", e => {
  if (e.target.id === "hq" && e.key === "Enter") { const h = searchAll(e.target.value)[0]; if (h) go(h.id); }
  if (e.target.id === "hq" && e.key === "Escape") { const b = document.getElementById("hq-results"); if (b) b.hidden = true; }
});
document.addEventListener("click", e => {
  if (!e.target.closest("#hsearch")) { const b = document.getElementById("hq-results"); if (b) b.hidden = true; }
  const sc = e.target.closest("[data-scroll]");
  if (sc) { document.getElementById(sc.dataset.scroll)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }
});
document.getElementById("back").addEventListener("click", () => {
  const prev = NAVST.trail.pop();
  if (prev === undefined) return;
  NAVST.back = true; go(prev); NAVST.back = false;
});
function themeIsDark() { const r = document.documentElement; return r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
function syncTheme() { const b = document.getElementById("theme"); const d = themeIsDark(); b.textContent = d ? "Light" : "Dark"; b.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode"); }
document.getElementById("theme").addEventListener("click", () => { document.documentElement.dataset.theme = themeIsDark() ? "light" : "dark"; syncTheme(); });
syncTheme();
document.addEventListener("click", e => {
  const b = e.target.closest("[data-jr]");
  if (b) { jrClear(); jrSet(+b.dataset.jr); return; }
  if (e.target.closest("#jr-play")) { jrPlay(); return; }
  const c = e.target.closest("[data-cyc]");
  if (c) cycSet(c.dataset.cyc);
});
document.addEventListener("change", e => { if (e.target.id === "jr-nocof") { jrClear(); jrSet(Math.max(JR.n, 2)); } });
window.addEventListener("hashchange", () => render(decodeURIComponent(location.hash.slice(1))));

