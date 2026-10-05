S.forEach(s => Object.assign(s, { tier: "core", tags: [], when: "any", food: "any", ul: null, cycle: null }, META[s.id]));

// Auto-link interactions whose name matches a supplement exactly.
{
  const byName = Object.fromEntries(S.map(s => [s.name.toLowerCase(), s.id]));
  S.forEach(s => s.ix.forEach(i => { if (!i[3] && byName[i[0].toLowerCase()]) i[3] = byName[i[0].toLowerCase()]; }));
}

// Spacing rules written for each group's original entry apply to every form in
// that group. Groups are expanded in turn, so iron x zinc becomes every pair.
const GROUP_BASE = { magnesium: "magnesium-glycinate", zinc: "zinc", iron: "iron" };
Object.entries(GROUP_BASE).forEach(([g, base]) => {
  const forms = S.filter(s => s.group === g && s.id !== base).map(s => s.id);
  SEP.filter(r => r[0] === base || r[1] === base).forEach(([a, b, h, why]) =>
    forms.forEach(id => SEP.push([a === base ? id : a, b === base ? id : b, h, why])));
});
