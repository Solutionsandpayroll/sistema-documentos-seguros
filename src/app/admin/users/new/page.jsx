"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "../../../../components/LogoutButton";

const ROLES = [
  "Usuario",
  "Supervisor",
  "Administrador",
];

const DEPARTMENTS = [
  "Administración",
  "Recursos Humanos",
  "Contabilidad",
  "Gestión Documental",
  "Tecnología",
  "Finanzas",
  "Otro",
];

// ============================================================
// OBTENER INICIALES
// ============================================================

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

// ============================================================
// COMPONENTE
// ============================================================

export default function NewUserPage() {
  const router = useRouter();

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

  const [checkingSession, setCheckingSession] =
    useState(true);

  // ============================================================
  // FORMULARIO
  // ============================================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Usuario");
  const [department, setDepartment] =
    useState("Administración");
  const [status, setStatus] = useState("Activo");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // ============================================================
  // VERIFICAR SESIÓN DEL ADMINISTRADOR
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
          router.replace("/login");
          return;
        }

        const usuario = data.usuario;

        const rol = String(
          usuario.rol || ""
        )
          .trim()
          .toLowerCase();

        // ======================================================
        // SOLO ADMINISTRADORES
        // ======================================================

        if (rol !== "administrador") {
          router.replace("/dashboard");
          return;
        }

        setCurrentUser({
          id: usuario.id || "",
          name:
            usuario.nombre ||
            "Administrador",
          email:
            usuario.correo ||
            "",
          role:
            usuario.rol ||
            "Administrador",
          department:
            usuario.departamento ||
            "Administración",
        });

        setCheckingSession(false);
      } catch (error) {
        console.error(
          "Error verificando la sesión:",
          error
        );

        router.replace("/login");
      }
    };

    loadCurrentUser();
  }, [router]);

  // ============================================================
  // CREAR USUARIO
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    // ==========================================================
    // VALIDACIONES
    // ==========================================================

    if (!name.trim()) {
      setError(
        "Debes ingresar el nombre completo."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Debes ingresar el correo electrónico."
      );
      return;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError(
        "Ingresa un correo electrónico válido."
      );
      return;
    }

    if (!password) {
      setError(
        "Debes ingresar una contraseña."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "La contraseña debe tener mínimo 6 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    if (!ROLES.includes(role)) {
      setError(
        "El rol seleccionado no es válido."
      );
      return;
    }

    if (!DEPARTMENTS.includes(department)) {
      setError(
        "El área seleccionada no es válida."
      );
      return;
    }

    if (
      status !== "Activo" &&
      status !== "Inactivo"
    ) {
      setError(
        "El estado seleccionado no es válido."
      );
      return;
    }

    // ==========================================================
    // GUARDAR EN NEON
    // ==========================================================

    try {
      setSaving(true);

      const response = await fetch(
        "/api/usuarios/registro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: name.trim(),
            correo: normalizedEmail,
            contrasena: password,
            rol: role,
            departamento: department,
            estado: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "No fue posible crear el usuario."
        );
        return;
      }

      // ========================================================
      // ÉXITO
      // ========================================================

      setSuccess(true);

      setTimeout(() => {
        router.push("/admin");
      }, 800);
    } catch (error) {
      console.error(
        "Error creando usuario:",
        error
      );

      setError(
        "No fue posible guardar el usuario. Intenta nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DATOS VISUALES
  // ============================================================

  const initials = getInitials(
    currentUser.name
  );

  // ============================================================
  // VERIFICANDO SESIÓN
  // ============================================================

  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f8fa",
          color: "#555",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Verificando permisos...
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="dashboard-layout">

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

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

      {/* ========================================================
          CONTENIDO
      ======================================================== */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div className="header-title">

            <span>
              CONFIGURACIÓN
            </span>

            <h1>
              Nuevo usuario
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

        <div className="dashboard-content">

          {/* ====================================================
              INTRO
          ==================================================== */}

          <section className="documents-intro">

            <div>

              <span className="documents-eyebrow">
                GESTIÓN DE USUARIOS
              </span>

              <h2>
                Crear nuevo usuario
              </h2>

              <p>
                Registra un nuevo usuario para
                acceder al portal documental.
              </p>

            </div>

            <Link
              href="/admin"
              className="documents-secondary-button"
            >
              ← Volver a administración
            </Link>

          </section>

          {/* ====================================================
              FORMULARIO
          ==================================================== */}

          <section className="content-card new-document-card">

            <div className="content-card-header">

              <div>

                <span>
                  INFORMACIÓN DEL USUARIO
                </span>

                <h2>
                  Datos de acceso
                </h2>

              </div>

            </div>

            <form
              className="new-document-form"
              onSubmit={handleSubmit}
            >

              {/* NOMBRE */}

              <div className="form-field">

                <label htmlFor="name">
                  Nombre completo
                  <span>*</span>
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Ej. Laura Rodríguez"
                  maxLength={100}
                />

              </div>

              {/* CORREO */}

              <div className="form-field">

                <label htmlFor="email">
                  Correo electrónico
                  <span>*</span>
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="Ej. usuario@docuportal.com"
                  maxLength={150}
                />

              </div>

              {/* ROL Y ÁREA */}

              <div className="form-row">

                <div className="form-field">

                  <label htmlFor="role">
                    Rol
                    <span>*</span>
                  </label>

                  <select
                    id="role"
                    value={role}
                    onChange={(event) =>
                      setRole(
                        event.target.value
                      )
                    }
                  >
                    {ROLES.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>

                </div>

                <div className="form-field">

                  <label htmlFor="department">
                    Área
                    <span>*</span>
                  </label>

                  <select
                    id="department"
                    value={department}
                    onChange={(event) =>
                      setDepartment(
                        event.target.value
                      )
                    }
                  >
                    {DEPARTMENTS.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>

                </div>

              </div>

              {/* ESTADO */}

              <div className="form-field">

                <label htmlFor="status">
                  Estado
                  <span>*</span>
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value
                    )
                  }
                >

                  <option value="Activo">
                    Activo
                  </option>

                  <option value="Inactivo">
                    Inactivo
                  </option>

                </select>

              </div>

              {/* CONTRASEÑA */}

              <div className="form-row">

                <div className="form-field">

                  <label htmlFor="password">
                    Contraseña
                    <span>*</span>
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />

                </div>

                <div className="form-field">

                  <label htmlFor="confirmPassword">
                    Confirmar contraseña
                    <span>*</span>
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Repite la contraseña"
                    minLength={6}
                  />

                </div>

              </div>

              {/* INFORMACIÓN */}

              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  border:
                    "1px solid #e5e7eb",
                  color: "#64748b",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >

                <strong
                  style={{
                    display: "block",
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Información
                </strong>

                El usuario podrá acceder al
                portal utilizando el correo y la
                contraseña registrados.

              </div>

              {/* MENSAJE ERROR */}

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              {/* MENSAJE ÉXITO */}

              {success && (
                <div className="form-success">
                  Usuario creado correctamente.
                  Redirigiendo...
                </div>
              )}

              {/* BOTONES */}

              <div className="new-document-actions">

                <Link
                  href="/admin"
                  className="document-modal-secondary"
                >
                  Cancelar
                </Link>

                <button
                  type="submit"
                  className="documents-new-button"
                  disabled={saving || success}
                >
                  <span>
                    ✓
                  </span>

                  {saving
                    ? "Creando..."
                    : "Crear usuario"}
                </button>

              </div>

            </form>

          </section>

          {/* ====================================================
              AVISO
          ==================================================== */}

          <p className="documents-demo-notice">
            Los usuarios registrados se almacenan
            en el sistema y podrán utilizar sus
            credenciales para acceder al portal.
          </p>

        </div>

      </main>

    </div>
  );
}