// ---------------------------------------------------------------------------
// EVENTS
// ---------------------------------------------------------------------------
// Conflicts that adding this supplement would newly trigger or make worse: interactions and
// stack-load rules (content/recommendations.js) at "to review" or above.
function loadCrossings(st, sid) {
  const before = analyze(st), after = analyze({ ...st, items: [...st.items, { id: "_probe", sid, dose: byId[sid].dose[0], time: placeFor(sid, st) }] });
  const key = f => f.rule || f.cat + ":" + f.title;
  const worst = (F, k) => Math.min(...F.filter(f => key(f) === k).map(f => SEV_ORDER[f.sev]), 99);
  return after.filter(f => (f.rule || f.cat === "Interactions") && SEV_ORDER[f.sev] <= SEV_ORDER.moderate && SEV_ORDER[f.sev] < worst(before, key(f)));
}

// anchor: the "+ Add" button that was pressed; the warning pops up next to it.
function addToStack(sid, stay, force, anchor) {
  const st = active(), s = byId[sid];
  const cross = force ? [] : loadCrossings(st, sid);
  if (cross.length && current === "stack") {   // ask first, right where they clicked
    App.pendingAdd = { sid, cross, stackId: st.id };
    showAddWarn(anchor); return;
  }
  closeAddWarn();
  st.items.push({ id: newId(), sid, dose: s.dose[0], time: placeFor(sid, st) });
  (App.itemsOpen || (App.itemsOpen = new Set())).add(laneOf(sid));   // show where it landed in "In this stack"
  touch(st);
  if (current === "stack") {
    const q = document.getElementById("add-q"); if (q) { q.value = ""; renderAddResults(""); }
    refreshBuilder();
    toast(`Added ${esc(s.name)}.`);
  } else {
    render(current, true);
    toast(`Added ${esc(s.name)} to “${esc(st.name)}”.${cross.length ? ` <b>! ${esc(cross[0].title)}</b>` : ""} <button data-go="stack">Open stack builder</button>`);
  }
}

// Dose edits, from typing or the +/- buttons.
function setDose(i, d) {
  i.dose = +d.toPrecision(6); touch(active());
  const inp = document.querySelector(`.dose-in[data-item="${i.id}"]`); if (inp) inp.value = i.dose;
  renderTimeline(); renderChecks(); renderSuggest();
}
// Dose monitor: going above the typical range (higher than anything already confirmed for this item)
// asks first, next to the dose box. The new dose only applies on "Keep".
function tryDose(i, d) {
  const max = byId[i.sid].dose[1];
  d = +Math.max(0, d).toPrecision(6);
  if (d > max && d > Math.max(max, i.okDose || 0) && d > (+i.dose || 0)) { showDoseWarn(i, d); return; }
  closeDoseWarn(); setDose(i, d);
}
// +/- jump to the next round step: 94 mg with a 25 mg step goes to 100 or 75.
function stepDose(id, dir) {
  const i = active().items.find(x => x.id === id); if (!i) return;
  const step = doseStep(byId[i.sid]), d = +i.dose || 0;
  tryDose(i, dir > 0 ? Math.floor(d / step + 1e-9) * step + step : Math.ceil(d / step - 1e-9) * step - step);
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
  else if (act === "add-supp") addToStack(el.dataset.sid, el.dataset.stay, false, el);
  else if (act === "in-stack") showInStackMenu(el, el.dataset.sid);
  else if (act === "instack-remove") {
    const sid = el.dataset.sid; closeAddWarn();
    st.items = st.items.filter(i => i.sid !== sid); touch(st); refreshBuilder();
    const q = document.getElementById("add-q"); if (q?.value) renderAddResults(q.value);
    toast(`${esc(BUILDER_TEXT.steps.add.removed.replace("{name}", byId[sid].name))} <button data-act="hist" data-dir="-1">${esc(BUILDER_TEXT.steps.add.undo)}</button>`);
  }
  else if (act === "instack-again") { const sid = el.dataset.sid; closeAddWarn(); addToStack(sid, true); }
  else if (act === "tour" && el.dataset.tour === "page") { builderTouring = true; lsSet("nsa-tourSeen", true); openSteps(1); }
  else if (act === "tour") startTour(el.dataset.tour);
  else if (act === "tour-skip") skipTour();
  else if (act === "tl-lane") { const o = App.tlOpen || (App.tlOpen = new Set()), l = el.dataset.lane; o.has(l) ? o.delete(l) : o.add(l); renderTimeline(); document.querySelector(`.tl-lane-btn[data-lane="${l}"]`)?.focus({ preventScroll: true }); }
  else if (act === "items-group") { const o = App.itemsOpen || (App.itemsOpen = new Set()), g = el.dataset.group; o.has(g) ? o.delete(g) : o.add(g); renderItems(); document.querySelector(`.group-head[data-group="${g}"]`)?.focus({ preventScroll: true }); }
  else if (act === "check-review") {
    App.checkReview = st.id; renderChecks();
    document.querySelector("#b-checks .check-group")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  else if (act === "approve-go") {
    const F = analyze(st);
    if (!document.getElementById("approve-ack")?.checked || !canApprove(F) || !F.filter(needsReview).every(f => reviewedSet(st).has(revKey(f)))) return;
    const at = new Date().toISOString();
    App.checkReview = null; st.approved = { at, keys: analyze(st).filter(isStop).map(stopKey) }; st.ack = { at, sig: ackSig(st) }; saveState(); refreshBuilder();   // approving the warnings also passes the final gate
  }
  else if (act === "approve-withdraw") { st.approved = null; st.ack = null; saveState(); refreshBuilder(); }
  else if (act === "ack-go") {
    if (!document.getElementById("ack-check")?.checked || stackPaused(st)) return;
    st.ack = { at: new Date().toISOString(), sig: ackSig(st) }; saveState(); refreshBuilder();
  }
  else if (act === "ack-withdraw") { st.ack = null; saveState(); refreshBuilder(); }
  else if (act === "trim-systems") {
    const plan = trimPlan(st); if (!plan.remove.length) return;
    App.undoTrim = { stackId: st.id, items: st.items.map(i => ({ ...i })) };
    st.items = st.items.filter(i => !plan.remove.includes(i.sid)); touch(st); refreshBuilder();
    toast(`${esc(LOAD_RULES.verdict.trimDone.replace("{names}", listJoin(plan.remove.map(id => byId[id].name))))} <button data-act="undo-trim">Undo</button>`);
  }
  else if (act === "undo-trim") {
    const u = App.undoTrim; if (!u || u.stackId !== st.id) return;
    st.items = u.items; App.undoTrim = null; touch(st); refreshBuilder();
  }
  else if (act === "addwarn-anyway") { const p = App.pendingAdd; if (p) addToStack(p.sid, true, true); }
  else if (act === "addwarn-swap") {
    const p = App.pendingAdd; if (!p) return;
    st.items = st.items.filter(i => i.sid !== el.dataset.from);
    addToStack(p.sid, true, true); toast(`Swapped ${esc(byId[el.dataset.from].name)} for ${esc(byId[p.sid].name)}.`);
  }
  else if (act === "addwarn-cancel") closeAddWarn();
  else if (act === "dosewarn") {
    const p = App.pendingDose, i = p && st.items.find(x => x.id === p.id); closeDoseWarn(); if (!i) return;
    if (el.dataset.choice === "keep") { i.okDose = p.dose; setDose(i, p.dose); }
    else if (el.dataset.choice === "max") setDose(i, byId[i.sid].dose[1]);
    else { const inp = document.querySelector(`.dose-in[data-item="${i.id}"]`); if (inp) { inp.value = i.dose; inp.focus(); inp.select(); } }
  }
  else if (act === "sim-play") { SIM.run = !SIM.run; el.textContent = SIM.run ? SIM_TEXT.pause : SIM_TEXT.play; }
  else if (act === "sim-show") simHighlight(el.dataset.ids.split(","));
  else if (act === "add-tab") setAddTab(el.dataset.addTab);
  // About you (localStorage only)
  else if (act === "timing-toggle") { App.timingOpen = App.timingOpen === false; renderTimeline(); }
  else if (act === "timing-all") { App.timingAll = !App.timingAll; renderTimeline(); }
  else if (act === "about-open") {
    toggleStep(0, true);
    setTimeout(() => document.getElementById("b-about")?.scrollIntoView({ block: "start", behavior: "smooth" }), 50);
  }
  else if (act === "about-toggle") {
    const a = aboutYou(), list = el.dataset.list, id = el.dataset.id, cur = new Set(a[list]);
    if (cur.has(id)) cur.delete(id);
    else if (id === "none" || id === "pnts") { cur.clear(); cur.add(id); if (list === "meds") a.names = []; }
    else { cur.delete("none"); cur.delete("pnts"); cur.add(id); }
    a[list] = [...cur]; saveAbout(a);
  }
  else if (act === "about-add") addAboutMed();
  else if (act === "about-remove") { const a = aboutYou(); a.names.splice(+el.dataset.k, 1); saveAbout(a); }
  else if (act === "items-all") { const show = el.dataset.show === "1"; App.itemsOpen = new Set(show ? [...NTS.map(n => n.id), "foundation"] : []); renderItems(); }
  else if (act === "lanes-all") { const show = el.dataset.show === "1"; App.tlOpen = new Set(show ? [...NTS.map(n => n.id), "foundation"] : []); renderTimeline(); }
  else if (act === "hist") histGo(+el.dataset.dir);
  else if (act === "stack-clear") {
    if (!st.items.length) return;
    const n = st.items.length; st.items = []; touch(st); closeAddWarn(); closeDoseWarn(); refreshBuilder();
    toast(`${esc(BUILDER_TEXT.steps.add.cleared.replace("{n}", n))} <button data-act="hist" data-dir="-1">${esc(BUILDER_TEXT.steps.add.undo)}</button>`);
  }
  else if (act === "dose-step") stepDose(el.dataset.item, +el.dataset.dir);
  else if (act === "step-toggle") toggleStep(+el.dataset.step, el.dataset.open ? true : undefined);
  else if (act === "steps-all") {
    const show = el.dataset.show === "1", all = [0, ...BSTEPS.map((_, k) => k + 1)].filter(n => n <= builderOpen());
    setExpanded(new Set(show ? all : [])); render("stack", true);
  }
  else if (act === "step-next") { if (!el.disabled) openSteps(builderOpen() + 1); }
  else if (act === "save-stack") {
    const ack = document.getElementById("save-ack");
    if (el.disabled || (ack && !ack.checked)) return;
    st.savedAt = new Date().toISOString(); st.wasSaved = false; saveState(); renderSave();
    toast(`Saved “${esc(st.name)}”. <button data-go="track">Open the Tracker</button>`);
  }
  else if (act === "browse-nt") { App.browseNT = App.browseNT === el.dataset.nt ? null : el.dataset.nt; renderBrowse(); }
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
  else if (act === "sugg-toggle") { App.suggOpen = !App.suggOpen; renderSuggest(); document.querySelector(".sugg-toggle")?.focus({ preventScroll: true }); }
  else if (act === "sugg-add") {
    const s = byId[el.dataset.sid];
    st.items.push({ id: newId(), sid: s.id, dose: s.dose[0], time: el.dataset.time });
    (App.itemsOpen || (App.itemsOpen = new Set())).add(laneOf(s.id));
    touch(st); refreshBuilder(); toast(`Added ${esc(s.name)} at ${fmt12(el.dataset.time)}.`);
  }
  else if (act === "swap") {
    const to = byId[el.dataset.sid];
    st.items.forEach(i => { if (i.sid === el.dataset.from) { i.sid = to.id; i.dose = to.dose[0]; } });
    touch(st); refreshBuilder(); toast(`Swapped in ${esc(to.name)}.`);
  }
  else if (act === "optimize") {
    if (stackPaused(st)) return;
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
  else if (act === "meal-remove") { st.meals = st.meals.filter(x => x.id !== el.dataset.meal); closeTlEditor(); touch(st); refreshBuilder(); }
  else if (act === "fast-add") {
    st.fasts = st.fasts || [];
    st.fasts.push(st.fasts.length ? { id: newId(), from: "13:00", to: "17:00" } : { id: newId(), from: "20:00", to: "12:00" });   // first one: an overnight 16:8 window
    touch(st); refreshBuilder();
  }
  else if (act === "fast-remove") { st.fasts = (st.fasts || []).filter(x => x.id !== el.dataset.fast); closeTlEditor(); touch(st); refreshBuilder(); }
  else if (act === "tl-edit-close") closeTlEditor();
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

document.addEventListener("change", e => { if (e.target.id === "approve-ack") { const b = document.getElementById("approve-go"); if (b) b.disabled = !e.target.checked; } });
document.addEventListener("change", e => { if (e.target.id === "ack-check") { const b = document.getElementById("ack-go"); if (b) b.disabled = !e.target.checked; } });
// "Reviewed" ticks in step 3: redraw so the approval panel's progress and lock update
document.addEventListener("change", e => {
  const k = e.target.dataset && e.target.dataset.review; if (k === undefined) return;
  const set = reviewedSet(active()); e.target.checked ? set.add(k) : set.delete(k);
  const y = scrollY; renderChecks(); scrollTo(0, y);
});
document.addEventListener("change", e => { if (e.target.id === "save-ack") { const b = document.getElementById("save-btn"); if (b) b.disabled = !e.target.checked; } });
document.addEventListener("change", e => {
  const t = e.target, st = active();
  if (t.id === "stack-select" || t.id === "t-stack" || t.id === "sim-stack") { App.activeId = t.value; saveState(); render(current, true); }
  else if (t.id === "stack-name") { st.name = t.value.trim() || "Untitled stack"; touch(st); const o = document.querySelector(`#stack-select option[value="${st.id}"]`); if (o) o.textContent = st.name; }
  else if (t.classList.contains("dose-in")) { const i = st.items.find(x => x.id === t.dataset.item); if (i) tryDose(i, +t.value || 0); }
  else if (t.id === "wake" || t.id === "bed") {
    const v = mins(t.value), ok = t.value && (t.id === "wake" ? v <= mins(st.bed) - 60 : v >= mins(st.wake) + 60);
    if (ok) { st[t.id] = t.value; touch(st); } renderTimeline(); renderChecks(); renderSuggest();   // an impossible time snaps back
  }
  else if (t.classList.contains("meal-time")) { const m = st.meals.find(x => x.id === t.dataset.meal); if (m && t.value) { m.time = t.value; touch(st); renderItems(); renderSuggest(); renderTimeline(); renderChecks(); } }
  else if (t.classList.contains("fast-time")) { const f = (st.fasts || []).find(x => x.id === t.dataset.fast); if (f && t.value) { f[t.dataset.end] = t.value; touch(st); renderTimeline(); renderChecks(); } }
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
// Everything draggable exposes a "time": doses, meals, the ends of the day (wake:/bed:) and fasts
// (fast:<id>:from|to stretch one end, fast:<id>:move slides the whole window).
const dragTarget = key => {
  const [kind, id, part] = key.split(":"), st = active();
  if (kind === "meal") return (st.meals || []).find(m => m.id === id);
  if (kind === "wake" || kind === "bed") return {
    get time() { return st[kind]; },
    set time(v) { const t = mins(v); if (kind === "wake" ? t <= mins(st.bed) - 60 : t >= mins(st.wake) + 60) st[kind] = v; },
  };
  if (kind === "fast") {
    const f = (st.fasts || []).find(x => x.id === id);
    if (!f) return null;
    if (part === "move") return {
      get time() { return f.from; },
      set time(v) { const d = mins(v) - mins(f.from); f.from = v; f.to = hhmm((mins(f.to) + d + 1440) % 1440); },
    };
    return { get time() { return f[part]; }, set time(v) { if (v !== (part === "from" ? f.to : f.from)) f[part] = v; } };
  }
  return st.items.find(i => i.id === id);
};
const editable = key => /^(meal|fast):/.test(key);
const clampT = m => Math.max(TL_START, Math.min(24 * 60 - 15, Math.round(m / 15) * 15));
document.addEventListener("pointerdown", e => {
  const el = e.target.closest("[data-drag]");
  if (!el || e.button !== 0) return;
  const obj = dragTarget(el.dataset.drag), track = el.closest(".tl-track");
  if (!obj || !track) return;
  const order = [...active().items].sort((a, b) => mins(a.time) - mins(b.time)).map(i => i.id);
  drag = { key: el.dataset.drag, obj, x0: e.clientX, m0: mins(obj.time), w: track.getBoundingClientRect().width, moved: false, order, el };
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
  else if (editable(d.key)) openTlEditor(d.key.replace(/:(from|to|move)$/, ""), d.el.closest(".tl-mealchip, .tl-fastblock") || d.el);   // a click (no drag) opens the editor
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
  if (e.target.classList && e.target.classList.contains("dose-in") && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
    e.preventDefault(); stepDose(e.target.dataset.item, e.key === "ArrowUp" ? 1 : -1); return;
  }
  if (e.key === "Escape" && document.getElementById("tl-editor")) { const k = document.getElementById("tl-editor").dataset.key; closeTlEditor(); document.querySelector(`[data-drag^="${k}"]`)?.focus(); return; }
  const el = e.target.closest && e.target.closest("[data-drag]");
  if (el && editable(el.dataset.drag) && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openTlEditor(el.dataset.drag.replace(/:(from|to|move)$/, ""), el); return; }
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


// Cmd/Ctrl+Z to undo, Shift+Cmd/Ctrl+Z (or Ctrl+Y) to redo, in the Stack builder when not typing in a field.
document.addEventListener("keydown", e => {
  if (current !== "stack" || !(e.metaKey || e.ctrlKey) || e.altKey) return;
  if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
  const k = e.key.toLowerCase();
  if (k === "z") { e.preventDefault(); histGo(e.shiftKey ? 1 : -1); }
  else if (k === "y") { e.preventDefault(); histGo(1); }
});

// About you: add a typed medicine name, filed under its class (or "other").
function addAboutMed() {
  const q = document.getElementById("about-q"); if (!q || !q.value.trim()) return;
  const name = q.value.trim(), cls = medClassFor(name), a = aboutYou();
  a.names.push({ name, cls }); a.meds = a.meds.filter(m => m !== "none" && m !== "pnts");
  App.aboutNote = cls === "other" ? ABOUT_TEXT.unknown.replace("{name}", name) : ABOUT_TEXT.matched.replace("{name}", name).replace("{cls}", medLabel(cls));
  saveAbout(a); document.getElementById("about-q")?.focus();
}
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.id === "about-q") { e.preventDefault(); addAboutMed(); } });
