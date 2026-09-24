"use client";
import Sidebar from "@/components/admin/sideBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner"; // Importamos la librería de notificaciones
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { role, isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Le damos 100ms a Zustand para que lea el localStorage y evite falsos positivos
    const checkAuth = setTimeout(() => {
      if (!isAuthenticated || role !== "admin") {
        toast.error("Acceso denegado: Debes ser administrador para ver esta página.");
        router.push("/");
      } else {
        setIsChecking(false); // Si es admin, quitamos el candado
      }
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [isAuthenticated, role, router]);

  // Mientras verifica, mostramos una pantalla de carga vacía (evita el parpadeo de la vista real)
  if (isChecking) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100 gap-3 text-slate-500">
        <Loader2 className="animate-spin" size={32} />
        <p>Verificando credenciales...</p>
      </div>
    );
  }

  // Solo si isChecking es false, dibuja el panel
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}