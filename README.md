# CCGlobal — Documentación del sitio

## Resumen de especificaciones técnicas

- __Stack__: HTML5 estático + CSS3 + JavaScript (vanilla, sin frameworks).
- __Estructura__: páginas en raíz (`index.html`, `servicios.html`, `contacto.html`, `aviso.html`, `cv.html`).
- __Recursos__: imágenes en `img/` y `img2/`; estilos en `style.css`; lógica en `script.js`.
- __Accesibilidad (a11y)__:
  - Modo de alto contraste por clase en `html` (`a11y-contrast`).
  - Preferencia de subrayado de enlaces (`a11y-underline-links`).
  - Tamaños táctiles mínimos (44x44), focus visible, skip-link.
  - Panel/flotante de accesibilidad (`.a11y-button`, `.a11y-panel`).
- __Navegación__:
  - Menú responsive con botón `.menu-toggle` y estado `#site-nav.is-open`.
  - Marcado del enlace activo mediante `aria-current="page"` (calculado en `script.js`).
- __Interacciones/UX__ (`script.js`):
  - Pantalla de bienvenida/splash (`.splash`) con supresión de doble transición entre páginas.
  - `servicios.html`: categorización, badges, miniaturas, filtro por hash, scroll y resaltado.
  - `cv.html`: secciones colapsables con persistencia en `localStorage`, índice lateral y botón "volver arriba".
  - Función de Text-to-Speech (TTS) para texto seleccionado con selección de voz y traducción opcional (LibreTranslate configurable).
- __Estilos__ (`style.css`):
  - Diseño responsive, grid de tarjetas, listas con íconos, formularios con estados de validación y focus.
  - Tokens de diseño (`:root`) para colores, radios y sombras.
  - Rail de TOC derecho, botón flotante de back-to-top, figuras con `figcaption`.
- __Compatibilidad__: orientado a navegadores modernos; degradación elegante si no hay `speechSynthesis`/`IntersectionObserver`.

## SEO

- __robots.txt__: permite rastreo completo y referencia al sitemap.
  ```
  User-agent: *
  Allow: /
  Sitemap: http://ccglobal.mx/sitemap.xml
  ```
- __sitemap.xml__: generado con URLs absolutas (http). Incluye:
  - `http://ccglobal.mx/`
  - `http://ccglobal.mx/servicios.html`
  - `http://ccglobal.mx/contacto.html`
  - `http://ccglobal.mx/aviso.html`
  - `http://ccglobal.mx/cv.html`
- __Canónicos__: todas las páginas incluyen `<link rel="canonical">` con URLs absolutas `http://ccglobal.mx/...`.
- __Metadatos__: títulos y descripciones por página; Open Graph y Twitter Card configurados.
- __Datos estructurados (JSON-LD)__:
  - `index.html`: `Organization` (pendiente completar `sameAs`).
  - `servicios.html`: `WebPage` + `ItemList` de `Service` con anclas a secciones.
  - `contacto.html`: `ContactPage` con `contactPoint`.
  - `cv.html`: `AboutPage` referenciando a la organización.

## Resumen del contenido del sitio

- __Home (`index.html`)__: presentación general, grid de categorías con tarjetas y badges.
- __Servicios (`servicios.html`)__: listado de soluciones (RPA, Documentos, Digitalización, Atención, Finanzas) con miniaturas y filtros.
- __Contacto (`contacto.html`)__: formulario con validación visual, consentimiento y CTA.
- __Aviso (`aviso.html`)__: aviso de privacidad conforme a LFPDPPP.
- __CV (`cv.html`)__: perfil corporativo con secciones colapsables, índice, navegación contextual y experiencia/competencias.

## Archivos y rutas

- __Estilos__: `style.css`
- __Script__: `script.js`
- __Imágenes__: `img/`, `img2/`
- __Assets de marca__: `ccglogo.png`, `logoccg.png`
- __SEO__: `robots.txt`, `sitemap.xml`

## E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

- __Qué es__: criterios de calidad de Google que evalúan experiencia, pericia, autoridad y confiabilidad. No es una etiqueta técnica; se demuestra con señales en el sitio y en la web.
- __Cómo lo aplicamos aquí__:
  - __Experiencia__: `servicios.html` y `cv.html` describen soluciones reales; se pueden añadir casos de éxito y métricas.
  - __Pericia__: `cv.html` funciona como About/Equipo; se puede añadir bio/autores en contenidos.
  - __Autoridad__: `Organization` en `index.html` (agregar `sameAs` a perfiles oficiales). Posible sección de clientes/testimonios.
  - __Confiabilidad__: `aviso.html`, datos de contacto visibles, canonicals consistentes y sitemap publicado. Recomendado HTTPS.



## Últimos cambios (2025-08-25)

- __robots.txt__: cambiado a `Allow: /` y `Sitemap: http://ccglobal.mx/sitemap.xml`.
- __sitemap.xml__: generado con URLs absolutas (http) para todas las páginas.
- __Metas y canónicos__: añadidos/normalizados en `index.html`, `servicios.html`, `contacto.html`, `aviso.html`, `cv.html`.
- __Estructurado__:
  - `servicios.html`: `ItemList` con 5 servicios principales.
  - `cv.html`: `AboutPage` con referencia a `Organization`.
- __Decisiones de indexación__: todas las páginas con `index,follow` (incluido `cv.html`).

## Recomendaciones y siguientes pasos

- __HTTPS__: migrar canonicals y sitemap a `https://ccglobal.mx/` si el certificado está activo.
- __`sameAs`__: agregar perfiles oficiales (LinkedIn, X/Twitter, YouTube, etc.) en `Organization` de `index.html`.
- __Testimonios/Clientes__: agregar 2–3 testimonios verificables y, si aplica, logotipos con permiso.
- __Sitemap `lastmod`__: añadir `lastmod` por URL para mejorar recrawl.
- __Alt de imágenes__: revisar `alt` descriptivos en imágenes clave.
