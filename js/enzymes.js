// ---------------------------------------------------------------------------
// ENZYME PAGES (#enzyme:<id>)
// Wording lives in content/enzymes.js. The reaction, cofactors and supplement
// links come from each neurotransmitter's pathway data, so they stay in sync.
// ---------------------------------------------------------------------------
const enzymeById = Object.fromEntries(ENZYMES.map(e => [e.id, e]));
const enzymeFor = label => ENZYMES.find(e => e.labels.includes(label)) || null;

// Every place this enzyme appears: [neurotransmitter, step index in its pathway]
function enzymeSteps(e) {
  const out = [];
  NTS.forEach(n => n.path.forEach((st, i) => { if (st.e && e.labels.includes(st.e)) out.push([n, i]); }));
  return out;
}

function viewEnzyme(e) {
  const T = ENZYME_PAGE, steps = enzymeSteps(e);
  const supName = id => byId[id] ? byId[id].name : id;
  // Reactions, one per distinct input -> output
  const seen = new Set(), reactions = [];
  steps.forEach(([n, i]) => {
    const from = n.path[i - 1], to = n.path[i + 1], key = from.m + ">" + to.m;
    if (!seen.has(key)) { seen.add(key); reactions.push([n, from, n.path[i], to]); }
  });
  const reactionHtml = reactions.map(([n, from, st, to]) => `<div class="path-scroll"><div class="path">
      <div class="mol"><span class="mol-name">${esc(from.m)}</span></div>
      <div class="step">${st.rl ? `<span class="rl">Slowest step</span>` : ""}<span class="enz">${esc(e.name)}</span>
        ${(st.co || []).length ? `<span class="pills">${st.co.map(([l, id]) => `<a class="pill co" href="#${n.id}.${id}" data-go="${n.id}.${id}">+ ${esc(l)}</a>`).join("")}</span>` : ""}</div>
      <div class="mol final" style="--nt:${ntColor(n.id)}"><span class="mol-name">${esc(to.m)}</span></div>
    </div></div>`).join("");

  // Cofactors (deduplicated across pathways)
  const co = [], coSeen = new Set();
  steps.forEach(([n, i]) => (n.path[i].co || []).forEach(([l, id]) => { if (!coSeen.has(l)) { coSeen.add(l); co.push([n, l, id]); } }));

  // Supplements: feed (raw material just before), skip (join just after), block
  const groups = { feed: [], skip: [], block: [] }, add = (g, n, id) => { if (byId[id] && !groups[g].some(x => x[1] === id)) groups[g].push([n, id]); };
  steps.forEach(([n, i]) => {
    (n.path[i - 1].from || []).forEach(id => add("feed", n, id));
    (n.path[i + 1].from || []).forEach(id => add("skip", n, id));
    (n.path[i].block || []).forEach(([, id]) => add("block", n, id));
  });
  const supHtml = ["feed", "skip", "block"].filter(g => groups[g].length).map(g => `
    <div class="ez-group"><h3>${esc(T[g])}</h3><div class="ez-chips">${groups[g].map(([n, id]) =>
      `<a class="pill src" href="#${n.id}.${id}" data-go="${n.id}.${id}">${esc(supName(id))}</a>`).join("")}</div></div>`).join("");

  const nts = [...new Set(steps.map(([n]) => n))];
  return `<div class="stack">
    <div class="s-head">
      <div class="tags"><span class="pill">${esc(T.eyebrow)}</span><span class="aka">${esc(e.abbr)}</span></div>
      <h1>${esc(e.name)}</h1>
      <p class="sum">${gloss(e.sum)}</p>
      <div class="where"><span class="ez-part">${esc(T.appearsIn)}</span>${nts.map(n => `<a href="#${n.id}" data-go="${n.id}" style="--wc:${ntColor(n.id)}"><b>${esc(n.name)}</b></a>`).join("")}</div>
    </div>

    <section>
      <h2 class="sec">${esc(T.reaction)}</h2>
      <div class="ez-reactions">${reactionHtml}</div>
    </section>

    <section class="two">
      <div class="list-card"><h3>${esc(T.does)}</h3><p>${gloss(e.does)}</p></div>
      <div class="list-card"><h3>${esc(T.where)}</h3><p>${gloss(e.where)}</p></div>
    </section>

    ${co.length ? `<section>
      <h2 class="sec">${esc(T.needs)}</h2>
      <div class="cof-list">${co.map(([n, l, id]) => `
        <button class="cof" data-go="${n.id}.${id}">
          <span class="cof-top"><span class="cof-name">${esc(supName(id))}</span><span class="pill">${esc(l)}</span></span>
          <p>${gloss(e.needs[l] || "")}</p>
        </button>`).join("")}</div>
    </section>` : ""}

    <section>
      <h2 class="sec">${esc(T.speed)}</h2>
      <div class="list-card"><ul>${e.speed.map(x => `<li>${gloss(x)}</li>`).join("")}</ul></div>
    </section>

    ${supHtml ? `<section>
      <h2 class="sec">${esc(T.supplements)}</h2>
      <p class="sec-intro">${esc(T.hint)}</p>
      <div class="ez-groups">${supHtml}</div>
    </section>` : ""}

    ${e.notes.length ? `<section>
      <h2 class="sec">${esc(T.notes)}</h2>
      <div class="note-box">${e.notes.map(x => `<p>${gloss(x)}</p>`).join("")}</div>
    </section>` : ""}
  </div>`;
}
