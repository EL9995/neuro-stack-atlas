// ===========================================================================
// MAGNESIUM, ZINC AND IRON FORMS
// Same format as supplements.js. This file also contains a little setup code
// that copies shared details between forms; edit only the text in quotes.
//
// HOW TO EDIT
//   - Change only text inside "quotes". Keep quotes, commas and brackets.
//   - Words like "moderate", "precursor", "am" or ids like "l-tyrosine" are
//     codes the app reads. Don't change those without asking.
//   - Save, then refresh the page to see the change.
// ===========================================================================
// ---------------------------------------------------------------------------
// Magnesium forms. All share group "magnesium": the daily limit, spacing rules
// and suggestions treat them as one mineral. `elemental` converts a compound
// dose (mg) to elemental magnesium where the unit isn't already elemental.
// ---------------------------------------------------------------------------
const MG_IX = () => [
  ["Kidney disease", "major", "Your kidneys clear magnesium. With poor kidney function it can build up to dangerous levels."],
  ["Tetracycline and quinolone antibiotics", "moderate", "Blocks antibiotic absorption. Separate by 2–4 hours."],
  ["Osteoporosis drugs (bisphosphonates)", "moderate", "Reduces their absorption. Separate by 2 hours."]
];
S.push(
  { id: "magnesium-l-threonate", name: "Magnesium L-Threonate", cat: "mineral", aka: ["Magtein", "Magnesium threonate"],
    sum: "The 'brain' form of magnesium. Raised brain magnesium and synapse density in animal studies; small human trials on memory and sleep.",
    dose: [1000, 2000, "mg", "Split: some in the afternoon, most in the evening", "Doses are for the whole compound. 2,000 mg gives only about 144 mg of elemental magnesium, so it's a poor way to fix a general deficiency."],
    onset: [null, null, "Studies ran 6–12 weeks."], dur: [null, null, null], tol: ["none", null],
    fx: ["Memory and cognition support (small human trials)", "Sleep quality", "Raises brain magnesium (animal studies)"],
    se: ["Drowsiness", "Headache", "Loose stools (less than citrate)"],
    ix: MG_IX(),
    mech: "Threonate appears to carry magnesium across the blood-brain barrier better than other forms in rodent studies, where it increased synapse density and NMDA receptor function in memory regions.",
    bio: "Well absorbed, but low magnesium content per gram. Pair with another form if you're actually deficient.",
    met: "Not broken down; levels are controlled by the kidneys.",
    sol: ["water", null], group: "magnesium", elemental: 0.072 },

  { id: "magnesium-citrate", name: "Magnesium Citrate", cat: "mineral", aka: ["Magnesium"],
    sum: "Cheap, well absorbed and widely available. The catch is that it's the most laxative of the well-absorbed forms.",
    dose: [200, 350, "mg elemental", "Once daily, or split", "Higher doses are used on purpose as a laxative. If your stomach complains, switch to glycinate."],
    onset: [null, null, "Builds over days to weeks."], dur: [null, null, null], tol: ["none", null],
    fx: ["Restores magnesium levels", "Relieves constipation", "Muscle cramps"],
    se: ["Loose stools or diarrhea", "Stomach cramps"],
    ix: MG_IX(),
    mech: "Supplies magnesium, which blocks NMDA receptors, supports GABA signaling, and is needed by hundreds of enzymes, including those that activate vitamin D.",
    bio: "Good. Much better than oxide.",
    met: "Not broken down; levels are controlled by the kidneys.",
    sol: ["water", null], group: "magnesium" },

  { id: "magnesium-malate", name: "Magnesium Malate", cat: "mineral", aka: [],
    sum: "Magnesium bound to malic acid, which feeds the cell's energy cycle. Usually taken in the daytime; gentler on the stomach than citrate.",
    dose: [200, 350, "mg elemental", "Morning or midday", null],
    onset: [null, null, "Builds over days to weeks."], dur: [null, null, null], tol: ["none", null],
    fx: ["Restores magnesium levels", "Daytime use without drowsiness", "Muscle pain and fatigue (weak evidence)"],
    se: ["Loose stools at high doses"],
    ix: MG_IX(),
    mech: "Supplies magnesium plus malate, an intermediate in the Krebs cycle that cells use to make energy.",
    bio: "Good.",
    met: "Malate is used in energy metabolism; magnesium levels are controlled by the kidneys.",
    sol: ["water", null], group: "magnesium" },

  { id: "magnesium-taurate", name: "Magnesium Taurate", cat: "mineral", aka: [],
    sum: "Magnesium plus taurine, two calming partners. Popular for heart health, blood pressure and evening wind-down.",
    dose: [100, 200, "mg elemental", "Evening", "Low magnesium content per gram, so check the elemental amount on the label."],
    onset: [null, null, "Builds over days to weeks."], dur: [null, null, null], tol: ["none", null],
    fx: ["Calming", "Heart rhythm and blood pressure support", "Restores magnesium levels"],
    se: ["Drowsiness", "Loose stools at high doses"],
    ix: [...MG_IX(), ["Blood pressure medication", "minor", "May lower blood pressure slightly."]],
    mech: "Combines magnesium's NMDA-blocking and GABA support with taurine's light activation of GABA and glycine receptors.",
    bio: "Good.",
    met: "Taurine is cleared by the kidneys and used to make bile salts; magnesium levels are controlled by the kidneys.",
    sol: ["water", null], group: "magnesium" },

  { id: "magnesium-oxide", name: "Magnesium Oxide", cat: "mineral", aka: ["Mag oxide"],
    sum: "The form in most cheap multivitamins and laxatives. Lots of magnesium on the label, very little absorbed.",
    dose: [250, 400, "mg elemental", "With food", "Studies show only a small fraction gets absorbed. Fine as a laxative or antacid, poor for raising your levels."],
    onset: [null, null, "Builds slowly, if at all."], dur: [null, null, null], tol: ["none", null],
    fx: ["Laxative", "Antacid", "Small contribution to magnesium levels"],
    se: ["Diarrhea", "Stomach cramps"],
    ix: MG_IX(),
    mech: "Supplies magnesium, but mostly stays in the gut, where it draws in water.",
    bio: "Poor. A small fraction is absorbed compared with glycinate or citrate.",
    met: "Mostly passes through the gut unabsorbed.",
    sol: ["water", "Barely dissolves in water, which is part of why it absorbs poorly."], group: "magnesium" }
);
S.find(s => s.id === "magnesium-glycinate").group = "magnesium";
S.find(s => s.id === "mucuna-pruriens").aka.push("L-DOPA");

// ---------------------------------------------------------------------------
// Zinc and iron forms. The original "zinc" and "iron" entries become the
// recommended forms (picolinate, bisglycinate); ids stay the same.
// ---------------------------------------------------------------------------
{
  const zinc = S.find(s => s.id === "zinc"), iron = S.find(s => s.id === "iron");
  Object.assign(zinc, { name: "Zinc Picolinate", aka: ["Zinc"], group: "zinc",
    sum: "Zinc bound to picolinic acid, one of the best-absorbed forms. Zinc is released alongside glutamate and keeps NMDA receptors in check; low zinc is linked to low mood.",
    bio: "One of the better-absorbed forms, along with glycinate and citrate. Phytates in grains and beans reduce absorption." });
  Object.assign(iron, { name: "Iron Bisglycinate", aka: ["Iron", "Ferrous bisglycinate", "Gentle iron"], group: "iron",
    sum: "The gentlest common form of iron, bound to glycine. Iron is needed for the slowest step in making dopamine and serotonin. Only supplement if a blood test shows you're low.",
    bio: "Absorbs well and is less blocked by phytates than iron salts. Plant-type iron overall absorbs at only 2–20%, better on an empty stomach and with vitamin C. Each dose raises hepcidin, a hormone that blocks absorption for about a day, which is why every other day works better." });
  const ZINC_IX = () => zinc.ix.map(x => [...x]);
  const IRON_IX = () => iron.ix.map(x => [...x]);
  const zincBase = { cat: "mineral", onset: [null, null, "Works by keeping your levels topped up."], dur: [null, null, null], tol: ["none", null],
    fx: ["Immune support", "Mood support when low", "Testosterone support when low", "Taste and smell"],
    mech: zinc.mech, met: zinc.met, sol: ["water", null], group: "zinc" };
  const ironBase = { cat: "mineral", onset: [null, null, "Restoring iron takes weeks to months."], dur: [null, null, null], tol: ["none", null],
    fx: ["Enables dopamine and serotonin production", "Fixes iron-deficiency fatigue"],
    mech: iron.mech, met: iron.met, sol: ["water", null], group: "iron" };

  S.push(
    { ...zincBase, id: "zinc-glycinate", name: "Zinc Glycinate", aka: ["Zinc bisglycinate"],
      sum: "Zinc bound to glycine. Well absorbed and among the gentlest on the stomach.",
      dose: [15, 30, "mg elemental", "With food", "About 30% zinc by weight. Upper limit is 40 mg a day from all forms."],
      se: ["Nausea on an empty stomach (less than other forms)", "Copper deficiency with long-term high doses"],
      ix: ZINC_IX(), bio: "Absorbs as well as or better than gluconate in studies, with fewer stomach complaints." },
    { ...zincBase, id: "zinc-citrate", name: "Zinc Citrate", aka: [],
      sum: "A cheap, well-absorbed form. In a head-to-head study it matched gluconate and beat oxide.",
      dose: [15, 30, "mg elemental", "With food", "About 31% zinc by weight. Upper limit is 40 mg a day from all forms."],
      se: ["Nausea on an empty stomach", "Slight metallic taste", "Copper deficiency with long-term high doses"],
      ix: ZINC_IX(), bio: "Good, similar to gluconate." },
    { ...zincBase, id: "zinc-gluconate", name: "Zinc Gluconate", aka: ["Zinc lozenges"],
      sum: "The classic cold-lozenge zinc. Decent absorption, and lozenges taken early can shorten colds.",
      dose: [15, 30, "mg elemental", "With food (or as lozenges at the start of a cold)", "About 14% zinc by weight. Cold studies used lozenges totaling 75+ mg a day for under a week only."],
      fx: ["Shorter colds when taken as lozenges early", "Immune support", "Mood support when low"],
      se: ["Nausea", "Bad taste from lozenges", "Copper deficiency with long-term high doses"],
      ix: ZINC_IX(), bio: "Moderate to good." },
    { ...zincBase, id: "zinc-oxide", name: "Zinc Oxide", aka: [],
      sum: "The form in many cheap multivitamins. Lots of zinc per gram, but it absorbs worst of the common forms.",
      dose: [15, 30, "mg elemental", "With food", "About 80% zinc by weight, but absorption is clearly lower than citrate or gluconate."],
      se: ["Nausea", "Copper deficiency with long-term high doses"],
      ix: ZINC_IX(), bio: "Poor compared with citrate, gluconate, glycinate or picolinate." },

    { ...ironBase, id: "ferrous-sulfate", name: "Ferrous Sulfate", aka: ["Iron", "Iron sulfate"],
      sum: "The standard, cheapest iron that doctors prescribe. Works well, but it's the roughest on the stomach.",
      dose: [18, 65, "mg elemental", "Every other day, empty stomach", "A typical 325 mg tablet has 65 mg of elemental iron (about 20%). Get ferritin tested first; upper limit is 45 mg without medical supervision."],
      se: ["Constipation", "Nausea and stomach pain", "Dark stools", "Iron overload if you're not actually low"],
      ix: IRON_IX(), bio: "Good on an empty stomach; food, coffee, tea and calcium cut it sharply." },
    { ...ironBase, id: "ferrous-fumarate", name: "Ferrous Fumarate", aka: ["Iron fumarate"],
      sum: "A prescription-strength iron salt with the most iron per tablet. Similar results and side effects to sulfate.",
      dose: [18, 65, "mg elemental", "Every other day, empty stomach", "About 33% iron by weight. Get ferritin tested first; upper limit is 45 mg without medical supervision."],
      se: ["Constipation", "Nausea and stomach pain", "Dark stools", "Iron overload if you're not actually low"],
      ix: IRON_IX(), bio: "Similar to sulfate." },
    { ...ironBase, id: "ferrous-gluconate", name: "Ferrous Gluconate", aka: ["Iron gluconate"],
      sum: "A milder iron salt with less iron per tablet. Often tolerated better than sulfate, mostly because each pill is smaller.",
      dose: [18, 38, "mg elemental", "Every other day, empty stomach", "A typical 324 mg tablet has about 38 mg elemental iron (12%)."],
      se: ["Constipation (milder)", "Nausea", "Dark stools"],
      ix: IRON_IX(), bio: "Similar per mg of iron to sulfate." },
    { ...ironBase, id: "heme-iron", name: "Heme Iron Polypeptide", aka: ["Heme iron", "Proferrin"],
      sum: "Iron in the same form as in meat. Absorbed through its own pathway, so food, coffee and calcium barely affect it, and it's easy on the stomach.",
      dose: [10, 12, "mg elemental", "Once daily, any time", "Lower doses than iron salts. Animal-derived, so not vegetarian."],
      se: ["Mild constipation", "Iron overload if you're not actually low"],
      ix: IRON_IX().filter(x => !/^(Calcium|Vitamin C)/.test(x[0])), bio: "Absorbed through a separate heme carrier, so phytates, coffee, tea and calcium matter much less than for other forms." }
  );
  ["zinc-glycinate", "zinc-citrate", "zinc-gluconate", "zinc-oxide"].forEach(id => { COF[id] = { items: COF.zinc.items.map(x => [...x]) }; });
  ["ferrous-sulfate", "ferrous-fumarate", "ferrous-gluconate"].forEach(id => { COF[id] = { items: COF.iron.items.map(x => [...x]) }; });
  COF["heme-iron"] = { items: [], note: "Absorbs well on its own; vitamin C adds little for heme iron. Still keep it 2+ hours from Mucuna and thyroid medication." };
}
["magnesium-l-threonate", "magnesium-citrate", "magnesium-malate", "magnesium-taurate", "magnesium-oxide"].forEach(id => {
  COF[id] = { items: [["vitamin-b6", "Magnesium + B6 has been studied as a combo for stress, and B6 helps cells take up magnesium.", "Together"]] };
});
MAP.push(
  ["magnesium-l-threonate", "glutamate", "modulator", "limited", "The brain-targeted form. Raised synapse density and NMDA function in animal memory studies."],
  ["magnesium-taurate", "gaba", "modulator", "limited", "Magnesium and taurine both support calming GABA signaling."]
);

