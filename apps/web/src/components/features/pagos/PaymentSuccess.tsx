/**
 * PaymentSuccess - Confirmación de pago exitoso
 *
 * Muestra mensaje de éxito con animación y detalles de la transacción.
 *
 * @example
 * ```tsx
 * <PaymentSuccess
 *   titulo="¡Pago exitoso!"
 *   mensaje="Tu suscripción ha sido activada"
 *   onContinuar={() => router.push('/dashboard')}
 * />
 * ```
 */

import { Button, Card } from '@/components/ui';

interface PaymentSuccessProps {
  titulo?: string;
  mensaje?: string;
  detalles?: Array<{ label: string; value: string }>;
  onContinuar?: () => void;
}

export function PaymentSuccess({
  titulo = '¡Pago exitoso!',
  mensaje = 'Tu transacción se ha completado correctamente',
  detalles,
  onContinuar,
}: PaymentSuccessProps) {
  return (
    <Card className="max-w-2xl mx-auto text-center space-y-6 py-12 border-4 border-[#4caf50] shadow-[8px_8px_0px_rgba(0,0,0,1)]">
      {/* Checkmark animado */}
      <div className="flex justify-center">
        <div
          className="
            w-24 h-24
            bg-[#4caf50]
            rounded-full
            flex items-center justify-center
            border-4 border-black
            shadow-[5px_5px_0px_rgba(0,0,0,1)]
            animate-bounce
          "
        >
          <span className="text-5xl text-white">✓</span>
        </div>
      </div>

      {/* Título */}
      <h1 className="font-lilita text-4xl text-dark">{titulo}</h1>

      {/* Mensaje */}
      <p className="text-lg text-gray-700 px-6">{mensaje}</p>

      {/* Detalles de la transacción */}
      {detalles && detalles.length > 0 && (
        <div
          className="
            bg-[#fff9e6]
            border-2 border-[#f7b801]
            rounded-lg
            p-6
            space-y-3
            max-w-md
            mx-auto
          "
        >
          <p className="font-bold text-dark mb-4">📋 Detalles de la compra</p>
          {detalles.map((detalle, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{detalle.label}:</span>
              <span className="font-bold text-dark">{detalle.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        {onContinuar && (
          <Button variant="primary" size="lg" onClick={onContinuar}>
            Ir al Dashboard →
          </Button>
        )}
      </div>

      {/* Mensaje adicional */}
      <p className="text-sm text-gray-500 px-6">
        Recibirás un correo con los detalles de tu compra
      </p>
    </Card>
  );
}
