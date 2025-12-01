import React from 'react';
import { StudioBlockProps } from '../blocks/types';

interface Props extends StudioBlockProps {
  tipo: string;
}

export function BloqueNoImplementado({ tipo, config, modo }: Props): React.ReactElement {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-2">🚧</div>
        <h3 className="font-semibold text-gray-700">{tipo}</h3>
        <p className="text-sm text-gray-500 mt-1">Componente no implementado</p>
        {modo === 'editor' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-600">Ver configuración</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(config, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
