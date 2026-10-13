(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const form = document.querySelector('#preferences-form');
  for (const input of form.querySelectorAll('input[type="radio"]')) {
    if (params.has(input.name)) input.checked = params.get(input.name) === input.value;
  }
  document.querySelector('#preserved-query').value = params.get('busca') || '';
  document.querySelector('#preserved-sort').value = params.get('sort') || 'relevance';
  document.querySelector('#filters-back').href = `./buscar-universidades.html?${params}`;
  if (params.get('return') === 'perfil') {
    form.action = './perfil.html';
    const backParams = new URLSearchParams(params);
    backParams.delete('return');
    document.querySelector('#filters-back').href = `./perfil.html?${backParams}`;
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = 'return'; input.value = 'perfil'; form.append(input);
  }
  if (params.get('return') === 'mapa') {
    document.querySelector('#filters-back').href = `./mapa.html?${params}`;
    form.action = './mapa.html';
    for (const name of ['universidade', 'from', 'cidade', 'return']) {
      if (!params.has(name)) continue;
      const input = document.createElement('input');
      input.type = 'hidden'; input.name = name; input.value = params.get(name); form.append(input);
    }
  }
  document.querySelector('#clear-filters').addEventListener('click', () => {
    for (const input of form.querySelectorAll('input[type="radio"]')) {
      input.checked = input.name === 'course' && input.value === '';
    }
    // Enviar todos os grupos vazios ao aplicar, sem restaurar os filtros iniciais.
    for (const name of ['region', 'type', 'mode', 'period', 'cost']) {
      if (!form.querySelector(`input[type="hidden"][name="${name}"]`)) {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = name; input.value = '';
        form.append(input);
      }
    }
  });
  form.addEventListener('submit', () => {
    for (const input of form.querySelectorAll('input[type="hidden"]')) {
      if (form.querySelector(`input[type="radio"][name="${input.name}"]:checked`)) input.remove();
    }
  });
})();
