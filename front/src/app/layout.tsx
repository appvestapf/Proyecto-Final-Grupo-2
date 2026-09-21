import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";
import Navbar from "../components/navbar/navbar";
import Footer from "../components/footer/footer";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontDisplay = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vesta | Plataforma Inmobiliaria",
  description: "Catálogo global de alquileres permanentes y temporarios en Latam. Explora propiedades, agenda visitas o reserva online sin intermediarios.",
};

export default function RootLayout({ children }: { children: React.ReactNode;}) {
  return (
    <html lang="es">
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} font-sans min-h-screen flex flex-col antialiased text-slate-900`}
      >
        <Navbar />
        {children}
        <Footer />
        <Toaster richColors position="bottom-center" />
      </body>
    </html>
  );
}