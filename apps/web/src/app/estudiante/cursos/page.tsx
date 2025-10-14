'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCursosStore } from '@/store/cursos.store';
import { useCatalogoStore } from '@/store/catalogo.store';

// Animaciones smooth
const smoothFadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

// Componente de Card Chunky
const ChunkyCard = ({
  children,
  gradient,
  delay = 0,
  className = "",
  onClick
}: {
  children: React.ReactNode;
  gradient: string;
  delay?: number;
  className?: string;
  onClick?: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      duration: 0.3,
      delay,
      ease: [0.25, 0.1, 0.25, 1]
    }}
    onClick={onClick}
    className={`relative overflow-hidden cursor-pointer ${className}`}
    style={{
      background: gradient,
      borderRadius: '16px',
      border: '5px solid #000',
      boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 1)',
    }}
    whileHover={{
      x: -4,
      y: -4,
      boxShadow: '12px 12px 0 0 rgba(0, 0, 0, 1)',
      transition: { duration: 0.2 }
    }}
  >
    {children}
  </motion.div>
);

// Botón Chunky
const ChunkyButton = ({
  children,
  color,
  onClick,
  className = ""
}: {
  children: React.ReactNode;
  color: string;
  onClick?: () => void;
  className?: string;
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{
      x: -2,
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' }
    }}
    whileTap={{
      x: 0,
      y: 0,
      transition: { duration: 0.1 }
    }}
    className={`font-bold text-white relative ${className}`}
    style={{
      background: color,
      padding: '16px 32px',
      borderRadius: '12px',
      border: '4px solid #000',
      boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 1)',
      fontSize: '18px',
    }}
  >
    {children}
  </motion.button>
);

export default function MisCursosPage() {
  console.log('🟢 [CURSOS PAGE] Componente renderizado');

  const router = useRouter();
  const { fetchProductos, productos, isLoading: loadingCatalogo } = useCatalogoStore();
  const { setCursoActual } = useCursosStore();

  useEffect(() => {
    console.log('🟢 [CURSOS PAGE] useEffect ejecutado - fetchProductos()');
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log('🟢 [CURSOS PAGE] productos:', productos?.length || 0, 'loading:', loadingCatalogo);

  // Filtrar solo cursos activos
  const cursos = (productos || []).filter((p: any) => p.tipo === 'Curso' && p.activo);
  console.log('🟢 [CURSOS PAGE] cursos filtrados:', cursos.length);

  const handleCursoClick = async (curso: any) => {
    await setCursoActual(curso);
    router.push(`/estudiante/cursos/${curso.id}`);
  };

  const getCursoGradient = (index: number) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          {...smoothFadeIn}
          className="mb-12"
        >
          <h1 className="text-6xl font-black text-gray-900 mb-4" style={{
            textShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)'
          }}>
            📚 Mis Cursos
          </h1>
          <p className="text-2xl text-gray-700 font-medium">
            Continúa tu aprendizaje donde lo dejaste
          </p>
        </motion.div>

        {/* Loading State */}
        {loadingCatalogo && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <motion.div
                animate={{
                  rotate: 360,
                  transition: { duration: 1, repeat: Infinity, ease: 'linear' }
                }}
                className="w-16 h-16 border-8 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600 text-lg font-semibold">Cargando cursos...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loadingCatalogo && cursos.length === 0 && (
          <ChunkyCard
            gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
            className="p-12 text-center"
          >
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              ¡Comienza tu viaje de aprendizaje!
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              Aún no tienes cursos. Explora el catálogo y comienza a aprender.
            </p>
            <ChunkyButton
              color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              onClick={() => router.push('/estudiante/dashboard')}
            >
              Ver Catálogo
            </ChunkyButton>
          </ChunkyCard>
        )}

        {/* Cursos Grid */}
        {!loadingCatalogo && cursos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cursos.map((curso: any, index: number) => (
              <ChunkyCard
                key={curso.id}
                gradient={getCursoGradient(index)}
                delay={index * 0.1}
                onClick={() => handleCursoClick(curso)}
              >
                <div className="p-6">
                  {/* Header del curso */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">📖</div>
                    <div
                      className="px-3 py-1 font-black text-sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: '3px solid #000',
                      }}
                    >
                      ${curso.precio}
                    </div>
                  </div>

                  {/* Título y descripción */}
                  <h3 className="text-2xl font-black text-white mb-3" style={{
                    textShadow: '3px 3px 0 rgba(0, 0, 0, 0.2)'
                  }}>
                    {curso.nombre}
                  </h3>
                  <p className="text-white/90 mb-6 line-clamp-3 text-sm leading-relaxed">
                    {curso.descripcion}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div
                      className="p-3 text-center"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '10px',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      <div className="text-2xl font-black text-white">0%</div>
                      <div className="text-xs font-bold text-white/80 uppercase">Progreso</div>
                    </div>
                    <div
                      className="p-3 text-center"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '10px',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      <div className="text-2xl font-black text-white">{curso.cupoMaximo || 0}</div>
                      <div className="text-xs font-bold text-white/80 uppercase">Cupos</div>
                    </div>
                  </div>

                  {/* Fechas */}
                  {curso.fechaInicio && (
                    <div className="text-xs font-semibold text-white/80 mb-4">
                      📅 {new Date(curso.fechaInicio).toLocaleDateString()} - {new Date(curso.fechaFin).toLocaleDateString()}
                    </div>
                  )}

                  {/* Botón de acción */}
                  <div
                    className="w-full py-3 text-center font-black text-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '10px',
                      border: '4px solid #000',
                      boxShadow: '0 4px 0 0 rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    Continuar →
                  </div>
                </div>
              </ChunkyCard>
            ))}
          </div>
        )}

        {/* CTA para explorar más cursos */}
        {!loadingCatalogo && cursos.length > 0 && (
          <motion.div
            {...smoothFadeIn}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <ChunkyButton
              color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              onClick={() => router.push('/estudiante/dashboard')}
            >
              Explorar Más Cursos
            </ChunkyButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}
