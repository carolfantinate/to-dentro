(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const query = document.querySelector('#university-query');
  const list = document.querySelector('.university-results-list');
  const cards = [...list.querySelectorAll('td-university-card')];
  const count = document.querySelector('#results-count');
  const sort = document.querySelector('#sort-universities');
  const regionChip = document.querySelector('[data-filter="sp"]');
  const typeChip = document.querySelector('[data-filter="public"]');
  const filtersLink = document.querySelector('#open-filters');
  const filters = {
    region: params.get('region') ?? 'sp', type: params.get('type') ?? 'publica',
    course: params.get('course') || '', mode: params.get('mode') || '',
    period: params.get('period') || '', cost: params.get('cost') || '',
  };
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  function updateResults() {
    const terms = normalize(query.value).split(/\s+/).filter(Boolean);
    const ordered = sort.value === 'name' ? [...cards].sort((a,b) => a.dataset.name.localeCompare(b.dataset.name,'pt-BR')) : cards;
    let matches = 0;
    for (const card of ordered) {
      const data = card.dataset;
      card.hidden = !terms.every(term => normalize(data.search).includes(term))
        || (filters.region === 'sp' && data.state !== 'SP')
        || (filters.region === 'campinas' && data.city !== 'Campinas')
        || (filters.type === 'publica' && data.public !== 'true')
        || (filters.type === 'particular' && data.public !== 'false')
        || (filters.course && !(data.courses || '').split(',').includes(filters.course))
        || (filters.mode && data.mode !== filters.mode)
        || (filters.period && !(data.period || '').split(',').includes(filters.period))
        || (filters.cost === 'gratuita' && data.free !== 'true')
        || (filters.cost === 'mensalidade' && data.free !== 'false');
      if (!card.hidden) matches += 1;
      list.append(card);
    }
    count.textContent = matches === 1 ? '1 instituição encontrada' : `${matches} instituições encontradas`;
    document.querySelector('#search-empty').hidden = matches > 0;
    regionChip.textContent = filters.region === 'campinas' ? 'Campinas' : 'São Paulo';
    regionChip.setAttribute('aria-pressed', String(Boolean(filters.region)));
    typeChip.textContent = filters.type === 'particular' ? 'Particulares' : 'Públicas';
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
  regionChip.addEventListener('click', () => {filters.region = filters.region ? '' : 'sp'; updateResults();});
  typeChip.addEventListener('click', () => {filters.type = filters.type ? '' : 'publica'; updateResults();});
  updateResults();
})();
