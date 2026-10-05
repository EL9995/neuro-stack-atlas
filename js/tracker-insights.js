// ---------------------------------------------------------------------------
// TRACKER INSIGHTS
// Reads the last 14 days of logs. Describes what changed and what went
// together, never what caused what:
//   - rating trends per metric (descriptive)
//   - patterns: "on days you logged X, you rated Y higher/lower", only once
//     there are 10+ logged days, with enough days both with and without X
//   - "worth a look": plain facts from the log (late stimulants, doses above
//     the typical range, frequent use of something that builds tolerance)
// The low-mood safety message always shows when it applies.
// ---------------------------------------------------------------------------
const METRIC_NT = { focus: ["dopamine", "norepinephrine", "acetylcholine"], energy: ["dopamine", "norepinephrine"], mood: ["serotonin", "dopamine"], calm: ["gaba"], sleep: ["gaba", "serotonin"] };
const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
const LINK_MIN_DAYS = 10;   // logged days (ratings + doses) needed before linking a supplement to a change
const LINK_MIN_SIDE = 3;    // ...with at least this many days with it, and without it
const LINK_MIN_DIFF = 0.7;  // rating difference worth mentioning

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
  const res = { rated, enough: rated >= 5, safety: null, metrics: [], summary: "", patterns: [], looks: [], logged: 0, need: LINK_MIN_DAYS, note: null };
  if (!res.enough) return res;

  // What was actually taken, per supplement
  const use = {};
  recs.forEach((r, di) => r && Object.values(r.taken || {}).forEach(t => {
    if (!byId[t.sid]) return;
    const u = use[t.sid] || (use[t.sid] = { days: new Set(), doses: [], late: 0 });
    u.days.add(di);
    u.doses.push(+t.dose || 0);
    if (mins(t.time) >= 14 * 60) u.late++;
  }));
  const dosed = recs.map(r => !!(r && Object.keys(r.taken || {}).length));
  const ratedDay = recs.map(r => !!(r && Object.keys(r.r || {}).length));
  // A "logged day" has both ratings and doses, so we know what was and wasn't taken that day.
  const loggedIdx = days.map((_, i) => i).filter(i => dosed[i] && ratedDay[i]);
  res.logged = loggedIdx.length;
  const short = label => label.replace(" last night", "");

  const moods = recs.map(r => r?.r?.mood).filter(v => v != null).slice(-5);
  const lowMood = moods.length >= 4 && avg(moods) <= 2;
  if (lowMood) res.safety = "Your mood has been low for several days. Supplements aren't the right fix for this on their own: if it lasts or gets worse, talk to a doctor or someone you trust, and don't start or stop several mood supplements at once. If you ever have thoughts of harming yourself, contact a crisis line right away (in the US, call or text 988).";

  // Rating trends (descriptive)
  METRICS.forEach(([m, label]) => {
    const tr = trend(recs.map(r => r?.r?.[m] ?? null));
    if (!tr) return;
    const dir = tr.delta <= -0.7 ? "down" : tr.delta >= 0.7 ? "up" : "flat";
    res.metrics.push({ m, label: short(label), dir, first: tr.first, last: tr.last });
  });
  const named = dir => res.metrics.filter(x => x.dir === dir).map(x => x.label.toLowerCase());
  const downs = named("down"), ups = named("up");
  const parts = [];
  if (downs.length) parts.push(`${listJoin(downs)} ${downs.length > 1 ? "ratings are" : "rating is"} lower than at the start of these two weeks`);
  if (ups.length) parts.push(`${listJoin(ups)} ${ups.length > 1 ? "ratings are" : "rating is"} higher`);
  res.summary = parts.length ? parts.join(", and ").replace(/^./, c => c.toUpperCase()) + "." : "Your ratings have been steady over the last two weeks.";

  // Patterns: rating on days with vs without each supplement (needs 10+ logged days)
  if (res.logged >= LINK_MIN_DAYS) {
    Object.entries(use).forEach(([sid, u]) => {
      const withD = loggedIdx.filter(i => u.days.has(i)), without = loggedIdx.filter(i => !u.days.has(i));
      if (withD.length < LINK_MIN_SIDE || without.length < LINK_MIN_SIDE) return;
      METRICS.forEach(([m, label]) => {
        const a = withD.map(i => recs[i].r[m]).filter(v => v != null), b = without.map(i => recs[i].r[m]).filter(v => v != null);
        if (a.length < LINK_MIN_SIDE || b.length < LINK_MIN_SIDE) return;
        const d = avg(a) - avg(b);
        if (Math.abs(d) < LINK_MIN_DIFF) return;
        res.patterns.push({ d, text: `On days you logged ${byId[sid].name}, you rated ${short(label).toLowerCase()} ${d > 0 ? "higher" : "lower"} (${avg(a).toFixed(1)} vs ${avg(b).toFixed(1)} on other days).` });
      });
    });
    res.patterns.sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
    res.patterns = res.patterns.slice(0, 4);
  }

  // Worth a look: facts from the log, no cause implied
  const nDays = sid => use[sid].days.size;
  Object.keys(use).forEach(sid => {
    const s = byId[sid];
    if (s.tags.includes("stimulant") && use[sid].late >= 2) res.looks.push(`You logged ${s.name} after 2 pm on ${use[sid].late} days. Stimulants late in the day can affect sleep.`);
  });
  Object.keys(use).filter(sid => avg(use[sid].doses) > byId[sid].dose[1]).forEach(sid => {
    const s = byId[sid];
    res.looks.push(`Your ${s.name} doses averaged ${num(Math.round(avg(use[sid].doses)))} ${s.dose[2]}, above the typical ${range(s.dose[0], s.dose[1])} ${s.dose[2]}.`);
  });
  Object.keys(use).filter(sid => nDays(sid) >= 10 && (byId[sid].tol[0] === "moderate" || byId[sid].tol[0] === "high" || byId[sid].tags.includes("downreg"))).forEach(sid => {
    const s = byId[sid];
    res.looks.push(`You logged ${s.name} on ${nDays(sid)} of the last 14 days. It's known to build tolerance${s.cycle ? `: ${s.cycle}` : "; see its page for how breaks are usually planned."}`);
  });
  res.looks = res.looks.slice(0, 3);

  const dosedDays = dosed.filter(Boolean).length;
  if (dosedDays < rated * 0.5) res.note = `You rated ${rated} days but checked off doses on only ${dosedDays}. Log both so patterns can be matched.`;
  return res;
}
