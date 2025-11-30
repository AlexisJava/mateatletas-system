/**
 * Componente de pregunta Fill in the Blank
 * Estética Brawl Stars pura
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { PreguntaFillBlank } from '../../types/actividad.types';

export interface FillBlankQuestionProps {
  pregunta: PreguntaFillBlank;
  onRespuesta: (_esCorrecta: boolean, _respuestaUsuario: string) => void;
  disabled?: boolean;
  mostrarExplicacion?: boolean;
}

export function FillBlankQuestion({
  pregunta,
  onRespuesta,
  disabled = false,
  mostrarExplicacion = false,
}: FillBlankQuestionProps) {
  const [respuesta, setRespuesta] = useState('');
  const [respondida, setRespondida] = useState(false);
  const [esCorrecta, setEsCorrecta] = useState<boolean | null>(null);

  const normalizarRespuesta = (texto: string): string => {
    if (pregunta.caseSensitive) {
      return texto.trim();
    }
    return texto.trim().toLowerCase();
  };

  const validarRespuesta = (respuestaUsuario: string): boolean => {
    const respuestaNormalizada = normalizarRespuesta(respuestaUsuario);

    const respuestasCorrectas = Array.isArray(pregunta.respuestaCorrecta)
      ? pregunta.respuestaCorrecta
      : [pregunta.respuestaCorrecta];

    return respuestasCorrectas.some((correcta) => {
      const correctaNormalizada = normalizarRespuesta(correcta);
      return respuestaNormalizada === correctaNormalizada;
    });
  };

  const handleConfirmar = () => {
    if (!respuesta.trim() || respondida) return;

    const correcta = validarRespuesta(respuesta);
    setEsCorrecta(correcta);
    setRespondida(true);
    onRespuesta(correcta, respuesta);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !respondida) {
      handleConfirmar();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Enunciado */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h3
          className="
            font-[family-name:var(--font-lilita)]
            text-3xl
            font-black
            text-white
            text-center
            leading-tight
          "
          style={{
            textShadow: '0 4px 0 rgba(0,0,0,0.4)',
            WebkitTextStroke: '2px black',
            paintOrder: 'stroke fill',
          }}
        >
          {pregunta.enunciado}
        </h3>
      </motion.div>

      {/* Input de respuesta */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6"
      >
        <div className="relative">
          <input
            type="text"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || respondida}
            placeholder={pregunta.placeholder || 'Escribe tu respuesta aquí...'}
            className={`
              w-full
              bg-gradient-to-br from-purple-600/40 to-indigo-600/40
              border-[5px] ${
                respondida
                  ? esCorrecta
                    ? 'border-green-400'
                    : 'border-red-400'
                  : 'border-white/30'
              }
              rounded-2xl
              px-6 py-5
              text-2xl
              font-black
              text-white
              text-center
              shadow-[0_6px_0_rgba(0,0,0,0.4)]
              focus:outline-none
              focus:border-yellow-400
              disabled:opacity-70
              disabled:cursor-not-allowed
              placeholder:text-white/40
            `}
            style={{
              textShadow: '0 2px 0 rgba(0,0,0,0.4)',
              WebkitTextStroke: '1px black',
            }}
          />

          {/* Icono de resultado */}
          {respondida && esCorrecta !== null && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute -top-4 -right-4"
            >
              <div
                className={`
                  ${esCorrecta ? 'bg-green-400' : 'bg-red-400'}
                  border-4 border-black
                  rounded-full
                  w-16 h-16
                  flex items-center justify-center
                  shadow-[0_6px_0_rgba(0,0,0,0.4)]
                `}
              >
                {esCorrecta ? (
                  <Check className="w-9 h-9 text-black" strokeWidth={4} />
                ) : (
                  <X className="w-9 h-9 text-black" strokeWidth={4} />
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Hint sobre case sensitivity */}
        {!respondida && pregunta.caseSensitive && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold text-yellow-300 text-center mt-3"
            style={{
              textShadow: '0 2px 0 rgba(0,0,0,0.4)',
            }}
          >
            ⚠️ Distingue mayúsculas y minúsculas
          </motion.p>
        )}
      </motion.div>

      {/* Botón Confirmar */}
      {!respondida && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleConfirmar}
          disabled={!respuesta.trim() || disabled}
          className={`
            w-full
            bg-gradient-to-b from-green-500 to-emerald-600
            border-[6px] border-black
            rounded-2xl
            py-5
            font-[family-name:var(--font-lilita)]
            text-2xl
            font-black
            uppercase
            text-white
            shadow-[0_8px_0_rgba(0,0,0,0.4)]
            hover:translate-y-[-4px]
            hover:shadow-[0_12px_0_rgba(0,0,0,0.4)]
            active:translate-y-[2px]
            active:shadow-[0_2px_0_rgba(0,0,0,0.4)]
            disabled:opacity-50
            disabled:cursor-not-allowed
            disabled:transform-none
          `}
          style={{
            transition: 'none',
            textShadow: '0 4px 0 rgba(0,0,0,0.4)',
            WebkitTextStroke: '2px black',
            paintOrder: 'stroke fill',
          }}
        >
          CONFIRMAR RESPUESTA ✓
        </motion.button>
      )}

      {/* Respuesta correcta (si falló) */}
      {respondida && !esCorrecta && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div
            className="
              bg-gradient-to-br from-green-600/40 to-emerald-600/40
              border-4 border-green-400
              rounded-2xl
              p-4
              text-center
            "
          >
            <p
              className="text-sm font-black text-green-300 mb-1"
              style={{
                textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                WebkitTextStroke: '1px black',
              }}
            >
              RESPUESTA CORRECTA:
            </p>
            <p
              className="text-2xl font-black text-white"
              style={{
                textShadow: '0 3px 0 rgba(0,0,0,0.4)',
                WebkitTextStroke: '1px black',
              }}
            >
              {Array.isArray(pregunta.respuestaCorrecta)
                ? pregunta.respuestaCorrecta[0]
                : pregunta.respuestaCorrecta}
            </p>
          </div>
        </motion.div>
      )}

      {/* Explicación */}
      <AnimatePresence>
        {(respondida || mostrarExplicacion) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div
              className="
                bg-gradient-to-br from-cyan-600/40 to-blue-600/40
                border-4 border-cyan-400
                rounded-2xl
                p-6
              "
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">💡</span>
                <div>
                  <h4
                    className="text-lg font-black text-cyan-300 mb-2"
                    style={{
                      textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                      WebkitTextStroke: '1px black',
                    }}
                  >
                    EXPLICACIÓN
                  </h4>
                  <p
                    className="text-white text-base font-bold"
                    style={{
                      textShadow: '0 2px 0 rgba(0,0,0,0.3)',
                    }}
                  >
                    {pregunta.explicacion}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
