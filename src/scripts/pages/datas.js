(async () => {
  'use strict';
  await window.ToDentroAuth.ready;
  const params = new URLSearchParams(location.search);
  const currentYear = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric' }).format(new Date()));
  const university = window.ToDentroUniversities.find(item => item.id === params.get('universidade'));
  const process = params.get('exame') || params.get('processo') || (university?.id === 'usp' ? 'fuvest' : '');
  const availableEdition = window.ToDentroAdmissionDates.find(item => item.universityId === university?.id && item.process === process)?.edition;
  const edition = /^\d{4}$/.test(params.get('edicao') || '') ? Number(params.get('edicao')) : availableEdition || currentYear;
  const selection = window.ToDentroAdmissionDates.find(item => item.universityId === university?.id && item.process === process && item.edition === edition);
  const label = university ? `Datas da ${university.acronym}` : 'Datas da seleção';
  document.title = `${label} | Tô Dentro`;
  document.querySelector('#admission-title').textContent = label;
  document.querySelector('#admission-header').textContent = label;
  document.querySelector('#admission-context').textContent = `${selection?.name || (process === 'enem' ? 'Enem' : process) || params.get('programa') || 'Seleção'} · Edição ${edition}`;
  const back = new URL('./explorar-datas.html', location.href);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    if (from.origin === back.origin && from.pathname === back.pathname) back.search = from.search;
  }
  document.querySelector('#admission-back').href = back.href;
  if (!selection) { document.querySelector('#admission-empty').hidden = false; return; }
  document.querySelector('#admission-note').textContent = selection.notice;
  const source = document.querySelector('#admission-source'); source.href = selection.source; source.hidden = false;
  const key = window.ToDentroAuth.storageKey('to-dentro-calendar-dates');
  function read() {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(saved)) throw new Error('Invalid calendar');
    return saved;
  }
  function entriesFor(event) {
    const base = { universityId: selection.universityId, process: selection.process, edition, source: selection.source, official: !selection.isMock, color: 'blue', category: 'vestibular' };
    const prefix = `${selection.universityId}-${selection.process}-${edition}-${event.legacyId || event.id}`;
    return [
      { ...base, id: `${prefix}-inicio`, title: `${event.title}${event.end ? ' · início' : ''}`, date: event.start, time: event.time },
      ...(event.end ? [{ ...base, id: `${prefix}-fim`, title: `${event.title} · fim`, date: event.end, time: event.endTime }] : []),
    ];
  }
  const format = (date, time) => `${date.split('-').reverse().join('/')}${time ? ` às ${time.replace(':', 'h')}` : ''}`;
  for (const event of selection.events) {
    const card = document.createElement('article'); card.className = 'admission-date-card';
    const title = document.createElement('h2'); title.textContent = event.title; card.append(title);
    const lines = event.end ? [`Início: ${format(event.start, event.time)}`, `Fim: ${format(event.end, event.endTime)}`] : [format(event.start, event.time)];
    for (const line of lines) { const text = document.createElement('p'); text.textContent = line; card.append(text); }
    const button = document.createElement('button'); button.type = 'button'; button.dataset.authAction = 'calendar'; button.className = 'button button-yellow';
    const entries = entriesFor(event);
    function updateButton() {
      let added = false;
      try { const saved = read(); added = window.ToDentroAuth.isAuthenticated() && entries.every(entry => saved.some(item => item.id === entry.id)); } catch { /* Permitir tentativa de salvar. */ }
      button.disabled = added; button.textContent = added ? 'Adicionado ao meu calendário' : 'Adicionar ao meu calendário';
    }
    button.addEventListener('click', () => {
      if (!window.ToDentroAuth.requireLogin('Entre para adicionar datas ao seu calendário.')) return;
      try {
        const saved = read();
        localStorage.setItem(key, JSON.stringify([...saved, ...entries.filter(entry => !saved.some(item => item.id === entry.id))]));
        updateButton();
        document.querySelector('#admission-status').textContent = event.end ? 'Início e fim adicionados ao seu calendário.' : 'Data adicionada ao seu calendário.';
        const calendar = document.querySelector('#admission-calendar');
        calendar.href = `./calendario.html?universidade=${selection.universityId}&mes=${event.start.slice(0, 7)}-01`;
        calendar.hidden = false;
      } catch { document.querySelector('#admission-status').textContent = 'Não foi possível salvar no navegador. Tente novamente.'; }
    });
    updateButton(); card.append(button); document.querySelector('#admission-dates-list').append(card);
  }
})();
