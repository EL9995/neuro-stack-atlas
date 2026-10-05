// ===========================================================================
// THE SIX NEUROTRANSMITTERS
// Name, job, what low and high levels feel like, and how the body makes each
// one (the pathway shown on its page).
//
// HOW TO EDIT
//   - Change only text inside "quotes". Keep quotes, commas and brackets.
//   - Words like "moderate", "precursor", "am" or ids like "l-tyrosine" are
//     codes the app reads. Don't change those without asking.
//   - Save, then refresh the page to see the change.
// ===========================================================================
const NTS = [
  { id: "dopamine", name: "Dopamine", abbr: "DA", word: "Drive", cls: "Catecholamine",
    fn: "Motivation, reward, and focus. It's the chemical behind wanting something and going after it, and it also controls smooth movement.",
    low: ["Low motivation, procrastination", "Trouble feeling pleasure", "Brain fog, poor focus", "Sugar or stimulant cravings"],
    high: ["Impulsivity, risk-taking", "Anxiety or agitation", "Insomnia", "At extremes, paranoia"],
    path: [
      { m: "Phenylalanine", from: ["dl-phenylalanine"] },
      { e: "Phenylalanine hydroxylase", co: [["Iron", "iron"], ["BH4", "l-methylfolate"]] },
      { m: "L-Tyrosine", from: ["l-tyrosine", "n-acetyl-l-tyrosine"] },
      { e: "Tyrosine hydroxylase", rl: true, co: [["Iron", "iron"], ["BH4", "l-methylfolate"]] },
      { m: "L-DOPA", from: ["mucuna-pruriens"] },
      { e: "AADC", co: [["B6", "vitamin-b6"]] },
      { m: "Dopamine", final: true }
    ] },
  { id: "norepinephrine", name: "Norepinephrine", abbr: "NE", word: "Alertness", cls: "Catecholamine",
    fn: "Alertness, attention, and the fight-or-flight response. Your body makes it directly from dopamine, so anything that feeds dopamine also feeds this.",
    low: ["Fatigue, low energy", "Poor concentration", "Feeling flat or slow"],
    high: ["Anxiety, restlessness", "Racing heart", "Irritability", "Trouble sleeping"],
    path: [
      { m: "L-Tyrosine", from: ["l-tyrosine", "dl-phenylalanine"] },
      { e: "Tyrosine hydroxylase", rl: true, co: [["Iron", "iron"], ["BH4", "l-methylfolate"]] },
      { m: "L-DOPA", from: ["mucuna-pruriens"] },
      { e: "AADC", co: [["B6", "vitamin-b6"]] },
      { m: "Dopamine" },
      { e: "Dopamine β-hydroxylase", co: [["Vitamin C", "vitamin-c"], ["Copper", "copper"]] },
      { m: "Norepinephrine", final: true }
    ] },
  { id: "serotonin", name: "Serotonin", abbr: "5-HT", word: "Mood", cls: "Indoleamine",
    fn: "Mood stability, contentment, and appetite. At night your body turns it into melatonin, so it matters for sleep too. Most of it is actually made in your gut.",
    low: ["Low or irritable mood", "Worry and rumination", "Carb cravings", "Poor sleep"],
    high: ["Nausea, restlessness", "Emotional flatness", "Stacking serotonin drugs and supplements can cause serotonin syndrome"],
    path: [
      { m: "L-Tryptophan", from: ["l-tryptophan"] },
      { e: "Tryptophan hydroxylase", rl: true, co: [["Iron", "iron"], ["BH4", "l-methylfolate"]] },
      { m: "5-HTP", from: ["5-htp"] },
      { e: "AADC", co: [["B6", "vitamin-b6"]] },
      { m: "Serotonin", final: true },
      { e: "At night: AANAT + ASMT", co: [] },
      { m: "Melatonin" }
    ] },
  { id: "gaba", name: "GABA", abbr: "GABA", word: "Calm", cls: "Amino acid",
    fn: "The brain's main brake pedal. GABA quiets nerve activity, which is how you wind down, relax, and fall asleep. Most GABA supplements barely reach the brain, so the usual approach is to support its production or its receptors.",
    low: ["Anxiety, feeling wired", "Trouble winding down", "Muscle tension", "Light, restless sleep"],
    high: ["Drowsiness", "Sluggish thinking", "Poor coordination"],
    path: [
      { m: "L-Glutamine", from: ["l-glutamine"] },
      { e: "Glutaminase", co: [] },
      { m: "Glutamate" },
      { e: "Glutamate decarboxylase (GAD)", co: [["B6", "vitamin-b6"]] },
      { m: "GABA", final: true }
    ] },
  { id: "glutamate", name: "Glutamate", abbr: "Glu", word: "Learning", cls: "Amino acid",
    fn: "The brain's main gas pedal. Glutamate drives learning and memory formation, but too much overstimulates nerve cells. With glutamate the goal is usually balance, not more.",
    low: ["Brain fog", "Slow learning", "Low mental energy (uncommon)"],
    high: ["Anxiety, overstimulation", "Insomnia", "Headaches", "Long-term, damage to nerve cells (excitotoxicity)"],
    path: [
      { m: "L-Glutamine", from: ["l-glutamine"] },
      { e: "Glutaminase", co: [] },
      { m: "Glutamate", final: true },
      { e: "GAD (converts the excess)", co: [["B6", "vitamin-b6"]] },
      { m: "GABA" }
    ] },
  { id: "acetylcholine", name: "Acetylcholine", abbr: "ACh", word: "Memory", cls: "Choline ester",
    fn: "Memory, learning, and sustained attention. It's also the signal that makes your muscles contract. Your body builds it from choline, which many people don't get enough of from food.",
    low: ["Forgetfulness", "Trouble focusing", "Word-finding problems", "Dry mouth and eyes"],
    high: ["Headaches", "Muscle tension or twitching", "Low mood", "Stomach upset"],
    path: [
      { m: "Choline", from: ["alpha-gpc", "citicoline"] },
      { e: "Choline acetyltransferase", co: [["B5 (acetyl-CoA)", "vitamin-b5"]] },
      { m: "Acetylcholine", final: true },
      { e: "Acetylcholinesterase (breakdown)", co: [], block: [["Huperzine A", "huperzine-a"]] },
      { m: "Choline (recycled)" }
    ] }
];

