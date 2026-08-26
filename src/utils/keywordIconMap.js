import { ICON_CATALOG } from './iconCatalog';

// Dictionary mapping Spanish & English keywords to Lucide icon names
export const KEYWORD_ICON_MAP = [
  // Security & Safety
  { keywords: ['seguridad', 'seguro', 'proteccion', 'security', 'shield', 'protegido', 'password', 'contraseña'], icon: 'Shield', category: 'Seguridad' },
  { keywords: ['llave', 'clave', 'key', 'acceso', 'autenticacion', 'auth'], icon: 'Key', category: 'Seguridad' },
  { keywords: ['candado', 'bloqueado', 'lock', 'privado', 'encriptado'], icon: 'Lock', category: 'Seguridad' },
  
  // Alerts & Notes
  { keywords: ['advertencia', 'warning', 'atencion', 'precaucion', 'alerta', 'cuidado', 'peligro'], icon: 'AlertTriangle', category: 'Alertas' },
  { keywords: ['error', 'fallo', 'bug', 'problema', 'critico', 'danger'], icon: 'AlertCircle', category: 'Alertas' },
  { keywords: ['exito', 'success', 'completado', 'correcto', 'logro', 'ok', 'hecho'], icon: 'CheckCircle2', category: 'Alertas' },
  { keywords: ['informacion', 'info', 'nota', 'nota:', 'detalles', 'tip'], icon: 'Info', category: 'Alertas' },
  { keywords: ['idea', 'tip', 'sugerencia', 'innovacion', 'luz', 'truco'], icon: 'Lightbulb', category: 'Alertas' },
  { keywords: ['fuego', 'hot', 'urgente', 'importante', 'flame', 'tendencia'], icon: 'Flame', category: 'Alertas' },

  // Tech & Data
  { keywords: ['base de datos', 'database', 'sql', 'bd', 'almacenamiento', 'tabla'], icon: 'Database', category: 'Tecnología' },
  { keywords: ['servidor', 'server', 'backend', 'api', 'host', 'nube', 'cloud'], icon: 'Server', category: 'Tecnología' },
  { keywords: ['codigo', 'code', 'desarrollo', 'programacion', 'script', 'función', 'html', 'js', 'css'], icon: 'Code', category: 'Tecnología' },
  { keywords: ['terminal', 'consola', 'bash', 'shell', 'comando', 'cli'], icon: 'Terminal', category: 'Tecnología' },
  { keywords: ['cpu', 'procesador', 'sistema', 'hardware', 'memoria'], icon: 'Cpu', category: 'Tecnología' },
  { keywords: ['red', 'internet', 'globe', 'web', 'conexion', 'link', 'enlace', 'url'], icon: 'Globe', category: 'Tecnología' },
  { keywords: ['rama', 'git', 'version', 'branch', 'repositorio'], icon: 'GitBranch', category: 'Tecnología' },

  // Business & Productivity
  { keywords: ['cohete', 'lanzamiento', 'rocket', 'inicio', 'despegue', 'startup'], icon: 'Rocket', category: 'Negocios' },
  { keywords: ['dinero', 'precio', 'costo', 'presupuesto', 'pagos', 'ventas', 'money', 'dollar', 'finanzas'], icon: 'DollarSign', category: 'Negocios' },
  { keywords: ['meta', 'objetivo', 'target', 'goal', 'hito', 'mision'], icon: 'Target', category: 'Negocios' },
  { keywords: ['usuario', 'user', 'cliente', 'persona', 'perfil', 'cuenta'], icon: 'User', category: 'Usuarios' },
  { keywords: ['usuarios', 'equipo', 'team', 'comunidad', 'grupo', 'users'], icon: 'Users', category: 'Usuarios' },
  { keywords: ['calendario', 'fecha', 'evento', 'schedule', 'tiempo', 'calendar'], icon: 'Calendar', category: 'Tiempo' },
  { keywords: ['reloj', 'hora', 'tiempo', 'duracion', 'cronometro', 'clock'], icon: 'Clock', category: 'Tiempo' },
  { keywords: ['buscar', 'search', 'investigar', 'lupa', 'filtro'], icon: 'Search', category: 'General' },
  { keywords: ['configuracion', 'ajustes', 'settings', 'opciones', 'preferencias'], icon: 'Settings', category: 'General' },
  { keywords: ['estrella', 'favorito', 'destacado', 'star', 'top'], icon: 'Star', category: 'General' },
  { keywords: ['corazon', 'heart', 'like', 'favoritos'], icon: 'Heart', category: 'General' },
  { keywords: ['correo', 'email', 'mail', 'mensaje', 'contacto'], icon: 'Mail', category: 'Comunicación' },
  { keywords: ['telefono', 'llamada', 'phone', 'soporte'], icon: 'Phone', category: 'Comunicación' },
  { keywords: ['archivo', 'documento', 'file', 'texto', 'reporte'], icon: 'FileText', category: 'Documentos' },
  { keywords: ['carpeta', 'folder', 'directorio', 'categoria'], icon: 'Folder', category: 'Documentos' },
  { keywords: ['imagen', 'foto', 'picture', 'grafico', 'image'], icon: 'Image', category: 'Documentos' },
  { keywords: ['paquete', 'package', 'libreria', 'modulo', 'dependencia'], icon: 'Package', category: 'Tecnología' },
  { keywords: ['magia', 'sparkles', 'ia', 'inteligencia', 'auto', 'smart'], icon: 'Sparkles', category: 'General' },
  { keywords: ['capas', 'layers', 'estilos', 'diseño', 'layout'], icon: 'Layers', category: 'Diseño' },
];

/**
 * Searches for a matching Lucide icon based on input text word analysis.
 *
 * 1. Diccionario curado (arriba): coincidencia por subcadena, como siempre.
 * 2. Reserva: catálogo completo (550+ iconos) con coincidencia por palabra
 *    completa, para no disparar falsos positivos con claves cortas.
 */
export function findMatchingIcon(wordOrPhrase) {
  if (!wordOrPhrase) return null;
  const clean = wordOrPhrase.toLowerCase().trim().replace(/[^\w\sáéíóúñ]/g, '');
  if (!clean) return null;

  for (const item of KEYWORD_ICON_MAP) {
    for (const kw of item.keywords) {
      if (clean === kw || clean.includes(kw)) {
        return item.icon;
      }
    }
  }

  const words = new Set(clean.split(/\s+/).filter((w) => w.length >= 4));
  if (words.size === 0) return null;

  for (const item of ICON_CATALOG) {
    for (const kw of item.keywords) {
      if (kw.length >= 4 && words.has(kw)) return item.icon;
    }
  }
  return null;
}

/**
 * Auto-injects icon tags into headings, list items, or keywords in Markdown text
 */
export function autoInjectIconsToText(text) {
  if (!text) return text;

  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    // 1. If line already has an icon tag like :icon(Name): or :Name:, skip
    if (/:[a-zA-Z0-9_-]+:/.test(line)) {
      return line;
    }

    // 2. Check headings (# Heading)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const hashes = headingMatch[1];
      const title = headingMatch[2];
      const matchedIcon = findMatchingIcon(title);
      if (matchedIcon) {
        return `${hashes} :${matchedIcon}: ${title}`;
      }
      return line;
    }

    // 3. Check bullet list items (- item or * item)
    const listMatch = line.match(/^(\s*[-*+]\s+)(.+)$/);
    if (listMatch) {
      const prefix = listMatch[1];
      const content = listMatch[2];
      const matchedIcon = findMatchingIcon(content);
      if (matchedIcon) {
        return `${prefix}:${matchedIcon}: ${content}`;
      }
      return line;
    }

    // 4. Check paragraph lines starting with keywords like "Nota:", "Advertencia:", "Error:", "Seguridad:"
    const prefixMatch = line.match(/^(nota|advertencia|error|importante|seguridad|tip|idea|atencion|info):\s*/i);
    if (prefixMatch) {
      const matchedIcon = findMatchingIcon(prefixMatch[1]);
      if (matchedIcon) {
        return `:${matchedIcon}: ${line}`;
      }
    }

    return line;
  });

  return processedLines.join('\n');
}
