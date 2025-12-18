import { ImagenData, Pixel } from '../types';

export const getImageDataFromUrl = (url: string): Promise<ImagenData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Limit size for performance
      const maxSize = 400;
      let width = img.width;
      let height = img.height;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      canvas.width = Math.floor(width);
      canvas.height = Math.floor(height);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No context');

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(obtenerPixeles(canvas));
    };
    img.onerror = (e) => reject(e);
  });
};

export const getImageDataFromFile = (file: File): Promise<ImagenData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        getImageDataFromUrl(e.target.result as string)
          .then(resolve)
          .catch(reject);
      }
    };
    reader.readAsDataURL(file);
  });
};

export function obtenerPixeles(canvas: HTMLCanvasElement): ImagenData {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const pixels: Pixel[][] = [];
  for (let y = 0; y < canvas.height; y++) {
    pixels[y] = [];
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      pixels[y][x] = {
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
      };
    }
  }

  return { width: canvas.width, height: canvas.height, pixels };
}

export function renderToCanvas(canvas: HTMLCanvasElement, imagen: ImagenData): void {
  const ctx = canvas.getContext('2d')!;

  // Resize canvas if needed
  if (canvas.width !== imagen.width || canvas.height !== imagen.height) {
    canvas.width = imagen.width;
    canvas.height = imagen.height;
  }

  const imageData = ctx.createImageData(imagen.width, imagen.height);
  const data = imageData.data;

  for (let y = 0; y < imagen.height; y++) {
    for (let x = 0; x < imagen.width; x++) {
      const i = (y * imagen.width + x) * 4;
      const pixel = imagen.pixels[y][x];
      data[i] = pixel.r;
      data[i + 1] = pixel.g;
      data[i + 2] = pixel.b;
      data[i + 3] = 255; // Alpha always 100%
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// --- FILTERS ---

export function filtroEscalaGris(imagen: ImagenData): ImagenData {
  const resultado: Pixel[][] = [];

  for (let y = 0; y < imagen.height; y++) {
    resultado[y] = [];
    for (let x = 0; x < imagen.width; x++) {
      const p = imagen.pixels[y][x];
      // Weighted method is better for human eyes, but simple average is better for kids' math
      const gris = Math.round((p.r + p.g + p.b) / 3);
      resultado[y][x] = { r: gris, g: gris, b: gris };
    }
  }

  return { ...imagen, pixels: resultado };
}

export function filtroBrillo(imagen: ImagenData, cantidad: number = 50): ImagenData {
  const resultado: Pixel[][] = [];

  for (let y = 0; y < imagen.height; y++) {
    resultado[y] = [];
    for (let x = 0; x < imagen.width; x++) {
      const p = imagen.pixels[y][x];
      resultado[y][x] = {
        r: Math.max(0, Math.min(255, p.r + cantidad)),
        g: Math.max(0, Math.min(255, p.g + cantidad)),
        b: Math.max(0, Math.min(255, p.b + cantidad)),
      };
    }
  }

  return { ...imagen, pixels: resultado };
}

export function filtroInvertir(imagen: ImagenData): ImagenData {
  const resultado: Pixel[][] = [];

  for (let y = 0; y < imagen.height; y++) {
    resultado[y] = [];
    for (let x = 0; x < imagen.width; x++) {
      const p = imagen.pixels[y][x];
      resultado[y][x] = {
        r: 255 - p.r,
        g: 255 - p.g,
        b: 255 - p.b,
      };
    }
  }

  return { ...imagen, pixels: resultado };
}

export function filtroPixelar(imagen: ImagenData, tamanoBloque: number = 10): ImagenData {
  const resultado: Pixel[][] = [];

  for (let y = 0; y < imagen.height; y++) {
    resultado[y] = [];
    for (let x = 0; x < imagen.width; x++) {
      const bloqueY = Math.floor(y / tamanoBloque) * tamanoBloque;
      const bloqueX = Math.floor(x / tamanoBloque) * tamanoBloque;

      // Use boundary checks
      const safeY = Math.min(bloqueY, imagen.height - 1);
      const safeX = Math.min(bloqueX, imagen.width - 1);

      const p = imagen.pixels[safeY][safeX];
      resultado[y][x] = { ...p };
    }
  }

  return { ...imagen, pixels: resultado };
}

export function filtroBlur(imagen: ImagenData): ImagenData {
  const resultado: Pixel[][] = [];
  const range = 2; // 5x5 kernel box blur

  for (let y = 0; y < imagen.height; y++) {
    resultado[y] = [];
    for (let x = 0; x < imagen.width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      for (let ky = -range; ky <= range; ky++) {
        for (let kx = -range; kx <= range; kx++) {
          const py = y + ky;
          const px = x + kx;

          if (py >= 0 && py < imagen.height && px >= 0 && px < imagen.width) {
            const p = imagen.pixels[py][px];
            r += p.r;
            g += p.g;
            b += p.b;
            count++;
          }
        }
      }

      resultado[y][x] = {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
      };
    }
  }
  return { ...imagen, pixels: resultado };
}

export function filtroDeteccionBordes(imagen: ImagenData): ImagenData {
  // 1. Convert to Grayscale first
  const gris = filtroEscalaGris(imagen);
  const resultado: Pixel[][] = [];

  // Sobel Kernels
  const kernelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];

  const kernelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  for (let y = 0; y < imagen.height; y++) {
    resultado[y] = [];
    for (let x = 0; x < imagen.width; x++) {
      // Edges of image are set to black to avoid boundary checks complexity
      if (y === 0 || y === imagen.height - 1 || x === 0 || x === imagen.width - 1) {
        resultado[y][x] = { r: 0, g: 0, b: 0 };
        continue;
      }

      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = gris.pixels[y + ky][x + kx];
          // Use Red channel since it's grayscale (R=G=B)
          gx += pixel.r * kernelX[ky + 1][kx + 1];
          gy += pixel.r * kernelY[ky + 1][kx + 1];
        }
      }

      // Magnitude
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      // Clamp
      const val = Math.min(255, Math.max(0, magnitude));

      // For clearer visualization, sometimes inverting (black on white) is nice,
      // but prompt implies standard white on black "glowing" lines.
      resultado[y][x] = { r: val, g: val, b: val };
    }
  }

  return { ...imagen, pixels: resultado };
}
