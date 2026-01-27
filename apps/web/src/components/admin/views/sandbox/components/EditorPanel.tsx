'use client';

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Braces, AlignLeft, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import {
  validateIntentJson,
  type ValidationResult,
  type ValidationIssue,
} from '@mateatletas/lesson-engine';
import type { NodoContenido, ClasePlanificacion, ContentType } from '../types/sandbox.types';
import { sandboxDarkTheme, THEME_NAME } from '../utils/monacoTheme';
import styles from './EditorPanel.module.css';

// =============================================================================
// TYPES
// =============================================================================

interface EditorPanelProps {
  contentType: ContentType;
  selectedNodo: NodoContenido | null;
  selectedClase: ClasePlanificacion | null | undefined;
  onChange: (value: string) => void;
  onOpenContenido?: (contenidoId: string) => void;
}

type ValidationStatus = 'idle' | 'valid' | 'invalid' | 'legacy';

// =============================================================================
// COMPONENT
// =============================================================================

export function EditorPanel({
  contentType,
  selectedNodo,
  selectedClase,
  onChange,
  onOpenContenido,
}: EditorPanelProps): React.ReactElement {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');

  const handleEditorBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme(THEME_NAME, sandboxDarkTheme);
    monacoRef.current = monaco;
  };

  const handleEditorMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
  };

  // Force layout on container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      editorRef.current?.layout();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Debounced validation
  const validateContent = useCallback((content: string) => {
    if (!content.trim()) {
      setValidationResult(null);
      setValidationStatus('idle');
      return;
    }

    const result = validateIntentJson(content);
    setValidationResult(result);

    if (result.success) {
      if (result.intentId === '') {
        // Legacy content (no intent field)
        setValidationStatus('legacy');
      } else {
        setValidationStatus('valid');
      }
    } else {
      setValidationStatus('invalid');
    }

    // Set Monaco markers
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const markers: editor.IMarkerData[] = [];

        if (!result.success) {
          result.errors.forEach((error: ValidationIssue) => {
            markers.push({
              severity: monacoRef.current!.MarkerSeverity.Error,
              message: error.message,
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 1,
              endColumn: 1,
            });
          });
        }

        monacoRef.current.editor.setModelMarkers(model, 'intent-validator', markers);
      }
    }
  }, []);

  // Validate on content change (debounced)
  useEffect(() => {
    const content = selectedNodo?.contenidoJson || '';
    const timer = setTimeout(() => {
      if (content) {
        validateContent(content);
      } else {
        setValidationResult(null);
        setValidationStatus('idle');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedNodo?.contenidoJson, validateContent]);

  // Compute status badge
  const statusBadge = useMemo(() => {
    switch (validationStatus) {
      case 'valid':
        return (
          <span className={styles.statusBadge} data-status="valid">
            <CheckCircle2 />
            <span>Intent válido</span>
          </span>
        );
      case 'invalid':
        return (
          <span className={styles.statusBadge} data-status="invalid">
            <AlertCircle />
            <span>
              {validationResult && !validationResult.success
                ? `${validationResult.errors.length} error${validationResult.errors.length > 1 ? 'es' : ''}`
                : 'Error'}
            </span>
          </span>
        );
      case 'legacy':
        return (
          <span className={styles.statusBadge} data-status="legacy">
            <Circle />
            <span>Contenido legacy</span>
          </span>
        );
      default:
        return null;
    }
  }, [validationStatus, validationResult]);

  // ─────────────────────────────────────────────────────────────────────────────
  // PLANIFICACIÓN VIEW
  // ─────────────────────────────────────────────────────────────────────────────

  if (contentType === 'planificacion') {
    if (!selectedClase) {
      return (
        <div className={styles.empty}>
          <span>Selecciona una clase para ver detalles</span>
        </div>
      );
    }

    return (
      <div className={styles.claseEditor}>
        <div className={styles.claseHeader}>
          <h3>{selectedClase.titulo}</h3>
          {selectedClase.descripcion && (
            <p className={styles.claseDescripcion}>{selectedClase.descripcion}</p>
          )}
        </div>

        <div className={styles.claseActions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => selectedClase.teoriaId && onOpenContenido?.(selectedClase.teoriaId)}
            disabled={!selectedClase.teoriaId}
          >
            <span className={styles.actionIcon}>📖</span>
            <span>Editar Teoría</span>
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => selectedClase.practicaId && onOpenContenido?.(selectedClase.practicaId)}
            disabled={!selectedClase.practicaId}
          >
            <span className={styles.actionIcon}>✏️</span>
            <span>Editar Práctica</span>
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MICROLECCIÓN VIEW
  // ─────────────────────────────────────────────────────────────────────────────

  if (!selectedNodo) {
    return (
      <div className={styles.empty}>
        <span>Selecciona un nodo para editar</span>
      </div>
    );
  }

  // Si tiene hijos, es un contenedor (no editable directamente)
  const isContainer = selectedNodo.hijos.length > 0;

  if (isContainer && !selectedNodo.contenidoJson) {
    return (
      <div className={styles.empty}>
        <span>Este nodo es un contenedor. Selecciona un nodo hijo para editar.</span>
      </div>
    );
  }

  // Template inicial para nodos hoja vacíos - ahora usa formato intent
  const defaultTemplate = JSON.stringify(
    {
      intent: 'presentation:hero',
      title: '¡Bienvenido!',
      subtitle: 'Edita este contenido para empezar',
      ctaText: 'Continuar',
    },
    null,
    2,
  );

  const content = selectedNodo.contenidoJson || defaultTemplate;

  const handleFormat = useCallback((): void => {
    if (!editorRef.current) return;
    editorRef.current.getAction('editor.action.formatDocument')?.run();
  }, []);

  const handleChange = useCallback(
    (value: string | undefined): void => {
      const newValue = value || '';
      onChange(newValue);
      validateContent(newValue);
    },
    [onChange, validateContent],
  );

  return (
    <div className={styles.editorWrapper}>
      {/* Editor Header with Tabs */}
      <div className={styles.editorHeader}>
        <div className={styles.editorTabs}>
          <button type="button" className={`${styles.editorTab} ${styles.editorTabActive}`}>
            <Braces />
            <span>JSON</span>
          </button>
          {statusBadge}
        </div>
        <div className={styles.editorActions}>
          <button
            type="button"
            className={styles.formatBtn}
            onClick={handleFormat}
            title="Format document (Shift+Alt+F)"
            aria-label="Format document"
          >
            <AlignLeft />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div ref={containerRef} className={styles.editor}>
        <Editor
          height="100%"
          language="json"
          theme={THEME_NAME}
          value={content}
          onChange={handleChange}
          beforeMount={handleEditorBeforeMount}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
            fontSize: 12,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            lineHeight: 1.7,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            wrappingStrategy: 'advanced',
            padding: { top: 12, bottom: 12 },
            formatOnPaste: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            renderLineHighlight: 'all',
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* Error Panel */}
      {validationStatus === 'invalid' && validationResult && !validationResult.success && (
        <div className={styles.errorPanel}>
          <div className={styles.errorHeader}>
            <AlertCircle />
            <span className={styles.errorTitle}>Errores de validación</span>
          </div>
          <div className={styles.errorList}>
            {validationResult.errors.slice(0, 3).map((error, idx) => (
              <div key={idx} className={styles.errorItem}>
                <span className={styles.errorPath}>{error.path || 'root'}</span>
                <span className={styles.errorMessage}>{error.message}</span>
              </div>
            ))}
            {validationResult.errors.length > 3 && (
              <span className={styles.errorMore}>
                +{validationResult.errors.length - 3} errores más
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
