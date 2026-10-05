// ---------------------------------------------------------------------------
// VIEWS: TRACKER
// ---------------------------------------------------------------------------
function viewTracker() {
  const key = App.trackDate, isToday = key === todayKey();
  return `<div class="stack">
    <div class="page-head">
      <span class="eyebrow">Tracker</span>
      <h1>Log what you took and how you felt.</h1>
      <p class="lede">A few seconds a day is enough. After a couple of weeks the history shows whether a stack is actually doing anything for you.</p>
    </div>
    <div class="day-nav">
      <button class="btn ghost icon" data-act="day" data-d="-1" aria-label="Previous day">‹</button>
      <h2 class="day-title">${isToday ? "Today, " : ""}${esc(fmtDate(key, { weekday: "long", month: "short", day: "numeric" }))}</h2>
      <button class="btn ghost icon" data-act="day" data-d="1" aria-label="Next day"${isToday ? " disabled" : ""}>›</button>
      ${isToday ? "" : `<button class="btn ghost" data-act="day" data-d="0">Today</button>`}
      <div class="field inline">
        <label for="t-stack">Following</label>
        <select id="t-stack">${App.stacks.map(s => `<option value="${s.id}"${s.id === App.activeId ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select>
      </div>
    </div>
    <div id="t-day"></div>
    <section>
      <h2 class="sec">Last 14 days</h2>
      <div id="t-history"></div>
    </section>
    <section>
      <h2 class="sec">Insights</h2>
      <p class="sec-intro">Your last two weeks, matched against what you took. Clues, not proof: change one thing at a time.</p>
      <div id="t-insights"></div>
    </section>
  </div>`;
}

function renderTrackDay() {
  const el = document.getElementById("t-day");
  if (!el) return;
  const key = App.trackDate;
  if (!App.logs[monthOf(key)]) { el.innerHTML = `<div class="empty">Loading your log…</div>`; loadMonth(monthOf(key)).then(() => { renderTrackDay(); renderHistory(); }); return; }
  const day = getDay(key) || { taken: {}, r: {}, note: "" };
  const items = [...active().items].filter(i => byId[i.sid]).sort((a, b) => mins(a.time) - mins(b.time));
  const extra = Object.entries(day.taken).filter(([id]) => !items.some(i => i.id === id));
  const takenCount = items.filter(i => day.taken[i.id]).length;

  el.innerHTML = `<div class="track-grid">
    <div class="panel">
      <div class="panel-head"><h3>Checklist</h3><span class="hint">${takenCount} of ${items.length} taken</span></div>
      ${items.length ? `<div class="checklist">${items.map(i => {
        const s = byId[i.sid], t = day.taken[i.id];
        return `<label class="tick${t ? " done" : ""}">
          <input type="checkbox" data-act="take" data-item="${i.id}"${t ? " checked" : ""}>
          <span class="tick-time">${fmt12(i.time)}</span>
          <span class="tick-name">${esc(s.name)}</span>
          <span class="tick-dose">${num(+i.dose || 0)} ${esc(s.dose[2])}</span>
        </label>`;
      }).join("")}</div>` : `<div class="empty small">This stack is empty. Add supplements in the stack builder.</div>`}
      ${extra.length ? `<div class="extra"><span class="eyebrow">Also logged this day</span>${extra.map(([, t]) => `<div class="extra-row">${esc(byId[t.sid]?.name || t.sid)} · ${num(+t.dose || 0)} ${esc(t.unit || "")}</div>`).join("")}</div>` : ""}
    </div>
    <div class="panel">
      <div class="panel-head"><h3>How did you feel?</h3><span class="hint">1 = poor, 5 = great</span></div>
      <div class="ratings">${METRICS.map(([m, label]) => `
        <div class="rating">
          <span class="rating-label">${label}</span>
          <div class="seg" role="group" aria-label="${label}">${[1, 2, 3, 4, 5].map(v => `<button data-act="rate" data-m="${m}" data-v="${v}" aria-pressed="${day.r[m] === v}">${v}</button>`).join("")}</div>
        </div>`).join("")}</div>
      <label for="t-note" class="rating-label">Notes</label>
      <textarea id="t-note" rows="3" placeholder="Anything worth remembering: sleep, caffeine, stress, side effects…">${esc(day.note)}</textarea>
    </div>
  </div>`;
}

function renderInsights() {
  const el = document.getElementById("t-insights");
  if (!el) return;
  const r = insights(App.trackDate);
  if (!r.enough) {
    el.innerHTML = `<div class="ins"><p class="ins-verdict muted">Rate ${5 - r.rated} more day${5 - r.rated === 1 ? "" : "s"} to unlock insights.</p>
      <div class="ins-progress" aria-hidden="true">${[0, 1, 2, 3, 4].map(i => `<i class="${i < r.rated ? "on" : ""}"></i>`).join("")}</div></div>`;
    return;
  }
  const arrow = { down: "↓", up: "↑", flat: "" };
  const top = r.actions.slice(0, 3);
  el.innerHTML = `<div class="ins">
    ${r.safety ? `<div class="ins-safety">${esc(r.safety)}</div>` : ""}
    <p class="ins-verdict">${esc(r.verdict)}</p>
    <div class="ins-metrics">${r.metrics.map(x => `<span class="mchip ${x.dir}"><span>${esc(x.label)}</span> <b>${arrow[x.dir]}</b> ${x.dir === "flat" ? x.last.toFixed(1) : `${x.first.toFixed(1)} → ${x.last.toFixed(1)}`}</span>`).join("")}</div>
    ${top.length ? `<div class="ins-block"><span class="eyebrow">Try this</span><ol class="ins-list">${top.map(a => `
      <li><details><summary>${esc(a.text)}</summary><p>${esc(a.why)}</p></details></li>`).join("")}</ol></div>` : ""}
    ${r.keep.length ? `<div class="ins-block"><span class="eyebrow">Keep</span><p class="ins-keep">${esc(r.keep[0])}</p></div>` : ""}
    ${r.note ? `<p class="hint">${esc(r.note)}</p>` : ""}
  </div>`;
}

function spark(values) {
  const W = 140, H = 40, pts = values.map((v, i) => v == null ? null : [6 + i * (W - 12) / (values.length - 1), H - 6 - (v - 1) / 4 * (H - 12)]);
  let path = "", pen = false;
  pts.forEach(p => { if (!p) { pen = false; return; } path += (pen ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); pen = true; });
  const last = [...pts].reverse().find(Boolean);
  return `<svg viewBox="0 0 ${W} ${H}" class="spark" preserveAspectRatio="none" aria-hidden="true">
    <line x1="0" x2="${W}" y1="${H - 6 - 2 / 4 * (H - 12)}" y2="${H - 6 - 2 / 4 * (H - 12)}" class="spark-mid"/>
    <path d="${path}" class="spark-line"/>
    ${pts.map(p => p ? `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${p === last ? 3 : 1.8}" class="spark-dot${p === last ? " last" : ""}"/>` : "").join("")}
  </svg>`;
}

function renderHistory() {
  const el = document.getElementById("t-history");
  if (!el) return;
  const days = Array.from({ length: 14 }, (_, i) => addDays(App.trackDate, i - 13));
  const months = [...new Set(days.map(monthOf))];
  if (months.some(m => !App.logs[m])) { Promise.all(months.map(loadMonth)).then(renderHistory); el.innerHTML = `<div class="empty">Loading…</div>`; return; }
  renderInsights();
  const recs = days.map(getDay);
  const anyData = recs.some(r => r && (Object.keys(r.r || {}).length || Object.keys(r.taken || {}).length));
  if (!anyData) { el.innerHTML = `<div class="empty">Your history shows up here once you've logged a few days: a trend line for each rating, plus what you took.</div>`; return; }

  const cards = METRICS.map(([m, label]) => {
    const vals = recs.map(r => r?.r?.[m] ?? null);
    const got = vals.filter(v => v != null);
    const avg = got.length ? (got.reduce((a, b) => a + b, 0) / got.length).toFixed(1) : "–";
    return `<div class="hist-card"><div class="hist-top"><span>${label}</span><b>${avg}</b></div>${spark(vals)}<span class="hint">14-day average</span></div>`;
  }).join("");
  const maxTaken = Math.max(1, ...recs.map(r => r ? Object.keys(r.taken || {}).length : 0));
  const bars = recs.map((r, i) => {
    const n = r ? Object.keys(r.taken || {}).length : 0;
    return `<button class="adh${days[i] === App.trackDate ? " sel" : ""}" data-act="go-day" data-date="${days[i]}" title="${esc(fmtDate(days[i]))}: ${n} taken">
      <span style="height:${n / maxTaken * 100}%"></span><small>${fmtDate(days[i], { day: "numeric" })}</small></button>`;
  }).join("");
  const recent = days.map((d, i) => [d, recs[i]]).reverse().filter(([, r]) => r && (Object.keys(r.r || {}).length || Object.keys(r.taken || {}).length || r.note)).slice(0, 7);

  el.innerHTML = `<div class="hist-grid">${cards}</div>
    <div class="panel">
      <div class="panel-head"><h3>Doses logged per day</h3><span class="hint">Tap a day to open it</span></div>
      <div class="adh-row">${bars}</div>
    </div>
    <div class="recent">${recent.map(([d, r]) => `
      <button class="recent-row" data-act="go-day" data-date="${d}">
        <span class="recent-date">${esc(fmtDate(d))}</span>
        <span class="recent-taken">${Object.values(r.taken || {}).map(t => esc(byId[t.sid]?.name || t.sid)).join(", ") || "Nothing logged"}</span>
        <span class="recent-r">${METRICS.filter(([m]) => r.r?.[m]).map(([m, l]) => `<span class="pill">${l.split(" ")[0]} ${r.r[m]}</span>`).join("")}</span>
        ${r.note ? `<span class="recent-note">${esc(r.note)}</span>` : ""}
      </button>`).join("")}</div>`;
}

