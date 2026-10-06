// ---------------------------------------------------------------------------
// CLICK-THROUGH TOURS
// Highlights one part of the page at a time with a short explanation.
// Never blocks the page: Skip, Escape, or clicking outside ends it.
// Steps live in content/stack-builder.js (BUILDER_TEXT.tours).
// opts.within: only the tour steps inside this element (one builder step at a time).
// opts.onSkip: what the popup's Skip button does instead of just closing.
// ---------------------------------------------------------------------------
const TOUR = { steps: null, i: 0, spot: null, pop: null, onSkip: null };

function startTour(name, opts = {}) {
  const all = (BUILDER_TEXT.tours || {})[name] || [];
  TOUR.steps = all.filter(s => { const el = document.querySelector(s.target); return el && el.getClientRects().length && (!opts.within || opts.within.contains(el)); });   // skip parts that aren't on the page (or are folded away) right now
  TOUR.onSkip = opts.onSkip || null;
  if (!TOUR.steps.length) return;
  lsSet("nsa-tourSeen", true);
  document.querySelector(".tour-prompt")?.remove();
  if (!TOUR.spot) {
    TOUR.spot = Object.assign(document.createElement("div"), { className: "tour-spot" });
    TOUR.pop = Object.assign(document.createElement("div"), { className: "tour-pop" });
    TOUR.pop.setAttribute("role", "dialog");
    document.body.append(TOUR.spot, TOUR.pop);
  }
  TOUR.i = 0; tourShow();
}

function tourShow() {
  const st = TOUR.steps[TOUR.i], el = document.querySelector(st.target), N = BUILDER_TEXT.tourNav;
  if (!el) { tourEnd(); return; }
  el.scrollIntoView({ block: "center", behavior: "auto" });
  const last = TOUR.i === TOUR.steps.length - 1;
  TOUR.pop.innerHTML = `<span class="tour-count">${TOUR.i + 1} ${esc(N.of)} ${TOUR.steps.length}</span>
    <h3>${esc(st.title)}</h3><p>${esc(st.text)}</p>
    <div class="tour-btns">
      <button class="linkish" data-tour-act="${TOUR.onSkip ? "skip" : "end"}">${esc(N.skip)}</button>
      <span>${TOUR.i ? `<button class="btn ghost small" data-tour-act="back">${esc(N.back)}</button>` : ""}
      <button class="btn small" data-tour-act="${last ? "end" : "next"}">${esc(last ? N.done : N.next)}</button></span>
    </div>`;
  TOUR.pop.setAttribute("aria-label", st.title);
  TOUR.spot.hidden = TOUR.pop.hidden = false;
  tourPlace();
  TOUR.pop.querySelector(`[data-tour-act="${last ? "end" : "next"}"]`).focus({ preventScroll: true });
}

function tourPlace() {
  if (!TOUR.steps || TOUR.spot.hidden) return;
  const el = document.querySelector(TOUR.steps[TOUR.i].target); if (!el) return;
  const r = el.getBoundingClientRect(), pad = 6;
  Object.assign(TOUR.spot.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
  const pw = TOUR.pop.offsetWidth, ph = TOUR.pop.offsetHeight, vw = innerWidth, vh = innerHeight;
  const below = r.bottom + 14 + ph < vh, top = below ? r.bottom + 14 : Math.max(12, r.top - ph - 14);
  const left = Math.min(Math.max(12, r.left), vw - pw - 12);
  Object.assign(TOUR.pop.style, { left: left + "px", top: top + "px" });
}

function tourEnd() {
  if (!TOUR.spot) return;
  TOUR.spot.hidden = TOUR.pop.hidden = true; TOUR.steps = null;
}

document.addEventListener("click", e => {
  if (!TOUR.steps) return;
  const b = e.target.closest("[data-tour-act]");
  if (b) {
    const a = b.dataset.tourAct;
    if (a === "next") { TOUR.i++; tourShow(); } else if (a === "back") { TOUR.i--; tourShow(); }
    else if (a === "skip") TOUR.onSkip(); else tourEnd();
    return;
  }
  if (!e.target.closest(".tour-pop") && !e.target.closest("[data-act='tour'],[data-act='step-next'],[data-act='tour-skip']")) tourEnd();   // clicking the page ends the tour
});
document.addEventListener("keydown", e => {
  if (!TOUR.steps) return;
  if (e.key === "Escape") tourEnd();
  if (e.key === "ArrowRight" && TOUR.i < TOUR.steps.length - 1) { TOUR.i++; tourShow(); }
  if (e.key === "ArrowLeft" && TOUR.i > 0) { TOUR.i--; tourShow(); }
});
window.addEventListener("scroll", () => tourPlace(), { passive: true });
window.addEventListener("resize", () => tourPlace());
window.addEventListener("hashchange", () => tourEnd());
