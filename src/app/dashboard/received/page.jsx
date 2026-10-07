"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "../documents/documents.css";
import "./received.css";

export default function ReceivedDocumentsPage() {
  const [currentUser, setCurrentUser] = useState({
    name: "Administrador",
    role: "Administrador",
  });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(
        "docuportal_current_user"
      );

      if (savedUser) {
        const user = JSON.parse(savedUser);

        setCurrentUser({
          name:
            user.name ||
            user.nombre ||
            "Administrador",
          role:
            user.role ||
            user.rol ||
            "Administrador",
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch(
          "/api/documentos",
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (Array.isArray(data)) {
          setDocuments(
            data.filter(
              (document) =>
                document.estado?.toLowerCase() ===
                "recibido"
            )
          );
        }
      } catch (error) {
        console.error(
          "Error cargando recibidos:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const getInitials = (name) => {
    if (!name) return "AD";

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

  const getFileType = (name) => {
    if (!name) return "FILE";

    const parts = name.split(".");

    return parts.length > 1
      ? parts[
          parts.length - 1
        ].toUpperCase()
      : "FILE";
  };

  const getFileClass = (name) => {
    const extension =
      name
        ?.split(".")
        .pop()
        ?.toLowerCase();

    if (extension === "pdf") return "pdf";

    if (
      extension === "xlsx" ||
      extension === "xls"
    ) {
      return "excel";
    }

    if (
      extension === "doc" ||
      extension === "docx"
    ) {
      return "word";
    }

    return "file";
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredDocuments =
    documents.filter((document) => {
      const text =
        search.toLowerCase();

      return (
        document.nombre_archivo
          ?.toLowerCase()
          .includes(text) ||
        document.empresa
          ?.toLowerCase()
          .includes(text) ||
        document.empleado
          ?.toLowerCase()
          .includes(text) ||
        document.destinatario
          ?.toLowerCase()
          .includes(text)
      );
    });

  const userInitials =
    getInitials(currentUser.name);

  return (
    <div className="documents-layout">

      <aside className="documents-sidebar">

        <div className="documents-sidebar-brand">

          <div className="documents-brand-logo">
            D
          </div>

          <div>
            <h2>DocuPortal</h2>
            <span>
              Portal documental
            </span>
          </div>

        </div>

        <nav className="documents-sidebar-navigation">

          <div className="documents-navigation-section">
            PRINCIPAL
          </div>

          <Link
            href="/dashboard"
            className="documents-navigation-item"
          >
            ⌂ <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/documents"
            className="documents-navigation-item"
          >
            ▤ <span>Documentos</span>
          </Link>

          <Link
            href="/dashboard/sent"
            className="documents-navigation-item"
          >
            ↗ <span>Enviados</span>
          </Link>

          <Link
            href="/dashboard/received"
            className="documents-navigation-item active"
          >
            ↙ <span>Recibidos</span>
          </Link>

          <Link
            href="/dashboard/tickets"
            className="documents-navigation-item"
          >
            □ <span>Tickets</span>
          </Link>

          <div className="documents-navigation-section documents-second-section">
            GESTIÓN
          </div>

          <Link
            href="/dashboard/history"
            className="documents-navigation-item"
          >
            ◷ <span>Historial</span>
          </Link>

          {currentUser.role ===
            "Administrador" && (
            <Link
              href="/admin"
              className="documents-navigation-item"
            >
              ⚙ <span>Administración</span>
            </Link>
          )}

        </nav>

        <div className="documents-sidebar-footer">

          <div className="documents-sidebar-user">

            <div className="documents-user-avatar">
              {userInitials}
            </div>

            <div className="documents-sidebar-user-data">

              <strong>
                {currentUser.name}
              </strong>

              <span>
                {currentUser.role}
              </span>

            </div>

          </div>

          <button
            className="documents-logout-button"
            onClick={() => {
              localStorage.removeItem(
                "docuportal_current_user"
              );

              window.location.href =
                "/login";
            }}
          >
            ↪ Cerrar sesión
          </button>

        </div>

      </aside>

      <main className="documents-main">

        <header className="documents-top-header">

          <div>

            <span>
              PORTAL DOCUMENTAL
            </span>

            <h1>
              Documentos recibidos
            </h1>

          </div>

          <div className="documents-header-user">

            <div className="documents-header-avatar">
              {userInitials}
            </div>

            <div>

              <strong>
                {currentUser.name}
              </strong>

              <span>
                {currentUser.role}
              </span>

            </div>

          </div>

        </header>

        <div className="documents-page-content">

          <section className="documents-intro">

            <div>

              <span className="page-eyebrow">
                DOCUMENTOS RECIBIDOS
              </span>

              <h2>
                Recibidos
              </h2>

              <p>
                Consulta los documentos que
                han sido recibidos en el sistema.
              </p>

            </div>

          </section>

          <section className="documents-filters">

            <div className="search-container">

              <span className="search-icon">
                🔎
              </span>

              <input
                type="text"
                placeholder="Buscar documento, empresa o empleado..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

          </section>

          <section className="documents-table-card">

            <div className="table-header">

              <div>

                <span>
                  LISTADO
                </span>

                <h2>
                  Documentos recibidos
                </h2>

              </div>

              <span className="results-count">
                {filteredDocuments.length}{" "}
                documento
                {filteredDocuments.length !==
                1
                  ? "s"
                  : ""}
              </span>

            </div>

            {loading ? (
              <div className="documents-empty">

                <div className="loading-icon">
                  ⏳
                </div>

                <h3>
                  Cargando documentos...
                </h3>

              </div>
            ) : filteredDocuments.length ===
              0 ? (
              <div className="documents-empty">

                <div className="empty-icon">
                  📥
                </div>

                <h3>
                  No hay documentos recibidos
                </h3>

                <p>
                  Los documentos recibidos
                  aparecerán aquí.
                </p>

              </div>
            ) : (
              <div className="table-wrapper">

                <table className="documents-table">

                  <thead>

                    <tr>

                      <th>
                        DOCUMENTO
                      </th>

                      <th>
                        EMPRESA
                      </th>

                      <th>
                        EMPLEADO
                      </th>

                      <th>
                        DESTINATARIO
                      </th>

                      <th>
                        FECHA
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredDocuments.map(
                      (document) => (

                        <tr
                          key={
                            document.id
                          }
                        >

                          <td>

                            <div className="document-cell">

                              <div
                                className={`file-icon ${getFileClass(
                                  document.nombre_archivo
                                )}`}
                              >
                                {getFileType(
                                  document.nombre_archivo
                                )}
                              </div>

                              <div>

                                <strong>
                                  {
                                    document.nombre_archivo
                                  }
                                </strong>

                                <span>
                                  DOC-
                                  {String(
                                    document.id
                                  ).padStart(
                                    3,
                                    "0"
                                  )}
                                </span>

                              </div>

                            </div>

                          </td>

                          <td>

                            <span className="company-name">
                              {document.empresa ||
                                "Sin empresa"}
                            </span>

                          </td>

                          <td>

                            <div className="person-cell">

                              <strong>
                                {document.empleado ||
                                  "Sin empleado"}
                              </strong>

                            </div>

                          </td>

                          <td>

                            <div className="person-cell">

                              <strong>
                                {document.destinatario ||
                                  "Sin usuario"}
                              </strong>

                              <span>
                                {document.correo ||
                                  "Sin correo"}
                              </span>

                            </div>

                          </td>

                          <td>

                            <span className="document-date">
                              {formatDate(
                                document.creado_en
                              )}
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </section>

        </div>

      </main>

    </div>
  );
}