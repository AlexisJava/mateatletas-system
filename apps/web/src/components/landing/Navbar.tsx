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
    <nav className="navbar-landing">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start group">
            <span className="text-3xl font-black title-gradient leading-none">
              Mateatletas
            </span>
            <span className="logo-subtitle">
              CLUB STEAM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link-landing"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/estudiante/login"
              className="px-7 py-3 bg-transparent border-3 border-[#0ea5e9] rounded-xl text-[#0ea5e9] font-bold transition-all hover:bg-[#0ea5e9] hover:text-white"
            >
              Estudiantes
            </Link>
            <Link
              href="/docente/login"
              className="px-7 py-3 bg-transparent border-3 border-[#8b5cf6] rounded-xl text-[#8b5cf6] font-bold transition-all hover:bg-[#8b5cf6] hover:text-white"
            >
              Docentes
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-0.5 bg-white transition-all ${
                  isOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-white transition-all ${
                  isOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-white transition-all ${
                  isOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors font-semibold"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/estudiante/login"
              className="block py-2 px-4 text-[#0ea5e9] font-bold hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Estudiantes
            </Link>
            <Link
              href="/docente/login"
              className="block py-2 px-4 text-[#8b5cf6] font-bold hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Docentes
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
