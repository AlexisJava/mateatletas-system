'use client';

import { useRef, useEffect, useCallback } from 'react';
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Braces, AlignLeft } from 'lucide-react';
import type { NodoContenido, ClasePlanificacion, ContentType } from '../types/sandbox.types';
import { sandboxDarkTheme, THEME_NAME } from '../utils/monacoTheme';
import styles from './EditorPanel.module.css';

interface EditorPanelProps {
  contentType: ContentType;
  selectedNodo: NodoContenido | null;
  selectedClase: ClasePlanificacion | null | undefined;
  onChange: (value: string) => void;
  onOpenContenido?: (contenidoId: string) => void;
}

export function EditorPanel({
  contentType,
  selectedNodo,
  selectedClase,
  onChange,
  onOpenContenido,
}: EditorPanelProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEditorBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme(THEME_NAME, sandboxDarkTheme);
  };

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
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

  // Template inicial para nodos hoja vacíos
  const defaultTemplate = JSON.stringify(
    {
      type: 'Stage',
      props: { pattern: 'cyber-grid' },
      children: [
        {
          type: 'ContentZone',
          children: [
            {
              type: 'LessonHeader',
              props: { title: 'Título', subtitle: 'Subtítulo', icon: '📚' },
            },
            {
              type: 'TextBlock',
              children: 'Escribe tu contenido aquí...',
            },
          ],
        },
      ],
    },
    null,
    2,
  );

  const content = selectedNodo.contenidoJson || defaultTemplate;

  const handleFormat = useCallback((): void => {
    if (!editorRef.current) return;
    editorRef.current.getAction('editor.action.formatDocument')?.run();
  }, []);

  return (
    <div className={styles.editorWrapper}>
      {/* Editor Header with Tabs */}
      <div className={styles.editorHeader}>
        <div className={styles.editorTabs}>
          <button type="button" className={`${styles.editorTab} ${styles.editorTabActive}`}>
            <Braces />
            <span>JSON</span>
          </button>
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
          onChange={(value) => onChange(value || '')}
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
    </div>
  );
}
