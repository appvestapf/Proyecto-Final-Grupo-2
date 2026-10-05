import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional.guard';
import { ForbiddenException } from '@nestjs/common';

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let propertiesService: jest.Mocked<PropertiesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: {
            findAll: jest.fn(),
            findAllAdmin: jest.fn(),
            findOne: jest.fn(),
            findOnePublic: jest.fn(),
          },
        },
        { provide: CloudinaryService, useValue: { uploadImage: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PropertiesController>(PropertiesController);
    propertiesService = module.get(PropertiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('usa findAllAdmin si manage=true y el usuario es admin', () => {
      const req = {
        user: { id: 'u1', isAdmin: true, isSuperAdmin: false },
      } as any;

      controller.findAll(undefined, undefined, undefined, 'true', req);

      expect(propertiesService.findAllAdmin).toHaveBeenCalled();
      expect(propertiesService.findAll).not.toHaveBeenCalled();
    });

    it('usa findAll (catálogo público) si es admin pero sin manage', () => {
      const req = {
        user: { id: 'u1', isAdmin: true, isSuperAdmin: false },
      } as any;

      controller.findAll(undefined, undefined, undefined, undefined, req);

      expect(propertiesService.findAll).toHaveBeenCalled();
      expect(propertiesService.findAllAdmin).not.toHaveBeenCalled();
    });

    it('rechaza manage=true si el usuario no es admin', () => {
      const req = {
        user: { id: 'u1', isAdmin: false, isSuperAdmin: false },
      } as any;

      expect(() =>
        controller.findAll(undefined, undefined, undefined, 'true', req),
      ).toThrow(ForbiddenException);
    });
  });
  describe('findOne', () => {
    it('usa findOne (sin filtrar borradas) si el usuario es admin', () => {
      const req = { user: { isAdmin: true } } as any;

      controller.findOne('prop-1', req);

      expect(propertiesService.findOne).toHaveBeenCalledWith('prop-1');
      expect(propertiesService.findOnePublic).not.toHaveBeenCalled();
    });

    it('usa findOnePublic si no hay usuario autenticado', () => {
      const req = { user: undefined } as any;

      controller.findOne('prop-1', req);

      expect(propertiesService.findOnePublic).toHaveBeenCalledWith('prop-1');
    });
  });
});
