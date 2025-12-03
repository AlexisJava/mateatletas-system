/**
 * Re-export del hook principal desde el contexto
 *
 * Este archivo existe para mantener consistencia en imports:
 * - import { useStudioTheme } from './useStudioTheme'
 * - import { useStudioTheme } from './StudioThemeContext'
 *
 * Ambos funcionan igual.
 */

export { useStudioTheme, useStudioThemeSafe } from './StudioThemeContext';
