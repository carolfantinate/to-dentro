(() => {
  'use strict';
  const select = document.querySelector('#inclusion-university');
  const form = document.querySelector('#inclusion-university-form');
  const sites = {
    usp: 'https://prip.usp.br/apoio-estudantil/',
    unesp: 'https://www.unesp.br/permanenciaestudantil',
    unicamp: 'https://deape.unicamp.br/',
  };
  for (const university of window.ToDentroUniversities) {
    if (!sites[university.id]) continue;
    select.append(new Option(`${university.acronym} · ${university.name}`, university.id));
  }
  const selected = new URLSearchParams(location.search).get('universidade');
  if (window.ToDentroUniversities.some(item => item.id === selected) && Object.hasOwn(sites, selected)) select.value = selected;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity() || !Object.hasOwn(sites, select.value)) return;
    location.assign(sites[select.value]);
  });
})();
