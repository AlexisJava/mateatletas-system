/**
 * Intent Catalog Module
 *
 * Exports the centralized intent catalog for use by:
 * - Sandbox IntentLibrary (admin UI)
 * - Validation systems
 * - Documentation generators
 */

// Types
export type {
  IntentCategoryId,
  IntentCategoryMeta,
  IntentMeta,
  IntentCatalog,
  IntentsByCategory,
} from './types';

// Catalog data
export {
  INTENT_CATEGORIES,
  INTENT_CATALOG,
  getIntentsByCategory,
  getIntentById,
  getIntentByShortName,
  getCategoryById,
  getIntentsForCategory,
} from './intent-catalog';
