import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">

      {/* Fondo decorativo */}
      <div className="home-background">
        <div className="home-circle home-circle-one"></div>
        <div className="home-circle home-circle-two"></div>
      </div>

      <section className="home-container">

        {/* Logo */}
        <div className="home-brand">
          <div className="home-logo">
            D
          </div>

          <span>DOCUPORTAL</span>
        </div>

        {/* Contenido principal */}
        <div className="home-content">

          <div className="home-badge">
            Plataforma documental
          </div>

          <h1>
            Todos tus documentos,
            <span> en un solo lugar.</span>
          </h1>

          <p>
            Gestiona, organiza y consulta tus documentos de manera
            rápida, segura y sencilla desde una sola plataforma.
          </p>

          <div className="home-actions">
            <Link href="/dashboard" className="primary-button">
              Ir al Dashboard
              <span>→</span>
            </Link>

            <span className="home-security">
              🔒 Acceso seguro
            </span>
          </div>

        </div>

        {/* Tarjeta visual */}
        <div className="home-preview">

          <div className="preview-header">
            <div className="preview-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <span>Portal Documental</span>
          </div>

          <div className="preview-body">

            <div className="preview-sidebar">
              <div className="preview-sidebar-logo">D</div>

              <div className="preview-menu active"></div>
              <div className="preview-menu"></div>
              <div className="preview-menu"></div>
              <div className="preview-menu"></div>
            </div>

            <div className="preview-main">

              <div className="preview-title"></div>

              <div className="preview-cards">
                <div className="preview-card">
                  <strong>24</strong>
                  <span>Documentos</span>
                </div>

                <div className="preview-card">
                  <strong>12</strong>
                  <span>Recientes</span>
                </div>

                <div className="preview-card">
                  <strong>08</strong>
                  <span>Compartidos</span>
                </div>
              </div>

              <div className="preview-table">

                <div className="preview-row">
                  <div className="preview-file"></div>
                  <div className="preview-line"></div>
                  <div className="preview-status"></div>
                </div>

                <div className="preview-row">
                  <div className="preview-file"></div>
                  <div className="preview-line"></div>
                  <div className="preview-status"></div>
                </div>

                <div className="preview-row">
                  <div className="preview-file"></div>
                  <div className="preview-line"></div>
                  <div className="preview-status"></div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}