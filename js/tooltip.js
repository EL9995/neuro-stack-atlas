// ---------------------------------------------------------------------------
// GLOSSARY TOOLTIP
// ---------------------------------------------------------------------------
const tip = document.getElementById("tip");
function showTip(el) {
  const g = GLOSS[el.dataset.term];
  if (!g) return;
  tip.innerHTML = `<b>${esc(g[0])}</b>${esc(g[1])}`;
  tip.hidden = false;
  const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
  const left = Math.min(Math.max(16, r.left), window.innerWidth - t.width - 16);
  const top = r.bottom + 8 + t.height > window.innerHeight ? r.top - t.height - 8 : r.bottom + 8;
  tip.style.left = left + "px";
  tip.style.top = top + "px";
}
function hideTip() { tip.hidden = true; }
document.addEventListener("mouseover", e => { const t = e.target.closest(".term"); t ? showTip(t) : hideTip(); });
document.addEventListener("focusin", e => {
  const t = e.target.closest(".term"); if (t) showTip(t);
  if (e.target.id === "q" && e.target.value.trim()) renderSearch(e.target.value);
});
document.addEventListener("focusout", hideTip);
document.addEventListener("scroll", hideTip, { passive: true });

