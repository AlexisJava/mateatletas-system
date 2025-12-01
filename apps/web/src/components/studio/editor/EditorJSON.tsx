'use client';

import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';

interface ImportResult {
  exito: boolean;
  error?: string;
}

interface Props {
  value: string;
  onChange: (json: string) => ImportResult;
  readOnly?: boolean;
}

export function EditorJSON({ value, onChange, readOnly = false }: Props): React.ReactElement {
  const [error, setError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState(value);

  // Sincronizar cuando cambia el value externo
  React.useEffect(() => {
    setLocalValue(value);
    setError(null);
  }, [value]);

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue === undefined || readOnly) return;

      setLocalValue(newValue);

      // Validar JSON antes de propagar
      try {
        JSON.parse(newValue);
        const result = onChange(newValue);
        if (result.exito) {
          setError(null);
        } else {
          setError(result.error ?? 'Error desconocido');
        }
      } catch {
        setError('JSON inválido');
      }
    },
    [onChange, readOnly],
  );

  return (
    <div className="relative h-full w-full">
      <div
        className={`h-full w-full overflow-hidden rounded-lg border-2 transition-colors ${
          error ? 'border-red-500' : 'border-transparent'
        }`}
      >
        <Editor
          height="100%"
          defaultLanguage="json"
          value={localValue}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
      {error && (
        <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
