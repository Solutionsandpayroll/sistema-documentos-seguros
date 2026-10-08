import pool from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "docuportal-secret-desarrollo";

function createSessionToken(userId) {
  const payload = String(userId);

  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { correo, contrasena } = body;

    if (!correo || !contrasena) {
      return Response.json(
        {
          success: false,
          message:
            "El correo y la contraseña son obligatorios.",
        },
        { status: 400 }
      );
    }

    const correoNormalizado = correo
      .trim()
      .toLowerCase();

    const result = await pool.query(
      `
      SELECT
        id,
        nombre,
        correo,
        rol,
        contrasena
      FROM usuarios
      WHERE LOWER(TRIM(correo)) = $1
      `,
      [correoNormalizado]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "El correo o la contraseña son incorrectos.",
        },
        { status: 401 }
      );
    }

    const usuario = result.rows[0];

    const rolUsuario = usuario.rol
      ? usuario.rol.trim().toLowerCase()
      : "";

    // ==========================================================
    // VALIDAR ROL
    // ==========================================================

    if (
      rolUsuario !== "empleado" &&
      rolUsuario !== "administrador"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Este usuario no tiene permisos para iniciar sesión.",
        },
        { status: 403 }
      );
    }

    // ==========================================================
    // VALIDAR CONTRASEÑA
    // ==========================================================

    if (usuario.contrasena !== contrasena) {
      return Response.json(
        {
          success: false,
          message:
            "El correo o la contraseña son incorrectos.",
        },
        { status: 401 }
      );
    }

    // ==========================================================
    // CREAR SESIÓN
    // ==========================================================

    const sessionToken =
      createSessionToken(usuario.id);

    const cookieStore = await cookies();

    cookieStore.set(
      "docuportal_session",
      sessionToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8,
      }
    );

    // ==========================================================
    // RESPUESTA
    // ==========================================================

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
      "Error en login de usuario:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "No fue posible iniciar sesión.",
      },
      { status: 500 }
    );
  }
}