import { z } from 'zod';
import { areaEnum, houseEnum } from './base.schema';

// Schema base para todos los game configs
export const baseGameConfigSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  duration: z.number().positive().optional(),
  lives: z.number().int().positive().default(3),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  area: areaEnum,
  house: houseEnum,
});

export type BaseGameConfig = z.infer<typeof baseGameConfigSchema>;

// ============================================================================
// Catcher Template Config
// ============================================================================

/** Configuración de velocidad de caída */
const fallSpeedSchema = z.object({
  min: z.number().positive().default(100),
  max: z.number().positive().default(200),
});

/** Configuración de targets (objetos que caen) */
const catcherTargetsSchema = z.object({
  /** Valores correctos que suman puntos */
  correct: z.array(z.string()).min(1),
  /** Valores incorrectos que restan vida */
  wrong: z.array(z.string()).min(1),
  /** Velocidad de caída en pixels/segundo */
  fallSpeed: fallSpeedSchema.default({}),
  /** Tiempo entre spawns en milisegundos */
  spawnRate: z.number().positive().default(1500),
});

/** Configuración del jugador (catcher) */
const catcherPlayerSchema = z.object({
  /** Velocidad de movimiento horizontal */
  speed: z.number().positive().default(400),
  /** Ancho del catcher en pixels */
  width: z.number().positive().default(100),
});

/** Schema completo para CatcherScene */
export const catcherConfigSchema = z.object({
  targets: catcherTargetsSchema,
  player: catcherPlayerSchema.default({}),
});

export type CatcherConfig = z.infer<typeof catcherConfigSchema>;

// ============================================================================
// WhackAMole Template Config
// ============================================================================

/** Configuración del grid de agujeros */
const whackGridSchema = z.object({
  /** Número de columnas */
  cols: z.number().int().min(2).max(5).default(3),
  /** Número de filas */
  rows: z.number().int().min(2).max(4).default(3),
});

/** Configuración de timing */
const whackTimingSchema = z.object({
  /** Tiempo que el mole está visible en ms */
  showTime: z.number().positive().default(1500),
  /** Tiempo entre apariciones en ms */
  spawnInterval: z.number().positive().default(1000),
});

/** Schema completo para WhackAMoleScene */
export const whackAMoleConfigSchema = z.object({
  /** Valores correctos que suman puntos */
  correct: z.array(z.string()).min(1),
  /** Valores incorrectos que restan vida */
  wrong: z.array(z.string()).min(1),
  /** Configuración del grid */
  grid: whackGridSchema.default({}),
  /** Configuración de timing */
  timing: whackTimingSchema.default({}),
});

export type WhackAMoleConfig = z.infer<typeof whackAMoleConfigSchema>;

// ============================================================================
// Shooter Template Config
// ============================================================================

/** Schema completo para ShooterScene */
export const shooterConfigSchema = z.object({
  /** Valores correctos que suman puntos */
  correct: z.array(z.string()).min(1),
  /** Valores incorrectos que restan vida */
  wrong: z.array(z.string()).min(1),
  /** Velocidad de los targets */
  targetSpeed: z.number().positive().default(80),
  /** Tiempo entre spawns en ms */
  spawnInterval: z.number().positive().default(2000),
});

export type ShooterConfig = z.infer<typeof shooterConfigSchema>;

// ============================================================================
// Dodger Template Config
// ============================================================================

/** Schema completo para DodgerScene */
export const dodgerConfigSchema = z.object({
  /** Valores correctos (items a recolectar) */
  correct: z.array(z.string()).min(1),
  /** Valores incorrectos (obstáculos a esquivar) */
  wrong: z.array(z.string()).min(1),
  /** Velocidad de caída base */
  fallSpeed: z.number().positive().default(200),
  /** Tiempo entre spawns en ms */
  spawnInterval: z.number().positive().default(800),
});

export type DodgerConfig = z.infer<typeof dodgerConfigSchema>;

// ============================================================================
// Runner Template Config
// ============================================================================

/** Schema completo para RunnerScene */
export const runnerConfigSchema = z.object({
  /** Valores correctos (saltar sobre estos) */
  correct: z.array(z.string()).min(1),
  /** Valores incorrectos (evitar chocar) */
  wrong: z.array(z.string()).min(1),
  /** Tiempo entre spawns en ms */
  spawnInterval: z.number().positive().default(2000),
});

export type RunnerConfig = z.infer<typeof runnerConfigSchema>;
