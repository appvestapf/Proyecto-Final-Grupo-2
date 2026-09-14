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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva propiedad' })
  @ApiResponse({ status: 201, description: 'Propiedad creada correctamente' })
  create(@Body() propertyDto: PropertyDto) {
    return this.propertiesService.create(propertyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar propiedades, con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Listado de propiedades' })
  findAll(
    @Query('country') country: string,
    @Query('city') city: string,
    @Query('page') page: string,
  ) {
    return this.propertiesService.findAll(country, city, page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar una propiedad por id' })
  @ApiResponse({ status: 200, description: 'Propiedad encontrada' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una propiedad existente' })
  @ApiResponse({ status: 200, description: 'Propiedad actualizada' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  update(@Param('id') id: string, @Body() propertyDto: PropertyDto) {
    return this.propertiesService.update(id, propertyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una propiedad' })
  @ApiResponse({ status: 200, description: 'Propiedad eliminada' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }
}
