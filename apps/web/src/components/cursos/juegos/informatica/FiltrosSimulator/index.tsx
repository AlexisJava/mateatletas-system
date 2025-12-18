'use client';

import React, { useState } from 'react';
import { FaseSimulacion, ImagenData, Pixel, TipoFiltro } from './types';
import { IMAGENES_EJEMPLO, INFO_FILTROS } from './constants';
import * as IP from './services/imageProcessing';
import PixelExplorer from './components/PixelExplorer';
import {
  Camera,
  Upload,
  RefreshCw,
  ChevronRight,
  Eye,
  Layers,
  Sparkles,
  Cpu,
  Zap,
  Scan,
  ArrowRightLeft,
  CheckCircle2,
  Monitor,
} from 'lucide-react';

interface FiltrosSimulatorProps {
  onCompleted?: () => void;
  onExit?: () => void;
}

const FiltrosSimulator: React.FC<FiltrosSimulatorProps> = ({ onCompleted, onExit }) => {
  const [fase, setFase] = useState<FaseSimulacion>('inicio');
  const [imagenOriginal, setImagenOriginal] = useState<ImagenData | null>(null);
  const [imagenProcesada, setImagenProcesada] = useState<ImagenData | null>(null);
  const [filtroActual, setFiltroActual] = useState<TipoFiltro>('ninguno');
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; pixel: Pixel } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Handlers ---

  const handleSelectImage = async (url: string) => {
    setIsProcessing(true);
    try {
      const data = await IP.getImageDataFromUrl(url);
      setImagenOriginal(data);
      setImagenProcesada(data);
      setFase('explorar');
    } catch (e) {
      console.error(e);
      alert('Error cargando la imagen. Intenta con otra.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessing(true);
      try {
        const data = await IP.getImageDataFromFile(e.target.files[0]);
        setImagenOriginal(data);
        setImagenProcesada(data);
        setFase('explorar');
      } catch (err) {
        console.error(err);
        alert('No se pudo cargar tu imagen :(');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const aplicarFiltro = (tipo: TipoFiltro) => {
    if (!imagenOriginal) return;
    setFiltroActual(tipo);
    setIsProcessing(true);

    setTimeout(() => {
      let nueva: ImagenData;
      switch (tipo) {
        case 'escala-gris':
          nueva = IP.filtroEscalaGris(imagenOriginal);
          break;
        case 'brillo':
          nueva = IP.filtroBrillo(imagenOriginal, 50);
          break;
        case 'invertir':
          nueva = IP.filtroInvertir(imagenOriginal);
          break;
        case 'pixelar':
          nueva = IP.filtroPixelar(imagenOriginal, 10);
          break;
        case 'blur':
          nueva = IP.filtroBlur(imagenOriginal);
          break;
        case 'bordes':
          nueva = IP.filtroDeteccionBordes(imagenOriginal);
          break;
        default:
          nueva = {
            ...imagenOriginal,
            pixels: [...imagenOriginal.pixels.map((row) => [...row])],
          };
      }
      setImagenProcesada(nueva);
      setIsProcessing(false);
    }, 50); // Slight delay for effect
  };

  const reiniciar = () => {
    setFase('inicio');
    setImagenOriginal(null);
    setImagenProcesada(null);
    setFiltroActual('ninguno');
  };

  const handleFinalizar = () => {
    if (onCompleted) {
      onCompleted();
    }
  };

  // --- UI Components ---

  const Background = () => (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-slate-900"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px]"></div>
    </div>
  );

  const ProgressBar = ({ current, total }: { current: number; total: number }) => (
    <div className="flex gap-2 mb-4 shrink-0">
      {[...Array(total)].map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-8 rounded-full transition-colors ${
            i <= current ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-700'
          }`}
        ></div>
      ))}
    </div>
  );

  // --- Render Sections ---

  const renderInicio = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
      <div className="animate-float mb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
        <div className="relative bg-slate-900 border-2 border-slate-700 p-6 rounded-[2rem] shadow-2xl">
          <Cpu size={60} className="text-cyan-400" />
        </div>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 neon-text">
          VISIÓN ARTIFICIAL
        </span>
      </h1>

      <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-10 font-light leading-relaxed">
        Descubre cómo las máquinas interpretan el mundo visual.
        <br />
        <span className="text-cyan-400 font-mono text-sm mt-3 block bg-cyan-950/30 inline-block px-4 py-2 rounded border border-cyan-800/50">
          &gt; INITIALIZING NEURAL NETWORK...
        </span>
      </p>

      <button
        onClick={() => setFase('explicacion')}
        className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-lg"
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30"></div>
        <span className="relative flex items-center font-bold text-lg md:text-xl tracking-widest text-white group-hover:scale-105 transition-transform">
          INICIAR SIMULACIÓN{' '}
          <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </div>
  );

  const renderExplicacion = () => (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto px-4 py-4 md:py-6 overflow-y-auto">
      <ProgressBar current={0} total={4} />

      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 flex items-center justify-center gap-3 shrink-0">
        <span className="text-cyan-400">01.</span> DECODIFICANDO IMÁGENES
      </h2>

      <div className="grid md:grid-cols-2 gap-8 w-full mb-8">
        {/* Visual Card */}
        <div className="glass-panel p-6 rounded-2xl relative group overflow-hidden border-slate-700">
          <div className="absolute top-0 right-0 p-4 opacity-50">
            <Eye className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-purple-300 mb-6">Visión Humana</h3>
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-purple-500/30 shadow-lg group-hover:scale-105 transition-transform duration-500">
              <img
                src="https://picsum.photos/id/237/400/400"
                alt="Dog"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-purple-500/10 mix-blend-overlay"></div>
            </div>
          </div>
          <p className="text-slate-400 text-sm text-center leading-relaxed">
            Tus ojos captan luz y tu cerebro ve formas, colores y emociones.
          </p>
        </div>

        {/* Matrix Card */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-slate-700 group">
          <div className="absolute top-0 right-0 p-4 opacity-50">
            <Monitor className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-green-400 mb-6">Visión Computadora</h3>
          <div className="flex justify-center mb-6 relative">
            <div className="w-48 h-48 bg-black rounded-lg overflow-hidden border-2 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] relative font-mono text-[10px] leading-none text-green-500/80 p-1 break-all select-none group-hover:text-green-400 transition-colors">
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-green-500/10 to-transparent h-1/2 w-full animate-scan pointer-events-none"></div>
              {Array.from({ length: 400 }).map((_, i) => (
                <span
                  key={i}
                  className="opacity-60 hover:opacity-100 hover:text-white hover:font-bold transition-opacity"
                >
                  {Math.floor(Math.random() * 9)}
                </span>
              ))}
            </div>
          </div>
          <p className="text-slate-400 text-sm text-center leading-relaxed">
            La máquina solo ve una grilla gigante de números (Píxeles).
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border-l-4 border-cyan-500 max-w-4xl mx-auto mb-8 shrink-0">
        <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2 text-lg">
          <Cpu size={18} /> CONCEPTO CLAVE: EL PÍXEL
        </h4>
        <p className="text-slate-300 text-lg leading-relaxed">
          Cada punto es una mezcla de 3 canales de luz:{' '}
          <strong className="text-red-400">Rojo</strong>,{' '}
          <strong className="text-green-400">Verde</strong> y{' '}
          <strong className="text-blue-400">Azul</strong>. Los valores van de{' '}
          <span className="font-mono bg-slate-950 px-2 py-1 rounded text-base border border-slate-700">
            0
          </span>{' '}
          (Apagado) a{' '}
          <span className="font-mono bg-slate-950 px-2 py-1 rounded text-base border border-slate-700">
            255
          </span>{' '}
          (Máxima intensidad).
        </p>
      </div>

      <div className="flex justify-center shrink-0">
        <button
          onClick={() => setFase('elegir-imagen')}
          className="group bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-lg"
        >
          CONTINUAR AL LABORATORIO{' '}
          <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );

  const renderEleccion = () => (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto px-4 py-4 md:py-6 overflow-y-auto">
      <ProgressBar current={1} total={4} />
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 flex items-center justify-center gap-3 shrink-0">
        <span className="text-cyan-400">02.</span> CARGAR SUJETO DE PRUEBA
      </h2>
      <p className="text-slate-400 mb-6 text-center max-w-lg mx-auto text-sm shrink-0">
        Selecciona una imagen de la base de datos o sube tu propia muestra para análisis.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mb-6">
        {IMAGENES_EJEMPLO.map((img) => (
          <button
            key={img.id}
            onClick={() => handleSelectImage(img.url)}
            className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-700 hover:border-cyan-400 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] bg-slate-800"
          >
            <div className="absolute inset-0 bg-slate-800 z-0"></div>
            <img
              src={img.url}
              alt={img.nombre}
              className="relative z-10 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
            />
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>

            <div className="absolute bottom-0 left-0 right-0 p-3 z-30 transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <div className="text-xs text-cyan-400 font-mono mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                ID: {img.id.toUpperCase()}
              </div>
              <div className="font-bold text-white flex items-center justify-between text-sm">
                {img.nombre}
                <span className="text-xl">{img.emoji}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="relative group w-full max-w-md cursor-pointer mx-auto shrink-0">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative glass-panel rounded-2xl p-6 flex flex-col items-center justify-center border-dashed border-2 border-slate-600 group-hover:border-transparent transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
          />
          <div className="bg-slate-800 p-3 rounded-full mb-2 group-hover:bg-slate-700 transition-colors">
            <Upload className="text-cyan-400" size={28} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Subir Archivo Local</h3>
          <p className="text-xs text-slate-400 font-mono">.JPG .PNG (MAX 2MB)</p>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-4 border-purple-500 rounded-full animate-spin [animation-direction:reverse]"></div>
          </div>
          <div className="text-cyan-400 font-mono text-lg animate-pulse">PROCESANDO DATOS...</div>
        </div>
      )}
    </div>
  );

  const renderExplorador = () => (
    <div className="flex-1 flex flex-col h-full max-w-7xl mx-auto px-4 py-4 md:py-6 min-h-0">
      {/* Nav */}
      <div className="flex justify-between items-end mb-4 shrink-0 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-cyan-500 font-bold text-xs">03. ANÁLISIS DE DATOS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Explorador de Píxeles</h2>
        </div>
        <button
          onClick={() => setFase('filtros')}
          className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/50 transition-all hover:scale-105 text-sm"
        >
          <Sparkles size={16} />
          <span className="tracking-wide">APLICAR FILTROS</span>
          <ChevronRight
            size={16}
            className="opacity-50 group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Main Canvas */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <div className="flex-1 flex items-center justify-center bg-slate-950/50 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            {imagenOriginal && (
              <PixelExplorer
                imagen={imagenOriginal}
                onPixelHover={setHoverInfo}
                className="max-w-full max-h-full shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              />
            )}
          </div>
          <p className="text-center text-slate-500 text-xs mt-2 font-mono shrink-0">
            <Scan className="inline w-3 h-3 mr-1 mb-0.5" />
            MOVER CURSOR PARA ESCANEAR VALORES RGB
          </p>
        </div>

        {/* Data Panel */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="glass-panel rounded-xl p-5 flex-1 flex flex-col relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>

            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
              <Monitor size={12} /> Datos en Tiempo Real
            </h3>

            {hoverInfo ? (
              <div className="space-y-6 animate-fade-in flex-1 overflow-y-auto">
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-xl shadow-lg ring-2 ring-white/10 shrink-0"
                    style={{
                      backgroundColor: `rgb(${hoverInfo.pixel.r}, ${hoverInfo.pixel.g}, ${hoverInfo.pixel.b})`,
                    }}
                  ></div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs font-mono uppercase">Coordenadas</p>
                    <p className="font-mono text-xl text-white tracking-widest">
                      X:
                      <span className="text-cyan-400">
                        {hoverInfo.x.toString().padStart(3, '0')}
                      </span>
                      <br />
                      Y:
                      <span className="text-purple-400">
                        {hoverInfo.y.toString().padStart(3, '0')}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-sm">
                  {/* Red */}
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between mb-1">
                      <span className="text-red-400 font-bold flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div> R (Rojo)
                      </span>
                      <span className="text-white text-xs">{hoverInfo.pixel.r}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-900 to-red-500 transition-all duration-75"
                        style={{ width: `${(hoverInfo.pixel.r / 255) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* Green */}
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between mb-1">
                      <span className="text-green-400 font-bold flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div> G (Verde)
                      </span>
                      <span className="text-white text-xs">{hoverInfo.pixel.g}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-900 to-green-500 transition-all duration-75"
                        style={{ width: `${(hoverInfo.pixel.g / 255) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* Blue */}
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between mb-1">
                      <span className="text-blue-400 font-bold flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div> B (Azul)
                      </span>
                      <span className="text-white text-xs">{hoverInfo.pixel.b}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-900 to-blue-500 transition-all duration-75"
                        style={{ width: `${(hoverInfo.pixel.b / 255) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 text-xs text-slate-500 font-mono text-center shrink-0">
                  CSS: rgb({hoverInfo.pixel.r}, {hoverInfo.pixel.g}, {hoverInfo.pixel.b})
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center opacity-50">
                <Scan size={40} className="mb-3 animate-pulse" />
                <p className="text-xs">ESPERANDO ENTRADA...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFiltros = () => (
    <div className="flex-1 flex flex-col h-full max-w-[1600px] mx-auto px-4 py-4 md:py-6 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-purple-500 font-bold text-xs">04. PROCESAMIENTO MATRICIAL</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
            Laboratorio de Filtros{' '}
            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700 font-mono">
              MODO: EXPERIMENTAL
            </span>
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFase('explorar')}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Retroceder
          </button>
          <button
            onClick={() => setFase('final')}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-5 rounded-lg text-xs transition-all shadow-lg shadow-cyan-900/50 flex items-center gap-2"
          >
            <CheckCircle2 size={14} />
            Finalizar Experimento
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Sidebar Controls */}
        <div className="lg:col-span-3 flex flex-col gap-3 overflow-hidden">
          <div className="glass-panel rounded-xl p-1 flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-white/5 bg-slate-900/30 shrink-0">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layers size={12} /> Algoritmos Disponibles
              </h3>
            </div>

            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {Object.values(INFO_FILTROS).map((f) => (
                <button
                  key={f.id}
                  onClick={() => aplicarFiltro(f.id)}
                  className={`w-full p-2 rounded-lg text-left transition-all border relative overflow-hidden group text-sm ${
                    filtroActual === f.id
                      ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-800/50 border-transparent hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  {filtroActual === f.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                  )}
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      {f.icono}
                    </span>
                    <div>
                      <div
                        className={`font-bold text-xs ${filtroActual === f.id ? 'text-white' : 'text-slate-300'}`}
                      >
                        {f.nombre}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono hidden md:block opacity-70">
                        {f.id.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Math Panel */}
          <div className="glass-panel rounded-xl p-4 border-t-4 border-t-purple-500 shrink-0">
            <h3 className="text-xs font-bold text-purple-400 uppercase mb-2 flex items-center gap-2">
              <Cpu size={12} /> Lógica Matemática
            </h3>
            <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs border border-slate-800 shadow-inner mb-3 text-green-400 overflow-x-auto">
              <span className="text-purple-400">function</span>{' '}
              <span className="text-yellow-400">applyFilter</span>(pixel) {'{'}
              <br />
              &nbsp;&nbsp;
              <span className="text-slate-400">
                {'//'} {INFO_FILTROS[filtroActual].nombre}
              </span>
              <br />
              &nbsp;&nbsp;{INFO_FILTROS[filtroActual].formula}
              <br />
              {'}'}
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {INFO_FILTROS[filtroActual].descripcion}
            </p>
          </div>
        </div>

        {/* Visual Workspace */}
        <div className="lg:col-span-9 flex flex-col gap-3 min-h-0">
          <div className="flex-1 grid grid-cols-2 gap-3 h-full min-h-0">
            {/* Source */}
            <div className="glass-panel rounded-xl p-3 flex flex-col h-full border-slate-700/50">
              <div className="flex justify-between items-center mb-2 px-1 shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Input (Original)
                </span>
                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              </div>
              <div className="flex-1 bg-slate-950/50 rounded-lg overflow-hidden border border-slate-800 relative flex items-center justify-center min-h-0">
                {imagenOriginal && (
                  <PixelExplorer
                    imagen={imagenOriginal}
                    onPixelHover={() => {}}
                    showOverlay={false}
                  />
                )}
              </div>
            </div>

            {/* Output */}
            <div className="glass-panel rounded-xl p-3 flex flex-col h-full border-cyan-500/30 shadow-[0_0_30px_rgba(8,145,178,0.05)] relative">
              <div className="flex justify-between items-center mb-2 px-1 shrink-0">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  Output (Procesada)
                  {isProcessing && (
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                  )}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-cyan-400' : 'bg-green-500'}`}
                ></div>
              </div>

              <div className="flex-1 bg-slate-950/50 rounded-lg overflow-hidden border border-slate-800 relative flex items-center justify-center group min-h-0">
                {imagenProcesada && (
                  <PixelExplorer imagen={imagenProcesada} onPixelHover={setHoverInfo} />
                )}

                {/* Scanning line effect when processing */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-cyan-500/10 z-20 pointer-events-none">
                    <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_cyan] absolute top-0 animate-scan"></div>
                  </div>
                )}
              </div>

              {hoverInfo && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 z-30 shadow-xl pointer-events-none whitespace-nowrap shrink-0">
                  <span className="text-slate-400">PIXEL DETECTADO:</span>
                  <span className="text-white font-bold">
                    RGB({hoverInfo.pixel.r}, {hoverInfo.pixel.g}, {hoverInfo.pixel.b})
                  </span>
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{
                      background: `rgb(${hoverInfo.pixel.r},${hoverInfo.pixel.g},${hoverInfo.pixel.b})`,
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {filtroActual === 'bordes' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex items-start gap-3 animate-fade-in-up shrink-0">
              <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500 shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="text-yellow-400 font-bold text-xs mb-1">
                  ¡VISIÓN COMPUTACIONAL ACTIVADA! 🤖
                </h4>
                <p className="text-xs text-yellow-100/70">
                  Al detectar estos bordes, la computadora separa los objetos del fondo. Es como un
                  dibujo para colorear. Una vez que tiene los bordes, puede medir distancias (para
                  poner orejas de perro) o reconocer formas (para saber si es un gato).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFinal = () => (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto px-4 py-4 md:py-6 text-center items-center justify-center overflow-y-auto">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 animate-pulse"></div>
        <div className="bg-slate-800 p-6 rounded-full border-2 border-green-500/50 shadow-2xl relative">
          <span className="text-5xl animate-bounce block">🎓</span>
        </div>
      </div>

      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
        ¡Entrenamiento Completado!
      </h2>

      <div className="glass-panel p-6 rounded-2xl border-slate-700 shadow-2xl mb-6 text-left w-full transform hover:scale-[1.01] transition-transform duration-500">
        <h3 className="text-base font-bold text-purple-400 mb-4 border-b border-white/10 pb-3 uppercase tracking-wider">
          Resumen de la Misión
        </h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="bg-green-500/20 p-2 rounded text-green-400 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <strong className="text-white block text-base">La Matriz Oculta</strong>
              <span className="text-slate-400 text-sm">
                Descubriste que las imágenes digitales son en realidad hojas de cálculo gigantes
                llenas de números (0-255).
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-blue-500/20 p-2 rounded text-blue-400 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <strong className="text-white block text-base">Matemática Visual</strong>
              <span className="text-slate-400 text-sm">
                Aprendiste que los filtros de Instagram no son magia, son sumas, restas y promedios
                aplicados a millones de píxeles.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-purple-500/20 p-2 rounded text-purple-400 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <strong className="text-white block text-base">Visión de Máquina</strong>
              <span className="text-slate-400 text-sm">
                Viste cómo la detección de bordes ayuda a las IAs a "entender" formas y siluetas en
                el mundo real.
              </span>
            </div>
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 rounded-xl mb-8 border border-slate-700 max-w-2xl">
        <p className="text-slate-300 italic font-light text-base">
          "La próxima vez que uses un filtro, recordá: tu teléfono está resolviendo millones de
          ecuaciones matemáticas por segundo solo para vos."
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={reiniciar}
          className="group bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-full transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 text-sm"
        >
          <RefreshCw
            size={18}
            className="group-hover:rotate-180 transition-transform duration-500"
          />
          Reiniciar Simulación
        </button>
        <button
          onClick={handleFinalizar}
          className="group bg-white text-slate-900 hover:bg-cyan-50 font-bold py-3 px-8 rounded-full transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 text-sm"
        >
          Continuar
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-slate-900 text-white selection:bg-cyan-500 selection:text-black overflow-hidden font-sans flex flex-col relative">
      <Background />
      <div className="animate-fade-in relative z-10 flex-1 flex flex-col overflow-hidden">
        {fase === 'inicio' && renderInicio()}
        {fase === 'explicacion' && renderExplicacion()}
        {fase === 'elegir-imagen' && renderEleccion()}
        {fase === 'explorar' && renderExplorador()}
        {fase === 'filtros' && renderFiltros()}
        {fase === 'final' && renderFinal()}
      </div>
    </div>
  );
};

export default FiltrosSimulator;
