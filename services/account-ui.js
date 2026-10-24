export function accountErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'Este e-mail já tem uma conta. Entre ou recupere sua senha.',
    'auth/invalid-email': 'Confira o endereço de e-mail.',
    'auth/weak-password': 'Use uma senha mais forte, com pelo menos 6 caracteres.',
    'auth/password-does-not-meet-requirements': 'A senha não atende aos requisitos definidos para o aplicativo.',
    'auth/invalid-credential': 'Não foi possível entrar. Confira o e-mail e a senha.',
    'auth/wrong-password': 'Não foi possível entrar. Confira o e-mail e a senha.',
    'auth/user-not-found': 'Não foi possível entrar. Confira o e-mail e a senha.',
    'auth/network-request-failed': 'Não foi possível conectar. Confira sua internet e tente novamente.',
    'auth/too-many-requests': 'Houve muitas tentativas. Aguarde um pouco e tente novamente.',
    'auth/operation-not-allowed': 'O login por e-mail e senha ainda precisa ser habilitado no Firebase.',
    'auth/unauthorized-domain': 'Este endereço precisa ser autorizado nas configurações do Authentication.',
    'auth/firebase-not-configured': 'A conexão com o Firebase ainda não está configurada.',
    'permission-denied': 'O Firestore não permitiu salvar seu perfil. As regras de acesso precisam ser publicadas.',
    'unavailable': 'O banco está indisponível. Confira a conexão e tente novamente.',
    'profile/not-authenticated': 'Entre na sua conta para acessar seu perfil.',
    'profile/incomplete': 'Conclua o cadastro para salvar suas preferências.',
    'profile/invalid-name': 'Informe um nome com até 120 caracteres.',
    'signup/terms-required': 'Aceite os termos para criar sua conta.',
    'signup/session-conflict': 'Existe outra conta conectada. Saia dela antes de cadastrar outro e-mail.',
  };
  return messages[error?.code] || 'Não foi possível concluir. Confira a conexão e tente novamente.';
}

export function accountDestination(search, root, fallback) {
  const raw = new URLSearchParams(search).get('retorno');
  if (!raw) return new URL(fallback, root).href;
  try {
    const url = new URL(raw, root);
    if (url.origin === root.origin && url.pathname.startsWith(root.pathname) && !/\/(login|cadastro)\.html$/.test(url.pathname)) return url.href;
  } catch { /* Usa o perfil como destino quando a origem não é válida. */ }
  return new URL(fallback, root).href;
}
