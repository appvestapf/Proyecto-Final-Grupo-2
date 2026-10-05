"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { userService } from "@/services/userService";
import { Loader2, ShieldAlert, ShieldCheck, Ban, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/interfaces/user";

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificamos si el usuario actual es Super Admin
  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  // Usamos useCallback para que la función sea estable y se pueda llamar desde varios lugares
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await userService.getAllUsers(token);
      setUsers(data);
    } catch (error) {
      console.error("Error en fetchUsers:", error);
      toast.error("Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Se ejecuta una vez al montar el componente (y cuando el token cambie)
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBan = async (userId: string, currentlyActive: boolean) => {
    if (!token) return;
    try {
      if (currentlyActive) {
        if (!window.confirm("¿Seguro que quieres suspender a este usuario?")) return;
        await userService.banUser(userId, token);
        toast.success("Usuario suspendido");
      } else {
        await userService.reactivateUser(userId, token);
        toast.success("Usuario reactivado");
      }
      fetchUsers(); // Recargamos la lista
    } catch (error) {
      console.error("Error en handleToggleBan:", error);
      toast.error("No tienes permiso para realizar esta acción");
    }
  };

  const handleToggleRole = async (userId: string, currentlyAdmin: boolean) => {
    if (!token) return;
    if (!window.confirm(`¿Seguro que quieres ${currentlyAdmin ? 'quitarle' : 'darle'} el rol de Administrador?`)) return;
    
    try {
      await userService.toggleAdminRole(userId, !currentlyAdmin, token);
      toast.success("Rol actualizado correctamente");
      fetchUsers(); // Recargamos la lista
    } catch (error) {
      console.error("Error en handleToggleRole:", error);
      toast.error("Hubo un error al cambiar el rol");
    }
  };

  const getInitials = (name?: string) => name ? name.charAt(0).toUpperCase() : "U";

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-main tracking-tight flex items-center gap-3">
          Gestión de Usuarios
          {isSuperAdmin && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Acceso Máximo
            </span>
          )}
        </h1>
        <p className="text-muted mt-1">Administra accesos, roles y el estado de las cuentas de Vesta.</p>
      </div>

      <div className="bg-surface border border-subtle rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted">
            <Loader2 className="animate-spin mb-2 text-primary" size={32} />
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-main">
              <thead className="bg-app uppercase font-semibold text-xs border-b border-subtle text-muted">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-app/50 transition-colors">
                    
                    {/* INFO DEL USUARIO */}
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-blue-100 dark:bg-blue-900 flex items-center justify-center border border-subtle">
                        {u.pfp ? (
                          <Image src={u.pfp} alt={u.name} fill className="object-cover" />
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {getInitials(u.name)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold block truncate">{u.name}</span>
                        <span className="text-xs text-muted block truncate">{u.email}</span>
                      </div>
                    </td>

                    {/* COLUMNA ROL */}
                    <td className="px-6 py-4">
                      {u.isSuperAdmin ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md w-fit border border-indigo-100">
                          <ShieldAlert size={14} /> Super Admin
                        </span>
                      ) : u.isAdmin ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md w-fit border border-emerald-100">
                          <ShieldCheck size={14} /> Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md w-fit border border-slate-200">
                          Inquilino
                        </span>
                      )}
                    </td>

                    {/* COLUMNA ESTADO */}
                    <td className="px-6 py-4">
                      {/* Asumimos que la prop es isActive, asegúrate de que exista en tu interfaz User si TypeScript se queja */}
                      {(u as any).isActive !== false ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500">
                          Suspendido
                        </span>
                      )}
                    </td>

                    {/* ACCIONES */}
                    <td className="px-6 py-4 text-right space-x-2">
                      {/* Ocultar acciones si el usuario de la fila es SuperAdmin */}
                      {!u.isSuperAdmin && (
                        <>
                          {/* El Super Admin puede cambiar roles a cualquiera */}
                          {isSuperAdmin && (
                            <button 
                              onClick={() => handleToggleRole(u.id, u.isAdmin)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-subtle hover:bg-app text-main transition-colors"
                            >
                              {u.isAdmin ? 'Quitar Admin' : 'Hacer Admin'}
                            </button>
                          )}

                          {/* Botón de suspender/reactivar */}
                          <button 
                            onClick={() => handleToggleBan(u.id, (u as any).isActive !== false)}
                            className={`p-2 rounded-lg transition-colors border ${
                              (u as any).isActive !== false 
                                ? 'text-rose-500 border-transparent hover:bg-rose-50 hover:border-rose-200' 
                                : 'text-emerald-500 border-transparent hover:bg-emerald-50 hover:border-emerald-200'
                            }`}
                            title={(u as any).isActive !== false ? "Suspender cuenta" : "Reactivar cuenta"}
                          >
                            {(u as any).isActive !== false ? <Ban size={18} /> : <CheckCircle2 size={18} />}
                          </button>
                        </>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}