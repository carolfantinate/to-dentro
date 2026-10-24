// Fonte única dos mocks. Organizada por universidade; não contém acesso ao Firebase.
window.ToDentroMockData = {
  "schemaVersion": 1,
  "metadata": {
    "kind": "mock",
    "description": "Dados centralizados do protótipo; ofertas, notas e datas não são um catálogo oficial verificado."
  },
  "courseAreas": [
    {
      "id": "saude",
      "name": "Saúde"
    },
    {
      "id": "biologicas",
      "name": "Ciências biológicas"
    },
    {
      "id": "humanas",
      "name": "Ciências humanas"
    },
    {
      "id": "sociais",
      "name": "Ciências sociais aplicadas"
    },
    {
      "id": "exatas",
      "name": "Ciências exatas e tecnologia"
    },
    {
      "id": "artes",
      "name": "Artes e comunicação"
    }
  ],
  "courseCatalog": [
    {
      "id": "administracao",
      "legacyValue": "administracao",
      "areaId": "sociais",
      "name": "Administração",
      "degree": "Graduação"
    },
    {
      "id": "arquitetura",
      "legacyValue": "arquitetura",
      "areaId": "sociais",
      "name": "Arquitetura",
      "degree": "Bacharelado"
    },
    {
      "id": "artes-visuais",
      "legacyValue": "artes visuais",
      "areaId": "artes",
      "name": "Artes Visuais",
      "degree": "Graduação"
    },
    {
      "id": "biotecnologia",
      "legacyValue": "biotecnologia",
      "areaId": "biologicas",
      "name": "Biotecnologia",
      "degree": "Graduação"
    },
    {
      "id": "ciencia-da-computacao",
      "legacyValue": "ciencia da computacao",
      "areaId": "exatas",
      "name": "Ciência da Computação",
      "degree": "Bacharelado",
      "content": {
        "introTitle": "Tecnologia que transforma",
        "description": "Da lógica à criação de soluções digitais: conheça possibilidades na computação.",
        "subjects": [
          [
            "code",
            "Programação",
            "blue"
          ],
          [
            "chip",
            "Algoritmos",
            "green"
          ],
          [
            "chart",
            "Dados e IA",
            "yellow"
          ],
          [
            "screen",
            "Sistemas",
            "blue"
          ]
        ],
        "careers": [
          [
            "screen",
            "Tecnologia e software",
            "blue"
          ],
          [
            "chart",
            "Dados e inteligência artificial",
            "yellow"
          ],
          [
            "science",
            "Pesquisa e inovação",
            "green"
          ]
        ]
      }
    },
    {
      "id": "ciencias-biologicas",
      "legacyValue": "ciencias biologicas",
      "areaId": "biologicas",
      "name": "Ciências Biológicas",
      "degree": "Graduação"
    },
    {
      "id": "design",
      "legacyValue": "design",
      "areaId": "artes",
      "name": "Design",
      "degree": "Graduação"
    },
    {
      "id": "direito",
      "legacyValue": "direito",
      "areaId": "sociais",
      "name": "Direito",
      "degree": "Bacharelado"
    },
    {
      "id": "ecologia",
      "legacyValue": "ecologia",
      "areaId": "biologicas",
      "name": "Ecologia",
      "degree": "Graduação"
    },
    {
      "id": "economia",
      "legacyValue": "economia",
      "areaId": "sociais",
      "name": "Economia",
      "degree": "Graduação"
    },
    {
      "id": "enfermagem",
      "legacyValue": "enfermagem",
      "areaId": "saude",
      "name": "Enfermagem",
      "degree": "Graduação"
    },
    {
      "id": "engenharia",
      "legacyValue": "engenharia",
      "areaId": "exatas",
      "name": "Engenharia",
      "degree": "Bacharelado"
    },
    {
      "id": "filosofia",
      "legacyValue": "filosofia",
      "areaId": "humanas",
      "name": "Filosofia",
      "degree": "Graduação"
    },
    {
      "id": "fisica",
      "legacyValue": "fisica",
      "areaId": "exatas",
      "name": "Física",
      "degree": "Graduação"
    },
    {
      "id": "fisioterapia",
      "legacyValue": "fisioterapia",
      "areaId": "saude",
      "name": "Fisioterapia",
      "degree": "Graduação"
    },
    {
      "id": "geografia",
      "legacyValue": "geografia",
      "areaId": "humanas",
      "name": "Geografia",
      "degree": "Graduação"
    },
    {
      "id": "historia",
      "legacyValue": "historia",
      "areaId": "humanas",
      "name": "História",
      "degree": "Graduação"
    },
    {
      "id": "jornalismo",
      "legacyValue": "jornalismo",
      "areaId": "artes",
      "name": "Jornalismo",
      "degree": "Graduação"
    },
    {
      "id": "matematica",
      "legacyValue": "matematica",
      "areaId": "exatas",
      "name": "Matemática",
      "degree": "Graduação"
    },
    {
      "id": "medicina",
      "legacyValue": "medicina",
      "areaId": "saude",
      "name": "Medicina",
      "degree": "Bacharelado"
    },
    {
      "id": "musica",
      "legacyValue": "musica",
      "areaId": "artes",
      "name": "Música",
      "degree": "Graduação"
    },
    {
      "id": "nutricao",
      "legacyValue": "nutricao",
      "areaId": "saude",
      "name": "Nutrição",
      "degree": "Graduação"
    },
    {
      "id": "odontologia",
      "legacyValue": "odontologia",
      "areaId": "saude",
      "name": "Odontologia",
      "degree": "Graduação"
    },
    {
      "id": "pedagogia",
      "legacyValue": "pedagogia",
      "areaId": "humanas",
      "name": "Pedagogia",
      "degree": "Graduação"
    },
    {
      "id": "psicologia",
      "legacyValue": "psicologia",
      "areaId": "humanas",
      "name": "Psicologia",
      "degree": "Graduação"
    },
    {
      "id": "quimica",
      "legacyValue": "quimica",
      "areaId": "exatas",
      "name": "Química",
      "degree": "Graduação"
    }
  ],
  "general": {
    "courseContent": {
      "introTitle": "Conhecimento que transforma",
      "subjects": [
        [
          "document",
          "Fundamentos da área",
          "blue"
        ],
        [
          "science",
          "Pesquisa",
          "green"
        ],
        [
          "chart",
          "Práticas e projetos",
          "yellow"
        ],
        [
          "university",
          "Formação acadêmica",
          "blue"
        ]
      ],
      "careers": [
        [
          "document",
          "Atuação profissional",
          "blue"
        ],
        [
          "university",
          "Ensino e formação",
          "yellow"
        ],
        [
          "science",
          "Pesquisa e inovação",
          "green"
        ]
      ]
    },
    "opportunities": [
      {
        "id": "pesquisa",
        "category": "pesquisa",
        "title": "Iniciação científica",
        "summary": "Programa institucional. Veja como funciona e consulte o edital.",
        "action": "Explorar",
        "detail": "Participe de projetos de pesquisa com orientação de docentes. Consulte a universidade para conhecer as linhas de pesquisa, os requisitos e os editais. A participação pode ocorrer com ou sem bolsa."
      },
      {
        "id": "monitoria",
        "category": "monitoria",
        "title": "Monitoria",
        "summary": "Apoio ao ensino. Oferta e critérios variam por unidade e edital.",
        "action": "Conhecer",
        "detail": "A monitoria permite colaborar em atividades de ensino e apoiar outros estudantes. Disciplinas, requisitos, carga horária e eventual bolsa são definidos pela unidade responsável."
      },
      {
        "id": "extensao",
        "category": "extensao",
        "title": "Projetos de extensão",
        "summary": "Conhecimento em diálogo com a comunidade.",
        "action": "Ver projetos",
        "detail": "Conheça atividades que aproximam a universidade e a comunidade. A participação pode envolver projetos culturais, educativos, sociais e outras ações. Consulte as chamadas da instituição."
      },
      {
        "id": "bolsas",
        "category": "bolsas",
        "title": "Bolsas e apoio estudantil",
        "summary": "Conheça possibilidades de apoio e acompanhe as seleções da universidade.",
        "action": "Conhecer",
        "detail": "As instituições podem oferecer bolsas e auxílios com objetivos e critérios diferentes. Confira requisitos, documentação e prazos diretamente nos canais de assistência estudantil e nos editais."
      }
    ],
    "communityPosts": [
      {
        "id": "ana-ingresso",
        "universityId": null,
        "category": "duvidas",
        "title": "Sisu e ENEM-USP são a mesma coisa?",
        "text": "Onde posso consultar as diferenças e as regras de cada seleção?",
        "topic": "ingresso",
        "publishedAt": "2026-10-13",
        "authorId": "person-ana",
        "courseId": null,
        "replies": [],
        "isMock": true
      },
      {
        "id": "lucas-vestibular",
        "universityId": null,
        "category": "experiencias",
        "role": "Vestibulando",
        "since": 2025,
        "publishedAt": "2026-10-12",
        "title": "Como organizei meu vestibular",
        "text": "Separei os prazos e reservei tempo para descansar. Ter tudo em um calendário me ajudou muito.",
        "likes": 24,
        "comments": 8,
        "authorId": "person-lucas-ferreira",
        "courseId": null,
        "replies": [],
        "isMock": true
      }
    ],
    "people": [
      {
        "id": "person-ana",
        "name": "Ana",
        "isMock": true
      },
      {
        "id": "person-mariana",
        "name": "Mariana",
        "isMock": true
      },
      {
        "id": "person-lucas",
        "name": "Lucas",
        "isMock": true
      },
      {
        "id": "person-mariana-costa",
        "name": "Mariana Costa",
        "isMock": true
      },
      {
        "id": "person-lucas-ferreira",
        "name": "Lucas Ferreira",
        "isMock": true
      }
    ],
    "selectionCategories": [
      {
        "id": "ampla-concorrencia",
        "name": "Ampla concorrência"
      },
      {
        "id": "escola-publica",
        "name": "Escola pública"
      },
      {
        "id": "ppi",
        "name": "Pretos, pardos e indígenas"
      }
    ],
    "periods": [
      {
        "id": "integral",
        "name": "Integral"
      },
      {
        "id": "manha",
        "name": "Matutino"
      },
      {
        "id": "tarde",
        "name": "Vespertino"
      },
      {
        "id": "noite",
        "name": "Noturno"
      }
    ],
    "modes": [
      {
        "id": "presencial",
        "name": "Presencial"
      }
    ],
    "cities": [
      {
        "id": "sao-paulo",
        "name": "São Paulo",
        "state": "SP",
        "color": "blue"
      },
      {
        "id": "campinas",
        "name": "Campinas",
        "state": "SP",
        "color": "green"
      },
      {
        "id": "sao-carlos",
        "name": "São Carlos",
        "state": "SP",
        "color": "yellow"
      }
    ],
    "vocationalProfiles": [
      {
        "id": "cuidar-e-descobrir",
        "version": 1,
        "demonstrative": true,
        "profile": "Cuidar e descobrir",
        "interests": {
          "pessoas": 4.7,
          "ciencia": 4.2,
          "criacao": 2.9,
          "analise": 3.6,
          "organizacao": 2.5,
          "comunicacao": 3.3
        }
      }
    ]
  },
  "universities": [
    {
      "id": "usp",
      "acronym": "USP",
      "name": "Universidade de São Paulo",
      "city": "São Paulo",
      "state": "SP",
      "public": true,
      "free": true,
      "description": "Ensino, pesquisa e extensão para transformar o seu futuro. Explore cursos, campi e possibilidades de ingresso.",
      "admission": "Fuvest · ENEM-USP · Provão Paulista",
      "photos": [
        {
          "src": "https://sites.usp.br/wp-content/uploads/2025/05/Praca-Relogio_84-20_fOTO-Cecilia-Bastos_USP-Imagem-04.jpg",
          "alt": "Praça do Relógio, na Cidade Universitária da USP",
          "credit": "Foto: Cecília Bastos / USP Imagem",
          "id": "usp-photo-1",
          "universityId": "usp"
        }
      ],
      "isMock": true,
      "website": "https://www.usp.br/",
      "admissionsUrl": "https://www.fuvest.br/",
      "coursesUrl": "https://www5.usp.br/ensino/graduacao/cursos-oferecidos/",
      "sourceName": "Fuvest · fuvest.br",
      "sourceUrl": "https://www.fuvest.br/",
      "primaryCampusId": "usp-cidade-universitaria",
      "admissionProcesses": [
        {
          "id": "usp-enem-usp",
          "key": "enem-usp",
          "name": "ENEM-USP",
          "method": "enem",
          "website": "https://www.fuvest.br/",
          "isMock": true,
          "universityId": "usp"
        },
        {
          "id": "usp-fuvest",
          "key": "fuvest",
          "name": "FUVEST",
          "method": "vestibular",
          "website": "https://www.fuvest.br/",
          "isMock": true,
          "universityId": "usp"
        },
        {
          "id": "usp-provao-paulista",
          "key": "provao-paulista",
          "name": "Provão Paulista",
          "method": "vestibular",
          "website": "https://www.fuvest.br/",
          "isMock": true,
          "universityId": "usp"
        }
      ],
      "campuses": [
        {
          "id": "usp-cidade-universitaria",
          "aliases": [
            "butanta",
            "consultar"
          ],
          "name": "Cidade Universitária",
          "label": "São Paulo · Butantã",
          "city": "São Paulo",
          "type": "academic",
          "coordinates": [
            -23.559,
            -46.73
          ],
          "mapLabel": "Cidade Universitária • localização aproximada",
          "comparisonOrder": 0,
          "universityId": "usp",
          "state": "SP",
          "isMock": true,
          "courses": [
            {
              "id": "usp-cidade-universitaria-medicina-presencial-integral",
              "universityId": "usp",
              "campusId": "usp-cidade-universitaria",
              "courseId": "medicina",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www5.usp.br/ensino/graduacao/cursos-oferecidos/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            },
            {
              "id": "usp-cidade-universitaria-direito-presencial-integral",
              "universityId": "usp",
              "campusId": "usp-cidade-universitaria",
              "courseId": "direito",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www5.usp.br/ensino/graduacao/cursos-oferecidos/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            },
            {
              "id": "usp-cidade-universitaria-engenharia-presencial-integral",
              "universityId": "usp",
              "campusId": "usp-cidade-universitaria",
              "courseId": "engenharia",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www5.usp.br/ensino/graduacao/cursos-oferecidos/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            },
            {
              "id": "usp-cidade-universitaria-ciencia-da-computacao-presencial-integral",
              "universityId": "usp",
              "campusId": "usp-cidade-universitaria",
              "courseId": "ciencia-da-computacao",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": "IME",
              "website": "https://www.ime.usp.br/bcc/",
              "description": "Ciência da Computação",
              "isMock": true,
              "cutoffScores": [
                {
                  "id": "offering-usp-computacao-enem-2026-ampla",
                  "universityId": "usp",
                  "campusId": "usp-cidade-universitaria",
                  "offeringId": "usp-cidade-universitaria-ciencia-da-computacao-presencial-integral",
                  "processId": "usp-enem-usp",
                  "edition": 2026,
                  "selectionCategoryId": "ampla-concorrencia",
                  "value": 782.45,
                  "scale": 1000,
                  "isMock": true
                }
              ]
            }
          ]
        },
        {
          "id": "usp-sao-carlos",
          "aliases": [
            "sao-carlos"
          ],
          "name": "São Carlos",
          "label": "São Carlos",
          "city": "São Carlos",
          "type": "academic",
          "coordinates": null,
          "comparisonOrder": 1,
          "universityId": "usp",
          "state": "SP",
          "isMock": true,
          "courses": [
            {
              "id": "usp-sao-carlos-ciencia-da-computacao-presencial-integral",
              "universityId": "usp",
              "campusId": "usp-sao-carlos",
              "courseId": "ciencia-da-computacao",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": 5,
              "unit": "ICMC",
              "website": "https://www.icmc.usp.br/graduacao/ciencias-de-computacao-bacharelado",
              "description": "Ciências de Computação · 5 anos",
              "isMock": true,
              "cutoffScores": []
            }
          ]
        },
        {
          "id": "usp-ribeirao-preto",
          "aliases": [
            "ribeirao-preto"
          ],
          "name": "Ribeirão Preto",
          "label": "Ribeirão Preto",
          "city": "Ribeirão Preto",
          "type": "academic",
          "coordinates": null,
          "comparisonOrder": 2,
          "universityId": "usp",
          "state": "SP",
          "isMock": true,
          "courses": [
            {
              "id": "usp-ribeirao-preto-ciencia-da-computacao-presencial-integral",
              "universityId": "usp",
              "campusId": "usp-ribeirao-preto",
              "courseId": "ciencia-da-computacao",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": 4,
              "unit": "FFCLRP",
              "website": "https://www.ffclrp.usp.br/",
              "description": "Ciência da Computação · 4 anos",
              "isMock": true,
              "cutoffScores": []
            }
          ]
        }
      ],
      "admissionEditions": [
        {
          "universityId": "usp",
          "process": "fuvest",
          "edition": 2027,
          "name": "Fuvest",
          "notice": "Edição para ingresso em 2027. Horários de Brasília.",
          "source": "https://www.fuvest.br/vestibular-da-usp/",
          "references": [
            "https://saocarlos.usp.br/fuvest-divulga-guia-de-inclusao-com-acoes-afirmativas-para-o-vestibular-2026/",
            "https://www.fuvest.br/wp-content/uploads/fuvest2026_guia-jornada.pdf",
            "https://jornal.usp.br/radio-usp/fuvest-antecipa-divulgacao-dos-locais-de-prova-do-vestibular-2026/",
            "https://saocarlos.usp.br/fuvest-divulga-lista-de-convocados-para-a-2a-fase-do-vestibular-e-locais-de-provas/"
          ],
          "id": "usp-fuvest-2027",
          "processId": "usp-fuvest",
          "isMock": true,
          "events": [
            {
              "id": "usp-fuvest-2027-isencao",
              "title": "Solicitação de isenção",
              "start": "2026-05-11",
              "end": "2026-07-10",
              "time": "12:00",
              "endTime": "12:00",
              "legacyId": "isencao",
              "universityId": "usp",
              "editionId": "usp-fuvest-2027",
              "isMock": true
            },
            {
              "id": "usp-fuvest-2027-inscricao",
              "title": "Inscrição",
              "start": "2026-08-17",
              "end": "2026-10-09",
              "time": "12:00",
              "endTime": "12:00",
              "legacyId": "inscricao",
              "universityId": "usp",
              "editionId": "usp-fuvest-2027",
              "isMock": true
            },
            {
              "id": "usp-fuvest-2027-fase-1",
              "title": "Prova · 1ª fase",
              "start": "2026-11-01",
              "time": "13:00",
              "legacyId": "fase-1",
              "universityId": "usp",
              "editionId": "usp-fuvest-2027",
              "isMock": true
            },
            {
              "id": "usp-fuvest-2027-fase-2-dia-1",
              "title": "Prova · 2ª fase · dia 1",
              "start": "2026-12-06",
              "time": "13:00",
              "legacyId": "fase-2-dia-1",
              "universityId": "usp",
              "editionId": "usp-fuvest-2027",
              "isMock": true
            },
            {
              "id": "usp-fuvest-2027-fase-2-dia-2",
              "title": "Prova · 2ª fase · dia 2",
              "start": "2026-12-07",
              "time": "13:00",
              "legacyId": "fase-2-dia-2",
              "universityId": "usp",
              "editionId": "usp-fuvest-2027",
              "isMock": true
            },
            {
              "id": "usp-fuvest-2027-primeira-chamada",
              "title": "Divulgação da 1ª chamada",
              "start": "2027-01-26",
              "legacyId": "primeira-chamada",
              "universityId": "usp",
              "editionId": "usp-fuvest-2027",
              "isMock": true
            }
          ]
        }
      ],
      "calendarEvents": [
        {
          "id": "usp-calendar-inscricao",
          "date": "2026-10-15",
          "title": "Inscrição no vestibular",
          "description": "Confira o edital e os documentos",
          "universityId": "usp",
          "category": "vestibular",
          "color": "blue",
          "legacyId": "inscricao",
          "isMock": true
        }
      ],
      "communityPosts": [
        {
          "id": "ana-pesquisa",
          "universityId": "usp",
          "category": "duvidas",
          "title": "Como começo uma iniciação científica?",
          "text": "Como encontrar projetos de pesquisa e conversar com possíveis orientadores?",
          "topic": "pesquisa",
          "publishedAt": "2026-10-14",
          "authorId": "person-ana",
          "courseId": null,
          "replies": [
            {
              "id": "ana-pesquisa-reply-1",
              "postId": "ana-pesquisa",
              "universityId": "usp",
              "authorId": "person-mariana",
              "text": "Eu comecei conversando com professores do meu curso sobre os projetos deles."
            },
            {
              "id": "ana-pesquisa-reply-2",
              "postId": "ana-pesquisa",
              "universityId": "usp",
              "authorId": "person-lucas",
              "text": "Vale consultar as chamadas e os contatos da área de pesquisa da sua unidade."
            }
          ],
          "isMock": true
        },
        {
          "id": "mariana-usp",
          "universityId": "usp",
          "category": "experiencias",
          "role": "Estudante",
          "since": 2024,
          "publishedAt": "2026-10-10",
          "title": "Minha experiência na USP",
          "text": "Escolher meu curso ficou mais fácil quando conversei com quem já estudava lá. Pesquise os projetos e conheça o campus!",
          "likes": 24,
          "comments": 8,
          "authorId": "person-mariana-costa",
          "courseId": "medicina",
          "replies": [],
          "isMock": true
        }
      ],
      "opportunityIds": [
        "pesquisa",
        "monitoria",
        "extensao",
        "bolsas"
      ],
      "studentSupportUrl": "https://prip.usp.br/apoio-estudantil/"
    },
    {
      "id": "unesp",
      "acronym": "UNESP",
      "name": "Universidade Estadual Paulista",
      "city": "São Paulo",
      "state": "SP",
      "public": true,
      "free": true,
      "description": "Ensino, pesquisa e extensão para transformar o seu futuro. Explore cursos, campi e possibilidades de ingresso.",
      "admission": "Vestibular • ENEM • Processos próprios",
      "isMock": true,
      "website": "https://www.unesp.br/",
      "admissionsUrl": "https://www.unesp.br/vestibular",
      "coursesUrl": "https://www.unesp.br/",
      "sourceName": "Unesp · vestibular.unesp.br",
      "sourceUrl": "https://vestibular.unesp.br/",
      "primaryCampusId": "unesp-reitoria",
      "admissionProcesses": [
        {
          "id": "unesp-vestibular-unesp",
          "key": "vestibular-unesp",
          "name": "Vestibular Unesp",
          "method": "vestibular",
          "website": "https://www.unesp.br/vestibular",
          "isMock": true,
          "universityId": "unesp"
        },
        {
          "id": "unesp-enem-unesp",
          "key": "enem-unesp",
          "name": "ENEM",
          "method": "enem",
          "website": "https://www.unesp.br/vestibular",
          "isMock": true,
          "universityId": "unesp"
        }
      ],
      "campuses": [
        {
          "id": "unesp-reitoria",
          "aliases": [],
          "name": "Reitoria",
          "label": "Reitoria",
          "city": "São Paulo",
          "type": "administrative",
          "coordinates": [
            -23.5376,
            -46.6487
          ],
          "mapLabel": "Reitoria • localização aproximada",
          "universityId": "unesp",
          "state": "SP",
          "isMock": true,
          "courses": []
        },
        {
          "id": "unesp-rio-claro",
          "aliases": [],
          "name": "Rio Claro",
          "label": "Rio Claro",
          "city": "Rio Claro",
          "type": "academic",
          "coordinates": null,
          "comparisonOrder": 0,
          "universityId": "unesp",
          "state": "SP",
          "isMock": true,
          "courses": [
            {
              "id": "unesp-rio-claro-ciencia-da-computacao-presencial-integral",
              "universityId": "unesp",
              "campusId": "unesp-rio-claro",
              "courseId": "ciencia-da-computacao",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www.unesp.br/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": [
                {
                  "id": "unesp-rio-claro-ciencia-da-computacao-presencial-integral-comparison-2026",
                  "universityId": "unesp",
                  "campusId": "unesp-rio-claro",
                  "offeringId": "unesp-rio-claro-ciencia-da-computacao-presencial-integral",
                  "processId": "unesp-enem-unesp",
                  "edition": 2026,
                  "selectionCategoryId": "ampla-concorrencia",
                  "value": 772.4,
                  "scale": 1000,
                  "isMock": true
                }
              ]
            }
          ]
        },
        {
          "id": "unesp-bauru",
          "aliases": [],
          "name": "Bauru",
          "label": "Bauru",
          "city": "Bauru",
          "type": "academic",
          "coordinates": null,
          "comparisonOrder": 1,
          "universityId": "unesp",
          "state": "SP",
          "isMock": true,
          "courses": [
            {
              "id": "unesp-bauru-ciencia-da-computacao-presencial-integral",
              "universityId": "unesp",
              "campusId": "unesp-bauru",
              "courseId": "ciencia-da-computacao",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www.unesp.br/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            }
          ]
        },
        {
          "id": "unesp-sao-jose-do-rio-preto",
          "aliases": [],
          "name": "São José do Rio Preto",
          "label": "São José do Rio Preto",
          "city": "São José do Rio Preto",
          "type": "academic",
          "coordinates": null,
          "comparisonOrder": 2,
          "universityId": "unesp",
          "state": "SP",
          "isMock": true,
          "courses": [
            {
              "id": "unesp-sao-jose-do-rio-preto-ciencia-da-computacao-presencial-integral",
              "universityId": "unesp",
              "campusId": "unesp-sao-jose-do-rio-preto",
              "courseId": "ciencia-da-computacao",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www.unesp.br/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            }
          ]
        },
        {
          "id": "unesp-campus-a-confirmar",
          "aliases": [
            "consultar"
          ],
          "name": "Unidade a confirmar",
          "label": "São Paulo · Conferir unidade",
          "city": "São Paulo",
          "type": "unassigned",
          "coordinates": null,
          "universityId": "unesp",
          "state": "SP",
          "isMock": true,
          "courses": [
            {
              "id": "unesp-campus-a-confirmar-medicina-presencial-integral",
              "universityId": "unesp",
              "campusId": "unesp-campus-a-confirmar",
              "courseId": "medicina",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www.unesp.br/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            },
            {
              "id": "unesp-campus-a-confirmar-direito-presencial-integral",
              "universityId": "unesp",
              "campusId": "unesp-campus-a-confirmar",
              "courseId": "direito",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www.unesp.br/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            },
            {
              "id": "unesp-campus-a-confirmar-engenharia-presencial-integral",
              "universityId": "unesp",
              "campusId": "unesp-campus-a-confirmar",
              "courseId": "engenharia",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www.unesp.br/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            }
          ]
        }
      ],
      "admissionEditions": [],
      "calendarEvents": [
        {
          "id": "unesp-calendar-isencao",
          "date": "2026-10-22",
          "title": "Prazo de solicitação de isenção",
          "description": "Organize os comprovantes",
          "universityId": "unesp",
          "category": "vestibular",
          "color": "green",
          "legacyId": "isencao",
          "isMock": true
        }
      ],
      "communityPosts": [],
      "opportunityIds": [
        "pesquisa",
        "monitoria",
        "extensao",
        "bolsas"
      ],
      "studentSupportUrl": "https://www.unesp.br/permanenciaestudantil"
    },
    {
      "id": "unicamp",
      "acronym": "UNICAMP",
      "name": "Universidade de Campinas",
      "city": "Campinas",
      "state": "SP",
      "public": true,
      "free": true,
      "description": "Ensino, pesquisa e extensão para transformar o seu futuro. Explore cursos, campi e possibilidades de ingresso.",
      "admission": "Vestibular • ENEM • Processos próprios",
      "isMock": true,
      "website": "https://www.unicamp.br/",
      "admissionsUrl": "https://www.unicamp.br/estude-na-unicamp/",
      "coursesUrl": "https://www.unicamp.br/",
      "sourceName": "Comvest · comvest.unicamp.br",
      "sourceUrl": "https://www.comvest.unicamp.br/",
      "primaryCampusId": "unicamp-barao-geraldo",
      "admissionProcesses": [
        {
          "id": "unicamp-vestibular-unicamp",
          "key": "vestibular-unicamp",
          "name": "Vestibular Unicamp",
          "method": "vestibular",
          "website": "https://www.unicamp.br/estude-na-unicamp/",
          "isMock": true,
          "universityId": "unicamp"
        },
        {
          "id": "unicamp-enem-unicamp",
          "key": "enem-unicamp",
          "name": "Enem-Unicamp",
          "method": "enem",
          "website": "https://www.unicamp.br/estude-na-unicamp/",
          "isMock": true,
          "universityId": "unicamp"
        }
      ],
      "campuses": [
        {
          "id": "unicamp-barao-geraldo",
          "aliases": [
            "consultar"
          ],
          "name": "Campus Barão Geraldo",
          "label": "Campinas · Barão Geraldo",
          "city": "Campinas",
          "type": "academic",
          "coordinates": [
            -22.818,
            -47.0647
          ],
          "mapLabel": "Campus Barão Geraldo • localização aproximada",
          "comparisonOrder": 0,
          "universityId": "unicamp",
          "state": "SP",
          "isMock": true,
          "courses": [
            {
              "id": "unicamp-barao-geraldo-medicina-presencial-integral",
              "universityId": "unicamp",
              "campusId": "unicamp-barao-geraldo",
              "courseId": "medicina",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www.unicamp.br/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            },
            {
              "id": "unicamp-barao-geraldo-engenharia-presencial-integral",
              "universityId": "unicamp",
              "campusId": "unicamp-barao-geraldo",
              "courseId": "engenharia",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www.unicamp.br/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            },
            {
              "id": "unicamp-barao-geraldo-arquitetura-presencial-integral",
              "universityId": "unicamp",
              "campusId": "unicamp-barao-geraldo",
              "courseId": "arquitetura",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www.unicamp.br/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": []
            },
            {
              "id": "unicamp-barao-geraldo-ciencia-da-computacao-presencial-integral",
              "universityId": "unicamp",
              "campusId": "unicamp-barao-geraldo",
              "courseId": "ciencia-da-computacao",
              "modeId": "presencial",
              "periodId": "integral",
              "durationYears": null,
              "unit": null,
              "website": "https://www.unicamp.br/",
              "description": "Confira a oferta e as unidades no catálogo oficial.",
              "isMock": true,
              "cutoffScores": [
                {
                  "id": "unicamp-barao-geraldo-ciencia-da-computacao-presencial-integral-comparison-2026",
                  "universityId": "unicamp",
                  "campusId": "unicamp-barao-geraldo",
                  "offeringId": "unicamp-barao-geraldo-ciencia-da-computacao-presencial-integral",
                  "processId": "unicamp-enem-unicamp",
                  "edition": 2026,
                  "selectionCategoryId": "ampla-concorrencia",
                  "value": 754.25,
                  "scale": 1000,
                  "isMock": true
                }
              ]
            }
          ]
        }
      ],
      "admissionEditions": [],
      "calendarEvents": [
        {
          "id": "unicamp-calendar-ingresso",
          "date": "2026-10-29",
          "title": "Revisar opções de ingresso",
          "description": "SISU, PROUNI e FIES",
          "universityId": "unicamp",
          "category": "ingresso",
          "color": "blue",
          "legacyId": "ingresso",
          "isMock": true
        }
      ],
      "communityPosts": [],
      "opportunityIds": [
        "pesquisa",
        "monitoria",
        "extensao",
        "bolsas"
      ],
      "studentSupportUrl": "https://deape.unicamp.br/"
    }
  ]
};
