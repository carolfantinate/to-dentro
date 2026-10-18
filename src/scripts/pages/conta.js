(() => {
  'use strict';
  const status = document.querySelector('.account-notice');
  for (const button of document.querySelectorAll('.login-enter:not([data-signup-next]):not([data-signup-create]), .login-forgot')) {
    button.addEventListener('click', () => {
      status.textContent = button.dataset.previewMessage || 'Esta tela é uma prévia. O acesso por conta estará disponível em breve. Por enquanto, você pode explorar sem entrar.';
      status.hidden = false;
    });
  }
  const raw = new URLSearchParams(location.search).get('retorno');
  if (!raw) return;
  let target;
  try { target = new URL(raw, location.href); } catch { return; }
  const root = new URL('../../', location.href);
  if (target.origin !== root.origin || !target.pathname.startsWith(root.pathname)) return;
  for (const link of document.querySelectorAll('[data-account-link]')) {
    const destination = new URL(link.href);
    destination.searchParams.set('retorno', target.pathname + target.search);
    link.href = destination.href;
  }
})();
