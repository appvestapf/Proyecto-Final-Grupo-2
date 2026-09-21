"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function AdminPropertiesPage() {
  const { token } = useAuthStore(); // Necesitamos el token para las rutas protegidas del admin
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estado ampliado para cumplir con todos los campos obligatorios del CreatePropertyDto
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    priceUnit: "noche",
    country: "",
    city: "",
    rentalType: "Temporario",
    capacity: "",
    rooms: "",
    bathrooms: "",
    area: "",
    isPetFriendly: false,
    hasGarage: false,
  });

  const [files, setFiles] = useState<FileList | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Manejo especial para los checkboxes
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Tu sesión expiró. Vuelve a iniciar sesión.");
      return;
    }
    
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      let imageUrls: string[] = [];

      // PASO 1: Subir las imágenes a Cloudinary usando el endpoint del backend
      if (files && files.length > 0) {
        const imageFormData = new FormData();
        Array.from(files).forEach((file) => {
          imageFormData.append("images", file);
        });

        const uploadRes = await fetch(`${API_URL}/properties/upload-images`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData,
        });

        if (!uploadRes.ok) throw new Error("Error al subir las imágenes a Cloudinary");
        const uploadData = await uploadRes.json();
        imageUrls = uploadData.urls; // Extraemos el array de strings con las URLs
      }

      // PASO 2: Construir el JSON estricto que espera el backend
      const propertyPayload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        priceUnit: formData.priceUnit,
        country: formData.country,
        city: formData.city,
        lat: -34.6037, // Coordenadas mockeadas por ahora (Centro de BsAs)
        lng: -58.3816,
        rentalType: formData.rentalType,
        capacity: Number(formData.capacity),
        rooms: Number(formData.rooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        isPetFriendly: formData.isPetFriendly,
        hasGarage: formData.hasGarage,
        isAvailable: true,
        images: imageUrls,
      };

      // PASO 3: Enviar el JSON para crear la propiedad
      const response = await fetch(`${API_URL}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyPayload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Error al guardar la propiedad en la base de datos");
      }

      setSuccess(true);
      toast.success("¡Propiedad publicada con éxito!");
      
      // Reseteamos el formulario
      setFormData({ 
        name: "", description: "", price: "", priceUnit: "noche", country: "", city: "", 
        rentalType: "Temporario", capacity: "", rooms: "", bathrooms: "", area: "", 
        isPetFriendly: false, hasGarage: false 
      });
      setFiles(null);
      setTimeout(() => setSuccess(false), 3000);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Publicar Nueva Propiedad</h1>
        <p className="text-slate-500 mt-2 text-sm">Completa los detalles y sube las imágenes para agregarla al catálogo de Vesta.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Fila 1: Título */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Título de la publicación</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              placeholder="Ej: Loft luminoso en Palermo"
            />
          </div>

          {/* Fila 2: Ubicación */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">País</label>
            <input 
              type="text" 
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              placeholder="Ej: Argentina"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ciudad</label>
            <input 
              type="text" 
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              placeholder="Ej: Buenos Aires"
            />
          </div>

          {/* Fila 3: Precio, Unidad y Tipo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Precio (USD)</label>
            <input 
              type="number" 
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              placeholder="Ej: 1200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Unidad</label>
              <select 
                name="priceUnit"
                value={formData.priceUnit}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm"
              >
                <option value="noche">Noche</option>
                <option value="mes">Mes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Operación</label>
              <select 
                name="rentalType"
                value={formData.rentalType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-sm"
              >
                <option value="Temporario">Temporario</option>
                <option value="Residencial">Residencial</option>
              </select>
            </div>
          </div>

          {/* Fila 4: Características Físicas (Capacidad, Habitaciones, Baños, Área) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Huéspedes</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm" placeholder="Ej: 4" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mts²</label>
              <input type="number" name="area" value={formData.area} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm" placeholder="Ej: 60" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Habitaciones</label>
              <input type="number" name="rooms" value={formData.rooms} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm" placeholder="Ej: 2" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Baños</label>
              <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm" placeholder="Ej: 1" />
            </div>
          </div>

          {/* Checkboxes (Mascotas y Garage) */}
          <div className="md:col-span-2 flex gap-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isPetFriendly" checked={formData.isPetFriendly} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
              <span className="text-sm font-medium text-slate-700">Acepta Mascotas</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="hasGarage" checked={formData.hasGarage} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
              <span className="text-sm font-medium text-slate-700">Incluye Cochera</span>
            </label>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary outline-none resize-none text-sm"
              placeholder="Describe las comodidades y detalles especiales del inmueble..."
            />
          </div>

          {/* Subida de Imágenes para Cloudinary */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Imágenes del inmueble</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
              <UploadCloud className="text-slate-400 mb-3" size={40} />
              <p className="text-sm text-slate-600 font-medium mb-1">Haz clic o arrastra fotos aquí</p>
              <p className="text-xs text-slate-400 mb-3">Máximo 10 fotos (PNG, JPG, WEBP)</p>
              
              <input 
                type="file" 
                multiple
                accept="image/*"
                required
                onChange={(e) => setFiles(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {files && (
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium mt-2 z-10 pointer-events-none border border-blue-200">
                  {files.length} archivo(s) seleccionado(s)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón de Enviar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto bg-primary hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={20} /> Guardando en Base de Datos...</>
            ) : (
              "Publicar Inmueble"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}