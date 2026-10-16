(() => {
  'use strict';
  // Catálogo exclusivo da demonstração da comparação; notas e ofertas fictícias.
  const options = {
    usp: { campuses: ['São Paulo · Butantã', 'São Carlos', 'Ribeirão Preto'], score: 785.60, site: 'https://www.usp.br/' },
    unesp: { campuses: ['Rio Claro', 'Bauru', 'São José do Rio Preto'], score: 772.40, site: 'https://www.unesp.br/' },
    unicamp: { campuses: ['Campinas · Barão Geraldo'], score: 754.25, site: 'https://www.unicamp.br/' }
  };
  function readSelection(params) {
    const seen = new Set();
    return params.getAll('opcao').flatMap(value => {
      const [id, rawIndex] = value.split(':');
      const university = window.ToDentroUniversities.find(item => item.id === id && item.state === 'SP');
      const index = Number(rawIndex);
      if (!university || !options[id] || seen.has(id) || !/^\d+$/.test(rawIndex || '') || !Number.isInteger(index) || !options[id].campuses[index]) return [];
      seen.add(id);
      return [{ id, index, university, ...options[id] }];
    });
  }
  window.ToDentroComparison = { options, readSelection };
})();
