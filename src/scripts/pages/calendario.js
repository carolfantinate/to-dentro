(async () => {
  'use strict';
  if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady;
  await window.ToDentroAdmissionsReady;
  await window.ToDentroAuth.ready;
  const todayParts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const todayValue = part => todayParts.find(item => item.type === part).value;
  const today = `${todayValue('year')}-${todayValue('month')}-${todayValue('day')}`;
  let month = Number(todayValue('month')) - 1, year = Number(todayValue('year')), category = 'todos', selectedDay = null;
  const storageKey = window.ToDentroAuth.storageKey('to-dentro-reminders');
  const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00`));
  let reminders = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) reminders = saved.filter(item => item && typeof item.id === 'string' && typeof item.title === 'string' && validDate(item.date) && (!item.time || /^\d{2}:\d{2}$/.test(item.time)));
  } catch { /* A criação continua disponível em memória. */ }
  const personalEvents = () => reminders.map(item => ({ ...item, personal: true }));
  const kindLabels = { inscricao: 'Inscrição', prova: 'Prova', resultado: 'Resultado', estudo: 'Estudo', pessoal: 'Pessoal' };
  const eventKind = event => Object.hasOwn(kindLabels, event.reminderCategory) ? event.reminderCategory : 'pessoal';
  let savedDates = [];
  try {
    const saved = JSON.parse(localStorage.getItem(window.ToDentroAuth.storageKey('to-dentro-calendar-dates')) || '[]');
    if (Array.isArray(saved)) savedDates = saved.filter(item => item && typeof item.title === 'string' && validDate(item.date) && item.dataSource === 'firestore').map(item => ({ ...item, time: null }));
  } catch { /* Os lembretes continuam disponíveis. */ }
  if (!window.ToDentroAuth.isAuthenticated()) {
    reminders = []; savedDates = [];
    document.title = 'Calendário de datas | Tô Dentro';
    document.querySelector('.calendar-header > span').textContent = 'Calendário de datas';
    document.querySelector('.calendar-intro').textContent = 'Explore inscrições, provas e resultados. Entre para organizar seu calendário pessoal.';
    document.querySelector('.calendar-demo').textContent = 'Explore as datas cadastradas de inscrições, provas e resultados. Horários não informados na planilha.';
  }
  const days = document.querySelector('#calendar-days');
  const agenda = document.querySelector('#calendar-events');
  const filters = [...document.querySelectorAll('[data-category]')];
  const params = new URLSearchParams(location.search);
  if (/^\d{4}-\d{2}-01$/.test(params.get('mes') || '') && validDate(params.get('mes'))) {
    const parts = params.get('mes').split('-').map(Number); year = parts[0]; month = parts[1] - 1;
  }
  if (window.ToDentroAuth.isAuthenticated() && params.get('categoria') === 'lembretes') category = 'lembretes';
  const universitySelect = document.querySelector('#calendar-university');
  for (const university of window.ToDentroUniversities) universitySelect.append(new Option(university.acronym, university.id));
  universitySelect.value = window.ToDentroUniversities.some(item => item.id === params.get('universidade')) ? params.get('universidade') : '';
  if (universitySelect.value) category = 'universidades';
  const catalog = window.ToDentroAdmissionCatalog;
  function matches(event) {
    if (category === 'lembretes') return event.personal || savedDates.some(saved => saved.id === event.id);
    if (event.personal) return category === 'todos';
    if (universitySelect.value) return (catalog?.choicesForUniversity(universitySelect.value) || []).some(choice => choice.id === event.choiceId);
    return true;
  }
  function jumpToSelection() {
    const dates = (window.ToDentroCalendar || []).filter(matches).map(event => event.date);
    for (const item of window.ToDentroDateEstimates || []) if (matches(item) && item.year) dates.push(`${item.year}-${String(item.month).padStart(2,'0')}-01`);
    dates.sort();
    const first = dates.find(date => date >= today) || dates[0];
    if (first) { year = Number(first.slice(0,4)); month = Number(first.slice(5,7)) - 1; }
  }
  if (!params.has('mes') && universitySelect.value) jumpToSelection();

  function openReminder(reminder) {
    if (!window.ToDentroAuth.requireLogin('Entre para organizar seus lembretes pessoais.')) return;
    const destination = new URL('./criar-lembrete.html', location.href);
    if (reminder) destination.searchParams.set('id', reminder.id);
    destination.searchParams.set('data', selectedDay ? dateKey(selectedDay) : today);
    const state = new URLSearchParams(params);
    state.set('mes', dateKey(1)); state.set('categoria', category);
    state.set('universidade', universitySelect.value);
    state.delete('processo'); state.delete('programa');
    destination.searchParams.set('from', `${location.pathname}?${state}`);
    location.href = destination.href;
  }
  const from = params.get('from');
  if (from) {
    const url = new URL(from, location.href);
    const allowed = ['../../index.html', './perfil.html', './universidade.html', './salvos.html'].map(path => new URL(path, location.href));
    if (allowed.some(item => item.protocol === url.protocol && item.host === url.host && item.pathname === url.pathname)) document.querySelector('#calendar-back').href = url.href;
  }
  const dateKey = day => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  function render() {
    const monthName = new Intl.DateTimeFormat('pt-BR', {month:'long'}).format(new Date(year, month, 1));
    document.querySelector('#calendar-month-title').textContent = `${monthName[0].toUpperCase()}${monthName.slice(1)} ${year}`;
    days.replaceChildren();
    const events = [...new Map([...savedDates, ...window.ToDentroCalendar, ...personalEvents()].map(event => [event.id, event])).values()];
    const monthEvents = events.filter(event => event.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`)
      && matches(event))
      .sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`));
    for (let offset = 0; offset < new Date(year, month, 1).getDay(); offset++) {
      const blank = document.createElement('span'); blank.setAttribute('aria-hidden', 'true'); days.append(blank);
    }
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const dayEvents = monthEvents.filter(item => item.date === dateKey(day));
      const kinds = [...new Set(dayEvents.map(eventKind))];
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'calendar-day'; button.textContent = day;
      if (kinds.length) {
        button.dataset.kind = kinds[0];
      }
      button.setAttribute('aria-label', `${day} de ${monthName} de ${year}${dayEvents.length ? ': ' + dayEvents.map(event => `${kindLabels[eventKind(event)]}: ${event.title}`).join('; ') : ''}`);
      button.setAttribute('aria-pressed', String(selectedDay === day));
      if (dateKey(day) === today) { button.classList.add('is-today'); button.setAttribute('aria-current', 'date'); }
      button.addEventListener('click', () => { selectedDay = selectedDay === day ? null : day; render(); }); days.append(button);
    }
    const visible = monthEvents.filter(event => !selectedDay || event.date === dateKey(selectedDay));
    agenda.replaceChildren();
    for (const event of visible) {
      const article = document.createElement(event.personal ? 'button' : 'a'); article.className = 'calendar-event';
      article.dataset.kind = eventKind(event);
      if (event.personal) {
        article.type = 'button';
        article.setAttribute('aria-label', `Ver ou editar ${event.title}, ${event.time}`);
        article.addEventListener('click', () => openReminder(event));
      }
      const date = document.createElement('time'); date.className = 'calendar-event-date'; date.dateTime = event.date;
      const number = document.createElement('strong'); number.textContent = Number(event.date.slice(-2));
      const label = document.createElement('span'); label.textContent = new Intl.DateTimeFormat('pt-BR', {month:'short'}).format(new Date(year,month,1)).replace('.','');
      date.append(number, label);
      const text = document.createElement(event.personal ? 'span' : 'div'); text.className = 'calendar-event-info';
      const title = document.createElement(event.personal ? 'strong' : 'h3'); title.textContent = event.title;
      const description = document.createElement(event.personal ? 'span' : 'p');
      description.className = 'calendar-event-description';
      const university = window.ToDentroUniversities.find(item => item.id === event.universityId);
      const categoryLabel = kindLabels[eventKind(event)];
      description.textContent = event.personal ? [categoryLabel, university?.acronym, event.time].filter(Boolean).join(' · ') : event.official ? [categoryLabel, university?.acronym, event.processName, event.edition ? `Edição ${event.edition}` : '', event.yearInferred ? 'Ano conforme o ciclo da seleção' : ''].filter(Boolean).join(' · ') : `${university?.acronym || 'Universidade'} · Exemplo · ${event.description}`;
      text.append(title, description); article.append(date, text); agenda.append(article);
      if (!event.personal) {
        const destination = new URL('./datas.html', location.href);
        destination.searchParams.set(event.programId ? 'programa' : 'processo', event.choiceId);
        if (event.universityId) destination.searchParams.set('universidade', event.universityId);
        article.href = destination.href;
        article.setAttribute('aria-label', `Consultar ${event.title} · ${event.processName || ''}`);
      }
      const arrow = document.createElement('span'); arrow.className = 'calendar-event-arrow material-symbols-outlined';
      arrow.textContent = 'chevron_right'; arrow.setAttribute('aria-hidden', 'true'); article.append(arrow);
    }

    const forecasts = (window.ToDentroDateEstimates || []).filter(item => matches(item) && item.year === year && item.month === month + 1);
    const forecastsList = document.querySelector('#calendar-estimates'); forecastsList.replaceChildren();
    if (forecasts.length) {
      const heading = document.createElement('h3'); heading.textContent = 'Previsões deste mês · sem dia confirmado'; forecastsList.append(heading);
      for (const item of forecasts) {
        const text = document.createElement('p'); text.textContent = `${item.processName} · ${item.title}: ${item.description} `;
        text.className = 'calendar-forecast'; text.dataset.kind = eventKind(item);
        const link = document.createElement('a'); link.textContent = 'Consultar previsão';
        link.href = `./datas.html?programa=${encodeURIComponent(item.programId)}`; text.append(link); forecastsList.append(text);
      }
    }
    document.querySelector('#calendar-empty').hidden = visible.length > 0 || (!selectedDay && forecasts.length > 0);

    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.category === category));
    universitySelect.dataset.active = String(category === 'universidades');
    const exploreUrl = new URL('./explorar-datas.html', location.href);
    if (universitySelect.value) exploreUrl.searchParams.set('universidade', universitySelect.value);
    const state = new URLSearchParams(params);
    state.set('mes', dateKey(1)); state.set('categoria', category); state.set('universidade', universitySelect.value); state.delete('processo'); state.delete('programa');
    exploreUrl.searchParams.set('from', `${location.pathname}?${state}`);
    document.querySelector('#explore-dates').href = exploreUrl.href;
  }
  function changeMonth(delta) {
    const next = new Date(year, month + delta, 1); year = next.getFullYear(); month = next.getMonth(); selectedDay = null; render();
  }
  document.querySelector('#previous-month').addEventListener('click', () => changeMonth(-1));
  document.querySelector('#next-month').addEventListener('click', () => changeMonth(1));
  for (const filter of filters) filter.addEventListener('click', () => { category = filter.dataset.category; universitySelect.value = ''; selectedDay = null; render(); });
  universitySelect.addEventListener('change', () => { category = 'universidades'; selectedDay = null; jumpToSelection(); render(); });
  document.querySelector('#add-reminder').addEventListener('click', () => openReminder());
  render();
})();
