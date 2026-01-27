/**
 * Intent Catalog Types
 *
 * Type definitions for the intent catalog system.
 * Used by both the catalog module and the Sandbox IntentLibrary.
 */

// =============================================================================
// CATEGORY TYPES
// =============================================================================

export type IntentCategoryId =
  | 'presentation'
  | 'interaction'
  | 'narrative'
  | 'gamification'
  | 'layout'
  | 'closure';

export interface IntentCategoryMeta {
  /** Category ID matching IntentCategoryId */
  id: IntentCategoryId;
  /** Display name */
  name: string;
  /** Lucide icon name */
  icon: string;
  /** Accent color for UI */
  color: 'green' | 'blue' | 'orange' | 'violet' | 'cyan' | 'amber';
}

// =============================================================================
// INTENT TYPES
// =============================================================================

export interface IntentMeta {
  /** Full intent ID in format 'category:name' */
  id: string;
  /** Short name (e.g., 'hero', 'quiz-mc') */
  shortName: string;
  /** Display name for UI */
  name: string;
  /** Category this intent belongs to */
  category: IntentCategoryId;
  /** Description for the admin */
  description: string;
  /** Lucide icon name */
  icon: string;
  /** Default props to use when creating new content with this intent */
  defaultProps: Record<string, unknown>;
}

// =============================================================================
// CATALOG STRUCTURE
// =============================================================================

export interface IntentCatalog {
  categories: IntentCategoryMeta[];
  intents: IntentMeta[];
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/** Group intents by category for UI display */
export interface IntentsByCategory {
  category: IntentCategoryMeta;
  intents: IntentMeta[];
}
