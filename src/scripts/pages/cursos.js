(async () => {
  'use strict';
  if (window.ToDentroCoursesReady) await window.ToDentroCoursesReady;
  if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady;
  const params = new URLSearchParams(location.search);
  const university = window.ToDentroUniversities.find(item => item.id === params.get('universidade'));
  if (!university) {
    document.querySelector('#courses-not-found').hidden = false;
    return;
  }
  const catalog = window.ToDentroCourseCatalog;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const courseIds = new Set(window.ToDentroData.getOfferings({ universityId: university.id }).map(item => item.courseId));
  const courses = catalog.courses.filter(course => courseIds.has(course.id));
  const back = new URL('./universidade.html', location.href);
  back.searchParams.set('id', university.id);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    if (from.origin === back.origin && from.pathname === back.pathname && from.searchParams.get('id') === university.id) back.search = from.search;
  }
  document.querySelector('#courses-back').href = back.href;
  document.title = `Cursos da ${university.acronym} | Tô Dentro`;
  document.querySelector('#courses-context').textContent = `${university.acronym} · ${university.name}`;
  const query = document.querySelector('#course-query');
  const list = document.querySelector('#course-list');
  const areaButtons = document.querySelector('#course-areas');
  let selectedArea = Object.hasOwn(catalog.areas, params.get('area')) ? params.get('area') : '';
  query.value = params.get('busca') || '';
  for (const [value, label] of [['', 'Todas as áreas'], ...Object.entries(catalog.areas)]) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'course-area'; button.textContent = label; button.dataset.area = value;
    button.addEventListener('click', () => { selectedArea = value; render(); });
    areaButtons.append(button);
  }
  function render() {
    const terms = normalize(query.value).split(/\s+/).filter(Boolean);
    const visible = courses.filter(course => (!selectedArea || course.area === selectedArea)
      && terms.every(term => normalize(`${course.name} ${catalog.areas[course.area]}`).includes(term)));
    list.replaceChildren();
    const state = new URLSearchParams(params);
    state.set('busca', query.value); state.set('area', selectedArea);
    for (const course of visible) {
      const card = document.createElement('article'); card.className = 'course-card';
      const title = document.createElement('h2'); title.textContent = course.name;
      const metadata = document.createElement('p'); metadata.textContent = `${catalog.areas[course.area]} · ${course.degree}`;
      const link = document.createElement('a'); link.className = 'button button-yellow'; link.textContent = 'Conhecer curso';
      link.setAttribute('aria-label', `Conhecer curso de ${course.name}`);
      const destination = new URL('./curso.html', location.href);
      destination.searchParams.set('universidade', university.id); destination.searchParams.set('curso', course.id);
      destination.searchParams.set('from', `${location.pathname}?${state}`); link.href = destination.href;
      card.append(title, metadata, link); list.append(card);
    }
    for (const button of areaButtons.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.area === selectedArea));
    document.querySelector('#courses-empty').hidden = visible.length > 0;
    document.querySelector('#courses-count').textContent = visible.length === 1 ? '1 curso encontrado' : `${visible.length} cursos encontrados`;
  }
  query.addEventListener('input', render);
  document.querySelector('#courses-search').addEventListener('submit', event => { event.preventDefault(); render(); });
  document.querySelector('#courses-content').hidden = false;
  render();
})();
