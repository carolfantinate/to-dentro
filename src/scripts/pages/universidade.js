(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const university = window.ToDentroUniversities.find(item => item.id === params.get('id'));
  // Permitir retorno apenas às telas locais conhecidas, preservando a busca.
  const from = params.get('from');
  if (from) {
    const destination = new URL(from, location.href);
    const allowed = [new URL('../../index.html', location.href), new URL('./buscar-universidades.html', location.href), new URL('./mapa.html', location.href), new URL('./salvos.html', location.href)];
    if (allowed.some(url => destination.protocol === url.protocol && destination.host === url.host && destination.pathname === url.pathname)) {
      document.querySelector('#university-back').href = destination.href;
    }
  }
  if (!university) {
    document.querySelector('#university-not-found').hidden = false;
    return;
  }
  document.title = `${university.acronym} | Tô Dentro`;
  const communityUrl = new URL('./comunidade.html', location.href);
  communityUrl.searchParams.set('universidade', university.id);
  communityUrl.searchParams.set('from', location.pathname + location.search);
  document.querySelector('#university-community').href = communityUrl.href;
  const calendarUrl = new URL('./calendario.html', location.href);
  calendarUrl.searchParams.set('from', location.pathname + location.search);
  calendarUrl.searchParams.set('universidade', university.id);
  document.querySelector('#university-calendar').href = calendarUrl.href;
  const values = {
    'university-acronym': university.acronym, 'university-name': university.name,
    'university-location': `${university.city} • ${university.public ? 'Pública' : 'Particular'}`,
    'university-description': university.description, 'university-admission': university.admission,
  };
  for (const [id, text] of Object.entries(values)) document.getElementById(id).textContent = text;
  const courses = document.querySelector('#university-courses');
  for (const course of university.courses) {
    const tag = document.createElement('li'); tag.className = 'tag tag-blue'; tag.textContent = course; courses.append(tag);
  }
  document.querySelector('#university-content').hidden = false;
  const saveButton = document.querySelector('#save-university');
  function updateSaved() {
    const saved = window.ToDentroSaved.getUniversities().includes(university.id);
    saveButton.setAttribute('aria-pressed', String(saved));
    saveButton.textContent = saved ? '✓ Universidade salva • Remover' : '♡ Salvar universidade';
  }
  saveButton.addEventListener('click', () => {
    const result = window.ToDentroSaved.toggleUniversity(university.id);
    updateSaved();
    const status = document.querySelector('#save-status'); status.hidden = false;
    status.textContent = !result.persisted ? 'O navegador não permitiu guardar a alteração. Ela vale apenas nesta página.'
      : result.saved ? 'Universidade salva nas suas escolhas.' : 'Universidade removida das suas escolhas.';
    document.querySelector('#view-saved').href = result.saved ? `./salvos.html?saved=${university.id}` : './salvos.html';
  });
  updateSaved();
})();
