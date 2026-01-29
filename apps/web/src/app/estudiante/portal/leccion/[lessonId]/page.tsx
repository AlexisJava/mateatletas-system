'use client';

import {
  ArrowLeft,
  Puzzle,
  Star,
  Lightbulb,
  Target,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Play,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Lección Blockly - Portal Estudiante
 *
 * Replica exacta de "9. Slide - Lección Blockly" de portal_estudiante.pen
 */

const OBJECTIVES = [
  { id: 1, text: 'Recoger 3 estrellas', completed: true },
  { id: 2, text: 'Usar bucle de repetición', completed: false },
  { id: 3, text: 'Máximo 4 bloques', completed: false },
];

const TOOLBOX_CATEGORIES = [
  {
    id: 'motion',
    name: 'Movimiento',
    color: '#3B82F6',
    blocks: ['Mover 10 pasos', 'Girar ↻ 15 grados', 'Ir a x: 0 y: 0'],
  },
  {
    id: 'control',
    name: 'Control',
    color: '#F59E0B',
    blocks: ['Repetir 10 veces', 'Si...entonces', 'Esperar 1 seg'],
  },
  {
    id: 'events',
    name: 'Eventos',
    color: '#22C55E',
    blocks: ['Al presionar ⚑', 'Al presionar tecla', 'Al hacer clic'],
  },
];

function BlockItem({ text, color }: { text: string; color: string }): React.JSX.Element {
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{
        backgroundColor: color,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-nunito), Nunito, sans-serif',
          fontSize: 12,
          fontWeight: 600,
          color: '#FFFFFF',
        }}
      >
        {text}
      </span>
    </div>
  );
}

export default function LeccionPage(): React.JSX.Element {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full h-screen" style={{ backgroundColor: '#030014' }}>
      {/* Top Bar */}
      <header
        className="flex items-center justify-between shrink-0"
        style={{
          height: 56,
          padding: '0 24px',
          backgroundColor: '#0A0A1A',
        }}
      >
        {/* Left: Back + Title */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: '#1E1E3A' }}
          >
            <ArrowLeft size={18} color="#9CA3AF" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#9CA3AF',
              }}
            >
              Volver
            </span>
          </button>

          <span
            style={{
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontSize: 18,
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            Introducción a Bucles
          </span>

          <div
            className="flex items-center gap-1.5 rounded-[20px] px-3 py-1.5"
            style={{ backgroundColor: 'rgba(245,158,11,0.13)' }}
          >
            <Puzzle size={14} color="#F59E0B" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: '#F59E0B',
              }}
            >
              Scratch
            </span>
          </div>
        </div>

        {/* Right: Level + Hint */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 rounded-[20px] px-3 py-1.5"
            style={{ backgroundColor: 'rgba(16,185,129,0.13)' }}
          >
            <Star size={14} color="#10B981" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: '#10B981',
              }}
            >
              Nivel 1
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2"
            style={{ backgroundColor: '#374151' }}
          >
            <Lightbulb size={16} color="#FBBF24" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Pista
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 gap-5 p-6">
        {/* Left Panel - Mission + Toolbox */}
        <div className="flex flex-col gap-4" style={{ width: 280 }}>
          {/* Mission Card */}
          <div
            className="flex flex-col gap-4 rounded-2xl p-5"
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid rgba(245,158,11,0.19)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <Target size={18} color="#F59E0B" />
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                Misión
              </span>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 14,
                fontWeight: 400,
                lineHeight: 1.5,
                color: '#E5E7EB',
              }}
            >
              Ayudá al personaje a recoger las 3 estrellas usando un bucle de repetición.
            </p>

            {/* Objectives */}
            <div className="flex flex-col gap-2.5">
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6B7280',
                }}
              >
                Objetivos:
              </span>
              {OBJECTIVES.map((obj) => (
                <div key={obj.id} className="flex items-center gap-2">
                  <CheckCircle
                    size={14}
                    color={obj.completed ? '#22C55E' : '#4B5563'}
                    fill={obj.completed ? '#22C55E' : 'transparent'}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                      fontSize: 12,
                      fontWeight: 500,
                      color: obj.completed ? '#22C55E' : '#9CA3AF',
                    }}
                  >
                    {obj.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Toolbox Card */}
          <div
            className="flex flex-col flex-1 gap-3 rounded-2xl p-4"
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #1E293B',
            }}
          >
            <div className="flex items-center gap-2">
              <Puzzle size={16} color="#A855F7" />
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                Bloques
              </span>
            </div>

            {TOOLBOX_CATEGORIES.map((category) => (
              <div key={category.id} className="flex flex-col gap-2">
                <span
                  style={{
                    fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                    color: category.color,
                  }}
                >
                  {category.name}
                </span>
                <div className="flex flex-col gap-1.5">
                  {category.blocks.map((block, i) => (
                    <BlockItem key={i} text={block} color={category.color} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Workspace */}
        <div className="flex flex-col flex-1">
          {/* Workspace Header */}
          <div
            className="flex items-center justify-between rounded-t-xl px-4"
            style={{
              height: 44,
              backgroundColor: '#1E293B',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Área de Trabajo
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#374151',
                }}
              >
                <ZoomIn size={16} color="#9CA3AF" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#374151',
                }}
              >
                <ZoomOut size={16} color="#9CA3AF" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#374151',
                }}
              >
                <Trash2 size={16} color="#EF4444" />
              </button>
            </div>
          </div>

          {/* Workspace Area */}
          <div
            className="flex-1 rounded-b-xl relative overflow-hidden"
            style={{ backgroundColor: '#111827' }}
          >
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  'linear-gradient(#1E293B 1px, transparent 1px), linear-gradient(90deg, #1E293B 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* Block Stack Example */}
            <div className="absolute flex flex-col gap-0" style={{ left: 40, top: 30 }}>
              <BlockItem text="Al presionar ⚑" color="#22C55E" />
              <div
                className="rounded-lg px-3 py-2 ml-4"
                style={{ backgroundColor: '#F59E0B', marginTop: -2 }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#FFFFFF',
                  }}
                >
                  Repetir 3 veces
                </span>
              </div>
              <div
                className="rounded-lg px-3 py-2 ml-8"
                style={{ backgroundColor: '#3B82F6', marginTop: -2 }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#FFFFFF',
                  }}
                >
                  Mover 50 pasos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview + Controls */}
        <div className="flex flex-col gap-4" style={{ width: 320 }}>
          {/* Preview Card */}
          <div
            className="flex flex-col flex-1 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #1E293B',
            }}
          >
            {/* Preview Header */}
            <div
              className="flex items-center justify-between px-4"
              style={{
                height: 44,
                backgroundColor: '#1E293B',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                Vista Previa
              </span>
              <div
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: 'rgba(34,197,94,0.2)' }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#22C55E',
                  }}
                >
                  1/3 ⭐
                </span>
              </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 relative" style={{ backgroundColor: '#1a1a2e' }}>
              {/* Character Placeholder */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 40,
                  height: 40,
                  left: 60,
                  top: 100,
                  backgroundColor: '#A855F7',
                  boxShadow: '0 0 12px rgba(168,85,247,0.5)',
                }}
              />

              {/* Stars */}
              <Star
                size={24}
                color="#FBBF24"
                fill="#FBBF24"
                className="absolute"
                style={{ left: 140, top: 100 }}
              />
              <Star
                size={24}
                color="#FBBF24"
                fill="#FBBF24"
                className="absolute"
                style={{ left: 200, top: 100 }}
              />
              <Star
                size={24}
                color="#6B7280"
                className="absolute"
                style={{ left: 260, top: 100 }}
              />
            </div>
          </div>

          {/* Controls Card */}
          <div
            className="flex items-center justify-center gap-3 rounded-2xl px-4"
            style={{
              height: 70,
              backgroundColor: '#0F172A',
              border: '1px solid #1E293B',
            }}
          >
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl px-6 py-3"
              style={{
                background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
              }}
            >
              <Play size={18} color="#FFFFFF" />
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                Ejecutar
              </span>
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl px-5 py-3"
              style={{ backgroundColor: '#374151' }}
            >
              <RotateCcw size={18} color="#FFFFFF" />
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                Reiniciar
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <footer
        className="flex items-center justify-between shrink-0"
        style={{
          height: 64,
          padding: '0 24px',
          backgroundColor: '#0A0A1A',
        }}
      >
        {/* Left: Navigation */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-4 py-2.5"
            style={{ backgroundColor: '#1E1E3A' }}
          >
            <ChevronLeft size={18} color="#FFFFFF" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Anterior
            </span>
          </button>

          <span
            style={{
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontSize: 14,
              color: '#9CA3AF',
            }}
          >
            Nivel 3 de 8
          </span>
        </div>

        {/* Center: Blocks Used */}
        <div
          className="flex items-center gap-1.5 rounded-[20px] px-3.5 py-2"
          style={{ backgroundColor: '#1E293B' }}
        >
          <Puzzle size={14} color="#A855F7" />
          <span
            style={{
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            3/4 bloques
          </span>
        </div>

        {/* Right: XP + Next */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 rounded-[20px] px-3.5 py-2"
            style={{
              background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
            }}
          >
            <Zap size={14} color="#FFFFFF" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              +20 XP
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-[10px] px-6 py-3"
            style={{
              background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 4px 16px rgba(245,158,11,0.25)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 15,
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              Siguiente
            </span>
            <ChevronRight size={20} color="#FFFFFF" />
          </button>
        </div>
      </footer>
    </div>
  );
}
