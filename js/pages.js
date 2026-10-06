function viewPath(n) {
  const chips = ids => ids.map(id => byId[id] ? `<a class="pill src" href="#${n.id}.${id}" data-go="${n.id}.${id}">${esc(byId[id].name)}</a>` : "").join("");
  return n.path.map(st => {
    if (st.m) {
      return `<div class="mol${st.final ? " final" : ""}">
        <span class="mol-name">${esc(st.m)}</span>
        ${st.from ? `<span class="mol-from">from ${chips(st.from)}</span>` : ""}
      </div>`;
    }
    const co = (st.co || []).map(([label, id]) => `<a class="pill co" href="#${n.id}.${id}" data-go="${n.id}.${id}" title="Cofactor: ${esc(byId[id]?.name)}">+ ${esc(label)}</a>`).join("");
    const bl = (st.block || []).map(([label, id]) => `<a class="pill block" href="#${n.id}.${id}" data-go="${n.id}.${id}" title="Blocked by ${esc(label)}">⊘ ${esc(label)}</a>`).join("");
    return `<div class="step">
      ${st.rl ? `<span class="rl">Slowest step</span>` : ""}
      ${enzymeFor(st.e) ? `<a class="enz" href="#enzyme:${enzymeFor(st.e).id}" data-go="enzyme:${enzymeFor(st.e).id}">${esc(st.e)}</a>` : `<span class="enz">${esc(st.e)}</span>`}
      ${co || bl ? `<span class="pills">${co}${bl}</span>` : ""}
    </div>`;
  }).join("");
}

function viewNT(n) {
  // Everything is shown, grouped like the animation (precursors, cofactors, modulators) and sorted by evidence.
  const visible = MAP.filter(r => r[1] === n.id);
  const ntLabel = n.id === "gaba" ? "GABA" : n.name.toLowerCase();
  const groups = [
    ["Precursors", `Raw materials your body converts into ${ntLabel}.`, r => r[2] === "precursor"],
    ["Cofactors", "Vitamins and minerals the conversion steps need.", r => r[2] === "cofactor"],
    ["Modulators", `They change how ${ntLabel} is made, released, received or cleared, without being a building block.`, r => r[2] !== "precursor" && r[2] !== "cofactor"]
  ];
  // Three blocks (precursors, cofactors, modulators). Clicking one opens its list below; only one is open at a time.
  const lists = groups.map(([title, sub, test]) => [title, sub, visible.filter(test).sort((a, b) => EV[b[3]] - EV[a[3]])]).filter(g => g[2].length);
  const tabsHtml = `<div class="sup-tabs" role="tablist">${lists.map(([title, sub, items], i) => `
      <button class="sup-tab" role="tab" id="sup-tab-${i}" aria-selected="false" aria-controls="sup-panel-${i}" data-act="sup-tab" data-i="${i}">
        <span class="sup-tab-top"><b>${title}</b><span class="sup-count">${items.length}</span></span>
        <span class="sup-tab-sub">${esc(sub)}</span>
        <span class="sup-tab-names">${items.slice(0, 3).map(([sid]) => esc(byId[sid].name.replace(/ \(.*\)$/, ""))).join(", ")}${items.length > 3 ? ", …" : ""}</span>
      </button>`).join("")}</div>`;
  const groupHtml = lists.map(([title, sub, items], i) => `
    <div class="group sup-panel" role="tabpanel" id="sup-panel-${i}" aria-labelledby="sup-tab-${i}" hidden>
      <div class="rows">
        ${items.map(([sid, , role, ev, note]) => `
          <button class="row" data-go="${n.id}.${sid}">
            <span class="row-name">${esc(byId[sid].name)} ${title === "Modulators" ? `<span class="role">${ROLE[role]}</span>` : ""}${tierBadge(byId[sid])}${ixBadge(byId[sid])}</span>
            <span class="row-note">${esc(note)}</span>
            <span class="row-side">${evDots(ev)}<span class="ev-label">${ev} evidence</span></span>
          </button>`).join("")}
      </div>
      <button class="sup-less" type="button" data-act="sup-tab" data-i="${i}">Show less ↑</button>
    </div>`).join("");

  return `<div class="stack">
    ${pathwayHtml(n)}
    <section id="nt-sups">
      <h2 class="sec">Supplements that affect ${esc(ntLabel)}</h2>
      ${tabsHtml}
      ${groupHtml}
    </section>
  </div>`;
}

function viewSupp(s, ctx) {
  const where = MAP.filter(r => r[0] === s.id);
  const cof = COF[s.id] || { items: [] };
  const [dmin, dmax, unit, freq, dnote] = s.dose;
  const ix = [...s.ix].sort((a, b) => SEV_ORDER[a[1]] - SEV_ORDER[b[1]]);
  const link = id => (ctx ? `${ctx}.` : "") + id;
  const inStack = active().items.some(i => i.sid === s.id);

  return `<div class="stack">
    <div class="s-head">
      <div class="tags">
        <span class="pill">${CAT[s.cat]}</span>${tierBadge(s)}${ixBadge(s)}
        ${s.aka.length ? `<span class="aka">also: ${s.aka.map(esc).join(", ")}</span>` : ""}
      </div>
      <h1>${esc(s.name)}</h1>
      <p class="sum">${gloss(s.sum)}</p>
      ${where.length ? `<div class="where">${where.map(([, nt, role]) => `
        <a href="#${nt}" data-go="${nt}" style="--wc:${ntColor(nt)}"><b>${esc(ntById[nt].name)}</b><span>${ROLE[role]}</span></a>`).join("")}</div>` : ""}
      <div class="s-actions">
        <button class="btn" data-act="add-supp" data-sid="${s.id}">${inStack ? "Add another dose to" : "Add to"} “${esc(active().name)}”</button>
        <span class="hint">${WHEN[s.when]} · ${FOOD[s.food]}</span>
      </div>
    </div>

    <section>
      <div class="facts">
        <div class="fact"><span class="k">Dose</span><span class="v">${range(dmin, dmax)} ${esc(unit)}</span><span class="n">${esc(freq)}</span></div>
        <div class="fact"><span class="k">Kicks in</span><span class="v">${fmtOnset(s.onset)}</span></div>
        <div class="fact"><span class="k">Lasts</span><span class="v">${fmtDur(s.dur)}</span></div>
        <div class="fact"><span class="k">Tolerance</span><span class="v">${TOL[s.tol[0]]}</span></div>
        <div class="fact"><span class="k">Dissolves in</span><span class="v">${SOL[s.sol[0]]}</span></div>
      </div>
      ${[dnote, s.onset[2], s.dur[2], s.tol[1], s.sol[1], s.cycle, s.ul].some(Boolean) ? `<div class="note-box">
        ${dnote ? `<p><b>Dose:</b> ${gloss(dnote)}</p>` : ""}
        ${s.group && GROUP_UL[s.group] ? `<p><b>Daily upper limit:</b> ${GROUP_UL[s.group]} mg elemental ${GROUP_NAME[s.group].toLowerCase()} from supplements, all forms combined.</p>`
          : s.ul ? `<p><b>Daily upper limit:</b> ${num(s.ul)} ${esc(unit)}</p>` : ""}
        ${s.onset[2] ? `<p><b>Timing:</b> ${gloss(s.onset[2])}${s.dur[2] ? " " + gloss(s.dur[2]) : ""}</p>` : (s.dur[2] ? `<p><b>Timing:</b> ${gloss(s.dur[2])}</p>` : "")}
        ${s.tol[1] ? `<p><b>Tolerance:</b> ${gloss(s.tol[1])}</p>` : ""}
        ${s.cycle ? `<p><b>Cycling:</b> ${gloss(s.cycle)}</p>` : ""}
        ${s.sol[1] ? `<p><b>Solubility:</b> ${gloss(s.sol[1])}</p>` : ""}
      </div>` : ""}
    </section>

    <section>
      <h2 class="sec">Take it with</h2>
      ${cof.items.length ? `<div class="cof-list">${cof.items.map(([cid, reason, timing]) => `
        <button class="cof" data-go="${link(cid)}">
          <span class="cof-top"><span class="cof-name">${esc(byId[cid].name)}</span>${timing ? `<span class="pill">${esc(timing)}</span>` : ""}</span>
          <p>${gloss(reason)}</p>
        </button>`).join("")}</div>` : ""}
      ${cof.note ? `<div class="note-box">${gloss(cof.note)}</div>` : ""}
    </section>

    ${s.group ? `<section>
      <h2 class="sec">Other forms</h2>
      <p class="sec-intro">Same mineral, different partner molecule. The partner changes how well it absorbs, how hard it is on your stomach, and what else it does.</p>
      <div class="cof-list">${S.filter(x => x.group === s.group && x.id !== s.id).map(x => `
        <button class="cof" data-go="${link(x.id)}">
          <span class="cof-top"><span class="cof-name">${esc(x.name)}</span>${tierBadge(x)}</span>
          <p>${esc(x.sum)}</p>
        </button>`).join("")}</div>
    </section>` : ""}

    <section class="two">
      <div class="list-card"><h3>What it does</h3><ul>${s.fx.map(x => `<li>${gloss(x)}</li>`).join("")}</ul></div>
      ${safetyHtml(s.id)}
    </section>

    <section>
      <h2 class="sec">Watch out for</h2>
      <div class="ix">${ix.map(([w, sev, note, lid]) => `
        <div class="ix-row">
          <span class="sev sev-${sev}">${sev === "beneficial" ? "Pairs well" : sev}</span>
          <div><div class="ix-with">${lid && byId[lid] ? `<button data-go="${link(lid)}">${esc(w)}</button>` : gloss(w)}</div>
          <p class="ix-note">${gloss(note)}</p></div>
        </div>`).join("")}</div>
    </section>

    <section>
      <h2 class="sec">How it works</h2>
      <div class="deep">
        <div class="deep-row"><span class="k">Mechanism</span><p>${gloss(s.mech)}</p></div>
        <div class="deep-row"><span class="k">Bioavailability</span><p>${gloss(s.bio)}</p></div>
        <div class="deep-row"><span class="k">Metabolism</span><p>${gloss(s.met)}</p></div>
      </div>
    </section>
  </div>`;
}

