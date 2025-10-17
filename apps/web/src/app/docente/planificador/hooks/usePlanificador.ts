import { useState, useEffect } from 'react';

export type ResourceType = 'plan-clase' | 'ejercicios' | 'evaluacion' | 'guia-estudio';

export interface Assignment {
  type: 'estudiante' | 'clase';
  id: string;
  name: string;
  date: string;
}

export interface SavedResource {
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

const STORAGE_KEY = 'planificador_resources';

export const usePlanificador = () => {
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [selectedResource, setSelectedResource] = useState<SavedResource | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Load saved resources from localStorage on mount
  useEffect(() => {
    const loadResources = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSavedResources(parsed);
        }
      } catch (error) {
        // Error loading resources
      }
    };

    loadResources();
  }, []);

  // Save to localStorage whenever resources change
  const saveToLocalStorage = (resources: SavedResource[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
      setSavedResources(resources);
    } catch (error) {
      // Error saving resources
    }
  };

  // Save a new resource
  const saveResource = (resource: Omit<SavedResource, 'id' | 'createdAt' | 'assignedTo' | 'tags'>) => {
    const newResource: SavedResource = {
      ...resource,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      assignedTo: [],
      tags: [],
    };

    const updated = [newResource, ...savedResources];
    saveToLocalStorage(updated);
    return newResource;
  };

  // Delete a resource
  const deleteResource = (id: string) => {
    const updated = savedResources.filter(r => r.id !== id);
    saveToLocalStorage(updated);

    if (selectedResource?.id === id) {
      setSelectedResource(null);
    }
  };

  // Assign resource to student or class
  const assignResource = (resourceId: string, assignment: Assignment) => {
    const updated = savedResources.map(r => {
      if (r.id === resourceId) {
        return {
          ...r,
          assignedTo: [...r.assignedTo, assignment],
        };
      }
      return r;
    });

    saveToLocalStorage(updated);
  };

  // Filter resources based on search and type
  const filteredResources = savedResources.filter(resource => {
    const matchesSearch =
      resource.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  return {
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
  };
};
