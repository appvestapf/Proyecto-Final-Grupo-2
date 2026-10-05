import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El correo electrónico es requerido' })
    .email({ message: 'Ingresá un correo electrónico válido' }),
  password: z
    .string()
    .min(1, { message: 'La contraseña es requerida' })
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

export const registerSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  email: z
    .string()
    .min(1, { message: 'El correo electrónico es requerido' })
    .email({ message: 'Ingresá un correo electrónico válido' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Debes confirmar tu contraseña' }),
  address: z.string().min(1, { message: 'La dirección es requerida' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;


export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El correo electrónico es requerido' })
    .email({ message: 'Ingresá un correo electrónico válido' }),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .max(50, { message: 'La contraseña no puede superar los 50 caracteres' })
    .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una mayúscula' })
    .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una minúscula' })
    .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Debes confirmar tu contraseña' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;