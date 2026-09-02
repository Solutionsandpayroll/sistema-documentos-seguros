"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

const estadoStyles = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  aprobado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  entregado: "bg-blue-50 text-blue-700 border-blue-200",
  vencido: "bg-slate-100 text-slate-600 border-slate-200",
  rechazado: "bg-red-50 text-red-700 border-red-200",
};

const estadoIcons = {
  pendiente: "⏳",
  aprobado: "✅",
  entregado: "📬",
  vencido: "⌛",
  rechazado: "✕",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
    });
    return () => unsubAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "documents"),
      where("creadoPor", "==", user.uid),
      orderBy("creadoEn", "desc")
    );

    const unsubDocs = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDocs(items);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setErrorMsg(err.message);
        setLoading(false);
      }
    );

    return () => unsubDocs();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const total = docs.length;
  const pendientes = docs.filter((d) => d.estado === "pendiente").length;
  const aprobados = docs.filter((d) => d.estado === "aprobado" || d.estado === "entregado").length;

  const initials = (user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-sp-dark p-4 sm:p-6">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 px-6 bg-white border border-slate-200 shadow-sm rounded-2xl mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Solutions and Payroll" className="h-10 w-auto" />
          <div>
            <span className="block text-slate-500 text-xs font-medium">
              Document Security System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-sp-red text-white flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm text-slate-600 font-medium">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-slate-500 hover:text-sp-red transition cursor-pointer"
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total enviados</p>
          <p className="text-3xl font-black text-slate-900">{total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pendientes</p>
          <p className="text-3xl font-black text-amber-600">{pendientes}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Aprobados</p>
          <p className="text-3xl font-black text-emerald-600">{aprobados}</p>
        </div>
      </div>

      {/* Contenido */}
      <main className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Mis documentos
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Historial de envios realizados
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/new")}
              className="py-3 px-5 bg-sp-red hover:bg-sp-red-hover text-white font-bold rounded-xl shadow-lg shadow-red-600/25 transition text-sm tracking-wide cursor-pointer uppercase whitespace-nowrap"
            >
              + Nuevo documento
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-sp-red text-red-700 text-sm font-medium">
              Error cargando documentos: {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-slate-500 text-sm">
                Aun no has enviado ningun documento.
              </p>
              <button
                onClick={() => router.push("/dashboard/new")}
                className="mt-4 text-sp-red font-semibold text-sm hover:underline cursor-pointer"
              >
                Enviar mi primer documento
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                      {estadoIcons[doc.estado] || "📄"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {doc.nombreArchivo}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        {doc.empresaNombre} - {doc.contactoNombre} ({doc.contactoEmail})
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full border whitespace-nowrap ${
                      estadoStyles[doc.estado] || estadoStyles.pendiente
                    }`}
                  >
                    {doc.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}