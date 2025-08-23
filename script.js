(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const path = location.pathname.split('/').pop() || 'index.html';

    // Mobile nav toggle
    (function mobileNav() {
      const toggle = document.querySelector('.menu-toggle');
      const nav = document.getElementById('site-nav');
      if (!toggle || !nav) return;
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    })();

    // Ensure all category cards have a badge
    const addBadgesToCards = () => {
      const labelMap = {
        rpa: 'RPA',
        documentos: 'Documentos',
        digitalizacion: 'Digitalización',
        atencion: 'Atención',
        finanzas: 'Finanzas',
      };
      const cards = document.querySelectorAll('.grid.cols-3 .card');
      cards.forEach((card) => {
        const key = (card.getAttribute('href') || '').replace('#', '');
        const label = labelMap[key];
        const title = card.querySelector('.card-title');
        if (!title || !label) return;
        if (!title.querySelector('.badge')) {
          const badge = document.createElement('span');
          // Always start neutral; accent will be applied via CSS on .card.active
          badge.className = 'badge';
          badge.textContent = label;
          title.appendChild(badge);
        }
      });
    };

    // Ensure no badge keeps legacy accent class; active styling is handled via CSS
    const normalizeBadges = () => {
      document.querySelectorAll('.grid.cols-3 .card .badge').forEach((b) => {
        b.classList.remove('badge--accent');
      });
    };

    // Index: ensure first card routes to RPA anchor
    if (path === 'index.html' || path === '') {
      addBadgesToCards();
      normalizeBadges();
      const firstCard = document.querySelector('.grid.cols-3 .card');
      if (firstCard) {
        firstCard.addEventListener('click', function (e) {
          const isLink = e.currentTarget.tagName.toLowerCase() === 'a' || e.target.closest('a');
          if (!isLink) {
            window.location.href = 'servicios.html#rpa';
          }
        });
      }
    }

    // Servicios page enhancements
    if (path === 'servicios.html') {
      addBadgesToCards();
      normalizeBadges();
      const servicesList = document.querySelector('.services');

      // Categorization rules (very simple keyword-based)
      const detectors = [
        { key: 'rpa', label: 'RPA', test: (t) => /(\brpa\b|\(rpa\))/i.test(t) },
        { key: 'documentos', label: 'Documentos', test: (t) => /(documento|firma digital|contrato[s]? electrónico[s]?)/i.test(t) },
        { key: 'digitalizacion', label: 'Digitalización', test: (t) => /(digitalizaci[oó]n|biblioteca|carpeta electr[oó]nica|gesti[oó]n documental)/i.test(t) },
        { key: 'atencion', label: 'Atención', test: (t) => /(atenci[oó]n|ciudadan[a|o]|servicio al cliente|reclamo[s]?|mesa de ayuda)/i.test(t) },
        { key: 'finanzas', label: 'Finanzas', test: (t) => /(factura[s]?|conciliaci[oó]n|indicadore[s]?|pago[s]?|proveedore[s]?|n[oó]mina)/i.test(t) },
      ];

      function detectCategory(text) {
        for (const d of detectors) {
          if (d.test(text)) return d;
        }
        return null;
      }

      // Enhance list items: title, description, badge, data-category
      if (servicesList) {
        const items = Array.from(servicesList.querySelectorAll('li'));
        items.forEach((li) => {
          const raw = li.textContent.trim();
          if (!raw) return;
          const lines = raw.split(/\n+/).map((s) => s.trim()).filter(Boolean);
          const title = lines.shift() || raw;
          const desc = lines.join(' ');
          const cat = detectCategory(raw);

          li.dataset.category = cat ? cat.key : 'otros';

          const titleHtml = `<strong>${title}</strong>`;
          const metaHtml = cat ? `<div class="meta"><span class="tag ${cat.key === 'rpa' ? 'tag--rpa' : ''}">${cat.label}</span></div>` : '';
          const descHtml = desc ? `<p class="muted">${desc}</p>` : '';
          li.innerHTML = `${titleHtml}${descHtml}${metaHtml}`;
        });
      }

      // List filtering helper
      const applyFilter = (key) => {
        if (!servicesList) return;
        const items = Array.from(servicesList.querySelectorAll('li'));
        items.forEach((li) => {
          const match = key === 'all' || li.dataset.category === key;
          li.style.display = match ? '' : 'none';
        });
      };

      // Deep-link hash scrolling and highlight for section headings
      const goToHash = () => {
        const id = decodeURIComponent(location.hash.replace('#', ''));
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const originalBg = el.style.backgroundColor;
        el.style.transition = 'background-color 600ms ease';
        el.style.backgroundColor = 'rgba(255, 122, 0, 0.18)';
        setTimeout(() => { el.style.backgroundColor = originalBg || ''; }, 1200);
      };

      // Category cards drive filtering
      const cards = Array.from(document.querySelectorAll('.grid.cols-3 .card'));
      const setActiveCard = (card) => {
        cards.forEach((c) => c.classList.toggle('active', c === card));
      };
      cards.forEach((card) => {
        card.addEventListener('click', (e) => {
          // Prevent full navigation; use hash + filter + scroll
          e.preventDefault();
          const href = card.getAttribute('href') || '';
          const key = href.replace('#', '').trim();
          if (!key) return;
          // Update hash (triggers highlight and allows deep link)
          if (history.pushState) {
            history.pushState(null, '', `#${key}`);
          } else {
            location.hash = `#${key}`;
          }
          // Apply filtering and active state
          applyFilter(key);
          setActiveCard(card);
          // Scroll/highlight the section
          goToHash();
        });
      });

      // On initial load: if hash is a known category, pre-filter and set card active
      const validKeys = new Set(['rpa', 'documentos', 'digitalizacion', 'atencion', 'finanzas']);
      const initial = (location.hash || '').replace('#', '');
      if (validKeys.has(initial)) {
        applyFilter(initial);
        const initialCard = cards.find((c) => (c.getAttribute('href') || '') === `#${initial}`);
        if (initialCard) initialCard.classList.add('active');
        setTimeout(goToHash, 100);
      }

      // Also react to manual hash changes
      window.addEventListener('hashchange', () => {
        const current = (location.hash || '').replace('#', '');
        if (validKeys.has(current)) {
          applyFilter(current);
          const currentCard = cards.find((c) => (c.getAttribute('href') || '') === `#${current}`);
          if (currentCard) setActiveCard(currentCard);
        }
        goToHash();
      });
    }
  });
})();
