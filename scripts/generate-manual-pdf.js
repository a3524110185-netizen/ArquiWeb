#!/usr/bin/env node
'use strict';

/**
 * Fusiona los 19 Markdown de docs/manual-usuario/ en un único HTML paginado
 * (portada + índice con números de página reales + capítulos) y lo renderiza
 * a PDF con pagedjs-cli (Paged.js sobre Puppeteer), que sí soporta de forma
 * nativa vía CSS estándar: encabezados con el título del capítulo actual
 * (string-set/string()), numeración de página (counter(page)) e índice con
 * páginas reales (target-counter).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { marked } = require('marked');

const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs', 'manual-usuario');
const BUILD_DIR = path.join(DOCS_DIR, '.build');
const FONTS_DIR = path.join(BUILD_DIR, 'fonts');
const HTML_PATH = path.join(BUILD_DIR, 'manual.html');
const OUTPUT_PDF = path.join(DOCS_DIR, 'manual-usuario-sigo-v1.0.pdf');

const FILES = [
  'README.md',
  '00-introduccion.md',
  '01-navegacion-general.md',
  '02-proyectos.md',
  '03-incidencias.md',
  '04-reportes-diarios.md',
  '05-galeria-evidencias.md',
  '06-asistencia.md',
  '07-usuarios.md',
  '08-horarios-y-control-horario.md',
  '09-reporte-horas.md',
  '10-dias-no-laborales.md',
  '11-catalogos.md',
  '12-comercial.md',
  '13-gastos-obra.md',
  '14-dashboard-ejecutivo.md',
  '15-dashboard-superadmin.md',
  'ANEXO-A-capturas-recomendadas.md',
  'ANEXO-B-estado-procesos.md',
];

const TITLE_OVERRIDES = {
  'README.md': 'Acerca de este Manual',
};

const FONT_WEIGHTS = ['400', '500', '600', '700'];

// ---------------------------------------------------------------------------

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function idFor(file) {
  if (file === 'README.md') return 'acerca';
  return 'cap-' + slugify(file.replace(/\.md$/, ''));
}

function injectHeadingIds(html, prefix) {
  const used = new Map();
  return html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (match, level, inner) => {
    const text = inner.replace(/<[^>]+>/g, '');
    let slug = slugify(text) || 'section';
    const count = used.get(slug) || 0;
    used.set(slug, count + 1);
    const id = count === 0 ? `${prefix}-${slug}` : `${prefix}-${slug}-${count}`;
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
}

function processFile(file, chapterIdByFile) {
  let raw = fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');

  // Quitar la línea "[← Volver al índice](README.md)" (y la línea en blanco siguiente)
  raw = raw.replace(/^\[← Volver al índice\]\(README\.md\)\n+/, '');

  // README: quitar la tabla "Índice de contenidos" (se sustituye por el índice paginado real)
  if (file === 'README.md') {
    raw = raw.replace(/## Índice de contenidos[\s\S]*?(?=\n## )/, '');
  }

  if (TITLE_OVERRIDES[file]) {
    raw = raw.replace(/^#\s+.*$/m, `# ${TITLE_OVERRIDES[file]}`);
  }

  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : file;

  // Reescribir enlaces cruzados [texto](NN-archivo.md#ancla) / [texto](NN-archivo.md)
  // a anclas internas del documento fusionado.
  raw = raw.replace(/\]\(([0-9A-Za-z_-]+\.md)(#[0-9A-Za-z_-]+)?\)/g, (m, f, anchor) => {
    const cid = chapterIdByFile[f];
    if (!cid) return m;
    return anchor ? `](#${cid}-${anchor.slice(1)})` : `](#${cid})`;
  });

  const id = chapterIdByFile[file];
  let html = marked.parse(raw);
  html = injectHeadingIds(html, id);

  return { id, title, html };
}

function buildCover() {
  const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long' });
  const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  return `<section id="cover" class="cover-page">
    <p class="cover-kicker">SIGO</p>
    <h1 class="cover-title">MANUAL DE USUARIO</h1>
    <p class="cover-subtitle">Sistema Integral de Gestión de Obras</p>
    <div class="cover-meta">
      <p>Versión 1.0</p>
      <p>${fechaCap}</p>
    </div>
  </section>`;
}

function buildToc(chapters) {
  const items = chapters
    .map((c) => `<li class="toc-entry"><a href="#${c.id}"><span class="toc-title">${c.title}</span></a></li>`)
    .join('\n      ');
  return `<nav id="toc" class="toc-page">
    <h2>Índice</h2>
    <ol>
      ${items}
    </ol>
  </nav>`;
}

function copyFonts() {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
  const srcBase = path.join(ROOT, 'node_modules', '@fontsource', 'inter', 'files');
  const copied = [];
  FONT_WEIGHTS.forEach((w) => {
    const filename = `inter-latin-${w}-normal.woff2`;
    const src = path.join(srcBase, filename);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(FONTS_DIR, filename));
      copied.push(w);
    }
  });
  return copied;
}

function fontFaceCss(weights) {
  return weights
    .map(
      (w) => `@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: ${w};
  src: url('fonts/inter-latin-${w}-normal.woff2') format('woff2');
}`
    )
    .join('\n');
}

const CSS_TEMPLATE = (fontFaces) => `
${fontFaces}

:root {
  --color-h1: #1A237E;
  --color-h2: #FF6D00;
  --color-text: #212121;
  --color-muted: #5f6368;
  --color-border: #E0E0E0;
  --color-bg-alt: #F5F5F7;
  --color-note-bg: #FFF3E0;
  --color-note-border: #FF6D00;
}

@page {
  size: A4;
  margin: 2.5cm;
  @bottom-center {
    content: "Página " counter(page) " de " counter(pages);
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: #5f6368;
  }
  @top-center {
    content: string(chapter);
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: #5f6368;
    border-bottom: 0.5pt solid #E0E0E0;
    padding-bottom: 4pt;
  }
}

@page cover {
  margin: 0;
  @top-center { content: none; }
  @bottom-center { content: none; }
}

@page toc {
  @top-center { content: "Índice"; }
}

* { box-sizing: border-box; }

html, body {
  font-family: 'Inter', sans-serif;
  color: var(--color-text);
  font-size: 10.5pt;
  line-height: 1.55;
}

h1 { color: var(--color-h1); font-size: 20pt; font-weight: 700; margin: 0 0 12pt; }
h2 { color: var(--color-h2); font-size: 14pt; font-weight: 600; margin: 20pt 0 8pt; border-bottom: 1pt solid var(--color-border); padding-bottom: 4pt; }
h3 { color: var(--color-h1); font-size: 11.5pt; font-weight: 600; margin: 14pt 0 6pt; }
p, li { margin: 0 0 8pt; }

.chapter { break-before: page; page-break-before: always; }
.chapter > h1:first-of-type { string-set: chapter content(text); }

hr { border: none; border-top: 1pt solid var(--color-border); margin: 18pt 0; }

table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 9.3pt; break-inside: avoid; }
th, td { border: 1pt solid var(--color-border); padding: 5pt 7pt; text-align: left; vertical-align: top; }
th { background: var(--color-bg-alt); font-weight: 600; }

blockquote {
  margin: 10pt 0;
  padding: 8pt 12pt;
  background: var(--color-note-bg);
  border-left: 3pt solid var(--color-note-border);
  border-radius: 2pt;
  break-inside: avoid;
}
blockquote p { margin: 0; }

code { background: var(--color-bg-alt); padding: 1pt 4pt; border-radius: 2pt; font-size: 90%; }
pre { background: var(--color-bg-alt); padding: 8pt; border-radius: 3pt; overflow-x: auto; break-inside: avoid; }
pre code { background: none; padding: 0; }

a { color: var(--color-h1); text-decoration: none; }

/* Portada */
.cover-page {
  page: cover;
  break-after: page;
  page-break-after: always;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--color-h1);
  color: #ffffff;
}
.cover-kicker { letter-spacing: 5pt; font-size: 12pt; opacity: 0.75; margin-bottom: 40pt; }
.cover-title { color: #ffffff; font-size: 30pt; letter-spacing: 1.5pt; margin-bottom: 10pt; }
.cover-subtitle { font-size: 13pt; opacity: 0.9; margin-bottom: 70pt; }
.cover-meta p { font-size: 11pt; opacity: 0.85; margin: 2pt 0; }

/* Índice */
.toc-page { page: toc; }
.toc-page h2 { color: var(--color-h1); border: none; font-size: 18pt; margin-bottom: 18pt; }
.toc-page ol { list-style: none; padding: 0; margin: 0; }
.toc-entry { margin: 0; }
.toc-entry a {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 1pt dotted var(--color-border);
  padding: 5pt 0;
}
.toc-entry a::after {
  content: target-counter(attr(href), page);
  color: var(--color-muted);
  font-size: 9.5pt;
  margin-left: 8pt;
}
`;

function main() {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  const copiedWeights = copyFonts();
  if (copiedWeights.length === 0) {
    console.warn('Aviso: no se encontraron los archivos woff2 de @fontsource/inter; se usará una fuente sans-serif del sistema.');
  }

  const chapterIdByFile = {};
  FILES.forEach((f) => {
    chapterIdByFile[f] = idFor(f);
  });

  const chapters = FILES.map((f) => processFile(f, chapterIdByFile));

  const bodyHtml = chapters
    .map((c) => `<section class="chapter" id="${c.id}">\n${c.html}\n</section>`)
    .join('\n');

  const css = CSS_TEMPLATE(fontFaceCss(copiedWeights));

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Manual de Usuario SIGO</title>
<style>${css}</style>
</head>
<body>
${buildCover()}
${buildToc(chapters)}
${bodyHtml}
</body>
</html>`;

  fs.writeFileSync(HTML_PATH, html, 'utf8');
  console.log('HTML fusionado escrito en', HTML_PATH);

  const binName = process.platform === 'win32' ? 'pagedjs-cli.cmd' : 'pagedjs-cli';
  const bin = path.join(ROOT, 'node_modules', '.bin', binName);
  if (!fs.existsSync(bin)) {
    throw new Error(`No se encontró el binario de pagedjs-cli en ${bin}. Ejecuta "npm install" primero.`);
  }

  fs.mkdirSync(path.dirname(OUTPUT_PDF), { recursive: true });
  execFileSync(
    bin,
    [HTML_PATH, '-o', OUTPUT_PDF, '--outline-tags', 'h1,h2', '-t', '180000'],
    { stdio: 'inherit', shell: true }
  );
  console.log('PDF generado en', OUTPUT_PDF);
}

main();
