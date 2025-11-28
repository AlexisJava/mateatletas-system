'use client';

import { useState, useEffect } from 'react';
import { getErrorMessage } from '@/lib/utils/error-handler';
import { motion } from 'framer-motion';
import { docentesApi, Docente, UpdateDocenteData } from '@/lib/api/docentes.api';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/effects';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function DocentePerfilPage() {
  const {} = useAuthStore();
  const [docente, setDocente] = useState<Docente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState<UpdateDocenteData>({
    nombre: '',
    apellido: '',
    telefono: '',
    titulo_profesional: '',
    biografia: '',
  });

  // Fetch docente profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await docentesApi.getMe();
        setDocente(data);
        setFormData({
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono || '',
          titulo_profesional: data.titulo_profesional || '',
          biografia: data.biografia || '',
        });
      } catch (err) {
        setError(getErrorMessage(err as Error, 'Error al cargar perfil'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const updated = await docentesApi.updateMe(formData);
      setDocente(updated);
      setSuccessMessage('✅ Perfil actualizado correctamente');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err as Error, 'Error al actualizar perfil'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!docente) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar perfil</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div {...fadeIn}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y profesional</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
          >
            {successMessage}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Personal</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                />
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                />
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={docente.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Información Profesional */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Profesional</h2>

            {/* Título Profesional */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Profesional
              </label>
              <input
                type="text"
                name="titulo_profesional"
                value={formData.titulo_profesional}
                onChange={handleChange}
                placeholder="Ej: Licenciado en Matemática, Profesor de Matemática"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              />
            </div>

            {/* Biografía */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biografía</label>
              <textarea
                name="biografia"
                value={formData.biografia}
                onChange={handleChange}
                rows={6}
                placeholder="Cuéntanos sobre tu experiencia, especialidades y enfoque pedagógico..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.biografia?.length || 0} / 500 caracteres
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                // Reset form
                setFormData({
                  nombre: docente.nombre,
                  apellido: docente.apellido,
                  telefono: docente.telefono || '',
                  titulo_profesional: docente.titulo_profesional || '',
                  biografia: docente.biografia || '',
                });
                setError('');
                setSuccessMessage('');
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff5722] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>

        {/* Información de la cuenta */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Información de la Cuenta</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Fecha de registro:</span>{' '}
              {new Date(docente.createdAt).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p>
              <span className="font-medium">Última actualización:</span>{' '}
              {new Date(docente.updatedAt).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
