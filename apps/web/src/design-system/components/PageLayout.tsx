'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useCurrentTheme } from '../themes';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

/**
 * 🎨 PageLayout - Layout universal para páginas con fondo temático
 *
 * Uso:
 * <PageLayout title="Dashboard" subtitle="Bienvenido">
 *   <GradientCard>Contenido</GradientCard>
 * </PageLayout>
 */
export function PageLayout({ children, title, subtitle, action }: PageLayoutProps) {
  const theme = useCurrentTheme();

  return (
    <div className={`min-h-screen ${theme.gradientBg} text-white`}>
      <div className="container mx-auto px-4 py-8">
        {(title || subtitle || action) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-2">
              {title && <h1 className="text-4xl font-bold">{title}</h1>}
              {action && <div>{action}</div>}
            </div>
            {subtitle && <p className="text-white/70 text-lg">{subtitle}</p>}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
