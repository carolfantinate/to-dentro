(async () => {
  'use strict';
  await window.ToDentroAuth.ready;
  const params = new URLSearchParams(location.search);
  let localPosts = [];
  try {
    const saved = JSON.parse(localStorage.getItem(window.ToDentroAuth.storageKey('to-dentro-community-posts')) || '[]');
    if (Array.isArray(saved)) localPosts = saved;
  } catch { /* Os exemplos continuam disponíveis sem armazenamento. */ }
  const post = [...window.ToDentroCommunity, ...localPosts].find(item => item && item.id === params.get('id') && typeof item.title === 'string' && typeof item.text === 'string' && typeof item.author === 'string');
  const back = new URL('./comunidade.html', location.href);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    if (from.origin === back.origin && from.pathname === back.pathname) back.search = from.search;
  }
  document.querySelector('#experience-back').href = back.href;
  if (!post) { document.querySelector('#experience-not-found').hidden = false; return; }
  const university = window.ToDentroUniversities.find(item => item.id === post.universityId);
  document.title = `${post.title} | Tô Dentro`;
  document.querySelector('#experience-title').textContent = post.title;
  document.querySelector('#experience-author').textContent = [post.author, university?.acronym, post.course].filter(Boolean).join(' · ');
  document.querySelector('#experience-role').textContent = post.role || 'Membro da comunidade';
  const period = document.querySelector('#experience-period');
  if (post.experiencePeriod || post.since) { period.textContent = post.experiencePeriod || `Desde ${post.since}`; period.hidden = false; }
  document.querySelector('#experience-text').textContent = post.text;
  const more = new URL('./comunidade.html', location.href);
  if (university) more.searchParams.set('universidade', university.id);
  document.querySelector('#experience-more').href = more.href;
  document.querySelector('#experience-more').textContent = university ? `Ver mais experiências da ${university.acronym}` : 'Ver mais experiências';
  const share = new URL('./compartilhar-experiencia.html', location.href);
  if (university) share.searchParams.set('universidade', university.id);
  share.searchParams.set('from', location.pathname + location.search);
  document.querySelector('#experience-share').href = share.href;
  document.querySelector('#experience-content').hidden = false;
})();
