"use client";

import "./new.css";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import LogoutButton from "@/components/LogoutButton";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileType(fileName) {
  if (!fileName) {
    return "FILE";
  }

  const parts = fileName.split(".");

  if (parts.length < 2) {
    return "FILE";
  }

  return parts[parts.length - 1].toUpperCase();
}

function generatePassword(length = 10) {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return password;
}

export default function NewDocumentPage() {
  const router = useRouter();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fileInputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState({
    id: null,
    name: "Administrador",
    role: "Administrador",
  });

  const [documentName, setDocumentName] =
    useState("");

  const [documentType, setDocumentType] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [companies, setCompanies] =
    useState([]);

  const [recipients, setRecipients] =
    useState([]);

  const [selectedCompany, setSelectedCompany] =
    useState("");

  const [selectedRecipient, setSelectedRecipient] =
    useState("");

  const [password, setPassword] =
    useState(generatePassword());

  const [loadingCompanies, setLoadingCompanies] =
    useState(true);

  const [loadingRecipients, setLoadingRecipients] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [dragActive, setDragActive] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =====================================================
     USUARIO ACTUAL
     ===================================================== */

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(
        "docuportal_current_user"
      );

      if (!savedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(savedUser);

      setCurrentUser({
        id: user.id || null,
        name:
          user.name ||
          user.nombre ||
          "Administrador",
        role:
          user.role ||
          user.rol ||
          "Administrador",
      });
    } catch (error) {
      console.error(
        "Error cargando el usuario actual:",
        error
      );

      router.push("/login");
    }
  }, [router]);

  /* =====================================================
     EMPRESAS
     ===================================================== */

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);

        const response = await fetch(
          "/api/empresas",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "No se pudieron cargar las empresas"
          );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setCompanies(data);
        } else {
          setCompanies([]);
        }
      } catch (error) {
        console.error(
          "Error cargando empresas:",
          error
        );

        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  /* =====================================================
     DESTINATARIOS
     ===================================================== */

  useEffect(() => {
    const loadRecipients = async () => {
      if (!selectedCompany) {
        setRecipients([]);
        setSelectedRecipient("");
        return;
      }

      try {
        setLoadingRecipients(true);

        const response = await fetch(
          "/api/destinatarios",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "No se pudieron cargar los destinatarios"
          );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const filteredRecipients =
            data.filter(
              (recipient) =>
                String(
                  recipient.empresa_id
                ) === String(selectedCompany) &&
                recipient.activo === true
            );

          setRecipients(filteredRecipients);
        } else {
          setRecipients([]);
        }
      } catch (error) {
        console.error(
          "Error cargando destinatarios:",
          error
        );

        setRecipients([]);
      } finally {
        setLoadingRecipients(false);
      }
    };

    loadRecipients();
  }, [selectedCompany]);

  /* =====================================================
     INICIALES DEL USUARIO
     ===================================================== */

  const getInitials = (name) => {
    if (!name) {
      return "AD";
    }

    const words = name
      .trim()
      .split(" ")
      .filter(Boolean);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  };

  const userInitials = getInitials(
    currentUser.name
  );

  /* =====================================================
     MENÚ ACTIVO
     ===================================================== */

  const status = searchParams.get("status");

  const isDashboardActive =
    pathname === "/dashboard";

  const isDocumentsActive =
    pathname === "/dashboard/documents" ||
    pathname === "/dashboard/new";

  const isSentActive =
    pathname === "/dashboard/documents" &&
    status === "Enviado";

  const isReceivedActive =
    pathname === "/dashboard/documents" &&
    status === "Recibido";

  const isTicketsActive =
    pathname === "/dashboard/tickets";

  const isHistoryActive =
    pathname === "/dashboard/history";

  const isAdminActive =
    pathname === "/admin";

  /* =====================================================
     ARCHIVOS
     ===================================================== */

  const validateFile = (file) => {
    if (!file) {
      return "Selecciona un archivo.";
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Tipo de archivo no permitido. Solo se permiten PDF, Word, Excel, JPG y PNG.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "El archivo no puede superar los 10 MB.";
    }

    return "";
  };

  const handleFile = (file) => {
    setError("");
    setMessage("");

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);

    if (!documentName) {
      setDocumentName(
        file.name.replace(/\.[^/.]+$/, "")
      );
    }

    setDocumentType(getFileType(file.name));
  };

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     GENERAR CONTRASEÑA
     ===================================================== */

  const handleGeneratePassword = () => {
    setPassword(generatePassword());
  };

  /* =====================================================
     ENVIAR DOCUMENTO
     ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!selectedFile) {
      setError(
        "Debes seleccionar un archivo."
      );
      return;
    }

    if (!currentUser.id) {
      setError(
        "No se pudo identificar el usuario actual."
      );
      return;
    }

    if (!selectedCompany) {
      setError(
        "Debes seleccionar una empresa."
      );
      return;
    }

    if (!selectedRecipient) {
      setError(
        "Debes seleccionar un destinatario."
      );
      return;
    }

    if (!documentName.trim()) {
      setError(
        "Debes ingresar el nombre del documento."
      );
      return;
    }

    try {
      setSending(true);

      /* -----------------------------------------------
         1. SUBIR ARCHIVO
         ----------------------------------------------- */

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const uploadResponse = await fetch(
        "/api/documentos/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const uploadError =
          await uploadResponse.json().catch(
            () => ({})
          );

        throw new Error(
          uploadError.error ||
            "No se pudo subir el archivo."
        );
      }

      const uploadData =
        await uploadResponse.json();

      const rutaArchivo =
        uploadData?.archivo?.ruta_archivo;

      if (!rutaArchivo) {
        throw new Error(
          "No se obtuvo la ruta del archivo."
        );
      }

      /* -----------------------------------------------
         2. CREAR DOCUMENTO
         ----------------------------------------------- */

      const createResponse = await fetch(
        "/api/documentos/crear",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            nombre_archivo:
              documentName.trim(),
            ruta_archivo:
              rutaArchivo,
            empleado_id:
              currentUser.id,
            empresa_id:
              selectedCompany,
            destinatario_id:
              selectedRecipient,
            contrasena: password,
            estado: "enviado",
            descripcion:
              description.trim(),
          }),
        }
      );

      if (!createResponse.ok) {
        const createError =
          await createResponse
            .json()
            .catch(() => ({}));

        throw new Error(
          createError.error ||
            "No se pudo crear el documento."
        );
      }

      setMessage(
        "Documento enviado correctamente."
      );

      alert(
        `Documento enviado correctamente.\n\nContraseña del documento: ${password}`
      );

      router.push(
        "/dashboard/documents"
      );
    } catch (error) {
      console.error(
        "Error enviando documento:",
        error
      );

      setError(
        error.message ||
          "Ocurrió un error al enviar el documento."
      );
    } finally {
      setSending(false);
    }
  };

  /* =====================================================
     CANCELAR
     ===================================================== */

  const handleCancel = () => {
    router.push(
      "/dashboard/documents"
    );
  };

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div className="dashboard-layout">

      {/* =================================================
          SIDEBAR
          ================================================= */}

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

          {/* DASHBOARD */}

          <Link
            href="/dashboard"
            className={`navigation-item ${
              isDashboardActive
                ? "active"
                : ""
            }`}
          >
            <span className="navigation-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>
          </Link>

          {/* DOCUMENTOS */}

          <Link
            href="/dashboard/documents"
            className={`navigation-item ${
              isDocumentsActive &&
              !isSentActive &&
              !isReceivedActive
                ? "active"
                : ""
            }`}
          >
            <span className="navigation-icon">
              ▤
            </span>

            <span>
              Documentos
            </span>
          </Link>

          {/* ENVIADOS */}

          <Link
            href="/dashboard/documents?status=Enviado"
            className={`navigation-item ${
              isSentActive
                ? "active"
                : ""
            }`}
          >
            <span className="navigation-icon">
              ↗
            </span>

            <span>
              Enviados
            </span>
          </Link>

          {/* RECIBIDOS */}

          <Link
            href="/dashboard/documents?status=Recibido"
            className={`navigation-item ${
              isReceivedActive
                ? "active"
                : ""
            }`}
          >
            <span className="navigation-icon">
              ↙
            </span>

            <span>
              Recibidos
            </span>
          </Link>

          {/* TICKETS */}

          <Link
            href="/dashboard/tickets"
            className={`navigation-item ${
              isTicketsActive
                ? "active"
                : ""
            }`}
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

          {/* HISTORIAL */}

          <Link
            href="/dashboard/history"
            className={`navigation-item ${
              isHistoryActive
                ? "active"
                : ""
            }`}
          >
            <span className="navigation-icon">
              ◷
            </span>

            <span>
              Historial
            </span>
          </Link>

          {/* ADMINISTRACIÓN */}

          {currentUser.role ===
            "Administrador" && (
            <Link
              href="/admin"
              className={`navigation-item ${
                isAdminActive
                  ? "active"
                  : ""
              }`}
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

        {/* USUARIO */}

        <div className="sidebar-footer">

          <div className="sidebar-user">

            <div className="user-avatar">
              {userInitials}
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

      {/* =================================================
          CONTENIDO PRINCIPAL
          ================================================= */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div className="header-title">

            <span>
              PORTAL DOCUMENTAL
            </span>

            <h1>
              Nuevo documento
            </h1>

          </div>

          <div className="header-right">

            <div className="header-user">

              <div className="header-user-avatar">
                {userInitials}
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

        {/* =================================================
            FORMULARIO
            ================================================= */}

        <div className="new-document-content">

          <div className="new-document-page-header">

            <div>

              <h2>
                Nuevo documento
              </h2>

              <p>
                Completa la información para
                enviar un documento de forma
                segura.
              </p>

            </div>

            <Link
              href="/dashboard/documents"
              className="back-button"
            >
              ← Volver a documentos
            </Link>

          </div>

          {/* MENSAJE DE ERROR */}

          {error && (
            <div className="form-message error">
              {error}
            </div>
          )}

          {/* MENSAJE DE ÉXITO */}

          {message && (
            <div className="form-message success">
              {message}
            </div>
          )}

          <form
            className="new-document-form"
            onSubmit={handleSubmit}
          >

            {/* =================================================
                INFORMACIÓN DEL DOCUMENTO
                ================================================= */}

            <section className="form-section">

              <div className="form-section-header">

                <h3>
                  Información del documento
                </h3>

                <p>
                  Ingresa los datos básicos del
                  documento.
                </p>

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Nombre del documento
                  </label>

                  <input
                    type="text"
                    value={documentName}
                    onChange={(event) =>
                      setDocumentName(
                        event.target.value
                      )
                    }
                    placeholder="Ej. Contrato de prestación de servicios"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Tipo de documento
                  </label>

                  <input
                    type="text"
                    value={documentType}
                    onChange={(event) =>
                      setDocumentType(
                        event.target.value
                      )
                    }
                    placeholder="Ej. PDF"
                  />

                </div>

                <div className="form-group full-width">

                  <label>
                    Descripción
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    placeholder="Agrega una descripción del documento..."
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                ARCHIVO
                ================================================= */}

            <section className="form-section">

              <div className="form-section-header">

                <h3>
                  Archivo
                </h3>

                <p>
                  Sube el archivo que deseas
                  enviar.
                </p>

              </div>

              <div
                className={`file-upload-area ${
                  dragActive
                    ? "drag-active"
                    : ""
                }`}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={handleDrop}
              >

                <div className="file-upload-icon">
                  ↑
                </div>

                <h4>
                  Arrastra tu archivo aquí
                </h4>

                <p>
                  o haz clic para seleccionar
                  un archivo
                </p>

                <p>
                  PDF, Word, Excel, JPG o PNG.
                  Máximo 10 MB.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={
                    handleFileChange
                  }
                />

              </div>

              {selectedFile && (
                <div className="selected-file">

                  <div className="selected-file-info">

                    <div className="selected-file-icon">
                      {getFileType(
                        selectedFile.name
                      )}
                    </div>

                    <div className="selected-file-data">

                      <strong>
                        {selectedFile.name}
                      </strong>

                      <span>
                        {formatFileSize(
                          selectedFile.size
                        )}
                      </span>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="remove-file"
                    onClick={
                      removeFile
                    }
                  >
                    ×
                  </button>

                </div>
              )}

            </section>

            {/* =================================================
                DESTINO
                ================================================= */}

            <section className="form-section">

              <div className="form-section-header">

                <h3>
                  Destino
                </h3>

                <p>
                  Selecciona la empresa y el
                  destinatario autorizado.
                </p>

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Empresa
                  </label>

                  <select
                    value={selectedCompany}
                    onChange={(event) =>
                      setSelectedCompany(
                        event.target.value
                      )
                    }
                    disabled={
                      loadingCompanies
                    }
                  >

                    <option value="">
                      {loadingCompanies
                        ? "Cargando empresas..."
                        : "Selecciona una empresa"}
                    </option>

                    {companies.map(
                      (company) => (
                        <option
                          key={
                            company.id
                          }
                          value={
                            company.id
                          }
                        >
                          {company.nombre}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Destinatario
                  </label>

                  <select
                    value={
                      selectedRecipient
                    }
                    onChange={(event) =>
                      setSelectedRecipient(
                        event.target.value
                      )
                    }
                    disabled={
                      !selectedCompany ||
                      loadingRecipients
                    }
                  >

                    <option value="">
                      {!selectedCompany
                        ? "Selecciona primero una empresa"
                        : loadingRecipients
                        ? "Cargando destinatarios..."
                        : "Selecciona un destinatario"}
                    </option>

                    {recipients.map(
                      (recipient) => (
                        <option
                          key={
                            recipient.id
                          }
                          value={
                            recipient.id
                          }
                        >
                          {recipient.nombre ||
                            recipient.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

            </section>

            {/* =================================================
                SEGURIDAD
                ================================================= */}

            <section className="form-section">

              <div className="form-section-header">

                <h3>
                  Seguridad
                </h3>

                <p>
                  El documento estará protegido
                  con una contraseña.
                </p>

              </div>

              <div className="form-group">

                <label>
                  Contraseña del documento
                </label>

                <div className="password-container">

                  <input
                    type="text"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="generate-password-button"
                    onClick={
                      handleGeneratePassword
                    }
                  >
                    Generar otra
                  </button>

                </div>

                <small>
                  Guarda esta contraseña. Será
                  necesaria para acceder al
                  documento.
                </small>

              </div>

              <div className="security-info">
                🔒 El documento se enviará de
                forma segura y el destinatario
                necesitará la contraseña para
                acceder al archivo.
              </div>

            </section>

            {/* =================================================
                BOTONES
                ================================================= */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
                disabled={sending}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="submit-button"
                disabled={sending}
              >
                {sending
                  ? "Enviando..."
                  : "Enviar documento"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}