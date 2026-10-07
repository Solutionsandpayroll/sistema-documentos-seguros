"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

export default function DocumentoPage() {
  const [documento, setDocumento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [error, setError] = useState("");

  const [tipoArchivo, setTipoArchivo] = useState("");
  const [contenido, setContenido] = useState(null);

  useEffect(() => {
    const documentoGuardado =
      sessionStorage.getItem(
        "docuportal_documento_autorizado"
      );

    if (!documentoGuardado) {
      setError(
        "No existe un documento autorizado."
      );

      setCargando(false);
      return;
    }

    try {
      const documentoParseado =
        JSON.parse(documentoGuardado);

      setDocumento(documentoParseado);
    } catch (error) {
      console.error(
        "Error leyendo documento:",
        error
      );

      setError(
        "No fue posible cargar el documento."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  // ==========================================
  // OBTENER EXTENSIÓN
  // ==========================================

  function obtenerExtension(nombre) {
    if (!nombre) return "";

    return nombre
      .split(".")
      .pop()
      .toLowerCase();
  }

  // ==========================================
  // ABRIR / VISUALIZAR DOCUMENTO
  // ==========================================

  async function abrirDocumento() {
    if (!documento?.id) {
      return;
    }

    try {
      setCargandoArchivo(true);
      setError("");
      setContenido(null);

      const extension =
        obtenerExtension(
          documento.nombre_archivo
        );

      setTipoArchivo(extension);

      const respuesta = await fetch(
        `/api/documentos/${documento.id}/archivo`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!respuesta.ok) {
        const data =
          await respuesta.json().catch(() => null);

        throw new Error(
          data?.message ||
            "No fue posible obtener el documento."
        );
      }

      const blob = await respuesta.blob();

      // ========================================
      // PDF
      // ========================================

      if (extension === "pdf") {
        const url =
          URL.createObjectURL(blob);

        setContenido({
          tipo: "pdf",
          url,
        });

        return;
      }

      // ========================================
      // IMÁGENES
      // ========================================

      if (
        extension === "jpg" ||
        extension === "jpeg" ||
        extension === "png"
      ) {
        const url =
          URL.createObjectURL(blob);

        setContenido({
          tipo: "imagen",
          url,
        });

        return;
      }

      // ========================================
      // EXCEL
      // ========================================

      if (
        extension === "xlsx" ||
        extension === "xls"
      ) {
        const arrayBuffer =
          await blob.arrayBuffer();

        const workbook =
          XLSX.read(arrayBuffer, {
            type: "array",
          });

        const hojas =
          workbook.SheetNames.map(
            (nombreHoja) => {
              const hoja =
                workbook.Sheets[nombreHoja];

              const datos =
                XLSX.utils.sheet_to_json(
                  hoja,
                  {
                    header: 1,
                    defval: "",
                  }
                );

              return {
                nombre: nombreHoja,
                datos,
              };
            }
          );

        setContenido({
          tipo: "excel",
          hojas,
        });

        return;
      }

      // ========================================
      // WORD
      // ========================================

      if (
        extension === "docx" ||
        extension === "doc"
      ) {
        const arrayBuffer =
          await blob.arrayBuffer();

        const resultado =
          await mammoth.convertToHtml({
            arrayBuffer,
          });

        setContenido({
          tipo: "word",
          html: resultado.value,
        });

        return;
      }

      // ========================================
      // TIPO NO COMPATIBLE
      // ========================================

      setContenido({
        tipo: "no-compatible",
      });
    } catch (error) {
      console.error(
        "Error visualizando documento:",
        error
      );

      setError(
        error.message ||
          "No fue posible visualizar el documento."
      );
    } finally {
      setCargandoArchivo(false);
    }
  }

  // ==========================================
  // DESCARGAR
  // ==========================================

  async function descargarDocumento() {
    if (!documento?.id) {
      return;
    }

    try {
      setError("");

      const respuesta = await fetch(
        `/api/documentos/${documento.id}/archivo?download=true`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!respuesta.ok) {
        const data =
          await respuesta.json().catch(() => null);

        throw new Error(
          data?.message ||
            "No fue posible descargar el documento."
        );
      }

      const blob = await respuesta.blob();

      const url =
        URL.createObjectURL(blob);

      const enlace =
        document.createElement("a");

      enlace.href = url;

      enlace.download =
        documento.nombre_archivo ||
        "documento";

      document.body.appendChild(enlace);

      enlace.click();

      enlace.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error(
        "Error descargando documento:",
        error
      );

      setError(
        error.message ||
          "No fue posible descargar el documento."
      );
    }
  }

  // ==========================================
  // VOLVER
  // ==========================================

  function volver() {
    window.location.href =
      "/destinatario";
  }

  // ==========================================
  // CARGANDO
  // ==========================================

  if (cargando) {
    return (
      <main
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>
          Cargando documento...
        </h2>
      </main>
    );
  }

  // ==========================================
  // ERROR INICIAL
  // ==========================================

  if (error && !documento) {
    return (
      <main
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>Error</h2>

        <p>{error}</p>

        <button onClick={volver}>
          Volver
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "30px",
        background: "#f5f6f8",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow:
            "0 4px 15px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h1>
          🔐 Documento autorizado
        </h1>

        <p>
          El documento fue validado
          correctamente.
        </p>

        <div
          style={{
            marginTop: "20px",
            padding: "18px",
            background: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <strong>
            Documento:
          </strong>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            {documento?.nombre_archivo}
          </p>
        </div>

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#ffe5e5",
              color: "#b00020",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "25px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={abrirDocumento}
            disabled={cargandoArchivo}
            style={{
              padding: "12px 20px",
              cursor: cargandoArchivo
                ? "not-allowed"
                : "pointer",
            }}
          >
            {cargandoArchivo
              ? "Cargando..."
              : "📄 Visualizar documento"}
          </button>

          <button
            onClick={descargarDocumento}
            style={{
              padding: "12px 20px",
              cursor: "pointer",
            }}
          >
            ⬇️ Descargar
          </button>

          <button
            onClick={volver}
            style={{
              padding: "12px 20px",
              cursor: "pointer",
            }}
          >
            ← Volver
          </button>
        </div>

        {/* ====================================
            VISOR
        ==================================== */}

        {contenido && (
          <div
            style={{
              marginTop: "30px",
            }}
          >
            {/* PDF */}

            {contenido.tipo === "pdf" && (
              <iframe
                src={contenido.url}
                title="Vista previa PDF"
                style={{
                  width: "100%",
                  height: "750px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />
            )}

            {/* IMAGEN */}

            {contenido.tipo === "imagen" && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <img
                  src={contenido.url}
                  alt={
                    documento.nombre_archivo
                  }
                  style={{
                    maxWidth: "100%",
                    maxHeight: "750px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            {/* EXCEL */}

            {contenido.tipo === "excel" && (
              <div
                style={{
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "auto",
                }}
              >
                {contenido.hojas.map(
                  (hoja, indice) => (
                    <div
                      key={indice}
                      style={{
                        padding: "20px",
                      }}
                    >
                      <h2>
                        📊 {hoja.nombre}
                      </h2>

                      <table
                        style={{
                          borderCollapse:
                            "collapse",
                          width: "100%",
                          minWidth:
                            "700px",
                        }}
                      >
                        <tbody>
                          {hoja.datos.map(
                            (fila, filaIndex) => (
                              <tr
                                key={
                                  filaIndex
                                }
                              >
                                {fila.map(
                                  (
                                    celda,
                                    columnaIndex
                                  ) => (
                                    <td
                                      key={
                                        columnaIndex
                                      }
                                      style={{
                                        border:
                                          "1px solid #ccc",
                                        padding:
                                          "8px",
                                        whiteSpace:
                                          "nowrap",
                                      }}
                                    >
                                      {String(
                                        celda
                                      )}
                                    </td>
                                  )
                                )}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            )}

            {/* WORD */}

            {contenido.tipo === "word" && (
              <div
                style={{
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "40px",
                  minHeight: "600px",
                  background:
                    "white",
                  lineHeight: "1.6",
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      contenido.html,
                  }}
                />
              </div>
            )}

            {/* NO COMPATIBLE */}

            {contenido.tipo ===
              "no-compatible" && (
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <h2>
                  Vista previa no disponible
                </h2>

                <p>
                  Este tipo de archivo no
                  puede visualizarse
                  directamente en el portal.
                </p>

                <button
                  onClick={
                    descargarDocumento
                  }
                  style={{
                    padding:
                      "12px 20px",
                    cursor:
                      "pointer",
                  }}
                >
                  ⬇️ Descargar archivo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}