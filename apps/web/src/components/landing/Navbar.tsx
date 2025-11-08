'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SubMenuItem {
  href: string;
  label: string;
}

interface NavLink {
  href?: string;
  label: string;
  submenu?: SubMenuItem[];
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navLinks: NavLink[] = [
    {
      label: 'Club',
      submenu: [
        { href: '/club/matematica', label: 'Club de Matemática' },
        { href: '/club/programacion', label: 'Club de Programación' },
        { href: '/club/ciencias', label: 'Club de Ciencias' },
      ],
    },
    {
      label: 'Cursos Online',
      submenu: [
        { href: '/cursos-online/matematica', label: 'Cursos de Matemática' },
        { href: '/cursos-online/programacion', label: 'Cursos de Programación' },
        { href: '/cursos-online/ciencias', label: 'Cursos de Ciencias' },
      ],
    },
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
              <div
                key={link.label}
                className="relative group"
                onMouseEnter={() => link.submenu && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {link.submenu ? (
                  <>
                    <button className="nav-link-landing flex items-center gap-2">
                      {link.label}
                      <svg
                        className="w-4 h-4 transition-transform group-hover:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {/* Dropdown Menu */}
                    {openDropdown === link.label && (
                      <div className="absolute top-full left-0 mt-2 min-w-[240px] bg-[#0a1428]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl py-2 z-50">
                        {link.submenu.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-5 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-all font-semibold text-sm"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={link.href!} className="nav-link-landing">
                    {link.label}
                  </Link>
                )}
              </div>
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
              <div key={link.label}>
                {link.submenu ? (
                  <div>
                    <div className="py-2 px-4 text-white font-semibold text-sm opacity-60 uppercase tracking-wide">
                      {link.label}
                    </div>
                    <div className="ml-4 space-y-1">
                      {link.submenu.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block py-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors font-medium text-sm"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={link.href!}
                    className="block py-2 px-4 text-white hover:bg-white/10 rounded-lg transition-colors font-semibold"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
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
          </div>
        )}
      </div>
    </nav>
  );
}
