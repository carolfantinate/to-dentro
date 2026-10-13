(() => {
  'use strict';
  // Mês inicial do protótipo; Date local evita deslocamentos de fuso nas datas.
  let month = 9, year = 2026, category = 'todos', selectedDay = null;
  const events = window.ToDentroCalendar;
  const days = document.querySelector('#calendar-days');
  const agenda = document.querySelector('#calendar-events');
  const filters = [...document.querySelectorAll('[data-category]')];
  const params = new URLSearchParams(location.search);
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
    const monthEvents = events.filter(event => event.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`) && (category === 'todos' || event.category === category));
    for (let offset = 0; offset < new Date(year, month, 1).getDay(); offset++) {
      const blank = document.createElement('span'); blank.setAttribute('aria-hidden', 'true'); days.append(blank);
    }
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      const event = monthEvents.find(item => item.date === dateKey(day));
      const button = document.createElement('button'); button.type = 'button';
      button.className = `calendar-day${event ? ` event-${event.color}` : ''}`; button.textContent = day;
      button.setAttribute('aria-label', `${day} de ${monthName} de ${year}${event ? `: ${event.title}` : ''}`);
      button.setAttribute('aria-pressed', String(selectedDay === day));
      button.addEventListener('click', () => { selectedDay = selectedDay === day ? null : day; render(); }); days.append(button);
    }
    const visible = monthEvents.filter(event => !selectedDay || event.date === dateKey(selectedDay));
    agenda.replaceChildren();
    for (const event of visible) {
      const article = document.createElement('article'); article.className = 'calendar-event';
      const date = document.createElement('time'); date.className = 'calendar-event-date'; date.dateTime = event.date;
      const number = document.createElement('strong'); number.textContent = Number(event.date.slice(-2));
      const label = document.createElement('span'); label.textContent = new Intl.DateTimeFormat('pt-BR', {month:'short'}).format(new Date(year,month,1)).replace('.','');
      date.append(number, label);
      const text = document.createElement('div'); const title = document.createElement('h3'); title.textContent = event.title;
      const description = document.createElement('p'); description.textContent = event.description;
      text.append(title, description); article.append(date, text); agenda.append(article);
    }
    document.querySelector('#calendar-empty').hidden = visible.length > 0;
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.category === category));
  }
  function changeMonth(delta) {
    const next = new Date(year, month + delta, 1); year = next.getFullYear(); month = next.getMonth(); selectedDay = null; render();
  }
  document.querySelector('#previous-month').addEventListener('click', () => changeMonth(-1));
  document.querySelector('#next-month').addEventListener('click', () => changeMonth(1));
  for (const filter of filters) filter.addEventListener('click', () => { category = filter.dataset.category; selectedDay = null; render(); });
  render();
})();
