"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LogoutButton from "../../../components/LogoutButton";

const FILTERS = [
  "Todos",
  "Documento",
  "Ticket",
  "Usuario",
];

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("Todos");

  const [selectedItem, setSelectedItem] = useState(null);

  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "Usuario",
    email: "",
    role: "Usuario",
    department: "",
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // CARGAR USUARIO ACTUAL DESDE LA SESIÓN
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

        const data = await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.usuario
        ) {
          window.location.href = "/login";
          return;
        }

        const usuario = data.usuario;

        setCurrentUser({
          id: usuario.id || "",

          name:
            usuario.nombre ||
            "Usuario",

          email:
            usuario.correo ||
            "",

          role:
            usuario.rol ||
            "Usuario",

          department: "",
        });
      } catch (error) {
        console.error(
          "Error al cargar usuario:",
          error
        );

        window.location.href = "/login";
      }
    };

    loadCurrentUser();
  }, []);

  // ============================================================
  // CARGAR HISTORIAL
  // ============================================================

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/historial",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "No fue posible obtener el historial."
          );
        }

        const historyFromApi =
          Array.isArray(data.history)
            ? data.history
            : [];

        setHistory(historyFromApi);
      } catch (error) {
        console.error(
          "Error al cargar historial:",
          error
        );

        setError(
          error.message ||
            "No fue posible cargar el historial."
        );

        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // ============================================================
  // INICIALES DEL USUARIO
  // ============================================================

  const userInitials = useMemo(() => {
    const name =
      currentUser.name ||
      "Usuario";

    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return "U";
    }

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[1].charAt(0)
    ).toUpperCase();
  }, [currentUser.name]);

  // ============================================================
  // FILTRAR HISTORIAL
  // ============================================================

  const filteredHistory = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return history.filter((item) => {
      const matchesSearch = [
        item.id,
        item.action,
        item.document,
        item.documentId,
        item.user,
        item.status,
        item.type,
        item.details,
        item.element,
        item.userEmail,
        item.department,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );

      const matchesFilter =
        filter === "Todos" ||
        item.type === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    history,
    search,
    filter,
  ]);

  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  const totalCount =
    history.length;

  const documentCount =
    history.filter(
      (item) =>
        String(item.type || "")
          .trim()
          .toLowerCase() ===
        "documento"
    ).length;

  const ticketCount =
    history.filter(
      (item) =>
        String(item.type || "")
          .trim()
          .toLowerCase() ===
        "ticket"
    ).length;

  const sentCount =
    history.filter(
      (item) =>
        String(item.status || "")
          .trim()
          .toLowerCase() ===
        "enviado"
    ).length;

  // ============================================================
  // NORMALIZAR DATOS DEL HISTORIAL
  // ============================================================

  const getElementName = (item) => {
    if (item.document) {
      return item.document;
    }

    if (item.element) {
      return item.element;
    }

    if (item.details) {
      return item.details;
    }

    return "Actividad del sistema";
  };

  const getElementId = (item) => {
    if (item.documentId) {
      return item.documentId;
    }

    if (item.id) {
      return item.id;
    }

    return "—";
  };

  const getTypeLabel = (item) => {
    if (
      String(item.type || "")
        .trim()
        .toLowerCase() ===
      "ticket"
    ) {
      return "TKT";
    }

    if (
      String(item.type || "")
        .trim()
        .toLowerCase() ===
      "usuario"
    ) {
      return "USR";
    }

    return "DOC";
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(
      status || ""
    )
      .trim()
      .toLowerCase();

    if (
      normalizedStatus ===
      "enviado"
    ) {
      return "green";
    }

    if (
      normalizedStatus ===
      "recibido"
    ) {
      return "blue";
    }

    if (
      normalizedStatus ===
        "abierto" ||
      normalizedStatus ===
        "en proceso"
    ) {
      return "orange";
    }

    if (
      normalizedStatus ===
      "completado"
    ) {
      return "green";
    }

    if (
      normalizedStatus ===
      "pendiente"
    ) {
      return "orange";
    }

    return "green";
  };

  // ============================================================
  // ADMINISTRADOR
  // ============================================================

  const isAdmin =
    String(currentUser.role || "")
      .trim()
      .toLowerCase() ===
    "administrador";

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
            className="navigation-item"
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
            className="navigation-item active"
          >
            <span className="navigation-icon">
              ◷
            </span>

            <span>
              Historial
            </span>
          </Link>

          {/* ======================================================
              MI CUENTA
          ====================================================== */}

          {isAdmin && (
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

          {/* ======================================================
              ADMINISTRACIÓN
          ====================================================== */}

          {isAdmin && (
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
              GESTIÓN
            </span>

            <h1>
              Historial
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

        <div className="dashboard-content">

          {/* ========================================================
              INTRO
          ======================================================== */}

          <section className="documents-intro">

            <div>

              <span className="documents-eyebrow">
                TRAZABILIDAD
              </span>

              <h2>
                Historial de actividades
              </h2>

              <p>
                Consulta las acciones realizadas en
                el portal documental.
              </p>

            </div>

          </section>

          {/* ========================================================
              ESTADÍSTICAS
          ======================================================== */}

          <section className="documents-stats">

            <article className="documents-stat-card">

              <div className="documents-stat-icon total-icon">
                ◷
              </div>

              <div>

                <span>
                  Total actividades
                </span>

                <strong>
                  {totalCount}
                </strong>

              </div>

            </article>

            <article className="documents-stat-card">

              <div className="documents-stat-icon sent-icon">
                ▤
              </div>

              <div>

                <span>
                  Documentos
                </span>

                <strong>
                  {documentCount}
                </strong>

              </div>

            </article>

            <article className="documents-stat-card">

              <div className="documents-stat-icon received-icon">
                □
              </div>

              <div>

                <span>
                  Tickets
                </span>

                <strong>
                  {ticketCount}
                </strong>

              </div>

            </article>

            <article className="documents-stat-card">

              <div className="documents-stat-icon pending-icon">
                ↗
              </div>

              <div>

                <span>
                  Enviados
                </span>

                <strong>
                  {sentCount}
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
                  ACTIVIDAD
                </span>

                <h2>
                  Registro de actividades
                </h2>

              </div>

              <span className="documents-total-label">
                {filteredHistory.length} resultados
              </span>

            </div>

            {/* ======================================================
                FILTROS
            ====================================================== */}

            <div className="documents-toolbar">

              <div className="documents-search">

                <span>
                  ⌕
                </span>

                <input
                  type="search"
                  placeholder="Buscar actividad, documento, ticket..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  aria-label="Buscar historial"
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
                aria-label="Filtrar historial"
              >

                {FILTERS.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item === "Todos"
                        ? "Todas las actividades"
                        : item}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* ======================================================
                TABLA
            ====================================================== */}

            <div className="table-wrapper">

              {loading ? (

                <div className="documents-empty">

                  <div>
                    ◷
                  </div>

                  <h3>
                    Cargando historial...
                  </h3>

                  <p>
                    Estamos consultando las
                    actividades guardadas en el portal.
                  </p>

                </div>

              ) : error ? (

                <div className="documents-empty">

                  <div>
                    !
                  </div>

                  <h3>
                    No fue posible cargar el historial
                  </h3>

                  <p>
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      window.location.reload()
                    }
                  >
                    Intentar nuevamente
                  </button>

                </div>

              ) : (

                <table className="documents-table">

                  <thead>

                    <tr>

                      <th>
                        ACTIVIDAD
                      </th>

                      <th>
                        ELEMENTO
                      </th>

                      <th>
                        USUARIO
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

                    {filteredHistory.map(
                      (item, index) => (
                        <tr
                          key={`${item.id}-${item.createdAt || index}`}
                        >

                          <td>

                            <div className="document-cell">

                              <div className="document-type">
                                {getTypeLabel(item)}
                              </div>

                              <div className="document-information">

                                <strong>
                                  {item.action ||
                                    "Actividad"}
                                </strong>

                                <span>
                                  {item.id}
                                </span>

                              </div>

                            </div>

                          </td>

                          <td>

                            <div className="document-information">

                              <strong>
                                {getElementName(item)}
                              </strong>

                              <span>
                                {getElementId(item)}
                              </span>

                            </div>

                          </td>

                          <td>

                            <span className="recipient-name">
                              {item.user ||
                                "Usuario"}
                            </span>

                          </td>

                          <td>

                            <div className="document-information">

                              <strong>
                                {item.date ||
                                  "Sin fecha"}
                              </strong>

                              <span>
                                {item.time ||
                                  ""}
                              </span>

                            </div>

                          </td>

                          <td>

                            <span
                              className={`status-badge ${getStatusClass(
                                item.status
                              )}`}
                            >

                              <span className="status-dot"></span>

                              {item.status ||
                                "Registrado"}

                            </span>

                          </td>

                          <td>

                            <button
                              type="button"
                              className="document-view-button"
                              onClick={() =>
                                setSelectedItem(
                                  item
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

              )}

              {!loading &&
                !error &&
                filteredHistory.length === 0 && (

                  <div className="documents-empty">

                    <div>
                      ⌕
                    </div>

                    <h3>
                      No encontramos actividades
                    </h3>

                    <p>
                      Todavía no hay actividades
                      registradas o no coinciden con
                      tu búsqueda.
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

        </div>

      </main>

      {/* ============================================================
          MODAL DE DETALLES
      ============================================================ */}

      {selectedItem && (

        <div
          className="document-modal-overlay"
          onClick={() =>
            setSelectedItem(null)
          }
        >

          <section
            className="document-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="document-modal-header">

              <div>

                <span>
                  DETALLE DE ACTIVIDAD
                </span>

                <h2 id="history-modal-title">
                  Información
                </h2>

              </div>

              <button
                type="button"
                className="document-modal-close"
                onClick={() =>
                  setSelectedItem(null)
                }
                aria-label="Cerrar detalles"
              >
                ×
              </button>

            </div>

            <div className="document-modal-body">

              <div className="document-modal-file">

                <div className="document-type">
                  {getTypeLabel(selectedItem)}
                </div>

                <div>

                  <strong>
                    {selectedItem.action ||
                      "Actividad"}
                  </strong>

                  <span>
                    {selectedItem.id}
                  </span>

                </div>

              </div>

              <div className="document-detail-field">

                <span>
                  Elemento
                </span>

                <strong>
                  {getElementName(selectedItem)}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Identificador
                </span>

                <strong>
                  {getElementId(selectedItem)}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Usuario
                </span>

                <strong>
                  {selectedItem.user ||
                    "Usuario"}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Fecha
                </span>

                <strong>
                  {selectedItem.date ||
                    "Sin fecha"}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Hora
                </span>

                <strong>
                  {selectedItem.time ||
                    "—"}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Estado
                </span>

                <strong>
                  {selectedItem.status ||
                    "Registrado"}
                </strong>

              </div>

              {selectedItem.details && (
                <div className="document-detail-field">

                  <span>
                    Detalles
                  </span>

                  <strong>
                    {selectedItem.details}
                  </strong>

                </div>
              )}

            </div>

            <div className="document-modal-footer">

              <button
                type="button"
                className="document-modal-secondary"
                onClick={() =>
                  setSelectedItem(null)
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