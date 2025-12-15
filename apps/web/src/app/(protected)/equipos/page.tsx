import { redirect } from 'next/navigation';

/**
 * Página de redirección de /equipos a /casas
 *
 * NOTA: La ruta /equipos ha sido renombrada a /casas.
 * Este archivo existe para mantener compatibilidad con URLs existentes.
 */
export default function EquiposRedirectPage() {
  redirect('/casas');
}
