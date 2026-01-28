'use client';

import { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  getContenidoClase,
  completarLeccion,
  type ContenidoClaseResponse,
  type NodoContenido,
} from '@/lib/api/estudiante-aula.api';
import FloatingLines from '@/components/ui/FloatingLines';

interface PageProps {
  params: Promise<{
    asignacionId: string;
    claseId: string;
    tipo: 'teoria' | 'practica';
  }>;
}

export default function ContenidoLeccionPage({ params }: PageProps) {
  const { asignacionId, claseId, tipo } = use(params);
  const [data, setData] = useState<ContenidoClaseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [xpGanado, setXpGanado] = useState<number | null>(null);

  // Timer para tracking de tiempo
  const startTimeRef = useRef<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getContenidoClase(asignacionId, claseId, tipo);
        setData(response);
      } catch (err) {
        console.error('Error fetching contenido:', err);
        setError('No pudimos cargar este contenido.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [asignacionId, claseId, tipo]);

  // Timer effect
  useEffect(() => {
    if (!data) return;

    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const handleCompletar = async () => {
    if (!data || data.progreso.completada || isCompleting) return;

    setIsCompleting(true);
    try {
      const result = await completarLeccion({
        asignacionId,
        claseId,
        tipo,
        tiempoSegundos: elapsedSeconds,
      });

      if (result.success) {
        setXpGanado(result.xpGanado);
        setData({
          ...data,
          progreso: {
            ...data.progreso,
            completada: true,
            completadaEn: new Date().toISOString(),
          },
        });
      }
    } catch (err) {
      console.error('Error completing leccion:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--estudiante-bg)] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background:
                tipo === 'teoria'
                  ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                  : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              boxShadow:
                tipo === 'teoria'
                  ? '0 8px 32px rgba(6,182,212,0.5)'
                  : '0 8px 32px rgba(168,85,247,0.5)',
            }}
          >
            {tipo === 'teoria' ? (
              <FileText className="w-8 h-8 text-white animate-pulse" />
            ) : (
              <Zap className="w-8 h-8 text-white animate-pulse" />
            )}
          </div>
          <p className="text-white/70 text-lg font-bold">
            Cargando {tipo === 'teoria' ? 'teoría' : 'práctica'}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--estudiante-bg)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
              boxShadow: '0 8px 32px rgba(244,63,94,0.5)',
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Contenido no disponible</h2>
          <p className="text-white/60 mb-6">{error || 'Esta lección no está activada aún.'}</p>
          <Link
            href={`/estudiante/aula/${asignacionId}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la planificación
          </Link>
        </div>
      </div>
    );
  }

  const colors =
    tipo === 'teoria'
      ? { primary: '#06b6d4', secondary: '#0891b2', glow: 'rgba(6,182,212,0.4)' }
      : { primary: '#a855f7', secondary: '#7c3aed', glow: 'rgba(168,85,247,0.4)' };

  return (
    <div className="min-h-screen bg-[var(--estudiante-bg)] relative">
      <FloatingLines />

      {/* Header fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div
            className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Link
              href={`/estudiante/aula/${asignacionId}`}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Volver</span>
            </Link>

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                }}
              >
                {tipo === 'teoria' ? (
                  <FileText className="w-4 h-4 text-white" />
                ) : (
                  <Zap className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="text-sm">
                <span className="text-white font-bold">
                  Clase {data.clase.numero}: {tipo === 'teoria' ? 'Teoría' : 'Práctica'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className="flex items-center gap-1.5 text-white/50 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(elapsedSeconds)}</span>
              </div>

              {/* Status */}
              {data.progreso.completada && (
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Completada</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-32">
        {/* Título del contenido */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {data.contenido.titulo}
          </h1>
          {data.contenido.descripcion && (
            <p className="text-white/50">{data.contenido.descripcion}</p>
          )}
          {data.contenido.duracionMinutos && (
            <div className="flex items-center gap-2 mt-2 text-white/40 text-sm">
              <Clock className="w-4 h-4" />
              <span>~{data.contenido.duracionMinutos} minutos</span>
            </div>
          )}
        </div>

        {/* Renderizado de nodos */}
        <div className="space-y-6">
          {data.contenido.nodos.map((nodo) => (
            <NodoRenderer key={nodo.id} nodo={nodo} />
          ))}
        </div>
      </main>

      {/* Footer fijo con botón de completar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="p-4 rounded-2xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {xpGanado !== null ? (
              <div className="flex items-center justify-center gap-3 text-emerald-400">
                <Trophy className="w-6 h-6" />
                <span className="text-lg font-bold">+{xpGanado} XP ganados!</span>
                <Sparkles className="w-5 h-5" />
              </div>
            ) : data.progreso.completada ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">Ya completaste esta lección</span>
                </div>
                <Link
                  href={`/estudiante/aula/${asignacionId}`}
                  className="px-4 py-2 rounded-xl font-bold text-white transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    boxShadow: `0 4px 16px ${colors.glow}`,
                  }}
                >
                  Continuar
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-white/50 text-sm">
                  Tiempo: <span className="font-mono text-white">{formatTime(elapsedSeconds)}</span>
                </div>
                <button
                  onClick={handleCompletar}
                  disabled={isCompleting}
                  className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    boxShadow: `0 4px 16px ${colors.glow}`,
                  }}
                >
                  {isCompleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Completando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Marcar como completada</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// RENDERIZADOR DE NODOS (sin dangerouslySetInnerHTML para seguridad)
// El contenido viene sanitizado del backend, pero usamos texto plano por seguridad
// ============================================================================

interface NodoRendererProps {
  nodo: NodoContenido;
}

function NodoRenderer({ nodo }: NodoRendererProps) {
  switch (nodo.tipo) {
    case 'TEXTO':
      // Renderizamos como párrafos separados por líneas vacías
      const paragraphs = nodo.contenido.split('\n\n').filter((p) => p.trim());
      return (
        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-white/80 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      );

    case 'TITULO':
      return (
        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          {nodo.contenido}
        </h2>
      );

    case 'SUBTITULO':
      return <h3 className="text-lg font-bold text-white/90 mt-6 mb-3">{nodo.contenido}</h3>;

    case 'IMAGEN':
      return (
        <div className="rounded-xl overflow-hidden">
          <img src={nodo.contenido} alt="Contenido de la lección" className="w-full h-auto" />
        </div>
      );

    case 'VIDEO':
      // Solo permitir URLs de YouTube/Vimeo
      const isValidVideoUrl =
        nodo.contenido.includes('youtube.com') ||
        nodo.contenido.includes('youtu.be') ||
        nodo.contenido.includes('vimeo.com');
      if (!isValidVideoUrl) {
        return (
          <div className="p-4 rounded-xl bg-white/5 text-white/60">
            <p>Video no disponible</p>
          </div>
        );
      }
      return (
        <div className="rounded-xl overflow-hidden aspect-video">
          <iframe
            src={nodo.contenido}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );

    case 'CODIGO':
      return (
        <pre
          className="p-4 rounded-xl overflow-x-auto text-sm"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <code className="text-emerald-400">{nodo.contenido}</code>
        </pre>
      );

    case 'NOTA':
      return (
        <div
          className="p-4 rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.1) 100%)',
            border: '1px solid rgba(245,158,11,0.3)',
          }}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-white/80">{nodo.contenido}</p>
          </div>
        </div>
      );

    case 'IMPORTANTE':
      return (
        <div
          className="p-4 rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.1) 100%)',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-red-400 font-bold">!</span>
            <p className="text-white/80 font-medium">{nodo.contenido}</p>
          </div>
        </div>
      );

    case 'LISTA':
      const items = nodo.contenido.split('\n').filter((item) => item.trim());
      return (
        <ul className="space-y-2 ml-4">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-white/80">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'SEPARADOR':
      return <hr className="border-white/10 my-8" />;

    default:
      return (
        <div className="p-4 rounded-xl bg-white/5 text-white/60">
          <p>{nodo.contenido}</p>
        </div>
      );
  }
}
