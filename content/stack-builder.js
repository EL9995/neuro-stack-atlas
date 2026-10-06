// ===========================================================================
// STACK BUILDER WORDING
// Step headings, short explanations, and the click-through tours.
// ALL TEXT HERE IS DRAFT (October 2026).
//
// HOW TO EDIT
//   - Change only text inside "quotes". Keep quotes, commas and brackets.
//   - In the tours, "target" says which part of the page to highlight.
//     Don't change those; ask if a step should point somewhere else.
//   - Save, then hard-refresh the browser (Cmd+Shift+R).
// ===========================================================================
const BUILDER_TEXT = {
  eyebrow: "Stack builder",
  title: "Build a stack. See how the day plays out.",
  lede: "Tell us about you if you like, then five steps: name it, add supplements, check doses and interactions, plan your day and timing, then save.",   // DRAFT (step 0; your day + timing merged into "Plan your protocol")
  tourPrompt: "New here? The 1-minute tour shows you around.",
  tourButton: "Take the tour",
  skipButton: "Skip the tour",   // DRAFT: opens all steps at once

  // Open steps fold down to one line. Shown under the heading while folded. DRAFT.
  fold: {
    expandAll: "Expand all", collapseAll: "Collapse all",
    wake: "Wake", bed: "bed", meal: "meal", meals: "meals",
    supp: "supplement", supps: "supplements", noSupps: "Nothing added yet",
    doses: "Doses from",
    serious: "serious", review: "to review", minor: "minor", noIssues: "No issues found",
    acked: "Approved", notAcked: "Not approved yet",   // DRAFT: final gate at the end of step 3
    saved: "Saved", changed: "Changed since your last save", notSaved: "Not saved yet",
  },

  // Steps open one at a time until "Skip the tour" is pressed. DRAFT.
  gate: {
    next: "Next:",
    locked: "Finish step {n} to open this one.",
    needItem: "Add at least one supplement to continue.",
  },

  // "What do the dots mean?" key for the evidence ratings in Browse.
  // DRAFT: these definitions are new. Check they match how the ratings in supplement-links.js were assigned.
  evidence: {
    summary: "What do the dots mean?",
    intro: "How much research backs the link between a supplement and that brain chemical. It's about how sure we can be, not how strong the effect is.",
    strong: "Several good human trials point the same way.",
    moderate: "Some human studies support it, but they're fewer, smaller or mixed.",
    limited: "Early or small human studies, or mostly animal and lab research.",
    theoretical: "Makes sense from how the body works, but hasn't really been shown in people.",
    note: "Lists are sorted strongest first. A weaker rating doesn't mean it does nothing, only that we know less.",
  },

  steps: {
    name: {
      heading: "Name your stack",
      intro: "A stack is your plan for one kind of day: what you take, and when. Make one per routine, like a workday and a rest day.",   // DRAFT (reworded: wake/eat/sleep now set in step 4)
      exampleNote: "You're looking at an example stack. Rename it to make it yours, or start a new one.",
    },
    day: {   // part of step 4 ("Plan your protocol")
      heading: "Your day",   // DRAFT
      intro: "Your wake, bed and meal times. Change them here and the tips and timeline below update right away.",   // DRAFT
      mealsTour: "How to edit your day",   // DRAFT (was "How meals work")
    },
    add: {
      heading: "Build your stack",   // DRAFT (was "Add supplements")
      intro: "Search by ingredient, browse by what you want to change, or start from a template.",
      addLabel: "Add",   // DRAFT: the Search / Browse / Templates switch
      undo: "Undo", redo: "Redo", clear: "Clear stack",   // DRAFT
      inStack1: "In your stack.", inStackN: "In your stack {n} times.",   // DRAFT
      remove: "Remove from stack", removeAll: "Remove all doses", addAgain: "Add another dose",   // DRAFT
      removed: "Removed {name}.",   // DRAFT
      undoKey: "Undo (Cmd/Ctrl+Z)", redoKey: "Redo (Shift+Cmd/Ctrl+Z)",   // DRAFT
      cleared: "Removed all {n} supplements.",   // DRAFT
      tabSearch: "Search", tabBrowse: "Browse", tabTemplates: "Templates",   // DRAFT
      templatesNote: "A template starts a new stack, so nothing you've built gets replaced.",   // DRAFT (same as the tour)
      searchLabel: "Search",
      searchPlaceholder: "Search {n} supplements: try “theanine”, “vitamin D” or “magnesium”",   // {n} is counted from the data
      browseLabel: "Browse by neurotransmitter",
      foundationTab: "Foundations + recovery",   // DRAFT
      foundationSub: "Support the whole system",   // DRAFT
      browseHint: "Pick one to see the supplements that act on it, strongest evidence first. The dots show how strong the research is.",   // DRAFT: second sentence added
      templatesLabel: "Or start from a template",
      inStack: "In this stack",
      groupFlag: "to check",   // DRAFT: "! 1 to check" on a folded group with a caution tag inside
      suggestions: "Suggestions",
      suggestAdd: "Add to stack",   // DRAFT
      suggestionsIntro: "Based on what's in your stack. Each one doesn't add a conflict in our data, and gets added at its best time.",   // DRAFT (team wording, October 2026)
      add: "+ Add",
      added: "In stack",
    },
    timeline: {
      heading: "Plan your protocol",   // DRAFT (was "See your day"; now also holds Your day)
      tipsHeading: "Timing tips",   // DRAFT
      tipsIntro: "When to take what: spacing, time of day and food. These are suggestions; they never pause your stack.",   // DRAFT
      headsUpLabel: "Heads-up",   // DRAFT: tag on a timing tip worth acting on (e.g. caffeine late in the day)
      tipLabel: "Tip",   // DRAFT
      headsUpCount: "heads-up", tipCount1: "tip", tipCount: "tips",   // DRAFT: "2 heads-up · 9 tips" next to the heading
      tipsAll: "Show all {n} tips", tipsFewer: "Show fewer",   // DRAFT
      intro: "Your stack, grouped by the pathway each supplement mainly acts on. Click a pathway to see its supplements.",   // DRAFT
      foundationLane: "Foundations + recovery",   // DRAFT
      one: "supplement", many: "supplements", from: "from",   // DRAFT: "from Caffeine" when a pathway is only reached by supplements filed under another one
    },
    check: {
      heading: "Check your stack",
      intro: "Doses, interactions, missing cofactors and tolerance risks. Timing is planned in step 4.",   // DRAFT (timing moved to step 4)
    },
    save: {
      heading: "Save your stack",
      intro: "Saving confirms you've reviewed the check above, and makes the stack available in the Tracker. Your edits are always kept as a draft in the meantime.",
      empty: "Add at least one supplement first.",
      ack: "I've read the warnings in step 3.",
      reminder: "Saving doesn't mean a stack is right for you. Check with a doctor or pharmacist first, especially if you take medication.",
      button: "Save stack",
      saved: "Saved",
      changed: "You've made changes since your last save. Review step 3 and save again.",
      openTracker: "Open the Tracker →",
    },
  },

  // Click-through tours. Each step highlights one part of the page.
  tours: {
    page: [
      { target: "#bs-about", title: "0. About you (optional)", text: "Your medications and health conditions. We use them to check every stack for interactions. Skip it if you like; it stays on this device either way." },   // DRAFT
      { target: "#bs-name", title: "1. Name your stack", text: "Pick a stack, rename it, or press New stack to start a fresh one. Everything below belongs to the stack chosen here." },
      { target: "#add-q", title: "2. Search", text: "Type an ingredient (not a brand) and press Enter or pick a result to add it." },
      { target: "#add-tab-browse", title: "Browse", text: "Don't remember what does what? Open Browse and pick a neurotransmitter, or Foundations, to see its supplements, strongest evidence first." },   // DRAFT wording tweak
      { target: "#add-tab-templates", title: "Templates", text: "A ready-made starting point. It creates a new stack, so nothing you've built gets replaced." },
      { target: "#b-items", title: "Your supplements", text: "Grouped by pathway. Open a group to change a dose; “What is this?” gives a quick summary without leaving the page." },   // DRAFT wording tweak
      { target: "#bs-check", title: "3. Check your stack", text: "Doses, interactions and missing cofactors show up here, with one-tap fixes where possible. Anything serious pauses the stack until it's fixed or reviewed." },   // DRAFT
      { target: "#bs-timeline", title: "4. Plan your protocol", text: "Set when you wake, eat and sleep, then see when each supplement kicks in, works and wears off. Timing tips sit above the timeline. Drag a bar or a meal to move it, or let Optimize timing do it." },   // DRAFT
      { target: "#tour-meals", title: "Meals have their own tour", text: "Press this any time for a quick walkthrough of meals and snacks." },
      { target: "#bs-save", title: "5. Save your stack", text: "Once you've read the check, save. Only saved stacks show up as a checklist in the Tracker, and any later change asks you to review and save again." },
    ],
    meals: [   // DRAFT: retargeted at the timeline's Day / Meals / Fasting rows (the separate form is gone)
      { target: "[data-drag='wake:']", title: "Wake time", text: "When your day starts. Type it on the left or drag this end of the bar. Morning supplements are placed after this." },
      { target: "[data-drag='bed:']", title: "Bed time", text: "When your day ends. Type it or drag this end. Stimulants too close to it get flagged." },
      { target: ".tl-mealchip", title: "Meals", text: "Drag a meal to change its time. Food changes how some supplements absorb, from about 30 minutes before a meal to 2 hours after." },
      { target: ".tl-mealchip", title: "Edit a meal", text: "Click a meal to rename it, toggle Protein, Fat and Carbs, or remove it. Fat helps vitamins D and K absorb; protein competes with L-Tyrosine and similar amino acids." },
      { target: "[data-act='meal-add'][data-kind='meal']", title: "Add a meal", text: "Adds another meal you can name and time." },
      { target: "[data-act='meal-add'][data-kind='snack']", title: "Add a snack", text: "A small carb snack by default, which helps L-Tryptophan get into the brain by cutting competition from other amino acids. Click it to change what's in it." },
      { target: "[data-act='fast-add']", title: "Add a fast", text: "Adds a fasting window you can drag, stretch from either end, or click to set exact times. Supplements best taken with food get a heads-up when they land inside it." },
    ],
  },

  // Fasting windows and the day rows on the step 4 timeline. DRAFT (October 2026).
  // Flags never pause a stack. During a fast: fat-soluble supplements ("sol" fat/both in supplements.js) get a
  // heads-up; water-soluble ones marked take-with-food ("with_food") get a softer tip.
  fasting: {
    row: "Fasting", add: "+ Fast", none: "none set", hint: "drag or click",
    mealTitle: "{meal} at {time} is inside your fast",
    mealBody: "This meal falls inside a fasting window. Move the meal or change the fast so they don't overlap.",
    suppTitle: "{name} at {time}, during your fast",
    fatBody: "Best taken with food. {name} is fat-soluble, so it absorbs much better with a meal that has some fat.",
    foodBody: "{name} is easier on the stomach with a meal. It's water-soluble, so it still absorbs fine during a fast.",   // DRAFT: a tip, not a heads-up
    edit: "Fasting window", from: "From", to: "To", remove: "Remove fast", done: "Done",
  },
  dayRows: {
    title: "Day planner", titleHint: "Type or drag your wake and bed times; drag or click meals and fasts.",   // DRAFT
    day: "Awake", wake: "Wake", bed: "Bed",   // DRAFT ("Day" → "Awake": the bar runs from wake-up to bedtime)
    meals: "Meals", addMeal: "+ Meal", addSnack: "+ Snack", mealsHint: "drag or click",
    editMeal: "Edit meal", name: "Name", time: "Time", removeMeal: "Remove meal", done: "Done",
  },

  tourNav: { back: "Back", next: "Next", done: "Done", skip: "Skip tour", of: "of" },
};
