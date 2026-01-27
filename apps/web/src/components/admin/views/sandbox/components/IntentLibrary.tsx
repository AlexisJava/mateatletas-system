'use client';

import { useState, useMemo, type ReactElement } from 'react';
import {
  X,
  Search,
  ChevronRight,
  Check,
  Plus,
  PlayCircle,
  MousePointerClick,
  MessageCircle,
  Gamepad2,
  LayoutGrid,
  Flag,
  Sparkles,
  BookOpen,
  Lightbulb,
  Images,
  AlertCircle,
  CircleCheck,
  ToggleLeft,
  GripVertical,
  Link,
  TextCursorInput,
  ArrowUpDown,
  Book,
  MessageSquare,
  Bot,
  Gift,
  Trophy,
  Timer,
  Medal,
  Columns,
  LayoutDashboard,
  Folder,
  GalleryHorizontal,
  ListChecks,
  ArrowRight,
  Award,
} from 'lucide-react';
import styles from './IntentLibrary.module.css';
import {
  getIntentsByCategory,
  INTENT_CATALOG,
  type IntentMeta,
  type IntentsByCategory,
} from '@mateatletas/lesson-engine';

// =============================================================================
// TYPES
// =============================================================================

export interface IntentDefinition {
  id: string;
  name: string;
  description: string;
  icon?: string;
  gradient?: boolean;
  defaultJson: Record<string, unknown>;
}

export interface IntentCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  intents: IntentDefinition[];
}

export interface IntentLibraryProps {
  onSelectIntent: (intent: IntentDefinition) => void;
  onClose: () => void;
  selectedIntentId?: string | null;
}

// =============================================================================
// ICON MAPPING - All Lucide icons used by intents
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Category icons
  'play-circle': PlayCircle,
  'mouse-pointer-click': MousePointerClick,
  'message-circle': MessageCircle,
  'gamepad-2': Gamepad2,
  'layout-grid': LayoutGrid,
  'flag-checkered': Flag,

  // Presentation icons
  sparkles: Sparkles,
  'book-open': BookOpen,
  lightbulb: Lightbulb,
  images: Images,
  'alert-circle': AlertCircle,

  // Interaction icons
  'circle-check': CircleCheck,
  'toggle-left': ToggleLeft,
  'grip-vertical': GripVertical,
  link: Link,
  'text-cursor-input': TextCursorInput,
  'arrow-up-down': ArrowUpDown,

  // Narrative icons
  book: Book,
  'message-square': MessageSquare,
  bot: Bot,

  // Gamification icons
  gift: Gift,
  trophy: Trophy,
  timer: Timer,
  medal: Medal,

  // Layout icons
  columns: Columns,
  'layout-dashboard': LayoutDashboard,
  folder: Folder,
  'gallery-horizontal': GalleryHorizontal,

  // Closure icons
  'list-checks': ListChecks,
  'arrow-right': ArrowRight,
  award: Award,
};

function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return iconMap[iconName] || Sparkles;
}

// =============================================================================
// TRANSFORM CATALOG TO UI FORMAT
// =============================================================================

function transformCatalogToUI(): IntentCategory[] {
  const byCategory = getIntentsByCategory();

  return byCategory.map((group: IntentsByCategory) => ({
    id: group.category.id,
    name: group.category.name,
    icon: group.category.icon,
    color: group.category.color,
    intents: group.intents.map((intent: IntentMeta) => ({
      id: intent.id,
      name: intent.name,
      description: intent.description,
      icon: intent.icon,
      gradient: intent.id === 'presentation:hero', // Hero gets gradient treatment
      defaultJson: intent.defaultProps,
    })),
  }));
}

// Generate categories from the centralized catalog
const INTENT_CATEGORIES: IntentCategory[] = transformCatalogToUI();

// =============================================================================
// COMPONENT
// =============================================================================

export function IntentLibrary({
  onSelectIntent,
  onClose,
  selectedIntentId,
}: IntentLibraryProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'presentation',
    'interaction',
  ]);
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedIntentId ?? null);

  // Filter intents based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return INTENT_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return INTENT_CATEGORIES.map((category) => ({
      ...category,
      intents: category.intents.filter(
        (intent) =>
          intent.name.toLowerCase().includes(query) ||
          intent.description.toLowerCase().includes(query),
      ),
    })).filter((category) => category.intents.length > 0);
  }, [searchQuery]);

  // Find selected intent
  const selectedIntent = useMemo(() => {
    if (!localSelectedId) return null;
    for (const category of INTENT_CATEGORIES) {
      const found = category.intents.find((i) => i.id === localSelectedId);
      if (found) return found;
    }
    return null;
  }, [localSelectedId]);

  const toggleCategory = (categoryId: string): void => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

  const handleSelectIntent = (intent: IntentDefinition): void => {
    setLocalSelectedId(intent.id);
  };

  const handleUseIntent = (): void => {
    if (selectedIntent) {
      onSelectIntent(selectedIntent);
    }
  };

  // Get display values from defaultJson
  const getPreviewTitle = (intent: IntentDefinition): string => {
    const json = intent.defaultJson;
    return (
      (json.title as string) ?? (json.term as string) ?? (json.question as string) ?? intent.name
    );
  };

  const getPreviewSubtitle = (intent: IntentDefinition): string => {
    const json = intent.defaultJson;
    return (
      (json.subtitle as string) ??
      (json.definition as string) ??
      (json.message as string) ??
      intent.description
    );
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <LayoutGrid />
          </div>
          <h3 className={styles.headerTitle}>Intent Library</h3>
          <span className={styles.headerCount}>{INTENT_CATALOG.length} intents</span>
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
          <X />
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <Search />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar intents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories List */}
      <div className={styles.categoriesList}>
        {filteredCategories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Search />
            </div>
            <h4 className={styles.emptyTitle}>Sin resultados</h4>
            <p className={styles.emptyDescription}>
              No se encontraron intents que coincidan con &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const CategoryIcon = getIcon(category.icon);
            const isExpanded = expandedCategories.includes(category.id);

            return (
              <div key={category.id} className={styles.category}>
                <button
                  type="button"
                  className={styles.categoryHeader}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className={styles.categoryIcon} data-color={category.color}>
                    <CategoryIcon />
                  </div>
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categoryCount}>{category.intents.length}</span>
                  <span
                    className={`${styles.categoryChevron} ${isExpanded ? styles.expanded : ''}`}
                  >
                    <ChevronRight />
                  </span>
                </button>

                {isExpanded && (
                  <div className={styles.intentsList}>
                    {category.intents.map((intent) => {
                      const IntentIcon = intent.icon ? getIcon(intent.icon) : Sparkles;
                      const isSelected = localSelectedId === intent.id;

                      return (
                        <button
                          key={intent.id}
                          type="button"
                          className={`${styles.intentItem} ${isSelected ? styles.selected : ''}`}
                          onClick={() => handleSelectIntent(intent)}
                        >
                          <div
                            className={`${styles.intentIcon} ${intent.gradient ? styles.gradient : ''}`}
                            style={
                              !intent.gradient
                                ? {
                                    background: `rgba(139, 92, 246, 0.15)`,
                                    color: 'var(--sb-accent-violet)',
                                  }
                                : undefined
                            }
                          >
                            <IntentIcon />
                          </div>
                          <span className={styles.intentName}>{intent.name}</span>
                          <span className={styles.intentCheck}>
                            <Check />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Preview Section */}
      {selectedIntent && (
        <div className={styles.preview}>
          <h4 className={styles.previewLabel}>Vista previa</h4>
          <div className={styles.previewCard}>
            <div className={styles.previewIcon}>
              {(() => {
                const PreviewIcon = selectedIntent.icon ? getIcon(selectedIntent.icon) : Sparkles;
                return <PreviewIcon />;
              })()}
            </div>
            <div className={styles.previewContent}>
              <h5 className={styles.previewTitle}>{getPreviewTitle(selectedIntent)}</h5>
              <p className={styles.previewSubtitle}>{getPreviewSubtitle(selectedIntent)}</p>
              <p className={styles.previewId}>{selectedIntent.id}</p>
            </div>
          </div>
          <button type="button" className={styles.useButton} onClick={handleUseIntent}>
            <Plus />
            <span>Usar intent</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Export for external use
export { INTENT_CATEGORIES };
