/**
 * Format Utilities - Funciones de formateo para UI
 *
 * Centralizadas desde admin-mock-data.ts para uso general
 */

/**
 * Formatea un número como moneda argentina (ARS)
 * @example formatCurrency(95000) → "$95.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea un número como moneda compacta
 * @example formatCompactCurrency(4200000) → "$4.2M"
 * @example formatCompactCurrency(95000) → "$95K"
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}

/**
 * Formatea una fecha ISO como fecha legible
 * @example formatDate("2024-12-23T14:30:00Z") → "23 dic 2024"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formatea una fecha ISO como tiempo relativo
 * @example formatRelativeTime("2024-12-23T14:30:00Z") → "Hace 2 días"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return formatDate(dateString);
}

/**
 * Obtiene el color CSS para un tier STEAM
 */
export function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    'STEAM Libros': '#06b6d4',
    'STEAM Asincrónico': '#8b5cf6',
    'STEAM Sincrónico': '#f59e0b',
    STEAM_LIBROS: '#06b6d4',
    STEAM_ASINCRONICO: '#8b5cf6',
    STEAM_SINCRONICO: '#f59e0b',
  };
  return colors[tier] || '#64748b';
}
