"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, MapPin, Loader2, HeartOff, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button/Button';
import { FavoriteButton } from '@/components/common/FavoriteButton/FavoriteButton';
import { useAuthStore } from '@/store/useAuthStore';
import { favoriteService } from '@/services/favoriteService';
import { toast } from 'sonner';

export default function FavoritosPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { token, isAuthenticated, fetchFavorites: syncGlobalFavorites } = useAuthStore();

  // GUARD: Protección de ruta con verificación de autenticación
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        toast.error('Debes iniciar sesión para ver tus favoritos.');
        router.push('/auth/login');
        return;
      }
      setIsCheckingAuth(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Carga de favoritos desde el Backend
  useEffect(() => {
    const loadFavorites = async () => {
      if (!token || isCheckingAuth) return;

      try {
        setLoading(true);
        await syncGlobalFavorites();
        
        const data = await favoriteService.getMyFavorites(token);
        setFavorites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
        toast.error("No se pudieron cargar tus propiedades favoritas.");
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [token, isCheckingAuth, syncGlobalFavorites]);

  // Pantalla de Carga (Loading State)
  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p>{isCheckingAuth ? "Verificando acceso..." : "Cargando tus favoritos..."}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Favoritos</h1>
            <span className="bg-rose-100 text-rose-600 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <Heart size={14} className="fill-rose-600" /> {favorites.length}
            </span>
          </div>
          <p className="text-slate-500 mt-2">Propiedades que has guardado para revisar más tarde.</p>
        </div>

        {/* CONTENIDO PRINCIPAL ANIMADO */}
        <AnimatePresence mode="wait">
          {favorites.length === 0 ? (
            /* Estado Vacío Animado */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 text-rose-500">
                <HeartOff size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Aún no tienes favoritos guardados</h3>
              <p className="text-slate-500 font-medium max-w-sm mb-6">
                Explora nuestro catálogo y haz clic en el ícono de corazón para guardar las propiedades que más te gusten.
              </p>
              <Button variant="outline" onClick={() => router.push('/catalog')}>
                Explorar propiedades
              </Button>
            </motion.div>
          ) : (
            /* Grid de Favoritos Animado */
            <motion.div
              key="favorites-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {favorites.map((propiedad) => (
                  <motion.div
                    key={propiedad.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                  >
                    {/* Imagen y Botón Favorito */}
                    <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                      <Image 
                        src={propiedad?.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"} 
                        alt={propiedad?.title || "Propiedad"} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      
                      {/* Botón de Favorito Reutilizable */}
                      <FavoriteButton 
                        propertyId={propiedad.id}
                        onToggleSuccess={(isFav) => {
                          if (!isFav) {
                            setFavorites((prev) => prev.filter((item) => item.id !== propiedad.id));
                          }
                        }}
                        className="absolute top-3 right-3 z-10"
                      />
                    </div>

                    {/* Info de la propiedad */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1">
                          {propiedad?.title || propiedad?.name}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
                          <MapPin size={16} className="text-slate-400 shrink-0" /> 
                          <span className="truncate">{propiedad?.city}, {propiedad?.country}</span>
                        </p>
                      </div>

                      {/* Footer de la tarjeta */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Precio</p>
                          <p className="text-lg font-bold text-slate-900">US$ {propiedad?.price}</p>
                        </div>

                        <Button 
                          onClick={() => router.push(`/catalog/${propiedad.id}`)}
                          className="flex items-center gap-2 text-xs py-2 px-3"
                        >
                          <Eye size={16} /> Ver detalle
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}