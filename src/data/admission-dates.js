(() => {
  'use strict';
  window.ToDentroAdmissionDates = [{
    universityId: 'usp', process: 'fuvest', edition: 2027, name: 'Fuvest',
    notice: 'Edição para ingresso em 2027. Horários de Brasília.',
    source: 'https://www.fuvest.br/vestibular-da-usp/',
    references: [
      'https://saocarlos.usp.br/fuvest-divulga-guia-de-inclusao-com-acoes-afirmativas-para-o-vestibular-2026/',
      'https://www.fuvest.br/wp-content/uploads/fuvest2026_guia-jornada.pdf',
      'https://jornal.usp.br/radio-usp/fuvest-antecipa-divulgacao-dos-locais-de-prova-do-vestibular-2026/',
      'https://saocarlos.usp.br/fuvest-divulga-lista-de-convocados-para-a-2a-fase-do-vestibular-e-locais-de-provas/',
    ],
    events: [
      {
        id: 'isencao',
        title: 'Solicitação de isenção',
        start: '2026-05-11',
        end: '2026-07-10',
        time: '12:00',
        endTime: '12:00'
      },

      {
        id: 'inscricao',
        title: 'Inscrição',
        start: '2026-08-17',
        end: '2026-10-09',
        time: '12:00',
        endTime: '12:00'
      },

      {
        id: 'fase-1',
        title: 'Prova · 1ª fase',
        start: '2026-11-01',
        time: '13:00'
      },

      {
        id: 'fase-2-dia-1',
        title: 'Prova · 2ª fase · dia 1',
        start: '2026-12-06',
        time: '13:00'
      },

      {
        id: 'fase-2-dia-2',
        title: 'Prova · 2ª fase · dia 2',
        start: '2026-12-07',
        time: '13:00'
      },

      {
        id: 'primeira-chamada',
        title: 'Divulgação da 1ª chamada',
        start: '2027-01-26',
      },

    ],
  }];
})();
