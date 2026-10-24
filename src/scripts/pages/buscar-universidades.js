(async () => {
  'use strict';
  if (window.ToDentroCoursesReady) await window.ToDentroCoursesReady;
  if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady;
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
  const query = document.querySelector('#university-query');
  const list = document.querySelector('.university-results-list');
  list.replaceChildren();
  const cards = window.ToDentroUniversities.map(university => {
    const card = document.createElement('td-university-card');
    card.setAttribute('university-id', university.id);
    card.setAttribute('variant', 'featured');
    list.append(card);
    card.render();
    return card;
  });
  const count = document.querySelector('#results-count');
  const sort = document.querySelector('#sort-universities');
  const regionChip = document.querySelector('[data-filter="sp"]');
  const typeChip = document.querySelector('[data-filter="public"]');
  const filtersLink = document.querySelector('#open-filters');

  const filters = {
    city: params.has('city') ? params.getAll('city').join(',') : params.has('region') ? (params.get('region') === 'sp' ? 'sao-paulo' : params.get('region')) : 'sao-paulo',
    type: params.has('type') ? params.getAll('type').join(',') : 'publica',
    course: params.getAll('course').join(','), mode: params.getAll('mode').join(','),
    area: params.get('area') || '',
    admission: params.getAll('admission').join(','),
  };

  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  function updateResults() {
    const terms = normalize(query.value).split(/\s+/).filter(Boolean);
    const ordered = sort.value === 'name' ? [...cards].sort((a,b) => a.dataset.name.localeCompare(b.dataset.name,'pt-BR')) : cards;
    let matches = 0;
    for (const card of ordered) {
      const data = card.dataset;
      card.hidden = !terms.every(term => normalize(data.search).includes(term))
        || (filters.city && !filters.city.split(',').includes(normalize(data.city).replace(/\s+/g, '-')))
        || (filters.type && !filters.type.split(',').includes(data.public === 'true' ? 'publica' : 'particular'))
        || (filters.course && !filters.course.split(',').some(course => (data.courses || '').split(',').includes(course)))
        || (filters.area && !window.ToDentroCourseCatalog.courses.some(course => course.area === filters.area && (data.courses || '').split(',').includes(course.value)))
        || (filters.mode && !filters.mode.split(',').includes(data.mode))
        || (filters.admission && !filters.admission.split(',').some(method => (data.admission || '').split(',').includes(method)));
      if (!card.hidden) matches += 1;
      list.append(card);
    }
    count.textContent = matches === 1 ? '1 instituição encontrada' : `${matches} instituições encontradas`;
    document.querySelector('#search-empty').hidden = matches > 0;
    regionChip.textContent = filters.city ? filters.city.split(',').map(city => window.ToDentroData.source.general.cities.find(item => item.id === city)?.name || city).join(' e ') : 'Cidade';
    regionChip.setAttribute('aria-pressed', String(Boolean(filters.city)));
    typeChip.textContent = filters.type.includes(',') ? 'Públicas e particulares' : filters.type === 'particular' ? 'Particulares' : filters.type ? 'Públicas' : 'Tipo de instituição';
    typeChip.setAttribute('aria-pressed', String(Boolean(filters.type)));
    const state = new URLSearchParams({...filters, busca: query.value, sort: sort.value});
    filtersLink.href = `./filtros.html?${state}`;
    for (const card of cards) {
      const link = card.querySelector('a');
      if (!link) continue;
      const destination = new URL(link.href);
      destination.searchParams.set('from', `${location.pathname}?${state}`);
      link.href = destination.href;
    }
  }
  
  query.value = params.get('busca') || '';
  sort.value = params.get('sort') === 'name' ? 'name' : 'relevance';
  query.addEventListener('input', updateResults);
  sort.addEventListener('change', updateResults);
  document.querySelector('.university-search-form').addEventListener('submit', event => {event.preventDefault(); updateResults();});
  async function changeFilter(key, fallback, button) {
    const previous = filters[key];
    filters[key] = previous ? '' : fallback;
    regionChip.disabled = true; typeChip.disabled = true;
    try {
      if (connected) await shared.saveSearchPreferences(new URLSearchParams(filters), window.ToDentroData);
      updateResults();
    } catch (error) { filters[key] = previous; reportError(error); }
    finally { regionChip.disabled = false; typeChip.disabled = false; }
  }
  regionChip.addEventListener('click', () => changeFilter('city', 'sao-paulo', regionChip));
  typeChip.addEventListener('click', () => changeFilter('type', 'publica', typeChip));
  updateResults();
})();
