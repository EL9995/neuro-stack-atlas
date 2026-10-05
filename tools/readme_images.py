"""Take the README screenshots and the assembly-line GIF into docs/images/.

Usage: python3 tools/readme_images.py http://localhost:8003
Needs a local server for the site (python3 -m http.server 8003) and Google Chrome.
"""
import base64, json, os, subprocess, sys, tempfile, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, "shoot.py")).read().replace('if __name__ == "__main__":', "if False:"))

BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:8003"
OUT = os.path.join(HERE, "..", "docs", "images")

SCROLL = "(f => { const el = document.querySelector('%s'); scrollTo(0, el.getBoundingClientRect().top + scrollY + f * (el.offsetHeight - innerHeight)); })(%s)"

# Made-up tracker log for the tracker screenshot: 14 logged days.
SEED = r"""(() => { const pad = x => String(x).padStart(2, "0"), key = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`, logs = {};
  for (let i = 0; i < 14; i++) { const d = new Date(); d.setDate(d.getDate() - 13 + i); const k = key(d), m = k.slice(0, 7), month = logs[m] || (logs[m] = { days: {} });
    const t = i % 2 === 0, taken = { a: { sid: "caffeine", dose: 100, time: i % 4 ? "08:00" : "15:30" } }; if (t) taken.b = { sid: "l-tyrosine", dose: 1000, time: "08:00" };
    month.days[k] = { taken, r: { focus: t ? 4 : 3, mood: 3 + (i % 3 === 0 ? 1 : 0), energy: 3, calm: 3, sleep: i % 4 ? 4 : 3 }, note: "" }; }
  Object.entries(logs).forEach(([m, v]) => localStorage.setItem("nsa-log-" + m, JSON.stringify(v))); })()"""

# A small GIF encoder (global palette by popularity, LZW), run inside Chrome.
GIF_JS = r"""
async function makeGif(frames, w, h, delays) {
  const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const ctx = cv.getContext("2d");
  const pix = [];
  for (const f of frames) { ctx.drawImage(await load(f), 0, 0, w, h); pix.push(ctx.getImageData(0, 0, w, h).data); }
  // Palette: the 256 most common colors (5 bits per channel), averaged within each bin.
  const cnt = new Uint32Array(32768), sr = new Float64Array(32768), sg = new Float64Array(32768), sb = new Float64Array(32768);
  for (const d of pix) for (let i = 0; i < d.length; i += 4) { const b = ((d[i] >> 3) << 10) | ((d[i+1] >> 3) << 5) | (d[i+2] >> 3); cnt[b]++; sr[b] += d[i]; sg[b] += d[i+1]; sb[b] += d[i+2]; }
  const bins = [...cnt.keys()].filter(b => cnt[b]).sort((a, b) => cnt[b] - cnt[a]).slice(0, 256);
  const pal = bins.map(b => [sr[b] / cnt[b], sg[b] / cnt[b], sb[b] / cnt[b]].map(Math.round));
  while (pal.length < 256) pal.push([0, 0, 0]);
  const near = new Int16Array(32768).fill(-1);
  const idxOf = b => { if (near[b] >= 0) return near[b]; const r = ((b >> 10) << 3) + 4, g = (((b >> 5) & 31) << 3) + 4, bl = ((b & 31) << 3) + 4; let best = 0, bd = 1e9;
    for (let k = 0; k < 256; k++) { const p = pal[k], dd = (p[0]-r)**2 + (p[1]-g)**2 + (p[2]-bl)**2; if (dd < bd) { bd = dd; best = k; } } return near[b] = best; };
  const out = [], u16 = v => out.push(v & 255, v >> 8), str = s => [...s].forEach(c => out.push(c.charCodeAt(0)));
  str("GIF89a"); u16(w); u16(h); out.push(0xF7, 0, 0); pal.forEach(p => out.push(...p));
  out.push(0x21, 0xFF, 11); str("NETSCAPE2.0"); out.push(3, 1, 0, 0, 0);   // loop forever
  pix.forEach((d, fi) => {
    const ind = new Uint8Array(w * h); for (let i = 0, j = 0; i < d.length; i += 4, j++) ind[j] = idxOf(((d[i] >> 3) << 10) | ((d[i+1] >> 3) << 5) | (d[i+2] >> 3));
    out.push(0x21, 0xF9, 4, 0); u16(delays[fi]); out.push(0, 0);
    out.push(0x2C); u16(0); u16(0); u16(w); u16(h); out.push(0);
    const data = lzw(ind, 8); out.push(8);
    for (let i = 0; i < data.length; i += 255) { const blk = data.slice(i, i + 255); out.push(blk.length, ...blk); }
    out.push(0);
  });
  out.push(0x3B);
  let s = ""; for (let i = 0; i < out.length; i += 8192) s += String.fromCharCode(...out.slice(i, i + 8192));
  return btoa(s);
}
function lzw(ind, minCode) {
  const clear = 1 << minCode, eoi = clear + 1, out = [];
  let size = minCode + 1, next = eoi + 1, dict = new Map(), cur = 0, bits = 0;
  const write = code => {
    cur |= code << bits; bits += size; while (bits >= 8) { out.push(cur & 255); cur >>= 8; bits -= 8; }
    if (code === clear) size = minCode + 1; else if (next > (1 << size) - 1 && size < 12) size++;
  };
  write(clear);
  let prefix = ind[0];
  for (let i = 1; i < ind.length; i++) {
    const k = ind[i], key = prefix * 256 + k, hit = dict.get(key);
    if (hit !== undefined) { prefix = hit; continue; }
    write(prefix);
    if (next < 4096) dict.set(key, next++); else { write(clear); dict = new Map(); next = eoi + 1; }
    prefix = k;
  }
  write(prefix); write(eoi);
  if (bits > 0) out.push(cur & 255);
  return out;
}
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    prof = tempfile.mkdtemp()
    proc = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={PORT}", f"--user-data-dir={prof}", "--hide-scrollbars", "about:blank"],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(80):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json")); break
            except Exception:
                time.sleep(.5)
        c = CDP([t for t in tabs if t["type"] == "page"][0]["webSocketDebuggerUrl"])
        c.call("Page.enable"); c.call("Runtime.enable"); c.call("Network.enable"); c.call("Network.setCacheDisabled", cacheDisabled=True)
        c.call("Emulation.setDeviceMetricsOverride", width=1280, height=800, deviceScaleFactor=1, mobile=False)
        c.call("Emulation.setEmulatedMedia", features=[{"name": "prefers-color-scheme", "value": "light"}])
        ev = lambda e: c.call("Runtime.evaluate", expression=e, awaitPromise=True, returnByValue=True)["result"].get("value")

        def go(h, wait=2.0):
            c.call("Page.navigate", url="about:blank"); time.sleep(.2)
            c.call("Page.navigate", url=f"{BASE}/#{h}"); time.sleep(wait)

        def shot(name, clip=None):
            kw = {"format": "jpeg", "quality": 85}
            if clip: kw["clip"] = {**clip, "scale": 1}
            open(os.path.join(OUT, name), "wb").write(base64.b64decode(c.call("Page.captureScreenshot", **kw)["data"]))
            print("saved", name)

        go(""); shot("home.jpg")
        ev(SCROLL % ("#ns", .5)); time.sleep(1.5); shot("story.jpg")
        ev(SCROLL % ("#pc", .45)); time.sleep(1.5); shot("start-smart.jpg")
        go("dopamine"); ev(SCROLL % ("#ps", .10)); time.sleep(1.5); shot("nt-intro.jpg")
        ev(SCROLL % ("#ps", 1)); time.sleep(2)
        ev("document.querySelectorAll('.ps-hit')[1].click()"); time.sleep(.4); shot("nt-map.jpg")
        ev("(()=>{const t=document.getElementById('sup-tab-0');t.click();scrollTo(0,t.getBoundingClientRect().top+scrollY-130)})()"); time.sleep(.5)
        xy = ev("(()=>{const r=document.querySelector('.sup-panel:not([hidden]) .tier-ix').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()")
        c.call("Input.dispatchMouseEvent", type="mouseMoved", x=xy[0], y=xy[1]); time.sleep(.3); shot("supplements.jpg")
        go("enzyme:tyrosine-hydroxylase"); shot("enzyme.jpg")
        go("stack"); shot("stack-builder.jpg")
        go(""); ev("localStorage.clear()"); ev(SEED); go("track", 2.5)
        ev("document.getElementById('t-insights').scrollIntoView({block:'center'})"); time.sleep(.4); shot("tracker.jpg")

        # GIF: the dopamine assembly line from the full pipeline to the end map
        go("dopamine"); c.call("Emulation.setEmulatedMedia", features=[{"name": "prefers-color-scheme", "value": "dark"}])
        frames, delays, steps = [], [], 56
        for i in range(steps):
            f = .14 + (1 - .14) * i / (steps - 1)
            ev(SCROLL % ("#ps", f)); time.sleep(.25)
            # capture boxes are measured from the top of the page, not the window
            r = ev("(()=>{const r=document.getElementById('ps-stage').getBoundingClientRect();return [r.x+scrollX,r.y+scrollY,r.width,r.height]})()")
            data = c.call("Page.captureScreenshot", format="png", clip={"x": r[0], "y": r[1], "width": r[2], "height": r[3], "scale": .5})["data"]
            frames.append("data:image/png;base64," + data); delays.append(150 if i in (0, steps - 1) else 11)
        w, h = round(r[2] * .5), round(r[3] * .5)
        ev(GIF_JS)
        c.call("Runtime.evaluate", expression=f"window.__frames = {json.dumps(frames)}")
        gif = ev(f"makeGif(window.__frames, {w}, {h}, {json.dumps(delays)})")
        open(os.path.join(OUT, "assembly-line.gif"), "wb").write(base64.b64decode(gif))
        print("saved assembly-line.gif", w, "x", h)
    finally:
        proc.terminate()


if __name__ == "__main__":
    main()
