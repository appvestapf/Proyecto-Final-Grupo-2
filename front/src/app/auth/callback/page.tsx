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
      setGoogleToken(token);
      toast.success('¡Sesión iniciada con éxito!');
      router.replace('/');
    } catch (error) {
      console.error('Error al procesar el token de Google', error);
      toast.error('Error al procesar la autenticación');
      router.replace('/auth/login');
    }
  }, [searchParams, router, setGoogleToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-app px-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-surface rounded-[20px] shadow-md border border-subtle p-8 text-center space-y-6">
        
        {/* Isotipo oficial Vesta */}
        <div className="flex justify-center">
          <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden rounded-full border border-subtle bg-app p-0.5">
            <Image 
              src="/logo2.png" 
              alt="Vesta Logo" 
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-main tracking-tight">
            Autenticando con Google
          </h2>
          <p className="text-sm text-muted">
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
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}