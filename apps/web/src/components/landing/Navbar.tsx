'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const navLinks: Array<{ href: string; label: string }> = [
    { href: '/club', label: 'Club' },
    { href: '/cursos-online', label: 'Cursos Online' },
    { href: '/colonia', label: 'Colonia de Verano' },
    { href: '/nosotros', label: 'Nosotros' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent">
              Mateatletas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-200 hover:text-[#0ea5e9] dark:hover:text-[#38bdf8] transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="px-6 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#0ea5e9]/30 transition-all"
            >
              Ingresar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-0.5 bg-gray-700 dark:bg-gray-200 transition-all ${
                  isOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-gray-700 dark:bg-gray-200 transition-all ${
                  isOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-gray-700 dark:bg-gray-200 transition-all ${
                  isOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block py-2.5 px-4 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-lg font-semibold text-center hover:shadow-lg hover:shadow-[#0ea5e9]/30 transition-all"
              onClick={() => setIsOpen(false)}
            >
              Ingresar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
