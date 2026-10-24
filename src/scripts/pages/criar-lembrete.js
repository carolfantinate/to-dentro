(async () => {
  'use strict';
  await window.ToDentroAuth.ready;
  if (window.ToDentroAuth.isRestrictedPage()) return;
  const params = new URLSearchParams(location.search);
  const key = window.ToDentroAuth.storageKey('to-dentro-reminders');
  const back = new URL('./calendario.html', location.href);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    if (from.origin === back.origin && from.pathname === back.pathname) back.search = from.search;
  }
  document.querySelector('#reminder-back').href = back.href;
  document.querySelector('#cancel-reminder').href = back.href;
  const form = document.querySelector('#reminder-form');
  const title = document.querySelector('#reminder-title');
  const date = document.querySelector('#reminder-date');
  const time = document.querySelector('#reminder-time');
  const category = document.querySelector('#reminder-category');
  const university = document.querySelector('#reminder-university');
  const description = document.querySelector('#reminder-description');
  const status = document.querySelector('#reminder-status');
  for (const item of window.ToDentroUniversities) university.append(new Option(item.acronym, item.id));
  function read() {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(value)) throw new Error('Invalid reminders');
    return value.filter(item => item && typeof item.id === 'string');
  }
  let reminders;
  try { reminders = read(); } catch {
    status.textContent = 'Não foi possível acessar seus lembretes. Tente novamente antes de salvar.';
    reminders = [];
  }
  const reminder = reminders.find(item => item.id === params.get('id'));
  if (params.has('id') && !reminder) {
    status.textContent = 'Lembrete não encontrado. Volte ao calendário para escolher outro.';
    form.querySelector('button[type="submit"]').disabled = true;
    return;
  }
  if (reminder) {
    document.title = 'Editar lembrete | Tô Dentro';
    document.querySelector('#reminder-heading').textContent = 'Editar lembrete';
    title.value = reminder.title; date.value = reminder.date; time.value = reminder.time || '';
    category.value = ['pessoal', 'estudo', 'inscricao', 'prova'].includes(reminder.reminderCategory) ? reminder.reminderCategory : 'pessoal';
    university.value = window.ToDentroUniversities.some(item => item.id === reminder.universityId) ? reminder.universityId : '';
    description.value = reminder.description || '';
    document.querySelector('#delete-reminder').hidden = false;
  } else {
    date.value = /^\d{4}-\d{2}-\d{2}$/.test(params.get('data') || '') ? params.get('data') : '';
  }
  title.addEventListener('input', () => title.setCustomValidity(''));
  function save(update, selectedDate) {
    try {
      const latest = read();
      if (reminder && !latest.some(item => item.id === reminder.id)) throw new Error('Missing reminder');
      localStorage.setItem(key, JSON.stringify(update(latest)));
    } catch {
      status.textContent = 'Não foi possível salvar no navegador. Seus dados continuam no formulário; tente novamente.';
      return;
    }
    const destination = new URL(back.href);
    if (selectedDate) {
      destination.searchParams.set('mes', `${selectedDate.slice(0, 7)}-01`);
      destination.searchParams.set('categoria', 'lembretes');
      destination.searchParams.delete('universidade');
    }
    location.href = destination.href;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    title.setCustomValidity(title.value.trim() ? '' : 'Escreva um título para o lembrete.');
    if (!form.reportValidity()) return;
    const entry = { id: reminder?.id || crypto.randomUUID(), title: title.value.trim(), date: date.value, time: time.value,
      reminderCategory: category.value, universityId: university.value, description: description.value.trim() };
    save(latest => reminder ? latest.map(item => item.id === reminder.id ? entry : item) : [...latest, entry], entry.date);
  });
  document.querySelector('#delete-reminder').addEventListener('click', () => {
    if (reminder) save(latest => latest.filter(item => item.id !== reminder.id));
  });
})();
