'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarModelProps {
  avatarUrl: string;
  animationUrl?: string;
}

function AvatarModel({ avatarUrl, animationUrl }: AvatarModelProps) {
  const group = useRef<THREE.Group>(null);

  const { scene } = useGLTF(avatarUrl);
  const animationData = useGLTF(animationUrl || avatarUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const animationClips = animationUrl ? animationData.animations : [];

  const { actions, mixer } = useAnimations(animationClips, group);

  useEffect(() => {
    if (!mixer || animationClips.length === 0) return;

    Object.values(actions).forEach((action) => action?.stop());

    const firstAction = actions[animationClips[0]?.name ?? ''];
    if (firstAction) {
      firstAction.reset().fadeIn(0.3).play();
    }

    return () => {
      Object.values(actions).forEach((action) => action?.stop());
    };
  }, [animationUrl, actions, mixer, animationClips]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={2} position={[0, -1.5, 0]} rotation={[0, 0, 0]} />
    </group>
  );
}

interface CompactAvatar3DProps {
  avatarUrl: string;
  animationUrl?: string;
  className?: string;
}

/**
 * Versión compacta y optimizada del avatar 3D para usar en headers y espacios pequeños
 */
export function CompactAvatar3D({ avatarUrl, animationUrl, className = '' }: CompactAvatar3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        gl={{
          antialias: false, // Desactivado para mejor performance
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]} // Limitar DPR para mejor performance
      >
        <PerspectiveCamera makeDefault position={[0, 0.3, 1.8]} fov={45} />

        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 2]} intensity={0.6} />

        <Suspense fallback={null}>
          <AvatarModel avatarUrl={avatarUrl} animationUrl={animationUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
}
