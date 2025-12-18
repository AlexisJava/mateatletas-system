import { Server, UserLocation } from './types';

// Using percentage coordinates for responsive map design
export const USER_LOCATION: UserLocation = {
  x: 35, // Approx South America/Argentina
  y: 75,
  emoji: '🏠',
};

export const SERVERS: Server[] = [
  {
    id: 'brasil',
    nombre: 'Brasil',
    emoji: '🇧🇷',
    ping: 40,
    x: 42,
    y: 65,
    descripcion: 'Muy cerca, ¡ping excelente!',
  },
  {
    id: 'usa',
    nombre: 'Estados Unidos',
    emoji: '🇺🇸',
    ping: 150,
    x: 25,
    y: 35,
    descripcion: 'Bastante lejos, ping aceptable',
  },
  {
    id: 'europa',
    nombre: 'Europa',
    emoji: '🇪🇺',
    ping: 250,
    x: 55,
    y: 25,
    descripcion: 'Cruzando el océano, ping alto',
  },
  {
    id: 'asia',
    nombre: 'Asia',
    emoji: '🇯🇵',
    ping: 350,
    x: 85,
    y: 35,
    descripcion: '¡Al otro lado del mundo! Ping muy alto',
  },
  {
    id: 'australia',
    nombre: 'Australia',
    emoji: '🇦🇺',
    ping: 400,
    x: 88,
    y: 80,
    descripcion: 'Lejísimos, lag casi seguro',
  },
];

// NEON PALETTE
export const COLORS = {
  excellent: 'text-[#00ff9d] drop-shadow-[0_0_5px_rgba(0,255,157,0.8)]',
  good: 'text-[#a6e22e] drop-shadow-[0_0_5px_rgba(166,226,46,0.8)]',
  regular: 'text-[#fd971f] drop-shadow-[0_0_5px_rgba(253,151,31,0.8)]',
  bad: 'text-[#f92672] drop-shadow-[0_0_5px_rgba(249,38,114,0.8)]',
  terrible: 'text-[#ff003c] drop-shadow-[0_0_8px_rgba(255,0,60,1)]',

  bgExcellent: 'bg-[#00ff9d]',
  bgGood: 'bg-[#a6e22e]',
  bgRegular: 'bg-[#fd971f]',
  bgBad: 'bg-[#f92672]',
  bgTerrible: 'bg-[#ff003c]',

  borderExcellent: 'border-[#00ff9d]',
  borderGood: 'border-[#a6e22e]',
  borderRegular: 'border-[#fd971f]',
  borderBad: 'border-[#f92672]',
  borderTerrible: 'border-[#ff003c]',
};

export const getPingColorClass = (ping: number) => {
  if (ping <= 50) return COLORS.excellent;
  if (ping <= 100) return COLORS.good;
  if (ping <= 200) return COLORS.regular;
  if (ping <= 350) return COLORS.bad;
  return COLORS.terrible;
};

export const getPingBorderClass = (ping: number) => {
  if (ping <= 50) return COLORS.borderExcellent;
  if (ping <= 100) return COLORS.borderGood;
  if (ping <= 200) return COLORS.borderRegular;
  if (ping <= 350) return COLORS.borderBad;
  return COLORS.borderTerrible;
};

export const getPingLabel = (ping: number) => {
  if (ping <= 50) return '🟢 GOD TIER';
  if (ping <= 100) return '🟡 JUGABLE';
  if (ping <= 200) return '🟠 LAGUEADO';
  if (ping <= 350) return '🔴 MUY MALO';
  return '💀 INJUGABLE';
};
