"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

const DEMO_DOCUMENTS = [
  {
    id: "DOC-001",
    name: "Contrato de prestación de servicios.pdf",
    category: "Contrato",
    recipient: "Departamento Administrativo",
    date: "06 Oct 2026",
    status: "Enviado",
    type: "PDF",
    size: "1.8 MB",
    description:
      "Contrato de prestación de servicios para revisión.",
    priority: "Normal",
  },
  {
    id: "DOC-002",
    name: "Informe mensual septiembre.pdf",
    category: "Informe",
    recipient: "Gerencia",
    date: "05 Oct 2026",
    status: "Recibido",
    type: "PDF",
    size: "2.4 MB",
    description:
      "Informe mensual de actividades y resultados.",
    priority: "Normal",
  },
  {
    id: "DOC-003",
    name: "Soporte de nómina septiembre.xlsx",
    category: "Soporte",
    recipient: "Recursos Humanos",
    date: "04 Oct 2026",
    status: "Enviado",
    type: "XLSX",
    size: "850 KB",
    description:
      "Archivo de soporte de nómina del mes.",
    priority: "Normal",
  },
  {
    id: "DOC-004",
    name: "Certificación laboral.pdf",
    category: "Certificación",
    recipient: "Recursos Humanos",
    date: "03 Oct 2026",
    status: "Pendiente",
    type: "PDF",
    size: "620 KB",
    description:
      "Certificación laboral pendiente de revisión.",
    priority: "Normal",
  },
  {
    id: "DOC-005",
    name: "Política de tratamiento de datos.pdf",
    category: "Política",
    recipient: "Área Jurídica",
    date: "02 Oct 2026",
    status: "Recibido",
    type: "PDF",
    size: "1.2 MB",
    description:
      "Documento relacionado con el tratamiento de datos.",
    priority: "Normal",
  },
  {
    id: "DOC-006",
    name: "Solicitud de autorización.pdf",
    category: "Solicitud",
    recipient: "Administración",
    date: "01 Oct 2026",
    status: "Pendiente",
    type: "PDF",
    size: "540 KB",
    description:
      "Solicitud pendiente de autorización.",
    priority: "Normal",
  },
];

const VALID_STATUSES = [
  "Todos",
  "Enviado",
  "Recibido",
  "Pendiente",
];

export default function DocumentsPage() {
  const searchParams = useSearchParams();

  // ============================================================
  // USUARIO ACTUAL
  // ============================================================

  const [currentUser, setCurrentUser] = useState({
    name: "Greylin Martínez",
    role: "Usuario",
  });

  // ============================================================
  // FILTRO DESDE URL
  // ============================================================

  const statusFromUrl = searchParams.get("status");

  const initialFilter = VALID_STATUSES.includes(
    statusFromUrl
  )
    ? statusFromUrl
    : "Todos";

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(initialFilter);
  const [selectedDocument, setSelectedDocument] =
    useState(null);

  const [documents, setDocuments] =
    useState(DEMO_DOCUMENTS);

  // ============================================================
  // CARGAR USUARIO ACTUAL
  // ============================================================

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(
        "docuportal_current_user"
      );

      if (savedUser) {
        const user = JSON.parse(savedUser);

        setCurrentUser({
          name: user.name || "Usuario",
          role: user.role || "Usuario",
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
  // OBTENER INICIALES
  // ============================================================

  const getInitials = (name) => {
    if (!name) {
      return "US";
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

  const userInitials = getInitials(
    currentUser.name
  );

  // ============================================================
  // ACTUALIZAR FILTRO SEGÚN URL
  // ============================================================

  useEffect(() => {
    const newFilter = VALID_STATUSES.includes(
      statusFromUrl
    )
      ? statusFromUrl
      : "Todos";

    setFilter(newFilter);
  }, [statusFromUrl]);

  // ============================================================
  // CARGAR DOCUMENTOS
  // ============================================================

  useEffect(() => {
    try {
      const savedDocuments = localStorage.getItem(
        "docuportal_documents"
      );

      if (!savedDocuments) {
        return;
      }

      const parsedDocuments =
        JSON.parse(savedDocuments);

      if (Array.isArray(parsedDocuments)) {
        setDocuments([
          ...parsedDocuments,
          ...DEMO_DOCUMENTS,
        ]);
      }
    } catch (error) {
      console.error(
        "No fue posible cargar los documentos guardados:",
        error
      );
    }
  }, []);

  // ============================================================
  // FILTRAR DOCUMENTOS
  // ============================================================

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return documents.filter((document) => {
      const matchesSearch = [
        document.id,
        document.name,
        document.category,
        document.recipient,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );

      const matchesStatus =
        filter === "Todos" ||
        document.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [search, filter, documents]);

  // ============================================================
  // CONTADORES
  // ============================================================

  const sentCount = documents.filter(
    (document) =>
      document.status === "Enviado"
  ).length;

  const receivedCount = documents.filter(
    (document) =>
      document.status === "Recibido"
  ).length;

  const pendingCount = documents.filter(
    (document) =>
      document.status === "Pendiente"
  ).length;

  // ============================================================
  // TÍTULO SEGÚN FILTRO
  // ============================================================

  const getListTitle = () => {
    if (filter === "Enviado") {
      return "Documentos enviados";
    }

    if (filter === "Recibido") {
      return "Documentos recibidos";
    }

    if (filter === "Pendiente") {
      return "Documentos pendientes";
    }

    return "Listado de documentos";
  };

  return (
    <div className="dashboard-layout">

      {/* ============================================================
          SIDEBAR
      ============================================================ */}

      <aside className="sidebar">

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
            className={`navigation-item ${
              !statusFromUrl ||
              statusFromUrl === "Todos"
                ? "active"
                : ""
            }`}
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
            className={`navigation-item ${
              filter === "Enviado"
                ? "active"
                : ""
            }`}
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
            className={`navigation-item ${
              filter === "Recibido"
                ? "active"
                : ""
            }`}
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


      {/* ============================================================
          CONTENIDO PRINCIPAL
      ============================================================ */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div className="header-title">

            <span>
              GESTIÓN DOCUMENTAL
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


        <div className="dashboard-content documents-page-content">

          {/* ======================================================
              INTRO
          ======================================================= */}

          <section className="documents-intro">

            <div>

              <span className="documents-eyebrow">
                CENTRO DOCUMENTAL
              </span>

              <h2>
                Todos tus documentos en un solo lugar
              </h2>

              <p>
                Consulta los archivos, revisa sus estados y
                encuentra rápidamente la información que necesitas.
              </p>

            </div>

            <Link
              href="/dashboard/new"
              className="documents-new-button"
            >
              <span>
                +
              </span>

              Nuevo documento
            </Link>

          </section>


          {/* ======================================================
              ESTADÍSTICAS
          ======================================================= */}

          <section className="documents-stats">

            {/* ENVIADOS */}

            <article className="documents-stat-card">

              <div className="documents-stat-icon sent-icon">
                ↗
              </div>

              <div>

                <span>
                  Documentos enviados
                </span>

                <strong>
                  {sentCount}
                </strong>

              </div>

            </article>


            {/* RECIBIDOS */}

            <article className="documents-stat-card">

              <div className="documents-stat-icon received-icon">
                ↙
              </div>

              <div>

                <span>
                  Documentos recibidos
                </span>

                <strong>
                  {receivedCount}
                </strong>

              </div>

            </article>


            {/* PENDIENTES */}

            <article className="documents-stat-card">

              <div className="documents-stat-icon pending-icon">
                ◷
              </div>

              <div>

                <span>
                  Pendientes
                </span>

                <strong>
                  {pendingCount}
                </strong>

              </div>

            </article>


            {/* TOTAL */}

            <article className="documents-stat-card">

              <div className="documents-stat-icon total-icon">
                ▤
              </div>

              <div>

                <span>
                  Total de documentos
                </span>

                <strong>
                  {documents.length}
                </strong>

              </div>

            </article>

          </section>


          {/* ======================================================
              LISTADO
          ======================================================= */}

          <section className="content-card documents-list-card">

            <div className="content-card-header">

              <div>

                <span>
                  ARCHIVO DOCUMENTAL
                </span>

                <h2>
                  {getListTitle()}
                </h2>

              </div>

              <span className="documents-total-label">
                {filteredDocuments.length} resultados
              </span>

            </div>


            {/* BARRA DE HERRAMIENTAS */}

            <div className="documents-toolbar">

              <div className="documents-search">

                <span>
                  ⌕
                </span>

                <input
                  type="search"
                  placeholder="Buscar por nombre, código o destinatario..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  aria-label="Buscar documentos"
                />

              </div>


              <select
                className="documents-filter"
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
                aria-label="Filtrar documentos por estado"
              >

                <option value="Todos">
                  Todos los estados
                </option>

                <option value="Enviado">
                  Enviados
                </option>

                <option value="Recibido">
                  Recibidos
                </option>

                <option value="Pendiente">
                  Pendientes
                </option>

              </select>

            </div>


            {/* TABLA */}

            <div className="table-wrapper">

              <table className="documents-table">

                <thead>

                  <tr>

                    <th>
                      DOCUMENTO
                    </th>

                    <th>
                      DESTINATARIO
                    </th>

                    <th>
                      FECHA
                    </th>

                    <th>
                      ESTADO
                    </th>

                    <th>
                      ACCIÓN
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredDocuments.map(
                    (document) => (

                      <tr key={document.id}>

                        <td>

                          <div className="document-cell">

                            <div
                              className={`document-type ${String(
                                document.type || "FILE"
                              ).toLowerCase()}`}
                            >
                              {document.type}
                            </div>

                            <div className="document-information">

                              <strong>
                                {document.name}
                              </strong>

                              <span>
                                {document.id} ·{" "}
                                {document.category}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <span className="recipient-name">
                            {document.recipient}
                          </span>

                        </td>


                        <td>

                          <span className="document-date">
                            {document.date}
                          </span>

                        </td>


                        <td>

                          <span
                            className={`status-badge ${
                              document.status ===
                              "Enviado"
                                ? "blue"
                                : document.status ===
                                    "Recibido"
                                  ? "green"
                                  : "orange"
                            }`}
                          >

                            <span className="status-dot"></span>

                            {document.status}

                          </span>

                        </td>


                        <td>

                          <button
                            type="button"
                            className="document-view-button"
                            onClick={() =>
                              setSelectedDocument(
                                document
                              )
                            }
                          >
                            Ver detalles
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>


              {/* SIN RESULTADOS */}

              {filteredDocuments.length === 0 && (

                <div className="documents-empty">

                  <div>
                    ⌕
                  </div>

                  <h3>
                    No encontramos documentos
                  </h3>

                  <p>
                    Prueba con otro nombre, código o estado.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilter("Todos");
                    }}
                  >
                    Limpiar filtros
                  </button>

                </div>

              )}

            </div>

          </section>


          {/* AVISO */}

          <p className="documents-demo-notice">

            Los documentos de demostración son ejemplos.
            Los documentos creados desde el formulario se
            almacenan temporalmente en este navegador.

          </p>

        </div>

      </main>


      {/* ============================================================
          MODAL
      ============================================================ */}

      {selectedDocument && (

        <div
          className="document-modal-overlay"
          onClick={() =>
            setSelectedDocument(null)
          }
        >

          <section
            className="document-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="document-modal-header">

              <div>

                <span>
                  INFORMACIÓN DEL ARCHIVO
                </span>

                <h2 id="document-modal-title">
                  Detalles del documento
                </h2>

              </div>


              <button
                type="button"
                className="document-modal-close"
                onClick={() =>
                  setSelectedDocument(null)
                }
                aria-label="Cerrar detalles"
              >
                ×
              </button>

            </div>


            <div className="document-modal-body">

              <div className="document-modal-file">

                <div
                  className={`document-type ${String(
                    selectedDocument.type ||
                      "FILE"
                  ).toLowerCase()}`}
                >
                  {selectedDocument.type}
                </div>

                <div>

                  <strong>
                    {selectedDocument.name}
                  </strong>

                  <span>
                    {selectedDocument.id}
                  </span>

                </div>

              </div>


              <div className="document-detail-field">

                <span>
                  Categoría
                </span>

                <strong>
                  {selectedDocument.category}
                </strong>

              </div>


              <div className="document-detail-field">

                <span>
                  Destinatario
                </span>

                <strong>
                  {selectedDocument.recipient}
                </strong>

              </div>


              <div className="document-detail-field">

                <span>
                  Fecha
                </span>

                <strong>
                  {selectedDocument.date}
                </strong>

              </div>


              <div className="document-detail-field">

                <span>
                  Tamaño
                </span>

                <strong>
                  {selectedDocument.size}
                </strong>

              </div>


              <div className="document-detail-field">

                <span>
                  Prioridad
                </span>

                <strong>
                  {selectedDocument.priority ||
                    "Normal"}
                </strong>

              </div>


              <div className="document-detail-field">

                <span>
                  Estado
                </span>

                <strong>
                  {selectedDocument.status}
                </strong>

              </div>


              <div className="document-detail-description">

                <span>
                  Descripción
                </span>

                <p>
                  {selectedDocument.description ||
                    "Sin descripción."}
                </p>

              </div>


              <p className="document-detail-notice">

                El archivo físico todavía no se almacena en
                un servidor. En esta etapa solamente estamos
                guardando la información del documento.

              </p>

            </div>


            <div className="document-modal-footer">

              <button
                type="button"
                className="document-modal-secondary"
                onClick={() =>
                  setSelectedDocument(null)
                }
              >
                Cerrar
              </button>

            </div>

          </section>

        </div>

      )}

    </div>
  );
}