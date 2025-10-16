'use client';
import { Button } from '@/components/ui';
import { getErrorMessage } from '@/lib/utils/error-handler';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getModulo,
  getLeccionesByModulo,
  createLeccion,
  updateLeccion,
  deleteLeccion,
  TipoContenido,
  type Modulo,
  type Leccion,
  type CreateLeccionDto,
} from '@/lib/api/cursos.api';

const TIPOS_CONTENIDO = [
  { value: 'Video', label: '🎥 Video', icon: '🎥' },
  { value: 'Texto', label: '📝 Texto', icon: '📝' },
  { value: 'Quiz', label: '❓ Quiz', icon: '❓' },
  { value: 'Tarea', label: '📋 Tarea', icon: '📋' },
  { value: 'Lectura', label: '📚 Lectura', icon: '📚' },
  { value: 'Practica', label: '⚡ Práctica', icon: '⚡' },
  { value: 'JuegoInteractivo', label: '🎮 Juego', icon: '🎮' },
];

export default function ModuloDetailPage() {
  const router = useRouter();
  const params = useParams();
  const moduloId = params?.moduloId as string;

  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLeccionModal, setShowLeccionModal] = useState(false);
  const [editingLeccion, setEditingLeccion] = useState<Leccion | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateLeccionDto>({
    titulo: '',
    descripcion: '',
    tipo_contenido: TipoContenido.Texto,
    contenido: {},
    orden: 1,
    duracion_estimada_minutos: 10,
    puntos: 10,
    publicado: false,
  });

  useEffect(() => {
    if (moduloId) {
      loadData();
    }
  }, [moduloId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [moduloData, leccionesData] = await Promise.all([
        getModulo(moduloId),
        getLeccionesByModulo(moduloId),
      ]);
      setModulo(moduloData);
      setLecciones(leccionesData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al cargar datos'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLeccion = async () => {
    try {
      setError(null);
      await createLeccion(moduloId, formData);
      await loadData();
      closeLeccionModal();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al crear lección'));
    }
  };

  const handleUpdateLeccion = async () => {
    if (!editingLeccion) return;

    try {
      setError(null);
      await updateLeccion(editingLeccion.id, formData);
      await loadData();
      closeLeccionModal();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al actualizar lección'));
    }
  };

  const handleDeleteLeccion = async (leccionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta lección?')) return;

    try {
      setError(null);
      await deleteLeccion(leccionId);
      await loadData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al eliminar lección'));
    }
  };

  const openCreateModal = () => {
    setEditingLeccion(null);
    setFormData({
      titulo: '',
      descripcion: '',
      tipo_contenido: TipoContenido.Texto,
      contenido: {},
      orden: lecciones.length + 1,
      duracion_estimada_minutos: 10,
      puntos: 10,
      publicado: false,
    });
    setShowLeccionModal(true);
  };

  const openEditModal = (leccion: Leccion) => {
    setEditingLeccion(leccion);
    setFormData({
      titulo: leccion.titulo,
      descripcion: leccion.descripcion || '',
      tipo_contenido: leccion.tipo_contenido,
      contenido: leccion.contenido,
      orden: leccion.orden,
      duracion_estimada_minutos: leccion.duracion_estimada_minutos,
      puntos: leccion.puntos,
      publicado: leccion.publicado,
      leccion_prerequisito_id: leccion.leccion_prerequisito_id || undefined,
    });
    setShowLeccionModal(true);
  };

  const closeLeccionModal = () => {
    setShowLeccionModal(false);
    setEditingLeccion(null);
    setError(null);
  };

  const getTipoIcon = (tipo: string) => {
    return TIPOS_CONTENIDO.find(t => t.value === tipo)?.icon || '📄';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-500">Cargando módulo...</div>
        </div>
      </div>
    );
  }

  if (!modulo) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-500">Error: Módulo no encontrado</div>
          <Button onClick={() => router.push('/admin/cursos')} className="mt-4">
            Volver a Cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/cursos')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Volver a Cursos
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{modulo.titulo}</h1>
            {modulo.descripcion && (
              <p className="text-gray-600">{modulo.descripcion}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span>📚 {lecciones.length} lecciones</span>
              <span>⏱️ {modulo.duracion_estimada_minutos} min</span>
              <span>⭐ {modulo.puntos_totales} puntos</span>
              {!modulo.publicado && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                  Borrador
                </span>
              )}
            </div>
          </div>
          <Button onClick={openCreateModal}>
            + Nueva Lección
          </Button>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Lista de Lecciones */}
      {lecciones.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">
            Este módulo aún no tiene lecciones. ¡Crea la primera!
          </p>
          <Button onClick={openCreateModal}>
            Crear Primera Lección
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {lecciones.map((leccion) => (
            <div key={leccion.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                      {leccion.orden}
                    </span>
                    <span className="text-2xl">{getTipoIcon(leccion.tipo_contenido)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {leccion.titulo}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                          {leccion.tipo_contenido}
                        </span>
                        {!leccion.publicado && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                            Borrador
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {leccion.descripcion && (
                    <p className="text-gray-600 ml-11 mb-3">{leccion.descripcion}</p>
                  )}
                  <div className="flex items-center gap-4 ml-11 text-sm text-gray-500">
                    <span>⏱️ {leccion.duracion_estimada_minutos} min</span>
                    <span>⭐ {leccion.puntos} puntos</span>
                    {leccion.leccion_prerequisito_id && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                        🔒 Requiere lección anterior
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => openEditModal(leccion)}>
                    Editar
                  </Button>
                  <button
                    onClick={() => handleDeleteLeccion(leccion.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Eliminar lección"
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

      {/* Modal Crear/Editar Lección */}
      {showLeccionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingLeccion ? 'Editar Lección' : 'Crear Nueva Lección'}
            </h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título de la Lección *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Introducción a las ecuaciones lineales"
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
                  rows={2}
                  placeholder="Breve descripción de la lección..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Contenido *
                  </label>
                  <select
                    value={formData.tipo_contenido}
                    onChange={(e) => setFormData({ ...formData, tipo_contenido: e.target.value as TipoContenido })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TIPOS_CONTENIDO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (minutos) *
                  </label>
                  <input
                    type="number"
                    value={formData.duracion_estimada_minutos}
                    onChange={(e) => setFormData({ ...formData, duracion_estimada_minutos: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                    max={30}
                    placeholder="5-30 min (Microlearning)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recomendado: 5-15 min (Microlearning)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puntos *
                  </label>
                  <input
                    type="number"
                    value={formData.puntos}
                    onChange={(e) => setFormData({ ...formData, puntos: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={5}
                    max={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    5-50 puntos según dificultad
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido (JSON) *
                </label>
                <textarea
                  value={JSON.stringify(formData.contenido, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData({ ...formData, contenido: parsed });
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={6}
                  placeholder={`{\n  "url": "https://www.youtube.com/watch?v=...",\n  "texto": "Contenido de la lección...",\n  "preguntas": [...]\n}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Formato depende del tipo de contenido
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lección Prerequisito (opcional)
                </label>
                <select
                  value={formData.leccion_prerequisito_id || ''}
                  onChange={(e) => setFormData({ ...formData, leccion_prerequisito_id: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin prerequisito</option>
                  {lecciones.map((lec) => (
                    <option key={lec.id} value={lec.id} disabled={lec.id === editingLeccion?.id}>
                      {lec.orden}. {lec.titulo}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  🔒 Progressive Disclosure: La lección se desbloqueará al completar el prerequisito
                </p>
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

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="secondary" onClick={closeLeccionModal}>
                Cancelar
              </Button>
              <Button onClick={editingLeccion ? handleUpdateLeccion : handleCreateLeccion}>
                {editingLeccion ? 'Actualizar' : 'Crear'} Lección
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
