/**
 * JoinClassButton - Botón para unirse a clase en vivo
 *
 * Valida el plan del estudiante antes de permitir acceso.
 * Solo STEAM_SINCRONICO puede acceder a clases en vivo.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Loader2 } from 'lucide-react';
import { livekitApi } from '@/lib/api/livekit.api';
import { estudiantesApi, type MiPlan } from '@/lib/api/estudiantes.api';

// ============================================================================
// TIPOS
// ============================================================================

type EstadoClase = 'EnVivo' | 'Programada' | 'Finalizada' | 'Cancelada';

interface JoinClassButtonProps {
  /** ID de la clase grupo */
  claseGrupoId?: string;
  /** ID de la comisión (alternativa a claseGrupoId) */
  comisionId?: string;
  /** Estado actual de la clase */
  estadoClase: EstadoClase;
  /** Nombre de la clase (para mostrar en errores) */
  nombreClase: string;
  /** Variante visual del botón */
  variant?: 'full' | 'compact';
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function JoinClassButton({
  claseGrupoId,
  comisionId,
  estadoClase,
  nombreClase,
  variant = 'full',
}: JoinClassButtonProps) {
  const router = useRouter();

  // Estado local
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<MiPlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);

  // Cargar información del plan al montar
  useEffect(() => {
    const cargarPlan = async () => {
      try {
        const plan = await estudiantesApi.getMiPlan();
        setPlanInfo(plan);
      } catch {
        setPlanInfo({
          tienePlan: false,
          plan: null,
          accesoClasesVivo: false,
          mensaje: 'Error al verificar plan',
        });
      } finally {
        setIsPlanLoading(false);
      }
    };

    cargarPlan();
  }, []);

  // Determinar estado del botón
  const esEnVivo = estadoClase === 'EnVivo';
  const planPermite = planInfo?.accesoClasesVivo ?? false;
  const puedeUnirse = esEnVivo && planPermite && !isLoading && !isPlanLoading;

  // Texto según estado de clase
  const getTextoEstado = (): string => {
    if (isPlanLoading) return 'Verificando...';
    if (!planInfo?.tienePlan) return 'Sin suscripción';
    if (!planPermite) return 'Plan no permite';

    switch (estadoClase) {
      case 'EnVivo':
        return isLoading ? 'Conectando...' : 'Unirse';
      case 'Programada':
        return 'Próximamente';
      case 'Finalizada':
        return 'Finalizada';
      case 'Cancelada':
        return 'Cancelada';
    }
  };

  // Manejar click
  const handleClick = async () => {
    if (!puedeUnirse) return;

    setIsLoading(true);
    setError(null);

    try {
      // Obtener token de LiveKit
      const tokenData = await livekitApi.getTokenEstudiante(
        claseGrupoId ? { claseGrupoId } : { comisionId },
      );

      // Codificar parámetros para la URL
      const params = new URLSearchParams({
        token: tokenData.token,
        wsUrl: tokenData.wsUrl,
        roomName: tokenData.roomName,
        nombreClase,
      });

      // Navegar a la página de clase en vivo
      router.push(`/estudiante/clase-en-vivo?${params.toString()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';

      // Determinar mensaje de error para el usuario
      if (errorMessage.toLowerCase().includes('no estás inscrito')) {
        setError('No estás inscrito en esta clase');
      } else {
        setError('Error al conectar. Intenta de nuevo.');
      }

      setIsLoading(false);
    }
  };

  // Renderizar mensaje de upgrade si el plan no permite
  const renderUpgradeMessage = () => {
    if (isPlanLoading) return null;

    if (!planInfo?.tienePlan) {
      return <p className="text-xs text-muted-foreground mt-1">Sin suscripción activa</p>;
    }

    if (!planPermite && esEnVivo) {
      return (
        <p className="text-xs text-amber-600 mt-1">Actualiza a STEAM Sincrónico para acceder</p>
      );
    }

    return null;
  };

  // Variante compact: solo icono
  if (variant === 'compact') {
    return (
      <div className="relative inline-flex flex-col items-center">
        <button
          disabled={!puedeUnirse}
          onClick={handleClick}
          aria-label={nombreClase}
          className={`p-2 rounded-lg font-semibold transition-colors ${
            puedeUnirse
              ? 'bg-[var(--house-primary)] hover:bg-[var(--house-secondary)] text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
        </button>
        {esEnVivo && planPermite && (
          <span
            data-testid="live-indicator"
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse"
          />
        )}
      </div>
    );
  }

  // Variante full: botón con texto
  return (
    <div className="flex flex-col">
      <div className="relative inline-flex items-center gap-2">
        <button
          disabled={!puedeUnirse}
          onClick={handleClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            puedeUnirse
              ? 'bg-[var(--house-primary)] hover:bg-[var(--house-secondary)] text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
          {getTextoEstado()}
        </button>

        {esEnVivo && planPermite && (
          <span
            data-testid="live-indicator"
            className="h-3 w-3 rounded-full bg-red-500 animate-pulse"
          />
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {renderUpgradeMessage()}
    </div>
  );
}
