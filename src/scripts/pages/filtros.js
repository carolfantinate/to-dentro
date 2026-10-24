(async () => {
  'use strict';
  if (window.ToDentroCoursesReady) await window.ToDentroCoursesReady;
  let initialized = false;
  document.querySelector('#preferences-form').addEventListener('submit', event => { if (!initialized) event.preventDefault(); });
  await window.ToDentroAuth.ready;
  let params = new URLSearchParams(location.search);
  const root = new URL('../../', location.href);
  let shared;
  const connected = window.ToDentroAuth.isAuthenticated();
  const reportError = error => {
    let notice = document.querySelector('#preferences-sync-status');
    if (!notice) { notice = document.createElement('p'); notice.id = 'preferences-sync-status'; notice.setAttribute('role', 'alert'); document.querySelector('main').prepend(notice); }
    notice.textContent = 'Não foi possível carregar ou salvar suas preferências. Confira a conexão e tente novamente.';
  };
  if (connected) {
    try {
      shared = await import(new URL('services/search-preferences.js', root).href);
      const loaded = await shared.loadSearchPreferences(params, window.ToDentroData);
      params = loaded.params;
    } catch (error) { reportError(error); return; }
  }
  const profileMode = connected || params.get('return') === 'perfil';
  const form = document.querySelector('#preferences-form');
  const courseSelect = document.querySelector('#course-choice');
  const areaSelect = document.querySelector('#course-area');
  const catalog = window.ToDentroCourseCatalog;
  for (const [value, label] of Object.entries(catalog.areas)) {
    areaSelect.append(new Option(label, value));
  }
  areaSelect.value = Object.hasOwn(catalog.areas, params.get('area')) ? params.get('area') : '';
  if (profileMode) {
    courseSelect.multiple = true;
    courseSelect.size = 6;
    document.querySelector('#course-help').textContent = 'Você pode selecionar mais de um curso.';
    const cities = form.querySelector('input[name="city"]').parentElement.parentElement;
    cities.replaceChildren();
    for (const city of window.ToDentroData.source.general.cities) {
      const label = document.createElement('label'); label.className = 'preference-option';
      const input = document.createElement('input'); input.type = 'checkbox'; input.name = 'city'; input.value = city.id;
      const text = document.createElement('span'); text.textContent = city.name;
      label.append(input, text); cities.append(label);
    }
  }
  function updateCourses(selected = profileMode ? [...courseSelect.selectedOptions].map(option => option.value) : courseSelect.value) {
    const courses = catalog.courses.filter(course => profileMode || !areaSelect.value || course.area === areaSelect.value);
    courseSelect.replaceChildren(new Option(areaSelect.value && !profileMode ? 'Todos os cursos da área' : 'Todos os cursos', ''));
    for (const course of courses) courseSelect.append(new Option(course.name, course.value));
    if (profileMode) {
      const values = Array.isArray(selected) ? selected : [selected];
      for (const option of courseSelect.options) option.selected = values.includes(option.value);
    } else courseSelect.value = courses.some(course => course.value === selected) ? selected : '';
  }
  updateCourses(profileMode ? params.getAll('course').flatMap(value => value.split(',')) : params.get('course') || '');
  areaSelect.addEventListener('change', () => updateCourses());
  if (!params.has('city') && params.has('region')) {
    params.set('city', params.get('region') === 'sp' ? 'sao-paulo' : params.get('region'));
  }
  for (const input of form.querySelectorAll('input[type="radio"], input[type="checkbox"]')) {
    if (params.has(input.name)) input.checked = params.getAll(input.name).flatMap(value => value.split(',')).includes(input.value);
  }
  document.querySelector('#preserved-query').value = params.get('busca') || '';
  document.querySelector('#preserved-sort').value = params.get('sort') || 'relevance';
  document.querySelector('#filters-back').href = `./buscar-universidades.html?${params}`;
  if (params.get('return') === 'perfil') {
    form.action = './perfil.html';
    const backParams = new URLSearchParams(params);
    backParams.delete('return');
    document.querySelector('#filters-back').href = `./perfil.html?${backParams}`;
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = 'return'; input.value = 'perfil'; form.append(input);
  }
  if (params.get('return') === 'mapa') {
    document.querySelector('#filters-back').href = `./mapa.html?${params}`;
    form.action = './mapa.html';
    for (const name of ['universidade', 'from', 'cidade', 'return']) {
      if (!params.has(name)) continue;
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = name; input.value = params.get(name); form.append(input);
    }
  }
  document.querySelector('#clear-filters').addEventListener('click', () => {
    for (const input of form.querySelectorAll('input[type="radio"], input[type="checkbox"]')) {
      input.checked = input.name === 'course' && input.value === '';
    }
    areaSelect.value = '';
    updateCourses('');
    // Enviar todos os grupos vazios ao aplicar, sem restaurar os filtros iniciais.
    for (const name of ['city', 'type', 'mode', 'admission']) {
      if (!form.querySelector(`input[type="hidden"][name="${name}"]`)) {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = name; input.value = '';
        form.append(input);
      }
    }
  });
  form.addEventListener('submit', async event => {
    if (connected) event.preventDefault();
    for (const input of form.querySelectorAll('input[type="hidden"]')) {
      if (form.querySelector(`input[name="${input.name}"]:checked`)) input.remove();
    }
    for (const name of ['city', 'type', 'mode', 'admission']) {
      if (!form.querySelector(`input[name="${name}"]:checked`) && !form.querySelector(`input[type="hidden"][name="${name}"]`)) {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = name; input.value = ''; form.append(input);
      }
    }
    if (connected) {
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      try {
        const state = new URLSearchParams(new FormData(form));
        if (!state.has('course')) state.set('course', '');
        await shared.saveSearchPreferences(state, window.ToDentroData);
        // A página de destino lê novamente a fonte compartilhada já confirmada pelo banco.
        if (state.get('return') === 'perfil') state.delete('return');
        location.assign(`${form.action}?${state}`);
      } catch (error) { reportError(error); button.disabled = false; }
    }
  });
  initialized = true;
})();
