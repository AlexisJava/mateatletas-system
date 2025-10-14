'use client';

import { useEffect, useRef } from 'react';

interface SoundEffectProps {
  sound: 'achievement' | 'levelup' | 'click' | 'success' | 'error';
  play?: boolean;
  volume?: number;
}

// Frecuencias para sonidos sintéticos
const soundFrequencies = {
  achievement: [523.25, 659.25, 783.99], // C5, E5, G5 (acorde C mayor)
  levelup: [261.63, 329.63, 392.00, 523.25, 659.25], // C4, E4, G4, C5, E5 (escalando)
  click: [800], // Click simple
  success: [523.25, 659.25], // C5, E5
  error: [392.00, 329.63], // G4, E4 (descendente)
};

export function SoundEffect({ sound, play = false, volume = 0.3 }: SoundEffectProps) {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  useEffect(() => {
    if (play && audioContextRef.current) {
      playSound(sound, volume);
    }
  }, [play, sound, volume]);

  const playSound = (soundType: keyof typeof soundFrequencies, vol: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const frequencies = soundFrequencies[soundType];
    const noteDuration = 0.15; // 150ms por nota

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      // Envelope ADSR simplificado
      const startTime = ctx.currentTime + index * noteDuration;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.01); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration); // Release

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration);
    });
  };

  return null; // Este componente no renderiza nada
}

// Hook personalizado para usar sonidos fácilmente
export function useSoundEffect() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playSound = (soundType: keyof typeof soundFrequencies, volume = 0.3) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const frequencies = soundFrequencies[soundType];
    const noteDuration = 0.15;

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = ctx.currentTime + index * noteDuration;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration);
    });
  };

  return { playSound };
}
