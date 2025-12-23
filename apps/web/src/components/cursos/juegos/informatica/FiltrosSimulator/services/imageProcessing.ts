import {
  ImagenData,
  Pixel,
  createPixelGrid,
  getPixel,
  setPixel,
  gridToPixels2D,
  pixels2DToGrid,
} from '../types';

// --- IMAGE LOADING ---

export const getImageDataFromUrl = (url: string): Promise<ImagenData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
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
      if (!ctx) return reject(new Error('No context'));

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
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { width: 0, height: 0, pixels: [] };
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const grid = createPixelGrid(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      setPixel(grid, x, y, {
        r: data[i] ?? 0,
        g: data[i + 1] ?? 0,
        b: data[i + 2] ?? 0,
      });
    }
  }

  return { width: canvas.width, height: canvas.height, pixels: gridToPixels2D(grid) };
}

export function renderToCanvas(canvas: HTMLCanvasElement, imagen: ImagenData): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (canvas.width !== imagen.width || canvas.height !== imagen.height) {
    canvas.width = imagen.width;
    canvas.height = imagen.height;
  }

  const imageData = ctx.createImageData(imagen.width, imagen.height);
  const data = imageData.data;
  const grid = pixels2DToGrid(imagen.pixels, imagen.width, imagen.height);

  for (let y = 0; y < imagen.height; y++) {
    for (let x = 0; x < imagen.width; x++) {
      const i = (y * imagen.width + x) * 4;
      const pixel = getPixel(grid, x, y);
      data[i] = pixel.r;
      data[i + 1] = pixel.g;
      data[i + 2] = pixel.b;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// --- HELPER: Apply filter using PixelGrid for type-safe access ---

function applyPixelFilter(
  imagen: ImagenData,
  filterFn: (pixel: Pixel, x: number, y: number) => Pixel,
): ImagenData {
  const grid = pixels2DToGrid(imagen.pixels, imagen.width, imagen.height);
  const result = createPixelGrid(imagen.width, imagen.height);

  for (let y = 0; y < imagen.height; y++) {
    for (let x = 0; x < imagen.width; x++) {
      const pixel = getPixel(grid, x, y);
      setPixel(result, x, y, filterFn(pixel, x, y));
    }
  }

  return { ...imagen, pixels: gridToPixels2D(result) };
}

// --- FILTERS ---

export function filtroEscalaGris(imagen: ImagenData): ImagenData {
  return applyPixelFilter(imagen, (p) => {
    const gris = Math.round((p.r + p.g + p.b) / 3);
    return { r: gris, g: gris, b: gris };
  });
}

export function filtroBrillo(imagen: ImagenData, cantidad: number = 50): ImagenData {
  return applyPixelFilter(imagen, (p) => ({
    r: Math.max(0, Math.min(255, p.r + cantidad)),
    g: Math.max(0, Math.min(255, p.g + cantidad)),
    b: Math.max(0, Math.min(255, p.b + cantidad)),
  }));
}

export function filtroInvertir(imagen: ImagenData): ImagenData {
  return applyPixelFilter(imagen, (p) => ({
    r: 255 - p.r,
    g: 255 - p.g,
    b: 255 - p.b,
  }));
}

export function filtroPixelar(imagen: ImagenData, tamanoBloque: number = 10): ImagenData {
  const grid = pixels2DToGrid(imagen.pixels, imagen.width, imagen.height);
  const result = createPixelGrid(imagen.width, imagen.height);

  for (let y = 0; y < imagen.height; y++) {
    for (let x = 0; x < imagen.width; x++) {
      const bloqueY = Math.floor(y / tamanoBloque) * tamanoBloque;
      const bloqueX = Math.floor(x / tamanoBloque) * tamanoBloque;
      const pixel = getPixel(grid, bloqueX, bloqueY);
      setPixel(result, x, y, { ...pixel });
    }
  }

  return { ...imagen, pixels: gridToPixels2D(result) };
}

export function filtroBlur(imagen: ImagenData): ImagenData {
  const grid = pixels2DToGrid(imagen.pixels, imagen.width, imagen.height);
  const result = createPixelGrid(imagen.width, imagen.height);
  const range = 2;

  for (let y = 0; y < imagen.height; y++) {
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
            const p = getPixel(grid, px, py);
            r += p.r;
            g += p.g;
            b += p.b;
            count++;
          }
        }
      }

      const avgR = count > 0 ? Math.round(r / count) : 0;
      const avgG = count > 0 ? Math.round(g / count) : 0;
      const avgB = count > 0 ? Math.round(b / count) : 0;

      setPixel(result, x, y, { r: avgR, g: avgG, b: avgB });
    }
  }

  return { ...imagen, pixels: gridToPixels2D(result) };
}

export function filtroDeteccionBordes(imagen: ImagenData): ImagenData {
  const gris = filtroEscalaGris(imagen);
  const grid = pixels2DToGrid(gris.pixels, gris.width, gris.height);
  const result = createPixelGrid(imagen.width, imagen.height);

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
    for (let x = 0; x < imagen.width; x++) {
      if (y === 0 || y === imagen.height - 1 || x === 0 || x === imagen.width - 1) {
        setPixel(result, x, y, { r: 0, g: 0, b: 0 });
        continue;
      }

      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = getPixel(grid, x + kx, y + ky);
          const kxWeight = kernelX[ky + 1]?.[kx + 1] ?? 0;
          const kyWeight = kernelY[ky + 1]?.[kx + 1] ?? 0;
          gx += pixel.r * kxWeight;
          gy += pixel.r * kyWeight;
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const val = Math.min(255, Math.max(0, magnitude));

      setPixel(result, x, y, { r: val, g: val, b: val });
    }
  }

  return { ...imagen, pixels: gridToPixels2D(result) };
}
