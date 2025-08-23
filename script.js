(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const path = location.pathname.split('/').pop() || 'index.html';

    // Mobile nav toggle
    (function mobileNav() {
      const toggle = document.querySelector('.menu-toggle');
      const nav = document.getElementById('site-nav');
      if (!toggle || !nav) return;
      const firstNavLink = () => nav.querySelector('a');
      const closeNav = () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
        document.removeEventListener('keydown', onKey);
      };
      const openNav = () => {
        nav.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        const first = firstNavLink();
        if (first) first.focus();
        document.addEventListener('keydown', onKey);
      };
      const onKey = (e) => { if (e.key === 'Escape') closeNav(); };
      toggle.addEventListener('click', () => {
        const open = nav.classList.contains('is-open');
        if (open) closeNav(); else openNav();
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
        // Announce results
        const status = document.getElementById('results-status');
        if (status) {
          const visible = items.filter((li) => li.style.display !== 'none').length;
          status.textContent = `Mostrando ${visible} resultado${visible === 1 ? '' : 's'}`;
        }
      };

      // Deep-link hash scrolling and highlight for section headings
      const goToHash = () => {
        const id = decodeURIComponent(location.hash.replace('#', ''));
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;
        const reduce = document.documentElement.classList.contains('a11y-reduce-motion') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        // Subtle highlight only if user didn't request reduced motion
        if (!reduce) {
          const originalBg = el.style.backgroundColor;
          el.style.transition = 'background-color 600ms ease';
          el.style.backgroundColor = 'rgba(255, 122, 0, 0.18)';
          setTimeout(() => { el.style.backgroundColor = originalBg || ''; }, 1200);
        }
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

  // Accessibility preferences panel (site-wide)
  (function accessibilityPanel() {
    const root = document.documentElement;
    const STORAGE_KEY = 'a11y_prefs_v1';
    const PREFS = {
      contrast: { className: 'a11y-contrast', label: 'Alto contraste' },
      reduceMotion: { className: 'a11y-reduce-motion', label: 'Reducir movimiento' },
      largeText: { className: 'a11y-large-text', label: 'Texto grande' },
      underlineLinks: { className: 'a11y-underline-links', label: 'Subrayar enlaces' },
    };

    // Load prefs
    let state = {};
    try { state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) { state = {}; }
    const apply = () => {
      Object.entries(PREFS).forEach(([key, def]) => {
        const on = !!state[key];
        root.classList.toggle(def.className, on);
      });
    };
    apply();

    // Build UI
    const btn = document.createElement('button');
    btn.className = 'a11y-button';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Configuración de accesibilidad');
    btn.innerHTML = `<img src="accsscc.png" alt="" width="28" height="28" loading="lazy">`;

    const panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'a11y-title');
    panel.hidden = true;

    const list = document.createElement('div');
    list.className = 'a11y-options';

    const title = document.createElement('h2');
    title.id = 'a11y-title';
    title.textContent = 'Accesibilidad';
    title.className = 'h2';

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'a11y-close';
    close.setAttribute('aria-label', 'Cerrar');
    close.textContent = 'Cerrar';

    panel.appendChild(title);

    const makeRow = (key, def) => {
      const row = document.createElement('label');
      row.className = 'a11y-row';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!state[key];
      cb.addEventListener('change', () => {
        state[key] = cb.checked;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        apply();
      });
      const span = document.createElement('span');
      span.textContent = def.label;
      row.appendChild(cb);
      row.appendChild(span);
      return row;
    };

    Object.entries(PREFS).forEach(([key, def]) => list.appendChild(makeRow(key, def)));
    panel.appendChild(list);
    panel.appendChild(close);

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    const openPanel = () => {
      panel.hidden = false;
      // focus first checkbox
      const first = panel.querySelector('input[type="checkbox"]');
      if (first) first.focus();
      document.addEventListener('keydown', onKey);
      document.addEventListener('click', onClickOutside, true);
    };
    const closePanel = () => {
      panel.hidden = true;
      btn.focus();
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClickOutside, true);
    };
    const onKey = (e) => { if (e.key === 'Escape') closePanel(); };
    const onClickOutside = (e) => { if (!panel.contains(e.target) && e.target !== btn) closePanel(); };

    btn.addEventListener('click', () => {
      if (panel.hidden) openPanel(); else closePanel();
    });
    close.addEventListener('click', closePanel);
  })();

  // Contact form: accessible validation and announcements
  (function contactFormA11y() {
    if (location.pathname.split('/').pop() !== 'contacto.html') return;
    const form = document.querySelector('form.form-card');
    if (!form) return;
    const status = document.getElementById('form-status');
    const fields = [
      { el: document.getElementById('nombre'),   name: 'Nombre',  type: 'text',    err: document.getElementById('error-nombre') },
      { el: document.getElementById('email'),    name: 'Correo',  type: 'email',   err: document.getElementById('error-email') },
      { el: document.getElementById('mensaje'),  name: 'Mensaje', type: 'text',    err: document.getElementById('error-mensaje') },
    ];
    const consent = document.getElementById('consent');
    const consentErr = document.getElementById('error-consent');

    const setError = (input, msg, errNode) => {
      if (!input) return false;
      input.setAttribute('aria-invalid', 'true');
      if (errNode) errNode.textContent = msg || '';
      return true;
    };
    const clearError = (input, errNode) => {
      if (!input) return;
      input.removeAttribute('aria-invalid');
      if (errNode) errNode.textContent = '';
    };

    const validateEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

    fields.forEach(({ el, err }) => {
      if (!el) return;
      el.addEventListener('input', () => clearError(el, err));
      el.addEventListener('blur', () => {
        if (el.required && !el.value.trim()) setError(el, 'Este campo es requerido.', err);
        if (el.type === 'email' && el.value && !validateEmail(el.value)) setError(el, 'Ingresa un correo válido.', err);
      });
    });
    if (consent) {
      consent.addEventListener('change', () => clearError(consent, consentErr));
    }

    form.addEventListener('submit', (e) => {
      let firstInvalid = null;
      // Validate text/email fields
      fields.forEach(({ el, name, err }) => {
        if (!el) return;
        const v = (el.value || '').trim();
        if (el.required && !v) {
          if (!firstInvalid) firstInvalid = el;
          setError(el, `${name} es requerido.`, err);
        } else if (el.type === 'email' && v && !validateEmail(v)) {
          if (!firstInvalid) firstInvalid = el;
          setError(el, 'Ingresa un correo válido.', err);
        } else {
          clearError(el, err);
        }
      });
      // Validate consent
      if (consent && !consent.checked) {
        if (!firstInvalid) firstInvalid = consent;
        setError(consent, '', consentErr);
        if (consentErr) consentErr.textContent = 'Debes aceptar el Aviso de Privacidad.';
      } else if (consent) {
        clearError(consent, consentErr);
      }

      if (firstInvalid) {
        e.preventDefault();
        firstInvalid.focus();
        if (status) status.textContent = 'Hay errores en el formulario. Revisa los campos marcados.';
      } else {
        if (status) status.textContent = 'Enviando formulario…';
      }
    });
  })();
})();
