export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  address: string;
  isAdmin: boolean;
  pfp?: string | null;
  isSuperAdmin?: boolean; 
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  address: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}