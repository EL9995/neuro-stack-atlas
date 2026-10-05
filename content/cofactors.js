// supplementId -> { items: [[cofactorId, reason, timing]], note }
const COF = {
  "l-tyrosine": { items: [
    ["iron", "Tyrosine hydroxylase, the enzyme that turns tyrosine into L-DOPA, needs iron. Only supplement if you're low.", "Separate meal; not with coffee or calcium"],
    ["l-methylfolate", "Helps make BH4, the other thing tyrosine hydroxylase needs.", "Any time, daily"],
    ["vitamin-b6", "Runs the L-DOPA to dopamine step.", "Together"],
    ["vitamin-c", "Turns dopamine into norepinephrine and helps recycle BH4.", "Together"] ] },
  "n-acetyl-l-tyrosine": { items: [
    ["l-methylfolate", "Helps make BH4 for tyrosine hydroxylase.", "Any time, daily"],
    ["vitamin-b6", "Runs the L-DOPA to dopamine step.", "Together"],
    ["vitamin-c", "Turns dopamine into norepinephrine.", "Together"] ],
    note: "Same helpers as L-Tyrosine. The bigger fix is switching to plain L-Tyrosine." },
  "dl-phenylalanine": { items: [
    ["iron", "Needed by both phenylalanine hydroxylase and tyrosine hydroxylase.", "Separate meal"],
    ["l-methylfolate", "BH4 is needed for both of those steps too.", "Any time, daily"],
    ["vitamin-b6", "Runs the L-DOPA to dopamine step.", "Together"] ] },
  "mucuna-pruriens": { items: [],
    note: "Mucuna skips the steps that need iron and BH4, so those don't help it. It does use B6 for the last step, but high-dose B6 converts the L-DOPA before it reaches your brain. Keep B6 low and take iron at least 2 hours apart." },
  "5-htp": { items: [
    ["vitamin-b6", "Runs the 5-HTP to serotonin step. A modest dose is plenty.", "Together"] ],
    note: "Taking 5-HTP with a small carb snack can help with nausea." },
  "l-tryptophan": { items: [
    ["iron", "Tryptophan hydroxylase needs iron.", "Separate meal"],
    ["l-methylfolate", "Helps make BH4 for tryptophan hydroxylase.", "Any time, daily"],
    ["vitamin-b6", "Runs the 5-HTP to serotonin step, and the tryptophan to niacin side pathway.", "Together"] ],
    note: "Take it with carbs and away from protein. Carbs trigger insulin, which clears competing amino acids out of the way so more tryptophan reaches the brain." },
  "l-theanine": { items: [], note: "No cofactors needed. The classic pairing is caffeine at roughly 1 part caffeine to 2 parts theanine." },
  "alpha-gpc": { items: [
    ["vitamin-b5", "Becomes acetyl-CoA, which joins choline to form acetylcholine.", "Together"] ] },
  "citicoline": { items: [
    ["vitamin-b5", "Becomes acetyl-CoA, which joins choline to form acetylcholine.", "Together"] ] },
  "huperzine-a": { items: [
    ["alpha-gpc", "Huperzine keeps acetylcholine around longer. A choline source makes sure there's enough to begin with.", "Together"],
    ["citicoline", "Same idea as Alpha-GPC, slightly gentler.", "Together"] ],
    note: "Not a cofactor relationship. These are the usual stacking partners." },
  "bacopa": { items: [], note: "No cofactors. Its active compounds are fat-soluble, so take it with a meal that has some fat." },
  "l-glutamine": { items: [
    ["vitamin-b6", "Needed to turn glutamate into GABA.", "Together"] ] },
  "magnesium-glycinate": { items: [
    ["vitamin-b6", "Magnesium + B6 has been studied as a combo for stress, and B6 helps cells take up magnesium.", "Together, evening"] ] },
  "ashwagandha": { items: [], note: "No cofactors. Take with food to reduce stomach upset." },
  "n-acetyl-cysteine": { items: [], note: "No cofactors. Consistency matters more than timing; effects build over a couple of weeks." },
  "rhodiola": { items: [], note: "No cofactors. Take in the morning on an empty stomach; it can disrupt sleep if taken late." },
  "iron": { items: [
    ["vitamin-c", "Increases absorption of non-heme iron.", "Together"] ] },
  "l-methylfolate": { items: [], note: "Pair with vitamin B12. High folate can hide a B12 deficiency, and the two work together in methylation." },
  "vitamin-b6": { items: [], note: "This is itself a cofactor." },
  "vitamin-c": { items: [], note: "This is itself a cofactor." },
  "vitamin-b5": { items: [], note: "This is itself a cofactor." },
  "copper": { items: [], note: "Don't stack with high-dose zinc. Zinc blocks copper absorption, and many people taking zinc end up low in copper." }
};

