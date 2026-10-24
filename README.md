# Tô Dentro

Site de informações sobre universidades, cursos e formas de ingresso no ensino superior. O desenvolvimento começa pelo mobile; a adaptação desktop será feita posteriormente.

## Base inicial

HTML, CSS e JavaScript puro, sem dependências ou etapa de build. A home mobile está implementada a partir da imagem de referência, com navegação inferior compartilhada. As demais telas e integrações com dados serão implementadas posteriormente.

## Estrutura

```text
index.html                   Entrada e futura tela inicial
assets/
  images/                    Marca, mascote, fotos e outras imagens
  icons/                     Ícones exportados do protótipo
  fonts/                     Arquivos de fontes
src/
  pages/                     HTML das demais telas
  styles/
    main.css                 Entrada dos estilos globais
    base/                    Reset, tokens e regras gerais
    layout/                  Estrutura compartilhada de layout
    components/              Botões, cards, filtros e navegação
    pages/                   Estilos específicos de cada tela
  scripts/
    main.js                  Inicialização compartilhada
    components/              Comportamentos reutilizáveis
    pages/                   Lógica específica das telas
    services/                Futuras integrações com dados e APIs
    utils/                   Funções auxiliares
  data/                      Dados demonstrativos, separados da interface
 docs/                       Referências e documentação
```

As pastas reservadas contêm `.gitkeep` para serem preservadas quando o projeto passar a usar Git. Não há repositório Git inicializado nesta etapa.

## Abrir o projeto

O resultado visual está em `src/pages/resultado-vocacional.html`, com radar SVG acessível, perfil e cursos ilustrativos. O aviso após a primeira pergunta oferece acesso a esse exemplo enquanto as próximas perguntas são elaboradas. O resultado é fixo e não usa as respostas atuais. Salvar mapa grava o perfil demonstrativo em `localStorage` neste navegador; Refazer teste limpa a resposta da sessão e volta à primeira pergunta. Os cursos levam à busca de instituições filtrada por curso, usando o catálogo demonstrativo existente.

A abertura do teste vocacional está em `src/pages/teste-vocacional.html`, acessível pelos dois atalhos da home. O botão Começar teste abre `src/pages/quiz-vocacional.html`, com a primeira pergunta da referência, seleção múltipla, validação e progresso. As escolhas ficam em `sessionStorage` durante a sessão da aba, inclusive ao voltar à apresentação. As próximas perguntas e o resultado ainda não estão implementados; avançar com uma seleção abre um aviso temporário.

Abra `index.html` no navegador. Para desenvolver, também é possível usar o Live Server do VS Code e abrir a página pelo servidor local. Nunito e Material Symbols são carregadas pelo Google Fonts e precisam de conexão à internet.

## Convenções

- Usar nomes de arquivos em minúsculas com hífens, como `universidade-detalhes.html`.
- Manter estilos base para mobile e acrescentar adaptações com `@media (min-width: ...)` conforme o conteúdo exigir.
- Usar layouts fluidos; os 390 px do protótipo são referência, não uma largura fixa do site.
- Centralizar fontes, cores e espaçamentos em `src/styles/base/tokens.css`. A Nunito é carregada por `@import` no início desse arquivo. Material Symbols é carregada por `@import` em `src/styles/components/icons.css`.
- Usar a paleta do Figma ajustada nos tokens e nomes de classes separados por hífen, sem underline duplo.
- Preferir variáveis semânticas como `--color-primary` e `--color-text` nos componentes.
- Compartilhar estilos e comportamentos de componentes entre telas.
- Carregar CSS específico de cada página depois de `main.css`, com caminhos relativos corretos. Em `src/pages/`, o CSS global é `../styles/main.css` e assets ficam em `../../assets/`.
- Usar HTML semântico, rótulos em formulários e navegação por teclado.
- Separar dados demonstrativos de informações oficiais verificadas.

## Próxima etapa

### Navegação compartilhada

O HTML da barra é gerado pelo componente `src/scripts/components/bottom-nav.js`. Em cada tela, inserir apenas `<td-bottom-nav active="inicio"></td-bottom-nav>` e carregar o script com `defer`, antes de `main.js`. Para páginas em `src/pages/`, usar `../scripts/components/bottom-nav.js`.

O atributo `active` identifica a tela atual: `inicio`, `buscar`, `salvos` ou `perfil`. Os destinos são configurados no array `items` do componente e resolvidos a partir da raiz do projeto. Início e Buscar estão conectados; Salvos e Perfil continuam indisponíveis até suas páginas serem criadas.

Carregar também `main.css` em cada página; ele já importa as fontes e os estilos compartilhados. O componente requer JavaScript habilitado.

A home usa `src/styles/pages/home.css` e `src/scripts/pages/home.js`. A busca filtra apenas a instituição demonstrativa presente na home, sem catálogo de cursos ou API. Os atalhos de teste vocacional, mapa, calendário e comunidade abrem um aviso até que as respectivas telas sejam implementadas. A saudação Ana é demonstrativa, sem autenticação.

Continuar pelas demais telas mobile. O inventário e seus node IDs estão em [docs/prototipo.md](docs/prototipo.md).

A busca de universidades está em `src/pages/buscar-universidades.html`, acessível pelo card Universidades e pela barra inferior. Busca, ordenação e filtros operam sobre os três registros demonstrativos. O contador reflete os resultados reais. A busca cobre nome, sigla, cidade e cursos demonstrativos. Os cards abrem a tela da instituição correspondente. CSS de busca e cards é compartilhado com a home.

O acesso Filtros + abre `src/pages/filtros.html`, com região, curso, tipo de instituição, modalidade, período e valor. Aplicar retorna à busca com parâmetros na URL e preserva o texto e a ordenação. Limpar desmarca as restrições; aplicar confirma essa limpeza. Voltar descarta alterações ainda não aplicadas. Os atributos de curso e período nos cards são dados demonstrativos para validar o fluxo, não um catálogo oficial de ofertas.

Os cards da home e da busca usam `<td-university-card university-id="usp"></td-university-card>`, definido em `src/scripts/components/university-card.js`. Carregar `src/data/universities.js` antes do componente e da lógica de cada página. A fonte de dados demonstrativos é única e alimenta também `src/pages/universidade.html?id=usp` (ou `unesp`/`unicamp`). Ao integrar uma API, manter os campos desse modelo ou adaptar a resposta na camada de dados.

A tela de universidade adapta sigla, nome, cidade, descrição, cursos e ingresso à instituição selecionada. A seta retorna à origem e preserva filtros e busca. As seções Visão geral, Cursos e Ingresso são âncoras. As ações de salvar, calendário e localização ficam desabilitadas até sua implementação. Experiências de estudantes abre a comunidade da instituição. Informações de cursos, períodos e ingresso são demonstrativas e precisam ser substituídas por dados oficiais na integração.

A comunidade está em `src/pages/comunidade.html`, acessível pela home e pelo link Experiências de estudantes nos detalhes. `src/data/community.js` contém relatos ilustrativos, separados da interface. O parâmetro `universidade` seleciona relatos da instituição e dicas gerais; a home mostra todos. A seta volta à origem, preservando o contexto da universidade. Experiências, Dúvidas e Oportunidades filtram o conteúdo; categorias sem dados mostram um estado vazio. Curtidas e comentários são números ilustrativos, sem interação social. O botão Explorar oportunidades aguarda a próxima tela.

O mapa real está em `src/pages/mapa.html`, com Leaflet 1.9.4 e tiles OpenStreetMap (com atribuição). Há acesso na home, busca, filtros, comunidade e detalhes. O arquivo `src/scripts/components/map-links.js` preserva a origem e a instituição. Marcadores e cards abrem os detalhes; Filtrar retorna ao mapa depois de aplicar. A busca cobre as cidades do catálogo atual. Perto de mim centraliza o mapa após permissão do navegador, sem salvar a localização; não limita a lista por distância. Coordenadas são aproximadas e indicam um campus de referência ou a reitoria, não todos os campi. Internet é necessária para carregar Leaflet e tiles; em falhas, os cards permanecem disponíveis. Para geolocalização, usar HTTPS ou localhost.

Referências: https://leafletjs.com/reference.html e https://operations.osmfoundation.org/policies/tiles/

O Perfil da barra inferior abre `src/pages/perfil.html`. Nome e contagens de itens salvos são ilustrativos, sem autenticação. Editar preferências abre os filtros e retorna ao perfil; ao aplicar, o resumo é atualizado e as preferências são guardadas neste navegador em `to-dentro-preferences`, quando o armazenamento estiver disponível. Voltar sem aplicar descarta a edição. Essas preferências ainda não são sincronizadas automaticamente com a busca nem com um banco de dados. Listas de salvos, calendário e perfil vocacional ficam preparados para as próximas telas.

O calendário está em `src/pages/calendario.html`, acessível pela home, pelo perfil e por Ver prazos no calendário nos detalhes. Começa em outubro de 2026 conforme o protótipo, permite navegar pelos meses, filtrar categorias e selecionar um dia (clicar novamente remove a seleção). A agenda está em `src/data/calendar.js`: os três eventos são exemplos, não prazos oficiais, e não são específicos de uma universidade. A seta preserva a origem. Não há lembretes ou notificações nesta etapa.

Salvos abre `src/pages/salvos.html` pela barra inferior ou pelo perfil. Reutiliza o componente dos cards e começa com USP/UNICAMP como seleção demonstrativa. Salvar/remover nos detalhes grava IDs em `to-dentro-saved-universities` no navegador, sem conta ou servidor. O perfil mostra a contagem atual de universidades e zero cursos. Cursos e Datas têm estado vazio até a implementação de seus fluxos de salvamento. Uma lista vazia persistida não é preenchida novamente. Em falha de armazenamento, há aviso na página de detalhes.



## Configuração do Firebase

A integração está preparada na raiz do aplicativo:

```text
config/
  firebase.js    Configuração e inicialização de App, Authentication e Firestore
services/
  auth.js        Cadastro, login, logout, recuperação de senha e observação da sessão
```

Em `config/firebase.js`, substitua apenas o objeto `firebaseConfig` pelos dados do aplicativo Web registrados no console. Não cole a tag `<script>` inteira. Os módulos usam a mesma versão do SDK pelo CDN oficial, sem npm, Analytics ou Storage. Execute pelo servidor local ou GitHub Pages.

O serviço `services/auth.js` exporta `createAccount`, `login`, `logout`, `resetPassword` e `observeAuth`, para importação por scripts do tipo módulo. As telas ainda usam o fluxo anterior de visitante. A conexão dos formulários e da sessão será feita após preencher a configuração e ativar o provedor E-mail/Senha no Firebase. O Firestore também precisa ser criado e ter regras definidas antes do uso de dados.

## Dados mockados centralizados

Os registros acadêmicos e da comunidade têm uma fonte única em `src/data/mock-data.js`, organizada por universidade. Cada campus, oferta de curso, nota, processo seletivo, edição, evento, relato e resposta possui um ID; registros ligados a uma instituição mantêm `universityId`.

`src/data/catalog.js` centraliza consultas e relações. Os arquivos de dados anteriores são adaptadores para as telas existentes. Os links antigos continuam aceitos, e os novos fluxos acadêmicos passam a usar IDs estáveis. A estrutura distingue o curso geral da oferta em um campus e não reaproveita notas entre seleções diferentes.

Consulte [a estrutura dos mocks, os exemplos de consulta e a preparação para migração](docs/mock-data.md). Esta etapa não conecta as telas ao Firestore nem publica regras.

Validação: `node tests/data.cjs` e `node tests/access.cjs`.
