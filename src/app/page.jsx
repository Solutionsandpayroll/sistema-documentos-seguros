import Link from "next/link";
import "./home.css";

export default function HomePage() {
  return (
    <main className="home-page">

      {/* ======================================================
          FONDO DECORATIVO
      ====================================================== */}

      <div className="home-background">
        <div className="home-circle home-circle-one"></div>
        <div className="home-circle home-circle-two"></div>
        <div className="home-grid"></div>
      </div>

      {/* ======================================================
          CONTENIDO
      ====================================================== */}

      <section className="home-container">

        {/* ==================================================
            LOGO
        ================================================== */}

        <header className="home-header">

          <Link
            href="/"
            className="home-brand"
          >

            <div className="home-logo">
              D
            </div>

            <div>
              <strong>
                DOCUPORTAL
              </strong>

              <span>
                Portal documental
              </span>
            </div>

          </Link>

          <div className="home-header-actions">

            <Link
              href="/login"
              className="home-login-link"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/registro"
              className="home-register-link"
            >
              Crear cuenta
            </Link>

          </div>

        </header>

        {/* ==================================================
            HERO
        ================================================== */}

        <div className="home-hero">

          <div className="home-content">

            <div className="home-badge">
              <span className="home-badge-dot"></span>
              Plataforma documental
            </div>

            <h1>
              Todos tus documentos,
              <span>
                en un solo lugar.
              </span>
            </h1>

            <p>
              Gestiona, organiza y consulta tus
              documentos de manera rápida, segura
              y sencilla desde una sola plataforma.
            </p>

            <div className="home-actions">

              <Link
                href="/login"
                className="home-primary-button"
              >
                Iniciar sesión
                <span>→</span>
              </Link>

              <Link
                href="/registro"
                className="home-secondary-button"
              >
                Crear una cuenta
              </Link>

            </div>

            <div className="home-security">

              <span className="home-security-icon">
                ✓
              </span>

              <span>
                Acceso seguro y gestión centralizada
              </span>

            </div>

          </div>

          {/* ==================================================
              VISTA PREVIA
          ================================================== */}

          <div className="home-preview-wrapper">

            <div className="home-preview-glow"></div>

            <div className="home-preview">

              {/* Barra superior */}

              <div className="preview-header">

                <div className="preview-dots">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

                <span>
                  DocuPortal
                </span>

                <div className="preview-header-status">
                  ●
                </div>

              </div>

              {/* Cuerpo */}

              <div className="preview-body">

                {/* Sidebar */}

                <div className="preview-sidebar">

                  <div className="preview-sidebar-logo">
                    D
                  </div>

                  <div className="preview-menu active">
                    <span></span>
                  </div>

                  <div className="preview-menu">
                    <span></span>
                  </div>

                  <div className="preview-menu">
                    <span></span>
                  </div>

                  <div className="preview-menu">
                    <span></span>
                  </div>

                  <div className="preview-sidebar-bottom">
                    <span></span>
                  </div>

                </div>

                {/* Contenido */}

                <div className="preview-main">

                  <div className="preview-main-top">

                    <div>
                      <div className="preview-title"></div>
                      <div className="preview-subtitle"></div>
                    </div>

                    <div className="preview-avatar">
                      G
                    </div>

                  </div>

                  {/* Tarjetas */}

                  <div className="preview-cards">

                    <div className="preview-card">

                      <div className="preview-card-icon">
                        ▣
                      </div>

                      <strong>
                        24
                      </strong>

                      <span>
                        Documentos
                      </span>

                    </div>

                    <div className="preview-card">

                      <div className="preview-card-icon">
                        ✓
                      </div>

                      <strong>
                        12
                      </strong>

                      <span>
                        Recientes
                      </span>

                    </div>

                    <div className="preview-card">

                      <div className="preview-card-icon">
                        ↗
                      </div>

                      <strong>
                        08
                      </strong>

                      <span>
                        Compartidos
                      </span>

                    </div>

                  </div>

                  {/* Tabla */}

                  <div className="preview-table-container">

                    <div className="preview-table-header">

                      <span>
                        DOCUMENTOS RECIENTES
                      </span>

                      <span>
                        VER TODOS
                      </span>

                    </div>

                    <div className="preview-table">

                      <div className="preview-row">

                        <div className="preview-file-icon">
                          PDF
                        </div>

                        <div className="preview-row-info">

                          <div className="preview-line preview-line-main"></div>
                          <div className="preview-line preview-line-small"></div>

                        </div>

                        <div className="preview-status">
                          ✓
                        </div>

                      </div>

                      <div className="preview-row">

                        <div className="preview-file-icon">
                          XLS
                        </div>

                        <div className="preview-row-info">

                          <div className="preview-line preview-line-main"></div>
                          <div className="preview-line preview-line-small"></div>

                        </div>

                        <div className="preview-status">
                          ✓
                        </div>

                      </div>

                      <div className="preview-row">

                        <div className="preview-file-icon">
                          DOC
                        </div>

                        <div className="preview-row-info">

                          <div className="preview-line preview-line-main"></div>
                          <div className="preview-line preview-line-small"></div>

                        </div>

                        <div className="preview-status">
                          ✓
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            CARACTERÍSTICAS
        ================================================== */}

        <div className="home-bottom">

          <div className="home-bottom-item">

            <span className="home-bottom-icon">
              ✓
            </span>

            <div>
              <strong>
                Gestión centralizada
              </strong>

              <span>
                Todo organizado en un solo lugar.
              </span>
            </div>

          </div>

          <div className="home-bottom-divider"></div>

          <div className="home-bottom-item">

            <span className="home-bottom-icon">
              ↗
            </span>

            <div>
              <strong>
                Seguimiento
              </strong>

              <span>
                Consulta la actividad de tus documentos.
              </span>
            </div>

          </div>

          <div className="home-bottom-divider"></div>

          <div className="home-bottom-item">

            <span className="home-bottom-icon">
              🔒
            </span>

            <div>
              <strong>
                Acceso seguro
              </strong>

              <span>
                Protege la información de tu empresa.
              </span>
            </div>

          </div>

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="home-footer">
          © 2026 DocuPortal · Portal documental
        </footer>

      </section>

    </main>
  );
}