(() => {
  'use strict';

  // Resolve os destinos a partir deste arquivo, inclusive em páginas dentro de src/pages.
  const projectUrl = new URL('../../../', document.currentScript.src);
  const items = [
    { id: 'inicio', label: 'Início', icon: 'home', path: 'index.html' },
    { id: 'buscar', label: 'Buscar', icon: 'search', path: 'src/pages/buscar-universidades.html' },
    { id: 'salvos', label: 'Salvos', icon: 'bookmark', path: 'src/pages/salvos.html' },
    { id: 'perfil', label: 'Perfil', icon: 'person', path: 'src/pages/perfil.html' },
  ];

  class BottomNav extends HTMLElement {
    static get observedAttributes() {
      return ['active'];
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    render() {
      const nav = document.createElement('nav');
      nav.className = 'bottom-nav';
      nav.setAttribute('aria-label', 'Navegação principal');
      const list = document.createElement('ul');
      list.className = 'bottom-nav-list';

      for (const item of items) {
        const listItem = document.createElement('li');
        const control = document.createElement(item.path ? 'a' : 'button');
        control.className = 'bottom-nav-item';

        if (item.path) {
          control.href = new URL(item.path, projectUrl).href;
          if (item.id === this.getAttribute('active')) {
            control.setAttribute('aria-current', 'page');
          }
        } else {
          // Definir path quando a página correspondente estiver implementada.
          control.type = 'button';
          control.setAttribute('aria-disabled', 'true');
          control.setAttribute('aria-label', `${item.label} — em breve`);
        }

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = item.icon;
        const label = document.createElement('span');
        label.textContent = item.label;
        control.append(icon, label);
        listItem.append(control);
        list.append(listItem);
      }

      nav.append(list);
      this.replaceChildren(nav);
    }
  }

  if (!customElements.get('td-bottom-nav')) {
    customElements.define('td-bottom-nav', BottomNav);
  }
})();

