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
  ForbiddenException,
  Req,
  UseGuards,
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
  @ApiOperation({ summary: 'Crear una nueva propiedad' })
  @ApiResponse({ status: 201, description: 'Propiedad creada correctamente' })
  @ApiResponse({
    status: 403,
    description: 'Solo un admin puede crear propiedades',
  })
  create(@Body() createPropertyDto: CreatePropertyDto, @Req() req: Request) {
    const requester = req.user as { isAdmin: boolean };
    if (!requester.isAdmin) {
      throw new ForbiddenException('Solo un admin puede crear propiedades');
    }
    return this.propertiesService.create(createPropertyDto);
  }

  @Post('upload-images')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Subir hasta 10 imágenes a Cloudinary y obtener sus URLs (usar el resultado en el campo "images" al crear/actualizar una propiedad)',
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
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    images: Express.Multer.File[],
  ) {
    const urls = await this.cloudinaryService.uploadImages(images);
    return { urls };
  }

  @Get()
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
  ) {
    return this.propertiesService.findAll(country, city, page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar una propiedad por id' })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({ status: 200, description: 'Propiedad encontrada' })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOnePublic(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar una propiedad existente' })
  @ApiParam({ name: 'id', description: 'UUID de la propiedad' })
  @ApiResponse({ status: 200, description: 'Propiedad actualizada' })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Req() req: Request,
  ) {
    const requester = req.user as { isAdmin: boolean };
    if (!requester.isAdmin) {
      throw new ForbiddenException(
        'Solo un admin puede actualizar propiedades',
      );
    }
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Desactivar una propiedad (borrado lógico, no elimina el registro)',
  })
  @ApiResponse({
    status: 200,
    description: 'Propiedad desactivada correctamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo un admin puede desactivar propiedades',
  })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const requester = req.user as { isAdmin: boolean };
    if (!requester.isAdmin) {
      throw new ForbiddenException(
        'Solo un admin puede desactivar propiedades',
      );
    }
    return this.propertiesService.remove(id);
  }
}
