// ---------------------------------------------------------------------------
// SCANNER
// Photo of a Supplement Facts panel (or pasted text) -> Claude reads it through
// the viewer's own account (`sample` capability) -> each ingredient is matched
// to the database and explained. Without `sample`, pasted text is matched
// locally. Loaded before app.js: only declarations and listeners at top level.
// ---------------------------------------------------------------------------
var Scan = { sample: undefined, images: false, file: null, preview: null, text: "", status: "idle", result: null, error: null, ctl: null };

function initScanner() {
  if (!(window.claude && claude.use)) { Scan.sample = null; return; }
  claude.use("sample").then(s => {
    Scan.sample = s;
    if (s) s.limits().then(l => { Scan.images = !!(l && l.images); if (current === "scan") renderScanInput(); }).catch(() => {});
    if (current === "scan") renderScanInput();
  }).catch(() => { Scan.sample = null; });
}

function viewScanner() {
  return `<div class="stack">
    <div class="page-head">
      <span class="eyebrow">Scanner</span>
      <h1>Scan a supplement label.</h1>
      <p class="lede">${Scan.sample === null ? "Paste the ingredient list from the Supplement Facts panel on the bottle." : "Take a photo of the Supplement Facts panel on the bottle, or paste the ingredient list."} You'll see what each ingredient does, whether the dose is normal, and whether it clashes with your stack.</p>
    </div>
    <div id="scan-input"></div>
    <div id="scan-result"></div>
  </div>`;
}

function renderScanInput() {
  const el = document.getElementById("scan-input");
  if (!el) return;
  const ai = !!Scan.sample, photo = ai && Scan.images, busy = Scan.status === "reading";
  el.innerHTML = `<div class="scan-grid${photo ? "" : " single"}">
    ${photo ? `<div class="panel scan-photo">
      <div class="panel-head"><h3>Photo</h3><span class="hint">Supplement Facts panel, in focus</span></div>
      <label class="drop" for="scan-file">
        ${Scan.preview ? `<img src="${Scan.preview}" alt="Label photo">` : `<span class="drop-cta">Take or choose a photo</span><span class="hint">or drop an image here</span>`}
      </label>
      <input id="scan-file" type="file" accept="image/*" capture="environment" class="sr">
      ${Scan.preview ? `<button class="linkish" data-act="scan-clear-photo">Remove photo</button>` : ""}
    </div>` : ""}
    <div class="panel">
      <div class="panel-head"><h3>${photo ? "Or paste the label text" : "Paste the label text"}</h3><span class="hint">Ingredients and amounts</span></div>
      <textarea id="scan-text" rows="${photo ? 7 : 6}" placeholder="Vitamin D3 (as cholecalciferol) 50 mcg&#10;Magnesium (as magnesium oxide) 250 mg&#10;Zinc (as zinc citrate) 15 mg">${esc(Scan.text)}</textarea>
    </div>
  </div>
  <div class="scan-actions">
    ${busy ? `<button class="btn" disabled>Reading label…</button><button class="btn ghost" data-act="scan-stop">Stop</button>`
      : `<button class="btn" data-act="scan-run"${Scan.file || Scan.text.trim() ? "" : " disabled"}>Read label</button>`}
    <span class="hint">${Scan.sample === undefined ? "Checking what this device supports…"
      : ai ? "Claude reads the label using your Claude account. The first time, you'll be asked to allow it. Photos aren't saved."
      : "Basic mode: pasted text is matched against the database on this device. Amounts and forms may be missed."}</span>
  </div>`;
}

// Unit conversion into a supplement's own dose unit. null when it can't be done.
function convertDose(amount, from, sid) {
  if (amount == null || isNaN(amount)) return null;
  const to = byId[sid].dose[2].toLowerCase(), f = String(from || "").toLowerCase().replace("µg", "mcg");
  const toBase = to.startsWith("mcg") ? "mcg" : to.startsWith("iu") ? "iu" : to.startsWith("mg") ? "mg" : null;
  if (!toBase) return null;
  const fromBase = f.startsWith("mcg") ? "mcg" : f === "g" || f.startsWith("g ") ? "g" : f.startsWith("iu") ? "iu" : f.startsWith("mg") ? "mg" : null;
  if (!fromBase) return null;
  const mg = { mg: 1, g: 1000, mcg: 0.001 };
  if (toBase === "iu") return fromBase === "iu" ? amount : fromBase === "mcg" && sid === "vitamin-d3" ? amount * 40 : null;
  if (fromBase === "iu") return sid === "vitamin-d3" && toBase === "mcg" ? amount / 40 : null;
  const inMg = amount * mg[fromBase];
  return toBase === "mg" ? inMg : inMg / mg.mcg;
}

function scanPrompt(text) {
  const db = S.map(s => `${s.id} | ${s.name}${s.aka.length ? " (" + s.aka.join(", ") + ")" : ""}`).join("\n");
  return `You are reading a dietary supplement label${text ? " from the text below" : " in the attached photo"}.

List every active ingredient from the Supplement Facts panel, in order, with the amount per serving exactly as printed.
Match each one to the closest entry in the database list by id, following these rules:
- Match the specific form when the label states it, e.g. "Magnesium (as magnesium oxide)" -> magnesium-oxide, "Zinc (as zinc citrate)" -> zinc-citrate.
- If a mineral's form isn't stated, use magnesium-glycinate, zinc or iron and set formNote to "Form not listed".
- If the form differs from the database entry, still match the closest entry and describe the difference in formNote, e.g. folic acid -> l-methylfolate with formNote "Folic acid, not methylfolate"; vitamin D2 -> vitamin-d3 with formNote "D2, not D3".
- For fish oil, match only the EPA and DHA lines to omega-3 and give the total fish oil line id null, so nothing is counted twice.
- Use null for id if nothing in the list is the same substance.
- For proprietary blends, list the blend's ingredients with amount null.

Reply with only JSON in this shape:
{"product": string or null, "serving": string or null, "readable": true or false,
 "ingredients": [{"label": string, "amount": number or null, "unit": "mg" | "mcg" | "g" | "IU" | null, "id": string or null, "formNote": string or null}],
 "other": [string]}
Set "readable" to false if this isn't a supplement label or the text can't be read. "other" is the "Other ingredients" list, if any.

DATABASE (id | name (aliases)):
${db}${text ? `\n\nLABEL TEXT:\n${text.slice(0, 6000)}` : ""}`;
}

// No-AI fallback: find database names and nicknames in each line of pasted text.
function localParse(text) {
  const names = S.flatMap(s => [s.name, ...s.aka].map(n => ({ n: n.toLowerCase().replace(/\s*\(.*\)$/, ""), id: s.id })))
    .filter(x => x.n.length > 2).sort((a, b) => b.n.length - a.n.length);
  const generic = { magnesium: "magnesium-glycinate", zinc: "zinc", iron: "iron", "vitamin d": "vitamin-d3", "vitamin b6": "vitamin-b6", "vitamin b12": "vitamin-b12", "vitamin c": "vitamin-c", "vitamin k": "vitamin-k2", folate: "l-methylfolate", "folic acid": "l-methylfolate", "fish oil": "omega-3", epa: "omega-3", dha: "omega-3", copper: "copper", "pantothenic acid": "vitamin-b5" };
  const ingredients = [];
  const FORM_WORDS = /\b(as|glycinate|bisglycinate|citrate|oxide|picolinate|fumarate|sulfate|gluconate|malate|taurate|threonate|heme)\b/i;
  text.split(/\n|;|,(?!\d)(?![^(]*\))/).map(l => l.trim()).filter(Boolean).forEach(line => {
    const low = line.toLowerCase();
    let formNote = null;
    // A bare mineral with no form named: use the group's general entry and say so
    const bare = low.match(/^(magnesium|zinc|iron)\b/);
    let hit = bare && !FORM_WORDS.test(low) ? { id: generic[bare[1]] } : names.find(x => low.includes(x.n));
    if (bare && !FORM_WORDS.test(low)) formNote = "Form not listed";
    if (!hit) { const g = Object.keys(generic).sort((a, b) => b.length - a.length).find(k => low.includes(k)); if (g) { hit = { id: generic[g] }; if (["magnesium", "zinc", "iron"].includes(g)) formNote = "Form not listed"; } }
    const m = line.match(/(\d[\d,]*\.?\d*)\s*(mg|mcg|µg|iu|g)\b/i);
    if (hit || m) ingredients.push({ label: line, amount: m ? parseFloat(m[1].replace(/,/g, "")) : null, unit: m ? m[2] : null, id: hit ? hit.id : null, formNote });
  });
  // With separate EPA/DHA lines, the total fish oil line would double-count omega-3.
  if (ingredients.some(g => /\b(epa|dha)\b/i.test(g.label))) ingredients.forEach(g => { if (/fish oil/i.test(g.label) && !/\b(epa|dha)\b/i.test(g.label)) g.id = null; });
  return { product: null, serving: null, readable: ingredients.length > 0, ingredients, other: [] };
}

const SCAN_ERRORS = {
  not_granted: "Claude access wasn't allowed for this page. You can still paste text; it'll be matched in basic mode.",
  sampling_disabled: "Claude isn't available on this account, so the scanner is in basic mode.",
  rate_limited: "Too many requests right now, or your Claude usage limit was reached. Try again in a bit.",
  session_expired: "You've been signed out of Claude. Sign in again and retry.",
  image_rejected: "That image couldn't be used. Try a JPEG or PNG under 20 MB.",
  invalid_json: "The label couldn't be read cleanly. Try a sharper, closer photo of just the Supplement Facts panel.",
  refused: "Claude couldn't process that image. Try a different photo.",
  images_unavailable: "Photos aren't supported on this device. Paste the text instead."
};

async function runScan() {
  const text = Scan.text.trim();
  Scan.status = "reading"; Scan.error = null; Scan.result = null;
  renderScanInput(); renderScanResult();
  try {
    let res;
    if (Scan.sample) {
      Scan.ctl = new AbortController();
      const usePhoto = Scan.file && Scan.images;
      const opts = { signal: Scan.ctl.signal };
      if (usePhoto) opts.images = [Scan.file];
      res = await Scan.sample.json(scanPrompt(usePhoto ? "" : text), opts);
    } else {
      res = localParse(text);
    }
    Scan.result = normalizeScan(res);
    Scan.status = "done";
  } catch (e) {
    Scan.status = "idle";
    if (e && e.code === "cancelled") Scan.error = null;
    else {
      Scan.error = SCAN_ERRORS[e && e.code] || "Something went wrong reading the label. Try again.";
      if (e && ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e.code)) Scan.sample = null;
      if (e && e.code === "images_unavailable") Scan.images = false;
    }
  }
  Scan.ctl = null;
  renderScanInput(); renderScanResult();
}

// Merge lines that map to the same entry (e.g. EPA + DHA) and convert units.
function normalizeScan(res) {
  const out = { product: res && res.product || null, serving: res && res.serving || null, readable: !!(res && res.readable !== false), items: [], unknown: [], other: Array.isArray(res && res.other) ? res.other.map(String) : [] };
  (Array.isArray(res && res.ingredients) ? res.ingredients : []).forEach(g => {
    const id = g && typeof g.id === "string" && byId[g.id] ? g.id : null;
    const label = String(g && g.label || "").trim();
    if (!id) { if (label) out.unknown.push(label); return; }
    const dose = convertDose(Number(g.amount), g.unit, id);
    const prev = out.items.find(x => x.sid === id);
    if (prev) { if (dose != null) prev.dose = (prev.dose || 0) + dose; prev.labels.push(label); return; }
    out.items.push({ sid: id, dose, labels: [label], formNote: g.formNote ? String(g.formNote) : null, raw: g.amount != null ? `${g.amount} ${g.unit || ""}`.trim() : null });
  });
  if (out.items.some(x => x.sid === "omega-3")) out.unknown = out.unknown.filter(l => !/fish oil|omega/i.test(l));
  if (!out.items.length && !out.unknown.length) out.readable = false;
  return out;
}

// One time of day that suits the whole bottle (it's one pill).
function bottleTime(items, st) {
  let best = null;
  for (let t = Math.ceil(mins(st.wake) / 15) * 15; t <= mins(st.bed); t += 15) {
    const total = items.reduce((a, it) => a + scoreAt({ id: "_s", sid: it.sid, dose: it.dose || byId[it.sid].dose[0], time: WHEN_DEFAULT[byId[it.sid].when] }, t, st, st.items.filter(i => byId[i.sid])).total, 0);
    if (!best || total < best.total) best = { t, total };
  }
  return hhmm(best ? best.t : 8 * 60);
}

function doseStatus(it) {
  const s = byId[it.sid], d = it.dose;
  if (d == null) return { cls: "none", text: "Amount not listed" };
  const ul = s.group ? null : s.ul;
  if (ul && d > ul) return { cls: "over", text: "Over daily limit" };
  if (d > s.dose[1]) return { cls: "high", text: "Above typical" };
  if (d < s.dose[0]) return { cls: "low", text: "Below typical" };
  return { cls: "ok", text: "Typical dose" };
}

function renderScanResult() {
  const el = document.getElementById("scan-result");
  if (!el) return;
  if (Scan.error) { el.innerHTML = `<div class="banner warnbox">${esc(Scan.error)}</div>`; return; }
  if (Scan.status === "reading") { el.innerHTML = `<div class="empty">Reading the label… this usually takes 10–30 seconds.</div>`; return; }
  const r = Scan.result;
  if (!r) { el.innerHTML = ""; return; }
  if (!r.readable) { el.innerHTML = `<div class="banner warnbox">Couldn't find a Supplement Facts panel. Try a closer, sharper photo of just that panel, or paste the text.</div>`; return; }

  const st = active(), time = bottleTime(r.items, st);
  const asItems = r.items.map((it, k) => ({ id: "_scan" + k, sid: it.sid, dose: it.dose != null ? +it.dose.toFixed(2) : byId[it.sid].dose[0], time }));
  const serious = f => (f.sev === "major" || f.sev === "moderate") && (f.cat === "Interactions" || f.cat === "Dose");
  // Absorption-spacing pairs can't be spaced inside one pill, so they aren't "conflicts in the bottle".
  const spacingPair = f => f.ids && SEP.some(r => r.includes(f.ids[0]) && r.includes(f.ids[1]));
  const bottleAll = analyze({ ...st, items: asItems }).filter(serious);
  const inBottle = bottleAll.filter(f => !spacingPair(f));
  const base = new Set(analyze(st).filter(serious).map(f => f.title));
  const withStack = analyze({ ...st, items: [...st.items, ...asItems] }).filter(f => serious(f) && !base.has(f.title) && !bottleAll.some(b => b.title === f.title));
  const fmtDose = d => d == null ? "" : num(+(d >= 10 ? d.toFixed(0) : d.toFixed(2)));

  el.innerHTML = `<div class="stack scan-out">
    <div class="scan-head">
      <div><span class="eyebrow">${r.serving ? "Per serving: " + esc(r.serving) : "Label"}</span><h2 class="sec">${esc(r.product || "Scanned label")}</h2></div>
      ${r.items.length ? `<button class="btn" data-act="scan-add-all" data-time="${time}">Add ${r.items.length > 1 ? "all " + r.items.length : "it"} to “${esc(st.name)}” at ${fmt12(time)}</button>` : ""}
    </div>

    ${inBottle.length || withStack.length ? `<div class="checks">${[...inBottle.map(f => ({ ...f, where: "In this bottle" })), ...withStack.map(f => ({ ...f, where: "With your stack" }))].map(f => `
      <div class="check sevline-${f.sev}"><span class="sev sev-${f.sev}">${f.sev}</span>
        <div><div class="check-title">${esc(f.where)}: ${esc(f.title)}</div><p>${gloss(f.body)}</p></div></div>`).join("")}</div>` : r.items.length ? `<div class="banner okbox">No conflicts inside this bottle or with “${esc(st.name)}”.</div>` : ""}

    ${r.items.length ? `<div class="scan-items">${r.items.map((it, k) => {
      const s = byId[it.sid], ds = doseStatus(it), nt = primaryNT(s.id);
      return `<div class="scan-item" style="--nt:${nt ? ntColor(nt) : "var(--muted)"}">
        <div class="scan-item-top">
          <a href="#${s.id}" data-go="${s.id}" class="item-name">${esc(s.name)}</a>${tierBadge(s)}
          <span class="dchip d-${ds.cls}">${it.dose != null ? `${fmtDose(it.dose)} ${esc(s.dose[2])} · ` : ""}${ds.text}</span>
        </div>
        <p>${gloss(s.sum)}</p>
        <div class="scan-meta">
          <span class="hint">Typical ${range(s.dose[0], s.dose[1])} ${esc(s.dose[2])}</span>
          ${it.formNote ? `<span class="ab ab-warn">${esc(it.formNote)}</span>` : ""}
          <span class="hint">Label: ${esc(it.labels.join(" + "))}</span>
        </div>
        <div class="scan-item-act"><button class="pill chip" data-act="scan-add" data-i="${k}" data-time="${time}">+ Add to stack</button></div>
      </div>`;
    }).join("")}</div>` : ""}

    ${r.unknown.length ? `<div class="note-box"><b>Not in the database yet:</b> ${r.unknown.map(esc).join(", ")}.</div>` : ""}
    ${r.other.length ? `<p class="hint">Other ingredients: ${r.other.map(esc).join(", ")}.</p>` : ""}
    <button class="linkish" data-act="scan-reset">Scan another label</button>
  </div>`;
}

function setScanFile(file) {
  if (!file || !/^image\//.test(file.type)) return;
  if (Scan.preview) URL.revokeObjectURL(Scan.preview);
  Scan.file = file; Scan.preview = URL.createObjectURL(file);
  renderScanInput();
}

document.addEventListener("change", e => { if (e.target.id === "scan-file") setScanFile(e.target.files && e.target.files[0]); });
document.addEventListener("input", e => {
  if (e.target.id === "scan-text") {
    Scan.text = e.target.value;
    const b = document.querySelector('[data-act="scan-run"]'); if (b) b.disabled = !(Scan.file || Scan.text.trim());
  }
});
document.addEventListener("dragover", e => { if (e.target.closest && e.target.closest(".drop")) e.preventDefault(); });
document.addEventListener("drop", e => {
  const d = e.target.closest && e.target.closest(".drop");
  if (!d) return;
  e.preventDefault();
  setScanFile(e.dataTransfer.files && e.dataTransfer.files[0]);
});
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act;
  if (act === "scan-run") runScan();
  else if (act === "scan-stop") { if (Scan.ctl) Scan.ctl.abort(); }
  else if (act === "scan-clear-photo") { if (Scan.preview) URL.revokeObjectURL(Scan.preview); Scan.file = null; Scan.preview = null; renderScanInput(); }
  else if (act === "scan-reset") { if (Scan.preview) URL.revokeObjectURL(Scan.preview); Object.assign(Scan, { file: null, preview: null, text: "", result: null, error: null, status: "idle" }); renderScanInput(); renderScanResult(); window.scrollTo(0, 0); }
  else if (act === "scan-add" || act === "scan-add-all") {
    const r = Scan.result, st = active();
    if (!r) return;
    const picks = act === "scan-add" ? [r.items[+el.dataset.i]] : r.items;
    picks.forEach(it => st.items.push({ id: newId(), sid: it.sid, dose: it.dose != null ? +it.dose.toFixed(2) : byId[it.sid].dose[0], time: el.dataset.time }));
    touch(st);
    renderScanResult();
    toast(`Added ${picks.length > 1 ? picks.length + " ingredients" : esc(byId[picks[0].sid].name)} to “${esc(st.name)}”. <button data-go="stack">Open stack builder</button>`);
  }
});

