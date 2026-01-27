/**
 * Shared intent types for the Sandbox editor
 *
 * Note: There are TWO intent category structures in the codebase:
 * 1. SandboxSidebar - Uses emojis, simpler structure for quick-access sidebar
 * 2. IntentLibrary - Uses icons, colors, descriptions for full catalog modal
 *
 * These are intentionally different to serve their distinct UI purposes.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED BASE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Fields that may appear in intent defaultJson for preview purposes */
export interface IntentPreviewFields {
  title?: string;
  subtitle?: string;
  description?: string;
  cta?: { text: string; action?: string };
}

/** Base intent definition with common fields */
export interface BaseIntentDefinition {
  id: string;
  name: string;
  defaultJson: IntentPreviewFields & Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTENT LIBRARY TYPES (Full catalog modal)
// ─────────────────────────────────────────────────────────────────────────────

/** Rich intent definition for the full library modal */
export interface IntentDefinition extends BaseIntentDefinition {
  description: string;
  icon?: string;
  gradient?: boolean;
}

/** Category with icon and color for library modal */
export interface IntentCategory {
  id: string;
  name: string;
  icon: string;
  color: 'green' | 'blue' | 'orange' | 'violet' | 'cyan';
  intents: IntentDefinition[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR TYPES (Quick-access sidebar)
// ─────────────────────────────────────────────────────────────────────────────

/** Simple intent for sidebar quick-access */
export interface SidebarIntent {
  id: string;
  name: string;
  defaultJson: Record<string, unknown>;
}

/** Category with emoji for compact sidebar */
export interface SidebarIntentCategory {
  id: string;
  emoji: string;
  name: string;
  intents: readonly SidebarIntent[];
}
