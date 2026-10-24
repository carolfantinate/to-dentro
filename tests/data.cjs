const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(file, 'utf8');
function load() {
  const context = vm.createContext({ window: {}, URLSearchParams });
  for (const file of ['mock-data', 'catalog', 'universities', 'campuses', 'courses', 'comparisons', 'admission-dates', 'calendar', 'community', 'opportunities']) {
    vm.runInContext(read(`src/data/${file}.js`), context, {filename: file});
  }
  return context;
}
const context = load();
const data = context.window.ToDentroData;
const records = data.collections;
const byId = (collection, id) => records[collection].find(item => item.id === id);
for (const [name, collection] of Object.entries(records)) {
  assert.equal(new Set(collection.map(item => item.id)).size, collection.length, `IDs duplicados em ${name}`);
  for (const item of collection) assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${name}: ID inválido`);
}
for (const campus of records.campuses) assert.ok(byId('universities', campus.universityId));
for (const course of records.courses) assert.ok(byId('courseAreas', course.areaId));
for (const offering of records.courseOfferings) {
  const campus = byId('campuses', offering.campusId);
  assert.equal(campus.universityId, offering.universityId);
  assert.notEqual(campus.type, 'administrative', 'Reitoria não pode receber ofertas de ensino');
  assert.ok(byId('courses', offering.courseId));
  assert.ok(byId('periods', offering.periodId));
  assert.ok(byId('modes', offering.modeId));
}
const identities = new Set();
for (const score of records.cutoffScores) {
  const offering = byId('courseOfferings', score.offeringId);
  assert.equal(offering.campusId, score.campusId);
  assert.equal(offering.universityId, score.universityId);
  assert.equal(byId('admissionProcesses', score.processId).universityId, score.universityId);
  assert.ok(byId('selectionCategories', score.selectionCategoryId));
  assert.ok(Number.isFinite(score.value) && score.value >= 0 && score.value <= score.scale);
  const identity = [score.offeringId, score.processId, score.edition, score.selectionCategoryId].join(':');
  assert.ok(!identities.has(identity), 'Duas notas para a mesma seleção');
  identities.add(identity);
}
for (const edition of records.admissionEditions) {
  assert.equal(byId('admissionProcesses', edition.processId).universityId, edition.universityId);
}
for (const event of records.admissionEvents) {
  assert.equal(byId('admissionEditions', event.editionId).universityId, event.universityId);
  assert.match(event.start, /^\d{4}-\d{2}-\d{2}$/);
  if (event.end) assert.ok(event.end >= event.start);
}
for (const post of records.communityPosts) {
  if (post.universityId) assert.ok(byId('universities', post.universityId));
  assert.ok(byId('people', post.authorId));
  if (post.courseId) assert.ok(byId('courses', post.courseId));
}
for (const reply of records.communityReplies) {
  assert.equal(byId('communityPosts', reply.postId).universityId, reply.universityId);
  assert.ok(byId('people', reply.authorId));
}
for (const item of [...records.calendarEvents, ...records.universityPhotos]) assert.ok(byId('universities', item.universityId));
for (const university of records.universities) {
  assert.equal(byId('campuses', university.primaryCampusId).universityId, university.id);
  for (const id of university.opportunityIds) assert.ok(byId('opportunities', id));
}
// O curso é único no catálogo; as ofertas possuem identidades por campus.
const computing = data.getCourse('ciencia da computacao');
assert.equal(computing.id, 'ciencia-da-computacao');
const uspComputing = data.getOfferings({universityId:'usp', courseId:computing.id});
assert.equal(uspComputing.length, 3);
assert.equal(new Set(uspComputing.map(item => item.id)).size, 3);
assert.equal(data.resolveSavedCourse(uspComputing[0].id).offering.id,uspComputing[0].id);
assert.equal(data.resolveSavedCourse('usp:ciencia da computacao').course.id,computing.id);
assert.equal(data.resolveSavedCourse('usp:curso-inexistente'),null);
assert.equal(data.getOfferings({universityId:'usp', courseId:'inexistente'}).length, 0);
assert.equal(data.getOfferings({universityId:'usp', campusId:'unicamp-barao-geraldo'}).length, 0);
assert.equal(data.getOfferings({universityId:'unesp', campusId:'unesp-reitoria'}).length, 0);
assert.equal(data.getCampus('usp','butanta').id,'usp-cidade-universitaria');
const filter = {universityId:'usp',campusId:'butanta',courseId:computing.id,process:'ENEM-USP',edition:2026,category:'Ampla concorrência',period:'Integral'};
assert.equal(data.findScore(filter).value, 782.45);
for (const patch of [{edition:2025},{period:'Noturno'},{category:'Escola pública'},{campusId:'sao-carlos'},{process:'FUVEST'},{courseId:'medicina'},{universityId:'unicamp'}]) {
  assert.equal(data.findScore({...filter,...patch}),null,`Nota não deveria existir: ${JSON.stringify(patch)}`);
}
// Links legados e novos apontam para os mesmos registros.
const oldParams = new URLSearchParams('curso=ciencia+da+computacao&opcao=usp:0&opcao=unesp:0&opcao=unicamp:0');
const oldSelection = data.readComparison(oldParams);
assert.equal(oldSelection.length,3);
assert.equal(oldSelection[0].score,data.findScore(filter).value);
const newParams = new URLSearchParams({curso:computing.id});
oldSelection.forEach(item=>newParams.append('opcao',item.offeringId));
assert.equal(JSON.stringify(data.readComparison(newParams)),JSON.stringify(oldSelection));
newParams.set('edicao','2025');
assert.ok(data.readComparison(newParams).every(item=>item.score===null));
assert.ok(data.readComparison(new URLSearchParams('curso=medicina&opcao=usp:0&opcao=unicamp:0')).every(item=>item.score===null));
assert.equal(data.readComparison(new URLSearchParams({curso:'medicina',opcao:oldSelection[0].offeringId})).length,0);
assert.equal(data.readComparison(new URLSearchParams('curso=ciencia+da+computacao&opcao=usp:0&opcao=usp:1')).length,1);
// Não são inventadas coordenadas para os campi cadastrados apenas nos detalhes.
for (const campus of context.window.ToDentroCampuses) {
  assert.equal(campus.coordinates.length,2);
  assert.ok(campus.coordinates.every(Number.isFinite));
}
assert.ok(Object.isFrozen(data.source.universities[0].campuses[0].courses));
const exported=data.exportCollections();
exported.universities[0].name='Alterado';
assert.notEqual(data.getUniversity('usp').name,'Alterado');
// Cada consumidor carrega a fonte e o catálogo uma única vez e na ordem correta.
for (const file of ['index.html',...fs.readdirSync('src/pages').filter(file=>file.endsWith('.html')).map(file=>`src/pages/${file}`)]) {
  const sources=[...read(file).matchAll(/<script[^>]+src="([^"]+)"/g)].map(match=>match[1]);
  const dataScripts=sources.filter(src=>src.includes('/data/'));
  if (!dataScripts.length) continue;
  assert.equal(dataScripts.filter(src=>src.endsWith('/mock-data.js')).length,1,file);
  assert.equal(dataScripts.filter(src=>src.endsWith('/catalog.js')).length,1,file);
  assert.ok(dataScripts[0].endsWith('/mock-data.js'),file);
  assert.ok(dataScripts[1].endsWith('/catalog.js'),file);
  for(const src of dataScripts) assert.ok(fs.existsSync(path.resolve(path.dirname(file),src)),`${file}: ${src}`);
}
// Integração da tela de notas: associação correta e ausência de nota em outra edição.
function cutoffScreen(query) {
  const app=load();const elements=new Map();
  app.location={search:query};
  app.document={title:'',getElementById:id=>{
    if(!elements.has(id))elements.set(id,{classList:{toggle(){}},hidden:true});
    return elements.get(id);
  }};
  vm.runInContext(read('src/scripts/pages/nota-de-corte.js'),app);
  return elements;
}
const pageParams='?universidade=usp&curso=ciencia+da+computacao&campus=butanta&processo=ENEM-USP&edicao=2026&modalidade=Ampla+concorr%C3%AAncia&turno=Integral';
assert.equal(cutoffScreen(pageParams).get('result-score').textContent,'782,45');
assert.equal(cutoffScreen(pageParams.replace('2026','2025')).get('result-score').textContent,'Referência indisponível');
assert.equal(cutoffScreen('?universidade=nao-existe&curso=medicina').get('result-invalid').hidden,false);
console.log('OK: IDs, relações, notas por contexto, aliases, exportação, ordem dos scripts e tela de nota de corte.');
