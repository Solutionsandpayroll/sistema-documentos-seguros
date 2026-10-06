"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "../../../../components/LogoutButton";

const CATEGORIES = [
  "Soporte",
  "Documentos",
  "Solicitud",
  "Otro",
];

const PRIORITIES = [
  "Baja",
  "Normal",
  "Media",
  "Alta",
];

// ============================================================
// TICKETS DEMO
// ============================================================
// Estos son los tickets que también aparecen inicialmente
// en la lista de tickets.
// ============================================================

const DEMO_TICKET_IDS = [
  "TKT-001",
  "TKT-002",
  "TKT-003",
  "TKT-004",
];

// ============================================================
// GENERAR ID DE TICKET
// ============================================================

function generateTicketId(existingTickets) {
  const allIds = [
    ...DEMO_TICKET_IDS,
    ...existingTickets.map(
      (ticket) => ticket.id
    ),
  ];

  const numbers = allIds
    .map((id) => {
      const match = String(id || "").match(
        /^TKT-(\d+)$/
      );

      return match ? Number(match[1]) : 0;
    })
    .filter(
      (number) => !Number.isNaN(number)
    );

  const nextNumber =
    numbers.length > 0
      ? Math.max(...numbers) + 1
      : 1;

  return `TKT-${String(nextNumber).padStart(
    3,
    "0"
  )}`;
}

// ============================================================
// OBTENER INICIALES
// ============================================================

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

// ============================================================
// COMPONENTE
// ============================================================

export default function NewTicketPage() {
  const router = useRouter();

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

  const [subject, setSubject] = useState("");
  const [category, setCategory] =
    useState("Soporte");
  const [priority, setPriority] =
    useState("Normal");
  const [description, setDescription] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  // ============================================================
  // CARGAR USUARIO ACTUAL
  // ============================================================

  useEffect(() => {
    try {
      const currentUserData =
        localStorage.getItem(
          "docuportal_current_user"
        );

      if (!currentUserData) {
        router.replace("/login");
        return;
      }

      const parsedUser =
        JSON.parse(currentUserData);

      setCurrentUser({
        id: parsedUser.id || "",
        name:
          parsedUser.name || "Usuario",
        email:
          parsedUser.email || "",
        role:
          parsedUser.role || "Usuario",
        department:
          parsedUser.department || "",
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
      return true;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
    ];

    const maxSize =
      10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError(
        "El archivo debe ser PDF, Word, Excel, JPG o PNG."
      );

      return false;
    }

    if (file.size > maxSize) {
      setError(
        "El archivo no puede superar los 10 MB."
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // MANEJAR ARCHIVO
  // ============================================================

  const handleFileChange = (file) => {
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
  };

  // ============================================================
  // DRAG & DROP
  // ============================================================

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    handleFileChange(file);
  };

  // ============================================================
  // CREAR TICKET
  // ============================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    // ==========================================================
    // VALIDACIONES
    // ==========================================================

    if (!subject.trim()) {
      setError(
        "Debes ingresar el asunto del ticket."
      );

      return;
    }

    if (!description.trim()) {
      setError(
        "Debes ingresar una descripción."
      );

      return;
    }

    try {
      // ========================================================
      // LEER TICKETS EXISTENTES
      // ========================================================

      const existingTicketsData =
        localStorage.getItem(
          "docuportal_tickets"
        );

      const existingTickets =
        existingTicketsData
          ? JSON.parse(
              existingTicketsData
            )
          : [];

      const safeExistingTickets =
        Array.isArray(existingTickets)
          ? existingTickets
          : [];

      // ========================================================
      // FECHA ACTUAL
      // ========================================================

      const now = new Date();

      // ========================================================
      // GENERAR ID
      // ========================================================

      const ticketId =
        generateTicketId(
          safeExistingTickets
        );

      // ========================================================
      // CREAR TICKET
      // ========================================================

      const newTicket = {
        id: ticketId,

        subject: subject.trim(),

        category,

        priority,

        status: "Abierto",

        // ======================================================
        // USUARIO QUE CREÓ EL TICKET
        // ======================================================

        requester: currentUser.name,

        requesterId: currentUser.id,

        requesterRole:
          currentUser.role,

        requesterEmail:
          currentUser.email,

        user: currentUser.name,

        userId: currentUser.id,

        // ======================================================
        // INFORMACIÓN DEL DEPARTAMENTO
        // ======================================================

        department:
          currentUser.department,

        // ======================================================
        // FECHA
        // ======================================================

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

        // ======================================================
        // DESCRIPCIÓN
        // ======================================================

        description:
          description.trim(),

        // ======================================================
        // ARCHIVO
        // ======================================================

        fileName: selectedFile
          ? selectedFile.name
          : "",

        fileType: selectedFile
          ? selectedFile.type
          : "",

        fileSize: selectedFile
          ? selectedFile.size
          : 0,

        // ======================================================
        // FECHA TÉCNICA
        // ======================================================

        createdAt:
          now.toISOString(),
      };

      // ==========================================================
      // GUARDAR TICKET
      // ==========================================================

      localStorage.setItem(
        "docuportal_tickets",
        JSON.stringify([
          newTicket,
          ...safeExistingTickets,
        ])
      );

      // ==========================================================
      // LEER HISTORIAL
      // ==========================================================

      const existingHistoryData =
        localStorage.getItem(
          "docuportal_history"
        );

      const existingHistory =
        existingHistoryData
          ? JSON.parse(
              existingHistoryData
            )
          : [];

      const safeExistingHistory =
        Array.isArray(existingHistory)
          ? existingHistory
          : [];

      // ==========================================================
      // CREAR ACTIVIDAD DE HISTORIAL
      // ==========================================================

      const historyItem = {
        id: `HIST-${Date.now()}`,

        action: "Ticket creado",

        document:
          newTicket.subject,

        documentId:
          newTicket.id,

        // ======================================================
        // USUARIO REAL
        // ======================================================

        user:
          currentUser.name,

        userId:
          currentUser.id,

        userRole:
          currentUser.role,

        // ======================================================
        // INFORMACIÓN
        // ======================================================

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

        status:
          newTicket.status,

        type: "Ticket",

        category:
          newTicket.category,

        priority:
          newTicket.priority,

        details:
          `El usuario ${currentUser.name} creó el ticket ${newTicket.id}.`,

        createdAt:
          now.toISOString(),
      };

      // ==========================================================
      // GUARDAR HISTORIAL
      // ==========================================================

      localStorage.setItem(
        "docuportal_history",
        JSON.stringify([
          historyItem,
          ...safeExistingHistory,
        ])
      );

      // ==========================================================
      // MOSTRAR ÉXITO
      // ==========================================================

      setSuccess(true);

      setTimeout(() => {
        router.push(
          "/dashboard/tickets"
        );
      }, 800);
    } catch (storageError) {
      console.error(
        "Error al guardar ticket:",
        storageError
      );

      setError(
        "No fue posible guardar el ticket. Intenta nuevamente."
      );
    }
  };

  // ============================================================
  // INICIALES
  // ============================================================

  const initials = getInitials(
    currentUser.name
  );

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
            className="navigation-item active"
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

          {currentUser.role ===
            "Administrador" && (
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

        {/* ==========================================================
            USUARIO Y CERRAR SESIÓN
        ========================================================== */}

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
              SOPORTE Y ATENCIÓN
            </span>

            <h1>
              Nuevo ticket
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

        <div className="dashboard-content">

          {/* ========================================================
              ENCABEZADO
          ======================================================== */}

          <section className="documents-intro">

            <div>

              <span className="documents-eyebrow">
                CENTRO DE SOPORTE
              </span>

              <h2>
                Crear una nueva solicitud
              </h2>

              <p>
                Completa la información para
                registrar un nuevo ticket de soporte.
              </p>

            </div>

            <Link
              href="/dashboard/tickets"
              className="documents-secondary-button"
            >
              ← Volver a tickets
            </Link>

          </section>

          {/* ========================================================
              FORMULARIO
          ======================================================== */}

          <section className="content-card new-document-card">

            <div className="content-card-header">

              <div>

                <span>
                  INFORMACIÓN DEL TICKET
                </span>

                <h2>
                  Datos de la solicitud
                </h2>

              </div>

            </div>

            <form
              className="new-document-form"
              onSubmit={handleSubmit}
            >

              {/* ==================================================
                  ASUNTO
              ================================================== */}

              <div className="form-field">

                <label htmlFor="subject">
                  Asunto
                  <span>*</span>
                </label>

                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value
                    )
                  }
                  placeholder="Ej. Problema con un documento enviado"
                  maxLength={150}
                />

              </div>

              {/* ==================================================
                  CATEGORÍA Y PRIORIDAD
              ================================================== */}

              <div className="form-row">

                <div className="form-field">

                  <label htmlFor="category">
                    Categoría
                    <span>*</span>
                  </label>

                  <select
                    id="category"
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value
                      )
                    }
                  >

                    {CATEGORIES.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="form-field">

                  <label htmlFor="priority">
                    Prioridad
                    <span>*</span>
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

                    {PRIORITIES.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* ==================================================
                  DESCRIPCIÓN
              ================================================== */}

              <div className="form-field">

                <label htmlFor="description">
                  Descripción
                  <span>*</span>
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe detalladamente la solicitud o el problema..."
                  rows={7}
                  maxLength={1000}
                />

                <small>
                  {description.length}/1000
                  caracteres
                </small>

              </div>

              {/* ==================================================
                  ARCHIVO
              ================================================== */}

              <div className="form-field">

                <label>
                  Archivo adjunto
                </label>

                <div
                  className={`file-upload-area ${
                    isDragging
                      ? "dragging"
                      : ""
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() =>
                    setIsDragging(false)
                  }
                  onDrop={handleDrop}
                >

                  <input
                    id="ticket-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={(event) =>
                      handleFileChange(
                        event.target.files?.[0]
                      )
                    }
                    hidden
                  />

                  <div className="file-upload-icon">
                    ↑
                  </div>

                  <strong>
                    Arrastra tu archivo aquí
                  </strong>

                  <span>
                    o
                  </span>

                  <label
                    htmlFor="ticket-file"
                    className="file-upload-button"
                  >
                    Seleccionar archivo
                  </label>

                  <small>
                    PDF, Word, Excel, JPG o PNG.
                    Máximo 10 MB.
                  </small>

                </div>

                {selectedFile && (
                  <div className="selected-file">

                    <div>

                      <strong>
                        {selectedFile.name}
                      </strong>

                      <span>
                        {(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedFile(null)
                      }
                      aria-label="Eliminar archivo"
                    >
                      ×
                    </button>

                  </div>
                )}

              </div>

              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              {/* ==================================================
                  ÉXITO
              ================================================== */}

              {success && (
                <div className="form-success">
                  Ticket creado correctamente.
                  Redirigiendo...
                </div>
              )}

              {/* ==================================================
                  BOTONES
              ================================================== */}

              <div className="new-document-actions">

                <Link
                  href="/dashboard/tickets"
                  className="document-modal-secondary"
                >
                  Cancelar
                </Link>

                <button
                  type="submit"
                  className="documents-new-button"
                  disabled={success}
                >
                  <span>
                    ✓
                  </span>

                  Crear ticket
                </button>

              </div>

            </form>

          </section>

          <p className="documents-demo-notice">
            Por ahora los tickets se guardan
            temporalmente en este navegador. Más adelante
            los conectaremos con la base de datos.
          </p>

        </div>

      </main>

    </div>
  );
}