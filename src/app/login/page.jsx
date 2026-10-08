"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // INICIAR SESIÓN
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    if (!password) {
      setError("Ingresa tu contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail =
        email.trim().toLowerCase();

      // ========================================================
      // 1. VALIDAR ADMINISTRADOR O EMPLEADO EN NEON
      // ========================================================

      const userResponse = await fetch(
        "/api/usuarios/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            correo: normalizedEmail,
            contrasena: password,
          }),
        }
      );

      const userData = await userResponse.json();

      if (
        userResponse.ok &&
        userData.success
      ) {
        const usuario = userData.usuario;

        const role = String(
          usuario.rol || ""
        )
          .trim()
          .toLowerCase();

        // ======================================================
        // ADMINISTRADOR
        // ======================================================

        if (role === "administrador") {
          setTimeout(() => {
            router.push("/dashboard");
          }, 500);

          return;
        }

        // ======================================================
        // EMPLEADO
        // ======================================================

        if (role === "empleado") {
          setTimeout(() => {
            router.push("/dashboard");
          }, 500);

          return;
        }
      }

      // ========================================================
      // 2. VALIDAR DESTINATARIO EN NEON
      // ========================================================

      const recipientResponse =
        await fetch(
          "/api/destinatarios/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              correo: normalizedEmail,
              contrasena: password,
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
          "El correo o la contraseña son incorrectos."
        );

        setIsLoading(false);
        return;
      }

      // ========================================================
      // 3. USUARIO = DESTINATARIO
      // ========================================================

      const destinatario =
        recipientData.destinatario;

      // ========================================================
      // GUARDAR DATOS DEL DESTINATARIO
      // ========================================================

      sessionStorage.setItem(
        "docuportal_destinatario",
        JSON.stringify(destinatario)
      );

      // ========================================================
      // REDIRIGIR DESTINATARIO
      // ========================================================

      setTimeout(() => {
        router.push("/destinatario");
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

      {/* ======================================================
          PANEL IZQUIERDO
      ====================================================== */}

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

      {/* ======================================================
          PANEL LOGIN
      ====================================================== */}

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

          {/* CREAR CUENTA */}

          <div className="login-register-link">

            <span>
              ¿No tienes una cuenta?
            </span>

            <button
              type="button"
              onClick={() =>
                router.push("/registro")
              }
            >
              Crear cuenta
            </button>

          </div>

          {/* USUARIO ADMINISTRADOR INICIAL */}

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