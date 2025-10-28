'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCursosStore } from '@/store/cursos.store';
import { getLeccion, type Leccion } from '@/lib/api/cursos.api';
import {
  contenidoVideoSchema,
  contenidoTextoSchema,
  contenidoQuizSchema,
  contenidoTareaSchema,
} from '@/lib/schemas/leccion.schema';
import DOMPurify from 'isomorphic-dompurify';

// Componente de Card Chunky
const ChunkyCard = ({
  children,
  gradient,
  className = "",
}: {
  children: React.ReactNode;
  gradient: string;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden ${className}`}
    style={{
      background: gradient,
      borderRadius: '16px',
      border: '5px solid #000',
      boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 1)',
    }}
  >
    {children}
  </div>
);

// Componente de Botón Chunky
const ChunkyButton = ({
  children,
  color,
  onClick,
  disabled = false,
  className = ""
}: {
  children: React.ReactNode;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? {
      x: -2,
      y: -2,
      transition: { duration: 0.2 }
    } : {}}
    whileTap={!disabled ? {
      x: 0,
      y: 0,
      transition: { duration: 0.1 }
    } : {}}
    className={`font-bold text-white relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    style={{
      background: disabled ? '#999' : color,
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

// Componente para Video
const VideoPlayer = ({ url }: { url: string }) => {
  // Extract YouTube ID si es YouTube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = getYouTubeId(url);

  if (youtubeId) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden border-4 border-black shadow-lg">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="Video de la lección"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden border-4 border-black shadow-lg">
      <video
        controls
        className="w-full h-full"
        src={url}
      >
        Tu navegador no soporta el elemento de video.
      </video>
    </div>
  );
};

// Componente para Texto/Lectura
const TextoContent = ({ texto }: { texto: string }) => {
  const sanitizedHtml = useMemo(
    () =>
      DOMPurify.sanitize((texto ?? '').replace(/\n/g, '<br/>'), {
        USE_PROFILES: { html: true },
      }),
    [texto],
  );

  return (
    <div
      className="prose prose-lg max-w-none p-8 bg-white rounded-lg border-4 border-black"
      style={{ boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.1)' }}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

// Componente para Quiz
const QuizContent = ({ preguntas }: { preguntas: Array<{ id: string; pregunta: string; opciones: string[]; respuesta_correcta: number }> }) => {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const handleRespuesta = (preguntaIdx: number, opcionIdx: number) => {
    setRespuestas({ ...respuestas, [preguntaIdx]: opcionIdx });
  };

  const calcularCalificacion = () => {
    const correctas = preguntas.filter((p, idx) => respuestas[idx] === p.respuesta_correcta).length;
    return Math.round((correctas / preguntas.length) * 100);
  };

  return (
    <div className="space-y-6">
      {preguntas.map((pregunta, pIdx) => (
        <ChunkyCard key={pIdx} gradient="linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)">
          <div className="p-6">
            <h3 className="text-xl font-black text-gray-900 mb-4">
              {pIdx + 1}. {pregunta.pregunta}
            </h3>
            <div className="space-y-3">
              {pregunta.opciones.map((opcion: string, oIdx: number) => (
                <button
                  key={oIdx}
                  onClick={() => handleRespuesta(pIdx, oIdx)}
                  className={`w-full text-left p-4 rounded-lg border-3 font-semibold transition ${
                    respuestas[pIdx] === oIdx
                      ? 'bg-purple-100 border-purple-500 border-4'
                      : 'bg-white border-gray-300 border-3'
                  } ${mostrarResultado && oIdx === pregunta.respuesta_correcta ? 'bg-green-100 border-green-500' : ''} ${mostrarResultado && respuestas[pIdx] === oIdx && oIdx !== pregunta.respuesta_correcta ? 'bg-red-100 border-red-500' : ''}`}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>
        </ChunkyCard>
      ))}

      {!mostrarResultado ? (
        <ChunkyButton
          color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          onClick={() => setMostrarResultado(true)}
          disabled={Object.keys(respuestas).length !== preguntas.length}
          className="w-full"
        >
          Ver Resultados
        </ChunkyButton>
      ) : (
        <ChunkyCard gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">
              {calcularCalificacion() >= 70 ? '🎉' : '💪'}
            </div>
            <h3 className="text-3xl font-black text-white mb-2" style={{
              textShadow: '3px 3px 0 rgba(0, 0, 0, 0.2)'
            }}>
              Calificación: {calcularCalificacion()}%
            </h3>
            <p className="text-white text-lg">
              {calcularCalificacion() >= 70 ? '¡Excelente trabajo!' : '¡Sigue practicando!'}
            </p>
          </div>
        </ChunkyCard>
      )}
    </div>
  );
};

export default function LeccionPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const cursoId = params?.cursoId as string;
  const leccionId = params?.leccionId as string;

  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completando, setCompletando] = useState(false);
  const [tiempoInicio, setTiempoInicio] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [puntosGanados, setpuntosGanados] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { completarLeccion } = useCursosStore();

  useEffect(() => {
    if (leccionId) {
      loadLeccion();
    }
  }, [leccionId]);

  const loadLeccion = async () => {
    setIsLoading(true);
    try {
      const data = await getLeccion(leccionId);
      setLeccion(data);
      setTiempoInicio(Date.now());
      setErrorMessage(null);
    } catch (error: unknown) {
      // Error loading lesson
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletarLeccion = async () => {
    if (!leccion) return;

    setCompletando(true);
    setErrorMessage(null);
    const tiempoInvertido = Math.round((Date.now() - tiempoInicio) / 1000 / 60); // minutos

    try {
      const result = await completarLeccion(leccionId, {
        progreso_porcentaje: 100,
        tiempo_invertido_minutos: tiempoInvertido,
      });

      if (result.success) {
        setpuntosGanados(result.puntos || 0);
        setShowSuccess(true);
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }
        redirectTimeoutRef.current = setTimeout(() => {
          router.push(`/estudiante/cursos/${cursoId}`);
        }, 3000);
      } else {
        setErrorMessage('No pudimos registrar tu avance. Intenta nuevamente.');
      }
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos registrar tu avance. Intenta nuevamente.',
      );
    } finally {
      setCompletando(false);
    }
  };

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const renderContenido = () => {
    if (!leccion) return null;

    try {
      switch (leccion.tipo_contenido) {
        case 'Video': {
          const videoParse = contenidoVideoSchema.safeParse(leccion.contenido);
          if (!videoParse.success) {
            return (
              <ChunkyCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Contenido de video inválido</h3>
                  <pre className="mt-4 text-left text-sm overflow-auto">{JSON.stringify(leccion.contenido, null, 2)}</pre>
                </div>
              </ChunkyCard>
            );
          }
          const videoContenido = videoParse.data;
          const videoUrl = videoContenido.url || videoContenido.videoUrl || '';
          if (!videoUrl || typeof videoUrl !== 'string') {
            return (
              <ChunkyCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">URL de video no disponible</h3>
                  <pre className="mt-4 text-left text-sm overflow-auto">{JSON.stringify(leccion.contenido, null, 2)}</pre>
                </div>
              </ChunkyCard>
            );
          }
          return <VideoPlayer url={videoUrl} />;
        }

        case 'Texto':
        case 'Lectura': {
          const textoParse = contenidoTextoSchema.safeParse(leccion.contenido);
          if (!textoParse.success) {
            return (
              <ChunkyCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Contenido de texto inválido</h3>
                  <pre className="mt-4 text-left text-sm overflow-auto">{JSON.stringify(leccion.contenido, null, 2)}</pre>
                </div>
              </ChunkyCard>
            );
          }
          const textoContenido = textoParse.data;
          return <TextoContent texto={textoContenido.texto || textoContenido.contenido || ''} />;
        }

        case 'Quiz': {
          const quizParse = contenidoQuizSchema.safeParse(leccion.contenido);
          if (!quizParse.success) {
            return (
              <ChunkyCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Contenido de quiz inválido</h3>
                  <pre className="mt-4 text-left text-sm overflow-auto">{JSON.stringify(leccion.contenido, null, 2)}</pre>
                </div>
              </ChunkyCard>
            );
          }
          const quizContenido = quizParse.data;
          return <QuizContent preguntas={quizContenido.preguntas} />;
        }

        case 'Tarea': {
          const tareaParse = contenidoTareaSchema.safeParse(leccion.contenido);
          if (!tareaParse.success) {
            return (
              <ChunkyCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Contenido de tarea inválido</h3>
                  <pre className="mt-4 text-left text-sm overflow-auto">{JSON.stringify(leccion.contenido, null, 2)}</pre>
                </div>
              </ChunkyCard>
            );
          }
          const tareaContenido = tareaParse.data;
          return (
            <ChunkyCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
              <div className="p-8">
                <h3 className="text-2xl font-black text-gray-900 mb-4">📋 Tarea</h3>
                <div className="prose">
                  <p className="text-gray-700">{tareaContenido.descripcion}</p>
                  {tareaContenido.instrucciones && (
                    <div className="mt-4">
                      <h4 className="font-bold">Instrucciones:</h4>
                      <p>{tareaContenido.instrucciones}</p>
                    </div>
                  )}
                </div>
              </div>
            </ChunkyCard>
          );
        }

        default:
          return (
            <ChunkyCard gradient="linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)">
              <div className="p-8">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {JSON.stringify(leccion.contenido, null, 2)}
                </pre>
              </div>
            </ChunkyCard>
          );
      }
    } catch (error: unknown) {
      return (
        <ChunkyCard gradient="linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h3 className="text-2xl font-black text-white mb-4">Error al cargar contenido</h3>
            <p className="text-white text-lg">{error instanceof Error ? error.message : 'Error desconocido'}</p>
          </div>
        </ChunkyCard>
      );
    }
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
          <p className="text-gray-600 text-lg font-semibold">Cargando lección...</p>
        </div>
      </div>
    );
  }

  if (!leccion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8 flex items-center justify-center">
        <ChunkyCard gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)">
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Lección no encontrada
            </h2>
            <ChunkyButton
              color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              onClick={() => router.push(`/estudiante/cursos/${cursoId}`)}
            >
              Volver al Curso
            </ChunkyButton>
          </div>
        </ChunkyCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push(`/estudiante/cursos/${cursoId}`)}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2 font-bold"
          >
            ← Volver al Curso
          </button>

          <ChunkyCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">
                      {leccion.tipo_contenido === 'Video' && '🎥'}
                      {leccion.tipo_contenido === 'Texto' && '📝'}
                      {leccion.tipo_contenido === 'Quiz' && '❓'}
                      {leccion.tipo_contenido === 'Tarea' && '📋'}
                      {leccion.tipo_contenido === 'Lectura' && '📚'}
                      {leccion.tipo_contenido === 'Practica' && '⚡'}
                      {leccion.tipo_contenido === 'JuegoInteractivo' && '🎮'}
                    </span>
                    <div>
                      <h1 className="text-3xl font-black text-white" style={{
                        textShadow: '3px 3px 0 rgba(0, 0, 0, 0.2)'
                      }}>
                        {leccion.titulo}
                      </h1>
                      <p className="text-white/90 mt-1">{leccion.descripcion}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="px-4 py-2 mb-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: '3px solid #000',
                    }}
                  >
                    <div className="text-2xl font-black text-purple-600">⭐ {leccion.puntos}</div>
                    <div className="text-xs font-bold text-gray-600">Puntos</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 text-white/90 font-semibold">
                <span>⏱️ {leccion.duracion_estimada_minutos} min</span>
                <span className="px-2 py-1 bg-white/20 rounded-lg border-2 border-white/30">
                  {leccion.tipo_contenido}
                </span>
              </div>
            </div>
          </ChunkyCard>
        </motion.div>

        {/* Contenido de la Lección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {renderContenido()}
        </motion.div>

        {/* Botón de Completar */}
        {!showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <ChunkyButton
              color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              onClick={handleCompletarLeccion}
              disabled={completando}
              className="text-xl px-12 py-5"
            >
              {completando ? 'Completando...' : '✓ Completar Lección'}
            </ChunkyButton>
            {errorMessage && (
              <p className="mt-4 text-sm font-semibold text-red-500">{errorMessage}</p>
            )}
          </motion.div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <ChunkyCard gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-8xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="text-4xl font-black text-white mb-4" style={{
                  textShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)'
                }}>
                  ¡Lección Completada!
                </h2>
                <div className="text-6xl font-black text-white mb-2">
                  +{puntosGanados} puntos
                </div>
                <p className="text-white text-xl">
                  ¡Excelente trabajo! Redirigiendo...
                </p>
              </div>
            </ChunkyCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}

useEffect(() => {
  return () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
  };
}, []);
