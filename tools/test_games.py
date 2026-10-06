"""Games page: Sequence, Reaction and Threshold (scope: docs/games/*.md).
Usage: python3 tools/test_games.py [base-url]      (default http://localhost:8010)
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
    def key(k):  # a real key press, so the page's keydown handler sees it as the user would
        vk = {"ArrowUp": 38, "ArrowRight": 39, "ArrowDown": 40, "ArrowLeft": 37, "Enter": 13, "Escape": 27}.get(k) or ord(k.upper())
        for t in ("rawKeyDown", "keyUp"):
            c.call("Input.dispatchKeyEvent", type=t, key=k, code="", windowsVirtualKeyCode=vk, text=k if len(k) == 1 and t == "rawKeyDown" else "")
    KEY = {"up": "ArrowUp", "right": "ArrowRight", "down": "ArrowDown", "left": "ArrowLeft"}

    c.call("Page.navigate", url=f"{BASE}/#games"); time.sleep(2)
    ev("localStorage.clear(); location.reload()"); time.sleep(2)
    ev("window.__e = []; addEventListener('error', e => __e.push(e.message))")

    print("Generator:")
    check("same seed gives the same sequences", ev("(() => { const a = seqRng(42), b = seqRng(42); return JSON.stringify([4,7,10].map(n => seqMake(n, a))) === JSON.stringify([4,7,10].map(n => seqMake(n, b))) })()"))
    check("lengths follow the ramp, then hold at 10", ev("[0,2,3,20,21,40].map(k => seqLevelAt(k).len + ':' + seqLevelAt(k).level).join()") == "4:1,4:1,5:2,10:7,10:7,10:7")
    stats = ev("""(() => { const r = seqRng(7), N = 20000; let easy = 0, triple = 0, lens = {};
      for (let i = 0; i < N; i++) { const s = seqMake(4, r); if (seqIsEasy(s)) easy++; if (s.some((a, j) => j >= 2 && a === s[j-1] && a === s[j-2])) triple++; }
      return { easy: easy / N, triple: triple / N } })()""")
    check("easy 4-arrow patterns are rare but possible", 0 < stats["easy"] < 0.08, stats)
    check("three in a row is rare but possible", 0 < stats["triple"] < 0.08, stats)
    check("easy patterns are recognised", ev("[['up','up','up','up'],['up','down','up','down'],['up','up','down','down'],['up','right','down','left']].map(seqIsEasy).join()") == "true,true,true,false")

    print("Ready screen:")
    check("Games tab is current", ev("document.querySelector('.tab[data-tab=games]').getAttribute('aria-current')") == "page")
    check("context menu lists No stack plus the stacks", ev("document.querySelectorAll('#game-ctx option').length") == ev("App.stacks.length + 1"))

    print("Play:")
    ev("SEQ_CONFIG.seconds = 6; SEQ_CONFIG.countdown = 1")
    key("Enter"); time.sleep(1.3)
    check("Enter starts a run after the countdown", ev("SEQ.phase") == "play")
    seq = ev("SEQ.seq")
    check("first sequence has 4 arrows", len(seq) == 4 and ev("document.querySelectorAll('#seq-row .seq-arrow').length") == 4, seq)
    for d in seq[:2]: key(KEY[d])
    check("correct keys light up", ev("document.querySelectorAll('#seq-row .hit').length") == 2)
    wrong = next(d for d in KEY if d != seq[2])
    key(KEY[wrong])
    check("a wrong key clears the input, same sequence", ev("SEQ.pos") == 0 and ev("SEQ.seq") == seq and ev("SEQ.mistakes") == 1)
    for d in seq: key({"up": "w", "right": "d", "down": "s", "left": "a"}[d])
    check("WASD works and finishing brings the next sequence", ev("SEQ.done.length") == 1 and ev("SEQ.k") == 1)
    for _ in range(2):
        for d in ev("SEQ.seq"): key(KEY[d])
    check("after 3 sequences, level 2 has 5 arrows", ev("SEQ.seq.length") == 5 and "2" in ev("document.getElementById('seq-level').textContent"))
    check("score counts correct arrows", ev("seqScore()") == 12, ev("seqScore()"))
    check("arrow keys don't scroll the page", ev("scrollY") == 0)
    key("r"); time.sleep(1.3)
    check("R restarts: new run, nothing saved", ev("SEQ.phase") == "play" and ev("SEQ.k") == 0 and ev("(SEQ.runs || []).length") == 0)
    for d in ev("SEQ.seq"): key(KEY[d])
    time.sleep(6.5)
    check("time up shows results", ev("SEQ.phase") == "done" and ev("!!document.querySelector('.seq-results')"))
    run = ev("SEQ.last")
    check("run is recorded with score, seed and per-sequence times", run and run["score"] == 4 and run["finished"] == 1 and run["seqs"][0][0] == 4 and isinstance(run["seed"], int), run)
    time.sleep(1)
    check("run is saved in this browser", len(ev("JSON.parse(localStorage.getItem('nsa-games')).sequence")) == 1)
    ev("location.reload()"); time.sleep(2)
    check("personal best shows after reload", "4" in (ev("document.querySelector('#game-stage .hint b')?.textContent") or ""))
    ev("SEQ_CONFIG.seconds = 6; SEQ_CONFIG.countdown = 1")
    key("Enter"); time.sleep(7.8)
    check("Play again after reload keeps earlier runs", len(ev("SEQ.runs")) == 2)
    ev("window.confirm = () => true; document.querySelector('[data-act=seq-clear]').click()"); time.sleep(1)
    check("Clear my scores empties the history", ev("SEQ.runs.length") == 0 and ev("SEQ.phase") == "ready" and len(ev("JSON.parse(localStorage.getItem('nsa-games')).sequence")) == 0)
    key("Enter"); time.sleep(.5); c.call("Page.navigate", url=f"{BASE}/#stack"); time.sleep(1.5)
    ev("SEQ_CONFIG.seconds = 6"); time.sleep(1)
    check("leaving mid-run stops the game", ev("SEQ.phase") == "ready")

    print("Reaction:")
    c.call("Page.navigate", url=f"{BASE}/#games"); time.sleep(1.5)
    ev("window.__e = []; addEventListener('error', e => __e.push(e.message))")
    ev("document.querySelector('[data-game=reaction]').click()"); time.sleep(.5)
    check("switcher shows Reaction", ev("document.querySelector('h1').textContent") == "Reaction" and ev("localStorage.getItem('nsa-game')") == '"reaction"')
    check("median handles odd and even counts", ev("[rtMedian([3,1,2]), rtMedian([4,1,3,2])].join()") == "2,2.5")
    ev("Object.assign(RT_CONFIG, { trials: 3, waitMin: 300, waitMax: 400, pause: 200 })")
    key("Enter"); time.sleep(.35)
    check("Enter starts: black pad, wait for white", ev("RT.phase") == "play" and ev("document.getElementById('rt-pad').dataset.pad") == "wait")
    key(" "); time.sleep(.05)
    check("pressing before white is a false start", ev("RT.early") == 1 and ev("RT.trials.length") == 0 and ev("RT.pad") == "early")
    # Each try: wait until white, let it paint, then click the pad like a mouse would
    pad = lambda: ev("(() => { const r = document.getElementById('rt-pad').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2] })()")
    def respond(use_mouse):
        for _ in range(200):
            if ev("RT.pad === 'go' && RT.t0 > 0"): break
            time.sleep(.02)
        time.sleep(.15)
        if use_mouse:
            x, y = pad()
            for t in ("mousePressed", "mouseReleased"): c.call("Input.dispatchMouseEvent", type=t, x=x, y=y, button="left", clickCount=1)
        else: key(" ")
    respond(True)
    check("clicking on white records a time", ev("RT.trials.length") == 1 and 100 <= ev("RT.trials[0]") < 400, ev("RT.trials"))
    check("the pad shows the time", "ms" in ev("document.getElementById('rt-msg').textContent"))
    respond(False); respond(True); time.sleep(.6)
    check("after the last try, results show", ev("RT.phase") == "done" and ev("!!document.querySelector('.rt-trials')"))
    run = ev("RT.last")
    check("run records median, fastest, spread, false starts", run and len(run["trials"]) == 3 and run["early"] == 1 and run["median"] == sorted(run["trials"])[1] and run["best"] == min(run["trials"]), run)
    time.sleep(1)
    saved = ev("JSON.parse(localStorage.getItem('nsa-games'))")
    check("saved alongside Sequence runs", len(saved["reaction"]) == 1 and "sequence" in saved, list(saved))
    key("Enter"); time.sleep(.35); key("Escape"); time.sleep(.1)
    check("Esc restarts mid-run without saving", ev("RT.phase") == "play" and ev("RT.trials.length") == 0 and len(ev("RT.runs")) == 1)
    ev("document.querySelector('[data-game=sequence]').click()"); time.sleep(.3)
    check("switching games stops the run", ev("RT.phase") == "ready" and ev("document.querySelector('h1').textContent") == "Sequence")
    ev("document.querySelector('[data-game=reaction]').click()")
    ev("SEQ.runs.push({ score: 1, level: 1, at: new Date().toISOString(), seconds: 60, seqs: [] })")
    ev("RT.phase = 'done'; RT.last = RT.runs[0]; rtRender(); window.confirm = () => true; document.querySelector('[data-act=seq-clear]').click()"); time.sleep(1)
    check("Clear my scores clears only Reaction", ev("RT.runs.length") == 0 and ev("SEQ.runs.length") == 1)
    check("no page errors", not ev("window.__e || []"), ev("window.__e"))

    print("Threshold:")
    ev("document.querySelector('[data-game=timing]').click()"); time.sleep(.3)
    check("switcher shows Threshold", ev("document.querySelector('h1').textContent") == "Threshold")
    z = ev("""(() => { const r = seqRng(3), out = []; for (let k = 0; k < 4000; k++) out.push(ssMakeTry(k % 20, r));
      const d = SS_CONFIG.drawScale;
      return { inBar: out.every(t => t.center - d * t.good / t.sweep / 2 >= 0 && t.center + d * t.good / t.sweep / 2 <= 1),
        secondHalf: out.every(t => t.center >= 0.55), sizes: new Set(out.map(t => Math.round(t.good))).size > 50 } })()""")
    check("drawn zones stay inside the bar, in its second half, with random sizes", z["inBar"] and z["secondHalf"] and z["sizes"], z)
    lad = ev("[0, 19].map(s => { const r = ssRung(s); return Math.round(r.sweep) + '/' + Math.round(r.zone) }).join()")
    check("ladder runs 1600 ms / 500 ms zone down to 650 / 80", lad == "1600/500,650/80", lad)
    check("elite gate: level 15+ and 2 Perfects in a row", ev("[ssEliteOpen(13, 5), ssEliteOpen(14, 1), ssEliteOpen(14, 2)].join()") == "false,false,true")
    el = ev("""(() => { const r = seqRng(9); let open = 0, shut = 0, zone = new Set(); for (let i = 0; i < 4000; i++) { const a = ssMakeTry(16, r, true), b = ssMakeTry(16, r, false); if (a.elite) { open++; zone.add(a.good); } if (b.elite) shut++; }
      return { open: open / 4000, shut, zone: [...zone] } })()""")
    check("elite zones spawn ~30% when the gate is open, never when shut, at 35 ms", 0.25 < el["open"] < 0.35 and el["shut"] == 0 and el["zone"] == [35], el)
    check("elite zones pay 2× and missing one costs nothing", ev("ssScore(0, { good: 35, perfect: 11.7, step: 15, elite: true }).pts === 2 * ssScore(0, { good: 35, perfect: 11.7, step: 15 }).pts")
          and ev("JSON.stringify(ssClimb(15, 4, false, true))") == '{"step":15,"streak":4}')
    check("every step is faster and tighter", ev("Array.from({ length: 19 }, (_, s) => ssRung(s + 1).sweep < ssRung(s).sweep && ssRung(s + 1).zone < ssRung(s).zone).every(Boolean)"))
    check("smart ramp: hit +1, streak of 5 climbs +2, miss −2 and resets", ev("""[JSON.stringify(ssClimb(3, 0, true)), JSON.stringify(ssClimb(3, 4, true)), JSON.stringify(ssClimb(3, 6, false)), JSON.stringify(ssClimb(1, 2, false)), JSON.stringify(ssClimb(19, 9, true))].join(' ')""")
          == '{"step":4,"streak":1} {"step":5,"streak":5} {"step":1,"streak":0} {"step":0,"streak":0} {"step":19,"streak":10}')
    check("early and late by the same amount score the same", ev("JSON.stringify(ssScore(-25, { good: 200, perfect: 66 })) === JSON.stringify(ssScore(25, { good: 200, perfect: 66 }))"))
    check("closeness: 100 at centre, 50 halfway, 0 outside; hard levels pay more", ev("[ssScore(0, {good:200,perfect:66}).pts, ssScore(50, {good:200,perfect:66}).pts, ssScore(130, {good:200,perfect:66}).pts, ssScore(0, {good:200,perfect:66,step:10}).pts].join()") == "100,50,0,200")
    check("grades: perfect, good, miss", ev("[ssScore(30, {good:200,perfect:66}).grade, ssScore(40, {good:200,perfect:66}).grade, ssScore(101, {good:200,perfect:66}).grade].join()") == "perfect,good,miss")
    ev("Object.assign(SS_CONFIG, { tries: 3, lead: 150, after: 150 })")
    key("Enter"); time.sleep(.05)
    check("the zone is drawn at drawScale × the scored window", ev("Math.abs(parseFloat(document.getElementById('ss-zone').style.width) - 100 * SS_CONFIG.drawScale * SS.cur.good / SS.cur.sweep) < 0.01"))
    check("Enter starts with the marker parked at the left", ev("SS.phase") == "play" and ev("SS.state") == "lead" and ev("document.getElementById('ss-marker').style.transform") == "translateX(0px)")
    # Try 1: press on target (wait until the sweep clock says target − a small lead for the press round trip)
    for _ in range(300):
        if ev("SS.state === 'sweep' && SS.t0 && performance.now() - SS.t0 >= SS.cur.target - 15"): break
        time.sleep(.005)
    before = ev("document.getElementById('ss-marker').style.transform")
    key(" "); time.sleep(.05)
    t1 = ev("SS.tries[0]")
    check("pressing near the centre scores and shows target vs you", t1 and t1["err"] is not None and abs(t1["err"]) < 60 and "Target" in ev("document.getElementById('ss-result').textContent"), t1)
    after = ev("document.getElementById('ss-marker').style.transform")
    time.sleep(.05)
    check("the marker freezes where it is (no jump back)", after == ev("document.getElementById('ss-marker').style.transform") and float(after[11:-3]) >= float(before[11:-3]), (before, after))
    check("a hit climbs a level", ev("SS.step") == (1 if t1["grade"] != "miss" else 0))
    time.sleep(.2)
    for _ in range(300):
        if ev("SS.tries.length === 2"): break
        time.sleep(.02)
    check("no press before the sweep ends is a miss", ev("SS.tries[1].err") is None and ev("SS.tries[1].pts") == 0)
    for _ in range(300):
        if ev("SS.state === 'sweep' && SS.t0 > 0"): break
        time.sleep(.01)
    x, y = ev("(() => { const r = document.getElementById('ss-area').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2] })()")
    for t in ("mousePressed", "mouseReleased"): c.call("Input.dispatchMouseEvent", type=t, x=x, y=y, button="left", clickCount=1)
    time.sleep(.6)
    run = ev("SS.lastRun")
    check("an early click is a miss with a negative error", run and run["tries"][2][4] < 0 and run["tries"][2][5] == 0, run and run["tries"])
    check("results: points, peak, streak, closest try, every try", ev("SS.phase") == "done" and run["noPress"] == 1 and run["closest"]["target"] == t1["target"]
          and ev("document.querySelectorAll('.ss-rung').length") == 3 and ev("document.querySelectorAll('.ss-col').length") == 3 and ev("document.querySelectorAll('.ss-dot.none').length") == 1 and ev("document.querySelectorAll('.ss-every tbody tr').length") == 3 and "target was" in ev("document.querySelector('.ss-closest').textContent"), run)
    time.sleep(1)
    check("saved under timing with the other games", len(ev("JSON.parse(localStorage.getItem('nsa-games')).timing")) == 1)
    check("level colours run cold to hot", ev("[gameHeat(0), gameHeat(1)].join()") == "color-mix(in oklch decreasing hue, var(--heat-0) 100%, var(--heat-1)),color-mix(in oklch decreasing hue, var(--heat-2) 0%, var(--heat-3))")
    check("no page errors", not ev("window.__e || []"), ev("window.__e"))
finally:
    proc.kill()
print(f"\n{len(fails)} failed" if fails else "\nAll passed")
sys.exit(1 if fails else 0)
