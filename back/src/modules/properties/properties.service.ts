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
    // Sin filtro de isDeleted: el admin ve absolutamente todo.
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

    property.isAvailable = false;
    return this.propertiesRepository.save(property);
  }

  async addToFavorites(propertyId: string, userId: string) {
    // Busca la propiedad por ID (404 si no existe o está borrada)
    const property = await this.findOnePublic(propertyId);

    const alreadyFavorite = await this.usersRepository.exists({
      where: { id: userId, favorites: { id: propertyId } },
    });
    if (alreadyFavorite) {
      throw new ConflictException('La propiedad ya está en tus favoritos');
    }

    // Inserta solo la fila en la tabla intermedia, sin volver a guardar el usuario
    await this.usersRepository
      .createQueryBuilder()
      .relation(User, 'favorites')
      .of(userId)
      .add(propertyId);

    return property;
  }
}
