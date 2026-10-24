import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepareAdmissions,parseDateSpec,parseFee} from '../tools/universities-import/prepare-admissions.mjs';
import {admissionDocuments,main} from '../tools/universities-import/import-admissions.mjs';
const load=async name=>JSON.parse((await readFile(new URL('../tools/universities-import/'+name,import.meta.url),'utf8')).replace(/^\uFEFF/,''));
const source=await load('admissions-source.json'),universities=(await load('universities.json')).universities.map(item=>item.id);
const prepared=prepareAdmissions(source,universities),data=await load('admissions.json');
assert.deepEqual(data.records,prepared.records);assert.equal(data.records.length,11);assert.equal(admissionDocuments(data).length,53);
assert.equal(data.records.filter(record=>!record.definition.universityId).length,4);
const sisu=data.records.find(record=>record.definition.id==='sisu');assert.equal(sisu.edition.edition,null);assert.equal(sisu.events.length,2);
assert.equal(sisu.events[0].dateSpec.precision,'estimate');assert.equal(sisu.events[0].dateSpec.approximation.period,'last-week');assert.equal(sisu.events[0].dateSpec.approximation.month,1);
assert.equal(sisu.events[1].dateSpec.approximation.month,2);assert.equal(sisu.events[1].calendarEligible,false);assert.deepEqual(sisu.events[1].dateSpec.dates,[]);
const prouni=data.records.find(record=>record.definition.id==='prouni');assert.equal(prouni.events[1].dateSpec.approximation.period,'beginning');
assert.equal(data.records.find(record=>record.definition.id==='ufscar-sisu').edition.fee.amount,null);
assert.deepEqual(data.records.find(record=>record.definition.id==='ufabc-sisu').definition.relatedProgramIds,['sisu']);
const fuvest=data.records.find(record=>record.definition.id==='usp-fuvest');assert.equal(fuvest.edition.edition,2027);assert.equal(fuvest.edition.schedule.registrationStart.dates[0].iso,'2026-08-17');assert.equal(fuvest.edition.fee.amount,null);assert.deepEqual(fuvest.edition.fee.variants.map(item=>item.amount),[228,144]);
assert.equal(fuvest.events.find(event=>event.type==='exams').dateSpec.precision,'day-month');assert.equal(fuvest.events.find(event=>event.type==='exams').dateSpec.dates[0].iso,null);
const unesp=data.records.find(record=>record.definition.universityId==='unesp');assert.equal(unesp.edition.schedule.results.dates[0].iso,'2027-01-27');assert.equal(unesp.edition.needsReview,true);assert.ok(unesp.events.every(event=>!event.calendarEligible));assert.deepEqual(unesp.edition.fee.variants,[{amount:225,discountPercent:null},{amount:56.25,discountPercent:75},{amount:112.5,discountPercent:50}]);
const provao=data.records.find(record=>record.definition.id==='provao-paulista');assert.equal(provao.edition.fee.amount,0);assert.equal(provao.edition.fee.isFree,true);
assert.equal(prepared.issues.length,3);assert.equal(data.records.flatMap(record=>record.events).filter(event=>event.calendarEligible).length,10);
assert.equal(parseDateSpec('Primeira semana de fev').dates.length,0);assert.equal(parseDateSpec('6 /12 e 7/12').dates.length,2);
assert.throws(()=>parseDateSpec('31/02/2027'),/inválida/);assert.equal(parseFee('').isFree,null);
const bad=structuredClone(data);bad.records.find(record=>record.definition.id==='sisu').events[0].calendarEligible=true;assert.throws(()=>admissionDocuments(bad),/prazo exato/);
await assert.rejects(main(['--write']),/project/);
console.log('OK: 11 processos/edições, 31 etapas, datas exatas/parciais/estimadas, taxas alternativas, programas gerais e revisão de inconsistências.');

for(const record of data.records)for(const event of record.events){
 for(const date of event.dateSpec.dates)if(date.month===1)assert.equal(date.year,2027);
 if(event.dateSpec.approximation?.month===1){assert.equal(event.dateSpec.approximation.year,2027);assert.equal(event.calendarEligible,false);}
}
assert.equal(fuvest.events.find(event=>event.title==='1ª Chamada').dateSpec.dates[0].iso,'2027-01-26');
assert.equal(provao.events.find(event=>event.title==='Notas').dateSpec.dates[0].iso,'2027-01-07');
