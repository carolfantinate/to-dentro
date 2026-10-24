# Configuração do Firebase

## Aplicativo Web

A configuração pública fica em `config/firebase.js`. O arquivo inicializa Authentication e Firestore e é compartilhado pelos módulos de `services/`. Use somente o objeto `firebaseConfig` do aplicativo Web; nunca inclua uma chave administrativa no código do site.

No console do Firebase:

1. Ative o provedor **E-mail/Senha** em Authentication.
2. Confira os domínios autorizados para o endereço publicado e o ambiente local.
3. Crie o banco Cloud Firestore.
4. Copie todo o conteúdo de `firestore.rules` para **Firestore Database → Regras** e clique em **Publicar**.

Alterar o arquivo local não publica as regras automaticamente. Execute o site por um servidor HTTP local ou HTTPS.

## Perfil e preferências

`users/{uid}` armazena nome, e-mail, preferências, versão do perfil e timestamps. Somente o usuário autenticado correspondente pode ler e atualizar seu perfil. A senha é gerenciada pelo Authentication.

As preferências usam IDs para tipos de instituição, cidades, modalidades, turnos, cursos, áreas e formas de ingresso. Cadastro, perfil e busca compartilham essas informações. Em caso de falha ao salvar, a interface informa o erro.

## Catálogo público

As regras permitem leitura pública e bloqueiam escrita pelo cliente nos caminhos do catálogo:

```text
universities/{universityId}
  campuses/{campusId}
    courses/{offeringId}
      cutoffScores/{scoreId}
  courses/{courseId}
  admissionProcesses/{processId}
  admissionEditions/{editionId}
    events/{eventId}

admissionPrograms/{programId}
  editions/{editionId}
    events/{eventId}
```

O site consulta essas coleções por `services/universities.js`, `campuses.js`, `academics.js` e `admissions.js`. Os IDs ligam universidades, campi, ofertas, notas e processos. Datas aproximadas permanecem identificadas como previsões, sem dia ou horário inventado.

As planilhas e ferramentas administrativas não são necessárias para executar o site. Removê-las do repositório não apaga os dados já gravados no Firebase.

## Armazenamento local

Salvos, lembretes e outras interações que ainda usam armazenamento local ficam separados por UID neste navegador. Eles não representam sincronização entre dispositivos. Não há integração com Firebase Storage nem sincronização com calendários externos nesta etapa.

## Falhas de acesso

Se o catálogo ou as datas retornarem **permissão negada**, confira se o conteúdo atual de `firestore.rules` foi publicado no projeto correto. Em erros de autenticação, confira o provedor e os domínios autorizados.
