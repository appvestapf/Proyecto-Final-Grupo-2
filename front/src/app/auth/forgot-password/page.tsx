'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/common/Button/Button';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/schemas/authSchema';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmailSent(true);
      toast.success('Si el correo está registrado, te enviamos las instrucciones.');
    } catch (err: any) {
      toast.error(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-surface transition-colors duration-200">
      <AuthBrandPanel
        title="Recuperá tu acceso a Vesta."
        description="Ingresá tu correo y te enviaremos un enlace seguro para que puedas crear una nueva contraseña en segundos."
      />
      <div className="flex items-center justify-center p-6 sm:p-8 bg-surface">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold text-main tracking-tight">Recuperar contraseña</h1>
            <p className="text-sm text-muted mt-2">
              {emailSent 
                ? "Revisá tu bandeja de entrada o spam. Te enviamos un link para continuar."
                : "Ingresá el correo electrónico asociado a tu cuenta."}
            </p>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-main mb-1">Correo electrónico</label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-4 py-2 bg-app/50 border rounded-[12px] focus:outline-none focus:ring-2 text-sm text-main placeholder:text-muted transition-all ${
                    errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-subtle focus:border-primary focus:ring-primary/20'
                  }`}
                  placeholder="tu@correo.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <Button type="submit" variant="primary" className="w-full py-2.5 mt-4" disabled={loading}>
                {loading ? 'Enviando enlace...' : 'Enviar instrucciones'}
              </Button>
            </form>
          ) : (
            <Button variant="outline" className="w-full py-2.5 mt-4" onClick={() => setEmailSent(false)}>
              Intentar con otro correo
            </Button>
          )}

          <p className="text-center text-sm text-muted mt-6">
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              ← Volver a Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}