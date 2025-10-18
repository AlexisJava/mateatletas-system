import { sanitizeHtml, sanitizeRichText } from '@/lib/utils/sanitize';

interface SafeTextProps {
  children: string | null | undefined;
  /** Permitir algunos tags básicos de formato (bold, italic, etc) */
  allowFormatting?: boolean;
  /** Clase CSS a aplicar */
  className?: string;
}

/**
 * Componente que renderiza texto de forma segura, previniendo XSS
 * Sanitiza el contenido antes de mostrarlo
 *
 * @example
 * ```tsx
 * <SafeText>{estudiante.nombre}</SafeText>
 * ```
 */
export function SafeText({ children, allowFormatting = false, className }: SafeTextProps) {
  const sanitized = allowFormatting
    ? sanitizeRichText(children)
    : sanitizeHtml(children);

  return <span className={className}>{sanitized}</span>;
}

/**
 * Versión específica para celdas de tabla
 */
export function SafeTableCell({ children, className }: Omit<SafeTextProps, 'allowFormatting'>) {
  return (
    <td className={className}>
      <SafeText>{children}</SafeText>
    </td>
  );
}
