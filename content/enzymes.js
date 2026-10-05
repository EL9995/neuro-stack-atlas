// ===========================================================================
// ENZYME PAGES
// One entry per enzyme in the "How your body makes it" diagrams. Clicking an
// enzyme name there opens its page.
//
// ALL TEXT IN THIS FILE IS DRAFT (written October 2026) and needs review.
//
// Parts of each page come straight from the data, not from this file:
//   the reaction, which cofactors it needs (with links), which supplements
//   feed it, skip it or block it, and which neurotransmitters it appears in.
//
// HOW TO EDIT
//   - Change only text inside "quotes". Keep quotes, commas and brackets.
//   - "labels" must match the enzyme's name in neurotransmitters.js exactly;
//     that's how the diagram finds this page. Don't change them.
//   - "needs" is keyed by the cofactor's short name in the diagram ("Iron", "B6", ...).
//   - Save, then hard-refresh the browser (Cmd+Shift+R).
// ===========================================================================
const ENZYMES = [
  {
    id: "phenylalanine-hydroxylase", abbr: "PAH",
    name: "Phenylalanine hydroxylase",
    labels: ["Phenylalanine hydroxylase"],
    sum: "Turns phenylalanine, an amino acid from protein, into L-tyrosine: the first step toward dopamine.",
    where: "Mostly in the liver, not the brain. The brain gets most of its tyrosine ready-made from the blood.",
    does: "It attaches one oxygen-and-hydrogen group (a hydroxyl group) to phenylalanine. That small change turns it into tyrosine, the raw material the brain's dopamine-making line starts from.",
    needs: {
      "Iron": "An iron atom sits at the enzyme's core and does the actual chemistry.",
      "BH4": "A helper molecule that hands over the electrons the reaction needs. Your body makes it, and folate helps recycle it.",
    },
    speed: [
      "It speeds up when there's more phenylalanine around, so it mostly keeps phenylalanine levels in check.",
    ],
    notes: [
      "People born without a working version have phenylketonuria (PKU): phenylalanine builds up to harmful levels. That's why products with aspartame carry a phenylalanine warning.",
    ],
  },
  {
    id: "tyrosine-hydroxylase", abbr: "TH",
    name: "Tyrosine hydroxylase",
    labels: ["Tyrosine hydroxylase"],
    sum: "The slowest step in making dopamine and norepinephrine. It turns L-tyrosine into L-DOPA.",
    where: "Inside dopamine and norepinephrine neurons, and in the adrenal glands.",
    does: "It attaches a hydroxyl group to L-tyrosine, turning it into L-DOPA. Every other step after it is fast, so this one sets the pace for the whole line.",
    needs: {
      "Iron": "An iron atom at the enzyme's core does the chemistry. Low iron stores can slow it down.",
      "BH4": "A helper molecule that hands over the electrons the reaction needs. Folate helps the body recycle it.",
    },
    speed: [
      "It has a built-in brake: when dopamine and norepinephrine are already plentiful, they slow the enzyme down.",
      "Stress and fast nerve firing switch it on harder, by adding small chemical tags (phosphates) to the enzyme.",
      "It usually already has as much tyrosine as it can use. That's why extra tyrosine helps most when neurons are working hard, like under stress or sleep loss.",
    ],
    notes: [
      "Because it sets the pace, anything that joins the line after it (like L-DOPA from Mucuna) skips the brake. That makes it stronger, and harder for your body to regulate.",
    ],
  },
  {
    id: "aadc", abbr: "AADC",
    name: "Aromatic L-amino acid decarboxylase",
    labels: ["AADC"],
    sum: "A fast step shared by two lines: it turns L-DOPA into dopamine, and 5-HTP into serotonin.",
    where: "In neurons that make dopamine or serotonin, and also in the gut, liver and kidneys.",
    does: "It snips a small piece (carbon dioxide) off L-DOPA or 5-HTP, finishing them into dopamine or serotonin.",
    needs: {
      "B6": "It runs on the active form of vitamin B6 (P5P), which holds the molecule in place while the enzyme works.",
    },
    speed: [
      "It works fast and is rarely the bottleneck: whatever L-DOPA or 5-HTP arrives gets converted quickly.",
    ],
    notes: [
      "Because AADC also works outside the brain, L-DOPA and 5-HTP can be converted in the gut and blood before reaching the brain. Dopamine and serotonin made there can't cross into the brain, and can cause nausea.",
      "Parkinson's medicine pairs L-DOPA with carbidopa, a drug that blocks AADC outside the brain, for exactly this reason.",
    ],
  },
  {
    id: "dopamine-beta-hydroxylase", abbr: "DBH",
    name: "Dopamine β-hydroxylase",
    labels: ["Dopamine β-hydroxylase"],
    sum: "Turns dopamine into norepinephrine.",
    where: "Inside the storage bubbles (vesicles) of norepinephrine neurons, and in the adrenal glands.",
    does: "Once dopamine is packed into a vesicle, this enzyme attaches a hydroxyl group to it, turning it into norepinephrine, ready to be released.",
    needs: {
      "Vitamin C": "Vitamin C hands over the electrons for each reaction, and gets used up doing it.",
      "Copper": "Copper atoms at the enzyme's core do the chemistry.",
    },
    speed: [
      "Mostly set by how much dopamine gets packed into vesicles in norepinephrine neurons.",
    ],
    notes: [
      "A rare inherited lack of this enzyme means almost no norepinephrine is made. The main sign is very low blood pressure on standing up.",
    ],
  },
  {
    id: "tryptophan-hydroxylase", abbr: "TPH",
    name: "Tryptophan hydroxylase",
    labels: ["Tryptophan hydroxylase"],
    sum: "The slowest step in making serotonin. It turns L-tryptophan into 5-HTP.",
    where: "Two versions: TPH2 in the brain's serotonin neurons, and TPH1 in the gut and the pineal gland.",
    does: "It attaches a hydroxyl group to L-tryptophan, turning it into 5-HTP. It sets the pace for serotonin production.",
    needs: {
      "Iron": "An iron atom at the enzyme's core does the chemistry.",
      "BH4": "A helper molecule that hands over the electrons the reaction needs. Folate helps the body recycle it.",
    },
    speed: [
      "Unlike tyrosine hydroxylase, it usually isn't full on its raw material. So how much tryptophan reaches the brain changes how much serotonin gets made.",
      "Tryptophan competes with other amino acids to get into the brain (through LAT1), so a big protein meal can lower how much gets in.",
    ],
    notes: [
      "Most of the body's serotonin, roughly 90%, is made in the gut by TPH1. It doesn't cross into the brain.",
    ],
  },
  {
    id: "aanat-asmt", abbr: "AANAT, ASMT",
    name: "AANAT and ASMT (melatonin enzymes)",
    labels: ["At night: AANAT + ASMT"],
    sum: "A two-step night shift that turns serotonin into melatonin.",
    where: "In the pineal gland, a small gland deep in the brain.",
    does: "AANAT attaches an acetyl group to serotonin, then ASMT attaches a methyl group (taken from SAMe, the body's main methyl donor). The result is melatonin, the hormone that tells the body it's night.",
    needs: {},
    speed: [
      "AANAT is the on/off switch. Darkness turns it up; light at night shuts it down within minutes.",
    ],
    notes: [
      "This is why bright light late in the evening can delay melatonin.",
    ],
  },
  {
    id: "glutaminase", abbr: "GLS",
    name: "Glutaminase",
    labels: ["Glutaminase"],
    sum: "Turns glutamine into glutamate, the brain's main “go” signal.",
    where: "Inside neurons, in their energy centers (mitochondria).",
    does: "It removes a nitrogen group from glutamine, turning it into glutamate, ready to be packed up and released.",
    needs: {},
    speed: [
      "It's part of a recycling loop. After glutamate is released, nearby support cells (astrocytes) soak it up, turn it back into glutamine, and hand it back to neurons. This keeps glutamate from piling up between cells.",
    ],
    notes: [
      "It doesn't need a vitamin or mineral cofactor.",
    ],
  },
  {
    id: "gad", abbr: "GAD",
    name: "Glutamate decarboxylase",
    labels: ["Glutamate decarboxylase (GAD)", "GAD (converts the excess)"],
    sum: "Turns glutamate, the brain's accelerator, into GABA, its brake.",
    where: "Inside GABA neurons. Two versions: GAD67 makes the steady background supply, GAD65 makes extra GABA on demand.",
    does: "It snips carbon dioxide off glutamate. That one change turns the brain's main “go” signal into its main “stop” signal.",
    needs: {
      "B6": "It runs on the active form of vitamin B6 (P5P).",
    },
    speed: [
      "Part of the enzyme sits idle without B6 attached, ready to switch on when more GABA is needed.",
    ],
    notes: [
      "Severe vitamin B6 deficiency can cause seizures, partly because GABA production drops.",
    ],
  },
  {
    id: "choline-acetyltransferase", abbr: "ChAT",
    name: "Choline acetyltransferase",
    labels: ["Choline acetyltransferase"],
    sum: "Joins choline with acetyl-CoA to make acetylcholine.",
    where: "Inside acetylcholine neurons, near their endings.",
    does: "It moves a small acetyl group from acetyl-CoA onto choline. The result is acetylcholine.",
    needs: {
      "B5 (acetyl-CoA)": "Vitamin B5 (pantothenic acid) is needed to build coenzyme A, the carrier that brings the acetyl group.",
    },
    speed: [
      "The enzyme itself is rarely the limit. How fast neurons can pull choline in (through a choline transporter) matters more.",
    ],
    notes: [
      "About half the choline comes back from acetylcholine that's already been used, so the supply partly refills itself.",
    ],
  },
  {
    id: "acetylcholinesterase", abbr: "AChE",
    name: "Acetylcholinesterase",
    labels: ["Acetylcholinesterase (breakdown)"],
    sum: "Breaks acetylcholine apart in the synapse, ending its signal.",
    where: "In the gap between cells (the synapse), and where nerves meet muscles.",
    does: "It splits acetylcholine into choline and acetate within milliseconds of its release. That keeps each signal short and sharp, and frees the choline to be recycled.",
    needs: {},
    speed: [
      "One of the fastest enzymes known: a single one can break down thousands of acetylcholine molecules every second.",
    ],
    notes: [
      "Huperzine A, and Alzheimer's medicines like donepezil, block this enzyme so acetylcholine lingers longer.",
    ],
  },
];

// Headings and labels on every enzyme page (DRAFT)
const ENZYME_PAGE = {
  eyebrow: "Enzyme",
  reaction: "The reaction",
  does: "What it does",
  where: "Where it works",
  needs: "What it needs",
  speed: "What controls its speed",
  supplements: "Where supplements come in",
  feed: "Feeds this step",         // supplements that supply this enzyme's raw material
  skip: "Skips this step",         // supplements that join right after it
  block: "Blocks this step",       // supplements that slow or block it
  notes: "Good to know",
  appearsIn: "Part of",            // shown before the neurotransmitter links
  hint: "Tap a cofactor or supplement to open it.",
};
