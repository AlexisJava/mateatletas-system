'use client';

import { motion } from 'framer-motion';
import { Sparkles, FileText, ClipboardList, BookOpen } from 'lucide-react';
import { ResourceType, ResourceTemplate } from '../hooks/useResourceGeneration';

interface GenerateResourceFormProps {
  selectedType: ResourceType | null;
  topic: string;
  grade: string;
  duration: string;
  additionalInfo: string;
  isGenerating: boolean;
  templates: ResourceTemplate[];
  onTypeSelect: (type: ResourceType) => void;
  onTopicChange: (topic: string) => void;
  onGradeChange: (grade: string) => void;
  onDurationChange: (duration: string) => void;
  onAdditionalInfoChange: (info: string) => void;
  onGenerate: () => void;
}

export const resourceTemplates: ResourceTemplate[] = [
  {
    id: 'plan-clase',
    title: 'Plan de Clase',
    description: 'Genera un plan de clase completo con objetivos, actividades y evaluación',
    icon: FileText,
    prompt: 'Crea un plan de clase completo para:',
  },
  {
    id: 'ejercicios',
    title: 'Ejercicios Prácticos',
    description: 'Genera ejercicios y problemas adaptados al nivel de tus estudiantes',
    icon: ClipboardList,
    prompt: 'Genera ejercicios prácticos sobre:',
  },
  {
    id: 'evaluacion',
    title: 'Evaluación',
    description: 'Crea pruebas, exámenes o evaluaciones con rubrics incluidas',
    icon: BookOpen,
    prompt: 'Crea una evaluación completa para:',
  },
  {
    id: 'guia-estudio',
    title: 'Guía de Estudio',
    description: 'Genera material de estudio resumido y estructurado',
    icon: FileText,
    prompt: 'Genera una guía de estudio sobre:',
  },
];

export const GenerateResourceForm: React.FC<GenerateResourceFormProps> = ({
  selectedType,
  topic,
  grade,
  duration,
  additionalInfo,
  isGenerating,
  templates = resourceTemplates,
  onTypeSelect,
  onTopicChange,
  onGradeChange,
  onDurationChange,
  onAdditionalInfoChange,
  onGenerate,
}) => {
  const handleGenerate = () => {
    if (!topic || isGenerating) return;
    onGenerate();
  };

  return (
    <>
      {/* Template Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {templates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedType === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onTypeSelect(template.id)}
              className={`glass-card p-6 text-left hover-lift transition-all ${
                isSelected
                  ? 'ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-900/30'
                  : ''
              }`}
            >
              <Icon
                className={`w-8 h-8 mb-3 ${
                  isSelected
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}
              />
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-white mb-2">
                {template.title}
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                {template.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Generation Form */}
      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-indigo-900 dark:text-white mb-4">
            Configura tu recurso
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-indigo-900 dark:text-white mb-2">
                Tema *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => onTopicChange(e.target.value)}
                placeholder="ej: Ecuaciones lineales"
                className="w-full px-4 py-2 bg-white/40 dark:bg-indigo-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-lg text-indigo-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-900 dark:text-white mb-2">
                Nivel/Grado
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => onGradeChange(e.target.value)}
                placeholder="ej: 8vo grado"
                className="w-full px-4 py-2 bg-white/40 dark:bg-indigo-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-lg text-indigo-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-900 dark:text-white mb-2">
                Duración
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => onDurationChange(e.target.value)}
                placeholder="ej: 60 minutos"
                className="w-full px-4 py-2 bg-white/40 dark:bg-indigo-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-lg text-indigo-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-indigo-900 dark:text-white mb-2">
              Información adicional (opcional)
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => onAdditionalInfoChange(e.target.value)}
              placeholder="Agrega detalles específicos, objetivos particulares, o cualquier información relevante..."
              rows={3}
              className="w-full px-4 py-2 bg-white/40 dark:bg-indigo-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-lg text-indigo-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic || isGenerating}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generar Recurso
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Empty State */}
      {!selectedType && (
        <div className="glass-card p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto text-purple-400 dark:text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold text-indigo-900 dark:text-white mb-2">
            Selecciona un tipo de recurso
          </h3>
          <p className="text-purple-600 dark:text-purple-300">
            Elige una de las opciones arriba para comenzar a generar contenido educativo
          </p>
        </div>
      )}
    </>
  );
};
