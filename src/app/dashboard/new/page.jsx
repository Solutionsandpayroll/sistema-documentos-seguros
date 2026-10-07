"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import "./new.css";

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
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return `${parseFloat(
    (bytes / Math.pow(1024, i)).toFixed(2)
  )} ${sizes[i]}`;
}

function getFileType(fileName) {
  const extension = fileName
    .split(".")
    .pop()
    .toUpperCase();

  return extension;
}

function generatePassword() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let password = "";

  for (let i = 0; i < 10; i++) {
    password += characters.charAt(
      Math.floor(
        Math.random() * characters.length
      )
    );
  }

  return password;
}

export default function NewDocumentPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [currentUser, setCurrentUser] =
    useState(null);

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

  const [
    selectedRecipient,
    setSelectedRecipient,
  ] = useState("");

  const [password, setPassword] =
    useState("");

  const [
    loadingCompanies,
    setLoadingCompanies,
  ] = useState(true);

  const [
    loadingRecipients,
    setLoadingRecipients,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [dragActive, setDragActive] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // CARGAR USUARIO ACTUAL
  // ==========================================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem(
        "docuportal_current_user"
      );

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user =
        JSON.parse(storedUser);

      setCurrentUser(user);
    } catch (error) {
      console.error(
        "Error leyendo usuario:",
        error
      );

      router.replace("/login");
    }
  }, [router]);

  // ==========================================================
  // CARGAR EMPRESAS
  // ==========================================================

  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoadingCompanies(true);

        const response = await fetch(
          "/api/empresas"
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "No se pudieron cargar las empresas."
          );
        }

        setCompanies(data);
      } catch (error) {
        console.error(error);

        setError(
          "No fue posible cargar las empresas."
        );
      } finally {
        setLoadingCompanies(false);
      }
    }

    loadCompanies();
  }, []);

  // ==========================================================
  // CARGAR DESTINATARIOS
  // ==========================================================

  useEffect(() => {
    async function loadRecipients() {
      if (!selectedCompany) {
        setRecipients([]);
        setSelectedRecipient("");
        return;
      }

      try {
        setLoadingRecipients(true);
        setSelectedRecipient("");

        const response = await fetch(
          "/api/destinatarios"
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "No se pudieron cargar los destinatarios."
          );
        }

        const filteredRecipients =
          data.filter(
            (recipient) =>
              Number(
                recipient.empresa_id
              ) ===
                Number(
                  selectedCompany
                ) &&
              recipient.activo === true
          );

        setRecipients(
          filteredRecipients
        );
      } catch (error) {
        console.error(error);

        setRecipients([]);

        setError(
          "No fue posible cargar los destinatarios."
        );
      } finally {
        setLoadingRecipients(false);
      }
    }

    loadRecipients();
  }, [selectedCompany]);

  // ==========================================================
  // ARCHIVO
  // ==========================================================

  function processFile(file) {
    setError("");
    setMessage("");

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "El tipo de archivo no está permitido. Puedes usar PDF, Word, Excel, JPG o PNG."
      );

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "El archivo no puede superar los 10 MB."
      );

      return;
    }

    setSelectedFile(file);

    if (!documentName) {
      setDocumentName(file.name);
    }

    setDocumentType(
      getFileType(file.name)
    );
  }

  function handleFileChange(event) {
    const file =
      event.target.files?.[0];

    if (file) {
      processFile(file);
    }
  }

  function handleDrop(event) {
    event.preventDefault();

    setDragActive(false);

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      processFile(file);
    }
  }

  // ==========================================================
  // GENERAR CONTRASEÑA
  // ==========================================================

  function handleGeneratePassword() {
    setPassword(
      generatePassword()
    );
  }

  // ==========================================================
  // ENVIAR DOCUMENTO
  // ==========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!currentUser?.id) {
      setError(
        "No se encontró el usuario actual."
      );

      return;
    }

    if (!documentName.trim()) {
      setError(
        "Ingresa el nombre del documento."
      );

      return;
    }

    if (!selectedFile) {
      setError(
        "Selecciona un archivo."
      );

      return;
    }

    if (!selectedCompany) {
      setError(
        "Selecciona una empresa."
      );

      return;
    }

    if (!selectedRecipient) {
      setError(
        "Selecciona un destinatario."
      );

      return;
    }

    if (!password) {
      setError(
        "Genera una contraseña para el documento."
      );

      return;
    }

    try {
      setSending(true);

      // ==========================================
      // 1. SUBIR ARCHIVO
      // ==========================================

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const uploadResponse =
        await fetch(
          "/api/documentos/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const uploadData =
        await uploadResponse.json();

      if (
        !uploadResponse.ok ||
        !uploadData.success
      ) {
        throw new Error(
          uploadData.message ||
            "No se pudo guardar físicamente el archivo."
        );
      }

      const rutaArchivo =
        uploadData.archivo
          .ruta_archivo;

      // ==========================================
      // 2. REGISTRAR EN NEON
      // ==========================================

      const response =
        await fetch(
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
                Number(
                  currentUser.id
                ),

              empresa_id:
                Number(
                  selectedCompany
                ),

              destinatario_id:
                Number(
                  selectedRecipient
                ),

              contrasena:
                password,

              estado: "enviado",
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "No se pudo registrar el documento."
        );
      }

      // ==========================================
      // 3. ÉXITO
      // ==========================================

      setMessage(
        "Documento registrado correctamente."
      );

      alert(
        `Documento registrado correctamente.\n\nContraseña del documento: ${password}`
      );

      router.push(
        "/dashboard/documents"
      );
    } catch (error) {
      console.error(
        "Error al registrar documento:",
        error
      );

      setError(
        error.message ||
          "Ocurrió un error al registrar el documento."
      );
    } finally {
      setSending(false);
    }
  }

  // ==========================================================
  // CANCELAR
  // ==========================================================

  function handleCancel() {
    router.push(
      "/dashboard/documents"
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="new-document-page">

      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <aside className="new-document-sidebar">

        {/* LOGO */}

        <div className="new-document-brand">
          <div className="new-document-brand-icon">
            D
          </div>

          <span>
            DOCUPORTAL
          </span>
        </div>

        {/* NAVEGACIÓN */}

        <nav className="new-document-navigation">

          <Link
            href="/dashboard"
            className="new-document-nav-item"
          >
            <span className="new-document-nav-icon">
              ⌂
            </span>

            Dashboard
          </Link>

          <Link
            href="/dashboard/documents"
            className="new-document-nav-item active"
          >
            <span className="new-document-nav-icon">
              ▤
            </span>

            Documentos
          </Link>

          <Link
            href="/dashboard/sent"
            className="new-document-nav-item"
          >
            <span className="new-document-nav-icon">
              ↗
            </span>

            Enviados
          </Link>

          <Link
            href="/dashboard/received"
            className="new-document-nav-item"
          >
            <span className="new-document-nav-icon">
              ↙
            </span>

            Recibidos
          </Link>

          <Link
            href="/dashboard/tickets"
            className="new-document-nav-item"
          >
            <span className="new-document-nav-icon">
              □
            </span>

            Tickets
          </Link>

          <div className="new-document-nav-separator" />

          <Link
            href="/dashboard/history"
            className="new-document-nav-item"
          >
            <span className="new-document-nav-icon">
              ◷
            </span>

            Historial
          </Link>

          <Link
            href="/admin"
            className="new-document-nav-item"
          >
            <span className="new-document-nav-icon">
              ⚙
            </span>

            Administración
          </Link>

        </nav>

        {/* LOGOUT */}

        <div className="new-document-sidebar-footer">
          <LogoutButton />
        </div>

      </aside>

      {/* ====================================================
          CONTENIDO PRINCIPAL
      ==================================================== */}

      <main className="new-document-main">

        <div className="new-document-content">

          {/* HEADER */}

          <header className="new-document-header">

            <div className="new-document-header-left">

              <h1>
                Nuevo documento
              </h1>

              <p>
                Registra y envía un documento
                de forma segura.
              </p>

            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="new-document-back-button"
            >
              ← Volver a documentos
            </button>

          </header>

          {/* MENSAJES */}

          {error && (
            <div className="new-document-alert error">

              <span className="alert-icon">
                !
              </span>

              <div>

                <strong>
                  No se pudo completar la acción
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>
          )}

          {message && (
            <div className="new-document-alert success">

              <span className="alert-icon">
                ✓
              </span>

              <div>

                <strong>
                  Documento registrado
                </strong>

                <p>
                  {message}
                </p>

              </div>

            </div>
          )}

          {/* FORMULARIO */}

          <form
            onSubmit={handleSubmit}
            className="new-document-form"
          >

            {/* ==================================================
                INFORMACIÓN
            ================================================== */}

            <section className="new-document-card">

              <div className="new-document-card-header">

                <div className="section-number">
                  01
                </div>

                <div>

                  <h2>
                    Información del documento
                  </h2>

                  <p>
                    Ingresa los datos básicos del
                    documento.
                  </p>

                </div>

              </div>

              <div className="new-document-grid">

                <div className="new-document-field">

                  <label>
                    Nombre del documento
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) =>
                      setDocumentName(
                        e.target.value
                      )
                    }
                    placeholder="Ej. Contrato laboral"
                  />

                </div>

                <div className="new-document-field">

                  <label>
                    Tipo de documento
                  </label>

                  <input
                    type="text"
                    value={documentType}
                    readOnly
                    placeholder="Se detectará automáticamente"
                    className="readonly-field"
                  />

                </div>

              </div>

              <div className="new-document-field full">

                <label>
                  Descripción
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Agrega una descripción opcional del documento"
                  rows={4}
                />

              </div>

            </section>

            {/* ==================================================
                ARCHIVO
            ================================================== */}

            <section className="new-document-card">

              <div className="new-document-card-header">

                <div className="section-number">
                  02
                </div>

                <div>

                  <h2>
                    Archivo
                  </h2>

                  <p>
                    Selecciona el archivo que
                    deseas enviar.
                  </p>

                </div>

              </div>

              <div
                className={`new-document-upload ${
                  dragActive
                    ? "drag-active"
                    : ""
                } ${
                  selectedFile
                    ? "has-file"
                    : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() =>
                  setDragActive(false)
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <div className="upload-icon">
                  {selectedFile
                    ? "✓"
                    : "↑"}
                </div>

                {selectedFile ? (
                  <>
                    <h3>
                      {selectedFile.name}
                    </h3>

                    <p>
                      {formatFileSize(
                        selectedFile.size
                      )}
                    </p>

                    <span className="upload-change">
                      Haz clic para cambiar el
                      archivo
                    </span>
                  </>
                ) : (
                  <>
                    <h3>
                      Selecciona o arrastra un
                      archivo aquí
                    </h3>

                    <p>
                      PDF, Word, Excel, JPG o PNG
                    </p>

                    <span>
                      Tamaño máximo: 10 MB
                    </span>
                  </>
                )}

              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden-file-input"
              />

            </section>

            {/* ==================================================
                DESTINO
            ================================================== */}

            <section className="new-document-card">

              <div className="new-document-card-header">

                <div className="section-number">
                  03
                </div>

                <div>

                  <h2>
                    Destino
                  </h2>

                  <p>
                    Selecciona la empresa y el
                    usuario autorizado.
                  </p>

                </div>

              </div>

              <div className="new-document-grid">

                <div className="new-document-field">

                  <label>
                    Empresa
                    <span>*</span>
                  </label>

                  <select
                    value={selectedCompany}
                    onChange={(e) =>
                      setSelectedCompany(
                        e.target.value
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
                          key={company.id}
                          value={company.id}
                        >
                          {company.nombre}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="new-document-field">

                  <label>
                    Usuario autorizado
                    <span>*</span>
                  </label>

                  <select
                    value={
                      selectedRecipient
                    }
                    onChange={(e) =>
                      setSelectedRecipient(
                        e.target.value
                      )
                    }
                    disabled={
                      !selectedCompany ||
                      loadingRecipients
                    }
                  >

                    <option value="">
                      {!selectedCompany
                        ? "Primero selecciona una empresa"
                        : loadingRecipients
                        ? "Cargando usuarios..."
                        : recipients.length ===
                          0
                        ? "No hay usuarios autorizados"
                        : "Selecciona un usuario"}
                    </option>

                    {recipients.map(
                      (recipient) => (
                        <option
                          key={recipient.id}
                          value={recipient.id}
                        >
                          {recipient.nombre} —{" "}
                          {recipient.correo}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {selectedRecipient && (
                <div className="recipient-info">

                  <div className="recipient-info-icon">
                    ✓
                  </div>

                  <div>

                    <strong>
                      Usuario autorizado
                    </strong>

                    <p>
                      El documento será enviado al
                      usuario seleccionado.
                    </p>

                  </div>

                </div>
              )}

            </section>

            {/* ==================================================
                SEGURIDAD
            ================================================== */}

            <section className="new-document-card security-card">

              <div className="new-document-card-header">

                <div className="section-number">
                  04
                </div>

                <div>

                  <h2>
                    Seguridad
                  </h2>

                  <p>
                    Protege el acceso al documento
                    con una contraseña única.
                  </p>

                </div>

              </div>

              <div className="security-content">

                <div className="security-description">

                  <div className="security-icon">
                    🔐
                  </div>

                  <div>

                    <strong>
                      Contraseña del documento
                    </strong>

                    <p>
                      Esta contraseña será exclusiva
                      para este archivo y deberá
                      utilizarse para acceder a él.
                    </p>

                  </div>

                </div>

                <div className="password-row">

                  <input
                    type="text"
                    value={password}
                    readOnly
                    placeholder="Genera una contraseña segura"
                    className={
                      password
                        ? "password-generated"
                        : ""
                    }
                  />

                  <button
                    type="button"
                    onClick={
                      handleGeneratePassword
                    }
                    className="generate-password-button"
                  >
                    {password
                      ? "Generar otra"
                      : "Generar contraseña"}
                  </button>

                </div>

                {password && (
                  <div className="password-notice">

                    <span>
                      ✓
                    </span>

                    Contraseña generada. Recuerda
                    conservarla para compartirla
                    con el usuario autorizado.

                  </div>
                )}

              </div>

            </section>

            {/* ==================================================
                ACCIONES
            ================================================== */}

            <div className="new-document-actions">

              <button
                type="button"
                onClick={handleCancel}
                disabled={sending}
                className="cancel-button"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={sending}
                className="submit-button"
              >

                {sending ? (
                  <>
                    <span className="button-spinner" />
                    Registrando...
                  </>
                ) : (
                  <>
                    Enviar documento
                    <span>→</span>
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}