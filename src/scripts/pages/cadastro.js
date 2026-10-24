(async () => {
  'use strict';
  if (window.ToDentroCoursesReady) await window.ToDentroCoursesReady;
  // Impede envio nativo com senha na URL enquanto a sessão e os módulos carregam.
  for (const form of document.querySelectorAll('#signup-access-form, #signup-create-form')) form.addEventListener('submit', event => event.preventDefault());
  await window.ToDentroAuth.ready;
  const appRoot = new URL('../../', location.href);
  const { accountErrorMessage, accountDestination } = await import(new URL('services/account-ui.js', appRoot).href);
  const panels = [...document.querySelectorAll('[data-signup-step]')];
  const progress = document.querySelector('.signup-progress');
  const status = document.querySelector('.account-notice');
  let editingReview = false;
  let currentStep = 1;
  const returnReview = document.querySelector('.signup-return-review');
  function showStep(step) {
    currentStep = step;
    if (step === 6) { renderReview(); editingReview = false; }
    returnReview.hidden = !editingReview || step === 6;
    for (const panel of panels) panel.hidden = Number(panel.dataset.signupStep) !== step;
    document.querySelector('.signup-step').textContent = `Etapa ${step} de 6`;
    progress.setAttribute('aria-valuenow', String(step));
    const descriptions = { 1: 'dados de acesso', 2: 'tipo de instituição', 3: 'cidades', 4: 'modalidades e turnos', 5: 'cursos de interesse', 6: 'revisão do cadastro' };
    progress.setAttribute('aria-valuetext', `Etapa ${step} de 6: ${descriptions[step]}`);
    [...progress.children].forEach((segment, index) => segment.classList.toggle('is-current', index < step));
    document.title = `Criar conta · Etapa ${step} de 6 | Tô Dentro`;
    status.hidden = true;
    panels.find(panel => !panel.hidden).querySelector('h1').focus();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  const accessForm = document.querySelector('#signup-access-form');
  const name = document.getElementById('signup-name');
  const password = document.getElementById('signup-password');
  const confirmation = document.getElementById('signup-confirm-password');
  name.addEventListener('input', () => name.setCustomValidity(''));
  for (const input of [password, confirmation]) {
    input.addEventListener('input', () => confirmation.setCustomValidity(''));
  }
  function validateAccess() {
    name.setCustomValidity(name.value.trim() ? '' : 'Preencha seu nome.');
    confirmation.setCustomValidity(confirmation.value && confirmation.value !== password.value ? 'As senhas precisam ser iguais.' : '');
    return accessForm.reportValidity();
  }
  accessForm.addEventListener('submit', event => {
    event.preventDefault();
    if (validateAccess()) showStep(editingReview ? 6 : 2);
  });
  for (const button of document.querySelectorAll('button[type="button"][data-signup-next]')) {
    button.addEventListener('click', () => showStep(Number(button.dataset.signupNext)));
  }
  for (const button of document.querySelectorAll('[data-signup-back]')) {
    button.addEventListener('click', () => showStep(Number(button.dataset.signupBack) || 1));
  }

  // As seleções ficam em memória até a confirmação final do cadastro.
  const cities = window.ToDentroData.source.general.cities;
  const selectedCities = new Set(['sao-paulo', 'campinas']);
  const citySearch = document.querySelector('#signup-city-search');
  const cityOptions = document.querySelector('#signup-city-options');
  const noCity = document.querySelector('.signup-no-city');
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  function renderCities() {
    cityOptions.replaceChildren();
    const query = normalize(citySearch.value);
    const matches = cities.filter(city => normalize(`${city.name} ${city.state} São Paulo`).includes(query));
    for (const city of matches) {
      const label = document.createElement('label'); label.className = 'signup-option signup-city-option'; label.dataset.cityColor = city.color;
      const input = document.createElement('input'); input.type = 'checkbox'; input.name = 'cities'; input.value = city.id; input.checked = selectedCities.has(city.id);
      const icon = document.createElement('span'); icon.className = 'signup-option-icon'; icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
      const copy = document.createElement('span'); copy.className = 'signup-option-copy';
      const title = document.createElement('strong'); title.textContent = city.name;
      const description = document.createElement('span');
      const updateDescription = () => {
        label.classList.toggle('is-selected', input.checked);
        description.textContent = `${city.state} · ${input.checked ? 'Cidade selecionada' : 'Outra possibilidade'}`;
      };
      updateDescription(); copy.append(title, description);
      const check = document.createElement('span'); check.className = 'signup-checkbox'; check.setAttribute('aria-hidden', 'true');
      input.addEventListener('change', () => {
        if (input.checked) { selectedCities.add(city.id); noCity.setAttribute('aria-pressed', 'false'); }
        else selectedCities.delete(city.id);
        updateDescription();
      });
      label.append(input, icon, copy, check); cityOptions.append(label);
    }
    document.querySelector('#signup-city-empty').hidden = matches.length > 0;
  }
  citySearch.addEventListener('input', renderCities);
  noCity.addEventListener('click', () => {
    const active = noCity.getAttribute('aria-pressed') !== 'true';
    if (active) clearCities();
    noCity.setAttribute('aria-pressed', String(active));
  });
  function clearCities() {
    selectedCities.clear(); noCity.setAttribute('aria-pressed', 'false'); renderCities();
  }
  const shifts = [...document.querySelectorAll('[name="study-shift"]')];
  for (const shift of shifts) {
    shift.addEventListener('change', () => {
      if (!shift.checked) return;
      for (const other of shifts) {
        if (other !== shift && (shift.value === 'sem-preferencia' || other.value === 'sem-preferencia')) other.checked = false;
      }
    });
  }
  function clearStudyPreferences() {
    for (const input of document.querySelectorAll('[name="study-mode"], [name="study-shift"]')) input.checked = false;
  }
  const catalog = window.ToDentroCourseCatalog;
  const selectedCourses = new Set();
  const courseSearch = document.querySelector('#signup-course-search');
  const courseOptions = document.querySelector('#signup-course-options');
  const courseAreas = document.querySelector('#signup-course-areas');
  const discoverCourses = document.querySelector('.signup-discover-courses');
  let selectedArea = '';
  const colors = ['blue', 'green', 'yellow'];
  for (const [value, text] of [['', 'Todas'], ...Object.entries(catalog.areas)]) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.dataset.area = value;
    button.setAttribute('aria-pressed', String(value === selectedArea));
    button.addEventListener('click', () => { selectedArea = value; courseOptions.scrollTop = 0; renderCourses(); });
    courseAreas.append(button);
  }
  function renderCourses() {
    const scrollTop = courseOptions.scrollTop;
    courseOptions.replaceChildren();
    const query = normalize(courseSearch.value);
    const matches = catalog.courses.filter(course => (!selectedArea || course.area === selectedArea) && normalize(`${course.name} ${catalog.areas[course.area]}`).includes(query));
    for (const course of matches) {
      const label = document.createElement('label'); label.className = 'signup-option signup-course-option';
      label.dataset.courseColor = colors[catalog.courses.indexOf(course) % colors.length];
      const input = document.createElement('input'); input.type = 'checkbox'; input.name = 'interest-courses'; input.value = course.id; input.checked = selectedCourses.has(course.id);
      const icon = document.createElement('span'); icon.className = 'signup-option-icon material-symbols-outlined'; icon.setAttribute('aria-hidden', 'true');
      icon.textContent = { saude: 'favorite', biologicas: 'eco', humanas: 'person', sociais: 'account_balance', exatas: 'code', artes: 'palette' }[course.area];
      const copy = document.createElement('span'); copy.className = 'signup-option-copy';
      const title = document.createElement('strong'); title.textContent = course.name;
      const description = document.createElement('span');
      const update = () => {
        label.classList.toggle('is-selected', input.checked);
        description.textContent = `${catalog.areas[course.area]} · ${input.checked ? 'Interesse selecionado' : 'Outra possibilidade para explorar'}`;
      };
      input.addEventListener('change', () => {
        if (input.checked) { selectedCourses.add(course.id); discoverCourses.setAttribute('aria-pressed', 'false'); }
        else selectedCourses.delete(course.id);
        update();
      });
      update(); copy.append(title, description);
      const check = document.createElement('span'); check.className = 'signup-checkbox'; check.setAttribute('aria-hidden', 'true');
      label.append(input, icon, copy, check); courseOptions.append(label);
    }
    for (const button of courseAreas.children) button.setAttribute('aria-pressed', String(button.dataset.area === selectedArea));
    document.querySelector('#signup-course-empty').hidden = matches.length > 0;
    courseOptions.scrollTop = scrollTop;
  }
  function clearCourses() { selectedCourses.clear(); discoverCourses.setAttribute('aria-pressed', 'false'); renderCourses(); }
  courseSearch.addEventListener('input', () => { courseOptions.scrollTop = 0; renderCourses(); });
  discoverCourses.addEventListener('click', () => {
    const active = discoverCourses.getAttribute('aria-pressed') !== 'true';
    if (active) clearCourses();
    discoverCourses.setAttribute('aria-pressed', String(active));
  });
  renderCourses();
  for (const button of document.querySelectorAll('[data-signup-skip]')) {
    button.addEventListener('click', () => {
      const step = Number(button.closest('[data-signup-step]').dataset.signupStep);
      if (step === 2) {
        for (const option of document.querySelectorAll('[name="institution-type"]')) option.checked = false;
        showStep(3);
      } else if (step === 3) {
        clearCities();
        showStep(4);
      } else if (step === 4) {
        clearStudyPreferences();
        showStep(5);
      } else {
        clearCourses();
        showStep(6);
      }
    });
  }
  for (const button of document.querySelectorAll('[data-signup-skip-all]')) {
    button.addEventListener('click', () => {
      for (const option of document.querySelectorAll('[name="institution-type"]')) option.checked = false;
      clearCities();
      clearStudyPreferences();
      clearCourses();
      showStep(6);
    });
  }
  renderCities();
  function renderReview() {
    const set = (id, text) => { document.getElementById(`signup-review-${id}`).textContent = text; };
    set('name', name.value.trim());
    set('email', document.getElementById('signup-email').value.trim());
    const institution = document.querySelector('[name="institution-type"]:checked');
    set('institution', { publica: 'Pública', privada: 'Privada', todas: 'Pública e privada' }[institution?.value] || 'Sem preferência');
    set('cities', cities.filter(city => selectedCities.has(city.id)).map(city => `${city.name} · ${city.state}`).join(', ') || 'Sem preferência de cidade');
    const modeLabels = { presencial: 'Presencial', ead: 'A distância', hibrida: 'Híbrida' };
    const shiftLabels = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite', integral: 'Integral', 'sem-preferencia': 'Sem preferência de turno' };
    const modes = [...document.querySelectorAll('[name="study-mode"]:checked')].map(input => modeLabels[input.value]);
    const selectedShifts = shifts.filter(input => input.checked).map(input => shiftLabels[input.value]);
    set('study', [modes.join(', ') || 'Sem preferência de modalidade', selectedShifts.join(', ') || 'Sem preferência de turno'].join(' · '));
    set('courses', catalog.courses.filter(course => selectedCourses.has(course.id)).map(course => course.name).join('\n') || 'Ainda estou descobrindo');
  }
  function clearPreferences() {
    for (const input of document.querySelectorAll('[name="institution-type"]')) input.checked = false;
    clearCities(); clearStudyPreferences(); clearCourses();
  }
  for (const button of document.querySelectorAll('[data-signup-edit]')) {
    button.addEventListener('click', () => { editingReview = true; showStep(Number(button.dataset.signupEdit)); });
  }
  returnReview.addEventListener('click', () => {
    if (currentStep !== 1 || validateAccess()) showStep(6);
  });
  document.querySelector('#signup-clear-preferences').addEventListener('click', () => { clearPreferences(); renderReview(); });
  let submitting = false;
  let registration;
  const createForm = document.querySelector('#signup-create-form');
  const createButton = createForm.querySelector('[type="submit"]');
  const email = document.getElementById('signup-email');
  function resumeAuthenticatedUser(user) {
    if (!user) return;
    email.value = user.email || '';
    email.readOnly = true;
    if (!name.value.trim()) name.value = user.displayName || '';
    for (const input of [password, confirmation]) {
      input.value = '';
      input.disabled = true;
      input.closest('.login-field').hidden = true;
    }
    createButton.textContent = 'Concluir cadastro';
  }
  createForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    if (!validateAccess()) { showStep(1); accessForm.reportValidity(); return; }
    if (!createForm.reportValidity()) return;
    submitting = true;
    const fields = [...document.querySelectorAll('.signup-page input, .signup-page button')].map(element => [element, element.disabled]);
    const institution = document.querySelector('[name="institution-type"]:checked')?.value;
    const modes = [...document.querySelectorAll('[name="study-mode"]:checked')].map(input => input.value);
    const periods = shifts.filter(input => input.checked).map(input => input.value);
    const input = { displayName: name.value.trim(), email: email.value.trim(), password: password.value,
      termsAccepted: document.querySelector('#signup-terms').checked };
    const previousLabel = createButton.textContent;
    fields.forEach(([element]) => { element.disabled = true; });
    createForm.setAttribute('aria-busy', 'true');
    createButton.textContent = 'Salvando seu cadastro…';
    status.textContent = 'Criando sua conta e salvando suas preferências…';
    status.hidden = false;
    try {
      const [authService, profileService, preferencesService, registrationService] = await Promise.all([
        import(new URL('services/auth.js', appRoot).href),
        import(new URL('services/profile.js', appRoot).href),
        import(new URL('services/preferences.js', appRoot).href),
        import(new URL('services/registration.js', appRoot).href),
      ]);
      input.preferences = preferencesService.signupPreferences({ institutionType: institution,
        cityIds: [...selectedCities], modeIds: modes, periodIds: periods,
        courseIds: [...selectedCourses], discoveringCourses: discoverCourses.getAttribute('aria-pressed') === 'true' });
      registration ||= registrationService.createRegistrationService({ getCurrentUser: authService.getCurrentUser,
        createAccount: authService.createAccount, setDisplayName: authService.setDisplayName,
        saveProfile: profileService.saveRegistrationProfile });
      await registration.register(input);
      password.value = ''; confirmation.value = '';
      status.textContent = 'Conta criada e preferências salvas! Abrindo seu perfil…';
      location.assign(accountDestination(location.search, appRoot, 'src/pages/perfil.html'));
    } catch (error) {
      status.textContent = error.accountCreated
        ? `Sua conta já foi criada, mas falta concluir o perfil. ${accountErrorMessage(error)} Suas escolhas continuam nesta tela; tente concluir novamente.`
        : accountErrorMessage(error);
      status.hidden = false;
      fields.forEach(([element, disabled]) => { element.disabled = disabled; });
      createButton.textContent = previousLabel;
      resumeAuthenticatedUser(window.ToDentroAuth.user);
    } finally {
      submitting = false;
      createForm.setAttribute('aria-busy', 'false');
      // A senha nunca é enviada ao Firestore nem persistida no navegador.
      input.password = '';
    }
  });
  if (window.ToDentroAuth.user) {
    resumeAuthenticatedUser(window.ToDentroAuth.user);
    try {
      const { getProfile } = await import(new URL('services/profile.js', appRoot).href);
      if (await getProfile()) location.replace(accountDestination(location.search, appRoot, 'src/pages/perfil.html'));
    } catch (error) {
      status.textContent = accountErrorMessage(error);
      status.hidden = false;
    }
  }
  for (const button of document.querySelectorAll('[data-toggle-password]')) {
    const input = document.getElementById(button.getAttribute('aria-controls'));
    const description = input.id === 'signup-password' ? 'senha' : 'confirmação de senha';
    button.addEventListener('click', () => {
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(visible));
      button.setAttribute('aria-label', `${visible ? 'Ocultar' : 'Mostrar'} ${description}`);
    });
  }
})();
