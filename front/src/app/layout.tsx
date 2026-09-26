import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} font-sans min-h-screen flex flex-col antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientLayout>
            {children}
          </ClientLayout>
          
          <Toaster 
            richColors 
            position="bottom-center"
            visibleToasts={1} 
            duration={2000}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}