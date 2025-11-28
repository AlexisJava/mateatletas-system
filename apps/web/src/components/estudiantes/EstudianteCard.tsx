// @ts-nocheck
'use client';

import { Edit, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import type { Estudiante } from '@/types/estudiante';

interface EstudianteCardProps {
  estudiante: Estudiante;
  onEdit: (_estudiante: Estudiante) => void;
  onDelete: (_id: string) => void;
  onView: (_id: string) => void;
}

/**
 * Card para mostrar información de un estudiante
 * Con acciones de ver, editar y eliminar
 */
export function EstudianteCard({ estudiante, onEdit, onDelete, onView }: EstudianteCardProps) {
  const edad = estudiante.edad;

  const initials = `${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`.toUpperCase();

  return (
    <div className="bg-white rounded-xl border-2 border-gray-300 shadow-lg p-6 hover:shadow-xl transition-all duration-200">
      {/* Avatar y nombre */}
      <div className="flex items-center gap-4 mb-4">
        {estudiante.foto_url ? (
          <Image
            src={estudiante.foto_url}
            alt={`${estudiante.nombre} ${estudiante.apellido}`}
            width={64}
            height={64}
            className="w-16 h-16 rounded-lg object-cover shadow-md"
            sizes="64px"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md"
            style={{
              background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
            }}
          >
            {initials}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-fredoka)]">
            {estudiante.nombre} {estudiante.apellido}
          </h3>
          <p className="text-sm text-gray-600">{edad} años</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Nivel:</span>
          <span className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-semibold">
            {estudiante.nivel_escolar}
          </span>
        </div>

        {estudiante.equipo && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Equipo:</span>
            <span
              className="px-3 py-1 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: `${estudiante.equipo.color_primario}20`,
                color: estudiante.equipo.color_primario,
              }}
            >
              {estudiante.equipo.nombre}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Nivel:</span>
          <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-sm font-semibold">
            Nivel {estudiante.nivel_actual}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Puntos:</span>
          <span className="font-bold text-amber-600">{estudiante.puntos_totales} pts</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(estudiante.id)}
          className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-1"
        >
          <Eye className="w-4 h-4" />
          Ver
        </button>
        <button
          onClick={() => onEdit(estudiante)}
          className="flex-1 px-4 py-2 rounded-lg text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-1"
          style={{
            background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
          }}
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete(estudiante.id)}
          className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
