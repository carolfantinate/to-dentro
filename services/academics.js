import { collection, getDocsFromServer } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import { db } from '../config/firebase.js';
const read = async (...path) => (await getDocsFromServer(collection(db,...path))).docs.map(doc=>({...doc.data(),id:doc.id}));

export async function getAcademics(universities) {
  if(!db)throw new Error('O Firebase não está configurado.');
  const results=await Promise.all(universities.map(async university=>{
    const root=['universities',university.id];
    const courses=await read(...root,'courses');
    if(!courses.length)return null;
    const [campuses,processes]=await Promise.all([read(...root,'campuses'),read(...root,'admissionProcesses')]);
    const groups=await Promise.all(campuses.map(async campus=>{
      const path=[...root,'campuses',campus.id,'courses'];
      const offerings=await read(...path);
      const scores=await Promise.all(offerings.map(offering=>read(...path,offering.id,'cutoffScores')));
      return {offerings,cutoffScores:scores.flat()};
    }));
    const offerings=groups.flatMap(group=>group.offerings), cutoffScores=groups.flatMap(group=>group.cutoffScores);
    const courseIds=new Set(courses.map(course=>course.id)), campusIds=new Set(campuses.map(campus=>campus.id));
    const processIds=new Set(processes.map(process=>process.id)), offeringIndex=new Map(offerings.map(offering=>[offering.id,offering]));
    if([...courses,...campuses,...processes,...offerings,...cutoffScores].some(item=>item.universityId!==university.id)
      || offerings.some(item=>!courseIds.has(item.courseId) || !campusIds.has(item.campusId))
      || cutoffScores.some(item=>{const offer=offeringIndex.get(item.offeringId);return !offer || !processIds.has(item.processId) || offer.campusId!==item.campusId || offer.courseId!==item.courseId;}))throw new Error('Vínculos acadêmicos inválidos.');
    return {universityId:university.id,courses,campuses,processes,offerings,cutoffScores};
  }));
  return results.filter(Boolean);
}
