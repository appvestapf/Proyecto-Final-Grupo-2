import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional.guard';

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
    it('usa findAllAdmin si el usuario es admin', () => {
      const req = { user: { isAdmin: true } } as any;

      controller.findAll(undefined, undefined, undefined, req);

      expect(propertiesService.findAllAdmin).toHaveBeenCalled();
      expect(propertiesService.findAll).not.toHaveBeenCalled();
    });

    it('usa findAll si el usuario no es admin', () => {
      const req = { user: { isAdmin: false } } as any;

      controller.findAll(undefined, undefined, undefined, req);

      expect(propertiesService.findAll).toHaveBeenCalled();
      expect(propertiesService.findAllAdmin).not.toHaveBeenCalled();
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
