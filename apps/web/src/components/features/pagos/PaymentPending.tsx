/**
 * PaymentPending - Pago pendiente de procesamiento
 *
 * Muestra mensaje de pago en proceso.
 *
 * @example
 * ```tsx
 * <PaymentPending
 *   onVerEstado={() => router.push('/dashboard/membresia')}
 * />
 * ```
 */

import { Button, Card } from '@/components/ui';

interface PaymentPendingProps {
  onVerEstado?: () => void;
  onVolverInicio?: () => void;
}

export function PaymentPending({
  onVerEstado,
  onVolverInicio,
}: PaymentPendingProps) {
  return (
    <Card className="max-w-2xl mx-auto text-center space-y-6 py-12 border-4 border-[#f7b801] shadow-[8px_8px_0px_rgba(0,0,0,1)]">
      {/* Ícono de reloj */}
      <div className="flex justify-center">
        <div
          className="
            w-24 h-24
            bg-[#f7b801]
            rounded-full
            flex items-center justify-center
            border-4 border-black
            shadow-[5px_5px_0px_rgba(0,0,0,1)]
            animate-pulse
          "
        >
          <span className="text-5xl">⏱️</span>
        </div>
      </div>

      {/* Título */}
      <h1 className="font-lilita text-4xl text-dark">
        Pago en proceso
      </h1>

      {/* Mensaje */}
      <p className="text-lg text-gray-700 px-6">
        Tu pago está siendo procesado. Esto puede tardar unos minutos.
      </p>

      {/* Información adicional */}
      <div
        className="
          bg-[#fff9e6]
          border-2 border-[#f7b801]
          rounded-lg
          p-6
          space-y-3
          max-w-md
          mx-auto
          text-left
        "
      >
        <p className="font-bold text-dark mb-3">📌 ¿Qué hacer ahora?</p>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#f7b801] mt-0.5">•</span>
            <span>
              Te notificaremos por correo cuando se complete el pago
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#f7b801] mt-0.5">•</span>
            <span>
              Puedes cerrar esta página de forma segura
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#f7b801] mt-0.5">•</span>
            <span>
              El proceso puede tardar hasta 48 horas
            </span>
          </li>
        </ul>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        {onVerEstado && (
          <Button variant="secondary" size="lg" onClick={onVerEstado}>
            Ver estado de mi membresía
          </Button>
        )}
        {onVolverInicio && (
          <Button variant="outline" size="lg" onClick={onVolverInicio}>
            Volver al inicio
          </Button>
        )}
      </div>
    </Card>
  );
}
