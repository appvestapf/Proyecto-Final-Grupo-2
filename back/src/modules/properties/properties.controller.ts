import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/createProperty.dto';
import { UpdatePropertyDto } from './dto/updateProperty.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva propiedad' })
  @ApiResponse({ status: 201, description: 'Propiedad creada correctamente' })
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar propiedades, con filtros opcionales' })
  @ApiQuery({ name: 'country', required: false, description: 'Filtrar por país' })
  @ApiQuery({ name: 'city', required: false, description: 'Filtrar por ciudad' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página (por defecto 1)' })
  @ApiResponse({ status: 200, description: 'Listado de propiedades' })
  findAll(
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
  ) {
    return this.propertiesService.findAll(country, city, page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar una propiedad por id' })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({ status: 200, description: 'Propiedad encontrada' })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una propiedad existente' })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({ status: 200, description: 'Propiedad actualizada' })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una propiedad' })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({ status: 200, description: 'Propiedad eliminada' })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertiesService.remove(id);
  }
}
