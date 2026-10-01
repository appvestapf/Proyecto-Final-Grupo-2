"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { ChatbotWidget } from "@/components/chat/ChatbotWidget"; // <--- Importas el widget

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthOrAdmin = pathname.startsWith('/auth') || pathname.startsWith('/admin');

  return (
    <>
      {!isAuthOrAdmin && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isAuthOrAdmin && <Footer />}
      {/* <--- Renderizas el widget solo si no es ruta de admin/auth */}
      {!isAuthOrAdmin && <ChatbotWidget />} 
    </>
  );
}