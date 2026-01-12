'use client';

import { useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import styles from './EditorPanel.module.css';

interface EditorPanelProps {
  content: string;
  onChange: (value: string) => void;
  nodoId: string | null;
}

export function EditorPanel({ content, onChange, nodoId }: EditorPanelProps) {
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

  if (!nodoId) {
    return (
      <div className={styles.empty}>
        <span>Selecciona un nodo para editar</span>
      </div>
    );
  }

  if (!content) {
    return (
      <div className={styles.empty}>
        <span>Este nodo es un contenedor (sin contenidoJson)</span>
      </div>
    );
  }

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
