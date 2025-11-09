import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-transparent py-16">
      <div className="footer-terminal">
        {/* Terminal Header */}
        <div className="terminal-header">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-title">mateatletas@terminal:~$</span>
        </div>

        {/* Terminal Body */}
        <div className="terminal-body">
          {/* About */}
          <div className="terminal-line">
            <span className="terminal-prompt text-2xl">$</span>{' '}
            <span className="terminal-command text-2xl">cat about.txt</span>
          </div>
          <div className="terminal-output text-xl leading-relaxed">
            Plataforma educativa STEAM con gamificación inmersiva.
            <br />
            120+ estudiantes activos | 15 cursos épicos
            <br />
            Transformando el aprendizaje en Argentina y LATAM.
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-10 pt-10 border-t border-[#0ea5e9]/30">
            {/* Navigate */}
            <div>
              <h4 className="text-[#0ea5e9] text-lg font-black uppercase tracking-widest mb-6">
                // NAVEGAR
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/club" className="terminal-link text-xl">
                    cd ~/club
                  </Link>
                </li>
                <li>
                  <Link href="#casas" className="terminal-link text-xl">
                    cd ~/casas
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="terminal-link text-xl">
                    cd ~/precios
                  </Link>
                </li>
                <li>
                  <Link href="/estudiante/gimnasio" className="terminal-link text-xl">
                    cd ~/panel
                  </Link>
                </li>
              </ul>
            </div>

            {/* Learn */}
            <div>
              <h4 className="text-[#0ea5e9] text-lg font-black uppercase tracking-widest mb-6">
                // APRENDER
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/cursos-online" className="terminal-link text-xl">
                    ./cursos.sh
                  </Link>
                </li>
                <li>
                  <Link href="/club" className="terminal-link text-xl">
                    ./clases-vivo.py
                  </Link>
                </li>
                <li>
                  <Link href="/colonia" className="terminal-link text-xl">
                    ./colonia.js
                  </Link>
                </li>
                <li>
                  <Link href="/estudiante/gamificacion" className="terminal-link text-xl">
                    ./gamificacion.lua
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-[#0ea5e9] text-lg font-black uppercase tracking-widest mb-6">
                // CONECTAR
              </h4>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="terminal-link text-xl">
                    ping instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="terminal-link text-xl">
                    ping facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="terminal-link text-xl">
                    ping twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="terminal-link text-xl">
                    ping linkedin
                  </a>
                </li>
              </ul>
            </div>

            {/* System */}
            <div>
              <h4 className="text-[#0ea5e9] text-lg font-black uppercase tracking-widest mb-6">
                // SISTEMA
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/nosotros" className="terminal-link text-xl">
                    man ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terminos" className="terminal-link text-xl">
                    cat terminos.txt
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacidad" className="terminal-link text-xl">
                    cat privacidad.txt
                  </Link>
                </li>
                <li>
                  <Link href="/nosotros#contact" className="terminal-link text-xl">
                    sudo contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="terminal-line mt-10">
            <span className="terminal-prompt text-2xl">$</span>{' '}
            <span className="text-xl" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              © {currentYear} Mateatletas | Coded with ❤️ in Neuquén, Argentina
            </span>
            <span className="cursor" />
          </div>
        </div>
      </div>
    </footer>
  );
}
