/**
 * SELECTOR DE INGREDIENTES
 * =========================
 *
 * Permite al niño seleccionar combustibles y propulsores,
 * ajustar cantidades, y ver el costo en tiempo real.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  COMBUSTIBLES,
  PROPULSORES,
  CombustibleTipo,
  PropulsorTipo,
  Ingrediente,
  estimarAltura,
} from '@/lib/quimica/motor-quimico';

interface SelectorIngredientesProps {
  onCambio: (seleccion: SeleccionIngredientes) => void;
  presupuestoMaximo?: number; // null = sin límite
  mostrarPrediccion?: boolean;
  deshabilitado?: boolean;
}

export interface SeleccionIngredientes {
  combustible: {
    tipo: CombustibleTipo;
    cantidad: number;
  };
  propulsor: {
    tipo: PropulsorTipo;
    cantidad: number;
  };
  costoTotal: number;
}

export default function SelectorIngredientes({
  onCambio,
  presupuestoMaximo,
  mostrarPrediccion = false,
  deshabilitado = false,
}: SelectorIngredientesProps) {
  // Estado de selección
  const [combustibleSeleccionado, setCombustibleSeleccionado] =
    useState<CombustibleTipo>('vinagre');
  const [propulsorSeleccionado, setPropulsorSeleccionado] = useState<PropulsorTipo>('bicarbonato');
  const [cantidadCombustible, setCantidadCombustible] = useState(0);
  const [cantidadPropulsor, setCantidadPropulsor] = useState(0);

  // Calcular costo total
  const costoTotal =
    cantidadCombustible * COMBUSTIBLES[combustibleSeleccionado].precio +
    cantidadPropulsor * PROPULSORES[propulsorSeleccionado].precio;

  // Verificar si excede presupuesto
  const excedePresupuesto = presupuestoMaximo !== undefined && costoTotal > presupuestoMaximo;

  // Estimación de altura (si está habilitado)
  const estimacion =
    mostrarPrediccion && cantidadCombustible > 0 && cantidadPropulsor > 0
      ? estimarAltura({
          combustible: { tipo: combustibleSeleccionado, cantidad: cantidadCombustible },
          propulsor: { tipo: propulsorSeleccionado, cantidad: cantidadPropulsor },
        })
      : null;

  // Notificar cambios al padre
  useEffect(() => {
    onCambio({
      combustible: {
        tipo: combustibleSeleccionado,
        cantidad: cantidadCombustible,
      },
      propulsor: {
        tipo: propulsorSeleccionado,
        cantidad: cantidadPropulsor,
      },
      costoTotal,
    });
  }, [
    combustibleSeleccionado,
    propulsorSeleccionado,
    cantidadCombustible,
    cantidadPropulsor,
    costoTotal,
    onCambio,
  ]);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* COMBUSTIBLES (Líquidos) */}
      <div className="flex-1 flex flex-col">
        <h4 className="text-base font-bold text-cyan-400 mb-3 flex items-center gap-2">
          💧 Combustible Líquido
        </h4>

        {/* Selector dropdown */}
        <select
          value={combustibleSeleccionado}
          onChange={(e) => setCombustibleSeleccionado(e.target.value as CombustibleTipo)}
          disabled={deshabilitado}
          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white text-base focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {Object.values(COMBUSTIBLES).map((combustible) => (
            <option key={combustible.id} value={combustible.id}>
              {combustible.emoji} {combustible.nombre} (${combustible.precio})
            </option>
          ))}
        </select>

        {/* Card del combustible seleccionado */}
        <div className="flex-1">
          <IngredienteCardCompact
            ingrediente={COMBUSTIBLES[combustibleSeleccionado]}
            cantidad={cantidadCombustible}
            onCambiarCantidad={setCantidadCombustible}
            deshabilitado={deshabilitado}
          />
        </div>
      </div>

      {/* PROPULSORES (Polvos) */}
      <div className="flex-1 flex flex-col">
        <h4 className="text-base font-bold text-purple-400 mb-3 flex items-center gap-2">
          ⚪ Propulsor en Polvo
        </h4>

        {/* Selector dropdown */}
        <select
          value={propulsorSeleccionado}
          onChange={(e) => setPropulsorSeleccionado(e.target.value as PropulsorTipo)}
          disabled={deshabilitado}
          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-white text-base focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {Object.values(PROPULSORES).map((propulsor) => (
            <option key={propulsor.id} value={propulsor.id}>
              {propulsor.emoji} {propulsor.nombre} (${propulsor.precio})
            </option>
          ))}
        </select>

        {/* Card del propulsor seleccionado */}
        <div className="flex-1">
          <IngredienteCardCompact
            ingrediente={PROPULSORES[propulsorSeleccionado]}
            cantidad={cantidadPropulsor}
            onCambiarCantidad={setCantidadPropulsor}
            deshabilitado={deshabilitado}
          />
        </div>
      </div>

      {/* PREDICCIÓN */}
      {mostrarPrediccion && estimacion && (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-xl p-4">
          <div className="text-sm text-cyan-400 mb-2 font-bold">📊 Altura Estimada</div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-white">~{estimacion.alturaEstimada}cm</span>
            <span
              className={`text-sm px-3 py-1 rounded-full font-bold ${
                estimacion.confianza === 'alta'
                  ? 'bg-green-500/20 text-green-400'
                  : estimacion.confianza === 'media'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
              }`}
            >
              {estimacion.confianza === 'alta'
                ? '✓ Alta'
                : estimacion.confianza === 'media'
                  ? '~ Media'
                  : '? Baja'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE: Tarjeta de Ingrediente
// ============================================================================

interface IngredienteCardProps {
  ingrediente: Ingrediente;
  seleccionado: boolean;
  cantidad: number;
  onSeleccionar: () => void;
  onCambiarCantidad: (cantidad: number) => void;
  deshabilitado: boolean;
}

function IngredienteCard({
  ingrediente,
  seleccionado,
  cantidad,
  onSeleccionar,
  onCambiarCantidad,
  deshabilitado,
}: IngredienteCardProps) {
  const [mostrarInfo, setMostrarInfo] = useState(false);

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300
        ${
          seleccionado
            ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
        }
        ${deshabilitado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={() => !deshabilitado && onSeleccionar()}
    >
      {/* Icono grande */}
      <div className="text-5xl mb-2 text-center">{ingrediente.emoji}</div>

      {/* Nombre */}
      <h4 className="text-lg font-bold text-white text-center mb-1">{ingrediente.nombre}</h4>

      {/* Precio */}
      <div className="text-center mb-3">
        <span className="text-emerald-400 font-bold">${ingrediente.precio}</span>
        <span className="text-slate-400 text-sm"> c/u</span>
      </div>

      {/* Potencia */}
      <div className="mb-3">
        <div className="text-xs text-slate-400 mb-1">Potencia</div>
        <div className="flex gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < ingrediente.potencia
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Control de cantidad */}
      {seleccionado && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-xs text-slate-400 mb-2">Cucharadas</div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!deshabilitado && cantidad > 0) {
                  onCambiarCantidad(cantidad - 1);
                }
              }}
              disabled={deshabilitado || cantidad === 0}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-white transition-colors"
            >
              -
            </button>

            <div className="flex-1 text-center">
              <span className="text-2xl font-black text-white">{cantidad}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!deshabilitado && cantidad < 20) {
                  onCambiarCantidad(cantidad + 1);
                }
              }}
              disabled={deshabilitado || cantidad >= 20}
              className="w-8 h-8 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-white transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Botón de info */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMostrarInfo(!mostrarInfo);
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-xs flex items-center justify-center transition-colors"
      >
        ?
      </button>

      {/* Tooltip de información */}
      {mostrarInfo && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl z-20 text-sm">
          <div className="text-cyan-400 font-bold mb-2">ℹ️ Información</div>
          <p className="text-slate-300 mb-3">{ingrediente.descripcion}</p>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2">
            <div className="text-purple-300 text-xs font-bold mb-1">💡 Dato Curioso</div>
            <p className="text-slate-300 text-xs">{ingrediente.datoCurioso}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE: Tarjeta de Ingrediente Compacta
// ============================================================================

interface IngredienteCardCompactProps {
  ingrediente: Ingrediente;
  cantidad: number;
  onCambiarCantidad: (cantidad: number) => void;
  deshabilitado: boolean;
}

function IngredienteCardCompact({
  ingrediente,
  cantidad,
  onCambiarCantidad,
  deshabilitado,
}: IngredienteCardCompactProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
      {/* Header: Icono + Nombre + Potencia */}
      <div className="flex items-center gap-2 mb-3">
        <div className="text-3xl">{ingrediente.emoji}</div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white">{ingrediente.nombre}</div>
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < ingrediente.potencia
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Control de cantidad */}
      <div>
        <div className="text-xs text-slate-400 mb-2">Cucharadas</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!deshabilitado && cantidad > 0) {
                onCambiarCantidad(cantidad - 1);
              }
            }}
            disabled={deshabilitado || cantidad === 0}
            className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-white transition-colors"
          >
            -
          </button>

          <div className="flex-1 text-center">
            <span className="text-2xl font-black text-white">{cantidad}</span>
          </div>

          <button
            onClick={() => {
              if (!deshabilitado && cantidad < 20) {
                onCambiarCantidad(cantidad + 1);
              }
            }}
            disabled={deshabilitado || cantidad >= 20}
            className="w-8 h-8 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-white transition-colors"
          >
            +
          </button>
        </div>

        {/* Costo */}
        <div className="mt-2 text-center text-xs">
          <span className="text-slate-400">Costo: </span>
          <span className="text-emerald-400 font-bold">${ingrediente.precio * cantidad}</span>
        </div>
      </div>
    </div>
  );
}
