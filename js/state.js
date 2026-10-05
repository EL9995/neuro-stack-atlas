// ---------------------------------------------------------------------------
// STATE + PERSISTENCE
// Signed-in viewers: private per-person docs in the artifact db
//   data/users/<id>/state        stacks + active stack
//   data/users/<id>/log-YYYY-MM  one doc per month of tracker entries
// Otherwise: this browser's localStorage.
// ---------------------------------------------------------------------------
const hhmm = m => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
const defaultMeals = () => [
  { id: newId(), label: "Breakfast", time: "08:30", protein: true, fat: true, carbs: true },
  { id: newId(), label: "Lunch", time: "12:30", protein: true, fat: true, carbs: true },
  { id: newId(), label: "Dinner", time: "19:00", protein: true, fat: true, carbs: true }
];
function makeStack(name, items, extra = {}) {
  return { id: newId(), name, items: items.map(([sid, dose, time]) => ({ id: newId(), sid, dose, time })),
    meals: defaultMeals(), wake: "07:00", bed: "23:00", ...extra };
}
function migrateStack(s) {
  return { ...s, items: (s.items || []).filter(i => byId[i.sid]), meals: Array.isArray(s.meals) ? s.meals : defaultMeals(), wake: s.wake || "07:00", bed: s.bed || "23:00" };
}

// ---------------------------------------------------------------------------
// FOOD MODEL
// A meal puts you in the "fed" state from 30 min before it to 2 h after.
// Factors are rough, illustrative multipliers, not pharmacokinetic data.
// ---------------------------------------------------------------------------
function mealNear(stack, t) {
  let best = null;
  for (const m of stack.meals || []) {
    const d = t - mins(m.time);
    if (d >= -30 && d <= 120 && (!best || Math.abs(d) < Math.abs(best.d))) best = { m, d };
  }
  return best && best.m;
}
function absorb(item, stack) {
  const s = byId[item.sid], m = mealNear(stack, mins(item.time)), name = s.name;
  const ok = label => ({ factor: 1, delay: 0, level: "ok", label, why: "" });
  const at = m ? `${m.label} (${fmt12(m.time)})` : "";
  switch (s.food) {
    case "empty":
      if (!m) return { ...ok("Empty stomach"), level: "good" };
      if (s.tags.includes("lat1") && m.protein) return { factor: 0.5, delay: 45, level: "bad", label: `Near ${m.label}: protein competes`,
        why: `${at} has protein. Its amino acids compete with ${name} for entry into the brain (LAT1), so expect a weaker, slower effect. It works best 30+ minutes before eating.` };
      return { factor: 0.7, delay: 45, level: "warn", label: `Near ${m.label}: slower, weaker`,
        why: `Taken close to ${at}. Food slows ${name}'s absorption and blunts the effect. It works best 30+ minutes before eating or 2+ hours after.` };
    case "with_fat":
      if (m && m.fat) return { ...ok(`With ${m.label}`), level: "good" };
      if (m) return { factor: 0.7, delay: 0, level: "warn", label: `${m.label} has no fat`,
        why: `${at} is marked as having no fat. ${name} is fat-soluble and absorbs much better alongside some fat.` };
      return { factor: 0.5, delay: 0, level: "bad", label: "No food: poor absorption",
        why: `${name} is fat-soluble. Without a meal, much less of it gets absorbed. Take it with a meal that has some fat.` };
    case "with_food":
      if (m) return { ...ok(`With ${m.label}`), level: "good" };
      return { factor: 1, delay: 0, level: "warn", label: "No food: may upset stomach", why: `${name} is easier on the stomach when taken with food.` };
    case "carbs":
      if (m && m.carbs && !m.protein) return { factor: 1.1, delay: 0, level: "good", label: `With ${m.label} (carbs)`, why: "" };
      if (m && m.protein) return { factor: 0.6, delay: 30, level: "bad", label: `Near ${m.label}: protein competes`,
        why: `Protein in ${at} competes with ${name} for entry into the brain. Carbs without much protein help it get in.` };
      if (m) return ok(`With ${m.label}`);
      return { factor: 0.85, delay: 0, level: "warn", label: "Better with a carb snack",
        why: `A small carb snack raises insulin, which clears competing amino acids out of the way so more ${name} reaches the brain.` };
    default:
      if (m && s.onset[0] != null) return { ...ok(`With ${m.label}: a bit slower`), delay: 20 };
      return { ...ok(m ? `With ${m.label}` : ""), level: "none" };
  }
}

// ---------------------------------------------------------------------------
// TIMING OPTIMIZER
// Greedy: place the most constrained doses first, score every 15-min slot
// between wake and bed, keep the current time unless a slot is clearly better.
// ---------------------------------------------------------------------------
function scoreAt(item, t, st, placed) {
  const s = byId[item.sid], wake = mins(st.wake), bed = mins(st.bed);
  if (t < wake || t > bed) return { total: 999, parts: {} };
  const parts = {};
  parts.move = Math.abs(t - mins(item.time)) / 60 * 0.25;
  parts.tod = s.when === "am" && t > 12 * 60 ? 3 + (t - 12 * 60) / 60
    : s.when === "pm" && t < 18 * 60 ? 3 + (18 * 60 - t) / 60
    : s.when === "pm" ? Math.max(0, (Math.min(bed, 21 * 60) - t) / 60 * 0.6) : 0;
  parts.stim = s.tags.includes("stimulant") && t > 13 * 60 ? 3 + (t - 13 * 60) / 40 : 0;
  const ab = absorb({ ...item, time: hhmm(t) }, st);
  parts.food = (1 - Math.min(1, ab.factor)) * 8 + (ab.level === "warn" ? 1 : 0) - (ab.factor > 1 ? 0.5 : 0);
  let sep = 0, sepWith = null;
  SEP.forEach(([a, b, h]) => {
    const other = item.sid === a ? b : item.sid === b ? a : null;
    if (other) placed.filter(x => x.sid === other).forEach(x => { if (Math.abs(mins(x.time) - t) < h * 60) { sep += 10; sepWith = other; } });
  });
  parts.sep = sep;
  let dup = 0;
  placed.filter(x => x.sid === item.sid && x.id !== item.id).forEach(x => {
    const need = s.dur[0] != null ? (s.dur[0] + s.dur[1]) / 2 * 60 : 240, g = Math.abs(mins(x.time) - t);
    if (g < need) dup += 6 * (1 - g / need);
  });
  parts.dup = dup;
  parts.group = placed.some(x => mins(x.time) === t) ? -0.4 : 0;
  return { total: Object.values(parts).reduce((a, b) => a + b, 0), parts, sepWith, ab };
}
function bestSlot(item, st, placed) {
  let best = null;
  for (let t = Math.ceil(mins(st.wake) / 15) * 15; t <= mins(st.bed); t += 15) {
    const sc = scoreAt(item, t, st, placed);
    if (!best || sc.total < best.sc.total - 1e-9) best = { t, sc };
  }
  const cur = scoreAt(item, mins(item.time), st, placed);
  return best && best.sc.total < cur.total - 0.3 ? { ...best, cur } : { t: mins(item.time), sc: cur, cur };
}
function optimize(st) {
  const prio = i => { const s = byId[i.sid]; return (SEP.some(r => r[0] === i.sid || r[1] === i.sid) ? 4 : 0) + (s.food !== "any" ? 2 : 0) + (s.tags.includes("stimulant") ? 1 : 0); };
  const placed = [], changes = [];
  [...st.items].filter(i => byId[i.sid]).sort((a, b) => prio(b) - prio(a) || mins(a.time) - mins(b.time)).forEach(it => {
    const b = bestSlot(it, st, placed), to = hhmm(b.t);
    placed.push({ ...it, time: to });
    if (to !== it.time) {
      const drop = k => (b.cur.parts[k] || 0) - (b.sc.parts[k] || 0);
      const key = ["sep", "food", "stim", "tod", "dup"].sort((x, y) => drop(y) - drop(x))[0];
      const s = byId[it.sid];
      const why = drop(key) <= 0 ? "fits better around your meals" :
        key === "sep" ? `spaced from ${byId[b.cur.sepWith]?.name || "a conflicting supplement"}` :
        key === "food" ? `better absorption: ${b.sc.ab.label.toLowerCase() || "food timing"}` :
        key === "stim" ? "wears off before bed" :
        key === "tod" ? (s.when === "pm" ? "fits an evening dose" : "fits a morning dose") : "spreads out repeat doses";
      changes.push({ id: it.id, sid: it.sid, from: it.time, to, why });
    }
  });
  return { placed, changes };
}
const App = {
  stacks: [makeStack(EXAMPLE_STACK.name, EXAMPLE_STACK.items, { example: true })],
  activeId: null,
  logs: {}, loading: {},
  dirty: false,
  showDeep: lsGet("nsa-showDeep", false),
  trackDate: todayKey(),
  confirmDelete: false,
  openInfo: new Set(),
  showAllSugg: false
};
App.activeId = App.stacks[0].id;
const active = () => App.stacks.find(s => s.id === App.activeId) || App.stacks[0];

const Persist = {
  mode: "pending", db: null, uid: null, timers: {}, chains: {},
  ready: null,
  init() {
    this.ready = (async () => {
      try {
        if (window.claude && claude.use) {
          const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
          const id = user ? await user.id() : null;
          if (db && id) { this.db = db; this.uid = id; this.mode = "db"; return; }
        }
      } catch (e) {}
      try { localStorage.setItem("nsa-probe", "1"); localStorage.removeItem("nsa-probe"); this.mode = "local"; }
      catch (e) { this.mode = "none"; }
    })();
    return this.ready;
  },
  async load(key) {
    await this.ready;
    try {
      if (this.mode === "db") {
        const snap = await this.db.doc(`data/users/${this.uid}/${key}`).get();
        return snap.exists ? JSON.parse(JSON.stringify(snap.data())) : null;
      }
      if (this.mode === "local") return lsGet("nsa-" + key, null);
    } catch (e) { setStatus("error"); }
    return null;
  },
  save(key, getData) {
    setStatus("saving");
    clearTimeout(this.timers[key]);
    this.timers[key] = setTimeout(() => {
      const run = async () => {
        await this.ready;
        const data = JSON.parse(JSON.stringify(getData()));
        if (this.mode === "db") {
          try { await this.db.doc(`data/users/${this.uid}/${key}`).set(data); return; }
          catch (e) {
            // View-only visitors (e.g. via a public link) can't write to the account store:
            // keep their work in this browser instead.
            if (!["invalid_argument", "not_granted", "capability_disabled", "revoked"].includes(e && e.code)) throw e;
            this.mode = "local";
          }
        }
        if (this.mode === "local") localStorage.setItem("nsa-" + key, JSON.stringify(data));
      };
      this.chains[key] = (this.chains[key] || Promise.resolve()).then(run).then(() => setStatus("saved"), e => setStatus("error", e));
    }, 700);
  }
};

function setStatus(state, err) {
  const el = document.getElementById("save-status");
  if (!el) return;
  const where = Persist.mode === "db" ? "Saved to your account" : Persist.mode === "local" ? "Saved in this browser" : Persist.mode === "none" ? "Not saved: storage is blocked" : "Connecting…";
  const text = state === "saving" ? "Saving…" : state === "error" ? (err && err.code === "quota_exceeded" ? "Storage full: delete old stacks" : "Couldn't save. Try again.") : where;
  el.textContent = text;
  el.dataset.state = state || "idle";
}

function saveState() {
  App.dirty = true;
  Persist.save("state", () => ({ v: 1, stacks: App.stacks, activeId: App.activeId }));
}
function touch(stack) { if (stack.example) stack.example = false; if (stack.savedAt) { stack.savedAt = null; stack.wasSaved = true; } saveState(); renderSave(); }

const monthOf = key => key.slice(0, 7);
function loadMonth(month) {
  if (App.logs[month]) return Promise.resolve();
  if (!App.loading[month]) {
    App.loading[month] = Persist.load("log-" + month).then(d => { App.logs[month] = d && d.days ? d : { days: {} }; });
  }
  return App.loading[month];
}
function getDay(key) { return App.logs[monthOf(key)]?.days?.[key] || null; }
function ensureDay(key) {
  const m = App.logs[monthOf(key)] || (App.logs[monthOf(key)] = { days: {} });
  return m.days[key] || (m.days[key] = { taken: {}, r: {}, note: "" });
}
function saveDay(key) { const m = monthOf(key); Persist.save("log-" + m, () => App.logs[m]); }

