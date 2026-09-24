import { LoginCredentials, RegisterData, AuthResponse } from '@/interfaces/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const authService = {
  async login(credentials: LoginCredentials): Promise<any> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const data = await response.json();
    
    if (typeof window !== 'undefined') {
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    return data;
  },

  async register(userData: RegisterData): Promise<any> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar el usuario');
    }

    const data = await response.json();

    if (typeof window !== 'undefined') {
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      const userObj = data.user || data;
      if (userObj) {
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    }

    return data;
  },

  async getProfile(): Promise<any> {
      const token = this.getToken();  
      if (!token) {
          throw new Error('No hay token disponible');
      }
  
      const response = await fetch(`${API_URL}/users/profile`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
          },
      });
  
      const responseText = await response.text();
  
      if (!response.ok) {
          throw new Error('Error al obtener el perfil del usuario');
      }
  
      return JSON.parse(responseText);
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }
};