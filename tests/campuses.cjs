const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');
(async()=>{
  const fixture=JSON.parse(read('tools/universities-import/campuses.json')).campuses;
  const universities=JSON.parse(read('tools/universities-import/universities.json')).universities.map(item=>({...item,public:true,courses:[],admissionMethods:[]}));
  const requests=[];
  const service=vm.createContext({db:{},collection:(_db,...segments)=>segments.join('/'),getDocsFromServer:async path=>{requests.push(path);return {docs:fixture.filter(campus=>path===`universities/${campus.universityId}/campuses`).map(campus=>({id:campus.id,data:()=>campus}))};}});
  vm.runInContext(read('services/campuses.js').replace(/^import .*;\r?\n/gm,'').replaceAll('export function','function').replaceAll('export async function','async function'),service);
  const records=await service.getCampuses(universities,[{id:'usp-sao-carlos',universityId:'usp',coordinates:[-22,-47],courses:['Medicina']}]);
  assert.equal(requests.length,7);
  assert.equal(records.length,28);
  assert.equal(records.filter(record=>record.coordinates).length,27);
  assert.equal(records.find(record=>record.id==='usp-sao-carlos').coordinates,null);
  assert.equal(records.find(record=>record.id==='ufabc-santo-andre').courses.length,0);
  assert.throws(()=>service.mergeCampus({...fixture[0],universityId:'outra'},universities[0]),/universidade/);
  service.getDocsFromServer=async()=>{throw new Error('permission-denied');};
  await assert.rejects(service.getCampuses(universities));
  class Element{
    constructor(){this.children=[];this.listeners={};this.value='';this.hidden=false;}
    append(...nodes){this.children.push(...nodes);}
    replaceChildren(...nodes){this.children=nodes;}
    setAttribute(name,value){this[name]=value;}
    addEventListener(name,callback){this.listeners[name]=callback;}
  }
  async function screen(search,withLeaflet=true){
    const elements=new Map();const element=selector=>{if(!elements.has(selector))elements.set(selector,new Element());return elements.get(selector);};
    const state={markers:[],bounds:[],centers:[]};
    const map={setView:(coordinates)=>{state.centers.push(coordinates);return map;},fitBounds:coordinates=>state.bounds.push(coordinates)};
    const layer={addTo:()=>layer,clearLayers:()=>{state.markers=[];}};
    const leaflet={map:()=>map,layerGroup:()=>layer,tileLayer:()=>({addTo:()=>({on(){}})}),marker:coordinates=>{assert.ok(coordinates?.length===2);state.markers.push(coordinates);const marker={bindTooltip:()=>marker,bindPopup:()=>marker,addTo:()=>marker};return marker;}};
    const context=vm.createContext({URL,URLSearchParams,Number,navigator:{},location:{href:'http://localhost/app/src/pages/mapa.html'+search,search,pathname:'/app/src/pages/mapa.html'},document:{querySelector:element,createElement:()=>new Element()},L:leaflet,window:{ToDentroUniversitiesReady:Promise.resolve(true),ToDentroCampusesReady:Promise.resolve(true),ToDentroUniversities:universities,ToDentroCampuses:records,ToDentroCourseCatalog:{courses:[]},L:withLeaflet?leaflet:null}});
    await vm.runInContext(read('src/scripts/pages/mapa.js'),context);
    return {elements,state};
  }
  const all=await screen('');
  assert.equal(all.elements.get('#map-universities').children.length,28);
  assert.equal(all.state.markers.length,27);
  assert.equal(all.state.bounds[0].length,27);
  assert.match(all.elements.get('#map-location-note').textContent,/1 campus/);
  const selected=await screen('?campus=usp-sao-carlos&cidade=S%C3%A3o%20Carlos');
  assert.equal(selected.elements.get('#map-universities').children.length,2);
  assert.equal(selected.state.markers.length,1);
  assert.equal(selected.state.centers.length,1); // Apenas o centro inicial; nunca centraliza em null.
  const offline=await screen('',false);
  assert.equal(offline.elements.get('#map-universities').children.length,28);
  assert.match(offline.elements.get('#map-status').textContent,/mapa não carregou/);
  const rules=read('firestore.rules');
  assert.match(rules,/match \/campuses\/\{campusId\} \{\s*allow get, list: if true;\s*allow create, update, delete: if false;/);
  console.log('OK: consulta das sete subcoleções, 28 campi, 27 marcadores, coordenadas nulas, filtros por cidade, leitura negada e lista sem Leaflet.');
})().catch(error=>{console.error(error);process.exitCode=1;});
