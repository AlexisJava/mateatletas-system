'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import {
  Terminal,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  CreditCard,
  Sparkles,
  Check,
  AlertCircle,
  Rocket,
} from 'lucide-react';

/**
 * Página de registro de nuevos tutores - ULTRA PREMIUM DESIGN
 * Matching con landing page design system
 * Ruta: /register
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, isAuthenticated } = useAuthStore();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/onboarding');
    }
  }, [isAuthenticated, router]);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El email es requerido';
    if (!emailRegex.test(email)) return 'Formato de email inválido';
    return null;
  };

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

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

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
        if (value && !/^\d+$/.test(value)) return 'Solo números';
        return null;
      case 'telefono':
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (generalError) setGeneralError('');

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error || '',
      }));
    }

    if (name === 'password' && touched.confirmPassword) {
      const confirmError =
        formData.confirmPassword !== value ? 'Las contraseñas no coinciden' : '';
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error || '',
    }));
  };

  const canProgressToStep2 = formData.email && formData.password && formData.confirmPassword && !errors.email && !errors.password && !errors.confirmPassword;
  const canProgressToStep3 = canProgressToStep2 && formData.nombre && formData.apellido && !errors.nombre && !errors.apellido;

  const handleNextStep = () => {
    if (currentStep === 1 && !canProgressToStep2) {
      setTouched({ email: true, password: true, confirmPassword: true });
      return;
    }
    if (currentStep === 2 && !canProgressToStep3) {
      setTouched({ ...touched, nombre: true, apellido: true });
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    if (!canProgressToStep3) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      router.push('/onboarding');
    } catch (error) {
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

      if (errorMessage.includes('email') || errorMessage.includes('Email')) {
        setErrors((prev) => ({ ...prev, email: 'Este email ya está registrado' }));
        setCurrentStep(1);
      }
    }
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : 0;

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Cosmos Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />

        {/* Animated orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#0ea5e9]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10b981]/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(14, 165, 233, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] flex items-center justify-center shadow-lg shadow-[#0ea5e9]/50"
                >
                  <Terminal className="w-6 h-6 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">MATEATLETAS</h1>
                <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9]">
                  CLUB STEAM
                </p>
              </div>
            </Link>

            <Link
              href="/login"
              className="text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-2xl w-full mx-auto py-12">
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-white/70">
                Paso {currentStep} de {totalSteps}
              </p>
              <p className="text-sm font-bold text-[#0ea5e9]">
                {currentStep === 1 && 'Credenciales'}
                {currentStep === 2 && 'Información Personal'}
                {currentStep === 3 && 'Finalizar'}
              </p>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-xl border border-white/10">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981]"
              />
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 to-[#10b981]/20 blur-[80px] opacity-50" />

            {/* Card */}
            <div className="relative card-glass rounded-3xl border-2 border-white/10 overflow-hidden">
              {/* Top gradient line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9]/90 to-transparent" />

              <div className="p-8 sm:p-12">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#0ea5e9]/20 to-[#10b981]/20 border border-[#0ea5e9]/30 mb-4"
                  >
                    <Sparkles className="w-4 h-4 text-[#0ea5e9] animate-pulse" />
                    <span className="text-xs font-black text-[#0ea5e9] uppercase tracking-widest">
                      Nuevo Tutor
                    </span>
                  </motion.div>

                  <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                    Crear mi cuenta
                  </h1>
                  <p className="text-white/60">
                    Unite a más de 500 familias que confían en Mateatletas
                  </p>
                </div>

                {/* Error general */}
                <AnimatePresence>
                  {generalError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-xl"
                    >
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {generalError}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Credenciales */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        {/* Email */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white/90">
                            Email
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Mail className="w-5 h-5 text-[#0ea5e9]/60 group-focus-within:text-[#0ea5e9] transition-colors" />
                            </div>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              required
                              placeholder="tu@email.com"
                              disabled={isLoading}
                              className="w-full pl-12 pr-4 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all disabled:opacity-50"
                            />
                          </div>
                          {touched.email && errors.email && (
                            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white/90">
                            Contraseña
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="w-5 h-5 text-[#0ea5e9]/60 group-focus-within:text-[#0ea5e9] transition-colors" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              required
                              placeholder="Mínimo 8 caracteres"
                              disabled={isLoading}
                              className="w-full pl-12 pr-12 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all disabled:opacity-50"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-[#0ea5e9] transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {formData.password && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
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
                                <span
                                  className={`text-xs font-bold ${
                                    passwordStrength <= 2
                                      ? 'text-red-400'
                                      : passwordStrength <= 3
                                        ? 'text-yellow-400'
                                        : 'text-green-400'
                                  }`}
                                >
                                  {passwordStrength <= 2 ? 'Débil' : passwordStrength <= 3 ? 'Media' : 'Fuerte'}
                                </span>
                              </div>
                            </div>
                          )}
                          {touched.password && errors.password && (
                            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.password}
                            </p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white/90">
                            Confirmar Contraseña
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="w-5 h-5 text-[#0ea5e9]/60 group-focus-within:text-[#0ea5e9] transition-colors" />
                            </div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              required
                              placeholder="Repite tu contraseña"
                              disabled={isLoading}
                              className="w-full pl-12 pr-12 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all disabled:opacity-50"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-[#0ea5e9] transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {touched.confirmPassword && errors.confirmPassword && (
                            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Info Personal */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        {/* Nombre */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white/90">
                            Nombre
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <User className="w-5 h-5 text-[#0ea5e9]/60 group-focus-within:text-[#0ea5e9] transition-colors" />
                            </div>
                            <input
                              type="text"
                              name="nombre"
                              value={formData.nombre}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              required
                              placeholder="Juan"
                              disabled={isLoading}
                              className="w-full pl-12 pr-4 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all disabled:opacity-50"
                            />
                          </div>
                          {touched.nombre && errors.nombre && (
                            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.nombre}
                            </p>
                          )}
                        </div>

                        {/* Apellido */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white/90">
                            Apellido
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <User className="w-5 h-5 text-[#0ea5e9]/60 group-focus-within:text-[#0ea5e9] transition-colors" />
                            </div>
                            <input
                              type="text"
                              name="apellido"
                              value={formData.apellido}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              required
                              placeholder="Pérez"
                              disabled={isLoading}
                              className="w-full pl-12 pr-4 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all disabled:opacity-50"
                            />
                          </div>
                          {touched.apellido && errors.apellido && (
                            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.apellido}
                            </p>
                          )}
                        </div>

                        {/* DNI (opcional) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white/90">
                            DNI <span className="text-white/40">(opcional)</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <CreditCard className="w-5 h-5 text-[#0ea5e9]/60 group-focus-within:text-[#0ea5e9] transition-colors" />
                            </div>
                            <input
                              type="text"
                              name="dni"
                              value={formData.dni}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="12345678"
                              disabled={isLoading}
                              className="w-full pl-12 pr-4 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all disabled:opacity-50"
                            />
                          </div>
                          {touched.dni && errors.dni && (
                            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.dni}
                            </p>
                          )}
                        </div>

                        {/* Teléfono (opcional) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white/90">
                            Teléfono <span className="text-white/40">(opcional)</span>
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Phone className="w-5 h-5 text-[#0ea5e9]/60 group-focus-within:text-[#0ea5e9] transition-colors" />
                            </div>
                            <input
                              type="tel"
                              name="telefono"
                              value={formData.telefono}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="+54 11 1234-5678"
                              disabled={isLoading}
                              className="w-full pl-12 pr-4 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Confirmación */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="text-center py-4">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#10b981] mb-4">
                            <Rocket className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-2xl font-black text-white mb-2">
                            ¡Todo listo!
                          </h3>
                          <p className="text-white/60 mb-6">
                            Revisá tus datos antes de continuar
                          </p>
                        </div>

                        <div className="space-y-3 p-6 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">Email:</span>
                            <span className="text-sm font-bold text-white">{formData.email}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/60">Nombre completo:</span>
                            <span className="text-sm font-bold text-white">
                              {formData.nombre} {formData.apellido}
                            </span>
                          </div>
                          {formData.dni && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/60">DNI:</span>
                              <span className="text-sm font-bold text-white">{formData.dni}</span>
                            </div>
                          )}
                          {formData.telefono && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/60">Teléfono:</span>
                              <span className="text-sm font-bold text-white">{formData.telefono}</span>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-xl">
                          <div className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-white/80">
                              Al crear tu cuenta, aceptás nuestros{' '}
                              <Link href="/terminos" className="text-[#0ea5e9] font-bold hover:underline">
                                Términos y Condiciones
                              </Link>{' '}
                              y{' '}
                              <Link href="/privacidad" className="text-[#0ea5e9] font-bold hover:underline">
                                Política de Privacidad
                              </Link>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 pt-4">
                    {currentStep > 1 && (
                      <motion.button
                        type="button"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        disabled={isLoading}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-6 py-3 bg-white/5 border-2 border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                      >
                        Volver
                      </motion.button>
                    )}

                    {currentStep < totalSteps ? (
                      <motion.button
                        type="button"
                        onClick={handleNextStep}
                        disabled={isLoading}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white font-bold rounded-xl hover:shadow-xl hover:shadow-[#0ea5e9]/30 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                      >
                        <span>Continuar</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white font-bold rounded-xl hover:shadow-xl hover:shadow-[#0ea5e9]/30 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            <span>Creando cuenta...</span>
                          </>
                        ) : (
                          <>
                            <span>Crear mi cuenta</span>
                            <Rocket className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-sm text-white/60">
                    ¿Ya tenés cuenta?{' '}
                    <Link
                      href="/login"
                      className="text-[#0ea5e9] font-bold hover:text-[#0284c7] transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
