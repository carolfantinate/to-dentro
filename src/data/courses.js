window.ToDentroCourseCatalog = window.ToDentroData.views.courseCatalog;
if(typeof document!=='undefined' && document.currentScript){
  const academicRoot=new URL('../../',document.currentScript.src);
  window.ToDentroCoursesReady=(async()=>{
    try{
      if(window.ToDentroUniversitiesReady && !await window.ToDentroUniversitiesReady)throw new Error('Catálogo indisponível.');
      const service=await import(new URL('services/academics.js',academicRoot).href);
      const records=await service.getAcademics(window.ToDentroUniversities);
      window.ToDentroData.applyAcademics(records);
      window.ToDentroCourseCatalog=window.ToDentroData.views.courseCatalog;
      window.ToDentroUniversities=window.ToDentroData.views.universities;
      return true;
    }catch(error){
      window.ToDentroCoursesError=error;
      const main=document.querySelector('main');
      if(main){const notice=document.createElement('p');notice.setAttribute('role','alert');notice.textContent='Não foi possível carregar cursos e notas do banco. Exibindo o conteúdo local de demonstração. Confira a conexão e publique as regras atualizadas do Firestore; depois recarregue.';main.prepend(notice);}
      return false;
    }
  })();
}
