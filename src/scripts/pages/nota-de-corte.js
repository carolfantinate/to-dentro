(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const university = window.ToDentroUniversities.find(item => item.id === params.get('universidade'));
  const course = window.ToDentroCourseCatalog.courses.find(item => item.value === params.get('curso'));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const set = (id, text) => { document.getElementById(id).textContent = text; };
  document.getElementById('result-back').href = `./buscar-nota-de-corte.html?${params}`;
  if (!university || !course || !university.courses.some(name => normalize(name) === course.value)) {
    document.getElementById('result-invalid').hidden = false;
    return;
  }
  document.title = `Nota de corte · ${course.name} | Tô Dentro`;
  set('result-course', `${course.name} · ${university.acronym}`);
  set('result-process', params.get('processo') || 'Não selecionado');
  set('result-year', params.get('edicao') || 'Não selecionada');
  set('result-category', params.get('modalidade') || 'Não selecionada');
  const campuses = { butanta: 'São Paulo', 'sao-carlos': 'São Carlos', 'ribeirao-preto': 'Ribeirão Preto' };
  const city = university.id === 'usp' && course.value === 'ciencia da computacao' ? campuses[params.get('campus')] : null;
  set('result-campus', `${city || university.city} · ${params.get('turno') || 'Turno não selecionado'}`);
  // Valor fornecido na referência visual; não representa uma nota oficial verificada.
  const demo = university.id === 'usp' && course.value === 'ciencia da computacao'
    && params.get('campus') === 'butanta' && params.get('processo') === 'ENEM-USP'
    && params.get('edicao') === '2026' && params.get('modalidade') === 'Ampla concorrência'
    && params.get('turno') === 'Integral';
  set('result-score', demo ? '782,45' : 'Referência indisponível');
  document.getElementById('result-score').classList.toggle('unavailable', !demo);
  document.getElementById('result-demo').hidden = !demo;
  const sources = {
    usp: ['Fuvest · fuvest.br', 'https://www.fuvest.br/'],
    unesp: ['Unesp · vestibular.unesp.br', 'https://vestibular.unesp.br/'],
    unicamp: ['Comvest · comvest.unicamp.br', 'https://www.comvest.unicamp.br/']
  };
  const [sourceName, sourceUrl] = sources[university.id];
  set('result-source-name', sourceName);
  document.getElementById('result-source').href = sourceUrl;
  document.getElementById('result-course-link').href = `./curso.html?${new URLSearchParams({ universidade: university.id, curso: course.value })}`;
  document.getElementById('result-compare').href = `./filtros-comparacao.html?${params}`;
  document.getElementById('result-content').hidden = false;
})();
