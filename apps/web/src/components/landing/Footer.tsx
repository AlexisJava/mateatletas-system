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
            <span className="terminal-prompt">$</span>{' '}
            <span className="terminal-command">cat about.txt</span>
            <span className="cursor" />
          </div>
          <div className="terminal-output">
            Plataforma educativa STEAM con gamificación inmersiva.
            <br />
            120+ estudiantes activos | 15 cursos | 4 casas épicas
            <br />
            Transformando el aprendizaje en Argentina y LATAM.
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-10 pt-10 border-t border-[#0ea5e9]/30">
            {/* Navigate */}
            <div>
              <h4 className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-5">
                // NAVIGATE
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/club" className="terminal-link">
                    cd ~/club
                  </Link>
                </li>
                <li>
                  <Link href="#casas" className="terminal-link">
                    cd ~/casas
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="terminal-link">
                    cd ~/pricing
                  </Link>
                </li>
                <li>
                  <Link href="/estudiante/gimnasio" className="terminal-link">
                    cd ~/dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Learn */}
            <div>
              <h4 className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-5">
                // LEARN
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/cursos-online" className="terminal-link">
                    ./cursos.sh
                  </Link>
                </li>
                <li>
                  <Link href="/club" className="terminal-link">
                    ./clases-vivo.py
                  </Link>
                </li>
                <li>
                  <Link href="/colonia" className="terminal-link">
                    ./colonia.js
                  </Link>
                </li>
                <li>
                  <Link href="/estudiante/gamificacion" className="terminal-link">
                    ./gamificacion.lua
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-5">
                // CONNECT
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="terminal-link">
                    ping instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="terminal-link">
                    ping facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="terminal-link">
                    ping twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="terminal-link">
                    ping linkedin
                  </a>
                </li>
              </ul>
            </div>

            {/* System */}
            <div>
              <h4 className="text-[#0ea5e9] text-xs font-black uppercase tracking-widest mb-5">
                // SYSTEM
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/nosotros" className="terminal-link">
                    man ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terminos" className="terminal-link">
                    cat terminos.txt
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacidad" className="terminal-link">
                    cat privacidad.txt
                  </Link>
                </li>
                <li>
                  <Link href="/nosotros#contact" className="terminal-link">
                    sudo contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="terminal-line mt-10">
            <span className="terminal-prompt">$</span>{' '}
            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              © {currentYear} Mateatletas | Coded with ❤️ in Neuquén, Argentina
            </span>
            <span className="cursor" />
          </div>
        </div>
      </div>
    </footer>
  );
}
