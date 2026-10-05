import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  ParseFloatPipe,
  DefaultValuePipe,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Req,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import {
  MESSAGE_EXAMPLE,
  PROPERTY_EXAMPLE,
  PROPERTY_WITH_OWNER_EXAMPLE,
  USER_EXAMPLE,
} from '../../common/swagger/examples';
import { CreatePropertyDto } from './dto/createProperty.dto';
import { UpdatePropertyDto } from './dto/updateProperty.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { OptionalJwtAuthGuard } from '../auth/guards/optional.guard';
import { PropertySearchDto } from './dto/property-search.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Crear una nueva propiedad',
  })
  @ApiResponse({
    status: 201,
    description: 'Propiedad creada correctamente',
    schema: {
      example: { ...PROPERTY_EXAMPLE, owner: { id: USER_EXAMPLE.id } },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de la propiedad inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Solo los admins pueden publicar' })
  create(@Body() createPropertyDto: CreatePropertyDto, @Req() req: Request) {
    const requester = req.user as { id: string };
    return this.propertiesService.create(createPropertyDto, requester.id);
  }

  @Post('upload-images')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Subir hasta 10 imágenes a Cloudinary y obtener sus URLs (sólo asmin; usar el resultado en el campo "images" al crear/actualizar una propiedad)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imágenes subidas correctamente, se devuelven sus URLs',
    schema: { example: { urls: PROPERTY_EXAMPLE.images } },
  })
  @ApiResponse({
    status: 400,
    description: 'Falta el archivo, alguno no es una imagen o pesa más de 5 MB',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Solo los admins pueden publicar' })
  async uploadImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB por imagen
          new FileTypeValidator({ fileType: 'image' }),
        ],
      }),
    )
    images: Express.Multer.File[],
  ) {
    const urls = await this.cloudinaryService.uploadImages(images);
    return { urls };
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar propiedades disponibles',
    description:
      'Permite buscar utilizando destino,periodo de fechas y cantidad de huespedes',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
    example: 'Cordoba',
    description: 'Destino de busqueda',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2026-10-10',
    description: 'Fecha de inicio de la estadia',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2026-10-15',
    description: 'Fecha de finalizacion de la estadia',
  })
  @ApiQuery({
    name: 'capacity',
    required: false,
    type: Number,
    example: 4,
    description: 'Cantidad de huéspedes solicitada',
  })
  @ApiResponse({
    status: 200,
    description: 'Propiedades que cumplen los filtros y estan disponibles',
  })
  @ApiResponse({
    status: 400,
    description:
      'Las fechas son invalidas o falta una de las fechas del periodo',
  })
  searchProperties(@Query() searchDto: PropertySearchDto) {
    return this.propertiesService.searchProperties(searchDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Listar propiedades, con filtros opcionales',
    description:
      'Sin manage: catálogo público, solo activas, 20 por página (igual con o sin token). ' +
      'Con manage=true (token de admin): vista del dashboard, 10 por página, incluye dadas de baja. ' +
      'Admin ve solo las suyas; superAdmin ve todas, con owner e isMine.',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Filtrar por país',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'Filtrar por ciudad',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (por defecto 1)',
  })
  @ApiQuery({
    name: 'manage',
    required: false,
    type: Boolean,
    description: 'true = vista de gestión del dashboard (solo admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de propiedades',
    schema: { example: [PROPERTY_EXAMPLE] },
  })
  @ApiResponse({ status: 401, description: 'manage=true sin token' })
  @ApiResponse({ status: 403, description: 'manage=true sin ser admin' })
  findAll(
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
    @Query('manage') manage?: string,
    @Req() req?: Request,
  ) {
    if (manage === 'true') {
      const requester = req?.user as
        { id: string; isAdmin: boolean; isSuperAdmin: boolean } | undefined;

      if (!requester)
        throw new UnauthorizedException('Necesitás iniciar sesión');
      if (!requester.isAdmin)
        throw new ForbiddenException(
          'Solo los admins pueden gestionar propiedades',
        );

      return this.propertiesService.findAllAdmin(
        country,
        city,
        page,
        requester,
      );
    }

    return this.propertiesService.findAll(country, city, page);
  }
  @Get('favorites')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Listar las propiedades favoritas del usuario logueado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de propiedades favoritas',
    schema: { example: [PROPERTY_EXAMPLE] },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findFavorites(@Req() req: Request) {
    const requester = req.user as { id: string };
    return this.propertiesService.findFavorites(requester.id);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Buscar propiedades cercanas a una ubicación' })
  @ApiQuery({
    name: 'lat',
    type: Number,
    example: -34.5889,
    description: 'Latitud del punto de búsqueda',
  })
  @ApiQuery({
    name: 'lng',
    type: Number,
    example: -58.4309,
    description: 'Longitud del punto de búsqueda',
  })
  @ApiQuery({
    name: 'radiusKm',
    required: false,
    type: Number,
    description: 'Radio de búsqueda en km (por defecto 10)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Propiedades dentro del radio, ordenadas de más cerca a más lejos',
    schema: { example: [{ ...PROPERTY_EXAMPLE, distanceKm: 2.4 }] },
  })
  @ApiResponse({
    status: 400,
    description: 'lat, lng o radiusKm faltan o no son números',
  })
  findNearby(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radiusKm', new DefaultValuePipe(10), ParseFloatPipe)
    radiusKm: number,
  ) {
    return this.propertiesService.findNearby(lat, lng, radiusKm);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Buscar una propiedad por id',
    description:
      'Incluye al owner. Público: 404 si está dada de baja. Con token de admin también devuelve las dadas de baja',
  })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({
    status: 200,
    description: 'Propiedad encontrada',
    schema: { example: PROPERTY_WITH_OWNER_EXAMPLE },
  })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const requester = req.user as { isAdmin: boolean } | undefined;
    if (requester?.isAdmin) {
      return this.propertiesService.findOne(id);
    }
    return this.propertiesService.findOnePublic(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Actualizar una propiedad existente (dueño, o superAdmin)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({
    status: 200,
    description: 'Propiedad actualizada',
    schema: { example: PROPERTY_WITH_OWNER_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description:
      'El id no es un UUID válido, datos inválidos o campos que no se pueden modificar (por ejemplo rating u owner)',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No podés modificar una propiedad que no es tuya',
  })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Req() req: Request,
  ) {
    const requester = req.user as { id: string; isSuperAdmin: boolean };
    return this.propertiesService.update(
      id,
      updatePropertyDto,
      requester.id,
      requester.isSuperAdmin,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Desactivar una propiedad (borrado lógico, no elimina el registro; dueño, o superAdmin)',
    description: 'Queda con isDeleted = true e isAvailable = false',
  })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({
    status: 200,
    description: 'Propiedad desactivada correctamente',
    schema: {
      example: {
        ...PROPERTY_WITH_OWNER_EXAMPLE,
        isDeleted: true,
        isAvailable: false,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No podés eliminar una propiedad que no es tuya',
  })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const requester = req.user as { id: string; isSuperAdmin: boolean };
    return this.propertiesService.remove(
      id,
      requester.id,
      requester.isSuperAdmin,
    );
  }

  @Post(':id/favorites')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Agregar una propiedad a los favoritos del usuario logueado',
  })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({
    status: 201,
    description: 'Propiedad agregada a favoritos',
    schema: { example: PROPERTY_WITH_OWNER_EXAMPLE },
  })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'La propiedad ya está en tus favoritos',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  addToFavorites(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const requester = req.user as { id: string };
    return this.propertiesService.addToFavorites(id, requester.id);
  }

  @Delete(':id/favorites')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Quitar una propiedad de los favoritos del usuario logueado',
  })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({
    status: 200,
    description: 'Propiedad eliminada de favoritos',
    schema: { example: MESSAGE_EXAMPLE('Propiedad eliminada de favoritos') },
  })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({
    status: 404,
    description: 'La propiedad no está en tus favoritos',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  removeFromFavorites(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const requester = req.user as { id: string };
    return this.propertiesService.removeFromFavorites(id, requester.id);
  }
}
