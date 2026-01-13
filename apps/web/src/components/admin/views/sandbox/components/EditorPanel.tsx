'use client';

import { useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import type { NodoContenido, ClasePlanificacion, ContentType } from '../types/sandbox.types';
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

  return (
    <div ref={containerRef} className={styles.editor}>
      <Editor
        height="100%"
        language="json"
        theme="vs-dark"
        value={content}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          wrappingStrategy: 'advanced',
          padding: { top: 8 },
          formatOnPaste: true,
        }}
      />
    </div>
  );
}
