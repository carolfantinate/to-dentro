import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const fields = ['id', 'acronym', 'name', 'category', 'tuition', 'description', 'admission', 'officialWebsite', 'officialSource'];
export function validateUniversities(data) {
  if (data.schemaVersion !== 1 || data.source?.sheet !== 'Universidades' || !Array.isArray(data.universities) || !data.universities.length) throw new Error('Arquivo de universidades inválido.');
  const ids = new Set();
  for (const university of data.universities) {
    if (Object.keys(university).length !== fields.length || fields.some(field => typeof university[field] !== 'string' || !university[field].trim())) throw new Error('Campos ausentes ou inesperados em uma universidade.');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(university.id) || ids.has(university.id)) throw new Error(`ID inválido ou duplicado: ${university.id}`);
    if (!['Estadual', 'Federal', 'Municipal', 'Privada'].includes(university.category)) throw new Error(`Categoria inválida: ${university.id}`);
    for (const field of ['officialWebsite', 'officialSource']) if (!['https:', 'http:'].includes(new URL(university[field]).protocol)) throw new Error(`URL inválida: ${university.id}`);
    ids.add(university.id);
  }
  return data.universities;
}

export async function main(args = process.argv.slice(2)) {
  const allowed = new Set(['--write', '--project']);
  for (let index = 0; index < args.length; index++) {
    if (!allowed.has(args[index])) throw new Error(`Argumento desconhecido: ${args[index]}`);
    if (args[index] === '--project') { if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error('Informe o ID do projeto.'); index++; }
  }
  const data = JSON.parse(await readFile(new URL('./universities.json', import.meta.url), 'utf8'));
  const universities = validateUniversities(data);
  console.log(`Aba Universidades: ${universities.length} documentos válidos.`);
  for (const university of universities) console.log(`universities/${university.id}: ${university.name}`);
  if (!args.includes('--write')) { console.log('Simulação concluída. Nenhuma conexão ou gravação no Firebase.'); return; }
  const project = args[args.indexOf('--project') + 1];
  if (!args.includes('--project') || !project) throw new Error('A gravação exige --project com o ID exato do projeto Firebase.');
  const { initializeApp, applicationDefault } = await import('firebase-admin/app');
  const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
  const app = initializeApp({ credential: applicationDefault(), projectId: project });
  const db = getFirestore(app);
  try {
    // Uma transação pequena: todos os sete registros são confirmados juntos.
    // Merge e IDs estáveis preservam outros campos e não duplicam documentos.
    await db.runTransaction(async transaction => {
      const refs = universities.map(university => db.doc(`universities/${university.id}`));
      const snapshots = await transaction.getAll(...refs);
      universities.forEach((university, index) => {
        const snapshot = snapshots[index];
        transaction.set(refs[index], {
          ...university,
          source: data.source,
          schemaVersion: data.schemaVersion,
          ...(!snapshot.exists ? {createdAt: FieldValue.serverTimestamp()} : {}),
          updatedAt: FieldValue.serverTimestamp(),
        }, {merge: true});
      });
    });
    const imported = await db.getAll(...universities.map(university => db.doc(`universities/${university.id}`)));
    imported.forEach((snapshot, index) => {
      const saved = snapshot.data();
      if (!snapshot.exists || fields.some(field => saved[field] !== universities[index][field])) {
        throw new Error(`A gravação foi enviada, mas a conferência de ${universities[index].id} falhou.`);
      }
    });
    console.log(`Importação concluída no projeto ${project}: ${universities.length} universidades.`);
    console.log('Conferência concluída: todos os campos importados coincidem com a primeira aba.');
  } finally { await db.terminate(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
