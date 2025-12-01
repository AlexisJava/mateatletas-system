'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Upload,
  FileJson,
  Check,
  Clock,
  Play,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

type EstadoCurso = 'DRAFT' | 'EN_PROGRESO' | 'EN_REVISION' | 'PUBLICADO';
type EstadoSemana = 'VACIA' | 'EN_PROGRESO' | 'COMPLETA';
type Categoria = 'EXPERIENCIA' | 'CURRICULAR';
type Mundo = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
type Casa = 'QUANTUM' | 'VERTEX' | 'PULSAR';
type Tier = 'ARCADE' | 'ARCADE_PLUS' | 'PRO';

interface SemanaResumen {
  id: string;
  numero: number;
  nombre: string | null;
  estado: EstadoSemana;
}

interface CursoCompleto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  mundo: Mundo;
  casa: Casa;
  tierMinimo: Tier;
  tipoExperiencia: string | null;
  materia: string | null;
  esteticaBase: string;
  esteticaVariante: string | null;
  cantidadSemanas: number;
  actividadesPorSemana: number;
  estado: EstadoCurso;
  semanas: SemanaResumen[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const ESTADO_CURSO_CONFIG: Record<EstadoCurso, { label: string; color: string; bgColor: string }> =
  {
    DRAFT: { label: 'Borrador', color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
    EN_PROGRESO: { label: 'En Progreso', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    EN_REVISION: { label: 'En Revisión', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    PUBLICADO: { label: 'Publicado', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  };

const ESTADO_SEMANA_CONFIG: Record<
  EstadoSemana,
  { label: string; icon: typeof Clock; color: string; bgColor: string; borderColor: string }
> = {
  VACIA: {
    label: 'Vacía',
    icon: Clock,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
  },
  EN_PROGRESO: {
    label: 'En Progreso',
    icon: Play,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  COMPLETA: {
    label: 'Completa',
    icon: Check,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
};

const CASA_CONFIG: Record<Casa, { emoji: string; color: string; gradient: string }> = {
  QUANTUM: { emoji: '⚛️', color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
  VERTEX: { emoji: '🔷', color: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
  PULSAR: { emoji: '💫', color: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
};

const MUNDO_CONFIG: Record<Mundo, { emoji: string; label: string; color: string }> = {
  MATEMATICA: { emoji: '🔢', label: 'Matemática', color: 'text-orange-400' },
  PROGRAMACION: { emoji: '💻', label: 'Programación', color: 'text-cyan-400' },
  CIENCIAS: { emoji: '🔬', label: 'Ciencias', color: 'text-green-400' },
};

const TIER_CONFIG: Record<Tier, { emoji: string; label: string; color: string }> = {
  ARCADE: { emoji: '🎮', label: 'Arcade', color: 'text-emerald-400' },
  ARCADE_PLUS: { emoji: '🚀', label: 'Arcade+', color: 'text-blue-400' },
  PRO: { emoji: '👑', label: 'Pro', color: 'text-purple-400' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════════════════════

function Sidebar({ curso }: { curso: CursoCompleto }) {
  const casaConfig = CASA_CONFIG[curso.casa];
  const mundoConfig = MUNDO_CONFIG[curso.mundo];
  const tierConfig = TIER_CONFIG[curso.tierMinimo];
  const estadoConfig = ESTADO_CURSO_CONFIG[curso.estado];

  const semanasCompletas = curso.semanas.filter((s) => s.estado === 'COMPLETA').length;
  const progreso = Math.round((semanasCompletas / curso.cantidadSemanas) * 100);

  return (
    <div className="w-72 flex-shrink-0 flex flex-col gap-4">
      {/* Estado del curso */}
      <div className={`p-3 rounded-xl ${estadoConfig.bgColor} border border-white/10`}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50 font-medium">Estado</span>
          <span className={`text-sm font-bold ${estadoConfig.color}`}>{estadoConfig.label}</span>
        </div>
      </div>

      {/* Info básica */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          Información
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Casa</span>
            <div className="flex items-center gap-1.5">
              <span>{casaConfig.emoji}</span>
              <span className={`text-sm font-medium ${casaConfig.color}`}>{curso.casa}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Mundo</span>
            <div className="flex items-center gap-1.5">
              <span>{mundoConfig.emoji}</span>
              <span className={`text-sm font-medium ${mundoConfig.color}`}>
                {mundoConfig.label}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Tier Mínimo</span>
            <div className="flex items-center gap-1.5">
              <span>{tierConfig.emoji}</span>
              <span className={`text-sm font-medium ${tierConfig.color}`}>{tierConfig.label}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Categoría</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${curso.categoria === 'EXPERIENCIA' ? 'bg-orange-500/20 text-orange-400' : 'bg-violet-500/20 text-violet-400'}`}
            >
              {curso.categoria === 'EXPERIENCIA' ? 'Experiencia' : 'Curricular'}
            </span>
          </div>

          {curso.tipoExperiencia && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Tipo</span>
              <span className="text-sm text-white/70">{curso.tipoExperiencia}</span>
            </div>
          )}

          {curso.materia && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Materia</span>
              <span className="text-sm text-white/70">{curso.materia.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Estética */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Estética</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Base</span>
            <span className="text-sm text-white/70">{curso.esteticaBase}</span>
          </div>
          {curso.esteticaVariante && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Variante</span>
              <span className="text-sm text-white/70">{curso.esteticaVariante}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progreso */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Progreso</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Semanas</span>
            <span className="text-sm text-white/70">
              {semanasCompletas}/{curso.cantidadSemanas}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Actividades/Sem</span>
            <span className="text-sm text-white/70">{curso.actividadesPorSemana}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${casaConfig.gradient} transition-all duration-500`}
              style={{ width: `${progreso}%` }}
            />
          </div>
          <p className="text-xs text-white/40 text-center">{progreso}% completado</p>
        </div>
      </div>
    </div>
  );
}

function SemanaCard({
  semana,
  isExpanded,
  onToggle,
  actividadesPorSemana,
  cursoId,
  onSaveSuccess,
}: {
  semana: SemanaResumen;
  isExpanded: boolean;
  onToggle: () => void;
  actividadesPorSemana: number;
  cursoId: string;
  onSaveSuccess: () => void;
}) {
  const config = ESTADO_SEMANA_CONFIG[semana.estado];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} overflow-hidden`}>
      {/* Header clickeable */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-lg ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}
          >
            <span className="text-lg font-bold text-white">{semana.numero}</span>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-white">
              {semana.nombre || `Semana ${semana.numero}`}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Icon className={`w-3 h-3 ${config.color}`} />
              <span className={`text-xs ${config.color}`}>{config.label}</span>
              <span className="text-white/20">•</span>
              <span className="text-xs text-white/40">{actividadesPorSemana} actividades</span>
            </div>
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </button>

      {/* Contenido expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 border-t border-white/5">
              <div className="pt-4">
                {semana.estado === 'VACIA' ? (
                  <JsonUploadZone
                    semanaId={semana.id}
                    semanaNumero={semana.numero}
                    cursoId={cursoId}
                    onSaveSuccess={onSaveSuccess}
                  />
                ) : (
                  <SemanaPreview semanaId={semana.id} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function JsonUploadZone({
  semanaId,
  semanaNumero,
  cursoId,
  onSaveSuccess,
}: {
  semanaId: string;
  semanaNumero: number;
  cursoId: string;
  onSaveSuccess: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [showTextarea, setShowTextarea] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      const text = await file.text();
      setJsonContent(text);
      setShowTextarea(true);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      setJsonContent(text);
      setShowTextarea(true);
    }
  };

  return (
    <div className="space-y-4">
      {!showTextarea ? (
        <>
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all
              ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-white/20 hover:border-white/30'}
            `}
          >
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload
              className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-orange-400' : 'text-white/30'}`}
            />
            <p className="text-sm text-white/60 mb-1">
              Arrastrá el JSON de la Semana {semanaNumero} aquí
            </p>
            <p className="text-xs text-white/40">o hacé click para seleccionar archivo</p>
          </div>

          {/* Botón para pegar manualmente */}
          <button
            onClick={() => setShowTextarea(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            <FileJson className="w-4 h-4" />
            Pegar JSON manualmente
          </button>
        </>
      ) : (
        <JsonEditor
          semanaId={semanaId}
          semanaNumero={semanaNumero}
          cursoId={cursoId}
          initialContent={jsonContent}
          onCancel={() => {
            setShowTextarea(false);
            setJsonContent('');
          }}
          onSaveSuccess={onSaveSuccess}
        />
      )}
    </div>
  );
}

function JsonEditor({
  semanaId,
  semanaNumero,
  cursoId,
  initialContent,
  onCancel,
  onSaveSuccess,
}: {
  semanaId: string;
  semanaNumero: number;
  cursoId: string;
  initialContent: string;
  onCancel: () => void;
  onSaveSuccess: () => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);

  const validateJson = () => {
    setIsValidating(true);
    setValidationResult(null);
    setSaveError(null);

    try {
      const parsed = JSON.parse(content);

      const errors: string[] = [];

      // Validaciones básicas de estructura
      if (!parsed.nombre) errors.push('Falta el campo "nombre"');
      if (!parsed.descripcion) errors.push('Falta el campo "descripcion"');
      if (!Array.isArray(parsed.actividades)) errors.push('Falta el array "actividades"');
      if (!Array.isArray(parsed.objetivosAprendizaje))
        errors.push('Falta el array "objetivosAprendizaje"');

      // Validar actividades
      if (parsed.actividades) {
        parsed.actividades.forEach((act: Record<string, unknown>, i: number) => {
          if (!act.nombre) errors.push(`Actividad ${i + 1}: falta "nombre"`);
          if (!Array.isArray(act.bloques)) errors.push(`Actividad ${i + 1}: falta array "bloques"`);
          if (Array.isArray(act.bloques)) {
            (act.bloques as Record<string, unknown>[]).forEach(
              (bloque: Record<string, unknown>, j: number) => {
                if (!bloque.componente)
                  errors.push(`Actividad ${i + 1}, Bloque ${j + 1}: falta "componente"`);
              },
            );
          }
        });
      }

      setValidationResult({
        valid: errors.length === 0,
        errors,
      });
    } catch {
      setValidationResult({
        valid: false,
        errors: ['JSON inválido: error de sintaxis'],
      });
    }

    setIsValidating(false);
  };

  const handleSave = async () => {
    if (!validationResult?.valid || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const contenido = JSON.parse(content);
      await apiClient.put(`/studio/cursos/${cursoId}/semanas/${semanaNumero}`, { contenido });
      onSaveSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al guardar la semana. Intentá de nuevo.';
      setSaveError(errorMessage);
      console.error('Error guardando semana:', semanaId, err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">JSON de Semana {semanaNumero}</h4>
        <button onClick={onCancel} className="text-xs text-white/40 hover:text-white/60">
          Cancelar
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setValidationResult(null);
        }}
        placeholder='{"nombre": "...", "actividades": [...]}'
        className="w-full h-64 p-4 bg-black/30 border border-white/10 rounded-lg text-sm text-white/80 font-mono resize-none focus:outline-none focus:border-orange-500/50"
      />

      {/* Resultado de validación */}
      {validationResult && (
        <div
          className={`p-3 rounded-lg ${validationResult.valid ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}
        >
          {validationResult.valid ? (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">JSON válido</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">
                  {validationResult.errors.length} error(es)
                </span>
              </div>
              <ul className="text-xs text-red-300/80 space-y-1 ml-6">
                {validationResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
                {validationResult.errors.length > 5 && (
                  <li className="text-red-300/60">
                    ... y {validationResult.errors.length - 5} más
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error de guardado */}
      {saveError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{saveError}</span>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center gap-3">
        <button
          onClick={validateJson}
          disabled={!content.trim() || isValidating || isSaving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 transition-colors"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileJson className="w-4 h-4" />
          )}
          Validar
        </button>
        <button
          onClick={handleSave}
          disabled={!validationResult?.valid || isSaving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isSaving ? 'Guardando...' : 'Guardar Semana'}
        </button>
      </div>
    </div>
  );
}

function SemanaPreview({ semanaId }: { semanaId: string }) {
  // TODO: Fetch semana completa y mostrar preview
  return (
    <div className="p-4 bg-white/[0.02] rounded-lg border border-white/5">
      <div className="flex items-center gap-2 text-white/40">
        <ChevronRight className="w-4 h-4" />
        <span className="text-sm">Preview del contenido (próximamente)</span>
      </div>
      <p className="text-xs text-white/30 mt-2">ID: {semanaId}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function CursoEditorPage() {
  const params = useParams();
  const router = useRouter();
  const cursoId = params.cursoId as string;

  const [curso, setCurso] = useState<CursoCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSemana, setExpandedSemana] = useState<number | null>(null);

  const fetchCurso = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.get<CursoCompleto>(`/studio/cursos/${cursoId}`);
      setCurso(data);

      // Expandir primera semana vacía por defecto
      const primeraVacia = data.semanas.find((s) => s.estado === 'VACIA');
      if (primeraVacia) {
        setExpandedSemana(primeraVacia.numero);
      }
    } catch {
      setError('Error al cargar el curso');
    } finally {
      setIsLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    fetchCurso();
  }, [fetchCurso]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-white/50">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-400 mb-4">{error || 'Curso no encontrado'}</p>
          <button
            onClick={() => router.push('/admin/studio')}
            className="text-sm text-white/60 hover:text-white"
          >
            Volver a Studio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/studio"
          className="p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-white">{curso.nombre}</h1>
          </div>
          <p className="text-sm text-white/50 mt-0.5 line-clamp-1">{curso.descripcion}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar */}
        <Sidebar curso={curso} />

        {/* Semanas */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {curso.semanas.map((semana) => (
              <SemanaCard
                key={semana.id}
                semana={semana}
                isExpanded={expandedSemana === semana.numero}
                onToggle={() =>
                  setExpandedSemana(expandedSemana === semana.numero ? null : semana.numero)
                }
                actividadesPorSemana={curso.actividadesPorSemana}
                cursoId={cursoId}
                onSaveSuccess={fetchCurso}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
