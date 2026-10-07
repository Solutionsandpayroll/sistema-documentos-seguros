"use client";
import "./dashboard.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardPage() {
  // ============================================================
  // USUARIO ACTUAL
  // ============================================================

  const [currentUser, setCurrentUser] = useState({
    name: "Administrador",
    role: "Administrador",
  });

  // ============================================================
  // DOCUMENTOS
  // ============================================================

  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  // ============================================================
  // CARGAR USUARIO DE LA SESIÓN
  // ============================================================

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(
        "docuportal_current_user"
      );

      if (savedUser) {
        const user = JSON.parse(savedUser);

        setCurrentUser({
          name: user.name || user.nombre || "Administrador",
          role: user.role || user.rol || "Administrador",
        });
      }
    } catch (error) {
      console.error(
        "Error cargando el usuario actual:",
        error
      );
    }
  }, []);

  // ============================================================
  // CARGAR DOCUMENTOS DESDE NEON
  // ============================================================

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoadingDocuments(true);

        const response = await fetch("/api/documentos", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Error consultando los documentos"
          );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setRecentDocuments(data);
        } else {
          setRecentDocuments([]);
        }
      } catch (error) {
        console.error(
          "Error cargando documentos:",
          error
        );

        setRecentDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    };

    loadDocuments();
  }, []);

  // ============================================================
  // OBTENER INICIALES DEL USUARIO
  // ============================================================

  const getInitials = (name) => {
    if (!name) {
      return "AD";
    }

    const words = name
      .trim()
      .split(" ")
      .filter(Boolean);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  };

  // ============================================================
  // CLASE DEL ESTADO
  // ============================================================

  const getStatusClass = (status) => {
    const normalizedStatus =
      status?.toLowerCase();

    if (normalizedStatus === "enviado") {
      return "blue";
    }

    if (normalizedStatus === "recibido") {
      return "green";
    }

    return "orange";
  };

  // ============================================================
  // TIPO DE ARCHIVO
  // ============================================================

  const getFileType = (fileName) => {
    if (!fileName) {
      return "FILE";
    }

    const parts = fileName.split(".");

    if (parts.length < 2) {
      return "FILE";
    }

    return parts[
      parts.length - 1
    ].toUpperCase();
  };

  // ============================================================
  // FORMATEAR FECHA
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(date).toLocaleDateString(
        "es-CO",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch (error) {
      return "";
    }
  };

  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  const totalDocuments =
    recentDocuments.length;

  const sentDocuments =
    recentDocuments.filter(
      (document) =>
        document.estado?.toLowerCase() ===
        "enviado"
    ).length;

  const receivedDocuments =
    recentDocuments.filter(
      (document) =>
        document.estado?.toLowerCase() ===
        "recibido"
    ).length;

  // ============================================================
  // DOCUMENTOS RECIENTES
  // ============================================================

  const documentsToShow =
    recentDocuments.slice(0, 4);

  const userInitials =
    getInitials(currentUser.name);

  return (
    <div className="dashboard-layout">

      {/* ========================================================
          MENÚ LATERAL
      ======================================================== */}

      <aside className="sidebar">

        {/* LOGO */}

        <div className="sidebar-brand">

          <div className="brand-logo">
            D
          </div>

          <div>
            <h2>DocuPortal</h2>

            <span>
              Portal documental
            </span>
          </div>

        </div>

        {/* NAVEGACIÓN */}

        <nav className="sidebar-navigation">

          <div className="navigation-section">
            PRINCIPAL
          </div>

          {/* DASHBOARD */}

          <Link
            href="/dashboard"
            className="navigation-item active"
          >
            <span className="navigation-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>
          </Link>

          {/* DOCUMENTOS */}

          <Link
            href="/dashboard/documents"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ▤
            </span>

            <span>
              Documentos
            </span>
          </Link>

          {/* ENVIADOS */}

          <Link
            href="/dashboard/documents?status=Enviado"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ↗
            </span>

            <span>
              Enviados
            </span>
          </Link>

          {/* RECIBIDOS */}

          <Link
            href="/dashboard/documents?status=Recibido"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ↙
            </span>

            <span>
              Recibidos
            </span>
          </Link>

          {/* TICKETS */}

          <Link
            href="/dashboard/tickets"
            className="navigation-item"
          >
            <span className="navigation-icon">
              □
            </span>

            <span>
              Tickets
            </span>
          </Link>

          {/* GESTIÓN */}

          <div className="navigation-section second-section">
            GESTIÓN
          </div>

          {/* HISTORIAL */}

          <Link
            href="/dashboard/history"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ◷
            </span>

            <span>
              Historial
            </span>
          </Link>

          {/* ADMINISTRACIÓN */}

          {currentUser.role === "Administrador" && (
            <Link
              href="/admin"
              className="navigation-item"
            >
              <span className="navigation-icon">
                ⚙
              </span>

              <span>
                Administración
              </span>
            </Link>
          )}

        </nav>

        {/* USUARIO */}

        <div className="sidebar-footer">

          <div className="sidebar-user">

            <div className="user-avatar">
              {userInitials}
            </div>

            <div className="sidebar-user-data">

              <strong>
                {currentUser.name}
              </strong>

              <span>
                {currentUser.role}
              </span>

            </div>

          </div>

          {/* CERRAR SESIÓN */}

          <LogoutButton className="logout-link">

            <span>
              ↪
            </span>

            Cerrar sesión

          </LogoutButton>

        </div>

      </aside>

      {/* ========================================================
          CONTENIDO PRINCIPAL
      ======================================================== */}

      <main className="dashboard-main">

        {/* ENCABEZADO */}

        <header className="dashboard-header">

          <div className="header-title">

            <span>
              PORTAL DOCUMENTAL
            </span>

            <h1>
              Dashboard
            </h1>

          </div>

          <div className="header-right">

            <div className="header-user">

              <div className="header-user-avatar">
                {userInitials}
              </div>

              <div className="header-user-data">

                <strong>
                  {currentUser.name}
                </strong>

                <span>
                  {currentUser.role}
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* CONTENIDO */}

        <div className="dashboard-content">

          {/* BIENVENIDA */}

          <section className="welcome-card">

            <div className="welcome-content">

              <span className="welcome-eyebrow">
                PANEL ADMINISTRATIVO
              </span>

              <h2>
                Hola,{" "}
                {currentUser.name.split(" ")[0]} 👋
              </h2>

              <p>
                Bienvenida al portal documental.
                Desde aquí puedes consultar los
                documentos del sistema, revisar
                el historial y realizar seguimiento
                de la actividad.
              </p>

            </div>

            <div className="welcome-action">

              <Link
                href="/dashboard/new"
                className="primary-button"
              >
                <span>
                  +
                </span>

                Nuevo documento
              </Link>

            </div>

          </section>

          {/* INDICADORES */}

          <section className="stats-grid">

            {/* DOCUMENTOS ENVIADOS */}

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon blue">
                  ↗
                </div>

                <span className="stat-label">
                  Documentos enviados
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  {sentDocuments}
                </strong>

                <span className="stat-description">
                  En el sistema
                </span>

              </div>

            </article>

            {/* DOCUMENTOS RECIBIDOS */}

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon green">
                  ↙
                </div>

                <span className="stat-label">
                  Documentos recibidos
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  {receivedDocuments}
                </strong>

                <span className="stat-description">
                  En el sistema
                </span>

              </div>

            </article>

            {/* TOTAL DOCUMENTOS */}

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon purple">
                  ▤
                </div>

                <span className="stat-label">
                  Total documentos
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  {totalDocuments}
                </strong>

                <span className="stat-description">
                  Registrados
                </span>

              </div>

            </article>

            {/* ACCESOS */}

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon orange">
                  ◷
                </div>

                <span className="stat-label">
                  Actividad
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  →
                </strong>

                <span className="stat-description">
                  Ver historial
                </span>

              </div>

            </article>

          </section>

          {/* CONTENIDO INFERIOR */}

          <section className="dashboard-columns">

            {/* DOCUMENTOS RECIENTES */}

            <div className="content-card">

              <div className="content-card-header">

                <div>

                  <span>
                    ACTIVIDAD RECIENTE
                  </span>

                  <h2>
                    Documentos recientes
                  </h2>

                </div>

                <Link
                  href="/dashboard/documents"
                  className="view-all-link"
                >
                  Ver todos
                </Link>

              </div>

              <div className="documents-list">

                {loadingDocuments ? (

                  <div className="recent-document">

                    <div className="recent-document-info">

                      <strong>
                        Cargando documentos...
                      </strong>

                    </div>

                  </div>

                ) : documentsToShow.length === 0 ? (

                  <div className="recent-document">

                    <div className="recent-document-info">

                      <strong>
                        No hay documentos registrados
                      </strong>

                      <span>
                        Los documentos aparecerán aquí
                        cuando se registren.
                      </span>

                    </div>

                  </div>

                ) : (

                  documentsToShow.map(
                    (document) => {

                      const fileType =
                        getFileType(
                          document.nombre_archivo
                        );

                      return (
                        <div
                          key={document.id}
                          className="recent-document"
                        >

                          {/* TIPO */}

                          <div
                            className={`document-type ${fileType.toLowerCase()}`}
                          >
                            {fileType}
                          </div>

                          {/* INFORMACIÓN */}

                          <div className="recent-document-info">

                            <strong>
                              {document.nombre_archivo}
                            </strong>

                            <span>
                              DOC-
                              {String(
                                document.id
                              ).padStart(3, "0")}
                              {" · "}
                              {formatDate(
                                document.creado_en
                              )}
                              {" · "}
                              {document.empresa ||
                                "Sin empresa"}
                            </span>

                          </div>

                          {/* ESTADO */}

                          <span
                            className={`status-badge ${getStatusClass(
                              document.estado
                            )}`}
                          >

                            <span className="status-dot"></span>

                            {document.estado ||
                              "Pendiente"}

                          </span>

                        </div>
                      );
                    }
                  )

                )}

              </div>

            </div>

            {/* RESUMEN DEL SISTEMA */}

            <div className="content-card">

              <div className="content-card-header">

                <div>

                  <span>
                    RESUMEN
                  </span>

                  <h2>
                    Estado del sistema
                  </h2>

                </div>

                <Link
                  href="/dashboard/history"
                  className="view-all-link"
                >
                  Ver historial
                </Link>

              </div>

              <div className="tickets-list">

                <div className="ticket-item">

                  <div className="ticket-icon">
                    ✓
                  </div>

                  <div className="ticket-info">

                    <strong>
                      Documentos registrados
                    </strong>

                    <span>
                      {totalDocuments} documentos
                      en el sistema
                    </span>

                  </div>

                </div>

                <div className="ticket-item">

                  <div className="ticket-icon">
                    ↗
                  </div>

                  <div className="ticket-info">

                    <strong>
                      Documentos enviados
                    </strong>

                    <span>
                      {sentDocuments} documentos
                      enviados
                    </span>

                  </div>

                </div>

                <div className="ticket-item">

                  <div className="ticket-icon">
                    🔐
                  </div>

                  <div className="ticket-info">

                    <strong>
                      Accesos y actividad
                    </strong>

                    <span>
                      Consulta el historial del sistema
                    </span>

                  </div>

                </div>

              </div>

              <div className="ticket-footer">

                <Link
                  href="/dashboard/history"
                  className="secondary-button"
                >
                  Ver actividad
                </Link>

              </div>

            </div>

          </section>

          {/* ACCESO RÁPIDO */}

          <section className="quick-actions">

            <div className="quick-actions-header">

              <span>
                ACCIONES RÁPIDAS
              </span>

              <h2>
                ¿Qué deseas hacer?
              </h2>

            </div>

            <div className="quick-actions-grid">

              {/* NUEVO DOCUMENTO */}

              <Link
                href="/dashboard/new"
                className="quick-action"
              >

                <div className="quick-action-icon blue">
                  +
                </div>

                <div>

                  <strong>
                    Nuevo documento
                  </strong>

                  <span>
                    Cargar y enviar un documento
                  </span>

                </div>

                <span className="quick-action-arrow">
                  →
                </span>

              </Link>

              {/* CONSULTAR DOCUMENTOS */}

              <Link
                href="/dashboard/documents"
                className="quick-action"
              >

                <div className="quick-action-icon green">
                  ▤
                </div>

                <div>

                  <strong>
                    Consultar documentos
                  </strong>

                  <span>
                    Ver los documentos del sistema
                  </span>

                </div>

                <span className="quick-action-arrow">
                  →
                </span>

              </Link>

              {/* HISTORIAL */}

              <Link
                href="/dashboard/history"
                className="quick-action"
              >

                <div className="quick-action-icon orange">
                  ◷
                </div>

                <div>

                  <strong>
                    Consultar historial
                  </strong>

                  <span>
                    Revisar la actividad del sistema
                  </span>

                </div>

                <span className="quick-action-arrow">
                  →
                </span>

              </Link>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}