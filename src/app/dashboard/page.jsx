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
  const [documentsError, setDocumentsError] = useState("");

  // ============================================================
  // CARGAR USUARIO DE LA SESIÓN
  // ============================================================

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch(
          "/api/usuarios/sesion",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          console.error(
            "No fue posible obtener la sesión."
          );
          return;
        }

        const data = await response.json();

        if (!data.success || !data.usuario) {
          console.error(
            "La sesión no contiene un usuario válido."
          );
          return;
        }

        const user = data.usuario;

        setCurrentUser({
          name:
            user.nombre ||
            user.name ||
            "Administrador",

          role:
            user.rol ||
            user.role ||
            "Administrador",
        });
      } catch (error) {
        console.error(
          "Error cargando el usuario actual:",
          error
        );
      }
    };

    loadCurrentUser();
  }, []);

  // ============================================================
  // CARGAR DOCUMENTOS REALES DESDE NEON
  // ============================================================

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoadingDocuments(true);
        setDocumentsError("");

        const response = await fetch(
          "/api/documentos",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "No fue posible consultar los documentos."
          );
        }

        const data = await response.json();

        // ======================================================
        // LA API PUEDE DEVOLVER DIRECTAMENTE UN ARRAY
        // O UN OBJETO CON documents/documentos
        // ======================================================

        let documents = [];

        if (Array.isArray(data)) {
          documents = data;
        } else if (Array.isArray(data.documentos)) {
          documents = data.documentos;
        } else if (Array.isArray(data.documents)) {
          documents = data.documents;
        }

        // ======================================================
        // ORDENAR DEL MÁS RECIENTE AL MÁS ANTIGUO
        // ======================================================

        documents.sort((a, b) => {
          const dateA = new Date(
            a.creado_en ||
              a.created_at ||
              a.fecha ||
              0
          ).getTime();

          const dateB = new Date(
            b.creado_en ||
              b.created_at ||
              b.fecha ||
              0
          ).getTime();

          return dateB - dateA;
        });

        setRecentDocuments(documents);
      } catch (error) {
        console.error(
          "Error cargando documentos:",
          error
        );

        setRecentDocuments([]);

        setDocumentsError(
          "No fue posible cargar los documentos."
        );
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
      status?.trim().toLowerCase();

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
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        return "";
      }

      return parsedDate.toLocaleDateString(
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
  // OBTENER ESTADO NORMALIZADO
  // ============================================================

  const getDocumentStatus = (document) => {
    return (
      document.estado ||
      document.status ||
      "Pendiente"
    );
  };

  // ============================================================
  // ESTADÍSTICAS REALES
  // ============================================================

  const totalDocuments =
    recentDocuments.length;

  const sentDocuments =
    recentDocuments.filter((document) => {
      const status =
        getDocumentStatus(document)
          .trim()
          .toLowerCase();

      return status === "enviado";
    }).length;

  const receivedDocuments =
    recentDocuments.filter((document) => {
      const status =
        getDocumentStatus(document)
          .trim()
          .toLowerCase();

      return status === "recibido";
    }).length;

  // ============================================================
  // DOCUMENTOS RECIENTES
  // ============================================================

  const documentsToShow =
    recentDocuments.slice(0, 4);

  const userInitials =
    getInitials(currentUser.name);

  // ============================================================
  // VERIFICAR SI ES ADMINISTRADOR
  // ============================================================

  const isAdministrator =
    currentUser.role
      ?.trim()
      .toLowerCase() ===
    "administrador";

  // ============================================================
  // RENDER
  // ============================================================

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
            <h2>
              DocuPortal
            </h2>

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

          {/* MI CUENTA */}

          {isAdministrator && (
            <Link
              href="/dashboard/configuracion"
              className="navigation-item"
            >
              <span className="navigation-icon">
                ◉
              </span>

              <span>
                Mi cuenta
              </span>
            </Link>
          )}

          {/* ADMINISTRACIÓN */}

          {isAdministrator && (
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

          <LogoutButton
            className="logout-link"
          >
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
                {
                  currentUser.name.split(
                    " "
                  )[0]
                } 👋
              </h2>

              <p>
                Bienvenida al portal
                documental. Desde aquí
                puedes consultar los
                documentos del sistema,
                revisar el historial y
                realizar seguimiento de
                la actividad.
              </p>

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

                ) : documentsError ? (

                  <div className="recent-document">

                    <div className="recent-document-info">

                      <strong>
                        No se pudieron cargar
                        los documentos
                      </strong>

                      <span>
                        Intenta actualizar la
                        página nuevamente.
                      </span>

                    </div>

                  </div>

                ) : documentsToShow.length === 0 ? (

                  <div className="recent-document">

                    <div className="recent-document-info">

                      <strong>
                        No hay documentos
                        registrados
                      </strong>

                      <span>
                        Los documentos
                        aparecerán aquí
                        cuando se registren.
                      </span>

                    </div>

                  </div>

                ) : (

                  documentsToShow.map(
                    (document) => {

                      const fileName =
                        document.nombre_archivo ||
                        document.nombre ||
                        document.archivo_nombre ||
                        "Documento";

                      const fileType =
                        getFileType(fileName);

                      const status =
                        getDocumentStatus(
                          document
                        );

                      const company =
                        document.empresa ||
                        document.nombre_empresa ||
                        "Sin empresa";

                      const documentDate =
                        document.creado_en ||
                        document.created_at ||
                        document.fecha;

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
                              {fileName}
                            </strong>

                            <span>
                              DOC-
                              {String(
                                document.id
                              ).padStart(
                                3,
                                "0"
                              )}
                              {" · "}
                              {formatDate(
                                documentDate
                              )}
                              {" · "}
                              {company}
                            </span>

                          </div>

                          {/* ESTADO */}

                          <span
                            className={`status-badge ${getStatusClass(
                              status
                            )}`}
                          >

                            <span className="status-dot"></span>

                            {status}

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
                      {totalDocuments}{" "}
                      {totalDocuments === 1
                        ? "documento"
                        : "documentos"}{" "}
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
                      {sentDocuments}{" "}
                      {sentDocuments === 1
                        ? "documento enviado"
                        : "documentos enviados"}
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
                      Consulta el historial
                      del sistema
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
                    Ver los documentos del
                    sistema
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
                    Revisar la actividad del
                    sistema
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