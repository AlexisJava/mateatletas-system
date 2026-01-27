'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import {
  registerAllIntents,
  areIntentsRegistered,
  IntentRegistry,
} from '@mateatletas/lesson-engine';
import { LessonRenderer } from '@/components/lesson-renderer';
import styles from './IntentPreview.module.css';

// =============================================================================
// TYPES
// =============================================================================

interface IntentPreviewProps {
  /** JSON string from contenidoJson */
  contenidoJson: string;
  /** House colors for theming */
  houseColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface ParsedIntent {
  intent: string;
  [key: string]: unknown;
}

// =============================================================================
// DEFAULT HOUSE COLORS
// =============================================================================

const DEFAULT_COLORS = {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  accent: '#f97316',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function IntentPreview({ contenidoJson, houseColors = DEFAULT_COLORS }: IntentPreviewProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register intents on mount
  useEffect(() => {
    if (!areIntentsRegistered()) {
      registerAllIntents();
    }
    setIsReady(true);
  }, []);

  // Parse the JSON content
  const parsed = useMemo(() => {
    try {
      const data = JSON.parse(contenidoJson) as unknown;
      return { success: true, data: data as ParsedIntent, error: null };
    } catch (e) {
      return {
        success: false,
        data: null,
        error: e instanceof Error ? e.message : 'Error parsing JSON',
      };
    }
  }, [contenidoJson]);

  // Determine if this is intent-based or legacy content
  const isIntentBased = parsed.success && parsed.data?.intent;

  // Get the intent component if it's intent-based
  const IntentComponent = useMemo(() => {
    if (!isIntentBased || !parsed.data?.intent) return null;
    return IntentRegistry.get(parsed.data.intent);
  }, [isIntentBased, parsed.data?.intent]);

  // Apply house colors as CSS variables
  const themeStyle = {
    '--house-primary': houseColors.primary,
    '--house-secondary': houseColors.secondary,
    '--house-accent': houseColors.accent,
    '--house-primary-alpha': `${houseColors.primary}40`,
  } as React.CSSProperties;

  // Loading state
  if (!isReady) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} />
        <span>Cargando intents...</span>
      </div>
    );
  }

  // Parse error
  if (!parsed.success) {
    return (
      <div className={styles.error}>
        <AlertCircle className={styles.errorIcon} />
        <div className={styles.errorContent}>
          <h4 className={styles.errorTitle}>Error de JSON</h4>
          <p className={styles.errorMessage}>{parsed.error}</p>
        </div>
      </div>
    );
  }

  // No intent field = legacy content, use old renderer
  if (!isIntentBased) {
    return <LessonRenderer contenidoJson={contenidoJson} />;
  }

  // Intent not found in registry
  if (!IntentComponent) {
    return (
      <div className={styles.error}>
        <AlertCircle className={styles.errorIcon} />
        <div className={styles.errorContent}>
          <h4 className={styles.errorTitle}>Intent no encontrado</h4>
          <p className={styles.errorMessage}>
            El intent <code className={styles.code}>{parsed.data?.intent}</code> no está registrado.
          </p>
          <p className={styles.errorHint}>
            Intents disponibles: {IntentRegistry.list().slice(0, 5).join(', ')}...
          </p>
        </div>
      </div>
    );
  }

  // Render the intent component
  const { intent, ...props } = parsed.data!;

  return (
    <div className={styles.container} style={themeStyle}>
      <IntentComponent
        props={props}
        onComplete={() => {
          // In preview mode, just show a toast or log
          console.log('[Preview] Intent completed:', intent);
        }}
      />
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default IntentPreview;
