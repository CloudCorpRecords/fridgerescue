// FridgeRescue — UI logic. State lives in localStorage; matching comes from
// recipes.js (window.FridgeData), the same module the tests exercise.
(function () {
  'use strict';
  const { matchRecipes, normalize } = window.FridgeData;
  const LS_KEY = 'fridgerescue-v1';

  const DEMO_FRIDGE = [
    { name: 'spinach', daysLeft: 1 },
    { name: 'egg', daysLeft: 2 },
    { name: 'rice', daysLeft: 30 },
    { name: 'carrot', daysLeft: 3 },
    { name: 'tomato', daysLeft: 2 },
    { name: 'pasta', daysLeft: 60 },
    { name: 'garlic', daysLeft: 10 },
    { name: 'cheese', daysLeft: 5 },
    { name: 'banana', daysLeft: 1 },
    { name: 'oats', daysLeft: 90 },
    { name: 'milk', daysLeft: 4 },
    { name: 'olive oil', daysLeft: 120 },
  ];

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fresh start */ }
    return { pantry: [], rescued: 0, meals: 0 };
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  const $ = (id) => document.getElementById(id);
  const pantryList = $('pantry-list'), pantryEmpty = $('pantry-empty');
  const recipeList = $('recipe-list'), resultsEmpty = $('results-empty'), resultsNote = $('results-note');
  const dialog = $('recipe-dialog');
  let currentRecipe = null;

  function badgeFor(daysLeft) {
    if (daysLeft === null || daysLeft === undefined) return ['no date', 'badge-ok'];
    if (daysLeft <= 1) return [`${daysLeft}d left — use it!`, 'badge-urgent'];
    if (daysLeft <= 3) return [`${daysLeft}d left`, 'badge-soon'];
    return [`${daysLeft}d left`, 'badge-ok'];
  }

  function renderPantry() {
    pantryList.innerHTML = '';
    const sorted = [...state.pantry].sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999));
    for (const item of sorted) {
      const li = document.createElement('li');
      li.className = 'pantry-item';
      const [label, cls] = badgeFor(item.daysLeft);
      li.innerHTML = `<span class="p-name"></span><span class="badge ${cls}">${label}</span>`;
      li.querySelector('.p-name').textContent = item.name;
      const btn = document.createElement('button');
      btn.className = 'p-remove'; btn.textContent = '✕'; btn.title = 'Remove';
      btn.addEventListener('click', () => {
        state.pantry = state.pantry.filter((p) => !(p.name === item.name && p.daysLeft === item.daysLeft));
        save(); render();
      });
      li.appendChild(btn);
      pantryList.appendChild(li);
    }
    pantryEmpty.style.display = state.pantry.length ? 'none' : 'block';
  }

  function renderStats() {
    $('stat-rescued').textContent = state.rescued;
    $('stat-meals').textContent = state.meals;
    $('stat-saved').textContent = '$' + state.rescued * 3;
  }

  function renderRecipes() {
    const diet = $('filter-diet').value;
    const maxMinutes = $('filter-time').value ? Number($('filter-time').value) : null;
    const results = state.pantry.length ? matchRecipes(state.pantry, { diet, maxMinutes }) : [];
    recipeList.innerHTML = '';
    resultsNote.textContent = results.length
      ? `${results.length} recipe${results.length === 1 ? '' : 's'} ranked by rescue score — how much soon-to-expire food each one saves. Click a card for steps.`
      : '';
    resultsEmpty.style.display = results.length ? 'none' : 'block';
    if (state.pantry.length && !results.length) {
      resultsEmpty.textContent = 'Nothing matches those filters yet. Try loosening the diet/time filters, or add a staple like eggs, rice or pasta.';
    } else if (!state.pantry.length) {
      resultsEmpty.textContent = 'No matches yet. Recipes appear as soon as something in your fridge matches — even one ingredient is a start.';
    }
    for (const r of results.slice(0, 9)) {
      const card = document.createElement('button');
      card.className = 'recipe-card'; card.type = 'button';
      const scoreCls = r.score >= 75 ? '' : r.score >= 50 ? 'score-mid' : 'score-low';
      const haveChips = r.have.map((h) =>
        `<span class="chip ${r.usesUrgent.includes(h) ? 'chip-urgent' : ''}">${h}${r.usesUrgent.includes(h) ? ' ⚠' : ''}</span>`).join('');
      const missChips = r.missing.map((m) => `<span class="chip chip-missing">${m}</span>`).join('');
      card.innerHTML = `
        <div class="recipe-top"><h3 class="recipe-name"></h3><span class="score ${scoreCls}">Rescue ${r.score}</span></div>
        <p class="recipe-blurb"></p>
        <p class="chip-row">${haveChips}${missChips}</p>
        <div class="recipe-meta">⏱ ${r.minutes} min · ${r.difficulty} · You have ${r.have.length}/${r.ingredients.length} ingredients
        ${r.usesUrgent.length ? ` · <span class="rescue-flag">Rescues ${r.usesUrgent.join(', ')} before it expires</span>` : ''}</div>`;
      card.querySelector('.recipe-name').textContent = r.name;
      card.querySelector('.recipe-blurb').textContent = r.blurb;
      card.addEventListener('click', () => openRecipe(r));
      recipeList.appendChild(card);
    }
  }

  function openRecipe(r) {
    currentRecipe = r;
    $('d-name').textContent = r.name;
    $('d-blurb').textContent = r.blurb;
    $('d-meta').textContent = `⏱ ${r.minutes} min · ${r.difficulty} · Rescue score ${r.score} · You have ${r.have.length} of ${r.ingredients.length} ingredients`;
    $('d-have').innerHTML = r.have.map((h) =>
      `<span class="chip ${r.usesUrgent.includes(h) ? 'chip-urgent' : ''}">${h}</span>`).join('') || '—';
    $('d-missing-title').style.display = r.missing.length ? 'block' : 'none';
    $('d-missing').innerHTML = r.missing.map((m) => `<span class="chip chip-missing">${m}</span>`).join('');
    $('d-steps').innerHTML = r.steps.map((s) => `<li></li>`).join('');
    [...$('d-steps').children].forEach((li, i) => { li.textContent = r.steps[i]; });
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  $('d-cook').addEventListener('click', () => {
    if (!currentRecipe) return;
    const used = new Set(currentRecipe.have.map(normalize));
    const before = state.pantry.length;
    state.pantry = state.pantry.filter((p) => !used.has(normalize(p.name)));
    state.rescued += before - state.pantry.length;
    state.meals += 1;
    save(); render();
    dialog.close();
  });
  $('dialog-close').addEventListener('click', () => dialog.close());

  $('add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = normalize($('ing-name').value);
    const days = $('ing-days').value === '' ? null : Number($('ing-days').value);
    if (!name) return;
    const existing = state.pantry.find((p) => normalize(p.name) === name);
    if (existing) existing.daysLeft = days;
    else state.pantry.push({ name, daysLeft: days });
    $('ing-name').value = '';
    save(); render();
  });
  $('demo-btn').addEventListener('click', () => { state.pantry = [...DEMO_FRIDGE]; save(); render(); });
  $('clear-btn').addEventListener('click', () => { state.pantry = []; save(); render(); });
  $('filter-diet').addEventListener('change', render);
  $('filter-time').addEventListener('change', render);

  function render() { renderPantry(); renderRecipes(); renderStats(); }
  // ?demo=1 loads the demo fridge for first paint (used for screenshots/demos);
  // it does not overwrite a saved fridge unless the visitor then interacts.
  if (new URLSearchParams(location.search).has('demo') && !state.pantry.length) {
    state.pantry = [...DEMO_FRIDGE];
  }
  render();
})();
