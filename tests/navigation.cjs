const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function run({previous='http://localhost/app/src/pages/curso.html?nota-campus=usp-bauru',referrer='',api=true,query='',length=3,button=0,ctrl=false}={}){
 let handler,backs=0,assigned=null;
 const href='http://localhost/app/src/pages/buscar-nota-de-corte.html'+query;
 const context=vm.createContext({URL,URLSearchParams,document:{currentScript:{src:'http://localhost/app/src/scripts/services/navigation.js'},referrer,addEventListener:(_event,callback)=>{handler=callback;}},location:{href,search:query,assign:value=>{assigned=value;}},history:{length,back:()=>backs++},window:{navigation:api?{currentEntry:{index:2},entries:()=>previous?[{index:1,url:previous},{index:2,url:href}]:[{index:2,url:href}]}:undefined}});
 vm.runInContext(fs.readFileSync('src/scripts/services/navigation.js','utf8'),context);
 const link={href:'http://localhost/app/src/pages/buscar-universidades.html',target:''};
 const event={target:{closest:()=>link},button,ctrlKey:ctrl,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){}};
 handler(event);return {backs,assigned,prevented:event.defaultPrevented};
}
assert.equal(run().backs,1);
assert.equal(run({previous:'http://localhost/app/src/pages/buscar-nota-de-corte.html'}).backs,1);
assert.equal(run({api:false,referrer:'http://localhost/app/src/pages/curso.html'}).backs,1);
assert.equal(run({api:false,referrer:'http://localhost/app/src/pages/curso.html',length:1}).backs,0);
assert.equal(run({api:false,referrer:'http://localhost/app/src/pages/curso.html',length:1}).assigned,'http://localhost/app/src/pages/curso.html');
assert.equal(run({previous:'https://external.example/'}).backs,0);
assert.equal(run({previous:null,query:'?from='+encodeURIComponent('/app/src/pages/curso.html?nota-campus=usp-bauru')}).assigned,'http://localhost/app/src/pages/curso.html?nota-campus=usp-bauru');
assert.equal(run({previous:null,query:'?from=https://external.example/'}).assigned,'http://localhost/app/src/pages/buscar-universidades.html');
assert.equal(run({previous:null,query:'?from=/app-other/private'}).assigned,'http://localhost/app/src/pages/buscar-universidades.html');
assert.equal(run({ctrl:true}).backs,0);assert.equal(run({button:1}).backs,0);
for(const file of ['index.html',...fs.readdirSync('src/pages').filter(file=>file.endsWith('.html')).map(file=>'src/pages/'+file)]){
 const html=fs.readFileSync(file,'utf8');assert.equal((html.match(/scripts\/services\/navigation.js/g)||[]).length,1,file);
 assert.ok(html.indexOf('scripts/services/auth.js')<html.indexOf('scripts/services/navigation.js'),file);
}
const icons=fs.readFileSync('src/styles/components/icons.css','utf8');assert.ok(icons.includes('Material+Symbols+Outlined'));assert.ok(!icons.includes('icon_names='));
console.log('OK: voltar uma etapa, histórico interno, acesso direto/nova aba, origem externa, contexto da prévia e importação central dos ícones.');
