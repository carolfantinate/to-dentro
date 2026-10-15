(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const list = document.querySelector('#saved-list');
  const empty = document.querySelector('#saved-empty');
  const explore = document.querySelector('#saved-explore');
  const categories = [...document.querySelectorAll('[data-category]')];
  const ids = window.ToDentroSaved.getUniversities();
  if (params.get('from') === 'perfil') document.querySelector('#saved-back').href = './perfil.html';
  if (ids.includes(params.get('saved'))) document.querySelector('#saved-message-title').textContent = '✓ Universidade salva!';
  function render(category) {
    list.replaceChildren();
    if (category === 'universidades') {
      for (const id of window.ToDentroSaved.getUniversities()) {
        const card = document.createElement('td-university-card'); card.setAttribute('university-id', id); card.setAttribute('variant', 'saved'); list.append(card);
      }
    }
    if (category === 'cursos') {
      let saved = [];
      try { const value = JSON.parse(localStorage.getItem('to-dentro-saved-courses') || '[]'); if (Array.isArray(value)) saved = value; } catch { /* Armazenamento indisponível. */ }
      for (const id of saved) {
        if (typeof id !== 'string') continue;
        const [universityId, courseId] = id.split(':');
        const university = window.ToDentroUniversities.find(item => item.id === universityId);
        const course = window.ToDentroCourseCatalog.courses.find(item => item.value === courseId);
        if (!university || !course) continue;
        const card = document.createElement('article'); card.className = 'course-card';
        const title = document.createElement('h2'); title.textContent = course.name;
        const context = document.createElement('p'); context.textContent = university.acronym;
        const link = document.createElement('a'); link.className = 'button button-yellow'; link.textContent = 'Conhecer curso';
        link.href = `./curso.html?${new URLSearchParams({ universidade: universityId, curso: courseId })}`;
        card.append(title, context, link); list.append(card);
      }
    }
    empty.hidden = list.children.length > 0;
    empty.textContent = category === 'universidades' ? 'Nenhuma universidade salva. Explore instituições para começar.'
      : 'Você ainda não tem cursos salvos. Toque no coração na página de um curso para guardar sua escolha.';
    explore.href = './buscar-universidades.html';
    explore.textContent = 'Explorar mais instituições';
    for (const button of categories) button.setAttribute('aria-pressed', String(button.dataset.category === category));
  }
  for (const button of categories) button.addEventListener('click', () => render(button.dataset.category));
  render(['universidades', 'cursos'].includes(params.get('categoria')) ? params.get('categoria') : 'universidades');
})();
