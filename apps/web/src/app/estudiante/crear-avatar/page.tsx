'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarCreator, AvatarCreatorConfig, AvatarExportedEvent } from '@readyplayerme/react-avatar-creator'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { BrawlBackground } from '../gimnasio/components/BrawlBackground'

type Paso = 'bienvenida' | 'creando' | 'preview'

export default function CrearAvatarPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<Paso>('bienvenida')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const config: AvatarCreatorConfig = {
    clearCache: true,
    bodyType: 'fullbody',
    quickStart: false,
    language: 'es',
  }

  const handleAvatarExported = (event: AvatarExportedEvent) => {
    const url = event.data.url
    console.log('✅ Avatar creado:', url)
    setAvatarUrl(url)
    setPaso('preview')
  }

  const handleGuardar = async () => {
    setGuardando(true)
    setError('')

    try {
      const response = await fetch('/api/estudiante/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: avatarUrl })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar')
      }

      console.log('✅ Avatar guardado en BD')
      setTimeout(() => router.push('/estudiante/gimnasio'), 1000)

    } catch (err: any) {
      console.error('❌ Error:', err)
      setError(err.message || 'Error al guardar avatar')
      setGuardando(false)
    }
  }

  return (
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
            className="fixed inset-0 z-50 bg-black"
          >
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
                <p className="text-white text-xl font-bold">Cargando editor 3D...</p>
              </div>
            </div>

            <AvatarCreator
              subdomain="demo"
              config={config}
              style={{ width: '100%', height: '100%', border: 'none' }}
              onAvatarExported={handleAvatarExported}
            />
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
                  src={`${avatarUrl}?scene=fullbody-portrait-v1&animation=https://models.readyplayer.me/animations/dancing.glb`}
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
  )
}
