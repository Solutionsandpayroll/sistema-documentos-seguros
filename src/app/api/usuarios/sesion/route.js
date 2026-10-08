import pool from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "docuportal-secret-desarrollo";

function verifySessionToken(token) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const userId = parts[0];
  const signature = parts[1];

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        SESSION_SECRET
      )
      .update(userId)
      .digest("hex");

  if (signature !== expectedSignature) {
    return null;
  }

  return userId;
}

export async function GET() {
  try {
    const cookieStore = await cookies();

    const sessionCookie =
      cookieStore.get(
        "docuportal_session"
      );

    if (!sessionCookie?.value) {
      return Response.json(
        {
          success: false,
          message:
            "No hay una sesión activa.",
        },
        { status: 401 }
      );
    }

    const userId =
      verifySessionToken(
        sessionCookie.value
      );

    if (!userId) {
      return Response.json(
        {
          success: false,
          message:
            "La sesión no es válida.",
        },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        id,
        nombre,
        correo,
        rol
      FROM usuarios
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "El usuario no existe.",
        },
        { status: 404 }
      );
    }

    const usuario = result.rows[0];

    return Response.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(
      "Error obteniendo sesión:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "No fue posible obtener la sesión.",
      },
      { status: 500 }
    );
  }
}