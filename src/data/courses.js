(() => {
  'use strict';
  // Catálogo demonstrativo para explorar os filtros; não representa a oferta de cada instituição.
  const areas = {
    saude: 'Saúde',
    biologicas: 'Ciências biológicas',
    humanas: 'Ciências humanas',
    sociais: 'Ciências sociais aplicadas',
    exatas: 'Ciências exatas e tecnologia',
    artes: 'Artes e comunicação',

  };
  const groups = {
    saude: [
      'Medicina',
      'Enfermagem',
      'Fisioterapia',
      'Nutrição',
      'Odontologia'
    ],

    biologicas: [
      'Ciências Biológicas',
      'Biotecnologia',
      'Ecologia'
    ],

    humanas: [
      'História',
      'Geografia',
      'Filosofia',
      'Pedagogia',
      'Psicologia'
    ],

    sociais: [
      'Administração',
      'Direito',
      'Economia',
      'Arquitetura'
    ],

    exatas: [
      'Engenharia',
      'Ciência da Computação',
      'Matemática',
      'Física',
      'Química'
    ],

    artes: [
      'Artes Visuais',
      'Design',
      'Jornalismo',
      'Música'
    ],

  };

  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const courses = Object.entries(groups).flatMap(([area, names]) => names.map(name => ({
    value: normalize(name),
    name,
    area
  })))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const degrees = {
    medicina: 'Bacharelado',
    direito: 'Bacharelado',
    engenharia: 'Bacharelado',
    arquitetura: 'Bacharelado'
  };

  for (const course of courses) course.degree = degrees[course.value] || 'Graduação';
  
  window.ToDentroCourseCatalog = { areas, courses };
})();
