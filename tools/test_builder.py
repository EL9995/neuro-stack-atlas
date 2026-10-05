"""Click-through test of the Stack builder: tours, browse-by-neurotransmitter, search.
Usage: python3 tools/test_builder.py [base-url]   (screenshots go to /tmp/nsa-builder-*.png)
"""
import base64, json, os, subprocess, sys, tempfile, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, "shoot.py")).read().replace('if __name__ == "__main__":', "if False:"))
BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:8003"
prof = tempfile.mkdtemp()
proc = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={PORT}", f"--user-data-dir={prof}", "--hide-scrollbars", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(80):
        try: tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json")); break
        except Exception: time.sleep(.5)
    c = CDP([t for t in tabs if t["type"] == "page"][0]["webSocketDebuggerUrl"])
    c.call("Page.enable"); c.call("Runtime.enable"); c.call("Network.enable"); c.call("Network.setCacheDisabled", cacheDisabled=True)
    c.call("Emulation.setDeviceMetricsOverride", width=1280, height=860, deviceScaleFactor=1, mobile=False)
    def ev(e):
        r = c.call("Runtime.evaluate", expression=e, awaitPromise=True, returnByValue=True)
        if "exceptionDetails" in r: print("  JS error:", r["exceptionDetails"].get("exception", {}).get("description", "")[:200])
        return r["result"].get("value")
    shot = lambda n: open(f"/tmp/nsa-builder-{n}.png", "wb").write(base64.b64decode(c.call("Page.captureScreenshot", format="png")["data"]))
    c.call("Page.navigate", url=f"{BASE}/#stack"); time.sleep(2)
    ev("window.__e=[];addEventListener('error',e=>__e.push(e.message))")
    print("steps:", ev("[...document.querySelectorAll('.bstep .pr-h')].map(h=>h.textContent).join(' | ')"))
    print("tour prompt shown:", ev("!!document.querySelector('.tour-prompt')"))
    shot("top")
    for tour in ("page", "meals"):
        ev(f"document.querySelector('[data-tour=\"{tour}\"]').click()"); time.sleep(.5)
        n = ev("TOUR.steps ? TOUR.steps.length : 0"); seen = []
        for i in range(n):
            seen.append(ev("document.querySelector('.tour-pop h3').textContent"))
            if i == 2: shot(f"tour-{tour}")
            ev("document.querySelector('.tour-pop [data-tour-act=next], .tour-pop [data-tour-act=end]:not(.linkish)').click()"); time.sleep(.35)
        print(f"{tour} tour ({n} stops):", " / ".join(seen), "| closed:", ev("!TOUR.steps"))
    # Browse by neurotransmitter, then add from it
    ev("document.querySelector('[data-act=browse-nt][data-nt=dopamine]').click()"); time.sleep(.3)
    print("browse groups:", ev("[...document.querySelectorAll('.browse-group h4')].map(h=>h.textContent+' '+h.parentElement.querySelectorAll('.browse-item').length).join(', ')"))
    before = ev("active().items.length")
    ev("document.querySelector('.browse-item:not(.has) [data-act=add-supp]').click()"); time.sleep(.4)
    print("items before/after add:", before, ev("active().items.length"), "| button now:", ev("document.querySelector('.browse-item.has [data-act=add-supp]')?.textContent"))
    ev("document.getElementById('bs-browse').scrollIntoView({block:'start'}); scrollBy(0,-150)"); time.sleep(.3); shot("browse")
    # Search
    ev("const q=document.getElementById('add-q'); q.value='theanine'; q.dispatchEvent(new Event('input',{bubbles:true}))"); time.sleep(.3)
    print("search results:", ev("document.querySelectorAll('#add-results .result').length"))
    print("errors:", ev("__e"))
finally:
    proc.terminate()
