import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar/navbar";
import Footer from "../components/footer/footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vesta",
  description: "Catálogo global de alquileres permanentes y temporarios en Latam. Explora propiedades, agenda visitas o reserva online sin intermediarios. ¡Tu hogar ideal está aquí!",
};

export default function RootLayout({ children }: { children: React.ReactNode;}) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased bg-slate-50 text-slate-900`}
      >

            <>
                <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
                    <Navbar />
                    {children}
                    <Footer />
                        
                </main>     
            </>
      </body>
    </html>
  );
}
