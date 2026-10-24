(() => {
  'use strict';
  import(new URL('../components/device-tip.js', document.currentScript.src).href).catch(() => { /* A recomendação não impede a navegação. */ });
  const root=new URL('../../../',document.currentScript.src);
  const local=(value,allowSame=false)=>{
    if(!value)return null;
    try{const url=new URL(value,location.href);return url.origin===root.origin && url.pathname.startsWith(root.pathname) && (allowSame || url.href!==location.href) ? url : null;}catch{return null;}
  };
  const backLink=target=>target?.closest?.('a[aria-label^="Voltar"], a[data-back]');
  document.addEventListener('click',event=>{
    const link=backLink(event.target);
    if(!link || event.defaultPrevented || event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target==='_blank')return;
    const entries=window.navigation?.entries?.();
    const current=window.navigation?.currentEntry;
    const previous=entries && current ? entries.find(entry=>entry.index===current.index-1) : null;
    const referrer=local(document.referrer);
    // A API identifica a entrada imediatamente anterior. Em navegadores sem ela,
    // só usamos back quando a origem da navegação pertence ao próprio aplicativo.
    const canBack=entries && current ? Boolean(previous && local(previous.url,true)) : Boolean(local(document.referrer,true) && history.length>1);
    const from=local(new URLSearchParams(location.search).get('from'));
    const fallback=from || referrer || local(link.href);
    if(!canBack && !fallback)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(canBack)history.back();
    else location.assign(fallback.href);
  },true);
})();
