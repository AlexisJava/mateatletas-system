import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio | Mateatletas',
  description: 'Editor visual de contenido educativo',
};

export default function StudioEditorLayout({ children }: { children: React.ReactNode }) {
  // Fullscreen layout without app header/sidebar
  return <>{children}</>;
}
