// ===========================================================================
// SIMULATOR WORDING AND SOURCES
// The Simulator page (#sim) draws all six assembly lines from neurotransmitters.js
// and runs the chosen stack through them.
// ALL TEXT HERE IS DRAFT (October 2026).
//
// HOW TO EDIT
//   - Change only text inside "quotes". Keep quotes, commas and brackets.
//   - The numbers under "model" tune the animation, not the science. They're
//     relative: a "lat1Capacity" of 2 means the doorway lets about two dots a
//     second through, shared by everything that uses it.
//   - Save, then refresh the page.
// ===========================================================================
const SIM_TEXT = {
  eyebrow: "Simulator",
  title: "Watch your stack move through the pathways.",
  lede: "Each supplement enters where it joins its pathway, crosses into the brain, and flows toward the neurotransmitter it helps make. It shows why more isn't always more, and where stacking runs into limits.",
  disclaimer: "An illustration of the mechanism, built from this site's data. It doesn't predict what will happen in your body: absorption, metabolism, genes, diet and medication all change it.",
  stackLabel: "Stack",
  edit: "Edit in the Stack builder →",
  open: "Open in the simulator →",
  empty: "This stack has nothing that feeds a pathway yet. Add a precursor like L-Tyrosine, L-Tryptophan or Alpha-GPC in the Stack builder to see it move.",
  pause: "Pause", play: "Play",

  blood: "Blood",
  brain: "Brain",
  barrier: "Blood-brain barrier",
  lat1: "LAT1 doorway",
  lat1Note: "Shared by the large amino acids",
  lat1Short: "doorway",
  otherRoute: "Own route",
  protein: "Protein from meals",
  slowest: "Slowest step",
  fromFood: "From food",
  inStack: "In your stack",
  aboveRange: "Above typical range",
  nothingHere: "Nothing in your stack feeds this line",
  actsHere: "Also acting here",
  overflow: "Faster than the slow step allows",
  waiting: "{n} waiting",

  legendTitle: "How to read it",
  legend: [
    ["dot", "Each dot is a bit of a supplement in your stack, colored by the neurotransmitter it's heading for. Bigger doses send more dots."],
    ["door", "LAT1 is one doorway into the brain shared by tyrosine, phenylalanine, tryptophan and L-DOPA (and the same amino acids from protein). It only lets so much through, so when several use it at once, each gets in more slowly and a queue builds."],
    ["valve", "The slowest step in a pathway works like a valve: the body sets its pace. Extra supply before it piles up instead of becoming more neurotransmitter."],
    ["bypass", "Mucuna (L-DOPA) and 5-HTP join after the valve, so the body can't pace them. That's why they act stronger and carry more side effects."],
    ["cofactor", "Cofactors are the vitamins and minerals each step needs. They light up when they're in your stack; otherwise they're marked “from food”, because most people get them from their diet. A dim cofactor isn't a sign you need to buy it."],
  ],
  route5htp: "How 5-HTP crosses into the brain is less clear, so it's shown on its own route.",

  warningsTitle: "Warnings for this stack",
  warningsNone: "No conflicts in our data at “to review” or above.",
  show: "Show",

  sourcesTitle: "Sources",
  sourcesIntro: "The doorway, the competition and the slow step come from these studies. Everything else (which supplement joins where, cofactors, typical doses) is the same data used across the site.",
  sources: [
    ["LAT1 carries L-DOPA across the blood-brain barrier, and other large neutral amino acids block it.", "Kageyama T et al. Brain Research, 2000", "https://doi.org/10.1016/s0006-8993(00)02758-x"],
    ["LAT1 sits in the brain's capillary walls and carries the aromatic and branched-chain amino acids and L-DOPA.", "Matsuo H et al. NeuroReport, 2000", "https://doi.org/10.1097/00001756-200011090-00021"],
    ["Brain tryptophan and serotonin follow tryptophan's ratio to the competing amino acids, not tryptophan alone. A protein meal doesn't raise them.", "Fernstrom JD, Wurtman RJ. Science, 1972", "https://doi.org/10.1126/science.178.4059.414"],
    ["High-protein meals or extra phenylalanine reversed levodopa's effect without lowering its blood level, by competing at transport into the brain.", "Nutt JG et al. New England Journal of Medicine, 1984", "https://doi.org/10.1056/NEJM198402233100802"],
    ["Tyrosine hydroxylase is the first and slowest step in making dopamine and norepinephrine.", "Nagatsu T, Levitt M, Udenfriend S. Journal of Biological Chemistry, 1964", ""],
    ["Tryptophan hydroxylase isn't saturated, so tryptophan supply into the brain matters; 5-HTP and L-DOPA are probably carried in by similar systems to their parent amino acids.", "Tissot R. Neuropsychobiology, 1975", "https://doi.org/10.1159/000117498"],
  ],

  // Animation tuning (relative numbers; see the note at the top)
  model: {
    dotsPerSecond: 1.2,      // a typical dose of one precursor
    maxDoseFactor: 3,        // doses far above range send at most 3x the dots
    lat1Capacity: 2,         // dots per second through the shared LAT1 doorway
    proteinDots: 1.4,        // competing amino acids from a protein meal near a LAT1 supplement
    valveCapacity: 0.9,      // dots per second through each slowest step
    queueLife: 10,           // seconds a dot waits at the LAT1 doorway before it stays in the blood (used elsewhere in the body)
    overflowRate: 1.4,       // arrivals per second above this mark the neurotransmitter "faster than the slow step allows"
  },
};
