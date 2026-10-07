import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");

    return Response.json({
      success: true,
      message: "Conexión con Neon exitosa",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Error conectando con Neon",
      },
      { status: 500 }
    );
  }
}