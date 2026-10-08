"use client";

import "../dashboard/dashboard.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

const USER_FILTERS = [
  "Todos",
  "Activo",
  "Inactivo",
];

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function formatLastAccess(lastAccess) {
  if (!lastAccess) {
    return "Nunca";
  }

  try {
    return new Date(lastAccess).toLocaleString(
      "es-CO",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  } catch {
    return lastAccess;
  }
}

function formatDate(date) {
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
  } catch {
    return "";
  }
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name:
      user.nombre ||
      user.name ||
      "Usuario",

    email:
      user.correo ||
      user.email ||
      "",

    role:
      user.rol ||
      user.role ||
      "Usuario",

    department:
      user.departamento ||
      user.department ||
      "No definido",

    status:
      user.estado ||
      user.status ||
      "Activo",

    lastAccess:
      user.ultimo_acceso ||
      user.last_access ||
      user.lastAccess ||
      null,

    createdAt:
      user.fecha_creacion ||
      user.created_at ||
      user.createdAt ||
      null,

    createdBy:
      user.creado_por ||
      user.created_by ||
      user.createdBy ||
      null,
  };
}

export default function AdminPage() {
  // ============================================================
  // USUARIO ACTUAL
  // ============================================================

  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "Administrador",
    email: "",
    role: "Administrador",
    department: "Administración",
  });

  // ============================================================
  // USUARIOS
  // ============================================================

  const [users, setUsers] = useState([]);

  // ============================================================
  // ESTADOS
  // ============================================================

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [selectedUser, setSelectedUser] = useState(null);

  const [documentsCount, setDocumentsCount] =
    useState(0);

  const [ticketsCount, setTicketsCount] =
    useState(0);

  const [historyCount, setHistoryCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  // ============================================================
  // CARGAR INFORMACIÓN REAL
  // ============================================================

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);

        // ======================================================
        // SESIÓN ACTUAL
        // ======================================================

        const sessionResponse = await fetch(
          "/api/usuarios/sesion",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (sessionResponse.ok) {
          const sessionData =
            await sessionResponse.json();

          if (
            sessionData.success &&
            sessionData.usuario
          ) {
            const usuario =
              sessionData.usuario;

            setCurrentUser({
              id: usuario.id || "",
              name:
                usuario.nombre ||
                "Administrador",
              email:
                usuario.correo || "",
              role:
                usuario.rol ||
                "Administrador",
              department:
                usuario.departamento ||
                "Administración",
            });
          }
        }

        // ======================================================
        // USUARIOS
        // ======================================================

        try {
          const usersResponse =
            await fetch(
              "/api/usuarios",
              {
                method: "GET",
                cache: "no-store",
              }
            );

          if (usersResponse.ok) {
            const usersData =
              await usersResponse.json();

            let usuarios = [];

            if (
              Array.isArray(
                usersData
              )
            ) {
              usuarios =
                usersData;
            } else if (
              Array.isArray(
                usersData.usuarios
              )
            ) {
              usuarios =
                usersData.usuarios;
            } else if (
              Array.isArray(
                usersData.users
              )
            ) {
              usuarios =
                usersData.users;
            }

            setUsers(
              usuarios
                .map(
                  (user) =>
                    normalizeUser(user)
                )
                .filter(Boolean)
            );
          }
        } catch (error) {
          console.error(
            "Error cargando usuarios:",
            error
          );

          setUsers([]);
        }

        // ======================================================
        // DOCUMENTOS
        // ======================================================

        try {
          const documentsResponse =
            await fetch(
              "/api/documentos",
              {
                method: "GET",
                cache: "no-store",
              }
            );

          if (
            documentsResponse.ok
          ) {
            const documentsData =
              await documentsResponse.json();

            if (
              Array.isArray(
                documentsData
              )
            ) {
              setDocumentsCount(
                documentsData.length
              );
            } else if (
              Array.isArray(
                documentsData.documentos
              )
            ) {
              setDocumentsCount(
                documentsData.documentos.length
              );
            } else if (
              Array.isArray(
                documentsData.documents
              )
            ) {
              setDocumentsCount(
                documentsData.documents.length
              );
            } else if (
              typeof documentsData.total ===
              "number"
            ) {
              setDocumentsCount(
                documentsData.total
              );
            }
          }
        } catch (error) {
          console.error(
            "Error cargando documentos:",
            error
          );
        }

        // ======================================================
        // TICKETS
        // ======================================================

        try {
          const ticketsResponse =
            await fetch(
              "/api/tickets",
              {
                method: "GET",
                cache: "no-store",
              }
            );

          if (
            ticketsResponse.ok
          ) {
            const ticketsData =
              await ticketsResponse.json();

            if (
              Array.isArray(
                ticketsData
              )
            ) {
              setTicketsCount(
                ticketsData.length
              );
            } else if (
              Array.isArray(
                ticketsData.tickets
              )
            ) {
              setTicketsCount(
                ticketsData.tickets.length
              );
            } else if (
              typeof ticketsData.total ===
              "number"
            ) {
              setTicketsCount(
                ticketsData.total
              );
            }
          }
        } catch (error) {
          console.error(
            "Error cargando tickets:",
            error
          );
        }

        // ======================================================
        // HISTORIAL
        // ======================================================

        try {
          const historyResponse =
            await fetch(
              "/api/historial",
              {
                method: "GET",
                cache: "no-store",
              }
            );

          if (
            historyResponse.ok
          ) {
            const historyData =
              await historyResponse.json();

            if (
              Array.isArray(
                historyData
              )
            ) {
              setHistoryCount(
                historyData.length
              );
            } else if (
              Array.isArray(
                historyData.historial
              )
            ) {
              setHistoryCount(
                historyData.historial.length
              );
            } else if (
              Array.isArray(
                historyData.history
              )
            ) {
              setHistoryCount(
                historyData.history.length
              );
            } else if (
              typeof historyData.total ===
              "number"
            ) {
              setHistoryCount(
                historyData.total
              );
            }
          }
        } catch (error) {
          console.error(
            "Error cargando historial:",
            error
          );
        }
      } catch (error) {
        console.error(
          "Error cargando información administrativa:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  // ============================================================
  // FILTRAR USUARIOS
  // ============================================================

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = [
        user.id,
        user.name,
        user.email,
        user.role,
        user.department,
        user.status,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );

      const matchesFilter =
        filter === "Todos" ||
        String(user.status)
          .trim()
          .toLowerCase() ===
          filter.toLowerCase();

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    users,
    search,
    filter,
  ]);

  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  const activeUsers = users.filter(
    (user) =>
      String(user.status)
        .trim()
        .toLowerCase() ===
      "activo"
  ).length;

  const inactiveUsers = users.filter(
    (user) =>
      String(user.status)
        .trim()
        .toLowerCase() ===
      "inactivo"
  ).length;

  const userInitials = getInitials(
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
            className="navigation-item"
          >
            <span className="navigation-icon">
              ◷
            </span>

            <span>
              Historial
            </span>
          </Link>

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

          <Link
            href="/admin"
            className="navigation-item active"
          >
            <span className="navigation-icon">
              ⚙
            </span>

            <span>
              Administración
            </span>
          </Link>

        </nav>

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

      {/* ======================================================
          CONTENIDO PRINCIPAL
      ====================================================== */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div className="header-title">

            <span>
              PORTAL DOCUMENTAL
            </span>

            <h1>
              Administración
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

          {/* ==================================================
              BIENVENIDA ADMINISTRATIVA
          ================================================== */}

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
                Desde aquí puedes
                administrar los usuarios
                y consultar la actividad
                general del portal
                documental.
              </p>

            </div>

          </section>

          {/* ==================================================
              INDICADORES
          ================================================== */}

          <section className="stats-grid">

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon blue">
                  👤
                </div>

                <span className="stat-label">
                  Usuarios registrados
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  {loading
                    ? "..."
                    : users.length}
                </strong>

                <span className="stat-description">
                  En el sistema
                </span>

              </div>

            </article>

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon green">
                  ✓
                </div>

                <span className="stat-label">
                  Usuarios activos
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  {loading
                    ? "..."
                    : activeUsers}
                </strong>

                <span className="stat-description">
                  Actualmente activos
                </span>

              </div>

            </article>

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon purple">
                  ▤
                </div>

                <span className="stat-label">
                  Documentos
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  {loading
                    ? "..."
                    : documentsCount}
                </strong>

                <span className="stat-description">
                  Registrados
                </span>

              </div>

            </article>

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon orange">
                  □
                </div>

                <span className="stat-label">
                  Tickets
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  {loading
                    ? "..."
                    : ticketsCount}
                </strong>

                <span className="stat-description">
                  Solicitudes registradas
                </span>

              </div>

            </article>

          </section>

          {/* ==================================================
              GESTIÓN RÁPIDA
          ================================================== */}

          <section className="dashboard-columns">

            <div className="content-card">

              <div className="content-card-header">

                <div>

                  <span>
                    GESTIÓN
                  </span>

                  <h2>
                    Administración rápida
                  </h2>

                </div>

              </div>

              <div className="tickets-list">

                <Link
                  href="/admin/users/new"
                  className="ticket-item"
                  style={{
                    textDecoration:
                      "none",
                    color: "inherit",
                  }}
                >

                  <div className="ticket-icon">
                    +
                  </div>

                  <div className="ticket-info">

                    <strong>
                      Crear nuevo usuario
                    </strong>

                    <span>
                      Registrar una nueva
                      cuenta de empleado.
                    </span>

                  </div>

                  <span>
                    →
                  </span>

                </Link>

                <Link
                  href="/dashboard/documents"
                  className="ticket-item"
                  style={{
                    textDecoration:
                      "none",
                    color: "inherit",
                  }}
                >

                  <div className="ticket-icon">
                    ▤
                  </div>

                  <div className="ticket-info">

                    <strong>
                      Consultar documentos
                    </strong>

                    <span>
                      Revisar los documentos
                      registrados en el portal.
                    </span>

                  </div>

                  <span>
                    →
                  </span>

                </Link>

                <Link
                  href="/dashboard/tickets"
                  className="ticket-item"
                  style={{
                    textDecoration:
                      "none",
                    color: "inherit",
                  }}
                >

                  <div className="ticket-icon">
                    □
                  </div>

                  <div className="ticket-info">

                    <strong>
                      Consultar tickets
                    </strong>

                    <span>
                      Revisar las solicitudes
                      de soporte.
                    </span>

                  </div>

                  <span>
                    →
                  </span>

                </Link>

              </div>

            </div>

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
                      Usuarios activos
                    </strong>

                    <span>
                      {activeUsers}{" "}
                      {activeUsers === 1
                        ? "usuario activo"
                        : "usuarios activos"}
                    </span>

                  </div>

                </div>

                <div className="ticket-item">

                  <div className="ticket-icon">
                    ▤
                  </div>

                  <div className="ticket-info">

                    <strong>
                      Documentos registrados
                    </strong>

                    <span>
                      {documentsCount}{" "}
                      {documentsCount === 1
                        ? "documento"
                        : "documentos"}{" "}
                      en el sistema
                    </span>

                  </div>

                </div>

                <div className="ticket-item">

                  <div className="ticket-icon">
                    ◷
                  </div>

                  <div className="ticket-info">

                    <strong>
                      Actividad registrada
                    </strong>

                    <span>
                      {historyCount}{" "}
                      {historyCount === 1
                        ? "actividad"
                        : "actividades"}{" "}
                      en el historial
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

          {/* ==================================================
              GESTIÓN DE USUARIOS
          ================================================== */}

          <section className="content-card documents-list-card">

            <div className="content-card-header">

              <div>

                <span>
                  USUARIOS
                </span>

                <h2>
                  Gestión de usuarios
                </h2>

              </div>

              <Link
                href="/admin/users/new"
                className="view-all-link"
              >
                + Nuevo usuario
              </Link>

            </div>

            <div className="documents-toolbar">

              <div className="documents-search">

                <span>
                  ⌕
                </span>

                <input
                  type="search"
                  placeholder="Buscar usuario, correo, rol..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  aria-label="Buscar usuarios"
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
                aria-label="Filtrar usuarios"
              >

                {USER_FILTERS.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item === "Todos"
                        ? "Todos los usuarios"
                        : item}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="table-wrapper">

              <table className="documents-table">

                <thead>

                  <tr>

                    <th>
                      USUARIO
                    </th>

                    <th>
                      ROL
                    </th>

                    <th>
                      ÁREA
                    </th>

                    <th>
                      ÚLTIMO ACCESO
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

                  {loading ? (

                    <tr>

                      <td
                        colSpan="6"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "40px",
                        }}
                      >
                        Cargando usuarios...
                      </td>

                    </tr>

                  ) : (

                    filteredUsers.map(
                      (user) => (

                        <tr
                          key={user.id}
                        >

                          <td>

                            <div className="document-cell">

                              <div className="user-avatar">
                                {getInitials(
                                  user.name
                                )}
                              </div>

                              <div className="document-information">

                                <strong>
                                  {user.name}
                                </strong>

                                <span>
                                  {user.email}
                                </span>

                              </div>

                            </div>

                          </td>

                          <td>

                            <span className="recipient-name">
                              {user.role}
                            </span>

                          </td>

                          <td>

                            <span className="recipient-name">
                              {user.department}
                            </span>

                          </td>

                          <td>

                            <span className="document-date">
                              {formatLastAccess(
                                user.lastAccess
                              )}
                            </span>

                          </td>

                          <td>

                            <span
                              className={`status-badge ${
                                String(
                                  user.status
                                )
                                  .trim()
                                  .toLowerCase() ===
                                "activo"
                                  ? "green"
                                  : "orange"
                              }`}
                            >

                              <span className="status-dot"></span>

                              {user.status}

                            </span>

                          </td>

                          <td>

                            <button
                              type="button"
                              className="document-view-button"
                              onClick={() =>
                                setSelectedUser(
                                  user
                                )
                              }
                            >
                              Ver detalles
                            </button>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

              {!loading &&
                filteredUsers.length ===
                  0 && (

                <div className="documents-empty">

                  <div>
                    ⌕
                  </div>

                  <h3>
                    No encontramos usuarios
                  </h3>

                  <p>
                    No hay usuarios registrados
                    o no coinciden con tu búsqueda.
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

          {/* ==================================================
              ACCIONES RÁPIDAS
          ================================================== */}

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

              <Link
                href="/admin/users/new"
                className="quick-action"
              >

                <div className="quick-action-icon green">
                  +
                </div>

                <div>

                  <strong>
                    Crear usuario
                  </strong>

                  <span>
                    Registrar una nueva cuenta
                  </span>

                </div>

                <span className="quick-action-arrow">
                  →
                </span>

              </Link>

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

      {/* ======================================================
          MODAL DE USUARIO
      ====================================================== */}

      {selectedUser && (

        <div
          className="document-modal-overlay"
          onClick={() =>
            setSelectedUser(null)
          }
        >

          <section
            className="document-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="document-modal-header">

              <div>

                <span>
                  INFORMACIÓN DEL USUARIO
                </span>

                <h2 id="user-modal-title">
                  Detalles
                </h2>

              </div>

              <button
                type="button"
                className="document-modal-close"
                onClick={() =>
                  setSelectedUser(null)
                }
                aria-label="Cerrar detalles"
              >
                ×
              </button>

            </div>

            <div className="document-modal-body">

              <div className="document-modal-file">

                <div className="user-avatar">
                  {getInitials(
                    selectedUser.name
                  )}
                </div>

                <div>

                  <strong>
                    {selectedUser.name}
                  </strong>

                  <span>
                    {selectedUser.id}
                  </span>

                </div>

              </div>

              <div className="document-detail-field">

                <span>
                  Correo electrónico
                </span>

                <strong>
                  {selectedUser.email}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Rol
                </span>

                <strong>
                  {selectedUser.role}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Área
                </span>

                <strong>
                  {selectedUser.department}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Estado
                </span>

                <strong>
                  {selectedUser.status}
                </strong>

              </div>

              <div className="document-detail-field">

                <span>
                  Último acceso
                </span>

                <strong>
                  {formatLastAccess(
                    selectedUser.lastAccess
                  )}
                </strong>

              </div>

              {selectedUser.createdAt && (
                <div className="document-detail-field">

                  <span>
                    Fecha de creación
                  </span>

                  <strong>
                    {formatDate(
                      selectedUser.createdAt
                    )}
                  </strong>

                </div>
              )}

              {selectedUser.createdBy && (
                <div className="document-detail-field">

                  <span>
                    Creado por
                  </span>

                  <strong>
                    {selectedUser.createdBy}
                  </strong>

                </div>
              )}

            </div>

            <div className="document-modal-footer">

              <button
                type="button"
                className="document-modal-secondary"
                onClick={() =>
                  setSelectedUser(null)
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