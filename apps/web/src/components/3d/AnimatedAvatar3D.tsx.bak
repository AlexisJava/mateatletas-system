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
  const containerRef = useRef<HTMLDivElement>(null)
  const renderCountRef = useRef(0)

  // Log inicial
  useEffect(() => {
    console.group('🎨 AnimatedAvatar3D - Mount')
    console.log('Props recibidas:', {
      width,
      height,
      scale,
      position,
      rotation,
      cameraPosition,
      cameraFov
    })
    console.groupEnd()
  }, [])

  // Monitor de cambios en props width/height
  useEffect(() => {
    renderCountRef.current += 1

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      console.group(`🔄 AnimatedAvatar3D - Props Changed (Render #${renderCountRef.current})`)
      console.log('Container dimensions:', {
        width: rect.width,
        height: rect.height,
        propWidth: width,
        propHeight: height
      })
      console.log('Computed style:', {
        width: containerRef.current.style.width,
        height: containerRef.current.style.height
      })
      console.log('Parent dimensions:', {
        parentWidth: containerRef.current.parentElement?.getBoundingClientRect().width,
        parentHeight: containerRef.current.parentElement?.getBoundingClientRect().height,
      })
      console.groupEnd()
    }
  }, [width, height])

  // Listener de window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        console.group('📐 Window Resize Event')
        console.log('Window size:', {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight
        })
        console.log('Container size after resize:', {
          width: rect.width,
          height: rect.height
        })
        console.log('Props:', {
          propWidth: width,
          propHeight: height
        })
        console.groupEnd()
      }
    }

    window.addEventListener('resize', handleResize)
    console.log('✅ Window resize listener attached')

    return () => {
      window.removeEventListener('resize', handleResize)
      console.log('❌ Window resize listener removed')
    }
  }, [width, height])

  // Observer para detectar cambios de tamaño del contenedor
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: observedWidth, height: observedHeight } = entry.contentRect
        console.group('👁️ ResizeObserver - Container size changed')
        console.log('Observed dimensions:', {
          width: observedWidth,
          height: observedHeight
        })
        console.log('Props:', {
          propWidth: width,
          propHeight: height
        })
        console.log('Mismatch:', {
          widthDiff: observedWidth - (typeof width === 'number' ? width : 0),
          heightDiff: observedHeight - (typeof height === 'number' ? height : 0)
        })
        console.groupEnd()
      }
    })

    resizeObserver.observe(containerRef.current)
    console.log('✅ ResizeObserver attached to container')

    return () => {
      resizeObserver.disconnect()
      console.log('❌ ResizeObserver disconnected')
    }
  }, [width, height])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <Canvas
        shadows
        resize={{ scroll: false, debounce: 0 }}
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

        {/* Sombra GRANDE debajo del avatar - ULTRA VISIBLE */}
        {/* Capa 1 - Centro oscuro */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], -0.99, position[2]]}>
          <planeGeometry args={[1.5, 0.6]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>

        {/* Capa 2 - Difusión media */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], -0.985, position[2]]}>
          <planeGeometry args={[2.0, 0.8]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>

        {/* Capa 3 - Difusión exterior suave */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], -0.98, position[2]]}>
          <planeGeometry args={[2.5, 1.0]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>

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
