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
  lede: "Six steps: name it, set your day, add supplements, check for warnings, see when everything works, then save.",
  tourPrompt: "New here? The 1-minute tour shows you around.",
  tourButton: "Take the tour",
  skipButton: "Skip the tour",   // DRAFT: opens all six steps at once

  // Open steps fold down to one line. Shown under the heading while folded. DRAFT.
  fold: {
    expandAll: "Expand all", collapseAll: "Collapse all",
    wake: "Wake", bed: "bed", meal: "meal", meals: "meals",
    supp: "supplement", supps: "supplements", noSupps: "Nothing added yet",
    doses: "Doses from",
    serious: "serious", review: "to review", minor: "minor", noIssues: "No issues found",
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
      intro: "A stack is your plan for one kind of day: when you wake, eat and sleep, and what you take. Make one per routine, like a workday and a rest day.",
      exampleNote: "You're looking at an example stack. Rename it to make it yours, or start a new one.",
    },
    day: {
      heading: "Set up your day",
      intro: "Your wake, bed and meal times. They decide when each supplement absorbs best and what gets flagged.",
      mealsTour: "How meals work",
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
      groupFlag: "to check",   // DRAFT: "! 1 to check" on a folded group with a caution tag or food/timing flag inside
      suggestions: "Suggestions",
      suggestAdd: "Add to stack",   // DRAFT
      suggestionsIntro: "Based on what's in your stack. Each one doesn't add a conflict in our data, and gets added at its best time.",   // DRAFT (team wording, October 2026)
      add: "+ Add",
      added: "In stack",
    },
    timeline: {
      heading: "See your day",
      intro: "Your stack, grouped by the pathway each supplement mainly acts on. Click a pathway to see its supplements.",   // DRAFT
      foundationLane: "Foundations + recovery",   // DRAFT
      one: "supplement", many: "supplements", from: "from",   // DRAFT: "from Caffeine" when a pathway is only reached by supplements filed under another one
    },
    check: {
      heading: "Check your stack",
      intro: "Conflicts, timing problems, missing cofactors and tolerance risks, based on your times and doses.",
    },
    save: {
      heading: "Save your stack",
      intro: "Saving confirms you've reviewed the check above, and makes the stack available in the Tracker. Your edits are always kept as a draft in the meantime.",
      empty: "Add at least one supplement first.",
      ack: "I've read the warnings in step 4.",
      reminder: "Saving doesn't mean a stack is right for you. Check with a doctor or pharmacist first, especially if you take medication.",
      button: "Save stack",
      saved: "Saved",
      changed: "You've made changes since your last save. Review step 4 and save again.",
      openTracker: "Open the Tracker →",
    },
  },

  // Click-through tours. Each step highlights one part of the page.
  tours: {
    page: [
      { target: "#bs-name", title: "1. Name your stack", text: "Pick a stack, rename it, or press New stack to start a fresh one. Everything below belongs to the stack chosen here." },
      { target: "#bs-day", title: "2. Set up your day", text: "Enter when you wake, sleep and eat. The builder uses these times to judge absorption and spacing." },
      { target: "#tour-meals", title: "Meals have their own tour", text: "Press this any time for a quick walkthrough of meals and snacks." },
      { target: "#add-q", title: "3. Search", text: "Type an ingredient (not a brand) and press Enter or pick a result to add it." },
      { target: "#add-tab-browse", title: "Browse", text: "Don't remember what does what? Open Browse and pick a neurotransmitter, or Foundations, to see its supplements, strongest evidence first." },   // DRAFT wording tweak
      { target: "#add-tab-templates", title: "Templates", text: "A ready-made starting point. It creates a new stack, so nothing you've built gets replaced." },
      { target: "#b-items", title: "Your supplements", text: "Grouped by pathway. Open a group to change a dose; “What is this?” gives a quick summary without leaving the page." },   // DRAFT wording tweak
      { target: "#bs-check", title: "4. Check your stack", text: "Conflicts, timing problems and missing cofactors show up here, with one-tap fixes where possible." },
      { target: "#bs-timeline", title: "5. See your day", text: "Each bar shows when a supplement kicks in, works and wears off. Drag a bar or a meal to move it, or let Optimize timing do it." },
      { target: "#bs-save", title: "6. Save your stack", text: "Once you've read the check, save. Only saved stacks show up as a checklist in the Tracker, and any later change asks you to review and save again." },
    ],
    meals: [
      { target: "#wake", title: "Wake time", text: "When your day starts. Morning supplements are placed after this." },
      { target: "#bed", title: "Bed time", text: "When your day ends. Stimulants too close to this get flagged." },
      { target: ".meal .meal-time", title: "Meal time", text: "When you eat. Food changes how some supplements absorb, from about 30 minutes before a meal to 2 hours after." },
      { target: ".meal .meal-label", title: "Meal name", text: "Call it anything: Breakfast, Lunch, Pre-workout." },
      { target: ".meal .flags", title: "What's in the meal", text: "Toggle Protein, Fat and Carbs. Fat helps vitamins D and K absorb; protein competes with L-Tyrosine and similar amino acids." },
      { target: ".meal .x", title: "Remove a meal", text: "Skip breakfast? Remove it so nothing gets timed around it." },
      { target: "[data-act='meal-add'][data-kind='meal']", title: "Add a meal", text: "Adds another meal you can name and time." },
      { target: "[data-act='meal-add'][data-kind='snack']", title: "Add a carb snack", text: "A small carb-only snack, which helps L-Tryptophan get into the brain by cutting competition from other amino acids." },
      { target: ".meals-row", title: "Drag meals on the timeline", text: "Further down, you can also drag a meal along the day to change its time." },
    ],
  },

  tourNav: { back: "Back", next: "Next", done: "Done", skip: "Skip tour", of: "of" },
};
