import pool from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      nombre,
      correo,
      contrasena,
      rol,
      departamento,
      estado,
    } = body;

    // ============================================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // ============================================================

    if (!nombre || !correo || !contrasena) {
      return Response.json(
        {
          success: false,
          message:
            "El nombre, correo y contraseña son obligatorios.",
        },
        { status: 400 }
      );
    }

    const nombreNormalizado = nombre.trim();

    const correoNormalizado = correo
      .trim()
      .toLowerCase();

    // ============================================================
    // VALIDAR CONTRASEÑA
    // ============================================================

    if (contrasena.length < 6) {
      return Response.json(
        {
          success: false,
          message:
            "La contraseña debe tener mínimo 6 caracteres.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // VALIDAR ROL
    // ============================================================

    const rolesPermitidos = [
      "Usuario",
      "Supervisor",
      "Administrador",
      "Empleado",
    ];

    const rolNormalizado =
      rol && rolesPermitidos.includes(rol)
        ? rol
        : "Empleado";

    // ============================================================
    // VERIFICAR CORREO EXISTENTE
    // ============================================================

    const usuarioExistente =
      await pool.query(
        `
        SELECT id
        FROM usuarios
        WHERE LOWER(TRIM(correo)) = $1
        `,
        [correoNormalizado]
      );

    if (usuarioExistente.rows.length > 0) {
      return Response.json(
        {
          success: false,
          message:
            "Ya existe una cuenta registrada con este correo.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // CREAR USUARIO EN NEON
    // ============================================================

    const result = await pool.query(
      `
      INSERT INTO usuarios (
        nombre,
        correo,
        rol,
        contrasena
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        nombre,
        correo,
        rol
      `,
      [
        nombreNormalizado,
        correoNormalizado,
        rolNormalizado,
        contrasena,
      ]
    );

    const usuario = result.rows[0];

    // ============================================================
    // RESPUESTA
    // ============================================================

    return Response.json(
      {
        success: true,
        message:
          "Usuario creado correctamente.",
        usuario,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Error al registrar usuario:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "No fue posible crear el usuario.",
      },
      { status: 500 }
    );
  }
}