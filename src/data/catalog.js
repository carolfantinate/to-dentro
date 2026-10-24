(() => {
  'use strict';
  const source = window.ToDentroMockData;
  if (!source) throw new Error('Carregue mock-data.js antes de catalog.js.');
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const freeze = value => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  };
  const index = list => new Map(list.map(item => [item.id, item]));
  let areas = Object.fromEntries(source.courseAreas.map(item => [item.id, item.name]));
  let courses = source.courseCatalog.map(({ legacyValue, areaId, ...item }) => ({ ...item, value: legacyValue, area: areaId }));
  const courseIndex = index(courses);
  const courseAliases = new Map(courses.flatMap(item => [[item.id, item.id], [item.value, item.id], [normalize(item.name), item.id]]));
  let campuses = source.universities.flatMap(university => university.campuses.map(({ courses, ...campus }) => campus));
  const campusIndex = index(campuses);
  let offerings = source.universities.flatMap(university => university.campuses.flatMap(campus => campus.courses.map(({ cutoffScores, ...offering }) => offering)));
  const offeringIndex = index(offerings);
  let cutoffScores = source.universities.flatMap(university => university.campuses.flatMap(campus => campus.courses.flatMap(offering => offering.cutoffScores)));
  let processes = source.universities.flatMap(item => item.admissionProcesses.map(process => ({ ...process, universityId: item.id })));
  const processIndex = index(processes);
  const people = index(source.general.people);
  const courseId = value => courseAliases.get(normalize(value));
  const campusAliases = new Map(campuses.flatMap(item => [item.id, ...item.aliases].map(alias => [`${item.universityId}:${alias}`, item])));
  const resolveCampus = (universityId, value) => campusAliases.get(`${universityId}:${value}`);
  const getOfferings = (filter = {}) => {
    const resolvedCourse = filter.courseId ? courseId(filter.courseId) : null;
    if (filter.courseId && !resolvedCourse) return [];
    const campus = filter.campusId ? resolveCampus(filter.universityId, filter.campusId) : null;
    if (filter.campusId && !campus) return [];
    return offerings.filter(item => (!filter.universityId || item.universityId === filter.universityId)
      && (!campus || item.campusId === campus.id)
      && (!resolvedCourse || item.courseId === resolvedCourse)
      && (!filter.modeId || item.modeId === filter.modeId)
      && (!filter.periodId || item.periodId === filter.periodId));
  };
  const universities = source.universities.map(university => {
    const { campuses: nestedCampuses, admissionEditions, calendarEvents, communityPosts, ...item } = university;
    const primary = campusIndex.get(university.primaryCampusId);
    const ownOfferings = getOfferings({ universityId: university.id });
    return { ...item, coordinates: primary.coordinates, mapLabel: primary.mapLabel,
      campusIds: nestedCampuses.map(campus => campus.id),
      mode: ownOfferings[0]?.modeId || null,
      periods: [...new Set(ownOfferings.map(offering => offering.periodId))],
      admissionMethods: [...new Set(university.admissionProcesses.map(process => process.method))],
      courses: [...new Set(ownOfferings.map(offering => courseIndex.get(offering.courseId).name))] };
  });
  const universityIndex = index(universities);
  const categories = source.general.selectionCategories;
  const resolveCategory = value => categories.find(item => item.id === value || item.name === value)?.id || (/^l[1-4]$/i.test(value || '') ? value.toLowerCase() : null);
  const resolvePeriod = value => source.general.periods.find(item => item.id === value || item.name === value)?.id;
  function findScore(filter) {
    const category = resolveCategory(filter.selectionCategoryId || filter.category);
    const period = resolvePeriod(filter.periodId || filter.period);
    const ownProcesses = processes.filter(item => item.universityId === filter.universityId);
    const process = ownProcesses.find(item => [item.id, item.key, item.name].includes(filter.processId || filter.process));
    if (!category || !period || !process || !filter.edition || !filter.campusId || !filter.courseId) return null;
    const matches = getOfferings({ universityId: filter.universityId, campusId: filter.campusId, courseId: filter.courseId, periodId: period });
    return cutoffScores.find(item => matches.some(offering => offering.id === item.offeringId)
      && item.processId === process.id && item.edition === Number(filter.edition)
      && item.selectionCategoryId === category
      && (!filter.offeringId || item.offeringId === filter.offeringId)
      && (item.dataSource !== 'firestore' || (filter.stageId || null) === (item.stageId || null))
      && (filter.context !== 'comparison' || item.dataSource !== 'firestore')) || null;
  }
  const communityPost = post => {
    const author = people.get(post.authorId);
    return { ...post, author: author.name, initials: author.name.split(' ').map(part => part[0]).slice(0, 2).join(''),
      course: courseIndex.get(post.courseId)?.name || '',
      replies: post.replies.map(reply => ({ ...reply, author: people.get(reply.authorId).name })) };
  };
  const communityPosts = [...source.universities.flatMap(item => item.communityPosts), ...source.general.communityPosts].map(communityPost);
  const admissionDates = source.universities.flatMap(item => item.admissionEditions);
  const calendarEvents = source.universities.flatMap(item => item.calendarEvents);
  const mapCampuses = campuses.filter(item => Array.isArray(item.coordinates)).map(item => ({ ...item,
    courses: getOfferings({ universityId: item.universityId, campusId: item.id }).map(offering => courseIndex.get(offering.courseId).name) }));

  function resolveSavedCourse(identity) {
    if (typeof identity !== 'string') return null;
    const offering = offeringIndex.get(identity);
    if (offering) return { university: universityIndex.get(offering.universityId), course: courseIndex.get(offering.courseId), offering, campus: campusIndex.get(offering.campusId) };
    const [universityId, value] = identity.split(':');
    const course = courseIndex.get(courseId(value));
    const university = universityIndex.get(universityId);
    if (!university || !course || !getOfferings({universityId,courseId:course.id}).length) return null;
    return { university, course, offering: null, campus: null };
  }

  function comparisonOptions(value) {
    const selectedCourse = courseId(value);
    if (!selectedCourse) return {};
    return Object.fromEntries(universities.flatMap(university => {
      const items = campuses.filter(item => item.universityId === university.id && Number.isInteger(item.comparisonOrder)
        && getOfferings({ universityId: university.id, campusId: item.id, courseId: selectedCourse }).length)
        .sort((a, b) => a.comparisonOrder - b.comparisonOrder);
      return items.length ? [[university.id, { campusIds: items.map(item => item.id), campuses: items.map(item => item.label), site: university.website }]] : [];
    }));
  }
  function readComparison(params) {
    const selectedCourse = courseId(params.get('curso'));
    if (!selectedCourse) return [];
    const options = comparisonOptions(selectedCourse);
    const seen = new Set();
    return params.getAll('opcao').flatMap(value => {
      let offering = offeringIndex.get(value);
      // Compatibilidade com links antigos: opcao=usp:0. Os novos usam o ID da oferta.
      if (!offering) {
        const [universityId, rawIndex] = value.split(':');
        if (!/^\d+$/.test(rawIndex || '')) return [];
        const campus = campuses.find(item => item.universityId === universityId && item.comparisonOrder === Number(rawIndex));
        if (campus) offering = getOfferings({ universityId, campusId: campus.id, courseId: selectedCourse })[0];
      }
      if (!offering || offering.courseId !== selectedCourse || seen.has(offering.universityId)) return [];
      const university = universityIndex.get(offering.universityId);
      const option = options[university.id];
      if (!option || !option.campusIds.includes(offering.campusId)) return [];
      seen.add(university.id);
      const processValue = params.get('processo') || 'enem';
      const selectedProcess = processes.find(item => [item.id, item.key, item.name].includes(processValue));
      const process = processes.find(item => item.universityId === university.id && item.method === (selectedProcess?.method || processValue));
      const score = process && findScore({ universityId: university.id, campusId: offering.campusId, courseId: selectedCourse,
        processId: process.id, edition: params.get('edicao') || 2026, category: params.get('modalidade') || 'Ampla concorrência',
        period: params.get('turno') || 'Integral', context: 'comparison' });
      return [{ ...option, id: university.id, university, campusId: offering.campusId, offeringId: offering.id,
        index: option.campusIds.indexOf(offering.campusId), scoreId: score?.id || null, score: score?.value ?? null }];
    });
  }

  // Visões derivadas e índices em memória; os registros só são editados em mock-data.js.
  freeze(source);
  let activeUniversities = universities;
  const views = freeze({ get universities() { return activeUniversities; }, campuses: mapCampuses, get courseCatalog() { return { areas, courses }; }, admissionDates,
    calendarEvents, communityPosts, opportunities: source.general.opportunities });
  const collections = freeze({ universities: source.universities.map(({ campuses, admissionEditions, calendarEvents, communityPosts, admissionProcesses, photos, ...record }) => ({...record, photoIds: (photos || []).map(photo => photo.id)})),
    campuses, courses: source.courseCatalog, courseAreas: source.courseAreas, courseOfferings: offerings, cutoffScores,
    admissionProcesses: processes,
    admissionEditions: admissionDates.map(({ events, ...edition }) => edition), admissionEvents: admissionDates.flatMap(item => item.events),
    calendarEvents, communityPosts: [...source.universities.flatMap(item => item.communityPosts), ...source.general.communityPosts].map(({replies,...post})=>post),
    communityReplies: [...source.universities.flatMap(item => item.communityPosts), ...source.general.communityPosts].flatMap(item=>item.replies),
    cities: source.general.cities, vocationalProfiles: source.general.vocationalProfiles, universityPhotos: source.universities.flatMap(item => item.photos || []), people: source.general.people, opportunities: source.general.opportunities, selectionCategories: source.general.selectionCategories, periods: source.general.periods, modes: source.general.modes });
  window.ToDentroData = Object.freeze({ source, views, collections, normalize,
    applyUniversities: records => {
      activeUniversities = freeze(records);
      universityIndex.clear();
      records.forEach(record => universityIndex.set(record.id, record));
    },
    applyAcademics: groups => {
      const ids=new Set(groups.map(group=>group.universityId));
      const merge=(old,records)=>freeze([...old.filter(item=>!ids.has(item.universityId)),...records]);
      const liveCourses=groups.flatMap(group=>group.courses.map(course=>({ ...course, value: normalize(course.name), area:course.areaId, degree:'Bacharelado', dataSource:'firestore' })));
      const liveCourseIds=new Set(liveCourses.map(course=>course.id));
      courses=freeze([...courses.filter(course=>!liveCourseIds.has(course.id)),...liveCourses]);
      areas=freeze({...areas,...Object.fromEntries(groups.flatMap(group=>group.courses.map(course=>[course.areaId,course.area])))});
      courseIndex.clear();courses.forEach(course=>courseIndex.set(course.id,course));
      courses.forEach(course=>[course.id,course.value,normalize(course.name)].forEach(alias=>courseAliases.set(alias,course.id)));
      const liveCampuses=groups.flatMap(group=>group.campuses.map(campus=>({ ...campus,
        aliases:campusIndex.get(campus.id)?.aliases || [], label:campus.name,
        comparisonOrder:campusIndex.get(campus.id)?.comparisonOrder,
        coordinates:typeof campus.latitude==='number' && typeof campus.longitude==='number' ? [campus.latitude,campus.longitude] : null })));
      campuses=merge(campuses,liveCampuses);campusIndex.clear();campusAliases.clear();
      campuses.forEach(campus=>{campusIndex.set(campus.id,campus);[campus.id,...(campus.aliases||[])].forEach(alias=>campusAliases.set(`${campus.universityId}:${alias}`,campus));});
      offerings=merge(offerings,groups.flatMap(group=>group.offerings.map(item=>({...item,dataSource:'firestore'}))));
      offeringIndex.clear();offerings.forEach(offering=>offeringIndex.set(offering.id,offering));
      processes=merge(processes,groups.flatMap(group=>group.processes.map(item=>({...item,key:item.id.slice(item.universityId.length+1),dataSource:'firestore'}))));
      cutoffScores=merge(cutoffScores,groups.flatMap(group=>group.cutoffScores.map(item=>({...item,isMock:false,dataSource:'firestore'}))));
      activeUniversities=freeze(activeUniversities.map(university=>!ids.has(university.id)?university:{...university,
        courses:[...new Set(getOfferings({universityId:university.id}).map(offering=>courseIndex.get(offering.courseId).name))],
        admissionMethods:[...new Set(processes.filter(item=>item.universityId===university.id).map(item=>item.method))]}));
      universityIndex.clear();activeUniversities.forEach(university=>universityIndex.set(university.id,university));
    },
    getScores: (filter={}) => cutoffScores.map(score=>({...score,courseId:score.courseId || offeringIndex.get(score.offeringId)?.courseId})).filter(score=>Object.entries(filter).every(([key,value])=>value==null || score[key]===value)),
    getUniversity: id => universityIndex.get(id) || null,
    getCourse: value => courseIndex.get(courseId(value)) || null,
    getCampus: (universityId, value) => resolveCampus(universityId, value) || null,
    getCampuses: universityId => campuses.filter(item => item.universityId === universityId),
    getOfferings,
    getProcesses: universityId => processes.filter(item => item.universityId === universityId),
    getProcess: (universityId, value) => processes.find(item=>item.universityId===universityId && [item.id,item.key,item.name].includes(value)) || null,
    getCourseContent: value => courseIndex.get(courseId(value))?.content || source.general.courseContent,
    findScore, comparisonOptions, readComparison, resolveSavedCourse,
    // Cópia apenas de dados, sem funções ou objetos do SDK; nada é enviado ao banco.
    exportCollections: () => JSON.parse(JSON.stringify(collections))
  });
})();
