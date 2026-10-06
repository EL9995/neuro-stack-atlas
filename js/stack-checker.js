// ---------------------------------------------------------------------------
// STACK CHECKER
// ---------------------------------------------------------------------------
const CHECK_CATS = ["Interactions", MED_RULES.category, LOAD_RULES.category, "Timing", "Dose", "Tolerance", "Balance", "Food", "Cofactors", "Recovery"];

// "Serious" or worse: the timeline and the Tracker checklist pause until it's fixed.
const isStop = f => f.sev === "critical" || f.sev === "major";
const stackBlocked = stack => analyze(stack).some(isStop);
// An approval only counts if critical findings are allowed to be approved (content/recommendations.js).
const canApprove = F => LOAD_RULES.approve.allowCritical || !F.some(f => f.sev === "critical");
// The approval covers the exact serious findings that were confirmed; a new or worse one needs approving again.
const stopKey = f => `${f.rule || f.title}:${f.sev}`;
const approvalValid = (stack, F = analyze(stack)) => !!stack.approved && canApprove(F) && F.filter(isStop).every(f => stack.approved.keys.includes(stopKey(f)));
const stackPaused = stack => { const F = analyze(stack); return F.some(isStop) && !approvalValid(stack, F); };

// True when a supplement joins a neurotransmitter's pathway after its slow (rate-limiting) step.
function pastSlowStep(sid, nt) {
  const path = ntById[nt]?.path || [], rl = path.findIndex(p => p.rl);
  const at = path.findIndex(p => (p.from || []).some(f => sameGroup(f, sid)));
  return rl >= 0 && at > rl;
}

// What the person entered in "About you" (localStorage only; never sent anywhere).
const ABOUT_KEY = "nsa-about";
const aboutYou = () => { const a = lsGet(ABOUT_KEY, null) || {}; return { meds: a.meds || [], names: a.names || [], conds: a.conds || [] }; };
const aboutSets = (a = aboutYou()) => ({
  meds: new Set([...a.meds, ...a.names.map(n => n.cls)].filter(m => m !== "none" && m !== "pnts")),
  conds: new Set(a.conds.filter(c => c !== "none" && c !== "pnts")),
  filled: a.meds.length + a.names.length + a.conds.length > 0,
});
const medLabel = id => (MED_CLASSES.find(c => c.id === id) || {}).label || id;
const condLabel = id => ((CONDITIONS.find(c => c.id === id) || {}).label || id).toLowerCase();
const seOf = sid => SIDE_EFFECTS[sid] || { common: [], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false };

function medFindings(items, F, uniq, names, tagged, fill) {
  const R = MED_RULES, cat = R.category, A = aboutSets(), all = uniq(items), covered = new Set();
  const cover = (sid, key) => covered.add(sid + "|" + key);
  const push = f => F.push({ cat, ...f });
  if (!A.filled) push({ sev: "info", rule: "about:empty", about: true, title: R.nothingEntered, body: "" });

  // Team rules
  R.rules.forEach(r => {
    const trig = [...(r.meds || []).filter(m => A.meds.has(m)), ...(r.conds || []).filter(c => A.conds.has(c))];
    if (!trig.length) return;
    const mem = all.filter(i => (r.ids || []).some(id => sameGroup(id, i.sid)) || (r.tags || []).some(t => byId[i.sid].tags.includes(t)));
    if (!mem.length) return;
    mem.forEach(i => trig.forEach(k => cover(i.sid, k)));
    const v = { names: names(mem), med: listJoin(trig.map(k => MED_CLASSES.some(c => c.id === k) ? medLabel(k) : condLabel(k))) };
    push({ sev: r.sevIfTwo && mem.length >= 2 ? r.sevIfTwo : r.sev, rule: "med:" + r.id, ids: mem.map(i => i.sid), title: fill(r.title, v), body: fill(r.body, v) });
  });

  // Life stage
  if (A.conds.has("pregnant")) {
    const sitePreg = i => byId[i.sid].ix.some(x => !x[3] && /pregnan/i.test(x[0]) && x[1] === "major");
    const avoid = all.filter(i => seOf(i.sid).pregnancy === "avoid" || seOf(i.sid).avoidIf.includes("pregnant") || sitePreg(i));
    const unknown = all.filter(i => !avoid.includes(i) && seOf(i.sid).pregnancy !== "guidance");
    avoid.forEach(i => cover(i.sid, "pregnant"));
    if (avoid.length) push({ ...R.pregnantAvoid, rule: "life:pregnant-avoid", ids: avoid.map(i => i.sid), title: fill(R.pregnantAvoid.title, { names: names(avoid) }), body: fill(R.pregnantAvoid.body, { names: names(avoid) }) });
    if (unknown.length) push({ ...R.pregnantUnknown, rule: "life:pregnant-unknown", ids: unknown.map(i => i.sid), title: fill(R.pregnantUnknown.title, { names: names(unknown) }), body: fill(R.pregnantUnknown.body, { names: names(unknown) }) });
  }
  if (A.conds.has("under18") && all.length) push({ ...R.under18, rule: "life:under18", ids: all.map(i => i.sid), body: fill(R.under18.body, { names: names(all) }) });

  // "Avoid if" from side-effects.js
  A.conds.forEach(c => {
    if (c === "pregnant") return;
    const mem = all.filter(i => seOf(i.sid).avoidIf.includes(c) && !covered.has(i.sid + "|" + c));
    if (!mem.length) return;
    mem.forEach(i => cover(i.sid, c));
    const v = { names: names(mem), cond: condLabel(c) };
    push({ sev: R.avoidIf.sev, rule: "avoid:" + c, ids: mem.map(i => i.sid), title: fill(R.avoidIf.title, v), body: fill(R.avoidIf.body, v) });
  });

  // "Watch out for" entries in the supplement data that match what's entered (site data)
  const seen = new Set();
  all.forEach(i => byId[i.sid].ix.forEach(([label, sev, note, lid]) => {
    if (lid || sev === "beneficial") return;
    Object.entries(R.ixMatch).forEach(([k, re]) => {
      if (!(A.meds.has(k) || A.conds.has(k)) || !re.test(label) || covered.has(i.sid + "|" + k) || seen.has(i.sid + "|" + label)) return;
      seen.add(i.sid + "|" + label);
      push({ sev, rule: `ix:${i.sid}:${k}`, ids: [i.sid], title: `${byId[i.sid].name} + ${label}`, body: note });
    });
  }));

  // Medicines we can't check
  const others = aboutYou().names.filter(n => n.cls === "other").map(n => n.name);
  if (others.length || (A.meds.has("other") && all.some(i => i.sid !== "st-johns-wort"))) {
    const nm = others.length ? listJoin(others) : medLabel("other").toLowerCase();
    push({ sev: R.otherMeds.sev, rule: "med:other", title: fill(R.otherMeds.title, { names: nm }), body: fill(R.otherMeds.body, { names: nm }) });
  }

  // Side effects that add up, and liver
  Object.entries(R.additive.effects).forEach(([effect, at]) => {
    const mem = all.filter(i => seOf(i.sid).common.includes(effect));
    if (mem.length < at) return;
    const v = { names: names(mem), effect };
    F.push({ cat: "Interactions", sev: R.additive.sev, rule: "se:" + effect, ids: mem.map(i => i.sid), title: fill(R.additive.title, v), body: fill(R.additive.body, v) });
  });
  const liver = all.filter(i => seOf(i.sid).liver || byId[i.sid].tags.includes("liver"));
  if (liver.length >= R.liver.at) F.push({ cat: "Interactions", sev: R.liver.sev, rule: "se:liver", ids: liver.map(i => i.sid), title: R.liver.title, body: fill(R.liver.body, { names: names(liver) }) });
}

function analyze(stack) {
  const F = [];
  const items = stack.items.filter(i => byId[i.sid]);
  if (!items.length) return F;
  const has = id => items.some(i => i.sid === id);
  const uniq = arr => arr.filter((x, i, a) => a.findIndex(y => y.sid === x.sid) === i);
  const names = arr => listJoin(uniq(arr).map(i => byId[i.sid].name));
  const tagged = t => uniq(items.filter(i => byId[i.sid].tags.includes(t)));
  const total = id => items.filter(i => i.sid === id).reduce((a, i) => a + (+i.dose || 0), 0);

  // Pairwise interactions from the datasheets
  const pairs = {};
  // An interaction written against one form (e.g. "iron") applies to every form in its group.
  items.forEach(i => byId[i.sid].ix.forEach(([w, sev, note, lid]) => {
    if (!lid) return;
    uniq(items.filter(x => x.sid !== i.sid && sameGroup(x.sid, lid) && !sameGroup(x.sid, i.sid))).forEach(x => {
      const key = [i.sid, x.sid].sort().join("|");
      if (!pairs[key] || SEV_ORDER[sev] < SEV_ORDER[pairs[key].sev]) pairs[key] = { a: i.sid, b: x.sid, sev, note };
    });
  }));
  for (const key in pairs) {
    const p = pairs[key];
    if (key === "mucuna-pruriens|vitamin-b6" && total("vitamin-b6") <= 25) continue; // only high-dose B6 matters
    // Absorption clashes stop mattering once the doses are spaced far enough apart
    const sep = SEP.find(r => [r[0], r[1]].sort().join("|") === key);
    if (sep && p.sev !== "major" && items.filter(i => i.sid === sep[0]).every(x => items.filter(i => i.sid === sep[1]).every(y => Math.abs(mins(x.time) - mins(y.time)) >= sep[2] * 60))) continue;
    F.push({ cat: "Interactions", sev: p.sev === "beneficial" ? "good" : p.sev, title: `${byId[p.a].name} + ${byId[p.b].name}`, body: p.note, ids: [p.a, p.b] });
  }

  // Class-level stacking
  const sero = tagged("serotonergic");
  const stim = tagged("stimulant");
  if (stim.length >= 2) F.push({ cat: "Interactions", sev: stim.some(i => byId[i.sid].tags.includes("bp_up")) ? "major" : "moderate",
    ids: stim.map(i => i.sid), rule: "stim", title: "Stimulants stacked", body: `${names(stim)} each raise heart rate and blood pressure, and the effects add up. Try each one alone before combining.` });
  const mao = tagged("mao");
  mao.forEach(m => {
    const others = items.filter(i => i.sid !== m.sid && ["dopaminergic", "serotonergic", "stimulant"].some(t => byId[i.sid].tags.includes(t)) && !pairs[[m.sid, i.sid].sort().join("|")]);
    if (others.length) F.push({ cat: "Interactions", sev: "moderate", ids: [m.sid, ...others.map(i => i.sid)], title: `${byId[m.sid].name} slows breakdown`,
      body: `It slows the enzyme that clears ${names(others)}, so their effects last longer and blood pressure can climb.` });
  });
  const da = tagged("dopaminergic");

  // Stack load (content/recommendations.js, LOAD_RULES): same chemical system, too many acting on
  // brain chemicals, too many overall, and amino acids sharing one transporter.
  const L = LOAD_RULES, fill = (t, v) => t.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
  const stepSev = (steps, n) => steps.filter(([at]) => n >= at).map(([, sev]) => sev).pop();
  L.systems.forEach(sys => {
    const mem = tagged(sys.tag);
    let sev = stepSev(sys.steps, mem.length);
    if (!sev) return;
    Object.entries(sys.always || {}).forEach(([id, s]) => { if (mem.some(i => i.sid === id) && SEV_ORDER[s] < SEV_ORDER[sev]) sev = s; });
    const fast = mem.filter(i => pastSlowStep(i.sid, sys.nt));
    F.push({ cat: L.category, sev, rule: "sys:" + sys.id, system: sys.id, title: sys.title, ids: mem.map(i => i.sid),
      body: fill(sys.body, { names: names(mem) }) + (fast.length ? " " + fill(L.fastNote, { fast: names(fast) }) : "") });
  });
  // Foundations (omega-3, magnesium, D3…) support the whole system, so they don't count toward "too much at once".
  const brain = uniq(items.filter(i => MAP.some(r => r[0] === i.sid && ROLE_WEIGHT[r[2]] > 0) && !FOUNDATIONS.some(f => sameGroup(f[0], i.sid))));
  if (brain.length >= L.brainTotal.at) F.push({ cat: L.category, sev: L.brainTotal.sev, rule: "brainTotal", title: L.brainTotal.title, ids: brain.map(i => i.sid),
    body: fill(L.brainTotal.body, { n: brain.length, names: names(brain) }) });
  const all = uniq(items);
  if (all.length >= L.itemTotal.at) F.push({ cat: L.category, sev: L.itemTotal.sev, rule: "itemTotal", title: L.itemTotal.title,
    body: fill(L.itemTotal.body, { n: all.length }) });
  const amino = tagged(L.aminoAcids.tag);
  if (amino.length >= L.aminoAcids.at) F.push({ cat: L.category, sev: L.aminoAcids.sev, rule: "amino", title: L.aminoAcids.title, ids: amino.map(i => i.sid),
    body: fill(L.aminoAcids.body, { names: names(amino) }) });

  // Medications & conditions (About you, content/medications.js + med-rules.js) and side effects (side-effects.js)
  medFindings(items, F, uniq, names, tagged, fill);

  // Timing: spacing rules
  SEP.forEach(([a, b, h, why]) => {
    const A = items.filter(i => i.sid === a), B = items.filter(i => i.sid === b);
    for (const x of A) for (const y of B) {
      const gap = Math.abs(mins(x.time) - mins(y.time));
      if (gap < h * 60) {
        F.push({ cat: "Timing", sev: "moderate", title: `Space out ${byId[a].name} and ${byId[b].name}`,
          body: `${why} Take them at least ${h} hour${h > 1 ? "s" : ""} apart. Right now they're ${gap ? fmtGap(gap) + " apart" : "taken together"}.` });
        return;
      }
    }
  });
  // Timing: time of day
  items.forEach(i => {
    const s = byId[i.sid], t = mins(i.time);
    if (s.tags.includes("stimulant") && t >= 14 * 60) {
      let body = `Taken at ${fmt12(i.time)}, it may still be active at bedtime.`;
      if (i.sid === "caffeine") {
        const left = Math.round((+i.dose || 0) * Math.pow(0.5, Math.max(0, 23 * 60 - t) / 300));
        body = `About ${left} mg of this ${num(+i.dose || 0)} mg dose will still be in your system at 11 pm. Caffeine's half-life is about 5 hours.`;
      }
      F.push({ cat: "Timing", sev: "moderate", title: `${s.name} at ${fmt12(i.time)}`, body });
    } else if (s.when === "am" && t >= 15 * 60) {
      F.push({ cat: "Timing", sev: "minor", title: `${s.name} at ${fmt12(i.time)}`, body: "Usually taken in the morning. Later doses can interfere with sleep." });
    } else if (s.when === "pm" && t < 12 * 60) {
      F.push({ cat: "Timing", sev: "minor", title: `${s.name} at ${fmt12(i.time)}`, body: "Usually taken in the evening. It can make you drowsy during the day." });
    }
  });

  // Dose
  // Doses above the typical range are ranked by how far above they are (LOAD_RULES.dose).
  const D = LOAD_RULES.dose, xOf = (a, b) => +(a / b).toFixed(a / b < 10 ? 1 : 0);
  items.forEach(i => {
    const s = byId[i.sid], [mn, mx, unit] = s.dose, d = +i.dose || 0;
    if (d > mx) {
      const st = D.steps.filter(t => t.times === 1 || d >= mx * t.times).pop(), amt = `${num(d)} ${unit}`;
      F.push({ cat: "Dose", sev: st.sev, rule: `dose:${i.id}:${d}`, ids: [i.sid], title: `${st.title}: ${s.name} ${amt}`,
        body: fill(st.body, { dose: amt, range: `${range(mn, mx)} ${unit}`, x: xOf(d, mx) }) });
    }
    else if (d < mn) F.push({ cat: "Dose", sev: "info", title: `${s.name}: ${num(d)} ${unit}`, body: `Below the typical ${range(mn, mx)} ${unit}. You may not notice much.` });
  });
  uniq(items).forEach(i => {
    const s = byId[i.sid], tot = total(i.sid);
    if (s.ul && !s.group && tot > s.ul) {
      const crit = tot >= s.ul * D.ulCriticalTimes;
      F.push({ cat: "Dose", sev: crit ? "critical" : "major", ids: [i.sid], title: `${s.name} over the daily limit`,
        body: crit ? fill(D.ulCriticalBody, { total: `${num(tot)} ${s.dose[2]}`, ul: `${num(s.ul)} ${s.dose[2]}`, x: xOf(tot, s.ul) }) : `${num(tot)} ${s.dose[2]} a day in total is above the ${num(s.ul)} ${s.dose[2]} upper limit.` });
    }
  });
  // Groups (e.g. magnesium forms) share one limit, counted as elemental mg
  Object.keys(GROUP_UL).forEach(g => {
    const members = items.filter(i => byId[i.sid].group === g);
    if (!members.length) return;
    const elem = Math.round(members.reduce((a, i) => a + elementalMg(i), 0));
    const forms = uniq(members);
    if (elem > GROUP_UL[g]) F.push({ cat: "Dose", sev: "major", title: `${GROUP_NAME[g]} over the daily limit`,
      body: `About ${num(elem)} mg of elemental ${GROUP_NAME[g].toLowerCase()} a day${forms.length > 1 ? ` across ${names(forms)}` : ""}, above the ${GROUP_UL[g]} mg upper limit for supplements. ${GROUP_NOTE[g] || ""}` });
    else if (forms.length > 1) F.push({ cat: "Dose", sev: "info", title: `${forms.length} forms of ${GROUP_NAME[g].toLowerCase()}`,
      body: `Combining ${names(forms)} is fine. Together they add up to about ${num(elem)} mg elemental, under the ${GROUP_UL[g]} mg limit.` });
  });

  // Tolerance and downregulation
  uniq(items).forEach(i => {
    const s = byId[i.sid];
    if (s.tags.includes("downreg") || s.tol[0] === "high") F.push({ cat: "Tolerance", sev: s.tol[0] === "high" ? "moderate" : "minor", title: `Plan breaks from ${s.name}`, body: s.cycle || s.tol[1] });
    else if (s.cycle) F.push({ cat: "Tolerance", sev: "info", title: `Cycling ${s.name}`, body: s.cycle });
  });

  // Balance (theory, labeled as such)
  if (has("5-htp") && !da.length) F.push({ cat: "Balance", sev: "info", title: "5-HTP without dopamine support",
    body: "Theory, limited evidence: long-term 5-HTP on its own may lower dopamine because both share the AADC enzyme. Some people add L-Tyrosine at a different time of day." , adds: ["l-tyrosine"] });
  if (has("mucuna-pruriens") && !sero.length) F.push({ cat: "Balance", sev: "info", title: "Mucuna without serotonin support",
    body: "Theory, limited evidence: regular L-DOPA can crowd out serotonin production through the same enzyme. Worth watching your mood and sleep." });

  // Food, against the meals in "Your day"
  if (!(stack.meals || []).length) F.push({ cat: "Food", sev: "info", title: "No meals set",
    body: "The builder is assuming an empty stomach all day. Add your usual meals under “Your day” to see how food changes absorption." });
  items.forEach(i => {
    const ab = absorb(i, stack);
    if (ab.level !== "warn" && ab.level !== "bad") return;
    const others = items.filter(x => x.id !== i.id), b = bestSlot(i, stack, others), to = hhmm(b.t);
    F.push({ cat: "Food", sev: ab.level === "bad" ? "moderate" : "minor", title: `${byId[i.sid].name} at ${fmt12(i.time)}`, body: ab.why,
      move: to !== i.time && absorb({ ...i, time: to }, stack).factor > ab.factor ? { item: i.id, time: to } : null });
  });

  // Recovery (additions themselves live in the Suggestions panel)
  const pushers = uniq(items).filter(i => { const s = byId[i.sid]; return s.tags.includes("downreg") || s.tags.includes("stimulant") || s.tol[0] === "high"; });
  if (pushers.length) F.push({ cat: "Recovery", sev: "info", title: "Protect your baseline",
    body: `${names(pushers)} act on your system directly, which is where tolerance comes from. Breaks, sleep and exercise do more for recovery than any supplement.` });

  if (!F.some(f => isStop(f) || f.sev === "moderate")) F.unshift({ cat: "Interactions", sev: "good", title: "No known conflicts in our data", body: "Nothing in this stack is known to clash. Still introduce one new supplement at a time so you can tell what's doing what." });
  return F.sort((a, b) => CHECK_CATS.indexOf(a.cat) - CHECK_CATS.indexOf(b.cat) || SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);
}

// ---------------------------------------------------------------------------
// STACK SUGGESTIONS
// Pairings and cofactors for what's already in the stack, better forms, and
// foundations. Every candidate is test-added (at its best time) and dropped if
// it would create a new serious or moderate interaction.
// ---------------------------------------------------------------------------
const KIND_RANK = { swap: 0, pair: 1, cofactor: 2, foundation: 3 };
const isCofactor = id => MAP.some(r => r[0] === id && r[2] === "cofactor") || ["vitamin", "mineral"].includes(byId[id].cat);
const badCount = F => F.filter(f => (f.cat === "Interactions" || f.cat === LOAD_RULES.category) && (isStop(f) || f.sev === "moderate")).length;

// Best time for a new dose. With a partner ("take together"), prefer the
// partner's time unless that slot is clearly worse than the best one.
function placeFor(sid, stack, partner) {
  const s = byId[sid], placed = stack.items.filter(i => byId[i.sid]);
  const probe = { id: "_probe", sid, dose: s.dose[0], time: WHEN_DEFAULT[s.when] };
  const best = bestSlot(probe, stack, placed);
  if (partner) {
    const opts = placed.filter(i => i.sid === partner).map(i => ({ t: mins(i.time), sc: scoreAt({ ...probe, time: i.time }, mins(i.time), stack, placed) }))
      .sort((a, b) => a.sc.total - b.sc.total);
    if (opts.length && opts[0].sc.total <= best.sc.total + 1.5) return hhmm(opts[0].t);
  }
  return hhmm(best.t);
}

function suggest(stack) {
  const items = stack.items.filter(i => byId[i.sid]);
  if (!items.length) return [];
  const has = id => items.some(i => sameGroup(i.sid, id)); // any magnesium form counts as having magnesium
  const uniqIds = [...new Set(items.map(i => i.sid))];
  const out = {};
  const add = (sid, kind, forSid, reason, score, together) => {
    if (has(sid) || !byId[sid] || NO_SUGGEST.some(n => sameGroup(n, sid))) return;
    const o = out[sid] || (out[sid] = { sid, kind, fors: [], reasons: [], score: 0 });
    if (together && !o.partner) o.partner = forSid;
    if (KIND_RANK[kind] < KIND_RANK[o.kind]) o.kind = kind;
    if (forSid && !o.fors.includes(forSid)) { o.fors.push(forSid); o.reasons.push([forSid, reason]); }
    if (!forSid && !o.reasons.length) o.reasons.push([null, reason]);
    o.score += score;
  };
  uniqIds.forEach(id => {
    (COF[id]?.items || []).forEach(([cid, reason, timing]) => add(cid, isCofactor(cid) ? "cofactor" : "pair", id, reason, 3, /^together/i.test(timing || "")));
    byId[id].ix.forEach(([, sev, note, lid]) => { if (sev === "beneficial" && lid) add(lid, "pair", id, note, 3, true); });
  });
  ["omega-3", "magnesium-glycinate", "vitamin-d3"].forEach(id => add(id, "foundation", null, FOUNDATIONS.find(f => f[0] === id)[2], 1));

  const base = badCount(analyze(stack));
  const safe = Object.values(out).filter(o => {
    o.time = placeFor(o.sid, stack, o.partner);
    const test = { ...stack, items: [...stack.items, { id: "_probe", sid: o.sid, dose: byId[o.sid].dose[0], time: o.time }] };
    return badCount(analyze(test)) <= base;
  });
  const swaps = uniqIds.filter(id => SWAPS[id] && !items.some(i => i.sid === SWAPS[id][0])).map(id => ({ sid: SWAPS[id][0], kind: "swap", fors: [id], reasons: [[id, SWAPS[id][1]]], score: 5, replace: id }));
  return [...swaps, ...safe].sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind] || b.score - a.score);
}

