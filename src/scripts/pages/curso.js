(async () => {
  'use strict';
  if (window.ToDentroCoursesReady) await window.ToDentroCoursesReady;
  if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady;
  await window.ToDentroAuth.ready;
  const params = new URLSearchParams(location.search);
  const university = window.ToDentroUniversities.find(item => item.id === params.get('universidade'));
  const course = window.ToDentroData.getCourse(params.get('curso'));
  const data = window.ToDentroData;
  const ui = window.ToDentroAcademicUI;
  const offerings = university && course ? data.getOfferings({ universityId: university.id, courseId: course.id }) : [];
  const selectedOffering = params.has('oferta') ? offerings.find(item => item.id === params.get('oferta')) : null;
  if (!university || !course || !offerings.length || (params.has('oferta') && !selectedOffering)) {
    document.querySelector('#course-not-found').hidden = false;
    return;
  }
  const paths = {
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',
    university: '<path d="m2 7 10-5 10 5H2Zm2 13h16M2 22h20M5 9v9m5-9v9m4-9v9m5-9v9"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 5v7l5 3"/>',
    document: '<path d="M5 2h9l5 5v15H5V2Zm9 0v6h5M8 12h8m-8 4h8"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
    chart: '<path d="M3 3v18h19M6 15l5-6 5 3 6-9"/>',
    screen: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v5m-6 0h12"/>',
    science: '<path d="M8 2h8m-6 0v8L4 20q-1 2 2 2h12q3 0 2-2l-6-10V2M7 16h10"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.document}</svg>`;
  const back = new URL('./cursos.html', location.href);
  back.searchParams.set('universidade', university.id);
  if (params.get('from')) {
    const from = new URL(params.get('from'), location.href);
    if (from.origin === back.origin && from.pathname === back.pathname && from.searchParams.get('universidade') === university.id) back.search = from.search;
  }
  document.querySelector('#course-back').href = back.href;
  document.title = `${course.name} · ${university.acronym} | Tô Dentro`;
  document.querySelector('#course-name').textContent = course.name;
  document.querySelector('#course-university').textContent = `${university.acronym} · ${university.name}`;
  const content = data.getCourseContent(course.id);
  document.querySelector('#course-intro-title').textContent = content.introTitle;
  document.querySelector('#course-description').textContent = content.description || `Explore a formação em ${course.name} e conheça as possibilidades dessa área.`;
  const shownOfferings = selectedOffering ? [selectedOffering] : offerings;
  const mode = [...new Set(shownOfferings.map(offer=>data.source.general.modes.find(item=>item.id===offer.modeId)?.name || offer.modeId))].join(' / ');
  const period = [...new Set(shownOfferings.map(offer=>ui.period(offer.periodId)))].join(' / ');
  const durations = [...new Set(shownOfferings.map(ui.duration))];
  const overview = [
    ['university', course.degree, 'Formação de graduação.', 'blue'],
    ['pin', mode, 'Atividades no campus.', 'green'],
    ['clock', period, 'Confira a oferta da unidade.', 'yellow'],
    ['document', durations.length===1?durations[0]:'Duração por campus', durations.length===1?'Duração da formação.':'Confira a duração em cada oferta abaixo.', 'blue']
  ];
  for (const [symbol, title, description, color] of overview) {
    const card = document.createElement('article'); card.className = color;
    card.innerHTML = `${icon(symbol)}<h3></h3><p></p>`;
    card.querySelector('h3').textContent = title; card.querySelector('p').textContent = description;
    document.querySelector('#course-overview').append(card);
  }
  function renderItems(target, items) {
    for (const [symbol, title, color] of items) {
      const card = document.createElement('article'); card.className = 'course-panel';
      card.innerHTML = `<span class="course-icon ${color}">${icon(symbol)}</span><strong></strong>`;
      card.querySelector('strong').textContent = title; document.querySelector(target).append(card);
    }
  }
  renderItems('#course-subjects', content.subjects);
  renderItems('#course-careers', content.careers);
  if(offerings.some(offer=>offer.dataSource==='firestore')) {
    document.querySelector('.course-intro').hidden=true;
    document.querySelector('#course-subjects').closest('section').hidden=true;
    document.querySelector('#course-careers').closest('section').hidden=true;
  }
  const ownScores=data.getScores({universityId:university.id,courseId:course.id});
  const campusIds=[...new Set(offerings.map(offer=>offer.campusId))];
  for(const campusId of campusIds){
    const campus=data.getCampus(university.id,campusId);
    const own=offerings.filter(offer=>offer.campusId===campusId);
    const card=document.createElement('article');card.className='course-panel course-campus-row';
    const info=document.createElement('div');info.className='course-campus-info';
    const title=document.createElement('h3');title.textContent=campus?.name || campusId;info.append(title);
    for(const offer of own){const details=document.createElement('p');details.textContent=[ui.period(offer.periodId),ui.duration(offer),Number.isInteger(offer.seats)?`${offer.seats} vagas${offer.seatsPeriod==='year'?' por ano':''}`:'Vagas não informadas'].join(' · ');info.append(details);}
    const link=document.createElement('a');link.className='course-campus-map';
    const map=new URL('./mapa.html',location.href);map.searchParams.set('universidade',university.id);map.searchParams.set('campus',campusId);map.searchParams.set('from',location.pathname+location.search);link.href=map.href;
    link.setAttribute('aria-label',`Ver ${campus?.name || campusId} no mapa`);link.title=`Ver ${campus?.name || campusId} no mapa`;
    const symbol=document.createElement('span');symbol.className='material-symbols-outlined';symbol.setAttribute('aria-hidden','true');symbol.textContent='map';link.append(symbol);
    card.append(info,link);document.querySelector('#course-campuses').append(card);
  }
  const processes=data.getProcesses(university.id).filter(process=>ownScores.some(score=>score.processId===process.id));
  for(const process of processes){
    const card=document.createElement('li');card.className='course-entry-item';
    const name=document.createElement('strong');name.textContent=process.name;
    const years=document.createElement('span');years.textContent='Edições: '+[...new Set(ownScores.filter(score=>score.processId===process.id).map(score=>score.edition))].sort().join(', ');
    card.append(name,years);document.querySelector('#course-entry').append(card);
  }
  if(!processes.length)document.querySelector('#course-entry').textContent='Consulte as formas de ingresso no site oficial da instituição.';
  const scoreFilters={
    campus:document.querySelector('#course-score-campus'),
    category:document.querySelector('#course-score-category'),
    process:document.querySelector('#course-score-process')
  };
  const fill=(select,label,entries)=>{
    const option=(value,text)=>{const node=document.createElement('option');node.value=value;node.textContent=text;return node;};
    select.replaceChildren(option('',label),...entries.map(([value,text])=>option(value,text)));
    select.value='';
  };
  fill(scoreFilters.campus,'Todos os campi',campusIds.filter(id=>ownScores.some(score=>score.campusId===id)).map(id=>[id,data.getCampus(university.id,id)?.name||id]));
  fill(scoreFilters.category,'Todas as modalidades',[...new Set(ownScores.map(score=>score.selectionCategoryId))].map(id=>[id,ui.category(id)]));
  fill(scoreFilters.process,'Todos os processos',processes.map(process=>[process.id,process.name]));
  const scoreContainer=document.querySelector('#course-scores');
  const scoreMessage=document.querySelector('#course-score-message');
  function renderScores(){
    scoreContainer.replaceChildren();
    const active=Object.values(scoreFilters).some(select=>select.value);
    const matches=ownScores.filter(score=>(!scoreFilters.campus.value || score.campusId===scoreFilters.campus.value)
      && (!scoreFilters.category.value || score.selectionCategoryId===scoreFilters.category.value)
      && (!scoreFilters.process.value || score.processId===scoreFilters.process.value));
    const previewURL=new URL(location.href);
    for(const [key,select] of Object.entries(scoreFilters)){
      if(select.value)previewURL.searchParams.set(`nota-${key}`,select.value);
      else previewURL.searchParams.delete(`nota-${key}`);
    }
    if(previewURL.href!==location.href)window.history?.replaceState(window.history.state,'',previewURL.pathname+previewURL.search+previewURL.hash);
    const context={universidade:university.id,curso:course.id,from:previewURL.pathname+previewURL.search};
    if(scoreFilters.campus.value)context.campus=scoreFilters.campus.value;
    if(scoreFilters.category.value)context.modalidade=scoreFilters.category.value;
    if(scoreFilters.process.value)context.processo=scoreFilters.process.value;
    const years=[...new Set(matches.map(score=>score.edition))];
    if(years.length===1)context.edicao=years[0];
    document.querySelector('#course-cutoff-link').href=`./buscar-nota-de-corte.html?${new URLSearchParams(context)}`;
    scoreMessage.hidden=false;
    scoreMessage.textContent=!ownScores.length?'Nenhuma nota cadastrada para este curso.':!active?'Selecione pelo menos um filtro para consultar as notas.':!matches.length?'Nenhuma nota cadastrada para essa combinação de filtros.':`${matches.length} ${matches.length===1?'referência encontrada':'referências encontradas'}.`;
    if(!active || !matches.length)return;
  for(const offer of offerings){
    const scores=matches.filter(score=>score.offeringId===offer.id);
    if(!scores.length)continue;
    const panel=document.createElement('article');panel.className='course-score-panel';
    const heading=document.createElement('h3');heading.textContent=`${data.getCampus(university.id,offer.campusId)?.name || offer.campusId} · ${ui.period(offer.periodId)}`;panel.append(heading);
    for(const score of scores){
      const row=document.createElement('a');row.className='course-score-row';
      row.href=`./nota-de-corte.html?${new URLSearchParams({universidade:university.id,curso:course.id,oferta:offer.id,campus:offer.campusId,processo:score.processId,edicao:score.edition,modalidade:score.selectionCategoryId,turno:offer.periodId,fase:score.stageId||''})}`;
      const context=document.createElement('span');context.textContent=[data.getProcess(university.id,score.processId)?.name,score.edition,ui.category(score.selectionCategoryId),score.stageId?ui.stage(score.stageId):null].filter(Boolean).join(' · ');
      const value=document.createElement('strong');value.textContent=ui.score(score);row.append(context,value);panel.append(row);
    }
    document.querySelector('#course-scores').append(panel);
  }
  }
  Object.values(scoreFilters).forEach(select=>select.addEventListener('change',renderScores));
  document.querySelector('#course-score-filters').addEventListener('submit',event=>{event.preventDefault();renderScores();});
  document.querySelector('#course-score-clear').addEventListener('click',()=>{Object.values(scoreFilters).forEach(select=>{select.value='';});renderScores();});
  if(selectedOffering)scoreFilters.campus.value=selectedOffering.campusId;
  for(const [key,select] of Object.entries(scoreFilters)){
    const saved=params.get(`nota-${key}`);
    if(saved!==null && [...select.children].some(option=>option.value===saved))select.value=saved;
  }
  renderScores();
  const official=ui.safeUrl(shownOfferings.find(offer=>offer.officialSource)?.officialSource || university.coursesUrl || university.website);
  document.querySelector('#course-official').href=official;
  document.querySelector('#course-official-title').textContent=`Conheça o curso na ${university.acronym}`;
  for (const element of document.querySelectorAll('[data-icon]')) element.innerHTML = icon(element.dataset.icon);
  const save = document.querySelector('#course-save');
  const key = window.ToDentroAuth.storageKey('to-dentro-saved-courses');
  const id = selectedOffering?.id || `${university.id}:${course.value}`;
  let saved = [];
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(value)) saved = value.filter(item => typeof item === 'string'); } catch { /* Armazenamento indisponível. */ }
  function updateSave() { const active = window.ToDentroAuth.isAuthenticated() && saved.includes(id); save.setAttribute('aria-pressed', String(active)); save.setAttribute('aria-label', active ? 'Remover curso dos salvos' : 'Salvar curso'); }
  save.addEventListener('click', () => {
    if (!window.ToDentroAuth.requireLogin('Entre para salvar este curso.')) return;
    saved = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
    let persisted = true;
    try { localStorage.setItem(key, JSON.stringify(saved)); } catch { persisted = false; }
    updateSave();
    document.querySelector('#course-status').textContent = persisted ? (saved.includes(id) ? 'Curso salvo!' : 'Curso removido dos salvos.') : 'Alteração válida apenas nesta visita; não foi possível salvar no navegador.';
  });
  updateSave(); save.hidden = false;
  document.querySelector('#course-content').hidden = false;
})();
