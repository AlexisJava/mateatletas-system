'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursosStore } from '@/store/cursos.store';
import { getLeccionesByModulo, type Leccion } from '@/lib/api/cursos.api';

// Iconos para tipos de contenido
const getTipoIcon = (tipo: string) => {
  const icons: Record<string, string> = {
    Video: '🎥',
    Texto: '📝',
    Quiz: '❓',
    Tarea: '📋',
    Lectura: '📚',
    Practica: '⚡',
    JuegoInteractivo: '🎮',
  };
  return icons[tipo] || '📄';
};

// Componente de Card Chunky
const ChunkyCard = ({
  children,
  gradient,
  className = "",
  onClick
}: {
  children: React.ReactNode;
  gradient: string;
  className?: string;
  onClick?: () => void;
}) => (
  <motion.div
    onClick={onClick}
    className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    style={{
      background: gradient,
      borderRadius: '12px',
      border: '4px solid #000',
      boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 1)',
    }}
    whileHover={onClick ? {
      x: -2,
      y: -2,
      boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 1)',
      transition: { duration: 0.2 }
    } : {}}
  >
    {children}
  </motion.div>
);

export default function CursoViewerPage() {
  const router = useRouter();
  const params = useParams();
  const cursoId = params?.cursoId as string;

  const { modulos, progreso, fetchModulosByCurso, fetchProgresoCurso, isLoading } = useCursosStore();
  const [selectedModulo, setSelectedModulo] = useState<Record<string, unknown>>(null);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [loadingLecciones, setLoadingLecciones] = useState(false);

  useEffect(() => {
    if (cursoId) {
      loadCursoData();
    }
  }, [cursoId]);

  const loadCursoData = async () => {
    await fetchModulosByCurso(cursoId);
    await fetchProgresoCurso(cursoId);
  };

  const handleModuloClick = async (modulo: { id: string; titulo: string; descripcion?: string }) => {
    setSelectedModulo(modulo);
    setLoadingLecciones(true);
    try {
      const leccionesData = await getLeccionesByModulo(modulo.id);
      setLecciones(leccionesData);
    } catch (error: unknown) {
      setLecciones([]);
    } finally {
      setLoadingLecciones(false);
    }
  };

  const handleLeccionClick = (leccion: Leccion) => {
    router.push(`/estudiante/cursos/${cursoId}/lecciones/${leccion.id}`);
  };

  const getModuloGradient = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    return gradients[index % gradients.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{
              rotate: 360,
              transition: { duration: 1, repeat: Infinity, ease: 'linear' }
            }}
            className="w-16 h-16 border-8 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg font-semibold">Cargando curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con Progreso */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/estudiante/cursos')}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2 font-bold"
          >
            ← Volver a Mis Cursos
          </button>

          <ChunkyCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-black text-gray-900 mb-2" style={{
                    textShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}>
                    📚 Contenido del Curso
                  </h1>
                  <p className="text-gray-700 text-lg">
                    {modulos.length} módulos • {progreso?.total_lecciones || 0} lecciones
                  </p>
                </div>

                {progreso && (
                  <div className="text-center">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center mb-2"
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '5px solid #000',
                        boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <span className="text-3xl font-black text-purple-600">
                        {Math.round(progreso.porcentaje_completado)}%
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-700">Progreso</p>
                  </div>
                )}
              </div>

              {/* Stats del progreso */}
              {progreso && (
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className="p-3 text-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '8px',
                      border: '3px solid #000',
                    }}
                  >
                    <div className="text-2xl font-black text-gray-900">
                      {progreso.lecciones_completadas}/{progreso.total_lecciones}
                    </div>
                    <div className="text-xs font-bold text-gray-600 uppercase">Lecciones</div>
                  </div>
                  <div
                    className="p-3 text-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '8px',
                      border: '3px solid #000',
                    }}
                  >
                    <div className="text-2xl font-black text-purple-600">
                      {progreso.puntos_ganados}
                    </div>
                    <div className="text-xs font-bold text-gray-600 uppercase">Puntos</div>
                  </div>
                  <div
                    className="p-3 text-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '8px',
                      border: '3px solid #000',
                    }}
                  >
                    <div className="text-2xl font-black text-blue-600">
                      {progreso.tiempo_total_minutos}
                    </div>
                    <div className="text-xs font-bold text-gray-600 uppercase">Minutos</div>
                  </div>
                </div>
              )}
            </div>
          </ChunkyCard>
        </motion.div>

        {/* Grid de Módulos y Lecciones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Módulos */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Módulos</h2>
            <div className="space-y-4">
              {modulos.map((modulo, index) => (
                <ChunkyCard
                  key={modulo.id}
                  gradient={getModuloGradient(index)}
                  onClick={() => handleModuloClick({
                    id: modulo.id,
                    titulo: modulo.titulo,
                    descripcion: modulo.descripcion ?? undefined
                  })}
                  className={selectedModulo?.id === modulo.id ? 'ring-4 ring-yellow-400' : ''}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full font-black text-lg"
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '3px solid #000',
                        }}
                      >
                        {modulo.orden}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-white mb-1" style={{
                          textShadow: '2px 2px 0 rgba(0, 0, 0, 0.2)'
                        }}>
                          {modulo.titulo}
                        </h3>
                        <div className="text-xs text-white/90 font-semibold">
                          {modulo.lecciones?.length || 0} lecciones • {modulo.duracion_estimada_minutos} min
                        </div>
                      </div>
                    </div>
                  </div>
                </ChunkyCard>
              ))}
            </div>
          </div>

          {/* Lista de Lecciones del Módulo Seleccionado */}
          <div className="lg:col-span-2">
            {!selectedModulo ? (
              <ChunkyCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">
                    Selecciona un Módulo
                  </h2>
                  <p className="text-gray-700 text-lg">
                    Elige un módulo de la izquierda para ver sus lecciones
                  </p>
                </div>
              </ChunkyCard>
            ) : (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-4">
                  Lecciones: {selectedModulo.titulo}
                </h2>

                {loadingLecciones ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <motion.div
                        animate={{
                          rotate: 360,
                          transition: { duration: 1, repeat: Infinity, ease: 'linear' }
                        }}
                        className="w-12 h-12 border-6 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"
                      />
                      <p className="text-gray-600 font-semibold">Cargando lecciones...</p>
                    </div>
                  </div>
                ) : lecciones.length === 0 ? (
                  <ChunkyCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
                    <div className="p-8 text-center">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-gray-700 font-semibold">
                        Este módulo aún no tiene lecciones disponibles.
                      </p>
                    </div>
                  </ChunkyCard>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {lecciones.map((leccion, index) => (
                        <motion.div
                          key={leccion.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ChunkyCard
                            gradient="linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)"
                            onClick={() => handleLeccionClick(leccion)}
                          >
                            <div className="p-5">
                              <div className="flex items-start gap-4">
                                <div
                                  className="flex items-center justify-center w-12 h-12 rounded-full font-black text-xl"
                                  style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: '3px solid #000',
                                  }}
                                >
                                  {leccion.orden}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{getTipoIcon(leccion.tipo_contenido)}</span>
                                    <h3 className="text-lg font-black text-gray-900">
                                      {leccion.titulo}
                                    </h3>
                                  </div>
                                  {leccion.descripcion && (
                                    <p className="text-gray-600 mb-3 text-sm">
                                      {leccion.descripcion}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                                    <span>⏱️ {leccion.duracion_estimada_minutos} min</span>
                                    <span>⭐ {leccion.puntos} pts</span>
                                    <span
                                      className="px-2 py-0.5 text-xs"
                                      style={{
                                        background: 'rgba(103, 126, 234, 0.1)',
                                        color: '#667eea',
                                        borderRadius: '6px',
                                        border: '2px solid #667eea',
                                      }}
                                    >
                                      {leccion.tipo_contenido}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  className="px-4 py-2 font-black text-sm"
                                  style={{
                                    background: '#43e97b',
                                    color: 'white',
                                    borderRadius: '8px',
                                    border: '3px solid #000',
                                  }}
                                >
                                  Iniciar →
                                </div>
                              </div>
                            </div>
                          </ChunkyCard>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
