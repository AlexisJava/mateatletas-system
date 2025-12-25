import { Package, Gamepad2, Sparkles, Crown } from 'lucide-react';
import type { TierIconMap } from '../types/productos.types';

/**
 * TIER_ICON_MAP - Mapeo de iconos por tier
 */

export const TIER_ICON_MAP: TierIconMap = {
  'STEAM Libros': Gamepad2,
  'STEAM Asincronico': Sparkles,
  'STEAM Asincrónico': Sparkles,
  'STEAM Sincronico': Crown,
  'STEAM Sincrónico': Crown,
};

export const DEFAULT_TIER_ICON = Package;
