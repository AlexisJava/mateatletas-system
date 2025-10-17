'use client';

import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
}

export function FloatingCard({ children, delay = 0 }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
}
