import Link from 'next/link';

interface LinkItem {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: LinkItem[];
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const columns: FooterColumn[] = [
    {
      title: 'Producto',
      links: [
        { label: 'Club', href: '/club' },
        { label: 'Cursos Online', href: '/cursos-online' },
        { label: 'Colonia de Verano', href: '/colonia' },
        { label: 'Precios', href: '/#pricing' },
      ],
    },
    {
      title: 'Portales',
      links: [
        { label: 'Portal Estudiante', href: '/estudiante/login' },
        { label: 'Portal Tutor', href: '/tutor/login' },
        { label: 'Portal Docente', href: '/docente/login' },
        { label: 'Portal Admin', href: '/admin/login' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre Nosotros', href: '/nosotros' },
        { label: 'Equipo', href: '/nosotros#team' },
        { label: 'Contacto', href: '/nosotros#contact' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Términos y Condiciones', href: '/legal/terminos' },
        { label: 'Política de Privacidad', href: '/legal/privacidad' },
        { label: 'Cookies', href: '/legal/cookies' },
        { label: 'FAQ', href: '/#faq' },
      ],
    },
  ];

  const socialLinks = [
    { label: 'Instagram', href: '#', icon: 'IG' },
    { label: 'Facebook', href: '#', icon: 'FB' },
    { label: 'Twitter', href: '#', icon: 'TW' },
    { label: 'LinkedIn', href: '#', icon: 'LI' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column (2 cols on large screens) */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent">
                Mateatletas
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              Transformamos el aprendizaje de matemáticas en una aventura emocionante con gamificación, avatares 3D y clases en vivo.
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-[#0ea5e9] hover:to-[#0284c7] rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  aria-label={social.label}
                >
                  <span className="text-xs font-bold">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h3 className="text-lg font-black text-white mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-[#0ea5e9] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Features Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-gray-800">
          <div className="text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] bg-clip-text text-transparent mb-2">
              73
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Logros totales</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-[#FF6B35] to-[#fbbf24] bg-clip-text text-transparent mb-2">
              4
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Casas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-[#10b981] to-[#059669] bg-clip-text text-transparent mb-2">
              15+
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Niveles XP</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent mb-2">
              24%
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Descuento máx</div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500">
            © {currentYear} Mateatletas Club. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>Hecho con dedicación en Argentina</span>
            <div className="flex items-center space-x-2">
              <span>Powered by</span>
              <span className="font-bold text-[#0ea5e9]">Ready Player Me</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
