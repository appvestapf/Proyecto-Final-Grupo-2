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
  Query,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { PROFILE_EXAMPLE, USER_EXAMPLE } from '../../common/swagger/examples';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import {
  UpdateUserRoleDto,
  UpdateUserSuperAdminDto,
} from './dto/update-user-role.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido correctamente',
    schema: { example: PROFILE_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: 'Token invalido o no proporcionado',
  })
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.usersService.findProfileById(user.id);
  }

  @Post('upload-photo')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir la foto de perfil del usuario logueado',
    description:
      'Sube la imagen a Cloudinary y la guarda en el campo pfp del usuario. Devuelve la URL y el perfil actualizado',
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
    description: 'Foto subida y guardada en el perfil',
    schema: {
      example: {
        url: 'https://res.cloudinary.com/tucuenta/image/upload/users/foto.jpg',
        user: {
          id: 'UUID',
          name: 'Sarah Ramirez',
          email: 'sarah@mail.com',
          address: 'Calle Falsa 123',
          isAdmin: false,
          isSuperAdmin: false,
          pfp: 'https://res.cloudinary.com/tucuenta/image/upload/users/foto.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Falta el archivo, no es una imagen o pesa más de 5 MB',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async uploadPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image' }),
        ],
      }),
    )
    photo: Express.Multer.File,
    @Req() req: Request,
  ) {
    const requester = req.user as { id: string };
    return this.usersService.updatePhoto(requester.id, photo);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado', type: User })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    description: 'true = incluye a los dados de baja',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [User] })
  @ApiResponse({
    status: 403,
    description: 'Solo un admin puede listar todos los usuarios',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.usersService.findAll(includeInactive === 'true');
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
  @ApiResponse({ status: 401, description: 'No autenticado' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const requester = req.user as { id: string; isAdmin: boolean };
    if (requester.id !== id && !requester.isAdmin) {
      throw new ForbiddenException(
        'No podés consultar el perfil de otro usuario',
      );
    }
    return this.usersService.findOnePublic(id);
  }

  @Patch(':id/role')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Dar o quitar el rol de admin (solo superAdmin)',
    description:
      'El usuario afectado tiene que volver a iniciar sesión para que el cambio llegue a su token',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado, devuelve el perfil',
    schema: { example: { ...PROFILE_EXAMPLE, isAdmin: true } },
  })
  @ApiResponse({ status: 400, description: 'No podés cambiar tu propio rol' })
  @ApiResponse({ status: 403, description: 'Solo un superAdmin puede hacerlo' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tenía ese rol, o es superAdmin',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: Request,
  ) {
    const requester = req.user as { id: string };
    return this.usersService.updateRole(id, dto.isAdmin, requester.id);
  }

  @Patch(':id/super-admin')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({
    summary:
      'Dar o quitar el rol de superAdmin (solo superAdmin). Al darlo también queda como admin',
    description:
      'Al quitarlo, el usuario queda como admin. Tiene que volver a iniciar sesión para que el cambio llegue a su token',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado, devuelve el perfil',
    schema: { example: { ...PROFILE_EXAMPLE, isAdmin: true, isSuperAdmin: true } },
  })
  @ApiResponse({ status: 400, description: 'No podés cambiar tu propio rol' })
  @ApiResponse({ status: 403, description: 'Solo un superAdmin puede hacerlo' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tenía ese rol o está dado de baja',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  updateSuperAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserSuperAdminDto,
    @Req() req: Request,
  ) {
    const requester = req.user as { id: string };
    return this.usersService.updateSuperAdmin(
      id,
      dto.isSuperAdmin,
      requester.id,
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Actualizar un usuario',
    description:
      'Cada usuario puede editarse a sí mismo. Un admin puede editar usuarios comunes; solo un superAdmin edita a otros admins; a un superAdmin no lo edita nadie más',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: User })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({
    status: 403,
    description:
      'No podés modificar a otro usuario, a un admin (si no sos superAdmin) ni a un superAdmin',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async update(
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
    await this.usersService.assertCanManage(requester.id, id);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Dar de baja un usuario (isActive = false, no borra el registro)',
    description:
      'Cada usuario puede darse de baja a sí mismo. Un admin puede dar de baja usuarios comunes; solo un superAdmin da de baja a otros admins; un superAdmin no se puede dar de baja',
  })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario dado de baja',
    schema: { example: { ...USER_EXAMPLE, isActive: false } },
  })
  @ApiResponse({ status: 400, description: 'El id no es un UUID válido' })
  @ApiResponse({
    status: 403,
    description:
      'No podés dar de baja a otro usuario, a un admin (si no sos superAdmin) ni a un superAdmin',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const requester = req.user as { id: string; isAdmin: boolean };
    if (requester.id !== id && !requester.isAdmin) {
      throw new ForbiddenException(
        'No podés eliminar el perfil de otro usuario',
      );
    }
    await this.usersService.assertCanManage(requester.id, id);
    return this.usersService.remove(id);
  }
}
