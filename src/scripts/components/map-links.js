(() => {
  const root = new URL('../../../', document.currentScript.src);
  const params = new URLSearchParams(location.search);
  for (const link of document.querySelectorAll('[data-map-link]')) {
    const destination = new URL('src/pages/mapa.html', root);
    const id = params.get('id') || params.get('universidade');
    if (id) destination.searchParams.set('universidade', id);
    // O botão da instituição mostra todos os seus campi, mesmo vindo de um ponto do mapa.
    if (params.get('campus') && !link.hasAttribute('data-map-university')) destination.searchParams.set('campus', params.get('campus'));
    destination.searchParams.set('from', location.pathname + location.search);
    link.href = destination.href;
  }
})();
