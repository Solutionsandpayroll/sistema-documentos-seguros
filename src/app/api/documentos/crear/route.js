import pool from "@/lib/db";

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

    // Convertir los IDs a números
    const empleadoId = Number(empleado_id);
    const empresaId = Number(empresa_id);
    const destinatarioId = Number(destinatario_id);

    // Validar datos obligatorios
    if (!nombre_archivo) {
      return Response.json(
        {
          success: false,
          message: "El nombre del archivo es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(empleadoId)) {
      return Response.json(
        {
          success: false,
          message: "El empleado_id no es válido.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(empresaId)) {
      return Response.json(
        {
          success: false,
          message: "El empresa_id no es válido.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(destinatarioId)) {
      return Response.json(
        {
          success: false,
          message: "El destinatario_id no es válido.",
        },
        { status: 400 }
      );
    }

    if (!contrasena) {
      return Response.json(
        {
          success: false,
          message: "No se generó la contraseña del documento.",
        },
        { status: 400 }
      );
    }

    // Verificar que el empleado exista
    const empleado = await pool.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [empleadoId]
    );

    if (empleado.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "El usuario empleado no existe en Neon.",
        },
        { status: 400 }
      );
    }

    // Verificar que la empresa exista
    const empresa = await pool.query(
      "SELECT id FROM empresas WHERE id = $1",
      [empresaId]
    );

    if (empresa.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "La empresa seleccionada no existe.",
        },
        { status: 400 }
      );
    }

    // Verificar que el destinatario exista
    const destinatario = await pool.query(
      "SELECT id FROM destinatarios WHERE id = $1",
      [destinatarioId]
    );

    if (destinatario.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "El destinatario seleccionado no existe.",
        },
        { status: 400 }
      );
    }

    // Registrar documento
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

    console.log(
      "DOCUMENTO CREADO:",
      result.rows[0]
    );

    return Response.json({
      success: true,
      message: "Documento registrado correctamente.",
      documento: result.rows[0],
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