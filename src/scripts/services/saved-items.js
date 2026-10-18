(() => {
  'use strict';
  const key = 'to-dentro-saved-universities';
  // Seleção inicial demonstrativa do protótipo.
  let memory = [];
  function getUniversities() {
    if (!window.ToDentroAuth.isAuthenticated()) return [];
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) memory = parsed.filter(id => window.ToDentroUniversities.some(item => item.id === id));
      }
    } catch { /* Usar a seleção em memória quando o armazenamento não estiver disponível. */ }
    return [...new Set(memory)];
  }
  function toggleUniversity(id) {
    if (!window.ToDentroAuth.requireLogin('Entre para salvar universidades.')) return null;
    if (!window.ToDentroUniversities.some(item => item.id === id)) return null;
    const ids = getUniversities();
    const saved = !ids.includes(id);
    memory = saved ? [...ids, id] : ids.filter(item => item !== id);
    let persisted = true;
    try { localStorage.setItem(key, JSON.stringify(memory)); } catch { persisted = false; }
    return { saved, persisted };
  }
  window.ToDentroSaved = { getUniversities, toggleUniversity };
})();
