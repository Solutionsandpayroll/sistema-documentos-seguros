import pool from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      nombre,
      correo,
      contrasena,
      empresa_id,
    } = body;

    // ============================================================
    // VALIDAR CAMPOS
    // ============================================================

    if (
      !nombre ||
      !correo ||
      !contrasena ||
      !empresa_id
    ) {
      return Response.json(
        {
          success: false,
          message:
            "El nombre, correo, contraseña y empresa son obligatorios.",
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
    // VERIFICAR SI EL CORREO YA EXISTE
    // ============================================================

    const destinatarioExistente =
      await pool.query(
        `
        SELECT id
        FROM destinatarios
        WHERE LOWER(TRIM(correo)) = $1
        `,
        [correoNormalizado]
      );

    if (
      destinatarioExistente.rows.length > 0
    ) {
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
    // VERIFICAR EMPRESA
    // ============================================================

    const empresaResult =
      await pool.query(
        `
        SELECT id, nombre
        FROM empresas
        WHERE id = $1
        `,
        [empresa_id]
      );

    if (empresaResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "La empresa seleccionada no existe.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // CREAR DESTINATARIO
    // ============================================================

    const result = await pool.query(
      `
      INSERT INTO destinatarios (
        nombre,
        correo,
        contrasena,
        empresa_id,
        activo
      )
      VALUES ($1, $2, $3, $4, true)
      RETURNING
        id,
        nombre,
        correo,
        empresa_id,
        activo
      `,
      [
        nombreNormalizado,
        correoNormalizado,
        contrasena,
        empresa_id,
      ]
    );

    const destinatario =
      result.rows[0];

    // ============================================================
    // RESPUESTA
    // ============================================================

    return Response.json(
      {
        success: true,
        message:
          "Cuenta de destinatario creada correctamente.",
        destinatario,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Error al registrar destinatario:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "No fue posible crear la cuenta de destinatario.",
      },
      { status: 500 }
    );
  }
}