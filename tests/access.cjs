const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.listeners = {}; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this[name] = value; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  contains(target) { return this === target || this.children.some(child => child.contains?.(target)); }
  closest() { return this; }
  matches() { return this.dataset.authAction === 'calendar' || this.dataset.category === 'lembretes'; }
}
const read = path => fs.readFileSync(path, 'utf8');
async function setup(page = 'index.html', user = null) {
  const main = new Element('main');
  main.append(new Element('section'));
  const body = new Element('body');
  const listeners = {};
  let writes = 0;
  const document = {
    currentScript: {src: 'http://localhost/app/src/scripts/services/auth.js'}, body,
    querySelector: selector => { assert.equal(selector, 'main'); return main; },
    createElement: tag => new Element(tag),
    addEventListener: (type, handler) => { listeners[type] = handler; },
  };
  const context = vm.createContext({document, Element, URL, URLSearchParams,
    location: {href: `http://localhost/app/${page}`}, window: {authService: {authReady: async () => {}, getCurrentUser: () => user, observeAuth: callback => { callback(user); }}},
    localStorage: { getItem: () => { throw Error('Visitor must not read personal saves'); }, setItem: () => writes++ },
  });
  vm.runInContext(read('src/scripts/services/auth.js').replace("import(new URL('services/auth.js', root).href)", 'Promise.resolve(window.authService)'), context);
  await context.window.ToDentroAuth.ready;
  function dispatch(type, control) {
    const event = {target: control, prevented: false, stopped: false,
      preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; }};
    listeners[type](event);
    return event;
  }
  return {main, body, context, dispatch, writes: () => writes};
}

(async () => {
// Acesso por URL direta não inicializa telas nem lê dados pessoais.
const privateScripts = ['perfil', 'salvos', 'quiz-vocacional', 'resultado-vocacional', 'criar-lembrete', 'criar-duvida', 'compartilhar-experiencia'];
for (const name of [...privateScripts, 'teste-vocacional']) {
  const app = await setup(`src/pages/${name}.html`);
  assert.equal(app.main.className, 'auth-guest-page', name);
  assert.equal(app.context.window.ToDentroAuth.isRestrictedPage(), true);
  if (privateScripts.includes(name)) await vm.runInContext(read(`src/scripts/pages/${name}.js`), app.context);
  assert.equal(app.writes(), 0);
}

// Todos os controles pessoais interrompem o evento antes dos handlers que gravam.
for (const id of ['save-university', 'course-save', 'results-save', 'save-interest-map', 'community-share', 'discussion-answer', 'add-reminder']) {
  const app = await setup();
  const control = new Element('button'); control.id = id;
  const event = app.dispatch('click', control);
  assert.ok(event.prevented && event.stopped, id);
  const dialog = app.body.children[0]; assert.equal(dialog.open, true);
  const links = dialog.children.find(child => child.className === 'auth-actions').children;
  assert.equal(new URL(links[0].href).pathname, '/app/src/pages/login.html');
  assert.equal(new URL(links[1].href).pathname, '/app/src/pages/cadastro.html');
  assert.equal(new URL(links[0].href).searchParams.get('retorno'), '/app/index.html');
  dialog.children.at(-1).listeners.click(); assert.equal(dialog.open, false);
}
for (const dataset of [{authAction: 'calendar'}, {category: 'lembretes'}]) {
  const app = await setup('src/pages/calendario.html');
  const button = new Element('button'); button.dataset = dataset;
  assert.equal(app.dispatch('click', button).prevented, true);
}
// Navegação informacional, Perfil e Salvos continuam acessíveis; os dois últimos têm convite próprio.
for (const name of ['buscar-universidades', 'curso', 'universidade', 'comunidade', 'datas', 'explorar-datas', 'calendario', 'perfil', 'salvos']) {
  const app = await setup(); const link = new Element('a'); link.href = `http://localhost/app/src/pages/${name}.html`;
  assert.equal(app.dispatch('click', link).prevented, false, name);
}
for (const name of ['teste-vocacional', 'quiz-vocacional', 'criar-duvida', 'compartilhar-experiencia', 'criar-lembrete']) {
  const app = await setup(); const link = new Element('a'); link.href = `http://localhost/app/src/pages/${name}.html?origem=teste`;
  assert.equal(app.dispatch('click', link).prevented, true, name);
}
const app = await setup('src/pages/duvida.html');
const form = new Element('form'); form.id = 'answer-form';
assert.equal(app.dispatch('submit', form).prevented, true);
app.context.window.ToDentroUniversities = [{id:'usp'}];
vm.runInContext(read('src/scripts/services/saved-items.js'), app.context);
assert.equal(app.context.window.ToDentroSaved.getUniversities().length, 0);
assert.equal(app.context.window.ToDentroSaved.toggleUniversity('usp'), null);
assert.equal(app.writes(), 0);

// Toda página carrega o serviço antes de seus componentes e scripts.
for (const file of ['index.html', ...fs.readdirSync('src/pages').filter(file => file.endsWith('.html')).map(file => `src/pages/${file}`)]) {
  const html = read(file);
  assert.ok(html.indexOf('scripts/services/auth.js') > 0, file);
  const scriptSources = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
  assert.ok(scriptSources[0].endsWith('scripts/services/auth.js'), file);
}
console.log('OK: páginas restritas, ações pessoais, navegação pública, retorno de conta e ausência de gravações para visitantes.');

const signedIn = await setup('src/pages/perfil.html', {uid:'user-1', email:'aluno@example.com'});
assert.equal(signedIn.context.window.ToDentroAuth.isAuthenticated(), true);
assert.notEqual(signedIn.main.className, 'auth-guest-page');
assert.equal(signedIn.context.window.ToDentroAuth.storageKey('saved'), 'saved:user-1');
})().catch(error => { console.error(error); process.exitCode = 1; });
