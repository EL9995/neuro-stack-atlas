// ===========================================================================
// SCROLL SCENE WORDING
// The captions and labels in the two scroll-driven scenes on the home page.
//
// HOW TO EDIT
//   - Change only the text inside the "quotes". Keep the quotes and commas.
//   - Each caption is ["Title", "Body text"].
//   - Keep the same NUMBER of captions: each one is tied to a fixed moment
//     in the animation. To add or remove a caption, ask for a code change.
//   - Words in {curly braces} are filled in automatically. Keep them.
// ===========================================================================

// Scene 1: "What are neurotransmitters?" (exactly 6 captions, in order)
const STORY_SCENE = {
  captions: [
    ["What are neurotransmitters?", "Your brain runs on signals. Scroll to follow one."],
    ["It starts with a spark", "A neuron fires. A pulse of electricity leaves the cell body and races down the axon, the cell's long wire."],
    ["Then a handoff", "At the end of the wire there's a gap, and electricity can't cross it. So the cell releases chemicals instead."],
    ["Meet the neurotransmitters", "Tiny molecules stored in bubbles called vesicles. Dopamine, serotonin, GABA, and the rest of the six."],
    ["Across the gap", "They drift across a space tens of nanometers wide and fit into receptors on the next cell."],
    ["The next cell fires", "Enough filled receptors set off a new electrical pulse. Electrical, then chemical, then electrical again."],
  ],
};

// Scene 2: the assembly line, shown on each neurotransmitter's page.
// {nt} is filled in with the neurotransmitter's name, {madeFrom} with the
// matching line in madeFrom below.
// Some captions are not here because they come straight from the data:
//   - each supplement's caption (name + note) comes from supplement-links.js
//   - each cofactor caption comes from the cofactor notes in supplement-links.js
//   - pathways without a "slowest step" use the "enzymes" caption below
const PATHWAY_SCENE = {
  captions: {
    start:       ["The {nt} assembly line", "Your body already makes {nt} from {madeFrom}. Each station is an enzyme that changes the molecule one step."],
    precursors:  ["Precursors: where supplements join", "Precursors are raw materials. Different supplements add them at different points on the line."],
    enzymes:     ["Enzymes do the building", "Enzymes convert precursors into the finished chemical, one step at a time."],   // used when a pathway has no "slowest step"
    slowestStep: ["Enzymes: the slowest step", "{enzyme} is the bottleneck, and your body sets its pace. That's why precursors before it are gentler than {lateSupplement}, which joins after it."],
    cofactors:   ["Cofactors: what enzymes run on", "Take the vitamins and minerals away and the line stops. Raw material piles up and goes nowhere."],
    modulators:  ["Modulators: after {nt} is made", "They aren't building blocks. They change how {nt} is stored, released, received, or cleared."],
    end:         ["That's the whole map", "Precursors feed the line, cofactors keep it running, and modulators shape what happens next."],
  },

  // "Your body already makes {nt} from ___."
  madeFrom: {
    "dopamine":       "amino acids in food",
    "norepinephrine": "amino acids in food",
    "serotonin":      "amino acids in food",
    "gaba":           "amino acids in food",
    "glutamate":      "amino acids in food",
    "acetylcholine":  "choline in food",
  },

  // Optional extra caption about the strength of evidence, per neurotransmitter.
  evidence: {
    "dopamine": ["Mostly early evidence", "Most modulators here have limited evidence, and several findings come from animal studies. Caffeine is the best supported, and it adds no dopamine."],
  },

  // Short label on each modulator card. Anything not listed shows its role
  // (Modulator, Releaser, Reuptake blocker, ...).
  modulatorLabels: {
    "dopamine": {
      "rhodiola":   "Levels under stress",
      "pea":        "Release",
      "hordenine":  "Keeps PEA around",
      "sam-e":      "Turnover",
      "citicoline": "Receptors",
      "uridine":    "Release and receptors",
      "omega-3":    "Receptor function",
      "caffeine":   "Lifts the brakes",
      "theacrine":  "Lifts the brakes",
    },
  },

  buttons: {
    legendSupplement: "From a supplement",
  },

  // End of the scene: click any part of the chain for a short info card (DRAFT labels)
  explore: {
    hint: "Click any part of the chain to learn more.",
    kinds: { molecule: "Molecule", neurotransmitter: "Neurotransmitter", enzyme: "Enzyme", cofactor: "Cofactor", supplement: "Supplement" },
    slowest: "slowest step",
    evidence: "evidence",
    from: "Comes from these supplements",
    next: "Next step",
    after: "After it's made",
    needs: "Needs",
    inSupplements: "As a supplement:",
    readMore: "Read more →",
    close: "Close",
  },
};

// Scene 3: "Is it safe?" on the home page. Three chapters, 14 captions.
// Plain language on purpose: no jargon on the front page.
// Every caption here is DRAFT wording. Keep exactly 14, in this order.
const PROTOCOL_SCENE = {
  chapters: ["Foundation", "Cycles", "Recovery"],
  captions: [
    // Chapter 1: Foundation
    ["Start with a steady base", "Before any nootropic, your brain needs the basics. Think of them as the ground everything else is built on."],
    ["Building materials", "Healthy fats like omega-3 are built into the walls of brain cells, where the docks for signals sit."],
    ["Fuel for the workers", "Your body makes brain chemicals with tiny workers called enzymes. They run on vitamins and minerals, like B vitamins, magnesium and iron."],
    ["Steady energy", "Brain cells use a lot of energy. Creatine works like a backup battery, and helps most when you're short on sleep."],
    ["Why it comes first", "A nootropic can only work with what's already there. Without the basics, extra raw material goes nowhere. With them, it flows."],
    // Chapter 2: Cycles
    ["Signals land on docks", "Brain chemicals work by landing on receptors: little docks on the next cell. More filled docks means a stronger signal."],
    ["Too much, too often", "Flood the docks every day and the cell protects itself. It pulls some docks inside, like turning down the volume."],
    ["Same dose, less effect", "With fewer docks, the same dose does less. That's tolerance, and stopping can feel worse than before you started."],
    ["Breaks bring them back", "On days off, the cell slowly puts its docks back out. Cycling means planning those breaks, so the signal stays strong."],
    ["Some need breaks more", "Things that push hard, like stimulants, wear the docks down fastest. Raw materials like L-Tyrosine are gentler, because your body still decides how much to make."],
    // Chapter 3: Recovery
    ["Recovery is rebuilding", "Rest is when your brain restocks. The sending cell refills its supply, and the receiving cell rebuilds its docks."],
    ["Sleep does the heavy lifting", "During deep sleep, the brain clears out the day's leftovers and resets. No supplement replaces it."],
    ["Support it, don't skip it", "Some supplements, like magnesium in the evening, are studied for better sleep. They can support recovery, not stand in for it."],
    ["Foundation, cycles, recovery", "Set up these three first. Whatever you explore next will have a steady base to work from."],
  ],

  // Words drawn inside the pictures
  labels: {
    rawIn: "Raw materials", out: "Brain chemicals", wall: "Cell wall", workers: "Enzymes", energy: "Energy",
    sending: "Sending cell", receiving: "Receiving cell", docks: "Docks", meter: "How strong a dose feels",
    day: "Day", off: "off",
  },

  // Small print shown at the top of the scene the whole way through
  disclaimer: "Simplified illustration. Real effects and timing vary by person and supplement.",   // DRAFT

  buttons: {
    next: "Explore your neurotransmitters ↑",   // scrolls back up to the six cards in the title card
  },
};
