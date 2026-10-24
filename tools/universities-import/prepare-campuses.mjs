import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function parseCoordinate(input, axis) {
  let text = String(input ?? '').trim().replace(/^'+/, '').replaceAll(',', '.');
  if (!text) return null;
  const limit = axis === 'latitude' ? 90 : 180;
  const direction = text.match(/([NSEWO])\s*$/i)?.[1].toUpperCase();
  const negative = ['S', 'W', 'O'].includes(direction);
  text = text.replace(/[NSEWO]\s*$/i, '').trim();
  let value;
  if (text.includes("'")) {
    const match = text.match(/^(-?\d+(?:\.\d+)?)\s*°\s*(\d+(?:\.\d+)?)\s*'\s*(\d+(?:\.\d+)?)\s*"?$/);
    if (!match) return null;
    const degrees=Number(match[1]), minutes=Number(match[2]), seconds=Number(match[3]);
    if (minutes>=60 || seconds>=60) return null;
    value=(Math.abs(degrees)+minutes/60+seconds/3600)*(degrees<0 || negative ? -1 : 1);
  } else {
    text=text.replace(/°/g,'').trim();
    if (!/^-?\d+(?:\.\d+)?$/.test(text)) return null;
    value=Number(text);
    // Correção autorizada para as coordenadas brasileiras desta planilha.
    if (Math.abs(value)>limit && /^-?\d{4,}$/.test(text)) {
      const digits=text.replace('-','');
      value=Number(`${digits.slice(0,2)}.${digits.slice(2)}`)*(text.startsWith('-')?-1:1);
    }
    if (negative) value=-Math.abs(value);
  }
  if (direction && (axis==='latitude' ? !['N','S'].includes(direction) : !['E','W','O'].includes(direction))) return null;
  if (!Number.isFinite(value) || Math.abs(value)>limit) return null;
  return Number(value.toFixed(8));
}

const slug = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function prepareCampuses(source, universityIds) {
  const campuses=[], issues=[], seen=new Set();
  for (const row of source.rows) {
    const universityId=row.university.toLowerCase();
    if (!universityIds.includes(universityId)) throw new Error(`Universidade desconhecida na linha ${row.row}.`);
    if (!row.name.trim()) { issues.push({row:row.row,universityId,reason:'Sem nome de campus/unidade; linha não importada.'}); continue; }
    let nameKey=slug(row.name.replace(new RegExp(`^${row.university}\\s+`,'i'),''));
    if (universityId==='usp' && nameKey==='cidade-universitaria-butanta') nameKey='cidade-universitaria';
    const id=`${universityId}-${nameKey}`;
    if(seen.has(id)) throw new Error(`Campus duplicado: ${id}`);
    seen.add(id);
    let latitude=parseCoordinate(row.latitude,'latitude'), longitude=parseCoordinate(row.longitude,'longitude');
    if(latitude===null || longitude===null){latitude=null;longitude=null;issues.push({row:row.row,id,reason:'Par de coordenadas inválido ou incompleto; campus importado sem localização.'});}
    const name=row.name.trim().replace(new RegExp(`^${row.university}\\s+`,'i'),'').trim();
    campuses.push({id,universityId,name,city:row.city.trim(),state:row.state.trim(),latitude,longitude});
  }
  return {schemaVersion:1,campuses,issues};
}

export async function main() {
  const source=JSON.parse(await readFile(new URL('./campuses-source.json',import.meta.url),'utf8'));
  const universities=JSON.parse(await readFile(new URL('./universities.json',import.meta.url),'utf8'));
  const prepared=prepareCampuses(source,universities.universities.map(item=>item.id));
  await writeFile(new URL('./campuses.json',import.meta.url),JSON.stringify({schemaVersion:prepared.schemaVersion,campuses:prepared.campuses},null,2)+'\n');
  await writeFile(new URL('./campuses-review.json',import.meta.url),JSON.stringify({issues:prepared.issues},null,2)+'\n');
  console.log(`${prepared.campuses.length} campi preparados; ${prepared.campuses.filter(item=>item.latitude!==null).length} com localização.`);
  prepared.issues.forEach(issue=>console.log(`Linha ${issue.row}: ${issue.reason}`));
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
