(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const query = document.querySelector('#map-query');
  const list = document.querySelector('#map-universities');
  const status = document.querySelector('#map-status');
  const universities = window.ToDentroUniversities;
  const selected = universities.find(item => item.id === params.get('universidade'));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const from = params.get('from');
  if (from) {
    const url = new URL(from, location.href);
    const allowed = ['../../index.html', './universidade.html', './buscar-universidades.html', './comunidade.html', './filtros.html'].map(path => new URL(path, location.href));
    if (allowed.some(item => item.protocol === url.protocol && item.host === url.host && item.pathname === url.pathname)) document.querySelector('#map-back').href = url.href;
  }
  const filterState = new URLSearchParams(params);
  filterState.set('return', 'mapa');
  document.querySelector('#map-filter').href = `./filtros.html?${filterState}`;
  query.value = params.get('cidade') || '';
  let map, markers, userPosition;
  if (window.L) {
    map = L.map('university-map', { scrollWheelZoom: false }).setView([-23.55, -46.65], 10);
    markers = L.layerGroup().addTo(map);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    tiles.on('load', () => { status.textContent = ''; });
    tiles.on('tileerror', () => { status.textContent = 'Não foi possível carregar parte do mapa. A lista de universidades continua disponível.'; });
  } else status.textContent = 'O mapa não carregou. Confira sua conexão; as instituições estão disponíveis abaixo.';

  function render() {
    filterState.set('cidade', query.value);
    document.querySelector('#map-filter').href = `./filtros.html?${filterState}`;
    const visible = universities.filter(item => normalize(item.city).includes(normalize(query.value))
      && (params.get('region') !== 'campinas' || item.city === 'Campinas')
      && (params.get('type') !== 'publica' || item.public)
      && (params.get('type') !== 'particular' || !item.public)
      && (!params.get('mode') || item.mode === params.get('mode'))
      && (!params.get('course') || item.courses.some(course => normalize(course) === params.get('course')))
      && (!params.get('period') || item.periods.includes(params.get('period')))
      && (params.get('cost') !== 'mensalidade' || !item.free));
    list.replaceChildren();
    if (markers) markers.clearLayers();
    for (const university of visible) {
      const card = document.createElement('td-university-card'); card.setAttribute('university-id', university.id); list.append(card);
      if (map) {
        const popup = document.createElement('div');
        const title = document.createElement('strong'); title.textContent = university.name;
        const note = document.createElement('p'); note.textContent = university.mapLabel;
        const link = document.createElement('a'); link.href = card.querySelector('a').href; link.textContent = 'Conhecer universidade';
        popup.append(title, note, link);
        L.marker(university.coordinates).bindTooltip(university.acronym, { permanent: true, direction: 'top' }).bindPopup(popup).addTo(markers);
      }
    }
    document.querySelector('#map-empty').hidden = visible.length > 0;
    if (map && visible.length) {
      if (selected && visible.includes(selected) && !query.value && !params.has('return')) map.setView(selected.coordinates, 15);
      else map.fitBounds(visible.map(item => item.coordinates), { padding: [32, 32], maxZoom: 13 });
    }
  }
  query.addEventListener('input', render);
  document.querySelector('#map-search').addEventListener('submit', event => { event.preventDefault(); render(); });
  document.querySelector('#near-me').addEventListener('click', () => {
    if (!map) { status.textContent = 'O mapa precisa estar carregado para usar sua localização.'; return; }
    if (!navigator.geolocation) { status.textContent = 'Seu navegador não oferece localização.'; return; }
    status.textContent = 'Aguardando sua localização…';
    navigator.geolocation.getCurrentPosition(position => {
      const point = [position.coords.latitude, position.coords.longitude];
      if (userPosition) map.removeLayer(userPosition);
      userPosition = L.circleMarker(point, { radius: 8 }).bindPopup('Você está aqui').addTo(map);
      map.setView(point, 12);
      status.textContent = 'Mapa centralizado na sua localização.';
    }, () => { status.textContent = 'Localização indisponível ou não autorizada. Você pode buscar pela cidade.'; }, { timeout: 10000, maximumAge: 60000 });
  });
  render();
})();
