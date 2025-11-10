export default function PaymentLogicSection() {
  return (
    <section className="payment-logic-section">
      <div className="payment-logic-container">
        {/* Header */}
        <div className="payment-logic-header">
          <div className="payment-logic-badge">
            <span>💳</span>
            <span>CÓMO FUNCIONA</span>
          </div>
          <h2 className="payment-logic-title">¿Cómo funciona el pago?</h2>
          <p className="payment-logic-subtitle">
            Tu fecha de inscripción determina cuándo comienza tu acceso
          </p>
        </div>

        {/* Timeline Cards */}
        <div className="payment-logic-timeline">
          {/* Card 1: Días 1-15 */}
          <div className="payment-logic-card payment-logic-card-blue">
            <div className="payment-logic-card-icon">
              <span role="img" aria-label="Calendario - Días 1 al 15">📅</span>
            </div>
            <div className="payment-logic-card-range">Días 1 - 15</div>
            <h3 className="payment-logic-card-title">Inscripción + Primera Cuota</h3>
            <p className="payment-logic-card-desc">
              Pagás inscripción y tu primera cuota mensual. Comenzás a aprender inmediatamente.
            </p>
            <ul className="payment-logic-card-list">
              <li>✓ Acceso inmediato</li>
              <li>✓ Inicio ese mismo mes</li>
              <li>✓ Dos pagos en uno</li>
            </ul>
          </div>

          {/* Card 2: Días 16-31 */}
          <div className="payment-logic-card payment-logic-card-purple">
            <div className="payment-logic-card-icon">
              <span role="img" aria-label="Calendario - Días 16 al 31">📆</span>
            </div>
            <div className="payment-logic-card-range">Días 16 - 31</div>
            <h3 className="payment-logic-card-title">Solo Inscripción</h3>
            <p className="payment-logic-card-desc">
              Pagás solo la inscripción. Tu primera cuota será el mes siguiente cuando comiences.
            </p>
            <ul className="payment-logic-card-list">
              <li>✓ Pago único de inscripción</li>
              <li>✓ Inicio el mes próximo</li>
              <li>✓ Reservás tu lugar</li>
            </ul>
          </div>
        </div>

        {/* Nota al pie */}
        <div className="payment-logic-note">
          <span className="payment-logic-note-icon">
            <span role="img" aria-label="Bombilla - Información importante">💡</span>
          </span>
          <p className="payment-logic-note-text">
            <strong>Ejemplo:</strong> Si te inscribís el 10 de enero, pagás inscripción + cuota de enero.
            Si te inscribís el 20 de enero, pagás solo inscripción y comenzás en febrero.
          </p>
        </div>
      </div>
    </section>
  );
}
