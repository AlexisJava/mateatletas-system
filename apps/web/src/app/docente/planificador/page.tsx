'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, History } from 'lucide-react';
import { usePlanificador } from './hooks/usePlanificador';
import { useResourceGeneration } from './hooks/useResourceGeneration';
import { GenerateResourceForm, resourceTemplates } from './components/GenerateResourceForm';
import { GeneratedContentDisplay } from './components/GeneratedContentDisplay';
import { ResourceList } from './components/ResourceList';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { AssignResourceModal } from './components/AssignResourceModal';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function PlanificadorAIPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  // State management hooks
  const {
    savedResources,
    filteredResources,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedResource,
    setSelectedResource,
    showAssignModal,
    setShowAssignModal,
    saveResource,
    deleteResource,
    assignResource,
  } = usePlanificador();

  // Resource generation hooks
  const {
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
  } = useResourceGeneration();

  // Get current template based on selectedType
  const template = selectedType
    ? resourceTemplates.find((t) => t.id === selectedType)
    : null;

  // Handle saving generated resource
  const handleSaveResource = () => {
    if (!generatedContent || !selectedType || !topic) return;

    saveResource({
      type: selectedType,
      title: template?.title || '',
      topic,
      grade: grade || 'No especificado',
      duration: duration || 'No especificado',
      content: generatedContent,
    });

    resetForm();
    setActiveTab('history');
  };

  // Handle opening assign modal
  const handleOpenAssignModal = (resource: typeof selectedResource) => {
    setSelectedResource(resource);
    setShowAssignModal(true);
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
                <h1 className="text-3xl font-bold text-indigo-900 dark:text-white">
                  Planificador AI
                </h1>
              </div>
              <p className="text-purple-600 dark:text-purple-300">
                Genera recursos educativos personalizados con inteligencia artificial
              </p>
            </div>
            {savedResources.length > 0 && (
              <div className="glass-card px-4 py-2">
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  <strong className="text-indigo-900 dark:text-white">
                    {savedResources.length}
                  </strong>{' '}
                  recursos guardados
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
            <GenerateResourceForm
              selectedType={selectedType}
              topic={topic}
              grade={grade}
              duration={duration}
              additionalInfo={additionalInfo}
              isGenerating={isGenerating}
              templates={resourceTemplates}
              onTypeSelect={setSelectedType}
              onTopicChange={setTopic}
              onGradeChange={setGrade}
              onDurationChange={setDuration}
              onAdditionalInfoChange={setAdditionalInfo}
              onGenerate={handleGenerate}
            />

            {/* Generated Content */}
            {generatedContent && (
              <GeneratedContentDisplay
                content={generatedContent}
                copied={copied}
                onSave={handleSaveResource}
                onCopy={handleCopy}
                onDownload={handleDownload}
              />
            )}
          </>
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
          <ResourceList
            resources={filteredResources}
            searchTerm={searchTerm}
            filterType={filterType}
            onSearchChange={setSearchTerm}
            onFilterChange={setFilterType}
            onSelectResource={setSelectedResource}
            onAssignResource={handleOpenAssignModal}
            onDeleteResource={deleteResource}
            hasNoSavedResources={savedResources.length === 0}
          />
        )}

        {/* Resource Detail Modal */}
        <ResourceDetailModal
          resource={selectedResource}
          isOpen={!!selectedResource && !showAssignModal}
          onClose={() => setSelectedResource(null)}
          onAssign={() => setShowAssignModal(true)}
        />

        {/* Assignment Modal */}
        <AssignResourceModal
          resource={selectedResource}
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedResource(null);
          }}
          onAssign={(assignment: Parameters<typeof assignResource>[1]) => {
            if (selectedResource) {
              assignResource(selectedResource.id, assignment);
            }
          }}
        />
      </motion.div>
    </div>
  );
}
