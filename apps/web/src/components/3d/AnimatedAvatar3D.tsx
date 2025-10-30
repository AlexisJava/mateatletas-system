'use client'

import { useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

interface AvatarModelProps {
  avatarUrl: string
  animationUrl?: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

function AvatarModel({ avatarUrl, animationUrl, scale = 1, position = [0, -1, 0], rotation = [0, 0, 0] }: AvatarModelProps) {
  const group = useRef<THREE.Group>(null)

  // Cargar modelo del avatar
  const { scene } = useGLTF(avatarUrl)

  // Cargar animación si se proporciona
  const { animations: animationClips } = animationUrl
    ? useGLTF(animationUrl)
    : { animations: [] }

  const { actions, mixer } = useAnimations(animationClips, group)

  // Reproducir animación cuando cambie
  useEffect(() => {
    if (!mixer || animationClips.length === 0) return

    // Detener todas las animaciones anteriores
    Object.values(actions).forEach(action => action?.stop())

    // Reproducir la primera animación del archivo GLB
    const firstAction = actions[animationClips[0].name]
    if (firstAction) {
      firstAction.reset().fadeIn(0.5).play()
    }

    return () => {
      Object.values(actions).forEach(action => action?.stop())
    }
  }, [animationUrl, actions, mixer, animationClips])

  return (
    <group ref={group}>
      <primitive
        object={scene}
        scale={scale}
        position={position}
        rotation={rotation}
      />
    </group>
  )
}

interface AnimatedAvatar3DProps {
  avatarUrl: string
  animationUrl?: string
  width?: number | string
  height?: number | string
  className?: string
  cameraPosition?: [number, number, number]
  cameraFov?: number
  enableControls?: boolean
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export function AnimatedAvatar3D({
  avatarUrl,
  animationUrl,
  width = 300,
  height = 400,
  className = '',
  cameraPosition = [0, 0.5, 2.5],
  cameraFov = 50,
  enableControls = false,
  scale = 1,
  position = [0, -1, 0],
  rotation = [0, 0, 0]
}: AnimatedAvatar3DProps) {

  return (
    <div
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={cameraFov}
        />

        {/* Luces */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 3, -5]} intensity={0.5} />

        {/* Avatar con animación */}
        <Suspense fallback={null}>
          <AvatarModel
            avatarUrl={avatarUrl}
            animationUrl={animationUrl}
            scale={scale}
            position={position}
            rotation={rotation}
          />
        </Suspense>

        {/* Controles opcionales para desarrollo */}
        {enableControls && (
          <OrbitControls
            enableZoom
            enablePan
            enableRotate
            minDistance={1}
            maxDistance={5}
          />
        )}
      </Canvas>
    </div>
  )
}

// Preload para optimización
useGLTF.preload('/path/to/default/avatar.glb')
