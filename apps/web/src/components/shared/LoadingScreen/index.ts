/**
 * LoadingScreen - Barrel export
 *
 * Uso:
 * import { LoadingScreen } from '@/components/shared/LoadingScreen';
 * import type { LoadingVariant, LoadingScreenProps } from '@/components/shared/LoadingScreen';
 */

export { LoadingScreen, default } from './LoadingScreen';

// Re-export types for convenience
export type { LoadingScreenProps, LoadingVariant, VariantConfig } from './types';

// Re-export constants
export { VARIANT_CONFIGS } from './types';
