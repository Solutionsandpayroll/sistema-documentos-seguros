"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LogoutButton from "../../components/LogoutButton";

const ALLOWED_ROLES = [
  "Administrador",
  "Empleado",
  "Usuario",
];

const DEMO_USERS = [
  {
    id: "USR-001",
    name: "Greylin Martínez",
    email: "greylin@docuportal.com",
    role: "Administrador",
    department: "Administración",
    status: "Activo",
    lastAccess: "06 Oct 2026, 09:30 a. m.",
  },
  {
    id: "USR-002",
    name: "Laura Rodríguez",
    email: "laura@docuportal.com",
    role: "Usuario",
    department: "Recursos Humanos",
    status: "Activo",
    lastAccess: "06 Oct 2026, 08:45 a. m.",
  },
  {
    id: "USR-003",
    name: "Carlos Gómez",
    email: "carlos@docuportal.com",
    role: "Usuario",
    department: "Contabilidad",
    status: "Activo",
    lastAccess: "05 Oct 2026, 04:20 p. m.",
  },
  {
    id: "USR-004",
    name: "Mariana López",
    email: "mariana@docuportal.com",
    role: "Empleado",
    department: "Gestión Documental",
    status: "Inactivo",
    lastAccess: "30 Sep 2026, 02:15 p. m.",
  },
];

const USER_FILTERS = [
  "Todos",
  "Activo",
  "Inactivo",
];

function normalizeUserRole(role) {
  if (role === "Supervisor") {
    return "Empleado";
  }

  if (ALLOWED_ROLES.includes(role)) {
    return role;
  }

  return "Usuario";
}

function normalizeUser(user) {
  if (!user || !user.id) {
    return null;
  }

  return {
    ...user,
    role: normalizeUserRole(user.role),
  };
}

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

  return lastAccess;
}

function mergeUsers(savedUsers) {
  const usersById = new Map();

  DEMO_USERS.forEach((user) => {
    usersById.set(user.id, user);
  });

  if (Array.isArray(savedUsers)) {
    savedUsers.forEach((user) => {
      const normalizedUser = normalizeUser(user);

      if (!normalizedUser) {
        return;
      }

      usersById.set(normalizedUser.id, {
        ...usersById.get(normalizedUser.id),
        ...normalizedUser,
      });
    });
  }

  return Array.from(usersById.values());
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState({
    id: "USR-001",
    name: "Greylin Martínez",
    email: "greylin@docuportal.com",
    role: "Administrador",
    department: "Administración",
  });

  const [users, setUsers] = useState(DEMO_USERS);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("Todos");

  const [selectedUser, setSelectedUser] = useState(null);

  const [documentsCount, setDocumentsCount] = useState(0);

  const [ticketsCount, setTicketsCount] = useState(0);

  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    try {
      /* ============================================================
         USUARIO ACTUAL
      ============================================================ */

      const currentUserData = localStorage.getItem(
        "docuportal_current_user"
      );

      if (currentUserData) {
        try {
          const parsedCurrentUser =
            JSON.parse(currentUserData);

          if (parsedCurrentUser) {
            setCurrentUser({
              id:
                parsedCurrentUser.id ||
                "USR-001",

              name:
                parsedCurrentUser.name ||
                "Greylin Martínez",

              email:
                parsedCurrentUser.email ||
                "greylin@docuportal.com",

              role:
                normalizeUserRole(
                  parsedCurrentUser.role
                ),

              department:
                parsedCurrentUser.department ||
                "Administración",
            });
          }
        } catch (error) {
          console.error(
            "Error leyendo usuario actual:",
            error
          );
        }
      }

      /* ============================================================
         USUARIOS
      ============================================================ */

      let savedUsers = [];

      try {
        savedUsers = JSON.parse(
          localStorage.getItem(
            "docuportal_users"
          ) || "[]"
        );
      } catch (error) {
        console.error(
          "Error leyendo usuarios:",
          error
        );
      }

      const mergedUsers = mergeUsers(savedUsers);

      setUsers(mergedUsers);

      /* ============================================================
         ACTUALIZAR ROLES ANTIGUOS
      ============================================================ */

      if (Array.isArray(savedUsers)) {
        const normalizedSavedUsers =
          savedUsers
            .map((user) =>
              normalizeUser(user)
            )
            .filter(Boolean);

        localStorage.setItem(
          "docuportal_users",
          JSON.stringify(
            normalizedSavedUsers
          )
        );
      }

      /* ============================================================
         DOCUMENTOS
      ============================================================ */

      let savedDocuments = [];

      try {
        savedDocuments = JSON.parse(
          localStorage.getItem(
            "docuportal_documents"
          ) || "[]"
        );
      } catch (error) {
        console.error(
          "Error leyendo documentos:",
          error
        );
      }

      if (Array.isArray(savedDocuments)) {
        setDocumentsCount(
          savedDocuments.length
        );
      }

      /* ============================================================
         TICKETS
      ============================================================ */

      let savedTickets = [];

      try {
        savedTickets = JSON.parse(
          localStorage.getItem(
            "docuportal_tickets"
          ) || "[]"
        );
      } catch (error) {
        console.error(
          "Error leyendo tickets:",
          error
        );
      }

      if (Array.isArray(savedTickets)) {
        setTicketsCount(
          savedTickets.length
        );
      }

      /* ============================================================
         HISTORIAL
      ============================================================ */

      let savedHistory = [];

      try {
        savedHistory = JSON.parse(
          localStorage.getItem(
            "docuportal_history"
          ) || "[]"
        );
      } catch (error) {
        console.error(
          "Error leyendo historial:",
          error
        );
      }

      if (Array.isArray(savedHistory)) {
        setHistoryCount(
          savedHistory.length
        );
      }
    } catch (error) {
      console.error(
        "Error al cargar información administrativa:",
        error
      );
    }
  };

  /* ================================================================
     FILTRADO
  ================================================================ */

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
        user.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [users, search, filter]);

  const activeUsers = users.filter(
    (user) => user.status === "Activo"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactivo"
  ).length;

  const userInitials = getInitials(
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
            <h2>DocuPortal</h2>

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

            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/documents"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ▤
            </span>

            <span>Documentos</span>
          </Link>

          <Link
            href="/dashboard/documents?status=Enviado"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ↗
            </span>

            <span>Enviados</span>
          </Link>

          <Link
            href="/dashboard/documents?status=Recibido"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ↙
            </span>

            <span>Recibidos</span>
          </Link>

          <Link
            href="/dashboard/tickets"
            className="navigation-item"
          >
            <span className="navigation-icon">
              □
            </span>

            <span>Tickets</span>
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

            <span>Historial</span>
          </Link>

          <Link
            href="/admin"
            className="navigation-item active"
          >
            <span className="navigation-icon">
              ⚙
            </span>

            <span>Administración</span>
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
              CONFIGURACIÓN
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

          {/* ========================================================
              INTRO
          ======================================================== */}

          <section className="documents-intro">

            <div>

              <span className="documents-eyebrow">
                PANEL ADMINISTRATIVO
              </span>

              <h2>
                Administración del portal
              </h2>

              <p>
                Gestiona usuarios, documentos,
                tickets y la actividad general
                de DocuPortal.
              </p>

            </div>

            <Link
              href="/admin/users/new"
              className="documents-new-button"
            >
              <span>+</span>
              Nuevo usuario
            </Link>

          </section>


          {/* ========================================================
              ESTADÍSTICAS
          ======================================================== */}

          <section className="documents-stats">

            <article className="documents-stat-card">

              <div className="documents-stat-icon total-icon">
                👤
              </div>

              <div>

                <span>
                  Usuarios
                </span>

                <strong>
                  {users.length}
                </strong>

              </div>

            </article>


            <article className="documents-stat-card">

              <div className="documents-stat-icon sent-icon">
                ✓
              </div>

              <div>

                <span>
                  Usuarios activos
                </span>

                <strong>
                  {activeUsers}
                </strong>

              </div>

            </article>


            <article className="documents-stat-card">

              <div className="documents-stat-icon received-icon">
                ▤
              </div>

              <div>

                <span>
                  Documentos
                </span>

                <strong>
                  {documentsCount}
                </strong>

              </div>

            </article>


            <article className="documents-stat-card">

              <div className="documents-stat-icon pending-icon">
                □
              </div>

              <div>

                <span>
                  Tickets
                </span>

                <strong>
                  {ticketsCount}
                </strong>

              </div>

            </article>

          </section>


          {/* ========================================================
              ACCESOS RÁPIDOS
          ======================================================== */}

          <section className="content-card">

            <div className="content-card-header">

              <div>

                <span>
                  GESTIÓN
                </span>

                <h2>
                  Accesos rápidos
                </h2>

              </div>

            </div>


            <div className="admin-quick-grid">

              <Link
                href="/dashboard/documents"
                className="admin-quick-card"
              >

                <div className="admin-quick-icon documents">
                  ▤
                </div>

                <div className="admin-quick-content">

                  <strong>
                    Documentos
                  </strong>

                  <span>
                    Gestionar documentos
                    del portal.
                  </span>

                </div>

                <div className="admin-quick-arrow">
                  →
                </div>

              </Link>


              <Link
                href="/dashboard/tickets"
                className="admin-quick-card"
              >

                <div className="admin-quick-icon tickets">
                  □
                </div>

                <div className="admin-quick-content">

                  <strong>
                    Tickets
                  </strong>

                  <span>
                    Consultar solicitudes
                    de soporte.
                  </span>

                </div>

                <div className="admin-quick-arrow">
                  →
                </div>

              </Link>


              <Link
                href="/dashboard/history"
                className="admin-quick-card"
              >

                <div className="admin-quick-icon history">
                  ◷
                </div>

                <div className="admin-quick-content">

                  <strong>
                    Historial
                  </strong>

                  <span>
                    Revisar actividad
                    del sistema.
                  </span>

                </div>

                <div className="admin-quick-arrow">
                  →
                </div>

              </Link>

            </div>

          </section>


          {/* ========================================================
              USUARIOS
          ======================================================== */}

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

              <span className="documents-total-label">
                {filteredUsers.length} resultados
              </span>

            </div>


            {/* ======================================================
                BUSCADOR
            ====================================================== */}

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


            {/* ======================================================
                TABLA
            ====================================================== */}

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

                  {filteredUsers.map(
                    (user) => (
                      <tr key={user.id}>

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
                              user.status ===
                              "Activo"
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
                  )}

                </tbody>

              </table>


              {filteredUsers.length === 0 && (

                <div className="documents-empty">

                  <div>
                    ⌕
                  </div>

                  <h3>
                    No encontramos usuarios
                  </h3>

                  <p>
                    Prueba con otro término o
                    cambia el filtro.
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


          {/* ========================================================
              RESUMEN DEL SISTEMA
          ======================================================== */}

          <section className="content-card">

            <div className="content-card-header">

              <div>

                <span>
                  RESUMEN
                </span>

                <h2>
                  Estado del sistema
                </h2>

              </div>

            </div>


            <div className="admin-system-grid">

              <div className="admin-system-card">

                <div className="admin-system-icon blue">
                  ◷
                </div>

                <div className="admin-system-info">

                  <span>
                    Actividades registradas
                  </span>

                  <strong>
                    {historyCount}
                  </strong>

                </div>

              </div>


              <div className="admin-system-card">

                <div className="admin-system-icon orange">
                  !
                </div>

                <div className="admin-system-info">

                  <span>
                    Usuarios inactivos
                  </span>

                  <strong>
                    {inactiveUsers}
                  </strong>

                </div>

              </div>


              <div className="admin-system-card operational">

                <div className="admin-system-icon green">
                  ✓
                </div>

                <div className="admin-system-info">

                  <span>
                    Estado del portal
                  </span>

                  <strong>
                    Operativo
                  </strong>

                  <small>
                    Todos los servicios funcionan correctamente
                  </small>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>


      {/* ============================================================
          MODAL DE USUARIO
      ============================================================ */}

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
                    {new Date(
                      selectedUser.createdAt
                    ).toLocaleString("es-CO")}
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