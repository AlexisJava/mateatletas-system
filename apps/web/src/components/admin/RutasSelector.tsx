'use client';

import React, { useEffect, useState } from 'react';
import { useSectoresStore } from '@/store/sectores.store';
import { Plus, X, Trash2 } from 'lucide-react';

interface SelectedRuta {
  sectorId: string;
  sectorNombre: string;
  sectorIcono: string;
  sectorColor: string;
  rutaNombre: string;
}

interface RutasSelectorProps {
  selectedRutas: SelectedRuta[];
  onChange: (rutas: SelectedRuta[]) => void;
  className?: string;
}

/**
 * Componente para seleccionar sectores y escribir nombres de rutas
 * Permite crear rutas dinámicamente sin tener una lista predefinida
 */
export default function RutasSelector({ selectedRutas, onChange, className = '' }: RutasSelectorProps) {
  const { sectores, fetchSectores } = useSectoresStore();
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  const [rutaNombre, setRutaNombre] = useState<string>('');

  useEffect(() => {
    fetchSectores();
  }, []);

  const handleAddRuta = () => {
    if (!selectedSectorId || !rutaNombre.trim()) return;

    const sector = sectores.find((s) => s.id === selectedSectorId);
    if (!sector) return;

    // Verificar que no exista ya la misma combinación
    const exists = selectedRutas.some(
      (r) => r.sectorId === selectedSectorId && r.rutaNombre.toLowerCase() === rutaNombre.toLowerCase()
    );

    if (exists) {
      alert('Esta ruta ya está agregada para este sector');
      return;
    }

    const newRuta: SelectedRuta = {
      sectorId: sector.id,
      sectorNombre: sector.nombre,
      sectorIcono: sector.icono,
      sectorColor: sector.color,
      rutaNombre: rutaNombre.trim(),
    };

    onChange([...selectedRutas, newRuta]);
    setRutaNombre('');
  };

  const handleRemoveRuta = (index: number) => {
    onChange(selectedRutas.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRuta();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selector de Sector y Input de Ruta */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Selector de Sector */}
          <div>
            <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
              Sector *
            </label>
            <select
              value={selectedSectorId}
              onChange={(e) => setSelectedSectorId(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-emerald-500/30 text-white rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
            >
              <option value="">Selecciona un sector...</option>
              {sectores.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.icono} {sector.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Input de Nombre de Ruta */}
          <div>
            <label className="block text-xs font-semibold text-emerald-100 mb-1.5">
              Nombre de la Ruta *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rutaNombre}
                onChange={(e) => setRutaNombre(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ej: Álgebra, Geometría, Olimpiadas..."
                className="flex-1 px-3 py-2 bg-black/40 border border-emerald-500/30 text-white placeholder-white/30 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-sm"
              />
              <button
                type="button"
                onClick={handleAddRuta}
                disabled={!selectedSectorId || !rutaNombre.trim()}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <Plus size={18} />
                Agregar
              </button>
            </div>
          </div>
        </div>

        {sectores.length === 0 && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-300">
              ⚠️ No hay sectores disponibles. Por favor, crea al menos un sector primero en{' '}
              <a href="/admin/sectores-rutas" target="_blank" className="underline font-semibold hover:text-yellow-200">
                Sectores y Rutas
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Lista de Rutas Agregadas */}
      {selectedRutas.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-emerald-100">
            Rutas Asignadas ({selectedRutas.length})
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedRutas.map((ruta, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 backdrop-blur-xl bg-black/40 border border-emerald-500/20 rounded-lg hover:border-emerald-400 hover:bg-emerald-500/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-2xl p-2 rounded-lg"
                    style={{ backgroundColor: ruta.sectorColor + '20' }}
                  >
                    {ruta.sectorIcono}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {ruta.rutaNombre}
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: ruta.sectorColor }}
                    >
                      {ruta.sectorNombre}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRuta(index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRutas.length === 0 && (
        <div className="text-center py-6 text-white/50 backdrop-blur-xl bg-black/30 rounded-lg border-2 border-dashed border-emerald-500/20">
          <p className="text-sm">
            Selecciona un sector y escribe el nombre de la ruta para agregar
          </p>
        </div>
      )}
    </div>
  );
}
