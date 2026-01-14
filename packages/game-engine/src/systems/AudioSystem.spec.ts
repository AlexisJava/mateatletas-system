/**
 * AudioSystem Tests
 *
 * Tests unitarios para el sistema de audio.
 * Usa mocks de Phaser para evitar dependencias de browser.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioSystem } from './AudioSystem';
import type Phaser from 'phaser';

// ============================================================================
// Mocks
// ============================================================================

interface MockSoundConfig {
  volume?: number;
  loop?: boolean;
  rate?: number;
  delay?: number;
}

class MockSound {
  isPlaying = true;
  private volume: number;
  private listeners = new Map<string, Set<() => void>>();

  constructor(config?: MockSoundConfig) {
    this.volume = config?.volume ?? 1;
  }

  play(): void {
    this.isPlaying = true;
  }

  stop(): void {
    this.isPlaying = false;
  }

  pause(): void {
    this.isPlaying = false;
  }

  resume(): void {
    this.isPlaying = true;
  }

  destroy(): void {
    this.listeners.clear();
  }

  setVolume(vol: number): void {
    this.volume = vol;
  }

  getVolume(): number {
    return this.volume;
  }

  once(event: string, callback: () => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // Helper para simular eventos en tests
  emit(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        cb();
      }
    }
  }
}

class MockSoundManager {
  mute = false;
  private sounds: MockSound[] = [];

  add(_key: string, config?: MockSoundConfig): MockSound {
    const sound = new MockSound(config);
    this.sounds.push(sound);
    return sound;
  }

  getAllSounds(): MockSound[] {
    return this.sounds;
  }
}

class MockAudioCache {
  private loadedKeys = new Set<string>();

  exists(key: string): boolean {
    return this.loadedKeys.has(key);
  }

  // Helper para simular carga
  markLoaded(key: string): void {
    this.loadedKeys.add(key);
  }
}

class MockCache {
  audio = new MockAudioCache();
}

class MockLoader {
  audio(_key: string, _url: string): void {
    // En tests reales esto registraría el asset
  }
}

interface MockScene {
  sound: MockSoundManager;
  cache: MockCache;
  load: MockLoader;
}

function createMockScene(): MockScene {
  return {
    sound: new MockSoundManager(),
    cache: new MockCache(),
    load: new MockLoader(),
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('AudioSystem', () => {
  let scene: MockScene;
  let audioSystem: AudioSystem;

  beforeEach(() => {
    scene = createMockScene();
    audioSystem = new AudioSystem(scene as unknown as Phaser.Scene);
  });

  // ==========================================================================
  // Constructor & Config
  // ==========================================================================

  describe('constructor', () => {
    it('should create an AudioSystem instance', () => {
      expect(audioSystem).toBeInstanceOf(AudioSystem);
    });

    it('should use default config values', () => {
      const config = audioSystem.getConfig();
      expect(config.masterVolume).toBe(1);
      expect(config.sfxVolume).toBe(1);
      expect(config.musicVolume).toBe(0.7);
      expect(config.muted).toBe(false);
    });

    it('should accept custom config', () => {
      const customAudio = new AudioSystem(scene as unknown as Phaser.Scene, {
        masterVolume: 0.5,
        sfxVolume: 0.8,
        musicVolume: 0.3,
        muted: true,
      });
      const config = customAudio.getConfig();
      expect(config.masterVolume).toBe(0.5);
      expect(config.sfxVolume).toBe(0.8);
      expect(config.musicVolume).toBe(0.3);
      expect(config.muted).toBe(true);
    });
  });

  // ==========================================================================
  // Registration
  // ==========================================================================

  describe('registration', () => {
    it('should register audio for preload', () => {
      const loadSpy = vi.spyOn(scene.load, 'audio');
      audioSystem.register('click', '/audio/click.mp3');
      expect(loadSpy).toHaveBeenCalledWith('click', '/audio/click.mp3');
    });

    it('should support method chaining', () => {
      const result = audioSystem
        .register('click', '/audio/click.mp3')
        .register('bgm', '/audio/bgm.mp3');
      expect(result).toBe(audioSystem);
    });

    it('should check if audio is loaded', () => {
      expect(audioSystem.isLoaded('click')).toBe(false);
      scene.cache.audio.markLoaded('click');
      expect(audioSystem.isLoaded('click')).toBe(true);
    });
  });

  // ==========================================================================
  // SFX
  // ==========================================================================

  describe('SFX playback', () => {
    beforeEach(() => {
      scene.cache.audio.markLoaded('click');
      scene.cache.audio.markLoaded('hit');
    });

    it('should play SFX', () => {
      const addSpy = vi.spyOn(scene.sound, 'add');
      audioSystem.playSfx('click');
      expect(addSpy).toHaveBeenCalledWith('click', expect.any(Object));
    });

    it('should not play SFX when muted', () => {
      const addSpy = vi.spyOn(scene.sound, 'add');
      audioSystem.mute();
      audioSystem.playSfx('click');
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('should warn when SFX not loaded', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      audioSystem.playSfx('nonexistent');
      expect(warnSpy).toHaveBeenCalledWith('[AudioSystem] SFX not loaded: nonexistent');
      warnSpy.mockRestore();
    });

    it('should stop all SFX', () => {
      audioSystem.playSfx('click');
      audioSystem.playSfx('hit');
      const sounds = scene.sound.getAllSounds();
      expect(sounds.length).toBe(2);

      audioSystem.stopAllSfx();
      // Los sonidos deberían haberse detenido
      for (const sound of sounds) {
        expect(sound.isPlaying).toBe(false);
      }
    });
  });

  // ==========================================================================
  // Music
  // ==========================================================================

  describe('music playback', () => {
    beforeEach(() => {
      scene.cache.audio.markLoaded('bgm');
    });

    it('should play music', () => {
      const addSpy = vi.spyOn(scene.sound, 'add');
      audioSystem.playMusic('bgm');
      expect(addSpy).toHaveBeenCalledWith('bgm', expect.objectContaining({ loop: true }));
    });

    it('should stop previous music when playing new', () => {
      scene.cache.audio.markLoaded('bgm2');
      audioSystem.playMusic('bgm');
      const firstMusic = scene.sound.getAllSounds()[0];

      audioSystem.playMusic('bgm2');
      expect(firstMusic.isPlaying).toBe(false);
    });

    it('should not play music when muted', () => {
      const addSpy = vi.spyOn(scene.sound, 'add');
      audioSystem.mute();
      audioSystem.playMusic('bgm');
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('should stop music', () => {
      audioSystem.playMusic('bgm');
      const music = scene.sound.getAllSounds()[0];
      expect(music.isPlaying).toBe(true);

      audioSystem.stopMusic();
      expect(music.isPlaying).toBe(false);
    });

    it('should pause and resume music', () => {
      audioSystem.playMusic('bgm');
      const music = scene.sound.getAllSounds()[0];

      audioSystem.pauseMusic();
      expect(music.isPlaying).toBe(false);

      audioSystem.resumeMusic();
      expect(music.isPlaying).toBe(true);
    });

    it('should report music playing status', () => {
      expect(audioSystem.isMusicPlaying()).toBe(false);
      audioSystem.playMusic('bgm');
      expect(audioSystem.isMusicPlaying()).toBe(true);
      audioSystem.stopMusic();
      expect(audioSystem.isMusicPlaying()).toBe(false);
    });
  });

  // ==========================================================================
  // Volume Control
  // ==========================================================================

  describe('volume control', () => {
    it('should set master volume', () => {
      audioSystem.setMasterVolume(0.5);
      expect(audioSystem.getConfig().masterVolume).toBe(0.5);
    });

    it('should set SFX volume', () => {
      audioSystem.setSfxVolume(0.3);
      expect(audioSystem.getConfig().sfxVolume).toBe(0.3);
    });

    it('should set music volume', () => {
      audioSystem.setMusicVolume(0.8);
      expect(audioSystem.getConfig().musicVolume).toBe(0.8);
    });

    it('should clamp volume to 0-1 range', () => {
      audioSystem.setMasterVolume(1.5);
      expect(audioSystem.getConfig().masterVolume).toBe(1);

      audioSystem.setMasterVolume(-0.5);
      expect(audioSystem.getConfig().masterVolume).toBe(0);
    });

    it('should support method chaining for volume', () => {
      const result = audioSystem.setMasterVolume(0.5).setSfxVolume(0.8).setMusicVolume(0.3);
      expect(result).toBe(audioSystem);
    });
  });

  // ==========================================================================
  // Mute Control
  // ==========================================================================

  describe('mute control', () => {
    it('should mute audio', () => {
      audioSystem.mute();
      expect(audioSystem.isMuted()).toBe(true);
      expect(scene.sound.mute).toBe(true);
    });

    it('should unmute audio', () => {
      audioSystem.mute();
      audioSystem.unmute();
      expect(audioSystem.isMuted()).toBe(false);
      expect(scene.sound.mute).toBe(false);
    });

    it('should toggle mute', () => {
      expect(audioSystem.isMuted()).toBe(false);
      audioSystem.toggleMute();
      expect(audioSystem.isMuted()).toBe(true);
      audioSystem.toggleMute();
      expect(audioSystem.isMuted()).toBe(false);
    });

    it('should support method chaining for mute', () => {
      const result = audioSystem.mute().unmute();
      expect(result).toBe(audioSystem);
    });
  });

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  describe('destroy', () => {
    it('should clean up all audio on destroy', () => {
      scene.cache.audio.markLoaded('click');
      scene.cache.audio.markLoaded('bgm');

      audioSystem.playSfx('click');
      audioSystem.playMusic('bgm');

      const sounds = scene.sound.getAllSounds();
      expect(sounds.length).toBe(2);

      audioSystem.destroy();

      // Todos los sonidos deberían haberse detenido
      for (const sound of sounds) {
        expect(sound.isPlaying).toBe(false);
      }
    });
  });
});
