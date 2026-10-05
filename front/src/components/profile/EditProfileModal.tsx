"use client";

import React, { useState } from "react";
import { X, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/common/Button/Button";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import Image from "next/image";

interface EditProfileModalProps {
  onClose: () => void;
}

export const EditProfileModal = ({ onClose }: EditProfileModalProps) => {
  const { user, token, updateUserData } = useAuthStore();
  
  const [name, setName] = useState(user?.name || "");
  const [address, setAddress] = useState(user?.address || "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user?.pfp || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Mostrar preview local
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;
    
    setIsLoading(true);
    try {
      // 1. Si hay foto, la subimos primero (el back ya la guarda en su DB)
      if (file) {
        await userService.uploadPhoto(file, token);
      }

      // 2. Actualizamos los textos y CAPTURAMOS la respuesta del backend
      const data = await userService.updateProfile(user.id, token, { name, address });

      // 3. ACÁ APLICAS LO QUE TE DIJO EL DEL BACK:
      // Actualizamos Zustand enviando directamente el objeto actualizado que vino del servidor.
      // (Si el back devuelve el objeto directo sin envolverlo en "user", sería updateUserData(data))
      updateUserData(data.user || data);
      
      toast.success("Perfil actualizado con éxito");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Hubo un error al guardar los cambios");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-subtle">
          <h2 className="text-xl font-bold text-main">Editar Perfil</h2>
          <button onClick={onClose} className="text-muted hover:text-main transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Subida de foto */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-subtle bg-app">
              {preview ? (
                <Image src={preview} alt="Preview" fill className="object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-muted font-bold text-2xl">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <label className="cursor-pointer text-sm font-semibold text-primary hover:text-blue-700 flex items-center gap-2 transition-colors">
              <UploadCloud size={16} />
              <span>Cambiar foto</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-main mb-1">Nombre completo</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
              className="w-full px-4 py-2.5 bg-app border border-subtle rounded-xl text-sm text-main focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-main mb-1">Dirección</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              required
              className="w-full px-4 py-2.5 bg-app border border-subtle rounded-xl text-sm text-main focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Footer de botones */}
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 py-2.5 rounded-xl">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} className="flex-1 py-2.5 rounded-xl">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Guardar cambios"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};