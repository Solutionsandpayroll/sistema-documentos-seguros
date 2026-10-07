import pool from "@/lib/db";

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

    if (usuario.rol.toLowerCase() !== "empleado") {
      return Response.json(
        {
          success: false,
          message:
            "Este usuario no tiene permisos de empleado.",
        },
        { status: 403 }
      );
    }

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
      "Error en login de empleado:",
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