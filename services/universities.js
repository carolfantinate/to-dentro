import { collection, getDocsFromServer } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import { db } from '../config/firebase.js';

export function mergeUniversity(record, mock = {}) {
  const safeUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  if (!record.id || typeof record.name !== 'string' || typeof record.acronym !== 'string') throw new Error('Registro de universidade incompleto.');
  return {
    ...mock, ...record,
    id: record.id,
    public: ['Estadual', 'Federal', 'Municipal'].includes(record.category),
    free: record.tuition === 'Gratuita',
    website: safeUrl(record.officialWebsite),
    admissionsUrl: safeUrl(record.officialWebsite),
    officialSource: safeUrl(record.officialSource),
    city: mock.city || '', state: mock.state || '',
    courses: mock.courses || [], periods: mock.periods || [],
    admissionMethods: mock.admissionMethods || [],
    photos: mock.photos || [], campusIds: mock.campusIds || [],
    mode: mock.mode || null,
    generalDataSource: 'firestore', academicDataSource: 'mock',
  };
}

export async function getUniversities(mocks = []) {
  if (!db) throw new Error('O Firebase não está configurado.');
  const snapshot = await getDocsFromServer(collection(db, 'universities'));
  const mockIndex = new Map(mocks.map(item => [item.id, item]));
  return snapshot.docs.map(document => mergeUniversity({...document.data(), id: document.id}, mockIndex.get(document.id)))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
