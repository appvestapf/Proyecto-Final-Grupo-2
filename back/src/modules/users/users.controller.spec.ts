import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOnePublic: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('rechaza si se pide el perfil de otro usuario sin ser admin', () => {
      const req = { user: { id: 'user-1', isAdmin: false } } as any;

      expect(() => controller.findOne('user-2', req)).toThrow(
        ForbiddenException,
      );
      expect(usersService.findOnePublic).not.toHaveBeenCalled();
    });

    it('permite ver el propio perfil', async () => {
      const req = { user: { id: 'user-1', isAdmin: false } } as any;
      usersService.findOnePublic.mockResolvedValue({ id: 'user-1' } as any);

      await controller.findOne('user-1', req);

      expect(usersService.findOnePublic).toHaveBeenCalledWith('user-1');
    });

    it('permite a un admin ver el perfil de cualquiera', async () => {
      const req = { user: { id: 'admin-1', isAdmin: true } } as any;
      usersService.findOnePublic.mockResolvedValue({ id: 'user-2' } as any);

      await controller.findOne('user-2', req);

      expect(usersService.findOnePublic).toHaveBeenCalledWith('user-2');
    });
  });
});
