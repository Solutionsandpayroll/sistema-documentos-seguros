"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ALLOWED_ROLES = [
  "Administrador",
  "Empleado",
  "Usuario",
];

const DEFAULT_ADMIN = {
  id: "USR-001",
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

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  // ============================================================
  // INICIALIZAR USUARIO ADMINISTRADOR
  // ============================================================

  useEffect(() => {
    /*
     * Si no existe ningún usuario creado,
     * creamos únicamente el usuario administrador
     * inicial para la demostración.
     */
    try {
      const savedUsers = JSON.parse(
        localStorage.getItem(
          "docuportal_users"
        ) || "[]"
      );

      if (
        !Array.isArray(savedUsers) ||
        savedUsers.length === 0
      ) {
        localStorage.setItem(
          "docuportal_users",
          JSON.stringify([
            DEFAULT_ADMIN,
          ])
        );
      }
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

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    // ----------------------------------------------------------
    // VALIDAR CORREO
    // ----------------------------------------------------------

    if (!email.trim()) {
      setError(
        "Ingresa tu correo electrónico."
      );

      return;
    }

    // ----------------------------------------------------------
    // VALIDAR CONTRASEÑA
    // ----------------------------------------------------------

    if (!password) {
      setError(
        "Ingresa tu contraseña."
      );

      return;
    }

    setIsLoading(true);

    try {
      // --------------------------------------------------------
      // OBTENER USUARIOS
      // --------------------------------------------------------

      const savedUsers = JSON.parse(
        localStorage.getItem(
          "docuportal_users"
        ) || "[]"
      );

      const users =
        Array.isArray(savedUsers)
          ? savedUsers
          : [];

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      // --------------------------------------------------------
      // BUSCAR USUARIO
      // --------------------------------------------------------

      const user = users.find(
        (item) =>
          String(
            item?.email || ""
          )
            .trim()
            .toLowerCase() ===
            normalizedEmail &&
          String(
            item?.password || ""
          ) === password
      );

      // --------------------------------------------------------
      // USUARIO NO ENCONTRADO
      // --------------------------------------------------------

      if (!user) {
        setError(
          "El correo o la contraseña son incorrectos."
        );

        setIsLoading(false);

        return;
      }

      // --------------------------------------------------------
      // VALIDAR ESTADO
      // --------------------------------------------------------

      if (user.status !== "Activo") {
        setError(
          "Este usuario se encuentra inactivo. Contacta al administrador."
        );

        setIsLoading(false);

        return;
      }

      // --------------------------------------------------------
      // VALIDAR ROL
      // --------------------------------------------------------
      //
      // DocuPortal actualmente trabaja únicamente con:
      //
      // Administrador
      // Empleado
      // Usuario
      //
      // --------------------------------------------------------

      if (
        !ALLOWED_ROLES.includes(
          user.role
        )
      ) {
        setError(
          "El usuario tiene un rol no válido. Contacta al administrador."
        );

        setIsLoading(false);

        return;
      }

      // ========================================================
      // CREAR SESIÓN
      // ========================================================

      /*
       * Nunca guardamos la contraseña dentro
       * de la sesión actual.
       */

      const sessionUser = {
        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,

        department:
          user.department || "",
      };

      localStorage.setItem(
        "docuportal_current_user",
        JSON.stringify(
          sessionUser
        )
      );

      // ========================================================
      // ACTUALIZAR ÚLTIMO ACCESO
      // ========================================================

      const updatedUsers =
        users.map((item) => {
          if (
            item.id === user.id
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
        });

      localStorage.setItem(
        "docuportal_users",
        JSON.stringify(
          updatedUsers
        )
      );

      // ========================================================
      // REGISTRAR INICIO DE SESIÓN
      // ========================================================

      let existingHistory = [];

      try {
        const savedHistory =
          localStorage.getItem(
            "docuportal_history"
          );

        existingHistory = savedHistory
          ? JSON.parse(savedHistory)
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
          user.name,

        documentId:
          user.id,

        // ------------------------------------------------------
        // USUARIO QUE INICIÓ SESIÓN
        // ------------------------------------------------------

        user:
          user.name,

        userId:
          user.id,

        userRole:
          user.role,

        userEmail:
          user.email,

        department:
          user.department || "",

        // ------------------------------------------------------
        // INFORMACIÓN DE LA ACCIÓN
        // ------------------------------------------------------

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

        type:
          "Usuario",

        details:
          `El usuario ${user.name} inició sesión en DocuPortal.`,

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

      // ========================================================
      // REDIRIGIR AL DASHBOARD
      // ========================================================

      setTimeout(() => {
        router.push(
          "/dashboard"
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

      <section className="login-card">

        {/* ========================================================
            LOGO
        ======================================================== */}

        <div className="login-brand">

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

        {/* ========================================================
            ENCABEZADO
        ======================================================== */}

        <div className="login-header">

          <span>
            ACCESO AL PORTAL
          </span>

          <h2>
            Bienvenido
          </h2>

          <p>
            Ingresa tus datos para acceder
            a DocuPortal.
          </p>

        </div>

        {/* ========================================================
            FORMULARIO
        ======================================================== */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {/* ======================================================
              CORREO
          ====================================================== */}

          <div className="login-field">

            <label htmlFor="email">
              Correo electrónico
            </label>

            <div className="login-input-wrapper">

              <span>
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
              />

            </div>

          </div>

          {/* ======================================================
              CONTRASEÑA
          ====================================================== */}

          <div className="login-field">

            <label htmlFor="password">
              Contraseña
            </label>

            <div className="login-input-wrapper">

              <span>
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
              >
                {showPassword
                  ? "◉"
                  : "○"}
              </button>

            </div>

          </div>

          {/* ======================================================
              ERROR
          ====================================================== */}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* ======================================================
              BOTÓN
          ====================================================== */}

          <button
            type="submit"
            className="login-submit"
            disabled={isLoading}
          >

            {isLoading ? (
              <>
                <span>
                  ...
                </span>

                Ingresando
              </>
            ) : (
              <>
                Iniciar sesión

                <span>
                  →
                </span>
              </>
            )}

          </button>

        </form>

        {/* ========================================================
            INFORMACIÓN DEMO
        ======================================================== */}

        <div className="login-demo">

          <strong>
            Usuario administrador inicial
          </strong>

          <span>
            greylin@docuportal.com
          </span>

          <span>
            Contraseña: 123456
          </span>

        </div>

        <p className="login-footer">
          DocuPortal · Portal documental
        </p>

      </section>

    </main>
  );
}