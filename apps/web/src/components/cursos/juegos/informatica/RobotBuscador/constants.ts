import { ThemeConfig, ThemeType, Video } from './types';

export const CONFIG = {
  VELOCIDADES: {
    lento: 2500,
    medio: 1500,
    rapido: 600,
  },
};

export const TEMAS: Record<ThemeType, ThemeConfig> = {
  roblox: { nombre: 'Roblox', emoji: '🎮', color: 'bg-blue-500' },
  minecraft: { nombre: 'Minecraft', emoji: '⛏️', color: 'bg-emerald-500' },
  gatitos: { nombre: 'Gatitos', emoji: '🐱', color: 'bg-orange-400' },
  musica: { nombre: 'Música', emoji: '🎵', color: 'bg-violet-500' },
  futbol: { nombre: 'Fútbol', emoji: '⚽', color: 'bg-green-500' },
  espacio: { nombre: 'Espacio', emoji: '🚀', color: 'bg-indigo-600' },
};

export const VIDEOS_DATA: Record<ThemeType, Omit<Video, 'id' | 'ordenado'>[]> = {
  roblox: [
    { titulo: 'Roblox Obby Épico', emoji: '🎮', relevancia: 95 },
    { titulo: 'Tips para Roblox', emoji: '🎮', relevancia: 75 },
    { titulo: 'Música de Roblox', emoji: '🎵', relevancia: 60 },
    { titulo: 'Gatos Graciosos', emoji: '🐱', relevancia: 10 },
    { titulo: 'Receta de Pizza', emoji: '🍕', relevancia: 5 },
    { titulo: 'Goles de Messi', emoji: '⚽', relevancia: 15 },
  ],
  minecraft: [
    { titulo: 'Minecraft Survival', emoji: '⛏️', relevancia: 95 },
    { titulo: 'Casas Minecraft', emoji: '🏠', relevancia: 80 },
    { titulo: 'Mods Minecraft', emoji: '⛏️', relevancia: 70 },
    { titulo: 'Videos de Perros', emoji: '🐕', relevancia: 8 },
    { titulo: 'Bailando Cumbia', emoji: '💃', relevancia: 5 },
    { titulo: 'Noticias del Día', emoji: '📰', relevancia: 12 },
  ],
  gatitos: [
    { titulo: 'Gatos Bebés', emoji: '🐱', relevancia: 98 },
    { titulo: 'Gatos vs Pepinos', emoji: '🐱', relevancia: 85 },
    { titulo: 'Gato Toca Piano', emoji: '🎹', relevancia: 70 },
    { titulo: 'Tutorial de Baile', emoji: '💃', relevancia: 10 },
    { titulo: 'Receta de Torta', emoji: '🎂', relevancia: 5 },
    { titulo: 'Partidos de Tenis', emoji: '🎾', relevancia: 8 },
  ],
  musica: [
    { titulo: 'Hits del Momento', emoji: '🎵', relevancia: 95 },
    { titulo: 'Tutorial Guitarra', emoji: '🎸', relevancia: 80 },
    { titulo: 'Karaoke Infantil', emoji: '🎤', relevancia: 75 },
    { titulo: 'Documental Leones', emoji: '🦁', relevancia: 10 },
    { titulo: 'Clases de Yoga', emoji: '🧘', relevancia: 5 },
    { titulo: 'Armar un Robot', emoji: '🤖', relevancia: 12 },
  ],
  futbol: [
    { titulo: 'Mejores Goles', emoji: '⚽', relevancia: 95 },
    { titulo: 'Trucos con Pelota', emoji: '⚽', relevancia: 85 },
    { titulo: 'Messi vs Ronaldo', emoji: '🏆', relevancia: 78 },
    { titulo: 'Unboxing Juguetes', emoji: '🎁', relevancia: 8 },
    { titulo: 'Como Hacer Slime', emoji: '🧪', relevancia: 5 },
    { titulo: 'Viaje a la Playa', emoji: '🏖️', relevancia: 10 },
  ],
  espacio: [
    { titulo: 'Viaje a Marte', emoji: '🚀', relevancia: 95 },
    { titulo: 'Planetas del Sistema', emoji: '🪐', relevancia: 88 },
    { titulo: 'Astronautas en ISS', emoji: '👨‍🚀', relevancia: 75 },
    { titulo: 'Peinados Fáciles', emoji: '💇', relevancia: 5 },
    { titulo: 'Recetas Rápidas', emoji: '🍳', relevancia: 8 },
    { titulo: 'Manualidades Papel', emoji: '📄', relevancia: 12 },
  ],
};

export const MENSAJES_ROBOT = {
  inicio: '¡Hola! Soy Bot. ¿Sabes cómo encuentro tus videos favoritos?',
  seleccion: 'Toca un tema para empezar la búsqueda.',
  resultado: '¡Taran! 🎉 Los videos más importantes están arriba.',
};
