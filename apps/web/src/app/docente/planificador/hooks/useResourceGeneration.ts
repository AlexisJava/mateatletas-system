import { useState } from 'react';
import { type ResourceType } from './usePlanificador';

export type { ResourceType };

export interface ResourceTemplate {
  id: ResourceType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
}

interface GenerateResourceParams {
  type: ResourceType;
  topic: string;
  grade: string;
  duration: string;
  additionalInfo: string;
}

export const useResourceGeneration = () => {
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [duration, setDuration] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Mock content generation function
  const generateMockContent = (params: GenerateResourceParams): string => {
    const { type, topic, grade, duration, additionalInfo } = params;

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

${additionalInfo ? `\n## Notas Adicionales\n${additionalInfo}` : ''}`,

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

${additionalInfo ? `\n## Notas para el docente\n${additionalInfo}` : ''}`,

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

${additionalInfo ? `\n## Criterios adicionales\n${additionalInfo}` : ''}`,

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

${additionalInfo ? `\n## Recursos adicionales\n${additionalInfo}` : ''}`,
    };

    return templates[type];
  };

  // Generate resource content
  const handleGenerate = async (): Promise<void> => {
    if (!selectedType || !topic) return;

    setIsGenerating(true);

    // Simulate AI generation with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = generateMockContent({
          type: selectedType,
          topic,
          grade,
          duration,
          additionalInfo,
        });
        setGeneratedContent(content);
        setIsGenerating(false);
        resolve();
      }, 2000);
    });
  };

  // Copy content to clipboard
  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download content as markdown file
  const handleDownload = () => {
    if (!generatedContent || !selectedType || !topic) return;

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

  // Reset form to initial state
  const resetForm = () => {
    setGeneratedContent('');
    setTopic('');
    setGrade('');
    setDuration('');
    setAdditionalInfo('');
    setSelectedType(null);
  };

  return {
    selectedType,
    setSelectedType,
    topic,
    setTopic,
    grade,
    setGrade,
    duration,
    setDuration,
    additionalInfo,
    setAdditionalInfo,
    isGenerating,
    generatedContent,
    copied,
    handleGenerate,
    handleCopy,
    handleDownload,
    resetForm,
  };
};
