"""Click-through test of the Stack builder: step-by-step opening, tours, browse-by-neurotransmitter, search, step 6 save and the Tracker gate.
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
    # Fresh visitor: only step 1 is open, the rest are locked
    open_steps = "[...document.querySelectorAll('.bstep:not(.locked) .pr-h')].map(h=>h.textContent).join(' | ')"
    print("open at start:", ev(open_steps), "| locked:", ev("document.querySelectorAll('.bstep.locked').length"))
    print("header buttons:", ev("[...document.querySelectorAll('.page-head button')].map(b=>b.textContent).join(' | ')"))
    # Take the tour: step 1 plus its tour; each Next opens one more step and plays its part
    ev("document.querySelector('[data-tour=\"page\"]').click()"); time.sleep(.6)
    for k in range(6):
        n = ev("TOUR.steps ? TOUR.steps.length : 0"); seen = []
        for i in range(n):
            seen.append(ev("document.querySelector('.tour-pop h3').textContent"))
            if k == 2 and i == 0: shot("tour-page")
            ev("document.querySelector('.tour-pop [data-tour-act=next], .tour-pop [data-tour-act=end]:not(.linkish)').click()"); time.sleep(.3)
        print(f"step {k+1} open, tour stops:", " / ".join(seen) or "(none)", "| locked left:", ev("document.querySelectorAll('.bstep.locked').length"))
        if k == 0: shot("gated")
        if not ev("!!document.getElementById('step-next')"): break
        ev("document.getElementById('step-next').click()"); time.sleep(.6)
    # Step 3 gate: Next waits for a supplement
    ev("localStorage.setItem('nsa-builderOpen','3'); active().items=[]; render('stack',true)"); time.sleep(.3)
    print("step 3 next with empty stack disabled:", ev("document.getElementById('step-next').disabled"), "|", ev("document.getElementById('step-next-hint').textContent"))
    ev("document.querySelector('[data-act=tpl]').click()"); time.sleep(.4)
    print("after template, next enabled:", ev("!document.getElementById('step-next')?.disabled"))
    # Skip the tour opens everything and hides itself
    ev("localStorage.setItem('nsa-builderOpen','1'); render('stack',true)"); time.sleep(.3)
    ev("document.querySelector('[data-act=tour-skip]').click()"); time.sleep(.5)
    print("after skip, locked:", ev("document.querySelectorAll('.bstep.locked').length"), "| skip button gone:", ev("!document.querySelector('[data-act=tour-skip]')"))
    # Popup's own Skip also opens everything
    ev("document.querySelector('[data-tour=\"page\"]').click()"); time.sleep(.5)
    ev("document.querySelector('.tour-pop [data-tour-act=skip]').click()"); time.sleep(.5)
    print("popup skip -> locked:", ev("document.querySelectorAll('.bstep.locked').length"), "| tour closed:", ev("!TOUR.steps"))
    # Meals tour still works on its own
    ev("document.querySelector('[data-tour=\"meals\"]').click()"); time.sleep(.4)
    print("meals tour stops:", ev("TOUR.steps ? TOUR.steps.length : 0")); ev("tourEnd()")
    # Back to the example stack with every step open for the rest of the test
    ev("localStorage.clear(); localStorage.setItem('nsa-builderOpen','6'); localStorage.setItem('nsa-tourSeen','true'); location.reload()"); time.sleep(2)
    ev("window.__e=[];addEventListener('error',e=>__e.push(e.message))")
    # Browse by neurotransmitter, then add from it
    ev("document.querySelector('[data-act=browse-nt][data-nt=dopamine]').click()"); time.sleep(.3)
    print("browse groups:", ev("[...document.querySelectorAll('.browse-group h4')].map(h=>h.textContent+' '+h.parentElement.querySelectorAll('.browse-item').length).join(', ')"))
    before = ev("active().items.length")
    ev("document.querySelector('.browse-item:not(.has) [data-act=add-supp]').click()"); time.sleep(.4)
    warned = ev("document.querySelector('.addwarn .check-title')?.textContent")   # a 2nd dopamine booster asks first
    if warned: print("add-time warning:", warned); ev("document.querySelector('[data-act=addwarn-anyway]').click()"); time.sleep(.4)
    print("items before/after add:", before, ev("active().items.length"), "| button now:", ev("document.querySelector('.browse-item.has [data-act=in-stack]')?.textContent"))
    ev("document.getElementById('bs-browse').scrollIntoView({block:'start'}); scrollBy(0,-150)"); time.sleep(.3); shot("browse")
    # Search
    ev("const q=document.getElementById('add-q'); q.value='theanine'; q.dispatchEvent(new Event('input',{bubbles:true}))"); time.sleep(.3)
    print("search results:", ev("document.querySelectorAll('#add-results .result').length"))
    # Step 6: save needs the warnings box ticked; edits mark it changed; the Tracker only shows saved stacks
    ev("document.getElementById('bs-save').scrollIntoView({block:'center'})"); time.sleep(.3)
    print("save disabled before ack:", ev("document.getElementById('save-btn')?.disabled"), "| ack shown:", ev("!!document.getElementById('save-ack')"))
    shot("save-before")
    ev("(()=>{const a=document.getElementById('save-ack'); a.checked=true; a.dispatchEvent(new Event('change',{bubbles:true}))})()")
    print("save enabled after ack:", ev("!document.getElementById('save-btn').disabled"))
    ev("document.getElementById('save-btn').click()"); time.sleep(.3)
    print("saved:", ev("!!active().savedAt"), "|", ev("document.querySelector('.save-ok')?.textContent.trim()"))
    shot("save-after")
    ev("document.getElementById('wake').value='06:30'; document.getElementById('wake').dispatchEvent(new Event('change',{bubbles:true}))"); time.sleep(.3)
    print("after an edit:", ev("document.querySelector('.save-changed')?.textContent.trim()"), "| savedAt:", ev("active().savedAt"))
    ev("location.hash='track'"); time.sleep(.8)
    print("tracker gate (unsaved):", ev("!!document.querySelector('.save-gate')"))
    ev("location.hash='stack'"); time.sleep(.6)
    ev("(()=>{const a=document.getElementById('save-ack'); if(a){a.checked=true; a.dispatchEvent(new Event('change',{bubbles:true}))} document.getElementById('save-btn').click()})()"); time.sleep(.3)
    ev("location.hash='track'"); time.sleep(.8)
    print("tracker checklist (saved):", ev("document.querySelectorAll('.checklist .tick').length"), "| gate gone:", ev("!document.querySelector('.save-gate')"))
    print("errors:", ev("__e"))
finally:
    proc.terminate()
