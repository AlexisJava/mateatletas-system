'use client';

import { motion } from 'framer-motion';
import { Search, Filter, History } from 'lucide-react';
import { SavedResource, ResourceType } from '../hooks/usePlanificador';
import { ResourceCard } from './ResourceCard';
import { resourceTemplates } from './GenerateResourceForm';

interface ResourceListProps {
  resources: SavedResource[];
  searchTerm: string;
  filterType: ResourceType | 'all';
  onSearchChange: (term: string) => void;
  onFilterChange: (type: ResourceType | 'all') => void;
  onSelectResource: (resource: SavedResource) => void;
  onAssignResource: (resource: SavedResource) => void;
  onDeleteResource: (id: string) => void;
  hasNoSavedResources: boolean;
}

export const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  searchTerm,
  filterType,
  onSearchChange,
  onFilterChange,
  onSelectResource,
  onAssignResource,
  onDeleteResource,
  hasNoSavedResources,
}) => {
  const getTemplateIcon = (type: ResourceType) => {
    const template = resourceTemplates.find(t => t.id === type);
    return template?.icon;
  };

  return (
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
                onChange={(e) => onSearchChange(e.target.value)}
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
                onChange={(e) => onFilterChange(e.target.value as ResourceType | 'all')}
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
      {resources.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <History className="w-16 h-16 mx-auto text-purple-400 dark:text-purple-600 mb-4" />
          <h3 className="text-xl font-semibold text-indigo-900 dark:text-white mb-2">
            {hasNoSavedResources ? 'No hay recursos guardados' : 'No se encontraron recursos'}
          </h3>
          <p className="text-purple-600 dark:text-purple-300">
            {hasNoSavedResources
              ? 'Los recursos que generes y guardes aparecerán aquí'
              : 'Intenta cambiar los filtros de búsqueda'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => {
            const Icon = getTemplateIcon(resource.type);

            return (
              <ResourceCard
                key={resource.id}
                resource={resource}
                icon={Icon!}
                onSelect={onSelectResource}
                onAssign={onAssignResource}
                onDelete={onDeleteResource}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
