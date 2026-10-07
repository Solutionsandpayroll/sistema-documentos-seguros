import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.nombre_archivo,
        d.empleado_id,
        u.nombre AS empleado,
        d.empresa_id,
        e.nombre AS empresa,
        d.destinatario_id,
        dest.nombre AS destinatario,
        dest.correo,
        d.estado,
        d.creado_en
      FROM documentos d
      INNER JOIN usuarios u ON d.empleado_id = u.id
      INNER JOIN empresas e ON d.empresa_id = e.id
      INNER JOIN destinatarios dest ON d.destinatario_id = dest.id
      ORDER BY d.id DESC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo documentos:", error);

    return Response.json(
      {
        success: false,
        message: "Error al consultar los documentos",
      },
      { status: 500 }
    );
  }
}