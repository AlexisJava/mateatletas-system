'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, BookOpen, ClipboardList, Download, Copy, Check, History, Users, Calendar, Tag, Search, Filter, X, Edit2, Trash2 } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

type ResourceType = 'plan-clase' | 'ejercicios' | 'evaluacion' | 'guia-estudio';

interface ResourceTemplate {
  id: ResourceType;
  title: string;
  description: string;
  icon: any;
  prompt: string;
}

interface SavedResource {
  id: string;
  type: ResourceType;
  title: string;
  topic: string;
  grade: string;
  duration: string;
  content: string;
  createdAt: string;
  assignedTo: Assignment[];
  tags: string[];
}

interface Assignment {
  type: 'estudiante' | 'clase';
  id: string;
  name: string;
  date: string;
}

const resourceTemplates: ResourceTemplate[] = [
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

export default function PlanificadorAIPage() {
  // Tabs
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  // Generate form state
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [duration, setDuration] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  // History state
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [selectedResource, setSelectedResource] = useState<SavedResource | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Load saved resources from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('planificador_resources');
    if (saved) {
      try {
        setSavedResources(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved resources:', error);
      }
    }
  }, []);

  // Save to localStorage whenever resources change
  const saveToLocalStorage = (resources: SavedResource[]) => {
    localStorage.setItem('planificador_resources', JSON.stringify(resources));
    setSavedResources(resources);
  };

  const handleGenerate = async () => {
    if (!selectedType || !topic) return;

    setIsGenerating(true);

    // Simular generación con IA
    setTimeout(() => {
      const template = resourceTemplates.find(t => t.id === selectedType);
      const mockContent = generateMockContent(selectedType, topic, grade, duration, additionalInfo);
      setGeneratedContent(mockContent);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSaveResource = () => {
    if (!generatedContent || !selectedType || !topic) return;

    const template = resourceTemplates.find(t => t.id === selectedType);
    const newResource: SavedResource = {
      id: Date.now().toString(),
      type: selectedType,
      title: template?.title || '',
      topic,
      grade: grade || 'No especificado',
      duration: duration || 'No especificado',
      content: generatedContent,
      createdAt: new Date().toISOString(),
      assignedTo: [],
      tags: [],
    };

    const updated = [newResource, ...savedResources];
    saveToLocalStorage(updated);

    // Reset form
    setGeneratedContent('');
    setTopic('');
    setGrade('');
    setDuration('');
    setAdditionalInfo('');
    setSelectedType(null);

    // Switch to history tab
    setActiveTab('history');
  };

  const handleDeleteResource = (id: string) => {
    const updated = savedResources.filter(r => r.id !== id);
    saveToLocalStorage(updated);
    if (selectedResource?.id === id) {
      setSelectedResource(null);
    }
  };

  const handleAssignResource = (resource: SavedResource, assignment: Assignment) => {
    const updated = savedResources.map(r => {
      if (r.id === resource.id) {
        return {
          ...r,
          assignedTo: [...r.assignedTo, assignment],
        };
      }
      return r;
    });
    saveToLocalStorage(updated);
  };

  // Filter resources
  const filteredResources = savedResources.filter(resource => {
    const matchesSearch = resource.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  const generateMockContent = (type: ResourceType, topic: string, grade: string, duration: string, info: string) => {
    const templates: Record<ResourceType, string> = {
      'plan-clase': `# Plan de Clase: ${topic}

## Información General
- **Nivel**: ${grade || 'Por especificar'}
- **Duración**: ${duration || '60 minutos'}
- **Tema**: ${topic}

## Objetivos de Aprendizaje
1. Comprender los conceptos fundamentales de ${topic}
2. Aplicar los conocimientos en ejercicios prácticos
3. Desarrollar habilidades de resolución de problemas

## Materiales Necesarios
- Pizarra y marcadores
- Hojas de ejercicios
- Material manipulable (opcional)

## Desarrollo de la Clase

### Inicio (10 min)
- Actividad de motivación sobre ${topic}
- Exploración de conocimientos previos
- Presentación de objetivos

### Desarrollo (40 min)
- Explicación teórica con ejemplos
- Práctica guiada con ejercicios
- Trabajo en grupos pequeños

### Cierre (10 min)
- Síntesis de lo aprendido
- Resolución de dudas
- Tarea para la casa

## Evaluación
- Participación en clase
- Ejercicios prácticos
- Comprensión de conceptos clave

${info ? `\n## Notas Adicionales\n${info}` : ''}`,

      'ejercicios': `# Ejercicios Prácticos: ${topic}

## Nivel: ${grade || 'Por especificar'}

### Ejercicio 1: Conceptos Básicos
**Instrucciones**: Resuelve los siguientes problemas aplicando los conceptos de ${topic}.

1. [Pregunta básica relacionada con ${topic}]
2. [Pregunta intermedia]
3. [Pregunta con aplicación práctica]

### Ejercicio 2: Aplicación
**Situación**: [Contexto real relacionado con ${topic}]

Preguntas:
a) [Análisis de la situación]
b) [Resolución del problema]
c) [Justificación de la respuesta]

### Ejercicio 3: Desafío
[Problema complejo que integra múltiples conceptos de ${topic}]

### Respuestas
1. [Respuesta 1]
2. [Respuesta 2]
3. [Respuesta 3]

${info ? `\n## Notas para el docente\n${info}` : ''}`,

      'evaluacion': `# Evaluación: ${topic}

## Información
- **Nivel**: ${grade || 'Por especificar'}
- **Duración**: ${duration || '45 minutos'}
- **Puntaje Total**: 100 puntos

## Sección 1: Conceptos (30 puntos)
1. Define los siguientes conceptos relacionados con ${topic}:
   a) [Concepto 1] (10 pts)
   b) [Concepto 2] (10 pts)
   c) [Concepto 3] (10 pts)

## Sección 2: Aplicación (40 puntos)
2. Resuelve los siguientes problemas:
   a) [Problema 1] (20 pts)
   b) [Problema 2] (20 pts)

## Sección 3: Análisis (30 puntos)
3. [Pregunta de análisis que requiere pensamiento crítico sobre ${topic}]

## Rúbrica de Evaluación
- **Excelente (90-100)**: Comprensión profunda y aplicación correcta
- **Bueno (75-89)**: Comprensión sólida con errores menores
- **Suficiente (60-74)**: Comprensión básica
- **Insuficiente (<60)**: Dificultades en conceptos fundamentales

${info ? `\n## Criterios adicionales\n${info}` : ''}`,

      'guia-estudio': `# Guía de Estudio: ${topic}

## Nivel: ${grade || 'Por especificar'}

## 📚 Conceptos Clave

### 1. Introducción a ${topic}
[Explicación clara y concisa del concepto principal]

### 2. Fundamentos
- **Concepto A**: [Definición y explicación]
- **Concepto B**: [Definición y explicación]
- **Concepto C**: [Definición y explicación]

## 🎯 Puntos Importantes para Recordar
1. [Punto clave 1]
2. [Punto clave 2]
3. [Punto clave 3]
4. [Punto clave 4]

## 💡 Ejemplos Prácticos

### Ejemplo 1
[Problema o situación]
**Solución**: [Paso a paso]

### Ejemplo 2
[Problema o situación]
**Solución**: [Paso a paso]

## 📝 Preguntas de Autoevaluación
1. [Pregunta 1]
2. [Pregunta 2]
3. [Pregunta 3]

**Respuestas**: [Al final de la guía]

## 🔗 Conexiones con Otros Temas
- Relación con [Tema A]
- Aplicaciones en [Tema B]

${info ? `\n## Recursos adicionales\n${info}` : ''}`,
    };

    return templates[type];
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}-${topic.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div {...fadeIn}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h1 className="text-3xl font-bold text-indigo-900 dark:text-white">Planificador AI</h1>
              </div>
              <p className="text-purple-600 dark:text-purple-300">
                Genera recursos educativos personalizados con inteligencia artificial
              </p>
            </div>
            {savedResources.length > 0 && (
              <div className="glass-card px-4 py-2">
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  <strong className="text-indigo-900 dark:text-white">{savedResources.length}</strong> recursos guardados
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'generate'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40'
                  : 'glass-card text-indigo-900 dark:text-white hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Generar Nuevo
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40'
                  : 'glass-card text-indigo-900 dark:text-white hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
              }`}
            >
              <History className="w-5 h-5" />
              Historial
              {savedResources.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  {savedResources.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Generate Tab Content */}
        {activeTab === 'generate' && (
          <>
            {/* Template Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {resourceTemplates.map((template) => {
            const Icon = template.icon;
            const isSelected = selectedType === template.id;

            return (
              <button
                key={template.id}
                onClick={() => setSelectedType(template.id)}
                className={`glass-card p-6 text-left hover-lift transition-all ${
                  isSelected
                    ? 'ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-900/30'
                    : ''
                }`}
              >
                <Icon
                  className={`w-8 h-8 mb-3 ${
                    isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-600 dark:text-indigo-400'
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
                  onChange={(e) => setTopic(e.target.value)}
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
                  onChange={(e) => setGrade(e.target.value)}
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
                  onChange={(e) => setDuration(e.target.value)}
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
                onChange={(e) => setAdditionalInfo(e.target.value)}
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

        {/* Generated Content */}
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-strong p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-indigo-900 dark:text-white">
                Recurso Generado
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveResource}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Guardar
                </button>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors flex items-center gap-2 text-indigo-900 dark:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>

            <div className="bg-white/40 dark:bg-indigo-950/40 rounded-lg p-6 border border-purple-200/30 dark:border-purple-700/30 max-h-[600px] overflow-y-auto">
              <pre className="text-sm text-indigo-900 dark:text-white whitespace-pre-wrap font-mono">
                {generatedContent}
              </pre>
            </div>

            <div className="mt-4 p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                <Sparkles className="w-4 h-4 inline mr-2" />
                <strong>Nota:</strong> Este contenido ha sido generado automáticamente. Te recomendamos revisarlo y
                adaptarlo según las necesidades específicas de tus estudiantes.
              </p>
            </div>
          </motion.div>
        )}

            {/* Empty State */}
            {!selectedType && !generatedContent && (
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
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filters and Search */}
            <div className="glass-card-strong p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-indigo-900 dark:text-white mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por tema o título..."
                      className="w-full pl-10 pr-4 py-2 bg-white/40 dark:bg-indigo-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-lg text-indigo-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Filter by type */}
                <div>
                  <label className="block text-sm font-medium text-indigo-900 dark:text-white mb-2">
                    Tipo de recurso
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as ResourceType | 'all')}
                      className="w-full pl-10 pr-4 py-2 bg-white/40 dark:bg-indigo-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-lg text-indigo-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">Todos los tipos</option>
                      {resourceTemplates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <History className="w-16 h-16 mx-auto text-purple-400 dark:text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-indigo-900 dark:text-white mb-2">
                  {savedResources.length === 0 ? 'No hay recursos guardados' : 'No se encontraron recursos'}
                </h3>
                <p className="text-purple-600 dark:text-purple-300">
                  {savedResources.length === 0
                    ? 'Los recursos que generes y guardes aparecerán aquí'
                    : 'Intenta cambiar los filtros de búsqueda'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource) => {
                  const template = resourceTemplates.find(t => t.id === resource.type);
                  const Icon = template?.icon || FileText;

                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card p-6 hover-lift cursor-pointer"
                      onClick={() => setSelectedResource(resource)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-indigo-900 dark:text-white">
                              {resource.title}
                            </h3>
                            <p className="text-xs text-purple-600 dark:text-purple-300">
                              {new Date(resource.createdAt).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-indigo-900 dark:text-white mb-1">
                          {resource.topic}
                        </p>
                        <div className="flex gap-2 text-xs text-purple-600 dark:text-purple-300">
                          <span>📚 {resource.grade}</span>
                          <span>•</span>
                          <span>⏱️ {resource.duration}</span>
                        </div>
                      </div>

                      {/* Assignments */}
                      {resource.assignedTo.length > 0 && (
                        <div className="mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-500" />
                          <span className="text-xs text-purple-600 dark:text-purple-300">
                            Asignado a {resource.assignedTo.length} {resource.assignedTo.length === 1 ? 'estudiante' : 'estudiantes'}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-purple-200/30 dark:border-purple-700/30">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResource(resource);
                            setShowAssignModal(true);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white"
                        >
                          Asignar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('¿Eliminar este recurso?')) {
                              handleDeleteResource(resource.id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs glass-card hover:bg-red-100/60 dark:hover:bg-red-900/40 rounded-lg transition-colors text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Resource Detail Modal */}
        <AnimatePresence>
          {selectedResource && !showAssignModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedResource(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card-strong p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-indigo-900 dark:text-white mb-2">
                      {selectedResource.title}
                    </h2>
                    <p className="text-lg text-purple-600 dark:text-purple-300">
                      {selectedResource.topic}
                    </p>
                    <div className="flex gap-3 mt-2 text-sm text-purple-600 dark:text-purple-300">
                      <span>📚 {selectedResource.grade}</span>
                      <span>⏱️ {selectedResource.duration}</span>
                      <span>📅 {new Date(selectedResource.createdAt).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedResource(null)}
                    className="p-2 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-indigo-900 dark:text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="bg-white/40 dark:bg-indigo-950/40 rounded-lg p-6 border border-purple-200/30 dark:border-purple-700/30 mb-6 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-indigo-900 dark:text-white whitespace-pre-wrap font-mono">
                    {selectedResource.content}
                  </pre>
                </div>

                {/* Assignments */}
                {selectedResource.assignedTo.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-indigo-900 dark:text-white mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Asignaciones
                    </h3>
                    <div className="space-y-2">
                      {selectedResource.assignedTo.map((assignment, idx) => (
                        <div
                          key={idx}
                          className="glass-card p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              assignment.type === 'estudiante'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-purple-100 text-purple-600'
                            }`}>
                              {assignment.type === 'estudiante' ? '👤' : '👥'}
                            </div>
                            <div>
                              <p className="font-medium text-indigo-900 dark:text-white">
                                {assignment.name}
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-300">
                                {assignment.type === 'estudiante' ? 'Estudiante' : 'Clase'}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-purple-600 dark:text-purple-300">
                            {new Date(assignment.date).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedResource.content);
                      alert('Contenido copiado al portapapeles');
                    }}
                    className="flex-1 px-4 py-2 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([selectedResource.content], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedResource.type}-${selectedResource.topic.replace(/\s+/g, '-')}.md`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 px-4 py-2 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Asignar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assignment Modal (Simplified - can be enhanced later) */}
        <AnimatePresence>
          {showAssignModal && selectedResource && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={() => setShowAssignModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card-strong p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-indigo-900 dark:text-white mb-4">
                  Asignar Recurso
                </h3>
                <p className="text-purple-600 dark:text-purple-300 mb-6">
                  Esta funcionalidad permite asignar este recurso a estudiantes o clases. Por ahora, esto es una demostración visual.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      handleAssignResource(selectedResource, {
                        type: 'estudiante',
                        id: 'demo-1',
                        name: 'Estudiante Demo',
                        date: new Date().toISOString(),
                      });
                      setShowAssignModal(false);
                      setSelectedResource(null);
                      alert('✅ Recurso asignado correctamente (demo)');
                    }}
                    className="w-full px-4 py-3 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      👤
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Asignar a un estudiante</p>
                      <p className="text-xs text-purple-600 dark:text-purple-300">Enviar recurso individual</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleAssignResource(selectedResource, {
                        type: 'clase',
                        id: 'demo-2',
                        name: 'Clase Demo',
                        date: new Date().toISOString(),
                      });
                      setShowAssignModal(false);
                      setSelectedResource(null);
                      alert('✅ Recurso asignado a clase (demo)');
                    }}
                    className="w-full px-4 py-3 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      👥
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Asignar a una clase</p>
                      <p className="text-xs text-purple-600 dark:text-purple-300">Enviar a toda la clase</p>
                    </div>
                  </button>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="w-full mt-4 px-4 py-2 glass-card hover:bg-purple-100/60 dark:hover:bg-purple-900/40 rounded-lg transition-colors text-indigo-900 dark:text-white"
                >
                  Cancelar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
