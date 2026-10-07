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
    { at: 0,    kicker: "04 / Different paths", title: "One dose. Different paths.", body: "Each dot stands for a share of what you swallowed. Watch where they go." },                       // DRAFT
    { at: 0.13, kicker: "04 / Different paths", title: "Some is never absorbed.",    body: "It carries on through the large intestine and leaves in stool." },                                   // DRAFT  source: NIDDK digestive system
    { at: 0.33, kicker: "04 / Different paths", title: "First stop: the liver.",     body: "Blood from the gut goes straight to the liver, which processes some of what passes through. It's why more isn't free: overload it and it struggles to keep up." },   // DRAFT  source: MedlinePlus portal circulation; "more isn't free" from Eric's brief
    { at: 0.47, kicker: "04 / Different paths", title: "Through the heart and lungs.", body: "What the liver lets through goes to the heart, out to the lungs and back, then gets pumped around the body." },   // DRAFT  source: NHLBI blood flow
    { at: 0.63, kicker: "04 / Different paths", title: "Filtered out.",              body: "Your kidneys filter your blood around the clock. Some of the supplement leaves in urine, sometimes long after it has done its job.",
      note: "In reality the arteries feed the kidneys and the brain at the same time, lap after lap. We show them one after the other." },   // DRAFT  source: NIDDK kidneys
    { at: 0.79, kicker: "04 / Different paths", title: "What's left.",               body: "Only part of a dose stays in circulation, and the brain still sits behind a barrier. More in your mouth doesn't always mean more in your head.",
      note: "Illustration only. The split is different for every supplement, dose and person." },                                                                                                    // DRAFT
    { at: 0.92, kicker: "04 / Different paths", title: "Next: the bloodstream.",     body: "Our molecule heads for the brain's blood vessels. Being there isn't the same as getting in." },   // DRAFT
  ],
  blood: [
    { at: 0,    kicker: "05 / Bloodstream", title: "Carried by the current.",   body: "Our molecule rides in plasma, the liquid part of the blood. The red cells around it carry oxygen, not supplements." },   // DRAFT  claim: textbook physiology
    { at: 0.24, kicker: "05 / Bloodstream", title: "A tiny traveller. A vast network.", body: "About 5 litres of blood go round your body roughly once a minute, so one dose spreads out fast.",
      note: "A red blood cell is thousands of times bigger than a molecule like ours." },                                                                                        // DRAFT  claim: adult blood volume ~5 L, cardiac output ~5 L/min (textbook; NHLBI blood flow)
    { at: 0.55, kicker: "05 / Bloodstream", title: "Arrival is not access.",    body: "The brain's tiniest blood vessels are so narrow that red cells pass in single file. Being here still isn't the same as getting in." },   // DRAFT  claim: capillary ~5-10 um, red cells ~7.5 um, single file (textbook)
    { at: 0.82, kicker: "05 / Bloodstream", title: "What gets through?",        body: "Between the blood and the brain sits a wall of tightly sealed cells: the blood-brain barrier." },   // DRAFT  claim: textbook
  ],
  labels: {                                                   // DRAFT
    esophagus: "Esophagus",
    map: { small: "Small intestine", arteries: "Arteries", large: "Large intestine", stool: "Stool", liver: "Liver", heart: "Heart", lungs: "Lungs", kidney: "Kidneys", bladder: "Bladder", urine: "Urine", brain: "Toward the brain" },
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
  bloodChoreo: {
    screens: 6,
    dive: [0, 0.2],        // rushing down the vessel (red cells stream out of the vanishing point), easing into the side view
    approach: [0.5, 0.8],  // the vessel narrows to a brain capillary; brain blue appears beyond the wall
    boundary: [0.8, 1],    // close in on the wall
    flow: 2.2,             // how fast the red cells drift past (screens per chapter)
  },
  pathsChoreo: {
    screens: 7,
    // Groups of the 11 dots around the hero (illustration only, no numbers shown): never absorbed -> stool;
    // stay in the liver (processed); kidney -> urine; the rest travel on with the hero toward the brain.
    groups: { stool: 3, liver: 2, kidney: 3 },
    // Beats (0 to 1 of the chapter), each [start, end]: pull back from the capillary to the whole body; stool
    // group; everyone else to the liver; on through heart and lungs; kidney group; the hero's group heads up
    // toward the brain; dive into the vessel.
    pull: [0, 0.12], stool: [0.13, 0.3], liver: [0.33, 0.45], heart: [0.47, 0.6], kidney: [0.63, 0.77], brain: [0.8, 0.93], dive: [0.88, 1],
  },
};
