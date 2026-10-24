import { getProfile, updatePreferences } from './profile.js';
import { preferencesToFilters, preferencesFromFilters } from './preferences.js';

// O perfil é a fonte das seleções compartilhadas, sem persistência paralela no navegador.
export async function loadSearchPreferences(params, catalog) {
  const profile = await getProfile();
  if (!profile) throw Object.assign(new Error('Conclua seu cadastro para usar suas preferências.'), {code: 'profile/incomplete'});
  const state = new URLSearchParams(params);
  const saved = preferencesToFilters(profile.preferences, catalog);
  for (const name of ['city', 'type', 'mode', 'admission', 'course', 'area']) {
    state.delete(name);
    for (const value of saved.getAll(name)) state.append(name, value);
  }
  state.delete('region');
  return { params: state, preferences: profile.preferences };
}

export async function saveSearchPreferences(params, catalog) {
  const profile = await getProfile();
  if (!profile) throw Object.assign(new Error('Conclua seu cadastro para editar suas preferências.'), {code: 'profile/incomplete'});
  return updatePreferences(preferencesFromFilters(params, profile.preferences, catalog));
}
