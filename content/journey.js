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
  chapters: ["Swallow", "Stomach", "Small intestine", "Different paths", "Bloodstream", "Blood-brain barrier", "Synapse"],   // DRAFT

  scrollCue: "Scroll",                                        // DRAFT

  // Captions, one list per chapter, in the space beside the pill. "at" = how far through the
  // chapter's scroll (0 to 1) the caption appears. "note" (optional) is a smaller line underneath.
  swallow: [
    { at: 0,    kicker: "01 / Swallow", title: "It starts with a swallow.", body: "One capsule. Inside, tiny granules: the supplement itself." },                              // DRAFT
    { at: 0.3,  kicker: "01 / Swallow", title: "Into the esophagus.",       body: "A muscular tube about 25 cm long that runs from your throat to your stomach." },          // DRAFT  claim: adult esophagus ~25 cm
    { at: 0.55, kicker: "01 / Swallow", title: "Squeezed, not dropped.",    body: "Waves of muscle, called peristalsis, push it down. It works even when you're lying down." },   // DRAFT  claim: peristalsis works without gravity
    { at: 0.85, kicker: "01 / Swallow", title: "Next: the stomach.",        body: "Where the capsule's shell starts to dissolve." },                                          // DRAFT
  ],
  stomach: [
    { at: 0,    kicker: "02 / Stomach", title: "Into the stomach.",    body: "It gets here within seconds of swallowing." },                                                                  // DRAFT  source: Tuleu 2007
    { at: 0.25, kicker: "02 / Stomach", title: "Contact.",             body: "Acid, water and constant churning get to work on the shell, usually gelatin or a plant cellulose called HPMC." },   // DRAFT  source: Tuleu 2007 (both shell types)
    { at: 0.55, kicker: "02 / Stomach", title: "The shell gives way.", body: "On an empty stomach, capsule shells usually break open within about 15 minutes, and the granules spill out.",
      note: "Some capsules have an acid-resistant coating, so they open later, in the intestine." },                                                                                              // DRAFT  source: Tuleu 2007 (gelatin 3-13 min, HPMC 6-11 min, fasted)
    { at: 0.78, kicker: "02 / Stomach", title: "Meet your granule.",   body: "From here, we follow just one. Each granule is a packed clump of the supplement, still far too big to enter your blood." },   // DRAFT
    { at: 0.93, kicker: "02 / Stomach", title: "Next: the small intestine.", body: "The stomach lets it's contents out a little at a time, through a muscle valve called the pylorus. Very little is absorbed in the stomach itself." },   // DRAFT  claim: textbook physiology
  ],
  intestine: [
    { at: 0,    kicker: "03 / Small intestine", title: "The Pylorus ", body: "A ring of muscle at the stomach's exit that opens briefly to let fluid and small particles through to the small intestine." },   // DRAFT  claim: textbook physiology
    { at: 0.38, kicker: "03 / Small intestine", title: "A way through.",       body: "The small intestine is lined with tiny finger-like folds called villi. This is where most absorption happens." },   // DRAFT  claim: textbook physiology
    { at: 0.46, kicker: "03 / Small intestine", title: "Down to molecules.",   body: "The granule dissolves. Only single molecules are small enough to be absorbed, so from here we follow one." },        // DRAFT
    { at: 0.62, kicker: "03 / Small intestine", title: "Some continue. Some cross.", body: "Molecules pass through the cells of the lining into tiny blood vessels. Whatever isn't absorbed moves on." },  // DRAFT  claim: textbook physiology
    { at: 0.9,  kicker: "03 / Small intestine", title: "Next: different paths.", body: "Not everything you swallow ends up where you'd hope." },                                                               // DRAFT
  ],
  paths: [
    { at: 0,    kicker: "04 / Different paths", title: "One dose. Different paths.", body: "Follow these 12 dots. Each one stands for a share of what you swallowed." },                                     // DRAFT
    { at: 0.15, kicker: "04 / Different paths", title: "Some is never absorbed.",    body: "It carries on through the large intestine and leaves in stool." },                                                // DRAFT  claim: textbook physiology
    { at: 0.33, kicker: "04 / Different paths", title: "First stop: the liver.",     body: "Blood from the gut goes straight to the liver. This is where your body breaks down and clears what you take. It's why more isn't free: overload it and it struggles to keep up." },   // DRAFT  claim: first-pass (portal vein); wording from Eric's brief
    { at: 0.52, kicker: "04 / Different paths", title: "Broken down.",               body: "The liver changes some of it into other compounds and sends them out in bile." },                                 // DRAFT  claim: textbook physiology
    { at: 0.66, kicker: "04 / Different paths", title: "Filtered out.",              body: "Your kidneys filter your blood around the clock. Some of the supplement leaves in urine." },                       // DRAFT  claim: textbook physiology
    { at: 0.8,  kicker: "04 / Different paths", title: "What's left.",               body: "Only part of a dose stays in circulation, and the brain still sits behind a barrier. More in your mouth doesn't always mean more in your head.",
      note: "Illustration only. The split is different for every supplement, dose and person." },                                                                                                          // DRAFT
    { at: 0.94, kicker: "04 / Different paths", title: "Next: the bloodstream.",     body: "Our molecule is one of the ones still circulating." },                                                            // DRAFT
  ],
  labels: {                                                   // DRAFT
    esophagus: "Esophagus",
    map: { liver: "Liver", stomach: "Stomach", small: "Small intestine", large: "Large intestine", kidneys: "Kidneys", bladder: "Bladder", portal: "Portal vein", blood: "To the heart and body" },
    tally: { stool: "stool", urine: "urine", blood: "still circulating" },
  },
  notToScale: "Not to scale",                                 // DRAFT  shown in the small intestine and on the map

  // Sources for the captions above (not shown on the page yet).
  sources: [
    "Tuleu C et al. A scintigraphic investigation of the disintegration behaviour of capsules in fasting subjects. Eur J Pharm Sci 2007;30:251-5. doi:10.1016/j.ejps.2006.11.008 (capsules reach the stomach in seconds; gelatin shells open in 3-13 min, HPMC in 6-11 min, fasted, with 180 ml water)",
  ],

  // CHOREOGRAPHY KNOBS (numbers, not wording). Tune and refresh.
  choreo: {
    flightMs: 1000,      // Start pill flying to the centre
    sceneDelayMs: 650,   // when the head starts rising in, after the click
    fadeScreens: 0.6,    // how long (in screen-heights) one chapter cross-fades into the next
  },
  swallowChoreo: {
    screens: 7,          // how many screen-heights of scrolling chapter 1 takes
    headEnd: 0.34,       // the pill is down the throat and the head has faded out by here (0 to 1 of the chapter)
    headScale: [1.1, 1.4, 2.1, 3], // camera zoom on the head (x screen size): above the face, at the lips, in the throat, down the neck
    pillStart: 0.28,     // pill size after Start (1 = full size): small enough for the mouth; it grows back with the camera
    tubeStart: 0.26,     // the esophagus fades in here (the head fades out from here to headEnd)
    hoverTilt: -49,      // pill angle above the face: lined up with the open mouth (degrees)
    throatTilt: -84,     // pill angle going down the throat (nearly upright)
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
  intestineChoreo: {
    screens: 6,          // keep the gut quick: the brain is the focus
    // Beats (0 to 1 of the chapter): through the pylorus (the other granules squeeze through with the hero,
    // then rush past and fade once over the threshold), out into
    // the villi, the hero dissolves, reaches the wall, crosses a cell, enters the capillary.
    pylorus: [0, 0.3], funnel: [0.02, 0.15], burst: [0.2, 0.32], villi: 0.36, melt: [0.4, 0.52], wall: 0.62, cell: 0.72, vessel: 0.82,
    pylorusZoom: 1.25,   // camera zoom going through the pylorus
    zoomStart: 0.55,     // camera zoom at the start (wide view of the villi)
    zoomCell: 2.4,       // camera zoom while crossing the lining
  },
  pathsChoreo: {
    screens: 6,
    // The 12-dot split (illustration only): 3 never absorbed -> stool; 9 to the liver, of which 2 are
    // broken down -> bile -> stool; 7 into the blood, of which 3 are filtered by the kidneys -> urine;
    // 4 stay in circulation (one of them is the hero).
    split: { notAbsorbed: 3, brokenDown: 2, urine: 3 },
    // Beats: zoom out, not absorbed, to the liver, broken down, kidneys, what's left, dive into the blood.
    zoomOut: 0.12, stool: [0.15, 0.32], liver: [0.33, 0.5], bile: [0.52, 0.64], blood: [0.66, 0.8], dive: [0.88, 1],
  },
};
