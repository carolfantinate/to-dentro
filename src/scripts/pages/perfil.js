(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  document.querySelector('a[href="./salvos.html?from=perfil"] .profile-count').textContent = window.ToDentroSaved.getUniversities().length;
  document.querySelector('a[href="./salvos.html?categoria=cursos&from=perfil"] .profile-count').textContent = '0';
  const key = 'to-dentro-preferences';
  const preferences = { region: 'sp', course: 'medicina', type: 'publica', mode: 'presencial', period: 'integral', cost: 'gratuita' };
  const labels = {
    region: { sp: 'São Paulo • SP', campinas: 'Campinas', '': 'Todas as regiões' },
    course: { medicina: 'Medicina', '': 'Todos os cursos' },
    type: { publica: 'Pública', particular: 'Particular', '': 'Todas' },
    mode: { presencial: 'Presencial', ead: 'EAD', '': 'Todas' },
    period: { integral: 'Integral', noturno: 'Noturno', '': 'Todos' },
    cost: { gratuita: 'Gratuita', mensalidade: 'Com mensalidade', '': 'Todos' },
  };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { /* Perfil funciona mesmo sem armazenamento local. */ }
  for (const name of Object.keys(preferences)) {
    const value = params.has(name) ? params.get(name) : saved[name];
    if (Object.hasOwn(labels[name], value)) preferences[name] = value;
  }
  if (params.get('return') === 'perfil') {
    try { localStorage.setItem(key, JSON.stringify(preferences)); } catch { /* Manter as escolhas na URL se armazenamento estiver indisponível. */ }
  }
  for (const name of ['region', 'course', 'mode', 'period']) document.querySelector(`#profile-${name}`).textContent = labels[name][preferences[name]];
  const filters = new URLSearchParams({ ...preferences, return: 'perfil' });
  document.querySelector('#edit-preferences').href = `./filtros.html?${filters}`;
})();
