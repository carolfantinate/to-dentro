// Orquestra Authentication e Firestore sem persistir senha nem duplicar contas em uma nova tentativa.
export function createRegistrationService({ getCurrentUser, createAccount, setDisplayName, saveProfile }) {
  let operation = null;
  async function register(input) {
    if (!input.termsAccepted) throw Object.assign(new Error('Aceite os termos para criar sua conta.'), { code: 'signup/terms-required' });
    const displayName = input.displayName.trim();
    const email = input.email.trim().toLowerCase();
    if (!displayName || displayName.length > 120) throw Object.assign(new Error('Informe seu nome.'), { code: 'profile/invalid-name' });
    let user = getCurrentUser();
    try {
      if (user && user.email?.toLowerCase() !== email) throw Object.assign(new Error('Existe outra conta conectada. Saia dela antes de cadastrar outro e-mail.'), { code: 'signup/session-conflict' });
      if (!user) user = (await createAccount(email, input.password)).user;
      await setDisplayName(displayName);
      await saveProfile({ displayName, preferences: input.preferences });
      return user;
    } catch (error) {
      error.accountCreated = Boolean(user && user.email?.toLowerCase() === email);
      throw error;
    }
  }
  return {
    register(input) {
      if (!operation) operation = register(input).finally(() => { operation = null; });
      return operation;
    }
  };
}
