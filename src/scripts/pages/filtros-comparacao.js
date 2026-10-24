(async () => {
  'use strict';
  if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady;
  const data = window.ToDentroData;
  const params = new URLSearchParams(location.search);
  const form = document.querySelector('#comparison-form');
  const course = document.querySelector('#comparison-course');
  const search = document.querySelector('#comparison-search');
  const options = document.querySelector('#comparison-options');
  const selectedList = document.querySelector('#comparison-selected');
  const universities = window.ToDentroUniversities.filter(item => item.state === 'SP');
  const normalize = data.normalize;
  const catalog = data.views.courseCatalog.courses.filter(item => Object.keys(data.comparisonOptions(item.id)).length >= 2);
  for (const item of catalog) course.add(new Option(item.name, item.id));
  const initialCourse = data.getCourse(params.get('curso'));
  course.value = catalog.some(item => item.id === initialCourse?.id) ? initialCourse.id : catalog[0]?.id || '';
  let campusOptionsByUniversity = data.comparisonOptions(course.value);
  for (const name of ['edicao', 'modalidade', 'turno']) {
    const field = form.elements.namedItem(name);
    if ([...field.options].some(option => option.value === params.get(name))) field.value = params.get(name);
  }
  const initial = data.getUniversity(params.get('universidade'));
  const process = initial && data.getProcess(initial.id, params.get('processo'));
  if (['enem', 'vestibular'].includes(params.get('processo'))) form.elements.processo.value = params.get('processo');
  else if (process) form.elements.processo.value = process.method;
  if (params.has('opcao')) document.querySelector('#comparison-back').href = `./comparacao-notas.html?${params}`;
  else if (initial) document.querySelector('#comparison-back').href = `./nota-de-corte.html?${params}`;
  let selected = new Map(Object.entries(campusOptionsByUniversity).map(([id, option]) => [id, option.campusIds[0]]));
  const initialCampus = initial && data.getCampus(initial.id, params.get('campus'));
  if (initialCampus && campusOptionsByUniversity[initial.id]?.campusIds.includes(initialCampus.id)) selected.set(initial.id, initialCampus.id);
  if (params.has('opcao')) selected = new Map(data.readComparison(params).map(item => [item.id, item.campusId]));
  const institutionIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 7 10-5 10 5H2ZM4 20h16M2 22h20M5 9v9m5-9v9m4-9v9m5-9v9"/></svg>';
  function renderOptions() {
    options.replaceChildren();
    const query = normalize(search.value);
    const available = universities.filter(item => campusOptionsByUniversity[item.id] && !selected.has(item.id) && normalize(`${item.acronym} ${item.name} ${(campusOptionsByUniversity[item.id]?.campuses || []).join(' ')}`).includes(query));
    for (const university of available) {
      const button = document.createElement('button'); button.type = 'button';
      button.textContent = `＋ ${university.acronym} · ${university.name} · SP`;
      button.addEventListener('click', () => { selected.set(university.id, campusOptionsByUniversity[university.id].campusIds[0]); search.value = ''; options.hidden = true; render(); });
      options.append(button);
    }
    if (!available.length) {
      const text = document.createElement('p'); text.textContent = 'Nenhuma outra universidade de São Paulo encontrada.'; options.append(text);
    }
  }
  function render() {
    selectedList.replaceChildren();
    let index = 0;
    for (const [id, campusId] of selected) {
      const university = universities.find(item => item.id === id);
      const option = campusOptionsByUniversity[id];
      const campusOptions = option.campuses;
      const campusIndex = option.campusIds.indexOf(campusId);
      const card = document.createElement('article'); card.className = 'comparison-card';
      card.innerHTML = `<span class="comparison-icon ${['blue', 'green', 'yellow'][index++ % 3]}">${institutionIcon}</span><div><h3></h3><p></p><button class="change-campus" type="button" aria-expanded="false">Alterar campus</button><select class="campus-picker" hidden></select></div><button class="remove" type="button">×</button>`;
      card.querySelector('h3').textContent = university.acronym;
      const campusText = card.querySelector('p'); campusText.textContent = `Campus: ${campusOptions[campusIndex]} · SP`;
      const picker = card.querySelector('select'); picker.id = `campus-${id}`; picker.setAttribute('aria-label', `Campus da ${university.acronym}`);
      campusOptions.forEach((label, value) => picker.add(new Option(`${label} · SP`, option.campusIds[value])));
      picker.value = campusId;
      const change = card.querySelector('.change-campus'); change.setAttribute('aria-controls', picker.id);
      change.addEventListener('click', () => { picker.hidden = !picker.hidden; change.setAttribute('aria-expanded', String(!picker.hidden)); if (!picker.hidden) picker.focus(); });
      picker.addEventListener('change', () => { selected.set(id, picker.value); campusText.textContent = `Campus: ${campusOptions[option.campusIds.indexOf(picker.value)]} · SP`; });
      const remove = card.querySelector('.remove'); remove.setAttribute('aria-label', `Remover ${university.acronym}`);
      remove.addEventListener('click', () => { selected.delete(id); render(); document.querySelector('#comparison-add').focus(); });
      selectedList.append(card);
    }
    document.querySelector('#comparison-count').textContent = `${selected.size} ${selected.size === 1 ? 'universidade selecionada' : 'universidades selecionadas'}`;
    document.querySelector('#comparison-submit-label').textContent = `Comparar ${selected.size} universidades`;
    document.querySelector('#comparison-submit').disabled = selected.size < 2;
    document.querySelector('#comparison-validation').textContent = selected.size < 2 ? 'Selecione pelo menos duas universidades para comparar.' : '';
    renderOptions();
  }
  search.addEventListener('input', () => { options.hidden = false; renderOptions(); });
  search.addEventListener('focus', () => { options.hidden = false; renderOptions(); });
  search.addEventListener('keydown', event => { if (event.key === 'Escape') options.hidden = true; });
  document.querySelector('#comparison-add').addEventListener('click', () => { options.hidden = false; search.focus(); renderOptions(); });
  form.addEventListener('reset', () => { requestAnimationFrame(() => { course.value = catalog[0]?.id || ''; campusOptionsByUniversity = data.comparisonOptions(course.value); selected.clear(); search.value = ''; options.hidden = true; render(); }); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (selected.size < 2) return;
    const state = new URLSearchParams(new FormData(form));
    for (const [id, campusId] of selected) {
      const offering = data.getOfferings({universityId: id, campusId, courseId: course.value})[0];
      if (offering) state.append('opcao', offering.id);
    }
    location.href = `./comparacao-notas.html?${state}`;
  });
  course.addEventListener('change', () => {
    campusOptionsByUniversity = data.comparisonOptions(course.value);
    selected = new Map(Object.entries(campusOptionsByUniversity).map(([id, option]) => [id, option.campusIds[0]]));
    render();
  });
  render();
})();
