(() => {
  const ui=window.ToDentroAcademicUI;
  function criteria(item){return [
    ['Campus',item.campus.label||item.campus.name],['Processo seletivo',item.process.name],
    ['Modalidade de concorrência',ui.category(item.reference.selectionCategoryId)],['Turno',ui.period(item.offering.periodId)],
    ['Edição',String(item.reference.edition)],['Fase',ui.stage(item.reference.stageId)],
    ['Modalidade do curso',window.ToDentroData.source.general.modes.find(mode=>mode.id===item.offering.modeId)?.name||item.offering.modeId]
  ];}
  function card(item,onRemove){
    const article=document.createElement('article');article.className=onRemove?'comparison-card':'option-card';
    const content=document.createElement('div');content.className='comparison-option-info';
    const heading=document.createElement('h3');heading.textContent=`${item.university.acronym} · ${item.course.name}`;
    const name=document.createElement('p');name.textContent=item.university.name;content.append(heading,name);
    const details=document.createElement('dl');details.className='comparison-criteria';
    criteria(item).forEach(([label,value])=>{const group=document.createElement('div'),title=document.createElement('dt'),description=document.createElement('dd');title.textContent=label;description.textContent=value;group.append(title,description);details.append(group);});
    const score=document.createElement('p');score.className='comparison-reference-score';score.textContent=`${item.reference.format==='range'?'Faixa de notas':'Nota'}: ${ui.score(item.reference)}`;
    content.append(details,score);
    if(item.reference.isMock){const demo=document.createElement('p');demo.textContent='Dados de demonstração';content.append(demo);}
    article.append(content);
    if(onRemove){const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='×';remove.setAttribute('aria-label',`Remover ${item.university.acronym}, ${item.campus.name}, ${item.process.name}, ${item.reference.edition}`);remove.addEventListener('click',onRemove);article.append(remove);}
    return article;
  }
  window.ToDentroComparisonUI={criteria,card};
})();
