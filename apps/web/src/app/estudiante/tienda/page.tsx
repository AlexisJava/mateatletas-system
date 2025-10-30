'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CursoCard, CursoCatalogo } from '@/components/gamificacion/CursoCard';
import { ModalCanje } from '@/components/gamificacion/ModalCanje';
import { RecursosBar } from '@/components/gamificacion/RecursosBar';
import { cursosTiendaApi } from '@/lib/api/cursos-tienda.api';
import { recursosApi } from '@/lib/api/tienda.api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'react-hot-toast';
import { Search, Filter, Sparkles } from 'lucide-react';

/**
 * TiendaPage - Página de catálogo de cursos STEAM
 *
 * Features:
 * - Catálogo completo de 20 cursos STEAM
 * - Filtros por categoría (ciencia, programación, robótica, etc.)
 * - Filtros por destacados y nuevos
 * - Cards con gradientes por categoría
 * - Modal de confirmación de canje
 * - Integración con sistema de 3 pagos
 * - RecursosBar sticky en la parte superior
 * - Animaciones con Framer Motion
 */
export default function TiendaPage() {
  const { user } = useAuthStore();
  const estudianteId = user?.id || '';
  const queryClient = useQueryClient();

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [soloDestacados, setSoloDestacados] = useState(false);
  const [soloNuevos, setSoloNuevos] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [cursoSeleccionado, setCursoSeleccionado] = useState<CursoCatalogo | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Obtener recursos del estudiante
  const { data: recursos } = useQuery({
    queryKey: ['recursos', estudianteId],
    queryFn: () => recursosApi.obtenerRecursos(estudianteId),
    enabled: !!estudianteId,
  });

  const nivel = recursos ? Math.floor(Math.sqrt(recursos.xp_total / 100)) + 1 : 1;

  // Obtener catálogo de cursos
  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ['catalogo-cursos', categoriaSeleccionada, soloDestacados, soloNuevos],
    queryFn: () =>
      cursosTiendaApi.obtenerCatalogo({
        categoria: categoriaSeleccionada || undefined,
        destacados: soloDestacados || undefined,
        nuevos: soloNuevos || undefined,
        nivelMaximo: nivel,
      }),
    enabled: !!estudianteId,
  });

  // Mutation para solicitar canje
  const mutationCanje = useMutation({
    mutationFn: (cursoId: string) => cursosTiendaApi.solicitarCanje(cursoId),
    onSuccess: () => {
      toast.success('¡Solicitud enviada! Tu tutor recibirá una notificación para aprobarla.');
      queryClient.invalidateQueries({ queryKey: ['mis-solicitudes'] });
      queryClient.invalidateQueries({ queryKey: ['recursos'] });
      setModalAbierto(false);
      setCursoSeleccionado(null);
    },
    onError: (error: Error) => {
      const mensaje =
        (error as Error & { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al solicitar canje. Intenta nuevamente.';
      toast.error(mensaje);
    },
  });

  const categorias = [
    { id: '', nombre: 'Todos', emoji: '📚' },
    { id: 'ciencia', nombre: 'Ciencia', emoji: '🔬' },
    { id: 'programacion', nombre: 'Programación', emoji: '💻' },
    { id: 'robotica', nombre: 'Robótica', emoji: '🤖' },
    { id: 'matematicas', nombre: 'Matemáticas', emoji: '📐' },
    { id: 'diseno', nombre: 'Diseño', emoji: '🎨' },
  ];

  // Filtrar cursos por búsqueda
  const cursosFiltrados = cursos.filter(
    (curso) =>
      curso.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleClickCurso = (curso: CursoCatalogo) => {
    setCursoSeleccionado(curso);
    setModalAbierto(true);
  };

  const handleConfirmarCanje = () => {
    if (cursoSeleccionado) {
      mutationCanje.mutate(cursoSeleccionado.id);
    }
  };

  if (!user || !estudianteId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Recursos Bar Sticky */}
      <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-md border-b border-white/10 pb-4">
        <div className="px-6 pt-6">
          <RecursosBar estudianteId={estudianteId} />
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-black text-white mb-3 flex items-center justify-center gap-3">
            <Sparkles className="w-12 h-12 text-yellow-400" fill="currentColor" />
            Tienda de Cursos STEAM
          </h1>
          <p className="text-gray-400 text-lg">
            Canjea tus monedas por cursos increíbles de ciencia, programación, robótica y más
          </p>
        </motion.div>

        {/* Barra de búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-gray-900 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </motion.div>

        {/* Filtros de categoría */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 overflow-x-auto pb-2"
        >
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => setCategoriaSeleccionada(categoria.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                categoriaSeleccionada === categoria.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{categoria.emoji}</span>
              {categoria.nombre}
            </button>
          ))}
        </motion.div>

        {/* Filtros adicionales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => setSoloDestacados(!soloDestacados)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              soloDestacados
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            ⭐ Destacados
          </button>
          <button
            onClick={() => setSoloNuevos(!soloNuevos)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              soloNuevos
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            ✨ Nuevos
          </button>
        </motion.div>

        {/* Grid de cursos */}
        {isLoading ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto"
            />
            <p className="text-gray-400 mt-4">Cargando cursos...</p>
          </div>
        ) : cursosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No se encontraron cursos con los filtros seleccionados
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {cursosFiltrados.map((curso, index) => (
              <motion.div
                key={curso.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <CursoCard
                  curso={curso}
                  nivelActual={nivel}
                  monedasActuales={recursos?.monedas_total || 0}
                  onClick={() => handleClickCurso(curso)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Info adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30 text-center max-w-3xl mx-auto"
        >
          <h3 className="text-white font-black text-2xl mb-3">
            💡 ¿Cómo funciona el sistema de canjes?
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Al solicitar un curso, tu tutor/padre recibirá una notificación para aprobar el canje.
            Podrán elegir entre <strong>3 opciones de pago</strong>: que paguen todo ellos en USD,
            que pagues tú con tus monedas, o mitad y mitad. ¡No gastas monedas hasta que sea
            aprobado!
          </p>
        </motion.div>
      </div>

      {/* Modal de confirmación */}
      <ModalCanje
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setCursoSeleccionado(null);
        }}
        curso={cursoSeleccionado}
        nivelActual={nivel}
        monedasActuales={recursos?.monedas_total || 0}
        onConfirmar={handleConfirmarCanje}
        loading={mutationCanje.isPending}
      />
    </div>
  );
}
