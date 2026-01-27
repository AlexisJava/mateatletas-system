'use client';

import { useState, useMemo, type ReactElement } from 'react';
import {
  X,
  Search,
  ChevronRight,
  Check,
  Plus,
  PlayCircle,
  Dumbbell,
  MessageCircle,
  BookOpen,
  ListChecks,
  Code,
  Trophy,
  RotateCcw,
  Variable,
  LayoutGrid,
  Sparkles,
  Target,
  Gamepad2,
  Award,
} from 'lucide-react';
import styles from './IntentLibrary.module.css';
import type { IntentDefinition, IntentCategory } from '../utils/intent.types';

// Re-export types for consumers
export type { IntentDefinition, IntentCategory };

export interface IntentLibraryProps {
  onSelectIntent: (intent: IntentDefinition) => void;
  onClose: () => void;
  selectedIntentId?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTENT CATALOG
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_CATEGORIES: IntentCategory[] = [
  {
    id: 'intro',
    name: 'Introducción',
    icon: 'play-circle',
    color: 'green',
    intents: [
      {
        id: 'hero',
        name: 'Hero',
        description: 'Pantalla de inicio con imagen destacada y llamada a la acción',
        gradient: true,
        defaultJson: {
          intent: 'hero',
          title: 'Introduction to Variables',
          subtitle: 'Learn how to store data in your programs',
          theme: 'violet-cyan',
          cta: { text: 'Start Learning', action: 'next' },
        },
      },
      {
        id: 'concept',
        name: 'Concepto',
        icon: 'book-open',
        description: 'Introduce un nuevo concepto con explicación clara',
        defaultJson: {
          intent: 'concept',
          title: 'What is a Variable?',
          definition: 'A variable is a container that stores data values',
          example: 'let age = 25;',
        },
      },
    ],
  },
  {
    id: 'practice',
    name: 'Práctica',
    icon: 'dumbbell',
    color: 'blue',
    intents: [
      {
        id: 'quiz',
        name: 'Quiz',
        icon: 'list-checks',
        description: 'Pregunta de opción múltiple con feedback',
        defaultJson: {
          intent: 'quiz',
          question: 'What is the correct way to declare a variable?',
          options: [
            { id: 'a', text: 'variable x = 5', correct: false },
            { id: 'b', text: 'let x = 5', correct: true },
            { id: 'c', text: 'x := 5', correct: false },
          ],
        },
      },
      {
        id: 'code-block',
        name: 'Code Block',
        icon: 'code',
        description: 'Bloque de código interactivo',
        defaultJson: {
          intent: 'code-block',
          language: 'javascript',
          code: 'let message = "Hello, World!";\nconsole.log(message);',
          editable: true,
        },
      },
    ],
  },
  {
    id: 'feedback',
    name: 'Feedback',
    icon: 'message-circle',
    color: 'orange',
    intents: [
      {
        id: 'success',
        name: 'Success',
        icon: 'trophy',
        description: 'Pantalla de éxito con celebración',
        defaultJson: {
          intent: 'success',
          title: '¡Excelente!',
          message: 'Has completado esta sección correctamente',
          xp: 50,
        },
      },
      {
        id: 'retry',
        name: 'Retry',
        icon: 'rotate-ccw',
        description: 'Pantalla de reintento con pista',
        defaultJson: {
          intent: 'retry',
          title: 'Casi lo tienes',
          hint: 'Recuerda que las variables se declaran con let o const',
        },
      },
    ],
  },
  {
    id: 'gamification',
    name: 'Gamificación',
    icon: 'gamepad',
    color: 'violet',
    intents: [
      {
        id: 'achievement',
        name: 'Logro',
        icon: 'award',
        description: 'Muestra un logro desbloqueado',
        defaultJson: {
          intent: 'achievement',
          title: 'First Steps',
          description: 'Completaste tu primera micro-lección',
          badge: 'beginner',
          xp: 100,
        },
      },
      {
        id: 'challenge',
        name: 'Desafío',
        icon: 'target',
        description: 'Presenta un desafío especial',
        defaultJson: {
          intent: 'challenge',
          title: 'Bonus Challenge',
          description: 'Completa esto en menos de 30 segundos',
          timeLimit: 30,
          reward: { xp: 200 },
        },
      },
    ],
  },
  {
    id: 'interactive',
    name: 'Interactivo',
    icon: 'sparkles',
    color: 'cyan',
    intents: [
      {
        id: 'drag-drop',
        name: 'Drag & Drop',
        icon: 'layout-grid',
        description: 'Actividad de arrastrar y soltar',
        defaultJson: {
          intent: 'drag-drop',
          instruction: 'Arrastra cada elemento a su categoría correcta',
          items: [
            { id: '1', text: 'let', category: 'variable' },
            { id: '2', text: 'function', category: 'function' },
          ],
          categories: ['variable', 'function'],
        },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ICON MAPPING
// ─────────────────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'play-circle': PlayCircle,
  dumbbell: Dumbbell,
  'message-circle': MessageCircle,
  'book-open': BookOpen,
  'list-checks': ListChecks,
  code: Code,
  trophy: Trophy,
  'rotate-ccw': RotateCcw,
  variable: Variable,
  'layout-grid': LayoutGrid,
  sparkles: Sparkles,
  target: Target,
  gamepad: Gamepad2,
  award: Award,
};

function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return iconMap[iconName] || Sparkles;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function IntentLibrary({
  onSelectIntent,
  onClose,
  selectedIntentId,
}: IntentLibraryProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['intro', 'practice']);
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <LayoutGrid />
          </div>
          <h3 className={styles.headerTitle}>Intent Library</h3>
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
                  <span
                    className={`${styles.categoryChevron} ${isExpanded ? styles.expanded : ''}`}
                  >
                    <ChevronRight />
                  </span>
                </button>

                {isExpanded && (
                  <div className={styles.intentsList}>
                    {category.intents.map((intent) => {
                      const IntentIcon = intent.icon ? getIcon(intent.icon) : Variable;
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
              <Variable />
            </div>
            <div className={styles.previewContent}>
              <h5 className={styles.previewTitle}>
                {selectedIntent.defaultJson.title ?? selectedIntent.name}
              </h5>
              <p className={styles.previewSubtitle}>
                {selectedIntent.defaultJson.subtitle ??
                  selectedIntent.defaultJson.description ??
                  selectedIntent.description}
              </p>
              {selectedIntent.defaultJson.cta && (
                <div className={styles.previewCta}>{selectedIntent.defaultJson.cta.text}</div>
              )}
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

// Export catalog for external use (types already exported above)
export { INTENT_CATEGORIES };
