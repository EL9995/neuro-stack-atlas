// ===========================================================================
// FOUNDATIONS, BETTER SWAPS, SPACING RULES, LIMITS, TEMPLATES
// The text in quotes is shown in the stack builder's suggestions and checks,
// and in the "Recovery & foundations" card on the home page.
//
// HOW TO EDIT
//   - Change only text inside "quotes". Keep quotes, commas and brackets.
//   - Words like "moderate", "precursor", "am" or ids like "l-tyrosine" are
//     codes the app reads. Don't change those without asking.
//   - Save, then refresh the page to see the change.
// ===========================================================================
// Recovery & foundations: support the system instead of pushing one neurotransmitter.
// [id, short tag, one-line why]
const FOUNDATIONS = [
  ["omega-3", "Membranes & mood", "Structural fat for neuron membranes and receptors. Strong general evidence."],
  ["magnesium-glycinate", "Calm & sleep", "Calms glutamate, supports sleep, and is needed to activate vitamin D. Many people are low."],
  ["vitamin-d3", "Mood & serotonin", "Switches on brain serotonin production. Test your level and dose to it."],
  ["vitamin-k2", "D3's partner", "D3's partner. Keeps calcium in bones, out of arteries."],
  ["vitamin-b12", "Energy & nerves", "Myelin and methylation. Common gaps: vegans, older adults, metformin users."],
  ["creatine", "Brain energy", "Brain energy buffer. Helps most under sleep loss."],
  ["phosphatidylserine", "Stress & cortisol", "Membrane building block that blunts the cortisol stress response."],
  ["zinc", "Glutamate balance", "Keeps glutamate signaling in check; low zinc is linked to low mood."],
  ["uridine", "Synapse building", "Synapse-building with choline and DHA. Animal data on dopamine receptor sensitivity."],
  ["lions-mane", "Nerve growth", "Nerve growth factor support. Early but interesting human data."]
];

// Better-supported alternatives: [replacement, why]
const SWAPS = {
  "n-acetyl-l-tyrosine": ["l-tyrosine", "Plain L-Tyrosine raises tyrosine levels more per dose. NALT converts poorly."],
  "dmae": ["alpha-gpc", "Alpha-GPC has much better evidence for actually raising acetylcholine."],
  "choline-bitartrate": ["citicoline", "If the goal is focus rather than covering your diet, Citicoline gets into the brain much better."]
};
// Never auto-suggested: only worth taking after a blood test shows you're low.
const NO_SUGGEST = ["iron", "copper"];

// Pairs that should be spaced apart: [a, b, hours, why]
const SEP = [
  ["iron", "mucuna-pruriens", 2, "Iron binds L-DOPA and blocks its absorption."],
  ["iron", "zinc", 2, "They compete for absorption."],
  ["iron", "magnesium-glycinate", 2, "Minerals compete for absorption."],
  ["zinc", "copper", 2, "Zinc blocks copper absorption."],
  ["l-tyrosine", "mucuna-pruriens", 1, "They compete for LAT1, the doorway into the brain."],
  ["dl-phenylalanine", "mucuna-pruriens", 1, "They compete for LAT1."],
  ["l-tryptophan", "l-tyrosine", 2, "They compete for LAT1, so each blunts the other."],
  ["l-tryptophan", "dl-phenylalanine", 2, "They compete for LAT1."],
  ["l-tryptophan", "mucuna-pruriens", 2, "They compete for LAT1."],
  ["5-htp", "mucuna-pruriens", 2, "Both need the AADC enzyme at the same time."]
];

// Daily upper limits shared by every form in a group, in elemental mg.
const GROUP_UL = { magnesium: 350, zinc: 40, iron: 45 };
const GROUP_NAME = { magnesium: "Magnesium", zinc: "Zinc", iron: "Iron" };
const GROUP_NOTE = {
  magnesium: "The usual first sign is loose stools.",
  zinc: "Long-term, too much zinc drains copper and can weaken immunity.",
  iron: "Higher doses are sometimes prescribed for deficiency, but only with a doctor checking your levels."
};

SWAPS["magnesium-oxide"] = ["magnesium-glycinate", "Oxide is poorly absorbed. Glycinate (or citrate, if you don't mind the laxative effect) actually raises your levels."];
SWAPS["zinc-oxide"] = ["zinc", "Oxide absorbs worst of the common forms. Picolinate, glycinate or citrate cost about the same and absorb better."];
SWAPS["ferrous-sulfate"] = ["iron", "If sulfate upsets your stomach or constipates you, bisglycinate is much gentler at a lower dose."];

const TEMPLATES = [
  { name: "Calm focus", items: [["caffeine", 100, "08:00"], ["l-theanine", 200, "08:00"]] },
  { name: "Stress resilience", items: [["l-tyrosine", 1000, "08:00"], ["vitamin-b6", 25, "08:00"], ["vitamin-c", 500, "08:00"], ["rhodiola", 300, "08:00"]] },
  { name: "Memory builder", items: [["alpha-gpc", 300, "08:00"], ["bacopa", 300, "13:00"], ["omega-3", 1000, "13:00"]] },
  { name: "Wind down & sleep", items: [["magnesium-glycinate", 300, "21:00"], ["glycine", 3000, "21:30"], ["apigenin", 50, "21:30"]] },
  { name: "Foundations", items: [["creatine", 5000, "08:00"], ["vitamin-d3", 2000, "13:00"], ["vitamin-k2", 100, "13:00"], ["omega-3", 1000, "13:00"], ["magnesium-glycinate", 300, "21:00"]] }
];
const EXAMPLE_STACK = { name: "Example: focus day", items: [["caffeine", 100, "08:00"], ["l-theanine", 200, "08:00"], ["l-tyrosine", 1000, "08:00"], ["vitamin-b6", 25, "08:00"], ["omega-3", 1000, "13:00"], ["vitamin-d3", 2000, "13:00"], ["caffeine", 100, "15:00"], ["magnesium-glycinate", 300, "21:00"]] };

