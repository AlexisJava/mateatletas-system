'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Rocket } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 group"
          aria-label="Volver arriba"
        >
          {/* Main Button */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24] to-[#f97316] rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />

            {/* Button Container */}
            <div className="relative w-16 h-16 bg-gradient-to-r from-[#fbbf24] to-[#f97316] rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
              {/* Icon Container with Animation */}
              <motion.div
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Rocket className="w-8 h-8 text-black" />
              </motion.div>
            </div>
          </div>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg whitespace-nowrap pointer-events-none"
          >
            <span className="text-sm font-bold text-white">Volver arriba</span>
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
