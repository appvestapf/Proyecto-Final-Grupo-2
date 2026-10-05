import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: { uploadImage: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('rechaza si el email ya está registrado', async () => {
      usersRepository.findOneBy.mockResolvedValue({ id: 'user-1' } as any);

      await expect(
        service.create({ email: 'juan@gmail.com' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('crea el usuario si el email no existe', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      const created = { id: 'user-1', email: 'juan@gmail.com' };
      usersRepository.create.mockReturnValue(created as any);
      usersRepository.save.mockResolvedValue(created as any);

      const result = await service.create({
        email: 'juan@gmail.com',
      } as any);

      expect(result).toEqual(created);
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si no existe', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetPassword', () => {
    it('limpia el bloqueo por intentos fallidos', async () => {
      const user = {
        id: 'user-1',
        password: 'vieja',
        resetPasswordToken: 'token',
        resetPasswordExpires: new Date(),
        failedLoginAttempts: 5,
        lockedUntil: new Date(Date.now() + 10 * 60 * 1000),
      };
      usersRepository.save.mockImplementation((u: any) => Promise.resolve(u));

      const result = await service.resetPassword(user as any, 'nueva');

      expect(result.password).toBe('nueva');
      expect(result.failedLoginAttempts).toBe(0);
      expect(result.lockedUntil).toBeNull();
      expect(result.resetPasswordToken).toBeNull();
    });
  });

  describe('remove', () => {
    it('hace borrado lógico (isActive = false)', async () => {
      const user = { id: 'user-1', isActive: true };
      usersRepository.findOneBy.mockResolvedValue(user as any);
      usersRepository.save.mockImplementation((u: any) => Promise.resolve(u));

      const result = await service.remove('user-1');

      expect(result.isActive).toBe(false);
    });
  });
});
