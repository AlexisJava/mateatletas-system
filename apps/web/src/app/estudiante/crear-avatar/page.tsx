'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarCreator, AvatarCreatorConfig, AvatarExportedEvent } from '@readyplayerme/react-avatar-creator'
import { Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { BrawlBackground } from '../gimnasio/components/BrawlBackground'
import { LandscapeOnlyGuard } from '../gimnasio/components/LandscapeOnlyGuard'
import { RPM_CONFIG } from '@/lib/ready-player-me.config'

type Paso = 'bienvenida' | 'creando' | 'preview'

export default function CrearAvatarPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<Paso>('bienvenida')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [timeoutWarning, setTimeoutWarning] = useState(false)

  const config: AvatarCreatorConfig = {
    clearCache: true,
    bodyType: 'fullbody',
    quickStart: false,
    language: 'es',
  }

  // Log de configuración
  useEffect(() => {
    console.log('🔧 RPM Subdomain:', RPM_CONFIG.subdomain)
    console.log('🔧 RPM App ID:', RPM_CONFIG.appId)
  }, [])

  // Timeout para detectar si el editor no carga
  useEffect(() => {
    if (paso === 'creando') {
      console.log('⏱️ [CrearAvatar] Iniciando timer de 15s...')
      const timer = setTimeout(() => {
        console.warn('⚠️ [CrearAvatar] Timeout - Editor no cargó en 15s')
        setTimeoutWarning(true)
      }, 15000)

      return () => {
        console.log('🧹 [CrearAvatar] Limpiando timer')
        clearTimeout(timer)
      }
    }
  }, [paso])

  const handleAvatarExported = (event: AvatarExportedEvent) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎨 [CREAR-AVATAR] Avatar exportado de Ready Player Me')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 Event completo:', event)
    console.log('📦 Event.data:', event.data)
    console.log('🔗 Avatar URL:', event.data.url)
    console.log('📏 Longitud URL:', event.data.url?.length)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const url = event.data.url
    setAvatarUrl(url)
    setPaso('preview')
  }

  const handleGuardar = async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💾 [CREAR-AVATAR] Guardando avatar')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔗 Avatar URL a guardar:', avatarUrl)

    setGuardando(true)
    setError('')

    try {
      console.log('📤 Enviando POST /api/estudiante/avatar...')
      const response = await fetch('/api/estudiante/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: avatarUrl })
      })

      console.log('📥 Response status:', response.status)
      console.log('📥 Response ok?', response.ok)

      if (!response.ok) {
        const data = await response.json()
        console.error('❌ Error en respuesta:', data)
        throw new Error(data.error || 'Error al guardar')
      }

      const data = await response.json()
      console.log('✅ Avatar guardado exitosamente:', data)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      // Redirigir al gimnasio
      setTimeout(() => {
        console.log('🔄 Redirigiendo a /estudiante/gimnasio')
        router.push('/estudiante/gimnasio')
      }, 1000)

    } catch (err: any) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ [CREAR-AVATAR] ERROR:', err)
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      setError(err.message || 'Error al guardar avatar')
      setGuardando(false)
    }
  }

  const handleSaltarPaso = () => {
    console.log('⏭️ [CrearAvatar] Saltando paso de avatar')
    router.push('/estudiante/gimnasio')
  }

  return (
    <LandscapeOnlyGuard>
      <BrawlBackground>
        <AnimatePresence mode="wait">

        {/* BIENVENIDA */}
        {paso === 'bienvenida' && (
          <motion.div
            key="bienvenida"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="text-center max-w-3xl w-full">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-9xl md:text-[12rem] mb-8"
              >
                🧠
              </motion.div>

              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 uppercase leading-tight px-4"
                style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.4)', fontFamily: '"Lilita One", cursive' }}
              >
                ¡Bienvenido a<br/>Mateatletas!
              </h1>

              <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-bold mb-3 px-4">
                Antes de empezar, necesitás crear tu
              </p>
              <p className="text-3xl sm:text-4xl md:text-5xl text-yellow-300 font-black mb-12 px-4">
                ATLETA MENTAL 3D
              </p>

              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPaso('creando')}
                className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white px-8 sm:px-12 py-5 sm:py-6 rounded-3xl border-2 border-black shadow-[0_8px_0_rgba(0,0,0,0.3),0_12px_30px_rgba(0,0,0,0.2)] font-black text-2xl sm:text-3xl uppercase inline-flex items-center gap-3 sm:gap-4 mx-4"
                style={{ fontFamily: '"Lilita One", cursive' }}
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="whitespace-nowrap">¡Crear mi atleta!</span>
                <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* CREATOR */}
        {paso === 'creando' && (
          <motion.div
            key="creando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gradient-to-br from-blue-500 to-purple-600"
          >
            {/* Header de Mateatletas */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-black/40 backdrop-blur-md border-b-2 border-white/20 flex items-center justify-between px-8 z-[101]">

              {/* Logo + Título */}
              <div className="flex items-center gap-4">
                <div className="text-5xl">🧠</div>
                <div>
                  <h1
                    className="text-white text-3xl font-black uppercase leading-tight"
                    style={{
                      textShadow: '3px 3px 0px rgba(0,0,0,0.3)',
                      fontFamily: '"Lilita One", cursive'
                    }}
                  >
                    Creá tu Atleta Mental
                  </h1>
                  <p className="text-white/80 text-sm font-bold">Personalizá tu avatar 3D</p>
                </div>
              </div>

              {/* Botón volver */}
              <button
                onClick={handleSaltarPaso}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors border-2 border-black shadow-[0_4px_0_rgba(0,0,0,0.3)]"
              >
                ← Cancelar
              </button>
            </div>

            {/* Progress bar */}
            <div className="absolute top-24 left-0 right-0 h-2 bg-white/10 z-[101]">
              <motion.div
                initial={{ width: '66%' }}
                animate={{ width: '66%' }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
              />
            </div>

            {/* Iframe CENTRADO (no fullscreen) */}
            <div className="absolute inset-0 flex items-center justify-center pt-28 pb-32 px-8">
              <div className="w-full max-w-5xl h-full bg-black/20 backdrop-blur-sm rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden">
                <AvatarCreator
                  subdomain={RPM_CONFIG.subdomain}
                  config={config}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  onAvatarExported={handleAvatarExported}
                />
              </div>
            </div>

            {/* Footer con instrucciones */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-black/40 backdrop-blur-md border-t-2 border-white/20 flex items-center justify-center z-[101]">
              <div className="text-center">
                <p className="text-white text-2xl font-black mb-2">
                  🎨 Personalizá tu cara, pelo y ropa
                </p>
                <p className="text-yellow-300 text-lg font-bold animate-pulse">
                  Cuando termines, hacé click en &quot;SIGUIENTE&quot; →
                </p>
              </div>
            </div>

            {/* Warning de timeout si aplica */}
            {timeoutWarning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[102]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-yellow-500/20 border-2 border-yellow-500 rounded-2xl p-8 max-w-md mx-4"
                >
                  <AlertCircle className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                  <p className="text-yellow-200 font-bold text-xl mb-2 text-center">El editor está tardando mucho...</p>
                  <p className="text-yellow-100 text-sm mb-6 text-center">Puede ser un problema de conexión o del servicio Ready Player Me</p>

                  <div className="space-y-3">
                    <button
                      onClick={handleSaltarPaso}
                      className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all"
                    >
                      Saltar este paso y continuar
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
                    >
                      Recargar página
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* PREVIEW */}
        {paso === 'preview' && avatarUrl && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="text-center max-w-3xl w-full">
              <motion.h1
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 uppercase px-4"
                style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.4)', fontFamily: '"Lilita One", cursive' }}
              >
                ¡Tu atleta está listo!
              </motion.h1>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-full max-w-md h-80 sm:h-96 md:h-[28rem] mx-auto mb-8 rounded-3xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-orange-500/20 border-4 border-yellow-400 shadow-[0_0_50px_rgba(255,215,0,0.5)] overflow-hidden relative"
              >
                <iframe
                  src={RPM_CONFIG.getViewerUrl(avatarUrl, RPM_CONFIG.animations.dancing)}
                  className="w-full h-full"
                  allow="camera; microphone"
                  style={{ border: 'none' }}
                />
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border-2 border-red-500 rounded-2xl p-4 mb-6 mx-4"
                >
                  <p className="text-red-200 font-bold">{error}</p>
                </motion.div>
              )}

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGuardar}
                disabled={guardando}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white px-8 sm:px-12 py-5 sm:py-6 rounded-3xl border-2 border-black shadow-[0_8px_0_rgba(0,0,0,0.3)] font-black text-2xl sm:text-3xl uppercase inline-flex items-center gap-3 sm:gap-4 disabled:opacity-50 disabled:cursor-not-allowed mx-4"
                style={{ fontFamily: '"Lilita One", cursive' }}
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
                    <span className="whitespace-nowrap">Guardando...</span>
                  </>
                ) : (
                  <>
                    <span className="whitespace-nowrap">¡Comenzar a entrenar!</span>
                    <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
                  </>
                )}
              </motion.button>

              {!guardando && (
                <button
                  onClick={() => { setPaso('creando'); setError('') }}
                  className="mt-6 text-white/70 hover:text-white font-bold underline text-base sm:text-lg px-4"
                >
                  Quiero cambiar mi avatar
                </button>
              )}
            </div>
          </motion.div>
        )}

        </AnimatePresence>
      </BrawlBackground>
    </LandscapeOnlyGuard>
  )
}
