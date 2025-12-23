import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Editor - Mateatletas',
  description: 'Editor visual de contenido educativo con grilla Bento',
};

export default function StudioEditorLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen overflow-hidden">{children}</div>;
}
