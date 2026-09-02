"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const navItems = [
  { href: "/dashboard", label: "Mis documentos", icon: "📄" },
  { href: "/dashboard/new", label: "Nuevo documento", icon: "➕" },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const initials = (user?.email || "?").slice(0, 2).toUpperCase();

  if (checking) {
    return (
      <div className="min-h-screen bg-sp-dark flex items-center justify-center">
        <p className="text-slate-400 text-sm">Verificando sesion...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sp-dark flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
          <img src="/logo.jpeg" alt="Solutions and Payroll" className="h-9 w-auto" />
          <p className="text-slate-400 text-xs font-medium mt-2">
            Document Security System
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  active
                    ? "bg-red-50 text-sp-red"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-sp-red text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <p className="text-slate-700 text-xs font-semibold truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-sp-red transition cursor-pointer"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</div>
    </div>
  );
}