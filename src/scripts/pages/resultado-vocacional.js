(async () => {
  'use strict';
  await window.ToDentroAuth.ready;
  if (window.ToDentroAuth.isRestrictedPage()) return;
  const key = window.ToDentroAuth.storageKey('to-dentro-interest-map');
  const button = document.querySelector('#save-interest-map');
  const status = document.querySelector('#result-status');
  // Perfil fixo do protótipo; não é calculado a partir das respostas do quiz.
  const map = window.ToDentroData.source.general.vocationalProfiles.find(item => item.id === 'cuidar-e-descobrir');
  function showSaved() {
    button.textContent = 'Mapa de interesses salvo';
    status.textContent = 'Seu mapa demonstrativo está salvo neste navegador.';
    status.hidden = false;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved?.version === map.version && saved?.demonstrative === true && saved?.profile === map.profile) showSaved();
  } catch { /* A tela funciona mesmo sem armazenamento disponível. */ }
  button.addEventListener('click', () => {
    try {
      localStorage.setItem(key, JSON.stringify(map));
      showSaved();
    } catch {
      status.textContent = 'Não foi possível salvar neste navegador. Tente novamente.';
      status.hidden = false;
    }
  });
})();
