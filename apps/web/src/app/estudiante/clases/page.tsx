'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { estudiantesApi, type ClaseEstudiante } from '@/lib/api/estudiantes.api';
import FloatingLines from '@/components/ui/FloatingLines';

import { PerfilEstudiante } from './components/PerfilEstudiante';
import { ProximaClaseHero } from './components/ProximaClaseHero';
import { CanalComunicacion } from './components/CanalComunicacion';
import { TareasActivas } from './components/TareasActivas';
import { ActividadEquipo } from './components/ActividadEquipo';

export interface Companero {
  id: string;
  nombre: string;
  apellido: string;
  puntos: number;
}

export default function ClasesPage() {
  const { user } = useAuthStore();
  const [clases, setClases] = useState<ClaseEstudiante[]>([]);
  const [companeros, setCompaneros] = useState<Companero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clasesData, companeroData] = await Promise.all([
          estudiantesApi.getMisClases(),
          estudiantesApi.getMisCompaneros().catch(() => []),
        ]);
        setClases(clasesData);
        setCompaneros(companeroData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const proximaClase = clases[0] ?? null;

  if (loading) {
    return (
      <div className="h-[calc(100vh-6rem)] bg-[#070711] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-white/40 animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] bg-[#070711] text-white relative overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <FloatingLines
          linesGradient={['#ff6b9d', '#c44cff', '#6b5bff', '#00d4ff', '#10b981']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[8, 10, 6]}
          lineDistance={[4, 6, 8]}
          animationSpeed={0.4}
          topWavePosition={{ x: 8.0, y: 0.8, rotate: -0.3 }}
          middleWavePosition={{ x: 4.0, y: 0.0, rotate: 0.15 }}
          bottomWavePosition={{ x: 2.0, y: -0.8, rotate: -0.2 }}
          interactive={false}
          parallax={false}
        />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 h-full p-6 lg:p-8 overflow-y-auto lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-w-[1800px] mx-auto">
          {/* Columna Izquierda */}
          <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
            <PerfilEstudiante user={user} />
            <TareasActivas />
          </div>

          {/* Columna Central */}
          <div className="lg:col-span-6 flex flex-col gap-6 min-h-0">
            <ProximaClaseHero clase={proximaClase} />
            <CanalComunicacion />
          </div>

          {/* Columna Derecha - Actividad del Equipo (ocupa todo el alto) */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <ActividadEquipo companeros={companeros} />
          </div>
        </div>
      </div>
    </div>
  );
}
