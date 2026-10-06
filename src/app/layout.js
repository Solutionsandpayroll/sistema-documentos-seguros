import "./globals.css";

export const metadata = {
  title: "Portal Documental",
  description: "Portal para la gestión segura de documentos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}