import pool from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      correo,
      contrasena,
    } = body;

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
        d.id,
        d.nombre,
        d.correo,
        d.contrasena,
        d.empresa_id,
        d.activo,
        e.nombre AS empresa
      FROM destinatarios d
      INNER JOIN empresas e
        ON d.empresa_id = e.id
      WHERE LOWER(TRIM(d.correo)) = $1
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

    const destinatario = result.rows[0];

    if (!destinatario.activo) {
      return Response.json(
        {
          success: false,
          message:
            "Este destinatario se encuentra inactivo. Contacta al administrador.",
        },
        { status: 403 }
      );
    }

    if (
      destinatario.contrasena !==
      contrasena
    ) {
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
      message:
        "Inicio de sesión correcto.",
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
      "Error en login de destinatario:",
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