import type { Metadata } from 'next';
import { Nunito, Lilita_One, Orbitron, Rajdhani } from 'next/font/google';
import './globals.css';
import './animations.css';
import './landing.css';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { Toaster } from 'sonner';

// Nunito: Fuente oficial de Mateatletas Club
const nunito = Nunito({
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

// Lilita One: Fuente para dashboard estilo Brawl Stars
const lilitaOne = Lilita_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-lilita',
  display: 'swap',
});

// Orbitron: Fuente futurista para CLUB STEAM
const orbitron = Orbitron({
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
});

// Rajdhani: Fuente alternativa premium
const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  subsets: ['latin'],
  display: 'swap',
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
      <body className={`${nunito.variable} ${lilitaOne.variable} ${orbitron.variable} ${rajdhani.variable} antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
