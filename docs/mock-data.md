# Dados mockados do Tô Dentro!

## Onde editar

`src/data/mock-data.js` é a única fonte dos registros mockados. A raiz do catálogo é a universidade: cada entrada de `universities` possui ID e reúne seus campi, processos de ingresso, edições, datas e relatos. O arquivo contém apenas dados serializáveis; não importa Firebase nem faz chamadas de rede.

`src/data/catalog.js` resolve as relações, cria índices em memória e oferece consultas por ID. As telas usam `window.ToDentroData`. Os antigos arquivos `universities.js`, `courses.js`, `campuses.js`, `comparisons.js`, `admission-dates.js`, `calendar.js`, `community.js` e `opportunities.js` são adaptadores pequenos para as telas existentes; não mantenha novos registros neles.

A ordem de carregamento é: `mock-data.js`, `catalog.js`, adaptadores necessários e scripts das telas. A proteção de acesso anterior continua sendo carregada antes dos componentes. Nada foi conectado ao Firestore nesta reorganização.

## Estrutura por universidade

```text
universities[]
  id, nome, apresentação e links da instituição
  primaryCampusId
  photos[]                     Imagens e créditos, com ID e universityId
  campuses[]
    id, universityId, localização, tipo e aliases
    courses[]                  Ofertas do curso naquele campus
      id, universityId, campusId, courseId
      modeId, periodId, unidade, duração e link
      cutoffScores[]
        id, universityId, campusId, offeringId
        processId, edition, selectionCategoryId, value, scale
  admissionProcesses[]         Processos de ingresso com IDs e universityId
  admissionEditions[]          Edição/ano de um processo da universidade
    events[]                   Etapas, intervalos de datas e horários
  calendarEvents[]             Eventos da agenda demonstrativa
  communityPosts[]             Relatos e dúvidas vinculados à instituição
    replies[]                  Respostas com ID e referência ao post
  opportunityIds[]             Referências aos guias gerais de oportunidades
```

Dados que não pertencem a uma universidade específica ficam compartilhados: áreas e definições de curso em `courseAreas` e `courseCatalog`; autores fictícios, guias de apoio, cidades, categorias, modalidades, turnos, exemplo vocacional e relatos gerais em `general`. Um relato sem instituição mantém `universityId: null`, sem receber uma universidade inventada.

## Curso e oferta são registros diferentes

A definição de **Ciência da Computação** tem o ID `ciencia-da-computacao`. Uma oferta dessa definição no campus Cidade Universitária da USP tem seu próprio ID:

```js
{
  id: 'usp-cidade-universitaria-ciencia-da-computacao-presencial-integral',
  universityId: 'usp',
  campusId: 'usp-cidade-universitaria',
  courseId: 'ciencia-da-computacao',
  modeId: 'presencial',
  periodId: 'integral'
}
```

O mesmo curso em São Carlos tem outra oferta e outro `campusId`. A nota pertence à oferta, ao processo de ingresso, à edição e à categoria de concorrência. O turno e a modalidade são definidos pela oferta. Não reutilize a nota de uma universidade para todas as suas ofertas.

Os IDs são strings estáveis, sem acentos ou espaços, e já estão gravados nos mocks. Não são recriados a partir do nome durante a navegação. Renomear um título não deve mudar seu ID. Registros filhos mantêm `universityId`, mesmo quando já estão dentro da universidade, para facilitar consultas e futura exportação.

## Consultas disponíveis

```js
const data = window.ToDentroData;

data.getUniversity('usp');
data.getCampuses('usp');
data.getCourse('ciencia-da-computacao');
data.getOfferings({
  universityId: 'usp',
  campusId: 'usp-cidade-universitaria',
  courseId: 'ciencia-da-computacao'
});
data.getProcesses('usp');
data.findScore({
  universityId: 'usp',
  campusId: 'usp-cidade-universitaria',
  courseId: 'ciencia-da-computacao',
  processId: 'usp-enem-usp',
  edition: 2026,
  selectionCategoryId: 'ampla-concorrencia',
  periodId: 'integral'
});
```

Uma busca sem nota para a combinação solicitada retorna `null`, e a tela mostra que a referência está indisponível. Comparações também não substituem uma nota ausente pela nota de outro campus, curso, ano ou processo. A nota da USP, antes diferente nas telas de corte e comparação, foi unificada em `782.45`, o valor que já estava no mock da consulta de corte.

As listas de cursos e campi são derivadas das ofertas. O mapa só usa localizações que já possuem coordenadas no mock. Campi que antes apareciam apenas nos detalhes ou na comparação não receberam coordenadas inventadas. A Reitoria da UNESP tem tipo `administrative` e não recebe cursos; as antigas ofertas sem campus identificado ficam na unidade provisória `unesp-campus-a-confirmar`, com tipo `unassigned`. Essa unidade precisa ser corrigida com dados reais antes de uma importação definitiva.

Os registros preservados e as associações acrescentadas para unificar os protótipos estão identificados como mocks. Links oficiais nos registros não tornam as notas, datas ou ofertas verificadas. Esta etapa organiza os exemplos existentes; não completa o catálogo real das instituições. Nem todo curso da lista geral possui oferta cadastrada nas universidades de exemplo.

## Compatibilidade

- Os IDs de universidades (`usp`, `unesp`, `unicamp`) permanecem iguais.
- Valores antigos de curso, como `ciencia da computacao`, continuam sendo resolvidos; novos links de detalhes usam o ID estável.
- Aliases antigos de campus, como `butanta`, continuam sendo aceitos dentro da universidade correta.
- Comparações antigas com `opcao=usp:0` continuam sendo lidas. Novas comparações usam o ID da oferta.
- Cursos salvos tanto no formato antigo `usp:ciencia da computacao` quanto pelo ID da oferta continuam sendo reconhecidos. A tela de Salvos diferencia o campus quando a oferta está especificada.
- As etapas de datas preservam `legacyId` para manter a identidade dos eventos já salvos no calendário local.
- Os autores `person-*` são fixtures da comunidade, não contas do Firebase Authentication.

## Preparação para o banco

A organização editorial é hierárquica, mas não exige salvar uma universidade inteira como um documento gigante. `data.collections` e `data.exportCollections()` geram registros separados por entidade, com IDs e referências:

- `universities`, `universityPhotos`, `campuses`, `courses`, `courseAreas`;
- `courseOfferings`, `cutoffScores`, `admissionProcesses`;
- `admissionEditions`, `admissionEvents`, `calendarEvents`;
- `communityPosts`, `communityReplies`, `people`, `opportunities`;
- `cities`, `vocationalProfiles`, `selectionCategories`, `periods`, `modes`.

```js
const preparedData = window.ToDentroData.exportCollections();
```

O resultado é uma cópia JSON, sem funções ou objetos do SDK. A operação não grava arquivo nem envia dados ao Firebase. As coleções definitivas, documentos de usuário, regras e importação serão definidos em uma etapa posterior. O conteúdo genérico de apresentação dos cursos e outros textos de interface não precisa se tornar uma coleção do banco.

## Verificação

```sh
node tests/data.cjs
node tests/access.cjs
```

O teste dos dados confere IDs únicos, relações entre entidades, separação de unidades administrativas, consultas de notas por contexto, aliases antigos, exportação sem mutação da fonte, ordem dos scripts e resultados da tela de nota de corte.
