import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        d.id,
        d.nombre,
        d.correo,
        d.empresa_id,
        e.nombre AS empresa,
        d.activo,
        d.creado_en
      FROM destinatarios d
      INNER JOIN empresas e ON d.empresa_id = e.id
      ORDER BY d.id
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo destinatarios:", error);

    return Response.json(
      {
        success: false,
        message: "Error al consultar los destinatarios",
      },
      { status: 500 }
    );
  }
}