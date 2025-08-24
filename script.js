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
                <img class="service-thumb" src="${imgSrc}" alt="${alt}" loading="lazy" width="96" height="96">
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

    // ===============================
    // Text-to-Speech for selected text
    // ===============================
    (function setupTTS() {
      const synth = window.speechSynthesis;
      if (!('speechSynthesis' in window)) return; // Graceful degrade

      let voices = [];
      const refreshVoices = () => {
        voices = synth.getVoices();
      };
      refreshVoices();
      if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = refreshVoices;
      }

      const pickSpanishVoice = () => {
        if (!voices || voices.length === 0) return null;
        const norm = (s) => (s || '').toLowerCase();
        const femaleHints = ['female', 'mujer', 'sabina', 'monica', 'mónica', 'paulina', 'camila', 'sofia', 'sofía', 'luisa', 'isabella'];
        const isFemaleName = (name) => femaleHints.some(h => norm(name).includes(h));
        const isEsMX = (v) => /^(es[-_]?mx)\b/i.test(v.lang) || /méxico|mexico|\bmx\b/.test(norm(v.name));
        const isSpanish = (v) => /^(es[-_])/i.test(v.lang) || /español|spanish\s*\(.*\)/i.test(v.name);

        // 1) es-MX + female
        let best = voices.find(v => isEsMX(v) && isFemaleName(v.name));
        if (best) return best;
        // 2) es-MX (any)
        best = voices.find(v => isEsMX(v));
        if (best) return best;
        // 3) Any Spanish + female
        best = voices.find(v => isSpanish(v) && isFemaleName(v.name));
        if (best) return best;
        // 4) Any Spanish (prefer branded engines)
        best = voices.find(v => isSpanish(v) && /Google|Microsoft|Apple/i.test(v.name));
        if (best) return best;
        // 5) Any Spanish
        best = voices.find(v => isSpanish(v));
        if (best) return best;
        // 6) Fallback to first
        return voices[0] || null;
      };

      // Ensure chunker is defined before used by speakChunks
      const splitTextIntoChunks = (text, maxLen = 180) => {
        const clean = (text || '').replace(/\s+/g, ' ').trim();
        if (!clean) return [];
        if (clean.length <= maxLen) return [clean];
        const chunks = [];
        const sentenceRe = /([\.!?。！？]+)\s+/g;
        let lastIndex = 0;
        let match;
        const sentences = [];
        while ((match = sentenceRe.exec(clean)) !== null) {
          sentences.push(clean.slice(lastIndex, match.index + match[1].length).trim());
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < clean.length) sentences.push(clean.slice(lastIndex).trim());
        const parts = sentences.length ? sentences : [clean];
        let buf = '';
        for (const s of parts) {
          if ((buf + ' ' + s).trim().length <= maxLen) {
            buf = (buf ? buf + ' ' : '') + s;
          } else {
            if (buf) chunks.push(buf);
            if (s.length <= maxLen) chunks.push(s);
            else {
              for (let i = 0; i < s.length; i += maxLen) chunks.push(s.slice(i, i + maxLen));
            }
            buf = '';
          }
        }
        if (buf) chunks.push(buf);
        return chunks.filter(Boolean);
      };

      let queue = [];
      let isReading = false;
      let currentIndex = 0;

      const speakChunks = (text) => {
        queue = splitTextIntoChunks(text);
        currentIndex = 0;
        isReading = queue.length > 0;
        if (!isReading) return;
        const voice = pickSpanishVoice();
        const playNext = () => {
          if (currentIndex >= queue.length) { stop(); return; }
          const utter = new SpeechSynthesisUtterance(queue[currentIndex]);
          if (voice) utter.voice = voice;
          utter.lang = (voice && voice.lang) || 'es-ES';
          utter.rate = 1.0;
          utter.pitch = 1.0;
          utter.onend = () => { currentIndex += 1; playNext(); };
          utter.onerror = () => { currentIndex += 1; playNext(); };
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
      window.ccgTTS = { speak: (t) => speakChunks(t), stop };
    })();

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
  });
})();
