(() => {
  'use strict';
  // Dados demonstrativos compartilhados. Substituir esta fonte por uma API no futuro.
  const description = 'Ensino, pesquisa e extensão para transformar o seu futuro. Explore cursos, campi e possibilidades de ingresso.';
  window.ToDentroUniversities = [
    {
      id: 'usp',
      coordinates: [-23.559, -46.73],
      mapLabel: 'Cidade Universitária • localização aproximada',
      acronym: 'USP',
      name: 'Universidade de São Paulo',
      city: 'São Paulo',
      state: 'SP',
      public: true,
      free: true,
      mode: 'presencial',
      periods: ['integral'],
      courses: [
        'Medicina',
        'Direito',
        'Engenharia'
      ],
      description,
      admission: 'Fuvest · ENEM-USP · Provão Paulista'
    },

    {
      id: 'unesp',
      coordinates: [-23.5376, -46.6487],
      mapLabel: 'Reitoria • localização aproximada',
      acronym: 'UNESP',
      name: 'Universidade Estadual Paulista',
      city: 'São Paulo',
      state: 'SP',
      public: true,
      free: true,
      mode: 'presencial',
      periods: ['integral'],
      courses: [
        'Medicina',
        'Direito',
        'Engenharia'
      ],
      description,
      admission: 'Vestibular • ENEM • Processos próprios'
    },

    {
      id: 'unicamp',
      coordinates: [-22.818,
      -47.0647],
      mapLabel: 'Campus Barão Geraldo • localização aproximada',
      acronym: 'UNICAMP',
      name: 'Universidade de Campinas',
      city: 'Campinas',
      state: 'SP',
      public: true,
      free: true,
      mode: 'presencial',
      periods: ['integral'],
      courses: [
        'Medicina',
        'Engenharia',
        'Arquitetura'
      ],
      description,
      admission: 'Vestibular • ENEM • Processos próprios'
    },

  ];
  // Métodos do catálogo demonstrativo, coerentes com a descrição de ingresso acima.
  for (const university of window.ToDentroUniversities) university.admissionMethods = ['enem', 'vestibular'];
  window.ToDentroUniversities.find(item => item.id === 'usp').photos = [{
    src: 'https://sites.usp.br/wp-content/uploads/2025/05/Praca-Relogio_84-20_fOTO-Cecilia-Bastos_USP-Imagem-04.jpg',
    alt: 'Praça do Relógio, na Cidade Universitária da USP',
    credit: 'Foto: Cecília Bastos / USP Imagem',
  }];
})();

