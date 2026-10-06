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


// ===========================================================================
// STACK LOAD RULES (October 2026)
// Principle: let people draw any stack, but don't help them run a bad one.
// A "serious" or "critical" finding pauses the timeline step and the Tracker
// checklist for that stack until it's fixed.
//
// HOW TO EDIT
//   - Numbers are thresholds: how many supplements before each severity applies.
//   - Severity words are codes: "info", "minor", "moderate" (to review),
//     "major" (serious), "critical". Ask before adding new ones.
//   - "tag" says which supplements count, using the tags in supplements.js.
//   - {names}, {n}, {fast} are filled in by the app.
//   - Wording marked EXISTING was already on the site; wording marked DRAFT is new.
// ===========================================================================
const LOAD_RULES = {
  category: "Stack load",   // DRAFT
  // Same chemical system: [count, severity] steps, highest count that applies wins.
  systems: [
    { id: "serotonergic", tag: "serotonergic", nt: "serotonin", steps: [[2, "moderate"], [3, "critical"]],
      always: { "st-johns-wort": "major" },   // EXISTING rule: St. John's Wort with any other serotonin booster is serious
      title: "Several serotonin boosters",   // EXISTING
      body: "{names} all raise serotonin activity. Stacking them raises the risk of serotonin syndrome. Most people should pick one." },   // EXISTING
    { id: "dopaminergic", tag: "dopaminergic", nt: "dopamine", steps: [[2, "moderate"], [3, "major"]],
      title: "Several dopamine boosters",   // DRAFT
      body: "{names} all push dopamine. Together they add up to more of the same, not a different effect, so most people pick one and adjust its dose." },   // DRAFT
    { id: "cholinergic", tag: "cholinergic", nt: "acetylcholine", steps: [[2, "moderate"], [3, "major"]],
      title: "Lots of acetylcholine support",   // EXISTING
      body: "{names} all push acetylcholine. Headaches, muscle tension or low mood are signs of too much; drop one if they show up." },   // EXISTING
    { id: "gabaergic", tag: "sedative", nt: "gaba", steps: [[2, "moderate"], [3, "major"]],
      title: "Sedatives stacked",   // EXISTING
      body: "{names} all calm the nervous system, and together they're stronger than either. No driving after, and no alcohol." },   // EXISTING
  ],
  // Added to a system's message when one of its supplements skips the pathway's slow step (worked out from neurotransmitters.js). DRAFT
  fastNote: "{fast} skips the slow step, so your body can't pace it the way it paces the others.",

  // Supplements acting on brain chemicals at all (any non-cofactor link in supplement-links.js),
  // not counting the Foundations list above, which supports the whole system.
  brainTotal: { at: 6, sev: "major", title: "Too much at once",   // DRAFT
    body: "{n} supplements in this stack act on brain chemicals: {names}. With this many, side effects are more likely and it's hard to tell what's helping. Start with two or three and add one at a time." },   // DRAFT
  // Everything in the stack
  itemTotal: { at: 8, sev: "moderate", title: "Hard to tell what's working",   // DRAFT
    body: "{n} supplements in one stack. If something changes, good or bad, you won't know which one did it. Add new ones one at a time, a week or two apart." },   // DRAFT
  // Amino acids that share the same doorway into the brain (the "lat1" tag)
  aminoAcids: { tag: "lat1", at: 2, sev: "info", title: "Amino acids competing",   // DRAFT
    body: "{names} use the same transporter (LAT1) to get into the brain, so taking them together blunts each one." },   // DRAFT

  // Dose ranking in the stack check. "times" = how many times the top of the typical range
  // (supplements.js) a single dose is; the highest step that applies wins. "serious" (major) and
  // "critical" doses pause the timeline and need review + approval in step 4.
  // {name}, {dose}, {range}, {x}, {ul}, {total} are filled in by the app. DRAFT (thresholds for legal/ethics to confirm)
  dose: {
    steps: [
      { times: 1, sev: "moderate", title: "Above the typical range", body: "Above the typical {range} per dose." },   // body EXISTING
      { times: 2, sev: "major", title: "Far above the typical range", body: "{dose} is {x}× the top of the typical {range} per dose. Doses this high are rarely studied, and side effects are more likely." },
      { times: 5, sev: "critical", title: "Extremely high dose", body: "{dose} is {x}× the top of the typical {range} per dose. Don't take this much without a doctor's advice." },
    ],
    ulCriticalTimes: 2,   // a daily total this many times the upper limit is critical instead of serious
    ulCriticalBody: "{total} a day in total is {x}× the {ul} upper limit. Don't take this much without a doctor's advice.",
  },

  // Check step verdict banner. DRAFT
  verdict: {
    good: "Reasonable starting point", review: "Review these", bad: "Warning: Stack needs review",
    approved: "Approved after review",
    goodBody: "Nothing serious in our data. Still add one new supplement at a time.",
    reasons: "Top reasons",
    trim: "Keep one per system", trimHint: "Keeps one supplement per system (the gentlest, then the best evidence) and removes: {names}.",
    trimDone: "Kept one per system. Removed {names}.",
  },
  // Timeline step and Tracker while a serious or critical finding is open. DRAFT
  paused: {
    timeline: "Fix the warnings before we plan timing",
    timelineBody: "This stack has a serious warning in step 4. The timeline comes back once it's fixed or the supplement is removed.",
    goToCheck: "Go to step 4",
    tracker: "“{name}” has a serious warning, so there's no checklist for it. Fix it in the Stack builder (step 4) or remove the supplement.",
    summary: "Paused until step 4 is fixed",
  },
  // "Approve anyway": the person can still plan and track a stack with serious warnings after
  // confirming each one. The approval is kept with the stack (in their browser only) and covers
  // exactly the warnings confirmed: a new or worse serious warning needs approving again. allowCritical: false would keep "critical" stacks paused. DRAFT
  // Review flow (step 4): the person reviews each serious / to-review warning before the approval unlocks. DRAFT
  review: {
    button: "Review the warnings", reviewing: "Reviewing…",
    hint: "Go through each warning, then approve the stack at the bottom.",
    folded: "Choose Review the warnings to see each one, or Keep one per system to fix the overlap automatically.",
    tick: "Reviewed",
    progress: "{n} of {total} warnings reviewed.",
    tickAll: "Tick Reviewed on each one above to continue.",
  },
  approve: {
    allowCritical: true,
    heading: "Approve this stack",
    confirm: "I understand these risks. I'm choosing to plan this stack anyway, and I'll check with a doctor or pharmacist first.",
    go: "Approve stack",
    done: "Approved anyway on {when}, despite {n} serious warning{s}.",
    withdraw: "Withdraw approval",
    timelineNote: "You approved this stack despite serious warnings in step 4.",
    trackerNote: "You approved this stack despite serious warnings.",
    criticalBlocked: "Stacks with a critical warning can't be approved. Fix it first.",
  },

  // Dose monitor: pops up next to a dose box when a dose goes above the top of the typical range
  // (supplements.js). {name}, {dose}, {range}, {ul} are filled in by the app. DRAFT
  doseWarn: {
    heading: "Dose set higher than suggested",
    body: "{name}: {dose}. The typical range is {range} per dose.",
    ul: "That's also above the {ul} daily upper limit.",
    useMax: "Use {max}",
    keep: "Keep {dose}",
    change: "Change it",
  },

  // Add step: shown when adding something crosses one of the thresholds above. DRAFT
  addWarn: { heading: "Adding {name}:", swap: "Swap out {name}", anyway: "Add anyway", cancel: "Cancel" },
};
