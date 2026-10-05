"""Build screenshots/compare.html: before | after | changed pixels, for every shot."""
import json, os
names = sorted({f[:-4] for d in ("screenshots/before", "screenshots/after") for f in os.listdir(d) if f.endswith(".png")})
html = """<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>Before / after</title>
<style>
body{font:14px -apple-system,system-ui,sans-serif;margin:0;padding:20px;background:#f3f6fa;color:#0a1226}
h1{font-size:20px;margin:0 0 4px}#sum{margin:0 0 18px;color:#55627c}
.shot{background:#fff;border:1px solid #d5dce8;border-radius:10px;padding:12px;margin:0 0 16px}
.shot h2{font-size:14px;margin:0 0 8px;display:flex;gap:10px;align-items:center}
.ok{color:#1f8a4c}.chg{color:#b26a00}.big{color:#c0262d}
.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.row figure{margin:0}.row figcaption{font-size:12px;color:#55627c;margin-bottom:4px}
.row img,.row canvas{width:100%;max-height:900px;object-fit:contain;object-position:top;border:1px solid #d5dce8;background:#fff}
label{font-size:13px;color:#55627c}
</style>
<h1>Before vs after</h1>
<p id="sum">Comparing…</p>
<label><input type="checkbox" id="only"> Show only screenshots with changes</label>
<div id="list"></div>
<script>
const NAMES = """ + json.dumps(names) + """;
const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src + "?" + Date.now(); });
(async () => {
  const list = document.getElementById("list"); let same = 0;
  for (const n of NAMES) {
    const [a, b] = await Promise.all([load("before/" + n + ".png"), load("after/" + n + ".png")]);
    const el = document.createElement("div"); el.className = "shot";
    let pct = 100, note = !a ? "new screenshot" : !b ? "removed" : "missing";
    const cv = document.createElement("canvas");
    if (a && b) {
      const w = Math.max(a.width, b.width), h = Math.max(a.height, b.height);
      const ctx = (c => (c.width = w, c.height = h, c.getContext("2d")))(document.createElement("canvas"));
      ctx.drawImage(a, 0, 0); const A = ctx.getImageData(0, 0, w, h).data; ctx.clearRect(0, 0, w, h);
      ctx.drawImage(b, 0, 0); const B = ctx.getImageData(0, 0, w, h).data;
      cv.width = w; cv.height = h; const dctx = cv.getContext("2d"); dctx.drawImage(b, 0, 0);
      const D = dctx.getImageData(0, 0, w, h); let diff = 0;
      for (let i = 0; i < A.length; i += 4) {
        const d = Math.abs(A[i]-B[i]) + Math.abs(A[i+1]-B[i+1]) + Math.abs(A[i+2]-B[i+2]);
        if (d > 24) { diff++; D.data[i] = 255; D.data[i+1] = 0; D.data[i+2] = 200; D.data[i+3] = 255; }
        else { D.data[i+3] = 60; }
      }
      dctx.putImageData(D, 0, 0);
      pct = diff / (w * h) * 100; note = pct === 0 ? "identical" : pct.toFixed(2) + "% of pixels differ";
      if (a.width !== b.width || a.height !== b.height) note += ` · size ${a.width}×${a.height} → ${b.width}×${b.height}`;
    }
    if (pct === 0) same++;
    el.dataset.changed = pct > 0;
    el.innerHTML = `<h2>${n} <span class="${pct === 0 ? "ok" : pct < 2 ? "chg" : "big"}">${note}</span></h2>
      <div class="row"><figure><figcaption>Before</figcaption><a href="before/${n}.png" target="_blank"><img src="before/${n}.png"></a></figure>
      <figure><figcaption>After</figcaption><a href="after/${n}.png" target="_blank"><img src="after/${n}.png"></a></figure>
      <figure><figcaption>Changed pixels (pink)</figcaption></figure></div>`;
    el.querySelector("figure:last-child").appendChild(cv);
    list.appendChild(el);
  }
  document.getElementById("sum").textContent = `${same} of ${NAMES.length} screenshots pixel-identical. Tick the box to see only what changed.`;
})();
document.getElementById("only").addEventListener("change", e => document.querySelectorAll(".shot").forEach(s => s.hidden = e.target.checked && s.dataset.changed !== "true"));
</script>"""
open("screenshots/compare.html", "w").write(html)
print(len(names), "shots")
