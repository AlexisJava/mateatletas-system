'use client';

import { Check, BookOpen } from 'lucide-react';
import { CASAS, MUNDOS } from '../utils';
import type { CasaTipo, MundoTipo, ProductoConCasa } from '../types';

interface ProductoStepProps {
  readonly casa: CasaTipo | null;
  readonly mundoSeleccionado: MundoTipo | null;
  readonly productos: ProductoConCasa[];
  readonly selectedProducto: ProductoConCasa | null;
  readonly onSelectMundo: (mundo: MundoTipo) => void;
  readonly onSelectProducto: (producto: ProductoConCasa) => void;
}

/**
 * Paso 2: Selección de mundo STEAM y producto/actividad
 */
export function ProductoStep({
  casa,
  mundoSeleccionado,
  productos,
  selectedProducto,
  onSelectMundo,
  onSelectProducto,
}: ProductoStepProps): React.ReactElement {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">¿Qué área te interesa?</h2>
      <p className="text-slate-400 mb-8">
        Elegí el mundo STEAM para tu hijo
        {casa && <span className="ml-2 text-cyan-400">(Casa {CASAS[casa].nombre})</span>}
      </p>

      {/* Selección de Mundo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(Object.entries(MUNDOS) as [MundoTipo, (typeof MUNDOS)[MundoTipo]][]).map(
          ([tipo, mundo]) => (
            <MundoCard
              key={tipo}
              tipo={tipo}
              config={mundo}
              isSelected={mundoSeleccionado === tipo}
              onSelect={() => onSelectMundo(tipo)}
            />
          ),
        )}
      </div>

      {/* Lista de productos del mundo seleccionado */}
      {mundoSeleccionado && productos.length > 0 && (
        <ProductoList
          mundoNombre={MUNDOS[mundoSeleccionado].nombre}
          productos={productos}
          selectedProducto={selectedProducto}
          onSelectProducto={onSelectProducto}
        />
      )}

      {/* Mensaje cuando no hay productos */}
      {mundoSeleccionado && productos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">
            No hay actividades disponibles para {MUNDOS[mundoSeleccionado].nombre} en Casa{' '}
            {casa ? CASAS[casa].nombre : ''} por el momento.
          </p>
        </div>
      )}
    </div>
  );
}

interface MundoCardProps {
  readonly tipo: MundoTipo;
  readonly config: (typeof MUNDOS)[MundoTipo];
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

/**
 * Card de mundo STEAM seleccionable
 */
function MundoCard({ tipo, config, isSelected, onSelect }: MundoCardProps): React.ReactElement {
  return (
    <button
      onClick={onSelect}
      className={`relative p-6 rounded-2xl border text-left transition-all ${
        isSelected
          ? 'bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/30'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className="text-4xl mb-3">{config.emoji}</div>
      <h3 className="text-lg font-bold text-white mb-1">{config.nombre}</h3>
      <p className="text-sm text-slate-400">Actividades de {config.nombre.toLowerCase()}</p>
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </button>
  );
}

interface ProductoListProps {
  readonly mundoNombre: string;
  readonly productos: ProductoConCasa[];
  readonly selectedProducto: ProductoConCasa | null;
  readonly onSelectProducto: (producto: ProductoConCasa) => void;
}

/**
 * Lista de productos/actividades disponibles
 */
function ProductoList({
  mundoNombre,
  productos,
  selectedProducto,
  onSelectProducto,
}: ProductoListProps): React.ReactElement {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        Actividades disponibles en {mundoNombre}
      </h3>
      <div className="space-y-3">
        {productos.map((producto) => (
          <ProductoCard
            key={producto.id}
            producto={producto}
            isSelected={selectedProducto?.id === producto.id}
            onSelect={() => onSelectProducto(producto)}
          />
        ))}
      </div>
    </div>
  );
}

interface ProductoCardProps {
  readonly producto: ProductoConCasa;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

/**
 * Card de producto/actividad seleccionable
 */
function ProductoCard({ producto, isSelected, onSelect }: ProductoCardProps): React.ReactElement {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
        isSelected
          ? 'bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/30'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
        <BookOpen className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white">{producto.nombre}</p>
        <p className="text-sm text-slate-400 mt-1">{producto.descripcion}</p>
        {producto.claseGrupos && producto.claseGrupos.length > 0 && (
          <p className="text-xs text-cyan-400 mt-2">
            {producto.claseGrupos.length} horarios disponibles
          </p>
        )}
      </div>
      {isSelected && (
        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
}
