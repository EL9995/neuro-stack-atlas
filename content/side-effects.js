// ===========================================================================
// SIDE EFFECTS, STOP SIGNS AND "AVOID IF" (October 2026)
// Shown under "What is this?" and on each supplement page, and used by the stack check.
//
// SOURCES: only NIH Office of Dietary Supplements (ODS) fact sheets, NCCIH,
// NIH LiverTox or MedlinePlus. Every entry lists its sources by id (SE_SOURCES).
// Entries with needsSource: true have no approved source yet: their "common"
// list comes from this site's existing side-effect data and is marked
// NEEDS SOURCE. Never add a claim without a source.
//
// REVIEW: everything starts verified: false, which shows a "Not yet reviewed"
// tag. A reviewer checks the entry against its sources and sets verified: true.
//
// FIELDS
//   common     side effects; "headache", "insomnia", "stomach upset" and
//              "drowsiness" are also used to spot side effects that add up
//   stopSigns  symptoms that mean stop and get medical help
//   avoidIf    condition ids from content/medications.js (CONDITIONS)
//   liver      true if the sources document liver injury cases
//   pregnancy  "avoid" | "unknown" (no safety info in the sources) | "guidance"
//              (the ODS fact sheet gives amounts for pregnancy)
//   source     ids in SE_SOURCES
// ===========================================================================
const SE_SOURCES = {
  "ods-omega3": { label: "NIH ODS: Omega-3 Fatty Acids", url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/" },
  "nccih-omega3": { label: "NCCIH: Omega-3 Supplements", url: "https://www.nccih.nih.gov/health/omega3-supplements-what-you-need-to-know" },
  "ods-iron": { label: "NIH ODS: Iron", url: "https://ods.od.nih.gov/factsheets/Iron-Consumer/" },
  "ods-magnesium": { label: "NIH ODS: Magnesium", url: "https://ods.od.nih.gov/factsheets/Magnesium-Consumer/" },
  "ods-zinc": { label: "NIH ODS: Zinc", url: "https://ods.od.nih.gov/factsheets/Zinc-Consumer/" },
  "ods-b6": { label: "NIH ODS: Vitamin B6", url: "https://ods.od.nih.gov/factsheets/VitaminB6-Consumer/" },
  "ods-vitd": { label: "NIH ODS: Vitamin D", url: "https://ods.od.nih.gov/factsheets/VitaminD-Consumer/" },
  "ods-vitc": { label: "NIH ODS: Vitamin C", url: "https://ods.od.nih.gov/factsheets/VitaminC-Consumer/" },
  "ods-copper": { label: "NIH ODS: Copper", url: "https://ods.od.nih.gov/factsheets/Copper-Consumer/" },
  "ods-b12": { label: "NIH ODS: Vitamin B12", url: "https://ods.od.nih.gov/factsheets/VitaminB12-Consumer/" },
  "ods-choline": { label: "NIH ODS: Choline", url: "https://ods.od.nih.gov/factsheets/Choline-Consumer/" },
  "mlp-caffeine": { label: "MedlinePlus: Caffeine", url: "https://medlineplus.gov/caffeine.html" },
  "mlp-caffeine-overdose": { label: "MedlinePlus: Caffeine overdose", url: "https://medlineplus.gov/ency/article/002579.htm" },
  "mlp-serotonin-syndrome": { label: "MedlinePlus: Serotonin syndrome", url: "https://medlineplus.gov/ency/article/007272.htm" },
  "nccih-ashwagandha": { label: "NCCIH: Ashwagandha", url: "https://www.nccih.nih.gov/health/ashwagandha" },
  "nccih-kava": { label: "NCCIH: Kava", url: "https://www.nccih.nih.gov/health/kava" },
  "nccih-sjw": { label: "NCCIH: St. John's Wort", url: "https://www.nccih.nih.gov/health/st-johns-wort" },
  "nccih-valerian": { label: "NCCIH: Valerian", url: "https://www.nccih.nih.gov/health/valerian" },
  "nccih-rhodiola": { label: "NCCIH: Rhodiola", url: "https://www.nccih.nih.gov/health/rhodiola" },
  "nccih-same": { label: "NCCIH: SAMe", url: "https://www.nccih.nih.gov/health/sadenosyllmethionine-same-in-depth" },
};

const SIDE_EFFECTS = {
  "l-tyrosine": { common: ["headache", "stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "n-acetyl-l-tyrosine": { common: ["headache", "stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "dl-phenylalanine": { common: ["headache", "insomnia"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "mucuna-pruriens": { common: ["stomach upset", "insomnia"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "l-tryptophan": { common: ["drowsiness", "stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "5-htp": { common: ["stomach upset", "drowsiness"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "l-theanine": { common: ["headache", "drowsiness"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "magnesium-glycinate": { common: ["stomach upset"], stopSigns: ["Irregular heartbeat (extremely high intakes)"], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-magnesium"], verified: false },
  "ashwagandha": { common: ["drowsiness", "stomach upset"], stopSigns: [], avoidIf: ["pregnant", "surgery"], liver: true, pregnancy: "avoid", source: ["nccih-ashwagandha"], verified: false },
  "l-glutamine": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "n-acetyl-cysteine": { common: ["stomach upset", "headache"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "alpha-gpc": { common: ["headache", "stomach upset", "insomnia"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "citicoline": { common: ["headache", "insomnia", "stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "huperzine-a": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "bacopa": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "rhodiola": { common: ["headache", "insomnia", "dizziness"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: ["nccih-rhodiola"], verified: false },
  "vitamin-b6": { common: ["stomach upset"], stopSigns: ["Numbness or losing control of your movements (nerve damage from high doses over a year or longer)"], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-b6"], verified: false },
  "vitamin-c": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-vitc"], verified: false },
  "iron": { common: ["stomach upset", "constipation"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-iron"], verified: false },
  "copper": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-copper"], verified: false },
  "l-methylfolate": { common: ["insomnia"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "vitamin-b5": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "caffeine": { common: ["insomnia", "headache", "restlessness", "dizziness", "fast heart rate", "anxiety"], stopSigns: ["Rapid or irregular heartbeat", "Trouble breathing", "Confusion, agitation or hallucinations", "Seizures (convulsions)"], avoidIf: [], liver: false, pregnancy: "unknown", source: ["mlp-caffeine", "mlp-caffeine-overdose"], verified: false },
  "pea": { common: ["headache"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "hordenine": { common: [], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "uridine": { common: ["headache", "stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "yohimbine": { common: ["stomach upset", "insomnia"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "theacrine": { common: ["insomnia"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "synephrine": { common: ["headache"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "saffron": { common: ["stomach upset", "headache"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "st-johns-wort": { common: ["stomach upset", "insomnia", "dizziness", "restlessness"], stopSigns: ["A severe skin reaction after sun exposure"], avoidIf: ["pregnant"], liver: false, pregnancy: "avoid", source: ["nccih-sjw"], verified: false },
  "sam-e": { common: ["stomach upset"], stopSigns: [], avoidIf: ["bipolar"], liver: false, pregnancy: "unknown", source: ["nccih-same"], verified: false },
  "inositol": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "kava": { common: ["stomach upset", "headache", "dizziness"], stopSigns: [], avoidIf: ["pregnant"], liver: true, pregnancy: "avoid", source: ["nccih-kava"], verified: false },
  "taurine": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "apigenin": { common: ["drowsiness"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "lemon-balm": { common: ["drowsiness", "stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "magnolia-bark": { common: ["drowsiness", "stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "valerian": { common: ["headache", "stomach upset", "mental dullness", "vivid dreams"], stopSigns: [], avoidIf: [], liver: true, pregnancy: "unknown", source: ["nccih-valerian"], verified: false },
  "glycine": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "agmatine": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "zinc": { common: ["stomach upset", "headache", "dizziness"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-zinc"], verified: false },
  "alcar": { common: ["stomach upset", "insomnia"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "dmae": { common: ["headache", "insomnia"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "choline-bitartrate": { common: ["stomach upset", "fishy body odor", "heavy sweating"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-choline"], verified: false },
  "phosphatidylserine": { common: ["insomnia", "stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "omega-3": { common: ["stomach upset", "headache", "unpleasant taste or bad breath", "smelly sweat"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-omega3", "nccih-omega3"], verified: false },
  "vitamin-d3": { common: ["stomach upset"], stopSigns: ["Confusion, muscle weakness, or heavy thirst and urination (signs of too much vitamin D)"], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-vitd"], verified: false },
  "vitamin-k2": { common: [], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "vitamin-b12": { common: [], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-b12"], verified: false },
  "creatine": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "lions-mane": { common: ["stomach upset"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "unknown", source: [], needsSource: true, verified: false },   // NEEDS SOURCE: side effects from this site's existing data
  "magnesium-l-threonate": { common: ["stomach upset"], stopSigns: ["Irregular heartbeat (extremely high intakes)"], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-magnesium"], verified: false },
  "magnesium-citrate": { common: ["stomach upset"], stopSigns: ["Irregular heartbeat (extremely high intakes)"], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-magnesium"], verified: false },
  "magnesium-malate": { common: ["stomach upset"], stopSigns: ["Irregular heartbeat (extremely high intakes)"], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-magnesium"], verified: false },
  "magnesium-taurate": { common: ["stomach upset"], stopSigns: ["Irregular heartbeat (extremely high intakes)"], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-magnesium"], verified: false },
  "magnesium-oxide": { common: ["stomach upset"], stopSigns: ["Irregular heartbeat (extremely high intakes)"], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-magnesium"], verified: false },
  "zinc-glycinate": { common: ["stomach upset", "headache", "dizziness"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-zinc"], verified: false },
  "zinc-citrate": { common: ["stomach upset", "headache", "dizziness"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-zinc"], verified: false },
  "zinc-gluconate": { common: ["stomach upset", "headache", "dizziness"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-zinc"], verified: false },
  "zinc-oxide": { common: ["stomach upset", "headache", "dizziness"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-zinc"], verified: false },
  "ferrous-sulfate": { common: ["stomach upset", "constipation"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-iron"], verified: false },
  "ferrous-fumarate": { common: ["stomach upset", "constipation"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-iron"], verified: false },
  "ferrous-gluconate": { common: ["stomach upset", "constipation"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-iron"], verified: false },
  "heme-iron": { common: ["stomach upset", "constipation"], stopSigns: [], avoidIf: [], liver: false, pregnancy: "guidance", source: ["ods-iron"], verified: false },
};
