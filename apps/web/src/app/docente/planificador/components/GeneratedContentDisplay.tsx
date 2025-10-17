'use client';

import { motion } from 'framer-motion';
import { Check, Copy, Download, Sparkles } from 'lucide-react';

interface GeneratedContentDisplayProps {
  content: string;
  copied: boolean;
  onSave: () => void;
  onCopy: () => void;
  onDownload: () => void;
}

export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({
  content,
  copied,
  onSave,
  onCopy,
  onDownload,
}) => {
  return (
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
            onClick={onSave}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Guardar
          </button>
          <button
            onClick={onCopy}
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
            onClick={onDownload}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-indigo-950/40 rounded-lg p-6 border border-purple-200/30 dark:border-purple-700/30 max-h-[600px] overflow-y-auto">
        <pre className="text-sm text-indigo-900 dark:text-white whitespace-pre-wrap font-mono">
          {content}
        </pre>
      </div>

      <div className="mt-4 p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
        <p className="text-sm text-purple-700 dark:text-purple-300">
          <Sparkles className="w-4 h-4 inline mr-2" />
          <strong>Nota:</strong> Este contenido ha sido generado automáticamente. Te recomendamos
          revisarlo y adaptarlo según las necesidades específicas de tus estudiantes.
        </p>
      </div>
    </motion.div>
  );
};
