(async () => {
  'use strict';
  await window.ToDentroUniversitiesReady;
  await window.ToDentroAdmissionsReady;
  const catalog = window.ToDentroAdmissionCatalog;
  const params = new URLSearchParams(location.search);
  const university = document.querySelector('#dates-university');
  const process = document.querySelector('#dates-exam');
  const status = document.querySelector('#dates-status');
  for (const item of window.ToDentroUniversities) university.append(new Option(`${item.acronym} — ${item.name}`, item.id));
  university.value = params.get('universidade') || '';
  const back = new URL('./calendario.html', location.href);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    if (from.origin === back.origin && from.pathname === back.pathname) back.search = from.search;
  }
  document.querySelector('#dates-back').href = back.href;
  function populate(selected = '') {
    const choices = catalog?.choicesForUniversity(university.value) || [];
    process.replaceChildren(new Option('Escolha um processo', ''));
    for (const choice of choices) process.append(new Option(choice.name, choice.id));
    process.value = choices.some(item => item.id === selected) ? selected : choices[0]?.id || '';
    status.textContent = university.value ? 'Escolha o processo que deseja consultar para esta universidade.' : 'ENEM, Sisu, ProUni e Provão Paulista têm calendários próprios. Não é necessário escolher uma universidade.';
  }
  populate(params.get('programa') || params.get('processo') || params.get('exame') || '');
  university.addEventListener('change', () => populate());
  document.querySelector('#explore-dates-form').addEventListener('submit', event => {
    event.preventDefault();
    const choice = catalog?.choices.find(item => item.id === process.value);
    if (!choice) { status.textContent = 'Escolha um processo seletivo.'; return; }
    const destination = new URL('./datas.html', location.href);
    if (choice.universityId) destination.searchParams.set('universidade', choice.universityId);
    destination.searchParams.set(choice.programId ? 'programa' : 'processo', choice.id);
    const state = new URLSearchParams(params); state.set('universidade', university.value); state.set('processo', choice.id);
    state.delete('exame'); state.delete('programa');
    destination.searchParams.set('from', `${location.pathname}?${state}`);
    location.href = destination.href;
  });
})();
