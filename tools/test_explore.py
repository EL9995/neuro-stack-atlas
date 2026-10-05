"""Click-through test of a neurotransmitter page: end-of-scene cards, supplement blocks, tag tooltips.
Usage: python3 tools/test_explore.py dopamine   (screenshots go to /tmp)
"""
import sys, json, time, subprocess, tempfile, urllib.request, base64
src=open('tools/shoot.py').read().replace('if __name__ == "__main__":','if False:')
exec(src)
prof=tempfile.mkdtemp()
proc=subprocess.Popen([CHROME,"--headless=new",f"--remote-debugging-port={PORT}",f"--user-data-dir={prof}","--hide-scrollbars","about:blank"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    for _ in range(80):
        try: tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json")); break
        except Exception: time.sleep(.5)
    c=CDP([t for t in tabs if t["type"]=="page"][0]["webSocketDebuggerUrl"]); c.call("Page.enable"); c.call("Runtime.enable"); c.call("Network.enable"); c.call("Network.setCacheDisabled",cacheDisabled=True)
    c.call("Emulation.setDeviceMetricsOverride",width=1280,height=800,deviceScaleFactor=1,mobile=False)
    def ev(e):
        r=c.call("Runtime.evaluate",expression=e,awaitPromise=True,returnByValue=True)
        if "exceptionDetails" in r: print("  JS error:", r["exceptionDetails"].get("exception",{}).get("description","")[:200])
        return r["result"].get("value")
    shot=lambda name: open(f"/tmp/nsa-{name}.png","wb").write(base64.b64decode(c.call("Page.captureScreenshot",format="png")["data"]))
    nt=sys.argv[1] if len(sys.argv)>1 else "dopamine"
    c.call("Page.navigate",url=f"http://localhost:8003/#{nt}"); time.sleep(2)
    ev("window.__errs=[];addEventListener('error',e=>__errs.push(e.message))")
    ev("(()=>{const s=document.getElementById('ps');scrollTo(0,s.getBoundingClientRect().top+scrollY+s.offsetHeight-innerHeight-4)})()"); time.sleep(2)
    print("explore:", ev("PS.explore"), "| hint shown:", ev("!document.getElementById('ps-hint').hidden"))
    shot(f"{nt}-end")
    for sel,name in [(".ps-mol[data-ps='mol:1']","mol"),(".ps-hit[data-ps='enz:1']","enz"),(".ps-co[data-ps='co:1:0']","co"),(".ps-sup[data-ps='sup:0']","sup"),(".ps-mol[data-ps='mol:%d']"%0,"mol0")]:
        ok=ev(f"(()=>{{const el=document.querySelector(\"{sel}\"); if(!el) return 'missing'; const r=el.getBoundingClientRect(); const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2); hit.click(); return document.getElementById('ps-pop').hidden ? 'closed' : document.getElementById('ps-pop').innerText.replace(/\\n+/g,' | ').slice(0,220)}})()")
        print(name, "->", ok)
        if name=="enz": time.sleep(.3); shot(f"{nt}-pop")
    last=ev("(()=>{const els=document.querySelectorAll('.ps-mol');const el=els[els.length-1];const r=el.getBoundingClientRect();document.elementFromPoint(r.x+r.width/2,r.y+r.height/2).click();return document.getElementById('ps-pop').innerText.replace(/\\n+/g,' | ').slice(0,300)})()")
    print("final ->", last)
    # Supplement blocks
    ev("document.getElementById('nt-sups').scrollIntoView()"); time.sleep(.5)
    print("blocks:", ev("[...document.querySelectorAll('.sup-tab b')].map(b=>b.textContent).join(', ')"), "| open panels:", ev("[...document.querySelectorAll('.sup-panel')].filter(p=>!p.hidden).length"))
    ev("document.getElementById('sup-tab-0').click()"); time.sleep(.6)
    print("after click 1:", ev("[...document.querySelectorAll('.sup-panel')].map(p=>p.hidden?0:1).join('')"))
    ev("(()=>{const t=document.getElementById('sup-tab-0');scrollTo(0,t.getBoundingClientRect().top+scrollY-130)})()"); time.sleep(.4); shot(f"{nt}-blocks")
    ev("document.getElementById('sup-tab-2').click()"); time.sleep(.3)
    print("after switch:", ev("[...document.querySelectorAll('.sup-panel')].map(p=>p.hidden?0:1).join('')"))
    ev("document.querySelector('.sup-panel:not([hidden]) .sup-less').click()"); time.sleep(.3)
    print("after show less:", ev("[...document.querySelectorAll('.sup-panel')].map(p=>p.hidden?0:1).join('')"))
    # Enzyme name label at the end of the scene, then a tag tooltip
    ev("(()=>{const s=document.getElementById('ps');scrollTo(0,s.getBoundingClientRect().top+scrollY+s.offsetHeight-innerHeight-4)})()"); time.sleep(2.5)
    print("enzyme label ->", ev("(()=>{document.querySelectorAll('.ps-enz[data-ps]')[0].click();return document.getElementById('ps-pop').innerText.split(String.fromCharCode(10)).slice(0,3).join(' | ')})()"))
    ev("document.getElementById('ps-pop').hidden=true")
    # open the first block that has a warning tag in it
    ev("(()=>{const p=[...document.querySelectorAll('.sup-panel')].find(p=>p.querySelector('.tier'));const t=document.getElementById(p.getAttribute('aria-labelledby'));t.click();scrollTo(0,t.getBoundingClientRect().top+scrollY-130)})()"); time.sleep(.5)
    xy=ev("(()=>{const el=document.querySelector('.sup-panel:not([hidden]) .tier');const r=el.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()")
    c.call("Input.dispatchMouseEvent",type="mouseMoved",x=xy[0],y=xy[1]); time.sleep(.3)
    print("tooltip ->", ev("document.getElementById('tip').hidden ? 'hidden' : document.getElementById('tip').innerText.slice(0,60)"))
    print("long write-up gone:", ev("!document.body.innerText.includes('Sorted by strength of evidence')"))
    print("static diagram gone:", ev("!document.body.innerText.includes('How your body makes it')"), "| errors:", ev("__errs"))
finally: proc.terminate()
