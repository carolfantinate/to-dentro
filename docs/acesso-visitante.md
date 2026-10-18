# Acesso de visitantes

O protótipo abre no modo visitante. Login e cadastro são telas de apresentação;
não criam sessão nem enviam credenciais. O serviço `auth.js` centraliza o estado
de acesso e deverá consultar uma sessão validada pelo servidor quando a
autenticação for implementada. O controle atual organiza a interface; a futura
API também deverá verificar autorização e associar os dados à conta.

| Recurso | Sem login | Com login (quando implementado) |
| --- | --- | --- |
| Home | Saudação genérica e navegação | Pode receber personalização |
| Universidades, cursos, mapas, notas e comparações | Buscar e visualizar | Buscar, visualizar e salvar |
| Datas e calendário público | Explorar datas e filtrar universidades | Também adicionar datas e criar lembretes pessoais |
| Comunidade | Ler experiências, dúvidas e respostas | Também publicar e responder |
| Perfil e salvos | Convite para entrar ou criar conta | Consultar dados pessoais e escolhas |
| Teste vocacional e resultado | Convite para entrar ou criar conta | Fazer o teste e consultar/salvar o resultado |

Ao acionar um recurso restrito em uma página pública, um diálogo contextual
oferece Entrar, Criar conta e Continuar explorando. Ao abrir diretamente uma
página restrita, a tela apresenta o convite sem mostrar conteúdo pessoal.
Perfil e Salvos usam esse mesmo convite como estado inicial para visitantes.
Dados demonstrativos antigos no navegador não autenticam o visitante e não
aparecem como escolhas, resultados ou calendário pessoal dele.

Os links de conta preservam um destino interno em `retorno` para a futura
continuação após login. Nenhum redirecionamento ou login é simulado.
