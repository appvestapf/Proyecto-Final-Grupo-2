import { authService } from '../authService';

// Limpiamos el localStorage y los mocks antes de cada test
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('authService', () => {
  const mockUser = { id: '1', name: 'Juan Pérez', email: 'juan@mail.com', address: 'Calle 123' };
  const mockToken = 'fake-jwt-token-123';

  describe('login', () => {
    it('debería iniciar sesión exitosamente, guardar token/usuario y retornar los datos', async () => {
      // Mock de fetch exitoso
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ user: mockUser, token: mockToken }),
      });

      const credentials = { email: 'juan@mail.com', password: 'password123' };
      const result = await authService.login(credentials);

      // Verificaciones
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        })
      );
      expect(result).toEqual({ user: mockUser, token: mockToken });
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('debería lanzar un error si el backend responde con un fallo en el login', async () => {
      // Mock de fetch fallido
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Credenciales inválidas' }),
      });

      const credentials = { email: 'juan@mail.com', password: 'wrongpassword' };

      await expect(authService.login(credentials)).rejects.toThrow('Credenciales inválidas');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('register', () => {
    it('debería registrar un usuario exitosamente, guardar token/usuario y retornar los datos', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ user: mockUser, token: mockToken }),
      });

      const registerData = {
        name: 'Juan Pérez',
        email: 'juan@mail.com',
        address: 'Calle 123',
        password: 'password123',
      };

      const result = await authService.register(registerData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerData),
        })
      );
      expect(result).toEqual({ user: mockUser, token: mockToken });
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('debería lanzar un error si el backend responde con un fallo en el registro', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'El correo ya está registrado' }),
      });

      const registerData = {
        name: 'Juan Pérez',
        email: 'juan@mail.com',
        address: 'Calle 123',
        password: 'password123',
      };

      await expect(authService.register(registerData)).rejects.toThrow('El correo ya está registrado');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('logout y getToken', () => {
    it('debería eliminar el token y usuario del localStorage al hacer logout', () => {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('debería retornar el token correctamente si existe', () => {
      localStorage.setItem('token', mockToken);

      const token = authService.getToken();

      expect(token).toBe(mockToken);
    });

    it('debería retornar null si no hay token al invocar getToken', () => {
      const token = authService.getToken();

      expect(token).toBeNull();
    });
  });
});