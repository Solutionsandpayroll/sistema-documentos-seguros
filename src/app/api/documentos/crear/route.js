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
// POST - CREAR DOCUMENTO
// ============================================================

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("DATOS RECIBIDOS:", body);

    const {
      nombre_archivo,
      ruta_archivo,
      empleado_id,
      empresa_id,
      destinatario_id,
      contrasena,
      estado,
    } = body;

    // ========================================================
    // CONVERTIR IDS A NÚMEROS
    // ========================================================

    const empleadoId = Number(empleado_id);
    const empresaId = Number(empresa_id);
    const destinatarioId = Number(destinatario_id);

    // ========================================================
    // VALIDAR DATOS OBLIGATORIOS
    // ========================================================

    if (!nombre_archivo) {
      return Response.json(
        {
          success: false,
          message:
            "El nombre del archivo es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(empleadoId)) {
      return Response.json(
        {
          success: false,
          message:
            "El empleado_id no es válido.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(empresaId)) {
      return Response.json(
        {
          success: false,
          message:
            "El empresa_id no es válido.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(destinatarioId)) {
      return Response.json(
        {
          success: false,
          message:
            "El destinatario_id no es válido.",
        },
        { status: 400 }
      );
    }

    if (!contrasena) {
      return Response.json(
        {
          success: false,
          message:
            "No se generó la contraseña del documento.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // VERIFICAR EMPLEADO
    // ========================================================

    const empleado = await pool.query(
      `
      SELECT
        id,
        nombre,
        correo
      FROM usuarios
      WHERE id = $1
      `,
      [empleadoId]
    );

    if (empleado.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "El usuario empleado no existe en Neon.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // VERIFICAR EMPRESA
    // ========================================================

    const empresa = await pool.query(
      `
      SELECT
        id,
        nombre
      FROM empresas
      WHERE id = $1
      `,
      [empresaId]
    );

    if (empresa.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "La empresa seleccionada no existe.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // VERIFICAR DESTINATARIO
    // ========================================================

    const destinatario = await pool.query(
      `
      SELECT
        id,
        nombre,
        correo
      FROM destinatarios
      WHERE id = $1
      `,
      [destinatarioId]
    );

    if (destinatario.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "El destinatario seleccionado no existe.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // REGISTRAR DOCUMENTO EN NEON
    // ========================================================

    const result = await pool.query(
      `
      INSERT INTO documentos (
        nombre_archivo,
        ruta_archivo,
        empleado_id,
        empresa_id,
        destinatario_id,
        contrasena,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        nombre_archivo,
        empleado_id,
        empresa_id,
        destinatario_id,
        estado,
        creado_en
      `,
      [
        nombre_archivo,
        ruta_archivo || null,
        empleadoId,
        empresaId,
        destinatarioId,
        contrasena,
        estado || "enviado",
      ]
    );

    const documento = result.rows[0];

    console.log(
      "DOCUMENTO CREADO:",
      documento
    );

    // ========================================================
    // OBTENER USUARIO DE LA SESIÓN
    // ========================================================

    let usuarioId = empleado.id;
    let usuarioNombre =
      empleado.rows[0].nombre;
    let usuarioCorreo =
      empleado.rows[0].correo;

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
          documento,
          documento_id,
          estado,
          detalles,
          fecha
        )
        VALUES (
          $1,
          $2,
          $3,
          'Documento',
          'Documento creado',
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          CURRENT_TIMESTAMP
        )
        `,
        [
          usuarioId,
          usuarioNombre,
          usuarioCorreo,
          documento.nombre_archivo,
          String(documento.id),
          documento.nombre_archivo,
          String(documento.id),
          documento.estado,
          `Se creó el documento "${documento.nombre_archivo}" para la empresa ${empresa.rows[0].nombre} y el destinatario ${destinatario.rows[0].nombre}.`,
        ]
      );
    } catch (historyError) {
      console.error(
        "Error registrando documento en historial:",
        historyError
      );
    }

    // ========================================================
    // RESPUESTA
    // ========================================================

    return Response.json({
      success: true,
      message:
        "Documento registrado correctamente.",
      documento,
    });
  } catch (error) {
    console.error(
      "ERROR COMPLETO AL CREAR DOCUMENTO:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.detail ||
          error?.message ||
          "Error al registrar el documento.",
      },
      { status: 500 }
    );
  }
}