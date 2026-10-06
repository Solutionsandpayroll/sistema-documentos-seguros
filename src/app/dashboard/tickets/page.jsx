"use client";

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
const DEMO_TICKETS = [
  {
    id: "TKT-001",
    subject: "Solicitud de revisión de contrato",
    category: "Documentos",
    priority: "Alta",
    status: "Abierto",
    requester: "Greylin Martínez",
    date: "06 Oct 2026",
    description:
      "Solicitud de revisión y validación de un contrato antes de enviarlo al destinatario.",
    createdAt: "2026-10-06T08:00:00.000Z",
  },
  {
    id: "TKT-002",
    subject: "Problema con documento enviado",
    category: "Soporte",
    priority: "Media",
    status: "En proceso",
    requester: "Greylin Martínez",
    date: "05 Oct 2026",
    description:
      "El documento fue enviado correctamente, pero se requiere verificar su estado.",
    createdAt: "2026-10-05T08:00:00.000Z",
  },
  {
    id: "TKT-003",
    subject: "Solicitud de certificación laboral",
    category: "Solicitud",
    priority: "Normal",
    status: "Cerrado",
    requester: "Greylin Martínez",
    date: "04 Oct 2026",
    description:
      "Solicitud relacionada con una certificación laboral.",
    createdAt: "2026-10-04T08:00:00.000Z",
  },
  {
    id: "TKT-004",
    subject: "Soporte para cargar archivo",
    category: "Soporte",
    priority: "Normal",
    status: "Abierto",
    requester: "Greylin Martínez",
    date: "03 Oct 2026",
    description:
      "Solicitud de ayuda para cargar un archivo al portal documental.",
    createdAt: "2026-10-03T08:00:00.000Z",
  },
];

const VALID_STATUSES = [
  "Todos",
  "Abierto",
  "En proceso",
  "Cerrado",
];

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function TicketsPage() {
  // ============================================================
  // USUARIO ACTUAL
  // ============================================================

  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "Greylin Martínez",
    email: "",
    role: "Usuario",
    department: "",
  });

  // ============================================================
  // TICKETS
  // ============================================================

  const [tickets, setTickets] =
    useState(DEMO_TICKETS);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState("Todos");

  const [selectedTicket, setSelectedTicket] =
    useState(null);

  // ============================================================
  // CARGAR USUARIO Y TICKETS
  // ============================================================

  useEffect(() => {
    try {
      // ----------------------------------------------------------
      // USUARIO ACTUAL
      // ----------------------------------------------------------

      const currentUserData =
        localStorage.getItem(
          "docuportal_current_user"
        );

      if (currentUserData) {
        const parsedUser =
          JSON.parse(currentUserData);

        setCurrentUser({
          id: parsedUser.id || "",
          name:
            parsedUser.name ||
            "Usuario",
          email:
            parsedUser.email || "",
          role:
            parsedUser.role ||
            "Usuario",
          department:
            parsedUser.department ||
            "",
        });
      }

      // ----------------------------------------------------------
      // TICKETS GUARDADOS
      // ----------------------------------------------------------

      const savedTickets =
        JSON.parse(
          localStorage.getItem(
            "docuportal_tickets"
          ) || "[]"
        );

      if (
        Array.isArray(savedTickets) &&
        savedTickets.length > 0
      ) {
        setTickets([
          ...savedTickets,
          ...DEMO_TICKETS,
        ]);
      }
    } catch (error) {
      console.error(
        "Error al cargar información de tickets:",
        error
      );
    }
  }, []);

  // ============================================================
  // FILTRAR TICKETS
  // ============================================================

  const filteredTickets = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch = [
        ticket.id,
        ticket.subject,
        ticket.category,
        ticket.requester,
        ticket.description,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );

      const matchesStatus =
        filter === "Todos" ||
        ticket.status === filter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    tickets,
    search,
    filter,
  ]);

  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  const openCount = tickets.filter(
    (ticket) =>
      ticket.status === "Abierto"
  ).length;

  const inProgressCount =
    tickets.filter(
      (ticket) =>
        ticket.status === "En proceso"
    ).length;

  const closedCount = tickets.filter(
    (ticket) =>
      ticket.status === "Cerrado"
  ).length;

  // ============================================================
  // INICIALES
  // ============================================================

  const initials = getInitials(
    currentUser.name
  );

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

          <Link
            href="/dashboard/tickets"
            className="navigation-item active"
          >
            <span className="navigation-icon">
              □
            </span>

            <span>
              Tickets
            </span>
          </Link>

          <div className="navigation-section second-section">
            GESTIÓN
          </div>

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

        {/* ==========================================================
            USUARIO
        ========================================================== */}

        <div className="sidebar-footer">

          <div className="sidebar-user">

            <div className="user-avatar">
              {initials}
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

      {/* ============================================================
          CONTENIDO PRINCIPAL
      ============================================================ */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div className="header-title">

            <span>
              SOPORTE Y ATENCIÓN
            </span>

            <h1>
              Tickets
            </h1>

          </div>

          <div className="header-right">

            <div className="header-user">

              <div className="header-user-avatar">
                {initials}
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

        <div className="dashboard-content tickets-page-content">

          {/* ========================================================
              INTRO
          ======================================================== */}

          <section className="documents-intro">

            <div>

              <span className="documents-eyebrow">
                CENTRO DE SOPORTE
              </span>

              <h2>
                Gestiona tus solicitudes
              </h2>

              <p>
                Crea, consulta y realiza seguimiento a
                las solicitudes relacionadas con el
                portal documental.
              </p>

            </div>

            <Link
              href="/dashboard/tickets/new"
              className="documents-new-button"
            >
              <span>
                +
              </span>

              Nuevo ticket
            </Link>

          </section>

          {/* ========================================================
              ESTADÍSTICAS
          ======================================================== */}

          <section className="documents-stats">

            <article className="documents-stat-card">

              <div className="documents-stat-icon sent-icon">
                !
              </div>

              <div>
                <span>
                  Tickets abiertos
                </span>

                <strong>
                  {openCount}
                </strong>
              </div>

            </article>

            <article className="documents-stat-card">

              <div className="documents-stat-icon received-icon">
                ◷
              </div>

              <div>
                <span>
                  En proceso
                </span>

                <strong>
                  {inProgressCount}
                </strong>
              </div>

            </article>

            <article className="documents-stat-card">

              <div className="documents-stat-icon pending-icon">
                ✓
              </div>

              <div>
                <span>
                  Tickets cerrados
                </span>

                <strong>
                  {closedCount}
                </strong>
              </div>

            </article>

            <article className="documents-stat-card">

              <div className="documents-stat-icon total-icon">
                □
              </div>

              <div>
                <span>
                  Total de tickets
                </span>

                <strong>
                  {tickets.length}
                </strong>
              </div>

            </article>

          </section>

          {/* ========================================================
              LISTADO
          ======================================================== */}

          <section className="content-card documents-list-card">

            <div className="content-card-header">

              <div>

                <span>
                  SOLICITUDES
                </span>

                <h2>
                  Listado de tickets
                </h2>

              </div>

              <span className="documents-total-label">
                {filteredTickets.length} resultados
              </span>

            </div>

            {/* ======================================================
                BUSCADOR Y FILTRO
            ====================================================== */}

            <div className="documents-toolbar">

              <div className="documents-search">

                <span>
                  ⌕
                </span>

                <input
                  type="search"
                  placeholder="Buscar por código, asunto o categoría..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  aria-label="Buscar tickets"
                />

              </div>

              <select
                className="documents-filter"
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value
                  )
                }
                aria-label="Filtrar tickets por estado"
              >

                {VALID_STATUSES.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status === "Todos"
                        ? "Todos los estados"
                        : status}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* ======================================================
                TABLA
            ====================================================== */}

            <div className="table-wrapper">

              <table className="documents-table">

                <thead>

                  <tr>

                    <th>
                      TICKET
                    </th>

                    <th>
                      CATEGORÍA
                    </th>

                    <th>
                      PRIORIDAD
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

                  {filteredTickets.map(
                    (ticket, index) => (
                      <tr
                        key={`${ticket.id}-${ticket.createdAt || index}`}
                      >

                        <td>

                          <div className="document-cell">

                            <div className="document-type">
                              TKT
                            </div>

                            <div className="document-information">

                              <strong>
                                {ticket.subject}
                              </strong>

                              <span>
                                {ticket.id} ·{" "}
                                {ticket.requester ||
                                  "Usuario"}
                              </span>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="recipient-name">
                            {ticket.category}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${
                              ticket.priority ===
                              "Alta"
                                ? "orange"
                                : ticket.priority ===
                                  "Media"
                                ? "blue"
                                : "green"
                            }`}
                          >

                            <span className="status-dot"></span>

                            {ticket.priority}

                          </span>

                        </td>

                        <td>

                          <span className="document-date">
                            {ticket.date}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${
                              ticket.status ===
                              "Abierto"
                                ? "orange"
                                : ticket.status ===
                                  "En proceso"
                                ? "blue"
                                : "green"
                            }`}
                          >

                            <span className="status-dot"></span>

                            {ticket.status}

                          </span>

                        </td>

                        <td>

                          <button
                            type="button"
                            className="document-view-button"
                            onClick={() =>
                              setSelectedTicket(
                                ticket
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

              {/* ====================================================
                  SIN RESULTADOS
              ==================================================== */}

              {filteredTickets.length === 0 && (
                <div className="documents-empty">

                  <div>
                    ⌕
                  </div>

                  <h3>
                    No encontramos tickets
                  </h3>

                  <p>
                    Prueba con otro término o cambia
                    el filtro.
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

          <p className="documents-demo-notice">
            Los tickets creados desde el formulario se
            guardan temporalmente en este navegador.
          </p>

        </div>

      </main>

      {/* ============================================================
          MODAL DE DETALLES
      ============================================================ */}

      {selectedTicket && (

        <div
          className="document-modal-overlay"
          onClick={() =>
            setSelectedTicket(null)
          }
        >

          <section
            className="document-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ======================================================
                HEADER MODAL
            ====================================================== */}

            <div className="document-modal-header">

              <div>

                <span>
                  INFORMACIÓN DEL TICKET
                </span>

                <h2 id="ticket-modal-title">
                  Detalles de la solicitud
                </h2>

              </div>

              <button
                type="button"
                className="document-modal-close"
                onClick={() =>
                  setSelectedTicket(null)
                }
                aria-label="Cerrar detalles"
              >
                ×
              </button>

            </div>

            {/* ======================================================
                CUERPO MODAL
            ====================================================== */}

            <div className="document-modal-body">

              <div className="document-modal-file">

                <div className="document-type">
                  TKT
                </div>

                <div>

                  <strong>
                    {selectedTicket.subject}
                  </strong>

                  <span>
                    {selectedTicket.id}
                  </span>

                </div>

              </div>

              <div className="document-detail-field">

                <span>
                  Categoría
                </span>

                <strong>
                  {selectedTicket.category}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Solicitante
                </span>

                <strong>
                  {selectedTicket.requester ||
                    "Usuario"}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Fecha
                </span>

                <strong>
                  {selectedTicket.date}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Prioridad
                </span>

                <strong>
                  {selectedTicket.priority}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Estado
                </span>

                <strong>
                  {selectedTicket.status}
                </strong>

              </div>

              {/* ====================================================
                  USUARIO
              ==================================================== */}

              {selectedTicket.user && (
                <div className="document-detail-field">

                  <span>
                    Creado por
                  </span>

                  <strong>
                    {selectedTicket.user}
                  </strong>

                </div>
              )}

              {/* ====================================================
                  DESCRIPCIÓN
              ==================================================== */}

              <div className="document-detail-description">

                <span>
                  Descripción
                </span>

                <p>
                  {selectedTicket.description}
                </p>

              </div>

              {/* ====================================================
                  ARCHIVO
              ==================================================== */}

              {selectedTicket.fileName && (

                <div className="document-detail-description">

                  <span>
                    Archivo adjunto
                  </span>

                  <p>
                    {selectedTicket.fileName}
                  </p>

                </div>

              )}

            </div>

            {/* ======================================================
                FOOTER MODAL
            ====================================================== */}

            <div className="document-modal-footer">

              <button
                type="button"
                className="document-modal-secondary"
                onClick={() =>
                  setSelectedTicket(null)
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