(async () => {
  'use strict';
  if (window.ToDentroCoursesReady) await window.ToDentroCoursesReady;
  const data = window.ToDentroData;
  const ui=window.ToDentroAcademicUI;
  const params = new URLSearchParams(location.search);
  const university = data.getUniversity(params.get('universidade'));
  const course = data.getCourse(params.get('curso'));
  const campus = university && data.getCampus(university.id, params.get('campus'));
  const set = (id, text) => { document.getElementById(id).textContent = text; };
  document.getElementById('result-back').href = `./buscar-nota-de-corte.html?${params}`;
  if (!university || !course || !data.getOfferings({ universityId: university.id, courseId: course.id }).length) {
    document.getElementById('result-invalid').hidden = false;
    return;
  }
  const process = data.getProcess(university.id, params.get('processo'));
  document.title = `Nota de corte · ${course.name} | Tô Dentro`;
  set('result-course', `${course.name} · ${university.acronym}`);
  set('result-process', process?.name || 'Não selecionado');
  set('result-year', params.get('edicao') || 'Não selecionada');
  set('result-category', ui.category(params.get('modalidade')) || 'Não selecionada');
  set('result-stage',ui.stage(params.get('fase')));
  set('result-campus', `${campus?.label || 'Campus não selecionado'} · ${ui.period(params.get('turno')) || 'Turno não selecionado'}`);
  const score = data.findScore({ universityId: university.id, campusId: campus?.id, courseId: course.id,
    processId: process?.id, edition: params.get('edicao'), category: params.get('modalidade'), period: params.get('turno'), offeringId:params.get('oferta'),stageId:params.get('fase')||null });
  set('result-score', ui.score(score));
  document.getElementById('result-score').classList.toggle('unavailable', !score);
  document.getElementById('result-demo').hidden = !score?.isMock;
  set('result-source-name', score?.officialSource ? 'Fonte cadastrada para esta oferta' : university.sourceName || 'Site oficial');
  document.getElementById('result-source').href = ui.safeUrl(score?.officialSource || university.sourceUrl || university.website);
  const offering = score && data.getOfferings({ universityId: university.id, campusId: campus.id, courseId: course.id }).find(item => item.id === score.offeringId);
  document.getElementById('result-course-link').href = `./curso.html?${new URLSearchParams({ universidade: university.id, curso: course.id, ...(offering ? {oferta: offering.id} : {}) })}`;
  document.getElementById('result-compare').href = `./filtros-comparacao.html?${params}`;
  document.getElementById('result-content').hidden = false;
})();
