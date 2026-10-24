# Cadastro e perfil no Firebase

Ative o provedor E-mail/Senha em Authentication. A configuração do aplicativo Web fica em `config/firebase.js`; os serviços ficam na pasta `services/`, na raiz.

## Publicar as regras

Copie todo o conteúdo de `firestore.rules` para **Firestore Database → Regras** no console e clique em **Publicar**. O arquivo local não publica nada automaticamente. As regras anteriores, que negam tudo, impedem salvar o perfil.

A coleção `users` é criada quando o primeiro perfil é salvo. Cada documento usa o UID do Authentication como ID. Somente o dono autenticado pode ler ou atualizar esse documento. Listagem, exclusão, outras coleções e subcoleções continuam bloqueadas.

## Dados do perfil

- `uid`, `displayName`, `email` e `schemaVersion: 1`;
- `createdAt`, `updatedAt` e `termsAcceptedAt`: timestamps do servidor;
- `preferences`: `institutionTypes`, `cityIds`, `modeIds`, `periodIds`, `courseIds`, `areaIds`, `admissionMethodIds` e `discoveringCourses`.

As seleções são listas de IDs estáveis. Listas vazias representam ausência de preferência; `discoveringCourses` indica a escolha de ainda descobrir cursos. Senhas são enviadas apenas ao Authentication.

Authentication e Firestore são operações separadas. Se a conta for criada e o banco falhar, a tela mantém as escolhas e permite concluir com a mesma conta, sem criar outra. Uma conta conectada sem documento de perfil também pode concluir o cadastro posteriormente.

O perfil só confirma a gravação depois da resposta do Firestore. Salvos, calendário, testes e publicações continuam usando armazenamento local separado por UID; ainda não são sincronizados no banco. Campi, ofertas de cursos, notas, processos detalhados e datas continuam mockados. Os dados gerais das universidades são consultados no Firestore.

## Verificação

Execute `node tests/registration.cjs`, `node tests/access.cjs` e `node tests/data.cjs`. São verificações locais; não criam usuários reais nem substituem um teste integrado após publicar as regras. As regras não foram executadas no emulador neste ambiente.

## Preferências compartilhadas com a busca

O cadastro, o perfil e a busca de universidades usam `users/{uid}.preferences`. Ao entrar na busca ou no editor de filtros com uma sessão ativa, as escolhas são carregadas do perfil, incluindo várias cidades e cursos. Parâmetros antigos da URL não substituem as preferências salvas.

Aplicar filtros ou alterar os atalhos de cidade/tipo na busca atualiza o mesmo documento. Limpar e aplicar também persiste a ausência de preferência. Os turnos, não exibidos nesse editor, são preservados. Formas de ingresso começam sem restrição no cadastro e podem ser escolhidas nos filtros. Texto pesquisado e ordenação continuam locais à navegação.

Em falha de leitura ou gravação, a tela informa o erro e não confirma a alteração. Visitantes continuam usando filtros pela URL, sem gravar um perfil. Verificação: `node tests/search-preferences.cjs`.

## Catálogo de universidades

`services/universities.js` consulta a coleção `universities` sem exigir login. O adaptador `src/data/universities.js` expõe uma promessa de carregamento compartilhada, e os consumidores aguardam a consulta antes de renderizar os dados. A busca cria os cards a partir dos documentos recebidos, sem uma lista fixa de três instituições.

Nome, sigla, categoria administrativa, mensalidade, descrição, texto de ingresso, site oficial e fonte vêm do banco. Os detalhes acadêmicos e as fotos locais continuam associados pelo ID da universidade. Um registro sem campus, curso, cidade ou modalidade não recebe esses dados por suposição. Os links de ingresso apontam inicialmente para o site oficial, porque a planilha não separa um endereço de edital para cada processo.

A página de universidade exibe categoria, mensalidade e descrição, além de permitir acessar a fonte das informações. Se a consulta falhar, há aviso explícito de que os dados apresentados são a demonstração local.

**Publicação necessária:** copie novamente `firestore.rules` no console do Firebase e publique. A regra de `/universities/{universityId}` permite leitura pública dos documentos gerais e bloqueia escrita pelo cliente. A subcoleção `campuses` também permite leitura pública; outras subcoleções continuam bloqueadas. As regras de perfis permanecem restritas ao dono. O arquivo local não altera as regras publicadas automaticamente.

Verificação local: `node tests/universities.cjs`. A execução das regras não foi validada no emulador.

## Campi e mapa

`services/campuses.js` lê `universities/{universityId}/campuses` para cada universidade do catálogo. A consulta não usa collection group e não exige login. O adaptador aguarda as universidades, carrega os campi e só então o mapa renderiza a lista e os marcadores.

Os campos usados são ID, vínculo com a universidade, nome, cidade, UF, latitude e longitude. Coordenadas vêm exclusivamente do documento: valores nulos ou inválidos não são substituídos por coordenadas dos mocks. O campus permanece na lista com a indicação de localização pendente. Somente pontos válidos entram nos marcadores, no enquadramento do mapa ou na centralização por campus. Se Leaflet não carregar, a lista continua disponível. Se o banco falhar, há aviso explícito de demonstração local.

Cursos e modalidade são demonstrativos apenas para campi cujos IDs correspondem aos mocks existentes; não são copiados para os novos campi. Publique novamente `firestore.rules` para habilitar a leitura da subcoleção `campuses`, preservando a escrita administrativa e a privacidade dos perfis.

Verificação: `node tests/campuses.cjs` cobre os 28 documentos, os 27 pontos válidos, o campus sem coordenadas, filtro de cidade, falha de consulta e lista sem Leaflet. A integração com as regras publicadas depende da publicação manual no console.

## Cursos, ofertas e notas nas telas

`services/academics.js` lê as definições por universidade e, nas instituições com cursos cadastrados, consulta seus campi, processos, ofertas e resultados. `src/data/courses.js` expõe `ToDentroCoursesReady`; os consumidores aguardam o catálogo antes de renderizar. A aplicação dos dados é completa por universidade: as ofertas e notas antigas dessa instituição são substituídas pelas do banco, sem preencher lacunas com notas mockadas. As demais instituições ainda preservam seu protótipo local.

A página do curso mostra duração em semestres no resumo quando ela é comum às ofertas. Vagas, turno e duração são apresentados por campus/oferta. Os campi são agrupados sem duplicar o mesmo campus por turno; o ícone à direita abre o ponto do campus no mapa e permite voltar ao curso. A identificação de São Paulo como Cidade Universitária / Butantã foi confirmada pela usuária e não recebe aviso na interface.

“Como entrar” aparece antes das notas e usa os processos/edições efetivamente associados. As notas aparecem no próprio curso com processo, ano, categoria e fase quando indicada. A consulta específica tem seletores dependentes de curso, universidade, campus, turno, processo, edição, categoria e fase. A tela de resultado usa a mesma referência, incluindo faixas, e leva à fonte cadastrada para a oferta. A escala não é inferida; resultados reais sem escala não entram no gráfico demonstrativo de comparação.

Matriz curricular, disciplinas e carreiras não foram coletadas para os cursos importados; os blocos de conteúdo genérico não são apresentados como dados desses cursos.

**Publique novamente `firestore.rules`:** foram acrescentadas leituras públicas para definições de cursos, processos seletivos, ofertas nos campi e notas dessas ofertas. A escrita pelo cliente continua bloqueada. Não houve publicação automática.

Testes: `node tests/academics.cjs`, além dos testes existentes. A navegação curso → consulta → resultado foi verificada numa prévia local com o mesmo arquivo de dados importado; a consulta real depende da publicação dessas regras.

### Filtros de notas no curso

A seção começa sem resultados abertos e permite filtrar por campus, modalidade de concorrência e processo, separadamente ou em conjunto. Selecionar apenas campus mostra todas as referências daquele campus; combinações sem registros exibem um estado vazio. Limpar volta ao estado recolhido. Ao abrir uma oferta específica, seu campus começa selecionado.

As opções vêm das notas cadastradas para o curso, sem inventar cotas ausentes. Os resultados preservam a apresentação por campus/turno e os dados de ano, fase e faixa. O botão azul-marinho “Consulta detalhada” acompanha o contexto escolhido e abre o formulário completo de curso, universidade, campus, processo, edição, modalidade, turno e fase. O botão “Comparar universidades” fica na tela do resultado detalhado; a consulta rápida não tem um botão de comparação. A comparação mantém o curso mesmo quando ele tem somente uma instituição disponível, e permite retornar à página de origem. Esta alteração não exige novas regras do Firestore.

### Navegação da universidade

“Saiba mais” contém somente o card branco do site oficial, com seta de saída e abertura em nova aba. Fonte e processos seletivos não aparecem como links adicionais nessa seção. As fontes específicas de notas continuam disponíveis na consulta detalhada.

“Ver localização” envia o ID da instituição e filtra sua lista e seus marcadores no mapa. Sem campus específico, o enquadramento considera todos os pontos válidos dessa instituição. O ícone de mapa na oferta do curso envia também o campus e centraliza seu ponto. A lista continua mostrando campi sem coordenadas.

O atalho “Notas de corte” da universidade abre o formulário completo com a instituição preenchida e o curso por selecionar. A universidade aparece antes do curso no formulário, e cursos/turnos/processos/edições/categorias/fases são atualizados conforme as escolhas. Uma instituição sem oferta cadastrada não é substituída silenciosamente por outra.

“Como entrar” no curso usa uma lista de processos e edições, sem um card separado para cada item. Essas mudanças não exigem nova publicação de regras nem alteram as notas ou coordenadas armazenadas.

## Setas de retorno e ícones

`src/scripts/services/navigation.js` é carregado em todas as páginas após a proteção de autenticação. As setas com rótulo “Voltar” usam somente uma etapa do histórico quando a entrada anterior pertence ao aplicativo. Na ausência de histórico interno (acesso direto ou nova aba), o retorno usa uma origem local válida ou o destino de segurança da página, sem navegar para origens externas. Links abertos com modificadores ou botão do meio preservam o comportamento normal do navegador.

A consulta rápida mantém campus, categoria e processo na URL com `replaceState`, sem criar novas entradas no histórico. Isso permite restaurar a seleção ao retornar da consulta detalhada. Os três selects usam o mesmo componente de seta das outras telas.

A importação de Material Symbols permanece centralizada em `styles/components/icons.css`, sem a lista parcial `icon_names` que excluía os novos ícones de mapa, idioma e seta externa. Testes: `node tests/navigation.cjs` e `node tests/academics.cjs`.

## Comparação com critérios por opção

A comparação usa um curso comum e um formulário para adicionar referências individualmente: universidade, campus, turno, processo, edição, modalidade de concorrência e fase quando disponível. Não há busca textual nem um contexto global sobrescrevendo as opções. “Salvar opção na comparação” adiciona um resumo completo abaixo e limpa o formulário para a próxima opção. “Limpar campos” mantém a lista; “Limpar comparação” remove a lista. Mudar o curso limpa as opções, pois uma comparação não mistura cursos.

Cada opção é identificada pelo ID da referência de nota efetivamente selecionada. A mesma universidade pode aparecer várias vezes com campus ou critérios distintos, e a mesma referência não é duplicada. O contador informa opções e universidades distintas. As opções podem ser removidas individualmente. A URL usa `curso` e parâmetros `referencia` repetidos, preservando a seleção ao recarregar, voltar para editar e salvar em Salvos. Os links antigos com `opcao` ainda são interpretados quando possuem uma referência correspondente no catálogo.

A tela de resultado resolve cada referência sem aplicar processo/edição/modalidade/turno de outra opção. Cada card lista todos os critérios, nota ou faixa, curso e fonte. A comparação em cards aceita critérios distintos. Gráfico e diferença em pontos exigem notas numéricas com escala e critérios compatíveis; não se presume escala para os registros importados. Dados locais de demonstração são identificados nos próprios cards.

`src/data/comparisons.js` centraliza resolução/serialização. `comparison-details.js` monta o mesmo resumo no seletor e no resultado. Testes: `node tests/comparison.cjs`. Também foi verificado o fluxo numa prévia local com os dados importados. Nenhuma mudança de regra ou gravação no Firestore é necessária nesta etapa.

### Apresentação original do resultado

A tela de comparação mantém o layout original: gráfico de barras coloridas, indicadores e cards compactos com ícone e nota em destaque. A seleção nova continua guardando os critérios por opção, exibidos em cada card. O gráfico permanece visível, inclusive para opções com critérios diferentes: os valores não são normalizados entre processos. Quando a escala não está cadastrada, o eixo é apenas uma graduação visual dos valores exibidos, sem afirmar que é a escala oficial do exame. Faixas mantêm seus limites no rótulo e a barra chega ao limite superior; a diferença em pontos usa o maior menos o menor valor das referências selecionadas, incluindo os limites das faixas.

O indicador “Pontos entre extremos” é calculado a partir das notas selecionadas, independentemente dos critérios. Para faixas, entram os limites inferior e superior. O aviso adicional acima do gráfico foi removido; permanece a observação já existente ao final da tela.
