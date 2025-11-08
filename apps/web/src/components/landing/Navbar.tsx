'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const navLinks: Array<{ href: string; label: string }> = [
    { href: '#mundos', label: 'Mundos' },
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#casas', label: 'Casas' },
  ];

  return (
    <nav className="navbar-landing">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-3xl font-black title-gradient">
              Mateatletas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link-landing"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-7 py-3 bg-transparent border-3 border-[#0ea5e9] rounded-xl text-[#0ea5e9] font-bold transition-all hover:bg-[#0ea5e9] hover:text-white"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              className="btn-pulse"
            >
              Empezar Gratis
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
              <a
                key={link.href}
                href={link.href}
                className="block py-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors font-semibold"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="block py-2 px-4 text-[#0ea5e9] font-bold hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              className="block btn-pulse text-center"
              onClick={() => setIsOpen(false)}
            >
              Empezar Gratis
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
