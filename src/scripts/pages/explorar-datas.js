(async () => {
  'use strict';
  if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady;
  const universities = window.ToDentroUniversities;
  const processes = [
    { id: 'fuvest', name: 'Fuvest', universityId: 'usp' },
    { id: 'enem', name: 'Enem' },
    { id: 'vestibular-unesp', name: 'Vestibular Unesp', universityId: 'unesp' },
    { id: 'vestibular-unicamp', name: 'Vestibular Unicamp', universityId: 'unicamp' },
  ];
  const params = new URLSearchParams(location.search);
  const university = document.querySelector('#dates-university');
  const process = document.querySelector('#dates-exam');
  const program = document.querySelector('#dates-program');
  const status = document.querySelector('#dates-status');
  const results = document.querySelector('#dates-results');

  for (const item of universities) university.append(new Option(`${item.acronym} — ${item.name}`, item.id));
  const back = new URL('./calendario.html', location.href);

  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    if (from.origin === back.origin && from.pathname === back.pathname) back.search = from.search;
  }

  document.querySelector('#dates-back').href = back.href;
  function populateProcesses(selected = '') {
    process.replaceChildren(new Option('Escolha um exame', ''));
    const available = processes.filter(item => !item.universityId || !university.value || item.universityId === university.value);
    for (const item of available) process.append(new Option(item.name, item.id));
    process.value = available.some(item => item.id === selected) ? selected : '';
  }
  university.value = universities.some(item => item.id === params.get('universidade')) ? params.get('universidade') : '';

  const selectedExam = params.get('exame') || params.get('processo') || '';
  if (selectedExam === 'enem') university.value = '';
  populateProcesses(selectedExam);
  if (['sisu', 'prouni'].includes(params.get('programa'))) { program.value = params.get('programa'); university.value = ''; populateProcesses(); }

  function resetFeedback() {
    status.textContent = ''; results.hidden = true;
  }

  university.addEventListener('change', () => {
    program.value = ''; populateProcesses(process.value === 'enem' ? '' : process.value); resetFeedback();
  });

  process.addEventListener('change', () => {
    program.value = '';
    if (process.value === 'enem') { university.value = ''; populateProcesses('enem'); }
    resetFeedback();
  });

  program.addEventListener('change', () => {
    if (program.value) { university.value = ''; populateProcesses(); }
    resetFeedback();
  });
  
  document.querySelector('#explore-dates-form').addEventListener('submit', event => {
    event.preventDefault();
    const selectedProcess = processes.find(item => item.id === process.value);
    const selectedUniversity = universities.find(item => item.id === university.value);
    const selectedLabel = program.value ? (program.value === 'sisu' ? 'Sisu' : 'ProUni') : selectedProcess?.name || selectedUniversity?.name;
    if (!selectedLabel) { status.textContent = 'Escolha uma universidade, exame ou programa.'; return; }
    status.textContent = '';
    const destination = new URL('./datas.html', location.href);
    const state = new URLSearchParams(params);
    state.delete('processo');
    for (const [name, value] of [['universidade', selectedProcess && !selectedProcess.universityId ? '' : selectedUniversity?.id || selectedProcess?.universityId || ''], ['exame', process.value], ['programa', program.value]]) {
      if (value) destination.searchParams.set(name, value);
      state.set(name, value);
    }
    destination.searchParams.set('from', `${location.pathname}?${state}`);
    location.href = destination.href;
  });
})();
