'use client';

import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/utils/error-handler';
import apiClient from '@/lib/axios';
import { EmptyState } from '@/components/admin/EmptyState';
import { GraduationCap, Search, Users, Sparkles, Zap, Rocket } from 'lucide-react';
import { CASAS_CONFIG, getCasaByEdad, type CasaName } from '@/lib/constants/casas-2026';

/**
 * Tipos para el modelo 2026
 */
interface Casa {
  nombre: string;
  colorPrimary: string;
}

interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  nivelEscolar: string;
  nivel_actual: number;
  puntos_totales: number;
  avatar_url?: string;
  tutor: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  casa?: Casa;
}

type CasaTab = 'Todos' | CasaName | 'Sin Casa';

export default function AdminEstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [casaActiva, setCasaActiva] = useState<CasaTab>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<{ data?: Estudiante[] } | Estudiante[]>(
        '/admin/estudiantes',
      );
      const data = (response as { data?: Estudiante[] })?.data
        ? (response as { data: Estudiante[] }).data
        : Array.isArray(response)
          ? response
          : [];
      setEstudiantes(data as Estudiante[]);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setError(getErrorMessage(err as Error, 'Error al cargar estudiantes'));
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar estudiantes por búsqueda
  const estudiantesFiltrados = estudiantes.filter((est) => {
    const fullName = `${est.nombre} ${est.apellido}`.toLowerCase();
    const tutorName = `${est.tutor.nombre} ${est.tutor.apellido}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || tutorName.includes(search);
  });

  // Agrupar por casa (basado en edad o casa asignada)
  const estudiantesPorCasa = {
    Quantum: estudiantesFiltrados.filter(
      (est) => est.casa?.nombre === 'Quantum' || getCasaByEdad(est.edad) === 'Quantum',
    ),
    Vertex: estudiantesFiltrados.filter(
      (est) => est.casa?.nombre === 'Vertex' || getCasaByEdad(est.edad) === 'Vertex',
    ),
    Pulsar: estudiantesFiltrados.filter(
      (est) => est.casa?.nombre === 'Pulsar' || getCasaByEdad(est.edad) === 'Pulsar',
    ),
    'Sin Casa': estudiantesFiltrados.filter((est) => !est.casa && getCasaByEdad(est.edad) === null),
  };

  const estudiantesActivos =
    casaActiva === 'Todos'
      ? estudiantesFiltrados
      : casaActiva === 'Sin Casa'
        ? estudiantesPorCasa['Sin Casa']
        : estudiantesPorCasa[casaActiva as keyof typeof estudiantesPorCasa];

  const tabsConfig: { key: CasaTab; icon: typeof Sparkles; count: number }[] = [
    { key: 'Todos', icon: Users, count: estudiantesFiltrados.length },
    { key: 'Quantum', icon: Sparkles, count: estudiantesPorCasa.Quantum.length },
    { key: 'Vertex', icon: Zap, count: estudiantesPorCasa.Vertex.length },
    { key: 'Pulsar', icon: Rocket, count: estudiantesPorCasa.Pulsar.length },
    { key: 'Sin Casa', icon: GraduationCap, count: estudiantesPorCasa['Sin Casa'].length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-[var(--status-danger-muted)] border border-[var(--status-danger)]/30 text-[var(--status-danger)]">
        <h3 className="font-semibold mb-1">Error</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Estudiantes</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Gestión de estudiantes por Casa ({estudiantes.length} total)
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            placeholder="Buscar estudiante o tutor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50"
          />
        </div>
      </div>

      {/* Casa Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabsConfig.map(({ key, icon: Icon, count }) => {
          const isActive = casaActiva === key;
          const casaConfig = key !== 'Todos' && key !== 'Sin Casa' ? CASAS_CONFIG[key] : null;

          return (
            <button
              key={key}
              onClick={() => setCasaActiva(key)}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all rounded-lg ${
                isActive
                  ? 'bg-[var(--admin-accent)] text-black'
                  : 'bg-[var(--admin-surface-1)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text)] border border-[var(--admin-border)]'
              }`}
              title={casaConfig?.descripcion}
            >
              <Icon className="w-4 h-4" />
              {key}
              {casaConfig && <span className="text-xs opacity-70">{casaConfig.emoji}</span>}
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  isActive
                    ? 'bg-black/20 text-black'
                    : 'bg-[var(--admin-surface-3)] text-[var(--admin-text-muted)]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Info de Casa seleccionada */}
      {casaActiva !== 'Todos' && casaActiva !== 'Sin Casa' && (
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: `${CASAS_CONFIG[casaActiva].color}10`,
            borderColor: `${CASAS_CONFIG[casaActiva].color}30`,
          }}
        >
          <p className="text-sm" style={{ color: CASAS_CONFIG[casaActiva].color }}>
            <span className="font-semibold">
              {CASAS_CONFIG[casaActiva].emoji} Casa {casaActiva}:
            </span>{' '}
            {CASAS_CONFIG[casaActiva].descripcion}
          </p>
        </div>
      )}

      {/* Table */}
      {estudiantesActivos.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={
            searchTerm
              ? 'No se encontraron resultados'
              : casaActiva === 'Todos'
                ? 'No hay estudiantes registrados'
                : `No hay estudiantes en ${casaActiva}`
          }
          description={
            searchTerm
              ? 'Intentá con otro término de búsqueda'
              : 'Los estudiantes aparecerán aquí cuando se registren'
          }
        />
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Edad</th>
                  <th>Casa</th>
                  <th>Nivel</th>
                  <th>Puntos</th>
                  <th>Tutor</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesActivos.map((estudiante) => {
                  const initials =
                    `${estudiante.nombre.charAt(0)}${estudiante.apellido.charAt(0)}`.toUpperCase();
                  const casaCalculada = getCasaByEdad(estudiante.edad);
                  const casaNombre = estudiante.casa?.nombre || casaCalculada;
                  const casaConfig =
                    casaNombre && casaNombre !== 'Sin Casa'
                      ? CASAS_CONFIG[casaNombre as keyof typeof CASAS_CONFIG]
                      : null;

                  return (
                    <tr key={estudiante.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold"
                            style={{
                              backgroundColor: casaConfig
                                ? `${casaConfig.color}20`
                                : 'var(--admin-surface-2)',
                              color: casaConfig?.color || 'var(--admin-text-muted)',
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--admin-text)]">
                              {estudiante.nombre} {estudiante.apellido}
                            </div>
                            <div className="text-xs text-[var(--admin-text-muted)]">
                              {estudiante.nivelEscolar}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-[var(--admin-text-secondary)]">
                          {estudiante.edad} años
                        </span>
                      </td>
                      <td>
                        {casaNombre ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: casaConfig
                                ? `${casaConfig.color}20`
                                : 'var(--admin-surface-2)',
                              color: casaConfig?.color || 'var(--admin-text-muted)',
                            }}
                          >
                            {casaConfig?.emoji} {casaNombre}
                          </span>
                        ) : (
                          <span className="text-[var(--admin-text-disabled)] text-xs">
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="admin-badge-info">Nivel {estudiante.nivel_actual}</span>
                      </td>
                      <td>
                        <span className="font-semibold text-[var(--status-warning)]">
                          {estudiante.puntos_totales.toLocaleString()} pts
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className="text-[var(--admin-text-secondary)]">
                            {estudiante.tutor.nombre} {estudiante.tutor.apellido}
                          </div>
                          <div className="text-xs text-[var(--admin-text-muted)]">
                            {estudiante.tutor.email}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['Quantum', 'Vertex', 'Pulsar'] as const).map((casa) => {
          const config = CASAS_CONFIG[casa];
          const count = estudiantesPorCasa[casa].length;

          return (
            <div
              key={casa}
              className="p-4 rounded-xl border"
              style={{
                backgroundColor: `${config.color}08`,
                borderColor: `${config.color}20`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{config.emoji}</span>
                <span className="text-2xl font-bold" style={{ color: config.color }}>
                  {count}
                </span>
              </div>
              <h3 className="font-semibold text-[var(--admin-text)]">Casa {casa}</h3>
              <p className="text-xs text-[var(--admin-text-muted)]">{config.descripcion}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
