"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const steps = ["Documento", "Destinatario", "Confirmar"];

export default function NewDocumentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [file, setFile] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const snap = await getDocs(collection(db, "companies"));
        setCompanies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        setError("No se pudieron cargar las empresas: " + err.message);
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    if (!companyId) {
      setContacts([]);
      setContactId("");
      return;
    }
    const loadContacts = async () => {
      setLoadingContacts(true);
      try {
        const q = query(collection(db, "contacts"), where("empresaId", "==", companyId));
        const snap = await getDocs(q);
        setContacts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        setError("No se pudieron cargar los contactos: " + err.message);
      } finally {
        setLoadingContacts(false);
      }
    };
    loadContacts();
  }, [companyId]);

  const selectedCompany = companies.find((c) => c.id === companyId);
  const selectedContact = contacts.find((c) => c.id === contactId);

  const canContinueStep0 = !!file;
  const canContinueStep1 = !!companyId && !!contactId;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const user = auth.currentUser;

      const fileRef = ref(storage, `documents/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      await addDoc(collection(db, "documents"), {
        nombreArchivo: file.name,
        archivoUrl: fileUrl,
        empresaId: companyId,
        empresaNombre: selectedCompany?.nombre || "",
        contactoId: contactId,
        contactoNombre: selectedContact?.nombre || "",
        contactoEmail: selectedContact?.email || "",
        estado: "aprobado",
        creadoPor: user.uid,
        creadoPorEmail: user.email,
        creadoEn: new Date().toISOString(),
      });

      router.push("/dashboard");
    } catch (err) {
      setError("No se pudo enviar el documento: " + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
          Nuevo documento
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Sube un archivo y envialo a un destinatario autorizado
        </p>

        {/* Progreso */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i <= step ? "bg-sp-red text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs font-semibold ${
                  i <= step ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-sp-red text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Paso 0: archivo */}
        {step === 0 && (
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Selecciona el documento
            </label>

            {file ? (
              <div className="flex items-center justify-between gap-3 border-2 border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl shrink-0">📄</span>
                  <span className="text-sm font-semibold text-slate-700 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  aria-label="Quitar archivo"
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-sp-red hover:bg-red-50 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl p-10 cursor-pointer hover:border-sp-red hover:bg-red-50/30 transition">
                <span className="text-3xl">📄</span>
                <span className="text-sm font-semibold text-slate-700">
                  Haz clic para elegir un archivo
                </span>
                <span className="text-xs text-slate-400">PDF, Word, imagenes, etc.</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            )}

            <div className="flex justify-end mt-6">
              <button
                disabled={!canContinueStep0}
                onClick={() => setStep(1)}
                className="py-3 px-6 bg-sp-red hover:bg-sp-red-hover disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-red-600/25 transition text-sm tracking-wide cursor-pointer uppercase"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 1: destinatario */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Empresa
              </label>
              {loadingCompanies ? (
                <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ) : companies.length === 0 ? (
                <p className="text-sm text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  No hay empresas registradas todavia. Pide a un administrador que agregue una.
                </p>
              ) : (
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-300 focus-sp-input text-slate-900 text-sm transition font-medium"
                >
                  <option value="">Selecciona una empresa</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {companyId && (
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Contacto
                </label>
                {loadingContacts ? (
                  <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                ) : contacts.length === 0 ? (
                  <p className="text-sm text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    Esta empresa no tiene contactos autorizados registrados.
                  </p>
                ) : (
                  <select
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-300 focus-sp-input text-slate-900 text-sm transition font-medium"
                  >
                    <option value="">Selecciona un contacto</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {selectedContact && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Correo del destinatario</p>
                <p className="text-sm font-bold text-slate-800">{selectedContact.email}</p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(0)}
                className="py-3 px-6 text-slate-600 font-bold rounded-xl text-sm tracking-wide cursor-pointer hover:bg-slate-50"
              >
                Atras
              </button>
              <button
                disabled={!canContinueStep1}
                onClick={() => setStep(2)}
                className="py-3 px-6 bg-sp-red hover:bg-sp-red-hover disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-red-600/25 transition text-sm tracking-wide cursor-pointer uppercase"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: confirmar */}
        {step === 2 && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              Revisa que la informacion sea correcta antes de enviar.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Archivo</span>
                <span className="text-sm font-semibold text-slate-900">{file?.name}</span>
              </div>
              <div className="flex justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Empresa</span>
                <span className="text-sm font-semibold text-slate-900">{selectedCompany?.nombre}</span>
              </div>
              <div className="flex justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Destinatario</span>
                <span className="text-sm font-semibold text-slate-900">{selectedContact?.nombre}</span>
              </div>
              <div className="flex justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Correo</span>
                <span className="text-sm font-semibold text-slate-900">{selectedContact?.email}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                disabled={submitting}
                className="py-3 px-6 text-slate-600 font-bold rounded-xl text-sm tracking-wide cursor-pointer hover:bg-slate-50 disabled:opacity-50"
              >
                Atras
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="py-3 px-6 bg-sp-red hover:bg-sp-red-hover disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-red-600/25 transition text-sm tracking-wide cursor-pointer uppercase"
              >
                {submitting ? "Enviando..." : "Confirmar y enviar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}