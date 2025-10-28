/**
 * Sistema de gradientes para avatares de estudiantes
 * Inspirado en Linear, Vercel, y diseño moderno
 */

export interface AvatarGradient {
  id: number;
  name: string;
  gradient: string;
  textColor: string;
}

export const AVATAR_GRADIENTS: AvatarGradient[] = [
  {
    id: 0,
    name: 'Sunset',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
  },
  {
    id: 1,
    name: 'Ocean',
    gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    textColor: '#ffffff',
  },
  {
    id: 2,
    name: 'Forest',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    textColor: '#ffffff',
  },
  {
    id: 3,
    name: 'Fire',
    gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    textColor: '#ffffff',
  },
  {
    id: 4,
    name: 'Lavender',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    textColor: '#374151',
  },
  {
    id: 5,
    name: 'Peach',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    textColor: '#374151',
  },
  {
    id: 6,
    name: 'Sky',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    textColor: '#ffffff',
  },
  {
    id: 7,
    name: 'Berry',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    textColor: '#ffffff',
  },
  {
    id: 8,
    name: 'Midnight',
    gradient: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    textColor: '#ffffff',
  },
  {
    id: 9,
    name: 'Coral',
    gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
    textColor: '#ffffff',
  },
];

/**
 * Obtiene un gradiente por su ID
 */
export function getGradientById(id: number): AvatarGradient {
  const gradient = AVATAR_GRADIENTS.find(g => g.id === id);
  return gradient || AVATAR_GRADIENTS[0]; // Default a Sunset
}

/**
 * Obtiene las iniciales de un nombre completo
 */
export function getInitials(nombre: string, apellido: string): string {
  const primeraLetraNombre = nombre.trim()[0]?.toUpperCase() || '';
  const primeraLetraApellido = apellido.trim()[0]?.toUpperCase() || '';
  return `${primeraLetraNombre}${primeraLetraApellido}`;
}

/**
 * Genera un ID de gradiente aleatorio basado en un string (para migración)
 */
export function getRandomGradientId(seed?: string): number {
  if (!seed) return Math.floor(Math.random() * AVATAR_GRADIENTS.length);

  // Hash simple del seed para que siempre genere el mismo número
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % AVATAR_GRADIENTS.length;
}
