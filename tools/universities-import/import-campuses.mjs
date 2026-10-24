import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function validateCampuses(data) {
  if(data.schemaVersion!==1 || !Array.isArray(data.campuses) || !data.campuses.length)throw new Error('Arquivo de campi inválido.');
  const fields=['id','universityId','name','city','state','latitude','longitude'];
  const seen=new Set();
  for(const campus of data.campuses){
    if(Object.keys(campus).length!==fields.length || fields.some(field=>!Object.hasOwn(campus,field)))throw new Error('Campos inesperados no campus.');
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(campus.id) || !/^[a-z0-9]+$/.test(campus.universityId) || !campus.id.startsWith(campus.universityId+'-') || seen.has(campus.id))throw new Error('ID de campus inválido ou duplicado.');
    for(const field of ['name','city','state'])if(typeof campus[field]!=='string' || !campus[field].trim())throw new Error(`Campo obrigatório: ${field}`);
    if(!/^[A-Z]{2}$/.test(campus.state))throw new Error('UF inválida.');
    if(campus.latitude!==null || campus.longitude!==null){
      if(typeof campus.latitude!=='number' || typeof campus.longitude!=='number' || !Number.isFinite(campus.latitude) || !Number.isFinite(campus.longitude) || Math.abs(campus.latitude)>90 || Math.abs(campus.longitude)>180)throw new Error('Coordenadas inválidas.');
    }
    seen.add(campus.id);
  }
  return data.campuses;
}

export async function main(args=process.argv.slice(2)) {
  for(let i=0;i<args.length;i++){
    if(args[i]==='--project'){if(!args[i+1] || args[i+1].startsWith('--'))throw new Error('Informe o projeto.');i++;}
    else if(!['--write','--names-only'].includes(args[i]))throw new Error(`Argumento desconhecido: ${args[i]}`);
  }
  const data=JSON.parse(await readFile(new URL('./campuses.json',import.meta.url),'utf8'));
  const campuses=validateCampuses(data);
  console.log(`${campuses.length} campi válidos; ${campuses.filter(item=>item.latitude!==null).length} com coordenadas.`);
  if(!args.includes('--write')){console.log('Simulação: nenhuma conexão ou gravação no Firebase.');return;}
  const position=args.indexOf('--project');
  if(position<0)throw new Error('A gravação exige --project com o ID exato do projeto.');
  const project=args[position+1];
  const {initializeApp,applicationDefault}=await import('firebase-admin/app');
  const {getFirestore,FieldValue}=await import('firebase-admin/firestore');
  const db=getFirestore(initializeApp({credential:applicationDefault(),projectId:project}));
  const refs=campuses.map(campus=>db.doc(`universities/${campus.universityId}/campuses/${campus.id}`));
  try{
    await db.runTransaction(async transaction=>{
      const parentIds=[...new Set(campuses.map(campus=>campus.universityId))];
      const parents=await transaction.getAll(...parentIds.map(id=>db.doc(`universities/${id}`)));
      if(parents.some(snapshot=>!snapshot.exists))throw new Error('Uma universidade não existe no banco; nenhum campus foi gravado.');
      const existing=await transaction.getAll(...refs);
      campuses.forEach((campus,index)=>{
        if(args.includes('--names-only')){
          if(!existing[index].exists)throw new Error(`Campus inexistente: ${campus.id}`);
          if(existing[index].get('name')!==campus.name)transaction.update(refs[index],{name:campus.name,updatedAt:FieldValue.serverTimestamp()});
        }else transaction.set(refs[index],{...campus,...(!existing[index].exists?{createdAt:FieldValue.serverTimestamp()}:{}),updatedAt:FieldValue.serverTimestamp()},{merge:true});
      });
    });
    const snapshots=await db.getAll(...refs);
    const fields=args.includes('--names-only')?['name']:['id','universityId','name','city','state','latitude','longitude'];
    snapshots.forEach((snapshot,index)=>{if(!snapshot.exists || fields.some(field=>snapshot.get(field)!==campuses[index][field]))throw new Error(`Gravação enviada, mas a conferência de ${campuses[index].id} falhou.`);});
    console.log(`Importação e conferência concluídas: ${campuses.length} campi no projeto ${project}.`);
  }finally{await db.terminate();}
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
