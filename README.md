# Tô Dentro!

Plataforma de orientação universitária para explorar instituições, campi, cursos, formas de ingresso e oportunidades no ensino superior.

[Acessar o Tô Dentro!](https://to-dentro.github.io/app/)

## Executar localmente

Abra a pasta em um servidor local, como o Live Server do VS Code, e acesse `index.html`. O projeto usa HTML, CSS e JavaScript puro, sem instalação de dependências ou etapa de build.

Use HTTP local ou HTTPS: os módulos JavaScript e as integrações não devem ser executados por `file://`. É necessária conexão para Firebase, Google Fonts, Material Symbols e o mapa.

## Estrutura

```text
index.html          Página inicial
assets/             Marca e imagens utilizadas pelo aplicativo
config/             Configuração pública do Firebase
services/           Autenticação, perfil, preferências e consultas ao banco
src/
  data/             Catálogo, adaptadores e dados locais utilizados pelas telas
  pages/            Páginas HTML
  scripts/          Componentes, navegação e lógica das páginas
  styles/           Reset, tokens, estilos globais e estilos das telas
docs/
  firebase-setup.md Configuração e estrutura do Firebase
firestore.rules     Regras de acesso para publicação no Firebase
```

## Dados e funcionalidades

O catálogo de instituições, campi, cursos cadastrados, notas e datas de ingresso é consultado no Firestore. Algumas áreas ainda utilizam dados de demonstração, mantidos em `src/data/` porque são usados pela interface.

Cadastro e login utilizam Firebase Authentication. Perfil e preferências são salvos no Firestore. As preferências são compartilhadas entre cadastro, perfil e busca. Salvos e lembretes pessoais utilizam o armazenamento local do navegador separado por usuário.

O mapa usa Leaflet e OpenStreetMap. O calendário apresenta datas cadastradas e diferencia previsões de eventos com dia definido. A exportação para o calendário do celular ainda não está implementada.

## Configuração do Firebase

A configuração pública do aplicativo Web fica em `config/firebase.js`. Ative Authentication com E-mail/Senha, configure os domínios autorizados e crie o Firestore. Publique o conteúdo de `firestore.rules` no console do Firebase.

Consulte [a configuração do Firebase](docs/firebase-setup.md). Chaves administrativas, planilhas e ferramentas de importação não fazem parte dos arquivos do site.

## Padrões do projeto

- Nomes de arquivos e classes em minúsculas, com hífens e sem underline duplo.
- Componentes compartilhados para evitar repetição de código.
- Cores, tipografia e espaçamentos em `src/styles/base/tokens.css`.
- Fontes e ícones importados de forma centralizada.
- Layouts responsivos, HTML semântico e navegação por teclado.

## Tecnologias

HTML5, CSS3, JavaScript, Firebase Authentication, Cloud Firestore, Leaflet, OpenStreetMap, Google Fonts e Material Symbols.

Projeto desenvolvido para fins acadêmicos.
