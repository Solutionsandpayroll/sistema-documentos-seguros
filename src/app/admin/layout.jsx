"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const verifyAdminSession = async () => {
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

        const rol = String(
          data.usuario.rol || ""
        )
          .trim()
          .toLowerCase();

        if (rol !== "administrador") {
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error(
          "Error verificando permisos de administrador:",
          error
        );

        router.replace("/login");
      }
    };

    verifyAdminSession();
  }, [router]);

  return children;
}