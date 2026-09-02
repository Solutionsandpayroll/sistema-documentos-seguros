"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          nombre: name,
          email: email,
          rol: "empleado",
          estado: "pendiente",
          creadoEn: new Date().toISOString(),
        });

        alert("Cuenta creada exitosamente. Tu acceso quedara pendiente de aprobacion por un administrador.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      }
    } catch (err) {
      if (err.code === "auth/invalid-credential") {
        setError("Correo o contrasena incorrectos. Si no tienes cuenta, haz clic en Registrarse.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya esta registrado. Intenta iniciar sesion.");
      } else if (err.code === "auth/weak-password") {
        setError("La contrasena debe tener al menos 6 caracteres.");
      } else {
        setError("Ocurrio un error: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-sp-dark flex flex-col justify-between p-4 sm:p-6">
      
      {/* Header Corporativo */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 px-6 bg-white border border-slate-200 shadow-sm rounded-2xl mb-8">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Solutions and Payroll" className="h-10 w-auto" />
          <div>
            <span className="block text-slate-500 text-xs font-medium">
              Document Security System
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistema Activo
        </div>
      </header>

      {/* Formulario de Login */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-sp-red mb-4 border border-red-100">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isRegistering ? "Crear Cuenta" : "Iniciar Sesion"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Ingresa tus credenciales autorizadas
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-sp-red text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Juan Gomez"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-300 focus-sp-input text-slate-900 placeholder-slate-400 text-sm transition font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Correo Electronico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="usuario@solutionsandpayroll.com"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-300 focus-sp-input text-slate-900 placeholder-slate-400 text-sm transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Contrasena
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-300 focus-sp-input text-slate-900 placeholder-slate-400 text-sm transition font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-4 bg-sp-red hover:bg-sp-red-hover text-white font-bold rounded-xl shadow-lg shadow-red-600/25 transition text-sm tracking-wide cursor-pointer uppercase"
            >
              {isRegistering ? "Registrarme" : "Ingresar"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="text-sm font-semibold text-slate-800 hover:text-sp-red transition cursor-pointer"
            >
              {isRegistering ? "Ya tienes una cuenta? Inicia sesion aqui" : "No tienes acceso? Crea tu cuenta aqui"}
            </button>
          </div>

        </div>
      </main>

      <footer className="w-full text-center py-4 text-xs text-slate-500">
        © {new Date().getFullYear()} Solutions & Payroll. Todos los derechos reservados.
      </footer>

    </div>
  );
}