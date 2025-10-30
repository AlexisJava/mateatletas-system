/**
 * Ilustraciones SVG COLORIDAS Y DETALLADAS para cada tema científico
 * Con gradientes, múltiples colores, texturas, efectos visuales
 */

'use client';

import { motion } from 'framer-motion';

interface IllustrationProps {
  isActive: boolean;
  primaryColor: string;
  accentColor: string;
}

/**
 * 🧪 QUÍMICA - Tubo con líquidos de colores vibrantes + reacción química
 */
export function ChemistryIllustration({ isActive }: IllustrationProps) {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10"
    >
      <defs>
        {/* Gradiente líquido verde-cyan */}
        <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.9" />
        </linearGradient>

        {/* Gradiente del tubo (vidrio) */}
        <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.3)" />
        </linearGradient>

        {/* Gradiente burbujas */}
        <radialGradient id="bubble-gradient">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3" />
        </radialGradient>

        {/* Glow filter */}
        <filter id="glow-chem" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <g filter={isActive ? 'url(#glow-chem)' : undefined}>
        {/* Tubo de ensayo con efecto de vidrio */}
        <path
          d="M 85 45 L 85 145 Q 85 165, 110 165 Q 135 165, 135 145 L 135 45 Z"
          fill="url(#glass-gradient)"
          stroke={isActive ? '#34d399' : '#6b7280'}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0.8}
        />

        {/* Líquido colorido dentro con gradiente */}
        <motion.path
          d="M 90 110 L 90 145 Q 90 160, 110 160 Q 130 160, 130 145 L 130 110 Z"
          fill="url(#liquid-gradient)"
          animate={isActive ? {
            d: [
              "M 90 110 L 90 145 Q 90 160, 110 160 Q 130 160, 130 145 L 130 110 Z",
              "M 90 105 L 90 145 Q 90 160, 110 160 Q 130 160, 130 145 L 130 105 Z",
              "M 90 110 L 90 145 Q 90 160, 110 160 Q 130 160, 130 145 L 130 110 Z",
            ]
          } : undefined}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Highlight del vidrio (brillo) */}
        <path
          d="M 92 50 L 92 140 Q 92 155, 110 155"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Burbujas grandes con gradiente */}
        {isActive && [
          { x: 95, delay: 0, size: 5 },
          { x: 105, delay: 0.4, size: 7 },
          { x: 115, delay: 0.8, size: 6 },
          { x: 100, delay: 1.2, size: 4 },
          { x: 120, delay: 1.6, size: 5 },
        ].map((bubble, i) => (
          <motion.circle
            key={i}
            cx={bubble.x}
            cy={150}
            r={bubble.size}
            fill="url(#bubble-gradient)"
            initial={{ cy: 150, opacity: 0, scale: 0.5 }}
            animate={{
              cy: [150, 110, 70],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.8],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: bubble.delay,
              ease: 'easeOut'
            }}
          />
        ))}

        {/* Burbujas pequeñas adicionales */}
        {isActive && [
          { x: 98, delay: 0.2, size: 3 },
          { x: 112, delay: 0.6, size: 3 },
          { x: 108, delay: 1.0, size: 2 },
        ].map((bubble, i) => (
          <motion.circle
            key={`small-${i}`}
            cx={bubble.x}
            cy={150}
            r={bubble.size}
            fill="#22d3ee"
            opacity={0.6}
            initial={{ cy: 150, opacity: 0 }}
            animate={{
              cy: [150, 110, 60],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: bubble.delay,
              ease: 'easeOut'
            }}
          />
        ))}

        {/* Borde superior del tubo (corcho/tapón) */}
        <rect
          x="80"
          y="38"
          width="60"
          height="12"
          rx="3"
          fill="#f59e0b"
          stroke="#ea580c"
          strokeWidth="2"
        />

        {/* Highlight del corcho */}
        <rect
          x="82"
          y="40"
          width="25"
          height="4"
          rx="2"
          fill="rgba(255, 255, 255, 0.4)"
        />

        {/* Vapor/humo saliendo */}
        {isActive && [0, 1, 2].map((i) => (
          <motion.path
            key={`smoke-${i}`}
            d={`M ${105 + i * 5} 35 Q ${100 + i * 7} 25, ${105 + i * 5} 15`}
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity={0}
            animate={{
              opacity: [0, 0.6, 0],
              d: [
                `M ${105 + i * 5} 35 Q ${100 + i * 7} 25, ${105 + i * 5} 15`,
                `M ${105 + i * 5} 35 Q ${110 + i * 7} 25, ${105 + i * 5} 10`,
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'easeOut'
            }}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * 🔭 ASTRONOMÍA - Telescopio + planetas + galaxia
 */
export function AstronomyIllustration({ isActive }: IllustrationProps) {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10"
    >
      <defs>
        <radialGradient id="planet-gradient">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7e22ce" />
        </radialGradient>

        <radialGradient id="moon-gradient">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>

        <linearGradient id="telescope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4b5563" />
          <stop offset="50%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>

        <filter id="glow-astro" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <g filter={isActive ? 'url(#glow-astro)' : undefined}>
        {/* Galaxia de fondo */}
        {isActive && (
          <motion.ellipse
            cx="160"
            cy="60"
            rx="40"
            ry="25"
            fill="none"
            stroke="#c084fc"
            strokeWidth="1.5"
            opacity={0.3}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '160px 60px' }}
          />
        )}

        {/* Telescopio con gradiente metálico */}
        <path
          d="M 65 130 L 155 55 L 162 62 L 72 137 Z"
          fill="url(#telescope-gradient)"
          stroke={isActive ? '#9ca3af' : '#6b7280'}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Detalles del telescopio (anillos) */}
        <circle cx="108" cy="93" r="5" fill="#374151" stroke="#4b5563" strokeWidth="2" />
        <circle cx="135" cy="73" r="4" fill="#374151" stroke="#4b5563" strokeWidth="2" />

        {/* Lente del telescopio (azul brillante) */}
        <circle
          cx="158"
          cy="58"
          r="10"
          fill="#3b82f6"
          opacity={isActive ? 0.8 : 0.4}
        />
        <circle
          cx="158"
          cy="58"
          r="7"
          fill="#60a5fa"
          opacity={isActive ? 0.6 : 0.3}
        />

        {/* Trípode con gradiente */}
        <line x1="68" y1="133" x2="55" y2="165" stroke="url(#telescope-gradient)" strokeWidth="4" strokeLinecap="round" />
        <line x1="68" y1="133" x2="95" y2="158" stroke="url(#telescope-gradient)" strokeWidth="4" strokeLinecap="round" />

        {/* Planeta grande con anillo */}
        {isActive && (
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '170px 50px' }}
          >
            <circle cx="170" cy="35" r="12" fill="url(#planet-gradient)" />
            <ellipse
              cx="170"
              cy="35"
              rx="18"
              ry="6"
              fill="none"
              stroke="#c084fc"
              strokeWidth="2"
              opacity={0.6}
            />
          </motion.g>
        )}

        {/* Luna/satélite */}
        {isActive && (
          <motion.circle
            cx={0}
            cy={0}
            r="6"
            fill="url(#moon-gradient)"
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              offsetPath: 'path("M 170 35 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0")',
              transformOrigin: '170px 35px'
            }}
          />
        )}

        {/* Estrellas pequeñas brillantes */}
        {isActive && [
          { cx: 145, cy: 30, delay: 0, color: '#fbbf24' },
          { cx: 185, cy: 45, delay: 0.5, color: '#60a5fa' },
          { cx: 160, cy: 70, delay: 1, color: '#c084fc' },
          { cx: 195, cy: 60, delay: 1.5, color: '#34d399' },
        ].map((star, i) => (
          <g key={i}>
            <motion.circle
              cx={star.cx}
              cy={star.cy}
              r="2.5"
              fill={star.color}
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: star.delay }}
            />
            {/* Cruz de destello */}
            <motion.path
              d={`M ${star.cx - 5} ${star.cy} L ${star.cx + 5} ${star.cy} M ${star.cx} ${star.cy - 5} L ${star.cx} ${star.cy + 5}`}
              stroke={star.color}
              strokeWidth="1"
              opacity={0}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: star.delay }}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

/**
 * 🎢 FÍSICA - Montaña rusa colorida con energía cinética
 */
export function PhysicsIllustration({ isActive }: IllustrationProps) {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10"
    >
      <defs>
        <linearGradient id="track-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        <radialGradient id="ball-gradient">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>

        <filter id="glow-physics" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <g filter={isActive ? 'url(#glow-physics)' : undefined}>
        {/* Riel de la montaña rusa (más grueso y colorido) */}
        <path
          d="M 40 150 Q 75 65, 110 110 T 180 85"
          stroke="url(#track-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Riel inferior (efecto 3D) */}
        <path
          d="M 40 155 Q 75 70, 110 115 T 180 90"
          stroke="#c2410c"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity={0.6}
        />

        {/* Soportes con colores */}
        <line x1="75" y1="65" x2="75" y2="160" stroke="#fb923c" strokeWidth="4" opacity={0.7} strokeLinecap="round" />
        <line x1="140" y1="95" x2="140" y2="160" stroke="#fb923c" strokeWidth="4" opacity={0.7} strokeLinecap="round" />

        {/* Base triangular de soporte */}
        <path d="M 75 160 L 65 170 L 85 170 Z" fill="#ea580c" opacity={0.7} />
        <path d="M 140 160 L 130 170 L 150 170 Z" fill="#ea580c" opacity={0.7} />

        {/* Bola con gradiente y sombra */}
        {isActive && (
          <>
            {/* Sombra de la bola */}
            <motion.ellipse
              cx={0}
              cy={0}
              rx={10}
              ry={4}
              fill="rgba(0, 0, 0, 0.3)"
              animate={{
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                offsetPath: 'path("M 40 170 Q 75 170, 110 170 T 180 170")',
              }}
            />

            {/* Bola principal */}
            <motion.circle
              cx={0}
              cy={0}
              r={9}
              fill="url(#ball-gradient)"
              animate={{
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                offsetPath: 'path("M 40 150 Q 75 65, 110 110 T 180 85")',
              }}
            />

            {/* Highlight de la bola */}
            <motion.circle
              cx={0}
              cy={0}
              r={4}
              fill="rgba(255, 255, 255, 0.6)"
              animate={{
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                offsetPath: 'path("M 42 148 Q 77 63, 112 108 T 182 83")',
              }}
            />

            {/* Trail de movimiento */}
            {[0.1, 0.2, 0.3].map((delay, i) => (
              <motion.circle
                key={i}
                cx={0}
                cy={0}
                r={5 - i * 1.5}
                fill="#fbbf24"
                opacity={0.5 - i * 0.15}
                animate={{
                  offsetDistance: ['0%', '100%'],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: delay
                }}
                style={{
                  offsetPath: 'path("M 40 150 Q 75 65, 110 110 T 180 85")',
                }}
              />
            ))}
          </>
        )}

        {/* Vectores de velocidad (flechas naranjas) */}
        {isActive && (
          <motion.g
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <defs>
              <marker id="arrowhead-orange" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#fb923c" />
              </marker>
            </defs>
            <path d="M 75 65 L 95 55" stroke="#fb923c" strokeWidth="3" markerEnd="url(#arrowhead-orange)" />
            <path d="M 110 110 L 120 130" stroke="#fb923c" strokeWidth="3" markerEnd="url(#arrowhead-orange)" />
            <path d="M 140 95 L 155 90" stroke="#fb923c" strokeWidth="3" markerEnd="url(#arrowhead-orange)" />
          </motion.g>
        )}
      </g>
    </svg>
  );
}

/**
 * 💻 INFORMÁTICA - Terminal retro con sintaxis coloreada
 */
export function InformaticsIllustration({ isActive }: IllustrationProps) {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10"
    >
      <defs>
        <linearGradient id="terminal-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <filter id="glow-term" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <g filter={isActive ? 'url(#glow-term)' : undefined}>
        {/* Ventana de terminal con gradiente */}
        <rect
          x="45"
          y="55"
          width="130"
          height="110"
          rx="10"
          fill="url(#terminal-bg)"
          stroke={isActive ? '#22d3ee' : '#6b7280'}
          strokeWidth="2.5"
        />

        {/* Barra superior con gradiente */}
        <rect
          x="45"
          y="55"
          width="130"
          height="22"
          rx="10"
          fill="linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)"
        />

        {/* Botones de ventana (rojo, amarillo, verde) */}
        <circle cx="58" cy="66" r="4" fill="#ef4444" />
        <circle cx="71" cy="66" r="4" fill="#fbbf24" />
        <circle cx="84" cy="66" r="4" fill="#22c55e" />

        {/* Título de ventana */}
        <text x="95" y="70" fontSize="7" fill="rgba(255,255,255,0.7)" fontFamily="sans-serif">
          terminal.sh
        </text>

        {/* Código con sintaxis coloreada */}
        {isActive && (
          <g>
            {/* Línea 1: function (morado) + nombre (amarillo) */}
            <motion.text
              x="55"
              y={0}
              fontSize="7"
              fill="#c084fc"
              fontFamily="monospace"
              fontWeight="600"
              animate={{ y: [90, 90, 40] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              function{' '}
              <tspan fill="#fbbf24">calcular</tspan>
              <tspan fill="#22d3ee">() {'{'}</tspan>
            </motion.text>

            {/* Línea 2: const (cyan) + variable (blanco) */}
            <motion.text
              x="60"
              y={0}
              fontSize="7"
              fill="#22d3ee"
              fontFamily="monospace"
              animate={{ y: [100, 100, 50] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 0.3 }}
            >
              const{' '}
              <tspan fill="#ffffff">resultado</tspan>
              <tspan fill="#22d3ee"> = [];</tspan>
            </motion.text>

            {/* Línea 3: for (morado) + loop */}
            <motion.text
              x="60"
              y={0}
              fontSize="7"
              fill="#c084fc"
              fontFamily="monospace"
              animate={{ y: [110, 110, 60] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 0.6 }}
            >
              for{' '}
              <tspan fill="#22d3ee">(</tspan>
              <tspan fill="#22d3ee">let</tspan>
              <tspan fill="#ffffff"> i = </tspan>
              <tspan fill="#f59e0b">0</tspan>
              <tspan fill="#22d3ee">;</tspan>
            </motion.text>

            {/* Línea 4: operación */}
            <motion.text
              x="65"
              y={0}
              fontSize="7"
              fill="#ffffff"
              fontFamily="monospace"
              animate={{ y: [120, 120, 70] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 0.9 }}
            >
              resultado.
              <tspan fill="#fbbf24">push</tspan>
              <tspan fill="#22d3ee">(i);</tspan>
            </motion.text>

            {/* Línea 5: cierre */}
            <motion.text
              x="60"
              y={0}
              fontSize="7"
              fill="#22d3ee"
              fontFamily="monospace"
              animate={{ y: [130, 130, 80] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 1.2 }}
            >
              {'}'}
            </motion.text>

            {/* Línea 6: return */}
            <motion.text
              x="60"
              y={0}
              fontSize="7"
              fill="#c084fc"
              fontFamily="monospace"
              animate={{ y: [140, 140, 90] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 1.5 }}
            >
              return{' '}
              <tspan fill="#ffffff">resultado</tspan>
              <tspan fill="#22d3ee">;</tspan>
            </motion.text>

            {/* Línea 7: cierre final */}
            <motion.text
              x="55"
              y={0}
              fontSize="7"
              fill="#22d3ee"
              fontFamily="monospace"
              fontWeight="600"
              animate={{ y: [150, 150, 100] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: 1.8 }}
            >
              {'}'}
            </motion.text>
          </g>
        )}

        {/* Cursor parpadeante */}
        {isActive && (
          <motion.rect
            x="55"
            y="145"
            width="6"
            height="10"
            fill="#22d3ee"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Símbolos flotantes coloridos */}
        {isActive && (
          <>
            <motion.text
              x="28"
              y="110"
              fontSize="18"
              fill="#c084fc"
              fontWeight="700"
              opacity={0.5}
              animate={{ x: [25, 30, 25], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {'</>'}
            </motion.text>
            <motion.text
              x="178"
              y="130"
              fontSize="18"
              fill="#22d3ee"
              fontWeight="700"
              opacity={0.5}
              animate={{ x: [178, 183, 178], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.7 }}
            >
              {'{}'}
            </motion.text>
            <motion.text
              x="35"
              y="155"
              fontSize="16"
              fill="#fbbf24"
              fontWeight="700"
              opacity={0.4}
              animate={{ y: [155, 150, 155], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
            >
              {'()'}
            </motion.text>
          </>
        )}
      </g>
    </svg>
  );
}
