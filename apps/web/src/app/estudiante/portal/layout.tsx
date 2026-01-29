import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal Estudiante | Mateatletas',
  description: 'Tu aventura de aprendizaje comienza aquí',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <>{children}</>;
}
