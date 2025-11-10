'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import {
  Terminal,
  ArrowRight,
  Sparkles,
  Check,
  Rocket,
  Users,
  Brain,
  Code,
  Microscope,
  Star,
  Calendar,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';

/**
 * Onboarding flow para nuevos tutores - ULTRA PREMIUM DESIGN
 * 4 steps: Welcome -> Plan Selection -> Kids Info -> Confirmation
 * Ruta: /onboarding
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [selectedPlan, setSelectedPlan] = useState<'explorador' | 'acompanado' | 'completo' | null>(null);
  const [selectedMundos, setSelectedMundos] = useState<string[]>([]);
  const [kidsInfo, setKidsInfo] = useState([{ nombre: '', edad: '' }]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const plans = [
    {
      id: 'explorador' as const,
      name: 'EXPLORADOR',
      price: 30000,
      priceLabel: '$30K/mes por curso',
      icon: Rocket,
      color: 'from-[#8b5cf6] to-[#7c3aed]',
      description: 'Cursos online a tu ritmo',
      features: [
        'Un curso a elección',
        'Acceso 24/7',
        'Videos HD + ejercicios',
        'Sistema gamificado',
      ],
    },
    {
      id: 'acompanado' as const,
      name: 'ACOMPAÑADO',
      price: 60000,
      priceLabel: '$60K/mes',
      icon: Users,
      color: 'from-[#0ea5e9] to-[#0284c7]',
      description: 'Clases en vivo + plataforma',
      features: [
        'Un mundo STEAM',
        '2 clases en vivo/semana',
        'Grupos reducidos',
        'Sistema gamificado completo',
      ],
    },
    {
      id: 'completo' as const,
      name: 'COMPLETO',
      price: 105600,
      priceLabel: '$105.6K/mes',
      icon: Star,
      color: 'from-[#10b981] to-[#059669]',
      description: 'Experiencia completa',
      features: [
        'Los 3 mundos STEAM',
        'Ahorrás $14.400/mes',
        'Prioridad en eventos',
        'Todo incluido',
      ],
      highlighted: true,
    },
  ];

  const mundos = [
    {
      id: 'matematica',
      name: 'Matemática',
      icon: Brain,
      color: 'from-[#0ea5e9] to-[#0284c7]',
      description: 'De olimpíadas a finanzas personales',
    },
    {
      id: 'programacion',
      name: 'Programación',
      icon: Code,
      color: 'from-[#8b5cf6] to-[#7c3aed]',
      description: 'Desde Roblox hasta apps reales',
    },
    {
      id: 'ciencias',
      name: 'Ciencias',
      icon: Microscope,
      color: 'from-[#10b981] to-[#059669]',
      description: 'Experimentos fascinantes',
    },
  ];

  const handleMundoToggle = (mundoId: string) => {
    if (selectedMundos.includes(mundoId)) {
      setSelectedMundos(selectedMundos.filter((id) => id !== mundoId));
    } else {
      setSelectedMundos([...selectedMundos, mundoId]);
    }
  };

  const handleAddKid = () => {
    setKidsInfo([...kidsInfo, { nombre: '', edad: '' }]);
  };

  const handleRemoveKid = (index: number) => {
    if (kidsInfo.length > 1) {
      setKidsInfo(kidsInfo.filter((_, i) => i !== index));
    }
  };

  const handleKidChange = (index: number, field: 'nombre' | 'edad', value: string) => {
    const newKidsInfo = [...kidsInfo];
    newKidsInfo[index][field] = value;
    setKidsInfo(newKidsInfo);
  };

  const canProgressStep2 = selectedPlan !== null;
  const canProgressStep3 = selectedMundos.length > 0 && kidsInfo.every((kid) => kid.nombre && kid.edad);

  const handleNextStep = () => {
    if (currentStep === 2 && !canProgressStep2) return;
    if (currentStep === 3 && !canProgressStep3) return;
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = () => {
    // Aquí guardarías la info del onboarding
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative bg-black flex items-center justify-center">
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0ea5e9]/20 rounded-full blur-[120px] animate-pulse" />
        </div>
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-[#0ea5e9]/20 border-t-[#0ea5e9] rounded-full mb-6"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Cosmos Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#0ea5e9]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10b981]/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
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

            <div className="text-sm text-white/70">
              Hola, <span className="font-bold text-white">{user?.nombre}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-4xl w-full mx-auto py-12">
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
                {currentStep === 1 && 'Bienvenida'}
                {currentStep === 2 && 'Selecciona tu plan'}
                {currentStep === 3 && 'Información de tus hijos'}
                {currentStep === 4 && 'Confirmación'}
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

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 to-[#10b981]/20 blur-[80px] opacity-50" />

            <div className="relative card-glass rounded-3xl border-2 border-white/10 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9]/90 to-transparent" />

              <div className="p-8 sm:p-12">
                <AnimatePresence mode="wait">
                  {/* Step 1: Welcome */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-center space-y-8"
                    >
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#10b981] mb-6">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>

                      <div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
                          ¡Bienvenido a Mateatletas!
                        </h1>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                          Estás a punto de comenzar una aventura épica. Vamos a configurar tu cuenta en
                          solo unos pasos.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                        <div className="card-glass p-6 rounded-xl border border-white/10">
                          <div className="text-3xl mb-3">🎯</div>
                          <h3 className="text-lg font-black text-white mb-2">Elegí tu plan</h3>
                          <p className="text-sm text-white/60">El que mejor se adapte a vos</p>
                        </div>
                        <div className="card-glass p-6 rounded-xl border border-white/10">
                          <div className="text-3xl mb-3">👨‍👩‍👧‍👦</div>
                          <h3 className="text-lg font-black text-white mb-2">Agregá tus hijos</h3>
                          <p className="text-sm text-white/60">Sus nombres y edades</p>
                        </div>
                        <div className="card-glass p-6 rounded-xl border border-white/10">
                          <div className="text-3xl mb-3">🚀</div>
                          <h3 className="text-lg font-black text-white mb-2">¡Listo!</h3>
                          <p className="text-sm text-white/60">Empezá la aventura</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Plan Selection */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                          Seleccioná tu plan
                        </h2>
                        <p className="text-white/60">
                          Podés cambiar tu plan cuando quieras
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                          const Icon = plan.icon;
                          const isSelected = selectedPlan === plan.id;

                          return (
                            <motion.button
                              key={plan.id}
                              type="button"
                              onClick={() => setSelectedPlan(plan.id)}
                              whileTap={{ scale: 0.98 }}
                              className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-[#0ea5e9]/60 bg-gradient-to-br from-[#0ea5e9]/10 to-[#10b981]/10 shadow-xl shadow-[#0ea5e9]/20'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              } ${plan.highlighted ? 'sm:scale-105' : ''}`}
                            >
                              {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#10b981] to-[#059669] rounded-full text-xs font-black text-white">
                                  MÁS POPULAR
                                </div>
                              )}

                              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} mb-4`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>

                              <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
                              <p className="text-sm text-white/60 mb-4">{plan.description}</p>

                              <div className="mb-4">
                                <div className="text-2xl font-black text-white">{plan.priceLabel}</div>
                              </div>

                              <ul className="space-y-2">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-white/70">
                                    <Check className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>

                              {isSelected && (
                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#10b981] flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Kids Info + Mundos */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                          Contanos sobre tus hijos
                        </h2>
                        <p className="text-white/60">
                          ¿Quiénes van a aprender con nosotros?
                        </p>
                      </div>

                      {/* Kids Info */}
                      <div className="space-y-4">
                        {kidsInfo.map((kid, index) => (
                          <div key={index} className="card-glass p-6 rounded-xl border border-white/10">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 grid sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-bold text-white/90 mb-2">
                                    Nombre
                                  </label>
                                  <input
                                    type="text"
                                    value={kid.nombre}
                                    onChange={(e) => handleKidChange(index, 'nombre', e.target.value)}
                                    placeholder="Juan"
                                    className="w-full px-4 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-bold text-white/90 mb-2">
                                    Edad
                                  </label>
                                  <input
                                    type="number"
                                    value={kid.edad}
                                    onChange={(e) => handleKidChange(index, 'edad', e.target.value)}
                                    placeholder="10"
                                    min="6"
                                    max="18"
                                    className="w-full px-4 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all"
                                  />
                                </div>
                              </div>
                              {kidsInfo.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKid(index)}
                                  className="mt-8 text-red-400 hover:text-red-300 transition-colors"
                                >
                                  Eliminar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={handleAddKid}
                          className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-all font-bold"
                        >
                          + Agregar otro hijo
                        </button>
                      </div>

                      {/* Mundos Selection */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-black text-white text-center">
                          ¿Qué mundos les interesan?
                        </h3>

                        <div className="grid sm:grid-cols-3 gap-4">
                          {mundos.map((mundo) => {
                            const Icon = mundo.icon;
                            const isSelected = selectedMundos.includes(mundo.id);

                            return (
                              <motion.button
                                key={mundo.id}
                                type="button"
                                onClick={() => handleMundoToggle(mundo.id)}
                                whileTap={{ scale: 0.98 }}
                                className={`relative p-6 rounded-2xl border-2 transition-all ${
                                  isSelected
                                    ? 'border-[#0ea5e9]/60 bg-gradient-to-br from-[#0ea5e9]/10 to-[#10b981]/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                }`}
                              >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${mundo.color} mb-4`}>
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-lg font-black text-white mb-2">{mundo.name}</h4>
                                <p className="text-sm text-white/60">{mundo.description}</p>

                                {isSelected && (
                                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#10b981] flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Confirmation */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-center space-y-8"
                    >
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] mb-6">
                        <Rocket className="w-12 h-12 text-white" />
                      </div>

                      <div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
                          ¡Todo listo!
                        </h1>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
                          Tu cuenta está configurada. Es hora de comenzar la aventura.
                        </p>
                      </div>

                      <div className="max-w-xl mx-auto space-y-4 text-left">
                        <div className="card-glass p-6 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <CreditCard className="w-5 h-5 text-[#0ea5e9]" />
                            <h3 className="text-lg font-black text-white">Plan seleccionado</h3>
                          </div>
                          <p className="text-white/70">
                            {plans.find((p) => p.id === selectedPlan)?.name} -{' '}
                            {plans.find((p) => p.id === selectedPlan)?.priceLabel}
                          </p>
                        </div>

                        <div className="card-glass p-6 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-[#0ea5e9]" />
                            <h3 className="text-lg font-black text-white">Tus hijos</h3>
                          </div>
                          <div className="space-y-1">
                            {kidsInfo.map((kid, index) => (
                              <p key={index} className="text-white/70">
                                {kid.nombre} ({kid.edad} años)
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="card-glass p-6 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-[#0ea5e9]" />
                            <h3 className="text-lg font-black text-white">Mundos de interés</h3>
                          </div>
                          <p className="text-white/70">
                            {selectedMundos.map((id) => mundos.find((m) => m.id === id)?.name).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-white/60 max-w-xl mx-auto">
                        <p>
                          Te vamos a contactar pronto para coordinar el pago y la fecha de inicio. Mientras tanto,
                          podés explorar la plataforma.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-8 mt-8 border-t border-white/10">
                  {currentStep > 1 && currentStep < 4 && (
                    <motion.button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 bg-white/5 border-2 border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Volver</span>
                    </motion.button>
                  )}

                  {currentStep < 4 ? (
                    <motion.button
                      type="button"
                      onClick={handleNextStep}
                      disabled={currentStep === 2 && !canProgressStep2}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white font-bold rounded-xl hover:shadow-xl hover:shadow-[#0ea5e9]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleFinish}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold rounded-xl hover:shadow-xl hover:shadow-[#10b981]/30 transition-all inline-flex items-center justify-center gap-2"
                    >
                      <span>Ir al Dashboard</span>
                      <Rocket className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
