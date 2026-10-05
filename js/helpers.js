// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const byId = Object.fromEntries(S.map(s => [s.id, s]));
const ntById = Object.fromEntries(NTS.map(n => [n.id, n]));
const CAT = { amino_acid: "Amino acid", amino_acid_derivative: "Amino acid derivative", herbal: "Herbal", vitamin: "Vitamin", mineral: "Mineral", choline_source: "Choline source", other: "Other" };
const ROLE = { precursor: "Precursor", cofactor: "Cofactor", enzyme_inhibitor: "Enzyme blocker", modulator: "Modulator", releaser: "Releaser", reuptake_inhibitor: "Reuptake blocker", receptor_agonist: "Receptor activator", receptor_antagonist: "Receptor blocker" };
const ROLE_WEIGHT = { precursor: 1, releaser: 1, reuptake_inhibitor: 1, receptor_agonist: 1, receptor_antagonist: 1, enzyme_inhibitor: 1, modulator: 0.6, cofactor: 0 };
const EV = { strong: 3, moderate: 2, limited: 1, theoretical: 0 };
const SEV_ORDER = { major: 0, moderate: 1, minor: 2, beneficial: 3, info: 4, good: 5 };
const TIER = { core: "Foundational", deep: "Deep cut", caution: "Use caution" };
const FOOD = { empty: "Empty stomach", with_food: "With food", with_fat: "With a meal with fat", carbs: "With carbs, away from protein", any: "With or without food" };
const WHEN = { am: "Morning", pm: "Evening", any: "Any time" };
const WHEN_DEFAULT = { am: "08:00", pm: "21:00", any: "12:00" };
const METRICS = [["focus", "Focus"], ["mood", "Mood"], ["energy", "Energy"], ["calm", "Calm"], ["sleep", "Sleep last night"]];

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const glossRe = new RegExp("\\b(" + Object.keys(GLOSS).sort((a, b) => b.length - a.length).map(k => k.replace(/[-]/g, "\\-")).join("|") + ")\\b", "gi");
const gloss = s => esc(s).replace(glossRe, m => `<span class="term" tabindex="0" data-term="${m.toLowerCase()}">${m}</span>`);
const ntColor = id => `var(--c-${id})`;
const num = n => n >= 1000 ? n.toLocaleString("en-US") : String(n);
const range = (a, b) => a === b ? num(a) : `${num(a)}–${num(b)}`;
const mins = t => { const [h, m] = String(t || "00:00").split(":").map(Number); return h * 60 + m; };
const fmt12 = t => { const m = mins(t); const h = Math.floor(m / 60) % 24, mm = m % 60; return `${h % 12 || 12}:${String(mm).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`; };
const fmtGap = m => m < 60 ? `${m} min` : `${+(m / 60).toFixed(1)} h`;
const newId = () => Math.random().toString(36).slice(2, 10);
const listJoin = a => a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
const pad = n => String(n).padStart(2, "0");
const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => dateKey(new Date());
const addDays = (key, n) => { const d = new Date(key + "T12:00:00"); d.setDate(d.getDate() + n); return dateKey(d); };
const fmtDate = (key, opts = { weekday: "short", month: "short", day: "numeric" }) => new Date(key + "T12:00:00").toLocaleDateString(undefined, opts);
const elementalMg = i => { const s = byId[i.sid], d = +i.dose || 0; return /elemental/.test(s.dose[2]) ? d : d * (s.elemental || 1); };
const sameGroup = (a, b) => a === b || (!!byId[a]?.group && byId[a].group === byId[b]?.group);
const primaryNT = sid => (MAP.find(r => r[0] === sid && r[2] !== "cofactor") || MAP.find(r => r[0] === sid) || [])[1];

function fmtOnset([a, b]) {
  if (a == null) return "Builds up";
  return b >= 120 && a >= 60 ? `${range(a / 60, b / 60)} h` : `${range(a, b)} min`;
}
function fmtDur([a, b]) { return a == null ? "Ongoing" : `${range(a, b)} h`; }
const SOL = { water: "Water", fat: "Fat", both: "Water + fat" };
const TOL = { none: "None", low: "Low", moderate: "Moderate", high: "High" };
const tierBadge = s => s.tier === "core" ? "" : `<span class="tier tier-${s.tier}">${TIER[s.tier]}</span>`;

function evDots(level) {
  const n = EV[level];
  return `<span class="ev" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
}

function lsGet(k, fallback) { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

