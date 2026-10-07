import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.documento_id,
        d.nombre_archivo AS documento,
        a.destinatario_id,
        dest.nombre AS destinatario,
        dest.correo,
        a.accion,
        a.fecha_acceso
      FROM accesos a
      INNER JOIN documentos d ON a.documento_id = d.id
      INNER JOIN destinatarios dest ON a.destinatario_id = dest.id
      ORDER BY a.fecha_acceso DESC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo accesos:", error);

    return Response.json(
      {
        success: false,
        message: "Error al consultar los accesos",
      },
      { status: 500 }
    );
  }
}