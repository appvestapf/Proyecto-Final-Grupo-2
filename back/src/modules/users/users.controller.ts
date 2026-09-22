import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Subir una foto de perfil a Cloudinary y obtener su URL (usar el resultado en el campo "pfp" al crear/actualizar un usuario)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Foto subida correctamente, se devuelve su URL',
  })
  async uploadPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image' }),        ],
      }),
    )
    photo: Express.Multer.File,
  ) {
    const url = await this.usersService.uploadPhoto(photo);
    return { url };
  }

  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado', type: User })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [User] })
  @ApiResponse({
    status: 403,
    description: 'Solo un admin puede listar todos los usuarios',
  })
  findAll(@Req() req: Request) {
    const requester = req.user as { isAdmin: boolean };
    if (!requester.isAdmin) {
      throw new ForbiddenException(
        'Solo un admin puede listar todos los usuarios',
      );
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Buscar un usuario por id (propio perfil, o cualquiera si sos admin)',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: User })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({
    status: 403,
    description: 'No podés consultar el perfil de otro usuario',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const requester = req.user as { id: string; isAdmin: boolean };
    if (requester.id !== id && !requester.isAdmin) {
      throw new ForbiddenException(
        'No podés consultar el perfil de otro usuario',
      );
    }
    return this.usersService.findOnePublic(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: User })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({
    status: 403,
    description: 'No podés modificar el perfil de otro usuario',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const requester = req.user as { id: string; isAdmin: boolean };
    if (requester.id !== id && !requester.isAdmin) {
      throw new ForbiddenException(
        'No podés modificar el perfil de otro usuario',
      );
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const requester = req.user as { id: string; isAdmin: boolean };
    if (requester.id !== id && !requester.isAdmin) {
      throw new ForbiddenException(
        'No podés eliminar el perfil de otro usuario',
      );
    }
    return this.usersService.remove(id);
  }
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({summary:'Obtener el perfil del usuario autenticado'})
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido correctamente'
  })
  @ApiResponse({
    status:401,
    description:'Token invalido o no proporcionado'
  })
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request){
    const user = req.user as {id: string}
    return this.usersService.findProfileById(user.id)
  }
}
