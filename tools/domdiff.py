"""Compare page content captured by shoot.py (whitespace-insensitive)."""
import json, re, sys
a = json.load(open(sys.argv[1])); b = json.load(open(sys.argv[2]))
# The dopamine scene animates on a timer, so its moving parts never match frame for frame.
# Mask just those: the scene drawing and the floating labels' positions.
ANIM = [(r"<!--.*?-->", ""), (r'<svg class="ns-world" id="ps-world".*?</svg>', "<svg ps-world/>"), (r'(class="ps-tag[^"]*"[^>]*?) style="[^"]*"', r"\1")]
def norm(s):
    for pat, rep in ANIM: s = re.sub(pat, rep, s, flags=re.S)
    return re.sub(r"\s+", " ", s)
bad = 0
for k in a:
    x, y = norm(a[k]["title"] + a[k]["body"]), norm(b[k]["title"] + b[k]["body"])
    if x != y:
        bad += 1
        i = next((i for i in range(min(len(x), len(y))) if x[i] != y[i]), min(len(x), len(y)))
        print(f"DIFF {k}:\n  before: …{x[max(0,i-100):i+120]}…\n  after:  …{y[max(0,i-100):i+120]}…")
print(f"{len(a) - bad} of {len(a)} pages identical")
