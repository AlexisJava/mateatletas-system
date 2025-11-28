'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

/**
 * ComponentShowcase - Muestra todos los componentes UI
 *
 * Esta página sirve como:
 * - Documentación visual de componentes
 * - Testing manual de UI
 * - Referencia para desarrolladores
 *
 * Para ver este showcase, importa este componente en una página:
 * import ComponentShowcase from '@/components/ui/ComponentShowcase';
 */
export default function ComponentShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Button clicked!');
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Validación de ejemplo
    if (value.length > 0 && value.length < 3) {
      setInputError('Debe tener al menos 3 caracteres');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff9e6] to-[#00d9ff]/10 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-[#2a1a5e]">🎮 UI Components Showcase</h1>
          <p className="text-xl text-[#2a1a5e]/70">
            Componentes con estilo Crash Bandicoot - Chunky, vibrante y divertido
          </p>
        </div>

        {/* Buttons Section */}
        <Card title="🔘 Buttons">
          <div className="space-y-8">
            {/* Button Variants */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Variantes</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" onClick={handleButtonClick}>
                  Primary Button
                </Button>
                <Button variant="secondary" onClick={handleButtonClick}>
                  Secondary Button
                </Button>
                <Button variant="outline" onClick={handleButtonClick}>
                  Outline Button
                </Button>
                <Button variant="ghost" onClick={handleButtonClick}>
                  Ghost Button
                </Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Tamaños</h4>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="md">
                  Medium
                </Button>
                <Button variant="primary" size="lg">
                  Large
                </Button>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Estados</h4>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" disabled>
                  Disabled
                </Button>
                <Button variant="primary" isLoading={isLoading}>
                  {isLoading ? 'Loading...' : 'Click for Loading'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Inputs Section */}
        <Card title="📝 Inputs">
          <div className="space-y-6">
            {/* Basic Input */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Input básico</h4>
              <Input label="Nombre de usuario" placeholder="Ingresa tu nombre" required />
            </div>

            {/* Input with validation */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Input con validación</h4>
              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
                value={inputValue}
                onChange={handleInputChange}
                error={inputError}
                required
              />
              <p className="text-sm text-gray-600 mt-2">
                Escribe menos de 3 caracteres para ver el error
              </p>
            </div>

            {/* Disabled Input */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Input deshabilitado</h4>
              <Input label="Campo bloqueado" value="No editable" disabled />
            </div>

            {/* Input types */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Tipos de input</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Text" type="text" placeholder="Texto normal" />
                <Input label="Password" type="password" placeholder="••••••••" />
                <Input label="Email" type="email" placeholder="email@example.com" />
                <Input label="Number" type="number" placeholder="123" />
                <Input label="Date" type="date" />
                <Input label="Tel" type="tel" placeholder="+54 11 1234-5678" />
              </div>
            </div>
          </div>
        </Card>

        {/* Cards Section */}
        <Card title="🃏 Cards">
          <div className="space-y-6">
            {/* Basic Card */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Card básica</h4>
              <Card>
                <p>Esta es una card básica sin título. Ideal para agrupar contenido relacionado.</p>
              </Card>
            </div>

            {/* Card with title */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Card con título</h4>
              <Card title="Título de la Card">
                <p>
                  Esta card tiene un título con estilo Crash Bandicoot. El título tiene un borde
                  inferior naranja.
                </p>
              </Card>
            </div>

            {/* Hoverable Card */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Card interactiva (hover)</h4>
              <Card title="Card con Hover" hoverable>
                <p>
                  Pasa el mouse sobre esta card para ver el efecto lift. Ideal para cards
                  clickeables o navegables.
                </p>
              </Card>
            </div>

            {/* Grid of cards */}
            <div>
              <h4 className="text-lg font-bold text-[#2a1a5e] mb-4">Grid de cards</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Card 1" hoverable>
                  <p>Contenido de la primera card</p>
                </Card>
                <Card title="Card 2" hoverable>
                  <p>Contenido de la segunda card</p>
                </Card>
                <Card title="Card 3" hoverable>
                  <p>Contenido de la tercera card</p>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        {/* Combined Example */}
        <Card title="🎨 Ejemplo Combinado: Formulario de Login">
          <div className="max-w-md mx-auto space-y-6">
            <Input label="Email" type="email" placeholder="tu@email.com" required />
            <Input label="Contraseña" type="password" placeholder="••••••••" required />
            <div className="flex gap-4">
              <Button variant="primary" size="lg" className="flex-1">
                Iniciar Sesión
              </Button>
              <Button variant="outline" size="lg">
                Registrarse
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="w-full">
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        </Card>

        {/* Color Palette */}
        <Card title="🎨 Paleta de Colores">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-[#ff6b35] rounded-lg shadow-md"></div>
              <p className="text-sm font-bold">Primary</p>
              <p className="text-xs text-gray-600">#ff6b35</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-[#f7b801] rounded-lg shadow-md"></div>
              <p className="text-sm font-bold">Secondary</p>
              <p className="text-xs text-gray-600">#f7b801</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-[#00d9ff] rounded-lg shadow-md"></div>
              <p className="text-sm font-bold">Accent</p>
              <p className="text-xs text-gray-600">#00d9ff</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-[#4caf50] rounded-lg shadow-md"></div>
              <p className="text-sm font-bold">Success</p>
              <p className="text-xs text-gray-600">#4caf50</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-[#f44336] rounded-lg shadow-md"></div>
              <p className="text-sm font-bold">Danger</p>
              <p className="text-xs text-gray-600">#f44336</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-[#2a1a5e] rounded-lg shadow-md"></div>
              <p className="text-sm font-bold text-white">Dark</p>
              <p className="text-xs text-gray-600">#2a1a5e</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-[#fff9e6] rounded-lg shadow-md border-2 border-gray-200"></div>
              <p className="text-sm font-bold">Light</p>
              <p className="text-xs text-gray-600">#fff9e6</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
