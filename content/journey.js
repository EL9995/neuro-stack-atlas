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
    { at: 0.121, kicker: "04 / Different paths", title: "Some is never absorbed.",    body: "It carries on through the large intestine and leaves in stool." },                                   // DRAFT  source: NIDDK digestive system
    { at: 0.308, kicker: "04 / Different paths", title: "First stop: the liver.",     body: "Blood from the gut goes straight to the liver, which processes some of what passes through. It's why more isn't free: overload it and it struggles to keep up." },   // DRAFT  source: MedlinePlus portal circulation; "more isn't free" from Eric's brief
    { at: 0.439, kicker: "04 / Different paths", title: "Through the heart and lungs.", body: "What the liver lets through goes to the heart, out to the lungs and back, then gets pumped around the body." },   // DRAFT  source: NHLBI blood flow
    { at: 0.655, kicker: "04 / Different paths", title: "Filtered out.",              body: "Your kidneys filter your blood around the clock. Some of the supplement leaves in urine, sometimes long after it has done its job.",
      note: "In reality the arteries feed the kidneys and the brain at the same time, lap after lap. We show them one after the other." },   // DRAFT  source: NIDDK kidneys
    { at: 0.804, kicker: "04 / Different paths", title: "What's left.",               body: "Only part of a dose stays in circulation, and the brain still sits behind a barrier. More in your mouth doesn't always mean more in your head.",
      note: "Illustration only. The split is different for every supplement, dose and person." },                                                                                                    // DRAFT
    { at: 0.925, kicker: "04 / Different paths", title: "Next: the bloodstream.",     body: "Our molecule heads for the brain's blood vessels. Being there isn't the same as getting in." },   // DRAFT
  ],
  blood: [
    { at: 0,    kicker: "05 / Bloodstream", title: "Carried by the current.",   body: "Our molecule rides in plasma, the liquid part of the blood. The red cells around it carry oxygen, not supplements." },   // DRAFT  claim: textbook physiology
    { at: 0.24, kicker: "05 / Bloodstream", title: "A tiny traveller. A vast network.", body: "About 5 litres of blood go round your body roughly once a minute, so one dose spreads out fast.",
      note: "A red blood cell is thousands of times bigger than a molecule like ours." },                                                                                        // DRAFT  claim: adult blood volume ~5 L, cardiac output ~5 L/min (textbook; NHLBI blood flow)
    { at: 0.55, kicker: "05 / Bloodstream", title: "Arrival is not access.",    body: "The brain's tiniest blood vessels are so narrow that red cells pass in single file. Being here still isn't the same as getting in." },   // DRAFT  claim: capillary ~5-10 um, red cells ~7.5 um, single file (textbook)
    { at: 0.82, kicker: "05 / Bloodstream", title: "What gets through?",        body: "Between the blood and the brain sits a wall of tightly sealed cells: the blood-brain barrier." },   // DRAFT  claim: textbook
  ],
  barrier: [
    { at: 0,    kicker: "06 / Blood-brain barrier", title: "Never far from blood.",     body: "In the brain, the finest blood vessels, the capillaries, wind between the brain cells, so almost every cell sits close to one." },   // DRAFT  source: Tsai 2009 (neurons ~15 um from a microvessel, in mice)
    { at: 0.123,  kicker: "06 / Blood-brain barrier", title: "A hungry organ.",           body: "Your brain is about 2% of your body weight but uses about 20% of its energy, so it gets a rich blood supply." },   // DRAFT  source: Raichle & Gusnard 2002
    { at: 0.33,  kicker: "06 / Blood-brain barrier", title: "A sealed wall.",             body: "Here, the cells of the vessel wall are stitched together by tight junctions, so nothing slips between them. In most of the body, capillary walls are leakier.",
      note: "This wall of sealed cells is the blood-brain barrier." },                                                                                                       // DRAFT  source: Abbott 2010
    { at: 0.426,  kicker: "06 / Blood-brain barrier", title: "Most things stay out.",      body: "Large or water-loving molecules can't get through. Some that do get into the wall are pumped straight back into the blood.",
      note: "By one estimate, more than 98% of small-molecule drugs can't cross." },                                                                                         // DRAFT  source: Abbott 2010 (efflux pumps); Pardridge 2005 (98%)
    { at: 0.522,  kicker: "06 / Blood-brain barrier", title: "Small and fat-soluble? Straight through.", body: "A few small, fat-soluble molecules, like caffeine and alcohol, pass through the cells' membranes on their own." },   // DRAFT  source: Abbott 2010 (lipid-soluble diffusion); examples textbook
    { at: 0.608, kicker: "06 / Blood-brain barrier", title: "Others need a door.",        body: "Carrier proteins in the wall are built for particular molecules. A carrier grabs one, flips, and lets it go on the other side.",
      note: "Many supplements cross this way. Others use other routes, and some barely cross at all." },                                                                     // DRAFT  source: Abbott 2010 (carrier-mediated transport)
    { at: 0.694, kicker: "06 / Blood-brain barrier", title: "Wait your turn.",            body: "Doors are shared. LAT1, the door for large amino acids like tyrosine and tryptophan, also carries the same amino acids from a protein meal, so they compete." },   // DRAFT  source: Kageyama 2000; Matsuo 2000 (as in the Simulator)
    { at: 0.809,  kicker: "06 / Blood-brain barrier", title: "In one side, out the other.", body: "Through a door on the blood side, across the cell, out a door on the brain side. Our molecule is in." },   // DRAFT  claim: LAT1 sits on both sides of the wall cells (Matsuo 2000 / textbook)
    { at: 0.933, kicker: "06 / Blood-brain barrier", title: "Next: the synapse.",         body: "Serotonin and dopamine can't cross this wall, so the brain makes its own, from building blocks that come in through doors like this one." },   // DRAFT  claim: textbook (why L-DOPA, not dopamine, is the Parkinson's drug); tyrosine/tryptophan precursors
  ],
  synapse: [
    { at: 0,     kicker: "07 / Synapse", title: "Into a neuron.",        body: "Brain cells take up building blocks like ours from the fluid around them, through carriers in their outer membrane." },   // DRAFT  claim: textbook (neuronal amino acid uptake)
    { at: 0.096, kicker: "07 / Synapse", title: "On the assembly line.", body: "Inside, enzymes turn our molecule, a precursor, into a neurotransmitter, one step at a time.",
      note: "Each enzyme needs helpers called cofactors, often vitamins or minerals. The slowest step sets the pace, so more precursor doesn't always mean more neurotransmitter." },   // DRAFT  source: Daubner 2011 (rate-limiting step); Atlas pathway data (content/neurotransmitters.js: precursors, enzymes, cofactors)
    { at: 0.264, kicker: "07 / Synapse", title: "Packed and waiting.",   body: "The new neurotransmitter is pumped into a vesicle, a tiny bubble near the end of the neuron, along with many others." },   // DRAFT  claim: textbook (vesicular monoamine transporter)
    { at: 0.336, kicker: "07 / Synapse", title: "A spark arrives.",      body: "An electrical signal races along the neuron's outer membrane, down the axon and around its end. When it arrives, vesicles fuse with the membrane and spill their contents." },   // DRAFT  claim: textbook
    { at: 0.432, kicker: "07 / Synapse", title: "Across the gap.",       body: "The messengers drift across the synaptic cleft, a gap tens of nanometers wide, and fit into receptors on the next neuron." },   // DRAFT  claim: textbook (same wording as the home page scene)
    { at: 0.56,  kicker: "07 / Synapse", title: "Message delivered.",    body: "Enough filled receptors change what the next neuron does: fire, or hold back. Electrical, then chemical, then electrical again." },   // DRAFT  claim: textbook
    { at: 0.63,  kicker: "07 / Synapse", title: "Passing it on.",        body: "The next neuron turns the message back into electricity, and now we follow the signal. Behind us, the messengers let go and are cleared away, many pulled back in to be reused." },   // DRAFT  source: Torres 2003 (reuptake); textbook (signal to the cell body, then a new spike down the axon)
    { at: 0.77,  kicker: "07 / Synapse", title: "From a swallow to a signal.", body: "That's the trip one molecule can take, and why each step, from your gut to this gap, shapes what a supplement can do." },   // DRAFT
    { at: 0.87,  kicker: "07 / Synapse", title: "Your turn.",            body: "Every supplement in the Atlas takes some version of this trip. See what each neurotransmitter does, or build a stack and check it for clashes." },   // DRAFT

  ],
  labels: {                                                   // DRAFT
    esophagus: "Esophagus",
    map: { small: "Small intestine", arteries: "Arteries", large: "Large intestine", stool: "Stool", liver: "Liver", heart: "Heart", lungs: "Lungs", kidney: "Kidneys", bladder: "Bladder", urine: "Urine", brain: "Toward the brain" },
    barrier: { blood: "Blood", cell: "Wall cell", brain: "Brain", tj: "Tight junction", door: "Door (LAT1)", pump: "Pump" },
    synapse: { neuron: "Neuron", enzymes: "Enzymes", vesicle: "Vesicle", cleft: "Synaptic cleft", receptors: "Receptors", next: "Next neuron", body: "Cell body", axon: "Axon", cofactor: "Cofactor", precursor: "Precursor", made: "Neurotransmitter" },
  },
  // The end of the journey (shown under the last caption).
  cta: { explore: "Meet your neurotransmitters", stack: "Build a stack", replay: "Start over" },   // DRAFT
  notToScale: "Not to scale",                                 // DRAFT  shown in the small intestine and on the map

  // Sources for the captions above (not shown on the page yet).
  sources: [
    "Tuleu C et al. A scintigraphic investigation of the disintegration behaviour of capsules in fasting subjects. Eur J Pharm Sci 2007;30:251-5. doi:10.1016/j.ejps.2006.11.008 (capsules reach the stomach in seconds; gelatin shells open in 3-13 min, HPMC in 6-11 min, fasted, with 180 ml water)",
    "Raichle ME, Gusnard DA. Appraising the brain's energy budget. PNAS 2002;99:10237-9. doi:10.1073/pnas.172399499 (brain ~2% of body mass, ~20% of energy use)",
    "Tsai PS et al. Correlations of neuronal and microvascular densities in murine cortex. J Neurosci 2009;29:14553-70. doi:10.1523/JNEUROSCI.3287-09.2009 (neurons on average ~15 um from the nearest microvessel, in mice)",
    "Abbott NJ et al. Structure and function of the blood-brain barrier. Neurobiol Dis 2010;37:13-25. doi:10.1016/j.nbd.2009.07.030 (tight junctions, lipid-soluble diffusion, carriers, efflux pumps)",
    "Pardridge WM. The blood-brain barrier: bottleneck in brain drug development. NeuroRx 2005;2:3-14. doi:10.1602/neurorx.2.1.3 (>98% of small-molecule drugs excluded)",
    "Kageyama T et al. Brain Research 2000. doi:10.1016/s0006-8993(00)02758-x; Matsuo H et al. NeuroReport 2000. doi:10.1097/00001756-200011090-00021 (LAT1, shared by large neutral amino acids and L-DOPA)",
    "Daubner SC et al. Tyrosine hydroxylase and regulation of dopamine synthesis. Arch Biochem Biophys 2011;508:1-12. doi:10.1016/j.abb.2010.12.017 (rate-limiting step; tyrosine to DOPA)",
    "Torres GE et al. Plasma membrane monoamine transporters: structure, regulation and function. Nat Rev Neurosci 2003;4:13-25. doi:10.1038/nrn1008 (reuptake clears dopamine, serotonin and norepinephrine)",
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
  barrierChoreo: {
    screens: 11.5,         // the showpiece: the longest chapter (the zoom out was slowed ~20% for Eric)
    // Beats (0 to 1 of the chapter), each [start, end]: zoom out through brain tissue to the whole brain;
    // dive back in; cross-fade to the wall in cross-section; tight junctions; turned away and pumped out;
    // small fat-soluble ones pass straight through; the door; the queue; the hero crosses; into the brain.
    pull: [0.000, 0.197], push: [0.216, 0.302], toWall: [0.283, 0.321], wall: [0.330, 0.426], away: [0.426, 0.522], through: [0.522, 0.608],
    door: [0.608, 0.694], queue: [0.694, 0.809], cross: [0.809, 0.923], brain: [0.923, 1.000],
    closeZoom: 9,          // capillary web: zoom at the start (matches chapter 5's close-up)
    netZoom: 0.9,          // brain tissue in view (neurons and capillaries)
    wholeZoom: 0.014,      // the whole brain in view (tissue zoom; the brain is drawn at this x brainRatio)
    brainRatio: 55,        // brain units per tissue unit: how big a patch of brain the close-up shows
    wallZoom: 1.4,         // wall: zoom for the overview beats
    queueZoom: 1.8,        // zoom while the hero queues at the door
    crossZoom: 2.2,        // zoom while it crosses
    brainZoom: 1.3,        // zoom once it's in the brain
  },
  synapseChoreo: {
    screens: 12.5,
    tunedAt: 10,           // the in-beat timings were tuned at 10 screens; they keep their length in screens (js/journey-synapse.js jySyO)
    // Beats (0 to 1 of the chapter), each [start, end]: taken up into the neuron; the two enzymes; packed
    // into a vesicle; the spark (the vesicle rides to the membrane while it runs); the vesicle fuses; the
    // next neuron's receptors fill (the new signal builds there); the camera hands over from the molecule to
    // the signal; through the cell body, slowly, with the clearing in view behind; part way down the axon;
    // the signal launches off along it as the calls to action appear.
    enter: [0, 0.08], assemble: [0.096, 0.256], pack: [0.256, 0.336], spark: [0.336, 0.424], release: [0.424, 0.48],
    fire: [0.56, 0.62], pass: [0.62, 0.65], soma: [0.65, 0.76], axon: [0.76, 0.86], launch: [0.86, 0.9], cta: 0.89,
    axonRide: 1000,        // how far down the axon the camera rides with the signal (world units) before it launches
    launchTo: 2600,        // how far the signal shoots on when it launches (off screen)
    endRise: 320,          // world units the camera eases down during the launch, so the axon sits above the last caption
    rimAxon: 0.27,         // share of the spark beat spent on the axon (matches the path lengths, so the speed is even); the rest goes around the terminal to the vesicle
    vesTravel: 0.08,       // how long the vesicle takes to reach the membrane once the spark starts (it docks while the signal is on the rim)
    zooms: { enter: 1.4, assemble: 1.9, pack: 1.7, spark: 0.85, converge: 1.1, release: 1.5, cross: 2.0, fire: 0.9, pass: 0.9, soma: 0.75, axon: 0.75, launch: 0.75 },   // camera zoom per beat
  },
  pathsChoreo: {
    screens: 7.5,        // the liver -> heart -> lungs beat was stretched (Eric: too quick to follow)
    // Groups of the 11 dots around the hero (illustration only, no numbers shown): never absorbed -> stool;
    // stay in the liver (processed); kidney -> urine; the rest travel on with the hero toward the brain.
    groups: { stool: 3, liver: 2, kidney: 3 },
    // Beats (0 to 1 of the chapter), each [start, end]: pull back from the capillary to the whole body; stool
    // group; everyone else to the liver; on through heart and lungs; kidney group; the hero's group heads up
    // toward the brain; dive into the vessel.
    pull: [0.000, 0.112], stool: [0.121, 0.280], liver: [0.308, 0.420], heart: [0.439, 0.627], kidney: [0.655, 0.785], brain: [0.813, 0.935], dive: [0.888, 1.000],
  },
};
