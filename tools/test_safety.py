"""Medications & conditions, side effects, and Expand/Collapse all (team spec, October 2026).
Usage: python3 tools/test_safety.py [base-url]      (default http://localhost:8010)
"""
import json, os, subprocess, sys, tempfile, time, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, "shoot.py")).read().replace('if __name__ == "__main__":', "if False:"))
BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:8010"
prof = tempfile.mkdtemp()
proc = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={PORT}", f"--user-data-dir={prof}", "--hide-scrollbars", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
fails = []
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
    def check(name, ok, detail=""):
        print(f"  {'PASS' if ok else 'FAIL'}  {name}{(' (' + str(detail) + ')') if detail else ''}")
        if not ok: fails.append(name)
    c.call("Page.navigate", url=f"{BASE}/#stack"); time.sleep(2)
    ev("localStorage.clear(); localStorage.setItem('nsa-builderOpen','6'); localStorage.setItem('nsa-tourSeen','true'); location.reload()"); time.sleep(2)
    ev("window.__e = []; addEventListener('error', e => __e.push(e.message))")
    # Findings for a list of supplement ids with a given About you, as "sev|title"
    ev("""window.run = (ids, about) => { lsSet('nsa-about', about || {});
      return analyze({ ...active(), items: ids.map((sid, k) => ({ id: 't' + k, sid, dose: byId[sid].dose[0], time: '08:00' })) })
        .filter(f => f.sev !== 'good').map(f => f.sev + '|' + f.title); }""")
    has = lambda res, sev, text: any(r.startswith(sev + "|") and text.lower() in r.lower() for r in res)
    run = lambda ids, about: ev(f"run({json.dumps(ids)}, {json.dumps(about)})")

    print("Medications and conditions:")
    r = run(["5-htp"], {"meds": ["ssri"]}); check("SSRI + 5-HTP is critical", has(r, "critical", "SSRIs with serotonin"), r)
    r = run(["l-tyrosine"], {"meds": ["maoi"]}); check("MAOI + L-Tyrosine is critical", has(r, "critical", "MAOI with L-Tyrosine"), r)
    r = run(["omega-3", "saffron"], {"meds": ["blood-thinner"]}); check("blood thinner + omega-3 + saffron is flagged (ginkgo isn't in our data)", any("Blood thinner with" in x for x in r), r)
    r = run(["st-johns-wort", "5-htp"], {}); check("St. John's Wort + 5-HTP is critical", has(r, "critical", "serotonin boosters"), r)
    r = run(["st-johns-wort"], {"meds": ["birth-control"]}); check("St. John's Wort + birth control is flagged", any("St. John's Wort with Hormonal birth control" in x for x in r), r)
    r = run(["iron"], {"meds": ["thyroid"]}); check("thyroid medicine + iron gives a spacing finding", any("from your thyroid medicine" in x for x in r), r)
    r = run(["sam-e"], {"conds": ["bipolar"]}); check("bipolar + SAM-e is serious", has(r, "major", "Bipolar disorder with SAMe"), r)
    r = run(["l-theanine"], {"conds": ["pregnant"]}); check("pregnant + item without pregnancy data is a caution", has(r, "moderate", "Pregnancy: no safety information for L-Theanine"), r)
    r = run(["ashwagandha"], {"conds": ["pregnant"]}); check("pregnant + ashwagandha is critical", has(r, "critical", "Avoid while pregnant"), r)
    check("Zoloft and sertraline map to SSRI, unknown names to other", ev("[medClassFor('Zoloft'), medClassFor('sertraline'), medClassFor('blorptex')].join()") == "ssri,ssri,other")

    print("Side effects:")
    r = run(["ashwagandha", "kava"], {}); check("ashwagandha + kava is a serious liver finding", has(r, "major", "liver injury"), r)
    r = run(["alpha-gpc", "citicoline"], {}); check("two headache-prone cholinergics: These can add up", has(r, "moderate", "These can add up: headache"), r)
    check("every supplement has a side-effects entry, all unreviewed", ev("S.every(s => SIDE_EFFECTS[s.id] && SIDE_EFFECTS[s.id].verified === false)"))
    check("entries without a source are marked", ev("Object.values(SIDE_EFFECTS).every(e => e.source.length || e.needsSource)"))

    print("Nothing filled in:")
    lsclear = "lsSet('nsa-about', {})"
    r = run(["l-theanine"], {})
    meds = [x for x in r if x.split("|", 1)[1] in ev("[MED_RULES.nothingEntered]")]
    check("only the single About you info finding", len([x for x in r if "About you" in x]) == 1 and meds and meds[0].startswith("info|"), r)
    base = ev("(() => { lsSet('nsa-about', {}); return analyze({ ...active(), items: EXAMPLE_STACK.items.map(([sid, d, t], k) => ({ id: 'e' + k, sid, dose: d, time: t })) }).filter(f => f.cat !== MED_RULES.category).length })()")
    check("the rest of the check is unchanged by an empty About you", base > 0, base)

    print("About you stays on this device:")
    ev("""(() => { window.__net = 0; const f = window.fetch; window.fetch = (...a) => { __net++; return f(...a); };
      const o = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function (...a) { __net++; return o.apply(this, a); };
      if (navigator.sendBeacon) { const b = navigator.sendBeacon.bind(navigator); navigator.sendBeacon = (...a) => { __net++; return b(...a); }; }
      window.__res0 = performance.getEntriesByType('resource').length; })()""")
    ev("lsSet('nsa-about', {}); setExpanded(new Set([2])); render('stack', true); App.aboutOpen = true; renderAbout()"); time.sleep(.3)
    ev("document.querySelector('[data-act=about-toggle][data-id=ssri]').click()"); time.sleep(.2)
    ev("document.querySelector('[data-act=about-toggle][data-id=bipolar]').click()"); time.sleep(.2)
    ev("(() => { const q = document.getElementById('about-q'); q.value = 'Zoloft'; document.querySelector('[data-act=about-add]').click(); })()"); time.sleep(.3)
    saved = ev("JSON.parse(localStorage.getItem('nsa-about'))")
    check("saved in localStorage", saved and "ssri" in saved.get("meds", []) and saved.get("names", [{}])[0].get("cls") == "ssri", saved)
    check("no network calls while editing About you", ev("__net === 0 && performance.getEntriesByType('resource').length === __res0"), ev("[__net, performance.getEntriesByType('resource').length - __res0]"))
    check("privacy note shown", ev("document.querySelector('.about-privacy')?.textContent.includes('Not sent anywhere')"))

    print("Expand / Collapse all:")
    ev("(() => { lsSet('nsa-about', {}); const st = active(); st.items = ['l-tyrosine', 'l-theanine', 'alpha-gpc', 'omega-3'].map(sid => ({ id: newId(), sid, dose: byId[sid].dose[0], time: placeFor(sid, st) })); touch(st); st.ack = { at: new Date().toISOString(), sig: ackSig(st) }; setExpanded(new Set([2, 4])); render('stack', true); })()"); time.sleep(.3)
    ev("document.querySelector('[data-act=items-all][data-show=\"1\"]').click()"); time.sleep(.2)
    check("step 2: Expand all opens every group", ev("[...document.querySelectorAll('.item-group')].every(g => g.classList.contains('open'))"))
    ev("document.querySelector('[data-act=items-all][data-show=\"0\"]').click()"); time.sleep(.2)
    check("step 2: Collapse all closes every group", ev("![...document.querySelectorAll('.item-group')].some(g => g.classList.contains('open'))"))
    ev("document.querySelector('[data-act=lanes-all][data-show=\"1\"]').click()"); time.sleep(.2)
    check("step 4: lanes are on the page", ev("document.querySelectorAll('.tl-lane .tl-lane-btn').length > 0"))
    check("step 4: Expand all opens every lane", ev("[...document.querySelectorAll('.tl-lane')].filter(l => l.querySelector('.tl-lane-btn')).every(l => l.classList.contains('open'))"))
    ev("document.querySelector('[data-act=lanes-all][data-show=\"0\"]').click()"); time.sleep(.2)
    check("step 4: Collapse all closes every lane", ev("![...document.querySelectorAll('.tl-lane')].some(l => l.classList.contains('open'))"))

    print("Wording:")
    check("search placeholder counts the supplements", ev("document.getElementById('add-q').placeholder.startsWith('Search ' + S.length + ' ')"))
    ev("(() => { const st = active(); st.items = ['l-tyrosine', 'mucuna-pruriens', 'dl-phenylalanine'].map(sid => ({ id: newId(), sid, dose: byId[sid].dose[0], time: placeFor(sid, st) })); touch(st); render('stack', true); })()"); time.sleep(.3)
    check("suggestions hidden while a serious finding is open", ev("document.getElementById('b-suggest').innerHTML === ''"))
    check("no JS errors", ev("__e") == [], ev("__e"))
finally:
    proc.terminate()
print("\nAll passed." if not fails else f"\n{len(fails)} failed: " + "; ".join(fails))
