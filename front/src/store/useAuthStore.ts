import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData } from '@/interfaces/user';
import { authService } from '@/services/authService';
import { favoriteService } from '@/services/favoriteService';
import { toast } from 'sonner';

type UserRole = "visitante" | "inquilino" | "admin";

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  userFavorites: string[];
  fetchFavorites: () => Promise<void>;
  syncPendingFavorite: (token: string) => Promise<void>;
  addFavoriteId: (id: string) => void;
  removeFavoriteId: (id: string) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  setGoogleToken: (token: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: "visitante",
      isAuthenticated: false,
      userFavorites: [],

      fetchFavorites: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const favorites = await favoriteService.getMyFavorites(token);
          if (Array.isArray(favorites)) {
            const ids = favorites.map((item: any) => item.id);
            set({ userFavorites: ids });
          }
        } catch (error) {
          console.error("Error al sincronizar favoritos:", error);
        }
      },

      syncPendingFavorite: async (activeToken: string) => {
        if (typeof window === 'undefined') return;
        const pendingId = sessionStorage.getItem('pendingFavoriteId');
        
        if (pendingId) {
          sessionStorage.removeItem('pendingFavoriteId');

          const isAlreadyFavorite = get().userFavorites.includes(pendingId);

          if (isAlreadyFavorite) {
            toast.info('Esta propiedad ya estaba en tus favoritos');
            return;
          }

          try {
            await favoriteService.addFavorite(pendingId, activeToken);
            get().addFavoriteId(pendingId);
            toast.success('¡Propiedad guardada en tus favoritos!');
          } catch (error) {
            console.error("Error al procesar el favorito pendiente:", error);
          }
        }
      },

      addFavoriteId: (id: string) => {
        set((state) => ({
          userFavorites: state.userFavorites.includes(id) 
            ? state.userFavorites 
            : [...state.userFavorites, id],
        }));
      },

      removeFavoriteId: (id: string) => {
        set((state) => ({
          userFavorites: state.userFavorites.filter((favId) => favId !== id),
        }));
      },

      login: async (credentials: LoginCredentials) => {
        const response = await authService.login(credentials);
        const token = response?.token || response?.access_token || authService.getToken();
        const user = response?.user || null;

        if (!user || !token) {
          throw new Error("Respuesta de autenticación inválida");
        }

        const role: UserRole = user.isAdmin ? "admin" : "inquilino";
        set({ user, token, role, isAuthenticated: true });

        await get().fetchFavorites();
        await get().syncPendingFavorite(token);
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

        await get().fetchFavorites();
        await get().syncPendingFavorite(token);
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

        await get().fetchFavorites();
        await get().syncPendingFavorite(token);
      },

      logout: () => {
        authService.logout();
        set({ user: null, token: null, role: "visitante", isAuthenticated: false, userFavorites: [] });
      },
    }),
    {
      name: 'vesta-auth-storage',
    }
  )
);