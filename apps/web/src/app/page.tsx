import { redirect } from 'next/navigation';

/**
 * Página raíz - Redirige directamente al login
 * La landing page ha sido eliminada, solo existe el acceso al sistema
 */
export default function HomePage() {
  redirect('/login');
}
