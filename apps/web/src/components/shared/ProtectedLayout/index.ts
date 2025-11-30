/**
 * ProtectedLayout - Barrel export
 *
 * Uso:
 * import { ProtectedLayout } from '@/components/shared/ProtectedLayout';
 * import type { AllowedRole, ProtectedLayoutProps } from '@/components/shared/ProtectedLayout';
 */

export { ProtectedLayout, default } from './ProtectedLayout';

// Re-export types for convenience
export type {
  ProtectedLayoutProps,
  AllowedRole,
  UnauthorizedReason,
  AuthenticatedUser,
  ProtectedLayoutState,
} from './types';

// Re-export constants
export { ROLE_MAP, DEFAULT_ROLE_REDIRECTS } from './types';
