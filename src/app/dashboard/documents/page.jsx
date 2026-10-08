"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import "./documents.css";
import "../dashboard.css";

import LogoutButton from "@/components/LogoutButton";

export default function DocumentsPage() {
  // ============================================================
  // RUTA ACTUAL
  // ============================================================

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status");

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
  // CARGAR DOCUMENTOS
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

        setDocuments(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Error cargando documentos:",
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
  // CLASE DE NAVEGACIÓN
  // ============================================================

  const getNavigationClass = (item) => {
    const baseClass =
      "navigation-item";

    // Dashboard

    if (
      item === "dashboard" &&
      pathname === "/dashboard"
    ) {
      return `${baseClass} active`;
    }

    // Documentos

    if (
      item === "documents" &&
      (
        pathname ===
          "/dashboard/documents" ||
        pathname === "/dashboard/new"
      ) &&
      status !== "Enviado" &&
      status !== "Recibido"
    ) {
      return `${baseClass} active`;
    }

    // Enviados

    if (
      item === "sent" &&
      pathname ===
        "/dashboard/documents" &&
      status === "Enviado"
    ) {
      return `${baseClass} active`;
    }

    // Recibidos

    if (
      item === "received" &&
      pathname ===
        "/dashboard/documents" &&
      status === "Recibido"
    ) {
      return `${baseClass} active`;
    }

    // Tickets

    if (
      item === "tickets" &&
      pathname ===
        "/dashboard/tickets"
    ) {
      return `${baseClass} active`;
    }

    // Historial

    if (
      item === "history" &&
      pathname ===
        "/dashboard/history"
    ) {
      return `${baseClass} active`;
    }

    // Mi cuenta

    if (
      item === "account" &&
      pathname ===
        "/dashboard/configuracion"
    ) {
      return `${baseClass} active`;
    }

    // Administración

    if (
      item === "admin" &&
      pathname === "/admin"
    ) {
      return `${baseClass} active`;
    }

    return baseClass;
  };

  // ============================================================
  // TIPO DE ARCHIVO
  // ============================================================

  const getFileType = (fileName) => {
    if (!fileName) {
      return "FILE";
    }

    const parts =
      fileName.split(".");

    if (parts.length < 2) {
      return "FILE";
    }

    return parts[
      parts.length - 1
    ].toUpperCase();
  };

  // ============================================================
  // ICONO / CLASE DEL ARCHIVO
  // ============================================================

  const getFileIconClass = (fileName) => {
    const extension =
      fileName
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
      extension === "docx" ||
      extension === "doc"
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
  // ESTADO DEL DOCUMENTO
  // ============================================================

  const getStatusClass = (documentStatus) => {
    const normalized =
      documentStatus?.toLowerCase();

    if (normalized === "enviado") {
      return "sent";
    }

    if (normalized === "recibido") {
      return "received";
    }

    return "pending";
  };

  // ============================================================
  // FORMATEAR FECHA
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
    documents.filter((document) => {

      // --------------------------------------------------------
      // FILTRO POR ESTADO
      // --------------------------------------------------------

      const documentStatus =
        document.estado?.toLowerCase();

      if (
        status === "Enviado" &&
        documentStatus !== "enviado"
      ) {
        return false;
      }

      if (
        status === "Recibido" &&
        documentStatus !== "recibido"
      ) {
        return false;
      }

      // --------------------------------------------------------
      // BÚSQUEDA
      // --------------------------------------------------------

      const text =
        search.toLowerCase();

      return (
        document.nombre_archivo
          ?.toLowerCase()
          .includes(text) ||

        document.empresa
          ?.toLowerCase()
          .includes(text) ||

        document.empleado
          ?.toLowerCase()
          .includes(text) ||

        document.destinatario
          ?.toLowerCase()
          .includes(text) ||

        document.correo
          ?.toLowerCase()
          .includes(text)
      );
    });

  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  const totalDocuments =
    documents.length;

  const sentDocuments =
    documents.filter(
      (document) =>
        document.estado?.toLowerCase() ===
        "enviado"
    ).length;

  const receivedDocuments =
    documents.filter(
      (document) =>
        document.estado?.toLowerCase() ===
        "recibido"
    ).length;

  // ============================================================
  // INICIALES DEL USUARIO
  // ============================================================

  const userInitials =
    getInitials(
      currentUser.name
    );

  // ============================================================
  // TÍTULO SEGÚN FILTRO
  // ============================================================

  const getPageTitle = () => {
    if (status === "Enviado") {
      return "Documentos enviados";
    }

    if (status === "Recibido") {
      return "Documentos recibidos";
    }

    return "Todos los documentos";
  };

  const getPageDescription = () => {
    if (status === "Enviado") {
      return "Consulta los documentos enviados desde el sistema.";
    }

    if (status === "Recibido") {
      return "Consulta los documentos recibidos en el sistema.";
    }

    return "Consulta los documentos registrados en el sistema.";
  };

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
            className={getNavigationClass(
              "dashboard"
            )}
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
            className={getNavigationClass(
              "documents"
            )}
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
            className={getNavigationClass(
              "sent"
            )}
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
            className={getNavigationClass(
              "received"
            )}
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
            className={getNavigationClass(
              "tickets"
            )}
          >
            <span className="navigation-icon">
              □
            </span>

            <span>
              Tickets
            </span>
          </Link>

          {/* ==================================================
              GESTIÓN
              ================================================== */}

          <div className="navigation-section second-section">
            GESTIÓN
          </div>

          {/* HISTORIAL */}

          <Link
            href="/dashboard/history"
            className={getNavigationClass(
              "history"
            )}
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
              className={getNavigationClass(
                "account"
              )}
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
              className={getNavigationClass(
                "admin"
              )}
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
              Documentos
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
                GESTIÓN DOCUMENTAL
              </span>

              <h2>
                {getPageTitle()}
              </h2>

              <p>
                {getPageDescription()}
              </p>

            </div>

            {/* ==================================================
                NUEVO DOCUMENTO
                SOLO APARECE EN DOCUMENTOS
                ================================================== */}

            {status !== "Enviado" &&
              status !== "Recibido" && (
                <Link
                  href="/dashboard/new"
                  className="new-document-button"
                >
                  + Nuevo documento
                </Link>
              )}

          </section>

          {/* ==================================================
              ESTADÍSTICAS
              ================================================== */}

          <section className="document-stats">

            <div className="document-stat">

              <span className="document-stat-label">
                Total documentos
              </span>

              <strong>
                {totalDocuments}
              </strong>

            </div>

            <div className="document-stat">

              <span className="document-stat-label">
                Enviados
              </span>

              <strong>
                {sentDocuments}
              </strong>

            </div>

            <div className="document-stat">

              <span className="document-stat-label">
                Recibidos
              </span>

              <strong>
                {receivedDocuments}
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
                placeholder="Buscar documento, empresa, usuario..."
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
                  {status === "Enviado"
                    ? "Documentos enviados"
                    : status === "Recibido"
                    ? "Documentos recibidos"
                    : "Documentos registrados"}
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

            {/* ==================================================
                CARGANDO
                ================================================== */}

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

              /* =================================================
                 SIN DOCUMENTOS
                 ================================================= */

              <div className="documents-empty">

                <div className="empty-icon">
                  📁
                </div>

                <h3>
                  No hay documentos
                </h3>

                <p>
                  No se encontraron documentos
                  registrados.
                </p>

              </div>

            ) : (

              /* =================================================
                 TABLA
                 ================================================= */

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
                        EMPLEADO
                      </th>

                      <th>
                        USUARIO
                      </th>

                      <th>
                        ESTADO
                      </th>

                      <th>
                        FECHA
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredDocuments.map(
                      (document) => {

                        const fileType =
                          getFileType(
                            document.nombre_archivo
                          );

                        const iconClass =
                          getFileIconClass(
                            document.nombre_archivo
                          );

                        return (

                          <tr
                            key={document.id}
                          >

                            {/* DOCUMENTO */}

                            <td>

                              <div className="document-cell">

                                <div
                                  className={`file-icon ${iconClass}`}
                                >
                                  {fileType}
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

                            {/* EMPLEADO */}

                            <td>

                              <div className="person-cell">

                                <strong>
                                  {document.empleado ||
                                    "Sin empleado"}
                                </strong>

                              </div>

                            </td>

                            {/* USUARIO */}

                            <td>

                              <div className="person-cell">

                                <strong>
                                  {document.destinatario ||
                                    "Sin usuario"}
                                </strong>

                                <span>
                                  {document.correo ||
                                    "Sin correo"}
                                </span>

                              </div>

                            </td>

                            {/* ESTADO */}

                            <td>

                              <span
                                className={`document-status ${getStatusClass(
                                  document.estado
                                )}`}
                              >

                                <span className="status-circle"></span>

                                {document.estado ||
                                  "Pendiente"}

                              </span>

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

                        );
                      }
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