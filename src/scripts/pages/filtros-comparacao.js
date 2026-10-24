(async()=>{
  'use strict';
  if(window.ToDentroCoursesReady)await window.ToDentroCoursesReady;
  if(window.ToDentroUniversitiesReady)await window.ToDentroUniversitiesReady;
  const data=window.ToDentroData,comparison=window.ToDentroComparison,ui=window.ToDentroAcademicUI;
  const params=new URLSearchParams(location.search),course=document.querySelector('#comparison-course'),form=document.querySelector('#comparison-form');
  const selectedList=document.querySelector('#comparison-selected'),status=document.querySelector('#comparison-builder-status');
  const fields=Object.fromEntries([['universidade','university'],['campus','campus'],['turno','shift'],['processo','process'],['edicao','year'],['modalidade','category'],['fase','stage']].map(([key,id])=>[key,document.querySelector('#comparison-'+id)]));
  const catalog=data.views.courseCatalog.courses.filter(item=>data.getScores({courseId:item.id}).length);
  course.replaceChildren(new Option('Selecione o curso',''),...catalog.map(item=>new Option(item.name,item.id)));
  const initial=data.getCourse(params.get('curso'));course.value=catalog.some(item=>item.id===initial?.id)?initial.id:'';
  let selected=comparison.readSelection(params),candidates=[];
  const fill=(key,label,entries,preferred)=>{const select=fields[key];select.replaceChildren(new Option(label,''),...entries.map(([value,text])=>new Option(text,String(value))));select.value=entries.some(([value])=>String(value)===preferred)?preferred:'';};
  function rebuild(preferred=Object.fromEntries(Object.entries(fields).map(([key,field])=>[key,field.value]))){
    const allOffers=course.value?data.getOfferings({courseId:course.value}):[];
    const allScores=course.value?data.getScores({courseId:course.value}):[];
    const universityIds=new Set(allScores.map(score=>score.universityId));
    fill('universidade','Selecione a universidade',data.views.universities.filter(item=>universityIds.has(item.id)).map(item=>[item.id,`${item.acronym} · ${item.name}`]),preferred.universidade);
    const offers=allOffers.filter(item=>item.universityId===fields.universidade.value);
    const campusIds=new Set(offers.map(item=>item.campusId));
    fill('campus','Selecione o campus',data.getCampuses(fields.universidade.value).filter(item=>campusIds.has(item.id)).map(item=>[item.id,item.label||item.name]),preferred.campus);
    const campusOffers=offers.filter(item=>item.campusId===fields.campus.value);
    fill('turno','Selecione o turno',[...new Set(campusOffers.map(item=>item.periodId))].map(id=>[id,ui.period(id)]),preferred.turno);
    const offerIds=new Set(campusOffers.filter(item=>item.periodId===fields.turno.value).map(item=>item.id));
    let scores=allScores.filter(item=>offerIds.has(item.offeringId));
    fill('processo','Selecione o processo',data.getProcesses(fields.universidade.value).filter(process=>scores.some(score=>score.processId===process.id)).map(item=>[item.id,item.name]),preferred.processo);
    scores=scores.filter(item=>item.processId===fields.processo.value);
    fill('edicao','Selecione a edição',[...new Set(scores.map(item=>item.edition))].sort((a,b)=>b-a).map(year=>[year,year]),preferred.edicao);
    scores=scores.filter(item=>String(item.edition)===fields.edicao.value);
    fill('modalidade','Selecione a modalidade',[...new Set(scores.map(item=>item.selectionCategoryId))].map(id=>[id,ui.category(id)]),preferred.modalidade);
    scores=scores.filter(item=>item.selectionCategoryId===fields.modalidade.value);
    const phases=[...new Set(scores.map(item=>item.stageId||''))];
    fields.fase.replaceChildren(...(phases.includes('')?[]:[new Option('Selecione a fase','')]),...phases.map(id=>new Option(ui.stage(id),id)));
    fields.fase.value=phases.includes(preferred.fase)?preferred.fase:'';
    candidates=scores.filter(item=>(item.stageId||'')===fields.fase.value);
    document.querySelector('#comparison-add').disabled=candidates.length!==1;
  }
  function persist(){
    const state=comparison.serialize(course.value,selected);
    if(params.get('from'))state.set('from',params.get('from'));
    window.history?.replaceState(window.history.state,'',location.pathname+'?'+state);
  }
  function render(){
    selectedList.replaceChildren();
    selected.forEach(item=>selectedList.append(window.ToDentroComparisonUI.card(item,()=>{selected=selected.filter(other=>other.key!==item.key);persist();render();})));
    const count=new Set(selected.map(item=>item.university.id)).size;
    document.querySelector('#comparison-count').textContent=`${selected.length} ${selected.length===1?'opção selecionada':'opções selecionadas'} · ${count} ${count===1?'universidade':'universidades'}`;
    document.querySelector('#comparison-submit-label').textContent=`Comparar ${selected.length} ${selected.length===1?'opção':'opções'}`;
    document.querySelector('#comparison-submit').disabled=selected.length<2;
    document.querySelector('#comparison-validation').textContent=selected.length<2?'Adicione pelo menos duas opções para comparar.':'';
  }
  const emptyBuilder=()=>rebuild(Object.fromEntries(Object.keys(fields).map(key=>[key,''])));
  const preferred=Object.fromEntries(Object.keys(fields).map(key=>[key,params.get(key)||'']));
  const previousCampus=data.getCampus(preferred.universidade,preferred.campus);if(previousCampus)preferred.campus=previousCampus.id;
  const previousProcess=data.getProcess(preferred.universidade,preferred.processo);if(previousProcess)preferred.processo=previousProcess.id;
  const period=data.source.general.periods.find(item=>item.name===preferred.turno);if(period)preferred.turno=period.id;
  const category=data.source.general.selectionCategories.find(item=>item.name===preferred.modalidade);if(category)preferred.modalidade=category.id;
  rebuild(preferred);render();
  Object.values(fields).forEach(field=>field.addEventListener('change',()=>{status.textContent='';rebuild();}));
  course.addEventListener('change',()=>{selected=[];emptyBuilder();persist();render();status.textContent='Curso alterado. Adicione as opções que deseja comparar.';});
  document.querySelector('#comparison-clear-fields').addEventListener('click',()=>{emptyBuilder();status.textContent='Campos limpos. As opções salvas na comparação foram mantidas.';});
  document.querySelector('#comparison-clear-all').addEventListener('click',()=>{selected=[];emptyBuilder();persist();render();status.textContent='Comparação limpa.';});
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!course.value || !form.reportValidity() || candidates.length!==1)return;
    const item=comparison.resolve(candidates[0].id,course.value);if(!item)return;
    if(selected.some(other=>other.key===item.key)){status.textContent='Esta opção, com esses critérios, já está na comparação.';return;}
    selected.push(item);emptyBuilder();persist();render();status.textContent='Opção adicionada. Preencha os campos para adicionar outra.';
  });
  document.querySelector('#comparison-submit').addEventListener('click',()=>{if(selected.length>=2)location.href='./comparacao-notas.html?'+comparison.serialize(course.value,selected);});
  if(params.has('referencia')||params.has('opcao'))document.querySelector('#comparison-back').href='./comparacao-notas.html?'+params;
  else if(params.get('universidade'))document.querySelector('#comparison-back').href='./nota-de-corte.html?'+params;
})();
