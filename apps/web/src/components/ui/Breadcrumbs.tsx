'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs Component
 * Navegación jerárquica con glassmorphism
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 mb-4">
      {/* Home */}
      <Link
        href="/docente/dashboard"
        className="p-2 rounded-lg hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-colors"
      >
        <Home className="w-4 h-4 text-purple-600 dark:text-purple-300" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2"
          >
            {/* Separador */}
            <ChevronRight className="w-4 h-4 text-purple-400 dark:text-purple-500" />

            {/* Item */}
            {isLast ? (
              <span className="text-sm font-bold text-indigo-900 dark:text-white">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-sm font-semibold text-purple-600 dark:text-purple-300 hover:text-indigo-900 dark:hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                {item.label}
              </span>
            )}
          </motion.div>
        );
      })}
    </nav>
  );
}
