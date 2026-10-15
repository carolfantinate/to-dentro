(() => {
  const root = new URL('../../../', document.currentScript.src);
  const params = new URLSearchParams(location.search);
  for (const link of document.querySelectorAll('[data-map-link]')) {
    const destination = new URL('src/pages/mapa.html', root);
    const id = params.get('id') || params.get('universidade');
    if (id) destination.searchParams.set('universidade', id);
    if (params.get('campus')) destination.searchParams.set('campus', params.get('campus'));
    destination.searchParams.set('from', location.pathname + location.search);
    link.href = destination.href;
  }
})();
