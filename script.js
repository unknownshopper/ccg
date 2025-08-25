(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const path = location.pathname.split('/').pop() || 'index.html';

    // Mark active nav link
    (function markActiveNav() {
      const nav = document.getElementById('site-nav');
      if (!nav) return;
      const links = Array.from(nav.querySelectorAll('a[href]'));
      links.forEach((a) => {
        const href = (a.getAttribute('href') || '').split('/').pop();
        if (href === path) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    })();

    // Splash screen overlay: show 3s on load and on in-site page navigation (sin doble transición)
    (function splashOverlay() {
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const DURATION = reduceMotion ? 0 : 2500;
      let splash, timer;

      function ensureSplash() {
        if (splash) return splash;
        splash = document.createElement('div');
        splash.className = 'splash hidden';
        splash.innerHTML = '<div class="splash__logo"><img src="ccglogo.png" alt="CCGLOBAL"></div>';
        document.body.appendChild(splash);
        return splash;
      }

      function showSplash(duration = DURATION, thenCb) {
        ensureSplash();
        splash.classList.remove('hidden');
        clearTimeout(timer);
        timer = setTimeout(() => {
          hideSplash();
          if (typeof thenCb === 'function') thenCb();
        }, Math.max(0, duration));
      }

      function hideSplash() {
        if (!splash) return;
        splash.classList.add('hidden');
      }

      // Initial page load splash (skip if we just navigated with pre-navigation splash)
      // Usamos sessionStorage para evitar doble splash: uno antes de navegar y otro al cargar
      window.requestAnimationFrame(() => {
        const suppressOnce = sessionStorage.getItem('suppressSplashOnce') === '1';
        if (suppressOnce) {
          sessionStorage.removeItem('suppressSplashOnce');
          // No mostrar splash al cargar esta página
          return;
        }
        showSplash();
      });

      // Intercept in-site navigations to other .html pages
      document.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        if (a.hasAttribute('download') || a.target === '_blank') return; // let these pass
        const url = new URL(a.getAttribute('href'), location.href);
        const isSameOrigin = url.origin === location.origin;
        const isDifferentPage = url.pathname !== location.pathname;
        const isHtmlPage = /\.html?$/.test(url.pathname);
        if (isSameOrigin && isDifferentPage && isHtmlPage) {
          e.preventDefault();
          // Marcar para que la página destino NO muestre el splash al cargar (evita doble transición)
          try { sessionStorage.setItem('suppressSplashOnce', '1'); } catch (_) {}
          showSplash(DURATION, () => { window.location.href = url.href; });
        }
      });

      // Expose for potential debugging
      window.__splash = { show: showSplash, hide: hideSplash };
    })();

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

    // Index: mantener badges sin redirección automática en la primera card
    if (path === 'index.html' || path === '') {
      addBadgesToCards();
      normalizeBadges();
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

      // Map service titles (via regex) to image paths in img/
      const imageRules = [
        { re: /gestor\s+para\s+áreas?\s+de\s+ventas/i, src: 'img/rpa_gestor-para-areas-de-ventas.jpg' },
        { re: /gestor\s+para\s+servicio\s+al\s+cliente/i, src: 'img/rpa-gestor-para-servicio-al-cliente.jpg' },
        { re: /descarga\s+autom[aá]tica\s+de\s+informaci[oó]n\s+de\s+sitios\s+web/i, src: 'img/rpa-descarga-automatica-de-informacion-de-sitios-web.jpg' },
        { re: /reclutamiento\s+automatizado\s+de\s+recursos\s+humanos/i, src: 'img/rpa-reclutamiento-de-recursos-humanos.jpg' },
        { re: /pago\s+autom[aá]tico\s+de\s+n[oó]minas/i, src: 'img/rpa-pago-automatico-de-nominas.jpg' },
        { re: /asignaci[oó]n\s+de\s+turnos\s+laborales/i, src: 'img/rpa-asignacion-de-turnos-laborales.jpg' },
        { re: /emisi[oó]n\s+de\s+certificados\s+laborales/i, src: 'img/rpa-emision-de-certificados-laborales.jpg' },
        { re: /atenci[oó]n\s+autom[aá]tica\s+al\s+asegurado/i, src: 'img/rpa-atencion-automatica-al-asegurado.jpg' },
        { re: /gestor\s+de\s+propiedades/i, src: 'img/rpa-gestor-de-propiedades.jpg' },
        { re: /gestor\s+de\s+paquetes\s+tur[ií]sticos/i, src: 'img/rpa-gestor-de-paquetes-turisticos.jpg' },
        { re: /an[aá]lisis\s+de\s+riesgo\s+financiero/i, src: 'img/rpa-analisis-de-riesgo-financiero.jpg' },
        { re: /monitoreo\s+de\s+sistemas\s+para\s+prevenci[oó]n\s+de\s+fraudes/i, src: 'img/rpa-monitoreo-de-sistemas-para-prevencion-de-fraudes.jpg' },
        { re: /automatizaci[oó]n\s+de\s+registro\s+contable/i, src: 'img/rpa-automatizacion-de-registro-contable.jpg' },
        { re: /venta\s+sin\s+papel(?:es)?/i, src: 'img/solucin-venta-sin-papel.jpg' },
        { re: /carga\s+masiva\s+de\s+facturas/i, src: 'img/rpa-carga-masiva-de-facturas.jpg' },
        { re: /gesti[oó]n\s+de\s+contratos\s+electr[oó]nicos/i, src: 'img/solucin-gestin-de-contratos-electrnicos.jpg' },
        { re: /contabilizaci[oó]n\s+autom[aá]tica\s+de\s+facturas/i, src: 'img/rpa-contabilizacion-automatica-de-facturas.jpg' },
        { re: /descarga\s+de\s+saldos\s+de\s+sucursales/i, src: 'img/rpa-descarga-de-saldos-de-sucursales.jpg' },
        { re: /descarga\s+de\s+indicadores\s+financieros/i, src: 'img/rpa-descarga-de-indicadores-financieros.jpg' },
        { re: /conciliaciones\s+bancarias/i, src: 'img/rpa-conciliaciones-bancarias.jpg' },
        { re: /pago\s+de\s+n[oó]mina\s+de\s+proveedores/i, src: 'img/rpa-pago-de-nomina-de-proveedores.jpg' },
        { re: /normalizaci[oó]n\s+informaci[oó]n\s+de\s+proveedores/i, src: 'img/rpa-normalizacion-informacion-de-proveedores.jpg' },
        { re: /carpeta\s+electr[oó]nica\s+del\s+alumno/i, src: 'img/certificacion-matriculas.jpg' },
        { re: /biblioteca\s+digital/i, src: 'img/libro-digital.jpg' },
        { re: /gestor\s+de\s+p[oó]lizas\s+de\s+seguros/i, src: 'img/rpa-gestor-de-polizas-de-seguros.jpg' },
        { re: /plataforma\s+de\s+atenci[oó]n\s+ciudadana/i, src: 'img/plataforma-de-atencin-ciudadana.jpg' },
        { re: /cupones\s+de\s+pago|cupones\s+de\s+descuentos?/i, src: 'img/procesamiento-de-cupones.jpg' },
        { re: /mesa\s+de\s+cobranza/i, src: 'img/mesa-de-cobranza.jpg' },
        { re: /procesos\s+de\s+afiliaci[oó]n\s+electr[oó]nica/i, src: 'img/procesos-afiliaciones.jpg' },
        { re: /oficina\s+de\s+partes/i, src: 'img/oficina-de-partes.jpg' },
        { re: /documento\s+electr[oó]nico\s+con\s+firma\s+digital/i, src: 'img/documento-electrnico-con-firma-digital.jpg' },
        { re: /archivos\s+hist[oó]ricos\s+y\s+patrimoniales/i, src: 'img/digitalizacion-de-archivos-historicos-y-patrimoniales.jpg' },
        { re: /carpeta\s+electr[oó]nica\s+del\s+colaborador/i, src: 'img/carpeta-rrhh.jpg' },
        { re: /gesti[oó]n\s+[áa]rea\s+fiscal[ií]a/i, src: 'img/gestion-fiscalias.jpg' },
        { re: /firma\s+electr[oó]nica\s+masiva\s+de\s+documentos/i, src: 'img/solucin-firma-masiva-de-documentos.jpg' },
        { re: /mesa\s+de\s+ayuda/i, src: 'img/mesa-de-ayuda.jpg' },
        { re: /procesos\s+electr[oó]nicos\s+certificados\s*\(pec\)/i, src: 'img/procesos-electrnicos-certificados-pecv2.png' },
        { re: /gesti[oó]n\s+de\s+reclamos/i, src: 'img/gestion-reclamos.jpg' },
        { re: /aprobaci[oó]n\s+de\s+facturas/i, src: 'img/aprobacion-facturas.jpg' },
        { re: /gesti[oó]n\s+[áa]reas\s+de\s+servicio/i, src: 'img/gestion-areas-servicios.jpg' },
      ];

      const findImage = (text) => {
        for (const rule of imageRules) {
          if (rule.re.test(text)) return rule.src;
        }
        // Fallbacks by category (optional)
        const cat = detectCategory(text);
        if (!cat) return 'img/shutterstock_316679408-1-e1480607573580.jpg';
        if (cat.key === 'rpa') return 'img/rpa-1.png';
        if (cat.key === 'digitalizacion') return 'img/digitalizacion.png';
        if (cat.key === 'documentos') return 'img/documento-electronico.png';
        if (cat.key === 'atencion') return 'img/plataforma-de-atencin-ciudadana.jpg';
        if (cat.key === 'finanzas') return 'img/rpa-conciliaciones-bancarias.jpg';
        return 'img/shutterstock_316679408-1-e1480607573580.jpg';
      };

      // Enhance list items: title, description, badge, data-category, thumbnail
      if (servicesList) {
        const items = Array.from(servicesList.querySelectorAll('li'));
        items.forEach((li) => {
          const raw = li.textContent.trim();
          if (!raw) return;
          const lines = raw.split(/\n+/).map((s) => s.trim()).filter(Boolean);
          const title = lines.shift() || raw;
          const desc = lines.join(' ');
          const cat = detectCategory(raw);
          const imgSrc = findImage(raw) || findImage(title);

          li.dataset.category = cat ? cat.key : 'otros';

          const titleHtml = `<strong>${title}</strong>`;
          const metaHtml = cat ? `<div class="meta"><span class="tag ${cat.key === 'rpa' ? 'tag--rpa' : ''}">${cat.label}</span></div>` : '';
          const descHtml = desc ? `<p class="muted">${desc}</p>` : '';

          if (imgSrc) {
            const alt = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            li.innerHTML = `
              <figure class="service-figure">
                <img class="service-thumb" src="${imgSrc}" alt="${alt}" loading="lazy" width="96" height="96" onerror="this.onerror=null;this.src='img/shutterstock_316679408-1-e1480607573580.jpg';this.classList.add('thumb-fallback');">
              </figure>
              <div class="service-body">${titleHtml}${descHtml}${metaHtml}</div>
            `;
          } else {
            li.innerHTML = `${titleHtml}${descHtml}${metaHtml}`;
          }
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
        const id = (location.hash || '').replace('#', '');
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
      const validKeys = new Set(['all', 'rpa', 'documentos', 'digitalizacion', 'atencion', 'finanzas']);
      const initial = (location.hash || '').replace('#', '');
      if (validKeys.has(initial)) {
        applyFilter(initial || 'all');
        const initialCard = cards.find((c) => (c.getAttribute('href') || '') === `#${initial}`);
        if (initialCard) initialCard.classList.add('active');
        setTimeout(goToHash, 100);
      }

      // Also react to manual hash changes
      window.addEventListener('hashchange', () => {
        const current = (location.hash || '').replace('#', '');
        if (validKeys.has(current)) {
          applyFilter(current || 'all');
          const currentCard = cards.find((c) => (c.getAttribute('href') || '') === `#${current}`);
          if (currentCard) setActiveCard(currentCard);
        }
        goToHash();
      });
    }

    // CV: Collapsible sections (dropdown per section)
    if (document.body && document.body.classList.contains('page-cv')) {
      const STORAGE_KEY = 'cv_sections_state_v1';
      const loadState = () => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) { return {}; }
      };
      const saveState = (state) => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state || {})); } catch (_) {}
      };
      let state = loadState(); // { [sectionId]: true|false } -> true = expanded
      const hasPersistedAny = !!state && Object.keys(state).length > 0;

      const sections = Array.from(document.querySelectorAll('main .section'));

      // Visual alternation: ignore legacy .section--muted to ensure consistent alternation
      sections.forEach((section) => section.classList.remove('section--muted'));
      sections.forEach((section, i) => {
        // i starts at 0: even = white, odd = gray
        section.classList.toggle('section--alt', (i % 2) === 1);
      });

      sections.forEach((section, idx) => {
        const container = section.querySelector('.hero-content') || section;
        const heading = container.querySelector('h1, h2, h3, h4, h5, h6');
        const secId = section.id || `section-${idx + 1}`;
        if (!section.id) section.id = secId;

        // Initial state: use persisted state; default = ALL OPEN when there's no persisted state
        const persisted = Object.prototype.hasOwnProperty.call(state, secId) ? !!state[secId] : null;
        const expandedInitially = persisted !== null ? persisted : (!hasPersistedAny ? true : (idx === 0));
        section.classList.toggle('is-collapsed', !expandedInitially);

        // Make heading interactive and visually indicate it's clickable
        if (heading) {
          heading.classList.add('collapsible-toggle'); // provides chevron indicator via CSS
          // Accessibility hints
          heading.setAttribute('role', 'button');
          heading.setAttribute('tabindex', '0');
          heading.setAttribute('aria-controls', secId);
          heading.setAttribute('aria-expanded', expandedInitially ? 'true' : 'false');

          const toggle = () => {
            const collapsed = section.classList.toggle('is-collapsed');
            const expanded = !collapsed;
            heading.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            state[secId] = expanded;
            saveState(state);
          };
          // Avoid toggling when user clicks links inside the heading
          heading.addEventListener('click', (e) => {
            const link = e.target && (e.target.closest ? e.target.closest('a[href]') : null);
            if (link) return; // let the link navigate without collapsing
            toggle();
          });
          heading.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
          });
        }
      });

      // If URL hash points to a section, ensure it's expanded and scroll to it
      const openHashTarget = () => {
        const id = (location.hash || '').replace('#', '');
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        target.classList.remove('is-collapsed');
        const h = target.querySelector('.hero-content h1, .hero-content h2, .hero-content h3, .hero-content h4, .hero-content h5, .hero-content h6');
        if (h) h.setAttribute('aria-expanded', 'true');
        state[id] = true; saveState(state);
        const reduce = document.documentElement.classList.contains('a11y-reduce-motion') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      };
      openHashTarget();
      window.addEventListener('hashchange', openHashTarget);

      // Expand/Collapse All actions
      const btnExpandAll = document.getElementById('expand-all');
      const btnCollapseAll = document.getElementById('collapse-all');
      const setAll = (expanded) => {
        sections.forEach((section) => {
          section.classList.toggle('is-collapsed', !expanded);
          const h = section.querySelector('.hero-content h1, .hero-content h2, .hero-content h3, .hero-content h4, .hero-content h5, .hero-content h6');
          if (h) h.setAttribute('aria-expanded', expanded ? 'true' : 'false');
          if (section.id) state[section.id] = expanded;
        });
        saveState(state);
      };
      if (btnExpandAll) btnExpandAll.addEventListener('click', () => setAll(true));
      if (btnCollapseAll) btnCollapseAll.addEventListener('click', () => setAll(false));
      // Delegated safety net in case buttons are re-rendered/moved
      const actions = document.querySelector('.index-actions');
      if (actions) actions.addEventListener('click', (e) => {
        const t = e.target.closest && e.target.closest('button');
        if (!t) return;
        if (t.id === 'expand-all') { e.preventDefault(); setAll(true); }
        if (t.id === 'collapse-all') { e.preventDefault(); setAll(false); }
      });

      // Scrollspy: highlight active section link in index
      const indexLinks = Array.from(document.querySelectorAll('#indice .index-list a'));
      const byId = new Map(indexLinks.map((a) => [a.getAttribute('href').replace('#',''), a]));
      const setActiveLink = (id) => {
        sections.forEach((s) => s.classList.toggle('section--active', s.id === id));
        indexLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
      };
      const ioSupported = 'IntersectionObserver' in window;
      if (ioSupported) {
        const io = new IntersectionObserver((entries) => {
          let best = null;
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            // prefer the one closest to top
            const top = e.target.getBoundingClientRect().top;
            if (!best || Math.abs(top) < Math.abs(best.top)) best = { id: e.target.id, top };
          }
          if (best && byId.has(best.id)) setActiveLink(best.id);
        }, { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5] });
        sections.forEach((s) => io.observe(s));
      } else {
        const onScroll = () => {
          let currentId = null; let bestTop = Number.POSITIVE_INFINITY;
          sections.forEach((section) => {
            const top = section.getBoundingClientRect().top;
            if (top <= window.innerHeight * 0.33 && Math.abs(top) < bestTop) {
              currentId = section.id || currentId; bestTop = Math.abs(top);
            }
          });
          if (!currentId) {
            const visible = sections.find((s) => s.getBoundingClientRect().top >= 0);
            if (visible && visible.id) currentId = visible.id;
          }
          if (currentId && byId.has(currentId)) setActiveLink(currentId);
        };
        document.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
      }

      // Right-side TOC rail (hybrid scrollspy for main sections)
      (function setupTocRail() {
        if (!sections.length) return;
        // Build rail
        const rail = document.createElement('nav');
        rail.className = 'toc-rail';
        rail.setAttribute('aria-label', 'Navegación por secciones');

        const line = document.createElement('div');
        line.className = 'toc-line';
        const progress = document.createElement('div');
        progress.className = 'toc-progress';
        line.appendChild(progress);

        const list = document.createElement('ul');
        list.className = 'toc-dots';

        // Consider only main sections -> use first H2 inside each section for label; fallback to section id
        const mainSections = sections.map((section, idx) => {
          const heading = section.querySelector('.hero-content h2, h2') || section.querySelector('h2');
          const label = (heading && (heading.textContent || '').trim()) || (section.id || `Sección ${idx + 1}`);
          return { section, label };
        });

        const dots = new Map(); // id -> dot element
        mainSections.forEach(({ section, label }) => {
          if (!section.id) section.id = `section-${Math.random().toString(36).slice(2, 7)}`;
          const li = document.createElement('li');
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'toc-dot';
          dot.setAttribute('aria-label', label);
          dot.setAttribute('data-label', label);
          dot.setAttribute('data-target', section.id);
          dot.addEventListener('click', (e) => {
            e.preventDefault();
            // Ensure expanded and scroll into view
            section.classList.remove('is-collapsed');
            const h = section.querySelector('.hero-content h1, .hero-content h2, .hero-content h3, .hero-content h4, .hero-content h5, .hero-content h6');
            if (h) h.setAttribute('aria-expanded', 'true');
            if (history.pushState) { history.pushState(null, '', `#${section.id}`); }
            const reduce = document.documentElement.classList.contains('a11y-reduce-motion') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          });
          li.appendChild(dot);
          list.appendChild(li);
          dots.set(section.id, dot);
        });

        rail.appendChild(line);
        rail.appendChild(list);
        document.body.appendChild(rail);

        // Position dots and update progress
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const recalcPositions = () => {
          const first = mainSections[0].section;
          const last = mainSections[mainSections.length - 1].section;
          const firstTop = first.offsetTop;
          const total = Math.max(1, (last.offsetTop + last.offsetHeight) - firstTop);
          mainSections.forEach(({ section }) => {
            const ratio = clamp((section.offsetTop - firstTop) / total, 0, 1);
            const dot = dots.get(section.id);
            if (dot) dot.style.top = `${ratio * 100}%`;
          });
          updateProgress();
        };

        const setActiveDot = (id) => {
          dots.forEach((el, key) => el.classList.toggle('is-active', key === id));
          // Keep aria-current for SRs
          dots.forEach((el, key) => {
            if (key === id) el.setAttribute('aria-current', 'true');
            else el.removeAttribute('aria-current');
          });
        };

        const updateFromActiveSection = () => {
          const active = document.querySelector('main .section.section--active');
          const id = active ? active.id : (mainSections[0] && mainSections[0].section.id);
          if (id) setActiveDot(id);
        };

        const updateProgress = () => {
          const first = mainSections[0].section;
          const last = mainSections[mainSections.length - 1].section;
          const firstTop = first.offsetTop;
          const total = Math.max(1, (last.offsetTop + last.offsetHeight) - firstTop);
          const probe = window.scrollY + window.innerHeight * 0.33;
          const progressed = clamp((probe - firstTop) / total, 0, 1);
          progress.style.height = `${progressed * 100}%`;
        };

        const onScroll = () => { updateFromActiveSection(); updateProgress(); };
        const onResize = () => { recalcPositions(); updateFromActiveSection(); };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);

        // Initial layout
        recalcPositions();
        updateFromActiveSection();
      })();

      // Floating "Back to top" button
      (function setupBackToTop() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'back-to-top';
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Regresar al inicio');
        btn.setAttribute('title', 'Regresar al inicio');
        btn.textContent = '↑';
        btn.style.display = 'none';
        document.body.appendChild(btn);

        const THRESHOLD = 120;
        const onScroll = () => {
          if (window.scrollY > THRESHOLD) btn.style.display = 'inline-flex';
          else btn.style.display = 'none';
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();

        btn.addEventListener('click', () => {
          const reduce = document.documentElement.classList.contains('a11y-reduce-motion') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
          window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });
      })();
    }

    // ===============================
    // Text-to-Speech for selected text
    // ===============================
    (function setupTTS() {
      const synth = window.speechSynthesis;
      if (!('speechSynthesis' in window)) return; // Graceful degrade

      let voices = [];
      const TTS_PREF_KEY = 'tts_pref_voice';
      const TTS_LANG_KEY = 'tts_lang_pref_v1'; // 'es' | 'en' | 'de' | 'fr'
      const TTS_RATE_KEY = 'tts_rate_v1'; // playback speed multiplier
      const loadPreferredVoiceName = () => {
        try { return localStorage.getItem(TTS_PREF_KEY) || ''; } catch (_) { return ''; }
      };
      const savePreferredVoiceName = (name) => {
        try { localStorage.setItem(TTS_PREF_KEY, name || ''); } catch (_) {}
      };
      const loadPreferredLang = () => {
        try { return localStorage.getItem(TTS_LANG_KEY) || 'es'; } catch (_) { return 'es'; }
      };
      const savePreferredLang = (lang) => {
        try { localStorage.setItem(TTS_LANG_KEY, lang || 'es'); } catch (_) {}
      };
      const loadPreferredRate = () => {
        try {
          const v = parseFloat(localStorage.getItem(TTS_RATE_KEY));
          return (isNaN(v) || v <= 0) ? 1 : Math.min(4, Math.max(0.5, v));
        } catch (_) { return 1; }
      };
      const savePreferredRate = (rate) => { try { localStorage.setItem(TTS_RATE_KEY, String(rate || 1)); } catch (_) {} };

      const refreshVoices = () => {
        voices = synth.getVoices();
      };
      refreshVoices();
      if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = refreshVoices;
      }

      const pickVoiceForLang = (lang) => {
        // Fixed to Spanish voices; ignore stored preference
        const list = synth.getVoices();
        if (!list || !list.length) return null;
        const sameLang = list.filter(v => (v.lang || '').toLowerCase().startsWith('es'));
        const preferEsUS = (v) => /(es[-_]?us)/i.test(v.lang) || /\bUS\b|Estados Unidos|United States/i.test(v.name);
        const brandRank = (n) => (/Google|Microsoft|Apple/i.test(n) ? 0 : 1);
        const sorted = (sameLang.length ? sameLang : list).sort((a,b) => {
          // es-US preferred by name/lang match
          const aUS = preferEsUS(a), bUS = preferEsUS(b);
          if (aUS !== bUS) return aUS ? -1 : 1;
          const br = brandRank(a.name) - brandRank(b.name);
          if (br !== 0) return br;
          return (a.name||'').localeCompare(b.name||'');
        });
        return sorted[0] || null;
      };

      // Basic translation using LibreTranslate-compatible API. You may change endpoint in SETTINGS_TRANSLATE_ENDPOINT.
      const SETTINGS_TRANSLATE_ENDPOINT = 'https://libretranslate.com/translate';
      const translateText = async (text, targetLang /* 'en'|'de'|'fr' */) => {
        const src = 'es';
        if (!text || targetLang === 'es') return text;
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 6000);
          const res = await fetch(SETTINGS_TRANSLATE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: text, source: src, target: targetLang, format: 'text' }),
            signal: ctrl.signal,
          });
          clearTimeout(t);
          if (!res.ok) throw new Error('translate http ' + res.status);
          const data = await res.json();
          return (data && (data.translatedText || data.translation)) || text;
        } catch (_) {
          // Fallback to original Spanish if translation fails
          return text;
        }
      };

      let queue = [];
      let isReading = false;
      let currentIndex = 0;

      // Split long text into natural-length chunks for TTS
      const splitTextIntoChunks = (input, maxLen = 200) => {
        if (!input) return [];
        const text = String(input).replace(/\s+/g, ' ').trim();
        if (!text) return [];
        // Prefer sentence boundaries
        const sentences = text.split(/(?<=[\.!?¡!¿?\u2026])\s+/u);
        const chunks = [];
        let buf = '';
        const pushBuf = () => {
          const t = buf.trim();
          if (t) chunks.push(t);
          buf = '';
        };
        const safeAppend = (s) => {
          if (!s) return;
          if ((buf + ' ' + s).trim().length <= maxLen) {
            buf = (buf ? buf + ' ' : '') + s;
          } else {
            // Try split by comma/semicolon first
            const parts = s.split(/[,;]\s+/);
            if (parts.length > 1) {
              parts.forEach((p, i) => {
                const seg = i < parts.length - 1 ? p + ',' : p;
                safeAppend(seg);
              });
            } else if (s.length > maxLen) {
              // Hard-wrap very long words/segments
              for (let i = 0; i < s.length; i += maxLen) {
                const piece = s.slice(i, i + maxLen);
                if ((buf + ' ' + piece).trim().length > maxLen) pushBuf();
                buf = (buf ? buf + ' ' : '') + piece;
                pushBuf();
              }
            } else {
              pushBuf();
              buf = s;
            }
          }
        };
        sentences.forEach((s) => safeAppend(s));
        pushBuf();
        return chunks;
      };

      const speakChunks = async (text) => {
        // Fixed language: Spanish
        const lang = 'es';
        const toSpeak = await translateText(text, lang);
        queue = splitTextIntoChunks(toSpeak);
        currentIndex = 0;
        isReading = queue.length > 0;
        if (!isReading) return;
        // Ensure we start clean to avoid engine glitches at high rate
        try { synth.cancel(); } catch (_) {}
        const voice = pickVoiceForLang(lang);
        const playNext = () => {
          if (currentIndex >= queue.length) { stop(); return; }
          const utter = new SpeechSynthesisUtterance(queue[currentIndex]);
          if (voice) utter.voice = voice;
          // Set utterance language
          if (voice && voice.lang) utter.lang = voice.lang;
          else utter.lang = (lang || 'es');
          // Map UI selection to engine-safe effective rate
          const getEffectiveRate = () => {
            const ui = loadPreferredRate();
            if (ui >= 3.5) return 1.6;   // "4x" -> ~+60%
            if (ui >= 1.5) return 1.25;  // "2x" -> ~+25%
            return 1.0;                   // "1x"
          };
          const safeRate = getEffectiveRate();
          utter.rate = safeRate;
          utter.pitch = 1.0;
          utter.volume = 1.0;
          utter.onend = () => { currentIndex += 1; playNext(); };
          utter.onerror = () => {
            // Some engines fail at high rates; retry once at a lower, safe rate
            if (!utter._retriedLowerRate && safeRate > 1.2) {
              utter._retriedLowerRate = true;
              const retry = new SpeechSynthesisUtterance(queue[currentIndex]);
              if (voice) retry.voice = voice;
              retry.lang = utter.lang;
              retry.rate = 1.2;
              retry.pitch = 1.0;
              retry.volume = 1.0;
              retry.onend = () => { currentIndex += 1; playNext(); };
              retry.onerror = () => { currentIndex += 1; playNext(); };
              synth.speak(retry);
              return;
            }
            currentIndex += 1; playNext();
          };
          synth.speak(utter);
        };
        playNext();
      };

      const stop = () => {
        try { synth.cancel(); } catch (_) {}
        isReading = false;
        queue = [];
        currentIndex = 0;
        updateButtonLabel();
      };

      // Get selected text; if very short, try reading the full paragraph node
      const getSelectionOrParagraphText = () => {
        const sel = window.getSelection();
        const text = sel ? String(sel.toString()).trim() : '';
        if (text && text.length >= 20) return text;
        if (sel && sel.rangeCount) {
          let node = sel.anchorNode;
          if (node && node.nodeType === 3) node = node.parentNode;
          const block = node && (node.closest('p, li, article, section, main, .service-body, .card, div'));
          if (block) {
            const t = block.textContent.replace(/\s+/g, ' ').trim();
            if (t) return t;
          }
        }
        return text;
      };

      // Floating button
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tts-bubble';
      btn.textContent = 'Escuchar';
      btn.setAttribute('aria-label', 'Escuchar texto seleccionado');
      btn.style.display = 'none';
      document.body.appendChild(btn);

      const updateButtonLabel = () => {
        if (isReading || synth.speaking) {
          btn.textContent = 'Detener';
          btn.setAttribute('aria-label', 'Detener lectura');
        } else {
          btn.textContent = 'Escuchar';
          btn.setAttribute('aria-label', 'Escuchar texto seleccionado');
        }
      };

      const showBtnNearSelection = () => {
        const sel = window.getSelection();
        const text = sel ? String(sel.toString()).trim() : '';
        if ((!text || text.length < 3) && !(isReading || synth.speaking)) { btn.style.display = 'none'; return; }
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const top = window.scrollY + rect.top - 36; // above selection
          const left = window.scrollX + rect.left;
          btn.style.top = `${Math.max(8, top)}px`;
          btn.style.left = `${Math.max(8, left)}px`;
        }
        updateButtonLabel();
        btn.style.display = 'inline-flex';
      };

      const hideBtn = () => {
        if (!(isReading || synth.speaking)) btn.style.display = 'none';
      };

      document.addEventListener('mouseup', () => setTimeout(showBtnNearSelection, 0));
      document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') { hideBtn(); stop(); }
        else setTimeout(showBtnNearSelection, 0);
      });
      document.addEventListener('scroll', () => hideBtn(), { passive: true });
      document.addEventListener('touchend', () => setTimeout(showBtnNearSelection, 0));

      btn.addEventListener('click', () => {
        if (isReading || synth.speaking) {
          stop();
          return;
        }
        const text = getSelectionOrParagraphText();
        if (text) {
          speakChunks(text);
          updateButtonLabel();
          showBtnNearSelection();
        }
      });

      // Keyboard shortcut: Alt+S toggles play/stop of current selection/paragraph
      document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 's' || e.key === 'S')) {
          const prevent = () => { e.preventDefault(); e.stopPropagation(); };
          if (isReading || synth.speaking) {
            prevent();
            stop();
          } else {
            const text = getSelectionOrParagraphText();
            if (text) {
              prevent();
              speakChunks(text);
              updateButtonLabel();
              showBtnNearSelection();
            }
          }
        }
      });

      // Expose minimal controls for potential future UI hooks
      window.ccgTTS = {
        speak: (t) => speakChunks(t),
        stop,
        getVoices: () => (typeof window.speechSynthesis !== 'undefined' ? window.speechSynthesis.getVoices() : []),
        getPreferredVoiceName: () => loadPreferredVoiceName(),
        setPreferredVoice: (name) => savePreferredVoiceName(name),
        getLang: () => loadPreferredLang(),
        setLang: (lang) => savePreferredLang(lang),
        getRate: () => loadPreferredRate(),
        setRate: (r) => savePreferredRate(r)
      };
    })();

    // Accessibility preferences panel (site-wide)
    (function accessibilityPanel() {
      const root = document.documentElement;
      const STORAGE_KEY = 'a11y_prefs_v1';
      const FONT_KEY = 'a11y_font_scale_pct_v1';
      const PREFS = {
        contrast: { className: 'a11y-contrast', label: 'Alto contraste' },
        // reduceMotion: { className: 'a11y-reduce-motion', label: 'Reducir movimiento' },
        // largeText: { className: 'a11y-large-text', label: 'Texto grande' },
        underlineLinks: { className: 'a11y-underline-links', label: 'Subrayar enlaces' },
      };

      // Load prefs
      let state = {};
      try { state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch (_) { state = {}; }
      // Load font scale (percentage). Default 100. If legacy largeText is on and no explicit scale, set 115.
      const loadFontScale = () => {
        let pct = 0;
        try { pct = parseInt(localStorage.getItem(FONT_KEY) || '0', 10); } catch (_) { pct = 0; }
        if (!pct) {
          if (state.largeText) pct = 115; // legacy mapping
          else pct = 100;
        }
        return Math.max(80, Math.min(180, pct));
      };
      const saveFontScale = (pct) => { try { localStorage.setItem(FONT_KEY, String(pct)); } catch (_) {} };

      const applyFontScale = (pct) => {
        // Apply as root font-size percentage for simplicity
        root.style.fontSize = `${pct}%`;
      };

      const apply = () => {
        Object.entries(PREFS).forEach(([key, def]) => {
          const on = !!state[key];
          root.classList.toggle(def.className, on);
        });
        applyFontScale(loadFontScale());
      };

      const save = (newState) => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newState || {})); } catch (_) {}
      };

      // Auto-detect high contrast on first visit (no manual setting yet)
      try {
        const hasManualContrast = Object.prototype.hasOwnProperty.call(state, 'contrast');
        if (!hasManualContrast && window.matchMedia) {
          const prefersMore = (window.matchMedia('(prefers-contrast: more)').matches) || (window.matchMedia('(forced-colors: active)').matches);
          if (prefersMore) { state.contrast = true; save(state); }
        }
      } catch (_) {}

      apply();

      // Build UI
      const btn = document.createElement('button');
      btn.className = 'a11y-button';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Configuración de accesibilidad');
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = `<img src="accsscc.png" alt="" width="28" height="28" loading="lazy">`;

      const panel = document.createElement('div');
      panel.className = 'a11y-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-labelledby', 'a11y-title');
      panel.id = 'a11y-panel';
      btn.setAttribute('aria-controls', 'a11y-panel');
      panel.hidden = true;

      const title = document.createElement('h2');
      title.id = 'a11y-title';
      title.textContent = 'Accesibilidad';

      const desc = document.createElement('p');
      desc.id = 'a11y-desc';
      desc.className = 'visually-hidden';
      desc.textContent = 'Ajusta tamaño de texto, idioma y voz. Pulsa Escape para cerrar.';
      panel.setAttribute('aria-describedby', 'a11y-desc');
      panel.appendChild(desc);

      // Font size control (range)
      const fontRow = document.createElement('div');
      fontRow.className = 'a11y-row';
      const fontLabel = document.createElement('label');
      fontLabel.textContent = 'Tamaño de texto';
      fontLabel.style.display = 'block';
      const fontWrap = document.createElement('div');
      fontWrap.style.display = 'flex';
      fontWrap.style.alignItems = 'center';
      fontWrap.style.gap = '8px';
      const fontRange = document.createElement('input');
      fontRange.type = 'range';
      fontRange.id = 'a11y-font-range';
      fontLabel.setAttribute('for', 'a11y-font-range');
      fontRange.min = '10';
      fontRange.max = '150';
      fontRange.step = '5';
      const currentPct = loadFontScale();
      fontRange.value = String(currentPct);
      const fontOut = document.createElement('output');
      fontOut.setAttribute('aria-live', 'polite');
      fontOut.textContent = `${currentPct}%`;
      fontRange.addEventListener('input', () => {
        const pct = parseInt(fontRange.value, 10) || 100;
        fontOut.textContent = `${pct}%`;
        applyFontScale(pct);
        saveFontScale(pct);
        // When explicit font chosen, turn off legacy largeText toggle if present
        if (state.largeText) { state.largeText = false; save(state); }
      });
      fontWrap.appendChild(fontRange);
      fontWrap.appendChild(fontOut);
      fontRow.appendChild(fontLabel);
      fontRow.appendChild(fontWrap);
      panel.appendChild(fontRow);

      // Voice selector for TTS (filtered by language)
      const voiceRow = document.createElement('div');
      voiceRow.className = 'a11y-row';
      const voiceLabel = document.createElement('label');
      voiceLabel.textContent = 'Voz de lectura';
      voiceLabel.style.display = 'block';
      const voiceSelect = document.createElement('select');
      voiceSelect.setAttribute('aria-label', 'Seleccionar voz de lectura');
      voiceSelect.id = 'a11y-voice';
      voiceLabel.setAttribute('for', 'a11y-voice');
      voiceSelect.style.minWidth = '220px';
      voiceSelect.style.maxWidth = '100%';

      voiceRow.appendChild(voiceLabel);
      voiceRow.appendChild(voiceSelect);
      panel.appendChild(voiceRow);

      // Playback speed selector
      const rateRow = document.createElement('div');
      rateRow.className = 'a11y-row';
      const rateLabel = document.createElement('label');
      rateLabel.textContent = 'Velocidad de lectura';
      rateLabel.style.display = 'block';
      const rateSelect = document.createElement('select');
      rateSelect.setAttribute('aria-label', 'Seleccionar velocidad de lectura');
      rateSelect.id = 'a11y-rate';
      rateLabel.setAttribute('for', 'a11y-rate');
      rateSelect.style.minWidth = '220px';
      rateSelect.style.maxWidth = '100%';
      ;[
        { v: 1, t: '1x (normal)' },
        { v: 2, t: '2x' },
        { v: 4, t: '4x' },
      ].forEach(({ v, t }) => {
        const opt = document.createElement('option');
        opt.value = String(v);
        opt.textContent = t;
        rateSelect.appendChild(opt);
      });
      try { rateSelect.value = String((window.ccgTTS && window.ccgTTS.getRate) ? window.ccgTTS.getRate() : 1); } catch (_) {}
      rateSelect.addEventListener('change', () => {
        const r = parseFloat(rateSelect.value) || 1;
        if (window.ccgTTS && window.ccgTTS.setRate) window.ccgTTS.setRate(r);
      });
      rateRow.appendChild(rateLabel);
      rateRow.appendChild(rateSelect);
      panel.appendChild(rateRow);

      // Populate voice options with Spanish variants, default to Spanish (US)
      (function setupVoiceSelect() {
        // Guard: Web Speech API availability
        if (typeof window.speechSynthesis === 'undefined') {
          voiceSelect.disabled = true;
          const opt = document.createElement('option');
          opt.textContent = 'No disponible en este navegador';
          voiceSelect.appendChild(opt);
          return;
        }
        const synth = window.speechSynthesis;
        const brandRank = (n) => (/Google|Microsoft|Apple/i.test(n) ? 0 : 1);
        const populate = () => {
          const list = synth.getVoices();
          voiceSelect.innerHTML = '';
          const filtered = list.filter((v) => (v.lang || '').toLowerCase().startsWith('es')).sort((a,b) => {
            // es-US preferred by name/lang match
            const aUS = /(es[-_]?us)/i.test(a.lang) || /\bUS\b|Estados Unidos|United States/i.test(a.name);
            const bUS = /(es[-_]?us)/i.test(b.lang) || /\bUS\b|Estados Unidos|United States/i.test(b.name);
            if (aUS !== bUS) return aUS ? -1 : 1;
            const br = brandRank(a.name) - brandRank(b.name);
            if (br !== 0) return br;
            return (a.name||'').localeCompare(b.name||'');
          });
          if (!filtered.length) {
            voiceSelect.disabled = true;
            const opt = document.createElement('option');
            opt.textContent = 'Voces (ES) no disponibles';
            voiceSelect.appendChild(opt);
            return false;
          }
          voiceSelect.disabled = false;
          filtered.forEach((v) => {
            const opt = document.createElement('option');
            opt.value = v.name;
            opt.textContent = `${v.name} (${v.lang || 'es'})`;
            voiceSelect.appendChild(opt);
          });
          // Force fixed voice: first option after sorting (es-US if available)
          if (voiceSelect.options.length) voiceSelect.selectedIndex = 0;
          // Lock the selector
          voiceSelect.disabled = true;
          return true;
        };
        const ok = populate();
        if (!ok) {
          const retry = () => { synth.removeEventListener('voiceschanged', retry); populate(); };
          synth.addEventListener('voiceschanged', retry);
          setTimeout(populate, 300);
          setTimeout(populate, 1200);
        }
        // No change handler: voice fixed
      })();
      // Preferences toggles
      const list = document.createElement('ul');
      list.className = 'a11y-list';

      const makeRow = (key, def) => {
        const li = document.createElement('li');
        li.className = 'a11y-item';
        const id = `a11y-${key}`;
        const label = document.createElement('label');
        label.textContent = def.label;
        label.setAttribute('for', id); // Associate label with input for better accessibility
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.checked = !!state[key];
        input.addEventListener('change', () => {
          state[key] = !!input.checked;
          if (key === 'contrast') state._contrastManual = true; // remember manual override
          save(state);
          apply();
        });
        li.appendChild(input);
        li.appendChild(label);
        return li;
      };

      Object.entries(PREFS).forEach(([key, def]) => list.appendChild(makeRow(key, def)));
      panel.appendChild(list);

      // Add a small reset control to clear manual override for contrast and resync with system
      // Removed per request

      document.body.appendChild(btn);
      document.body.appendChild(panel);

      // Live-sync with system preference while no manual override
      try {
        if (window.matchMedia) {
          const mq1 = window.matchMedia('(prefers-contrast: more)');
          const mq2 = window.matchMedia('(forced-colors: active)');
          const onSysChange = () => {
            if (state._contrastManual) return; // user decided; don't override
            const shouldOn = mq1.matches || mq2.matches;
            if (state.contrast !== shouldOn) {
              state.contrast = shouldOn;
              save(state);
              apply();
              const cb = document.getElementById('a11y-contrast');
              if (cb) cb.checked = !!state.contrast;
            }
          };
          mq1.addEventListener('change', onSysChange);
          mq2.addEventListener('change', onSysChange);
        }
      } catch (_) {}

      const openPanel = () => {
        panel.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        document.addEventListener('keydown', onKey);
        // Move focus to first control
        const first = panel.querySelector('input, select, button');
        if (first) first.focus();
      };
      const closePanel = () => {
        panel.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('keydown', onKey);
        btn.focus();
      };
      const onKey = (e) => { if (e.key === 'Escape') closePanel(); };

      btn.addEventListener('click', () => {
        if (panel.hidden) openPanel(); else closePanel();
      });
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
  });
})();
