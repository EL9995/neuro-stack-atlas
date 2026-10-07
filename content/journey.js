// ===========================================================================
// JOURNEY PAGE WORDING (staging page at #journey; will replace the home page later)
//
// HOW TO EDIT
//   - Change only the text inside the "quotes". Keep the quotes and the
//     comma at the end of each line.
//   - Save, then refresh the page to see the change.
// ===========================================================================
const JOURNEY = {

  // First screen: two capsules on black.
  pills: {
    start: "Start Journey",                                   // DRAFT
    startHint: "Follow a pill from your mouth to your brain", // DRAFT  read aloud by screen readers
    skip: "Skip Journey",                                     // DRAFT
    skipHint: "Go straight to the Stack builder",             // DRAFT  read aloud by screen readers
  },

  // Quiet line at the bottom of the first screen. Not a gate.
  disclaimer: "For learning, not medical advice.",            // DRAFT
  disclaimerLink: "Read more",                                // DRAFT  goes to "Before you start" on the current home page

  // Top-right link during the tour. Goes to the Stack builder.
  skipTour: "Skip journey",                                   // DRAFT

  // Chapter dots on the right. Only the first chapter is built so far.
  chapters: ["Swallow", "Stomach", "Small intestine", "Liver", "Bloodstream", "Blood-brain barrier", "Synapse"],   // DRAFT

  scrollCue: "Scroll",                                        // DRAFT

  // Captions, one list per chapter, in the space beside the pill. "at" = how far through the
  // chapter's scroll (0 to 1) the caption appears. "note" (optional) is a smaller line underneath.
  swallow: [
    { at: 0,    kicker: "01 / Swallow", title: "It starts with a swallow.", body: "One capsule. Inside, tiny granules: the supplement itself." },                              // DRAFT
    { at: 0.14, kicker: "01 / Swallow", title: "Into the esophagus.",       body: "A muscular tube about 25 cm long that runs from your throat to your stomach." },          // DRAFT  claim: adult esophagus ~25 cm
    { at: 0.45, kicker: "01 / Swallow", title: "Squeezed, not dropped.",    body: "Waves of muscle, called peristalsis, push it down. It works even when you're lying down." },   // DRAFT  claim: peristalsis works without gravity
    { at: 0.82, kicker: "01 / Swallow", title: "Next: the stomach.",        body: "Where the capsule's shell starts to dissolve." },                                          // DRAFT
  ],
  stomach: [
    { at: 0,    kicker: "02 / Stomach", title: "Into the stomach.",    body: "It gets here within seconds of swallowing." },                                                                  // DRAFT  source: Tuleu 2007
    { at: 0.25, kicker: "02 / Stomach", title: "Contact.",             body: "Acid, water and constant churning get to work on the shell, usually gelatin or a plant cellulose called HPMC." },   // DRAFT  source: Tuleu 2007 (both shell types)
    { at: 0.55, kicker: "02 / Stomach", title: "The shell gives way.", body: "On an empty stomach, capsule shells usually break open within about 15 minutes, and the granules spill out.",
      note: "Some capsules have an acid-resistant coating, so they open later, in the intestine." },                                                                                              // DRAFT  source: Tuleu 2007 (gelatin 3-13 min, HPMC 6-11 min, fasted)
    { at: 0.78, kicker: "02 / Stomach", title: "Meet your granule.",   body: "From here, we follow just one. Each granule is a packed clump of the supplement, still far too big to enter your blood." },   // DRAFT
    { at: 0.93, kicker: "02 / Stomach", title: "Next: the small intestine.", body: "The stomach lets its contents out a little at a time, through a muscle valve called the pylorus. Very little is absorbed in the stomach itself." },   // DRAFT  claim: textbook physiology
  ],
  labels: { esophagus: "Esophagus" },                         // DRAFT

  // Sources for the captions above (not shown on the page yet).
  sources: [
    "Tuleu C et al. A scintigraphic investigation of the disintegration behaviour of capsules in fasting subjects. Eur J Pharm Sci 2007;30:251-5. doi:10.1016/j.ejps.2006.11.008 (capsules reach the stomach in seconds; gelatin shells open in 3-13 min, HPMC in 6-11 min, fasted, with 180 ml water)",
  ],

  // CHOREOGRAPHY KNOBS (numbers, not wording). Tune and refresh.
  choreo: {
    flightMs: 1000,      // Start pill flying to the centre
    sceneDelayMs: 650,   // when the mouth starts rising in, after the click
    fadeScreens: 0.6,    // how long (in screen-heights) one chapter cross-fades into the next
  },
  swallowChoreo: {
    screens: 7,          // how many screen-heights of scrolling chapter 1 takes
    diveEnd: 0.22,       // the dive into the mouth ends here (0 to 1 of the chapter)
    diveZoom: 14,        // how far the camera zooms into the mouth
    tubeStart: 0.17,     // the esophagus fades in here
    tubeZoom: 3,         // the walls start this much closer, then settle
    hoverTilt: -28,      // pill angle above the mouth (degrees)
    tubeTilt: -64,       // pill angle travelling down the tube
  },
  stomachChoreo: {
    screens: 9,          // how many screen-heights of scrolling chapter 2 takes
    // Where each beat starts (0 to 1 of the chapter): drop to the surface, float, sink, dissolve, meet the granule.
    contact: 0.25, under: 0.40, dissolve: 0.55, release: 0.78, end: 0.95,
    floatTilt: -38,      // pill angle while floating
    sinkZoom: 1.8,       // camera zoom once under the surface
    heroZoom: 2.5,       // extra zoom onto the hero granule at the end
    spill: 1,            // how far the other granules drift into their cloud (1 = all the way)
  },
};
