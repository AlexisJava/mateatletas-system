import { Video, SortStep } from '../types';

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
    [mezclados[i], mezclados[j]] = [mezclados[j], mezclados[i]];
  }

  // Ensure not accidentally sorted (rare but possible)
  let isSorted = true;
  for (let i = 0; i < mezclados.length - 1; i++) {
    if (mezclados[i].relevancia < mezclados[i + 1].relevancia) {
      isSorted = false;
      break;
    }
  }

  // If accidentally sorted, force a swap
  if (isSorted && mezclados.length > 1) {
    [mezclados[0], mezclados[1]] = [mezclados[1], mezclados[0]];
  }

  return mezclados;
}

export function* bubbleSortDescendente(videosIniciales: Video[]): Generator<SortStep> {
  const arr = JSON.parse(JSON.stringify(videosIniciales)) as Video[];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const vidA = arr[j];
      const vidB = arr[j + 1];

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
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

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
    arr[n - 1 - i].ordenado = true;

    yield {
      tipo: 'posicionado',
      indices: [n - 1 - i],
      videos: [...arr],
      mensaje: `🎯 "${arr[n - 1 - i].titulo}" ya está en su lugar.`,
    };
  }

  // Mark the first one as sorted too at the end
  arr[0].ordenado = true;

  yield {
    tipo: 'completado',
    indices: [],
    videos: [...arr],
    mensaje: `🎉 ¡Búsqueda terminada! Todo ordenado por relevancia.`,
  };
}
