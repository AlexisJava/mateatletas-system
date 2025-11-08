'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SubMenuItem {
  href: string;
  label: string;
  icon: string;
  color: string;
  gradient: string;
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
        {
          href: '/club/matematica',
          label: 'Matemática',
          icon: '🔢',
          color: '#fbbf24',
          gradient: 'from-[#fbbf24] to-[#f59e0b]',
        },
        {
          href: '/club/programacion',
          label: 'Programación',
          icon: '💻',
          color: '#0ea5e9',
          gradient: 'from-[#0ea5e9] to-[#0284c7]',
        },
        {
          href: '/club/ciencias',
          label: 'Ciencias',
          icon: '🔬',
          color: '#FF6B35',
          gradient: 'from-[#FF6B35] to-[#e65929]',
        },
      ],
    },
    {
      label: 'Cursos Online',
      submenu: [
        {
          href: '/cursos-online/matematica',
          label: 'Matemática',
          icon: '🔢',
          color: '#fbbf24',
          gradient: 'from-[#fbbf24] to-[#f59e0b]',
        },
        {
          href: '/cursos-online/programacion',
          label: 'Programación',
          icon: '💻',
          color: '#0ea5e9',
          gradient: 'from-[#0ea5e9] to-[#0284c7]',
        },
        {
          href: '/cursos-online/ciencias',
          label: 'Ciencias',
          icon: '🔬',
          color: '#FF6B35',
          gradient: 'from-[#FF6B35] to-[#e65929]',
        },
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
                    <button className="nav-link-landing">
                      {link.label}
                    </button>
                    {/* Dropdown Menu - Mega Menu Style */}
                    {openDropdown === link.label && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-[#0a1428]/98 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl p-4 z-50">
                        <div className="grid grid-cols-3 gap-3">
                          {link.submenu.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="group/item relative p-5 rounded-xl border-2 border-transparent hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent hover:scale-105"
                              style={{
                                boxShadow: `0 0 0 rgba(${item.color === '#0ea5e9' ? '14, 165, 233' : item.color === '#fbbf24' ? '251, 191, 36' : '255, 107, 53'}, 0)`,
                              }}
                              onMouseEnter={(e) => {
                                const rgb = item.color === '#0ea5e9' ? '14, 165, 233' : item.color === '#fbbf24' ? '251, 191, 36' : '255, 107, 53';
                                e.currentTarget.style.boxShadow = `0 0 30px rgba(${rgb}, 0.5)`;
                                e.currentTarget.style.borderColor = item.color;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 0 0 rgba(0, 0, 0, 0)';
                                e.currentTarget.style.borderColor = 'transparent';
                              }}
                            >
                              {/* Icon con gradiente */}
                              <div
                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl mb-3 shadow-lg group-hover/item:scale-110 transition-transform`}
                              >
                                {item.icon}
                              </div>

                              {/* Label */}
                              <div className="text-white font-bold text-base group-hover/item:text-white transition-colors">
                                {item.label}
                              </div>

                              {/* Arrow indicator */}
                              <div
                                className="absolute bottom-3 right-3 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                style={{ color: item.color }}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </div>
                            </Link>
                          ))}
                        </div>
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
                    <div className="space-y-2 px-2">
                      {link.submenu.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 py-3 px-4 rounded-lg border-2 border-transparent hover:border-white/20 transition-all bg-gradient-to-r from-white/5 to-transparent"
                          style={{
                            boxShadow: `0 0 0 rgba(0,0,0,0)`,
                          }}
                          onMouseEnter={(e) => {
                            const rgb = item.color === '#0ea5e9' ? '14, 165, 233' : item.color === '#fbbf24' ? '251, 191, 36' : '255, 107, 53';
                            e.currentTarget.style.boxShadow = `0 0 20px rgba(${rgb}, 0.4)`;
                            e.currentTarget.style.borderColor = item.color;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
                          onClick={() => setIsOpen(false)}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-md`}
                          >
                            {item.icon}
                          </div>
                          <span className="text-white font-semibold text-sm">
                            {item.label}
                          </span>
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
