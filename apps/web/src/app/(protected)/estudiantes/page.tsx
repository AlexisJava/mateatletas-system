'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEstudiantesStore } from '@/store/estudiantes.store';
import { Select } from '@/components/ui';
import { EstudianteCard } from '@/components/estudiantes/EstudianteCard';
import { EstudianteFormModal } from '@/components/estudiantes/EstudianteFormModal';
import { Users, Plus } from 'lucide-react';
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
      } catch (error: unknown) {
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
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 font-[family-name:var(--font-fredoka)]">
                Mis Estudiantes
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona a tus estudiantes y su progreso
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
              }}
            >
              <Plus className="w-5 h-5" />
              Agregar Estudiante
            </button>
          </div>

          {/* Filtros */}
          {estudiantes.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-300 shadow-lg p-6">
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
            <div className="bg-white rounded-xl border-2 border-gray-300 shadow-lg p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-fredoka)]">
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
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Agregar Primer Estudiante
                </button>
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
            onSuccess={async () => {
              const hadNoStudents = estudiantes.length === 0;
              console.log('🎯 onSuccess triggered!', { hadNoStudents, estudianteEdit });
              await fetchEstudiantes();

              // Si era el primer estudiante, redirigir al dashboard
              if (hadNoStudents && !estudianteEdit) {
                console.log('✅ Redirigiendo al dashboard...');
                setTimeout(() => router.push('/dashboard'), 500);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
