(() => {
  'use strict';
  if (window.ToDentroAuth.isRestrictedPage()) return;
  const params = new URLSearchParams(location.search);
  const university = document.querySelector('#question-university');
  const course = document.querySelector('#question-course');
  const topic = document.querySelector('#question-topic');
  const title = document.querySelector('#question-title');
  const text = document.querySelector('#question-text');
  const form = document.querySelector('#experience-form');
  for (const item of window.ToDentroUniversities) university.append(new Option(`${item.acronym} — ${item.name}`, item.id));
  for (const item of window.ToDentroCourseCatalog.courses) course.append(new Option(item.name, item.name));
  university.value = window.ToDentroUniversities.some(item => item.id === params.get('universidade')) ? params.get('universidade') : '';
  const back = new URL('./comunidade.html?categoria=duvidas', location.href);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    const discussion = new URL('./duvida.html', location.href);
    if (from.origin === back.origin && [back.pathname, discussion.pathname].includes(from.pathname)) { back.pathname = from.pathname; back.search = from.search; }
  }
  back.searchParams.set('categoria', 'duvidas');
  document.querySelector('#question-back').href = back.href;
  document.querySelector('#question-cancel').href = back.href;
  for (const field of [title, text]) field.addEventListener('input', () => field.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const field of [title, text]) field.setCustomValidity(field.value.trim() ? '' : 'Preencha este campo.');
    if (!form.reportValidity()) return;
    const post = { id: crypto.randomUUID(), author: 'Você', initials: 'VC', category: 'duvidas', title: title.value.trim(), text: text.value.trim(),
      universityId: university.value || null, course: course.value, topic: topic.value, publishedAt: new Date().toISOString(), replies: [] };
    try {
      const saved = JSON.parse(localStorage.getItem('to-dentro-community-posts') || '[]');
      if (!Array.isArray(saved)) throw new Error('Invalid posts');
      localStorage.setItem('to-dentro-community-posts', JSON.stringify([...saved, post]));
    } catch {
      document.querySelector('#question-status').textContent = 'Não foi possível salvar. Sua dúvida continua aqui; tente novamente.';
      return;
    }
    const destination = new URL('./comunidade.html?categoria=duvidas', location.href);
    if (post.universityId) destination.searchParams.set('universidade', post.universityId);
    destination.searchParams.set('publicado', post.id);
    location.href = destination.href;
  });
})();
