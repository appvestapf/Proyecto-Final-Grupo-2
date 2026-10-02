"use client";
import Sidebar from "@/components/admin/sideBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { role, isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = setTimeout(() => {
      if (!isAuthenticated || role !== "admin") {
        toast.error("Acceso denegado: Debes ser administrador para ver esta página.");
        router.push("/");
      } else {
        setIsChecking(false);
      }
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [isAuthenticated, role, router]);

  if (isChecking) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-(--bg-app) gap-3 text-(--text-muted)">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p>Verificando credenciales...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-(--bg-app) text-(--text-main)">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}