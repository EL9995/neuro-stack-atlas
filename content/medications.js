// ===========================================================================
// ABOUT YOU: MEDICATIONS AND CONDITIONS (October 2026)
// The optional "About you" section in the Stack builder. What people pick
// stays in their browser (localStorage "nsa-about") and is never sent anywhere.
// ALL TEXT HERE IS DRAFT.
//
// HOW TO EDIT
//   - "id" values are codes used by content/med-rules.js and side-effects.js.
//     Don't change them without asking.
//   - "names" are common generic and brand names the search box recognizes
//     (lowercase). Anything it doesn't recognize is filed under "other".
//   - Save, then refresh the page.
// ===========================================================================
const MED_CLASSES = [
  { id: "ssri", label: "SSRIs", hint: "sertraline, fluoxetine, escitalopram…",
    names: ["sertraline", "zoloft", "fluoxetine", "prozac", "escitalopram", "lexapro", "citalopram", "celexa", "paroxetine", "paxil", "fluvoxamine", "luvox", "vortioxetine", "trintellix", "vilazodone", "viibryd"] },
  { id: "snri", label: "SNRIs", hint: "venlafaxine, duloxetine…",
    names: ["venlafaxine", "effexor", "desvenlafaxine", "pristiq", "duloxetine", "cymbalta", "levomilnacipran", "fetzima", "milnacipran", "savella"] },
  { id: "maoi", label: "MAOIs", hint: "phenelzine, selegiline…",
    names: ["phenelzine", "nardil", "tranylcypromine", "parnate", "isocarboxazid", "marplan", "selegiline", "emsam", "eldepryl", "zelapar", "rasagiline", "azilect", "safinamide", "xadago", "moclobemide"] },
  { id: "tricyclic", label: "Tricyclic antidepressants", hint: "amitriptyline, nortriptyline…",
    names: ["amitriptyline", "elavil", "nortriptyline", "pamelor", "imipramine", "tofranil", "clomipramine", "anafranil", "doxepin", "sinequan", "desipramine", "norpramin", "protriptyline", "trimipramine"] },
  { id: "blood-thinner", label: "Blood thinners or antiplatelets", hint: "warfarin, apixaban, clopidogrel…",
    names: ["warfarin", "coumadin", "jantoven", "apixaban", "eliquis", "rivaroxaban", "xarelto", "dabigatran", "pradaxa", "edoxaban", "savaysa", "heparin", "enoxaparin", "lovenox", "clopidogrel", "plavix", "prasugrel", "effient", "ticagrelor", "brilinta", "aspirin", "baby aspirin"] },
  { id: "thyroid", label: "Thyroid medication", hint: "levothyroxine…",
    names: ["levothyroxine", "synthroid", "levoxyl", "unithroid", "tirosint", "euthyrox", "levothroid", "liothyronine", "cytomel", "armour thyroid", "np thyroid"] },
  { id: "bp", label: "Blood pressure medication", hint: "lisinopril, amlodipine, losartan…",
    names: ["lisinopril", "zestril", "prinivil", "enalapril", "ramipril", "losartan", "cozaar", "valsartan", "diovan", "olmesartan", "benicar", "irbesartan", "amlodipine", "norvasc", "nifedipine", "diltiazem", "metoprolol", "lopressor", "toprol", "atenolol", "tenormin", "carvedilol", "coreg", "propranolol", "hydrochlorothiazide", "hctz", "chlorthalidone", "spironolactone", "clonidine"] },
  { id: "diabetes", label: "Diabetes medication", hint: "metformin, insulin, semaglutide…",
    names: ["metformin", "glucophage", "insulin", "glipizide", "glucotrol", "glyburide", "glimepiride", "amaryl", "semaglutide", "ozempic", "wegovy", "rybelsus", "tirzepatide", "mounjaro", "zepbound", "liraglutide", "victoza", "dulaglutide", "trulicity", "sitagliptin", "januvia", "empagliflozin", "jardiance", "dapagliflozin", "farxiga", "pioglitazone", "actos"] },
  { id: "birth-control", label: "Hormonal birth control", hint: "the pill, patch, ring…",
    names: ["birth control", "the pill", "oral contraceptive", "ethinyl estradiol", "norethindrone", "levonorgestrel", "norgestimate", "desogestrel", "drospirenone", "yaz", "yasmin", "loestrin", "sprintec", "nuvaring", "xulane", "twirla", "depo-provera", "nexplanon"] },
  { id: "adhd", label: "ADHD stimulants", hint: "amphetamine, methylphenidate…",
    names: ["adderall", "amphetamine", "dextroamphetamine", "dexedrine", "vyvanse", "lisdexamfetamine", "ritalin", "methylphenidate", "concerta", "focalin", "dexmethylphenidate", "mydayis", "evekeo", "daytrana", "quillichew"] },
  { id: "lithium", label: "Lithium", hint: "",
    names: ["lithium", "lithobid", "eskalith"] },
  { id: "benzo-sleep", label: "Benzodiazepines or sleep medication", hint: "alprazolam, zolpidem…",
    names: ["alprazolam", "xanax", "lorazepam", "ativan", "clonazepam", "klonopin", "diazepam", "valium", "temazepam", "restoril", "triazolam", "halcion", "chlordiazepoxide", "librium", "zolpidem", "ambien", "eszopiclone", "lunesta", "zaleplon", "sonata", "suvorexant", "belsomra", "lemborexant", "dayvigo"] },
  { id: "triptan", label: "Triptans (migraine)", hint: "sumatriptan, rizatriptan…",
    names: ["sumatriptan", "imitrex", "rizatriptan", "maxalt", "zolmitriptan", "zomig", "eletriptan", "relpax", "naratriptan", "amerge", "frovatriptan", "frova", "almotriptan"] },
  { id: "other", label: "Other medication", hint: "" , names: [] },
];

const CONDITIONS = [
  { id: "pregnant", label: "Pregnant or nursing" },
  { id: "under18", label: "Under 18" },
  { id: "bipolar", label: "Bipolar disorder" },
  { id: "seizure", label: "Seizure disorder" },
  { id: "high-bp", label: "High blood pressure" },
  { id: "heart", label: "Heart condition" },
  { id: "liver", label: "Liver condition" },
  { id: "kidney", label: "Kidney condition" },
  { id: "surgery", label: "Surgery in the next 2 weeks" },
  { id: "other", label: "Other condition" },
];

const ABOUT_TEXT = {
  heading: "About you (optional)",   // DRAFT: now step 0, above "Name your stack"
  optional: "Optional",
  intro: "We use your medications and health conditions to check your stacks for interactions, like an antidepressant with 5-HTP. It's optional and never blocks anything, but if you skip it, those checks can't run.",   // DRAFT
  statusOn: "Interaction checks on:",   // DRAFT: followed by the summary, e.g. "2 medication types · 1 conditions"
  statusOff: "Medication and condition checks are off.",   // DRAFT
  statusOffBody: "Fill this in any time to turn them on. It applies to all your stacks.",   // DRAFT
  privacy: "Stays on this device. Not sent anywhere.",
  medsLabel: "Medications",
  medsSearch: "Type a medicine name, e.g. “Zoloft” or “sertraline”",
  medsSearchLabel: "Find your medication",
  medsAdd: "Add",
  unknown: "We don't recognize “{name}”, so it's filed under Other. Ask a pharmacist how it mixes with supplements.",
  matched: "{name} → {cls}",
  condLabel: "Health conditions and life stage",
  none: "None",
  pnts: "Prefer not to say",
  remove: "Remove",
  summaryEmpty: "Not filled in",
  summaryNone: "None",
  summaryPnts: "Prefer not to say",
  summary: "{meds} medication types · {conds} conditions",
  open: "About you: medications and conditions",
  fromCheck: "Update your medications and conditions →",
};
