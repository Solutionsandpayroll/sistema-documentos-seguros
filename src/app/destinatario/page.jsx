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

  useEffect(() => {
    const session = localStorage.getItem(
      "docuportal_current_user"
    );

    console.log("SESIÓN GUARDADA:", session);

    if (!session) {
      window.location.href = "/";
      return;
    }

    try {
      const usuarioGuardado = JSON.parse(session);

      console.log(
        "USUARIO RECUPERADO:",
        usuarioGuardado
      );

      console.log(
        "ID DEL USUARIO:",
        usuarioGuardado?.id
      );

      if (usuarioGuardado.role !== "Usuario") {
        window.location.href = "/";
        return;
      }

      setUsuario(usuarioGuardado);

      cargarDocumentos(usuarioGuardado.id);
    } catch (error) {
      console.error(
        "Error leyendo sesión:",
        error
      );

      localStorage.removeItem(
        "docuportal_current_user"
      );

      window.location.href = "/";
    }
  }, []);

  async function cargarDocumentos(destinatarioId) {
    try {
      setCargando(true);
      setError("");

      if (!destinatarioId) {
        setError(
          "No se encontró el ID del usuario."
        );
        return;
      }

      const response = await fetch(
        `/api/documentos/destinatario/${destinatarioId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "No fue posible obtener los documentos."
        );
      }

      setDocumentos(data.documentos || []);
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

  function abrirAcceso(documento) {
    setDocumentoSeleccionado(documento);
    setContrasena("");
    setMensajeAcceso("");
  }

  function cerrarAcceso() {
    if (accediendo) return;

    setDocumentoSeleccionado(null);
    setContrasena("");
    setMensajeAcceso("");
  }

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
        destinatario_id: usuario.id,
        contrasena: contrasena,
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
            "Content-Type": "application/json",
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

  function cerrarSesion() {
    localStorage.removeItem(
      "docuportal_current_user"
    );

    localStorage.removeItem(
      "docuportal_destinatario"
    );

    sessionStorage.removeItem(
      "docuportal_documento_autorizado"
    );

    window.location.href = "/";
  }

  if (cargando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p>Cargando tus documentos...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
        padding: "30px",
      }}
    >
      {/* ENCABEZADO */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "25px 30px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#111827",
            }}
          >
            Bienvenido,{" "}
            {usuario?.nombre || "Usuario"}
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#6b7280",
            }}
          >
            Aquí puedes consultar los documentos
            que han sido autorizados para ti.
          </p>
        </div>

        <button
          onClick={cerrarSesion}
          style={{
            border: "none",
            background: "#ef4444",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* INFORMACIÓN DEL USUARIO */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "25px auto 0",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Correo
          </p>

          <strong
            style={{
              display: "block",
              marginTop: "8px",
              color: "#111827",
            }}
          >
            {usuario?.correo}
          </strong>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Empresa
          </p>

          <strong
            style={{
              display: "block",
              marginTop: "8px",
              color: "#111827",
            }}
          >
            {usuario?.empresa ||
              "No disponible"}
          </strong>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Documentos disponibles
          </p>

          <strong
            style={{
              display: "block",
              marginTop: "8px",
              fontSize: "24px",
              color: "#111827",
            }}
          >
            {documentos.length}
          </strong>
        </div>
      </div>

      {/* DOCUMENTOS */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "25px auto 0",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "25px 30px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#111827",
          }}
        >
          Mis documentos
        </h2>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px 15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {documentos.length === 0 ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            No tienes documentos disponibles.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                  }}
                >
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    Documento
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    Empresa
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    Estado
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    Fecha
                  </th>

                  <th
                    style={{
                      textAlign: "center",
                      padding: "14px",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {documentos.map((documento) => (
                  <tr key={documento.id}>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom:
                          "1px solid #f0f0f0",
                        fontWeight: "600",
                      }}
                    >
                      {documento.nombre_archivo}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom:
                          "1px solid #f0f0f0",
                      }}
                    >
                      {documento.empresa}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom:
                          "1px solid #f0f0f0",
                      }}
                    >
                      <span
                        style={{
                          display:
                            "inline-block",
                          background:
                            documento.estado ===
                            "enviado"
                              ? "#dcfce7"
                              : "#f3f4f6",
                          color:
                            documento.estado ===
                            "enviado"
                              ? "#166534"
                              : "#374151",
                          padding:
                            "5px 10px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        {documento.estado}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom:
                          "1px solid #f0f0f0",
                      }}
                    >
                      {documento.creado_en
                        ? new Date(
                            documento.creado_en
                          ).toLocaleDateString(
                            "es-CO"
                          )
                        : "Sin fecha"}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom:
                          "1px solid #f0f0f0",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={() =>
                          abrirAcceso(
                            documento
                          )
                        }
                        style={{
                          border: "none",
                          background:
                            "#111827",
                          color: "#ffffff",
                          padding:
                            "9px 16px",
                          borderRadius: "7px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        🔐 Acceder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL DE CONTRASEÑA */}
      {documentoSeleccionado && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "450px",
              background: "#ffffff",
              borderRadius: "14px",
              padding: "30px",
              boxShadow:
                "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#111827",
              }}
            >
              🔐 Acceder al documento
            </h2>

            <p
              style={{
                color: "#6b7280",
                lineHeight: "1.5",
              }}
            >
              Para acceder a este documento debes
              ingresar la contraseña que fue
              proporcionada para este archivo.
            </p>

            <div
              style={{
                background: "#f9fafb",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <strong>
                {
                  documentoSeleccionado.nombre_archivo
                }
              </strong>
            </div>

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Contraseña del documento
            </label>

            <input
              type="password"
              value={contrasena}
              onChange={(e) =>
                setContrasena(e.target.value)
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
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "8px",
                outline: "none",
                fontSize: "15px",
                marginBottom: "12px",
              }}
            />

            {mensajeAcceso && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  fontSize: "14px",
                }}
              >
                {mensajeAcceso}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={cerrarAcceso}
                disabled={accediendo}
                style={{
                  border:
                    "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#374151",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: accediendo
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Cancelar
              </button>

              <button
                onClick={accederDocumento}
                disabled={accediendo}
                style={{
                  border: "none",
                  background: "#111827",
                  color: "#ffffff",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: accediendo
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "600",
                  opacity: accediendo
                    ? 0.7
                    : 1,
                }}
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