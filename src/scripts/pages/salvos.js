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
        const card = document.createElement('td-university-card'); card.setAttribute('university-id', id); list.append(card);
      }
    }
    empty.hidden = list.children.length > 0;
    empty.textContent = category === 'universidades' ? 'Nenhuma universidade salva. Explore instituições para começar.'
      : category === 'cursos' ? 'Você ainda não tem cursos salvos. Essa função estará disponível em breve.'
      : 'Você ainda não tem datas salvas. Explore os prazos no calendário.';
    explore.href = category === 'datas' ? './calendario.html?from=./salvos.html?categoria=datas' : './buscar-universidades.html';
    explore.textContent = category === 'datas' ? 'Explorar calendário' : 'Explorar mais instituições';
    for (const button of categories) button.setAttribute('aria-pressed', String(button.dataset.category === category));
  }
  for (const button of categories) button.addEventListener('click', () => render(button.dataset.category));
  render(['universidades', 'cursos', 'datas'].includes(params.get('categoria')) ? params.get('categoria') : 'universidades');
})();
