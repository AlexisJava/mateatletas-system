import { Video, SortStep, safeGet, safeSwap } from '../types';

// Default video for safe access fallback
const DEFAULT_VIDEO: Video = {
  id: '',
  titulo: 'Desconocido',
  emoji: '❓',
  relevancia: 0,
  ordenado: false,
};

export function mezclarVideos(videos: Omit<Video, 'id' | 'ordenado'>[]): Video[] {
  const initializedVideos: Video[] = videos.map((v, i) => ({
    ...v,
    id: `video-${Date.now()}-${i}`,
    ordenado: false,
  }));

  const mezclados = [...initializedVideos];

  // Fisher-Yates shuffle
  for (let i = mezclados.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    safeSwap(mezclados, i, j);
  }

  // Ensure not accidentally sorted (rare but possible)
  let isSorted = true;
  for (let i = 0; i < mezclados.length - 1; i++) {
    const current = safeGet(mezclados, i, DEFAULT_VIDEO);
    const next = safeGet(mezclados, i + 1, DEFAULT_VIDEO);
    if (current.relevancia < next.relevancia) {
      isSorted = false;
      break;
    }
  }

  // If accidentally sorted, force a swap
  if (isSorted && mezclados.length > 1) {
    safeSwap(mezclados, 0, 1);
  }

  return mezclados;
}

export function* bubbleSortDescendente(videosIniciales: Video[]): Generator<SortStep> {
  const arr = JSON.parse(JSON.stringify(videosIniciales)) as Video[];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const vidA = safeGet(arr, j, DEFAULT_VIDEO);
      const vidB = safeGet(arr, j + 1, DEFAULT_VIDEO);

      // Yield Comparison Step
      yield {
        tipo: 'comparando',
        indices: [j, j + 1],
        videos: [...arr],
        mensaje: `🤔 ¿"${vidA.titulo}" (${vidA.relevancia}%) o "${vidB.titulo}" (${vidB.relevancia}%)?`,
      };

      // Descending sort: if Left < Right, swap them
      if (vidA.relevancia < vidB.relevancia) {
        // Swap
        safeSwap(arr, j, j + 1);

        yield {
          tipo: 'intercambiando',
          indices: [j, j + 1],
          videos: [...arr],
          mensaje: `🔄 ¡${vidB.relevancia}% es mayor que ${vidA.relevancia}%! "${vidB.titulo}" sube.`,
        };
      } else {
        yield {
          tipo: 'sin-cambio',
          indices: [j, j + 1],
          videos: [...arr],
          mensaje: `✅ "${vidA.titulo}" ya está bien (${vidA.relevancia}% es mayor).`,
        };
      }
    }

    // Mark last processed as sorted
    const sortedIndex = n - 1 - i;
    const sortedVideo = arr[sortedIndex];
    if (sortedVideo) {
      sortedVideo.ordenado = true;
    }

    yield {
      tipo: 'posicionado',
      indices: [sortedIndex],
      videos: [...arr],
      mensaje: `🎯 "${safeGet(arr, sortedIndex, DEFAULT_VIDEO).titulo}" ya está en su lugar.`,
    };
  }

  // Mark the first one as sorted too at the end
  const firstVideo = arr[0];
  if (firstVideo) {
    firstVideo.ordenado = true;
  }

  yield {
    tipo: 'completado',
    indices: [],
    videos: [...arr],
    mensaje: `🎉 ¡Búsqueda terminada! Todo ordenado por relevancia.`,
  };
}
