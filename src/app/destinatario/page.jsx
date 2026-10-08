"use client";

import { useEffect, useState } from "react";

export default function DestinatarioPage() {
  const [usuario, setUsuario] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [documentoSeleccionado, setDocumentoSeleccionado] =
    useState(null);

  const [contrasena, setContrasena] = useState("");
  const [accediendo, setAccediendo] = useState(false);
  const [mensajeAcceso, setMensajeAcceso] = useState("");

  // ============================================================
  // CARGAR SESIÓN DEL DESTINATARIO
  // ============================================================

  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const response = await fetch(
          "/api/destinatarios/sesion",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        console.log(
          "SESIÓN DEL DESTINATARIO:",
          data
        );

        if (!response.ok || !data.success || !data.destinatario) {
          window.location.href = "/";
          return;
        }

        const destinatario = data.destinatario;

        console.log(
          "DESTINATARIO RECUPERADO:",
          destinatario
        );

        console.log(
          "ID DEL DESTINATARIO:",
          destinatario.id
        );

        if (destinatario.role !== "Destinatario") {
          window.location.href = "/";
          return;
        }

        setUsuario(destinatario);

        await cargarDocumentos(destinatario.id);
      } catch (error) {
        console.error(
          "Error obteniendo sesión del destinatario:",
          error
        );

        window.location.href = "/";
      }
    };

    cargarSesion();
  }, []);

  // ============================================================
  // CARGAR DOCUMENTOS
  // ============================================================

  async function cargarDocumentos(destinatarioId) {
    try {
      setCargando(true);
      setError("");

      if (!destinatarioId) {
        setError(
          "No se encontró el ID del destinatario."
        );
        return;
      }

      const response = await fetch(
        `/api/documentos/destinatario/${destinatarioId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "No fue posible obtener los documentos."
        );
      }

      setDocumentos(
        data.documentos || []
      );
    } catch (error) {
      console.error(
        "Error obteniendo documentos:",
        error
      );

      setError(
        error.message ||
          "No fue posible cargar los documentos."
      );
    } finally {
      setCargando(false);
    }
  }

  // ============================================================
  // ABRIR ACCESO
  // ============================================================

  function abrirAcceso(documento) {
    setDocumentoSeleccionado(documento);
    setContrasena("");
    setMensajeAcceso("");
  }

  // ============================================================
  // CERRAR ACCESO
  // ============================================================

  function cerrarAcceso() {
    if (accediendo) return;

    setDocumentoSeleccionado(null);
    setContrasena("");
    setMensajeAcceso("");
  }

  // ============================================================
  // ACCEDER AL DOCUMENTO
  // ============================================================

  async function accederDocumento() {
    if (!documentoSeleccionado) {
      return;
    }

    if (!usuario?.id) {
      setMensajeAcceso(
        "No se encontró el usuario de la sesión."
      );

      console.error(
        "No existe usuario.id:",
        usuario
      );

      return;
    }

    if (!contrasena.trim()) {
      setMensajeAcceso(
        "Ingresa la contraseña del documento."
      );

      return;
    }

    console.log(
      "DATOS QUE SE ENVIARÁN:",
      {
        documento_id:
          documentoSeleccionado.id,

        destinatario_id:
          usuario.id,

        contrasena:
          contrasena,
      }
    );

    try {
      setAccediendo(true);
      setMensajeAcceso("");

      const response = await fetch(
        "/api/documentos/acceso",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            documento_id:
              documentoSeleccionado.id,

            destinatario_id:
              usuario.id,

            contrasena:
              contrasena,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "RESPUESTA DE LA API:",
        data
      );

      if (!response.ok || !data.success) {
        setMensajeAcceso(
          data.message ||
            "No fue posible acceder al documento."
        );

        return;
      }

      sessionStorage.setItem(
        "docuportal_documento_autorizado",
        JSON.stringify(data.documento)
      );

      window.location.href =
        "/destinatario/documento";
    } catch (error) {
      console.error(
        "Error accediendo al documento:",
        error
      );

      setMensajeAcceso(
        "Ocurrió un error al validar el acceso."
      );
    } finally {
      setAccediendo(false);
    }
  }

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================

  function cerrarSesion() {
    sessionStorage.removeItem(
      "docuportal_documento_autorizado"
    );

    window.location.href = "/";
  }

  // ============================================================
  // OBTENER ESTADO
  // ============================================================

  function getStatusClass(status) {
    const estado = status?.toLowerCase();

    if (estado === "enviado") {
      return "destinatario-status-enviado";
    }

    if (estado === "recibido") {
      return "destinatario-status-recibido";
    }

    return "destinatario-status-pendiente";
  }

  // ============================================================
  // CARGANDO
  // ============================================================

  if (cargando) {
    return (
      <main className="destinatario-loading">
        <div className="destinatario-loading-content">
          <div className="destinatario-loading-icon"></div>

          <p>
            Cargando tus documentos...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // INTERFAZ
  // ============================================================

  return (
    <main className="destinatario-page">
      <div className="destinatario-container">

        {/* ======================================================
            ENCABEZADO
            ====================================================== */}

        <header className="destinatario-header">

          <div className="destinatario-header-info">

            <h1>
              Bienvenido,{" "}
              {usuario?.nombre || "Usuario"}
            </h1>

            <p>
              Aquí puedes consultar los documentos
              que han sido autorizados para ti.
            </p>

          </div>

          <button
            onClick={cerrarSesion}
            className="destinatario-logout"
          >
            Cerrar sesión
          </button>

        </header>

        {/* ======================================================
            INFORMACIÓN DEL USUARIO
            ====================================================== */}

        <section className="destinatario-info-grid">

          <div className="destinatario-info-card">

            <p className="destinatario-info-label">
              Correo
            </p>

            <strong className="destinatario-info-value">
              {usuario?.correo ||
                "No disponible"}
            </strong>

          </div>

          <div className="destinatario-info-card">

            <p className="destinatario-info-label">
              Empresa
            </p>

            <strong className="destinatario-info-value">
              {usuario?.empresa ||
                "No disponible"}
            </strong>

          </div>

          <div className="destinatario-info-card">

            <p className="destinatario-info-label">
              Documentos disponibles
            </p>

            <strong className="destinatario-info-value destinatario-info-number">
              {documentos.length}
            </strong>

          </div>

        </section>

        {/* ======================================================
            DOCUMENTOS
            ====================================================== */}

        <section className="destinatario-documents-card">

          <div className="destinatario-section-header">

            <div>

              <span>
                PORTAL DOCUMENTAL
              </span>

              <h2>
                Mis documentos
              </h2>

            </div>

          </div>

          {error && (
            <div className="destinatario-error">
              {error}
            </div>
          )}

          {documentos.length === 0 ? (

            <div className="destinatario-empty">

              <div className="destinatario-empty-icon">
                ▤
              </div>

              <strong>
                No tienes documentos disponibles
              </strong>

              <span>
                Los documentos autorizados para ti
                aparecerán aquí.
              </span>

            </div>

          ) : (

            <div className="destinatario-table-wrapper">

              <table className="destinatario-table">

                <thead>

                  <tr>

                    <th>
                      Documento
                    </th>

                    <th>
                      Empresa
                    </th>

                    <th>
                      Estado
                    </th>

                    <th>
                      Fecha
                    </th>

                    <th>
                      Acción
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {documentos.map(
                    (documento) => (

                      <tr
                        key={documento.id}
                      >

                        <td>

                          <div className="destinatario-document-name">

                            {documento.nombre_archivo}

                          </div>

                        </td>

                        <td>

                          <span className="destinatario-company">

                            {documento.empresa ||
                              "Sin empresa"}

                          </span>

                        </td>

                        <td>

                          <span
                            className={`destinatario-status ${getStatusClass(
                              documento.estado
                            )}`}
                          >

                            <span className="destinatario-status-dot"></span>

                            {documento.estado ||
                              "Pendiente"}

                          </span>

                        </td>

                        <td>

                          {documento.creado_en
                            ? new Date(
                                documento.creado_en
                              ).toLocaleDateString(
                                "es-CO"
                              )
                            : "Sin fecha"}

                        </td>

                        <td>

                          <button
                            onClick={() =>
                              abrirAcceso(
                                documento
                              )
                            }
                            className="destinatario-access-button"
                          >
                            🔐 Acceder
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>

      {/* ========================================================
          MODAL DE CONTRASEÑA
          ======================================================== */}

      {documentoSeleccionado && (

        <div className="destinatario-modal-overlay">

          <div className="destinatario-modal">

            <div className="destinatario-modal-header">

              <h2>
                🔐 Acceder al documento
              </h2>

            </div>

            <p className="destinatario-modal-description">
              Para acceder a este documento debes
              ingresar la contraseña que fue
              proporcionada para este archivo.
            </p>

            <div className="destinatario-selected-file">

              <strong>
                {documentoSeleccionado.nombre_archivo}
              </strong>

            </div>

            <label className="destinatario-password-label">
              Contraseña del documento
            </label>

            <input
              type="password"
              value={contrasena}
              onChange={(e) =>
                setContrasena(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !accediendo
                ) {
                  accederDocumento();
                }
              }}
              placeholder="Ingresa la contraseña"
              disabled={accediendo}
              className="destinatario-password-input"
            />

            {mensajeAcceso && (

              <div className="destinatario-access-error">

                {mensajeAcceso}

              </div>

            )}

            <div className="destinatario-modal-actions">

              <button
                onClick={cerrarAcceso}
                disabled={accediendo}
                className="destinatario-cancel-button"
              >
                Cancelar
              </button>

              <button
                onClick={accederDocumento}
                disabled={accediendo}
                className="destinatario-confirm-button"
              >
                {accediendo
                  ? "Validando..."
                  : "Acceder"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}