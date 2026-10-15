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
  const coursesUrl = new URL('./cursos.html', location.href);
  coursesUrl.searchParams.set('universidade', university.id);
  coursesUrl.searchParams.set('from', location.pathname + location.search);
  document.querySelector('#university-courses-link').href = coursesUrl.href;
  const opportunitiesUrl = new URL('./oportunidades.html', location.href);
  opportunitiesUrl.searchParams.set('universidade', university.id);
  opportunitiesUrl.searchParams.set('from', location.pathname + location.search);
  document.querySelector('#university-opportunities-link').href = opportunitiesUrl.href;
  const communityUrl = new URL('./comunidade.html', location.href);
  communityUrl.searchParams.set('universidade', university.id);
  communityUrl.searchParams.set('from', location.pathname + location.search);
  document.querySelector('#university-community').href = communityUrl.href;
  const calendarUrl = new URL('./calendario.html', location.href);
  calendarUrl.searchParams.set('from', location.pathname + location.search);
  calendarUrl.searchParams.set('universidade', university.id);
  document.querySelector('#university-calendar').href = calendarUrl.href;
  const values = {
    'university-name': university.name,
    'university-location': `${university.acronym} · ${university.public ? 'Pública' : 'Particular'} · Vários campi`,
    'university-admission': university.admission,
  };
  for (const [id, text] of Object.entries(values)) document.getElementById(id).textContent = text;
  const official = {
    usp: ['https://www.usp.br/', 'https://www.fuvest.br/'],
    unesp: ['https://www.unesp.br/', 'https://www.unesp.br/vestibular'],
    unicamp: ['https://www.unicamp.br/', 'https://www.unicamp.br/estude-na-unicamp/'],
  }[university.id];
  document.querySelector('#university-official-site').href = official[0];
  document.querySelector('#university-selection-site').href = official[1];
  document.querySelector('#university-admission-link').href = official[1];
  const gallery = document.querySelector('#university-gallery-track');
  const photos = university.photos || [];
  for (const photo of photos) {
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.alt;
    image.width = 900;
    image.height = 370;
    image.addEventListener('error', () => {
      image.replaceWith(Object.assign(document.createElement('p'), { className: 'gallery-placeholder', textContent: 'Imagem indisponível no momento.' }));
    });
    gallery.append(image);
  }
  if (!photos.length) {
    const placeholder = document.createElement('p');
    placeholder.className = 'gallery-placeholder';
    placeholder.textContent = `Fotos da ${university.acronym} em breve`;
    gallery.append(placeholder);
  }
  document.querySelector('#university-photo-credit').textContent = photos.map(photo => photo.credit).filter(Boolean).join(' · ');
  for (const button of document.querySelectorAll('[data-detail]')) {
    button.addEventListener('click', () => document.getElementById(button.dataset.detail).showModal());
  }
  document.querySelector('#university-content').hidden = false;
  const saveButton = document.querySelector('#save-university');
  saveButton.hidden = false;
  function updateSaved() {
    const saved = window.ToDentroSaved.getUniversities().includes(university.id);
    saveButton.setAttribute('aria-pressed', String(saved));
    const label = saved ? 'Remover universidade dos salvos' : 'Salvar universidade';
    saveButton.setAttribute('aria-label', label);
    saveButton.title = label;
  }
  saveButton.addEventListener('click', () => {
    const result = window.ToDentroSaved.toggleUniversity(university.id);
    updateSaved();
    const status = document.querySelector('#save-status');
    status.classList.toggle('visually-hidden', result.persisted);
    status.textContent = !result.persisted ? 'O navegador não permitiu guardar a alteração. Ela vale apenas nesta página.'
      : result.saved ? 'Universidade salva nas suas escolhas.' : 'Universidade removida das suas escolhas.';
  });
  updateSaved();
})();
