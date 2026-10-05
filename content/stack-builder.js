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
  lede: "Five steps: name it, set your day, add supplements, then see when everything works and what to watch out for.",
  tourPrompt: "New here? The 1-minute tour shows you around.",
  tourButton: "Take the tour",
  dismiss: "Not now",

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
      heading: "Add supplements",
      intro: "Search by ingredient, browse by what you want to change, or start from a template.",
      searchLabel: "Search",
      searchPlaceholder: "Search 65 supplements: try “theanine”, “vitamin D” or “magnesium”",
      browseLabel: "Browse by neurotransmitter",
      browseHint: "Pick one to see the supplements that act on it, strongest evidence first.",
      templatesLabel: "Or start from a template",
      inStack: "In this stack",
      suggestions: "Suggestions",
      suggestionsIntro: "Based on what's in your stack. Each one has been checked so it doesn't add a new conflict, and gets added at its best time.",
      add: "+ Add",
      added: "In stack",
    },
    timeline: {
      heading: "See your day",
    },
    check: {
      heading: "Check your stack",
      intro: "Conflicts, timing problems, missing cofactors and tolerance risks, based on your times and doses.",
    },
  },

  // Click-through tours. Each step highlights one part of the page.
  tours: {
    page: [
      { target: "#bs-name", title: "1. Name your stack", text: "Pick a stack, rename it, or press New stack to start a fresh one. Everything below belongs to the stack chosen here." },
      { target: "#bs-day", title: "2. Set up your day", text: "Enter when you wake, sleep and eat. The builder uses these times to judge absorption and spacing." },
      { target: "#tour-meals", title: "Meals have their own tour", text: "Press this any time for a quick walkthrough of meals and snacks." },
      { target: "#add-q", title: "3. Search", text: "Type an ingredient (not a brand) and press Enter or pick a result to add it." },
      { target: "#bs-browse", title: "Browse by neurotransmitter", text: "Don't remember what does what? Pick a neurotransmitter to see its supplements, strongest evidence first, and add one with a tap." },
      { target: "#bs-templates", title: "Templates", text: "A ready-made starting point. It creates a new stack, so nothing you've built gets replaced." },
      { target: "#b-items", title: "Your supplements", text: "Change a dose or time here. “What is this?” gives a quick summary without leaving the page." },
      { target: "#bs-timeline", title: "4. See your day", text: "Each bar shows when a supplement kicks in, works and wears off. Drag a bar or a meal to move it, or let Optimize timing do it." },
      { target: "#bs-check", title: "5. Check your stack", text: "Conflicts, timing problems and missing cofactors show up here, with one-tap fixes where possible." },
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
