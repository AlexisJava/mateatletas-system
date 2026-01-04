'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  Video,
  MonitorUp,
  PhoneOff,
  MessageSquare,
  Users,
  Send,
  Hand,
  MicOff,
  VideoOff,
  Clock,
  Wifi,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  Brain,
  Timer,
  Activity,
  BellRing,
  MinusCircle,
  Check,
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- TYPES ---

type AttentionStatus = 'attentive' | 'distracted' | 'away' | 'offline';

interface WaitingStudent {
  id: number;
  name: string;
  avatar: string;
  status: 'waiting' | 'requesting' | 'connected';
  attention: AttentionStatus;
  handRaised?: boolean;
  micActive?: boolean;
  lastInteraction?: number;
}

interface Slide {
  id: number;
  title: string;
  content: string;
  bullets: string[];
  image?: string;
}

interface QuizConfig {
  question: string;
  options: string[];
  correctOptionIndex: number;
  timeLimit: number;
}

interface ActiveQuizState extends QuizConfig {
  isActive: boolean;
  timeLeft: number;
  responses: Record<number, number>;
  isFinished: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  role: 'teacher' | 'student';
  avatar?: string;
}

// --- MOCK DATA ---

const slides: Slide[] = [
  {
    id: 1,
    title: 'Introducción a APIs REST',
    content: 'Conceptos fundamentales de la arquitectura cliente-servidor.',
    bullets: ['Protocolo HTTP', 'Statelessness', 'Recursos y URIs'],
    image: 'https://picsum.photos/seed/slide1/800/450',
  },
  {
    id: 2,
    title: 'Métodos HTTP',
    content: 'Verbos principales para manipulación de recursos.',
    bullets: [
      'GET: Obtener datos',
      'POST: Crear recursos',
      'PUT/PATCH: Actualizar',
      'DELETE: Eliminar',
    ],
    image: 'https://picsum.photos/seed/slide2/800/450',
  },
];

const initialStudents: WaitingStudent[] = [
  {
    id: 1,
    name: 'Ana García',
    avatar: 'https://picsum.photos/seed/ana/100/100',
    status: 'connected',
    attention: 'attentive',
  },
  {
    id: 2,
    name: 'Carlos Ruiz',
    avatar: 'https://picsum.photos/seed/carlos/100/100',
    status: 'connected',
    attention: 'distracted',
    handRaised: true,
  },
  {
    id: 3,
    name: 'Sofía López',
    avatar: 'https://picsum.photos/seed/sofia/100/100',
    status: 'connected',
    attention: 'attentive',
    micActive: true,
  },
  {
    id: 4,
    name: 'Miguel Ángel',
    avatar: 'https://picsum.photos/seed/miguel/100/100',
    status: 'connected',
    attention: 'away',
  },
  {
    id: 5,
    name: 'Valentina Roa',
    avatar: 'https://picsum.photos/seed/valentina/100/100',
    status: 'waiting',
    attention: 'offline',
  },
  {
    id: 6,
    name: 'David Kim',
    avatar: 'https://picsum.photos/seed/david/100/100',
    status: 'waiting',
    attention: 'offline',
  },
  {
    id: 7,
    name: 'Lucas Diaz',
    avatar: 'https://picsum.photos/seed/lucas/100/100',
    status: 'waiting',
    attention: 'offline',
  },
  {
    id: 8,
    name: 'Laura Chen',
    avatar: 'https://picsum.photos/seed/laura/100/100',
    status: 'waiting',
    attention: 'offline',
  },
];

const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'Carlos Ruiz',
    text: 'Profe, ¿podría repetir lo de Statelessness?',
    time: '19:10',
    role: 'student',
    avatar: 'https://picsum.photos/seed/carlos/50/50',
  },
  {
    id: '2',
    sender: 'Sofía López',
    text: 'Es que el servidor no guarda estado entre peticiones, Carlos.',
    time: '19:11',
    role: 'student',
    avatar: 'https://picsum.photos/seed/sofia/50/50',
  },
];

export const LiveClassPage: React.FC = () => {
  const [classStarted, setClassStarted] = useState(false);
  const [students, setStudents] = useState<WaitingStudent[]>(initialStudents);

  // Presentation State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [controlTab, setControlTab] = useState<'users' | 'interactions' | 'chat'>('users');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Media State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showStudentChat, setShowStudentChat] = useState(false);

  // Quiz State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quickQuizForm, setQuickQuizForm] = useState<QuizConfig>({
    question: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    timeLimit: 30,
  });
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizState | null>(null);

  // DEMO MODE
  const [demoViewMode, setDemoViewMode] = useState<'teacher' | 'student'>('teacher');
  const [studentQuizFeedback, setStudentQuizFeedback] = useState<'none' | 'correct' | 'incorrect'>(
    'none',
  );

  // --- ATTENTION SIMULATION ---
  useEffect(() => {
    if (!classStarted) return;
    const interval = setInterval(() => {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.status !== 'connected') return s;
          const rand = Math.random();
          if (rand > 0.95) return { ...s, attention: 'away' };
          if (rand > 0.85) return { ...s, attention: 'distracted' };
          if (rand > 0.3) return { ...s, attention: 'attentive' };
          return s;
        }),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [classStarted]);

  // --- QUIZ TIMER LOGIC ---
  useEffect(() => {
    let interval: number;
    if (activeQuiz && activeQuiz.isActive && activeQuiz.timeLeft > 0) {
      interval = window.setInterval(() => {
        setActiveQuiz((prev) => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) {
            return { ...prev, timeLeft: 0, isActive: false, isFinished: true };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeQuiz?.isActive]);

  // --- ACTIONS ---

  const handleLaunchQuiz = () => {
    setActiveQuiz({
      ...quickQuizForm,
      isActive: true,
      timeLeft: quickQuizForm.timeLimit,
      responses: {},
      isFinished: false,
    });
    setIsQuizModalOpen(false);
    setStudentQuizFeedback('none');
  };

  const handleStudentResponse = (optionIndex: number) => {
    if (!activeQuiz) return;
    setActiveQuiz((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        responses: { ...prev.responses, 1: optionIndex },
      };
    });

    if (optionIndex === activeQuiz.correctOptionIndex) {
      setStudentQuizFeedback('correct');
    } else {
      setStudentQuizFeedback('incorrect');
    }
  };

  const handlePingStudent = (id: number) => {
    alert(`🔔 PING enviado al estudiante ${id}`);
    setSelectedStudentId(null);
  };

  const handleSendMessage = (role: 'teacher' | 'student') => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      sender: role === 'teacher' ? 'Tú' : 'Estudiante Demo',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: role,
      avatar: role === 'teacher' ? undefined : 'https://picsum.photos/seed/demo/50/50',
    };
    setChatMessages([...chatMessages, msg]);
    setNewMessage('');
  };

  const currentSlide = slides[currentSlideIndex] as Slide;
  const connectedStudents = students.filter((s) => s.status === 'connected');

  // --- RENDER HELPERS ---

  const getAttentionColor = (status: AttentionStatus) => {
    switch (status) {
      case 'attentive':
        return 'bg-emerald-500';
      case 'distracted':
        return 'bg-amber-500';
      case 'away':
        return 'bg-red-500';
      case 'offline':
        return 'bg-slate-600';
    }
  };

  const getAttentionLabel = (status: AttentionStatus) => {
    switch (status) {
      case 'attentive':
        return 'Atento';
      case 'distracted':
        return 'Distraído';
      case 'away':
        return 'Ausente';
      case 'offline':
        return 'Desconectado';
    }
  };

  // --- COMPONENT: Chat Panel (Reusable) ---
  const ChatPanel = ({ role }: { role: 'teacher' | 'student' }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col-reverse">
        {[...chatMessages].reverse().map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === role ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-slate-700 overflow-hidden ${msg.role === 'teacher' ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              {msg.avatar ? (
                <img src={msg.avatar} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{msg.sender[0]}</span>
              )}
            </div>
            <div
              className={`flex flex-col max-w-[80%] ${msg.role === role ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-bold text-slate-300">{msg.sender}</span>
                <span className="text-[10px] text-slate-500">{msg.time}</span>
              </div>
              <div
                className={`p-3 rounded-2xl text-sm ${
                  msg.role === role
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-slate-900/50 border-t border-slate-800 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(role)}
            placeholder="Escribe un mensaje..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            onClick={() => handleSendMessage(role)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  // --- COMPONENT: Media Controls (Reusable) ---
  const MediaControls = ({ variant = 'teacher' }: { variant?: 'teacher' | 'student' }) => (
    <div
      className={`flex items-center gap-2 md:gap-4 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl ${variant === 'teacher' ? 'absolute bottom-6 left-1/2 -translate-x-1/2 z-40' : ''}`}
    >
      <button
        onClick={() => setIsMicOn(!isMicOn)}
        className={`p-3 md:p-4 rounded-xl border transition-all ${isMicOn ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-red-500/20 border-red-500 text-red-400'}`}
      >
        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      <button
        onClick={() => setIsCamOn(!isCamOn)}
        className={`p-3 md:p-4 rounded-xl border transition-all ${isCamOn ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-red-500/20 border-red-500 text-red-400'}`}
      >
        {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      {variant === 'teacher' && (
        <button className="p-3 md:p-4 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500 transition-all">
          <MonitorUp size={20} />
        </button>
      )}

      {variant === 'student' && (
        <button className="p-3 md:p-4 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 transition-all">
          <Hand size={20} />
        </button>
      )}

      {variant === 'student' && (
        <button
          onClick={() => setShowStudentChat(!showStudentChat)}
          className={`p-3 md:p-4 rounded-xl border transition-all ${showStudentChat ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'}`}
        >
          <MessageSquare size={20} />
        </button>
      )}

      <div className="w-[1px] h-8 bg-slate-700 mx-1"></div>

      <button className="px-6 py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/20">
        <PhoneOff size={20} />
        <span className="hidden md:inline">Finalizar</span>
      </button>
    </div>
  );

  // --- COMPONENT: Slide Renderer ---
  const SlideContent = () => (
    <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-full animation-fade-in">
      <div className="bg-indigo-900 p-6 flex justify-between items-start shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{currentSlide.title}</h2>
          <div className="h-1 w-20 bg-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div className="flex-1 p-8 flex gap-8 bg-white text-slate-800 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-2xl mb-8 leading-relaxed font-medium text-slate-600">
            {currentSlide.content}
          </p>
          <ul className="space-y-4">
            {currentSlide.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-center gap-4 text-xl">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-slate-50 p-3 border-t flex justify-between items-center text-slate-400 text-sm font-mono shrink-0">
        <span>Full Stack Dev - Comisión 101</span>
        <span>
          {currentSlideIndex + 1} / {slides.length}
        </span>
      </div>
    </div>
  );

  // --- COMPONENT: Teacher Active Quiz Monitor ---
  const QuizMonitor = () => {
    if (!activeQuiz) return null;
    const data = activeQuiz.options.map((opt, idx) => {
      const count = Object.values(activeQuiz.responses).filter((r) => r === idx).length;
      return { name: `Opción ${idx + 1}`, count, label: opt };
    });
    const totalResponses = Object.keys(activeQuiz.responses).length;

    return (
      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-full animation-scale-up">
        {/* Header */}
        <div className="bg-indigo-900 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Quiz en Vivo</h2>
              <p className="text-indigo-200 text-sm">{activeQuiz.question}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-white font-mono">{activeQuiz.timeLeft}s</div>
              <div className="text-[10px] text-indigo-300 uppercase">Tiempo</div>
            </div>
            <button
              onClick={() =>
                setActiveQuiz((prev) =>
                  prev ? { ...prev, isActive: false, isFinished: true, timeLeft: 0 } : null,
                )
              }
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xs"
            >
              Finalizar
            </button>
          </div>
        </div>
        {/* Content Chart */}
        <div className="flex-1 p-6 flex gap-6">
          <div className="flex-1 bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === activeQuiz.correctOptionIndex ? '#10b981' : '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Sidebar Stats */}
          <div className="w-48 flex flex-col gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400 font-bold">Participación</span>
                <span className="text-sm text-white font-bold">
                  {totalResponses}/{connectedStudents.length}
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full"
                  style={{ width: `${(totalResponses / connectedStudents.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- VIEW: WAITING ROOM ---
  if (!classStarted) {
    return (
      <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden relative backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950/0 to-slate-950/0 pointer-events-none" />
        <div className="p-8 pb-4 flex flex-col items-center text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Clock size={12} />
            Horario: 19:00 - 21:00
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
            Full Stack Development
          </h1>
          <p className="text-slate-400 text-lg">Comisión 101: Integración de APIs</p>
        </div>
        <div className="flex justify-center my-6 z-10">
          <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
            <div className="p-3 bg-slate-900 rounded-xl">
              <Users
                size={24}
                className={connectedStudents.length > 0 ? 'text-emerald-400' : 'text-slate-500'}
              />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white leading-none">
                {connectedStudents.length}
                <span className="text-slate-500 text-lg">/{students.length}</span>
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Estudiantes Conectados
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 md:px-12 py-4 custom-scrollbar z-10 pb-24">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-500 ${
                  student.status === 'connected'
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-slate-900/20 border-slate-800 opacity-60 grayscale'
                }`}
              >
                <div className="relative mb-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-800"
                  />
                  <div
                    className={`absolute bottom-0 right-0 p-1 rounded-full border-2 border-slate-900 ${
                      student.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    {student.status === 'connected' ? (
                      <Wifi size={10} className="text-white" />
                    ) : (
                      <Clock size={10} className="text-slate-300" />
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-white text-center line-clamp-1">
                  {student.name}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase mt-1 ${student.status === 'connected' ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {student.status === 'connected' ? 'Conectado' : 'Esperando'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 flex flex-col items-center gap-4 z-20">
          <button
            onClick={() => setClassStarted(true)}
            disabled={connectedStudents.length === 0}
            className={`w-full max-w-md py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 ${
              connectedStudents.length > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play size={24} fill="currentColor" />
            {connectedStudents.length > 0 ? 'INICIAR CLASE' : 'Esperando alumnos...'}
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: TEACHER MODE ---
  if (demoViewMode === 'teacher') {
    return (
      <div className="flex h-full gap-4 overflow-hidden relative pb-16">
        <button
          onClick={() => setDemoViewMode('student')}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 border border-slate-700 text-slate-300 px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-slate-800 transition-all"
        >
          👁️ Ver como Estudiante
        </button>

        {/* LEFT: Presentation / Quiz Area (60%) */}
        <div className="w-[60%] flex flex-col gap-4">
          <div className="flex-1 relative bg-slate-900 rounded-3xl p-4 border border-slate-800 flex flex-col">
            {activeQuiz ? (
              <QuizMonitor />
            ) : (
              <>
                <SlideContent />
                <div className="mt-4 flex items-center justify-between bg-slate-950/50 p-2 rounded-xl border border-slate-800">
                  <button
                    onClick={() => currentSlideIndex > 0 && setCurrentSlideIndex((p) => p - 1)}
                    disabled={currentSlideIndex === 0}
                    className="p-3 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <span className="text-sm font-bold text-white">
                    Slide {currentSlideIndex + 1} de {slides.length}
                  </span>
                  <button
                    onClick={() =>
                      currentSlideIndex < slides.length - 1 && setCurrentSlideIndex((p) => p + 1)
                    }
                    disabled={currentSlideIndex === slides.length - 1}
                    className="p-3 rounded-lg hover:bg-indigo-600 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Control Panel (40%) */}
        <div className="w-[40%] flex flex-col gap-4">
          {/* Timer Header */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">En Vivo</h3>
                <p className="text-xs text-red-400 font-mono">00:45:12</p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden flex flex-col relative">
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setControlTab('users')}
                className={`flex-1 py-3 text-xs font-bold transition-all ${controlTab === 'users' ? 'text-white border-b-2 border-indigo-500 bg-slate-800/50' : 'text-slate-500 hover:text-white'}`}
              >
                Participantes
              </button>
              <button
                onClick={() => setControlTab('interactions')}
                className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${controlTab === 'interactions' ? 'text-white border-b-2 border-indigo-500 bg-slate-800/50' : 'text-slate-500 hover:text-white'}`}
              >
                <Zap size={14} /> Interacciones
              </button>
              <button
                onClick={() => setControlTab('chat')}
                className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${controlTab === 'chat' ? 'text-white border-b-2 border-indigo-500 bg-slate-800/50' : 'text-slate-500 hover:text-white'}`}
              >
                <MessageSquare size={14} /> Chat
              </button>
            </div>

            {/* TAB: USERS / GRID */}
            {controlTab === 'users' && (
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 content-start custom-scrollbar">
                {connectedStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer group hover:bg-slate-800 ${
                      student.attention === 'distracted'
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : student.attention === 'away'
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-slate-700 bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={student.avatar} className="w-10 h-10 rounded-lg object-cover" />
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${getAttentionColor(student.attention)}`}
                        ></div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{student.name}</p>
                        <p
                          className={`text-[10px] font-bold ${student.attention === 'attentive' ? 'text-slate-500' : 'text-white opacity-80'}`}
                        >
                          {getAttentionLabel(student.attention)}
                        </p>
                      </div>
                    </div>
                    {/* Action Popover */}
                    {selectedStudentId === student.id && (
                      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-20 flex flex-col items-stretch justify-center p-2 gap-1 rounded-xl animation-scale-up">
                        <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-700">
                          <span className="text-[10px] text-slate-400">Acciones</span>
                          <X
                            size={12}
                            className="text-slate-400 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentId(null);
                            }}
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePingStudent(student.id);
                          }}
                          className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded text-xs text-white"
                        >
                          <BellRing size={12} className="text-indigo-400" /> Enviar Ping
                        </button>
                        <button className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded text-xs text-white">
                          <MinusCircle size={12} className="text-red-400" /> Quitar Puntos
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB: INTERACTIONS */}
            {controlTab === 'interactions' && (
              <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                <div className="p-4 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl">
                  <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                    <Brain size={18} className="text-indigo-400" />
                    Lanzar Quiz
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Evalúa el conocimiento en tiempo real.
                  </p>
                  <button
                    onClick={() => setIsQuizModalOpen(true)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    Configurar Quiz
                  </button>
                </div>

                <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-2xl">
                  <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-400" />
                    Lanzar Actividad
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Ejercicios prácticos sin límite de tiempo.
                  </p>
                  <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
                    Seleccionar Actividad
                  </button>
                </div>
              </div>
            )}

            {/* TAB: CHAT */}
            {controlTab === 'chat' && <ChatPanel role="teacher" />}
          </div>
        </div>

        {/* TEACHER MEDIA CONTROLS DOCK */}
        <MediaControls variant="teacher" />

        {/* QUIZ MODAL */}
        {isQuizModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animation-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="text-amber-400" /> Quiz Rápido
                </h3>
                <button onClick={() => setIsQuizModalOpen(false)}>
                  <X className="text-slate-500 hover:text-white" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Pregunta</label>
                    <input
                      type="text"
                      value={quickQuizForm.question}
                      onChange={(e) =>
                        setQuickQuizForm({ ...quickQuizForm, question: e.target.value })
                      }
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                      placeholder="Ej: ¿Qué código de estado indica éxito?"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Opciones</label>
                    <div className="space-y-2 mt-1">
                      {quickQuizForm.options.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...quickQuizForm.options];
                              newOpts[idx] = e.target.value;
                              setQuickQuizForm({ ...quickQuizForm, options: newOpts });
                            }}
                            className={`flex-1 bg-slate-950 border rounded-xl p-3 text-sm text-white outline-none ${idx === quickQuizForm.correctOptionIndex ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-700'}`}
                            placeholder={`Opción ${idx + 1}`}
                          />
                          <button
                            onClick={() =>
                              setQuickQuizForm({ ...quickQuizForm, correctOptionIndex: idx })
                            }
                            className={`p-3 rounded-xl border ${idx === quickQuizForm.correctOptionIndex ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Tiempo Límite
                    </label>
                    <div className="flex gap-2 mt-1">
                      {[15, 30, 60, 90].map((t) => (
                        <button
                          key={t}
                          onClick={() => setQuickQuizForm({ ...quickQuizForm, timeLimit: t })}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${quickQuizForm.timeLimit === t ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
                        >
                          {t}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-800 bg-slate-950/50">
                <button
                  onClick={handleLaunchQuiz}
                  disabled={!quickQuizForm.question}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Zap fill="currentColor" /> LANZAR A TODOS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW: STUDENT MODE ---
  // If quiz is active, show quiz overlay
  if (activeQuiz && activeQuiz.isActive && demoViewMode === 'student') {
    return (
      <div className="h-full bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <button
          onClick={() => setDemoViewMode('teacher')}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 border border-indigo-400 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-indigo-500 transition-all"
        >
          👨‍🏫 Volver a Vista Docente
        </button>

        {/* Background FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="w-full max-w-2xl relative z-10">
          {studentQuizFeedback === 'none' ? (
            <div className="animation-scale-up">
              <div className="flex justify-center mb-8">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-full px-6 py-2 flex items-center gap-3">
                  <Timer className="text-amber-400 animate-pulse" />
                  <span className="text-2xl font-mono font-bold text-white">
                    {activeQuiz.timeLeft}s
                  </span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-12 leading-tight">
                {activeQuiz.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeQuiz.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStudentResponse(idx)}
                    className="p-6 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 hover:bg-indigo-600/10 text-left transition-all group active:scale-95"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full border-2 border-slate-600 group-hover:border-indigo-400 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 font-bold">
                        {['A', 'B', 'C', 'D'][idx]}
                      </div>
                      <span className="text-lg font-bold text-slate-200 group-hover:text-white">
                        {opt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center animation-scale-up">
              <div
                className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center border-4 ${studentQuizFeedback === 'correct' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}
              >
                {studentQuizFeedback === 'correct' ? <Check size={64} /> : <X size={64} />}
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                {studentQuizFeedback === 'correct' ? '¡Correcto!' : 'Ups, incorrecto'}
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                {studentQuizFeedback === 'correct'
                  ? '+50 Puntos de Experiencia'
                  : 'Sigue intentando en la próxima'}
              </p>
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 inline-block">
                <p className="text-sm text-slate-500 uppercase font-bold mb-1">
                  Esperando al profesor...
                </p>
                <div className="flex gap-1 justify-center">
                  <div
                    className="w-2 h-2 rounded-full bg-slate-600 animate-bounce"
                    style={{ animationDelay: '0s' }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-slate-600 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-slate-600 animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular Student View
  return (
    <div className="flex flex-col h-full bg-black relative">
      <button
        onClick={() => setDemoViewMode('teacher')}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 border border-indigo-400 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-indigo-500 transition-all"
      >
        👨‍🏫 Volver a Vista Docente
      </button>

      {/* 80% Content Area */}
      <div className="flex-[8] bg-slate-950 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-6xl aspect-video relative shadow-2xl rounded-xl overflow-hidden z-10">
          <SlideContent />
        </div>

        {/* Student Chat Sidebar */}
        <div
          className={`absolute top-0 right-0 h-full w-80 bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 z-20 ${showStudentChat ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h3 className="text-white font-bold">Chat de la clase</h3>
            <button
              onClick={() => setShowStudentChat(false)}
              className="text-slate-500 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="h-[calc(100%-60px)]">
            <ChatPanel role="student" />
          </div>
        </div>
      </div>

      {/* 20% Bottom Bar */}
      <div className="flex-[2] bg-slate-900 border-t border-slate-800 flex items-center px-8 gap-8 justify-between relative">
        <div className="w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700 relative shadow-lg shrink-0 hidden md:block">
          <img
            src="https://picsum.photos/seed/alexis/400/300"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white">
            Profe Gimena
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center gap-4">
          <div className="flex justify-between items-center text-slate-400 text-sm w-full max-w-xl">
            <span className="font-bold text-white">Estás viendo: {currentSlide.title}</span>
            <span>
              Slide {currentSlideIndex + 1} de {slides.length}
            </span>
          </div>

          <MediaControls variant="student" />
        </div>
      </div>
    </div>
  );
};
