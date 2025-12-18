'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere } from '@react-three/drei';
import type { Mesh } from 'three';
import type { EstadoBloque, SimuladorConfig } from '@/data/roblox/types';

interface SimuladorRoblox3DProps {
  estado: EstadoBloque;
  config: SimuladorConfig;
  mostrarJugador?: boolean;
  onSimulacion?: (estado: EstadoBloque) => void;
}

/**
 * Convierte nombres de colores de Roblox a HEX
 */
function robloxColorToHex(colorName: string): string {
  const colores: Record<string, string> = {
    'Bright red': '#FF0000',
    'Bright blue': '#0000FF',
    'Bright green': '#00FF00',
    'Bright yellow': '#FFFF00',
    'Deep orange': '#FF6600',
    'Really black': '#000000',
    White: '#FFFFFF',
    'Medium stone grey': '#A0A0A0',
    'Lime green': '#00FF00',
    'New Yeller': '#FFFF00',
    'Really red': '#FF0000',
  };

  return colores[colorName] || '#808080'; // Gris por defecto
}

/**
 * Componente del Bloque 3D animado
 */
function BloqueAnimado({ estado }: { estado: EstadoBloque }) {
  const meshRef = useRef<Mesh>(null);
  const [rotation, setRotation] = useState(0);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotación suave
      setRotation((r) => r + delta * 0.5);
      meshRef.current.rotation.y = rotation;
    }
  });

  const color = robloxColorToHex(estado.color);

  return (
    <Box ref={meshRef} args={[estado.size.x, estado.size.y, estado.size.z]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color={color}
        transparent={true}
        opacity={1 - estado.transparency}
        metalness={estado.material === 'Metal' ? 0.8 : 0.1}
        roughness={estado.material === 'Metal' ? 0.2 : 0.7}
        emissive={estado.material === 'Neon' ? color : '#000000'}
        emissiveIntensity={estado.material === 'Neon' ? 0.5 : 0}
      />
    </Box>
  );
}

/**
 * Componente del Jugador (esfera simple)
 */
function Jugador({ visible }: { visible: boolean }) {
  const meshRef = useRef<Mesh>(null);
  const [position, setPosition] = useState(-5);

  useFrame((state, delta) => {
    if (visible && meshRef.current && position < 3) {
      setPosition((p) => p + delta * 2);
      meshRef.current.position.x = position;
    }
  });

  if (!visible) return null;

  return (
    <Sphere args={[0.5, 16, 16]} position={[position, 0, 0]}>
      <meshStandardMaterial color="#3B82F6" />
    </Sphere>
  );
}

/**
 * Simulador 3D de Roblox con Three.js
 */
export default function SimuladorRoblox3D({
  estado,
  config,
  mostrarJugador = false,
  onSimulacion,
}: SimuladorRoblox3DProps) {
  const [jugadorActivo, setJugadorActivo] = useState(false);

  useEffect(() => {
    if (mostrarJugador) {
      // Pequeño delay para que se vea la animación
      const timer = setTimeout(() => setJugadorActivo(true), 500);
      return () => clearTimeout(timer);
    } else {
      setJugadorActivo(false);
    }
  }, [mostrarJugador]);

  return (
    <div className="w-full h-full min-h-[400px] bg-slate-950 rounded-xl overflow-hidden border-2 border-indigo-500/40">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} gl={{ antialias: true }}>
        {/* Iluminación */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Grid de suelo */}
        <gridHelper args={[10, 10, '#444444', '#222222']} />

        {/* El bloque principal */}
        <BloqueAnimado estado={estado} />

        {/* Jugador opcional */}
        {config.mostrarJugador && <Jugador visible={jugadorActivo} />}

        {/* Controles de cámara */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>

      {/* Overlay con info del estado */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
        <div className="text-xs space-y-1">
          <div>
            <span className="text-slate-400">Color:</span>{' '}
            <span className="text-white font-mono">{estado.color}</span>
          </div>
          <div>
            <span className="text-slate-400">Transparency:</span>{' '}
            <span className="text-white font-mono">{estado.transparency}</span>
          </div>
          <div>
            <span className="text-slate-400">Material:</span>{' '}
            <span className="text-white font-mono">{estado.material}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
