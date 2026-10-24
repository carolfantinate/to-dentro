const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');
(async()=>{
  const fixture=JSON.parse(read('tools/universities-import/courses.json'));
  const campusFixture=JSON.parse(read('tools/universities-import/campuses.json')).campuses;
  const universities=JSON.parse(read('tools/universities-import/universities.json')).universities;
  const queries=[];
  const service=vm.createContext({db:{},collection:(_db,...path)=>path.join('/'),getDocsFromServer:async path=>{
    queries.push(path);const parts=path.split('/');let records=[];
    if(parts.length===3 && parts[2]==='courses')records=fixture.courses.filter(item=>item.universityId===parts[1]);
    if(parts.length===3 && parts[2]==='campuses')records=campusFixture.filter(item=>item.universityId===parts[1]);
    if(parts.length===3 && parts[2]==='admissionProcesses')records=fixture.processes.filter(item=>item.universityId===parts[1]);
    if(parts.length===5)records=fixture.offerings.filter(item=>item.universityId===parts[1] && item.campusId===parts[3]);
    if(parts.length===7)records=fixture.cutoffScores.filter(item=>item.offeringId===parts[5]);
    return {docs:records.map(record=>({id:record.id,data:()=>record}))};
  }});
  vm.runInContext(read('services/academics.js').replace(/^import .*;\r?\n/gm,'').replaceAll('export async function','async function'),service);
  const groups=await service.getAcademics(universities);assert.equal(groups.length,1);assert.equal(groups[0].offerings.length,12);assert.equal(groups[0].cutoffScores.length,29);
  assert.equal(queries.filter(path=>path.endsWith('/cutoffScores')).length,12);
  class Element{
    constructor(){this.children=[];this.listeners={};this.elements=new Map();this.hidden=false;this.classList={toggle(){}};}
    append(...nodes){this.children.push(...nodes);}
    replaceChildren(...nodes){this.children=nodes;}
    querySelector(selector){if(!this.elements.has(selector))this.elements.set(selector,new Element());return this.elements.get(selector);}
    closest(){return this;}
    setAttribute(name,value){this[name]=value;}
    addEventListener(name,handler){this.listeners[name]=handler;}
  }
  async function page(course,extra=''){
    const elements=new Map();const element=key=>{if(!elements.has(key))elements.set(key,new Element());return elements.get(key);};
    const context=vm.createContext({URL,URLSearchParams,window:{},document:{querySelector:element,getElementById:id=>element('#'+id),querySelectorAll:()=>[],createElement:()=>new Element()},location:{href:`http://localhost/src/pages/curso.html?universidade=usp&curso=${course}${extra}`,search:`?universidade=usp&curso=${course}${extra}`,pathname:'/src/pages/curso.html'},localStorage:{getItem:()=>null,setItem(){} }});
    vm.runInContext(read('src/data/mock-data.js'),context);vm.runInContext(read('src/data/catalog.js'),context);
    context.window.ToDentroData.applyAcademics(groups);
    context.window.ToDentroUniversities=context.window.ToDentroData.views.universities;
    context.window.ToDentroAuth={ready:Promise.resolve(),storageKey:key=>key,isAuthenticated:()=>false};
    context.window.ToDentroCoursesReady=Promise.resolve(true);
    vm.runInContext(read('src/scripts/components/academic-details.js'),context);
    await vm.runInContext(read('src/scripts/pages/curso.js'),context);
    return {context,elements,data:context.window.ToDentroData};
  }
  const med=await page('medicina');
  assert.equal(med.data.getOfferings({universityId:'usp'}).length,12);
  assert.equal(med.elements.get('#course-overview').children[3].querySelector('h3').textContent,'12 semestres');
  assert.equal(med.elements.get('#course-campuses').children.length,3);
  assert.ok(med.elements.get('#course-campuses').children.every(card=>new URL(card.children[1].href).pathname.endsWith('/mapa.html')));
  assert.ok(med.elements.get('#course-campuses').children[0].children[0].children.some(node=>String(node.textContent).includes('175 vagas por ano')));
  assert.equal(med.elements.get('#course-entry').children.length,3);
  assert.equal(med.elements.get('#course-scores').children.length,0);
  assert.match(med.elements.get('#course-score-message').textContent,/Selecione/);
  const campusFilter=med.elements.get('#course-score-campus');
  const processFilter=med.elements.get('#course-score-process');
  const categoryFilter=med.elements.get('#course-score-category');
  campusFilter.value='usp-bauru';campusFilter.listeners.change();
  assert.equal(med.elements.get('#course-scores').children.length,1);
  assert.equal(med.elements.get('#course-scores').children[0].children.length,3); // Título e duas notas.
  processFilter.value='usp-enem-usp';processFilter.listeners.change();
  assert.equal(med.elements.get('#course-scores').children[0].children.length,2);
  assert.equal(med.elements.get('#course-scores').children[0].children[1].children[1].textContent,'835,05');
  categoryFilter.value='ampla-concorrencia';categoryFilter.listeners.change();
  assert.equal(med.elements.get('#course-scores').children.length,1);
  const compare=new URL(med.elements.get('#course-cutoff-link').href,'http://localhost/src/pages/curso.html');
  assert.equal(compare.pathname,'/src/pages/buscar-nota-de-corte.html');
  assert.ok(!read('src/pages/curso.html').includes('course-compare-link'));
  assert.match(read('src/pages/curso.html'),/id="course-cutoff-link" class="button button-ink"/);
  assert.equal(compare.searchParams.get('campus'),'usp-bauru');assert.equal(compare.searchParams.get('edicao'),'2025');
  assert.equal(compare.searchParams.get('processo'),'usp-enem-usp');
  categoryFilter.value='l1';categoryFilter.listeners.change();
  assert.equal(med.elements.get('#course-scores').children.length,0);
  assert.match(med.elements.get('#course-score-message').textContent,/Nenhuma nota/);
  med.elements.get('#course-score-clear').listeners.click();
  assert.equal(campusFilter.value,'');assert.equal(processFilter.value,'');assert.equal(categoryFilter.value,'');
  assert.equal(med.elements.get('#course-scores').children.length,0);
  categoryFilter.value='l1';categoryFilter.listeners.change();
  assert.equal(med.elements.get('#course-scores').children.length,1);
  assert.match(med.elements.get('#course-scores').children[0].children[1].children[0].textContent,/Provão Paulista/);
  assert.equal(categoryFilter.children.filter(option=>option.value==='l1').length,1);
  const restored=await page('medicina','&nota-campus=usp-bauru&nota-category=ampla-concorrencia&nota-process=usp-enem-usp');
  assert.equal(restored.elements.get('#course-score-campus').value,'usp-bauru');
  assert.equal(restored.elements.get('#course-score-process').value,'usp-enem-usp');
  assert.equal(restored.elements.get('#course-scores').children.length,1);
  const law=await page('direito');assert.equal(law.elements.get('#course-campuses').children.length,2);
  assert.equal(law.elements.get('#course-campuses').children[0].children[0].children.filter(node=>String(node.textContent).includes('vagas')).length,2);
  const data=med.data;
  const filter={universityId:'usp',courseId:'medicina',campusId:'usp-cidade-universitaria',periodId:'integral',edition:2025,selectionCategoryId:'ampla-concorrencia'};
  assert.equal(data.findScore({...filter,processId:'usp-enem-usp'}).value,840.35);
  assert.equal(data.findScore({...filter,processId:'usp-fuvest'}),null);
  assert.equal(data.findScore({...filter,processId:'usp-fuvest',stageId:'fase-1'}).value,80);
  const range=data.findScore({...filter,processId:'usp-fuvest',stageId:'fase-2'});
  assert.equal(range.value,null);assert.equal(med.context.window.ToDentroAcademicUI.score(range),'80,00 a 88,00');
  assert.equal(data.findScore({...filter,processId:'usp-enem-usp',context:'comparison'}),null);
  assert.equal(data.getOfferings({universityId:'usp',courseId:'sistemas-de-informacao'}).length,3);
  const uniContext=med.context;
  uniContext.location.search='?id=usp';
  uniContext.window.ToDentroSaved={getUniversities:()=>[],toggleUniversity:()=>null};
  await vm.runInContext(read('src/scripts/pages/universidade.js'),uniContext);
  const cutoffLink=new URL(med.elements.get('#university-cutoff-link').href,'http://localhost/src/pages/universidade.html');
  assert.equal(cutoffLink.searchParams.get('universidade'),'usp');assert.equal(cutoffLink.searchParams.has('curso'),false);
  assert.ok(!read('src/pages/universidade.html').includes('university-selection-site'));
  assert.ok(!read('src/pages/universidade.html').includes('university-source'));
  assert.ok(!read('src/scripts/pages/curso.js').includes('Vínculo provisório'));
  class Select extends Element{
    replaceChildren(...options){this.options=options;this.value=options[0]?.value||'';}
  }
  const fields=new Map();const form=new Element();form.reportValidity=()=>true;
  const selectIds=['course','university','campus','shift','process','year','category','stage'];
  for(const id of selectIds)fields.set('#cutoff-'+id,new Select());
  fields.set('#cutoff-form',form);fields.set('#cutoff-back',new Element());fields.set('#cutoff-status',new Element());
  const lookup=selector=>fields.get(selector);
  const cutoffContext=vm.createContext({URL,URLSearchParams,window:med.context.window,location:{search:'?universidade=usp',href:'http://localhost/src/pages/buscar-nota-de-corte.html?universidade=usp'},document:{querySelector:lookup},Option:class{constructor(text,value){this.text=text;this.value=value;}}});
  await vm.runInContext(read('src/scripts/pages/buscar-nota-de-corte.js'),cutoffContext);
  assert.equal(fields.get('#cutoff-university').value,'usp');assert.equal(fields.get('#cutoff-course').value,'');
  assert.equal(form.querySelector('[type="submit"]').disabled,true);
  fields.get('#cutoff-course').value='medicina';fields.get('#cutoff-course').listeners.change();
  assert.equal(fields.get('#cutoff-year').value,'2025');
  assert.equal(form.querySelector('[type="submit"]').disabled,false);
  const resultContext=med.context;resultContext.location.search='?universidade=usp&curso=medicina&campus=usp-cidade-universitaria&processo=usp-fuvest&edicao=2025&modalidade=ampla-concorrencia&turno=integral&fase=fase-2';
  await vm.runInContext(read('src/scripts/pages/nota-de-corte.js'),resultContext);
  assert.equal(med.elements.get('#result-score').textContent,'80,00 a 88,00');
  assert.equal(med.elements.get('#result-stage').textContent,'2ª fase');
  assert.ok(med.elements.get('#result-compare').href.startsWith('./filtros-comparacao.html?')); 
  service.getDocsFromServer=async()=>{throw new Error('permission-denied');};await assert.rejects(service.getAcademics(universities));
  console.log('OK: leitura, 12 ofertas/29 notas, Medicina 12 semestres, vagas por turno, campi no mapa, ingresso, fases/faixas e resultado associado.');
})().catch(error=>{console.error(error);process.exitCode=1;});
