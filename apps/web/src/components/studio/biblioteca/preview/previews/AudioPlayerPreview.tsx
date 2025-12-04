'use client';

import React, { ReactElement, useState, useCallback, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para AudioPlayer
 */
interface AudioPlayerExampleData {
  instruccion: string;
  titulo: string;
  artista?: string;
  duracion: number; // en segundos
  mostrarProgreso?: boolean;
  mostrarVolumen?: boolean;
  permitirSaltar?: boolean;
  autoplay?: boolean;
}

/**
 * Formatea segundos a mm:ss
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Preview interactivo del componente AudioPlayer
 */
function AudioPlayerPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as AudioPlayerExampleData;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simular reproducción
  useEffect(() => {
    if (isPlaying && currentTime < data.duracion) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= data.duracion) {
            setIsPlaying(false);
            return data.duracion;
          }
          return prev + 0.1;
        });
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, data.duracion, currentTime]);

  const handlePlayPause = useCallback(() => {
    if (!interactive) return;
    if (currentTime >= data.duracion) {
      setCurrentTime(0);
    }
    setIsPlaying((prev) => !prev);
  }, [interactive, currentTime, data.duracion]);

  const handleSeek = useCallback(
    (newTime: number) => {
      if (!interactive) return;
      setCurrentTime(Math.max(0, Math.min(data.duracion, newTime)));
    },
    [interactive, data.duracion],
  );

  const handleSkipBack = useCallback(() => {
    if (!interactive || !data.permitirSaltar) return;
    handleSeek(currentTime - 10);
  }, [interactive, data.permitirSaltar, currentTime, handleSeek]);

  const handleSkipForward = useCallback(() => {
    if (!interactive || !data.permitirSaltar) return;
    handleSeek(currentTime + 10);
  }, [interactive, data.permitirSaltar, currentTime, handleSeek]);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      if (!interactive) return;
      setVolume(newVolume);
      if (newVolume > 0) setIsMuted(false);
    },
    [interactive],
  );

  const handleMuteToggle = useCallback(() => {
    if (!interactive) return;
    setIsMuted((prev) => !prev);
  }, [interactive]);

  const progress = (currentTime / data.duracion) * 100;

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Audio Player Card */}
      <div className="bg-slate-800 rounded-xl p-4 shadow-lg">
        {/* Track Info */}
        <div className="flex items-center gap-4 mb-4">
          {/* Album Art Placeholder */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{data.titulo}</h3>
            {data.artista && <p className="text-slate-400 text-sm truncate">{data.artista}</p>}
          </div>
        </div>

        {/* Progress Bar */}
        {data.mostrarProgreso !== false && (
          <div className="mb-4">
            <div
              className="h-2 bg-slate-700 rounded-full cursor-pointer overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                handleSeek(percentage * data.duracion);
              }}
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(data.duracion)}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {data.permitirSaltar && (
            <button
              type="button"
              onClick={handleSkipBack}
              disabled={!interactive}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={handlePlayPause}
            disabled={!interactive}
            className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>

          {data.permitirSaltar && (
            <button
              type="button"
              onClick={handleSkipForward}
              disabled={!interactive}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Volume Control */}
        {data.mostrarVolumen !== false && (
          <div className="flex items-center gap-3 mt-4 justify-center">
            <button
              type="button"
              onClick={handleMuteToggle}
              disabled={!interactive}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              disabled={!interactive}
              className="w-24 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="mt-4 text-center">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isPlaying ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}
          />
          {isPlaying ? 'Reproduciendo' : 'Pausado'}
        </span>
      </div>
    </div>
  );
}

/**
 * Documentación de props para AudioPlayer
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'titulo',
    type: 'string',
    description: 'Título del audio',
    required: true,
  },
  {
    name: 'artista',
    type: 'string',
    description: 'Nombre del artista o autor',
    required: false,
  },
  {
    name: 'src',
    type: 'string',
    description: 'URL del archivo de audio',
    required: true,
  },
  {
    name: 'duracion',
    type: 'number',
    description: 'Duración del audio en segundos',
    required: true,
  },
  {
    name: 'mostrarProgreso',
    type: 'boolean',
    description: 'Mostrar barra de progreso',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'mostrarVolumen',
    type: 'boolean',
    description: 'Mostrar control de volumen',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'permitirSaltar',
    type: 'boolean',
    description: 'Permitir saltar hacia adelante/atrás',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'autoplay',
    type: 'boolean',
    description: 'Reproducir automáticamente al cargar',
    required: false,
    defaultValue: 'false',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: AudioPlayerExampleData = {
  instruccion: 'Escucha el audio y responde las preguntas',
  titulo: 'Lección de Matemáticas',
  artista: 'Profesor García',
  duracion: 180, // 3 minutos
  mostrarProgreso: true,
  mostrarVolumen: true,
  permitirSaltar: true,
  autoplay: false,
};

/**
 * Definición del preview para el registry
 */
export const AudioPlayerPreview: PreviewDefinition = {
  component: AudioPlayerPreviewComponent,
  exampleData,
  propsDocumentation,
};
