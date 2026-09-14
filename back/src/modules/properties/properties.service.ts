import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { PropertyDto } from './dto/property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  create(propertyDto: PropertyDto) {
    const newProperty = this.propertiesRepository.create(propertyDto);
    return this.propertiesRepository.save(newProperty);
  }

  async findAll(country?: string, city?: string, page?: string) {
    const where: any = { isAvailable: true };

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
    });

    if (!property) {
      throw new NotFoundException('No se encontro la propiedad');
    }

    return property;
  }

  async update(id: string, propertyDto: PropertyDto) {
    const property = await this.findOne(id);

    Object.assign(property, propertyDto);

    return this.propertiesRepository.save(property);
  }

  async remove(id: string) {
    const property = await this.findOne(id);
    return this.propertiesRepository.remove(property);
  }
}
