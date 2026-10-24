(() => {
  const data=window.ToDentroData;
  function resolve(referenceId,courseId){
    const reference=data.getScores({id:referenceId,courseId})[0];
    if(!reference)return null;
    const offering=data.getOfferings({universityId:reference.universityId,courseId}).find(item=>item.id===reference.offeringId);
    const university=data.getUniversity(reference.universityId),campus=data.getCampus(reference.universityId,reference.campusId),process=data.getProcess(reference.universityId,reference.processId);
    if(!offering || !university || !campus || !process || offering.campusId!==reference.campusId)return null;
    return {key:reference.id,id:university.id,university,campus,course:data.getCourse(courseId),offering,offeringId:offering.id,process,reference,
      score:reference.format==='range'?null:reference.value,campuses:[campus.label||campus.name],index:0,site:university.website};
  }
  function readSelection(params){
    const course=data.getCourse(params.get('curso'));if(!course)return [];
    let ids=params.getAll('referencia');
    if(!params.has('referencia'))ids=data.readComparison(params).map(item=>item.scoreId).filter(Boolean);
    return [...new Set(ids)].map(id=>resolve(id,course.id)).filter(Boolean);
  }
  function serialize(courseId,selection){
    const params=new URLSearchParams({curso:courseId});
    [...new Set(selection.map(item=>item.key))].forEach(id=>{if(resolve(id,courseId))params.append('referencia',id);});
    return params;
  }
  function canChart(selection){
    if(selection.length<2)return false;
    const signature=item=>JSON.stringify([item.reference.scale,item.process.key||item.process.name,item.reference.edition,item.reference.selectionCategoryId,item.reference.stageId||null,Boolean(item.reference.isMock)]);
    return selection.every(item=>Number.isFinite(item.reference.scale) && item.reference.scale>0 && Number.isFinite(item.score) && item.score>=0 && item.score<=item.reference.scale && signature(item)===signature(selection[0]));
  }
  window.ToDentroComparison=Object.freeze({resolve,readSelection,serialize,canChart,options:data.comparisonOptions('ciencia-da-computacao')});
})();
