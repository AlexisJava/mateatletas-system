/**
 * TiendaView - Vista de la Tienda
 * Estética Brawl Stars: Grid de items, categorías, compra con monedas/gemas
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Sparkles, X, Check } from 'lucide-react';
import { tiendaApi, recursosApi } from '@/lib/api/tienda.api';
import type {
  ItemTiendaConCategoria,
  CategoriaItem,
  RecursosEstudiante,
  RarezaItem,
  ItemObtenidoConInfo,
} from '@mateatletas/contracts';
import { isAxiosError } from 'axios';

interface TiendaViewProps {
  estudiante: {
    id: string;
    nombre: string;
    nivel_actual: number;
  };
}

type Tab = 'tienda' | 'inventario';

// Colores por rareza
const RAREZA_COLORS: Record<RarezaItem, { gradient: string; glow: string; border: string }> = {
  COMUN: {
    gradient: 'from-gray-500 to-gray-600',
    glow: 'shadow-[0_0_20px_rgba(156,163,175,0.5)]',
    border: 'border-gray-400',
  },
  RARO: {
    gradient: 'from-blue-500 to-blue-600',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    border: 'border-blue-400',
  },
  EPICO: {
    gradient: 'from-purple-500 to-purple-600',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    border: 'border-purple-400',
  },
  LEGENDARIO: {
    gradient: 'from-yellow-500 to-orange-600',
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.8)]',
    border: 'border-yellow-400',
  },
};

export function TiendaView({ estudiante }: TiendaViewProps) {
  const [tab, setTab] = useState<Tab>('tienda');
  const [items, setItems] = useState<ItemTiendaConCategoria[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [recursos, setRecursos] = useState<RecursosEstudiante | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemSeleccionado, setItemSeleccionado] = useState<ItemTiendaConCategoria | null>(null);
  const [comprando, setComprando] = useState(false);
  const [inventario, setInventario] = useState<ItemObtenidoConInfo[]>([]);
  const [loadingInventario, setLoadingInventario] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [itemsData, recursosData] = await Promise.all([
          tiendaApi.obtenerItems({ nivel_estudiante: estudiante.nivel_actual }),
          recursosApi.obtenerRecursos(estudiante.id),
        ]);

        if (itemsData) {
          setItems(itemsData.items || []);
          setCategorias(itemsData.categorias || []);
        }
        setRecursos(recursosData);
      } catch (error) {
        console.error('Error al cargar tienda:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [estudiante]);

  // Cargar inventario cuando se cambia a la pestaña de inventario
  useEffect(() => {
    if (tab === 'inventario') {
      const cargarInventario = async () => {
        try {
          setLoadingInventario(true);
          const data = await tiendaApi.obtenerInventario(estudiante.id);
          if (data) {
            setInventario(data.items || []);
            // Actualizar recursos también
            if (data.recursos) {
              setRecursos(data.recursos);
            }
          }
        } catch (error) {
          console.error('Error al cargar inventario:', error);
        } finally {
          setLoadingInventario(false);
        }
      };

      cargarInventario();
    }
  }, [tab, estudiante.id]);

  // Filtrar items por categoría
  const itemsFiltrados = categoriaActiva
    ? items.filter((item) => item.categoria_id === categoriaActiva)
    : items;

  // Comprar item
  const comprarItem = async (item: ItemTiendaConCategoria) => {
    if (!recursos) return;

    // Verificar recursos suficientes
    if (item.precio_monedas > 0 && recursos.monedas_total < item.precio_monedas) {
      alert('No tienes suficientes monedas!');
      return;
    }

    if (item.precio_gemas > 0 && recursos.gemas_total < item.precio_gemas) {
      alert('No tienes suficientes gemas!');
      return;
    }

    try {
      setComprando(true);
      const resultado = await tiendaApi.comprarItem({
        item_id: item.id,
        estudiante_id: estudiante.id,
      });

      // Actualizar recursos localmente
      setRecursos(resultado.recursos_actualizados);

      // Mostrar mensaje de éxito
      alert(`¡Compraste ${item.nombre}! 🎉`);

      // Cerrar modal
      setItemSeleccionado(null);
    } catch (error) {
      console.error('Error al comprar:', error);
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Error al comprar el item');
      } else {
        alert('Error al comprar el item');
      }
    } finally {
      setComprando(false);
    }
  };

  // Equipar/desequipar item del inventario
  const equiparItem = async (itemObtenido: ItemObtenidoConInfo) => {
    try {
      await tiendaApi.equiparItem(estudiante.id, itemObtenido.item_id);

      // Actualizar el estado del inventario localmente
      setInventario((prev) =>
        prev.map((item) => {
          if (item.id === itemObtenido.id) {
            return { ...item, equipado: !item.equipado };
          }
          // Si el item es del mismo tipo, desequiparlo (solo un item por tipo puede estar equipado)
          if (item.item.tipo_item === itemObtenido.item.tipo_item && item.equipado) {
            return { ...item, equipado: false };
          }
          return item;
        })
      );

      alert(itemObtenido.equipado ? 'Item desequipado' : '¡Item equipado! ✨');
    } catch (error) {
      console.error('Error al equipar item:', error);
      if (isAxiosError(error)) {
        alert(error.response?.data?.message || 'Error al equipar el item');
      } else {
        alert('Error al equipar el item');
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header con recursos */}
      <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm border-b-4 border-black p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-black text-white" style={{ textShadow: '0 3px 0 rgba(0,0,0,0.5)' }}>
              TIENDA
            </h1>
          </div>

          {/* Recursos del jugador */}
          {recursos && (
            <div className="flex items-center gap-3">
              {/* XP */}
              <div className="bg-cyan-500/20 border-2 border-cyan-400 rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-white font-black text-lg">{recursos.xp_total.toLocaleString()}</span>
              </div>

              {/* Monedas */}
              <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-2xl">🪙</span>
                <span className="text-white font-black text-lg">{recursos.monedas_total.toLocaleString()}</span>
              </div>

              {/* Gemas */}
              <div className="bg-purple-500/20 border-2 border-purple-400 rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-2xl">💎</span>
                <span className="text-white font-black text-lg">{recursos.gemas_total.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('tienda')}
            className={`
              px-6 py-3 rounded-xl font-black text-sm transition-all
              ${tab === 'tienda'
                ? 'bg-white text-purple-900 shadow-[0_4px_0_rgba(0,0,0,0.4)]'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
              }
            `}
          >
            TIENDA
          </button>
          <button
            onClick={() => setTab('inventario')}
            className={`
              px-6 py-3 rounded-xl font-black text-sm transition-all
              ${tab === 'inventario'
                ? 'bg-white text-purple-900 shadow-[0_4px_0_rgba(0,0,0,0.4)]'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
              }
            `}
          >
            INVENTARIO
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === 'tienda' && (
            <motion.div
              key="tienda"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              {/* Filtros por categoría */}
              <div className="p-4 border-b border-white/10">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setCategoriaActiva(null)}
                    className={`
                      px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all
                      ${categoriaActiva === null
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }
                    `}
                  >
                    Todos
                  </button>
                  {categorias.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoriaActiva(cat.id)}
                      className={`
                        px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all
                        ${categoriaActiva === cat.id
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }
                      `}
                    >
                      {cat.icono} {cat.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de items */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white/60 text-xl font-bold">Cargando...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {itemsFiltrados.map((item, i) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        delay={i * 0.05}
                        onClick={() => setItemSeleccionado(item)}
                      />
                    ))}
                  </div>
                )}

                {!loading && itemsFiltrados.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <span className="text-6xl mb-4">🛒</span>
                    <p className="text-white/60 text-lg font-bold">
                      No hay items en esta categoría
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'inventario' && (
            <motion.div
              key="inventario"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto p-6"
            >
              {loadingInventario ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white/60 text-xl font-bold">Cargando inventario...</div>
                </div>
              ) : inventario.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-6xl mb-4">📦</span>
                  <p className="text-white/60 text-lg font-bold">
                    Tu inventario está vacío
                  </p>
                  <p className="text-white/40 text-sm mt-2">
                    ¡Compra items en la tienda para empezar tu colección!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {inventario.map((itemObtenido, i) => (
                    <InventarioItemCard
                      key={itemObtenido.id}
                      itemObtenido={itemObtenido}
                      delay={i * 0.05}
                      onEquipar={() => equiparItem(itemObtenido)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de compra */}
      <AnimatePresence>
        {itemSeleccionado && (
          <ModalCompra
            item={itemSeleccionado}
            recursos={recursos}
            comprando={comprando}
            onComprar={() => comprarItem(itemSeleccionado)}
            onCerrar={() => setItemSeleccionado(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface InventarioItemCardProps {
  itemObtenido: ItemObtenidoConInfo;
  delay: number;
  onEquipar: () => void;
}

function InventarioItemCard({ itemObtenido, delay, onEquipar }: InventarioItemCardProps) {
  const { item } = itemObtenido;
  const colors = RAREZA_COLORS[item.rareza];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`
        group relative
        bg-gradient-to-br ${colors.gradient}
        border-4 ${colors.border} border-black
        rounded-3xl
        p-6
        ${colors.glow}
        transition-all duration-200
        ${itemObtenido.equipado ? 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : ''}
      `}
    >
      {/* Badge de equipado */}
      {itemObtenido.equipado && (
        <div className="absolute -top-3 -left-3 bg-yellow-500 border-2 border-black rounded-full px-3 py-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-black" />
          <span className="text-black text-xs font-black uppercase">Equipado</span>
        </div>
      )}

      {/* Badge de rareza */}
      <div className="absolute -top-3 -right-3 bg-black border-2 border-white rounded-full px-3 py-1">
        <span className="text-white text-xs font-black uppercase">{item.rareza}</span>
      </div>

      {/* Icono/Imagen */}
      <div className="text-6xl mb-3 text-center">
        {item.imagen_url ? (
          <img src={item.imagen_url} alt={item.nombre} className="w-20 h-20 mx-auto object-cover rounded-xl" />
        ) : (
          <span>🎁</span>
        )}
      </div>

      {/* Nombre */}
      <h3
        className="text-white font-black text-lg mb-2 text-center"
        style={{ textShadow: '0 2px 0 rgba(0,0,0,0.5)' }}
      >
        {item.nombre}
      </h3>

      {/* Descripción */}
      {item.descripcion && (
        <p className="text-white/80 text-xs mb-3 line-clamp-2 text-center">
          {item.descripcion}
        </p>
      )}

      {/* Cantidad (si aplica) */}
      {itemObtenido.cantidad > 1 && (
        <div className="text-center mb-3">
          <div className="bg-black/40 rounded-lg px-3 py-1 inline-block">
            <span className="text-white font-black text-sm">x{itemObtenido.cantidad}</span>
          </div>
        </div>
      )}

      {/* Botón equipar */}
      <button
        onClick={onEquipar}
        className={`
          w-full mt-3
          py-3 rounded-xl
          font-black text-sm uppercase
          border-4 border-black
          transition-all
          ${itemObtenido.equipado
            ? 'bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white'
            : 'bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white'
          }
          shadow-[0_4px_0_rgba(0,0,0,0.6)] hover:shadow-[0_6px_0_rgba(0,0,0,0.6)]
          active:shadow-[0_2px_0_rgba(0,0,0,0.6)] active:translate-y-1
        `}
      >
        {itemObtenido.equipado ? (
          <>
            <X className="w-4 h-4 inline mr-1" />
            Desequipar
          </>
        ) : (
          <>
            <Check className="w-4 h-4 inline mr-1" />
            Equipar
          </>
        )}
      </button>
    </motion.div>
  );
}

interface ItemCardProps {
  item: ItemTiendaConCategoria;
  delay: number;
  onClick: () => void;
}

function ItemCard({ item, delay, onClick }: ItemCardProps) {
  const colors = RAREZA_COLORS[item.rareza];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`
        group relative
        bg-gradient-to-br ${colors.gradient}
        border-4 ${colors.border} border-black
        rounded-3xl
        p-6
        ${colors.glow}
        hover:scale-105 hover:-translate-y-2
        transition-all duration-200
        text-left
      `}
    >
      {/* Badge de rareza */}
      <div className="absolute -top-3 -right-3 bg-black border-2 border-white rounded-full px-3 py-1">
        <span className="text-white text-xs font-black uppercase">{item.rareza}</span>
      </div>

      {/* Icono/Imagen */}
      <div className="text-6xl mb-3 text-center">
        {item.imagen_url ? (
          <img src={item.imagen_url} alt={item.nombre} className="w-20 h-20 mx-auto object-cover rounded-xl" />
        ) : (
          <span>🎁</span>
        )}
      </div>

      {/* Nombre */}
      <h3
        className="text-white font-black text-lg mb-2 text-center"
        style={{ textShadow: '0 2px 0 rgba(0,0,0,0.5)' }}
      >
        {item.nombre}
      </h3>

      {/* Descripción */}
      {item.descripcion && (
        <p className="text-white/80 text-xs mb-3 line-clamp-2 text-center">
          {item.descripcion}
        </p>
      )}

      {/* Precio */}
      <div className="flex items-center justify-center gap-3 mt-auto">
        {item.precio_monedas > 0 && (
          <div className="bg-black/40 rounded-lg px-3 py-1 flex items-center gap-1">
            <span className="text-lg">🪙</span>
            <span className="text-white font-black text-sm">{item.precio_monedas}</span>
          </div>
        )}
        {item.precio_gemas > 0 && (
          <div className="bg-black/40 rounded-lg px-3 py-1 flex items-center gap-1">
            <span className="text-lg">💎</span>
            <span className="text-white font-black text-sm">{item.precio_gemas}</span>
          </div>
        )}
      </div>

      {/* Nivel requerido */}
      {item.nivel_minimo_requerido > 1 && (
        <div className="mt-2 text-center">
          <span className="text-white/60 text-xs font-bold">
            Nivel {item.nivel_minimo_requerido}+
          </span>
        </div>
      )}
    </motion.button>
  );
}

interface ModalCompraProps {
  item: ItemTiendaConCategoria;
  recursos: RecursosEstudiante | null;
  comprando: boolean;
  onComprar: () => void;
  onCerrar: () => void;
}

function ModalCompra({ item, recursos, comprando, onComprar, onCerrar }: ModalCompraProps) {
  const colors = RAREZA_COLORS[item.rareza];

  const tieneSuficiente =
    recursos &&
    (item.precio_monedas === 0 || recursos.monedas_total >= item.precio_monedas) &&
    (item.precio_gemas === 0 || recursos.gemas_total >= item.precio_gemas);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={onCerrar}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className={`
          relative
          bg-gradient-to-br ${colors.gradient}
          border-[8px] border-black
          rounded-[40px]
          shadow-[0_16px_0_rgba(0,0,0,0.6)]
          p-8
          max-w-md w-full
        `}
      >
        {/* Botón cerrar */}
        <button
          onClick={onCerrar}
          className="
            absolute -top-4 -right-4
            bg-red-500 hover:bg-red-600
            border-[5px] border-black
            rounded-full
            w-16 h-16
            flex items-center justify-center
            shadow-[0_6px_0_rgba(0,0,0,0.6)]
            z-10
          "
        >
          <X className="w-8 h-8 text-white" strokeWidth={4} />
        </button>

        {/* Icono */}
        <div className="text-center mb-4">
          <div className="text-8xl mb-2">
            {item.imagen_url ? (
              <img src={item.imagen_url} alt={item.nombre} className="w-32 h-32 mx-auto object-cover rounded-xl" />
            ) : (
              <span>🎁</span>
            )}
          </div>
          <div className="bg-black/40 rounded-lg px-4 py-2 inline-block">
            <span className="text-white text-sm font-black uppercase">{item.rareza}</span>
          </div>
        </div>

        {/* Nombre */}
        <h2
          className="text-white font-black text-3xl mb-3 text-center"
          style={{ textShadow: '0 3px 0 rgba(0,0,0,0.5)' }}
        >
          {item.nombre}
        </h2>

        {/* Descripción */}
        {item.descripcion && (
          <p className="text-white/90 text-center mb-6">{item.descripcion}</p>
        )}

        {/* Precio */}
        <div className="bg-black/40 rounded-2xl p-4 mb-6">
          <p className="text-white/60 text-sm font-bold text-center mb-3">PRECIO</p>
          <div className="flex items-center justify-center gap-4">
            {item.precio_monedas > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-3xl">🪙</span>
                <span className="text-white font-black text-2xl">{item.precio_monedas}</span>
              </div>
            )}
            {item.precio_gemas > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-3xl">💎</span>
                <span className="text-white font-black text-2xl">{item.precio_gemas}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botón comprar */}
        <button
          onClick={onComprar}
          disabled={!tieneSuficiente || comprando}
          className={`
            w-full
            py-4 rounded-2xl
            font-black text-xl uppercase
            border-[6px] border-black
            transition-all
            ${tieneSuficiente && !comprando
              ? 'bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white shadow-[0_6px_0_rgba(0,0,0,0.6)] hover:shadow-[0_8px_0_rgba(0,0,0,0.6)]'
              : 'bg-gray-600 text-white/50 cursor-not-allowed'
            }
          `}
        >
          {comprando ? (
            'Comprando...'
          ) : tieneSuficiente ? (
            <>
              <Check className="w-6 h-6 inline mr-2" />
              Comprar
            </>
          ) : (
            'Recursos insuficientes'
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
