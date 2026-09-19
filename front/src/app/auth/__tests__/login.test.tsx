import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../login/page';
import { authService } from '../../../services/authService';
import '@testing-library/jest-dom';

// Mocks de Next.js navigation y authService
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('../../../services/authService', () => ({
  authService: {
    login: jest.fn(),
  },
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar los campos del formulario de login y el botón correctamente', () => {
    render(<LoginPage />);

    // Usamos getByRole para especificar que buscamos el título (heading) y no el botón
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('debería llamar a authService.login y redirigir al usuario si las credenciales son válidas', async () => {
    const mockUser = { id: '1', name: 'Mati', email: 'mati@mail.com', address: 'Test' };
    const mockToken = 'jwt-token-xyz';

    (authService.login as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    render(<LoginPage />);

    // Llenar el formulario usando los placeholders exactos del input
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), {
      target: { value: 'mati@mail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    // Enviar el formulario haciendo clic en el botón de submit
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Esperar a que se procese la llamada al servicio y la redirección del router
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'mati@mail.com',
        password: 'password123',
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});