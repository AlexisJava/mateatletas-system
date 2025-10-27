'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Equipo } from '@/types/equipo.types';
import { Card, Button } from '../ui';

/**
 * Props del EquipoCard
 */
interface EquipoCardProps {
  equipo: Equipo;
  onEdit: (_equipo: Equipo) => void;
  onDelete: (_equipo: Equipo) => void;
  onRecalcularPuntos?: (_equipo: Equipo) => void;
}

/**
 * Componente EquipoCard
 * Tarjeta visual para mostrar información de un equipo
 *
 * Características:
 * - Muestra colores del equipo
 * - Cantidad de estudiantes
 * - Puntos totales
 * - Acciones: editar, eliminar, recalcular puntos
 */
export default function EquipoCard({
  equipo,
  onEdit,
  onDelete,
  onRecalcularPuntos,
}: EquipoCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Manejar confirmación de eliminación
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(equipo);
      setShowDeleteConfirm(false);
    } catch (error: unknown) {
      console.error('Error al eliminar:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Cantidad de estudiantes en el equipo
   */
  const cantidadEstudiantes = equipo.estudiantes?.length || 0;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header con colores del equipo */}
      <div
        className="h-24 flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${equipo.color_primario} 0%, ${equipo.color_secundario} 100%)`,
        }}
      >
        <h3 className="text-3xl font-bold text-white drop-shadow-lg">
          {equipo.nombre}
        </h3>

        {/* Ícono si existe */}
        {equipo.icono_url && (
          <Image
            src={equipo.icono_url}
            alt={`Ícono de ${equipo.nombre}`}
            width={64}
            height={64}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 object-contain opacity-40"
            sizes="64px"
          />
        )}
      </div>

      {/* Contenido del card */}
      <div className="p-6 space-y-4">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 gap-4">
          {/* Puntos totales */}
          <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Puntos</p>
            <p className="text-3xl font-bold text-[#f7b801]">
              {equipo.puntos_totales.toLocaleString()}
            </p>
          </div>

          {/* Estudiantes */}
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Estudiantes</p>
            <p className="text-3xl font-bold text-[#00d9ff]">
              {cantidadEstudiantes}
            </p>
          </div>
        </div>

        {/* Paleta de colores */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Colores del equipo:</p>
          <div className="flex gap-2">
            <div className="flex-1 text-center">
              <div
                className="h-12 rounded-lg border-2 border-white shadow-md"
                style={{ backgroundColor: equipo.color_primario }}
              />
              <p className="text-xs font-mono text-gray-600 mt-1">
                {equipo.color_primario}
              </p>
            </div>
            <div className="flex-1 text-center">
              <div
                className="h-12 rounded-lg border-2 border-white shadow-md"
                style={{ backgroundColor: equipo.color_secundario }}
              />
              <p className="text-xs font-mono text-gray-600 mt-1">
                {equipo.color_secundario}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          {/* Botón editar */}
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(equipo)}
          >
            ✏️ Editar
          </Button>

          {/* Botón recalcular puntos */}
          {onRecalcularPuntos && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRecalcularPuntos(equipo)}
              title="Recalcular puntos del equipo"
            >
              🔄
            </Button>
          )}

          {/* Botón eliminar */}
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            🗑️
          </Button>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="text-center mb-4">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-[#2a1a5e] mb-2">
                ¿Eliminar equipo?
              </h3>
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar el equipo{' '}
                <strong className="text-[#2a1a5e]">&quot;{equipo.nombre}&quot;</strong>?
              </p>
              {cantidadEstudiantes > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>{cantidadEstudiantes}</strong>{' '}
                    {cantidadEstudiantes === 1 ? 'estudiante' : 'estudiantes'}{' '}
                    {cantidadEstudiantes === 1
                      ? 'será desvinculado'
                      : 'serán desvinculados'}{' '}
                    del equipo (pero no eliminados).
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
