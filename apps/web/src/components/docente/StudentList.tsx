'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  X,
  Clock,
  Star,
  Save,
  Shield,
  Users,
  LayoutList,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import { Student } from '../../types/docente.types';

// --- MOCK DATA FACTORY ---
const getCommissionData = (id: string) => {
  switch (id) {
    case '102':
      return {
        id: '102',
        name: 'Intro a Unity 3D',
        schedule: 'Jueves 16:00',
        house: 'QUANTUM',
        enrolled: 15,
        capacity: 15,
        students: [
          {
            id: 'u1',
            name: 'Marcos R.',
            avatar: 'https://picsum.photos/seed/marcos/100/100',
            comision_id: '102',
            attendance: 'present',
            points: 300,
            observations: [],
          },
          {
            id: 'u2',
            name: 'Julieta V.',
            avatar: 'https://picsum.photos/seed/julieta/100/100',
            comision_id: '102',
            attendance: 'present',
            points: 280,
            observations: [],
          },
          {
            id: 'u3',
            name: 'Pedro Pascal',
            avatar: 'https://picsum.photos/seed/pedro/100/100',
            comision_id: '102',
            attendance: 'late',
            points: 150,
            observations: [],
          },
        ],
      };
    case '103':
      return {
        id: '103',
        name: 'Python Data Science',
        schedule: 'Viernes 18:30',
        house: 'PULSAR',
        enrolled: 20,
        capacity: 25,
        students: [
          {
            id: 'p1',
            name: 'Esteban Q.',
            avatar: 'https://picsum.photos/seed/esteban/100/100',
            comision_id: '103',
            attendance: 'present',
            points: 50,
            observations: [],
          },
          {
            id: 'p2',
            name: 'Laura M.',
            avatar: 'https://picsum.photos/seed/lauram/100/100',
            comision_id: '103',
            attendance: 'absent',
            points: 20,
            observations: ['Falta entrega TP1'],
          },
        ],
      };
    default:
      // 101
      return {
        id: '101',
        name: 'Full Stack Development',
        schedule: 'Lun y Mie 19:00',
        house: 'VERTEX',
        enrolled: 18,
        capacity: 20,
        students: [
          {
            id: '1',
            name: 'Ana García',
            avatar: 'https://picsum.photos/seed/ana/100/100',
            comision_id: '101',
            attendance: 'present',
            points: 120,
            observations: [],
          },
          {
            id: '4',
            name: 'Miguel Ángel',
            avatar: 'https://picsum.photos/seed/miguel/100/100',
            comision_id: '101',
            attendance: 'absent',
            points: 85,
            observations: ['Riesgo de abandono'],
          },
          {
            id: '5',
            name: 'Valentina Roa',
            avatar: 'https://picsum.photos/seed/valentina/100/100',
            comision_id: '101',
            attendance: 'present',
            points: 150,
            observations: [],
          },
          {
            id: '11',
            name: 'Lucas Diaz',
            avatar: 'https://picsum.photos/seed/lucas/100/100',
            comision_id: '101',
            attendance: 'none',
            points: 90,
            observations: [],
          },
          {
            id: '3',
            name: 'Sofía López',
            avatar: 'https://picsum.photos/seed/sofia/100/100',
            comision_id: '101',
            attendance: 'present',
            points: 200,
            observations: ['Excelente participación'],
          },
        ],
      };
  }
};

interface StudentListProps {
  comisionId?: string;
  onBack?: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({ comisionId = '101', onBack }) => {
  const [activeTab, setActiveTab] = useState<
    'students' | 'attendance' | 'observations' | 'planning' | 'metrics'
  >('students');
  const [data, setData] = useState(getCommissionData(comisionId));
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Update data when ID changes
  useEffect(() => {
    const newData = getCommissionData(comisionId);
    setData(newData);
    setStudents(newData.students as Student[]);
  }, [comisionId]);

  // States for Interactions
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [currentStudentForObs, setCurrentStudentForObs] = useState<string | null>(null);
  const [newObservation, setNewObservation] = useState('');

  // Actions
  const handleAddPoints = (id: string, pointsToAdd: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, points: s.points + pointsToAdd } : s)),
    );
  };

  const openObsModal = (id: string) => {
    setCurrentStudentForObs(id);
    setNewObservation('');
    setObsModalOpen(true);
  };

  const saveObservation = () => {
    if (currentStudentForObs && newObservation.trim()) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === currentStudentForObs
            ? { ...s, observations: [newObservation, ...s.observations] }
            : s,
        ),
      );
      setObsModalOpen(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden relative">
      {/* Commission Header */}
      <div className="bg-slate-950/40 border-b border-slate-800/50 p-6 pb-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="mt-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{data.name}</h2>
                <div className="px-2 py-0.5 rounded border bg-cyan-500/10 border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-wide flex items-center gap-1">
                  <Shield size={10} fill="currentColor" /> {data.house}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {data.schedule}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {data.enrolled}/{data.capacity} Inscritos
                </span>
              </div>
            </div>
          </div>

          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
            INICIAR CLASE
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'students', label: 'Estudiantes' },
            { id: 'attendance', label: 'Asistencia' },
            { id: 'observations', label: 'Observaciones' },
            { id: 'planning', label: 'Planificación' },
            { id: 'metrics', label: 'Métricas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-900/20 overflow-hidden">
        {activeTab === 'students' && (
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="p-4 flex justify-between items-center">
              <div className="relative group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar alumno..."
                  className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all w-64"
                />
              </div>
              <div className="text-xs font-bold text-slate-500">
                {filteredStudents.length} Alumnos
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <img src={student.avatar} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate">{student.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          92% Asist.
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          {student.points} Pts
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span>
                          Racha: 5 <span className="text-orange-500">🔥</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddPoints(student.id, 10)}
                        className="p-2 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-400 text-slate-400 rounded-xl transition-colors"
                        title="Dar Puntos"
                      >
                        <Star size={18} />
                      </button>
                      <button
                        onClick={() => openObsModal(student.id)}
                        className="p-2 bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-400 rounded-xl transition-colors"
                        title="Agregar Observación"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button
                        className="p-2 bg-slate-800 hover:bg-green-500/20 hover:text-green-400 text-slate-400 rounded-xl transition-colors"
                        title="Contactar (WhatsApp)"
                      >
                        <Mail size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p>No se encontraron alumnos.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab !== 'students' && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
            <LayoutList size={48} className="opacity-20" />
            <p>
              Contenido de la pestaña <strong>{activeTab}</strong> en desarrollo.
            </p>
          </div>
        )}
      </div>

      {/* Observation Modal */}
      {obsModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animation-fade-in-up">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">Nueva Observación</h3>
              <button
                onClick={() => setObsModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <textarea
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              placeholder="Escribe una observación..."
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none mb-4"
              autoFocus
            />
            <button
              onClick={saveObservation}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Save size={18} />
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
