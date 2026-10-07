import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, nombre, identificacion, creado_en FROM empresas ORDER BY id"
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo empresas:", error);

    return Response.json(
      {
        success: false,
        message: "Error al consultar las empresas",
      },
      { status: 500 }
    );
  }
}