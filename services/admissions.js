import { collection, getDocsFromServer } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import { db } from '../config/firebase.js';
import { buildAdmissionCatalog } from './admission-catalog.js';
const read = async (...path) => (await getDocsFromServer(collection(db, ...path))).docs.map(doc => ({ ...doc.data(), id: doc.id }));
export async function getAdmissions(universities) {
  const programs = await read('admissionPrograms');
  const groups = await Promise.all([...universities.map(item => ({ item, root: ['universities', item.id], editions: 'admissionEditions' })), ...programs.map(item => ({ item, root: ['admissionPrograms', item.id], editions: 'editions' }))].map(async ({item, root, editions}) => {
    const [definitions, editionsList] = await Promise.all([root[0] === 'universities' ? read(...root, 'admissionProcesses') : Promise.resolve([item]), read(...root, editions)]);
    return Promise.all(editionsList.map(async edition => {
      const definition = definitions.find(process => process.id === edition.processId);
      if (!definition) throw new Error('Processo seletivo sem vínculo.');
      return { definition, edition, events: await read(...root, editions, edition.id, 'events') };
    }));
  }));
  return buildAdmissionCatalog(groups.flat(), universities);
}
