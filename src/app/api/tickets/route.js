import pool from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

// ============================================================
// CONFIGURACIÓN DE SESIÓN
// ============================================================

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "docuportal-secret-desarrollo";

// ============================================================
// VALIDAR SESIÓN
// ============================================================

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

// ============================================================
// GET - OBTENER TODOS LOS TICKETS
// ============================================================

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        codigo,
        asunto,
        categoria,
        prioridad,
        estado,
        solicitante,
        correo_solicitante,
        descripcion,
        archivo_nombre,
        archivo_ruta,
        creado_en,
        actualizado_en
      FROM tickets
      ORDER BY creado_en DESC
    `);

    return Response.json({
      success: true,
      tickets: result.rows,
    });
  } catch (error) {
    console.error(
      "Error obteniendo tickets:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "No fue posible obtener los tickets.",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - CREAR UN NUEVO TICKET
// ============================================================

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      asunto,
      categoria,
      prioridad,
      solicitante,
      correoSolicitante,
      descripcion,
      archivoNombre,
      archivoRuta,
    } = body;

    // ========================================================
    // VALIDACIONES
    // ========================================================

    if (
      !asunto ||
      !categoria ||
      !prioridad ||
      !solicitante ||
      !descripcion
    ) {
      return Response.json(
        {
          success: false,
          message:
            "El asunto, categoría, prioridad, solicitante y descripción son obligatorios.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // GENERAR CÓDIGO DEL TICKET
    // ========================================================

    const lastTicketResult =
      await pool.query(`
        SELECT codigo
        FROM tickets
        ORDER BY id DESC
        LIMIT 1
      `);

    let nextNumber = 1;

    if (
      lastTicketResult.rows.length > 0
    ) {
      const lastCode =
        lastTicketResult.rows[0].codigo;

      const number =
        parseInt(
          lastCode.replace(
            "TKT-",
            ""
          ),
          10
        );

      if (!isNaN(number)) {
        nextNumber = number + 1;
      }
    }

    const codigo = `TKT-${String(
      nextNumber
    ).padStart(3, "0")}`;

    // ========================================================
    // GUARDAR TICKET EN NEON
    // ========================================================

    const result = await pool.query(
      `
      INSERT INTO tickets (
        codigo,
        asunto,
        categoria,
        prioridad,
        estado,
        solicitante,
        correo_solicitante,
        descripcion,
        archivo_nombre,
        archivo_ruta
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        'Abierto',
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING
        id,
        codigo,
        asunto,
        categoria,
        prioridad,
        estado,
        solicitante,
        correo_solicitante,
        descripcion,
        archivo_nombre,
        archivo_ruta,
        creado_en,
        actualizado_en
      `,
      [
        codigo,
        asunto.trim(),
        categoria.trim(),
        prioridad.trim(),
        solicitante.trim(),
        correoSolicitante
          ? correoSolicitante
              .trim()
              .toLowerCase()
          : null,
        descripcion.trim(),
        archivoNombre || null,
        archivoRuta || null,
      ]
    );

    const ticket = result.rows[0];

    // ========================================================
    // OBTENER USUARIO DE LA SESIÓN
    // ========================================================

    let usuarioId = null;
    let usuarioNombre = ticket.solicitante;
    let usuarioCorreo =
      ticket.correo_solicitante;

    try {
      const cookieStore = await cookies();

      const sessionCookie =
        cookieStore.get(
          "docuportal_session"
        );

      if (sessionCookie?.value) {
        const sessionUserId =
          verifySessionToken(
            sessionCookie.value
          );

        if (sessionUserId) {
          const userResult =
            await pool.query(
              `
              SELECT
                id,
                nombre,
                correo
              FROM usuarios
              WHERE id = $1
              LIMIT 1
              `,
              [sessionUserId]
            );

          if (
            userResult.rows.length > 0
          ) {
            const usuario =
              userResult.rows[0];

            usuarioId = usuario.id;
            usuarioNombre =
              usuario.nombre ||
              usuarioNombre;
            usuarioCorreo =
              usuario.correo ||
              usuarioCorreo;
          }
        }
      }
    } catch (sessionError) {
      console.error(
        "No fue posible obtener la sesión para el historial:",
        sessionError
      );
    }

    // ========================================================
    // REGISTRAR ACTIVIDAD EN HISTORIAL
    // ========================================================

    try {
      await pool.query(
        `
        INSERT INTO historial (
          usuario_id,
          usuario_nombre,
          usuario_correo,
          tipo,
          accion,
          elemento,
          elemento_id,
          estado,
          detalles,
          fecha
        )
        VALUES (
          $1,
          $2,
          $3,
          'Ticket',
          'Ticket creado',
          $4,
          $5,
          $6,
          $7,
          CURRENT_TIMESTAMP
        )
        `,
        [
          usuarioId,
          usuarioNombre,
          usuarioCorreo,
          ticket.asunto,
          ticket.codigo,
          ticket.estado,
          `Se creó el ticket ${ticket.codigo} con categoría ${ticket.categoria} y prioridad ${ticket.prioridad}.`,
        ]
      );
    } catch (historyError) {
      console.error(
        "Error registrando actividad en historial:",
        historyError
      );
    }

    // ========================================================
    // RESPUESTA
    // ========================================================

    return Response.json(
      {
        success: true,
        message:
          "El ticket fue creado correctamente.",
        ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Error creando ticket:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "No fue posible crear el ticket.",
      },
      { status: 500 }
    );
  }
}