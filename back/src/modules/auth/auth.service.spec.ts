import {
  describe,
  it,
  expect,
  jest,
  beforeAll,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let mailService: jest.Mocked<MailService>;

  const correctPassword = 'Password123';
  let baseUser: any;

  beforeAll(async () => {
    baseUser = {
      id: 'user-1',
      email: 'juan@gmail.com',
      name: 'Juan',
      password: await bcrypt.hash(correctPassword, 10),
      isAdmin: false,
      pfp: null,
      lockedUntil: null,
      failedLoginAttempts: 0,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            registerFailedLogin: jest.fn(),
            resetFailedLogins: jest.fn(),
            setResetPasswordToken: jest.fn(),
            findByResetToken: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('fake-token'),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
            sendPasswordReset: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    mailService = module.get(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('rechaza el registro si el email ya existe', async () => {
      usersService.findByEmail.mockResolvedValue(baseUser as any);

      await expect(
        service.signup({
          name: 'Juan',
          email: 'juan@gmail.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          address: 'Calle 1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('crea el usuario, manda el mail de bienvenida y devuelve el token', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(baseUser as any);

      const result = await service.signup({
        name: 'Juan',
        email: 'juan@gmail.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        address: 'Calle 1',
      });

      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith(
        baseUser.email,
        baseUser.name,
      );
      expect(result.access_token).toBe('fake-token');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('rechaza si el usuario no existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nadie@gmail.com', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rechaza si la cuenta está bloqueada por intentos fallidos', async () => {
      const lockedUser = {
        ...baseUser,
        lockedUntil: new Date(Date.now() + 5 * 60 * 1000),
      };
      usersService.findByEmail.mockResolvedValue(lockedUser as any);

      await expect(
        service.login({ email: lockedUser.email, password: 'x' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('registra el intento fallido y rechaza si la contraseña es incorrecta', async () => {
      usersService.findByEmail.mockResolvedValue(baseUser as any);

      await expect(
        service.login({
          email: baseUser.email,
          password: 'mala-contraseña',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(usersService.registerFailedLogin).toHaveBeenCalledWith(baseUser);
    });

    it('resetea los intentos fallidos y devuelve el token si la contraseña es correcta', async () => {
      usersService.findByEmail.mockResolvedValue(baseUser as any);

      const result = await service.login({
        email: baseUser.email,
        password: correctPassword,
      });

      expect(usersService.resetFailedLogins).toHaveBeenCalledWith(baseUser);
      expect(result.access_token).toBe('fake-token');
    });
  });

  describe('forgotPassword', () => {
    it('no revela si el email no existe, pero responde con el mensaje genérico', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'no-existe@gmail.com',
      });

      expect(mailService.sendPasswordReset).not.toHaveBeenCalled();
      expect(result.message).toMatch(/Si el email está registrado/);
    });

    it('genera un token y envía el mail si el email existe', async () => {
      usersService.findByEmail.mockResolvedValue(baseUser as any);

      const result = await service.forgotPassword({ email: baseUser.email });

      expect(usersService.setResetPasswordToken).toHaveBeenCalledWith(
        baseUser.email,
        expect.any(String),
        expect.any(Date),
      );
      expect(mailService.sendPasswordReset).toHaveBeenCalledWith(
        baseUser.email,
        baseUser.name,
        expect.any(String),
      );
      expect(result.message).toMatch(/Si el email está registrado/);
    });
  });

  describe('resetPassword', () => {
    it('rechaza un token inválido', async () => {
      usersService.findByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: 'no-existe',
          password: 'NuevaPass1',
          confirmPassword: 'NuevaPass1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rechaza un token expirado', async () => {
      usersService.findByResetToken.mockResolvedValue({
        ...baseUser,
        resetPasswordExpires: new Date(Date.now() - 1000),
      } as any);

      await expect(
        service.resetPassword({
          token: 'expirado',
          password: 'NuevaPass1',
          confirmPassword: 'NuevaPass1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('actualiza la contraseña con un token válido', async () => {
      const userWithToken = {
        ...baseUser,
        resetPasswordToken: 'token-valido',
        resetPasswordExpires: new Date(Date.now() + 60 * 1000),
      };
      usersService.findByResetToken.mockResolvedValue(userWithToken as any);

      const result = await service.resetPassword({
        token: 'token-valido',
        password: 'NuevaPass1',
        confirmPassword: 'NuevaPass1',
      });

      expect(usersService.resetPassword).toHaveBeenCalledWith(
        userWithToken,
        'NuevaPass1',
      );
      expect(result.message).toBe('Contraseña actualizada correctamente');
    });
  });
});
