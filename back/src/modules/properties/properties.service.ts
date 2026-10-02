import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/createProperty.dto';
import { UpdatePropertyDto } from './dto/updateProperty.dto';
import { User } from '../users/entities/user.entity';
import { PropertySearchFilters } from './dto/propertySearchFilters.dto';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';
import { PropertySearchDto } from './dto/property-search.dto';

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

  async searchProperties(filters: PropertySearchDto){
    const{keyword,startDate,endDate,capacity,lat,lng,radius}=filters;
    const query = this.propertiesRepository.createQueryBuilder('property').
    where('property.isDeleted = :isDeleted',{isDeleted: false}).
    andWhere('property.isAvailable = :isAvailable',{isAvailable: true})
    if(keyword){
      query.andWhere(`(LOWER(unaccent(property.city))LIKE LOWER (unaccent(:keyword))
        OR LOWER(unaccent(property.country))LIKE LOWER(unaccent(:keyword)))`,{
          keyword: `%${keyword}%`
        })
    }
    if(capacity!==undefined){
      query.andWhere('property.capacity>=:capacity',{capacity})
    }
    if((startDate&&!endDate)||(!startDate&&endDate)){
      throw new BadRequestException('Para buscar por disponibilidad debes indicar fecha de inicio y fecha de finalización')
    }
    if(startDate&&endDate){
      if(startDate>=endDate){
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de finalización')
      }
      query.andWhere(
        `NOT EXISTS(
          SELECT 1 FROM reservations reservation
          WHERE reservation."propertyId" = property.id
          AND reservation.status IN (:...reservationStatuses)
          AND reservation."startDate" <= :endDate
          AND reservation."endDate">=:startDate
        )`,
        {reservationStatuses:[
          ReservationStatus.PENDING,
          ReservationStatus.CONFIRMED
        ],
        startDate,
        endDate
      }
      )
    }
    query.orderBy('property.rating','DESC')
    const properties = await query.getMany();

    if(lat!==undefined && lng!==undefined && radius!==undefined){
      return properties
        .map((property)=>({
          ...property,
          distanceKm: this.calculateDistanceKm(lat,lng,property.lat,property.lng),
        }))
        .filter((property)=>property.distanceKm<=radius)
        .sort((a,b)=>a.distanceKm-b.distanceKm)
    }

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

  async searchForChatbot(filters: PropertySearchFilters){
    const query= this.propertiesRepository.
      createQueryBuilder('property').
      where('property.isDeleted = :isDeleted', {isDeleted:false}).
      andWhere('property.isAvailable = :isAvailable', {isAvailable:true})
      if(filters.keyword){
        query.andWhere('LOWER(unaccent(property.name)) LIKE LOWER(unaccent(:keyword))',{
          keyword:`%${filters.keyword}%`,
        })
      }
      if(filters.country){
        query.andWhere('LOWER(unaccent(property.country))=LOWER(unaccent(:country))',{country:filters.country})
      }
      if(filters.city){
        query.andWhere('LOWER(unaccent(property.city))= LOWER(unaccent(:city))',{city:filters.city})
      }
      if (filters.rentalType) {
        query.andWhere('LOWER(property.rentalType) = LOWER(:rentalType)', {
        rentalType: filters.rentalType,
        });
      }
      if(filters.priceUnit){
        query.andWhere('LOWER(property.priceUnit)=LOWER(:priceUnit)',{priceUnit:filters.priceUnit})
      }      
      if(filters.minPrice!==undefined){
        query.andWhere('property.price>=:minPrice',{minPrice:filters.minPrice})
      }
      if(filters.maxPrice!==undefined){
        query.andWhere('property.price <= :maxPrice',{maxPrice:filters.maxPrice})
      }
      if(filters.maxTotalPrice!==undefined && filters.durationDays!== undefined){
        query.andWhere('LOWER(property.priceUnit)=:priceUnit',{priceUnit:'noche'})
        query.andWhere('property.price <= :maxPricePerUnit',{maxPricePerUnit:filters.maxTotalPrice/filters.durationDays})
      }
      if(filters.capacity!==undefined){
        query.andWhere('property.capacity>=:capacity',{capacity:filters.capacity})
      }
      if(filters.rooms!==undefined){
        query.andWhere('property.rooms>=:rooms',{rooms:filters.rooms})
      }
      if(filters.bathrooms!==undefined){
        query.andWhere('property.bathrooms>=:bathrooms',{bathrooms:filters.bathrooms})
      }
      if(filters.isPetFriendly!==undefined){
        query.andWhere('property.isPetFriendly = :isPetFriendly',{isPetFriendly: filters.isPetFriendly})
      }
      if(filters.hasGarage!==undefined){
        query.andWhere('property.hasGarage=:hasGarage',{hasGarage:filters.hasGarage})
      }
      query.orderBy('property.rating','DESC')
      query.take(10)
      const properties = await query.getMany();

      return properties;
  }
}
