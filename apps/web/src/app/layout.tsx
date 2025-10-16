import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/providers/QueryProvider';

// Nunito: Fuente oficial de Mateatletas Club
const nunito = Nunito({
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-nunito',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mateatletas - Platform for Athletes',
  description:
    'Connect, track, and grow with Mateatletas - the ultimate platform for athletes and coaches',
  keywords: ['athletes', 'sports', 'training', 'coaching', 'fitness'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
