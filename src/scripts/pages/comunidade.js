(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const universityId = params.get('universidade');
  const university = window.ToDentroUniversities.find(item => item.id === universityId);
  const feed = document.querySelector('#community-feed');
  const empty = document.querySelector('#community-empty');
  const buttons = [...document.querySelectorAll('[data-category]')];
  const back = document.querySelector('#community-back');

  if (university) {
    const fallback = new URL('./universidade.html', location.href);
    fallback.searchParams.set('id', university.id);
    back.href = fallback.href;
    const context = document.querySelector('#community-context');
    context.textContent = `Relatos de ${university.acronym} e dicas para o vestibular`;
    context.hidden = false;
    document.title = `Comunidade • ${university.acronym} | Tô Dentro`;
  }
  const from = params.get('from');
  if (from) {
    const url = new URL(from, location.href);
    const home = new URL('../../index.html', location.href);
    const details = new URL('./universidade.html', location.href);
    if (url.protocol === home.protocol && url.host === home.host
      && (url.pathname === home.pathname || (university && url.pathname === details.pathname && url.searchParams.get('id') === university.id))) back.href = url.href;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function render(category) {
    const posts = window.ToDentroCommunity.filter(post => post.category === category
      && (!universityId || (university && (!post.universityId || post.universityId === university.id))));
    feed.replaceChildren();
    for (const post of posts) {
      const article = element('article', 'community-post');
      const author = element('header', 'post-author');
      const avatar = element('span', 'post-avatar', post.initials); avatar.setAttribute('aria-hidden', 'true');
      const authorText = element('div', 'post-author-info');
      authorText.append(element('p', 'post-author-name', post.author), element('p', 'post-author-description', 'Estudante • Relato ilustrativo'));
      author.append(avatar, authorText);
      const stats = element('footer', 'post-stats');
      for (const [icon, label] of [['favorite', String(post.likes)], ['chat_bubble', `${post.comments} comentários`]]) {
        const stat = element('span', 'post-stat');
        const symbol = element('span', 'material-symbols-outlined', icon); symbol.setAttribute('aria-hidden', 'true');
        stat.append(symbol, element('span', '', label)); stats.append(stat);
      }
      article.append(author, element('h2', 'post-title', post.title), element('p', 'post-text', post.text), stats);
      feed.append(article);
    }
    empty.hidden = posts.length > 0;
    empty.textContent = universityId && !university ? 'Universidade não encontrada. Volte à busca para escolher uma instituição.'
      : category === 'duvidas' ? 'Ainda não há dúvidas nesta seleção.'
      : category === 'oportunidades' ? 'As oportunidades estarão disponíveis em breve.' : 'Ainda não há relatos nesta seleção.';
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.category === category));
  }
  for (const button of buttons) button.addEventListener('click', () => render(button.dataset.category));
  render('experiencias');
})();
