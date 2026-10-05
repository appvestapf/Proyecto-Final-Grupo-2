'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/common/Button/Button';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';
import { resetPasswordSchema, ResetPasswordFormData } from '@/schemas/authSchema';
import { authService } from '@/services/authService';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('El enlace es inválido o ha expirado.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success('¡Contraseña actualizada con éxito!');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-500 font-medium">El enlace de recuperación es inválido o falta el token de seguridad.</p>
        <Link href="/auth/forgot-password">
          <Button variant="primary" className="w-full mt-4">Solicitar un nuevo enlace</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-main mb-1">Nueva Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className={`w-full px-4 py-2 bg-app/50 border rounded-[12px] focus:outline-none focus:ring-2 text-sm text-main placeholder:text-muted transition-all ${
              errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-subtle focus:border-primary focus:ring-primary/20'
            }`}
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-main">
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-[13px] font-medium text-main mb-1">Confirmar Nueva Contraseña</label>
        <input
          type={showPassword ? 'text' : 'password'}
          {...register('confirmPassword')}
          className={`w-full px-4 py-2 bg-app/50 border rounded-[12px] focus:outline-none focus:ring-2 text-sm text-main placeholder:text-muted transition-all ${
            errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-subtle focus:border-primary focus:ring-primary/20'
          }`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" variant="primary" className="w-full py-2.5 mt-4" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-surface transition-colors duration-200">
      <AuthBrandPanel
        title="Creá tu nueva contraseña."
        description="Asegurate de usar una combinación segura de letras, números y símbolos."
      />
      <div className="flex items-center justify-center p-6 sm:p-8 bg-surface">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold text-main tracking-tight">Nueva Contraseña</h1>
            <p className="text-sm text-muted mt-2">Ingresá tu nueva clave para poder acceder nuevamente.</p>
          </div>
          
          <Suspense fallback={<div className="animate-pulse text-muted">Cargando formulario...</div>}>
            <ResetPasswordForm />
          </Suspense>

          <p className="text-center text-sm text-muted mt-6">
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              Cancelar y volver a Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}