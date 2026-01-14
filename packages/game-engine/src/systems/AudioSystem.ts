/**
 * AudioSystem - Unified Audio Handler for Game Scenes
 *
 * Provee una API simplificada para manejar audio en juegos educativos:
 * - Preload de assets de audio
 * - Reproducción de SFX (efectos de sonido)
 * - Reproducción de música de fondo con controles
 * - Control de volumen por categoría
 *
 * Usa el SoundManager de Phaser (auto-detecta Web Audio vs HTML5 Audio).
 */

import type Phaser from 'phaser';

// ============================================================================
// Types
// ============================================================================

/** Configuración de audio global */
interface AudioConfig {
  /** Volumen master (0-1), afecta todo */
  masterVolume: number;
  /** Volumen de efectos de sonido (0-1) */
  sfxVolume: number;
  /** Volumen de música (0-1) */
  musicVolume: number;
  /** Si el audio está muteado */
  muted: boolean;
}

/** Configuración para reproducir un sonido */
interface SoundConfig {
  /** Volumen del sonido (0-1), default: 1 */
  volume?: number;
  /** Si el sonido debe repetirse */
  loop?: boolean;
  /** Velocidad de reproducción (0.5-2), default: 1 */
  rate?: number;
  /** Delay antes de reproducir en ms */
  delay?: number;
}

/** Entrada de audio registrada para preload */
interface AudioEntry {
  key: string;
  url: string;
}

/** Referencia a un sonido en reproducción */
interface PlayingSound {
  key: string;
  sound: Phaser.Sound.BaseSound;
}

// ============================================================================
// AudioSystem Class
// ============================================================================

/**
 * Sistema de audio para escenas de juego
 *
 * @example
 * // En una escena
 * class MyScene extends BaseScene {
 *   private audioSystem!: AudioSystem;
 *
 *   preload() {
 *     this.audioSystem = new AudioSystem(this);
 *     this.audioSystem
 *       .register('click', '/audio/click.mp3')
 *       .register('bgm', '/audio/music.mp3');
 *   }
 *
 *   create() {
 *     // Música de fondo
 *     this.audioSystem.playMusic('bgm', { loop: true });
 *
 *     // SFX en evento
 *     button.on('pointerdown', () => this.audioSystem.playSfx('click'));
 *   }
 * }
 */
export class AudioSystem {
  private scene: Phaser.Scene;
  private config: AudioConfig;
  private registeredAudio: AudioEntry[] = [];
  private currentMusic: PlayingSound | null = null;
  private activeSfx: PlayingSound[] = [];

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(scene: Phaser.Scene, config?: Partial<AudioConfig>) {
    this.scene = scene;
    this.config = {
      masterVolume: config?.masterVolume ?? 1,
      sfxVolume: config?.sfxVolume ?? 1,
      musicVolume: config?.musicVolume ?? 0.7,
      muted: config?.muted ?? false,
    };
  }

  // ============================================================================
  // Registration & Preload
  // ============================================================================

  /**
   * Registra un archivo de audio para preload
   * Debe llamarse en preload() de la escena
   *
   * @param key - Identificador único del sonido
   * @param url - URL del archivo de audio
   */
  register(key: string, url: string): this {
    this.registeredAudio.push({ key, url });
    this.scene.load.audio(key, url);
    return this;
  }

  /**
   * Verifica si un audio está cargado
   */
  isLoaded(key: string): boolean {
    return this.scene.cache.audio.exists(key);
  }

  // ============================================================================
  // SFX (Sound Effects)
  // ============================================================================

  /**
   * Reproduce un efecto de sonido
   * Los SFX pueden solaparse (múltiples instancias simultáneas)
   *
   * @param key - Key del sonido registrado
   * @param config - Configuración opcional
   */
  playSfx(key: string, config?: SoundConfig): this {
    if (this.config.muted) return this;
    if (!this.isLoaded(key)) {
      console.warn(`[AudioSystem] SFX not loaded: ${key}`);
      return this;
    }

    const volume = this.calculateVolume(config?.volume ?? 1, this.config.sfxVolume);

    const sound = this.scene.sound.add(key, {
      volume,
      loop: config?.loop ?? false,
      rate: config?.rate ?? 1,
      delay: config?.delay ?? 0,
    });

    sound.play();

    const entry: PlayingSound = { key, sound };
    this.activeSfx.push(entry);

    // Cleanup cuando termina
    sound.once('complete', () => {
      this.removeSfxEntry(entry);
    });

    return this;
  }

  /**
   * Detiene todos los SFX activos
   */
  stopAllSfx(): this {
    for (const entry of this.activeSfx) {
      entry.sound.stop();
      entry.sound.destroy();
    }
    this.activeSfx = [];
    return this;
  }

  private removeSfxEntry(entry: PlayingSound): void {
    const index = this.activeSfx.indexOf(entry);
    if (index !== -1) {
      this.activeSfx.splice(index, 1);
    }
  }

  // ============================================================================
  // Music
  // ============================================================================

  /**
   * Reproduce música de fondo
   * Solo puede haber una música activa a la vez
   *
   * @param key - Key del audio registrado
   * @param config - Configuración opcional
   */
  playMusic(key: string, config?: SoundConfig): this {
    // Detener música anterior si existe
    this.stopMusic();

    if (this.config.muted) return this;
    if (!this.isLoaded(key)) {
      console.warn(`[AudioSystem] Music not loaded: ${key}`);
      return this;
    }

    const volume = this.calculateVolume(config?.volume ?? 1, this.config.musicVolume);

    const sound = this.scene.sound.add(key, {
      volume,
      loop: config?.loop ?? true,
      rate: config?.rate ?? 1,
      delay: config?.delay ?? 0,
    });

    sound.play();

    this.currentMusic = { key, sound };
    return this;
  }

  /**
   * Detiene la música actual
   */
  stopMusic(): this {
    if (this.currentMusic) {
      this.currentMusic.sound.stop();
      this.currentMusic.sound.destroy();
      this.currentMusic = null;
    }
    return this;
  }

  /**
   * Pausa la música actual
   */
  pauseMusic(): this {
    if (this.currentMusic) {
      this.currentMusic.sound.pause();
    }
    return this;
  }

  /**
   * Reanuda la música pausada
   */
  resumeMusic(): this {
    if (this.currentMusic) {
      this.currentMusic.sound.resume();
    }
    return this;
  }

  /**
   * Verifica si hay música reproduciéndose
   */
  isMusicPlaying(): boolean {
    if (!this.currentMusic) return false;
    return this.currentMusic.sound.isPlaying;
  }

  // ============================================================================
  // Volume Control
  // ============================================================================

  /**
   * Establece el volumen master (afecta todo el audio)
   */
  setMasterVolume(volume: number): this {
    this.config.masterVolume = this.clampVolume(volume);
    this.updateAllVolumes();
    return this;
  }

  /**
   * Establece el volumen de efectos de sonido
   */
  setSfxVolume(volume: number): this {
    this.config.sfxVolume = this.clampVolume(volume);
    this.updateSfxVolumes();
    return this;
  }

  /**
   * Establece el volumen de música
   */
  setMusicVolume(volume: number): this {
    this.config.musicVolume = this.clampVolume(volume);
    this.updateMusicVolume();
    return this;
  }

  /**
   * Obtiene la configuración actual de volumen
   */
  getConfig(): Readonly<AudioConfig> {
    return { ...this.config };
  }

  // ============================================================================
  // Mute Control
  // ============================================================================

  /**
   * Mutea todo el audio
   */
  mute(): this {
    this.config.muted = true;
    this.scene.sound.mute = true;
    return this;
  }

  /**
   * Desmutea el audio
   */
  unmute(): this {
    this.config.muted = false;
    this.scene.sound.mute = false;
    return this;
  }

  /**
   * Toggle mute
   */
  toggleMute(): this {
    if (this.config.muted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this;
  }

  /**
   * Verifica si el audio está muteado
   */
  isMuted(): boolean {
    return this.config.muted;
  }

  // ============================================================================
  // Volume Helpers
  // ============================================================================

  private calculateVolume(baseVolume: number, categoryVolume: number): number {
    return baseVolume * categoryVolume * this.config.masterVolume;
  }

  private clampVolume(volume: number): number {
    return Math.max(0, Math.min(1, volume));
  }

  private updateAllVolumes(): void {
    this.updateSfxVolumes();
    this.updateMusicVolume();
  }

  private updateSfxVolumes(): void {
    for (const entry of this.activeSfx) {
      const newVolume = this.calculateVolume(1, this.config.sfxVolume);
      this.setSoundVolume(entry.sound, newVolume);
    }
  }

  private updateMusicVolume(): void {
    if (this.currentMusic) {
      const newVolume = this.calculateVolume(1, this.config.musicVolume);
      this.setSoundVolume(this.currentMusic.sound, newVolume);
    }
  }

  /**
   * Sets volume on a BaseSound instance
   * Uses the setVolume method available on WebAudioSound/HTML5AudioSound
   */
  private setSoundVolume(sound: Phaser.Sound.BaseSound, volume: number): void {
    // BaseSound has setVolume in the concrete implementations
    // We use a type-safe approach by checking the method exists
    if ('setVolume' in sound && typeof sound.setVolume === 'function') {
      sound.setVolume(volume);
    }
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Limpia todos los recursos de audio
   */
  destroy(): void {
    this.stopMusic();
    this.stopAllSfx();
    this.registeredAudio = [];
  }
}
