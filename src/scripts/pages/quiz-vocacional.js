(() => {
  'use strict';

  const storageKey = 'to-dentro-quiz-atividades';
  if (new URLSearchParams(location.search).get('reiniciar') === '1') {
    try { sessionStorage.removeItem(storageKey); } catch { /* Reinicia os campos mesmo sem armazenamento. */ }
    history.replaceState(null, '', location.pathname);
  }
  const form = document.querySelector('#quiz-form');
  const options = [...form.querySelectorAll('input[name="atividades"]')];
  const error = document.querySelector('#quiz-error');
  const progress = document.querySelector('.quiz-progress');
  const dialog = document.querySelector('.quiz-dialog');
  const selectedValues = () => options.filter((option) => option.checked).map((option) => option.value);

  function updateProgress() {
    const answered = selectedValues().length > 0;
    progress.setAttribute('aria-valuenow', answered ? '1' : '0');
    progress.setAttribute('aria-valuetext', answered ? 'Primeira pergunta de seis respondida' : 'Primeira pergunta de seis, ainda não respondida');
    progress.firstElementChild.style.width = answered ? `${100 / 6}%` : '0%';
  }

  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) options.forEach((option) => { option.checked = saved.includes(option.value); });
  } catch { /* O formulário continua disponível sem armazenamento no navegador. */ }
  updateProgress();

  form.addEventListener('change', () => {
    error.hidden = true;
    options.forEach((option) => option.removeAttribute('aria-invalid'));
    updateProgress();
    try { sessionStorage.setItem(storageKey, JSON.stringify(selectedValues())); } catch { /* Mantém as escolhas na tela. */ }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!selectedValues().length) {
      error.hidden = false;
      options.forEach((option) => option.setAttribute('aria-invalid', 'true'));
      options[0].focus();
      return;
    }
    dialog.showModal();
  });
})();
