(async () => {
  'use strict';
  if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady;

  const searchForm = document.querySelector('.home-search');
  const searchInput = document.querySelector('#university-search');
  const cards = document.querySelectorAll('[data-university]');
  const emptyMessage = document.querySelector('.search-empty');
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  function filterUniversities() {
    const query = normalize(searchInput.value);
    let matches = 0;
    for (const card of cards) {
      card.hidden = !normalize(card.dataset.university).includes(query);
      if (!card.hidden) matches += 1;
    }
    emptyMessage.hidden = matches > 0;
  }

  searchInput.addEventListener('input', filterUniversities);
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    filterUniversities();
    document.querySelector('#universidades').scrollIntoView();
  });

  const dialog = document.querySelector('.upcoming-dialog');
  for (const button of document.querySelectorAll('[data-upcoming]')) {
    button.addEventListener('click', () => {
      dialog.querySelector('h2').textContent = button.dataset.upcoming;
      dialog.showModal();
    });
  }
})();
