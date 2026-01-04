'use client';

import React, { useState } from 'react';
import {
  Search,
  FileText,
  Video,
  Code,
  Link as LinkIcon,
  Download,
  Plus,
  MoreVertical,
  Clock,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'code' | 'link';
  subject: string;
  size?: string;
  date: string;
  downloads: number;
  tags: string[];
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Guía Completa de Flexbox',
    type: 'pdf',
    subject: 'CSS',
    size: '2.4 MB',
    date: 'Hace 2 días',
    downloads: 145,
    tags: ['Frontend', 'CSS'],
  },
  {
    id: '2',
    title: 'Grabación: React Context API',
    type: 'video',
    subject: 'React',
    size: '1.2 GB',
    date: 'Hace 5 días',
    downloads: 89,
    tags: ['React', 'Hooks'],
  },
  {
    id: '3',
    title: 'Starter Kit: Next.js + Tailwind',
    type: 'code',
    subject: 'Fullstack',
    size: '450 KB',
    date: 'Hace 1 semana',
    downloads: 312,
    tags: ['Template', 'NextJS'],
  },
  {
    id: '4',
    title: 'Figma: UI Kit para Estudiantes',
    type: 'link',
    subject: 'Diseño UI',
    date: 'Hace 2 semanas',
    downloads: 567,
    tags: ['Design', 'Figma'],
  },
  {
    id: '5',
    title: 'Ejercicios de Lógica JS',
    type: 'code',
    subject: 'JavaScript',
    size: '12 KB',
    date: 'Hace 3 días',
    downloads: 98,
    tags: ['Algoritmos', 'JS'],
  },
  {
    id: '6',
    title: 'Cheatsheet: Git Commands',
    type: 'pdf',
    subject: 'Herramientas',
    size: '1.1 MB',
    date: 'Ayer',
    downloads: 204,
    tags: ['Git', 'DevOps'],
  },
  {
    id: '7',
    title: 'Workshop: Animaciones CSS',
    type: 'video',
    subject: 'CSS',
    size: '890 MB',
    date: 'Hace 1 mes',
    downloads: 76,
    tags: ['CSS', 'Animation'],
  },
  {
    id: '8',
    title: 'API Reference: Auth Middleware',
    type: 'code',
    subject: 'Backend',
    size: '5 KB',
    date: 'Hace 4 horas',
    downloads: 45,
    tags: ['Node', 'Express'],
  },
];

export const ResourcesPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pdf' | 'video' | 'code'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText size={24} className="text-red-400" />;
      case 'video':
        return <Video size={24} className="text-purple-400" />;
      case 'code':
        return <Code size={24} className="text-yellow-400" />;
      case 'link':
        return <LinkIcon size={24} className="text-blue-400" />;
      default:
        return <FileText size={24} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-500/10 border-red-500/20 group-hover:bg-red-500/20';
      case 'video':
        return 'bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20';
      case 'code':
        return 'bg-yellow-500/10 border-yellow-500/20 group-hover:bg-yellow-500/20';
      case 'link':
        return 'bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20';
      default:
        return 'bg-slate-800';
    }
  };

  const filteredResources =
    filter === 'all' ? mockResources : mockResources.filter((r) => r.type === filter);

  return (
    <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/20">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="text-indigo-500" />
            Biblioteca de Recursos
          </h2>
          <p className="text-sm text-slate-400">Material didáctico y archivos compartidos</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar archivo..."
              className="bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all w-64"
            />
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 active:scale-95">
            <Plus size={18} />
            <span className="hidden sm:inline">Subir Recurso</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'pdf', label: 'Documentos', icon: FileText },
          { id: 'video', label: 'Grabaciones', icon: Video },
          { id: 'code', label: 'Código', icon: Code },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as 'all' | 'pdf' | 'video' | 'code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filter === item.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon && <item.icon size={14} />}
            {item.label}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6 pt-2 no-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="group bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all hover:bg-slate-800/40 flex flex-col gap-4 cursor-pointer relative overflow-hidden"
            >
              {/* Top Section */}
              <div className="flex items-start justify-between z-10">
                <div
                  className={`p-3 rounded-2xl border transition-colors ${getBgColor(resource.type)}`}
                >
                  {getIcon(resource.type)}
                </div>
                <button className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Content Info */}
              <div className="z-10">
                <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                  {resource.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <Clock size={12} />
                  <span>{resource.date}</span>
                  {resource.size && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <span>{resource.size}</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-auto pt-3 border-t border-slate-800/50 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Download size={14} />
                  {resource.downloads}
                </div>
                <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors">
                  {resource.type === 'link' ? 'Abrir' : 'Descargar'}
                </button>
              </div>

              {/* Decorative Gradient */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-2xl group-hover:from-indigo-500/20 transition-all duration-500 pointer-events-none" />
            </div>
          ))}

          {/* Upload New Placeholder */}
          <div className="border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-4 gap-3 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer min-h-[200px] group">
            <div className="p-4 rounded-full bg-slate-900 group-hover:bg-indigo-500/20 transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-sm font-bold">Subir nuevo archivo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
