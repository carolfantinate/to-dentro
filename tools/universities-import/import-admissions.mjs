import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {prepareAdmissions} from './prepare-admissions.mjs';
export function admissionDocuments(data){
 if(data.schemaVersion!==1 || !Array.isArray(data.records) || !data.records.length)throw new Error('Arquivo de vestibulares inválido.');
 const documents=[],seen=new Set();
 const add=(path,record)=>{
  if(path.split('/').some((part,index)=>index%2===0?!['universities','admissionProcesses','admissionPrograms','admissionEditions','editions','events'].includes(part):!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part)) || seen.has(path))throw new Error('Caminho inválido ou duplicado.');
  seen.add(path);documents.push({path,record});
 };
 for(const entry of data.records){
  const {definition,edition,events}=entry;
  if(edition.processId!==definition.id || edition.universityId!==definition.universityId || edition.programId!==definition.programId)throw new Error('Edição vinculada ao processo incorreto.');
  const root=definition.universityId?`universities/${definition.universityId}`:`admissionPrograms/${definition.id}`;
  const definitionPath=definition.universityId?`${root}/admissionProcesses/${definition.id}`:root;
  const editionPath=`${root}/${definition.universityId?'admissionEditions':'editions'}/${edition.id}`;
  add(definitionPath,definition);add(editionPath,edition);
  for(const event of events){
   if(event.editionId!==edition.id || event.processId!==definition.id || event.universityId!==definition.universityId || event.programId!==definition.programId)throw new Error('Etapa vinculada à edição incorreta.');
   if(event.calendarEligible && (event.dateSpec.isEstimated || event.dateSpec.precision!=='date' || !event.dateSpec.dates.length || event.dateSpec.dates.some(date=>!date.iso)))throw new Error('Estimativa ou data incompleta não pode ser prazo exato.');
   add(`${editionPath}/events/${event.id}`,event);
  }
 }
 if(documents.length>450)throw new Error('Lote acima do limite seguro da ferramenta.');
 return documents;
}
export async function main(args=process.argv.slice(2)){
 for(let i=0;i<args.length;i++){
  if(args[i]==='--project'){if(!args[i+1] || args[i+1].startsWith('--'))throw new Error('Informe o projeto.');i++;}
  else if(args[i]!=='--write')throw new Error(`Argumento desconhecido: ${args[i]}`);
 }
 const load=async file=>JSON.parse((await readFile(new URL(file,import.meta.url),'utf8')).replace(/^\uFEFF/,''));
 const data=await load('./admissions.json');
 const prepared=prepareAdmissions(await load('./admissions-source.json'),(await load('./universities.json')).universities.map(item=>item.id));
 if(!isDeepStrictEqual(data,{schemaVersion:1,records:prepared.records}))throw new Error('O arquivo preparado diverge da fonte; execute prepare-admissions.mjs.');
 const documents=admissionDocuments(data);
 console.log(`${data.records.length} processos/edições, ${data.records.flatMap(entry=>entry.events).length} etapas: ${documents.length} documentos válidos.`);
 if(!args.includes('--write')){console.log('Simulação: nenhuma conexão ou gravação no Firebase.');return;}
 const position=args.indexOf('--project');if(position<0)throw new Error('A gravação exige --project com o ID exato.');
 const project=args[position+1];
 const {initializeApp,applicationDefault}=await import('firebase-admin/app');
 const {getFirestore,FieldValue}=await import('firebase-admin/firestore');
 const db=getFirestore(initializeApp({credential:applicationDefault(),projectId:project}));
 const refs=documents.map(document=>db.doc(document.path));
 const universityIds=[...new Set(data.records.map(record=>record.definition.universityId).filter(Boolean))];
 try{
  await db.runTransaction(async transaction=>{
   const parents=await transaction.getAll(...universityIds.map(id=>db.doc(`universities/${id}`)));
   if(parents.some(snapshot=>!snapshot.exists))throw new Error('Universidade ausente; nada foi gravado.');
   const existing=await transaction.getAll(...refs);
   documents.forEach(({record},index)=>transaction.set(refs[index],{...record,...(!existing[index].exists?{createdAt:FieldValue.serverTimestamp()}:{}),updatedAt:FieldValue.serverTimestamp()},{merge:true}));
  });
  const snapshots=await db.getAll(...refs);
  snapshots.forEach((snapshot,index)=>{if(!snapshot.exists || Object.entries(documents[index].record).some(([key,value])=>!isDeepStrictEqual(snapshot.get(key),value)))throw new Error(`Gravação enviada, mas a conferência falhou: ${documents[index].path}`);});
  console.log(`Importação e conferência concluídas: ${documents.length} documentos no projeto ${project}.`);
 }finally{await db.terminate();}
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
