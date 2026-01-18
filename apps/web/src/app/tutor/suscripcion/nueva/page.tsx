import { NuevaSuscripcionWizard } from '@/components/tutor/suscripcion/NuevaSuscripcionWizard';

/**
 * Portal Tutor - Crear Nueva Suscripción
 *
 * Wizard para crear una suscripción familiar:
 * 1. Seleccionar tier (plan)
 * 2. Seleccionar hijos y actividades
 * 3. Confirmar y pagar
 */
export default function NuevaSuscripcionPage() {
  return <NuevaSuscripcionWizard />;
}
