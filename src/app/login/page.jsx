"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ALLOWED_ROLES = [
  "Administrador",
  "Empleado",
  "Usuario",
];

const DEFAULT_ADMIN = {
  id: 2,
  name: "Greylin Martínez",
  email: "greylin@docuportal.com",
  role: "Administrador",
  department: "Administración",
  status: "Activo",
  password: "123456",
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // INICIALIZAR ADMINISTRADOR LOCAL
  // ============================================================

  useEffect(() => {
    try {
      const savedUsers = JSON.parse(
        localStorage.getItem(
          "docuportal_users"
        ) || "[]"
      );

      let users = Array.isArray(savedUsers)
        ? savedUsers
        : [];

      const adminIndex = users.findIndex(
        (user) =>
          String(user?.email || "")
            .trim()
            .toLowerCase() ===
          DEFAULT_ADMIN.email.toLowerCase()
      );

      if (adminIndex === -1) {
        users = [
          DEFAULT_ADMIN,
          ...users,
        ];
      } else {
        users[adminIndex] = {
          ...users[adminIndex],
          id: 2,
          name: DEFAULT_ADMIN.name,
          email: DEFAULT_ADMIN.email,
          role: DEFAULT_ADMIN.role,
          department:
            DEFAULT_ADMIN.department,
          status: DEFAULT_ADMIN.status,
          password:
            DEFAULT_ADMIN.password,
        };
      }

      localStorage.setItem(
        "docuportal_users",
        JSON.stringify(users)
      );
    } catch (error) {
      console.error(
        "Error al inicializar usuarios:",
        error
      );
    }
  }, []);

  // ============================================================
  // INICIAR SESIÓN
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError(
        "Ingresa tu correo electrónico."
      );
      return;
    }

    if (!password) {
      setError(
        "Ingresa tu contraseña."
      );
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail =
        email.trim().toLowerCase();

      // ========================================================
      // 1. BUSCAR ADMINISTRADOR EN LOCALSTORAGE
      // ========================================================

      const savedUsers = JSON.parse(
        localStorage.getItem(
          "docuportal_users"
        ) || "[]"
      );

      const users = Array.isArray(
        savedUsers
      )
        ? savedUsers
        : [];

      const localUser = users.find(
        (item) =>
          String(item?.email || "")
            .trim()
            .toLowerCase() ===
            normalizedEmail &&
          String(
            item?.password || ""
          ) === password
      );

      // ========================================================
      // 2. SI ES USUARIO LOCAL
      // ========================================================

      if (localUser) {
        if (
          localUser.status !== "Activo"
        ) {
          setError(
            "Este usuario se encuentra inactivo. Contacta al administrador."
          );

          setIsLoading(false);
          return;
        }

        if (
          !ALLOWED_ROLES.includes(
            localUser.role
          )
        ) {
          setError(
            "El usuario tiene un rol no válido. Contacta al administrador."
          );

          setIsLoading(false);
          return;
        }

        const sessionUser = {
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          role: localUser.role,
          department:
            localUser.department || "",
        };

        localStorage.setItem(
          "docuportal_current_user",
          JSON.stringify(
            sessionUser
          )
        );

        // Actualizar último acceso
        const updatedUsers = users.map(
          (item) => {
            if (
              String(item?.email || "")
                .trim()
                .toLowerCase() ===
              normalizedEmail
            ) {
              return {
                ...item,
                lastAccess:
                  new Date().toLocaleString(
                    "es-CO",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  ),
              };
            }

            return item;
          }
        );

        localStorage.setItem(
          "docuportal_users",
          JSON.stringify(
            updatedUsers
          )
        );

        // Historial
        let existingHistory = [];

        try {
          const savedHistory =
            localStorage.getItem(
              "docuportal_history"
            );

          existingHistory =
            savedHistory
              ? JSON.parse(
                  savedHistory
                )
              : [];

          if (
            !Array.isArray(
              existingHistory
            )
          ) {
            existingHistory = [];
          }
        } catch (historyError) {
          console.error(
            "Error leyendo historial:",
            historyError
          );

          existingHistory = [];
        }

        const now = new Date();

        const historyItem = {
          id: `HIST-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 7)}`,

          action:
            "Inicio de sesión",

          document:
            localUser.name,

          documentId:
            localUser.id,

          user:
            localUser.name,

          userId:
            localUser.id,

          userRole:
            localUser.role,

          userEmail:
            localUser.email,

          department:
            localUser.department || "",

          date:
            now.toLocaleDateString(
              "es-CO",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            ),

          time:
            now.toLocaleTimeString(
              "es-CO",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),

          status:
            "Completado",

          type: "Usuario",

          details: `El usuario ${localUser.name} inició sesión en DocuPortal.`,

          createdAt:
            now.toISOString(),
        };

        localStorage.setItem(
          "docuportal_history",
          JSON.stringify([
            historyItem,
            ...existingHistory,
          ])
        );

        // Redirección
        setTimeout(() => {
          if (
            localUser.role ===
            "Administrador"
          ) {
            router.push(
              "/dashboard"
            );
          } else if (
            localUser.role ===
            "Empleado"
          ) {
            router.push(
              "/empleado"
            );
          } else if (
            localUser.role ===
            "Usuario"
          ) {
            router.push(
              "/destinatario"
            );
          }
        }, 500);

        return;
      }

      // ========================================================
      // 3. BUSCAR EMPLEADO EN NEON
      // ========================================================

      const empleadoResponse =
        await fetch(
          "/api/usuarios/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              correo:
                normalizedEmail,
              contrasena:
                password,
            }),
          }
        );

      const empleadoData =
        await empleadoResponse.json();

      if (
        empleadoResponse.ok &&
        empleadoData.success
      ) {
        const empleado =
          empleadoData.usuario;

        const sessionUser = {
          id: empleado.id,
          name: empleado.nombre,
          email: empleado.correo,
          role: "Empleado",
          department: "",
        };

        localStorage.setItem(
          "docuportal_current_user",
          JSON.stringify(
            sessionUser
          )
        );

        setTimeout(() => {
          router.push(
            "/empleado"
          );
        }, 500);

        return;
      }

      // ========================================================
      // 4. BUSCAR USUARIO / DESTINATARIO EN NEON
      // ========================================================

      const recipientResponse =
        await fetch(
          "/api/destinatarios/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              correo:
                normalizedEmail,
              contrasena:
                password,
            }),
          }
        );

      const recipientData =
        await recipientResponse.json();

      if (
        !recipientResponse.ok ||
        !recipientData.success
      ) {
        setError(
          recipientData.message ||
            "El correo o la contraseña son incorrectos."
        );

        setIsLoading(false);
        return;
      }

      // ========================================================
      // 5. USUARIO = DESTINATARIO
      // ========================================================

      const destinatario =
        recipientData.destinatario;

      const sessionUser = {
        id:
          destinatario.id,

        name:
          destinatario.nombre,

        email:
          destinatario.correo,

        role: "Usuario",

        department:
          destinatario.empresa || "",

        empresaId:
          destinatario.empresa_id,

        empresa:
          destinatario.empresa,
      };

      localStorage.setItem(
        "docuportal_current_user",
        JSON.stringify(
          sessionUser
        )
      );

      sessionStorage.setItem(
        "docuportal_destinatario",
        JSON.stringify(
          destinatario
        )
      );

      setTimeout(() => {
        router.push(
          "/destinatario"
        );
      }, 500);
    } catch (loginError) {
      console.error(
        "Error durante el inicio de sesión:",
        loginError
      );

      setError(
        "No fue posible iniciar sesión. Intenta nuevamente."
      );

      setIsLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="login-page">

      {/* PANEL IZQUIERDO */}

      <section className="login-brand-panel">

        <div className="login-brand-content">

          <div className="login-brand-logo">
            D
          </div>

          <div className="login-brand-name">
            <h1>
              DocuPortal
            </h1>

            <span>
              Portal documental
            </span>
          </div>

          <div className="login-brand-description">

            <span className="login-brand-eyebrow">
              GESTIÓN DOCUMENTAL
            </span>

            <h2>
              Toda tu información,
              <br />
              en un solo lugar.
            </h2>

            <p>
              Administra, consulta y
              realiza seguimiento de tus
              documentos de forma sencilla
              y segura.
            </p>

          </div>

          <div className="login-features">

            <div className="login-feature">

              <span className="login-feature-icon">
                ✓
              </span>

              <div>
                <strong>
                  Gestión centralizada
                </strong>

                <span>
                  Organiza todos tus
                  documentos.
                </span>
              </div>

            </div>

            <div className="login-feature">

              <span className="login-feature-icon">
                ✓
              </span>

              <div>
                <strong>
                  Seguimiento
                </strong>

                <span>
                  Consulta el historial
                  de actividades.
                </span>
              </div>

            </div>

            <div className="login-feature">

              <span className="login-feature-icon">
                ✓
              </span>

              <div>
                <strong>
                  Soporte
                </strong>

                <span>
                  Gestiona tus solicitudes
                  y tickets.
                </span>
              </div>

            </div>

          </div>

        </div>

        <div className="login-brand-footer">
          DocuPortal · Portal documental
        </div>

      </section>

      {/* PANEL LOGIN */}

      <section className="login-form-panel">

        <div className="login-card">

          {/* ENCABEZADO */}

          <div className="login-header">

            <div className="login-mobile-brand">

              <div className="login-logo">
                D
              </div>

              <div>

                <h1>
                  DocuPortal
                </h1>

                <span>
                  Portal documental
                </span>

              </div>

            </div>

            <span className="login-eyebrow">
              ACCESO AL PORTAL
            </span>

            <h2>
              Bienvenido
            </h2>

            <p>
              Ingresa tus datos para
              acceder a DocuPortal.
            </p>

          </div>

          {/* FORMULARIO */}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* CORREO */}

            <div className="login-field">

              <label htmlFor="email">
                Correo electrónico
              </label>

              <div className="login-input-wrapper">

                <span className="login-input-icon">
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="correo@docuportal.com"
                  autoComplete="email"
                  disabled={isLoading}
                />

              </div>

            </div>

            {/* CONTRASEÑA */}

            <div className="login-field">

              <div className="login-label-row">

                <label htmlFor="password">
                  Contraseña
                </label>

              </div>

              <div className="login-input-wrapper">

                <span className="login-input-icon">
                  •
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  disabled={isLoading}
                >
                  {showPassword
                    ? "◉"
                    : "○"}
                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div
                className="login-error"
                role="alert"
              >

                <span className="login-error-icon">
                  !
                </span>

                <span>
                  {error}
                </span>

              </div>
            )}

            {/* BOTÓN */}

            <button
              type="submit"
              className="login-submit"
              disabled={isLoading}
            >

              {isLoading ? (
                <>
                  <span className="login-spinner" />

                  <span>
                    Ingresando...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Iniciar sesión
                  </span>

                  <span className="login-submit-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          {/* USUARIO DEMO */}

          <div className="login-demo">

            <div className="login-demo-header">

              <span className="login-demo-icon">
                i
              </span>

              <strong>
                Usuario administrador inicial
              </strong>

            </div>

            <div className="login-demo-data">

              <div>

                <span>
                  Correo
                </span>

                <strong>
                  greylin@docuportal.com
                </strong>

              </div>

              <div>

                <span>
                  Contraseña
                </span>

                <strong>
                  123456
                </strong>

              </div>

            </div>

          </div>

          <p className="login-footer">
            © 2026 DocuPortal · Portal documental
          </p>

        </div>

      </section>

    </main>
  );
}