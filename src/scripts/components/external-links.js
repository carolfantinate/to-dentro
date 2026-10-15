(() => {
  'use strict';
  function update(link) {
    if (!link.matches('a[href]')) return;
    const url = new URL(link.href, location.href);
    if (/^https?:$/.test(url.protocol) && url.origin !== location.origin) {
      link.target = '_blank';
      link.relList.add('noopener', 'noreferrer');
    }
  }
  document.querySelectorAll('a[href]').forEach(update);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') update(record.target);
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        update(node); node.querySelectorAll('a[href]').forEach(update);
      }
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
})();
