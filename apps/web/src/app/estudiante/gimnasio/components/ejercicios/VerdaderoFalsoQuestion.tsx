/**
 * Componente de pregunta Verdadero/Falso
 * Estética Brawl Stars pura
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { PreguntaVerdaderoFalso } from '../../types/actividad.types';

export interface VerdaderoFalsoQuestionProps {
  pregunta: PreguntaVerdaderoFalso;
  onRespuesta: (esCorrecta: boolean, respuestaUsuario: boolean) => void;
  disabled?: boolean;
  mostrarExplicacion?: boolean;
}

export function VerdaderoFalsoQuestion({
  pregunta,
  onRespuesta,
  disabled = false,
  mostrarExplicacion = false,
}: VerdaderoFalsoQuestionProps) {
  const [seleccionada, setSeleccionada] = useState<boolean | null>(null);
  const [respondida, setRespondida] = useState(false);

  const handleSeleccion = (valor: boolean) => {
    if (disabled || respondida) return;

    setSeleccionada(valor);
    setRespondida(true);

    const esCorrecta = valor === pregunta.respuestaCorrecta;
    onRespuesta(esCorrecta, valor);
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

      {/* Opciones Verdadero/Falso */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Botón VERDADERO */}
        {[
          { valor: true, texto: 'VERDADERO', emoji: '✓', color: 'green' },
          { valor: false, texto: 'FALSO', emoji: '✗', color: 'red' },
        ].map((opcion) => {
          const estaSeleccionada = seleccionada === opcion.valor;
          const esCorrecta = opcion.valor === pregunta.respuestaCorrecta;
          const mostrarEstado = respondida;

          let colorBorde = 'border-white/30';
          let colorFondo =
            opcion.color === 'green'
              ? 'from-green-600/40 to-emerald-600/40'
              : 'from-red-600/40 to-pink-600/40';
          let icono: React.ReactNode = null;

          if (mostrarEstado) {
            if (esCorrecta) {
              colorBorde = 'border-green-400';
              colorFondo = 'from-green-600/60 to-emerald-600/60';
              icono = (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-4 -right-4"
                >
                  <div className="bg-green-400 border-4 border-black rounded-full w-16 h-16 flex items-center justify-center shadow-[0_6px_0_rgba(0,0,0,0.4)]">
                    <Check className="w-9 h-9 text-black" strokeWidth={4} />
                  </div>
                </motion.div>
              );
            } else if (estaSeleccionada) {
              colorBorde = 'border-red-400';
              colorFondo = 'from-red-600/60 to-pink-600/60';
              icono = (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-4 -right-4"
                >
                  <div className="bg-red-400 border-4 border-black rounded-full w-16 h-16 flex items-center justify-center shadow-[0_6px_0_rgba(0,0,0,0.4)]">
                    <X className="w-9 h-9 text-black" strokeWidth={4} />
                  </div>
                </motion.div>
              );
            } else {
              // No seleccionada y no correcta
              colorFondo =
                opcion.color === 'green'
                  ? 'from-green-600/20 to-emerald-600/20'
                  : 'from-red-600/20 to-pink-600/20';
            }
          }

          return (
            <motion.button
              key={opcion.valor.toString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: opcion.valor ? 0 : 0.1 }}
              whileHover={!disabled && !respondida ? { scale: 1.05, y: -8 } : undefined}
              whileTap={!disabled && !respondida ? { scale: 0.95 } : undefined}
              onClick={() => handleSeleccion(opcion.valor)}
              disabled={disabled || respondida}
              className={`
                relative
                bg-gradient-to-br ${colorFondo}
                border-[6px] ${colorBorde}
                rounded-[28px]
                py-12
                px-6
                flex flex-col items-center justify-center gap-4
                shadow-[0_8px_0_rgba(0,0,0,0.4)]
                ${!disabled && !respondida ? 'hover:shadow-[0_12px_0_rgba(0,0,0,0.4)]' : ''}
                ${!disabled && !respondida ? 'active:shadow-[0_4px_0_rgba(0,0,0,0.4)]' : ''}
                ${!disabled && !respondida ? 'active:translate-y-[2px]' : ''}
              `}
              style={{ transition: 'none' }}
            >
              {/* Emoji Grande */}
              <span className="text-8xl" style={{ textShadow: '0 6px 0 rgba(0,0,0,0.3)' }}>
                {opcion.emoji}
              </span>

              {/* Texto */}
              <span
                className="text-3xl font-black text-white"
                style={{
                  textShadow: '0 4px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '2px black',
                  paintOrder: 'stroke fill',
                }}
              >
                {opcion.texto}
              </span>

              {/* Icono de estado */}
              {icono}
            </motion.button>
          );
        })}
      </div>

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
