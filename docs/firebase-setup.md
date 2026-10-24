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

O perfil só confirma a gravação depois da resposta do Firestore. Salvos, calendário, testes e publicações continuam usando armazenamento local separado por UID; ainda não são sincronizados no banco. Os dados acadêmicos continuam mockados.

## Verificação

Execute `node tests/registration.cjs`, `node tests/access.cjs` e `node tests/data.cjs`. São verificações locais; não criam usuários reais nem substituem um teste integrado após publicar as regras. As regras não foram executadas no emulador neste ambiente.

## Preferências compartilhadas com a busca

O cadastro, o perfil e a busca de universidades usam `users/{uid}.preferences`. Ao entrar na busca ou no editor de filtros com uma sessão ativa, as escolhas são carregadas do perfil, incluindo várias cidades e cursos. Parâmetros antigos da URL não substituem as preferências salvas.

Aplicar filtros ou alterar os atalhos de cidade/tipo na busca atualiza o mesmo documento. Limpar e aplicar também persiste a ausência de preferência. Os turnos, não exibidos nesse editor, são preservados. Formas de ingresso começam sem restrição no cadastro e podem ser escolhidas nos filtros. Texto pesquisado e ordenação continuam locais à navegação.

Em falha de leitura ou gravação, a tela informa o erro e não confirma a alteração. Visitantes continuam usando filtros pela URL, sem gravar um perfil. Verificação: `node tests/search-preferences.cjs`.
