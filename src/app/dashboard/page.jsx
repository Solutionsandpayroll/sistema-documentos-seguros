"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardPage() {
  // ============================================================
  // USUARIO ACTUAL
  // ============================================================

  const [currentUser, setCurrentUser] = useState({
    name: "Greylin Martínez",
    role: "Usuario",
  });

  // ============================================================
  // CARGAR USUARIO DE LA SESIÓN
  // ============================================================

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(
        "docuportal_current_user"
      );

      if (savedUser) {
        const user = JSON.parse(savedUser);

        setCurrentUser({
          name: user.name || "Usuario",
          role: user.role || "Usuario",
        });
      }
    } catch (error) {
      console.error(
        "Error cargando el usuario actual:",
        error
      );
    }
  }, []);

  // ============================================================
  // DATOS DE PRUEBA
  // ============================================================

  const recentDocuments = [
    {
      id: "DOC-006",
      name: "Solicitud de autorización.pdf",
      type: "PDF",
      date: "01 Oct 2026",
      status: "Pendiente",
    },
    {
      id: "DOC-005",
      name: "Política de tratamiento de datos.pdf",
      type: "PDF",
      date: "02 Oct 2026",
      status: "Recibido",
    },
    {
      id: "DOC-004",
      name: "Certificación laboral.pdf",
      type: "PDF",
      date: "03 Oct 2026",
      status: "Pendiente",
    },
    {
      id: "DOC-003",
      name: "Soporte de nómina septiembre.xlsx",
      type: "XLSX",
      date: "04 Oct 2026",
      status: "Enviado",
    },
  ];

  const pendingTickets = [
    {
      id: "TCK-001",
      title: "Solicitud de acceso a documento",
      date: "06 Oct 2026",
      priority: "Alta",
    },
    {
      id: "TCK-002",
      title: "Documento pendiente de revisión",
      date: "05 Oct 2026",
      priority: "Media",
    },
    {
      id: "TCK-003",
      title: "Actualización de información",
      date: "04 Oct 2026",
      priority: "Baja",
    },
  ];

  // ============================================================
  // OBTENER INICIALES DEL USUARIO
  // ============================================================

  const getInitials = (name) => {
    if (!name) {
      return "US";
    }

    const words = name
      .trim()
      .split(" ")
      .filter(Boolean);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (
      words[0][0] + words[words.length - 1][0]
    ).toUpperCase();
  };

  // ============================================================
  // FUNCIÓN PARA OBTENER CLASE DEL ESTADO
  // ============================================================

  const getStatusClass = (status) => {
    if (status === "Enviado") {
      return "blue";
    }

    if (status === "Recibido") {
      return "green";
    }

    return "orange";
  };

  // ============================================================
  // FUNCIÓN PARA PRIORIDAD DE TICKETS
  // ============================================================

  const getPriorityClass = (priority) => {
    if (priority === "Alta") {
      return "high";
    }

    if (priority === "Media") {
      return "medium";
    }

    return "low";
  };

  const userInitials = getInitials(currentUser.name);

  return (
    <div className="dashboard-layout">

      {/* ========================================================
          MENÚ LATERAL
      ========================================================= */}

      <aside className="sidebar">

        {/* LOGO */}

        <div className="sidebar-brand">

          <div className="brand-logo">
            D
          </div>

          <div>
            <h2>DocuPortal</h2>

            <span>
              Portal documental
            </span>
          </div>

        </div>


        {/* NAVEGACIÓN */}

        <nav className="sidebar-navigation">

          <div className="navigation-section">
            PRINCIPAL
          </div>


          {/* DASHBOARD */}

          <Link
            href="/dashboard"
            className="navigation-item active"
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
            className="navigation-item"
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
            className="navigation-item"
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
            className="navigation-item"
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
            className="navigation-item"
          >
            <span className="navigation-icon">
              □
            </span>

            <span>
              Tickets
            </span>
          </Link>


          {/* SECCIÓN GESTIÓN */}

          <div className="navigation-section second-section">
            GESTIÓN
          </div>


          {/* HISTORIAL */}

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


          {/* ADMINISTRACIÓN */}

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


          {/* CERRAR SESIÓN */}

          <LogoutButton className="logout-link">

            <span>
              ↪
            </span>

            Cerrar sesión

          </LogoutButton>

        </div>

      </aside>


      {/* ========================================================
          CONTENIDO PRINCIPAL
      ========================================================= */}

      <main className="dashboard-main">

        {/* ======================================================
            ENCABEZADO
        ======================================================= */}

        <header className="dashboard-header">

          <div className="header-title">

            <span>
              PORTAL DOCUMENTAL
            </span>

            <h1>
              Dashboard
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


        {/* ======================================================
            CONTENIDO
        ======================================================= */}

        <div className="dashboard-content">


          {/* ====================================================
              BIENVENIDA
          ===================================================== */}

          <section className="welcome-card">

            <div className="welcome-content">

              <span className="welcome-eyebrow">
                BIENVENIDA
              </span>

              <h2>
                Hola, {currentUser.name.split(" ")[0]} 👋
              </h2>

              <p>
                Bienvenida a tu portal documental.
                Desde aquí puedes consultar tus documentos,
                revisar pendientes y realizar seguimiento
                a tus solicitudes.
              </p>

            </div>


            <div className="welcome-action">

              <Link
                href="/dashboard/new"
                className="primary-button"
              >
                <span>
                  +
                </span>

                Nuevo documento
              </Link>

            </div>

          </section>


          {/* ====================================================
              INDICADORES
          ===================================================== */}

          <section className="stats-grid">


            {/* DOCUMENTOS ENVIADOS */}

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon blue">
                  ↗
                </div>

                <span className="stat-label">
                  Documentos enviados
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  24
                </strong>

                <span className="stat-description">
                  Este mes
                </span>

              </div>

            </article>


            {/* DOCUMENTOS RECIBIDOS */}

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon green">
                  ↙
                </div>

                <span className="stat-label">
                  Documentos recibidos
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  18
                </strong>

                <span className="stat-description">
                  Este mes
                </span>

              </div>

            </article>


            {/* TICKETS */}

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon orange">
                  ◷
                </div>

                <span className="stat-label">
                  Tickets pendientes
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  3
                </strong>

                <span className="stat-description">
                  Requieren atención
                </span>

              </div>

            </article>


            {/* TOTAL DOCUMENTOS */}

            <article className="stat-card">

              <div className="stat-card-top">

                <div className="stat-icon purple">
                  ▤
                </div>

                <span className="stat-label">
                  Total documentos
                </span>

              </div>

              <div className="stat-card-bottom">

                <strong>
                  42
                </strong>

                <span className="stat-description">
                  En el sistema
                </span>

              </div>

            </article>

          </section>


          {/* ====================================================
              CONTENIDO INFERIOR
          ===================================================== */}

          <section className="dashboard-columns">


            {/* ==================================================
                DOCUMENTOS RECIENTES
            =================================================== */}

            <div className="content-card">

              <div className="content-card-header">

                <div>

                  <span>
                    ACTIVIDAD RECIENTE
                  </span>

                  <h2>
                    Documentos recientes
                  </h2>

                </div>


                <Link
                  href="/dashboard/documents"
                  className="view-all-link"
                >
                  Ver todos
                </Link>

              </div>


              <div className="documents-list">

                {recentDocuments.map((document) => (

                  <div
                    key={document.id}
                    className="recent-document"
                  >

                    {/* TIPO */}

                    <div
                      className={`document-type ${document.type.toLowerCase()}`}
                    >
                      {document.type}
                    </div>


                    {/* INFORMACIÓN */}

                    <div className="recent-document-info">

                      <strong>
                        {document.name}
                      </strong>

                      <span>
                        {document.id} · {document.date}
                      </span>

                    </div>


                    {/* ESTADO */}

                    <span
                      className={`status-badge ${getStatusClass(
                        document.status
                      )}`}
                    >

                      <span className="status-dot"></span>

                      {document.status}

                    </span>

                  </div>

                ))}

              </div>

            </div>


            {/* ==================================================
                TICKETS PENDIENTES
            =================================================== */}

            <div className="content-card">

              <div className="content-card-header">

                <div>

                  <span>
                    SEGUIMIENTO
                  </span>

                  <h2>
                    Tickets pendientes
                  </h2>

                </div>


                <Link
                  href="/dashboard/tickets"
                  className="view-all-link"
                >
                  Ver todos
                </Link>

              </div>


              <div className="tickets-list">

                {pendingTickets.map((ticket) => (

                  <div
                    key={ticket.id}
                    className="ticket-item"
                  >

                    {/* ICONO */}

                    <div className="ticket-icon">
                      □
                    </div>


                    {/* INFORMACIÓN */}

                    <div className="ticket-info">

                      <strong>
                        {ticket.title}
                      </strong>

                      <span>
                        {ticket.id} · {ticket.date}
                      </span>

                    </div>


                    {/* PRIORIDAD */}

                    <span
                      className={`ticket-priority ${getPriorityClass(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>

                  </div>

                ))}

              </div>


              {/* BOTÓN */}

              <div className="ticket-footer">

                <Link
                  href="/dashboard/tickets"
                  className="secondary-button"
                >
                  Ver tickets
                </Link>

              </div>

            </div>

          </section>


          {/* ====================================================
              ACCESO RÁPIDO
          ===================================================== */}

          <section className="quick-actions">

            <div className="quick-actions-header">

              <span>
                ACCIONES RÁPIDAS
              </span>

              <h2>
                ¿Qué deseas hacer?
              </h2>

            </div>


            <div className="quick-actions-grid">


              {/* NUEVO DOCUMENTO */}

              <Link
                href="/dashboard/new"
                className="quick-action"
              >

                <div className="quick-action-icon blue">
                  +
                </div>

                <div>

                  <strong>
                    Nuevo documento
                  </strong>

                  <span>
                    Cargar y enviar un documento
                  </span>

                </div>

                <span className="quick-action-arrow">
                  →
                </span>

              </Link>


              {/* CONSULTAR DOCUMENTOS */}

              <Link
                href="/dashboard/documents"
                className="quick-action"
              >

                <div className="quick-action-icon green">
                  ▤
                </div>

                <div>

                  <strong>
                    Consultar documentos
                  </strong>

                  <span>
                    Ver todos tus documentos
                  </span>

                </div>

                <span className="quick-action-arrow">
                  →
                </span>

              </Link>


              {/* TICKETS */}

              <Link
                href="/dashboard/tickets"
                className="quick-action"
              >

                <div className="quick-action-icon orange">
                  □
                </div>

                <div>

                  <strong>
                    Gestionar tickets
                  </strong>

                  <span>
                    Revisar solicitudes pendientes
                  </span>

                </div>

                <span className="quick-action-arrow">
                  →
                </span>

              </Link>

            </div>

          </section>


          {/* AVISO DE DEMOSTRACIÓN */}

          <p className="dashboard-demo-notice">
            Información de demostración: los datos mostrados
            actualmente son ejemplos y serán reemplazados
            posteriormente por información real.
          </p>

        </div>

      </main>

    </div>
  );
}