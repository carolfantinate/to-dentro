(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const key = 'to-dentro-community-replies';
  function read(key) {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(saved)) throw new Error('Invalid collection');
    return saved;
  }
  let localPosts = [], localReplies = [];
  try { localPosts = read('to-dentro-community-posts'); } catch { /* Manter os exemplos disponíveis. */ }
  try { localReplies = read(key); } catch { /* Manter as respostas demonstrativas disponíveis. */ }
  const post = [...window.ToDentroCommunity, ...localPosts].find(item => item && item.id === params.get('id') && item.category === 'duvidas' && typeof item.title === 'string' && typeof item.text === 'string');
  const back = new URL('./comunidade.html?categoria=duvidas', location.href);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    if (from.origin === back.origin && from.pathname === back.pathname) back.search = from.search;
  }
  back.searchParams.set('categoria', 'duvidas');
  document.querySelector('#discussion-back').href = back.href;
  if (!post) { document.querySelector('#discussion-not-found').hidden = false; return; }
  const topics = { ingresso: 'Ingresso', pesquisa: 'Pesquisa', permanencia: 'Permanência', 'vida-academica': 'Vida acadêmica' };
  const university = window.ToDentroUniversities.find(item => item.id === post.universityId);
  document.title = `${post.title} | Tô Dentro`;
  document.querySelector('#discussion-title').textContent = post.title;
  document.querySelector('#discussion-context').textContent = [university?.acronym, post.course, topics[post.topic]].filter(Boolean).join(' · ');
  function element(tag, className, text) { const node = document.createElement(tag); node.className = className; if (text !== undefined) node.textContent = text; return node; }
  function profile(person) {
    const header = element('header', 'post-author');
    const initials = person.initials || person.author.trim().split(/\s+/).map(name => name[0]).slice(0, 2).join('');
    const fallback = () => { const avatar = element('span', 'post-avatar', initials); avatar.setAttribute('aria-hidden', 'true'); return avatar; };
    let avatar = fallback();
    if (person.avatar) {
      avatar = element('img', 'post-avatar'); avatar.src = person.avatar; avatar.alt = ''; avatar.width = 48; avatar.height = 48;
      avatar.addEventListener('error', () => avatar.replaceWith(fallback()));
    }
    const info = element('div', 'post-author-info'); info.append(element('p', 'post-author-name', person.author));
    const institution = window.ToDentroUniversities.find(item => item.id === person.universityId);
    const context = [institution?.acronym, person.course].filter(Boolean).join(' · ');
    if (context) info.append(element('p', 'post-institution', context));
    if (person.role) info.append(element('p', 'post-author-description', `${person.role}${person.since ? ` desde ${person.since}` : ''}`));
    header.append(avatar, info); return header;
  }
  document.querySelector('#discussion-author').replaceWith(profile(post));
  document.querySelector('#discussion-text').textContent = post.text;
  function renderReplies() {
    const replies = [...(Array.isArray(post.replies) ? post.replies : []), ...localReplies.filter(item => item && item.questionId === post.id)]
      .filter(item => item && typeof item.author === 'string' && typeof item.text === 'string');
    const list = document.querySelector('#discussion-replies'); list.replaceChildren();
    for (const reply of replies) {
      const card = element('article', 'community-post'); card.append(profile(reply), element('p', 'discussion-reply-text', reply.text));
      if (reply.source) {
        try {
          const url = new URL(reply.source);
          if (['http:', 'https:'].includes(url.protocol)) {
            const link = element('a', 'discussion-source', `Fonte indicada por ${reply.author} 🔗`);
            link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; card.append(link);
          }
        } catch { /* Ignorar links inválidos. */ }
      }
      list.append(card);
    }
    document.querySelector('#discussion-replies-title').textContent = `Respostas da comunidade (${replies.length})`;
    document.querySelector('#discussion-empty').hidden = replies.length > 0;
  }
  const create = new URL('./criar-duvida.html', location.href);
  if (university) create.searchParams.set('universidade', university.id);
  create.searchParams.set('from', location.pathname + location.search);
  document.querySelector('#discussion-create').href = create.href;
  const dialog = document.querySelector('#answer-dialog');
  const text = document.querySelector('#answer-text'); const source = document.querySelector('#answer-source');
  document.querySelector('#answer-question').textContent = post.title;
  document.querySelector('#discussion-answer').addEventListener('click', () => { if (window.ToDentroAuth.requireLogin('Entre para responder à dúvida.')) dialog.showModal(); });
  document.querySelector('#answer-cancel').addEventListener('click', () => dialog.close());
  text.addEventListener('input', () => text.setCustomValidity('')); source.addEventListener('input', () => source.setCustomValidity(''));
  document.querySelector('#answer-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!window.ToDentroAuth.requireLogin('Entre para publicar sua resposta.')) return;
    text.setCustomValidity(text.value.trim() ? '' : 'Escreva sua resposta.');
    let url = '';
    try { if (source.value.trim()) { const parsed = new URL(source.value.trim()); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); url = parsed.href; } source.setCustomValidity(''); }
    catch { source.setCustomValidity('Informe um link que comece com https:// ou http://.'); }
    if (!document.querySelector('#answer-form').reportValidity()) return;
    const reply = { id: crypto.randomUUID(), questionId: post.id, author: 'Você', initials: 'VC', text: text.value.trim(), source: url, publishedAt: new Date().toISOString() };
    try { const latest = read(key); localStorage.setItem(key, JSON.stringify([...latest, reply])); localReplies = [...latest, reply]; }
    catch { document.querySelector('#answer-status').textContent = 'Não foi possível salvar. Sua resposta continua aqui; tente novamente.'; return; }
    document.querySelector('#answer-form').reset(); dialog.close(); renderReplies();
  });
  document.querySelector('#discussion-content').hidden = false;
  renderReplies();
})();
