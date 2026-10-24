(async () => {
  'use strict';
  if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady;
  if (window.ToDentroCampusesReady) await window.ToDentroCampusesReady;
  const params = new URLSearchParams(location.search);
  const query = document.querySelector('#map-query');
  const list = document.querySelector('#map-universities');
  const status = document.querySelector('#map-status');
  const campuses = window.ToDentroCampuses.map(campus => ({
    ...window.ToDentroUniversities.find(university => university.id === campus.universityId),
    ...campus,
  }));
  const selected = campuses.find(item => params.get('campus') ? item.id === params.get('campus') : item.universityId === params.get('universidade'));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const selections = name => params.getAll(name).flatMap(value => value.split(',')).filter(Boolean);
  const cities = params.has('city') ? selections('city') : params.get('region') ? [params.get('region') === 'sp' ? 'sao-paulo' : params.get('region')] : [];
  const types = selections('type');
  const admissions = selections('admission');
  const modes = selections('mode');
  const courses = selections('course');
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
    const visible = campuses.filter(item => normalize(item.city).includes(normalize(query.value))
      && (!cities.length || cities.includes(normalize(item.city).replace(/\s+/g, '-')))
      && (!types.length || types.includes(item.public ? 'publica' : 'particular'))
      && (!modes.length || modes.includes(item.mode))
      && (!params.get('area') || window.ToDentroCourseCatalog.courses.some(course => course.area === params.get('area') && item.courses.some(name => normalize(name) === course.value)))
      && (!courses.length || item.courses.some(course => courses.includes(normalize(course))))
      && (!admissions.length || admissions.some(method => (item.admissionMethods || []).includes(method))));
    const located = visible.filter(campus => Array.isArray(campus.coordinates) && campus.coordinates.length === 2 && campus.coordinates.every(Number.isFinite));
    const missing = visible.length - located.length;
    document.querySelector('#map-location-note').textContent = missing
      ? `Localizações aproximadas. ${missing} ${missing === 1 ? 'campus está sem coordenadas e aparece apenas na lista' : 'campi estão sem coordenadas e aparecem apenas na lista'}.`
      : 'Localizações aproximadas dos campi e unidades.';
    list.replaceChildren();
    if (markers) markers.clearLayers();
    for (const campus of visible) {
      const card = document.createElement('a'); card.className = 'map-campus-card';
      const destination = new URL('./universidade.html', location.href);
      destination.searchParams.set('id', campus.universityId);
      destination.searchParams.set('campus', campus.id);
      const origin = new URLSearchParams(params); origin.set('cidade', query.value);
      destination.searchParams.set('from', `${location.pathname}?${origin}`);
      card.href = destination.href;
      card.setAttribute('aria-label', `Ver universidade: ${campus.acronym} · ${campus.name}`);
      const heading = document.createElement('h3'); heading.textContent = `${campus.acronym} · ${campus.name}`;
      const description = document.createElement('p'); description.textContent = `${campus.city} · ${campus.public ? 'Pública' : 'Privada'}${campus.coordinates ? '' : ' · Localização a confirmar'}`;
      const action = document.createElement('span'); action.className = 'button button-yellow'; action.textContent = 'Ver universidade';
      card.append(heading, description, action); list.append(card);
      if (map && located.includes(campus)) {
        const popup = document.createElement('div');
        const title = document.createElement('strong'); title.textContent = `${campus.acronym} · ${campus.name}`;
        const note = document.createElement('p'); note.textContent = `${campus.city} · Localização aproximada`;
        const link = document.createElement('a'); link.href = card.href; link.textContent = 'Ver universidade';
        popup.append(title, note, link);
        L.marker(campus.coordinates).bindTooltip(`${campus.acronym} · ${campus.name}`, { permanent: true, direction: 'top' }).bindPopup(popup).addTo(markers);
      }
    }
    document.querySelector('#map-empty').hidden = visible.length > 0;
    if (map && located.length) {
      if (selected && located.includes(selected) && !query.value && !params.has('return')) map.setView(selected.coordinates, 15);
      else map.fitBounds(located.map(item => item.coordinates), { padding: [32, 32], maxZoom: 13 });
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
