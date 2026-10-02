import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { User } from '../users/entities/user.entity';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let propertiesRepository: any;
  let usersRepository: any;

  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    propertiesRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
    };
    usersRepository = {
      exists: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: getRepositoryToken(Property), useValue: propertiesRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('lanza NotFoundException si la propiedad no existe', async () => {
      propertiesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('rechaza si quien pide el cambio no es el dueño ni admin', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        owner: { id: 'owner-1' },
      });

      await expect(
        service.update('prop-1', {} as any, 'otro-usuario', false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('permite al dueño actualizar su propiedad', async () => {
      const property = { id: 'prop-1', owner: { id: 'owner-1' }, name: 'Viejo' };
      propertiesRepository.findOne.mockResolvedValue(property);
      propertiesRepository.save.mockImplementation((p: any) =>
        Promise.resolve(p),
      );

      const result = await service.update(
        'prop-1',
        { name: 'Nuevo' } as any,
        'owner-1',
        false,
      );

      expect(result.name).toBe('Nuevo');
    });
  });

  describe('findNearby', () => {
    it('devuelve solo las propiedades dentro del radio, ordenadas por distancia', async () => {
      propertiesRepository.find.mockResolvedValue([
        { id: 'lejos', lat: -34.9, lng: -56.2 }, // Montevideo, ~200km de Bs As
        { id: 'cerca', lat: -34.61, lng: -58.38 }, // Buenos Aires
        { id: 'medio', lat: -34.9, lng: -57.95 }, // La Plata, ~60km de Bs As
      ]);

      const result = await service.findNearby(-34.6037, -58.3816, 100);

      expect(result.map((p: any) => p.id)).toEqual(['cerca', 'medio']);
    });
  });

  describe('searchProperties', () => {
    it('sin lat/lng/radius devuelve el resultado de la query tal cual (sin distanceKm)', async () => {
      queryBuilder.getMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);

      const result = await service.searchProperties({ capacity: 2 } as any);

      expect(result).toEqual([{ id: 'a' }, { id: 'b' }]);
    });

    it('con lat/lng/radius filtra y ordena por distancia', async () => {
      queryBuilder.getMany.mockResolvedValue([
        { id: 'lejos', lat: -34.9, lng: -56.2 }, // Montevideo
        { id: 'cerca', lat: -34.61, lng: -58.38 }, // Buenos Aires
        { id: 'medio', lat: -34.9, lng: -57.95 }, // La Plata
      ]);

      const result = await service.searchProperties({
        lat: -34.6037,
        lng: -58.3816,
        radius: 100,
      } as any);

      expect(result.map((p: any) => p.id)).toEqual(['cerca', 'medio']);
      expect(result[0]).toHaveProperty('distanceKm');
    });
  });

  describe('addToFavorites', () => {
    it('rechaza si la propiedad ya está en favoritos', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        isDeleted: false,
      });
      usersRepository.exists.mockResolvedValue(true);

      await expect(
        service.addToFavorites('prop-1', 'user-1'),
      ).rejects.toThrow('La propiedad ya está en tus favoritos');
    });
  });
});
