'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button, Input, Card } from '@/components/ui';

/**
 * Página de registro de nuevos tutores
 * Ruta: /register
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuthStore();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [generalError, setGeneralError] = useState<string>('');

  /**
   * Valida el formato de email
   */
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El email es requerido';
    if (!emailRegex.test(email)) return 'Formato de email inválido';
    return null;
  };

  /**
   * Valida la fuerza de la contraseña
   * Retorna: null si es válida, mensaje de error si no
   */
  const validatePassword = (password: string): string | null => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 8) return 'Mínimo 8 caracteres';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    if (!hasUpperCase) return 'Debe incluir al menos una mayúscula';
    if (!hasLowerCase) return 'Debe incluir al menos una minúscula';
    if (!hasNumber) return 'Debe incluir al menos un número';
    if (!hasSpecial) return 'Debe incluir al menos un carácter especial (@$!%*?&)';

    return null;
  };

  /**
   * Calcula la fuerza de la contraseña (0-4)
   */
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  /**
   * Obtiene el texto y color del indicador de fuerza
   */
  const getPasswordStrengthInfo = (strength: number) => {
    if (strength === 0) return { text: '', color: '' };
    if (strength <= 2) return { text: 'Débil', color: 'text-red-500' };
    if (strength <= 3) return { text: 'Media', color: 'text-yellow-500' };
    return { text: 'Fuerte', color: 'text-green-500' };
  };

  /**
   * Valida un campo específico
   */
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        if (!value) return 'Confirma tu contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return null;
      case 'nombre':
        return !value ? 'El nombre es requerido' : null;
      case 'apellido':
        return !value ? 'El apellido es requerido' : null;
      case 'dni':
        // DNI es opcional, pero si se ingresa debe ser válido
        if (value && !/^\d+$/.test(value)) return 'Solo números';
        return null;
      case 'telefono':
        // Teléfono es opcional
        return null;
      default:
        return null;
    }
  };

  /**
   * Maneja el cambio de valores en los inputs
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error general al modificar
    if (generalError) setGeneralError('');

    // Si el campo ya fue tocado, validar en tiempo real
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error || '',
      }));
    }

    // Validar confirmPassword si password cambia
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = formData.confirmPassword !== value
        ? 'Las contraseñas no coinciden'
        : '';
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  /**
   * Maneja cuando un input pierde el foco
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error || '',
    }));
  };

  /**
   * Valida todo el formulario
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // Marcar todos como tocados
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // Validar todo el formulario
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos (excluir confirmPassword)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = formData;

      // Llamar al store
      await register(registerData);

      // El register del store hace auto-login, así que redirigir
      router.push('/dashboard');
    } catch (error) {
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al registrarse. Por favor, intenta nuevamente.';

      if (error && typeof error === 'object') {
        if ('response' in error && error.response && typeof error.response === 'object') {
          if ('data' in error.response && error.response.data && typeof error.response.data === 'object') {
            if ('message' in error.response.data && typeof error.response.data.message === 'string') {
              errorMessage = error.response.data.message;
            }
          }
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }

      setGeneralError(errorMessage);

      // Si es error de email duplicado, marcarlo en el campo
      if (errorMessage.includes('email') || errorMessage.includes('Email')) {
        setErrors((prev) => ({ ...prev, email: 'Este email ya está registrado' }));
      }
    }
  };

  // Calcular si el botón debe estar deshabilitado
  const hasErrors = Object.values(errors).some((error) => error !== '');
  const hasEmptyRequired =
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword ||
    !formData.nombre ||
    !formData.apellido;
  const isSubmitDisabled = hasErrors || hasEmptyRequired || isLoading;

  // Calcular fuerza de contraseña
  const passwordStrength = formData.password
    ? getPasswordStrength(formData.password)
    : 0;
  const strengthInfo = getPasswordStrengthInfo(passwordStrength);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6b35] via-[#f7b801] to-[#00d9ff] flex items-center justify-center p-4 animate-fadeIn">
      <Card className="w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#2a1a5e] mb-2">
            ¡Únete a Mateatletas!
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta y comienza a entrenar atletas
          </p>
        </div>

        {/* Error general */}
        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {generalError}
            </p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <Input
            label="Email"
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : undefined}
            placeholder="tu@email.com"
            disabled={isLoading}
          />

          {/* Password */}
          <div>
            <Input
              label="Contraseña"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : undefined}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {/* Indicador de fuerza */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength <= 2
                          ? 'bg-red-500'
                          : passwordStrength <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${strengthInfo.color}`}>
                    {strengthInfo.text}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar Password */}
          <Input
            label="Confirmar Contraseña"
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
            placeholder="••••••••"
            disabled={isLoading}
          />

          {/* Nombre */}
          <Input
            label="Nombre"
            type="text"
            name="nombre"
            required
            value={formData.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.nombre ? errors.nombre : undefined}
            placeholder="Juan"
            disabled={isLoading}
          />

          {/* Apellido */}
          <Input
            label="Apellido"
            type="text"
            name="apellido"
            required
            value={formData.apellido}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.apellido ? errors.apellido : undefined}
            placeholder="Pérez"
            disabled={isLoading}
          />

          {/* DNI (opcional) */}
          <Input
            label="DNI"
            type="text"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.dni ? errors.dni : undefined}
            placeholder="12345678 (opcional)"
            disabled={isLoading}
          />

          {/* Teléfono (opcional) */}
          <Input
            label="Teléfono"
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.telefono ? errors.telefono : undefined}
            placeholder="+54 11 1234-5678 (opcional)"
            disabled={isLoading}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={isSubmitDisabled}
            className="w-full mt-6"
          >
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        </form>

        {/* Link a Login */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <a
            href="/login"
            className="text-[#ff6b35] font-bold hover:underline hover:text-[#ff5722] transition-colors"
          >
            Inicia sesión
          </a>
        </p>
      </Card>

      {/* Estilos para animación */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
