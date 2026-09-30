import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/createProperty.dto';
import { UpdatePropertyDto } from './dto/updateProperty.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createPropertyDto: CreatePropertyDto, ownerId: string) {
    const newProperty = this.propertiesRepository.create({
      ...createPropertyDto,
      owner: { id: ownerId },
    });
    return this.propertiesRepository.save(newProperty);
  }

  async findAll(country?: string, city?: string, page?: string) {
    const where: any = { isDeleted: false };

    if (country) {
      where.country = country;
    }

    if (city) {
      where.city = city;
    }

    const pageNumber = page ? Number(page) : 1;
    const limit = 20;

    const properties = await this.propertiesRepository.find({
      where: where,
      skip: (pageNumber - 1) * limit,
      take: limit,
    });

    return properties;
  }

  async findAllAdmin(country?: string, city?: string, page?: string) {
    const where: any = {};

    if (country) {
      where.country = country;
    }

    if (city) {
      where.city = city;
    }

    const pageNumber = page ? Number(page) : 1;
    const limit = 10;

    const properties = await this.propertiesRepository.find({
      where: where,
      skip: (pageNumber - 1) * limit,
      take: limit,
    });

    return properties;
  }

  async findOne(id: string) {
    const property = await this.propertiesRepository.findOne({
      where: { id: id },
      relations: { owner: true },
    });
    if (!property) {
      throw new NotFoundException('No se encontro la propiedad');
    }

    return property;
  }
  async findOnePublic(id: string) {
    const property = await this.findOne(id);

    if (property.isDeleted) {
      throw new NotFoundException('No se encontro la propiedad');
    }

    return property;
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    requesterId: string,
    isAdmin: boolean,
  ) {
    const property = await this.findOne(id);

    if (property.owner?.id !== requesterId && !isAdmin) {
      throw new ForbiddenException(
        'No podés modificar una propiedad que no es tuya',
      );
    }

    Object.assign(property, updatePropertyDto);

    return this.propertiesRepository.save(property);
  }

 async remove(id: string, requesterId: string, isAdmin: boolean) {
    const property = await this.findOne(id);

    if (property.owner?.id !== requesterId && !isAdmin) {
      throw new ForbiddenException(
        'No podés eliminar una propiedad que no es tuya',
      );
    }
    property.isDeleted = true;
    property.isAvailable = false; 
    
    return this.propertiesRepository.save(property);
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private calculateDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const earthRadiusKm = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    const properties = await this.propertiesRepository.find({
      where: { isDeleted: false },
    });

    return properties
      .map((property) => ({
        ...property,
        distanceKm: this.calculateDistanceKm(
          lat,
          lng,
          property.lat,
          property.lng,
        ),
      }))
      .filter((property) => property.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async addToFavorites(propertyId: string, userId: string) {
    const property = await this.findOnePublic(propertyId);

    const alreadyFavorite = await this.usersRepository.exists({
      where: { id: userId, favorites: { id: propertyId } },
    });
    if (alreadyFavorite) {
      throw new ConflictException('La propiedad ya está en tus favoritos');
    }

    await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'favorites')
      .of(userId)
      .add(propertyId);

    return property;
  }
  async findFavorites(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { favorites: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return user.favorites.filter((property) => !property.isDeleted);
  }

  async removeFromFavorites(propertyId: string, userId: string) {
    const isFavorite = await this.usersRepository.exists({
      where: { id: userId, favorites: { id: propertyId } },
    });
    if (!isFavorite) {
      throw new NotFoundException('La propiedad no está en tus favoritos');
    }

    await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'favorites')
      .of(userId)
      .remove(propertyId);

    return { message: 'Propiedad eliminada de favoritos' };
  }
}
