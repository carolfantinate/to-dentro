(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const form = document.querySelector('#preferences-form');
  const courseSelect = document.querySelector('#course-choice');
  const areaSelect = document.querySelector('#course-area');
  const catalog = window.ToDentroCourseCatalog;
  for (const [value, label] of Object.entries(catalog.areas)) {
    areaSelect.append(new Option(label, value));
  }
  areaSelect.value = Object.hasOwn(catalog.areas, params.get('area')) ? params.get('area') : '';
  function updateCourses(selected = courseSelect.value) {
    const courses = catalog.courses.filter(course => !areaSelect.value || course.area === areaSelect.value);
    courseSelect.replaceChildren(new Option(areaSelect.value ? 'Todos os cursos da área' : 'Todos os cursos', ''));
    for (const course of courses) courseSelect.append(new Option(course.name, course.value));
    courseSelect.value = courses.some(course => course.value === selected) ? selected : '';
  }
  updateCourses(params.get('course') || '');
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
  form.addEventListener('submit', () => {
    for (const input of form.querySelectorAll('input[type="hidden"]')) {
      if (form.querySelector(`input[name="${input.name}"]:checked`)) input.remove();
    }
    for (const name of ['city', 'type', 'mode', 'admission']) {
      if (!form.querySelector(`input[name="${name}"]:checked`) && !form.querySelector(`input[type="hidden"][name="${name}"]`)) {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = name; input.value = ''; form.append(input);
      }
    }
  });
})();
