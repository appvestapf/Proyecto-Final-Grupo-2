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
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
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
import { Request } from 'express';
import { OptionalJwtAuthGuard } from '../auth/guards/optional.guard';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Crear una nueva propiedad (cualquier usuario logueado, queda como dueño)',
  })
  @ApiResponse({ status: 201, description: 'Propiedad creada correctamente' })
  create(@Body() createPropertyDto: CreatePropertyDto, @Req() req: Request) {
    const requester = req.user as { id: string };
    return this.propertiesService.create(createPropertyDto, requester.id);
  }

  @Post('upload-images')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Subir hasta 10 imágenes a Cloudinary y obtener sus URLs (cualquier usuario logueado; usar el resultado en el campo "images" al crear/actualizar una propiedad)',
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
  })
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

  @Get()
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Listar propiedades, con filtros opcionales' })
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
    description: 'Número de página (por defecto 1)',
  })
  @ApiResponse({ status: 200, description: 'Listado de propiedades' })
  findAll(
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
    @Req() req?: Request,
  ) {
    const requester = req?.user as { isAdmin: boolean } | undefined;

    if (requester?.isAdmin) {
      return this.propertiesService.findAllAdmin(country, city, page);
    }
    return this.propertiesService.findAll(country, city, page);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Buscar una propiedad por id' })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({ status: 200, description: 'Propiedad encontrada' })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  findOne(@Param('id') id: string, @Req() req: Request) {
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
    summary: 'Actualizar una propiedad existente (dueño, o admin)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({ status: 200, description: 'Propiedad actualizada' })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
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
    const requester = req.user as { id: string; isAdmin: boolean };
    return this.propertiesService.update(
      id,
      updatePropertyDto,
      requester.id,
      requester.isAdmin,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Desactivar una propiedad (borrado lógico, no elimina el registro; dueño, o admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Propiedad desactivada correctamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No podés eliminar una propiedad que no es tuya',
  })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const requester = req.user as { id: string; isAdmin: boolean };
    return this.propertiesService.remove(id, requester.id, requester.isAdmin);
  }
  @Post(':id/favorites')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Agregar una propiedad a los favoritos del usuario logueado',
  })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({ status: 201, description: 'Propiedad agregada a favoritos' })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'La propiedad ya está en tus favoritos',
  })
  addToFavorites(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const requester = req.user as { id: string };
    return this.propertiesService.addToFavorites(id, requester.id);
  }
}
