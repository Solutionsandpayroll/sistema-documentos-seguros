"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch(
          "/api/usuarios/sesion",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!data.success || !data.usuario) {
          router.replace("/login");
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error(
          "Error verificando la sesión:",
          error
        );

        router.replace("/login");
      }
    };

    verifySession();
  }, [router]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f8fa",
          color: "#555",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Verificando sesión...
      </div>
    );
  }

  return children;
}