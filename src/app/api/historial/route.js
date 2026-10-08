import pool from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "docuportal-secret-desarrollo";

// ==========================================================
// VALIDAR SESIÓN
// ==========================================================

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

  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(userId)
    .digest("hex");

  if (signature !== expectedSignature) {
    return null;
  }

  return userId;
}

// ==========================================================
// GET - OBTENER HISTORIAL
// ==========================================================

export async function GET() {
  try {
    // ------------------------------------------------------
    // 1. Obtener cookie de sesión
    // ------------------------------------------------------

    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get(
      "docuportal_session"
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

    // ------------------------------------------------------
    // 2. Validar sesión
    // ------------------------------------------------------

    const userId = verifySessionToken(
      sessionCookie.value
    );

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "La sesión no es válida.",
        },
        { status: 401 }
      );
    }

    // ------------------------------------------------------
    // 3. Verificar que el usuario exista
    // ------------------------------------------------------

    const userResult = await pool.query(
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

    if (userResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "El usuario no existe.",
        },
        { status: 404 }
      );
    }

    // ------------------------------------------------------
    // 4. Obtener historial
    // ------------------------------------------------------

    const result = await pool.query(
      `
      SELECT
        id,
        usuario_id,
        usuario_nombre,
        usuario_correo,
        tipo,
        accion,
        elemento,
        elemento_id,
        documento,
        documento_id,
        estado,
        detalles,
        fecha
      FROM historial
      ORDER BY fecha DESC, id DESC
      `
    );

    // ------------------------------------------------------
    // 5. Convertir datos para la página
    // ------------------------------------------------------

    const history = result.rows.map((item) => {
      const fecha = item.fecha
        ? new Date(item.fecha)
        : null;

      return {
        id: item.id,

        action: item.accion || "Actividad",

        document:
          item.documento ||
          item.elemento ||
          "",

        documentId:
          item.documento_id ||
          item.elemento_id ||
          "",

        user:
          item.usuario_nombre ||
          "Usuario",

        userEmail:
          item.usuario_correo ||
          "",

        status:
          item.estado ||
          "Completado",

        type:
          item.tipo ||
          "Documento",

        details:
          item.detalles ||
          "",

        element:
          item.elemento ||
          "",

        department: "",

        date: fecha
          ? fecha.toLocaleDateString(
              "es-CO"
            )
          : "Sin fecha",

        time: fecha
          ? fecha.toLocaleTimeString(
              "es-CO",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          : "",

        createdAt:
          item.fecha,
      };
    });

    // ------------------------------------------------------
    // 6. Respuesta
    // ------------------------------------------------------

    return Response.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(
      "Error obteniendo historial:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "No fue posible obtener el historial.",
      },
      { status: 500 }
    );
  }
}