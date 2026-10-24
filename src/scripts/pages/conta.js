(() => {
  'use strict';
  const root = new URL('../../', location.href);
  const raw = new URLSearchParams(location.search).get('retorno');
  if (raw) {
    try {
      const target = new URL(raw, location.href);
      if (target.origin === root.origin && target.pathname.startsWith(root.pathname)) {
        for (const link of document.querySelectorAll('[data-account-link]')) {
          const destination = new URL(link.href);
          destination.searchParams.set('retorno', target.pathname + target.search);
          link.href = destination.href;
        }
      }
    } catch { /* Mantém os links padrão para destinos inválidos. */ }
  }
  const form = document.querySelector('#login-form');
  if (!form) return;
  // Não permite envio nativo do formulário durante o carregamento da sessão.
  form.addEventListener('submit', event => event.preventDefault());
  const status = document.querySelector('.account-notice');
  const email = document.querySelector('#login-email');
  const password = document.querySelector('#login-password');
  let busy = false;
  const show = message => { status.textContent = message; status.hidden = false; };
  document.querySelector('.login-eye').addEventListener('click', event => {
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    event.currentTarget.setAttribute('aria-pressed', String(visible));
    event.currentTarget.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
  });
  async function initialize() {
    const [authService, ui] = await Promise.all([
      import(new URL('services/auth.js', root).href), import(new URL('services/account-ui.js', root).href)
    ]);
    await window.ToDentroAuth.ready;
    if (window.ToDentroAuth.error) throw window.ToDentroAuth.error;
    if (authService.getCurrentUser()) {
      location.replace(ui.accountDestination(location.search, root, 'src/pages/perfil.html'));
      return;
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !form.reportValidity()) return;
      busy = true;
      const fields = [...form.querySelectorAll('input, button')];
      fields.forEach(field => { field.disabled = true; });
      form.setAttribute('aria-busy', 'true');
      show('Entrando…');
      try {
        await authService.login(email.value, password.value);
        password.value = '';
        location.assign(ui.accountDestination(location.search, root, 'src/pages/perfil.html'));
      } catch (error) { show(ui.accountErrorMessage(error)); }
      finally { busy = false; fields.forEach(field => { field.disabled = false; }); form.setAttribute('aria-busy', 'false'); }
    });
    document.querySelector('.login-forgot').addEventListener('click', async () => {
      if (busy || !email.reportValidity()) return;
      busy = true;
      const button = document.querySelector('.login-forgot'); button.disabled = true;
      const success = 'Se houver uma conta com esse e-mail, você receberá as instruções para redefinir sua senha.';
      try { await authService.resetPassword(email.value); show(success); }
      catch (error) { show(error.code === 'auth/user-not-found' ? success : ui.accountErrorMessage(error)); }
      finally { busy = false; button.disabled = false; }
    });
  }
  initialize().catch(() => show('Não foi possível carregar a autenticação. Confira a conexão e recarregue a página.'));
})();
