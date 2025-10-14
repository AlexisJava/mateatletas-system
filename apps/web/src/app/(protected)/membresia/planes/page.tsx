'use client';

import { useEffect, useState } from 'react';
import { useCatalogoStore } from '@/store/catalogo.store';
import { usePagosStore } from '@/store/pagos.store';
import { PricingCard } from '@/components/features/pagos';
import { Card } from '@/components/ui';
import { TipoProducto } from '@/types/catalogo.types';

/**
 * Página de Planes de Membresía
 * Ruta: /membresia/planes
 *
 * Muestra todos los planes de suscripción disponibles
 * con pricing y opción de compra.
 */
export default function PlanesPage() {
  const { productos, isLoading, error, fetchProductos } = useCatalogoStore();
  const {
    crearPreferenciaSuscripcion,
    isLoading: isPagoLoading,
    error: pagoError,
  } = usePagosStore();

  const [productoSeleccionado, setProductoSeleccionado] = useState<
    string | null
  >(null);

  // Cargar productos al montar
  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Filtrar solo suscripciones
  const suscripciones = productos.filter(
    (p) => p.tipo === TipoProducto.Suscripcion
  );

  // Ordenar por precio (asumiendo que hay básico, estándar, premium)
  const suscripcionesOrdenadas = [...suscripciones].sort(
    (a, b) => a.precio - b.precio
  );

  // Determinar cuál está destacado (el del medio)
  const indexDestacado = Math.floor(suscripcionesOrdenadas.length / 2);

  // Handler para comprar
  const handleComprar = async (productoId: string) => {
    setProductoSeleccionado(productoId);

    // Crear preferencia de pago
    const initPoint = await crearPreferenciaSuscripcion(productoId);

    if (initPoint) {
      // Redirigir a MercadoPago
      window.location.href = initPoint;
    } else {
      // Mostrar error
      alert(pagoError || 'Error al procesar el pago');
      setProductoSeleccionado(null);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-6xl">💳</span>
        </div>
        <h1 className="font-lilita text-5xl text-[#2a1a5e]">
          Planes de Membresía
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Elige el plan perfecto para potenciar el aprendizaje de tus hijos
        </p>
      </div>

      {/* Banner de beneficios */}
      <Card className="bg-gradient-to-r from-[#00d9ff]/20 to-[#f7b801]/20 border-2 border-[#00d9ff]">
        <div className="flex flex-wrap items-center justify-around gap-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            <div>
              <p className="font-bold text-dark">Clases ilimitadas</p>
              <p className="text-sm text-gray-600">Sin límite de reservas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">👨‍🏫</span>
            <div>
              <p className="font-bold text-dark">Mejores profesores</p>
              <p className="text-sm text-gray-600">Docentes certificados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="font-bold text-dark">Gamificación</p>
              <p className="text-sm text-gray-600">Logros y recompensas</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Error state */}
      {(error || pagoError) && (
        <Card className="bg-red-50 border-2 border-red-300">
          <div className="flex items-center gap-3 text-red-700">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error || pagoError}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="animate-pulse border-3 border-black shadow-[5px_5px_0px_rgba(0,0,0,0.1)]"
            >
              <div className="p-8 space-y-4">
                <div className="h-16 bg-gray-200 rounded w-16 mx-auto"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-4 bg-gray-200 rounded"
                    ></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded mt-6"></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && suscripciones.length === 0 && (
        <Card className="py-16">
          <div className="text-center space-y-4">
            <div className="text-7xl">💳</div>
            <div>
              <h3 className="font-lilita text-3xl text-[#2a1a5e] mb-2">
                No hay planes disponibles
              </h3>
              <p className="text-gray-600">
                Por el momento no tenemos planes de suscripción disponibles
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Grid de planes */}
      {!isLoading && suscripciones.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {suscripcionesOrdenadas.map((suscripcion, index) => (
              <PricingCard
                key={suscripcion.id}
                producto={suscripcion}
                destacado={index === indexDestacado}
                onComprar={handleComprar}
                isLoading={
                  isPagoLoading && productoSeleccionado === suscripcion.id
                }
              />
            ))}
          </div>

          {/* FAQ o info adicional */}
          <Card>
            <h3 className="font-lilita text-2xl text-dark mb-4">
              ❓ Preguntas frecuentes
            </h3>
            <div className="space-y-4">
              <div>
                <p className="font-bold text-dark mb-1">
                  ¿Puedo cancelar en cualquier momento?
                </p>
                <p className="text-sm text-gray-600">
                  Sí, puedes cancelar tu suscripción cuando quieras desde tu
                  panel de control. No hay penalizaciones.
                </p>
              </div>
              <div>
                <p className="font-bold text-dark mb-1">
                  ¿Cómo funciona el pago?
                </p>
                <p className="text-sm text-gray-600">
                  El pago se procesa de forma segura a través de MercadoPago.
                  Tu suscripción se activa inmediatamente después del pago.
                </p>
              </div>
              <div>
                <p className="font-bold text-dark mb-1">
                  ¿Puedo cambiar de plan?
                </p>
                <p className="text-sm text-gray-600">
                  Sí, puedes actualizar o cambiar tu plan en cualquier momento
                  desde tu dashboard.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
