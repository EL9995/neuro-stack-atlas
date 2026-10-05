// ---------------------------------------------------------------------------
// BOOT
// ---------------------------------------------------------------------------
initScanner();   // first: decides whether photo scanning is available, so the Scanner page draws correctly
render(decodeURIComponent(location.hash.slice(1)));
Persist.init().then(async () => {
  const [state] = await Promise.all([Persist.load("state"), loadMonth(monthOf(todayKey())), loadMonth(monthOf(addDays(todayKey(), -13)))]);
  if (state && Array.isArray(state.stacks) && state.stacks.length && !App.dirty) {
    App.stacks = state.stacks.map(migrateStack);
    App.activeId = App.stacks.some(s => s.id === state.activeId) ? state.activeId : App.stacks[0].id;
  }
  if (current === "stack" || current === "track" || byId[current.split(".").pop()]) render(current, true);
  else setStatus();
});

