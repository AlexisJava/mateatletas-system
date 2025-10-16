'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button, Input, Card } from '@/components/ui';

/**
 * Página de login unificada para tutores y estudiantes
 * Ruta: /login
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, loginEstudiante, isLoading, isAuthenticated, user } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasRedirectedRef = useRef(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      setIsRedirecting(true);
      // Redirigir según el rol del usuario
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'docente') {
        router.push('/docente/dashboard');
      } else if (user.role === 'estudiante') {
        router.push('/estudiante/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const [userType, setUserType] = useState<'tutor' | 'estudiante'>('tutor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  /**
   * Maneja el submit del formulario de login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación básica
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      triggerShake();
      return;
    }

    try {
      // Usar método de login según el tipo de usuario seleccionado
      if (userType === 'estudiante') {
        await loginEstudiante(email, password);
      } else {
        await login(email, password);
      }
      // El useEffect manejará la redirección
      setIsRedirecting(true);
    } catch (err: unknown) {
      console.error('Error al iniciar sesión:', err);

      // Determinar mensaje de error según el tipo
      let errorMessage = 'Error de conexión, intenta nuevamente';

      if (err && typeof err === 'object') {
        if ('response' in err && err.response && typeof err.response === 'object') {
          if ('status' in err.response && err.response.status === 401) {
            errorMessage = 'Email o contraseña incorrectos';
          } else if ('data' in err.response && err.response.data && typeof err.response.data === 'object') {
            if ('message' in err.response.data && typeof err.response.data.message === 'string') {
              errorMessage = err.response.data.message;
            }
          }
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      triggerShake();
    }
  };

  /**
   * Activa la animación de shake en el card
   */
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 650);
  };

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Limpia el error cuando el usuario empieza a escribir
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  // Mostrar loading mientras redirige
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ff6b35] via-[#f7b801] to-[#00d9ff] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="text-white text-lg font-semibold">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6b35] via-[#f7b801] to-[#00d9ff] flex items-center justify-center p-4 animate-fadeIn">
      <Card className={`w-full max-w-md shadow-2xl ${shake ? 'animate-shake' : ''}`}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#2a1a5e] mb-2">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-[#2a1a5e]/70">
            {userType === 'tutor'
              ? 'Inicia sesión para continuar entrenando atletas'
              : 'Inicia sesión para continuar tu entrenamiento'}
          </p>
        </div>

        {/* Toggle Tutor/Estudiante */}
        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setUserType('tutor');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
              userType === 'tutor'
                ? 'bg-white text-[#ff6b35] shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👨‍🏫 Tutor/Padre
          </button>
          <button
            type="button"
            onClick={() => {
              setUserType('estudiante');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
              userType === 'estudiante'
                ? 'bg-white text-[#00d9ff] shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            👦 Estudiante
          </button>
        </div>

        {/* Alert de error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-slideDown">
            <p className="text-red-600 text-sm flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={handleEmailChange}
            placeholder="tu@email.com"
            disabled={isLoading}
            autoComplete="email"
          />

          {/* Password con toggle de visibilidad */}
          <div className="relative">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="current-password"
            />
            {/* Botón para mostrar/ocultar contraseña */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                // Icono de ojo cerrado
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                // Icono de ojo abierto
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Checkbox "Recordarme" (placeholder para futuro) */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 text-[#ff6b35] border-gray-300 rounded focus:ring-[#ff6b35] focus:ring-2"
              disabled={isLoading}
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Recordarme
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full mt-6"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        {/* Links de navegación */}
        <div className="mt-6 text-center space-y-3">
          {/* Link a recuperar contraseña */}
          <a
            href="/forgot-password"
            className="text-sm text-[#2a1a5e]/70 hover:text-[#2a1a5e] hover:underline block transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#fff9e6] text-gray-500">o</span>
            </div>
          </div>

          {/* Link a registro */}
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <a
              href="/register"
              className="text-[#ff6b35] font-bold hover:underline hover:text-[#ff5722] transition-colors"
            >
              Regístrate aquí
            </a>
          </p>
        </div>
      </Card>

      {/* Estilos para animaciones */}
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-10px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.65s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
