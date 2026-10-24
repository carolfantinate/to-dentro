(async () => {
  'use strict';
  await window.ToDentroUniversitiesReady;
  await window.ToDentroAdmissionsReady;
  await window.ToDentroAuth.ready;
  const catalog = window.ToDentroAdmissionCatalog;
  const params = new URLSearchParams(location.search);
  const university = window.ToDentroUniversities.find(item => item.id === params.get('universidade'));
  const requested = params.get('programa') || params.get('processo') || params.get('exame');
  const choices = catalog?.choicesForUniversity(university?.id) || [];
  const choice = choices.find(item => item.id === requested || item.id === `${university?.id}-${requested}`) || (!requested ? choices[0] : catalog?.choices.find(item => item.id === requested));
  const selections = (catalog?.selections || []).filter(item => item.choiceId === choice?.id).sort((a,b) => (b.edition || 0) - (a.edition || 0));
  const selection = params.has('edicao') ? selections.find(item => String(item.edition) === params.get('edicao')) : selections[0];
  const label = selection?.name || 'Datas da seleção';
  document.title = `${label} | Tô Dentro`;
  document.querySelector('#admission-title').textContent = label;
  document.querySelector('#admission-header').textContent = label;
  document.querySelector('#admission-context').textContent = [selection?.universityId ? university?.acronym : '', selection?.edition ? `Edição ${selection.edition}` : 'Edição não informada'].filter(Boolean).join(' · ');
  const back = new URL('./explorar-datas.html', location.href);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    if (from.origin === back.origin && from.pathname === back.pathname) back.search = from.search;
  }
  document.querySelector('#admission-back').href = back.href;
  if (!selection) { document.querySelector('#admission-empty').hidden = false; return; }
  document.querySelector('#admission-note').textContent = 'Datas cadastradas na planilha do projeto. Horários não informados. Previsões não representam dias confirmados. Confira o calendário oficial antes de se inscrever.';
  if (selection.officialSource && !selection.reviewIssueCodes?.includes('source-process-review')) {
    const source = document.querySelector('#admission-source'); source.href = selection.officialSource; source.hidden = false;
  }
  const list = document.querySelector('#admission-dates-list');
  if (selection.reviewIssueCodes?.includes('source-process-review')) {
    const note = document.createElement('p'); note.textContent = 'O link de referência desta seleção está em revisão na planilha.'; list.before(note);
  }
  if (selection.fee?.text) {
    const fee = document.createElement('p'); fee.textContent = `Taxa informada: ${selection.fee.text}${selection.fee.isFree ? ' (gratuito)' : ' — valores em reais; confira as condições no edital.'}`; list.before(fee);
  }
  document.querySelector('#admission-empty').hidden = selection.events.length > 0;
  const key = window.ToDentroAuth.storageKey('to-dentro-calendar-dates');
  const read = () => { const saved = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(saved) ? saved : []; };
  for (const event of selection.events) {
    const card = document.createElement('article'); card.className = 'admission-date-card';
    const title = document.createElement('h2'); title.textContent = event.title; card.append(title);
    const text = document.createElement('p');
    text.textContent = event.entries.length ? event.entries.map(entry => entry.date.split('-').reverse().join('/')).join(' e ') : event.dateSpec.text;
    card.append(text);
    if (event.entries.some(entry => entry.yearInferred)) {
      const note = document.createElement('p'); note.textContent = 'Ano definido conforme o ciclo da seleção informado na planilha.'; card.append(note);
    }
    if (event.needsReview) {
      const note = document.createElement('p'); note.textContent = 'Datas em revisão: a ordem das fases está inconsistente na planilha.'; card.append(note);
    }
    const forecast = catalog.estimates.find(item => item.id === `${selection.id}-${event.id}`);
    if (forecast) { const note = document.createElement('p'); note.textContent = `Previsão${forecast.year ? ` para ${forecast.year}` : ''} · dia ainda não informado.`; card.append(note); }
    const firstDate = event.entries[0]?.date || (forecast?.year ? `${forecast.year}-${String(forecast.month).padStart(2,'0')}-01` : null);
    if (firstDate) {
      const link = document.createElement('a'); link.className = 'button button-ink'; link.textContent = forecast ? 'Ver previsão no calendário' : 'Ver no calendário';
      const destination = new URL('./calendario.html', location.href); destination.searchParams.set('processo', selection.choiceId); destination.searchParams.set('mes', `${firstDate.slice(0,7)}-01`);
      if (selection.universityId) destination.searchParams.set('universidade', selection.universityId);
      link.href = destination.href; card.append(link);
    }
    if (event.entries.length) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'button button-yellow'; button.dataset.authAction = 'calendar';
      function update() {
        let added = false;
        try { added = window.ToDentroAuth.isAuthenticated() && event.entries.every(entry => read().some(item => item.id === entry.id)); } catch { /* Salvar continua disponível. */ }
        button.disabled = added; button.textContent = added ? 'Salvo nos meus lembretes' : 'Salvar nos meus lembretes';
      }
      button.addEventListener('click', () => {
        if (!window.ToDentroAuth.requireLogin('Entre para salvar datas no seu calendário.')) return;
        try {
          const saved = read(); localStorage.setItem(key, JSON.stringify([...saved, ...event.entries.filter(entry => !saved.some(item => item.id === entry.id))])); update();
          document.querySelector('#admission-status').textContent = 'Data salva nos seus lembretes do calendário.';
        } catch { document.querySelector('#admission-status').textContent = 'Não foi possível salvar no navegador. Tente novamente.'; }
      });
      update(); card.append(button);
    }
    list.append(card);
  }
})();
