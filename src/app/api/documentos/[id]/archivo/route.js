import fs from "fs/promises";
import path from "path";
import pool from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const documentoId = Number(id);

    if (!Number.isInteger(documentoId)) {
      return Response.json(
        {
          success: false,
          message: "ID de documento inválido.",
        },
        { status: 400 }
      );
    }

    // Buscar documento
    const result = await pool.query(
      `
      SELECT
        id,
        nombre_archivo,
        ruta_archivo
      FROM documentos
      WHERE id = $1
      `,
      [documentoId]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "El documento no existe.",
        },
        { status: 404 }
      );
    }

    const documento = result.rows[0];

    // ==========================================
    // VALIDAR COOKIE DE ACCESO
    // ==========================================

    const cookieHeader =
      request.headers.get("cookie") || "";

    const cookieName =
      `docuportal_access_${documentoId}`;

    const cookies = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean);

    let tokenAcceso = null;

    for (const cookie of cookies) {
      const separatorIndex = cookie.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const nombre = cookie
        .substring(0, separatorIndex)
        .trim();

      const valor = cookie
        .substring(separatorIndex + 1)
        .trim();

      if (nombre === cookieName) {
        tokenAcceso = valor;
        break;
      }
    }

    if (!tokenAcceso) {
      return Response.json(
        {
          success: false,
          message:
            "No tienes autorización para acceder a este documento.",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // VALIDAR TOKEN EN NEON
    // ==========================================

    const acceso = await pool.query(
      `
      SELECT id
      FROM accesos
      WHERE documento_id = $1
        AND token_acceso = $2
        AND accion = 'acceso autorizado'
      ORDER BY fecha_acceso DESC
      LIMIT 1
      `,
      [documentoId, tokenAcceso]
    );

    if (acceso.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "El acceso al documento no está autorizado.",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // VALIDAR RUTA DEL ARCHIVO
    // ==========================================

    if (!documento.ruta_archivo) {
      return Response.json(
        {
          success: false,
          message:
            "El documento no tiene archivo asociado.",
        },
        { status: 404 }
      );
    }

    const nombreGuardado = path.basename(
      documento.ruta_archivo
    );

    const filePath = path.join(
      process.cwd(),
      "storage",
      "uploads",
      nombreGuardado
    );

    console.log(
      "ARCHIVO AUTORIZADO:",
      filePath
    );

    // ==========================================
    // COMPROBAR QUE EL ARCHIVO EXISTE
    // ==========================================

    try {
      await fs.access(filePath);
    } catch {
      return Response.json(
        {
          success: false,
          message:
            "El archivo no existe físicamente.",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // LEER ARCHIVO
    // ==========================================

    const fileBuffer = await fs.readFile(filePath);

    // ==========================================
    // DETECTAR TIPO DE ARCHIVO
    // ==========================================

    const extension = path
      .extname(documento.nombre_archivo)
      .toLowerCase();

    let contentType = "application/octet-stream";

    if (extension === ".pdf") {
      contentType = "application/pdf";
    } else if (
      extension === ".jpg" ||
      extension === ".jpeg"
    ) {
      contentType = "image/jpeg";
    } else if (extension === ".png") {
      contentType = "image/png";
    } else if (extension === ".doc") {
      contentType = "application/msword";
    } else if (extension === ".docx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (extension === ".xls") {
      contentType = "application/vnd.ms-excel";
    } else if (extension === ".xlsx") {
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    // ==========================================
    // ABRIR O DESCARGAR
    // ==========================================

    const url = new URL(request.url);

    const descargar =
      url.searchParams.get("download") === "true";

    return new Response(fileBuffer, {
      status: 200,

      headers: {
        "Content-Type": contentType,

        "Content-Disposition": descargar
          ? `attachment; filename="${encodeURIComponent(
              documento.nombre_archivo
            )}"`
          : "inline",

        "Content-Length": String(
          fileBuffer.length
        ),

        "Cache-Control":
          "private, no-cache, no-store, must-revalidate",

        "Pragma": "no-cache",

        "Expires": "0",
      },
    });
  } catch (error) {
    console.error(
      "ERROR AL ABRIR DOCUMENTO:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "No fue posible abrir el documento.",
      },
      { status: 500 }
    );
  }
}