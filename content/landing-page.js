// ===========================================================================
// LANDING PAGE WORDING
// Everything a visitor reads on the home page, outside the two scroll scenes
// (those live in scene-captions.js).
//
// HOW TO EDIT
//   - Change only the text inside the "quotes". Keep the quotes and the
//     comma at the end of each line.
//   - Need a quote mark inside the text? Use curly quotes “like this”, or
//     put a backslash before it: \"like this\".
//   - **two stars** around words make them bold.
//   - [[double brackets]] around a glossary term (see glossary.js) make it a
//     hover tooltip, e.g. [[downregulation]].
//   - Save, then refresh the page to see the change.
// ===========================================================================
const LANDING = {

  // Big title card at the top
  hero: {
    title: "Neuro Stack Atlas",
    tagline: "Supplements, mapped by brain chemical.",
    note: "Educational only, not medical advice.",
    noteLink: "Read before you start",
    searchLabel: "Search supplements and brain chemicals",   // read aloud by screen readers
    searchPlaceholder: "Search a supplement or brain chemical",
    scrollCue: "Scroll down to explore",
    gridLabel: "Explore your neurotransmitters",   // small label above the six cards. Alternative: "See what fuels your brain"
  },

  // "Before you start": right under the title card, before the first scroll scene.
  notice: {
    heading: "Before you start",
    intro: "Talk to your doctor before you change supplements or diet, especially if you take medication.",   // DRAFT
    items: [
      ["Learning, not advice", "This atlas explains research. It doesn't diagnose or recommend."],
      ["Doses are ranges", "Numbers are typical amounts from research and common use, not instructions."],
      ["On medication?", "Check \"Watch out for\" on each supplement, and ask a doctor or pharmacist first."],
    ],
  },

  // "Is it safe?": heading above the Foundation / Cycles / Recovery scroll scene.
  // The scene's own captions are in scene-captions.js (PROTOCOL_SCENE).
  safety: {
    heading: "Start smart",                                                     // DRAFT
    intro: "Three ideas to understand before you reach for a single neurotransmitter.",   // DRAFT
  },

  // Not shown on the home page right now: the "Try a schedule" picker that
  // used to sit in the Cycling section. Kept so it can come back elsewhere.
  schedulePicker: {
    title: "Try a schedule",
    schedules: {
      fiveTwo:    { button: "5 on, 2 off",     note: "Weekdays on, weekends off." },
      everyOther: { button: "Every other day", note: "A rest day between every dose." },
      daily:      { button: "Every day",       note: "No built-in breaks." },
    },
  },

  // "Ready to get started?": the closing panel at the bottom of the home page.
  getStarted: {
    heading: "Ready to get started?",                                           // DRAFT
    intro: "Build your first stack and see how your day plays out, then track how you actually feel.",   // DRAFT
    builderButton: "Open the Stack builder",                                    // DRAFT
    trackerButton: "Open the Tracker",                                          // DRAFT
  },
};
