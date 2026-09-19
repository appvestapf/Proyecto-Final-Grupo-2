import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../register/page';
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
    register: jest.fn(),
  },
}));

describe('RegisterPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar los campos del formulario de registro y el botón correctamente', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /creá tu cuenta/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Calle Falsa 123')).toBeInTheDocument();
    // Hay dos campos de contraseña (contraseña y confirmar contraseña) con el placeholder '••••••••'
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /^registrarse$/i })).toBeInTheDocument();
  });

  it('debería llamar a authService.register y redirigir si los datos son válidos', async () => {
    const mockUser = { id: '1', name: 'Juan Pérez', email: 'juan@mail.com', address: 'Calle Falsa 123' };
    const mockToken = 'jwt-token-register';

    (authService.register as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    render(<RegisterPage />);

    // Llenar los campos del formulario usando placeholders o etiquetas
    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), {
      target: { value: 'juan@mail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Calle Falsa 123'), {
      target: { value: 'Calle Falsa 123' },
    });

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(passwordInputs[0], {
      target: { value: 'password123' },
    });
    fireEvent.change(passwordInputs[1], {
      target: { value: 'password123' },
    });

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /^registrarse$/i }));

    // Verificar llamada al servicio y redirección
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Juan Pérez',
        email: 'juan@mail.com',
        address: 'Calle Falsa 123',
        password: 'password123',
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});