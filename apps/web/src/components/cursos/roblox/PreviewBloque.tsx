'use client';

interface PreviewBloqueProps {
  codigo: string;
}

export default function PreviewBloque({ codigo }: PreviewBloqueProps) {
  // Extraer valores del código
  const getColor = () => {
    const colorMatch = codigo.match(/BrickColor\.new\s*\(\s*["']([^"']+)["']\s*\)/);
    if (colorMatch) {
      const robloxColor = colorMatch[1].toLowerCase();
      // Mapeo de colores de Roblox a CSS
      const colorMap: Record<string, string> = {
        'bright blue': '#0066FF',
        'bright red': '#FF0000',
        'bright green': '#00FF00',
        'bright yellow': '#FFFF00',
        'deep orange': '#FF6600',
        white: '#FFFFFF',
      };
      return colorMap[robloxColor] || '#888888';
    }
    return '#888888'; // gris por defecto
  };

  const getTransparency = () => {
    const transMatch = codigo.match(/Transparency\s*=\s*([\d.]+)/);
    if (transMatch) {
      const trans = parseFloat(transMatch[1]);
      return 1 - trans; // Convertir a opacity CSS (0 = invisible, 1 = sólido)
    }
    return 1; // sólido por defecto
  };

  const getMaterial = () => {
    const materialMatch = codigo.match(/Material\.(\w+)/);
    if (materialMatch) {
      return materialMatch[1].toLowerCase();
    }
    return 'plastic';
  };

  const color = getColor();
  const opacity = getTransparency();
  const material = getMaterial();
  const isNeon = material === 'neon';

  return (
    <div className="bg-slate-950/50 rounded-lg p-6 border-2 border-slate-700">
      <h5 className="text-sm font-bold text-white mb-4 text-center">👁️ Así se ve el bloque:</h5>

      <div className="flex items-center justify-center">
        <div
          className="w-48 h-48 rounded-lg transition-all duration-500"
          style={{
            backgroundColor: color,
            opacity,
            boxShadow: isNeon
              ? `0 0 40px ${color}, 0 0 80px ${color}, inset 0 0 40px ${color}`
              : '0 4px 6px rgba(0,0,0,0.3)',
            border: isNeon ? 'none' : '2px solid rgba(255,255,255,0.1)',
          }}
        />
      </div>

      <div className="mt-4 text-center text-xs text-slate-400 space-y-1">
        <p>
          Color: <span className="text-white font-bold">{getColor()}</span>
        </p>
        {codigo.includes('Transparency') && (
          <p>
            Transparencia: <span className="text-white font-bold">{(1 - opacity).toFixed(1)}</span>
          </p>
        )}
        {codigo.includes('Material') && (
          <p>
            Material: <span className="text-white font-bold uppercase">{material}</span>
          </p>
        )}
      </div>
    </div>
  );
}
