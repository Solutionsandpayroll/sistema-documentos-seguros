import pool from "@/lib/db";

export async function PUT(request) {
  try {
    const body = await request.json();

    const {
      id,
      nombre,
      correo,
      contrasenaActual,
      nuevaContrasena,
    } = body;

    if (!id || !nombre || !correo) {
      return Response.json(
        {
          success: false,
          message:
            "El nombre y el correo son obligatorios.",
        },
        { status: 400 }
      );
    }

    const nombreNormalizado = nombre.trim();
    const correoNormalizado = correo
      .trim()
      .toLowerCase();

    // ========================================================
    // BUSCAR ADMINISTRADOR
    // ========================================================

    const adminResult = await pool.query(
      `
      SELECT
        id,
        nombre,
        correo,
        rol,
        contrasena
      FROM usuarios
      WHERE id = $1
      `,
      [id]
    );

    if (adminResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "No se encontró el usuario.",
        },
        { status: 404 }
      );
    }

    const admin = adminResult.rows[0];

    // ========================================================
    // VERIFICAR QUE SEA ADMINISTRADOR
    // ========================================================

    if (
      String(admin.rol || "")
        .trim()
        .toLowerCase() !== "administrador"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "No tienes permisos para modificar esta cuenta.",
        },
        { status: 403 }
      );
    }

    // ========================================================
    // SI QUIERE CAMBIAR CONTRASEÑA
    // ========================================================

    if (nuevaContrasena) {
      if (!contrasenaActual) {
        return Response.json(
          {
            success: false,
            message:
              "Ingresa tu contraseña actual.",
          },
          { status: 400 }
        );
      }

      if (
        admin.contrasena !==
        contrasenaActual
      ) {
        return Response.json(
          {
            success: false,
            message:
              "La contraseña actual es incorrecta.",
          },
          { status: 401 }
        );
      }

      if (nuevaContrasena.length < 6) {
        return Response.json(
          {
            success: false,
            message:
              "La nueva contraseña debe tener mínimo 6 caracteres.",
          },
          { status: 400 }
        );
      }
    }

    // ========================================================
    // VERIFICAR CORREO
    // ========================================================

    const emailExistente =
      await pool.query(
        `
        SELECT id
        FROM usuarios
        WHERE LOWER(TRIM(correo)) = $1
        AND id <> $2
        `,
        [
          correoNormalizado,
          id,
        ]
      );

    if (
      emailExistente.rows.length > 0
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Ya existe otro usuario con ese correo.",
        },
        { status: 409 }
      );
    }

    // ========================================================
    // ACTUALIZAR DATOS
    // ========================================================

    let result;

    if (nuevaContrasena) {
      result = await pool.query(
        `
        UPDATE usuarios
        SET
          nombre = $1,
          correo = $2,
          contrasena = $3
        WHERE id = $4
        RETURNING
          id,
          nombre,
          correo,
          rol
        `,
        [
          nombreNormalizado,
          correoNormalizado,
          nuevaContrasena,
          id,
        ]
      );
    } else {
      result = await pool.query(
        `
        UPDATE usuarios
        SET
          nombre = $1,
          correo = $2
        WHERE id = $3
        RETURNING
          id,
          nombre,
          correo,
          rol
        `,
        [
          nombreNormalizado,
          correoNormalizado,
          id,
        ]
      );
    }

    const usuario =
      result.rows[0];

    return Response.json({
      success: true,
      message:
        "Los datos de tu cuenta fueron actualizados correctamente.",
      usuario,
    });
  } catch (error) {
    console.error(
      "Error actualizando cuenta:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "No fue posible actualizar los datos de la cuenta.",
      },
      { status: 500 }
    );
  }
}