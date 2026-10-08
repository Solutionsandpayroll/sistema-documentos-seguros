"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import "./sent.css";
import "../dashboard.css";

import LogoutButton from "@/components/LogoutButton";

export default function SentDocumentsPage() {
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

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ============================================================
  // CARGAR USUARIO
  // ============================================================

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(
        "docuportal_current_user"
      );

      if (savedUser) {
        const user = JSON.parse(savedUser);

        setCurrentUser({
          name:
            user.name ||
            user.nombre ||
            "Administrador",

          role:
            user.role ||
            user.rol ||
            "Administrador",
        });
      }
    } catch (error) {
      console.error(
        "Error cargando usuario:",
        error
      );
    }
  }, []);

  // ============================================================
  // CARGAR DOCUMENTOS ENVIADOS
  // ============================================================

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "/api/documentos",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Error consultando los documentos"
          );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const sentDocuments = data.filter(
            (document) =>
              document.estado
                ?.toLowerCase() ===
              "enviado"
          );

          setDocuments(sentDocuments);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        console.error(
          "Error cargando enviados:",
          error
        );

        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // ============================================================
  // INICIALES
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
  // TIPO DE ARCHIVO
  // ============================================================

  const getFileType = (name) => {
    if (!name) {
      return "FILE";
    }

    const parts = name.split(".");

    return parts.length > 1
      ? parts[
          parts.length - 1
        ].toUpperCase()
      : "FILE";
  };

  // ============================================================
  // CLASE DEL ARCHIVO
  // ============================================================

  const getFileClass = (name) => {
    const extension = name
      ?.split(".")
      .pop()
      ?.toLowerCase();

    if (extension === "pdf") {
      return "pdf";
    }

    if (
      extension === "xlsx" ||
      extension === "xls"
    ) {
      return "excel";
    }

    if (
      extension === "doc" ||
      extension === "docx"
    ) {
      return "word";
    }

    if (
      extension === "jpg" ||
      extension === "jpeg" ||
      extension === "png"
    ) {
      return "image";
    }

    return "file";
  };

  // ============================================================
  // FECHA
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
        "es-CO",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "";
    }
  };

  // ============================================================
  // DOCUMENTOS FILTRADOS
  // ============================================================

  const filteredDocuments =
    documents.filter(
      (document) => {
        const text =
          search.toLowerCase();

        return (
          document.nombre_archivo
            ?.toLowerCase()
            .includes(text) ||

          document.empresa
            ?.toLowerCase()
            .includes(text) ||

          document.destinatario
            ?.toLowerCase()
            .includes(text) ||

          document.correo
            ?.toLowerCase()
            .includes(text)
        );
      }
    );

  // ============================================================
  // INICIALES DEL USUARIO
  // ============================================================

  const userInitials =
    getInitials(
      currentUser.name
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="dashboard-layout">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

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
            className="navigation-item"
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
            href="/dashboard/sent"
            className="navigation-item active"
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
            href="/dashboard/received"
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

          {currentUser.role ===
            "Administrador" && (
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

          {currentUser.role ===
            "Administrador" && (
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

      {/* ======================================================
          CONTENIDO PRINCIPAL
      ====================================================== */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div className="header-title">

            <span>
              PORTAL DOCUMENTAL
            </span>

            <h1>
              Documentos enviados
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

        {/* ====================================================
            CONTENIDO
        ==================================================== */}

        <div className="dashboard-content">

          {/* ==================================================
              INTRODUCCIÓN
          ================================================== */}

          <section className="documents-intro">

            <div>

              <span className="page-eyebrow">
                DOCUMENTOS ENVIADOS
              </span>

              <h2>
                Enviados
              </h2>

              <p>
                Consulta los documentos que
                han sido enviados desde el
                sistema.
              </p>

            </div>

          </section>

          {/* ==================================================
              ESTADÍSTICAS
          ================================================== */}

          <section className="document-stats">

            <div className="document-stat">

              <span className="document-stat-label">
                Total enviados
              </span>

              <strong>
                {documents.length}
              </strong>

            </div>

            <div className="document-stat">

              <span className="document-stat-label">
                Resultados actuales
              </span>

              <strong>
                {filteredDocuments.length}
              </strong>

            </div>

            <div className="document-stat">

              <span className="document-stat-label">
                Estado
              </span>

              <strong>
                Enviados
              </strong>

            </div>

          </section>

          {/* ==================================================
              BÚSQUEDA
          ================================================== */}

          <section className="documents-filters">

            <div className="search-container">

              <span className="search-icon">
                🔎
              </span>

              <input
                type="text"
                placeholder="Buscar documento, empresa o usuario..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

          </section>

          {/* ==================================================
              TABLA
          ================================================== */}

          <section className="documents-table-card">

            <div className="table-header">

              <div>

                <span>
                  LISTADO GENERAL
                </span>

                <h2>
                  Documentos enviados
                </h2>

              </div>

              <span className="results-count">

                {filteredDocuments.length}{" "}

                resultado
                {filteredDocuments.length !==
                1
                  ? "s"
                  : ""}

              </span>

            </div>

            {/* CARGANDO */}

            {loading ? (

              <div className="documents-empty">

                <div className="loading-icon">
                  ⏳
                </div>

                <h3>
                  Cargando documentos...
                </h3>

              </div>

            ) : filteredDocuments.length ===
              0 ? (

              /* SIN DOCUMENTOS */

              <div className="documents-empty">

                <div className="empty-icon">
                  📤
                </div>

                <h3>
                  No hay documentos enviados
                </h3>

                <p>
                  Los documentos enviados
                  aparecerán aquí.
                </p>

              </div>

            ) : (

              /* TABLA */

              <div className="table-wrapper">

                <table className="documents-table">

                  <thead>

                    <tr>

                      <th>
                        DOCUMENTO
                      </th>

                      <th>
                        EMPRESA
                      </th>

                      <th>
                        DESTINATARIO
                      </th>

                      <th>
                        CORREO
                      </th>

                      <th>
                        FECHA
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredDocuments.map(
                      (document) => (

                        <tr
                          key={
                            document.id
                          }
                        >

                          {/* DOCUMENTO */}

                          <td>

                            <div className="document-cell">

                              <div
                                className={`file-icon ${getFileClass(
                                  document.nombre_archivo
                                )}`}
                              >

                                {getFileType(
                                  document.nombre_archivo
                                )}

                              </div>

                              <div>

                                <strong>
                                  {
                                    document.nombre_archivo
                                  }
                                </strong>

                                <span>
                                  DOC-
                                  {String(
                                    document.id
                                  ).padStart(
                                    3,
                                    "0"
                                  )}
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* EMPRESA */}

                          <td>

                            <span className="company-name">

                              {document.empresa ||
                                "Sin empresa"}

                            </span>

                          </td>

                          {/* DESTINATARIO */}

                          <td>

                            <div className="person-cell">

                              <strong>
                                {document.destinatario ||
                                  "Sin destinatario"}
                              </strong>

                            </div>

                          </td>

                          {/* CORREO */}

                          <td>

                            <div className="person-cell">

                              <span>
                                {document.correo ||
                                  "Sin correo"}
                              </span>

                            </div>

                          </td>

                          {/* FECHA */}

                          <td>

                            <span className="document-date">

                              {formatDate(
                                document.creado_en
                              )}

                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}