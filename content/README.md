# Where the words live

Everything a visitor reads is in this folder, plus the footer in `index.html`.

| I want to change… | Open |
|---|---|
| Home page title, tagline, section headings, "Cycling", "Before you start" | `landing-page.js` |
| Captions in the two scroll scenes | `scene-captions.js` |
| A neurotransmitter's description, symptoms or pathway | `neurotransmitters.js` |
| The note and evidence rating linking a supplement to a neurotransmitter | `supplement-links.js` |
| A supplement's summary, dose, effects, side effects, interactions | `supplements.js` (common) or `supplements-more.js` (deeper cuts) |
| Magnesium, zinc or iron forms | `mineral-forms.js` |
| "Take it with" cofactor advice | `cofactors.js` |
| Hover tooltips | `glossary.js` |
| Foundations card, swap suggestions, spacing rules, stack templates | `recommendations.js` |
| Footer disclaimer (every page) | `../index.html`, search for `EDITABLE` |

## Editing rules
1. Change only the text inside `"quotes"`. Keep the quotes, commas and brackets.
2. Short lowercase words such as `"moderate"`, `"precursor"` or `"l-tyrosine"` are codes the app reads. Ask before changing them.
3. In `landing-page.js` only: `**bold**`, and `[[term]]` for a glossary tooltip.
4. Save, then hard-refresh the browser (Cmd+Shift+R) so it doesn't show a cached old copy, and check the page.

If a page goes blank after an edit, a quote or comma is usually missing on the line you changed.
