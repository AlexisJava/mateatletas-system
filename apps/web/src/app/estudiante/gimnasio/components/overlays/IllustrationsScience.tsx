/**
 * Ilustraciones SVG animadas para cada tema científico
 * Calidad PS5 con animaciones sutiles
 */

'use client';

import { motion } from 'framer-motion';

interface IllustrationProps {
  isActive: boolean; // Si está bloqueada o no
  primaryColor: string;
  accentColor: string;
}

/**
 * 🧪 QUÍMICA - Tubo de ensayo con líquido burbujeante
 */
export function ChemistryIllustration({ isActive, primaryColor, accentColor }: IllustrationProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10"
    >
      {/* Tubo de ensayo */}
      <g filter={isActive ? 'url(#glow-chemistry)' : undefined}>
        {/* Cuerpo del tubo */}
        <path
          d="M 80 40 L 80 140 Q 80 160, 100 160 Q 120 160, 120 140 L 120 40 Z"
          fill="rgba(255, 255, 255, 0.1)"
          stroke={isActive ? primaryColor : '#6b7280'}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Líquido dentro */}
        <motion.path
          d="M 85 100 L 85 140 Q 85 155, 100 155 Q 115 155, 115 140 L 115 100 Z"
          fill={isActive ? primaryColor : '#4b5563'}
          opacity={isActive ? 0.6 : 0.3}
          animate={isActive ? {
            d: [
              "M 85 100 L 85 140 Q 85 155, 100 155 Q 115 155, 115 140 L 115 100 Z",
              "M 85 95 L 85 140 Q 85 155, 100 155 Q 115 155, 115 140 L 115 95 Z",
              "M 85 100 L 85 140 Q 85 155, 100 155 Q 115 155, 115 140 L 115 100 Z",
            ]
          } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Burbujas */}
        {isActive && [1, 2, 3, 4, 5].map((i) => (
          <motion.circle
            key={i}
            cx={90 + i * 5}
            cy={140}
            r="3"
            fill={accentColor}
            opacity={0.6}
            initial={{ cy: 140, opacity: 0 }}
            animate={{
              cy: [140, 100, 80],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut'
            }}
          />
        ))}

        {/* Borde superior del tubo */}
        <rect
          x="75"
          y="35"
          width="50"
          height="10"
          rx="2"
          fill="rgba(255, 255, 255, 0.15)"
          stroke={isActive ? primaryColor : '#6b7280'}
          strokeWidth="2"
        />
      </g>

      {/* Glow effect */}
      {isActive && (
        <defs>
          <filter id="glow-chemistry" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      )}
    </svg>
  );
}

/**
 * 🔭 ASTRONOMÍA - Telescopio con estrellas orbitando
 */
export function AstronomyIllustration({ isActive, primaryColor, accentColor }: IllustrationProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10"
    >
      <g filter={isActive ? 'url(#glow-astronomy)' : undefined}>
        {/* Telescopio */}
        <path
          d="M 60 120 L 140 60 L 145 65 L 65 125 Z"
          fill="rgba(255, 255, 255, 0.1)"
          stroke={isActive ? primaryColor : '#6b7280'}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Lente */}
        <circle
          cx="142"
          cy="62"
          r="8"
          fill={isActive ? accentColor : '#4b5563'}
          opacity={isActive ? 0.6 : 0.3}
        />

        {/* Trípode */}
        <line x1="62" y1="122" x2="50" y2="150" stroke={isActive ? primaryColor : '#6b7280'} strokeWidth="3" strokeLinecap="round" />
        <line x1="62" y1="122" x2="85" y2="145" stroke={isActive ? primaryColor : '#6b7280'} strokeWidth="3" strokeLinecap="round" />

        {/* Estrellas orbitando */}
        {isActive && (
          <>
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '150px 50px' }}
            >
              <circle cx="150" cy="30" r="3" fill={accentColor} opacity={0.8} />
              <circle cx="170" cy="50" r="2" fill={accentColor} opacity={0.6} />
            </motion.g>

            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '150px 50px' }}
            >
              <circle cx="160" cy="70" r="2.5" fill={accentColor} opacity={0.7} />
              <circle cx="140" cy="40" r="2" fill={accentColor} opacity={0.5} />
            </motion.g>

            {/* Destellos */}
            {[150, 170, 160, 140].map((cx, i) => (
              <motion.path
                key={i}
                d={`M ${cx - 4} ${30 + i * 10} L ${cx + 4} ${30 + i * 10} M ${cx} ${30 + i * 10 - 4} L ${cx} ${30 + i * 10 + 4}`}
                stroke={accentColor}
                strokeWidth="1"
                opacity={0}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
          </>
        )}
      </g>

      {isActive && (
        <defs>
          <filter id="glow-astronomy" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      )}
    </svg>
  );
}

/**
 * 🎢 FÍSICA - Montaña rusa con bola en movimiento
 */
export function PhysicsIllustration({ isActive, primaryColor, accentColor }: IllustrationProps) {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10"
    >
      <g filter={isActive ? 'url(#glow-physics)' : undefined}>
        {/* Montaña rusa (curva de Bezier) */}
        <path
          d="M 40 140 Q 70 60, 100 100 T 160 80"
          stroke={isActive ? primaryColor : '#6b7280'}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Soportes */}
        <line x1="70" y1="60" x2="70" y2="150" stroke={isActive ? primaryColor : '#6b7280'} strokeWidth="3" opacity={0.5} strokeLinecap="round" />
        <line x1="130" y1="90" x2="130" y2="150" stroke={isActive ? primaryColor : '#6b7280'} strokeWidth="3" opacity={0.5} strokeLinecap="round" />

        {/* Bola en movimiento */}
        {isActive && (
          <>
            <motion.circle
              cx={0}
              cy={0}
              r="8"
              fill={accentColor}
              opacity={0.9}
              animate={{
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                offsetPath: 'path("M 40 140 Q 70 60, 100 100 T 160 80")',
              }}
            />

            {/* Trail de la bola */}
            <motion.circle
              cx={0}
              cy={0}
              r="4"
              fill={accentColor}
              opacity={0.4}
              animate={{
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.1
              }}
              style={{
                offsetPath: 'path("M 40 140 Q 70 60, 100 100 T 160 80")',
              }}
            />
          </>
        )}

        {/* Vectores de velocidad */}
        {isActive && (
          <motion.g
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <path d="M 70 60 L 90 50" stroke={accentColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
            <path d="M 100 100 L 110 120" stroke={accentColor} strokeWidth="2" markerEnd="url(#arrowhead)" />
          </motion.g>
        )}
      </g>

      {isActive && (
        <defs>
          <filter id="glow-physics" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={accentColor} />
          </marker>
        </defs>
      )}
    </svg>
  );
}

/**
 * 💻 INFORMÁTICA - Terminal con código scrolleando
 */
export function InformaticsIllustration({ isActive, primaryColor, accentColor }: IllustrationProps) {
  const codeLines = [
    'function solve() {',
    '  const result = [];',
    '  for (let i = 0;',
    '    result.push(i);',
    '  }',
    '  return result;',
    '}',
  ];

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10"
    >
      <g filter={isActive ? 'url(#glow-informatics)' : undefined}>
        {/* Ventana de terminal */}
        <rect
          x="40"
          y="50"
          width="120"
          height="100"
          rx="8"
          fill="rgba(0, 0, 0, 0.6)"
          stroke={isActive ? primaryColor : '#6b7280'}
          strokeWidth="2"
        />

        {/* Barra superior con botones */}
        <rect
          x="40"
          y="50"
          width="120"
          height="20"
          rx="8"
          fill="rgba(255, 255, 255, 0.1)"
        />
        <circle cx="52" cy="60" r="3" fill="#ff5f57" />
        <circle cx="63" cy="60" r="3" fill="#ffbd2e" />
        <circle cx="74" cy="60" r="3" fill="#28ca42" />

        {/* Código scrolleando */}
        {isActive && (
          <g>
            {codeLines.map((line, i) => (
              <motion.text
                key={i}
                x="50"
                y={0}
                fontSize="8"
                fill={accentColor}
                fontFamily="monospace"
                opacity={0.8}
                animate={{
                  y: [80 + i * 12, 80 + i * 12, -20],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'linear'
                }}
              >
                {line}
              </motion.text>
            ))}
          </g>
        )}

        {/* Cursor parpadeante */}
        {isActive && (
          <motion.rect
            x="50"
            y="135"
            width="8"
            height="10"
            fill={accentColor}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Símbolos flotantes alrededor */}
        {isActive && (
          <>
            <motion.text
              x="30"
              y="100"
              fontSize="16"
              fill={accentColor}
              opacity={0.4}
              animate={{ x: [25, 30, 25], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {'</>'}
            </motion.text>
            <motion.text
              x="165"
              y="120"
              fontSize="16"
              fill={accentColor}
              opacity={0.4}
              animate={{ x: [165, 170, 165], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              {'{}'}
            </motion.text>
          </>
        )}
      </g>

      {isActive && (
        <defs>
          <filter id="glow-informatics" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      )}
    </svg>
  );
}
