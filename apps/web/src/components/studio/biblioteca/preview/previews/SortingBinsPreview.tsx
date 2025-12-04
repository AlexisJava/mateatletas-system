'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { Trash2, Package, Leaf, Droplets, Zap } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para SortingBins
 *
 * A diferencia de DragAndDrop (que usa arrastrar elementos a zonas),
 * SortingBins usa click para clasificar objetos en contenedores temáticos
 * estilo "papeleras de reciclaje" (ej: tipos de residuos, estados de la materia)
 */
interface SortingElement {
  id: string;
  contenido: string;
  icono?: string;
  categoriaCorrecta: string;
}

interface SortingBin {
  id: string;
  nombre: string;
  icono: 'trash' | 'package' | 'leaf' | 'droplets' | 'zap';
  color: string;
  descripcion?: string;
}

interface SortingBinsExampleData {
  instruccion: string;
  elementos: SortingElement[];
  contenedores: SortingBin[];
  feedback: {
    correcto: string;
    incorrecto: string;
  };
}

const iconMap = {
  trash: Trash2,
  package: Package,
  leaf: Leaf,
  droplets: Droplets,
  zap: Zap,
};

/**
 * Preview interactivo del componente SortingBins
 */
function SortingBinsPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as SortingBinsExampleData;

  const [clasificaciones, setClasificaciones] = useState<Record<string, string>>({});
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const elementosSinClasificar = useMemo(() => {
    return data.elementos.filter((e) => !clasificaciones[e.id]);
  }, [data.elementos, clasificaciones]);

  const allCorrect = useMemo(() => {
    if (Object.keys(clasificaciones).length !== data.elementos.length) return false;
    return data.elementos.every((e) => clasificaciones[e.id] === e.categoriaCorrecta);
  }, [clasificaciones, data.elementos]);

  const handleSelectElement = useCallback(
    (elementId: string) => {
      if (!interactive || verified) return;
      setSelectedElement(selectedElement === elementId ? null : elementId);
    },
    [interactive, verified, selectedElement],
  );

  const handleDropInBin = useCallback(
    (binId: string) => {
      if (!interactive || verified || !selectedElement) return;
      setClasificaciones((prev) => ({
        ...prev,
        [selectedElement]: binId,
      }));
      setSelectedElement(null);
    },
    [interactive, verified, selectedElement],
  );

  const handleRemoveFromBin = useCallback(
    (elementId: string) => {
      if (!interactive || verified) return;
      setClasificaciones((prev) => {
        const newState = { ...prev };
        delete newState[elementId];
        return newState;
      });
    },
    [interactive, verified],
  );

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setVerified(false);
    setClasificaciones({});
    setSelectedElement(null);
  }, []);

  const getElementosEnBin = (binId: string) => {
    return data.elementos.filter((e) => clasificaciones[e.id] === binId);
  };

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        {selectedElement && (
          <p className="text-sm text-blue-400 mt-1 animate-pulse">
            👆 Ahora haz click en un contenedor para clasificar
          </p>
        )}
      </div>

      {/* Elementos sin clasificar */}
      <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <p className="text-xs text-slate-400 mb-3 font-medium">
          🎯 Objetos para clasificar{' '}
          <span className="text-slate-500">(click para seleccionar)</span>:
        </p>
        <div className="flex flex-wrap gap-2 min-h-[50px]">
          {elementosSinClasificar.length === 0 ? (
            <span className="text-slate-500 text-sm italic">✓ Todos los objetos clasificados</span>
          ) : (
            elementosSinClasificar.map((elemento) => (
              <button
                key={elemento.id}
                type="button"
                onClick={() => handleSelectElement(elemento.id)}
                disabled={!interactive || verified}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${selectedElement === elemento.id ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-105' : 'bg-slate-700 text-white hover:bg-slate-600'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {elemento.icono && <span className="mr-1">{elemento.icono}</span>}
                {elemento.contenido}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Contenedores/Bins */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {data.contenedores.map((bin) => {
          const Icon = iconMap[bin.icono];
          const elementosEnBin = getElementosEnBin(bin.id);
          const isTarget = selectedElement !== null;

          return (
            <button
              key={bin.id}
              type="button"
              onClick={() => handleDropInBin(bin.id)}
              disabled={!interactive || verified || !selectedElement}
              className={`
                relative p-4 rounded-xl border-2 transition-all text-left min-h-[140px]
                ${isTarget ? 'border-dashed cursor-pointer' : 'border-solid cursor-default'}
                ${isTarget ? 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20' : 'border-slate-600 bg-slate-800'}
                disabled:cursor-default
              `}
              style={{
                borderColor: isTarget ? undefined : bin.color + '80',
              }}
            >
              {/* Bin header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: bin.color + '30' }}>
                  <Icon className="w-5 h-5" style={{ color: bin.color }} />
                </div>
                <div>
                  <span className="text-white font-medium text-sm block">{bin.nombre}</span>
                  {bin.descripcion && (
                    <span className="text-[10px] text-slate-400">{bin.descripcion}</span>
                  )}
                </div>
              </div>

              {/* Elementos en el bin */}
              <div className="flex flex-wrap gap-1.5">
                {elementosEnBin.map((elemento) => {
                  const esCorrecta = elemento.categoriaCorrecta === bin.id;
                  return (
                    <span
                      key={elemento.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromBin(elemento.id);
                      }}
                      className={`
                        px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all inline-block
                        ${verified ? (esCorrecta ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-slate-600 text-white hover:bg-slate-500'}
                      `}
                    >
                      {elemento.icono && <span className="mr-1">{elemento.icono}</span>}
                      {elemento.contenido}
                      {verified && <span className="ml-1">{esCorrecta ? '✓' : '✗'}</span>}
                    </span>
                  );
                })}
                {elementosEnBin.length === 0 && !isTarget && (
                  <span className="text-xs text-slate-500 italic">Vacío</span>
                )}
                {elementosEnBin.length === 0 && isTarget && (
                  <span className="text-xs text-blue-400">Click para agregar</span>
                )}
              </div>

              {/* Count badge */}
              <div
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: bin.color + '30',
                  color: bin.color,
                }}
              >
                {elementosEnBin.length}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {verified && (
        <div
          className={`p-4 rounded-xl mb-4 text-center border ${allCorrect ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}`}
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
              disabled={Object.keys(clasificaciones).length !== data.elementos.length}
              className="px-6 py-2.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shadow-lg"
            >
              Verificar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors duration-150"
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
 * Documentación de props para SortingBins
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'elementos',
    type: 'array',
    description: 'Objetos a clasificar con id, contenido, icono y categoriaCorrecta',
    required: true,
  },
  {
    name: 'contenedores',
    type: 'array',
    description: 'Bins/contenedores con id, nombre, icono, color y descripcion',
    required: true,
  },
  {
    name: 'feedback',
    type: 'object',
    description: 'Mensajes de feedback con propiedades correcto e incorrecto',
    required: true,
  },
];

/**
 * Datos de ejemplo para el preview - Reciclaje
 */
const exampleData: SortingBinsExampleData = {
  instruccion: 'Clasifica los residuos en el contenedor correcto',
  elementos: [
    { id: 'e1', contenido: 'Botella de plástico', icono: '🥤', categoriaCorrecta: 'plastico' },
    { id: 'e2', contenido: 'Cáscara de banana', icono: '🍌', categoriaCorrecta: 'organico' },
    { id: 'e3', contenido: 'Lata de aluminio', icono: '🥫', categoriaCorrecta: 'metal' },
    { id: 'e4', contenido: 'Periódico', icono: '📰', categoriaCorrecta: 'papel' },
    { id: 'e5', contenido: 'Restos de comida', icono: '🍎', categoriaCorrecta: 'organico' },
    { id: 'e6', contenido: 'Bolsa plástica', icono: '🛍️', categoriaCorrecta: 'plastico' },
  ],
  contenedores: [
    {
      id: 'plastico',
      nombre: 'Plástico',
      icono: 'package',
      color: '#FBBF24',
      descripcion: 'Envases y bolsas',
    },
    {
      id: 'organico',
      nombre: 'Orgánico',
      icono: 'leaf',
      color: '#22C55E',
      descripcion: 'Restos de comida',
    },
    {
      id: 'papel',
      nombre: 'Papel',
      icono: 'droplets',
      color: '#3B82F6',
      descripcion: 'Diarios y cartón',
    },
    {
      id: 'metal',
      nombre: 'Metal',
      icono: 'zap',
      color: '#A855F7',
      descripcion: 'Latas y aluminio',
    },
  ],
  feedback: {
    correcto: '¡Excelente! Has clasificado correctamente todos los residuos.',
    incorrecto: 'Algunos objetos están en el contenedor incorrecto.',
  },
};

/**
 * Definición del preview para el registry
 */
export const SortingBinsPreview: PreviewDefinition = {
  component: SortingBinsPreviewComponent,
  exampleData,
  propsDocumentation,
};
