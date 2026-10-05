"""One-time script: split the original single-file artifact into static files.

Every chunk is a contiguous range of the original lines, and files load in the
original order, so CSS cascade order and JS execution order are unchanged.
The only reordering: a few data "setup" statements (which only read data) run
after all content files, and the extra glossary entries sit with the glossary.

Already run once (October 2026). Do NOT run again: it would overwrite later edits.
Kept as a record of how the split was done.

Usage: python3 tools/split.py baseline/index.html .
"""
import os, sys

src, out = sys.argv[1], sys.argv[2]
L = open(src, encoding="utf-8").read().split("\n")
def lines(a, b):  # 1-based, inclusive
    return "\n".join(L[a - 1:b]) + "\n"

CSS = [  # (file, first line, last line, header)
    ("tokens.css", 7, 63, "Theme tokens: colors, fonts, light and dark mode, base element styles."),
    ("explore.css", 64, 226, "Top bar, home grid, neurotransmitter pages, pathway, supplement pages, glossary terms."),
    ("components.css", 227, 281, "App shell (tabs, status, buttons, fields) and home foundations."),
    ("builder.css", 282, 356, "Stack builder: layout, timeline, stack checks."),
    ("tracker.css", 357, 412, "Tracker."),
    ("builder-day.css", 413, 500, "Stack builder: day settings, meals, absorption, suggestions, item info."),
    ("search-scanner.css", 501, 570, "Explore search, scanner, compact insights, reduced motion."),
    ("home.css", 571, 712, "Landing page: brand layer, title card, notice, journey, foundations card, cycling."),
    ("scenes.css", 713, 767, "The two scroll scenes: neurotransmitter story and dopamine pathway."),
]

JS = [  # (path, [(first, last), ...], header)
    ("content/neurotransmitters.js", [(800, 877)], None),
    ("content/supplement-links.js", [(878, 919)], None),
    ("content/cofactors.js", [(920, 971)], None),
    ("content/supplements.js", [(972, 1285)], None),
    ("content/glossary.js", [(1286, 1307), (2089, 2096)], None),
    ("content/supplements-more.js", [(1308, 1781)], None),
    ("content/mineral-forms.js", [(1782, 1932)], None),
    ("content/timing-and-safety.js", [(1933, 2012)], None),
    ("content/recommendations.js", [(2021, 2067), (2076, 2088)], None),
    ("js/data-setup.js", [(2013, 2020), (2068, 2075)], None),
    ("js/scanner.js", [(2098, 2386)], None),
    ("js/helpers.js", [(2387, 2439)], None),
    ("js/state.js", [(2440, 2661)], None),
    ("js/stack-checker.js", [(2662, 2860)], None),
    ("js/tracker-insights.js", [(2861, 2978)], None),
    ("js/home.js", [(2979, 3026), (3456, 3626)], None),
    ("js/scene-story.js", [(3027, 3230)], None),
    ("js/scene-pathway.js", [(3231, 3455)], None),
    ("js/pages.js", [(3627, 3787)], None),
    ("js/builder.js", [(3788, 4078)], None),
    ("js/tracker.js", [(4079, 4222)], None),
    ("js/router.js", [(4223, 4329)], None),
    ("js/events.js", [(4330, 4551)], None),
    ("js/tooltip.js", [(4552, 4575)], None),
    ("js/boot.js", [(4576, 4590)], None),
]

# Every original line must land in exactly one place.
used = set(range(1, 6)) | {6, 768, 799, 4591} | set(range(769, 799)) | set(range(4592, len(L) + 1))
for _, a, b, _ in CSS: used |= set(range(a, b + 1))
for _, rs, _ in JS:
    for a, b in rs: used |= set(range(a, b + 1))
missing = [n for n in range(1, len(L) + 1) if n not in used and L[n - 1].strip()]
assert not missing, f"unassigned non-blank lines: {missing[:20]}"

for d in ("css", "js", "content"):
    os.makedirs(os.path.join(out, d), exist_ok=True)
for name, a, b, head in CSS:
    open(os.path.join(out, "css", name), "w", encoding="utf-8").write(f"/* {head} */\n\n" + lines(a, b))
for path, rs, _ in JS:
    open(os.path.join(out, path), "w", encoding="utf-8").write("".join(lines(a, b) for a, b in rs))

links = "\n".join(f'<link rel="stylesheet" href="css/{n}">' for n, *_ in CSS)
scripts = "\n".join(f'<script src="{p}"></script>' for p, *_ in JS)
html = lines(1, 5) + links + "\n" + lines(769, 798) + scripts + "\n" + lines(4592, len(L)).rstrip("\n") + "\n"
open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(html)
print("ok")
