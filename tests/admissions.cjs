const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const source = fs.readFileSync('services/admission-catalog.js', 'utf8');
  const {buildAdmissionCatalog} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const {records} = JSON.parse(fs.readFileSync('tools/universities-import/admissions.json','utf8').replace(/^\uFEFF/,''));
  const {universities} = JSON.parse(fs.readFileSync('tools/universities-import/universities.json','utf8').replace(/^\uFEFF/,''));
  const catalog = buildAdmissionCatalog(records, universities);
  assert.equal(catalog.selections.length, 11);
  assert.ok(catalog.calendar.length > 20);
  assert.ok(catalog.calendar.every(item => item.time === null && item.dataSource === 'firestore'));
  assert.deepEqual([...new Set(catalog.calendar.map(item => item.reminderCategory))].sort(), ['inscricao', 'prova', 'resultado']);
  assert.ok(catalog.calendar.some(item => item.choiceId === 'enem' && item.date === '2026-11-08'));
  assert.ok(catalog.calendar.some(item => item.choiceId === 'unicamp-vestibular-unicamp' && item.date === '2026-10-18'));
  assert.ok(catalog.calendar.some(item => item.choiceId === 'usp-fuvest' && item.date === '2027-01-26'));
  assert.ok(catalog.calendar.some(item => item.choiceId === 'provao-paulista' && item.date === '2026-11-04'));
  assert.ok(!catalog.calendar.some(item => item.choiceId === 'sisu'));
  assert.ok(catalog.estimates.some(item => item.programId === 'sisu' && item.month === 1 && item.year === 2027));
  assert.ok(catalog.estimates.some(item => item.programId === 'sisu' && item.month === 2 && item.year === 2027));
  assert.ok(!catalog.calendar.some(item => item.choiceId === 'unesp-vestibular-unesp' && item.date.startsWith('2026-11')));
  assert.equal(catalog.choicesForUniversity('usp')[0].id, 'usp-fuvest');
  assert.equal(catalog.choicesForUniversity('unicamp')[0].id, 'unicamp-vestibular-unicamp');
  assert.equal(catalog.choicesForUniversity('ufscar')[0].id, 'sisu');
  assert.equal(catalog.choicesForUniversity('ufabc')[0].id, 'sisu');
  assert.ok(!catalog.choicesForUniversity('usp').some(item => item.id === 'sisu'));
  assert.ok(catalog.choicesForUniversity('unesp').some(item => item.id === 'provao-paulista'));
  assert.equal(catalog.choicesForUniversity('').length, 4);
  assert.equal(new Set(catalog.calendar.map(item => item.id)).size, catalog.calendar.length);
  const vm = require('node:vm');
  class Element {
    constructor(tag='div') { this.tagName=tag; this.children=[]; this.listeners={}; this.dataset={}; this.value=''; this.classList={add(){}}; }
    append(...items) { this.children.push(...items); }
    replaceChildren(...items) { this.children=[...items]; }
    setAttribute(name,value) { this[name]=value; }
    addEventListener(name,handler) { this.listeners[name]=handler; }
    before() {}
  }
  const option = function(text,value) { return {textContent:text,value}; };
  async function page(file, query='') {
    const elements=new Map(), filters=['todos','lembretes'].map(value=>{const item=new Element();item.dataset.category=value;return item;});
    const get = selector => { if(!elements.has(selector))elements.set(selector,new Element()); return elements.get(selector); };
    const location = new URL('https://example.com/app/src/pages/'+file+'.html'+query);
    const context = {window:{ToDentroUniversities:universities,ToDentroAdmissionCatalog:catalog,ToDentroCalendar:catalog.calendar,ToDentroDateEstimates:catalog.estimates,ToDentroAuth:{ready:Promise.resolve(),isAuthenticated:()=>false,storageKey:key=>key,requireLogin:()=>false}},document:{querySelector:get,querySelectorAll:()=>filters,createElement:tag=>new Element(tag)},Option:option,URL,URLSearchParams,Intl,Date,Map,Set,localStorage:{getItem:()=>null},location};
    await vm.runInNewContext(fs.readFileSync(`src/scripts/pages/${file}.js`,'utf8'),context);
    return {get,filters,context};
  }
  const calendarPage = await page('calendario','?universidade=usp&mes=2026-11-01');
  assert.ok(!fs.readFileSync('src/pages/calendario.html','utf8').includes('id="calendar-process"'));
  assert.ok(calendarPage.get('#calendar-events').children.some(item => item.children[1].children[1].textContent.includes('FUVEST')));
  assert.ok(calendarPage.get('#calendar-events').children.some(item => item.children[1].children[1].textContent.includes('ENEM')));
  assert.ok(calendarPage.get('#calendar-events').children.length>0);
  assert.ok(calendarPage.get('#calendar-events').children.every(item => item.dataset.kind === 'prova' || item.dataset.kind === 'resultado' || item.dataset.kind === 'inscricao'));
  const examDay = calendarPage.get('#calendar-days').children.find(item => item.textContent === 8);
  assert.equal(examDay.dataset.kind, 'prova');
  assert.equal(examDay.children.length, 0);
  calendarPage.get('#calendar-university').value='ufscar';
  calendarPage.get('#calendar-university').listeners.change();
  calendarPage.get('#next-month').listeners.click();
  calendarPage.get('#next-month').listeners.click();
  assert.match(calendarPage.get('#calendar-month-title').textContent,/2027/);
  assert.ok(calendarPage.get('#calendar-estimates').children.length>0);
  assert.equal(calendarPage.get('#calendar-events').children.length,0);
  calendarPage.get('#calendar-university').value='';
  calendarPage.get('#calendar-university').listeners.change();

  assert.ok(calendarPage.get('#calendar-events').children.length>0);
  const exploration = await page('explorar-datas','?universidade=usp');
  assert.equal(exploration.get('#dates-exam').value,'usp-fuvest');
  exploration.get('#explore-dates-form').listeners.submit({preventDefault(){}});
  assert.match(exploration.context.location.href,/processo=usp-fuvest/);
  const details = await page('datas','?programa=sisu');
  assert.equal(details.get('#admission-dates-list').children.length,2);
  assert.match(details.get('#admission-note').textContent,/Horários não informados/);
  const enemDetails = await page('datas','?programa=enem');
  assert.ok(enemDetails.get('#admission-dates-list').children.length>0);
  console.log(`OK: ${catalog.calendar.length} datas vinculadas, ${catalog.estimates.length} previsões separadas, processos contextuais e nenhum horário inventado.`);
})();
