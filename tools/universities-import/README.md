# Importação das universidades

A fonte é a primeira aba (Universidades, A1:H8) da planilha compartilhada. `universities.json` contém os sete registros transcritos, sem informações das outras abas. Links de fontes são preservados; seus conteúdos não foram verificados independentemente. Não foram inventados campi, cursos, fotos, mensalidades numéricas nem notas.

Os IDs existentes são preservados: usp, unesp, unicamp, unifesp, ufscar, ufabc e univesp. Categoria administrativa (Estadual/Federal) e mensalidade (Gratuita) são campos distintos. Formas de ingresso permanecem como o texto da planilha, preservando ressalvas de edital; não são convertidas automaticamente em processos seletivos completos.

## Simular sem acessar o Firebase

Na raiz do aplicativo:

```powershell
node tools/universities-import/import.mjs
```

## Importar posteriormente

1. Revise `universities.json`.
2. Instale a ferramenta administrativa separadamente do aplicativo:

```powershell
npm install --prefix tools/universities-import firebase-admin
```

3. Configure credenciais administrativas do projeto no seu computador (Application Default Credentials). A chave local fica em `.credentials/to-dentro-admin.json`, pasta ignorada pelo Git. Aponte `GOOGLE_APPLICATION_CREDENTIALS` para ela. Essa pasta não deve ser publicada por ferramentas de upload. A configuração Web de `config/firebase.js` não substitui essas credenciais. Nunca coloque uma chave administrativa no frontend ou no Git.
4. Execute usando o ID exato do projeto, que é diferente do nome de exibição:

```powershell
node tools/universities-import/import.mjs --write --project SEU_PROJECT_ID
```

O comando com `--write` grava no banco selecionado. Sem ele, não há conexão. A transação usa os IDs fixos e mescla apenas os campos gerais fornecidos: uma nova execução atualiza esses campos sem duplicar instituições, remover documentos ou apagar subcoleções. Os dados de usuários não são acessados.

Destino: `universities/{universityId}`. Cada documento recebe os campos da planilha, a identificação da fonte, versão e timestamps. Campi e outras especificidades poderão ser adicionados posteriormente sob a mesma universidade, depois que as respectivas abas estiverem prontas.

## Estado da integração

A primeira importação foi executada em 24/10/2026 no projeto `to-dentro-webapp`. Os sete documentos foram relidos e seus campos comparados com o arquivo de origem. As telas foram conectadas à consulta dos dados gerais em `services/universities.js`; os mocks acadêmicos continuam associados por ID. O JSON pode ser usado como fixture local para testar a futura consulta sem inventar informações ausentes. O arquivo `firestore.rules` já contém a leitura pública de `universities`; copie e publique sua versão atual no console para habilitá-la, mantendo a escrita administrativa. Não abra a escrita pública para rodar o importador: o SDK administrativo usa permissões próprias.

## Campi da segunda aba

Em 24/10/2026 foram extraídas somente as colunas A:F da aba `Campi e polos`: Universidade, Campus/unidade, Cidade, UF, Latitude e Longitude. Tipo, fonte oficial e status não foram utilizados.

- `campuses-source.json`: transcrição das 29 linhas da aba, com número de linha para rastreabilidade local.
- `prepare-campuses.mjs`: normaliza coordenadas decimais e DMS. A inserção de separador após os dois dígitos dos graus foi autorizada pela usuária. Não altera a planilha.
- `campuses.json`: 28 campi identificados para importação. Campos: `id`, `universityId`, `name`, `city`, `state`, `latitude`, `longitude`.
- `campuses-review.json`: dois casos para revisão. USP São Carlos tem DMS inválido (segundos e/ou minutos acima de 59), portanto ambas as coordenadas ficam nulas. A linha genérica da UNIVESP, sem nome de unidade, foi excluída da importação.

Destino: `universities/{universityId}/campuses/{campusId}`. Os IDs compatíveis com os mocks anteriores foram preservados (por exemplo `usp-cidade-universitaria` e `unicamp-barao-geraldo`). Uma transação confere a existência dos pais e grava todos os campi. Reexecuções atualizam campos sem duplicar documentos nem apagar outros campos ou subcoleções. Campos administrativos `createdAt` e `updatedAt` são timestamps do servidor.

A importação foi executada no projeto `to-dentro-webapp`, e os 28 documentos foram relidos e comparados com o arquivo preparado. Há 27 campi com coordenadas válidas. Não houve verificação geográfica independente dos pontos fornecidos pela planilha.

```powershell
node tools/universities-import/prepare-campuses.mjs
node tools/universities-import/import-campuses.mjs
node tools/universities-import/import-campuses.mjs --write --project to-dentro-webapp
```

O último comando grava no banco e exige as mesmas credenciais administrativas. Testes: `node tests/campuses-import.mjs`.

O mapa está conectado às subcoleções por `services/campuses.js` e `src/data/campuses.js`. Publique a versão atual de `firestore.rules`: ela libera a leitura dos documentos de campi e mantém a escrita pelo cliente bloqueada. Campi sem coordenadas aparecem apenas na lista, sem marcador. Cursos e modalidades continuam associados aos mocks apenas quando há correspondência pelo ID do campus. Em falha de leitura, a tela avisa que está exibindo a demonstração local.

## Cursos da terceira aba

Fonte: aba `Cursos - amostra`, intervalo A1:L13, terminando **inclusive** em Sistemas de Informação da USP São Carlos. Foram transcritas 12 ofertas de Medicina, Direito, Ciência da Computação e Sistemas de Informação. Nenhuma linha posterior foi usada.

Arquivos:

- `courses-source.json`: transcrição dos campos da planilha e números das linhas.
- `courses-campus-mapping.json`: vínculo explícito dos nomes da aba com os IDs dos campi. “Ribeirão” aponta para `usp-ribeirao-preto`. “São Paulo” aponta **provisoriamente**, por escolha da usuária, para `usp-cidade-universitaria`. As ofertas guardam `sourceCampus` e `campusAssignmentProvisional`; esse vínculo não confirma o endereço ou unidade de cada curso.
- `prepare-courses.mjs` e `courses.json`: conversão e dados estruturados; o preparador exige a linha limite e ignora qualquer linha posterior.
- `import-courses.mjs`: simulação ou gravação administrativa com transação e conferência por releitura.

Estrutura no Firestore:

```text
universities/usp
  courses/{courseId}                              4 definições de curso
  admissionProcesses/{processId}                  3 processos
  campuses/{campusId}
    courses/{offeringId}                          12 ofertas
      cutoffScores/{scoreId}                     29 resultados no total
```

A definição geral mantém nome e área conforme a planilha. Cada oferta tem ID próprio incluindo campus, curso, grau, modalidade e turno, além de duração em semestres, vagas, fonte e referências. Duas ofertas de Direito em São Paulo, por exemplo, são registros separados para manhã e noite. `seatsPeriod` é `year` somente quando a célula menciona ano; “60 vagas” permanece com período nulo. A matriz curricular é nula porque ainda não foi coletada.

As células de processo/ano/modalidade/nota são decompostas sem compartilhar notas entre ofertas. As notas da FUVEST de Medicina em São Paulo conservam primeira fase com valor 80 e segunda fase com faixa 80–88. No Provão Paulista, L1, L2 e L4 conservam faixa 70–74 e L3 faixa 76–80, como categorias separadas. Uma faixa usa `minimum`/`maximum` e `value: null`; uma nota única usa `value` e limites nulos. Quando a fase ou escala não está indicada, fica nula. As siglas L1–L4 não receberam uma descrição de cota por suposição. O texto original de cada processo é preservado em `rawResult`.

A fonte oficial recebida é o link geral do Jupiterweb. Os números foram transcritos da planilha e não conferidos independentemente em editais. Nenhum dado foi inventado para preencher matriz, escala ou fase.

```powershell
node tools/universities-import/prepare-courses.mjs
node tools/universities-import/import-courses.mjs
node tools/universities-import/import-courses.mjs --write --project to-dentro-webapp
node tests/courses-import.mjs
```

A gravação verifica os documentos pais, exige que o arquivo preparado corresponda à fonte e aos vínculos aprovados, e atualiza por IDs fixos sem excluir registros. `createdAt` é preservado; `updatedAt` usa timestamp do servidor. A etapa alimenta o banco. As telas de cursos e notas estão conectadas por `services/academics.js`; publique a versão atual de `firestore.rules` para habilitar a leitura pública dos cursos, ofertas, processos e resultados. Os dados da USP substituem os mocks acadêmicos dessa instituição.

Importação executada em 24/10/2026 no projeto `to-dentro-webapp`: 48 documentos gravados e relidos, com todos os campos conferidos contra o arquivo preparado (4 cursos, 12 ofertas, 3 processos e 29 resultados).
