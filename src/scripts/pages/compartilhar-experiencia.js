(() => {
  'use strict';
  if (window.ToDentroAuth.isRestrictedPage()) return;
  const params = new URLSearchParams(location.search);
  const university = document.querySelector('#experience-university');
  const course = document.querySelector('#experience-course');
  const title = document.querySelector('#experience-title');
  const text = document.querySelector('#experience-text');
  const form = document.querySelector('#experience-form');
  const status = document.querySelector('#experience-status');
  for (const item of window.ToDentroUniversities) university.append(new Option(`${item.acronym} — ${item.name}`, item.id));
  for (const item of window.ToDentroCourseCatalog.courses) course.append(new Option(item.name, item.name));
  const role = document.querySelector('#experience-role');
  const otherRole = document.querySelector('#experience-other-role');
  const start = document.querySelector('#experience-start');
  const end = document.querySelector('#experience-end');
  const ongoing = document.querySelector('#experience-current');
  const currentYear = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric' }).format(new Date());
  start.max = currentYear; end.max = currentYear;
  role.addEventListener('change', () => {
    const other = role.value === 'Outro';
    document.querySelector('#experience-other-role-group').hidden = !other;
    otherRole.disabled = !other; otherRole.required = other;
  });
  function updatePeriod() {
    end.disabled = ongoing.checked;
    if (ongoing.checked) end.value = '';
    start.required = ongoing.checked || Boolean(end.value);
    end.required = Boolean(start.value) && !ongoing.checked;
    end.min = start.value || '1900';
    start.setCustomValidity(''); end.setCustomValidity('');
  }
  ongoing.addEventListener('change', updatePeriod);
  start.addEventListener('input', updatePeriod); end.addEventListener('input', updatePeriod);
  otherRole.addEventListener('input', () => otherRole.setCustomValidity(''));
  university.value = window.ToDentroUniversities.some(item => item.id === params.get('universidade')) ? params.get('universidade') : '';
  const back = new URL('./comunidade.html', location.href);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    const experience = new URL('./experiencia.html', location.href);
    if (from.origin === back.origin && [back.pathname, experience.pathname].includes(from.pathname)) { back.pathname = from.pathname; back.search = from.search; }
  } else if (university.value) back.searchParams.set('universidade', university.value);
  document.querySelector('#experience-back').href = back.href;
  document.querySelector('#experience-cancel').href = back.href;
  for (const field of [course, title, text]) field.addEventListener('input', () => field.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const field of [course, title, text]) field.setCustomValidity(field.value.trim() ? '' : 'Preencha este campo.');
    updatePeriod();
    otherRole.setCustomValidity(role.value === 'Outro' && !otherRole.value.trim() ? 'Informe seu vínculo.' : '');
    if (start.value && end.value && Number(end.value) < Number(start.value)) end.setCustomValidity('O término deve ser igual ou posterior ao início.');
    if (!form.reportValidity()) return;
    if (!window.ToDentroUniversities.some(item => item.id === university.value)) return;
    const post = {
      id: crypto.randomUUID(), author: 'Você', initials: 'VC', universityId: university.value, course: course.value.trim(),
      role: (role.value === 'Outro' ? otherRole.value.trim() : role.value) || 'Membro da comunidade',
      startYear: start.value, endYear: ongoing.checked ? '' : end.value, ongoing: ongoing.checked,
      experiencePeriod: start.value ? `${start.value} até ${ongoing.checked ? 'hoje' : end.value}` : '',
      category: 'experiencias', title: title.value.trim(), text: text.value.trim(),
      publishedAt: new Date().toISOString(),
    };
    try {
      const saved = JSON.parse(localStorage.getItem('to-dentro-community-posts') || '[]');
      if (!Array.isArray(saved)) throw new Error('Invalid posts');
      localStorage.setItem('to-dentro-community-posts', JSON.stringify([...saved, post]));
    } catch {
      status.textContent = 'Não foi possível salvar no navegador. Seu texto continua aqui; tente novamente.';
      return;
    }
    const destination = new URL('./comunidade.html', location.href);
    destination.searchParams.set('universidade', university.value);
    destination.searchParams.delete('busca'); destination.searchParams.delete('categoria');
    destination.searchParams.set('publicado', post.id);
    location.href = destination.href;
  });
})();
