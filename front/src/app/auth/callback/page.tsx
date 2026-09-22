'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setGoogleToken = useAuthStore((state) => state.setGoogleToken);
  
  // Bandera para evitar ejecuciones múltiples (por StrictMode o re-renders)
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const token = searchParams.get('token');
    
    if (!token) {
      hasProcessed.current = true;
      toast.error('No se pudo autenticar con Google');
      router.replace('/auth/login');
      return;
    }

    try {
      hasProcessed.current = true;
      // Guardamos el token en Zustand y localStorage
      setGoogleToken(token);
      toast.success('¡Sesión iniciada con éxito!');
      
      // Redirigimos al inicio limpiando la URL
      router.replace('/');
    } catch (error) {
      console.error('Error al procesar el token de Google', error);
      toast.error('Error al procesar la autenticación');
      router.replace('/auth/login');
    }
  }, [searchParams, router, setGoogleToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 text-center space-y-6">
        
        {/* Logo oficial de Vesta */}
        <div className="flex justify-center">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <Image 
              src="/logo2.png" 
              alt="Vesta Logo" 
              width={48} 
              height={48} 
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Autenticando con Google
          </h2>
          <p className="text-sm text-gray-500">
            Estamos configurando tu sesión de forma segura. En un momento serás redirigido...
          </p>
        </div>

        {/* Spinner de carga */}
        <div className="flex justify-center py-2">
          <div className="relative w-10 h-10">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}