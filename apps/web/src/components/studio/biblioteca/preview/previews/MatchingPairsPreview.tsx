'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para MatchingPairs
 */
interface MatchingPair {
  id: string;
  izquierda: string;
  derecha: string;
}

interface MatchingPairsExampleData {
  instruccion: string;
  pares: MatchingPair[];
  feedback: {
    correcto: string;
    incorrecto: string;
  };
}

interface Connection {
  leftId: string;
  rightId: string;
}

/**
 * Preview interactivo del componente MatchingPairs
 */
function MatchingPairsPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as MatchingPairsExampleData;

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ side: 'left' | 'right'; id: string } | null>(
    null,
  );
  const [verified, setVerified] = useState(false);

  // Shuffle right items for display
  const shuffledRightItems = useMemo(() => {
    return [...data.pares].sort(() => Math.random() - 0.5);
  }, [data.pares]);

  const getConnectionForLeft = (leftId: string): Connection | undefined =>
    connections.find((c) => c.leftId === leftId);

  const getConnectionForRight = (rightId: string): Connection | undefined =>
    connections.find((c) => c.rightId === rightId);

  const isCorrect = (connection: Connection): boolean => connection.leftId === connection.rightId;

  const allCorrect =
    connections.length === data.pares.length && connections.every((c) => isCorrect(c));

  const handleItemClick = useCallback(
    (side: 'left' | 'right', id: string) => {
      if (!interactive || verified) return;

      const existingConnection =
        side === 'left' ? getConnectionForLeft(id) : getConnectionForRight(id);

      // If already connected, disconnect
      if (existingConnection) {
        setConnections((prev) =>
          prev.filter(
            (c) =>
              c.leftId !== existingConnection.leftId || c.rightId !== existingConnection.rightId,
          ),
        );
        setSelectedItem(null);
        return;
      }

      // If no previous selection, select this item
      if (!selectedItem) {
        setSelectedItem({ side, id });
        return;
      }

      // If same side selected, change selection
      if (selectedItem.side === side) {
        setSelectedItem({ side, id });
        return;
      }

      // Create connection between different sides
      const leftId = side === 'left' ? id : selectedItem.id;
      const rightId = side === 'right' ? id : selectedItem.id;

      // Check if either is already connected
      if (getConnectionForLeft(leftId) || getConnectionForRight(rightId)) {
        setSelectedItem({ side, id });
        return;
      }

      setConnections((prev) => [...prev, { leftId, rightId }]);
      setSelectedItem(null);
    },
    [interactive, verified, selectedItem, connections],
  );

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setConnections([]);
    setSelectedItem(null);
    setVerified(false);
  }, []);

  const getItemClasses = (side: 'left' | 'right', id: string): string => {
    const connection = side === 'left' ? getConnectionForLeft(id) : getConnectionForRight(id);
    const isSelected = selectedItem?.side === side && selectedItem?.id === id;
    const isConnected = !!connection;

    let baseClasses =
      'px-4 py-3 rounded-lg font-medium transition-all duration-150 cursor-pointer select-none';

    if (!interactive || verified) {
      baseClasses += ' cursor-not-allowed';
    }

    if (isSelected && !isConnected) {
      return `${baseClasses} bg-slate-600 ring-2 ring-blue-400`;
    }

    if (verified && isConnected) {
      const correct = isCorrect(connection);
      return `${baseClasses} ${correct ? 'bg-green-600' : 'bg-red-600'} text-white`;
    }

    if (isConnected) {
      return `${baseClasses} bg-blue-600 text-white`;
    }

    return `${baseClasses} bg-slate-700 hover:bg-slate-600 text-white`;
  };

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Matching Grid */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Left Column */}
        <div className="space-y-3">
          {data.pares.map((par) => (
            <div
              key={par.id}
              onClick={() => handleItemClick('left', par.id)}
              className={getItemClasses('left', par.id)}
            >
              {par.izquierda}
            </div>
          ))}
        </div>

        {/* Right Column (shuffled) */}
        <div className="space-y-3">
          {shuffledRightItems.map((par) => (
            <div
              key={par.id}
              onClick={() => handleItemClick('right', par.id)}
              className={getItemClasses('right', par.id)}
            >
              {par.derecha}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {verified && (
        <div
          className={`
            p-4 rounded-lg mb-4 text-center
            ${allCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${allCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {allCorrect ? data.feedback.correcto : data.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {interactive && (
        <div className="flex justify-center gap-3">
          {!verified ? (
            <button
              type="button"
              onClick={handleVerify}
              disabled={connections.length === 0}
              className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Verificar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors duration-150"
            >
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para MatchingPairs
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'pares',
    type: 'array',
    description: 'Lista de pares con id, izquierda y derecha',
    required: true,
  },
  {
    name: 'feedback',
    type: 'object',
    description: 'Mensajes de feedback con propiedades correcto e incorrecto',
    required: true,
  },
  {
    name: 'intentosMaximos',
    type: 'number',
    description: 'Número máximo de intentos permitidos',
    required: false,
  },
  {
    name: 'mostrarRespuestasTras',
    type: 'number',
    description: 'Número de intentos tras los cuales mostrar las respuestas correctas',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: MatchingPairsExampleData = {
  instruccion: 'Conecta cada fórmula química con su nombre',
  pares: [
    { id: 'p1', izquierda: 'H₂O', derecha: 'Agua' },
    { id: 'p2', izquierda: 'NaCl', derecha: 'Sal' },
    { id: 'p3', izquierda: 'CO₂', derecha: 'Dióxido de carbono' },
    { id: 'p4', izquierda: 'O₂', derecha: 'Oxígeno' },
  ],
  feedback: {
    correcto: '¡Excelente! Todas las conexiones son correctas.',
    incorrecto: 'Algunas conexiones no son correctas. Inténtalo de nuevo.',
  },
};

/**
 * Definición del preview para el registry
 */
export const MatchingPairsPreview: PreviewDefinition = {
  component: MatchingPairsPreviewComponent,
  exampleData,
  propsDocumentation,
};
