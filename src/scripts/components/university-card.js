(() => {
  'use strict';
  const projectUrl = new URL('../../../', document.currentScript.src);
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  class UniversityCard extends HTMLElement {
    static get observedAttributes() { return ['university-id', 'variant']; }
    async connectedCallback() { if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady; this.render(); }
    async attributeChangedCallback() { if (window.ToDentroUniversitiesReady) await window.ToDentroUniversitiesReady; if (this.isConnected) this.render(); }

    render() {
      const university = window.ToDentroUniversities.find(item => item.id === this.getAttribute('university-id'));
      this.replaceChildren();
      if (!university) { this.hidden = true; return; }
      this.hidden = false;
      Object.assign(this.dataset, {
        name: university.name,
        search: `${university.acronym} ${university.name} ${university.city} ${university.courses.join(' ')}`,
        university: `${university.name} ${university.acronym} ${university.city} ${university.public ? 'Pública' : 'Particular'} ${university.mode} ${university.free ? 'Gratuita' : 'Com mensalidade'}`,
        city: university.city, state: university.state, public: String(university.public), free: String(university.free),
        mode: university.mode, courses: university.courses.map(normalize).join(','), period: university.periods.join(','),
        admission: (university.admissionMethods || []).join(','),
      });

      const link = document.createElement('a');
      link.className = 'university-card';
      const destination = new URL('src/pages/universidade.html', projectUrl);
      destination.searchParams.set('id', university.id);
      destination.searchParams.set('from', location.pathname + location.search);
      link.href = destination.href;
      link.setAttribute('aria-label', `Conhecer ${university.name}`);

      const info = document.createElement('div'); info.className = 'university-info';
      const logo = document.createElement('span'); logo.className = 'university-logo'; 
      logo.textContent = university.acronym; logo.setAttribute('aria-hidden', 'true');
      const text = document.createElement('div');
      const title = document.createElement('h3'); title.textContent = university.name;
      const locationText = document.createElement('p'); locationText.textContent = [university.city, university.category || (university.public ? 'Pública' : 'Particular')].filter(Boolean).join(' • ');
      text.append(title, locationText); info.append(logo, text);
      const tags = document.createElement('ul'); tags.className = 'university-tags'; tags.setAttribute('aria-label', 'Características da universidade');
      for (const [label, color] of [[{presencial: 'Presencial', ead: 'EAD', hibrida: 'Híbrida'}[university.mode], 'blue'], [university.tuition || (university.free ? 'Gratuita' : 'Com mensalidade'), 'green']].filter(([label]) => label)) {
        const tag = document.createElement('li'); tag.className = `tag tag-${color}`; tag.textContent = label; tags.append(tag);
      }
      const savedVariant = this.getAttribute('variant') === 'saved';
      if (this.getAttribute('variant') === 'featured' || savedVariant) {
        link.classList.add('university-card-featured');
        info.replaceChildren(text);
        const description = document.createElement('p');
        description.className = 'university-featured-description';
        description.textContent = savedVariant ? ({ presencial: 'Presencial', ead: 'EAD', hibrida: 'Híbrida' }[university.mode] || university.mode) : 'Cursos, ingresso e oportunidades';
        const action = document.createElement('span');
        action.className = 'button button-yellow';
        action.textContent = savedVariant ? 'Ver universidade' : `Explorar ${university.acronym}`;
        link.append(info, description, action);
      } else {
        link.append(info, tags);
      }
      this.append(link);
    }
  }
  if (!customElements.get('td-university-card')) customElements.define('td-university-card', UniversityCard);
})();
