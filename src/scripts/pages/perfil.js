(async () => {
  'use strict';
  if (window.ToDentroCoursesReady) await window.ToDentroCoursesReady;
  if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady;
  await window.ToDentroAuth.ready;
  if (window.ToDentroAuth.isRestrictedPage()) return;
  const root = new URL('../../', location.href);
  const status = document.querySelector('#profile-status');
  const retry = document.querySelector('#profile-retry');
  const edit = document.querySelector('#edit-preferences');
  const logoutButton = document.querySelector('#profile-logout');
  const [profiles, preferencesService, authService, ui] = await Promise.all([
    import(new URL('services/profile.js', root).href), import(new URL('services/preferences.js', root).href),
    import(new URL('services/auth.js', root).href), import(new URL('services/account-ui.js', root).href),
  ]);
  const data = window.ToDentroData;
  document.querySelector('#profile-name').textContent = window.ToDentroAuth.user.displayName || 'Meu perfil';
  document.querySelector('#profile-email').textContent = window.ToDentroAuth.user.email || '';
  const count = key => {
    try { const value = JSON.parse(localStorage.getItem(window.ToDentroAuth.storageKey(key)) || '[]'); return Array.isArray(value) ? value.length : 0; } catch { return 0; }
  };
  document.querySelector('a[href="./salvos.html?from=perfil"] .profile-count').textContent = window.ToDentroSaved.getUniversities().length;
  document.querySelector('a[href="./salvos.html?categoria=cursos&from=perfil"] .profile-count').textContent = count('to-dentro-saved-courses');
  document.querySelector('a[href="./calendario.html?from=./perfil.html"] .profile-count').textContent = count('to-dentro-calendar-dates') + count('to-dentro-reminders');
  const labels = preferencesService.preferenceOptions;
  function render(profile) {
    const preferences = preferencesService.normalizePreferences(profile.preferences);
    const text = (id, values, fallback) => { document.querySelector(`#profile-${id}`).textContent = values.length ? values.join(', ') : fallback; };
    document.querySelector('#profile-name').textContent = profile.displayName;
    document.querySelector('#profile-email').textContent = profile.email;
    text('city', preferences.cityIds.map(id => data.source.general.cities.find(item => item.id === id)?.name || id), 'Sem preferência de cidade');
    text('type', preferences.institutionTypes.map(id => labels.institutionTypes[id]), 'Sem preferência de instituição');
    text('mode', preferences.modeIds.map(id => labels.modeIds[id]), 'Sem preferência de modalidade');
    text('period', preferences.periodIds.map(id => labels.periodIds[id]), 'Sem preferência de turno');
    text('admission', preferences.admissionMethodIds.map(id => labels.admissionMethodIds[id]), 'Todas');
    text('area', preferences.areaIds.map(id => data.views.courseCatalog.areas[id] || id), 'Todas as áreas');
    text('course', preferences.courseIds.map(id => data.getCourse(id)?.name || id), preferences.discoveringCourses ? 'Ainda estou descobrindo' : 'Sem preferência de curso');
    edit.href = `./filtros.html?${preferencesService.preferencesToFilters(preferences, data)}`;
    edit.hidden = false;
  }
  async function loadProfile() {
    retry.hidden = true;
    edit.hidden = true;
    status.textContent = 'Carregando suas preferências…';
    status.hidden = false;
    try {
      const profile = await profiles.getProfile();
      if (!profile) {
        status.textContent = 'Sua conta está conectada. Conclua o cadastro para salvar seu perfil. ';
        const link = document.createElement('a'); link.href = './cadastro.html'; link.textContent = 'Concluir cadastro';
        status.append(link);
        return;
      }
      const params = new URLSearchParams(location.search);
      if (params.get('return') === 'perfil') {
        const next = preferencesService.preferencesFromFilters(params, profile.preferences, data);
        try {
          profile.preferences = await profiles.updatePreferences(next);
          history.replaceState(null, '', location.pathname);
          status.textContent = 'Preferências atualizadas!';
        } catch (error) {
          render(profile);
          throw error;
        }
      } else status.hidden = true;
      render(profile);
    } catch (error) {
      status.textContent = ui.accountErrorMessage(error);
      status.hidden = false;
      retry.hidden = false;
    }
  }
  retry.addEventListener('click', loadProfile);
  logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;
    try { await authService.logout(); location.replace(new URL('index.html', root).href); }
    catch (error) { status.textContent = ui.accountErrorMessage(error); status.hidden = false; logoutButton.disabled = false; }
  });
  await loadProfile();
})();
