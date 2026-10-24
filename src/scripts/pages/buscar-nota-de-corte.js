(() => {
  'use strict';
  const data = window.ToDentroData;
  const params = new URLSearchParams(location.search);
  const form = document.querySelector('#cutoff-form');
  const courseSelect = document.querySelector('#cutoff-course');
  const universitySelect = document.querySelector('#cutoff-university');
  const campusSelect = document.querySelector('#cutoff-campus');
  const processSelect = document.querySelector('#cutoff-process');
  const courses = data.views.courseCatalog.courses.filter(course => data.getOfferings({ courseId: course.id }).length);
  const options = (select, entries) => select.replaceChildren(...entries.map(([value, label]) => new Option(label, value)));
  options(courseSelect, courses.map(course => [course.id, course.name]));
  function updateContext() {
    const university = data.getUniversity(universitySelect.value);
    const campusIds = new Set(data.getOfferings({ universityId: university?.id, courseId: courseSelect.value }).map(item => item.campusId));
    const campuses = university ? data.getCampuses(university.id).filter(item => campusIds.has(item.id)) : [];
    options(campusSelect, campuses.map(campus => [campus.id, campus.label]));
    options(processSelect, university ? data.getProcesses(university.id).map(process => [process.id, process.name]) : []);
    form.querySelector('[type="submit"]').disabled = !university || !campuses.length;
  }
  function updateUniversities(preferred = universitySelect.value) {
    const ids = new Set(data.getOfferings({ courseId: courseSelect.value }).map(item => item.universityId));
    options(universitySelect, data.views.universities.filter(item => ids.has(item.id)).map(item => [item.id, `${item.acronym} · ${item.name}`]));
    if (ids.has(preferred)) universitySelect.value = preferred;
    updateContext();
  }
  const initialCourse = data.getCourse(params.get('curso'));
  const initialUniversity = data.getUniversity(params.get('universidade'));
  if (initialCourse && courses.some(item => item.id === initialCourse.id)) courseSelect.value = initialCourse.id;
  updateUniversities(initialUniversity?.id);
  for (const name of ['edicao', 'modalidade', 'turno']) {
    const field = form.elements.namedItem(name);
    if ([...field.options].some(option => option.value === params.get(name))) field.value = params.get(name);
  }
  const campus = data.getCampus(universitySelect.value, params.get('campus'));
  if (campus && [...campusSelect.options].some(option => option.value === campus.id)) campusSelect.value = campus.id;
  const process = data.getProcess(universitySelect.value, params.get('processo'));
  if (process) processSelect.value = process.id;
  if (initialUniversity && initialCourse && data.getOfferings({ universityId: initialUniversity.id, courseId: initialCourse.id }).length) {
    document.querySelector('#cutoff-back').href = `./curso.html?${new URLSearchParams({ universidade: initialUniversity.id, curso: initialCourse.id })}`;
  }
  courseSelect.addEventListener('change', () => updateUniversities());
  universitySelect.addEventListener('change', updateContext);
  form.addEventListener('reset', () => requestAnimationFrame(() => {
    courseSelect.selectedIndex = 0;
    updateUniversities();
    history.replaceState(null, '', location.pathname);
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (form.reportValidity()) location.href = `./nota-de-corte.html?${new URLSearchParams(new FormData(form))}`;
  });
})();
