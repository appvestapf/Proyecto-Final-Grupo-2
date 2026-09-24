import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData } from '@/interfaces/user';
import { authService } from '@/services/authService';

type UserRole = "visitante" | "inquilino" | "admin";

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  setGoogleToken: (token: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: "visitante",
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        const response = await authService.login(credentials);
        const token = response?.token || response?.access_token || authService.getToken();
        const user = response?.user || null;

        if (!user || !token) {
          throw new Error("Respuesta de autenticación inválida");
        }

        const role: UserRole = user.isAdmin ? "admin" : "inquilino";
        set({ user, token, role, isAuthenticated: true });
      },

      register: async (userData: RegisterData) => {
        const response = await authService.register(userData);
        const token = response?.token || response?.access_token || authService.getToken();
        const user = response?.user || response || null;

        if (!user) {
          throw new Error("Respuesta de registro inválida");
        }

        const role: UserRole = user.isAdmin ? "admin" : "inquilino";
        set({ user, token, role, isAuthenticated: true });
      },

      setGoogleToken: async (token: string) => {
        if (!token) {
          throw new Error("Token de Google inválido");
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }

        let user: User | null = null;
        try {
          user = await authService.getProfile();
          if (user && typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (error) {
          console.error("No se pudo obtener el perfil tras el login con Google", error);
        }

        const role: UserRole = user?.isAdmin ? "admin" : "inquilino";

        set({ 
          token, 
          user,
          isAuthenticated: true,
          role 
        });
      },

      logout: () => {
        authService.logout();
        set({ user: null, token: null, role: "visitante", isAuthenticated: false });
      },
    }),
    {
      name: 'vesta-auth-storage',
    }
  )
);