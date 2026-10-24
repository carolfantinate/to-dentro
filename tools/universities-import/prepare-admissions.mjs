import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const slug=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const empty=text=>!text?.trim()||text.trim()==='-';
const datePattern=()=>/(?<!\d)(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*(\d{4}))?(?!\d)/g;
export function parseDateSpec(input,monthYears={}){
 const text=empty(input)?null:input.trim();
 if(!text)return {text:null,precision:'not-provided',isEstimated:false,dates:[],approximation:null};
 const normalized=slug(text);
 if(/meados|semana|inicio/.test(normalized)){
  const month=/janeiro/.test(normalized)?1:/fevereiro|fev/.test(normalized)?2:null;
  const period=/ultima-semana/.test(normalized)?'last-week':/primeira-semana/.test(normalized)?'first-week':/meados/.test(normalized)?'middle':'beginning';
  return {text,precision:'estimate',isEstimated:true,dates:[],approximation:{month,period,year:monthYears[month]??null}};
 }
 const dates=[...text.matchAll(datePattern())].map(match=>{
  const day=Number(match[1]),month=Number(match[2]),year=monthYears[month]??(match[3]?Number(match[3]):null);
  const check=new Date(Date.UTC(year||2000,month-1,day));
  if(check.getUTCDate()!==day||check.getUTCMonth()!==month-1)throw new Error(`Data inválida: ${match[0]}`);
  return {day,month,year,iso:year?`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`:null};
 });
 return {text,precision:dates.length?(dates.every(date=>date.year)?'date':'day-month'):'text',isEstimated:false,dates,approximation:null};
}
export function parseFee(input){
 if(empty(input))return {text:null,currency:'BRL',amount:null,isFree:null,variants:[]};
 const text=input.trim();
 const variants=text.split(/\bou(?:\s+ainda)?\b/i).map(part=>{
  const amount=part.trim().match(/(\d+(?:[.,]\d+)?)\s*$/)?.[1];
  if(amount===undefined)throw new Error(`Taxa não reconhecida: ${part}`);
  return {amount:Number(amount.replace(',','.')),discountPercent:part.match(/\((\d+)%\)/)?Number(part.match(/\((\d+)%\)/)[1]):null};
 });
 return {text,currency:'BRL',amount:variants.length===1?variants[0].amount:null,isFree:variants.every(variant=>variant.amount===0),variants};
}
export function prepareAdmissions(source,universityIds){
 const records=[],issues=[],seen=new Set();
 for(const row of source.rows){
  if(empty(row.process))continue;
  const universityId=empty(row.university)?null:slug(row.university);
  if(universityId && !universityIds.includes(universityId))throw new Error(`Universidade desconhecida na linha ${row.row}.`);
  const key=slug(row.process),id=universityId?`${universityId}-${key}`:key;
  const edition=empty(row.edition)?null:Number(row.edition);
  if(edition!==null && (!Number.isInteger(edition)||edition<2000||edition>2100))throw new Error('Edição inválida.');
  const editionId=`${id}-${edition??'edicao-nao-informada'}`;
  if(seen.has(editionId))throw new Error(`Edição duplicada: ${editionId}`);seen.add(editionId);
  const programId=universityId?null:key;
  const relatedProgramIds=/sisu/i.test(row.process)?['sisu']:/provao/i.test(slug(row.type))?['provao-paulista']:[];
  const method=/sisu/i.test(row.process)?'sisu':key==='enem'?'enem':key==='prouni'?'prouni':'vestibular';
  const definition={id,universityId,programId,name:key==='fuvest'?'FUVEST':row.process,method,...(universityId?{relatedProgramIds}:{})};
  const officialSource=empty(row.officialSource)?null:row.officialSource.trim();
  if(officialSource && !['http:','https:'].includes(new URL(officialSource).protocol))throw new Error('Fonte inválida.');
  const fee=parseFee(row.fee),schedule=Object.fromEntries(['registrationStart','registrationEnd','exams','results'].map(field=>[field,parseDateSpec(row[field],source.confirmedMonthYears)]));
  const ownIssues=[];
  const issue=(code,domain,message)=>{const value={row:row.row,editionId,code,domain,message};ownIssues.push(value);issues.push(value);};
  const registration=schedule.registrationStart.dates[0]?.iso;
  if(registration && schedule.results.dates.some(date=>date.iso && date.iso<registration))issue('result-before-registration','dates','Resultado com ano explícito anterior à inscrição; conferir o ano informado.');
  const examDates=schedule.exams.dates;
  if(examDates.some((date,index)=>index>0 && date.month===examDates[index-1].month && date.day<examDates[index-1].day))issue('exam-phase-order','dates','Datas das fases da prova aparecem fora de ordem no mesmo mês; conferir a planilha.');
  if(fee.variants.length>1 && fee.variants.every(variant=>variant.discountPercent===null))issue('fee-conditions-missing','fees','A taxa tem valores alternativos sem informar a condição de cada valor.');
  if(key==='enem' && officialSource?.includes('enem-usp'))issue('source-process-review','source','O processo está como ENEM, mas a fonte aponta para ENEM-USP; conferir a correspondência.');
  const editionRecord={id:editionId,processId:id,universityId,programId,edition,name:row.process,typeLabel:empty(row.type)?null:row.type,fee,officialSource,schedule,sourceRow:row.row,sourceSheet:source.sheet,needsReview:ownIssues.length>0,reviewIssueCodes:ownIssues.map(item=>item.code)};
  const events=[];
  const defaults={registrationStart:'Início das inscrições',registrationEnd:'Fim das inscrições',exams:'Prova',results:'Resultado'};
  for(const [type,title] of Object.entries(defaults)){
   if(empty(row[type]))continue;
   for(const part of row[type].split('|').map(text=>text.trim()).filter(Boolean)){
    const spec=parseDateSpec(part,source.confirmedMonthYears),firstDate=[...part.matchAll(datePattern())][0];
    const prefix=firstDate?part.slice(0,firstDate.index).replace(/[-:\s]+$/,'').trim():'';
    const eventTitle=prefix||title,eventId=`${editionId}-${slug(type)}-${slug(eventTitle)}`;
    if(events.some(event=>event.id===eventId))throw new Error(`Etapa duplicada: ${eventId}`);
    events.push({id:eventId,editionId,processId:id,universityId,programId,type,title:eventTitle,dateSpec:spec,
      calendarEligible:spec.precision==='date'&&!ownIssues.some(item=>item.domain==='dates')});
   }
  }
  records.push({definition,edition:editionRecord,events});
 }
 const programIds=new Set(records.filter(record=>!record.definition.universityId).map(record=>record.definition.id));
 if(records.some(record=>(record.definition.relatedProgramIds||[]).some(id=>!programIds.has(id))))throw new Error('Programa compartilhado ausente.');
 return {schemaVersion:1,records,issues};
}
export async function main(){
 const load=async file=>JSON.parse((await readFile(new URL(file,import.meta.url),'utf8')).replace(/^\uFEFF/,''));
 const prepared=prepareAdmissions(await load('./admissions-source.json'),(await load('./universities.json')).universities.map(item=>item.id));
 await writeFile(new URL('./admissions.json',import.meta.url),JSON.stringify({schemaVersion:1,records:prepared.records},null,2)+'\n');
 await writeFile(new URL('./admissions-review.json',import.meta.url),JSON.stringify({issues:prepared.issues},null,2)+'\n');
 console.log(`${prepared.records.length} processos/edições e ${prepared.records.flatMap(record=>record.events).length} etapas preparados.`);
 prepared.issues.forEach(issue=>console.log(`Linha ${issue.row}: ${issue.message}`));
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
