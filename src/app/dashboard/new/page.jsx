"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "../../../components/LogoutButton";

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ============================================================
// UTILIDADES
// ============================================================

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(fileName) {
  const extension = fileName
    .split(".")
    .pop()
    ?.toUpperCase();

  return extension || "FILE";
}

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

// ============================================================
// GENERAR ID DE DOCUMENTO
// ============================================================

function generateDocumentId(existingDocuments = []) {
  const demoIds = [
    "DOC-001",
    "DOC-002",
    "DOC-003",
    "DOC-004",
    "DOC-005",
    "DOC-006",
  ];

  const allIds = [
    ...demoIds,
    ...existingDocuments.map((document) => document.id),
  ];

  const numbers = allIds
    .map((id) => {
      const match = String(id || "").match(/^DOC-(\d+)$/);

      return match ? Number(match[1]) : 0;
    })
    .filter((number) => number > 0);

  const nextNumber =
    numbers.length > 0
      ? Math.max(...numbers) + 1
      : 1;

  return `DOC-${String(nextNumber).padStart(3, "0")}`;
}

// ============================================================
// GENERAR ID DE HISTORIAL
// ============================================================

function generateHistoryId() {
  return `HIST-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 7)}`;
}

// ============================================================
// COMPONENTE
// ============================================================

export default function NewDocumentPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // ============================================================
  // USUARIO ACTUAL
  // ============================================================

  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "Greylin Martínez",
    email: "",
    role: "Usuario",
    department: "",
  });

  // ============================================================
  // FORMULARIO
  // ============================================================

  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("");
  const [priority, setPriority] = useState("Normal");

  const [selectedFile, setSelectedFile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // ============================================================
  // CARGAR USUARIO ACTUAL
  // ============================================================

  useEffect(() => {
    try {
      const currentUserData = localStorage.getItem(
        "docuportal_current_user"
      );

      if (!currentUserData) {
        router.replace("/login");
        return;
      }

      const parsedUser = JSON.parse(currentUserData);

      setCurrentUser({
        id: parsedUser.id || "",
        name: parsedUser.name || "Usuario",
        email: parsedUser.email || "",
        role: parsedUser.role || "Usuario",
        department: parsedUser.department || "",
      });
    } catch (error) {
      console.error(
        "Error leyendo el usuario actual:",
        error
      );

      localStorage.removeItem(
        "docuportal_current_user"
      );

      router.replace("/login");
    }
  }, [router]);

  // ============================================================
  // VALIDAR ARCHIVO
  // ============================================================

  const validateFile = (file) => {
    if (!file) {
      return "No se seleccionó ningún archivo.";
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Tipo de archivo no permitido. Puedes cargar PDF, Word, Excel, JPG o PNG.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "El archivo supera el tamaño máximo permitido de 10 MB.";
    }

    return "";
  };

  // ============================================================
  // MANEJAR ARCHIVO
  // ============================================================

  const handleFile = (file) => {
    setError("");
    setSuccess("");

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedFile(file);

    if (!documentName.trim()) {
      setDocumentName(file.name);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    handleFile(file);
  };

  // ============================================================
  // DRAG & DROP
  // ============================================================

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    handleFile(file);
  };

  // ============================================================
  // ELIMINAR ARCHIVO
  // ============================================================

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // VALIDAR FORMULARIO
  // ============================================================

  const validateForm = () => {
    if (!documentName.trim()) {
      return "Ingresa el nombre del documento.";
    }

    if (!documentType) {
      return "Selecciona el tipo de documento.";
    }

    if (!recipient.trim()) {
      return "Ingresa el destinatario.";
    }

    if (!selectedFile) {
      return "Selecciona o arrastra un archivo.";
    }

    return "";
  };

  // ============================================================
  // GUARDAR DOCUMENTO
  // ============================================================

  const saveDocument = (status) => {
    const now = new Date();

    // ----------------------------------------------------------
    // DOCUMENTOS EXISTENTES
    // ----------------------------------------------------------

    const existingDocumentsData =
      localStorage.getItem(
        "docuportal_documents"
      );

    let existingDocuments = [];

    try {
      existingDocuments = existingDocumentsData
        ? JSON.parse(existingDocumentsData)
        : [];

      if (!Array.isArray(existingDocuments)) {
        existingDocuments = [];
      }
    } catch (error) {
      console.error(
        "Error leyendo documentos existentes:",
        error
      );

      existingDocuments = [];
    }

    // ----------------------------------------------------------
    // ID ÚNICO
    // ----------------------------------------------------------

    const documentId =
      generateDocumentId(existingDocuments);

    // ----------------------------------------------------------
    // NUEVO DOCUMENTO
    // ----------------------------------------------------------

    const newDocument = {
      id: documentId,

      name:
        selectedFile?.name ||
        documentName.trim(),

      category: documentType,

      recipient: recipient.trim(),

      date: now.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),

      status,

      type: selectedFile
        ? getFileType(selectedFile.name)
        : "FILE",

      size: selectedFile
        ? formatFileSize(selectedFile.size)
        : "0 KB",

      description:
        description.trim() ||
        "Sin descripción.",

      priority,

      fileName: selectedFile?.name || "",

      fileType: selectedFile?.type || "",

      fileSize: selectedFile?.size || 0,

      // --------------------------------------------------------
      // USUARIO QUE CREÓ EL DOCUMENTO
      // --------------------------------------------------------

      userId: currentUser.id,

      user: currentUser.name,

      userEmail: currentUser.email,

      userRole: currentUser.role,

      department: currentUser.department,

      createdBy: currentUser.name,

      createdByRole: currentUser.role,

      createdAt: now.toISOString(),
    };

    // ----------------------------------------------------------
    // GUARDAR DOCUMENTO
    // ----------------------------------------------------------

    localStorage.setItem(
      "docuportal_documents",
      JSON.stringify([
        newDocument,
        ...existingDocuments,
      ])
    );

    // ==========================================================
    // HISTORIAL
    // ==========================================================

    const existingHistoryData =
      localStorage.getItem(
        "docuportal_history"
      );

    let existingHistory = [];

    try {
      existingHistory = existingHistoryData
        ? JSON.parse(existingHistoryData)
        : [];

      if (!Array.isArray(existingHistory)) {
        existingHistory = [];
      }
    } catch (error) {
      console.error(
        "Error leyendo historial existente:",
        error
      );

      existingHistory = [];
    }

    // ----------------------------------------------------------
    // REGISTRO DE HISTORIAL
    // ----------------------------------------------------------

    const historyItem = {
      id: generateHistoryId(),

      action:
        status === "Enviado"
          ? "Documento enviado"
          : "Documento guardado",

      document: newDocument.name,

      documentId: newDocument.id,

      user: currentUser.name,

      userId: currentUser.id,

      userRole: currentUser.role,

      userEmail: currentUser.email,

      department: currentUser.department,

      date: now.toLocaleDateString(
        "es-CO",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),

      time: now.toLocaleTimeString(
        "es-CO",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),

      status,

      type: "Documento",

      category: newDocument.category,

      priority: newDocument.priority,

      details:
        status === "Enviado"
          ? `El usuario ${currentUser.name} envió el documento "${newDocument.name}".`
          : `El usuario ${currentUser.name} guardó el documento "${newDocument.name}" como pendiente.`,

      createdAt: now.toISOString(),
    };

    // ----------------------------------------------------------
    // GUARDAR HISTORIAL
    // ----------------------------------------------------------

    localStorage.setItem(
      "docuportal_history",
      JSON.stringify([
        historyItem,
        ...existingHistory,
      ])
    );

    return newDocument;
  };

  // ============================================================
  // ENVIAR / GUARDAR DOCUMENTO
  // ============================================================

  const handleSubmit = (event, action) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (action === "draft") {
        saveDocument("Pendiente");

        setSuccess(
          "Documento guardado correctamente como pendiente."
        );
      }

      if (action === "send") {
        saveDocument("Enviado");

        setSuccess(
          "Documento enviado correctamente."
        );
      }

      setTimeout(() => {
        router.push("/dashboard/documents");
      }, 800);
    } catch (saveError) {
      console.error(
        "Error al guardar el documento:",
        saveError
      );

      setError(
        "No fue posible guardar el documento. Intenta nuevamente."
      );
    }
  };

  // ============================================================
  // DATOS VISUALES
  // ============================================================

  const initials = getInitials(
    currentUser.name
  );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="dashboard-layout">
      {/* ============================================================
          SIDEBAR
      ============================================================ */}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            D
          </div>

          <div>
            <h2>
              DocuPortal
            </h2>

            <span>
              Portal documental
            </span>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <div className="navigation-section">
            PRINCIPAL
          </div>

          <Link
            href="/dashboard"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>
          </Link>

          <Link
            href="/dashboard/documents"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ▤
            </span>

            <span>
              Documentos
            </span>
          </Link>

          <Link
            href="/dashboard/documents?status=Enviado"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ↗
            </span>

            <span>
              Enviados
            </span>
          </Link>

          <Link
            href="/dashboard/documents?status=Recibido"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ↙
            </span>

            <span>
              Recibidos
            </span>
          </Link>

          <Link
            href="/dashboard/tickets"
            className="navigation-item"
          >
            <span className="navigation-icon">
              □
            </span>

            <span>
              Tickets
            </span>
          </Link>

          <div className="navigation-section second-section">
            GESTIÓN
          </div>

          <Link
            href="/dashboard/history"
            className="navigation-item"
          >
            <span className="navigation-icon">
              ◷
            </span>

            <span>
              Historial
            </span>
          </Link>

          {currentUser.role === "Administrador" && (
            <Link
              href="/admin"
              className="navigation-item"
            >
              <span className="navigation-icon">
                ⚙
              </span>

              <span>
                Administración
              </span>
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {initials}
            </div>

            <div className="sidebar-user-data">
              <strong>
                {currentUser.name}
              </strong>

              <span>
                {currentUser.role}
              </span>
            </div>
          </div>

          <LogoutButton className="logout-link">
            <span>
              ↪
            </span>

            Cerrar sesión
          </LogoutButton>
        </div>
      </aside>

      {/* ============================================================
          CONTENIDO PRINCIPAL
      ============================================================ */}

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <span>
              GESTIÓN DOCUMENTAL
            </span>

            <h1>
              Nuevo documento
            </h1>
          </div>

          <div className="header-right">
            <div className="header-user">
              <div className="header-user-avatar">
                {initials}
              </div>

              <div className="header-user-data">
                <strong>
                  {currentUser.name}
                </strong>

                <span>
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content new-document-content">
          {/* ========================================================
              INTRO
          ======================================================== */}

          <section className="documents-intro">
            <div>
              <span className="documents-eyebrow">
                CENTRO DOCUMENTAL
              </span>

              <h2>
                Crear nuevo documento
              </h2>

              <p>
                Completa la información y carga el archivo
                que deseas registrar en el portal.
              </p>
            </div>

            <Link
              href="/dashboard/documents"
              className="documents-new-button"
            >
              ← Volver a documentos
            </Link>
          </section>

          {/* ========================================================
              MENSAJES
          ======================================================== */}

          {error && (
            <div className="form-alert form-alert-error">
              <span>
                !
              </span>

              <div>
                <strong>
                  No fue posible continuar
                </strong>

                <p>
                  {error}
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="form-alert form-alert-success">
              <span>
                ✓
              </span>

              <div>
                <strong>
                  Operación realizada
                </strong>

                <p>
                  {success}
                </p>
              </div>
            </div>
          )}

          {/* ========================================================
              FORMULARIO
          ======================================================== */}

          <form
            className="new-document-form"
            onSubmit={(event) =>
              handleSubmit(event, "send")
            }
          >
            <section className="content-card new-document-card">
              <div className="content-card-header">
                <div>
                  <span>
                    INFORMACIÓN DEL DOCUMENTO
                  </span>

                  <h2>
                    Datos generales
                  </h2>
                </div>
              </div>

              <div className="form-grid">
                {/* Nombre */}

                <div className="form-group">
                  <label htmlFor="documentName">
                    Nombre del documento
                    <span>
                      *
                    </span>
                  </label>

                  <input
                    id="documentName"
                    type="text"
                    placeholder="Ej. Contrato de prestación de servicios"
                    value={documentName}
                    onChange={(event) =>
                      setDocumentName(
                        event.target.value
                      )
                    }
                  />
                </div>

                {/* Tipo */}

                <div className="form-group">
                  <label htmlFor="documentType">
                    Tipo de documento
                    <span>
                      *
                    </span>
                  </label>

                  <select
                    id="documentType"
                    value={documentType}
                    onChange={(event) =>
                      setDocumentType(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecciona una categoría
                    </option>

                    <option value="Contrato">
                      Contrato
                    </option>

                    <option value="Informe">
                      Informe
                    </option>

                    <option value="Certificación">
                      Certificación
                    </option>

                    <option value="Solicitud">
                      Solicitud
                    </option>

                    <option value="Soporte">
                      Soporte
                    </option>

                    <option value="Política">
                      Política
                    </option>

                    <option value="Factura">
                      Factura
                    </option>

                    <option value="Otro">
                      Otro
                    </option>
                  </select>
                </div>

                {/* Destinatario */}

                <div className="form-group">
                  <label htmlFor="recipient">
                    Destinatario
                    <span>
                      *
                    </span>
                  </label>

                  <input
                    id="recipient"
                    type="text"
                    placeholder="Ej. Departamento Administrativo"
                    value={recipient}
                    onChange={(event) =>
                      setRecipient(
                        event.target.value
                      )
                    }
                  />
                </div>

                {/* Prioridad */}

                <div className="form-group">
                  <label htmlFor="priority">
                    Prioridad
                  </label>

                  <select
                    id="priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(
                        event.target.value
                      )
                    }
                  >
                    <option value="Normal">
                      Normal
                    </option>

                    <option value="Alta">
                      Alta
                    </option>

                    <option value="Urgente">
                      Urgente
                    </option>
                  </select>
                </div>

                {/* Descripción */}

                <div className="form-group form-group-full">
                  <label htmlFor="description">
                    Descripción
                  </label>

                  <textarea
                    id="description"
                    rows="5"
                    placeholder="Escribe una descripción del documento..."
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>
            </section>

            {/* ======================================================
                ARCHIVO
            ====================================================== */}

            <section className="content-card new-document-card">
              <div className="content-card-header">
                <div>
                  <span>
                    ARCHIVO
                  </span>

                  <h2>
                    Adjuntar documento
                  </h2>
                </div>
              </div>

              <div
                className={`file-dropzone ${
                  isDragging
                    ? "dragging"
                    : ""
                } ${
                  selectedFile
                    ? "has-file"
                    : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  hidden
                />

                {!selectedFile ? (
                  <>
                    <div className="file-dropzone-icon">
                      ↑
                    </div>

                    <h3>
                      Arrastra tu archivo aquí
                    </h3>

                    <p>
                      o haz clic para seleccionar un
                      archivo desde tu computador
                    </p>

                    <span className="file-dropzone-info">
                      PDF, Word, Excel, JPG o PNG · Máximo 10 MB
                    </span>
                  </>
                ) : (
                  <div className="selected-file">
                    <div className="selected-file-icon">
                      {getFileType(
                        selectedFile.name
                      )}
                    </div>

                    <div className="selected-file-info">
                      <strong>
                        {selectedFile.name}
                      </strong>

                      <span>
                        {formatFileSize(
                          selectedFile.size
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="remove-file-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFile();
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* ======================================================
                BOTONES
            ====================================================== */}

            <section className="new-document-actions">
              <Link
                href="/dashboard/documents"
                className="new-document-cancel"
              >
                Cancelar
              </Link>

              <div className="new-document-action-group">
                <button
                  type="button"
                  className="new-document-draft"
                  onClick={(event) =>
                    handleSubmit(
                      event,
                      "draft"
                    )
                  }
                >
                  Guardar como pendiente
                </button>

                <button
                  type="submit"
                  className="new-document-submit"
                >
                  Enviar documento

                  <span>
                    →
                  </span>
                </button>
              </div>
            </section>
          </form>

          {/* ========================================================
              AVISO
          ======================================================== */}

          <p className="documents-demo-notice">
            Por ahora, la información del documento y su
            actividad se almacenan temporalmente en este
            navegador mediante localStorage. El archivo físico
            todavía no se almacena en un servidor.
          </p>
        </div>
      </main>
    </div>
  );
}