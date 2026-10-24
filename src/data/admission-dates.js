// Datas do Firestore no navegador; adaptador local para os testes do catálogo.
window.ToDentroAdmissionDates = window.ToDentroData.views.admissionDates;
if (typeof document !== 'undefined' && document.currentScript) {
  const root = new URL('../../', document.currentScript.src);
  window.ToDentroAdmissionDates = []; window.ToDentroCalendar = []; window.ToDentroDateEstimates = [];
  window.ToDentroAdmissionsReady = (async () => {
    try {
      await window.ToDentroUniversitiesReady;
      const service = await import(new URL('services/admissions.js', root).href);
      const catalog = await service.getAdmissions(window.ToDentroUniversities);
      window.ToDentroAdmissionCatalog = catalog;
      window.ToDentroAdmissionDates = catalog.selections;
      window.ToDentroCalendar = catalog.calendar;
      window.ToDentroDateEstimates = catalog.estimates;
      return true;
    } catch (error) {
      window.ToDentroAdmissionsError = error;
      const message = document.createElement('p'); message.setAttribute('role', 'alert');
      message.textContent = error.code === 'permission-denied'
        ? 'O Firebase bloqueou a leitura das datas. Publique as regras atualizadas de firestore.rules no console do Firebase e recarregue esta página.'
        : 'Não foi possível carregar as datas do banco. Confira sua conexão e recarregue a página para tentar novamente.';
      document.querySelector('main')?.prepend(message);
      return false;
    }
  })();
}
