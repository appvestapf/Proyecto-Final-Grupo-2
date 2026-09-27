"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { favoriteService } from '@/services/favoriteService';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  propertyId: string;
  initialIsFavorite?: boolean;
  onToggleSuccess?: (newIsFavorite: boolean) => void;
  className?: string;
  size?: number;
}

export const FavoriteButton = ({
  propertyId,
  initialIsFavorite,
  onToggleSuccess,
  className = "",
  size = 20,
}: FavoriteButtonProps) => {
  const router = useRouter();
  const { 
    token, 
    isAuthenticated, 
    userFavorites, 
    addFavoriteId, 
    removeFavoriteId 
  } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const isFavorite = initialIsFavorite !== undefined 
    ? initialIsFavorite 
    : userFavorites.includes(propertyId);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Guard de autenticación para visitantes
    if (!isAuthenticated || !token) {
      toast.info('Inicia sesión para guardar propiedades en tus favoritos');
      
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        sessionStorage.setItem('pendingFavoriteId', propertyId);
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        router.push('/auth/login');
      }
      return;
    }

    setLoading(true);
    const nextState = !isFavorite;

    // Actualización Optimista Global
    if (nextState) {
      addFavoriteId(propertyId);
    } else {
      removeFavoriteId(propertyId);
    }

    try {
      if (nextState) {
        await favoriteService.addFavorite(propertyId, token);
        toast.success('Agregado a tus favoritos');
      } else {
        await favoriteService.removeFavorite(propertyId, token);
        toast.info('Quitado de tus favoritos');
      }

      if (onToggleSuccess) {
        onToggleSuccess(nextState);
      }
    } catch (error) {
      if (nextState) {
        removeFavoriteId(propertyId);
      } else {
        addFavoriteId(propertyId);
      }
      console.error(error);
      toast.error('No se pudo actualizar tus favoritos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`p-2 bg-surface/80 backdrop-blur-md border border-subtle rounded-full shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center ${
        isFavorite 
          ? 'text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:text-white' 
          : 'text-muted hover:text-rose-500 hover:bg-surface'
      } ${className}`}
      title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
    >
      <Heart 
        size={size} 
        className={`transition-colors ${isFavorite ? 'fill-current text-rose-500' : ''}`} 
      />
    </button>
  );
};