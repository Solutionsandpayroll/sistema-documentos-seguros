"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({
  children = "Cerrar sesión",
  className = "",
}) {
  const router = useRouter();

  const handleLogout = () => {
    try {
      const currentUserData = localStorage.getItem("docuportal_current_user");

      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);

        const historyData =
          localStorage.getItem("docuportal_history");

        const history = historyData
          ? JSON.parse(historyData)
          : [];

        const newHistory = {
          id: `HIS-${Date.now()}`,
          action: "Cierre de sesión",
          type: "Usuario",
          element: currentUser.name || "Usuario",
          user: currentUser.name || "Usuario",
          date: new Date().toLocaleString("es-CO"),
          status: "Completado",
          details: `El usuario ${currentUser.name || "Usuario"} cerró sesión.`,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(
          "docuportal_history",
          JSON.stringify([newHistory, ...history])
        );
      }
    } catch (error) {
      console.error("Error registrando cierre de sesión:", error);
    }

    localStorage.removeItem("docuportal_current_user");

    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className}
    >
      {children}
    </button>
  );
}