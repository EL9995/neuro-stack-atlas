// ---------------------------------------------------------------------------
// TRACKER INSIGHTS
// Reads the last 14 days of logs: rating trends per metric, then likely causes
// from what was actually taken (tolerance, late stimulants, dose creep, new
// additions) and concrete next steps. Patterns, not proof.
// ---------------------------------------------------------------------------
const METRIC_NT = { focus: ["dopamine", "norepinephrine", "acetylcholine"], energy: ["dopamine", "norepinephrine"], mood: ["serotonin", "dopamine"], calm: ["gaba"], sleep: ["gaba", "serotonin"] };
const avg = a => a.reduce((x, y) => x + y, 0) / a.length;

function trend(vals) {
  const pts = vals.filter(v => v != null);
  if (pts.length < 5) return null;
  const k = Math.max(2, Math.floor(pts.length / 3));
  const first = avg(pts.slice(0, k)), last = avg(pts.slice(-k));
  return { first, last, delta: last - first, n: pts.length };
}

function insights(endKey) {
  const days = Array.from({ length: 14 }, (_, i) => addDays(endKey, i - 13));
  const recs = days.map(getDay);
  const rated = recs.filter(r => r && Object.keys(r.r || {}).length).length;
  const res = { rated, enough: rated >= 5, safety: null, metrics: [], actions: [], keep: [], verdict: "", note: null };
  if (!res.enough) return res;

  // What was actually taken, per supplement
  const use = {};
  recs.forEach((r, di) => r && Object.values(r.taken || {}).forEach(t => {
    if (!byId[t.sid]) return;
    const u = use[t.sid] || (use[t.sid] = { days: new Set(), first: di, doses: [], late: 0 });
    u.days.add(di);
    u.doses.push(+t.dose || 0);
    if (mins(t.time) >= 14 * 60) u.late++;
  }));
  const loggedDays = recs.filter(r => r && Object.keys(r.taken || {}).length).length;
  const regular = Object.keys(use).filter(sid => use[sid].days.size >= Math.max(4, loggedDays * 0.6));
  const avgDose = sid => avg(use[sid].doses); // per single dose, compared with the per-dose range
  const dateOf = di => fmtDate(days[di], { month: "short", day: "numeric" });
  const short = label => label.replace(" last night", "");

  const moods = recs.map(r => r?.r?.mood).filter(v => v != null).slice(-5);
  const lowMood = moods.length >= 4 && avg(moods) <= 2;
  if (lowMood) res.safety = "Your mood has been low for several days. Supplements aren't the right fix for this on their own: if it lasts or gets worse, talk to a doctor or someone you trust, and don't start or stop several mood supplements at once. If you ever have thoughts of harming yourself, contact a crisis line right away (in the US, call or text 988).";

  // Actions are keyed so the same cause found under several metrics becomes one line.
  const acts = {};
  const act = (key, rank, text, why, cause, metric) => {
    const a = acts[key] || (acts[key] = { rank, text, why, cause, metrics: [] });
    if (!a.metrics.includes(metric)) a.metrics.push(metric);
  };

  METRICS.forEach(([m, label]) => {
    const vals = recs.map(r => r?.r?.[m] ?? null);
    const tr = trend(vals);
    if (!tr) return;
    const name = short(label), lname = name.toLowerCase();
    const dir = tr.delta <= -0.7 ? "down" : tr.delta >= 0.7 ? "up" : "flat";
    res.metrics.push({ m, label: name, dir, first: tr.first, last: tr.last });

    // Before/after for supplements started partway through the window
    const shifts = Object.entries(use).filter(([, u]) => u.first >= 3).map(([sid, u]) => {
      const before = vals.slice(0, u.first).filter(v => v != null), after = vals.slice(u.first).filter(v => v != null);
      if (before.length < 2 || after.length < 2) return null;
      return { sid, d: avg(after) - avg(before), before: avg(before), after: avg(after), from: dateOf(u.first) };
    }).filter(x => x && Math.abs(x.d) >= 0.7);

    if (dir === "up") {
      shifts.filter(x => x.d > 0).forEach(x => res.keep.push(`${byId[x.sid].name}: ${lname} went from ${x.before.toFixed(1)} to ${x.after.toFixed(1)} after you started it on ${x.from}.`));
      return;
    }
    if (dir !== "down") return;

    regular.forEach(sid => {
      const s = byId[sid];
      if (m === "sleep" && s.tags.includes("stimulant")) return; // timing, handled below
      const hits = MAP.some(r => r[0] === sid && METRIC_NT[m].includes(r[1]) && r[2] !== "cofactor") || (s.tags.includes("stimulant") && m !== "calm");
      if (!hits || !(s.tol[0] === "moderate" || s.tol[0] === "high" || s.tags.includes("downreg"))) return;
      if (lowMood && m === "mood") act("doc:" + sid, 3, `Ask a doctor about ${s.name}`, `You've taken it ${use[sid].days.size} of the last 14 days while your mood dropped. Better reviewed with a doctor than changed on your own right now.`, `${s.name}`, name);
      else act("tol:" + sid, s.tol[0] === "high" ? 3 : 2, `Take a 5–7 day break from ${s.name}`,
        `Taken ${use[sid].days.size} of the last 14 days, and it can build tolerance. Keep logging during the break: if things recover, that was it.${s.cycle ? " After that: " + s.cycle : ""}`,
        `tolerance to ${s.name}`, name);
    });
    regular.filter(sid => avgDose(sid) > byId[sid].dose[1]).forEach(sid => {
      const s = byId[sid];
      act("dose:" + sid, 2, `Bring ${s.name} back down to ${range(s.dose[0], s.dose[1])} ${s.dose[2]}`,
        `Your doses have averaged ${num(Math.round(avgDose(sid)))} ${s.dose[2]}. Higher doses build tolerance faster.`, `higher ${s.name} doses`, name);
    });
    if (m === "sleep") Object.keys(use).filter(sid => byId[sid].tags.includes("stimulant") && use[sid].late >= 2).forEach(sid => {
      act("late:" + sid, 4, `Move ${byId[sid].name} before 2 pm`, `You took it after 2 pm on ${use[sid].late} of the last 14 days, and your sleep ratings dropped.`, `late ${byId[sid].name}`, name);
    });
    shifts.filter(x => x.d < 0).forEach(x => {
      act("new:" + x.sid, 1, `Try a few days without ${byId[x.sid].name}`,
        `Since you started it on ${x.from}, ${lname} has averaged ${x.after.toFixed(1)} vs ${x.before.toFixed(1)} before. Could be a coincidence; a short break will tell you.`, `starting ${byId[x.sid].name}`, name);
    });
  });

  res.actions = Object.values(acts).sort((a, b) => b.rank - a.rank || b.metrics.length - a.metrics.length);
  res.keep = res.keep.slice(0, 1);

  // One-line verdict
  const labels = dir => res.metrics.filter(x => x.dir === dir).map((x, i) => i ? x.label.toLowerCase() : x.label);
  const downs = labels("down"), ups = labels("up");
  const isAre = n => n > 1 ? "are" : "is";
  if (downs.length) {
    const causes = res.actions.slice(0, 2).map(a => a.cause);
    res.verdict = `${listJoin(downs)} ${isAre(downs.length)} slipping. ` + (causes.length ? `Possible ${causes.length > 1 ? "causes" : "cause"}: ${listJoin(causes)}.` : "Nothing in your stack stands out, so check sleep, stress, illness and alcohol in your notes.");
    if (ups.length) res.verdict += ` ${listJoin(ups)} ${isAre(ups.length)} up.`;
  } else if (ups.length) {
    res.verdict = `${listJoin(ups)} ${isAre(ups.length)} improving. Keep doing what you're doing.`;
  } else {
    res.verdict = "Steady over the last two weeks.";
    regular.filter(sid => byId[sid].cycle || byId[sid].tol[0] === "high").slice(0, 2).forEach(sid =>
      act("cyc:" + sid, 0, `Plan a break from ${byId[sid].name}`, byId[sid].cycle || byId[sid].tol[1], "", ""));
    res.actions = Object.values(acts);
  }
  if (loggedDays < rated * 0.5) res.note = `You rated ${rated} days but checked off doses on only ${loggedDays}. Log both so causes can be matched.`;
  return res;
}

