// ===========================================================================
// GLOSSARY (hover tooltips)
// Each entry: "lowercase word": ["Display name", "Explanation"].
// Any time the word appears in supplement text, it gets a tooltip.
//
// HOW TO EDIT
//   - Change only text inside "quotes". Keep quotes, commas and brackets.
//   - Words like "moderate", "precursor", "am" or ids like "l-tyrosine" are
//     codes the app reads. Don't change those without asking.
//   - Save, then refresh the page to see the change.
// ===========================================================================
const GLOSS = {
  "bh4": ["BH4", "Tetrahydrobiopterin. A helper molecule your body makes. The first step in making dopamine and serotonin can't run without it. Folate and vitamin C help keep it topped up."],
  "aadc": ["AADC", "The enzyme that turns L-DOPA into dopamine and 5-HTP into serotonin. Runs on vitamin B6."],
  "lat1": ["LAT1", "The doorway amino acids use to get into the brain. Tyrosine, tryptophan, phenylalanine and L-DOPA all compete for it, which is why a protein-heavy meal blunts them."],
  "maois": ["MAOIs", "Monoamine oxidase inhibitors. An older class of antidepressants, plus some Parkinson's drugs. Dangerous with most precursors."],
  "mao": ["MAO", "Monoamine oxidase. An enzyme that breaks down dopamine, serotonin, and norepinephrine."],
  "comt": ["COMT", "An enzyme that breaks down dopamine and norepinephrine."],
  "p5p": ["P5P", "Pyridoxal 5'-phosphate, the active form of vitamin B6."],
  "blood-brain barrier": ["Blood-brain barrier", "A filter around the brain's blood vessels that controls what gets in."],
  "half-life": ["Half-life", "How long it takes your body to clear half of a dose."],
  "rate-limiting": ["Rate-limiting step", "The slowest step in a chain. It sets the pace for the whole pathway."],
  "ache": ["AChE", "Acetylcholinesterase, the enzyme that breaks down acetylcholine."],
  "nmda": ["NMDA receptor", "A glutamate receptor central to learning. Too much activity there is linked to anxiety and nerve damage."],
  "serotonin syndrome": ["Serotonin syndrome", "A dangerous reaction to too much serotonin activity, usually from combining serotonin drugs or supplements. Signs: agitation, fever, sweating, fast heartbeat, twitching muscles."],
  "adaptogen": ["Adaptogen", "An herb said to help the body handle stress, usually by calming the stress hormone system. Effects build over weeks."],
  "ssris": ["SSRIs", "The most common antidepressants (sertraline, fluoxetine, escitalopram and others). They raise serotonin."],
  "snris": ["SNRIs", "Antidepressants that raise serotonin and norepinephrine (venlafaxine, duloxetine and others)."],
  "hpa axis": ["HPA axis", "The brain-to-adrenal chain that controls cortisol, your main stress hormone."],
  "glutathione": ["Glutathione", "Your body's main built-in antioxidant."]
};


Object.assign(GLOSS, {
  "taar1": ["TAAR1", "A receptor for trace amines like PEA. Activating it makes nerve cells release dopamine and norepinephrine."],
  "alpha-2": ["Alpha-2 receptor", "A 'brake' receptor. When norepinephrine hits it, the nerve releases less. Blocking it releases more."],
  "kennedy pathway": ["Kennedy pathway", "The route cells use to build phosphatidylcholine, the main fat in synapse membranes, from choline and uridine."],
  "ngf": ["NGF", "Nerve growth factor. A protein that helps neurons survive, grow, and repair."],
  "downregulation": ["Downregulation", "When a receptor is overstimulated for a long time, cells remove receptors or make them less sensitive. You feel it as tolerance."],
  "cyp3a4": ["CYP3A4", "A liver enzyme that clears about half of all medications. Speeding it up makes drugs wear off too fast."]
});
