'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEstudiantesStore } from '@/store/estudiantes.store';
import { Button, Select } from '@/components/ui';
import { EstudianteCard } from '@/components/estudiantes/EstudianteCard';
import { EstudianteFormModal } from '@/components/estudiantes/EstudianteFormModal';
import { Plus, Users } from 'lucide-react';
import type { Estudiante } from '@/types/estudiante';

/**
 * Página de gestión de estudiantes
 * Lista todos los estudiantes del tutor con filtros y acciones CRUD
 */
export default function EstudiantesPage() {
  const router = useRouter();
  const {
    estudiantes,
    isLoading,
    equipos,
    fetchEstudiantes,
    fetchEquipos,
    deleteEstudiante,
  } = useEstudiantesStore();

  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [estudianteEdit, setEstudianteEdit] = useState<Estudiante | null>(null);

  useEffect(() => {
    fetchEstudiantes();
    fetchEquipos();
  }, [fetchEstudiantes, fetchEquipos]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
      try {
        await deleteEstudiante(id);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleEdit = (estudiante: Estudiante) => {
    setEstudianteEdit(estudiante);
    setShowModal(true);
  };

  const handleView = (id: string) => {
    router.push(`/estudiantes/${id}`);
  };

  const handleAddNew = () => {
    setEstudianteEdit(null);
    setShowModal(true);
  };

  // Filtrar estudiantes
  const estudiantesFiltrados = (estudiantes || []).filter((e) => {
    // Filtrar valores undefined o null
    if (!e) return false;
    if (filtroNivel && e.nivel_escolar !== filtroNivel) return false;
    if (filtroEquipo && e.equipo_id !== filtroEquipo) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#2a1a5e]">Mis Estudiantes</h1>
          <p className="text-gray-600 mt-2">
            Gestiona a tus estudiantes y su progreso
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={handleAddNew}>
          <Plus className="w-5 h-5 mr-2" />
          Agregar Estudiante
        </Button>
      </div>

      {/* Filtros */}
      {estudiantes.length > 0 && (
        <div className="bg-white rounded-xl border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filtrar por nivel"
              options={[
                { value: '', label: 'Todos los niveles' },
                { value: 'Primaria', label: 'Primaria' },
                { value: 'Secundaria', label: 'Secundaria' },
                { value: 'Universidad', label: 'Universidad' },
              ]}
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
            />
            <Select
              label="Filtrar por equipo"
              options={[
                { value: '', label: 'Todos los equipos' },
                ...(equipos || []).map((eq) => ({
                  value: eq.id,
                  label: eq.nombre,
                })),
              ]}
              value={filtroEquipo}
              onChange={(e) => setFiltroEquipo(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Lista de estudiantes */}
      {estudiantesFiltrados.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-4 border-black shadow-[5px_5px_0px_rgba(0,0,0,1)] p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            {estudiantes.length === 0
              ? '¡Aún no tienes estudiantes!'
              : 'No hay estudiantes con estos filtros'}
          </h3>
          <p className="text-gray-600 mb-6">
            {estudiantes.length === 0
              ? 'Agrega tu primer estudiante para comenzar'
              : 'Intenta cambiar los filtros'}
          </p>
          {estudiantes.length === 0 && (
            <Button variant="primary" size="lg" onClick={handleAddNew}>
              <Plus className="w-5 h-5 mr-2" />
              Agregar Primer Estudiante
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {estudiantesFiltrados.map((estudiante) => (
            <EstudianteCard
              key={estudiante.id}
              estudiante={estudiante}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modal de agregar/editar */}
      <EstudianteFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEstudianteEdit(null);
        }}
        estudiante={estudianteEdit}
        onSuccess={() => {
          fetchEstudiantes();
        }}
      />
    </div>
  );
}
