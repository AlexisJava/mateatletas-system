'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentSuccess, PaymentPending } from '@/components/features/pagos';

/**
 * Página de Confirmación de Pago
 * Ruta: /membresia/confirmacion?payment_id=XXX&status=approved
 *
 * Página de retorno después del pago en MercadoPago.
 * Muestra el estado del pago según los query params.
 */
export default function ConfirmacionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'loading' | 'approved' | 'pending' | 'rejected'>('loading');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    // Obtener parámetros de la URL
    const paymentIdParam = searchParams.get('payment_id');
    const statusParam = searchParams.get('status');
    const collectionStatus = searchParams.get('collection_status');

    setPaymentId(paymentIdParam);

    // Determinar estado del pago
    if (statusParam === 'approved' || collectionStatus === 'approved') {
      setStatus('approved');
    } else if (
      statusParam === 'pending' ||
      statusParam === 'in_process' ||
      collectionStatus === 'pending'
    ) {
      setStatus('pending');
    } else if (statusParam === 'rejected' || statusParam === 'failure') {
      setStatus('rejected');
    } else {
      // Si no hay parámetros, asumir pendiente
      setStatus('pending');
    }
  }, [searchParams]);

  // Handlers
  const handleContinuar = () => {
    router.push('/dashboard');
  };

  const handleVerEstado = () => {
    router.push('/dashboard');
  };

  const handleVolverInicio = () => {
    router.push('/dashboard');
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">⏱️</div>
          <p className="text-gray-600">Verificando estado del pago...</p>
        </div>
      </div>
    );
  }

  // Approved - Success
  if (status === 'approved') {
    return (
      <div className="animate-fadeIn py-12">
        <PaymentSuccess
          titulo="¡Pago exitoso!"
          mensaje="Tu membresía ha sido activada correctamente. Ya puedes disfrutar de todos los beneficios."
          detalles={
            paymentId
              ? [
                  { label: 'ID de Pago', value: paymentId },
                  { label: 'Estado', value: 'Aprobado' },
                  {
                    label: 'Fecha',
                    value: new Date().toLocaleDateString('es-ES'),
                  },
                ]
              : undefined
          }
          onContinuar={handleContinuar}
        />
      </div>
    );
  }

  // Pending
  if (status === 'pending') {
    return (
      <div className="animate-fadeIn py-12">
        <PaymentPending onVerEstado={handleVerEstado} onVolverInicio={handleVolverInicio} />
      </div>
    );
  }

  // Rejected - Error
  return (
    <div className="animate-fadeIn py-12">
      <div className="max-w-2xl mx-auto text-center space-y-6 py-12 border-4 border-[#f44336] rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white p-8">
        {/* Ícono de error */}
        <div className="flex justify-center">
          <div
            className="
              w-24 h-24
              bg-[#f44336]
              rounded-full
              flex items-center justify-center
              border-4 border-black
              shadow-[5px_5px_0px_rgba(0,0,0,1)]
            "
          >
            <span className="text-5xl text-white">✕</span>
          </div>
        </div>

        {/* Título */}
        <h1 className="font-[family-name:var(--font-fredoka)] text-4xl text-dark">
          Pago rechazado
        </h1>

        {/* Mensaje */}
        <p className="text-lg text-gray-700">
          Tu pago no pudo ser procesado. Por favor, intenta nuevamente o contacta a tu banco.
        </p>

        {/* Razones comunes */}
        <div
          className="
            bg-red-50
            border-2 border-[#f44336]
            rounded-lg
            p-6
            space-y-3
            max-w-md
            mx-auto
            text-left
          "
        >
          <p className="font-bold text-dark mb-3">Razones comunes de rechazo:</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[#f44336] mt-0.5">•</span>
              <span>Fondos insuficientes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#f44336] mt-0.5">•</span>
              <span>Datos de tarjeta incorrectos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#f44336] mt-0.5">•</span>
              <span>Tarjeta vencida o bloqueada</span>
            </li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <button
            onClick={() => router.push('/membresia/planes')}
            className="
              px-6 py-3
              bg-primary
              text-white
              font-bold
              rounded-lg
              border-2 border-black
              shadow-[3px_3px_0px_rgba(0,0,0,1)]
              hover:shadow-[5px_5px_0px_rgba(0,0,0,1)]
              hover:scale-105
              transition-all
            "
          >
            Intentar nuevamente
          </button>
          <button
            onClick={handleVolverInicio}
            className="
              px-6 py-3
              bg-white
              text-dark
              font-bold
              rounded-lg
              border-2 border-black
              shadow-[3px_3px_0px_rgba(0,0,0,1)]
              hover:shadow-[5px_5px_0px_rgba(0,0,0,1)]
              hover:scale-105
              transition-all
            "
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
