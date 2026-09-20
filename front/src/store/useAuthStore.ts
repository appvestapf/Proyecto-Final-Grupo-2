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
        const token = response?.token || authService.getToken();
        const user = response?.user || null;

        if (!user || !token) {
          throw new Error("Respuesta de autenticación inválida");
        }

        const role: UserRole = user.isAdmin ? "admin" : "inquilino";
        set({ user, token, role, isAuthenticated: true });
      },

      register: async (userData: RegisterData) => {
        const response = await authService.register(userData);
        const token = response?.token || authService.getToken();
        const user = response?.user || response || null;

        if (!user) {
          throw new Error("Respuesta de registro inválida");
        }

        const role: UserRole = user.isAdmin ? "admin" : "inquilino";
        set({ user, token, role, isAuthenticated: true });
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