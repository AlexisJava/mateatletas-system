/**
 * Algoritmos de ordenamiento para AlgorithmViz
 */

export interface AlgorithmStep {
  descripcion: string;
  datos: number[];
  comparando?: [number, number];
  intercambiando?: [number, number];
  ordenado?: number[];
  pivote?: number;
  mensaje?: string;
}

export type AlgorithmType = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge';

/**
 * Nombres de los algoritmos
 */
export const nombresAlgoritmos: Record<AlgorithmType, string> = {
  bubble: 'Bubble Sort',
  selection: 'Selection Sort',
  insertion: 'Insertion Sort',
  quick: 'Quick Sort',
  merge: 'Merge Sort',
};

/**
 * Código de los algoritmos
 */
export const codigoAlgoritmos: Record<AlgorithmType, string> = {
  bubble: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
  selection: `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
  insertion: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
  quick: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    let pivot = partition(arr, low, high);
    quickSort(arr, low, pivot - 1);
    quickSort(arr, pivot + 1, high);
  }
  return arr;
}`,
  merge: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`,
};

/**
 * Genera pasos para Bubble Sort
 */
function generarPasosBubbleSort(datos: number[]): AlgorithmStep[] {
  const pasos: AlgorithmStep[] = [];
  const arr = [...datos];
  const n = arr.length;

  pasos.push({
    descripcion: 'Estado inicial del arreglo',
    datos: [...arr],
    mensaje: 'Comenzamos con el arreglo sin ordenar',
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const valJ = arr[j];
      const valJNext = arr[j + 1];
      if (valJ !== undefined && valJNext !== undefined) {
        pasos.push({
          descripcion: `Comparando ${valJ} con ${valJNext}`,
          datos: [...arr],
          comparando: [j, j + 1],
          ordenado: Array.from({ length: i }, (_, k) => n - 1 - k),
        });

        if (valJ > valJNext) {
          arr[j] = valJNext;
          arr[j + 1] = valJ;
          pasos.push({
            descripcion: `Intercambiando ${arr[j + 1]} y ${arr[j]}`,
            datos: [...arr],
            intercambiando: [j, j + 1],
            ordenado: Array.from({ length: i }, (_, k) => n - 1 - k),
          });
        }
      }
    }
  }

  pasos.push({
    descripcion: '¡Arreglo ordenado!',
    datos: [...arr],
    ordenado: Array.from({ length: n }, (_, i) => i),
    mensaje: 'El algoritmo ha terminado',
  });

  return pasos;
}

/**
 * Genera pasos para Selection Sort
 */
function generarPasosSelectionSort(datos: number[]): AlgorithmStep[] {
  const pasos: AlgorithmStep[] = [];
  const arr = [...datos];
  const n = arr.length;

  pasos.push({
    descripcion: 'Estado inicial del arreglo',
    datos: [...arr],
    mensaje: 'Comenzamos con el arreglo sin ordenar',
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    pasos.push({
      descripcion: `Buscando el mínimo desde posición ${i}`,
      datos: [...arr],
      pivote: i,
      ordenado: Array.from({ length: i }, (_, k) => k),
    });

    for (let j = i + 1; j < n; j++) {
      const valMinIdx = arr[minIdx];
      const valJ = arr[j];
      if (valMinIdx !== undefined && valJ !== undefined) {
        pasos.push({
          descripcion: `Comparando ${valMinIdx} con ${valJ}`,
          datos: [...arr],
          comparando: [minIdx, j],
          pivote: i,
          ordenado: Array.from({ length: i }, (_, k) => k),
        });

        if (valJ < valMinIdx) {
          minIdx = j;
        }
      }
    }

    if (minIdx !== i) {
      const valI = arr[i];
      const valMinIdx = arr[minIdx];
      if (valI !== undefined && valMinIdx !== undefined) {
        arr[i] = valMinIdx;
        arr[minIdx] = valI;
        pasos.push({
          descripcion: `Intercambiando ${arr[minIdx]} a posición ${i}`,
          datos: [...arr],
          intercambiando: [i, minIdx],
          ordenado: Array.from({ length: i + 1 }, (_, k) => k),
        });
      }
    }
  }

  pasos.push({
    descripcion: '¡Arreglo ordenado!',
    datos: [...arr],
    ordenado: Array.from({ length: n }, (_, i) => i),
    mensaje: 'El algoritmo ha terminado',
  });

  return pasos;
}

/**
 * Genera pasos para Insertion Sort
 */
function generarPasosInsertionSort(datos: number[]): AlgorithmStep[] {
  const pasos: AlgorithmStep[] = [];
  const arr = [...datos];
  const n = arr.length;

  pasos.push({
    descripcion: 'Estado inicial del arreglo',
    datos: [...arr],
    mensaje: 'Comenzamos con el arreglo sin ordenar',
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    if (key === undefined) continue;
    let j = i - 1;

    pasos.push({
      descripcion: `Insertando ${key} en su posición correcta`,
      datos: [...arr],
      pivote: i,
      ordenado: Array.from({ length: i }, (_, k) => k),
    });

    let arrJ = arr[j];
    while (j >= 0 && arrJ !== undefined && arrJ > key) {
      pasos.push({
        descripcion: `Comparando ${key} con ${arrJ}`,
        datos: [...arr],
        comparando: [j, i],
        pivote: i,
      });

      arr[j + 1] = arrJ;
      pasos.push({
        descripcion: `Moviendo ${arrJ} a la derecha`,
        datos: [...arr],
        intercambiando: [j, j + 1],
      });
      j--;
      arrJ = arr[j];
    }
    arr[j + 1] = key;
  }

  pasos.push({
    descripcion: '¡Arreglo ordenado!',
    datos: [...arr],
    ordenado: Array.from({ length: n }, (_, i) => i),
    mensaje: 'El algoritmo ha terminado',
  });

  return pasos;
}

/**
 * Genera pasos según el tipo de algoritmo
 */
export function generarPasos(algoritmo: AlgorithmType, datos: number[]): AlgorithmStep[] {
  switch (algoritmo) {
    case 'bubble':
      return generarPasosBubbleSort(datos);
    case 'selection':
      return generarPasosSelectionSort(datos);
    case 'insertion':
      return generarPasosInsertionSort(datos);
    default:
      return generarPasosBubbleSort(datos);
  }
}
