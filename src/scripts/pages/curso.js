(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const university = window.ToDentroUniversities.find(item => item.id === params.get('universidade'));
  const course = window.ToDentroCourseCatalog.courses.find(item => item.value === params.get('curso'));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (!university || !course || !university.courses.some(name => normalize(name) === course.value)) {
    document.querySelector('#course-not-found').hidden = false;
    return;
  }
  const paths = {
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',
    university: '<path d="m2 7 10-5 10 5H2Zm2 13h16M2 22h20M5 9v9m5-9v9m4-9v9m5-9v9"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 5v7l5 3"/>',
    document: '<path d="M5 2h9l5 5v15H5V2Zm9 0v6h5M8 12h8m-8 4h8"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
    chart: '<path d="M3 3v18h19M6 15l5-6 5 3 6-9"/>',
    screen: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v5m-6 0h12"/>',
    science: '<path d="M8 2h8m-6 0v8L4 20q-1 2 2 2h12q3 0 2-2l-6-10V2M7 16h10"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.document}</svg>`;
  const back = new URL('./cursos.html', location.href);
  back.searchParams.set('universidade', university.id);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    if (from.origin === back.origin && from.pathname === back.pathname && from.searchParams.get('universidade') === university.id) back.search = from.search;
  }
  document.querySelector('#course-back').href = back.href;
  document.title = `${course.name} · ${university.acronym} | Tô Dentro`;
  document.querySelector('#course-name').textContent = course.name;
  document.querySelector('#course-university').textContent = `${university.acronym} · ${university.name}`;
  const computing = course.value === 'ciencia da computacao';
  document.querySelector('#course-intro-title').textContent = computing ? 'Tecnologia que transforma' : 'Conhecimento que transforma';
  document.querySelector('#course-description').textContent = computing ? 'Da lógica à criação de soluções digitais: conheça possibilidades na computação.' : `Explore a formação em ${course.name} e conheça as possibilidades dessa área.`;
  const overview = [
    ['university', computing ? 'Bacharelado' : course.degree, 'Formação de graduação.', 'blue'],
    ['pin', 'Presencial', 'Atividades no campus.', 'green'],
    ['clock', computing && university.id === 'usp' ? 'Integral' : 'Turno', 'Confira a oferta da unidade.', 'yellow'],
    ['document', 'Duração', 'Varia conforme o campus.', 'blue']
  ];
  if (!(computing && university.id === 'usp')) overview[1] = ['pin', 'Modalidade', 'Confira a oferta da unidade.', 'green'];
  for (const [symbol, title, description, color] of overview) {
    const card = document.createElement('article'); card.className = color;
    card.innerHTML = `${icon(symbol)}<h3></h3><p></p>`;
    card.querySelector('h3').textContent = title; card.querySelector('p').textContent = description;
    document.querySelector('#course-overview').append(card);
  }
  function renderItems(target, items) {
    for (const [symbol, title, color] of items) {
      const card = document.createElement('article'); card.className = 'course-panel';
      card.innerHTML = `<span class="course-icon ${color}">${icon(symbol)}</span><strong></strong>`;
      card.querySelector('strong').textContent = title; document.querySelector(target).append(card);
    }
  }
  renderItems('#course-subjects', computing ? [['code','Programação','blue'],['chip','Algoritmos','green'],['chart','Dados e IA','yellow'],['screen','Sistemas','blue']] : [['document','Fundamentos da área','blue'],['science','Pesquisa','green'],['chart','Práticas e projetos','yellow'],['university','Formação acadêmica','blue']]);
  renderItems('#course-careers', computing ? [['screen','Tecnologia e software','blue'],['chart','Dados e inteligência artificial','yellow'],['science','Pesquisa e inovação','green']] : [['document','Atuação profissional','blue'],['university','Ensino e formação','yellow'],['science','Pesquisa e inovação','green']]);
  const official = { usp:'https://www5.usp.br/ensino/graduacao/cursos-oferecidos/', unesp:'https://www.unesp.br/', unicamp:'https://www.unicamp.br/' }[university.id];
  const campuses = computing && university.id === 'usp' ? [
    ['São Paulo · Butantã','IME','Ciência da Computação','https://www.ime.usp.br/bcc/'],
    ['São Carlos','ICMC','Ciências de Computação · 5 anos','https://www.icmc.usp.br/graduacao/ciencias-de-computacao-bacharelado'],
    ['Ribeirão Preto','FFCLRP','Ciência da Computação · 4 anos','https://www.ffclrp.usp.br/']
  ] : [[university.city, university.acronym, 'Confira a oferta e as unidades no catálogo oficial.', official]];
  for (const [city, unit, description, href] of campuses) {
    const card = document.createElement('article'); card.className = 'course-panel';
    card.innerHTML = `<div class="course-campus-heading"><span class="course-icon blue">${icon('pin')}</span><div><h3></h3><small></small></div></div><p></p><a target="_blank" rel="noopener noreferrer">Ver detalhes da unidade ↗</a>`;
    card.querySelector('h3').textContent = city; card.querySelector('small').textContent = unit;
    card.querySelector('p').textContent = description; card.querySelector('a').href = href;
    document.querySelector('#course-campuses').append(card);
  }
  document.querySelector('#course-official').href = official;
  document.querySelector('#course-official-title').textContent = `Conheça o curso na ${university.acronym}`;
  document.querySelector('#course-cutoff-link').href = `./buscar-nota-de-corte.html?${new URLSearchParams({ universidade: university.id, curso: course.value })}`;
  for (const element of document.querySelectorAll('[data-icon]')) element.innerHTML = icon(element.dataset.icon);
  const save = document.querySelector('#course-save');
  const key = 'to-dentro-saved-courses';
  const id = `${university.id}:${course.value}`;
  let saved = [];
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(value)) saved = value.filter(item => typeof item === 'string'); } catch { /* Armazenamento indisponível. */ }
  function updateSave() { const active = saved.includes(id); save.setAttribute('aria-pressed', String(active)); save.setAttribute('aria-label', active ? 'Remover curso dos salvos' : 'Salvar curso'); }
  save.addEventListener('click', () => {
    saved = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
    let persisted = true;
    try { localStorage.setItem(key, JSON.stringify(saved)); } catch { persisted = false; }
    updateSave();
    document.querySelector('#course-status').textContent = persisted ? (saved.includes(id) ? 'Curso salvo!' : 'Curso removido dos salvos.') : 'Alteração válida apenas nesta visita; não foi possível salvar no navegador.';
  });
  updateSave(); save.hidden = false;
  document.querySelector('#course-content').hidden = false;
})();
