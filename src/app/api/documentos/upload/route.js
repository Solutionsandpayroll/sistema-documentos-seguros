import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        {
          success: false,
          message: "No se recibió ningún archivo.",
        },
        { status: 400 }
      );
    }

    // Tamaño máximo: 10 MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          success: false,
          message: "El archivo no puede superar los 10 MB.",
        },
        { status: 400 }
      );
    }

    // Tipos de archivo permitidos
    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".jpg",
      ".jpeg",
      ".png",
    ];

    const originalName = file.name;
    const extension = path.extname(originalName).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return Response.json(
        {
          success: false,
          message: "El tipo de archivo no está permitido.",
        },
        { status: 400 }
      );
    }

    // Carpeta donde se guardarán los archivos
    const uploadDirectory = path.join(
      process.cwd(),
      "storage",
      "uploads"
    );

    // Crear la carpeta si no existe
    await fs.mkdir(uploadDirectory, {
      recursive: true,
    });

    // Crear un nombre único para el archivo
    const uniqueName = `${crypto.randomUUID()}${extension}`;

    const filePath = path.join(
      uploadDirectory,
      uniqueName
    );

    // Convertir el archivo y guardarlo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.writeFile(filePath, buffer);

    console.log("ARCHIVO GUARDADO:", filePath);

    return Response.json({
      success: true,
      message: "Archivo guardado correctamente.",
      archivo: {
        nombre_original: originalName,
        nombre_guardado: uniqueName,
        ruta_archivo: filePath,
        extension,
        tamanio: file.size,
      },
    });
  } catch (error) {
    console.error("Error guardando archivo:", error);

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "No fue posible guardar el archivo.",
      },
      { status: 500 }
    );
  }
}