(() => {
  'use strict';
  // Relatos e números ilustrativos para o protótipo, sem usuários reais.
  window.ToDentroCommunity = [
    {
      id: 'ana-pesquisa',
      author: 'Ana',
      initials: 'AN',
      universityId: 'usp',
      category: 'duvidas',

      title: 'Como começo uma iniciação científica?',
      text: 'Como encontrar projetos de pesquisa e conversar com possíveis orientadores?',

      topic: 'pesquisa',
      course: '',
      publishedAt: '2026-10-14',
      replies: [
        {
          author: 'Mariana',
          text: 'Eu comecei conversando com professores do meu curso sobre os projetos deles.'
        },

        {
          author: 'Lucas',
          text: 'Vale consultar as chamadas e os contatos da área de pesquisa da sua unidade.'
        },

      ]
    },

    {
      id: 'ana-ingresso',
      author: 'Ana',
      initials: 'AN',
      universityId: null,
      category: 'duvidas',

      title: 'Sisu e ENEM-USP são a mesma coisa?',
      text: 'Onde posso consultar as diferenças e as regras de cada seleção?',

      topic: 'ingresso',
      course: '',
      publishedAt: '2026-10-13',
      replies: []
    },

    {
      id: 'mariana-usp',
      author: 'Mariana Costa',
      initials: 'MC',
      universityId: 'usp',
      category: 'experiencias',

      course: 'Medicina',
      role: 'Estudante',
      since: 2024,
      publishedAt: '2026-10-10',

      title: 'Minha experiência na USP',

      text: 'Escolher meu curso ficou mais fácil quando conversei com quem já estudava lá. Pesquise os projetos e conheça o campus!',

      likes: 24,
      comments: 8,

    },

    {
      id: 'lucas-vestibular',
      author: 'Lucas Ferreira',
      initials: 'LF',
      universityId: null,
      category: 'experiencias',

      course: '',
      role: 'Vestibulando',
      since: 2025,
      publishedAt: '2026-10-12',

      title: 'Como organizei meu vestibular',

      text: 'Separei os prazos e reservei tempo para descansar. Ter tudo em um calendário me ajudou muito.',

      likes: 24,
      comments: 8,

    },
  ];
})();
