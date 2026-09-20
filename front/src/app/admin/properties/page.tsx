"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";

export default function AdminPropertiesPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estado para capturar todos los campos de texto
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    country: "",
    city: "",
    type: "Temporario",
  });

  // Estado independiente para guardar las imágenes seleccionadas
  const [files, setFiles] = useState<FileList | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. FormData es nativo de JavaScript y es OBLIGATORIO cuando envías archivos (fotos)
      const data = new FormData();
      
      // Agregamos los textos
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("country", formData.country);
      data.append("city", formData.city);
      data.append("type", formData.type);

      // Agregamos las imágenes iterando sobre la lista de archivos
      if (files) {
        Array.from(files).forEach((file) => {
          // El nombre 'images' debe coincidir exactamente con lo que el backend de NestJS espera en el interceptor de Multer
          data.append("images", file); 
        });
      }

      // 2. Enviamos todo al endpoint real de tu backend
      const response = await fetch("http://localhost:3001/properties", {
        method: "POST",
        body: data,
        // OJO: Cuando usas FormData, NO debes poner el header 'Content-Type': 'application/json'
        // El navegador automáticamente genera el 'multipart/form-data' necesario para archivos.
      });

      if (!response.ok) throw new Error("Error al guardar la propiedad");

      setSuccess(true);
      // Limpiamos el formulario tras el éxito
      setFormData({ name: "", description: "", price: "", country: "", city: "", type: "Temporario" });
      setFiles(null);
      
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error(error);
      alert("Hubo un problema al crear la propiedad. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Publicar Nueva Propiedad</h1>
        <p className="text-slate-500 mt-2">Completa los detalles y sube las imágenes para agregarla al catálogo de Vesta.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Título */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Título de la publicación</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Ej: Loft luminoso en Palermo"
            />
          </div>

          {/* País y Ciudad */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">País</label>
            <input 
              type="text" 
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none"
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
              className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none"
              placeholder="Ej: Buenos Aires"
            />
          </div>

          {/* Precio y Tipo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Precio (USD)</label>
            <input 
              type="number" 
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none"
              placeholder="Ej: 1200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Alquiler</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none bg-white"
            >
              <option value="Temporario">Temporario (Por días/meses)</option>
              <option value="Residencial">Residencial (Anual)</option>
            </select>
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
              className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none resize-none"
              placeholder="Describe las comodidades, capacidad y detalles especiales del inmueble..."
            />
          </div>

          {/* Subida de Imágenes para Cloudinary */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Imágenes (Cloudinary)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
              <UploadCloud className="text-slate-400 mb-3" size={40} />
              <p className="text-sm text-slate-600 font-medium mb-1">Arrastra tus fotos o haz clic aquí</p>
              <p className="text-xs text-slate-400">Puedes seleccionar varias imágenes a la vez (PNG, JPG)</p>
              
              <input 
                type="file" 
                multiple
                accept="image/*"
                onChange={(e) => setFiles(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {files && (
              <p className="text-sm text-primary font-medium mt-3">
                {files.length} archivo(s) seleccionado(s) listos para subir.
              </p>
            )}
          </div>
        </div>

        {/* Botón de Enviar y Mensaje de Éxito */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Subiendo a Cloudinary..." : "Publicar Inmueble"}
          </button>
          
          {success && (
            <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle2 size={20} />
              Propiedad y fotos guardadas con éxito
            </div>
          )}
        </div>

      </form>
    </div>
  );
}