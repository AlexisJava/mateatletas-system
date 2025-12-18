'use client';

import { motion } from 'framer-motion';

export default function JupiterLayers() {
  const layers = [
    {
      name: 'Atmósfera de Gas',
      color: 'from-orange-300 via-amber-400 to-yellow-300',
      depth: '0-1,000 km',
      pressure: '1 bar',
      temp: '-110°C',
      radius: 95,
    },
    {
      name: 'Hidrógeno Molecular',
      color: 'from-orange-400 via-red-400 to-orange-500',
      depth: '1,000-20,000 km',
      pressure: '100 bar',
      temp: '1,727°C',
      radius: 80,
    },
    {
      name: 'Hidrógeno Líquido',
      color: 'from-red-500 via-rose-600 to-red-700',
      depth: '20,000-55,000 km',
      pressure: '2M bar',
      temp: '6,000°C',
      radius: 60,
    },
    {
      name: 'Hidrógeno Metálico',
      color: 'from-purple-700 via-violet-800 to-indigo-900',
      depth: '55,000-65,000 km',
      pressure: '40M bar',
      temp: '20,000°C',
      radius: 35,
    },
    {
      name: 'Núcleo Rocoso',
      color: 'from-slate-800 via-gray-900 to-black',
      depth: '65,000-71,492 km',
      pressure: '100M bar',
      temp: '35,000°C',
      radius: 18,
    },
  ];

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-black via-slate-900 to-black overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Jupiter cross-section */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {layers.map((layer, index) => (
          <motion.div
            key={layer.name}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.3, duration: 0.8 }}
          >
            {/* Layer circle */}
            <motion.div
              className={`rounded-full bg-gradient-to-br ${layer.color} shadow-2xl`}
              style={{
                width: `${layer.radius * 4}px`,
                height: `${layer.radius * 4}px`,
              }}
              animate={{
                boxShadow: [
                  `0 0 ${layer.radius / 2}px rgba(255, 255, 255, 0.3)`,
                  `0 0 ${layer.radius}px rgba(255, 255, 255, 0.5)`,
                  `0 0 ${layer.radius / 2}px rgba(255, 255, 255, 0.3)`,
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />

            {/* Layer label */}
            <motion.div
              className="absolute left-full top-1/2 -translate-y-1/2 ml-8 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20"
              style={{
                width: '220px',
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.3 + 0.5 }}
            >
              <h3 className="text-white font-bold text-sm mb-1">{layer.name}</h3>
              <p className="text-white text-xs">Profundidad: {layer.depth}</p>
              <p className="text-white text-xs">Presión: {layer.pressure}</p>
              <p className="text-white text-xs">Temp: {layer.temp}</p>
            </motion.div>

            {/* Connecting line */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-y-1/2 h-0.5 bg-white/30"
              style={{
                width: '30px',
                marginLeft: `${layer.radius * 2}px`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.3 + 0.4 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Title */}
      <motion.div
        className="absolute top-8 left-0 right-0 text-white text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
          Viaje al Centro de Júpiter
        </h2>
        <p className="text-lg text-white opacity-80">Desde la atmósfera hasta el núcleo extremo</p>
      </motion.div>

      {/* Pressure indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <p className="text-white text-center">
          <span className="text-2xl font-bold text-white">100 Millones</span>
          <br />
          <span className="text-sm text-white">de atmósferas en el núcleo</span>
        </p>
      </motion.div>
    </div>
  );
}
