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
          <span className="terminal-title">mateatletas@colonia:~$</span>
        </div>

        {/* Terminal Body */}
        <div className="terminal-body">
          {/* About */}
          <div className="terminal-line">
            <span className="terminal-prompt text-2xl">$</span>{' '}
            <span className="terminal-command text-2xl">cat colonia-info.txt</span>
          </div>
          <div className="terminal-output text-xl leading-relaxed">
            Colonia de Verano STEAM 2026 | 5 Enero - 3 Marzo
            <br />
            11 cursos de matemática, programación y ciencias
            <br />
            Virtual en vivo por Google Meet | Grupos reducidos
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mt-10 pt-10 border-t border-[#0ea5e9]/30">
            {/* Colonia */}
            <div>
              <h4 className="text-[#fbbf24] text-lg font-black uppercase tracking-widest mb-6">
                // COLONIA
              </h4>
              <ul className="space-y-4">
                <li>
                  <a href="#cursos" className="terminal-link text-xl">
                    cd ~/cursos
                  </a>
                </li>
                <li>
                  <a href="#horarios" className="terminal-link text-xl">
                    cd ~/horarios
                  </a>
                </li>
                <li>
                  <a href="#precios" className="terminal-link text-xl">
                    cd ~/precios
                  </a>
                </li>
                <li>
                  <a href="#faq" className="terminal-link text-xl">
                    cd ~/faq
                  </a>
                </li>
              </ul>
            </div>

            {/* Navigate */}
            <div>
              <h4 className="text-[#0ea5e9] text-lg font-black uppercase tracking-widest mb-6">
                // PLATAFORMA
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/" className="terminal-link text-xl">
                    cd ~/home
                  </Link>
                </li>
                <li>
                  <Link href="/club" className="terminal-link text-xl">
                    cd ~/club
                  </Link>
                </li>
                <li>
                  <Link href="/cursos-online" className="terminal-link text-xl">
                    cd ~/cursos-online
                  </Link>
                </li>
                <li>
                  <Link href="/estudiante/gimnasio" className="terminal-link text-xl">
                    cd ~/panel
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-[#10b981] text-lg font-black uppercase tracking-widest mb-6">
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
              <h4 className="text-[#f43f5e] text-lg font-black uppercase tracking-widest mb-6">
                // LEGAL
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
