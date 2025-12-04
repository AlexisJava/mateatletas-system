'use client';

import React, { ReactElement, useState, useRef, useCallback } from 'react';
import type { AudioPlayerConfig, TranscriptionLine } from './types';
import type { StudioBlockProps } from '../types';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface TranscriptionProps {
  lines: TranscriptionLine[];
  currentTime: number;
}

function Transcription({ lines, currentTime }: TranscriptionProps): ReactElement {
  return (
    <div
      data-testid="transcription-container"
      className="mt-4 p-4 bg-slate-800/50 rounded-lg max-h-48 overflow-y-auto"
    >
      <h4 className="text-sm font-medium text-slate-400 mb-3">Transcripción</h4>
      <div className="space-y-2">
        {lines.map((line, index) => {
          const nextLine = index < lines.length - 1 ? lines[index + 1] : undefined;
          const isActive =
            currentTime >= line.tiempo &&
            (index === lines.length - 1 || !nextLine || currentTime < nextLine.tiempo);
          return (
            <div
              key={index}
              className={`flex gap-3 text-sm ${isActive ? 'text-white bg-blue-900/30 -mx-2 px-2 py-1 rounded' : 'text-slate-400'}`}
            >
              <span className="text-slate-500 w-12 flex-shrink-0">{formatTime(line.tiempo)}</span>
              <span>{line.texto}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AudioPlayer({
  id,
  config,
  modo,
  disabled = false,
  onProgress,
}: StudioBlockProps<AudioPlayerConfig>): ReactElement {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const handlePlayPause = useCallback(() => {
    if (disabled) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      onProgress?.(10);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, disabled, onProgress]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      const audio = audioRef.current;
      const progress = progressRef.current;
      if (!audio || !progress) return;

      const rect = progress.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      audio.currentTime = percentage * duration;
    },
    [duration, disabled],
  );

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    if (value > 0) {
      setIsMuted(false);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsMuted(!isMuted);
    audio.muted = !isMuted;
  }, [isMuted]);

  const handleLoopToggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsLooping(!isLooping);
    audio.loop = !isLooping;
  }, [isLooping]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - AudioPlayer
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        <div className="mt-2 text-slate-400 text-sm">
          <span>Audio: {config.audioUrl}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" data-testid={`audio-player-${id}`}>
      {/* Title and instruction */}
      {config.titulo && <h2 className="text-lg font-semibold text-white mb-1">{config.titulo}</h2>}
      <p className="text-slate-300 mb-2">{config.instruccion}</p>
      {config.descripcion && <p className="text-sm text-slate-400 mb-4">{config.descripcion}</p>}

      {/* Audio element */}
      <audio
        ref={audioRef}
        data-testid="audio-element"
        src={config.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
      />

      {/* Player controls */}
      <div className="bg-slate-800 rounded-lg p-4">
        {/* Main controls row */}
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <button
            type="button"
            data-testid="play-button"
            onClick={handlePlayPause}
            disabled={disabled}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${disabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}
              transition-colors duration-150
            `}
          >
            {isPlaying ? (
              <span data-testid="pause-icon" className="text-xl">
                ⏸
              </span>
            ) : (
              <span data-testid="play-icon" className="text-xl">
                ▶
              </span>
            )}
          </button>

          {/* Progress bar */}
          <div className="flex-1">
            <div
              ref={progressRef}
              data-testid="audio-progress"
              onClick={handleProgressClick}
              className="h-2 bg-slate-700 rounded-full cursor-pointer relative"
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span data-testid="current-time" className="text-xs text-slate-400">
                {formatTime(currentTime)}
              </span>
              <span data-testid="duration" className="text-xs text-slate-400">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
          {/* Volume control */}
          <div className="flex items-center gap-2" data-testid="volume-control">
            <button
              type="button"
              data-testid="mute-button"
              onClick={handleMuteToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMuted ? (
                <span data-testid="muted-icon">🔇</span>
              ) : (
                <span data-testid="volume-icon">🔊</span>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer"
            />
          </div>

          {/* Speed control */}
          {config.mostrarVelocidad && (
            <div data-testid="speed-control" className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Velocidad:</span>
              <select className="bg-slate-700 text-white text-xs rounded px-2 py-1 border border-slate-600">
                {(config.velocidades || [0.5, 0.75, 1, 1.25, 1.5, 2]).map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Loop button */}
          {config.permitirLoop && (
            <button
              type="button"
              data-testid="loop-button"
              onClick={handleLoopToggle}
              className={`
                text-sm px-3 py-1 rounded
                ${isLooping ? 'active bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}
                transition-colors
              `}
            >
              🔁 Loop
            </button>
          )}
        </div>
      </div>

      {/* Transcription */}
      {config.transcripcion && config.transcripcion.length > 0 && (
        <Transcription lines={config.transcripcion} currentTime={currentTime} />
      )}
    </div>
  );
}
