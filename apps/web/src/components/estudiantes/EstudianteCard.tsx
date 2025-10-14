'use client';

import { Avatar, Badge, Button } from '@/components/ui';
import { Edit, Trash2, Eye } from 'lucide-react';
import type { Estudiante } from '@/types/estudiante';

interface EstudianteCardProps {
  estudiante: Estudiante;
  onEdit: (estudiante: Estudiante) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

/**
 * Card para mostrar información de un estudiante
 * Con acciones de ver, editar y eliminar
 */
export function EstudianteCard({
  estudiante,
  onEdit,
  onDelete,
  onView,
}: EstudianteCardProps) {
  const calcularEdad = () => {
    const hoy = new Date();
    const nacimiento = new Date(estudiante.fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <div className="bg-white rounded-2xl border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all duration-200">
      {/* Avatar y nombre */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar
          src={estudiante.foto_url}
          alt={`${estudiante.nombre} ${estudiante.apellido}`}
          size="lg"
          fallback={`${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`}
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#2a1a5e]">
            {estudiante.nombre} {estudiante.apellido}
          </h3>
          <p className="text-sm text-gray-600">{calcularEdad()} años</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Nivel:</span>
          <Badge variant="info">{estudiante.nivel_escolar}</Badge>
        </div>

        {estudiante.equipo && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Equipo:</span>
            <Badge
              variant="default"
            >
              <span
                style={{
                  color: estudiante.equipo.color_primario,
                }}
              >
                {estudiante.equipo.nombre}
              </span>
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Nivel:</span>
          <Badge variant="warning">Nivel {estudiante.nivel_actual}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Puntos:</span>
          <span className="font-bold text-[#f7b801]">
            {estudiante.puntos_totales} pts
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView(estudiante.id)}
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(estudiante)}
        >
          <Edit className="w-4 h-4 mr-1" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(estudiante.id)}
          className="text-red-600 hover:bg-red-100"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
