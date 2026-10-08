"use client";

import "./configuracion.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../../../components/LogoutButton";

export default function ConfiguracionPage() {
  const router = useRouter();

  // Se inicializa con valores temporales para que
  // la pantalla aparezca inmediatamente.
  const [usuario, setUsuario] = useState({
    id: "",
    name: "Usuario",
    email: "",
    role: "Administrador",
    department: "Administración",
  });

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");

  const [contrasenaActual, setContrasenaActual] =
    useState("");

  const [nuevaContrasena, setNuevaContrasena] =
    useState("");

  const [confirmarContrasena, setConfirmarContrasena] =
    useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // ============================================================
  // OBTENER USUARIO DESDE LA SESIÓN
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
          router.push("/login");
          return;
        }

        const usuarioActual = data.usuario;

        const rol =
          String(usuarioActual.rol || "")
            .trim()
            .toLowerCase();

        if (rol !== "administrador") {
          router.push("/dashboard");
          return;
        }

        const usuarioData = {
          id: usuarioActual.id,
          name:
            usuarioActual.nombre ||
            "Usuario",
          email:
            usuarioActual.correo ||
            "",
          role:
            usuarioActual.rol ||
            "Administrador",
          department:
            "Administración",
        };

        setUsuario(usuarioData);

        setNombre(
          usuarioActual.nombre || ""
        );

        setCorreo(
          usuarioActual.correo || ""
        );
      } catch (err) {
        console.error(
          "Error cargando usuario:",
          err
        );

        router.push("/login");
      }
    };

    loadCurrentUser();
  }, [router]);

  // ============================================================
  // INICIALES
  // ============================================================

  const getInitials = () => {
    const name =
      usuario?.name || "Usuario";

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
  };

  // ============================================================
  // GUARDAR CAMBIOS
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMensaje("");
    setError("");

    if (!nombre.trim()) {
      setError(
        "El nombre es obligatorio."
      );
      return;
    }

    if (!correo.trim()) {
      setError(
        "El correo es obligatorio."
      );
      return;
    }

    if (
      nuevaContrasena ||
      confirmarContrasena ||
      contrasenaActual
    ) {
      if (!contrasenaActual) {
        setError(
          "Ingresa tu contraseña actual."
        );
        return;
      }

      if (!nuevaContrasena) {
        setError(
          "Ingresa la nueva contraseña."
        );
        return;
      }

      if (nuevaContrasena.length < 6) {
        setError(
          "La nueva contraseña debe tener mínimo 6 caracteres."
        );
        return;
      }

      if (
        nuevaContrasena !==
        confirmarContrasena
      ) {
        setError(
          "Las contraseñas nuevas no coinciden."
        );
        return;
      }
    }

    setGuardando(true);

    try {
      const response = await fetch(
        "/api/usuarios/cuenta",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: usuario.id,
            nombre: nombre.trim(),
            correo: correo
              .trim()
              .toLowerCase(),
            contrasenaActual:
              contrasenaActual || "",
            nuevaContrasena:
              nuevaContrasena || "",
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "No fue posible actualizar la cuenta."
        );
        return;
      }

      setUsuario((actual) => ({
        ...actual,
        id:
          data.usuario?.id ??
          actual.id,
        name:
          data.usuario?.nombre ??
          nombre.trim(),
        email:
          data.usuario?.correo ??
          correo.trim().toLowerCase(),
        role:
          data.usuario?.rol ??
          actual.role,
      }));

      if (data.usuario) {
        setNombre(
          data.usuario.nombre || ""
        );

        setCorreo(
          data.usuario.correo || ""
        );
      }

      setContrasenaActual("");
      setNuevaContrasena("");
      setConfirmarContrasena("");

      setMensaje(
        "Tu cuenta fue actualizada correctamente."
      );
    } catch (err) {
      console.error(
        "Error actualizando cuenta:",
        err
      );

      setError(
        "No fue posible actualizar la cuenta."
      );
    } finally {
      setGuardando(false);
    }
  };

  const isAdmin =
    String(usuario.role || "")
      .trim()
      .toLowerCase() ===
    "administrador";

  return (
    <div className="dashboard-layout">

      {/* ==========================================================
          SIDEBAR
      ========================================================== */}

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

          <div className="navigation-section">
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

          {isAdmin && (
            <Link
              href="/dashboard/configuracion"
              className="navigation-item active"
            >
              <span className="navigation-icon">
                ◉
              </span>

              <span>
                Mi cuenta
              </span>
            </Link>
          )}

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

        {/* ========================================================
            USUARIO DEL SIDEBAR
        ======================================================== */}

        <div className="sidebar-footer">

          <div className="sidebar-user">

            <div className="user-avatar">
              {getInitials()}
            </div>

            <div className="sidebar-user-data">

              <strong>
                {usuario.name}
              </strong>

              <span>
                {usuario.role}
              </span>

            </div>

          </div>

          <LogoutButton className="logout-link">
            <span>↪</span>
            Cerrar sesión
          </LogoutButton>

        </div>

      </aside>

      {/* ==========================================================
          CONTENIDO PRINCIPAL
      ========================================================== */}

      <main className="dashboard-main">

        {/* ========================================================
            HEADER
        ======================================================== */}

        <header className="dashboard-header">

          <div className="header-title">

            <span>
              GESTIÓN
            </span>

            <h1>
              Mi cuenta
            </h1>

          </div>

          <div className="header-right">

            <div className="header-user">

              <div className="header-user-avatar">
                {getInitials()}
              </div>

              <div className="header-user-data">

                <strong>
                  {usuario.name}
                </strong>

                <span>
                  {usuario.role}
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* ========================================================
            MI CUENTA
        ======================================================== */}

        <div className="account-page">

          <div className="account-header">

            <div>

              <span className="account-eyebrow">
                CONFIGURACIÓN
              </span>

              <h1>
                Mi cuenta
              </h1>

              <p>
                Administra tus datos personales
                y credenciales de acceso.
              </p>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="account-content"
          >

            {/* ==================================================
                INFORMACIÓN PERSONAL
            ================================================== */}

            <section className="account-card">

              <div className="account-card-header">

                <div className="account-card-icon">
                  👤
                </div>

                <div>

                  <h2>
                    Información personal
                  </h2>

                  <p>
                    Actualiza tu nombre y correo
                    electrónico.
                  </p>

                </div>

              </div>

              <div className="account-fields">

                <div className="account-field">

                  <label htmlFor="nombre">
                    Nombre completo
                  </label>

                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(event) =>
                      setNombre(
                        event.target.value
                      )
                    }
                    disabled={guardando}
                  />

                </div>

                <div className="account-field">

                  <label htmlFor="correo">
                    Correo electrónico
                  </label>

                  <input
                    id="correo"
                    type="email"
                    value={correo}
                    onChange={(event) =>
                      setCorreo(
                        event.target.value
                      )
                    }
                    disabled={guardando}
                  />

                </div>

              </div>

            </section>

            {/* ==================================================
                SEGURIDAD
            ================================================== */}

            <section className="account-card">

              <div className="account-card-header">

                <div className="account-card-icon">
                  🔐
                </div>

                <div>

                  <h2>
                    Seguridad
                  </h2>

                  <p>
                    Cambia tu contraseña cuando
                    lo necesites.
                  </p>

                </div>

              </div>

              <div className="account-fields">

                <div className="account-field">

                  <label htmlFor="contrasenaActual">
                    Contraseña actual
                  </label>

                  <input
                    id="contrasenaActual"
                    type="password"
                    value={
                      contrasenaActual
                    }
                    onChange={(event) =>
                      setContrasenaActual(
                        event.target.value
                      )
                    }
                    placeholder="Ingresa tu contraseña actual"
                    disabled={guardando}
                  />

                </div>

                <div className="account-field">

                  <label htmlFor="nuevaContrasena">
                    Nueva contraseña
                  </label>

                  <input
                    id="nuevaContrasena"
                    type="password"
                    value={
                      nuevaContrasena
                    }
                    onChange={(event) =>
                      setNuevaContrasena(
                        event.target.value
                      )
                    }
                    placeholder="Mínimo 6 caracteres"
                    disabled={guardando}
                  />

                </div>

                <div className="account-field">

                  <label htmlFor="confirmarContrasena">
                    Confirmar nueva contraseña
                  </label>

                  <input
                    id="confirmarContrasena"
                    type="password"
                    value={
                      confirmarContrasena
                    }
                    onChange={(event) =>
                      setConfirmarContrasena(
                        event.target.value
                      )
                    }
                    placeholder="Repite la nueva contraseña"
                    disabled={guardando}
                  />

                </div>

              </div>

            </section>

            {/* ==================================================
                MENSAJES
            ================================================== */}

            {error && (
              <div className="account-message error">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="account-message success">
                {mensaje}
              </div>
            )}

            {/* ==================================================
                BOTONES
            ================================================== */}

            <div className="account-actions">

              <Link
                href="/dashboard"
                className="account-cancel"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                className="account-save"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}