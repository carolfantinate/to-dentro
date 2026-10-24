(async () => {
  'use strict';
  if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady;
  const params = new URLSearchParams(location.search);
  const universities = window.ToDentroUniversities;
  const entries = window.ToDentroOpportunities;
  const query = document.querySelector('#opportunities-university');
  const list = document.querySelector('#opportunity-list');
  const dialog = document.querySelector('#opportunity-dialog');

  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const sites = Object.fromEntries(universities.map(item => [item.id, item.website]));
  let category = entries.some(entry => entry.category === params.get('categoria')) ? params.get('categoria') : '';
  const selected = universities.find(item => item.id === params.get('universidade'));
  query.value = params.get('busca') || selected?.acronym || '';
  
  for (const university of universities) {
    const option = document.createElement('option'); option.value = university.acronym; option.label = university.name;
    document.querySelector('#opportunities-universities').append(option);
  }
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    const allowed = ['../../index.html', './universidade.html', './comunidade.html'].map(path => new URL(path, location.href));
    if (allowed.some(url => url.origin === from.origin && url.pathname === from.pathname)) document.querySelector('#opportunities-back').href = from.href;
  }
  function matches() {
    const terms = normalize(query.value).split(/\s+/).filter(Boolean);
    return universities.filter(university => terms.every(term => normalize(`${university.acronym} ${university.name} ${university.city}`).includes(term)));
  }
  function showDetails(entry) {
    document.querySelector('#opportunity-title').textContent = entry.title;
    document.querySelector('#opportunity-description').textContent = entry.detail;
    document.querySelector('#opportunity-context').textContent = 'Conheça a modalidade. Vagas, critérios e prazos devem ser consultados nos canais da instituição.';
    const links = document.querySelector('#opportunity-sites'); links.replaceChildren();
    for (const university of matches()) {
      const link = document.createElement('a'); link.href = sites[university.id]; link.textContent = `Consultar ${university.acronym}`; links.append(link);
    }
    dialog.showModal();
  }
  function render() {
    list.replaceChildren();
    const visible = matches().length ? entries.filter(entry => !category || entry.category === category) : [];
    for (const entry of visible) {
      const card = document.createElement('button'); card.type = 'button'; card.className = 'opportunity-card';
      const title = document.createElement('span'); title.className = 'opportunity-card-title'; title.textContent = entry.title;
      const summary = document.createElement('span'); summary.className = 'opportunity-card-summary'; summary.textContent = entry.summary;
      const action = document.createElement('span'); action.className = 'button button-yellow'; action.textContent = entry.action;
      card.append(title, summary, action); card.addEventListener('click', () => showDetails(entry)); list.append(card);
    }
    document.querySelector('#opportunities-empty').hidden = visible.length > 0;
    document.querySelector('#opportunities-count').textContent = `${visible.length} modalidades de oportunidades encontradas`;
    for (const button of document.querySelectorAll('[data-category]')) button.setAttribute('aria-pressed', String(button.dataset.category === category));
  }
  query.addEventListener('input', render);
  document.querySelector('#opportunities-search').addEventListener('submit', event => { event.preventDefault(); render(); });
  for (const button of document.querySelectorAll('[data-category]')) button.addEventListener('click', () => { category = button.dataset.category; render(); });
  render();
})();
