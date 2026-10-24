(async () => {
  'use strict';
  if(window.ToDentroCoursesReady)await window.ToDentroCoursesReady;
  await window.ToDentroAuth.ready;
  const params=new URLSearchParams(location.search),comparison=window.ToDentroComparison,ui=window.ToDentroAcademicUI;
  const course=window.ToDentroData.getCourse(params.get('curso')),selection=comparison.readSelection(params);
  const set=(id,value)=>{document.getElementById(id).textContent=value;};
  document.getElementById('results-back').href='./filtros-comparacao.html?'+params;
  if(!course || selection.length<2){document.getElementById('results-empty').hidden=false;return;}
  const state=comparison.serialize(course.id,selection),filtersUrl='./filtros-comparacao.html?'+state;
  for(const id of ['results-back','results-add','results-edit'])document.getElementById(id).href=filtersUrl;
  set('results-subtitle',course.name);
  document.title=`Comparar notas · ${course.name} | Tô Dentro`;
  set('results-process',[...new Set(selection.map(item=>item.process.name))].join(' · '));
  set('results-context','Universidade, campus, processo, modalidade, turno e edição estão identificados em cada opção.');
  set('results-count',selection.length);
  document.getElementById('results-chart-section').hidden=false;
  const values=selection.flatMap(item=>item.reference.format==='range'?[item.reference.minimum,item.reference.maximum]:[item.score]).filter(Number.isFinite);
  const maxValue=Math.max(1,...values);
  const sharedScale=selection.every(item=>item.reference.scale===selection[0].reference.scale)&&Number.isFinite(selection[0].reference.scale)?selection[0].reference.scale:null;
  const axis=sharedScale && sharedScale>=maxValue?sharedScale:10**Math.ceil(Math.log10(maxValue));
  set('results-scale',sharedScale?`Escala de 0 a ${axis.toLocaleString('pt-BR')} pontos`:'Valores das referências selecionadas');
  set('results-axis-max',axis);set('results-axis-mid',axis/2);
  set('results-range',values.length>=2?ui.score({value:Math.max(...values)-Math.min(...values)}):'—');
  document.getElementById('results-chart').setAttribute('aria-label',selection.map(item=>`${item.university.acronym}, ${item.campus.name}: ${ui.score(item.reference)}`).join('; '));
  const bankIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 7 10-5 10 5H2ZM4 20h16M2 22h20M5 9v9m5-9v9m4-9v9m5-9v9"/></svg>';
  selection.forEach((item,index)=>{
    const color=['blue','green','yellow'][index%3];
    const column=document.createElement('div');column.className='chart-column';
    column.innerHTML=`<div class="bar-track"><div class="bar ${color}"><strong></strong></div></div><span></span>`;
    const value=item.reference.format==='range'?item.reference.maximum:item.score;
    column.querySelector('.bar').style.height=`${Number.isFinite(value)?value/axis*100:0}%`;
    column.querySelector('strong').textContent=ui.score(item.reference);
    column.querySelector('span').textContent=`${index+1}. ${item.university.acronym}`;
    document.getElementById('results-bars').append(column);
    const card=document.createElement('article');card.className='option-card';
    card.innerHTML=`<div class="option-top"><span class="result-icon ${color}">${bankIcon}</span><h3></h3><div class="option-score"><small></small><strong></strong></div></div><p class="option-location"><span class="material-symbols-outlined" aria-hidden="true">location_on</span><span class="option-campus-name"></span></p><p class="option-mode"></p><div class="option-links"><a class="know-course">Conhecer curso →</a><a class="official" target="_blank" rel="noopener noreferrer">Site oficial ↗</a></div>`;
    card.querySelector('h3').textContent=item.university.acronym;
    card.querySelector('.option-score small').textContent=item.reference.format==='range'?'Faixa de notas':'Nota de corte';
    card.querySelector('.option-score strong').textContent=ui.score(item.reference);
    card.querySelector('.option-campus-name').textContent=[item.campus.name,item.campus.state].filter(Boolean).join(' · ');
    card.querySelector('.option-mode').textContent=[item.process.name,item.reference.edition,ui.category(item.reference.selectionCategoryId),ui.period(item.offering.periodId),item.reference.stageId?ui.stage(item.reference.stageId):null].filter(Boolean).join(' · ');
    card.querySelector('.know-course').href='./curso.html?'+new URLSearchParams({universidade:item.id,curso:course.id,oferta:item.offeringId});
    card.querySelector('.official').href=ui.safeUrl(item.reference.officialSource||item.site);
    document.getElementById('results-options').append(card);
  });
  const storageKey = window.ToDentroAuth.storageKey('to-dentro-saved-comparisons');
  const identity = state.toString();
  const save = document.getElementById('results-save');
  function readSaved() {
    try { const value = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []; } catch { return []; }
  }
  let saved = readSaved();
  function updateSave() { const exists = window.ToDentroAuth.isAuthenticated() && saved.includes(identity); save.setAttribute('aria-pressed', String(exists)); set('results-save-label', exists ? 'Comparação salva' : 'Salvar comparação'); }
  save.addEventListener('click', () => {
    if (!window.ToDentroAuth.requireLogin('Entre para salvar esta comparação.')) return;
    saved = readSaved();
    if (saved.includes(identity)) { set('results-status', 'Esta comparação já está salva neste navegador.'); updateSave(); return; }
    try { localStorage.setItem(storageKey, JSON.stringify([...saved, identity])); saved.push(identity); updateSave(); set('results-status', 'Comparação salva! Acesse pela aba Salvos.'); }
    catch { set('results-status', 'Não foi possível salvar neste navegador. Tente novamente.'); }
  });
  updateSave();
  document.getElementById('results-content').hidden = false;
})();
