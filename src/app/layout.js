import "./globals.css";

export const metadata = {
  title: "Sistema de Documentos Seguros",
  description: "Gestión segura de documentos con OTP y permisos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}