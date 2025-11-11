'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SubMenuItem {
  href: string;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
}

interface NavLink {
  href?: string;
  label: string;
  submenu?: {
    title: string;
    subtitle: string;
    footer: string;
    titleColor: string;
    footerColor: string;
    items: SubMenuItem[];
  };
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navLinks: NavLink[] = [
    {
      label: 'Club',
      submenu: {
        title: '💎 Suscripción Mensual',
        subtitle: 'Clases en vivo con profesor todo el año',
        footer: 'Online desde tu casa',
        titleColor: '#fbbf24',
        footerColor: '#fbbf24',
        items: [
          {
            href: '/club/matematica',
            label: 'Matemática',
            icon: '🔢',
            color: '#fbbf24',
            gradient: 'from-[#fbbf24] to-[#f59e0b]',
            description: 'Desde álgebra hasta cálculo',
          },
          {
            href: '/club/programacion',
            label: 'Programación',
            icon: '💻',
            color: '#0ea5e9',
            gradient: 'from-[#0ea5e9] to-[#0284c7]',
            description: 'Crean juegos y aplicaciones reales',
          },
          {
            href: '/club/ciencias',
            label: 'Ciencias',
            icon: '🔬',
            color: '#FF6B35',
            gradient: 'from-[#FF6B35] to-[#e65929]',
            description: 'Experimentos fascinantes cada semana',
          },
        ],
      },
    },
    {
      label: 'Cursos Online',
      submenu: {
        title: '📚 Cursos Online',
        subtitle: 'Elige la modalidad que mejor se adapte a ti',
        footer: '🎓 Flexibilidad y calidad premium',
        titleColor: '#8b5cf6',
        footerColor: '#8b5cf6',
        items: [
          {
            href: '/cursos-online/sincronicos',
            label: 'Sincrónicos',
            icon: '🎥',
            color: '#8b5cf6',
            gradient: 'from-[#8b5cf6] to-[#7c3aed]',
            description: 'Clases en vivo con docentes',
          },
          {
            href: '/cursos-online/asincronicos',
            label: 'Asincrónicos',
            icon: '📚',
            color: '#0ea5e9',
            gradient: 'from-[#0ea5e9] to-[#0284c7]',
            description: 'Estudia a tu ritmo 24/7',
          },
        ],
      },
    },
    { href: '/colonia-verano-2025', label: 'Colonia Verano 2026' },
    { href: '/nosotros', label: 'Nosotros' },
  ];

  return (
    <nav className="navbar-landing">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start group">
            <span className="text-3xl font-black title-gradient leading-none">Mateatletas</span>
            <span className="logo-subtitle">CLUB STEAM</span>
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
                    <button
                      className="nav-link-landing"
                      onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setOpenDropdown(openDropdown === link.label ? null : link.label);
                        }
                        if (e.key === 'Escape') {
                          setOpenDropdown(null);
                        }
                      }}
                      aria-haspopup="true"
                      aria-expanded={openDropdown === link.label}
                      aria-label={`Menú ${link.label}`}
                    >
                      {link.label}
                    </button>
                    {/* Dropdown Menu - Mega Menu Style */}
                    {openDropdown === link.label && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-[700px] bg-[#0a1428]/98 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl p-6 pt-10 z-50"
                        style={{ marginTop: '10px' }}
                        role="menu"
                        aria-label={`Submenú de ${link.label}`}
                      >
                        {/* Bridge invisible para mantener hover */}
                        <div
                          className="absolute -top-[10px] left-0 right-0 h-[10px]"
                          style={{ background: 'transparent' }}
                        />

                        {/* Header con título y subtítulo */}
                        <div className="text-center mb-6 pb-5 border-b border-white/10">
                          <h3
                            className="text-2xl font-bold mb-2"
                            style={{ color: link.submenu.titleColor }}
                            id={`${link.label}-menu-title`}
                          >
                            {link.submenu.title}
                          </h3>
                          <p className="text-sm text-white/60">{link.submenu.subtitle}</p>
                        </div>

                        {/* Grid de mundos */}
                        <div className={`grid gap-4 ${link.submenu.items.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`} role="list">
                          {link.submenu.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="group/item relative p-5 rounded-xl border-2 border-transparent hover:border-white/20 transition-all duration-300 bg-gradient-to-br from-white/5 to-transparent hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0a1428]"
                              style={{
                                boxShadow: `0 0 0 rgba(${
                                  item.color === '#0ea5e9'
                                    ? '14, 165, 233'
                                    : item.color === '#fbbf24'
                                      ? '251, 191, 36'
                                      : '255, 107, 53'
                                }, 0)`,
                              }}
                              onMouseEnter={(e) => {
                                const rgb =
                                  item.color === '#0ea5e9'
                                    ? '14, 165, 233'
                                    : item.color === '#fbbf24'
                                      ? '251, 191, 36'
                                      : '255, 107, 53';
                                e.currentTarget.style.boxShadow = `0 0 30px rgba(${rgb}, 0.5)`;
                                e.currentTarget.style.borderColor = item.color;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 0 0 rgba(0, 0, 0, 0)';
                                e.currentTarget.style.borderColor = 'transparent';
                              }}
                              role="menuitem"
                              aria-label={`${item.label} - ${item.description}`}
                            >
                              {/* Icon con gradiente */}
                              <div
                                className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-3xl mb-3 shadow-lg group-hover/item:scale-110 transition-transform`}
                              >
                                <span role="img" aria-label={`Icono de ${item.label}`}>{item.icon}</span>
                              </div>

                              {/* Label */}
                              <div className="text-white font-bold text-base mb-2 group-hover/item:text-white transition-colors">
                                {item.label}
                              </div>

                              {/* Description */}
                              <div className="text-xs text-white/60 leading-relaxed">
                                {item.description}
                              </div>

                              {/* Arrow indicator */}
                              <div
                                className="absolute bottom-3 right-3 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                style={{ color: item.color }}
                                aria-hidden="true"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Footer con precio/info */}
                        <div
                          className="mt-5 pt-5 border-t border-white/10 text-center text-sm font-semibold"
                          style={{ color: link.submenu.footerColor }}
                        >
                          {link.submenu.footer}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href!}
                    className="nav-link-landing"
                    aria-label={link.label}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="px-7 py-3 bg-transparent border-3 border-[#10b981] rounded-xl text-[#10b981] font-bold transition-all hover:bg-[#10b981] hover:text-white"
            >
              Familias
            </Link>
            <Link
              href="/estudiante-login"
              className="px-7 py-3 bg-transparent border-3 border-[#0ea5e9] rounded-xl text-[#0ea5e9] font-bold transition-all hover:bg-[#0ea5e9] hover:text-white"
            >
              Estudiantes
            </Link>
            <Link
              href="/docente-login"
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
                className={`block h-0.5 bg-white transition-all ${isOpen ? 'opacity-0' : ''}`}
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
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.submenu ? (
                  <div>
                    <div className="py-3 px-4 rounded-lg bg-white/5 border border-white/10 mb-3">
                      <div
                        className="font-bold text-lg mb-1"
                        style={{ color: link.submenu.titleColor }}
                      >
                        {link.submenu.title}
                      </div>
                      <div className="text-xs text-white/60">{link.submenu.subtitle}</div>
                    </div>
                    <div className="space-y-2 px-2">
                      {link.submenu.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 py-3 px-4 rounded-lg border-2 border-transparent hover:border-white/20 transition-all bg-gradient-to-r from-white/5 to-transparent"
                          style={{
                            boxShadow: `0 0 0 rgba(0,0,0,0)`,
                          }}
                          onMouseEnter={(e) => {
                            const rgb =
                              item.color === '#0ea5e9'
                                ? '14, 165, 233'
                                : item.color === '#fbbf24'
                                  ? '251, 191, 36'
                                  : '255, 107, 53';
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
                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-xl flex-shrink-0 shadow-md`}
                          >
                            <span role="img" aria-label={`Icono de ${item.label}`}>{item.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-semibold text-sm">{item.label}</div>
                            <div className="text-xs text-white/60">{item.description}</div>
                          </div>
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
                href="/login"
                className="block py-2 px-4 text-[#10b981] font-bold hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Familias
              </Link>
              <Link
                href="/estudiante-login"
                className="block py-2 px-4 text-[#0ea5e9] font-bold hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Estudiantes
              </Link>
              <Link
                href="/docente-login"
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
