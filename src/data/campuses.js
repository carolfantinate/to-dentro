(() => {
  'use strict';
  // Uma entrada por campus ou unidade. Expandir este catálogo ao incluir outras localizações.
  const locations = [
    {
      id: 'usp-cidade-universitaria',
      universityId: 'usp',
      name: 'Cidade Universitária'
    },

    {
      id: 'unesp-reitoria',
      universityId: 'unesp',
      name: 'Reitoria'
    },

    {
      id: 'unicamp-barao-geraldo',
      universityId: 'unicamp',
      name: 'Campus Barão Geraldo'
    },

  ];
  window.ToDentroCampuses = locations.map(campus => {
    const university = window.ToDentroUniversities.find(item => item.id === campus.universityId);
    return { ...campus, city: university.city, coordinates: [...university.coordinates] };
  });
})();
