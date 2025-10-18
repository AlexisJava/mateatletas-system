import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitiza HTML para prevenir ataques XSS
 * Remueve todos los tags HTML y atributos peligrosos
 * @param dirty - String potencialmente peligroso
 * @returns String sanitizado (texto plano)
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';

  // Configuración estricta: no permitir ningún tag HTML
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No permitir ningún tag
    ALLOWED_ATTR: [], // No permitir ningún atributo
  });
}

/**
 * Sanitiza HTML pero permite algunos tags básicos de formato
 * Útil para campos que permiten texto enriquecido
 * @param dirty - String con HTML
 * @returns String sanitizado con tags básicos permitidos
 */
export function sanitizeRichText(dirty: string | null | undefined): string {
  if (!dirty) return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Escapa caracteres especiales para uso en atributos HTML
 * @param text - Texto a escapar
 * @returns Texto escapado
 */
export function escapeHtmlAttribute(text: string | null | undefined): string {
  if (!text) return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
