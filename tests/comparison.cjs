const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');
class Element{
 constructor(){this.children=[];this.listeners={};this.elements=new Map();this.style={};this.value='';this.hidden=false;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 querySelector(key){if(!this.elements.has(key))this.elements.set(key,new Element());return this.elements.get(key);}
 addEventListener(event,callback){this.listeners[event]=callback;}
 setAttribute(key,value){this[key]=value;}
 reportValidity(){return true;}
}
class Select extends Element{replaceChildren(...options){this.children=options;this.options=options;this.value=options[0]?.value||'';}}
const text=node=>[node.textContent,...node.children.map(text)].filter(Boolean).join(' ');
(async()=>{
 const fixture=JSON.parse(read('tools/universities-import/courses.json'));
 const groups=[{universityId:'usp',courses:fixture.courses,campuses:JSON.parse(read('tools/universities-import/campuses.json')).campuses.filter(item=>item.universityId==='usp'),processes:fixture.processes,offerings:fixture.offerings,cutoffScores:fixture.cutoffScores}];
 async function setup(search){
  const elements=new Map();const selectors=['course','university','campus','shift','process','year','category','stage'];
  selectors.forEach(id=>elements.set('#comparison-'+id,new Select()));
  const element=key=>{if(!elements.has(key))elements.set(key,new Element());return elements.get(key);};
  const context=vm.createContext({URL,URLSearchParams,window:{},document:{querySelector:element,getElementById:id=>element('#'+id),createElement:()=>new Element()},location:{search,href:'http://localhost/app/src/pages/filtros-comparacao.html'+search,pathname:'/app/src/pages/filtros-comparacao.html'},Option:class{constructor(label,value){this.textContent=label;this.value=String(value);}},localStorage:{getItem:()=>null,setItem(){}}});
  vm.runInContext(read('src/data/mock-data.js'),context);vm.runInContext(read('src/data/catalog.js'),context);context.window.ToDentroData.applyAcademics(groups);
  context.window.ToDentroUniversities=context.window.ToDentroData.views.universities;
  context.window.ToDentroAuth={ready:Promise.resolve(),storageKey:key=>key,isAuthenticated:()=>false};
  for(const file of ['src/data/comparisons.js','src/scripts/components/academic-details.js','src/scripts/components/comparison-details.js'])vm.runInContext(read(file),context);
  await vm.runInContext(read('src/scripts/pages/filtros-comparacao.js'),context);
  return {context,elements,data:context.window.ToDentroData,comparison:context.window.ToDentroComparison,element};
 }
 const app=await setup('?curso=medicina&universidade=usp&campus=usp-bauru&turno=integral&processo=usp-enem-usp&edicao=2025&modalidade=ampla-concorrencia');
 const submit=()=>app.element('#comparison-form').listeners.submit({preventDefault(){}});
 const add=reference=>{
  const offering=app.data.getOfferings({universityId:reference.universityId,courseId:reference.courseId}).find(item=>item.id===reference.offeringId);
  const values={university:reference.universityId,campus:reference.campusId,shift:offering.periodId,process:reference.processId,year:String(reference.edition),category:reference.selectionCategoryId,stage:reference.stageId||''};
  Object.entries(values).forEach(([key,value])=>{app.element('#comparison-'+key).value=value;});
  app.element('#comparison-university').listeners.change();submit();
 };
 assert.equal(app.element('#comparison-selected').children.length,0);
 assert.equal(app.element('#comparison-add').disabled,false);submit();
 assert.equal(app.element('#comparison-selected').children.length,1);
 assert.equal(app.element('#comparison-university').value,'');assert.equal(app.element('#comparison-course').value,'medicina');
 app.element('#comparison-clear-fields').listeners.click();assert.equal(app.element('#comparison-selected').children.length,1);
 const medFuvest=app.data.getScores({universityId:'usp',courseId:'medicina',campusId:'usp-cidade-universitaria',processId:'usp-fuvest',stageId:'fase-1'})[0];add(medFuvest);
 assert.equal(app.element('#comparison-selected').children.length,2);
 assert.match(app.element('#comparison-count').textContent,/2 opções selecionadas · 1 universidade/);
 const details=text(app.element('#comparison-selected'));
 assert.match(details,/Bauru/);assert.match(details,/ENEM-USP/);assert.match(details,/FUVEST/);assert.match(details,/1ª fase/);assert.match(details,/840|835,05/);
 add(medFuvest);assert.equal(app.element('#comparison-selected').children.length,2);assert.match(app.element('#comparison-builder-status').textContent,/já está/);
 app.element('#comparison-submit').listeners.click();
 const originalState=new URLSearchParams(app.context.location.href.split('?')[1]);
 const original=app.comparison.readSelection(originalState);assert.equal(original.length,2);assert.equal(original[0].reference.value,835.05);assert.equal(original[1].reference.stageId,'fase-1');assert.equal(original[1].reference.value,80);
 assert.equal(app.comparison.canChart(original),false);
 const restored=await setup('?'+originalState);assert.equal(restored.element('#comparison-selected').children.length,2);
 await vm.runInContext(read('src/scripts/pages/comparacao-notas.js'),restored.context);
 assert.equal(restored.element('#results-range').textContent,'755,05'); // 835,05 - 80,00, inclusive com critérios diferentes.
 assert.ok(!read('src/pages/comparacao-notas.html').includes('results-compatibility'));

 app.element('#comparison-course').value='ciencia-da-computacao';app.element('#comparison-course').listeners.change();assert.equal(app.element('#comparison-selected').children.length,0);
 const computing=app.data.getScores({courseId:'ciencia-da-computacao'});
 add(computing.find(item=>item.universityId==='usp'&&item.processId==='usp-enem-usp'));
 add(computing.find(item=>item.universityId==='unesp'));
 assert.equal(app.element('#comparison-selected').children.length,2);assert.match(app.element('#comparison-count').textContent,/2 universidades/);
 app.element('#comparison-submit').listeners.click();const state=new URLSearchParams(app.context.location.href.split('?')[1]);
 assert.equal(app.comparison.readSelection(state).length,2);
 state.append('referencia',medFuvest.id);assert.equal(app.comparison.readSelection(state).length,2);
 app.context.location.search='?'+state;
 await vm.runInContext(read('src/scripts/pages/comparacao-notas.js'),app.context);
 assert.equal(app.element('#results-options').children.length,2);
 assert.equal(app.element('#results-chart-section').hidden,false);
 assert.equal(app.element('#results-bars').children.length,2);
 assert.match(app.element('#results-back').href,/referencia=/);
 assert.ok(app.element('#results-options').children.some(card=>card.querySelector('.option-mode').textContent.includes('ENEM-USP')));
 assert.ok(app.element('#results-options').children.every(card=>card.querySelector('.option-score strong').textContent));
 app.element('#comparison-selected').children[0].children.at(-1).listeners.click();assert.equal(app.element('#comparison-selected').children.length,1);
 app.element('#comparison-clear-all').listeners.click();assert.equal(app.element('#comparison-selected').children.length,0);
 assert.ok(!read('src/pages/filtros-comparacao.html').includes('comparison-search'));
 console.log('OK: salvar/limpar opções, mesma universidade com critérios distintos, universidades diferentes, duplicatas, edição, curso comum e resultado sem perder contexto.');
})().catch(error=>{console.error(error);process.exitCode=1;});
