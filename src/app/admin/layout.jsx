"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const currentUserData = localStorage.getItem("docuportal_current_user");

    if (!currentUserData) {
      router.replace("/login");
      return;
    }

    try {
      const currentUser = JSON.parse(currentUserData);

      if (currentUser.role !== "Administrador") {
        router.replace("/dashboard");
        return;
      }

      setChecking(false);
    } catch (error) {
      console.error("Error leyendo la sesión:", error);
      localStorage.removeItem("docuportal_current_user");
      router.replace("/login");
    }
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
        Verificando permisos...
      </div>
    );
  }

  return children;
}