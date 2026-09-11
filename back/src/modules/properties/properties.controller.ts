import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertyDto } from './dto/property.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(@Body() propertyDto: PropertyDto) {
    return this.propertiesService.create(propertyDto);
  }

  @Get()
  findAll(
    @Query('country') country: string,
    @Query('city') city: string,
    @Query('page') page: string,
  ) {
    return this.propertiesService.findAll(country, city, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() propertyDto: PropertyDto) {
    return this.propertiesService.update(id, propertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }
}
