"use client";

import { useEffect, useState } from "react";

export default function EmpleadoPage() {
  const [usuario, setUsuario] = useState(null);

  const [empresas, setEmpresas] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);

  const [empresaSeleccionada, setEmpresaSeleccionada] =
    useState("");

  const [destinatarioSeleccionado, setDestinatarioSeleccionado] =
    useState("");

  const [archivo, setArchivo] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarSesion();
    cargarDatos();
  }, []);

  function cargarSesion() {
    const sesionGuardada =
      localStorage.getItem("docuportal_current_user");

    if (!sesionGuardada) {
      window.location.href = "/";
      return;
    }

    try {
      const sesion = JSON.parse(sesionGuardada);

      if (sesion.role !== "Empleado") {
        window.location.href = "/";
        return;
      }

      setUsuario(sesion);
    } catch (error) {
      console.error(
        "Error leyendo la sesión:",
        error
      );

      window.location.href = "/";
    }
  }

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [empresasResponse, destinatariosResponse] =
        await Promise.all([
          fetch("/api/empresas"),
          fetch("/api/destinatarios"),
        ]);

      if (!empresasResponse.ok) {
        throw new Error(
          "No fue posible cargar las empresas."
        );
      }

      if (!destinatariosResponse.ok) {
        throw new Error(
          "No fue posible cargar los usuarios autorizados."
        );
      }

      const empresasData =
        await empresasResponse.json();

      const destinatariosData =
        await destinatariosResponse.json();

      setEmpresas(empresasData);
      setDestinatarios(destinatariosData);
    } catch (error) {
      console.error(
        "Error cargando datos:",
        error
      );

      setError(
        error.message ||
          "No fue posible cargar la información."
      );
    } finally {
      setCargando(false);
    }
  }

  function seleccionarArchivo(event) {
    const archivoSeleccionado =
      event.target.files?.[0];

    if (!archivoSeleccionado) {
      setArchivo(null);
      return;
    }

    setArchivo(archivoSeleccionado);
    setMensaje("");
    setError("");
  }

  function generarContrasena() {
    const caracteres =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    let contrasena = "";

    for (let i = 0; i < 8; i++) {
      const posicion = Math.floor(
        Math.random() * caracteres.length
      );

      contrasena += caracteres[posicion];
    }

    return contrasena;
  }

  async function enviarDocumento(event) {
    event.preventDefault();

    setMensaje("");
    setError("");

    if (!usuario?.id) {
      setError(
        "No se encontró la sesión del empleado."
      );
      return;
    }

    if (!archivo) {
      setError(
        "Debes seleccionar un archivo."
      );
      return;
    }

    if (!empresaSeleccionada) {
      setError(
        "Debes seleccionar una empresa."
      );
      return;
    }

    if (!destinatarioSeleccionado) {
      setError(
        "Debes seleccionar un Usuario autorizado."
      );
      return;
    }

    try {
      setEnviando(true);

      // ------------------------------------------------
      // 1. Subir archivo
      // ------------------------------------------------

      const formData = new FormData();

      formData.append("file", archivo);

      const uploadResponse = await fetch(
        "/api/documentos/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData =
        await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(
          uploadData.message ||
            "No fue posible subir el archivo."
        );
      }

      // ------------------------------------------------
      // 2. Generar contraseña del documento
      // ------------------------------------------------

      const contrasena =
        generarContrasena();

      // ------------------------------------------------
      // 3. Registrar documento en Neon
      // ------------------------------------------------

      const documentoResponse =
        await fetch(
          "/api/documentos/crear",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              nombre_archivo:
                uploadData.archivo
                  .nombre_original,

              ruta_archivo:
                uploadData.archivo
                  .ruta_archivo,

              empleado_id: Number(usuario.id),

              empresa_id:
                Number(empresaSeleccionada),

              destinatario_id:
                Number(
                  destinatarioSeleccionado
                ),

              contrasena,

              estado: "enviado",
            }),
          }
        );

      const documentoData =
        await documentoResponse.json();

      if (
        !documentoResponse.ok ||
        !documentoData.success
      ) {
        throw new Error(
          documentoData.message ||
            "No fue posible registrar el documento."
        );
      }

      // ------------------------------------------------
      // 4. Mostrar resultado
      // ------------------------------------------------

      setMensaje(
        `Documento enviado correctamente. Contraseña del documento: ${contrasena}`
      );

      setArchivo(null);
      setEmpresaSeleccionada("");
      setDestinatarioSeleccionado("");

      const inputArchivo =
        document.getElementById(
          "archivo"
        );

      if (inputArchivo) {
        inputArchivo.value = "";
      }
    } catch (error) {
      console.error(
        "Error enviando documento:",
        error
      );

      setError(
        error.message ||
          "No fue posible enviar el documento."
      );
    } finally {
      setEnviando(false);
    }
  }

  function cerrarSesion() {
    localStorage.removeItem(
      "docuportal_current_user"
    );

    sessionStorage.removeItem(
      "docuportal_destinatario"
    );

    sessionStorage.removeItem(
      "docuportal_documento_autorizado"
    );

    window.location.href = "/";
  }

  const destinatariosFiltrados =
    destinatarios.filter(
      (destinatario) =>
        String(
          destinatario.empresa_id
        ) === String(empresaSeleccionada)
    );

  if (cargando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          background: "#f5f7fb",
        }}
      >
        <p>Cargando información...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily:
          "Arial, sans-serif",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* ENCABEZADO */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "25px 30px",
            marginBottom: "20px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.06)",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 6px",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Portal Documental
            </p>

            <h1
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "28px",
              }}
            >
              Panel del Empleado
            </h1>

            {usuario && (
              <p
                style={{
                  margin:
                    "8px 0 0",
                  color: "#6b7280",
                }}
              >
                Bienvenido,{" "}
                <strong>
                  {usuario.nombre ||
                    "Empleado"}
                </strong>
              </p>
            )}
          </div>

          <button
            onClick={cerrarSesion}
            style={{
              border:
                "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              padding:
                "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* FORMULARIO */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "30px",
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
            Enviar documento
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "30px",
            }}
          >
            Selecciona el documento,
            la empresa y el Usuario
            autorizado que podrá
            acceder a él.
          </p>

          <form
            onSubmit={enviarDocumento}
          >
            {/* ARCHIVO */}

            <div
              style={{
                marginBottom: "22px",
              }}
            >
              <label
                htmlFor="archivo"
                style={{
                  display: "block",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Documento
              </label>

              <input
                id="archivo"
                type="file"
                onChange={
                  seleccionarArchivo
                }
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  boxSizing:
                    "border-box",
                  background:
                    "#ffffff",
                }}
              />

              <p
                style={{
                  margin:
                    "7px 0 0",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                Máximo 10 MB. Formatos
                permitidos: PDF, Word,
                Excel e imágenes.
              </p>

              {archivo && (
                <p
                  style={{
                    marginTop: "8px",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Archivo seleccionado:{" "}
                  <strong>
                    {archivo.name}
                  </strong>
                </p>
              )}
            </div>

            {/* EMPRESA */}

            <div
              style={{
                marginBottom: "22px",
              }}
            >
              <label
                htmlFor="empresa"
                style={{
                  display: "block",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Empresa
              </label>

              <select
                id="empresa"
                value={
                  empresaSeleccionada
                }
                onChange={(event) => {
                  setEmpresaSeleccionada(
                    event.target.value
                  );

                  setDestinatarioSeleccionado(
                    ""
                  );

                  setMensaje("");
                  setError("");
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  background:
                    "#ffffff",
                  color: "#111827",
                  boxSizing:
                    "border-box",
                }}
              >
                <option value="">
                  Selecciona una empresa
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

            {/* USUARIO AUTORIZADO */}

            <div
              style={{
                marginBottom: "25px",
              }}
            >
              <label
                htmlFor="destinatario"
                style={{
                  display: "block",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Usuario autorizado
              </label>

              <select
                id="destinatario"
                value={
                  destinatarioSeleccionado
                }
                onChange={(event) => {
                  setDestinatarioSeleccionado(
                    event.target.value
                  );

                  setMensaje("");
                  setError("");
                }}
                disabled={
                  !empresaSeleccionada
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  background:
                    empresaSeleccionada
                      ? "#ffffff"
                      : "#f3f4f6",
                  color: "#111827",
                  boxSizing:
                    "border-box",
                }}
              >
                <option value="">
                  {empresaSeleccionada
                    ? "Selecciona un Usuario"
                    : "Primero selecciona una empresa"}
                </option>

                {destinatariosFiltrados
                  .filter(
                    (destinatario) =>
                      destinatario.activo
                  )
                  .map(
                    (destinatario) => (
                      <option
                        key={
                          destinatario.id
                        }
                        value={
                          destinatario.id
                        }
                      >
                        {destinatario.nombre}{" "}
                        —{" "}
                        {destinatario.correo}
                      </option>
                    )
                  )}
              </select>

              {empresaSeleccionada &&
                destinatariosFiltrados
                  .filter(
                    (destinatario) =>
                      destinatario.activo
                  )
                  .length ===
                  0 && (
                  <p
                    style={{
                      marginTop:
                        "8px",
                      color:
                        "#dc2626",
                      fontSize:
                        "14px",
                    }}
                  >
                    No hay Usuarios
                    autorizados activos
                    para esta empresa.
                  </p>
                )}
            </div>

            {/* MENSAJES */}

            {error && (
              <div
                style={{
                  background:
                    "#fef2f2",
                  border:
                    "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "14px",
                  borderRadius: "8px",
                  marginBottom:
                    "20px",
                }}
              >
                {error}
              </div>
            )}

            {mensaje && (
              <div
                style={{
                  background:
                    "#ecfdf5",
                  border:
                    "1px solid #a7f3d0",
                  color: "#047857",
                  padding: "14px",
                  borderRadius: "8px",
                  marginBottom:
                    "20px",
                  lineHeight:
                    "1.5",
                }}
              >
                {mensaje}
              </div>
            )}

            {/* BOTÓN */}

            <button
              type="submit"
              disabled={enviando}
              style={{
                width: "100%",
                border: "none",
                background:
                  enviando
                    ? "#9ca3af"
                    : "#111827",
                color: "#ffffff",
                padding: "14px 20px",
                borderRadius: "8px",
                cursor: enviando
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              {enviando
                ? "Enviando documento..."
                : "🔐 Enviar documento"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}