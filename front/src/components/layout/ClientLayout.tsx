"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Verificamos si estamos en rutas de autenticación o admin
  const isAuthOrAdmin = pathname.startsWith('/auth') || pathname.startsWith('/admin');

  return (
    <>
      {!isAuthOrAdmin && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isAuthOrAdmin && <Footer />}
    </>
  );
}