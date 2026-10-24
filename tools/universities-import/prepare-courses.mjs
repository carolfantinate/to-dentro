import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
export const slug = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const decimal = text => Number(text.replace(',','.'));

export function parseResults(text, identity) {
  const processes=[], scores=[];
  for (const raw of text.split('|').map(part=>part.trim()).filter(Boolean)) {
    const parts=raw.split('/').map(part=>part.trim());
    if(parts.length<3 || parts.length>4 || !/^20\d{2}$/.test(parts[1]))throw new Error(`Processo não reconhecido: ${raw}`);
    const processKey=slug(parts[0]), processId=`${identity.universityId}-${processKey}`;
    if(!['enem-usp','fuvest','provao-paulista'].includes(processKey))throw new Error(`Processo desconhecido: ${raw}`);
    processes.push({id:processId,universityId:identity.universityId,name:{'enem-usp':'ENEM-USP',fuvest:'FUVEST','provao-paulista':'Provão Paulista'}[processKey],method:processKey==='enem-usp'?'enem':'vestibular'});
    const add=(category,stage,result)=>{
      const exact=result.match(/^\d+(?:[.,]\d+)?$/);
      const range=result.match(/^(\d+(?:[.,]\d+)?)\s+a\s+(\d+(?:[.,]\d+)?)$/);
      if(!exact && !range)throw new Error(`Resultado não reconhecido: ${result}`);
      const value=exact?decimal(exact[0]):null;
      const minimum=range?decimal(range[1]):null, maximum=range?decimal(range[2]):null;
      if(range && minimum>maximum)throw new Error('Faixa de notas invertida.');
      const edition=Number(parts[1]);
      const id=`${identity.offeringId}-${processId}-${edition}-${category}-${stage||'fase-nao-informada'}`;
      scores.push({id,...identity,processId,edition,selectionCategoryId:category,stageId:stage,
        format:exact?'exact':'range',value,minimum,maximum,scale:null,rawResult:raw});
    };
    if(parts.length===3){
      // Provão: preserva cada categoria L1/L2/L3/L4 e sua faixa; sem supor a descrição da cota.
      for(const group of parts[2].split(';')){
        const match=group.trim().match(/^((?:L\d+(?:\s*,\s*|\s+e\s+)?)+)\s*-\s*(.+)$/i);
        if(!match)throw new Error(`Grupo de concorrência inválido: ${group}`);
        for(const category of match[1].match(/L\d+/gi))add(category.toLowerCase(),null,match[2]);
      }
    }else{
      const category=slug(parts[2])==='ampla'?'ampla-concorrencia':slug(parts[2]);
      if(/fase/i.test(parts[3])){
        const phase=/([12])\s*[°ºª]?\s*fase\s*-\s*(\d+(?:[.,]\d+)?(?:\s+a\s+\d+(?:[.,]\d+)?)?)/gi;
        const matches=[...parts[3].matchAll(phase)];
        if(!matches.length || parts[3].replace(phase,'').replace(/[\s,;]+/g,''))throw new Error('Fases não reconhecidas.');
        matches.forEach(match=>add(category,`fase-${match[1]}`,match[2]));
      }else add(category,null,parts[3]);
    }
  }
  return {processes,scores};
}

export function prepareCourses(source,campuses,mapping) {
  const endpoint=source.rows.findIndex(row=>slug(row.university)==='usp' && slug(row.campus)==='sao-carlos' && slug(row.course)==='sistemas-de-informacao');
  if(endpoint<0)throw new Error('Limite Sistemas de Informação / USP São Carlos não encontrado.');
  const rows=source.rows.slice(0,endpoint+1);
  const courseMap=new Map(), processMap=new Map(), offerings=[], cutoffScores=[], seen=new Set();
  for(const row of rows){
    const universityId=slug(row.university), courseId=slug(row.course);
    const campusMapping=mapping[universityId]?.[slug(row.campus)];
    if(!campusMapping || !campuses.some(campus=>campus.id===campusMapping.campusId && campus.universityId===universityId))throw new Error(`Campus não resolvido na linha ${row.row}.`);
    const modeId={presencial:'presencial',ead:'ead',hibrida:'hibrida'}[slug(row.mode)];
    const periodId={integral:'integral',matutino:'manha',noturno:'noite',vespertino:'tarde'}[slug(row.period)];
    const degreeId=slug(row.degree), areaId=slug(row.area);
    if(!modeId || !periodId || !row.course.trim() || !row.area.trim() || degreeId!=='bacharelado')throw new Error(`Oferta incompleta na linha ${row.row}.`);
    const duration=row.duration.match(/^(\d+)\s+semestres?$/i), seats=row.seats.match(/^(\d+)\s*(?:vagas)?\s*(?:\/\s*ano)?$/i);
    if(!duration || !seats)throw new Error(`Duração/vagas inválidas na linha ${row.row}.`);
    const officialSource=new URL(row.officialSource);
    if(!['http:','https:'].includes(officialSource.protocol))throw new Error('URL da fonte inválida.');
    const campusId=campusMapping.campusId, id=`${campusId}-${courseId}-${degreeId}-${modeId}-${periodId}`;
    if(seen.has(id))throw new Error(`Oferta duplicada: ${id}`);
    seen.add(id);
    const course={id:courseId,universityId,name:row.course,area:row.area,areaId};
    const prior=courseMap.get(`${universityId}:${courseId}`);
    if(prior && JSON.stringify(prior)!==JSON.stringify(course))throw new Error('Definições divergentes para o mesmo curso.');
    courseMap.set(`${universityId}:${courseId}`,course);
    offerings.push({id,universityId,campusId,courseId,degree:row.degree,degreeId,modeId,periodId,
      durationSemesters:Number(duration[1]),seats:Number(seats[1]),seatsPeriod:/ano/i.test(row.seats)?'year':null,
      seatsText:row.seats,curriculumUrl:row.curriculum.trim()||null,officialSource:officialSource.href,
      sourceCampus:row.campus,campusAssignmentProvisional:campusMapping.provisional,sourceRow:row.row});
    const parsed=parseResults(row.admissionResults,{universityId,campusId,courseId,offeringId:id});
    parsed.processes.forEach(process=>processMap.set(process.id,process));
    cutoffScores.push(...parsed.scores.map(score=>({...score,officialSource:officialSource.href})));
  }
  if(new Set(cutoffScores.map(score=>score.id)).size!==cutoffScores.length)throw new Error('Resultados duplicados.');
  return {schemaVersion:1,courses:[...courseMap.values()],offerings,processes:[...processMap.values()],cutoffScores};
}

export async function main(){
  const load=async file=>JSON.parse((await readFile(new URL(file,import.meta.url),'utf8')).replace(/^\uFEFF/,''));
  const data=prepareCourses(await load('./courses-source.json'),(await load('./campuses.json')).campuses,await load('./courses-campus-mapping.json'));
  await writeFile(new URL('./courses.json',import.meta.url),JSON.stringify(data,null,2)+'\n');
  console.log(`${data.courses.length} cursos, ${data.offerings.length} ofertas, ${data.processes.length} processos e ${data.cutoffScores.length} resultados preparados.`);
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
