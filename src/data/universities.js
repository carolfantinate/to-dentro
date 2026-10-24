// Dados gerais no Firestore; os detalhes acadêmicos ainda vêm dos mocks por ID.
window.ToDentroUniversities = window.ToDentroData.views.universities;
if (typeof document !== 'undefined' && document.currentScript) {
  const universityRoot = new URL('../../', document.currentScript.src);
  window.ToDentroUniversitiesReady = (async () => {
    try {
      const service = await import(new URL('services/universities.js', universityRoot).href);
      const records = await service.getUniversities(window.ToDentroUniversities);
      window.ToDentroData.applyUniversities(records);
      window.ToDentroUniversities = window.ToDentroData.views.universities;
      return true;
    } catch (error) {
      window.ToDentroUniversitiesError = error;
      const main = document.querySelector('main');
      if (main) {
        const message = document.createElement('p'); message.setAttribute('role', 'alert');
        message.textContent = 'Não foi possível carregar as universidades do banco. Exibindo os dados locais de demonstração. Recarregue para tentar novamente.';
        main.prepend(message);
      }
      return false;
    }
  })();
}
