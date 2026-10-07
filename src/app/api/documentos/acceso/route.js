import crypto from "crypto";
import pool from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      documento_id,
      destinatario_id,
      contrasena,
    } = body;

    const documentoId = Number(documento_id);
    const destinatarioId = Number(destinatario_id);

    if (!Number.isInteger(documentoId)) {
      return Response.json(
        {
          success: false,
          message: "El documento no es válido.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(destinatarioId)) {
      return Response.json(
        {
          success: false,
          message: "El usuario no es válido.",
        },
        { status: 400 }
      );
    }

    if (!contrasena) {
      return Response.json(
        {
          success: false,
          message:
            "La contraseña del documento es obligatoria.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // BUSCAR DOCUMENTO
    // ============================================================

    const result = await pool.query(
      `
      SELECT
        d.id,
        d.nombre_archivo,
        d.ruta_archivo,
        d.contrasena,
        d.estado,
        d.destinatario_id,
        dest.nombre AS destinatario,
        dest.correo
      FROM documentos d
      INNER JOIN destinatarios dest
        ON d.destinatario_id = dest.id
      WHERE d.id = $1
        AND d.destinatario_id = $2
      `,
      [documentoId, destinatarioId]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "No tienes autorización para acceder a este documento.",
        },
        { status: 403 }
      );
    }

    const documento = result.rows[0];

    // ============================================================
    // VALIDAR CONTRASEÑA DEL DOCUMENTO
    // ============================================================

    if (contrasena !== documento.contrasena) {
      return Response.json(
        {
          success: false,
          message:
            "La contraseña del documento es incorrecta.",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // GENERAR TOKEN DE ACCESO
    // ============================================================

    const tokenAcceso = crypto.randomBytes(32).toString("hex");

    // ============================================================
    // REGISTRAR ACCESO EN NEON
    // ============================================================

    await pool.query(
      `
      INSERT INTO accesos (
        documento_id,
        destinatario_id,
        accion,
        token_acceso
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        documento.id,
        documento.destinatario_id,
        "acceso autorizado",
        tokenAcceso,
      ]
    );

    // ============================================================
    // CREAR COOKIE DE AUTORIZACIÓN
    // ============================================================

    const cookieName = `docuportal_access_${documento.id}`;

    const cookieValue = [
      `${cookieName}=${tokenAcceso}`,
      "HttpOnly",
      "Path=/",
      "SameSite=Lax",
      "Max-Age=1800",
    ].join("; ");

    // ============================================================
    // RESPUESTA
    // ============================================================

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Acceso autorizado correctamente.",
        documento: {
          id: documento.id,
          nombre_archivo:
            documento.nombre_archivo,
          ruta_archivo:
            documento.ruta_archivo,
          destinatario:
            documento.destinatario,
          correo:
            documento.correo,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookieValue,
        },
      }
    );
  } catch (error) {
    console.error(
      "Error validando acceso:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "No fue posible validar el acceso.",
      },
      { status: 500 }
    );
  }
}