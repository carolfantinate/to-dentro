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
