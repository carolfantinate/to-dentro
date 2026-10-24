// Projeção compartilhada pelas telas de datas e calendário. Não cria horários.
export function buildAdmissionCatalog(records, universities = []) {
  const calendar = [], estimates = [];
  const selections = records.map(({ definition, edition, events }) => {
    const choiceId = definition.programId || definition.id;
    const allDates = events.flatMap(event => event.dateSpec.dates || []);
    const anchor = allDates.find(date => date.iso && date.month > 2) || allDates.find(date => date.iso);
    const registration = edition.schedule.registrationStart;
    const estimateYear = registration?.approximation?.year;
    const resolveYear = month => anchor ? anchor.year + (anchor.month > 6 && month < 3 ? 1 : anchor.month < 3 && month > 6 ? -1 : 0) : estimateYear || null;
    const selection = { ...edition, name: definition.name, choiceId, events: [] };
    for (const event of events) {
      const projected = { ...event, entries: [] };
      const reminderCategory = {registrationStart: 'inscricao', registrationEnd: 'inscricao', exams: 'prova', results: 'resultado'}[event.type] || 'pessoal';
      const base = { universityId: definition.universityId, programId: definition.programId, process: definition.id, processName: definition.name, choiceId, edition: edition.edition, official: true, dataSource: 'firestore', reminderCategory, time: null, source: edition.officialSource };
      const blocked = event.type === 'exams' && edition.reviewIssueCodes?.includes('exam-phase-order');
      projected.needsReview = blocked;
      if (!blocked && !event.dateSpec.isEstimated) for (const [index, date] of (event.dateSpec.dates || []).entries()) {
        const year = date.year || resolveYear(date.month);
        if (!year) continue;
        const iso = date.iso || `${year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
        if (new Date(`${iso}T12:00:00Z`).toISOString().slice(0, 10) !== iso) continue;
        const entry = { ...base, id: `${edition.id}-${event.id}-${index}`, sourceEventId: event.id, title: event.title, date: iso, yearInferred: !date.year };
        projected.entries.push(entry); calendar.push(entry);
      }
      const approximate = event.dateSpec.approximation;
      if (approximate) {
        const year = approximate.year || resolveYear(approximate.month);
        estimates.push({ ...base, id: `${edition.id}-${event.id}`, title: event.title, description: event.dateSpec.text, month: approximate.month, year });
      }
      selection.events.push(projected);
    }
    return selection;
  });
  const choices = [...new Map(records.map(({definition}) => [definition.programId || definition.id, { id: definition.programId || definition.id, universityId: definition.universityId, programId: definition.programId, name: definition.name, relatedProgramIds: definition.relatedProgramIds || [] }])).values()];
  const globals = choices.filter(choice => choice.programId);
  function choicesForUniversity(id) {
    if (!id) return globals;
    const own = choices.filter(choice => choice.universityId === id);
    const related = new Set(own.flatMap(choice => choice.relatedProgramIds));
    const methods = (universities.find(item => item.id === id)?.admission || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (methods.includes('enem')) related.add('enem');
    if (methods.includes('provao')) related.add('provao-paulista');
    if (methods.includes('sisu')) related.add('sisu');
    const result = [...own.filter(choice => !choice.id.endsWith('-sisu')), ...globals.filter(choice => related.has(choice.id))];
    const priority = choice => choice.universityId && selections.some(item => item.choiceId === choice.id && item.events.length) ? 0 : choice.id === 'sisu' ? 1 : choice.programId ? 2 : 3;
    return result.sort((a,b) => priority(a) - priority(b));
  }
  return { selections, calendar, estimates, choices, choicesForUniversity };
}
