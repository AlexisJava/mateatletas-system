'use client';

import React, { useRef, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { SandboxIcons } from './SandboxIcons';
import type { NodoContenido } from '../types';

interface EditorPanelProps {
  content: string;
  onChange: (value: string) => void;
  activeNodo: NodoContenido | null;
  isEditable: boolean;
}

export function EditorPanel({ content, onChange, activeNodo, isEditable }: EditorPanelProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const handleFormatCode = useCallback(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        onChange(value);
      }
    },
    [onChange],
  );

  if (!isEditable) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#0f0720]">
        <div className="w-16 h-16 rounded-2xl bg-[#131b2e] flex items-center justify-center mb-4 text-[#475569]">
          <SandboxIcons.Folder />
        </div>
        <h3 className="text-sm font-bold text-white mb-2">
          {activeNodo ? 'Nodo Contenedor' : 'Sin Selección'}
        </h3>
        <p className="text-xs text-[#64748b] max-w-xs">
          {activeNodo
            ? 'Este nodo contiene sub-nodos. Seleccioná un nodo hoja (sin hijos) para editar su contenido.'
            : 'Seleccioná un nodo del árbol de contenido para comenzar a editar.'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0f0720] group relative">
      <div className="absolute top-3 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleFormatCode}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1b4b]/90 backdrop-blur-sm border border-white/10 rounded-lg text-[10px] font-bold text-[#94a3b8] hover:text-white hover:bg-[#2e1065] transition-colors shadow-lg"
          aria-label="Formatear JSON (Cmd+S)"
        >
          <SandboxIcons.Format />
          <span>PRETTIFY</span>
        </button>
      </div>

      <Editor
        height="100%"
        defaultLanguage="json"
        theme="vs-dark"
        value={content}
        onMount={handleEditorDidMount}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          fontLigatures: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 24, bottom: 24 },
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
}
