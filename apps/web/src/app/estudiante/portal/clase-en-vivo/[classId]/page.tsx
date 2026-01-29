'use client';

import {
  Home,
  ChevronRight,
  Timer,
  Zap,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  MessageCircle,
  ScreenShare,
  MoreVertical,
  Heart,
  ThumbsUp,
  Smile,
  Send,
} from 'lucide-react';

/**
 * Clase en Vivo - Portal Estudiante
 *
 * Replica exacta de "13. Clase en Vivo" de portal_estudiante.pen
 */

const STUDENTS = [
  { id: 1, name: 'María', isSpeaking: false, hasMic: true },
  { id: 2, name: 'Pedro', isSpeaking: true, hasMic: true },
  { id: 3, name: 'Ana', isSpeaking: false, hasMic: false },
  { id: 4, name: 'Carlos', isSpeaking: false, hasMic: true },
];

const CHAT_MESSAGES = [
  { id: 1, user: 'María', message: '¿Podemos ver otro ejemplo?', time: '2m' },
  {
    id: 2,
    user: 'Prof. Carolina',
    message: 'Claro, ahora les muestro',
    time: '1m',
    isTeacher: true,
  },
  { id: 3, user: 'Pedro', message: 'Gracias profe! 🙌', time: 'ahora' },
];

const REACTIONS = ['❤️', '👍', '😊', '🎉', '🤔'];

function StudentVideoCard({
  name,
  isSpeaking,
  hasMic,
}: {
  name: string;
  isSpeaking: boolean;
  hasMic: boolean;
}): React.JSX.Element {
  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{
        height: 72,
        backgroundColor: '#0F172A',
        border: isSpeaking ? '2px solid #22C55E' : '1px solid #374151',
      }}
    >
      {/* Placeholder Image */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-800" />

      {/* Name */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2 py-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: 10,
            fontWeight: 500,
            color: '#FFFFFF',
          }}
        >
          {name}
        </span>
      </div>

      {/* Mic indicator */}
      {!hasMic && (
        <div
          className="absolute top-1.5 right-1.5 rounded-full p-1"
          style={{ backgroundColor: '#EF4444' }}
        >
          <MicOff size={8} color="#FFFFFF" />
        </div>
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <div
          className="absolute top-1.5 left-1.5 rounded-full"
          style={{
            width: 8,
            height: 8,
            backgroundColor: '#22C55E',
            boxShadow: '0 0 8px #22C55E',
          }}
        />
      )}
    </div>
  );
}

export default function ClaseEnVivoPage(): React.JSX.Element {
  return (
    <div className="flex flex-col w-full h-screen" style={{ backgroundColor: '#030014' }}>
      {/* Top Bar */}
      <header
        className="flex items-center justify-between shrink-0"
        style={{
          height: 52,
          padding: '0 16px',
          background: 'linear-gradient(180deg, #1E1B4B 0%, #030014 100%)',
        }}
      >
        {/* Left Info */}
        <div className="flex items-center gap-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5">
            <Home size={12} color="#6B7280" />
            <ChevronRight size={10} color="#4B5563" />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 10,
                fontWeight: 500,
                color: '#6B7280',
              }}
            >
              Matemáticas
            </span>
            <ChevronRight size={10} color="#4B5563" />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                color: '#9CA3AF',
              }}
            >
              Clase en Vivo
            </span>
          </div>

          {/* Live Badge */}
          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{
              backgroundColor: '#EF4444',
              border: '2px solid #000000',
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: '#FFFFFF',
                animation: 'pulse 2s infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 11,
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              EN VIVO
            </span>
          </div>

          {/* Class Title */}
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              Fracciones Básicas
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 12,
                fontWeight: 500,
                color: '#9CA3AF',
              }}
            >
              Prof. Carolina
            </span>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{
              backgroundColor: '#1E1B4B',
              border: '2px solid #60A5FA',
            }}
          >
            <Timer size={14} color="#60A5FA" />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: '#60A5FA',
              }}
            >
              23:45
            </span>
          </div>

          {/* XP Badge */}
          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{
              background: 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)',
              border: '2px solid #000000',
            }}
          >
            <Zap size={14} color="#000000" />
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 13,
                fontWeight: 800,
                color: '#000000',
              }}
            >
              +120
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 p-4">
        {/* Left Column - Video */}
        <div className="flex flex-col flex-1 gap-3">
          {/* Video Area */}
          <div
            className="relative flex-1 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: '#0F172A',
              border: '2px solid #60A5FA',
              boxShadow: '0 0 20px rgba(96,165,250,0.25)',
            }}
          >
            {/* Slides Content Placeholder */}
            <div
              className="absolute inset-4 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#1E293B' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#6B7280',
                }}
              >
                Presentación en vivo
              </span>
            </div>

            {/* Teacher PIP */}
            <div
              className="absolute rounded-[10px] overflow-hidden"
              style={{
                left: 12,
                bottom: 12,
                width: 100,
                height: 76,
                border: '2px solid #22C55E',
                boxShadow: '0 0 8px rgba(34,197,94,0.5)',
              }}
            >
              <div className="w-full h-full bg-gradient-to-b from-slate-600 to-slate-700" />
              {/* Speaking indicator */}
              <div
                className="absolute top-1 right-1 rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: '#22C55E',
                  border: '2px solid #030014',
                }}
              />
            </div>

            {/* Slide Counter */}
            <div
              className="absolute flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
              style={{
                right: 16,
                bottom: 16,
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#FFFFFF',
                }}
              >
                3/12
              </span>
            </div>

            {/* Floating Reactions */}
            <div className="absolute right-4 top-20 flex flex-col gap-2">
              {REACTIONS.slice(0, 3).map((reaction, i) => (
                <span
                  key={i}
                  className="text-2xl animate-bounce"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  {reaction}
                </span>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div
            className="flex items-center justify-center gap-4 rounded-t-2xl"
            style={{
              height: 56,
              background: 'linear-gradient(180deg, #1E1B4B 0%, #030014 100%)',
              padding: '0 12px',
            }}
          >
            {/* Left Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#22C55E',
                }}
              >
                <Mic size={18} color="#FFFFFF" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#3B82F6',
                }}
              >
                <Video size={18} color="#FFFFFF" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#F59E0B',
                }}
              >
                <Hand size={18} color="#FFFFFF" />
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: '#374151',
                }}
              >
                <MessageCircle size={16} color="#FFFFFF" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: '#374151',
                }}
              >
                <ScreenShare size={16} color="#FFFFFF" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: '#374151',
                }}
              >
                <MoreVertical size={16} color="#FFFFFF" />
              </button>

              {/* Quick Reactions */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: 'rgba(239,68,68,0.2)',
                  }}
                >
                  <Heart size={14} color="#EF4444" />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: 'rgba(59,130,246,0.2)',
                  }}
                >
                  <ThumbsUp size={14} color="#3B82F6" />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: 'rgba(245,158,11,0.2)',
                  }}
                >
                  <Smile size={14} color="#F59E0B" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-2.5" style={{ width: 280 }}>
          {/* Students Videos */}
          <div
            className="flex flex-col flex-1 gap-1.5 rounded-2xl p-2"
            style={{
              backgroundColor: '#1E1B4B',
              border: '2px solid #374151',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1">
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                Participantes
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 500,
                  color: '#6B7280',
                }}
              >
                {STUDENTS.length} en línea
              </span>
            </div>

            {/* Videos Grid */}
            <div className="flex flex-col gap-1.5 flex-1">
              {STUDENTS.map((student) => (
                <StudentVideoCard key={student.id} {...student} />
              ))}
            </div>
          </div>

          {/* Chat */}
          <div
            className="flex flex-col flex-1 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: '#1E1B4B',
              border: '2px solid #374151',
            }}
          >
            {/* Chat Header */}
            <div
              className="flex items-center justify-between px-3 py-2.5"
              style={{ backgroundColor: '#0F0A2E' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                Chat en vivo
              </span>
              <MessageCircle size={14} color="#6B7280" />
            </div>

            {/* Messages */}
            <div className="flex flex-col flex-1 gap-2 p-2.5 overflow-y-auto">
              {CHAT_MESSAGES.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: 11,
                        fontWeight: 600,
                        color: msg.isTeacher ? '#22C55E' : '#60A5FA',
                      }}
                    >
                      {msg.user}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: 10,
                        color: '#6B7280',
                      }}
                    >
                      {msg.time}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize: 12,
                      color: '#E5E7EB',
                    }}
                  >
                    {msg.message}
                  </span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div
              className="flex items-center gap-2 px-2.5 py-2"
              style={{ backgroundColor: '#0F0A2E' }}
            >
              <div className="flex-1 rounded-lg px-3 py-2" style={{ backgroundColor: '#1E1B4B' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: 12,
                    color: '#6B7280',
                  }}
                >
                  Escribe un mensaje...
                </span>
              </div>
              <button
                type="button"
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: '#3B82F6',
                }}
              >
                <Send size={14} color="#FFFFFF" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
