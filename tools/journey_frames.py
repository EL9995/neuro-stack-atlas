"""Journey frames: screenshots of one tour chapter at evenly spaced scroll points, plus a contact sheet
(all frames on one labelled image) for quick review.

Usage:  python3 tools/journey_frames.py <chapter> [frames] [--phone] [--base URL]
        python3 tools/journey_frames.py stomach          (9 frames, desktop 1280x800)
        python3 tools/journey_frames.py swallow 6 --phone
Chapter keys are the ones in content/journey.js (swallow, stomach, ...). "start" captures the
two-pill screen and the flight.
Output: screenshots/journey/<chapter>[-phone]/NN-<point>.png and screenshots/journey/<chapter>[-phone]-sheet.png
The sheet is built by the local server, so run tools/serve.py first (default http://localhost:8010).
"""
import base64, html, json, os, subprocess, sys, tempfile, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:]]
phone = "--phone" in args
base = args[args.index("--base") + 1].rstrip("/") if "--base" in args else "http://localhost:8010"
pos = [a for i, a in enumerate(args) if not a.startswith("--") and (i == 0 or args[i - 1] != "--base")]
if not pos: sys.exit(__doc__)
chapter, count = pos[0], int(pos[1]) if len(pos) > 1 else 9
sys.argv = sys.argv[:1]
exec(open(os.path.join(HERE, "shoot.py")).read().replace('if __name__ == "__main__":', "if False:"))

ROOT = os.path.dirname(HERE)
name = chapter + ("-phone" if phone else "")
out = os.path.join(ROOT, "screenshots", "journey", name)
os.makedirs(out, exist_ok=True)
for f in os.listdir(out):
    if f.endswith(".png"): os.remove(os.path.join(out, f))
W, H, DPR = (390, 844, 2) if phone else (1280, 800, 1)

proc = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={PORT}", f"--user-data-dir={tempfile.mkdtemp()}", "--hide-scrollbars", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(80):
        try: tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json")); break
        except Exception: time.sleep(.5)
    c = CDP([t for t in tabs if t["type"] == "page"][0]["webSocketDebuggerUrl"])
    c.call("Page.enable"); c.call("Runtime.enable"); c.call("Network.setCacheDisabled", cacheDisabled=True)
    c.call("Emulation.setDeviceMetricsOverride", width=W, height=H, deviceScaleFactor=DPR, mobile=phone)
    ev = lambda e: c.call("Runtime.evaluate", expression=e, returnByValue=True, awaitPromise=True)["result"].get("value")
    def shot(fname):
        open(os.path.join(out, fname), "wb").write(base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"]))
    c.call("Page.navigate", url=f"{base}/#journey"); time.sleep(2.5)
    ev("window.__e = []; addEventListener('error', e => __e.push(e.message))")
    frames = []
    if chapter == "start":
        shot("00-pills.png"); frames.append(("00-pills.png", "two pills"))
        ev("document.querySelector('[data-journey=start]').click()")
        for i, t in enumerate((0.25, 0.5, 0.8, 1.6)):
            time.sleep(t - (0 if i == 0 else (0.25, 0.5, 0.8)[i - 1])); f = f"{i + 1:02d}-flight-{t}s.png"; shot(f); frames.append((f, f"{t}s after click"))
    else:
        if not ev(f"!!JOURNEY.{chapter}Choreo"): sys.exit(f"Unknown chapter '{chapter}'. Keys: " + ev("JY_CHAPTERS.map(c => c.key).join(', ')"))
        ev("document.querySelector('[data-journey=start]').click()"); time.sleep(2.5)
        for i in range(count):
            q = round(i / (count - 1), 3) if count > 1 else 0
            ev(f"jyGoto('{chapter}', {q})"); time.sleep(0.8)
            f = f"{i:02d}-{q:.2f}.png"; shot(f)
            frames.append((f, f"{q:.2f} · " + (ev("document.querySelector('.jy-t').textContent") or "")))
    errors = ev("__e")

    # Contact sheet: an HTML page of the frames (served by the local server), screenshotted whole.
    cols = 3 if not phone else 5
    tile = 420 if not phone else 220
    cells = "".join(f'<figure><img src="{name}/{f}"><figcaption>{html.escape(label)}</figcaption></figure>' for f, label in frames)
    page = f"""<!doctype html><meta charset="utf-8"><style>
      body {{ margin: 0; padding: 16px; background: #111; color: #ccc; font: 13px -apple-system, sans-serif; }}
      h1 {{ font-size: 15px; margin: 0 0 12px; color: #fff; }}
      .g {{ display: grid; grid-template-columns: repeat({cols}, {tile}px); gap: 12px; }}
      figure {{ margin: 0; }} img {{ width: {tile}px; display: block; border-radius: 6px; }}
      figcaption {{ margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
    </style><h1>Journey · {html.escape(name)} · {W}x{H}</h1><div class="g">{cells}</div>"""
    sheet_html = os.path.join(ROOT, "screenshots", "journey", f"{name}-sheet.html")
    open(sheet_html, "w").write(page)
    c.call("Emulation.setDeviceMetricsOverride", width=cols * (tile + 12) + 20, height=400, deviceScaleFactor=1, mobile=False)
    c.call("Page.navigate", url=f"{base}/screenshots/journey/{name}-sheet.html"); time.sleep(1.5)
    h = ev("document.documentElement.scrollHeight")
    c.call("Emulation.setDeviceMetricsOverride", width=cols * (tile + 12) + 20, height=h, deviceScaleFactor=1, mobile=False); time.sleep(.5)
    sheet = os.path.join(ROOT, "screenshots", "journey", f"{name}-sheet.png")
    open(sheet, "wb").write(base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"]))
    print(f"{len(frames)} frames in {os.path.relpath(out, ROOT)}/")
    print(f"sheet: {os.path.relpath(sheet, ROOT)}")
    print("page errors:", errors or "none")
finally:
    proc.terminate()
