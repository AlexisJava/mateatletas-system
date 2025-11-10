export default function Ticker365Section() {
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  return (
    <section className="ticker-365-section">
      <div className="ticker-365-container">
        <div className="ticker-365-content">
          {/* Badge */}
          <div className="ticker-365-badge">
            <span className="ticker-365-badge-icon">
              <span role="img" aria-label="Rayo - Siempre activo">⚡</span>
            </span>
            <span>SIEMPRE ACTIVO</span>
          </div>

          {/* Separador */}
          <div className="ticker-365-separator" aria-hidden="true"></div>

          {/* Texto principal */}
          <div className="ticker-365-text">
            <div className="ticker-365-text-main">365 DÍAS AL AÑO</div>
            <div className="ticker-365-text-sub">Aprendizaje continuo • Sin interrupciones</div>
          </div>

          {/* Separador */}
          <div className="ticker-365-separator" aria-hidden="true"></div>

          {/* Meses */}
          <div className="ticker-365-months" role="list" aria-label="Meses del año">
            {months.map((mes) => (
              <div key={mes} className="ticker-365-month" role="listitem">
                {mes}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
