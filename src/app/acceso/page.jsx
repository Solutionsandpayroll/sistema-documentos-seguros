"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AccesoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const documentoId = searchParams.get("documento");

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setMensaje("");
    setError("");

    if (!documentoId) {
      setError(
        "No se encontró el documento que deseas consultar."
      );
      return;
    }

    if (!correo || !contrasena) {
      setError(
        "Debes ingresar el correo y la contraseña."
      );
      return;
    }

    try {
      setCargando(true);

      const response = await fetch(
        "/api/documentos/acceso",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documento_id: Number(documentoId),
            correo,
            contrasena,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "No fue posible validar el acceso."
        );
        return;
      }

      setMensaje(
        "Acceso autorizado correctamente."
      );

      sessionStorage.setItem(
        "documento_autorizado",
        JSON.stringify(data.documento)
      );

      router.push(
        `/acceso/documento?documento=${data.documento.id}`
      );
    } catch (error) {
      console.error(error);

      setError(
        "Ocurrió un error al intentar acceder al documento."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f8",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
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
          <h1
            style={{
              marginBottom: "10px",
              fontSize: "28px",
              color: "#1f2937",
            }}
          >
            Acceso al documento
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Ingresa tus datos para acceder al
            documento autorizado.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Correo electrónico
            </label>

            <input
              type="email"
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
              placeholder="correo@ejemplo.com"
              disabled={cargando}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
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
              placeholder="Ingresa la contraseña"
              disabled={cargando}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px",
                borderRadius: "8px",
                background: "#fee2e2",
                color: "#b91c1c",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {mensaje && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px",
                borderRadius: "8px",
                background: "#dcfce7",
                color: "#166534",
                fontSize: "14px",
              }}
            >
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: cargando
                ? "not-allowed"
                : "pointer",
              opacity: cargando ? 0.7 : 1,
            }}
          >
            {cargando
              ? "Validando..."
              : "Acceder al documento"}
          </button>
        </form>
      </div>
    </main>
  );
}