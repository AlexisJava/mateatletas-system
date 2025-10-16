'use client';
import { Button } from '@/components/ui';
import { getErrorMessage } from '@/lib/utils/error-handler';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/admin.store';
import {
  getModulosByProducto,
  createModulo,
  updateModulo,
  deleteModulo,
  type Modulo,
  type CreateModuloDto
} from '@/lib/api/cursos.api';
import { Producto } from '@/types/catalogo.types';

export default function AdminCursosPage() {
  const router = useRouter();
  const { products, fetchProducts, isLoading } = useAdminStore();
  const [selectedCurso, setSelectedCurso] = useState<any>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loadingModulos, setLoadingModulos] = useState(false);
  const [showModuloModal, setShowModuloModal] = useState(false);
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateModuloDto>({
    titulo: '',
    descripcion: '',
    orden: 1,
    publicado: false,
  });

  useEffect(() => {
    fetchProducts(true);
  }, []);

  // Filtrar solo cursos
  const cursos = products.filter((p) => p.tipo === 'Curso' && p.activo);

  const loadModulos = async (productoId: string) => {
    setLoadingModulos(true);
    setError(null);
    try {
      const data = await getModulosByProducto(productoId);
      setModulos(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al cargar módulos'));
      setModulos([]);
    } finally {
      setLoadingModulos(false);
    }
  };

  const handleSelectCurso = async (curso: Producto) => {
    setSelectedCurso(curso);
    await loadModulos(curso.id);
  };

  const handleCreateModulo = async () => {
    if (!selectedCurso) return;

    try {
      setError(null);
      await createModulo(selectedCurso.id, formData);
      await loadModulos(selectedCurso.id);
      closeModuloModal();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al crear módulo'));
    }
  };

  const handleUpdateModulo = async () => {
    if (!editingModulo) return;

    try {
      setError(null);
      await updateModulo(editingModulo.id, formData);
      await loadModulos(selectedCurso.id);
      closeModuloModal();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al actualizar módulo'));
    }
  };

  const handleDeleteModulo = async (moduloId: string) => {
    if (!confirm('¿Estás seguro? Esto eliminará el módulo y todas sus lecciones.')) return;

    try {
      setError(null);
      await deleteModulo(moduloId);
      await loadModulos(selectedCurso.id);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al eliminar módulo'));
    }
  };

  const openCreateModal = () => {
    setEditingModulo(null);
    setFormData({
      titulo: '',
      descripcion: '',
      orden: modulos.length + 1,
      publicado: false,
    });
    setShowModuloModal(true);
  };

  const openEditModal = (modulo: Modulo) => {
    setEditingModulo(modulo);
    setFormData({
      titulo: modulo.titulo,
      descripcion: modulo.descripcion || '',
      orden: modulo.orden,
      publicado: modulo.publicado,
    });
    setShowModuloModal(true);
  };

  const closeModuloModal = () => {
    setShowModuloModal(false);
    setEditingModulo(null);
    setError(null);
  };

  const goToModulo = (moduloId: string) => {
    router.push(`/admin/cursos/${selectedCurso.id}/modulos/${moduloId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Cursos y Contenido
        </h1>
        <p className="text-gray-600">
          Crea y administra la estructura de tus cursos con módulos y lecciones
        </p>
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Cursos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Cursos Disponibles</h2>
              <p className="text-sm text-gray-500 mt-1">{cursos.length} cursos activos</p>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Cargando cursos...</div>
            ) : cursos.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No hay cursos disponibles</p>
                <Button onClick={() => router.push('/admin/productos')}>
                  Crear Curso
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cursos.map((curso) => (
                  <button
                    key={curso.id}
                    onClick={() => handleSelectCurso(curso)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                      selectedCurso?.id === curso.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{curso.nombre}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {curso.descripcion}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>${curso.precio}</span>
                      <span>Cupo: {curso.cupo_maximo || 0}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Módulos del Curso Seleccionado */}
        <div className="lg:col-span-2">
          {!selectedCurso ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Selecciona un curso
              </h3>
              <p className="text-gray-500">
                Elige un curso de la lista para gestionar sus módulos y lecciones
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCurso.nombre}</h2>
                    <p className="text-gray-600 mt-1">{selectedCurso.descripcion}</p>
                  </div>
                  <Button onClick={openCreateModal}>
                    + Nuevo Módulo
                  </Button>
                </div>
              </div>

              {loadingModulos ? (
                <div className="p-12 text-center text-gray-500">Cargando módulos...</div>
              ) : modulos.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 mb-4">
                    Este curso aún no tiene módulos. ¡Crea el primero!
                  </p>
                  <Button onClick={openCreateModal}>
                    Crear Primer Módulo
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {modulos.map((modulo) => (
                    <div key={modulo.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                              {modulo.orden}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {modulo.titulo}
                            </h3>
                            {!modulo.publicado && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                Borrador
                              </span>
                            )}
                          </div>
                          {modulo.descripcion && (
                            <p className="text-gray-600 ml-11 mb-3">{modulo.descripcion}</p>
                          )}
                          <div className="flex items-center gap-4 ml-11 text-sm text-gray-500">
                            <span>📚 {modulo.lecciones?.length || 0} lecciones</span>
                            <span>⏱️ {modulo.duracion_estimada_minutos || 0} min</span>
                            <span>⭐ {modulo.puntos_totales || 0} puntos</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => openEditModal(modulo)}
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => goToModulo(modulo.id)}
                          >
                            Ver Lecciones →
                          </Button>
                          <button
                            onClick={() => handleDeleteModulo(modulo.id)}
                            className="text-red-600 hover:text-red-700 p-2"
                            title="Eliminar módulo"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Módulo */}
      {showModuloModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingModulo ? 'Editar Módulo' : 'Crear Nuevo Módulo'}
            </h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Módulo *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Introducción al Álgebra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción del módulo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orden
                </label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={1}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="publicado"
                  checked={formData.publicado}
                  onChange={(e) => setFormData({ ...formData, publicado: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="publicado" className="ml-2 text-sm text-gray-700">
                  Publicado (visible para estudiantes)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={closeModuloModal}>
                Cancelar
              </Button>
              <Button onClick={editingModulo ? handleUpdateModulo : handleCreateModulo}>
                {editingModulo ? 'Actualizar' : 'Crear'} Módulo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
