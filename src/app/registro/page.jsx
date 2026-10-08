"use client";
import "./registro.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const router = useRouter();

  const [tipoCuenta, setTipoCuenta] =
    useState("Empleado");

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [contrasena, setContrasena] =
    useState("");
  const [confirmarContrasena, setConfirmarContrasena] =
    useState("");

  const [empresas, setEmpresas] = useState([]);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);
  const [loadingEmpresas, setLoadingEmpresas] =
    useState(false);

  // ============================================================
  // CARGAR EMPRESAS
  // ============================================================

  useEffect(() => {
    if (tipoCuenta !== "Destinatario") {
      return;
    }

    const cargarEmpresas = async () => {
      setLoadingEmpresas(true);
      setError("");

      try {
        const response = await fetch(
          "/api/empresas"
        );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "No fue posible cargar las empresas."
          );

          return;
        }

        setEmpresas(
          Array.isArray(data)
            ? data
            : data.empresas || []
        );
      } catch (error) {
        console.error(
          "Error cargando empresas:",
          error
        );

        setError(
          "No fue posible cargar las empresas."
        );
      } finally {
        setLoadingEmpresas(false);
      }
    };

    cargarEmpresas();
  }, [tipoCuenta]);

  // ============================================================
  // CAMBIAR TIPO DE CUENTA
  // ============================================================

  const handleTipoCuenta = (tipo) => {
    setTipoCuenta(tipo);
    setError("");
    setSuccess("");

    if (tipo === "Empleado") {
      setEmpresaId("");
    }
  };

  // ============================================================
  // CREAR CUENTA
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // VALIDACIONES
    // ----------------------------------------------------------

    if (!nombre.trim()) {
      setError(
        "Ingresa tu nombre completo."
      );
      return;
    }

    if (!correo.trim()) {
      setError(
        "Ingresa tu correo electrónico."
      );
      return;
    }

    if (!contrasena) {
      setError(
        "Ingresa una contraseña."
      );
      return;
    }

    if (contrasena.length < 6) {
      setError(
        "La contraseña debe tener mínimo 6 caracteres."
      );
      return;
    }

    if (!confirmarContrasena) {
      setError(
        "Confirma tu contraseña."
      );
      return;
    }

    if (
      contrasena !==
      confirmarContrasena
    ) {
      setError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    if (
      tipoCuenta === "Destinatario" &&
      !empresaId
    ) {
      setError(
        "Selecciona la empresa a la que perteneces."
      );
      return;
    }

    setIsLoading(true);

    try {
      const correoNormalizado =
        correo.trim().toLowerCase();

      // ========================================================
      // EMPLEADO
      // ========================================================

      if (tipoCuenta === "Empleado") {
        const response = await fetch(
          "/api/usuarios/registro",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              nombre: nombre.trim(),
              correo:
                correoNormalizado,
              contrasena,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok || !data.success) {
          setError(
            data.message ||
              "No fue posible crear la cuenta."
          );

          return;
        }

        setSuccess(
          "Cuenta creada correctamente. Serás redirigido al inicio de sesión."
        );

        setTimeout(() => {
          router.push("/login");
        }, 1800);

        return;
      }

      // ========================================================
      // DESTINATARIO
      // ========================================================

      const response = await fetch(
        "/api/destinatarios/registro",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            nombre: nombre.trim(),
            correo:
              correoNormalizado,
            contrasena,
            empresa_id:
              Number(empresaId),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "No fue posible crear la cuenta."
        );

        return;
      }

      setSuccess(
        "Cuenta creada correctamente. Serás redirigido al inicio de sesión."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (error) {
      console.error(
        "Error creando cuenta:",
        error
      );

      setError(
        "No fue posible crear la cuenta. Intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="registro-page">

      {/* ======================================================
          PANEL IZQUIERDO
      ====================================================== */}

      <section className="registro-brand-panel">

        <div className="registro-brand-content">

          <div className="registro-brand-logo">
            D
          </div>

          <div className="registro-brand-name">

            <h1>
              DocuPortal
            </h1>

            <span>
              Portal documental
            </span>

          </div>

          <div className="registro-brand-description">

            <span className="registro-brand-eyebrow">
              CREA TU CUENTA
            </span>

            <h2>
              Empieza a gestionar
              <br />
              tus documentos.
            </h2>

            <p>
              Crea tu cuenta para acceder
              al portal y gestionar tus
              documentos de forma sencilla
              y segura.
            </p>

          </div>

          <div className="registro-features">

            <div className="registro-feature">

              <span className="registro-feature-icon">
                ✓
              </span>

              <div>

                <strong>
                  Gestión centralizada
                </strong>

                <span>
                  Accede a tus documentos
                  desde un solo lugar.
                </span>

              </div>

            </div>

            <div className="registro-feature">

              <span className="registro-feature-icon">
                ✓
              </span>

              <div>

                <strong>
                  Acceso seguro
                </strong>

                <span>
                  Protege el acceso a tu
                  información.
                </span>

              </div>

            </div>

            <div className="registro-feature">

              <span className="registro-feature-icon">
                ✓
              </span>

              <div>

                <strong>
                  Seguimiento
                </strong>

                <span>
                  Consulta la actividad
                  de tus documentos.
                </span>

              </div>

            </div>

          </div>

        </div>

        <div className="registro-brand-footer">
          DocuPortal · Portal documental
        </div>

      </section>

      {/* ======================================================
          PANEL REGISTRO
      ====================================================== */}

      <section className="registro-form-panel">

        <div className="registro-card">

          {/* ENCABEZADO */}

          <div className="registro-header">

            <div className="registro-mobile-brand">

              <div className="registro-logo">
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

            <span className="registro-eyebrow">
              NUEVA CUENTA
            </span>

            <h2>
              Crear cuenta
            </h2>

            <p>
              Completa tus datos para
              registrarte en DocuPortal.
            </p>

          </div>

          {/* FORMULARIO */}

          <form
            className="registro-form"
            onSubmit={handleSubmit}
          >

            {/* NOMBRE */}

            <div className="registro-field">

              <label htmlFor="nombre">
                Nombre completo
              </label>

              <div className="registro-input-wrapper">

                <span className="registro-input-icon">
                  ◉
                </span>

                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(event) =>
                    setNombre(
                      event.target.value
                    )
                  }
                  placeholder="Ingresa tu nombre completo"
                  autoComplete="name"
                  disabled={isLoading}
                />

              </div>

            </div>

            {/* CORREO */}

            <div className="registro-field">

              <label htmlFor="correo">
                Correo electrónico
              </label>

              <div className="registro-input-wrapper">

                <span className="registro-input-icon">
                  @
                </span>

                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(event) =>
                    setCorreo(
                      event.target.value
                    )
                  }
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  disabled={isLoading}
                />

              </div>

            </div>

            {/* TIPO DE CUENTA */}

            <div className="registro-field">

              <label>
                Tipo de cuenta
              </label>

              <div className="registro-account-types">

                <button
                  type="button"
                  className={`registro-account-option ${
                    tipoCuenta ===
                    "Empleado"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleTipoCuenta(
                      "Empleado"
                    )
                  }
                  disabled={isLoading}
                >

                  <span className="registro-account-icon">
                    👤
                  </span>

                  <span>
                    <strong>
                      Empleado
                    </strong>

                    <small>
                      Gestión de documentos
                    </small>
                  </span>

                </button>

                <button
                  type="button"
                  className={`registro-account-option ${
                    tipoCuenta ===
                    "Destinatario"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleTipoCuenta(
                      "Destinatario"
                    )
                  }
                  disabled={isLoading}
                >

                  <span className="registro-account-icon">
                    📄
                  </span>

                  <span>
                    <strong>
                      Destinatario
                    </strong>

                    <small>
                      Recepción de documentos
                    </small>
                  </span>

                </button>

              </div>

            </div>

            {/* EMPRESA */}

            {tipoCuenta ===
              "Destinatario" && (
              <div className="registro-field">

                <label htmlFor="empresa">
                  Empresa
                </label>

                <div className="registro-input-wrapper">

                  <span className="registro-input-icon">
                    ▣
                  </span>

                  <select
                    id="empresa"
                    value={empresaId}
                    onChange={(event) =>
                      setEmpresaId(
                        event.target.value
                      )
                    }
                    disabled={
                      isLoading ||
                      loadingEmpresas
                    }
                  >

                    <option value="">
                      {loadingEmpresas
                        ? "Cargando empresas..."
                        : "Selecciona tu empresa"}
                    </option>

                    {empresas.map(
                      (empresa) => (
                        <option
                          key={empresa.id}
                          value={empresa.id}
                        >
                          {empresa.nombre}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>
            )}

            {/* CONTRASEÑA */}

            <div className="registro-field">

              <label htmlFor="contrasena">
                Contraseña
              </label>

              <div className="registro-input-wrapper">

                <span className="registro-input-icon">
                  •
                </span>

                <input
                  id="contrasena"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={contrasena}
                  onChange={(event) =>
                    setContrasena(
                      event.target.value
                    )
                  }
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className="registro-password-toggle"
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

            {/* CONFIRMAR CONTRASEÑA */}

            <div className="registro-field">

              <label htmlFor="confirmarContrasena">
                Confirmar contraseña
              </label>

              <div className="registro-input-wrapper">

                <span className="registro-input-icon">
                  •
                </span>

                <input
                  id="confirmarContrasena"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmarContrasena
                  }
                  onChange={(event) =>
                    setConfirmarContrasena(
                      event.target.value
                    )
                  }
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className="registro-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  disabled={isLoading}
                >
                  {showConfirmPassword
                    ? "◉"
                    : "○"}
                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div
                className="registro-error"
                role="alert"
              >

                <span className="registro-error-icon">
                  !
                </span>

                <span>
                  {error}
                </span>

              </div>
            )}

            {/* ÉXITO */}

            {success && (
              <div
                className="registro-success"
                role="status"
              >

                <span className="registro-success-icon">
                  ✓
                </span>

                <span>
                  {success}
                </span>

              </div>
            )}

            {/* BOTÓN */}

            <button
              type="submit"
              className="registro-submit"
              disabled={isLoading}
            >

              {isLoading ? (
                <>
                  <span className="registro-spinner" />

                  <span>
                    Creando cuenta...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Crear cuenta
                  </span>

                  <span className="registro-submit-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          {/* VOLVER AL LOGIN */}

          <div className="registro-login-link">

            <span>
              ¿Ya tienes una cuenta?
            </span>

            <button
              type="button"
              onClick={() =>
                router.push("/login")
              }
            >
              Iniciar sesión
            </button>

          </div>

          <p className="registro-footer">
            © 2026 DocuPortal · Portal documental
          </p>

        </div>

      </section>

    </main>
  );
}