// [supplementId, neurotransmitterId, role, evidence, plain-English note]
const MAP = [
  ["l-tyrosine", "dopamine", "precursor", "moderate", "The raw material for dopamine. Helps most when you're stressed, sleep-deprived, or running on empty."],
  ["n-acetyl-l-tyrosine", "dopamine", "precursor", "limited", "A more soluble form of tyrosine that the body converts poorly. Plain L-Tyrosine is usually better."],
  ["dl-phenylalanine", "dopamine", "precursor", "limited", "One step further back than tyrosine. Your body turns it into tyrosine first, and some into PEA, a short-lived stimulant."],
  ["mucuna-pruriens", "dopamine", "precursor", "strong", "A bean that contains L-DOPA, which skips the slow step and becomes dopamine directly. Strongest effect, most side effects."],
  ["rhodiola", "dopamine", "modulator", "limited", "An adaptogen that may help protect dopamine levels under stress rather than adding more."],
  ["citicoline", "dopamine", "modulator", "limited", "Mainly a choline source, but animal studies show it supports dopamine receptors."],
  ["iron", "dopamine", "cofactor", "strong", "Needed for the slowest step in making dopamine. Low iron means low dopamine production."],
  ["l-methylfolate", "dopamine", "cofactor", "moderate", "Helps the body make BH4, which the dopamine-making enzymes depend on."],
  ["vitamin-b6", "dopamine", "cofactor", "strong", "Runs the final step that turns L-DOPA into dopamine."],

  ["l-tyrosine", "norepinephrine", "precursor", "moderate", "Feeds dopamine, which then becomes norepinephrine. The stress-performance effect is largely through this route."],
  ["dl-phenylalanine", "norepinephrine", "precursor", "limited", "Converted to tyrosine, then down the same pathway."],
  ["rhodiola", "norepinephrine", "modulator", "limited", "May keep norepinephrine from crashing during stress and fatigue."],
  ["vitamin-c", "norepinephrine", "cofactor", "strong", "Required for the step that turns dopamine into norepinephrine."],
  ["copper", "norepinephrine", "cofactor", "strong", "The other requirement for that same step. Most people get enough from food."],

  ["l-tryptophan", "serotonin", "precursor", "moderate", "The amino acid your body builds serotonin from. Most of it gets diverted elsewhere, so effects are gentle."],
  ["5-htp", "serotonin", "precursor", "moderate", "Skips the slow step and becomes serotonin directly. Stronger than tryptophan, and more likely to cause nausea."],
  ["iron", "serotonin", "cofactor", "strong", "Needed for the slowest step in making serotonin."],
  ["l-methylfolate", "serotonin", "cofactor", "moderate", "Helps make BH4 for the serotonin-making enzyme."],
  ["vitamin-b6", "serotonin", "cofactor", "strong", "Runs the step that turns 5-HTP into serotonin."],

  ["l-glutamine", "gaba", "precursor", "limited", "Raw material for glutamate, which becomes GABA. Little reaches the brain, so the effect on GABA is indirect."],
  ["l-theanine", "gaba", "modulator", "moderate", "From tea. Raises GABA and calms without making you drowsy. One of the best-tolerated options here."],
  ["magnesium-glycinate", "gaba", "modulator", "limited", "Supports GABA signaling and calms the glutamate side. Useful if you're low, which is common."],
  ["ashwagandha", "gaba", "modulator", "limited", "An adaptogen root with GABA-like activity. Lowers stress and cortisol over a few weeks."],
  ["vitamin-b6", "gaba", "cofactor", "strong", "Runs the enzyme that turns glutamate into GABA."],

  ["l-glutamine", "glutamate", "precursor", "limited", "The direct precursor of glutamate. Mostly used as gut fuel before it gets anywhere near the brain."],
  ["n-acetyl-cysteine", "glutamate", "modulator", "moderate", "Rebalances glutamate rather than raising it. Studied for cravings and compulsive habits."],
  ["magnesium-glycinate", "glutamate", "modulator", "moderate", "Sits in glutamate's NMDA receptor like a plug, keeping it from overfiring."],
  ["l-theanine", "glutamate", "modulator", "limited", "Weakly blocks glutamate receptors, part of why it feels calming."],

  ["alpha-gpc", "acetylcholine", "precursor", "moderate", "A choline source that gets into the brain efficiently. The most direct way to raise choline for acetylcholine."],
  ["citicoline", "acetylcholine", "precursor", "moderate", "A choline source that also supports brain cell membranes. A bit gentler than Alpha-GPC."],
  ["huperzine-a", "acetylcholine", "enzyme_inhibitor", "moderate", "Doesn't add acetylcholine. It slows the enzyme that breaks it down, so what you have lasts longer."],
  ["bacopa", "acetylcholine", "modulator", "moderate", "An Ayurvedic herb that improves memory, but only after 8 to 12 weeks of daily use."],
  ["vitamin-b5", "acetylcholine", "cofactor", "limited", "Your body uses it to make acetyl-CoA, the other half of the acetylcholine molecule."]
];

