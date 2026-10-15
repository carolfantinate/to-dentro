(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  document.querySelector('a[href="./salvos.html?from=perfil"] .profile-count').textContent = window.ToDentroSaved.getUniversities().length;
  document.querySelector('a[href="./salvos.html?categoria=cursos&from=perfil"] .profile-count').textContent = '0';
  const key = 'to-dentro-preferences';
  const preferences = { city: 'sao-paulo', course: 'medicina', area: '', type: 'publica', mode: 'presencial', admission: '' };
  const labels = {
    city: { 'sao-paulo': 'São Paulo', campinas: 'Campinas', '': 'Todas as cidades' },
    course: { ...Object.fromEntries(window.ToDentroCourseCatalog.courses.map(course => [course.value, course.name])), '': 'Todos os cursos' },
    area: { ...window.ToDentroCourseCatalog.areas, '': 'Todas as áreas' },
    type: { publica: 'Pública', particular: 'Particular', '': 'Todas' },
    mode: { presencial: 'Presencial', ead: 'EAD', hibrida: 'Híbrida', '': 'Todas' },
    admission: { sisu: 'Sisu', enem: 'Enem', prouni: 'ProUni', vestibular: 'Vestibular próprio', '': 'Todas' },
  };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { /* Perfil funciona mesmo sem armazenamento local. */ }
  if (!saved.city && saved.region) saved.city = saved.region === 'sp' ? 'sao-paulo' : saved.region;
  if (!params.has('city') && params.has('region')) params.set('city', params.get('region') === 'sp' ? 'sao-paulo' : params.get('region'));
  for (const name of Object.keys(preferences)) {
    const value = params.has(name) ? params.getAll(name).join(',') : saved[name];
    if (typeof value === 'string' && value.split(',').every(item => Object.hasOwn(labels[name], item))) preferences[name] = value;
  }
  if (params.get('return') === 'perfil') {
    try { localStorage.setItem(key, JSON.stringify(preferences)); } catch { /* Manter as escolhas na URL se armazenamento estiver indisponível. */ }
  }
  for (const name of Object.keys(preferences)) document.querySelector(`#profile-${name}`).textContent = preferences[name].split(',').map(value => labels[name][value]).join(', ');
  const filters = new URLSearchParams({ ...preferences, return: 'perfil' });
  document.querySelector('#edit-preferences').href = `./filtros.html?${filters}`;
})();
