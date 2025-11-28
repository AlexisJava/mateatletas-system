/**
 * Componente de pregunta Multiple Choice
 * Estética Brawl Stars pura
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { PreguntaMultipleChoice } from '../../types/actividad.types';

export interface MultipleChoiceQuestionProps {
  pregunta: PreguntaMultipleChoice;
  onRespuesta: (esCorrecta: boolean, opcionSeleccionada: string) => void;
  disabled?: boolean;
  mostrarExplicacion?: boolean;
}

export function MultipleChoiceQuestion({
  pregunta,
  onRespuesta,
  disabled = false,
  mostrarExplicacion = false,
}: MultipleChoiceQuestionProps) {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [respondida, setRespondida] = useState(false);

  const handleSeleccion = (opcionId: string) => {
    if (disabled || respondida) return;

    setSeleccionada(opcionId);
  };

  const handleConfirmar = () => {
    if (!seleccionada || respondida) return;

    const opcion = pregunta.opciones.find((o) => o.id === seleccionada);
    if (!opcion) return;

    setRespondida(true);
    onRespuesta(opcion.esCorrecta, seleccionada);
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

      {/* Opciones */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {pregunta.opciones.map((opcion, index) => {
          const estaSeleccionada = seleccionada === opcion.id;
          const esCorrecta = opcion.esCorrecta;
          const mostrarEstado = respondida;

          let colorBorde = 'border-white/30';
          let colorFondo = 'from-blue-600/40 to-purple-600/40';
          let icono: React.ReactNode = null;

          if (mostrarEstado) {
            if (esCorrecta) {
              colorBorde = 'border-green-400';
              colorFondo = 'from-green-600/60 to-emerald-600/60';
              icono = (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3"
                >
                  <div className="bg-green-400 border-4 border-black rounded-full w-12 h-12 flex items-center justify-center">
                    <Check className="w-7 h-7 text-black" strokeWidth={4} />
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
                  className="absolute -top-3 -right-3"
                >
                  <div className="bg-red-400 border-4 border-black rounded-full w-12 h-12 flex items-center justify-center">
                    <X className="w-7 h-7 text-black" strokeWidth={4} />
                  </div>
                </motion.div>
              );
            }
          } else if (estaSeleccionada) {
            colorBorde = 'border-yellow-400';
            colorFondo = 'from-yellow-600/60 to-orange-600/60';
          }

          return (
            <motion.button
              key={opcion.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!disabled && !respondida ? { scale: 1.02, x: 8 } : undefined}
              whileTap={!disabled && !respondida ? { scale: 0.98 } : undefined}
              onClick={() => handleSeleccion(opcion.id)}
              disabled={disabled || respondida}
              className={`
                relative
                w-full
                bg-gradient-to-br ${colorFondo}
                border-[5px] ${colorBorde}
                rounded-2xl
                p-6
                text-left
                shadow-[0_6px_0_rgba(0,0,0,0.4)]
                ${!disabled && !respondida ? 'hover:shadow-[0_8px_0_rgba(0,0,0,0.4)]' : ''}
                ${!disabled && !respondida ? 'active:shadow-[0_2px_0_rgba(0,0,0,0.4)]' : ''}
                ${!disabled && !respondida ? 'active:translate-y-[2px]' : ''}
                flex items-center gap-4
              `}
              style={{ transition: 'none' }}
            >
              {/* Letra de opción */}
              <div
                className="
                  bg-black
                  border-4 border-white
                  rounded-xl
                  w-14 h-14
                  flex items-center justify-center
                  flex-shrink-0
                "
              >
                <span
                  className="text-2xl font-black text-white"
                  style={{
                    WebkitTextStroke: '2px black',
                    paintOrder: 'stroke fill',
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </span>
              </div>

              {/* Texto de opción */}
              <span
                className="flex-1 text-xl font-black text-white"
                style={{
                  textShadow: '0 3px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '1px black',
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

      {/* Botón Confirmar */}
      {!respondida && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleConfirmar}
          disabled={!seleccionada || disabled}
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
