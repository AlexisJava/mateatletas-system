import type { Metadata } from 'next';
import { Fredoka, Lilita_One } from 'next/font/google';
import './globals.css';

// Fredoka: Fuente principal redondeada y amigable (estilo Crash Bandicoot)
const fredoka = Fredoka({
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
  subsets: ['latin'],
});

// Lilita One: Fuente para títulos (mantiene el estilo chunky)
const lilitaOne = Lilita_One({
  weight: '400',
  variable: '--font-lilita',
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
      <body
        className={`${fredoka.variable} ${lilitaOne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
