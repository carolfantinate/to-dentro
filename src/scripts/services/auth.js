(() => {
  'use strict';
  const root = new URL('../../../', document.currentScript.src);
  // O protótipo não autentica usuários. Conectar a uma sessão validada pelo servidor
  // quando o login estiver implementado; dados locais não comprovam autenticação.
  const isAuthenticated = () => false;
  const privatePages = {
    'perfil.html': ['Seu futuro começa com você.', 'Entre ou crie sua conta para ter seu perfil, guardar suas escolhas e acompanhar seus próximos passos.', 'person'],
    'salvos.html': ['Suas escolhas merecem um lugar.', 'Entre ou crie sua conta para reunir universidades, cursos, comparações e seu resultado vocacional.', 'bookmark'],
    'teste-vocacional.html': ['Vamos descobrir seus caminhos?', 'Entre ou crie sua conta para fazer o teste vocacional e guardar seu mapa de interesses.', 'explore'],
    'quiz-vocacional.html': ['Vamos descobrir seus caminhos?', 'Entre ou crie sua conta para fazer o teste vocacional e guardar seu mapa de interesses.', 'explore'],
    'resultado-vocacional.html': ['Seu mapa, sempre com você.', 'Entre para consultar e salvar seu resultado vocacional.', 'explore'],
    'criar-lembrete.html': ['Um passo de cada vez.', 'Entre ou crie sua conta para adicionar datas e organizar seus lembretes pessoais.', 'calendar_month'],
    'criar-duvida.html': ['Sua dúvida também pode ajudar.', 'Entre ou crie sua conta para publicar dúvidas e conversar com a comunidade.', 'forum'],
    'compartilhar-experiencia.html': ['Sua experiência tem valor.', 'Entre ou crie sua conta para compartilhar sua história com a comunidade.', 'forum'],
  };
  const pageName = url => url.pathname.split('/').pop();
  const currentPage = pageName(new URL(location.href));
  const isRestrictedPage = () => !isAuthenticated() && Object.hasOwn(privatePages, currentPage);
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
  function accountLink(label, page, destination, className) {
    const link = node('a', className, label);
    const url = new URL(`src/pages/${page}`, root);
    const target = new URL(destination, location.href);
    if (target.origin === root.origin && target.pathname.startsWith(root.pathname)) url.searchParams.set('retorno', target.pathname + target.search);
    link.href = url.href;
    return link;
  }
  function actions(destination) {
    const group = node('div', 'auth-actions');
    group.append(accountLink('Entrar', 'login.html', destination, 'button button-ink'), accountLink('Criar conta', 'cadastro.html', destination, 'button auth-create'));
    return group;
  }
  let dialog;
  function prompt(message = 'Entre ou crie sua conta para continuar.', destination = location.href) {
    if (isAuthenticated()) return true;
    if (!dialog) {
      dialog = node('dialog', 'auth-dialog');
      dialog.setAttribute('aria-labelledby', 'auth-dialog-title');
      dialog.setAttribute('aria-describedby', 'auth-dialog-description');
      document.body.append(dialog);
    }
    dialog.replaceChildren();
    const icon = node('span', 'auth-icon material-symbols-outlined', 'lock'); icon.setAttribute('aria-hidden', 'true');
    const title = node('h2', '', 'Entre para dar esse próximo passo'); title.id = 'auth-dialog-title';
    const description = node('p', '', message); description.id = 'auth-dialog-description';
    const close = node('button', 'auth-dismiss', 'Continuar explorando'); close.type = 'button';
    close.addEventListener('click', () => dialog.close());
    dialog.append(icon, title, description, actions(destination), close);
    if (!dialog.open) dialog.showModal();
    return false;
  }
  window.ToDentroAuth = { isAuthenticated, isRestrictedPage, requireLogin: prompt };

  if (isRestrictedPage()) {
    const [heading, description, symbol] = privatePages[currentPage];
    const main = document.querySelector('main');
    main.className = 'auth-guest-page';
    const logo = node('img', 'auth-logo'); logo.src = new URL('assets/images/combination-mark.svg', root).href; logo.alt = 'Tô Dentro!'; logo.width = 170; logo.height = 57;
    const card = node('section', 'auth-guest-card');
    const icon = node('span', 'auth-icon material-symbols-outlined', symbol); icon.setAttribute('aria-hidden', 'true');
    const back = node('a', 'auth-dismiss', 'Explorar sem entrar'); back.href = new URL('index.html', root).href;
    card.append(icon, node('h1', '', heading), node('p', '', description), actions(location.href), back);
    main.replaceChildren(logo, card);
  }

  // Captura antes dos handlers das páginas, inclusive para controles criados dinamicamente.
  const protectedControls = {
    'save-university': 'Entre para salvar universidades e consultar suas escolhas depois.',
    'course-save': 'Entre para salvar cursos e reunir suas opções.',
    'results-save': 'Entre para salvar esta comparação.',
    'save-interest-map': 'Entre para salvar seu resultado vocacional.',
    'community-share': 'Entre para publicar dúvidas ou compartilhar experiências com a comunidade.',
    'discussion-answer': 'Entre para responder e participar da conversa.',
    'add-reminder': 'Entre para criar lembretes no seu calendário pessoal.',
  };
  document.addEventListener('click', event => {
    if (isAuthenticated() || !(event.target instanceof Element)) return;
    const control = event.target.closest('a, button');
    if (!control || dialog?.contains(control)) return;
    let message = protectedControls[control.id];
    let destination = location.href;
    if (control.matches('[data-auth-action="calendar"], .calendar-filter[data-category="lembretes"]')) message = 'Entre para adicionar datas e organizar seu calendário pessoal.';
    if (control.tagName === 'A') {
      const url = new URL(control.href, location.href);
      const name = pageName(url);
      if (url.origin === root.origin && url.pathname.startsWith(root.pathname) && privatePages[name] && !['perfil.html', 'salvos.html'].includes(name)) {
        message = privatePages[name][1]; destination = url.href;
      }
    }
    if (!message) return;
    event.preventDefault(); event.stopImmediatePropagation();
    prompt(message, destination);
  }, true);
  document.addEventListener('submit', event => {
    if (!isAuthenticated() && event.target.id === 'answer-form') {
      event.preventDefault(); event.stopImmediatePropagation(); prompt('Entre para publicar uma resposta na comunidade.');
    }
  }, true);
})();
