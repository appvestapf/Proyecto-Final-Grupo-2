"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { propertyService } from '@/services/propertyService';
import { Loader2, Plus, Edit2, Trash2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/common/Button/Button';
import { toast } from 'sonner';

const DEFAULT_FORM_STATE = {
  name: '',
  description: '',
  country: '',
  city: '',
  price: '',
  priceUnit: 'noche',
  rentalType: 'Temporario',
  capacity: '',
  rooms: '',
  bathrooms: '',
  area: '',
  isPetFriendly: false,
  hasGarage: false,
  lat: -34.5889,
  lng: -58.4309,
};

export default function AdminPropertiesPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);

 const { token, role, user: currentUser } = useAuthStore();
 const isSuperAdmin = currentUser?.isSuperAdmin === true;

  const [files, setFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  const fetchProperties = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await propertyService.getProperties(); 
      setProperties(data);
    } catch (error) {
      toast.error('Error al cargar las propiedades');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    const loadProperties = async () => {
      if (token && role === 'admin') {
        await fetchProperties();
      }
    };
    
    loadProperties();
  }, [token, role, fetchProperties]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_STATE);
    setFiles(null);
    setEditingId(null);
  };

  const handleEdit = (property: any) => {
    setFormData({
      name: property.name || property.title,
      description: property.description,
      country: property.country || property.location.split(', ')[1] || '',
      city: property.city || property.location.split(', ')[0] || '',
      price: property.price.toString(),
      priceUnit: property.priceUnit,
      rentalType: property.rentalType,
      capacity: property.capacity.toString(),
      rooms: property.rooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area.toString(),
      isPetFriendly: property.isPetFriendly,
      hasGarage: property.hasGarage,
      lat: property.lat || -34.5889,
      lng: property.lng || -58.4309,
    });
    setEditingId(property.id);
    setActiveTab('create');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar esta propiedad? (No se borrará el historial de reservas, solo dejará de estar visible)')) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar');

      toast.success('Propiedad eliminada correctamente');
      fetchProperties();
    } catch (error) {
      toast.error('No se pudo eliminar la propiedad');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Sesión no válida');
      return;
    }

    setLoadingForm(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      let uploadedImageUrls: string[] = [];

      if (files && files.length > 0) {
        const imageFormData = new FormData();
        for (let i = 0; i < files.length; i++) {
          imageFormData.append('images', files[i]);
        }

        const uploadResponse = await fetch(`${API_URL}/properties/upload-images`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: imageFormData
        });

        if (!uploadResponse.ok) throw new Error('Error al subir las imágenes a Cloudinary');
        
        const uploadData = await uploadResponse.json();
        uploadedImageUrls = uploadData.urls;
      }

      const propertyPayload: any = {
        name: formData.name,
        description: formData.description,
        country: formData.country,
        city: formData.city,
        price: Number(formData.price),
        priceUnit: formData.priceUnit,
        rentalType: formData.rentalType,
        capacity: Number(formData.capacity),
        rooms: Number(formData.rooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        isPetFriendly: formData.isPetFriendly,
        hasGarage: formData.hasGarage,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      };

      if (uploadedImageUrls.length > 0) {
        propertyPayload.images = uploadedImageUrls;
      }

      const method = editingId ? 'PATCH' : 'POST';
      const endpoint = editingId ? `${API_URL}/properties/${editingId}` : `${API_URL}/properties`;
      
      if (!editingId) {
        propertyPayload.isAvailable = true;
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(propertyPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la propiedad');
      }

      toast.success(editingId ? '¡Propiedad actualizada con éxito!' : '¡Propiedad publicada con éxito!');
      
      resetForm();
      await fetchProperties();
      setActiveTab('list');

    } catch (error: any) {
      const errorMsg = Array.isArray(error.message) ? error.message.join(', ') : error.message;
      toast.error(errorMsg || 'Error al procesar la propiedad');
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-(--text-main) tracking-tight">Gestión de Propiedades</h1>
          <p className="text-(--text-muted) mt-1">Administra el catálogo completo de inmuebles.</p>
        </div>
        
        <div className="flex bg-(--bg-surface) rounded-lg p-1 border border-(--border-subtle) shadow-sm w-fit transition-colors duration-200">
          <button
            onClick={() => {
              setActiveTab('list');
              resetForm();
            }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'list' 
                ? 'bg-(--bg-app) text-(--text-main) shadow-sm' 
                : 'text-(--text-muted) hover:text-(--text-main)'
            }`}
          >
            Catálogo Actual
          </button>
          <button
            onClick={() => {
              resetForm();
              setActiveTab('create');
            }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'create' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-(--text-muted) hover:text-(--text-main)'
            }`}
          >
            <Plus size={16} /> Nueva Publicación
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="bg-(--bg-surface) border border-(--border-subtle) rounded-2xl shadow-sm overflow-hidden transition-colors duration-200">
          {loadingList ? (
            <div className="flex flex-col items-center justify-center h-64 text-(--text-muted)">
              <Loader2 className="animate-spin mb-2 text-primary" size={32} />
              <p>Cargando inventario...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-(--text-muted)">
              <p>No hay propiedades registradas en el sistema.</p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab('create')}>
                Crear la primera
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-(--text-muted)">
                <thead className="bg-(--bg-app) text-(--text-main) uppercase font-semibold text-xs border-b border-(--border-subtle)">
                  <tr>
                    <th className="px-6 py-4">Inmueble</th>
                    <th className="px-6 py-4">Ubicación</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Precio</th>
                    {/* Nueva columna condicional para Super Admin */}
                    {isSuperAdmin && <th className="px-6 py-4">Propietario</th>}
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-subtle)">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-(--bg-app)/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-(--bg-app)">
                          {property.images && property.images.length > 0 ? (
                            <Image src={property.images[0]} alt={property.title || property.name} fill className="object-cover" />
                          ) : (
                            <span className="text-xs text-center flex h-full items-center justify-center text-(--text-muted)">Sin foto</span>
                          )}
                        </div>
                        <span className="font-semibold text-(--text-main) max-w-[200px] truncate block" title={property.title || property.name}>
                          {property.title || property.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-(--text-muted)">{property.location || `${property.city}, ${property.country}`}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-(--bg-app) text-(--text-main) rounded-md text-xs font-medium border border-(--border-subtle)">
                          {property.rentalType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-(--text-main)">
                        US$ {property.price}
                      </td>

                      {/* Celda del Propietario (Solo visible para Super Admin) */}
                      {isSuperAdmin && (
                        <td className="px-6 py-4">
                          {property.owner?.id === currentUser?.id ? (
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                              Mi Propiedad
                            </span>
                          ) : property.owner ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-(--text-main)">{property.owner.name}</span>
                              <span className="text-[10px] text-(--text-muted)">{property.owner.email}</span>
                            </div>
                          ) : (
                            <span className="text-xs italic text-(--text-muted)">Vesta (Sistema)</span>
                          )}
                        </td>
                      )}

                      <td className="px-6 py-4">
                        {property.isAvailable ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">Disponible</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500">Reservada</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(property)}
                          className="p-2 text-(--text-muted) hover:text-primary transition-colors cursor-pointer" 
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(property.id)}
                          className="p-2 text-(--text-muted) hover:text-rose-500 transition-colors cursor-pointer" 
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>         
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-(--bg-surface) border border-(--border-subtle) rounded-2xl p-8 shadow-sm relative transition-colors duration-200">
          
          {editingId && (
            <button 
              onClick={() => { resetForm(); setActiveTab('list'); }}
              className="absolute top-8 right-8 text-(--text-muted) hover:text-(--text-main) transition-colors cursor-pointer"
              title="Cancelar edición"
            >
              <X size={24} />
            </button>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-(--text-main)">
              {editingId ? 'Editar Propiedad' : 'Publicar Nueva Propiedad'}
            </h2>
            <p className="text-(--text-muted) mt-2 text-sm">
              {editingId 
                ? 'Modifica los valores actuales. Si no subes nuevas imágenes, se conservarán las existentes.' 
                : 'Completa los detalles y sube las imágenes para agregarla al catálogo de Vesta.'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-(--text-main) mb-2">Título de la publicación</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-(--text-muted)" placeholder="Ej: Loft luminoso en Palermo" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-(--text-main) mb-2">País</label>
                <input type="text" name="country" value={formData.country} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-(--text-muted)" placeholder="Ej: Argentina" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-(--text-main) mb-2">Ciudad</label>
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-(--text-muted)" placeholder="Ej: Buenos Aires" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-(--text-main) mb-2">Precio (USD)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) focus:ring-2 focus:ring-primary outline-none transition-all text-sm placeholder:text-(--text-muted)" placeholder="Ej: 1200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-(--text-main) mb-2">Unidad</label>
                  <select name="priceUnit" value={formData.priceUnit} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) text-sm">
                    <option value="noche">Noche</option>
                    <option value="mes">Mes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-(--text-main) mb-2">Operación</label>
                  <select name="rentalType" value={formData.rentalType} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) text-sm">
                    <option value="Temporario">Temporario</option>
                    <option value="Residencial">Residencial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-(--text-main) mb-2">Huéspedes</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) text-sm placeholder:text-(--text-muted)" placeholder="Ej: 4" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-(--text-main) mb-2">Mts²</label>
                  <input type="number" name="area" value={formData.area} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) text-sm placeholder:text-(--text-muted)" placeholder="Ej: 60" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-(--text-main) mb-2">Habitaciones</label>
                  <input type="number" name="rooms" value={formData.rooms} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) text-sm placeholder:text-(--text-muted)" placeholder="Ej: 2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-(--text-main) mb-2">Baños</label>
                  <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) text-sm placeholder:text-(--text-muted)" placeholder="Ej: 1" />
                </div>
              </div>

              <div className="md:col-span-2 flex gap-8 p-4 bg-(--bg-app) rounded-xl border border-(--border-subtle)">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isPetFriendly" checked={formData.isPetFriendly} onChange={handleInputChange} className="w-5 h-5 rounded border-(--border-subtle) text-primary focus:ring-primary" />
                  <span className="text-sm font-medium text-(--text-main)">Acepta Mascotas</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="hasGarage" checked={formData.hasGarage} onChange={handleInputChange} className="w-5 h-5 rounded border-(--border-subtle) text-primary focus:ring-primary" />
                  <span className="text-sm font-medium text-(--text-main)">Incluye Cochera</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-(--text-main) mb-2">Descripción</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4} className="w-full px-4 py-3 rounded-lg border border-(--border-subtle) bg-(--bg-app) text-(--text-main) focus:ring-2 focus:ring-primary outline-none resize-none text-sm placeholder:text-(--text-muted)" placeholder="Describe las comodidades..." />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-(--text-main) mb-2">Imágenes del inmueble</label>
                <div className="border-2 border-dashed border-(--border-subtle) rounded-xl p-8 flex flex-col items-center justify-center bg-(--bg-app) hover:bg-(--bg-app)/80 transition-colors relative">
                  <UploadCloud className="text-(--text-muted) mb-3" size={40} />
                  <p className="text-sm text-(--text-main) font-medium mb-1">Haz clic o arrastra fotos aquí</p>
                  <p className="text-xs text-(--text-muted) mb-3">Máximo 10 fotos (PNG, JPG, WEBP)</p>
                  
                  <input type="file" multiple accept="image/*" required={!editingId} onChange={(e) => setFiles(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  
                  {files && (
                    <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium mt-2 z-10 pointer-events-none border border-primary/20">
                      {files.length} archivo(s) seleccionado(s)
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 border-t border-(--border-subtle) gap-4">
              {editingId && (
                <button type="button" onClick={() => { resetForm(); setActiveTab('list'); }} className="px-6 py-3.5 text-(--text-muted) hover:text-(--text-main) font-semibold hover:bg-(--bg-app) rounded-xl transition-colors cursor-pointer">
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={loadingForm} className="bg-primary hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                {loadingForm ? <><Loader2 className="animate-spin" size={20} /> Guardando...</> : (editingId ? "Guardar Cambios" : "Publicar Inmueble")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}