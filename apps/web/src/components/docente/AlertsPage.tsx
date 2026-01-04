import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Mail,
  MessageCircle,
  Calendar,
  X,
  Filter,
  Search,
  ChevronDown,
  FileText,
  Save,
} from 'lucide-react';
import { Alerta } from '../../types/docente.types';

// Extended mock data for this page
const detailedAlerts: (Alerta & { date: string; status: 'pending' | 'resolved' })[] = [
  {
    id: 'a1',
    tipo: 'asistencia',
    severidad: 'alta',
    mensaje: 'Tiene menos del 60% de asistencia. Riesgo de quedar libre.',
    estudiante: 'Miguel Ángel',
    comision_id: '101',
    date: 'Hace 2 horas',
    status: 'pending',
  },
  {
    id: 'a2',
    tipo: 'inactividad',
    severidad: 'media',
    mensaje: 'No ha entregado el TP2 y faltó 2 clases seguidas.',
    estudiante: 'Juan Pérez',
    comision_id: '102',
    date: 'Ayer',
    status: 'pending',
  },
  {
    id: 'a3',
    tipo: 'observacion',
    severidad: 'media',
    mensaje: 'Requiere seguimiento en lógica de programación.',
    estudiante: 'Ana García',
    comision_id: '101',
    date: 'Hace 2 días',
    status: 'pending',
  },
  {
    id: 'a4',
    tipo: 'asistencia',
    severidad: 'alta',
    mensaje: '3 ausencias consecutivas sin aviso.',
    estudiante: 'Carlos Ruiz',
    comision_id: '103',
    date: 'Hace 3 días',
    status: 'resolved',
  },
];

export const AlertsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  // Observation Modal Logic
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [obsNote, setObsNote] = useState('');

  const filteredAlerts = detailedAlerts.filter((a) => filter === 'all' || a.status === filter);
  const activeAlertData = detailedAlerts.find((a) => a.id === selectedAlert);

  const handleSaveObservation = () => {
    // Logic to save would go here
    setIsObsModalOpen(false);
    setObsNote('');
    // Optionally trigger a success toast
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/20">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="text-amber-500" />
            Centro de Alertas
          </h2>
          <p className="text-sm text-slate-400">Seguimiento académico y conductual</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['pending', 'resolved', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === f
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'pending' ? 'Pendientes' : f === 'resolved' ? 'Resueltas' : 'Todas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* List Column */}
        <div className="w-full lg:w-1/2 overflow-y-auto no-scrollbar border-r border-slate-800/50 p-4 space-y-3">
          {filteredAlerts.map((alerta) => (
            <div
              key={alerta.id}
              onClick={() => setSelectedAlert(alerta.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                selectedAlert === alerta.id
                  ? 'bg-indigo-900/20 border-indigo-500/50'
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-start gap-4 z-10 relative">
                <div
                  className={`mt-1 p-2 rounded-xl shrink-0 ${
                    alerta.severidad === 'alta'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {alerta.severidad === 'alta' ? (
                    <AlertCircle size={20} />
                  ) : (
                    <AlertTriangle size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4
                      className={`font-bold ${alerta.status === 'resolved' ? 'text-slate-500 line-through' : 'text-white'}`}
                    >
                      {alerta.estudiante}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">{alerta.date}</span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${alerta.status === 'resolved' ? 'text-slate-600' : 'text-slate-300'}`}
                  >
                    {alerta.mensaje}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400 uppercase tracking-wide">
                      {alerta.tipo}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400">
                      Comisión {alerta.comision_id}
                    </span>
                  </div>
                </div>
                {selectedAlert === alerta.id && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500">
                    <ChevronDown className="-rotate-90" size={20} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Column (Desktop) */}
        <div className="hidden lg:flex flex-1 bg-slate-950/30 flex-col items-center justify-center p-8 text-center relative">
          {selectedAlert ? (
            <div className="w-full max-w-md animation-fade-in-up">
              <div className="mb-6 mx-auto w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center">
                <img
                  src={`https://picsum.photos/seed/${selectedAlert}/200/200`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Acciones para {activeAlertData?.estudiante}
              </h3>
              <p className="text-slate-400 mb-8">
                Selecciona una acción para gestionar esta alerta.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-500/10 rounded-2xl flex flex-col items-center gap-3 transition-all group">
                  <Mail className="text-slate-400 group-hover:text-indigo-400" />
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white">
                    Enviar Email
                  </span>
                </button>
                <button className="p-4 bg-slate-900 border border-slate-800 hover:border-green-500 hover:bg-green-500/10 rounded-2xl flex flex-col items-center gap-3 transition-all group">
                  <MessageCircle className="text-slate-400 group-hover:text-green-400" />
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white">
                    WhatsApp
                  </span>
                </button>

                {/* Changed Action Button */}
                <button
                  onClick={() => setIsObsModalOpen(true)}
                  className="p-4 bg-slate-900 border border-slate-800 hover:border-purple-500 hover:bg-purple-500/10 rounded-2xl flex flex-col items-center gap-3 transition-all group"
                >
                  <FileText className="text-slate-400 group-hover:text-purple-400" />
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white">
                    Agregar Observación
                  </span>
                </button>

                <button className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500 hover:bg-amber-500/10 rounded-2xl flex flex-col items-center gap-3 transition-all group">
                  <CheckCircle className="text-slate-400 group-hover:text-amber-400" />
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white">
                    Marcar Resuelto
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">
              <Filter size={48} className="mx-auto mb-4 opacity-20" />
              <p>Selecciona una alerta de la lista para ver opciones.</p>
            </div>
          )}
        </div>
      </div>

      {/* Observation Modal */}
      {isObsModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animation-fade-in-up">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white">
                Nueva Observación para {activeAlertData?.estudiante}
              </h3>
              <button
                onClick={() => setIsObsModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex gap-2 items-center text-xs text-amber-400 font-bold mb-1">
                <AlertTriangle size={12} />
                Alerta Relacionada:
              </div>
              <p className="text-xs text-slate-400">{activeAlertData?.mensaje}</p>
            </div>

            <textarea
              value={obsNote}
              onChange={(e) => setObsNote(e.target.value)}
              placeholder="Escribe detalles del seguimiento realizado..."
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none mb-4"
              autoFocus
            />

            <button
              onClick={handleSaveObservation}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Save size={18} />
              Guardar Observación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
