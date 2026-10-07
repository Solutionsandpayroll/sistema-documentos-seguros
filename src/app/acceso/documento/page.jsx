"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DocumentoPage() {
  const searchParams = useSearchParams();

  const documentoId = searchParams.get("documento");

  const [documento, setDocumento] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    try {
      const documentoGuardado =
        sessionStorage.getItem(
          "documento_autorizado"
        );

      if (!documentoGuardado) {
        setError(
          "No tienes autorización para acceder a este documento."
        );
        setCargando(false);
        return;
      }

      const datos = JSON.parse(
        documentoGuardado
      );

      if (
        documentoId &&
        Number(datos.id) !== Number(documentoId)
      ) {
        setError(
          "El documento solicitado no coincide con la autorización."
        );
        setCargando(false);
        return;
      }

      setDocumento(datos);
    } catch (error) {
      console.error(error);

      setError(
        "No fue posible cargar la información del documento."
      );
    } finally {
      setCargando(false);
    }
  }, [documentoId]);

  function abrirDocumento() {
    if (!documento?.id) return;

    window.open(
      `/api/documentos/${documento.id}/archivo`,
      "_blank"
    );
  }

  function descargarDocumento() {
    if (!documento?.id) return;

    window.open(
      `/api/documentos/${documento.id}/archivo?download=true`,
      "_blank"
    );
  }

  if (cargando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f4f6f8",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p>Cargando documento...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f4f6f8",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            background: "#ffffff",
            padding: "35px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow:
              "0 10px 30px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h1
            style={{
              color: "#b91c1c",
              marginBottom: "15px",
            }}
          >
            Acceso no autorizado
          </h1>

          <p
            style={{
              color: "#4b5563",
            }}
          >
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "35px",
          boxShadow:
            "0 10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "45px",
              marginBottom: "10px",
            }}
          >
            🔐
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              color: "#1f2937",
            }}
          >
            Documento autorizado
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
            }}
          >
            Tu identidad fue validada correctamente.
          </p>
        </div>

        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "25px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Documento
          </p>

          <h2
            style={{
              margin: "0 0 20px",
              color: "#111827",
              fontSize: "20px",
              wordBreak: "break-word",
            }}
          >
            {documento?.nombre_archivo}
          </h2>

          <p
            style={{
              margin: "0 0 5px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Destinatario autorizado
          </p>

          <p
            style={{
              margin: 0,
              color: "#374151",
              fontWeight: "600",
            }}
          >
            {documento?.destinatario}
          </p>

          <p
            style={{
              margin: "5px 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            {documento?.correo}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={abrirDocumento}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Abrir documento
          </button>

          <button
            onClick={descargarDocumento}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "13px",
              border: "1px solid #2563eb",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#2563eb",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Descargar documento
          </button>
        </div>
      </div>
    </main>
  );
}