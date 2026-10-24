// Campi e coordenadas do banco; cursos associados ainda são demonstrativos.
window.ToDentroCampuses = window.ToDentroData.views.campuses;
if (typeof document !== 'undefined' && document.currentScript) {
  const campusRoot = new URL('../../', document.currentScript.src);
  window.ToDentroCampusesReady = (async () => {
    try {
      if (window.ToDentroUniversitiesReady && !await window.ToDentroUniversitiesReady) throw new Error('Não foi possível carregar as universidades.');
      const service = await import(new URL('services/campuses.js', campusRoot).href);
      window.ToDentroCampuses = await service.getCampuses(window.ToDentroUniversities, window.ToDentroCampuses);
      return true;
    } catch (error) {
      window.ToDentroCampusesError = error;
      const main = document.querySelector('main');
      if (main) {
        const notice = document.createElement('p'); notice.id = 'campus-load-status'; notice.setAttribute('role', 'alert');
        notice.textContent = 'Não foi possível carregar os campi do banco. O mapa está exibindo localizações locais de demonstração. Confira a conexão e as regras do Firestore e recarregue para tentar novamente.';
        main.prepend(notice);
      }
      return false;
    }
  })();
}
