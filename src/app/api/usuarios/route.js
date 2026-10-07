import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, nombre, correo, rol, creado_en FROM usuarios ORDER BY id"
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);

    return Response.json(
      {
        success: false,
        message: "Error al consultar los usuarios",
      },
      { status: 500 }
    );
  }
}