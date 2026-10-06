// ===========================================================================
// MEDICATION, CONDITION AND SIDE-EFFECT RULES FOR THE STACK CHECK (October 2026)
// Uses what people enter in "About you" (content/medications.js) and the
// side-effect data (content/side-effects.js). Same severity scale as the rest
// of the check: "info", "minor", "moderate" (to review), "major" (serious),
// "critical". Serious and critical pause the timeline until reviewed.
// ALL TEXT HERE IS DRAFT.
//
// Where a claim comes from is noted on each rule: "site data" (the supplement
// "Watch out for" lists already on the site), an NIH page (see SE_SOURCES in
// side-effects.js), or NEEDS SOURCE (a team rule we haven't found a source for).
// {names}, {med}, {cond}, {effect} are filled in by the app.
// ===========================================================================
const MED_RULES = {
  category: "Medications & conditions",
  nothingEntered: "Add your medications in About you for a fuller check.",
  otherMeds: { sev: "info", title: "Ask a pharmacist about {names}", body: "We can't check {names} against supplements. A pharmacist can tell you how it mixes with this stack." },

  // 1) "Watch out for" entries already in the supplement data, matched to what's entered in About you.
  //    The finding uses that entry's own severity and wording.   (site data)
  ixMatch: {
    ssri: /SSRI|antidepressant|serotonin drug/i,
    snri: /SNRI|antidepressant/i,
    maoi: /MAOI/i,
    tricyclic: /antidepressant/i,
    triptan: /triptan/i,
    "blood-thinner": /blood thinner|warfarin/i,
    thyroid: /thyroid/i,
    bp: /blood pressure medication|heart-slowing/i,
    diabetes: /diabetes medication/i,
    "birth-control": /birth control/i,
    adhd: /^stimulants$|other stimulants/i,
    lithium: /lithium/i,
    "benzo-sleep": /benzodiazepine|sleep medication|sedative/i,
    pregnant: /pregnan/i,
    bipolar: /bipolar/i,
    seizure: /seizure/i,
    "high-bp": /high blood pressure|blood pressure or heart/i,
    heart: /heart condition|blood pressure or heart/i,
    liver: /liver disease/i,
    kidney: /kidney disease/i,
  },

  // 2) Team rules. A supplement counts if its id is listed in "ids" or it has one of the "tags"
  //    (tags are in timing-and-safety.js). Applies when any of "meds" or "conds" is entered.
  rules: [
    { id: "sero-meds", meds: ["ssri", "snri", "maoi", "tricyclic", "triptan", "lithium"], tags: ["serotonergic"], sev: "critical",
      title: "{med} with serotonin supplements",
      body: "{names} add to the serotonin effect of {med}. Together they can cause serotonin syndrome, which can be dangerous. Don't combine them unless your prescriber says it's OK." },   // site data lists these pairs as major; team raised to critical
    { id: "maoi", meds: ["maoi"], tags: ["dopaminergic", "stimulant", "mao"], sev: "critical",
      title: "MAOI with {names}",
      body: "MAOIs slow the breakdown of dopamine, norepinephrine and similar compounds. With {names} that can push blood pressure dangerously high. Don't combine them unless your prescriber says it's OK." },   // site data lists MAOIs as major for these; team raised to critical
    { id: "bleeding", meds: ["blood-thinner"], ids: ["omega-3", "saffron", "apigenin", "magnolia-bark", "phosphatidylserine", "lions-mane", "vitamin-k2"], sev: "moderate", sevIfTwo: "major",
      title: "Blood thinner with {names}",
      body: "{names} can change how your blood thinner works (more bleeding, or for vitamin K2 a weaker effect). Ask your prescriber before taking them together." },   // site data; omega-3 also NIH ODS (high doses + warfarin)
    { id: "sjw-meds", meds: ["birth-control", "blood-thinner", "ssri", "snri", "tricyclic", "other"], ids: ["st-johns-wort"], sev: "major",
      title: "St. John's Wort with {med}",
      body: "St. John's Wort can weaken many medicines, including birth control pills, warfarin and some antidepressants. Don't take it with {med} unless your prescriber says it's OK." },   // NCCIH: St. John's Wort
    { id: "thyroid", meds: ["thyroid"], ids: ["iron", "ferrous-sulfate", "ferrous-fumarate", "ferrous-gluconate", "heme-iron", "magnesium-glycinate", "magnesium-l-threonate", "magnesium-citrate", "magnesium-malate", "magnesium-taurate", "magnesium-oxide"], sev: "moderate",
      title: "Space {names} from your thyroid medicine",
      body: "Iron taken with levothyroxine can make it work less well. Take {names} at a different time of day from your thyroid medicine; ask your pharmacist how far apart." },   // NIH ODS: Iron (magnesium: NEEDS SOURCE)
    { id: "adhd", meds: ["adhd"], tags: ["stimulant"], sev: "major",
      title: "ADHD stimulant with {names}",
      body: "{names} are stimulants too. Heart rate and blood pressure effects add up. Ask your prescriber before combining them." },   // site data (stimulant tag); NEEDS SOURCE for the medicine pairing
    { id: "sedatives", meds: ["benzo-sleep"], tags: ["sedative"], sev: "major",
      title: "Sleep medicine with {names}",
      body: "{names} calm the nervous system, and so does your medicine. Together they can make you much drowsier. No driving, and ask your prescriber first." },   // site data; NCCIH: kava, valerian, ashwagandha
    { id: "bp-meds", meds: ["bp"], ids: ["l-theanine", "taurine", "agmatine", "omega-3", "magnesium-taurate", "rhodiola", "ashwagandha"], sev: "moderate",
      title: "Blood pressure medicine with {names}",
      body: "{names} may also lower blood pressure or interact with blood pressure medicines. Watch for dizziness when standing up, and tell your prescriber." },   // site data; NCCIH: rhodiola (losartan), ashwagandha
    { id: "diabetes-meds", meds: ["diabetes"], ids: ["lions-mane", "ashwagandha"], sev: "moderate",
      title: "Diabetes medicine with {names}",
      body: "{names} may interact with diabetes medicines. Check your blood sugar more often at first, and tell your prescriber." },   // site data; NCCIH: ashwagandha
    { id: "bipolar", conds: ["bipolar"], ids: ["5-htp", "sam-e", "st-johns-wort"], sev: "major",
      title: "Bipolar disorder with {names}",
      body: "{names} can raise mood and may set off mania in bipolar disorder. Only take them with your doctor's supervision." },   // NCCIH: SAMe; 5-HTP and St. John's Wort: NEEDS SOURCE
    { id: "surgery", conds: ["surgery"], ids: ["omega-3", "saffron", "apigenin", "magnolia-bark", "phosphatidylserine", "lions-mane", "ashwagandha", "kava", "valerian", "st-johns-wort"], sev: "major",
      title: "Surgery coming up: {names}",
      body: "Tell your surgeon you take {names}. Some can affect bleeding or anesthesia, and surgeons often ask you to stop supplements like these beforehand." },   // NCCIH: ashwagandha (avoid before surgery); bleeding list from site data; timing NEEDS SOURCE
  ],

  // 3) Life stage: one finding listing the supplements without safety information.
  pregnantUnknown: { sev: "moderate", title: "Pregnancy: no safety information for {names}", body: "Our sources have no pregnancy safety information for {names}. Check with your doctor or midwife before taking them." },
  pregnantAvoid: { sev: "critical", title: "Avoid while pregnant or nursing: {names}", body: "Our sources say {names} should be avoided during pregnancy or breastfeeding." },   // NCCIH: ashwagandha, kava, St. John's Wort
  under18: { sev: "moderate", title: "Under 18: check with a doctor", body: "Most supplement research is in adults, and typical doses here are adult doses. Check with a doctor before taking {names}." },   // NEEDS SOURCE

  // 4) Side effects that add up, liver, and "avoid if" (content/side-effects.js)
  additive: { effects: { "headache": 2, "insomnia": 2, "stomach upset": 2, "drowsiness": 2 }, sev: "moderate",
    title: "These can add up: {effect}", body: "{names} can each cause {effect}. Together that's more likely. If it happens, drop one and see if it stops." },
  liver: { at: 2, sev: "major", title: "Several supplements linked to liver injury", body: "{names} have each been linked to rare cases of liver injury. Avoid combining them." },   // NCCIH: ashwagandha, kava, valerian (replaces the old "Two liver-risk herbs" rule)
  avoidIf: { sev: "major", title: "{names}: not advised with {cond}", body: "Our sources advise against {names} for people with {cond}." },

  // 5) Emergency cards in the check step (MedlinePlus wording)
  emergency: {
    serotonin: { title: "Know the signs of serotonin syndrome",
      intro: "This stack affects serotonin. Get emergency care (call 911) if you notice:",
      signs: ["Agitation or restlessness", "Fast heartbeat or high blood pressure", "Increased body temperature", "Loss of coordination or overactive reflexes", "Hallucinations", "Nausea, vomiting or diarrhea"],
      source: "mlp-serotonin-syndrome" },
    stimulant: { title: "Know the signs of too much stimulant",
      intro: "This stack stacks stimulants. Get emergency care (call 911) or call Poison Help (1-800-222-1222) if you notice:",
      signs: ["Rapid or irregular heartbeat", "Trouble breathing", "Confusion, agitation or hallucinations", "Seizures"],
      source: "mlp-caffeine-overdose" },
    action: "Get emergency care",
  },

  // Side-effect display on "What is this?" and supplement pages
  display: { sideEffects: "Side effects", stopSigns: "Stop and get help if", avoidIf: "Avoid if", sources: "Sources", notReviewed: "Not yet reviewed", needsSource: "Needs source" },
};
