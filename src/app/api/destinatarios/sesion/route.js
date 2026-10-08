import pool from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "docuportal-secret-desarrollo";

function verifyRecipientSessionToken(token) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const destinatarioId = parts[0];
  const signature = parts[1];

  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`destinatario:${destinatarioId}`)
    .digest("hex");

  if (signature !== expectedSignature) {
    return null;
  }

  return destinatarioId;
}

export async function GET() {
  try {
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get(
      "docuportal_destinatario_session"
    );

    if (!sessionCookie?.value) {
      return Response.json(
        {
          success: false,
          message: "No hay una sesión activa.",
        },
        { status: 401 }
      );
    }

    const destinatarioId =
      verifyRecipientSessionToken(
        sessionCookie.value
      );

    if (!destinatarioId) {
      return Response.json(
        {
          success: false,
          message: "La sesión no es válida.",
        },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        d.id,
        d.nombre,
        d.correo,
        d.empresa_id,
        d.activo,
        e.nombre AS empresa
      FROM destinatarios d
      INNER JOIN empresas e
        ON d.empresa_id = e.id
      WHERE d.id = $1
      LIMIT 1
      `,
      [destinatarioId]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "El destinatario no existe.",
        },
        { status: 404 }
      );
    }

    const destinatario = result.rows[0];

    if (!destinatario.activo) {
      return Response.json(
        {
          success: false,
          message:
            "El destinatario se encuentra inactivo.",
        },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      destinatario: {
        id: destinatario.id,
        nombre: destinatario.nombre,
        correo: destinatario.correo,
        empresa_id: destinatario.empresa_id,
        empresa: destinatario.empresa,
        role: "Destinatario",
      },
    });
  } catch (error) {
    console.error(
      "Error obteniendo sesión del destinatario:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "No fue posible obtener la sesión del destinatario.",
      },
      { status: 500 }
    );
  }
}