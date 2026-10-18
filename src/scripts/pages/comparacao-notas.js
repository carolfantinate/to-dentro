(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const course = window.ToDentroCourseCatalog.courses.find(item => item.value === params.get('curso'));
  const selection = window.ToDentroComparison.readSelection(params);
  const set = (id, value) => { document.getElementById(id).textContent = value; };
  const edit = `./filtros-comparacao.html?${params}`;
  document.getElementById('results-back').href = edit;
  if (!course || selection.length < 2) {
    document.getElementById('results-empty').hidden = false;
    return;
  }
  const state = new URLSearchParams({ curso: course.value });
  const allowed = { processo: ['enem', 'vestibular'], edicao: ['2026', '2025', '2024'], modalidade: ['Ampla concorrência', 'Escola pública', 'Pretos, pardos e indígenas'], turno: ['Integral', 'Matutino', 'Vespertino', 'Noturno'] };
  for (const [key, values] of Object.entries(allowed)) state.set(key, values.includes(params.get(key)) ? params.get(key) : values[0]);
  selection.forEach(item => state.append('opcao', `${item.id}:${item.index}`));
  const filtersUrl = `./filtros-comparacao.html?${state}`;
  for (const id of ['results-back', 'results-add', 'results-edit']) document.getElementById(id).href = filtersUrl;
  set('results-subtitle', `${course.name} · Exemplo demonstrativo`);
  document.title = `Comparar notas · ${course.name} | Tô Dentro`;
  set('results-process', `${state.get('processo') === 'enem' ? 'Enem' : 'Vestibular próprio'} · ${state.get('edicao')}`);
  set('results-context', `${state.get('modalidade')} · ${state.get('turno')}`);
  const format = number => number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  set('results-count', selection.length);
  set('results-range', format(Math.max(...selection.map(item => item.score)) - Math.min(...selection.map(item => item.score))));
  document.getElementById('results-chart').setAttribute('aria-label', `Notas simuladas, escala de 0 a 1000 pontos: ${selection.map(item => `${item.university.acronym}: ${format(item.score)}`).join('; ')}.`);
  const bankIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 7 10-5 10 5H2ZM4 20h16M2 22h20M5 9v9m5-9v9m4-9v9m5-9v9"/></svg>';
  selection.forEach((item, index) => {
    const color = ['blue', 'green', 'yellow'][index % 3];
    const column = document.createElement('div'); column.className = 'chart-column';
    column.innerHTML = `<div class="bar-track"><div class="bar ${color}"><strong></strong></div></div><span></span>`;
    column.querySelector('.bar').style.height = `${item.score / 10}%`;
    column.querySelector('strong').textContent = format(item.score);
    column.querySelector('span').textContent = item.university.acronym;
    document.getElementById('results-bars').append(column);
    const card = document.createElement('article'); card.className = 'option-card';
    card.innerHTML = `<div class="option-top"><span class="result-icon ${color}">${bankIcon}</span><h3></h3><div class="option-score"><small>Nota simulada</small><strong></strong></div></div><p class="option-location"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span></span></p><p class="option-mode"></p><div class="option-links"><a class="know-course">Conhecer curso →</a><a class="official" target="_blank" rel="noopener noreferrer">Site oficial ↗</a></div>`;
    card.querySelector('h3').textContent = item.university.acronym;
    card.querySelector('.option-score strong').textContent = format(item.score);
    card.querySelector('.option-location span').textContent = `${item.campuses[item.index]} · SP`;
    card.querySelector('.option-mode').textContent = `${state.get('turno')} · Presencial · Oferta simulada`;
    const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const available = item.university.courses.some(name => normalize(name) === course.value);
    const courseLink = card.querySelector('.know-course');
    courseLink.href = available ? `./curso.html?${new URLSearchParams({ universidade: item.id, curso: course.value })}` : `./cursos.html?${new URLSearchParams({ universidade: item.id })}`;
    if (!available) courseLink.textContent = 'Explorar cursos →';
    card.querySelector('.official').href = item.site;
    document.getElementById('results-options').append(card);
  });
  const storageKey = 'to-dentro-saved-comparisons';
  const identity = state.toString();
  const save = document.getElementById('results-save');
  function readSaved() {
    try { const value = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []; } catch { return []; }
  }
  let saved = readSaved();
  function updateSave() { const exists = window.ToDentroAuth.isAuthenticated() && saved.includes(identity); save.setAttribute('aria-pressed', String(exists)); set('results-save-label', exists ? 'Comparação salva' : 'Salvar comparação'); }
  save.addEventListener('click', () => {
    if (!window.ToDentroAuth.requireLogin('Entre para salvar esta comparação.')) return;
    saved = readSaved();
    if (saved.includes(identity)) { set('results-status', 'Esta comparação já está salva neste navegador.'); updateSave(); return; }
    try { localStorage.setItem(storageKey, JSON.stringify([...saved, identity])); saved.push(identity); updateSave(); set('results-status', 'Comparação salva! Acesse pela aba Salvos.'); }
    catch { set('results-status', 'Não foi possível salvar neste navegador. Tente novamente.'); }
  });
  updateSave();
  document.getElementById('results-content').hidden = false;
})();
