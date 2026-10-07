import pool from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const destinatarioId = Number(id);

    if (!Number.isInteger(destinatarioId)) {
      return Response.json(
        {
          success: false,
          message: "El destinatario no es válido.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        d.id,
        d.nombre_archivo,
        d.empresa_id,
        e.nombre AS empresa,
        d.destinatario_id,
        d.estado,
        d.creado_en
      FROM documentos d
      INNER JOIN empresas e
        ON d.empresa_id = e.id
      WHERE d.destinatario_id = $1
      ORDER BY d.creado_en DESC
      `,
      [destinatarioId]
    );

    return Response.json({
      success: true,
      documentos: result.rows,
    });
  } catch (error) {
    console.error(
      "Error obteniendo documentos del destinatario:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "No fue posible obtener los documentos.",
      },
      { status: 500 }
    );
  }
}