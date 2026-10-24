(() => {
  const number=value=>Number(value).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  window.ToDentroAcademicUI={
    score:score=>!score?'Referência indisponível':score.format==='range'?`${number(score.minimum)} a ${number(score.maximum)}`:Number.isFinite(score.value)?number(score.value):'Referência indisponível',
    category:id=>id==='ampla-concorrencia'?'Ampla concorrência':/^l[1-4]$/i.test(id||'')?id.toUpperCase():window.ToDentroData.source.general.selectionCategories.find(item=>item.id===id)?.name||id,
    period:id=>window.ToDentroData.source.general.periods.find(item=>item.id===id)?.name||id,
    stage:id=>id==='fase-1'?'1ª fase':id==='fase-2'?'2ª fase':'Fase não informada',
    duration:offer=>offer.durationSemesters?`${offer.durationSemesters} semestres`:offer.durationYears?`${offer.durationYears*2} semestres`:'Duração não informada',
    safeUrl:value=>{try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}}
  };
})();
