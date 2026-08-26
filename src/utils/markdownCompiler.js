import { marked } from 'marked';
import { renderIconSvg } from './iconSvg';
import { getDuoPalette } from './iconCatalog';
import { parseMediaLine, renderMediaHtml } from './mediaEmbed';
import { resolveForPreview, isRemoteSource, hasLocalAsset, placeholderImage } from './localAssets';

// Preset block class mappings
export const PARAGRAPH_PRESETS = [
  { id: 'standard', name: 'Estándar', class: '', icon: 'FileText', desc: 'Texto normal de párrafo' },
  { id: 'info', name: 'Info Callout', class: 'preset-info', icon: 'Info', desc: 'Fondo azul tenue con borde e icono informativo' },
  { id: 'warning', name: 'Advertencia', class: 'preset-warning', icon: 'AlertTriangle', desc: 'Caja ámbar/dorada para avisos importantes' },
  { id: 'success', name: 'Éxito / Hecho', class: 'preset-success', icon: 'CheckCircle2', desc: 'Caja verde destacada para logros o tareas listas' },
  { id: 'card', name: 'Tarjeta Elevada', class: 'preset-card', icon: 'Layers', desc: 'Aspecto moderno de tarjeta con sombra suave' },
  { id: 'quote', name: 'Cita Elegante', class: 'preset-quote', icon: 'FileText', desc: 'Estilo de cita con tipografía serif y línea lateral' },
  { id: 'terminal', name: 'Terminal / Código', class: 'preset-terminal', icon: 'Terminal', desc: 'Fondo oscuro tipo consola de comandos' },
  { id: 'badge', name: 'Insignia Minimalista', class: 'preset-badge', icon: 'Sparkles', desc: 'Estilo píldora/badge destacado' }
];

/**
 * Parses comprehensive icon attributes like {color="#38BDF8" size="28" bg="#1e293b" border="2px solid #38bdf8" radius="50%" shadow="#38bdf8" rotate="45" spin=true pulse=true flipx=true}
 */
export function parseIconAttributes(attrString) {
  const result = {
    color: '',
    size: 18,
    bg: '',
    border: '',
    radius: '',
    padding: '',
    shadow: '',
    opacity: 1,
    rotate: 0,
    flipx: false,
    flipy: false,
    spin: false,
    pulse: false,
    bounce: false,
    float: false,
    filter: '',
    // Duotono: 'auto' (paleta de la categoría) o "#relleno,#trazo"
    duo: '',
    duoOpacity: 0.35,
    strokeWidth: 0
  };

  if (!attrString) return result;

  // Key-value pair extraction regex for attributes with quotes or unquoted values
  const regex = /([a-zA-Z0-9_-]+)=(?:"([^"]*)"|'([^']*)'|([^\s}]+))/g;
  let match;
  while ((match = regex.exec(attrString)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2] || match[3] || match[4] || '';

    if (key === 'color') result.color = val;
    if (key === 'size') result.size = parseInt(val, 10) || 18;
    if (key === 'bg' || key === 'background') result.bg = val;
    if (key === 'border') result.border = val;
    if (key === 'radius') result.radius = val;
    if (key === 'padding') result.padding = val;
    if (key === 'shadow' || key === 'glow') result.shadow = val;
    if (key === 'opacity') result.opacity = parseFloat(val) || 1;
    if (key === 'rotate') result.rotate = parseInt(val, 10) || 0;
    if (key === 'flipx') result.flipx = val === 'true' || val === '1';
    if (key === 'flipy') result.flipy = val === 'true' || val === '1';
    if (key === 'spin') result.spin = val === 'true' || val === '1';
    if (key === 'pulse') result.pulse = val === 'true' || val === '1';
    if (key === 'bounce') result.bounce = val === 'true' || val === '1';
    if (key === 'float') result.float = val === 'true' || val === '1';
    if (key === 'filter') result.filter = val;
    if (key === 'duo') result.duo = val;
    if (key === 'duoopacity') result.duoOpacity = parseFloat(val) || 0.35;
    if (key === 'strokewidth') result.strokeWidth = parseFloat(val) || 0;
  }

  return result;
}

/**
 * Resuelve el atributo `duo` a un par de colores concretos.
 * 'auto' toma la paleta asignada a la categoría del icono.
 */
export function resolveDuoColors(duoValue, iconName) {
  if (!duoValue) return null;
  if (duoValue === 'auto' || duoValue === 'true') {
    const palette = getDuoPalette(iconName);
    return { fill: palette.fill, stroke: palette.stroke };
  }
  const [fill, stroke] = duoValue.split(',').map((part) => part.trim());
  if (!fill) return null;
  return { fill, stroke: stroke || fill };
}

/**
 * Sustituye los atajos de icono `:Nombre:`, saltándose dos tipos de tramo:
 *
 *  1. Código en línea (`...`), para que documentar `:Shield:` no lo convierta.
 *  2. Etiquetas HTML `<...>`, tanto las que escribe el usuario como las que
 *     genera el propio compilador un paso antes (las imágenes).
 *
 * El punto 2 no es teórico: un enlace temporal de sesión es
 * `blob:http://localhost:5173/…` y contiene `:http:`, que encaja exactamente
 * con el patrón de un atajo de icono. Sin esta protección se insertaba un SVG
 * en mitad del atributo `src`, la etiqueta dejaba de ser válida y la imagen
 * aparecía como texto en la vista previa.
 */
function replaceIconShortcodes(text) {
  const segments = text.split(/(`+[^`]*`+|<\/?[a-zA-Z][^>]*>)/g);
  return segments
    .map((segment, index) => {
      // Los índices impares son los tramos capturados -> intactos
      if (index % 2 === 1) return segment;
      return segment.replace(/:([a-zA-Z0-9_-]+)(?:\{([^}]+)\})?:/g, (match, iconName, attrStr) => {
        if (iconName.startsWith('preset-')) return match;
        try {
          const attrs = parseIconAttributes(attrStr);
          const styleParts = [];

          if (attrs.color) styleParts.push(`color: ${attrs.color};`);
          if (attrs.bg) styleParts.push(`background: ${attrs.bg};`);
          if (attrs.padding) styleParts.push(`padding: ${attrs.padding};`);
          if (attrs.border) styleParts.push(`border: ${attrs.border};`);
          if (attrs.radius) styleParts.push(`border-radius: ${attrs.radius};`);
          if (attrs.shadow) styleParts.push(`filter: drop-shadow(0 0 10px ${attrs.shadow});`);
          if (attrs.opacity !== 1) styleParts.push(`opacity: ${attrs.opacity};`);

          const transforms = [];
          if (attrs.rotate) transforms.push(`rotate(${attrs.rotate}deg)`);
          if (attrs.flipx) transforms.push(`scaleX(-1)`);
          if (attrs.flipy) transforms.push(`scaleY(-1)`);
          if (transforms.length > 0) styleParts.push(`transform: ${transforms.join(' ')};`);

          if (attrs.filter) styleParts.push(`filter: ${attrs.filter};`);

          const classList = ['inline-icon', 'interactive-icon'];
          if (attrs.spin) classList.push('icon-spin');
          if (attrs.pulse) classList.push('icon-pulse');
          if (attrs.bounce) classList.push('icon-bounce');
          if (attrs.float) classList.push('icon-float');

          // Duotono: el relleno viene de `duo`, el trazo de `color` si se indicó
          const duo = resolveDuoColors(attrs.duo, iconName);
          if (duo) classList.push('icon-duo');

          const svgMarkup = renderIconSvg(iconName, {
            size: attrs.size,
            className: classList.join(' '),
            color: attrs.color || duo?.stroke || undefined,
            fill: duo?.fill,
            fillOpacity: attrs.duoOpacity,
            strokeWidth: attrs.strokeWidth || undefined
          });

          return `<span class="icon-wrapper" data-shortcode="${encodeURIComponent(match)}" data-icon-name="${iconName}" data-attr="${encodeURIComponent(attrStr || '')}" style="${styleParts.join(' ')} cursor: pointer;" title="Haz clic para editar el estilo del icono">${svgMarkup}</span>`;
        } catch (err) {
          return match;
        }
      });
    })
    .join('');
}

/**
 * Preprocesses raw markdown text to handle custom syntax before marked parses it
 */
export function preprocessMarkdown(markdown) {
  if (!markdown) return '';

  let processed = markdown;

  // 1. Process custom Image Text Wrapping syntax: ![alt](url){wrap=left width=180px}
  processed = processed.replace(
    /!\[([^\]]*)\]\(([^)]+)\)\{([^}]+)\}/g,
    (match, alt, src, attrStr) => {
      const attrs = parseAttrString(attrStr);
      const wrapClass = attrs.wrap ? `img-wrap img-wrap-${attrs.wrap}` : 'img-wrap img-wrap-left';
      const widthStyle = attrs.width ? `width: ${attrs.width};` : 'width: 220px;';
      const alignStyle = attrs.wrap === 'center' ? 'display: block; margin: 1rem auto;' : '';

      // Tres casos:
      //   remota            -> se usa la URL tal cual
      //   local y cargada   -> enlace temporal de sesión
      //   local sin cargar  -> marcador con el nombre del archivo
      //
      // En los tres el elemento sigue siendo un <img>, de modo que la selección,
      // el marco azul y los manejadores de redimensión funcionan igual.
      const esRemota = isRemoteSource(src);
      const disponible = esRemota || hasLocalAsset(src);

      const displaySrc = disponible ? resolveForPreview(src) : placeholderImage(src);
      const clases = [wrapClass];
      if (!esRemota) clases.push('img-local');
      if (!disponible) clases.push('img-placeholder');

      return `<img src="${displaySrc}" alt="${alt}" class="${clases.join(' ')}" style="${widthStyle} ${alignStyle}" data-wrap="${attrs.wrap || 'left'}" data-width="${attrs.width || '220px'}" data-src-original="${src}"${disponible ? '' : ' data-missing="1"'} />`;
    }
  );

  // 2. Process Extended Icon Shortcodes: :Shield{color="#38BDF8" size="24" spin=true}: OR :Shield:
  processed = replaceIconShortcodes(processed);

  // 3. Process Block Container syntax: :::preset-id ... :::
  processed = processed.replace(
    /:::\s*(preset-[a-zA-Z0-9_-]+|info|warning|success|card|quote|terminal|badge)\n([\s\S]*?)\n:::/g,
    (match, preset, content) => {
      const cleanPreset = preset.replace('preset-', '');
      return `<div class="preset-block preset-${cleanPreset}">\n\n${content}\n\n</div>`;
    }
  );

  // 4. Process Line-level preset suffix: Paragraph content {.preset-warning}
  const lines = processed.split('\n');
  const resultLines = lines.map(line => {
    const presetMatch = line.match(/^(.*?)\s*\{\s*\.?(preset-[a-zA-Z0-9_-]+)\s*\}$/);
    if (presetMatch) {
      const content = presetMatch[1];
      const presetClass = presetMatch[2];
      return `<div class="preset-block ${presetClass}">${content}</div>`;
    }
    return line;
  });

  return resultLines.join('\n');
}

function parseAttrString(attrStr) {
  const result = {};
  const pairs = attrStr.trim().split(/\s+/);
  pairs.forEach(pair => {
    const [key, val] = pair.split('=');
    if (key && val) {
      result[key.toLowerCase()] = val.replace(/["']/g, '');
    }
  });
  return result;
}

marked.setOptions({
  gfm: true,
  breaks: true
});

/* ------------------------------------------------------------------ *
 * SOURCE MAPPING
 * Every top level object rendered in the WYSIWYG panel carries
 * data-src-start / data-src-end attributes pointing at the exact
 * character range of the Markdown source that produced it.
 * This is what makes keyboard selection, Ctrl+Enter modals and the
 * bidirectional Ctrl+Q synchronisation reliable.
 * ------------------------------------------------------------------ */

const FENCE_OPEN_RE = /^:::[ \t]*(preset-[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+)[ \t]*$/;
const FENCE_CLOSE_RE = /^:::[ \t]*$/;

function computeLineOffsets(text) {
  const offsets = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n') offsets.push(i + 1);
  }
  return offsets;
}

/**
 * Splits the document into ordered segments, keeping the exact source range
 * of each one. ::: fenced blocks are kept whole (they may internally contain
 * several markdown tokens, e.g. a quote line inside a terminal block).
 */
function splitSourceSegments(markdown) {
  const lines = markdown.split('\n');
  const lineOffsets = computeLineOffsets(markdown);
  const segments = [];
  let pendingFrom = 0;

  const endOfLine = (lineIndex) =>
    lineIndex < lines.length ? lineOffsets[lineIndex] : markdown.length;

  const flushText = (fromLine, toLine) => {
    if (toLine <= fromLine) return;
    const start = lineOffsets[fromLine];
    const end = endOfLine(toLine);
    const text = markdown.slice(start, end);
    if (text.trim()) segments.push({ type: 'text', start, end, text });
  };

  let i = 0;
  while (i < lines.length) {
    const open = lines[i].match(FENCE_OPEN_RE);
    if (open) {
      let j = i + 1;
      while (j < lines.length && !FENCE_CLOSE_RE.test(lines[j])) j++;
      if (j < lines.length) {
        flushText(pendingFrom, i);
        segments.push({
          type: 'fence',
          start: lineOffsets[i],
          end: endOfLine(j + 1),
          preset: open[1],
          body: lines.slice(i + 1, j).join('\n')
        });
        i = j + 1;
        pendingFrom = i;
        continue;
      }
    }
    i++;
  }

  flushText(pendingFrom, lines.length);
  return segments;
}

/** Injects the source range attributes into the first (root) tag of an HTML chunk. */
function annotateSourceRange(html, start, end) {
  const trimmed = html.trim();
  if (!trimmed.startsWith('<')) {
    return `<div data-src-start="${start}" data-src-end="${end}">${trimmed}</div>`;
  }
  return trimmed.replace(
    /^<([a-zA-Z][a-zA-Z0-9-]*)/,
    `<$1 data-src-start="${start}" data-src-end="${end}"`
  );
}

export function compileMarkdownToHtml(markdown) {
  if (!markdown) return '';

  const segments = splitSourceSegments(markdown);
  const chunks = [];

  for (const segment of segments) {
    if (segment.type === 'fence') {
      const presetName = segment.preset.replace(/^preset-/, '');
      const inner = marked.parse(preprocessMarkdown(segment.body));
      chunks.push(
        `<div class="preset-block preset-${presetName}" data-src-start="${segment.start}" data-src-end="${segment.end}" data-preset="${presetName}">${inner}</div>`
      );
      continue;
    }

    let offset = segment.start;
    let tokens;
    try {
      tokens = marked.lexer(segment.text);
    } catch (err) {
      tokens = null;
    }

    if (!tokens) {
      chunks.push(annotateSourceRange(marked.parse(preprocessMarkdown(segment.text)), segment.start, segment.end));
      continue;
    }

    for (const token of tokens) {
      const raw = typeof token.raw === 'string' ? token.raw : '';
      const tokenStart = offset;
      const tokenEnd = offset + raw.length;
      offset = tokenEnd;
      if (!raw.trim()) continue;

      // Una línea que solo contiene un enlace a un medio se convierte en
      // reproductor. El Markdown se queda como está: sigue siendo un enlace.
      const media = parseMediaLine(raw);
      if (media) {
        chunks.push(renderMediaHtml(media, { srcStart: tokenStart, srcEnd: tokenEnd }));
        continue;
      }

      const html = marked.parse(preprocessMarkdown(raw));
      if (!html || !html.trim()) continue;
      chunks.push(annotateSourceRange(html, tokenStart, tokenEnd));
    }
  }

  return chunks.join('\n');
}
