(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const university = window.ToDentroUniversities.find(item => item.id === params.get('universidade'));
  const catalog = window.ToDentroCourseCatalog;
  const course = catalog.courses.find(item => item.value === params.get('curso'));

  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(

  );
  if (!university || !course || !university.courses.some(name => normalize(name) === course.value)) {
    document.querySelector('#course-not-found').hidden = false;
    return;
  }

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
  document.querySelector('#course-metadata').textContent = `${catalog.areas[course.area]} · ${course.degree}`;
  document.querySelector('#course-official').href = {
    usp: 'https://www.usp.br/',
    unesp: 'https://www.unesp.br/',
    unicamp: 'https://www.unicamp.br/',
  }[university.id];
  document.querySelector('#course-content').hidden = false;
})();
