import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { prepareCourses } from './prepare-courses.mjs';

export function courseDocuments(data) {
  if(data.schemaVersion!==1 || ['courses','offerings','processes','cutoffScores'].some(key=>!Array.isArray(data[key]) || !data[key].length))throw new Error('Arquivo de cursos incompleto.');
  const documents=[], paths=new Set();
  const add=(path,record)=>{
    if(path.split('/').some((segment,index)=>index%2===0 ? !['universities','courses','admissionProcesses','campuses','cutoffScores'].includes(segment) : !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment)) || paths.has(path))throw new Error('Caminho inválido ou duplicado.');
    paths.add(path);documents.push({path,record});
  };
  const courseIds=new Set(data.courses.map(course=>`${course.universityId}:${course.id}`));
  const processIds=new Set(data.processes.map(process=>`${process.universityId}:${process.id}`));
  const offerings=new Map();
  for(const course of data.courses)add(`universities/${course.universityId}/courses/${course.id}`,course);
  for(const process of data.processes)add(`universities/${process.universityId}/admissionProcesses/${process.id}`,process);
  for(const offering of data.offerings){
    if(!courseIds.has(`${offering.universityId}:${offering.courseId}`))throw new Error('Oferta sem curso correspondente.');
    if(!Number.isInteger(offering.durationSemesters) || offering.durationSemesters<=0 || !Number.isInteger(offering.seats) || offering.seats<0)throw new Error('Duração ou vagas inválidas.');
    const path=`universities/${offering.universityId}/campuses/${offering.campusId}/courses/${offering.id}`;
    add(path,offering);offerings.set(offering.id,{...offering,path});
  }
  for(const score of data.cutoffScores){
    const offering=offerings.get(score.offeringId);
    if(!offering || ['universityId','campusId','courseId'].some(key=>score[key]!==offering[key]) || !processIds.has(`${score.universityId}:${score.processId}`))throw new Error('Resultado sem vínculo correto à oferta/processo.');
    if(!Number.isInteger(score.edition) || !['exact','range'].includes(score.format))throw new Error('Resultado inválido.');
    if(score.format==='exact' ? !Number.isFinite(score.value) || score.value<0 || score.minimum!==null || score.maximum!==null : score.value!==null || !Number.isFinite(score.minimum) || !Number.isFinite(score.maximum) || score.minimum<0 || score.minimum>score.maximum)throw new Error('Nota ou faixa inválida.');
    add(`${offering.path}/cutoffScores/${score.id}`,score);
  }
  if(documents.length>450)throw new Error('Importação excede o lote seguro desta ferramenta.');
  return documents;
}

export async function main(args=process.argv.slice(2)) {
  for(let i=0;i<args.length;i++){
    if(args[i]==='--project'){if(!args[i+1] || args[i+1].startsWith('--'))throw new Error('Informe o projeto.');i++;}
    else if(args[i]!=='--write')throw new Error(`Argumento desconhecido: ${args[i]}`);
  }
  const load=async file=>JSON.parse((await readFile(new URL(file,import.meta.url),'utf8')).replace(/^\uFEFF/,''));
  const data=await load('./courses.json');
  const expected=prepareCourses(await load('./courses-source.json'),(await load('./campuses.json')).campuses,await load('./courses-campus-mapping.json'));
  if(!isDeepStrictEqual(data,expected))throw new Error('Os dados preparados divergem da fonte e dos vínculos aprovados. Execute prepare-courses.mjs.');
  const documents=courseDocuments(data);
  console.log(`${data.courses.length} cursos, ${data.offerings.length} ofertas, ${data.processes.length} processos, ${data.cutoffScores.length} resultados: ${documents.length} documentos válidos.`);
  if(!args.includes('--write')){console.log('Simulação: nenhuma conexão ou gravação no Firebase.');return;}
  const position=args.indexOf('--project');if(position<0)throw new Error('A gravação exige --project com o ID exato.');
  const project=args[position+1];
  const {initializeApp,applicationDefault}=await import('firebase-admin/app');
  const {getFirestore,FieldValue}=await import('firebase-admin/firestore');
  const db=getFirestore(initializeApp({credential:applicationDefault(),projectId:project}));
  const refs=documents.map(document=>db.doc(document.path));
  const parentPaths=[...new Set(data.offerings.flatMap(offering=>[`universities/${offering.universityId}`,`universities/${offering.universityId}/campuses/${offering.campusId}`]))];
  try{
    await db.runTransaction(async transaction=>{
      const parents=await transaction.getAll(...parentPaths.map(path=>db.doc(path)));
      if(parents.some(snapshot=>!snapshot.exists))throw new Error('Universidade ou campus ausente; nenhuma gravação realizada.');
      const existing=await transaction.getAll(...refs);
      documents.forEach(({record},index)=>transaction.set(refs[index],{...record,...(!existing[index].exists?{createdAt:FieldValue.serverTimestamp()}:{}),updatedAt:FieldValue.serverTimestamp()},{merge:true}));
    });
    const saved=await db.getAll(...refs);
    saved.forEach((snapshot,index)=>{if(!snapshot.exists || Object.entries(documents[index].record).some(([key,value])=>!isDeepStrictEqual(snapshot.get(key),value)))throw new Error(`Gravação enviada, mas a conferência falhou: ${documents[index].path}`);});
    console.log(`Importação e conferência concluídas: ${documents.length} documentos no projeto ${project}.`);
  }finally{await db.terminate();}
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
