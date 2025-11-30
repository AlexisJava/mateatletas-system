'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles, BookOpen, Clock, Trophy } from 'lucide-react';
import { cursosTiendaApi, type CursoCatalogo } from '@/lib/api/cursos-tienda.api';
import { recursosApi } from '@/lib/api/tienda.api';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';

interface CursosViewProps {
  estudiante: {
    id: string;
    username: string;
    nivel_actual: number;
  };
}

/**
 * CursosView - Vista de catálogo de cursos STEAM (SPA Style)
 *
 * Diseño tipo Brawl Stars para el gimnasio
 * Modal overlay con catálogo de cursos canjeables
 */
export function CursosView({ estudiante }: CursosViewProps) {
  const [cursos, setCursos] = useState<CursoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [monedas, setMonedas] = useState(0);
  const [nivel, setNivel] = useState(estudiante.nivel_actual);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      console.log('🔄 [CursosView] Iniciando carga de datos...');
      console.log('🔄 [CursosView] Estudiante ID:', estudiante.id);
      setLoading(true);

      console.log('🔄 [CursosView] Llamando a cursosTiendaApi.obtenerCatalogo()...');
      const [cursosData, recursosData] = await Promise.all([
        cursosTiendaApi.obtenerCatalogo(),
        recursosApi.obtenerRecursos(estudiante.id),
      ]);

      console.log('✅ [CursosView] cursosData:', cursosData);
      console.log('✅ [CursosView] recursosData:', recursosData);

      if (cursosData) {
        console.log('✅ [CursosView] Seteando', cursosData.length, 'cursos');
        setCursos(cursosData);
      } else {
        console.warn('⚠️ [CursosView] cursosData is undefined');
      }

      if (recursosData) {
        setMonedas(recursosData.monedas_total || 0);
        // Calcular nivel desde XP
        const nivelCalculado = Math.floor(Math.sqrt(recursosData.xp_total / 100)) + 1;
        setNivel(nivelCalculado);
      } else {
        console.warn('⚠️ [CursosView] recursosData is undefined');
      }
    } catch (error) {
      console.error('❌ [CursosView] Error al cargar cursos:', error);
      toast.error('Error al cargar el catálogo');
    } finally {
      setLoading(false);
      console.log('✅ [CursosView] Carga finalizada');
    }
  };

  const handleSolicitarCanje = async (curso: CursoCatalogo) => {
    // Validaciones previas
    if (nivel < curso.nivel_requerido) {
      toast.error(`Necesitas nivel ${curso.nivel_requerido} para este curso`);
      return;
    }

    if (monedas < curso.precio_monedas) {
      toast.error(`Te faltan ${curso.precio_monedas - monedas} monedas`);
      return;
    }

    try {
      await cursosTiendaApi.solicitarCanje(curso.id);
      toast.success(`¡Solicitud enviada! Tu tutor recibirá una notificación.`);
      // Actualizar monedas
      cargarDatos();
    } catch (error) {
      const mensaje = isAxiosError(error)
        ? error.response?.data?.message || 'Error al solicitar el canje'
        : 'Error al solicitar el canje';
      toast.error(mensaje);
    }
  };

  const categorias = [
    { id: '', nombre: 'Todos', emoji: '📚' },
    { id: 'ciencia', nombre: 'Ciencia', emoji: '🔬' },
    { id: 'programacion', nombre: 'Programación', emoji: '💻' },
    { id: 'robotica', nombre: 'Robótica', emoji: '🤖' },
    { id: 'matematicas', nombre: 'Matemáticas', emoji: '📐' },
    { id: 'diseno', nombre: 'Diseño', emoji: '🎨' },
  ];

  const cursosFiltrados = (cursos || []).filter((curso) => {
    const matchCategoria = !categoriaSeleccionada || curso.categoria === categoriaSeleccionada;
    const matchBusqueda =
      !busqueda ||
      curso.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  const getCategoriaEmoji = (categoria: string): string => {
    const cat = categorias.find((c) => c.id === categoria);
    return cat?.emoji || '📚';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-2xl p-6 overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-yellow-400" fill="currentColor" />
            <h2 className="text-4xl font-black text-white">TIENDA DE CURSOS</h2>
          </div>
        </div>

        {/* Monedas (debajo del título) */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur px-4 py-2 rounded-xl border border-yellow-500/30 w-fit mb-4">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-xl font-black text-yellow-400">
            {monedas.toLocaleString('es-AR')} monedas
          </span>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-black/30 backdrop-blur border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filtros de categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => setCategoriaSeleccionada(categoria.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                categoriaSeleccionada === categoria.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white scale-105'
                  : 'bg-black/30 backdrop-blur text-gray-300 hover:bg-black/50'
              }`}
            >
              <span className="text-xl">{categoria.emoji}</span>
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de cursos */}
      <div className="flex-1 overflow-y-auto pr-2">
        {cursosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <BookOpen className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-xl">No se encontraron cursos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cursosFiltrados.map((curso) => {
              const bloqueadoPorNivel = nivel < curso.nivel_requerido;
              const bloqueadoPorMonedas = monedas < curso.precio_monedas;
              const bloqueado = bloqueadoPorNivel || bloqueadoPorMonedas;

              return (
                <motion.div
                  key={curso.id}
                  whileHover={{ scale: bloqueado ? 1 : 1.05, y: bloqueado ? 0 : -4 }}
                  className={`relative bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/10 ${
                    bloqueado ? 'opacity-60' : 'cursor-pointer hover:border-cyan-500/50'
                  }`}
                  onClick={() => !bloqueado && handleSolicitarCanje(curso)}
                >
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                      {curso.nuevo && (
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          ✨ NUEVO
                        </span>
                      )}
                      {curso.destacado && (
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          ⭐ TOP
                        </span>
                      )}
                    </div>
                    <div className="text-3xl">{getCategoriaEmoji(curso.categoria)}</div>
                  </div>

                  {/* Título */}
                  <h3 className="text-white font-black text-lg mb-2 line-clamp-2">
                    {curso.titulo}
                  </h3>

                  {/* Info */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {curso.duracion_clases} clases
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Nivel {curso.nivel_requerido}
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 text-xl font-bold">
                      💰 {curso.precio_monedas.toLocaleString('es-AR')}
                    </span>
                    {!bloqueado && (
                      <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:shadow-lg transition-all">
                        ¡CANJEAR!
                      </button>
                    )}
                  </div>

                  {/* Lock overlay */}
                  {bloqueado && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <p className="text-white font-bold text-sm">
                          {bloqueadoPorNivel && `Nivel ${curso.nivel_requerido} requerido`}
                          {bloqueadoPorNivel && bloqueadoPorMonedas && ' • '}
                          {bloqueadoPorMonedas &&
                            `${(curso.precio_monedas - monedas).toLocaleString('es-AR')} monedas más`}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
