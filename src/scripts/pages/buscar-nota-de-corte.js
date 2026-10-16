(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const form = document.querySelector('#cutoff-form');
  const courseSelect = document.querySelector('#cutoff-course');
  const universitySelect = document.querySelector('#cutoff-university');
  const campusSelect = document.querySelector('#cutoff-campus');
  const processSelect = document.querySelector('#cutoff-process');
  const universities = window.ToDentroUniversities;
  const courses = window.ToDentroCourseCatalog.courses;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  function options(select, entries) { select.replaceChildren(...entries.map(([value, label]) => new Option(label, value))); }
  options(courseSelect, courses.map(course => [course.value, course.name]));
  function updateUniversities(preferred) {
    const previous = preferred || universitySelect.value;
    options(universitySelect, universities.filter(university => university.courses.some(name => normalize(name) === courseSelect.value)).map(university => [university.id, `${university.acronym} · ${university.name}`]));
    if ([...universitySelect.options].some(option => option.value === previous)) universitySelect.value = previous;
    updateContext();
  }
  function updateContext() {
    const university = universities.find(item => item.id === universitySelect.value);
    const computing = courseSelect.value === 'ciencia da computacao';
    const campuses = university?.id === 'usp' && computing ? [['butanta', 'São Paulo · Butantã'], ['sao-carlos', 'São Carlos'], ['ribeirao-preto', 'Ribeirão Preto']] : university ? [['consultar', `${university.city} · Conferir unidade`]] : [['', 'Nenhuma oferta disponível']];
    options(campusSelect, campuses);
    const processes = { usp: ['ENEM-USP', 'FUVEST'], unesp: ['Vestibular Unesp'], unicamp: ['Vestibular Unicamp', 'Enem-Unicamp'] };
    options(processSelect, (processes[university?.id] || []).map(value => [value, value]));
    form.querySelector('[type="submit"]').disabled = !university;
  }
  if (courses.some(item => item.value === params.get('curso'))) courseSelect.value = params.get('curso');
  updateUniversities(params.get('universidade'));
  for (const [name, value] of params) {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLSelectElement && [...field.options].some(option => option.value === value)) field.value = value;
  }
  const initialUniversity = universities.find(item => item.id === params.get('universidade'));
  const initialCourse = courses.find(item => item.value === params.get('curso'));
  if (initialUniversity && initialCourse && initialUniversity.courses.some(name => normalize(name) === initialCourse.value)) {
    document.querySelector('#cutoff-back').href = `./curso.html?${new URLSearchParams({ universidade: initialUniversity.id, curso: initialCourse.value })}`;
  }
  courseSelect.addEventListener('change', () => updateUniversities());
  universitySelect.addEventListener('change', updateContext);
  form.addEventListener('reset', () => {
    requestAnimationFrame(() => { courseSelect.selectedIndex = 0; updateUniversities(); history.replaceState(null, '', location.pathname); });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const state = new URLSearchParams(new FormData(form));
    location.href = `./nota-de-corte.html?${state}`;
  });
})();
