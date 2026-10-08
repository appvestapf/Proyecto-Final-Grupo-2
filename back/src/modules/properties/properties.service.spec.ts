import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { User } from '../users/entities/user.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let propertiesRepository: any;
  let usersRepository: any;
  let reservationsRepository: any;
  let reservationsQueryBuilder: any;

  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn<() => Promise<any[]>>().mockResolvedValue([]),
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
    reservationsQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn<() => Promise<any[]>>().mockResolvedValue([]),
    };
    reservationsRepository = {
      createQueryBuilder: jest.fn(() => reservationsQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: propertiesRepository,
        },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationsRepository,
        },
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
      const property = {
        id: 'prop-1',
        owner: { id: 'owner-1' },
        name: 'Viejo',
      };
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

  describe('findNearby disponibilidad', () => {
    it('no devuelve propiedades pausadas por el dueño', async () => {
      propertiesRepository.find.mockResolvedValue([]);

      await service.findNearby(-34.6037, -58.3816, 100);

      expect(propertiesRepository.find).toHaveBeenCalledWith({
        where: { isDeleted: false, isAvailable: true },
      });
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

    it('filtra por rentalType e isPetFriendly', async () => {
      await service.searchProperties({
        rentalType: 'Residencial',
        isPetFriendly: true,
      } as any);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(property.rentalType)=LOWER(:rentalType)',
        { rentalType: 'Residencial' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'property.isPetFriendly=:isPetFriendly',
        { isPetFriendly: true },
      );
    });

    it('filtra por maxPrice junto con priceUnit', async () => {
      await service.searchProperties({
        maxPrice: 50000,
        priceUnit: 'mes',
      } as any);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'property.price<=:maxPrice AND property.priceUnit=:priceUnit',
        { maxPrice: 50000, priceUnit: 'mes' },
      );
    });

    it('rechaza maxPrice sin priceUnit', async () => {
      await expect(
        service.searchProperties({ maxPrice: 50000 } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('incluye el nombre de la propiedad en la búsqueda por keyword', async () => {
      await service.searchProperties({ keyword: 'palermo' } as any);

      const conditions = queryBuilder.andWhere.mock.calls.map(
        ([c]: any[]) => c,
      );
      expect(conditions.some((c: string) => c.includes('property.name'))).toBe(
        true,
      );
    });
  });

  describe('addToFavorites', () => {
    it('rechaza si la propiedad ya está en favoritos', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        id: 'prop-1',
        isDeleted: false,
      });
      usersRepository.exists.mockResolvedValue(true);

      await expect(service.addToFavorites('prop-1', 'user-1')).rejects.toThrow(
        'La propiedad ya está en tus favoritos',
      );
    });
  });
  describe('getNextAvailableMonth', () => {
    const residencial = {
      id: 'prop-1',
      rentalType: 'Residencial',
      isAvailable: true,
      isDeleted: false,
    };

    beforeEach(() => {
      // "hoy" fijo: 7 de octubre de 2026 en Argentina
      jest.useFakeTimers({
        now: new Date('2026-10-07T15:00:00Z'),
        doNotFake: ['nextTick', 'setImmediate'],
      });
      propertiesRepository.findOne.mockResolvedValue(residencial);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('sin reservas está disponible desde hoy', async () => {
      const result = await service.getNextAvailableMonth('prop-1');

      expect(result).toEqual({
        propertyId: 'prop-1',
        availableNow: true,
        isRequestedDateAvailable: true,
        availableFrom: '2026-10-07',
        month: '2026-10',
        monthLabel: 'octubre de 2026',
        months: 6,
      });
    });

    it('con una reserva en curso, queda disponible el día que termina', async () => {
      reservationsQueryBuilder.getMany.mockResolvedValue([
        { startDate: '2026-09-01', endDate: '2027-03-01' },
      ]);

      const result = await service.getNextAvailableMonth('prop-1');

      expect(result.availableNow).toBe(false);
      expect(result.availableFrom).toBe('2027-03-01');
      expect(result.monthLabel).toBe('marzo de 2027');
    });

    it('saltea un hueco entre reservas más corto que 6 meses', async () => {
      reservationsQueryBuilder.getMany.mockResolvedValue([
        { startDate: '2026-09-01', endDate: '2027-03-01' },
        { startDate: '2027-06-01', endDate: '2027-12-01' },
      ]);

      const result = await service.getNextAvailableMonth('prop-1');

      expect(result.availableFrom).toBe('2027-12-01');
    });

    it('usa un hueco de exactamente 6 meses (el día de salida queda libre)', async () => {
      reservationsQueryBuilder.getMany.mockResolvedValue([
        { startDate: '2026-09-01', endDate: '2027-03-01' },
        { startDate: '2027-09-01', endDate: '2028-03-01' },
      ]);

      const result = await service.getNextAvailableMonth('prop-1');

      expect(result.availableFrom).toBe('2027-03-01');
    });

    it('si la próxima reserva empieza en más de 6 meses, está disponible hoy', async () => {
      reservationsQueryBuilder.getMany.mockResolvedValue([
        { startDate: '2027-06-01', endDate: '2027-12-01' },
      ]);

      const result = await service.getNextAvailableMonth('prop-1');

      expect(result.availableNow).toBe(true);
    });

    it('con months=12 saltea un hueco donde entran 6 meses pero no 12', async () => {
      reservationsQueryBuilder.getMany.mockResolvedValue([
        { startDate: '2026-09-01', endDate: '2027-03-01' },
        { startDate: '2027-09-01', endDate: '2028-03-01' },
      ]);

      const result = await service.getNextAvailableMonth('prop-1', 12);

      expect(result.availableFrom).toBe('2028-03-01');
      expect(result.months).toBe(12);
    });

    it('con months=12 está disponible hoy si la próxima reserva empieza en más de 12 meses', async () => {
      reservationsQueryBuilder.getMany.mockResolvedValue([
        { startDate: '2028-01-01', endDate: '2028-07-01' },
      ]);

      const result = await service.getNextAvailableMonth('prop-1', 12);

      expect(result.availableNow).toBe(true);
    });

    it('rechaza months fuera de 6 a 36', async () => {
      await expect(service.getNextAvailableMonth('prop-1', 3)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getNextAvailableMonth('prop-1', 40)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('con startDate en un hueco donde entran los meses, devuelve esa fecha', async () => {
      reservationsQueryBuilder.getMany.mockResolvedValue([
        { startDate: '2026-09-01', endDate: '2027-03-01' },
        { startDate: '2028-01-01', endDate: '2028-07-01' },
      ]);

      const result = await service.getNextAvailableMonth(
        'prop-1',
        6,
        '2027-04-01',
      );

      expect(result.availableFrom).toBe('2027-04-01');
      expect(result.isRequestedDateAvailable).toBe(true);
      expect(result.availableNow).toBe(false);
    });

    it('con startDate que choca con una reserva, devuelve la próxima fecha que sirve', async () => {
      reservationsQueryBuilder.getMany.mockResolvedValue([
        { startDate: '2026-09-01', endDate: '2027-03-01' },
        { startDate: '2027-09-01', endDate: '2028-03-01' },
      ]);

      // desde el 01/05/2027, 6 meses llegan a 01/11/2027 y pisan la segunda
      const result = await service.getNextAvailableMonth(
        'prop-1',
        6,
        '2027-05-01',
      );

      expect(result.availableFrom).toBe('2028-03-01');
      expect(result.isRequestedDateAvailable).toBe(false);
    });

    it('rechaza startDate con formato inválido', async () => {
      await expect(
        service.getNextAvailableMonth('prop-1', 6, '01/05/2027'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza una startDate que no existe (30 de febrero)', async () => {
      await expect(
        service.getNextAvailableMonth('prop-1', 6, '2027-02-30'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza startDate anterior a hoy', async () => {
      await expect(
        service.getNextAvailableMonth('prop-1', 6, '2026-01-01'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza propiedades temporarias', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        ...residencial,
        rentalType: 'Temporario',
      });

      await expect(service.getNextAvailableMonth('prop-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rechaza propiedades pausadas por el dueño', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        ...residencial,
        isAvailable: false,
      });

      await expect(service.getNextAvailableMonth('prop-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('404 si la propiedad está dada de baja', async () => {
      propertiesRepository.findOne.mockResolvedValue({
        ...residencial,
        isDeleted: true,
      });

      await expect(service.getNextAvailableMonth('prop-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
