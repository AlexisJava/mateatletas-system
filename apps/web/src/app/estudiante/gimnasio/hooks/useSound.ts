'use client';

import { useRef, useCallback } from 'react';

type SupportedAudioContext = AudioContext;
type AudioContextConstructor = typeof AudioContext;

const getAudioContextConstructor = (): AudioContextConstructor => {
  const globalWindow = window as typeof window & {
    webkitAudioContext?: AudioContextConstructor;
  };

  if (typeof globalWindow.AudioContext === 'function') {
    return globalWindow.AudioContext;
  }

  if (typeof globalWindow.webkitAudioContext === 'function') {
    return globalWindow.webkitAudioContext;
  }

  throw new Error('Web Audio API no está soportado en este navegador');
};

export function useSound() {
  // Usamos el Web Audio API para generar sonidos sintéticos
  const audioContext = useRef<SupportedAudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContext.current) {
      const AudioContextCtor = getAudioContextConstructor();
      audioContext.current = new AudioContextCtor();
    }
    return audioContext.current;
  }, []);

  const playHoverSound = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sonido sutil de "hover" - tono alto y corto
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }, [getAudioContext]);

  const playClickSound = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sonido de "zap" eléctrico - frecuencia que baja rápido
    oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }, [getAudioContext]);

  const playWhooshSound = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sonido de "whoosh" - frecuencia ascendente
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }, [getAudioContext]);

  const playAmbientLoop = useCallback(() => {
    const ctx = getAudioContext();

    // Música ambiente científica - acordes sutiles
    const frequencies = [261.63, 329.63, 392.0]; // Do, Mi, Sol (acorde C mayor)

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      // Volumen muy bajo para ambiente
      gainNode.gain.setValueAtTime(0.02, ctx.currentTime + index * 0.1);
      gainNode.gain.setValueAtTime(0.02, ctx.currentTime + 3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5);

      oscillator.start(ctx.currentTime + index * 0.1);
      oscillator.stop(ctx.currentTime + 5);
    });
  }, [getAudioContext]);

  return {
    playHoverSound,
    playClickSound,
    playWhooshSound,
    playAmbientLoop,
  };
}
