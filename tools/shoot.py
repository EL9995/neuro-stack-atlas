"""Take a fixed set of screenshots of the site with headless Chrome.

Usage:  python3 tools/shoot.py http://localhost:8001 screenshots/before
Uses only the Python standard library plus the installed Google Chrome.
"""
import base64, json, os, socket, struct, subprocess, sys, tempfile, time, urllib.request

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
def _free_port():
    with socket.socket() as so:
        so.bind(("127.0.0.1", 0)); return so.getsockname()[1]
PORT = _free_port()   # a fresh port every run, so we never talk to a leftover Chrome

# (name, hash, setup JS run after load, full_page)
# Scroll scenes: f is how far through the scene (0 = start, 1 = end).
def scene(sel, f):
    return (f"(()=>{{const el=document.querySelector('{sel}');"
            f"const r=el.offsetHeight-innerHeight;scrollTo(0,el.offsetTop+{f}*r);}})()")

SHOTS = [
    ("01-home", "", "", False),
    # Home sections below the scroll scenes (the page is too tall for one full-page shot).
    *[(f"25-home-{n}", "", f"document.querySelector('{sel}').scrollIntoView()", False)
      for n, sel in (("safe", "#safe"), ("notice", "#notice"), ("six", "#six"), ("get-started", "#get-started"))],
    # "Is it safe?" scene: one shot per caption
    *[(f"15-protocol-{i:02d}", "", scene("#pc", f), False) for i, f in enumerate((.03, .09, .155, .225, .30, .39, .45, .51, .58, .67, .76, .83, .89, .97))],
    *[(f"10-story-{int(f*100):02d}", "", scene("#ns", f), False) for f in (0.0, 0.25, 0.5, 0.75, 1.0)],
    # Neurotransmitter page intro (heading, then low/high cards), inside the assembly line scene.
    ("19-dopamine-intro-a", "dopamine", scene(".ns.ps", .02), False), ("19-dopamine-intro-b", "dopamine", scene(".ns.ps", .10), False),
    # Assembly line: on the home page before October 2026, on each neurotransmitter page since.
    *[(f"20-pathway-{int(f*100):02d}", "dopamine", scene(".ns.ps", f), False) for f in (0.0, 0.25, 0.5, 0.75, 1.0)],
    *[(f"21-{nt}-scene-{int(f*100):02d}", nt, scene(".ns.ps", f), False)
      for nt in ("norepinephrine", "serotonin", "gaba", "glutamate", "acetylcholine") for f in (0.2, 0.45, 0.7, 0.85)],
    ("30-nt-dopamine", "dopamine", "", True),
    ("31-nt-gaba", "gaba", "", True),
    ("32-dopamine-supplements", "dopamine", "document.getElementById('nt-sups').scrollIntoView()", False),
    ("35-enzyme-tyrosine-hydroxylase", "enzyme:tyrosine-hydroxylase", "", True),
    ("36-enzyme-aadc", "enzyme:aadc", "", True),
    ("40-supp-l-tyrosine", "dopamine.l-tyrosine", "", True),
    ("41-supp-magnesium", "magnesium-glycinate", "", True),
    ("50-stack-builder", "stack", "", True),   # a first visit: only step 1 is open
    ("51-stack-builder-open", "stack", "localStorage.setItem('nsa-builderOpen','6');render('stack',true)", True),
    ("60-tracker", "track", "", True),
    ("70-scanner", "scan", "", True),
    ("80-dark-home", "", "document.documentElement.dataset.theme='dark'", False),
    ("81-dark-nt", "serotonin", "document.documentElement.dataset.theme='dark'", True),
    ("82-dark-stack", "stack", "document.documentElement.dataset.theme='dark';localStorage.setItem('nsa-builderOpen','6');render('stack',true)", True),
]
FREEZE = """(() => {
  const RealDate = Date, off = new RealDate("2026-10-04T10:00:00").getTime() - RealDate.now();
  class FakeDate extends RealDate { constructor(...a) { super(...(a.length ? a : [RealDate.now() + off])); } static now() { return RealDate.now() + off; } }
  window.Date = FakeDate;
  let s = 42; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
})();"""
DOM_JS = "(() => { const b = document.body.cloneNode(true); b.querySelectorAll('script,link,style').forEach(e => e.remove()); return JSON.stringify({title: document.title, body: b.innerHTML}); })()"
WIDTHS = {"desktop": (1280, 800, False), "phone": (390, 844, True)}


class CDP:
    """Just enough of a WebSocket client to talk to Chrome DevTools."""
    def __init__(self, ws_url):
        host, path = ws_url[len("ws://"):].split("/", 1)
        h, p = host.split(":")
        self.s = socket.create_connection((h, int(p)))
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET /{path} HTTP/1.1\r\nHost: {host}\r\nUpgrade: websocket\r\n"
                        f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\n"
                        "Sec-WebSocket-Version: 13\r\n\r\n").encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            buf += self.s.recv(4096)
        self.buf = buf.split(b"\r\n\r\n", 1)[1]
        self.n = 0

    def _read(self, n):
        while len(self.buf) < n:
            self.buf += self.s.recv(1 << 20)
        out, self.buf = self.buf[:n], self.buf[n:]
        return out

    def _recv(self):
        data = b""
        while True:
            b1, b2 = self._read(2)
            ln = b2 & 0x7F
            if ln == 126: ln = struct.unpack(">H", self._read(2))[0]
            elif ln == 127: ln = struct.unpack(">Q", self._read(8))[0]
            data += self._read(ln)
            if b1 & 0x80:
                return json.loads(data)

    def call(self, method, **params):
        self.n += 1
        msg = json.dumps({"id": self.n, "method": method, "params": params}).encode()
        mask = os.urandom(4)
        hdr = bytes([0x81])
        ln = len(msg)
        hdr += bytes([0x80 | ln]) if ln < 126 else (bytes([0x80 | 126]) + struct.pack(">H", ln) if ln < 65536 else bytes([0x80 | 127]) + struct.pack(">Q", ln))
        self.s.sendall(hdr + mask + bytes(c ^ mask[i % 4] for i, c in enumerate(msg)))
        while True:
            r = self._recv()
            if r.get("id") == self.n:
                if "error" in r: raise RuntimeError(f"{method}: {r['error']}")
                return r.get("result", {})


def main(base, out):
    os.makedirs(out, exist_ok=True)
    prof = tempfile.mkdtemp()
    proc = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={PORT}", f"--user-data-dir={prof}",
                             "--hide-scrollbars", "--no-first-run", "--force-color-profile=srgb", "about:blank"],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json"))
                break
            except Exception:
                time.sleep(0.5)
        page = [t for t in tabs if t["type"] == "page"][0]
        c = CDP(page["webSocketDebuggerUrl"])
        c.call("Page.enable"); c.call("Runtime.enable")
        c.call("Network.enable"); c.call("Network.setCacheDisabled", cacheDisabled=True)   # always load the files as they are on disk
        # Same clock and same "random" ids on every run, so before/after are comparable.
        c.call("Page.addScriptToEvaluateOnNewDocument", source=FREEZE)
        c.call("Emulation.setEmulatedMedia", features=[{"name": "prefers-color-scheme", "value": "light"},
                                                        {"name": "prefers-reduced-motion", "value": "no-preference"}])
        dom = {}
        for wname, (w, h, mobile) in WIDTHS.items():
            c.call("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=1, mobile=mobile)
            for name, hsh, js, full in SHOTS:
                # Fresh load each time: clear storage so every run starts from the same example stack.
                c.call("Page.navigate", url="about:blank"); time.sleep(0.2)
                c.call("Page.navigate", url=f"{base}/#{hsh}")
                ev = lambda e: c.call("Runtime.evaluate", expression=e, awaitPromise=True, returnByValue=True).get("result", {}).get("value")
                for _ in range(50):
                    if ev("document.readyState") == "complete": break
                    time.sleep(0.1)
                ev("document.fonts.ready.then(()=>1)")
                ev("try{localStorage.clear()}catch(e){}")
                time.sleep(0.8)
                if js:
                    ev(js); time.sleep(1.5)
                dom[f"{wname}-{name}"] = json.loads(ev(DOM_JS))
                if full:
                    hgt = ev("Math.ceil(document.documentElement.scrollHeight)")
                    c.call("Emulation.setDeviceMetricsOverride", width=w, height=min(hgt, 12000), deviceScaleFactor=1, mobile=mobile)
                    time.sleep(0.5)
                    img = c.call("Page.captureScreenshot", format="png")["data"]
                    c.call("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=1, mobile=mobile)
                else:
                    img = c.call("Page.captureScreenshot", format="png")["data"]
                path = os.path.join(out, f"{wname}-{name}.png")
                with open(path, "wb") as f:
                    f.write(base64.b64decode(img))
                print(path)
        with open(os.path.join(out, "dom.json"), "w") as f:
            json.dump(dom, f, indent=0)
    finally:
        proc.terminate()


if __name__ == "__main__":
    main(sys.argv[1].rstrip("/"), sys.argv[2])
